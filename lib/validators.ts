import { z } from 'zod';
import type { ProfileSectionConfig } from './types';

// --- Safe URL validation (blocks javascript:, data:, vbscript:) ---
export function sanitizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Allow safe relative paths within the app
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function sanitizeS3FileName(fileName: string): string {
  const base = fileName.replace(/\\/g, '/').split('/').pop() || 'upload';
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '.').slice(0, 120);
}

export const ALLOWED_UPLOAD_FOLDERS = [
  'avatars',
  'banners',
  'resumes',
  'projects',
  'project-files',
  'hackathons',
  'feed',
  'certificates',
] as const;

export const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'svg',
  'pdf',
  'apk',
  'pptx',
  'ppt',
  'zip',
  'docx',
  'doc',
  'md',
  'mp4',
  'webm',
]);

export function validateUploadRequest(fileName: string, fileSizeBytes: number): { ok: true; ext: string } | { ok: false; error: string } {
  const clean = sanitizeS3FileName(fileName);
  const parts = clean.split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  if (!ext || !ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
    return { ok: false, error: `Unsupported file extension ".${ext || 'none'}".` };
  }
  const maxBytes = ext === 'apk' || ext === 'zip' || ext === 'mp4' ? 150 * 1024 * 1024 : 25 * 1024 * 1024;
  if (fileSizeBytes <= 0 || fileSizeBytes > maxBytes) {
    return { ok: false, error: `File size exceeds limit (${formatFileSize(maxBytes)}).` };
  }
  return { ok: true, ext };
}

export function reorderProfileSections(
  sections: ProfileSectionConfig[],
  key: ProfileSectionConfig['key'],
  direction: 'up' | 'down'
): ProfileSectionConfig[] {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const idx = sorted.findIndex((s) => s.key === key);
  if (idx === -1) return sorted;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) return sorted;
  const copy = [...sorted];
  const temp = copy[idx];
  copy[idx] = copy[swapIdx];
  copy[swapIdx] = temp;
  return copy.map((item, i) => ({ ...item, sortOrder: i }));
}

export function toggleProfileSection(
  sections: ProfileSectionConfig[],
  key: ProfileSectionConfig['key']
): ProfileSectionConfig[] {
  return sections.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s));
}

// --- Zod v4 API Request Schemas ---

export const presignSchema = z.object({
  folder: z.enum(ALLOWED_UPLOAD_FOLDERS),
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  fileSizeBytes: z.number().int().positive(),
});

export const createInquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().email('Please provide a valid email address'),
  organization: z.string().trim().max(150).optional().default(''),
  phone: z.string().trim().max(40).optional().default(''),
  serviceType: z.string().trim().min(2).max(120),
  budgetRange: z.string().trim().min(2).max(80),
  timeline: z.string().trim().max(80).optional().default('Flexible'),
  message: z.string().trim().min(10, 'Tell us a bit more about your project (at least 10 characters)').max(3000),
});

export const updateInquirySchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED']).optional(),
  adminNotes: z.string().max(3000).optional(),
});

export const createProjectSchema = z.object({
  title: z.string().trim().min(2).max(140),
  slug: z.string().trim().min(2).max(100).optional(),
  scope: z.enum(['TEAM', 'PERSONAL']).default('TEAM'),
  hackathonId: z.string().nullable().optional(),
  tagline: z.string().trim().min(3).max(220),
  summary: z.string().trim().min(10).max(5000),
  problemStatement: z.string().trim().max(5000).optional().default(''),
  solutionOverview: z.string().trim().max(5000).optional().default(''),
  architectureNotes: z.string().trim().max(5000).optional().default(''),
  techStackJson: z.array(z.string().trim().min(1).max(50)).default([]),
  category: z.enum(['AI_ML', 'WEB', 'MOBILE', 'HARDWARE_IOT', 'SYSTEMS', 'TOOLS']).default('WEB'),
  projectDate: z.string().trim().min(2).max(40),
  liveUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  demoVideoUrl: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'ARCHIVED']).default('COMPLETED'),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).max(999).default(10),
  contributors: z
    .array(
      z.object({
        memberId: z.string().min(1),
        role: z.string().trim().min(1).max(100),
        contributionSummary: z.string().trim().max(400).optional().default(''),
      })
    )
    .optional(),
});

export const createProjectFileSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  description: z.string().trim().max(300).optional().default(''),
  fileType: z.enum(['APK', 'PDF', 'PPTX', 'ZIP', 'DOCUMENT', 'OTHER']).default('OTHER'),
  fileSizeBytes: z.number().int().positive(),
  filebaseKey: z.string().trim().min(1).max(300),
  publicUrl: z.string().trim().min(1).max(600),
});

export const createFeedPostSchema = z.object({
  postType: z.enum(['HACKATHON', 'PROJECT_LAUNCH', 'ACHIEVEMENT', 'DEVLOG', 'ANNOUNCEMENT']),
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(5).max(5000),
  mediaUrlsJson: z.array(z.string()).default([]),
  linkedProjectId: z.string().nullable().optional(),
  linkedHackathonId: z.string().nullable().optional(),
  taggedMemberIdsJson: z.array(z.string()).default([]),
  isPinned: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true),
});

export const createHackathonSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(100).optional(),
  organizer: z.string().trim().min(2).max(140),
  location: z.string().trim().min(2).max(120),
  date: z.string().trim().min(2).max(60),
  result: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(4000),
  coverImageUrl: z.string().nullable().optional(),
  galleryUrlsJson: z.array(z.string()).default([]),
  participantIdsJson: z.array(z.string()).default([]),
});

export const createAchievementSchema = z.object({
  scope: z.enum(['TEAM', 'PERSONAL']).default('TEAM'),
  memberId: z.string().nullable().optional(),
  title: z.string().trim().min(2).max(180),
  issuerOrEvent: z.string().trim().min(2).max(160),
  rankOrResult: z.string().trim().min(1).max(100),
  date: z.string().trim().min(2).max(60),
  description: z.string().trim().max(3000).optional().default(''),
  certificateUrl: z.string().nullable().optional(),
  credentialUrl: z.string().nullable().optional(),
  taggedMemberIdsJson: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  headline: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(4000).optional(),
  location: z.string().trim().max(120).optional(),
  avatarUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  resumeUrl: z.string().nullable().optional(),
  availabilityBadge: z.string().trim().max(80).nullable().optional(),
  themeAccent: z.string().trim().max(30).nullable().optional(),
  socialsJson: z
    .object({
      github: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      portfolio: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  sectionConfigJson: z
    .array(
      z.object({
        key: z.enum([
          'about',
          'skills',
          'experience',
          'leadership',
          'education',
          'certifications',
          'personalProjects',
          'teamContributions',
          'hackathons',
          'activity',
        ]),
        label: z.string(),
        visible: z.boolean(),
        sortOrder: z.number().int().min(0),
      })
    )
    .optional(),
});

export const createExperienceSchema = z.object({
  category: z.enum(['WORK', 'LEADERSHIP', 'EDUCATION']),
  title: z.string().trim().min(2).max(140),
  organization: z.string().trim().min(2).max(140),
  location: z.string().trim().max(120).optional().default(''),
  startDate: z.string().trim().min(2).max(40),
  endDate: z.string().trim().max(40).nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(2000).optional().default(''),
  sortOrder: z.number().int().min(0).default(0),
});

export const createSkillSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.enum(['LANGUAGES', 'FRAMEWORKS', 'AI_ML', 'CLOUD_DEVOPS', 'HARDWARE_ECE', 'TOOLS']),
  proficiency: z.enum(['CORE', 'PROFICIENT', 'EXPLORING']).default('PROFICIENT'),
});

export const updateSiteSettingsSchema = z.object({
  showFeed: z.boolean().optional(),
  showServices: z.boolean().optional(),
  showAchievements: z.boolean().optional(),
  showHackathons: z.boolean().optional(),
  showTeam: z.boolean().optional(),
  enable3DHero: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'BUSY_HACKATHON', 'HIDDEN']).optional(),
  announcementActive: z.boolean().optional(),
  announcementText: z.string().max(240).optional(),
  announcementLink: z.string().max(300).optional(),
  heroTagline: z.string().min(2).max(160).optional(),
  heroSubtext: z.string().min(10).max(1000).optional(),
  contactEmail: z.string().email().optional(),
});

export const createMemberAdminSchema = z.object({
  email: z.string().trim().email(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,32}$/, 'Username must be 3-32 lowercase letters, numbers, or underscores'),
  fullName: z.string().trim().min(2).max(120),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
  headline: z.string().trim().max(200).optional().default('Engineer at TurboBits'),
});

export const updateMemberAdminSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
  isVisibleOnSite: z.boolean().optional(),
});

export const createServiceSchema = z.object({
  title: z.string().trim().min(2).max(140),
  tagline: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(3000),
  deliverablesJson: z.array(z.string().trim().min(1).max(120)).default([]),
  startingPriceLabel: z.string().trim().min(1).max(60),
  turnaroundLabel: z.string().trim().min(1).max(60),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const subscriberSchema = z.object({
  email: z.string().trim().email(),
});
