// ==============================================================================
// TURBOBITS — SHARED DOMAIN TYPES & DTOS (Aligned 1:1 with prisma/schema.prisma)
// ==============================================================================

export type MemberRole = 'ADMIN' | 'MEMBER';
export type ExperienceCategory = 'WORK' | 'LEADERSHIP' | 'EDUCATION';
export type SkillCategory =
  | 'LANGUAGES'
  | 'FRAMEWORKS'
  | 'AI_ML'
  | 'CLOUD_DEVOPS'
  | 'HARDWARE_ECE'
  | 'TOOLS';
export type SkillProficiency = 'CORE' | 'PROFICIENT' | 'EXPLORING';
export type ProjectScope = 'TEAM' | 'PERSONAL';
export type ProjectCategory =
  | 'AI_ML'
  | 'WEB'
  | 'MOBILE'
  | 'HARDWARE_IOT'
  | 'SYSTEMS'
  | 'TOOLS';
export type ProjectStatus = 'COMPLETED' | 'IN_PROGRESS' | 'ARCHIVED';
export type ProjectFileType = 'APK' | 'PDF' | 'PPTX' | 'ZIP' | 'DOCUMENT' | 'OTHER';
export type ProjectMediaType = 'IMAGE' | 'DIAGRAM' | 'VIDEO';
export type AchievementScope = 'TEAM' | 'PERSONAL';
export type FeedPostType =
  | 'HACKATHON'
  | 'PROJECT_LAUNCH'
  | 'ACHIEVEMENT'
  | 'DEVLOG'
  | 'ANNOUNCEMENT';
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED';
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY_HACKATHON' | 'HIDDEN';

export type ProfileSectionKey =
  | 'about'
  | 'skills'
  | 'experience'
  | 'leadership'
  | 'education'
  | 'certifications'
  | 'personalProjects'
  | 'teamContributions'
  | 'hackathons'
  | 'activity';

export interface ProfileSectionConfig {
  key: ProfileSectionKey;
  label: string;
  visible: boolean;
  sortOrder: number;
}

export interface MemberSocials {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  portfolio?: string;
  email?: string;
}

export interface MemberRecord {
  id: string;
  email: string;
  username: string;
  role: MemberRole;
  isActive: boolean;
  isVisibleOnSite: boolean;
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  resumeUrl: string | null;
  availabilityBadge: string | null;
  socialsJson: MemberSocials;
  themeAccent: string | null;
  sectionConfigJson: ProfileSectionConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberExperienceRecord {
  id: string;
  memberId: string;
  category: ExperienceCategory;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  sortOrder: number;
}

export interface MemberSkillRecord {
  id: string;
  memberId: string;
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
}

export interface HackathonRecord {
  id: string;
  slug: string;
  name: string;
  organizer: string;
  location: string;
  date: string;
  result: string;
  summary: string;
  coverImageUrl: string | null;
  galleryUrlsJson: string[];
  participantIdsJson: string[];
  createdAt: string;
}

export interface ProjectContributorRecord {
  id: string;
  projectId: string;
  memberId: string;
  role: string;
  contributionSummary: string;
  member?: Pick<MemberRecord, 'id' | 'username' | 'fullName' | 'headline' | 'avatarUrl'>;
}

export interface ProjectFileRecord {
  id: string;
  projectId: string;
  fileName: string;
  description: string;
  fileType: ProjectFileType;
  fileSizeBytes: number;
  filebaseKey: string;
  publicUrl: string;
  downloadCount: number;
  uploadedById: string;
  createdAt: string;
}

export interface ProjectMediaRecord {
  id: string;
  projectId: string;
  url: string;
  caption: string;
  mediaType: ProjectMediaType;
  sortOrder: number;
}

export interface ProjectRecord {
  id: string;
  slug: string;
  scope: ProjectScope;
  ownerId: string;
  hackathonId: string | null;
  title: string;
  tagline: string;
  summary: string;
  problemStatement: string;
  solutionOverview: string;
  architectureNotes: string;
  techStackJson: string[];
  category: ProjectCategory;
  projectDate: string;
  liveUrl: string | null;
  githubUrl: string | null;
  demoVideoUrl: string | null;
  coverImageUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  displayOrder: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  contributors?: ProjectContributorRecord[];
  files?: ProjectFileRecord[];
  media?: ProjectMediaRecord[];
  hackathon?: Pick<HackathonRecord, 'id' | 'slug' | 'name' | 'result' | 'date'> | null;
}

export interface AchievementRecord {
  id: string;
  scope: AchievementScope;
  memberId: string | null;
  title: string;
  issuerOrEvent: string;
  rankOrResult: string;
  date: string;
  description: string;
  certificateUrl: string | null;
  credentialUrl: string | null;
  taggedMemberIdsJson: string[];
  isFeatured: boolean;
  createdAt: string;
}

export interface FeedPostRecord {
  id: string;
  authorId: string;
  postType: FeedPostType;
  title: string;
  content: string;
  mediaUrlsJson: string[];
  linkedProjectId: string | null;
  linkedHackathonId: string | null;
  taggedMemberIdsJson: string[];
  clapsCount: number;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: Pick<MemberRecord, 'id' | 'username' | 'fullName' | 'headline' | 'avatarUrl' | 'role'>;
  linkedProject?: Pick<ProjectRecord, 'id' | 'slug' | 'title' | 'tagline' | 'category'> | null;
  linkedHackathon?: Pick<HackathonRecord, 'id' | 'slug' | 'name' | 'result' | 'date'> | null;
  taggedMembers?: Pick<MemberRecord, 'id' | 'username' | 'fullName'>[];
}

export interface ServiceOfferingRecord {
  id: string;
  title: string;
  tagline: string;
  description: string;
  deliverablesJson: string[];
  startingPriceLabel: string;
  turnaroundLabel: string;
  isActive: boolean;
  sortOrder: number;
}

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  organization: string;
  phone: string;
  serviceType: string;
  budgetRange: string;
  timeline: string;
  message: string;
  status: InquiryStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettingRecord {
  id: number;
  showFeed: boolean;
  showServices: boolean;
  showAchievements: boolean;
  showHackathons: boolean;
  showTeam: boolean;
  enable3DHero: boolean;
  maintenanceMode: boolean;
  availabilityStatus: AvailabilityStatus;
  announcementActive: boolean;
  announcementText: string;
  announcementLink: string;
  heroTagline: string;
  heroSubtext: string;
  contactEmail: string;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  detailsJson: Record<string, unknown>;
  createdAt: string;
  actorName?: string;
  actorUsername?: string;
}

export interface ContactSubscriberRecord {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthContext {
  member: MemberRecord;
  source: 'nextauth' | 'bearer' | 'studio-cookie';
}

export const DEFAULT_SECTION_CONFIG: ProfileSectionConfig[] = [
  { key: 'about', label: 'About', visible: true, sortOrder: 0 },
  { key: 'skills', label: 'Skills & Tech Stack', visible: true, sortOrder: 1 },
  { key: 'experience', label: 'Experience', visible: true, sortOrder: 2 },
  { key: 'leadership', label: 'Leadership', visible: true, sortOrder: 3 },
  { key: 'education', label: 'Education', visible: true, sortOrder: 4 },
  { key: 'certifications', label: 'Certifications & Awards', visible: true, sortOrder: 5 },
  { key: 'personalProjects', label: 'Personal Projects', visible: true, sortOrder: 6 },
  { key: 'teamContributions', label: 'TurboBits Team Contributions', visible: true, sortOrder: 7 },
  { key: 'hackathons', label: 'Hackathons Attended', visible: true, sortOrder: 8 },
  { key: 'activity', label: 'Studio Feed Activity', visible: true, sortOrder: 9 },
];
