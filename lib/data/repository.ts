import crypto from 'crypto';
import { createSeedDataset, type SeedDataset } from './seed-data';
import {
  DEFAULT_SECTION_CONFIG,
  type AchievementRecord,
  type AuditLogRecord,
  type ContactSubscriberRecord,
  type FeedPostRecord,
  type HackathonRecord,
  type InquiryRecord,
  type MemberExperienceRecord,
  type MemberRecord,
  type MemberSkillRecord,
  type ProjectContributorRecord,
  type ProjectFileRecord,
  type ProjectMediaRecord,
  type ProjectRecord,
  type ServiceOfferingRecord,
  type SiteSettingRecord,
} from '../types';
import { sanitizeUrl, slugify } from '../validators';

declare global {
  var __TURBOBITS_STORE__: SeedDataset | undefined;
}

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

export function getStore(): SeedDataset {
  if (!globalThis.__TURBOBITS_STORE__) {
    globalThis.__TURBOBITS_STORE__ = createSeedDataset();
  }
  return globalThis.__TURBOBITS_STORE__;
}

export function resetStoreForTests(): void {
  globalThis.__TURBOBITS_STORE__ = createSeedDataset();
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

// --- Audit Helper ---
export function logAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  detailsJson: Record<string, unknown> = {}
): AuditLogRecord {
  const store = getStore();
  const actor = store.members.find((m) => m.id === actorId);
  const entry: AuditLogRecord = {
    id: uid('aud'),
    actorId,
    action,
    entityType,
    entityId,
    detailsJson,
    createdAt: new Date().toISOString(),
    actorName: actor?.fullName ?? 'System',
    actorUsername: actor?.username ?? 'system',
  };
  store.auditLogs.unshift(entry);
  if (store.auditLogs.length > 200) {
    store.auditLogs.length = 200;
  }
  return entry;
}

// --- Site Settings ---
export function getSiteSettings(): SiteSettingRecord {
  return { ...getStore().siteSetting };
}

export function updateSiteSettings(
  actorId: string,
  patch: Partial<Omit<SiteSettingRecord, 'id' | 'updatedAt'>>
): SiteSettingRecord {
  const store = getStore();
  const next: SiteSettingRecord = {
    ...store.siteSetting,
    ...patch,
    announcementLink:
      patch.announcementLink !== undefined
        ? sanitizeUrl(patch.announcementLink) || ''
        : store.siteSetting.announcementLink,
    updatedAt: new Date().toISOString(),
  };
  store.siteSetting = next;
  logAudit(actorId, 'UPDATE_SITE_SETTINGS', 'SiteSetting', '1', patch as Record<string, unknown>);
  return { ...next };
}

// --- Public Studio Stats ---
export function getStudioStats() {
  const store = getStore();
  const visibleMembers = store.members.filter((m) => m.isActive && m.isVisibleOnSite);
  const teamProjects = store.projects.filter((p) => p.scope === 'TEAM' && p.status !== 'ARCHIVED');
  return {
    projectsCount: store.projects.length,
    teamProjectsCount: teamProjects.length,
    buildersCount: visibleMembers.length,
    hackathonsCount: store.hackathons.length,
    achievementsCount: store.achievements.length,
    feedPostsCount: store.feedPosts.filter((p) => p.isPublished).length,
    downloadsTotal: store.projectFiles.reduce((acc, f) => acc + f.downloadCount, 0),
  };
}

// --- Members & Whitelist ---
export function listMembers(options?: { onlyVisible?: boolean; includeInactive?: boolean }): MemberRecord[] {
  const store = getStore();
  return store.members
    .filter((m) => {
      if (!options?.includeInactive && !m.isActive) return false;
      if (options?.onlyVisible && !m.isVisibleOnSite) return false;
      return true;
    })
    .map((m) => ({ ...m }));
}

export function getMemberByEmail(email: string): MemberRecord | null {
  const normalized = email.trim().toLowerCase();
  const found = getStore().members.find((m) => m.email.toLowerCase() === normalized);
  return found ? { ...found } : null;
}

export function getMemberById(id: string): MemberRecord | null {
  const found = getStore().members.find((m) => m.id === id);
  return found ? { ...found } : null;
}

export function getMemberByUsername(username: string): MemberRecord | null {
  const normalized = username.trim().toLowerCase();
  const found = getStore().members.find((m) => m.username.toLowerCase() === normalized);
  return found ? { ...found } : null;
}

export function getFullMemberProfile(username: string) {
  const member = getMemberByUsername(username);
  if (!member || !member.isActive) return null;
  const store = getStore();
  const experiences = store.experiences
    .filter((e) => e.memberId === member.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const skills = store.skills.filter((s) => s.memberId === member.id);
  const personalProjects = store.projects
    .filter((p) => p.scope === 'PERSONAL' && p.ownerId === member.id)
    .map((p) => hydrateProject(p));
  const teamContributions = store.contributors
    .filter((c) => c.memberId === member.id)
    .map((c) => {
      const project = store.projects.find((p) => p.id === c.projectId);
      return project && project.scope === 'TEAM'
        ? {
            ...c,
            project: hydrateProject(project),
          }
        : null;
    })
    .filter(Boolean) as Array<ProjectContributorRecord & { project: ProjectRecord }>;
  const achievements = store.achievements.filter(
    (a) => a.memberId === member.id || a.taggedMemberIdsJson.includes(member.id)
  );
  const hackathons = store.hackathons.filter((h) => h.participantIdsJson.includes(member.id));
  const feedPosts = store.feedPosts
    .filter(
      (f) => f.isPublished && (f.authorId === member.id || f.taggedMemberIdsJson.includes(member.id))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((f) => hydrateFeedPost(f));

  return {
    member,
    experiences,
    skills,
    personalProjects,
    teamContributions,
    achievements,
    hackathons,
    feedPosts,
  };
}

export function updateMemberProfile(
  memberId: string,
  patch: Partial<
    Pick<
      MemberRecord,
      | 'fullName'
      | 'headline'
      | 'bio'
      | 'location'
      | 'avatarUrl'
      | 'bannerUrl'
      | 'resumeUrl'
      | 'availabilityBadge'
      | 'socialsJson'
      | 'themeAccent'
      | 'sectionConfigJson'
    >
  >
): MemberRecord | null {
  const store = getStore();
  const idx = store.members.findIndex((m) => m.id === memberId);
  if (idx === -1) return null;
  const current = store.members[idx];

  const sanitizedSocials = patch.socialsJson
    ? {
        github: sanitizeUrl(patch.socialsJson.github) ?? undefined,
        linkedin: sanitizeUrl(patch.socialsJson.linkedin) ?? undefined,
        twitter: sanitizeUrl(patch.socialsJson.twitter) ?? undefined,
        instagram: sanitizeUrl(patch.socialsJson.instagram) ?? undefined,
        portfolio: sanitizeUrl(patch.socialsJson.portfolio) ?? undefined,
        email: patch.socialsJson.email?.trim() || undefined,
      }
    : current.socialsJson;

  const updated: MemberRecord = {
    ...current,
    ...patch,
    avatarUrl: patch.avatarUrl !== undefined ? sanitizeUrl(patch.avatarUrl) : current.avatarUrl,
    bannerUrl: patch.bannerUrl !== undefined ? sanitizeUrl(patch.bannerUrl) : current.bannerUrl,
    resumeUrl: patch.resumeUrl !== undefined ? sanitizeUrl(patch.resumeUrl) : current.resumeUrl,
    socialsJson: sanitizedSocials,
    updatedAt: new Date().toISOString(),
  };
  store.members[idx] = updated;
  logAudit(memberId, 'UPDATE_PROFILE', 'Member', memberId, { username: updated.username });
  return { ...updated };
}

export function createWhitelistedMember(
  actorId: string,
  input: { email: string; username: string; fullName: string; role: 'ADMIN' | 'MEMBER'; headline?: string }
): { ok: true; member: MemberRecord } | { ok: false; error: string } {
  const store = getStore();
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedUsername = input.username.trim().toLowerCase();

  if (store.members.some((m) => m.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, error: 'A member with this email is already whitelisted.' };
  }
  if (store.members.some((m) => m.username.toLowerCase() === normalizedUsername)) {
    return { ok: false, error: 'This username is already taken.' };
  }

  const now = new Date().toISOString();
  const created: MemberRecord = {
    id: uid('mem'),
    email: normalizedEmail,
    username: normalizedUsername,
    role: input.role,
    isActive: true,
    isVisibleOnSite: true,
    fullName: input.fullName.trim(),
    headline: input.headline?.trim() || 'Engineer at TurboBits',
    bio: 'Member of the TurboBits engineering collective.',
    location: 'India',
    avatarUrl: null,
    bannerUrl: '/images/project-ai-vision.jpg',
    resumeUrl: null,
    availabilityBadge: 'Building at TurboBits',
    socialsJson: { email: normalizedEmail },
    themeAccent: '#0033FF',
    sectionConfigJson: DEFAULT_SECTION_CONFIG.map((s) => ({ ...s })),
    createdAt: now,
    updatedAt: now,
  };
  store.members.push(created);
  logAudit(actorId, 'WHITELIST_MEMBER', 'Member', created.id, {
    email: created.email,
    username: created.username,
    role: created.role,
  });
  return { ok: true, member: { ...created } };
}

export function updateMemberAdmin(
  actorId: string,
  memberId: string,
  patch: { role?: 'ADMIN' | 'MEMBER'; isActive?: boolean; isVisibleOnSite?: boolean }
): MemberRecord | null {
  const store = getStore();
  const idx = store.members.findIndex((m) => m.id === memberId);
  if (idx === -1) return null;
  const updated: MemberRecord = {
    ...store.members[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.members[idx] = updated;
  logAudit(actorId, 'ADMIN_UPDATE_MEMBER', 'Member', memberId, patch);
  return { ...updated };
}

// --- Member Experiences & Skills ---
export function addMemberExperience(
  memberId: string,
  input: Omit<MemberExperienceRecord, 'id' | 'memberId'>
): MemberExperienceRecord {
  const store = getStore();
  const created: MemberExperienceRecord = {
    ...input,
    id: uid('exp'),
    memberId,
  };
  store.experiences.push(created);
  logAudit(memberId, 'ADD_EXPERIENCE', 'MemberExperience', created.id, { title: created.title });
  return { ...created };
}

export function deleteMemberExperience(memberId: string, expId: string, isAdmin: boolean): boolean {
  const store = getStore();
  const idx = store.experiences.findIndex(
    (e) => e.id === expId && (e.memberId === memberId || isAdmin)
  );
  if (idx === -1) return false;
  store.experiences.splice(idx, 1);
  logAudit(memberId, 'DELETE_EXPERIENCE', 'MemberExperience', expId);
  return true;
}

export function addMemberSkill(
  memberId: string,
  input: Omit<MemberSkillRecord, 'id' | 'memberId'>
): MemberSkillRecord {
  const store = getStore();
  const created: MemberSkillRecord = {
    ...input,
    id: uid('sk'),
    memberId,
  };
  store.skills.push(created);
  logAudit(memberId, 'ADD_SKILL', 'MemberSkill', created.id, { name: created.name });
  return { ...created };
}

export function deleteMemberSkill(memberId: string, skillId: string, isAdmin: boolean): boolean {
  const store = getStore();
  const idx = store.skills.findIndex(
    (s) => s.id === skillId && (s.memberId === memberId || isAdmin)
  );
  if (idx === -1) return false;
  store.skills.splice(idx, 1);
  logAudit(memberId, 'DELETE_SKILL', 'MemberSkill', skillId);
  return true;
}

// --- Projects ---
function hydrateProject(p: ProjectRecord): ProjectRecord {
  const store = getStore();
  const contributors = store.contributors
    .filter((c) => c.projectId === p.id)
    .map((c) => {
      const m = store.members.find((mem) => mem.id === c.memberId);
      return {
        ...c,
        member: m
          ? {
              id: m.id,
              username: m.username,
              fullName: m.fullName,
              headline: m.headline,
              avatarUrl: m.avatarUrl,
            }
          : undefined,
      };
    });
  const files = store.projectFiles.filter((f) => f.projectId === p.id);
  const media = store.projectMedia
    .filter((m) => m.projectId === p.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const hackathon = p.hackathonId
    ? store.hackathons.find((h) => h.id === p.hackathonId) || null
    : null;

  return {
    ...p,
    contributors,
    files,
    media,
    hackathon: hackathon
      ? {
          id: hackathon.id,
          slug: hackathon.slug,
          name: hackathon.name,
          result: hackathon.result,
          date: hackathon.date,
        }
      : null,
  };
}

export function listProjects(filters?: {
  scope?: 'TEAM' | 'PERSONAL' | 'ALL';
  category?: string;
  hackathonId?: string;
  search?: string;
  featuredOnly?: boolean;
}): ProjectRecord[] {
  const store = getStore();
  return store.projects
    .filter((p) => {
      if (filters?.scope && filters.scope !== 'ALL' && p.scope !== filters.scope) return false;
      if (filters?.category && filters.category !== 'ALL' && p.category !== filters.category) return false;
      if (filters?.hackathonId && p.hackathonId !== filters.hackathonId) return false;
      if (filters?.featuredOnly && !p.featured) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const hay = `${p.title} ${p.tagline} ${p.summary} ${p.techStackJson.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder || b.createdAt.localeCompare(a.createdAt))
    .map((p) => hydrateProject(p));
}

export function getProjectBySlug(slug: string, incrementView = false): ProjectRecord | null {
  const store = getStore();
  const found = store.projects.find((p) => p.slug === slug);
  if (!found) return null;
  if (incrementView) {
    found.viewsCount += 1;
  }
  return hydrateProject(found);
}

export function getProjectById(id: string): ProjectRecord | null {
  const found = getStore().projects.find((p) => p.id === id);
  return found ? hydrateProject(found) : null;
}

export function createProject(
  actorId: string,
  input: {
    title: string;
    slug?: string;
    scope: 'TEAM' | 'PERSONAL';
    hackathonId?: string | null;
    tagline: string;
    summary: string;
    problemStatement?: string;
    solutionOverview?: string;
    architectureNotes?: string;
    techStackJson: string[];
    category: ProjectRecord['category'];
    projectDate: string;
    liveUrl?: string | null;
    githubUrl?: string | null;
    demoVideoUrl?: string | null;
    coverImageUrl?: string | null;
    status: ProjectRecord['status'];
    featured: boolean;
    displayOrder: number;
    contributors?: Array<{ memberId: string; role: string; contributionSummary?: string }>;
  }
): ProjectRecord {
  const store = getStore();
  let baseSlug = slugify(input.slug || input.title) || uid('proj');
  if (store.projects.some((p) => p.slug === baseSlug)) {
    baseSlug = `${baseSlug}-${crypto.randomBytes(2).toString('hex')}`;
  }
  const now = new Date().toISOString();
  const created: ProjectRecord = {
    id: uid('proj'),
    slug: baseSlug,
    scope: input.scope,
    ownerId: actorId,
    hackathonId: input.hackathonId || null,
    title: input.title,
    tagline: input.tagline,
    summary: input.summary,
    problemStatement: input.problemStatement || '',
    solutionOverview: input.solutionOverview || '',
    architectureNotes: input.architectureNotes || '',
    techStackJson: input.techStackJson,
    category: input.category,
    projectDate: input.projectDate,
    liveUrl: sanitizeUrl(input.liveUrl),
    githubUrl: sanitizeUrl(input.githubUrl),
    demoVideoUrl: sanitizeUrl(input.demoVideoUrl),
    coverImageUrl: sanitizeUrl(input.coverImageUrl) || '/images/project-ai-vision.jpg',
    status: input.status,
    featured: input.featured,
    displayOrder: input.displayOrder,
    viewsCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  store.projects.unshift(created);

  const contributorsList =
    input.contributors && input.contributors.length > 0
      ? input.contributors
      : [{ memberId: actorId, role: 'Project Lead', contributionSummary: 'Created and architected project.' }];

  for (const c of contributorsList) {
    store.contributors.push({
      id: uid('pc'),
      projectId: created.id,
      memberId: c.memberId,
      role: c.role,
      contributionSummary: c.contributionSummary || '',
    });
  }

  logAudit(actorId, 'CREATE_PROJECT', 'Project', created.id, { title: created.title, scope: created.scope });
  return hydrateProject(created);
}

export function updateProject(
  actorId: string,
  isAdmin: boolean,
  projectId: string,
  patch: Partial<ProjectRecord> & {
    contributors?: Array<{ memberId: string; role: string; contributionSummary?: string }>;
  }
): { ok: true; project: ProjectRecord } | { ok: false; status: number; error: string } {
  const store = getStore();
  const idx = store.projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return { ok: false, status: 404, error: 'Project not found' };
  const existing = store.projects[idx];
  if (existing.scope === 'PERSONAL' && existing.ownerId !== actorId && !isAdmin) {
    return { ok: false, status: 403, error: 'You can only edit your own personal projects' };
  }

  const updated: ProjectRecord = {
    ...existing,
    ...patch,
    id: existing.id,
    ownerId: existing.ownerId,
    liveUrl: patch.liveUrl !== undefined ? sanitizeUrl(patch.liveUrl) : existing.liveUrl,
    githubUrl: patch.githubUrl !== undefined ? sanitizeUrl(patch.githubUrl) : existing.githubUrl,
    demoVideoUrl: patch.demoVideoUrl !== undefined ? sanitizeUrl(patch.demoVideoUrl) : existing.demoVideoUrl,
    coverImageUrl: patch.coverImageUrl !== undefined ? sanitizeUrl(patch.coverImageUrl) : existing.coverImageUrl,
    updatedAt: new Date().toISOString(),
  };
  store.projects[idx] = updated;

  if (patch.contributors) {
    store.contributors = store.contributors.filter((c) => c.projectId !== projectId);
    for (const c of patch.contributors) {
      store.contributors.push({
        id: uid('pc'),
        projectId,
        memberId: c.memberId,
        role: c.role,
        contributionSummary: c.contributionSummary || '',
      });
    }
  }

  logAudit(actorId, 'UPDATE_PROJECT', 'Project', projectId, { title: updated.title });
  return { ok: true, project: hydrateProject(updated) };
}

export function deleteProject(
  actorId: string,
  isAdmin: boolean,
  projectId: string
): { ok: true } | { ok: false; status: number; error: string } {
  const store = getStore();
  const idx = store.projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return { ok: false, status: 404, error: 'Project not found' };
  const existing = store.projects[idx];
  if (existing.ownerId !== actorId && !isAdmin) {
    return { ok: false, status: 403, error: 'Only project owner or admin can delete this project' };
  }
  store.projects.splice(idx, 1);
  store.contributors = store.contributors.filter((c) => c.projectId !== projectId);
  store.projectFiles = store.projectFiles.filter((f) => f.projectId !== projectId);
  store.projectMedia = store.projectMedia.filter((m) => m.projectId !== projectId);
  logAudit(actorId, 'DELETE_PROJECT', 'Project', projectId, { title: existing.title });
  return { ok: true };
}

export function addProjectFile(
  actorId: string,
  projectId: string,
  input: Omit<ProjectFileRecord, 'id' | 'projectId' | 'downloadCount' | 'uploadedById' | 'createdAt'>
): ProjectFileRecord | null {
  const store = getStore();
  if (!store.projects.some((p) => p.id === projectId)) return null;
  const created: ProjectFileRecord = {
    id: uid('pf'),
    projectId,
    fileName: input.fileName,
    description: input.description,
    fileType: input.fileType,
    fileSizeBytes: input.fileSizeBytes,
    filebaseKey: input.filebaseKey,
    publicUrl: sanitizeUrl(input.publicUrl) || input.publicUrl,
    downloadCount: 0,
    uploadedById: actorId,
    createdAt: new Date().toISOString(),
  };
  store.projectFiles.push(created);
  logAudit(actorId, 'UPLOAD_PROJECT_FILE', 'ProjectFile', created.id, {
    fileName: created.fileName,
    projectId,
  });
  return { ...created };
}

export function incrementProjectFileDownload(fileId: string): ProjectFileRecord | null {
  const found = getStore().projectFiles.find((f) => f.id === fileId);
  if (!found) return null;
  found.downloadCount += 1;
  return { ...found };
}

export function deleteProjectFile(actorId: string, fileId: string): boolean {
  const store = getStore();
  const idx = store.projectFiles.findIndex((f) => f.id === fileId);
  if (idx === -1) return false;
  store.projectFiles.splice(idx, 1);
  logAudit(actorId, 'DELETE_PROJECT_FILE', 'ProjectFile', fileId);
  return true;
}

export function addProjectMedia(
  actorId: string,
  projectId: string,
  input: { url: string; caption: string; mediaType: ProjectMediaRecord['mediaType'] }
): ProjectMediaRecord | null {
  const store = getStore();
  if (!store.projects.some((p) => p.id === projectId)) return null;
  const sortOrder = store.projectMedia.filter((m) => m.projectId === projectId).length;
  const created: ProjectMediaRecord = {
    id: uid('pm'),
    projectId,
    url: sanitizeUrl(input.url) || '/images/project-ai-vision.jpg',
    caption: input.caption,
    mediaType: input.mediaType,
    sortOrder,
  };
  store.projectMedia.push(created);
  logAudit(actorId, 'ADD_PROJECT_MEDIA', 'ProjectMedia', created.id, { projectId });
  return { ...created };
}

// --- Hackathons ---
export function listHackathons() {
  const store = getStore();
  return store.hackathons
    .map((h) => ({
      ...h,
      participants: h.participantIdsJson
        .map((pid) => store.members.find((m) => m.id === pid))
        .filter(Boolean)
        .map((m) => ({
          id: m!.id,
          username: m!.username,
          fullName: m!.fullName,
          avatarUrl: m!.avatarUrl,
        })),
      projects: store.projects
        .filter((p) => p.hackathonId === h.id)
        .map((p) => ({ id: p.id, slug: p.slug, title: p.title, tagline: p.tagline, category: p.category })),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createHackathon(
  actorId: string,
  input: Omit<HackathonRecord, 'id' | 'slug' | 'createdAt'> & { slug?: string }
): HackathonRecord {
  const store = getStore();
  let slug = slugify(input.slug || input.name) || uid('hack');
  if (store.hackathons.some((h) => h.slug === slug)) {
    slug = `${slug}-${crypto.randomBytes(2).toString('hex')}`;
  }
  const created: HackathonRecord = {
    id: uid('hack'),
    slug,
    name: input.name,
    organizer: input.organizer,
    location: input.location,
    date: input.date,
    result: input.result,
    summary: input.summary,
    coverImageUrl: sanitizeUrl(input.coverImageUrl) || '/images/hackathon-editorial.jpg',
    galleryUrlsJson: input.galleryUrlsJson.map((u) => sanitizeUrl(u)).filter(Boolean) as string[],
    participantIdsJson: input.participantIdsJson,
    createdAt: new Date().toISOString(),
  };
  store.hackathons.unshift(created);
  logAudit(actorId, 'CREATE_HACKATHON', 'Hackathon', created.id, { name: created.name });
  return { ...created };
}

export function deleteHackathon(actorId: string, hackathonId: string): boolean {
  const store = getStore();
  const idx = store.hackathons.findIndex((h) => h.id === hackathonId);
  if (idx === -1) return false;
  store.hackathons.splice(idx, 1);
  logAudit(actorId, 'DELETE_HACKATHON', 'Hackathon', hackathonId);
  return true;
}

// --- Achievements ---
export function listAchievements(filters?: { scope?: 'TEAM' | 'PERSONAL' | 'ALL'; memberId?: string }) {
  const store = getStore();
  return store.achievements
    .filter((a) => {
      if (filters?.scope && filters.scope !== 'ALL' && a.scope !== filters.scope) return false;
      if (
        filters?.memberId &&
        a.memberId !== filters.memberId &&
        !a.taggedMemberIdsJson.includes(filters.memberId)
      ) {
        return false;
      }
      return true;
    })
    .map((a) => ({
      ...a,
      member: a.memberId ? store.members.find((m) => m.id === a.memberId) || null : null,
      taggedMembers: a.taggedMemberIdsJson
        .map((id) => store.members.find((m) => m.id === id))
        .filter(Boolean)
        .map((m) => ({ id: m!.id, username: m!.username, fullName: m!.fullName })),
    }))
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.createdAt.localeCompare(a.createdAt));
}

export function createAchievement(
  actorId: string,
  input: Omit<AchievementRecord, 'id' | 'createdAt'>
): AchievementRecord {
  const store = getStore();
  const created: AchievementRecord = {
    id: uid('ach'),
    scope: input.scope,
    memberId: input.scope === 'PERSONAL' ? input.memberId || actorId : null,
    title: input.title,
    issuerOrEvent: input.issuerOrEvent,
    rankOrResult: input.rankOrResult,
    date: input.date,
    description: input.description,
    certificateUrl: sanitizeUrl(input.certificateUrl),
    credentialUrl: sanitizeUrl(input.credentialUrl),
    taggedMemberIdsJson: input.taggedMemberIdsJson,
    isFeatured: input.isFeatured,
    createdAt: new Date().toISOString(),
  };
  store.achievements.unshift(created);
  logAudit(actorId, 'CREATE_ACHIEVEMENT', 'Achievement', created.id, { title: created.title });
  return { ...created };
}

export function deleteAchievement(actorId: string, isAdmin: boolean, id: string): boolean {
  const store = getStore();
  const idx = store.achievements.findIndex(
    (a) => a.id === id && (isAdmin || a.memberId === actorId || a.scope === 'TEAM')
  );
  if (idx === -1) return false;
  store.achievements.splice(idx, 1);
  logAudit(actorId, 'DELETE_ACHIEVEMENT', 'Achievement', id);
  return true;
}

// --- Feed Posts ---
function hydrateFeedPost(f: FeedPostRecord): FeedPostRecord {
  const store = getStore();
  const author = store.members.find((m) => m.id === f.authorId);
  const linkedProject = f.linkedProjectId
    ? store.projects.find((p) => p.id === f.linkedProjectId) || null
    : null;
  const linkedHackathon = f.linkedHackathonId
    ? store.hackathons.find((h) => h.id === f.linkedHackathonId) || null
    : null;
  const taggedMembers = f.taggedMemberIdsJson
    .map((id) => store.members.find((m) => m.id === id))
    .filter(Boolean)
    .map((m) => ({ id: m!.id, username: m!.username, fullName: m!.fullName }));

  return {
    ...f,
    author: author
      ? {
          id: author.id,
          username: author.username,
          fullName: author.fullName,
          headline: author.headline,
          avatarUrl: author.avatarUrl,
          role: author.role,
        }
      : undefined,
    linkedProject: linkedProject
      ? {
          id: linkedProject.id,
          slug: linkedProject.slug,
          title: linkedProject.title,
          tagline: linkedProject.tagline,
          category: linkedProject.category,
        }
      : null,
    linkedHackathon: linkedHackathon
      ? {
          id: linkedHackathon.id,
          slug: linkedHackathon.slug,
          name: linkedHackathon.name,
          result: linkedHackathon.result,
          date: linkedHackathon.date,
        }
      : null,
    taggedMembers,
  };
}

export function listFeedPosts(options?: {
  postType?: string;
  includeDrafts?: boolean;
  limit?: number;
}): FeedPostRecord[] {
  const store = getStore();
  const filtered = store.feedPosts
    .filter((f) => {
      if (!options?.includeDrafts && !f.isPublished) return false;
      if (options?.postType && options.postType !== 'ALL' && f.postType !== options.postType) return false;
      return true;
    })
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt.localeCompare(a.createdAt))
    .map((f) => hydrateFeedPost(f));
  return options?.limit ? filtered.slice(0, options.limit) : filtered;
}

export function getFeedPostById(id: string): FeedPostRecord | null {
  const found = getStore().feedPosts.find((f) => f.id === id);
  return found ? hydrateFeedPost(found) : null;
}

export function createFeedPost(
  actorId: string,
  input: {
    postType: FeedPostRecord['postType'];
    title: string;
    content: string;
    mediaUrlsJson: string[];
    linkedProjectId?: string | null;
    linkedHackathonId?: string | null;
    taggedMemberIdsJson: string[];
    isPinned?: boolean;
    isPublished?: boolean;
  }
): FeedPostRecord {
  const store = getStore();
  const now = new Date().toISOString();
  const created: FeedPostRecord = {
    id: uid('post'),
    authorId: actorId,
    postType: input.postType,
    title: input.title,
    content: input.content,
    mediaUrlsJson: input.mediaUrlsJson.map((u) => sanitizeUrl(u)).filter(Boolean) as string[],
    linkedProjectId: input.linkedProjectId || null,
    linkedHackathonId: input.linkedHackathonId || null,
    taggedMemberIdsJson: input.taggedMemberIdsJson,
    clapsCount: 1,
    isPinned: Boolean(input.isPinned),
    isPublished: input.isPublished ?? true,
    createdAt: now,
    updatedAt: now,
  };
  store.feedPosts.unshift(created);
  logAudit(actorId, 'PUBLISH_FEED_POST', 'FeedPost', created.id, { title: created.title });
  return hydrateFeedPost(created);
}

export function updateFeedPost(
  actorId: string,
  isAdmin: boolean,
  postId: string,
  patch: Partial<Pick<FeedPostRecord, 'title' | 'content' | 'postType' | 'isPinned' | 'isPublished'>>
): FeedPostRecord | null {
  const store = getStore();
  const idx = store.feedPosts.findIndex((f) => f.id === postId);
  if (idx === -1) return null;
  const existing = store.feedPosts[idx];
  if (existing.authorId !== actorId && !isAdmin) return null;
  const updated: FeedPostRecord = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.feedPosts[idx] = updated;
  logAudit(actorId, 'UPDATE_FEED_POST', 'FeedPost', postId, patch);
  return hydrateFeedPost(updated);
}

export function deleteFeedPost(actorId: string, isAdmin: boolean, postId: string): boolean {
  const store = getStore();
  const idx = store.feedPosts.findIndex(
    (f) => f.id === postId && (f.authorId === actorId || isAdmin)
  );
  if (idx === -1) return false;
  store.feedPosts.splice(idx, 1);
  logAudit(actorId, 'DELETE_FEED_POST', 'FeedPost', postId);
  return true;
}

export function clapFeedPost(postId: string): FeedPostRecord | null {
  const found = getStore().feedPosts.find((f) => f.id === postId);
  if (!found) return null;
  found.clapsCount += 1;
  return hydrateFeedPost(found);
}

// --- Services ---
export function listServices(includeInactive = false): ServiceOfferingRecord[] {
  return getStore()
    .services.filter((s) => includeInactive || s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => ({ ...s }));
}

export function createService(
  actorId: string,
  input: Omit<ServiceOfferingRecord, 'id'>
): ServiceOfferingRecord {
  const store = getStore();
  const created: ServiceOfferingRecord = {
    ...input,
    id: uid('srv'),
  };
  store.services.push(created);
  logAudit(actorId, 'CREATE_SERVICE', 'ServiceOffering', created.id, { title: created.title });
  return { ...created };
}

export function updateService(
  actorId: string,
  id: string,
  patch: Partial<Omit<ServiceOfferingRecord, 'id'>>
): ServiceOfferingRecord | null {
  const store = getStore();
  const idx = store.services.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.services[idx] = { ...store.services[idx], ...patch };
  logAudit(actorId, 'UPDATE_SERVICE', 'ServiceOffering', id, patch);
  return { ...store.services[idx] };
}

export function deleteService(actorId: string, id: string): boolean {
  const store = getStore();
  const idx = store.services.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  store.services.splice(idx, 1);
  logAudit(actorId, 'DELETE_SERVICE', 'ServiceOffering', id);
  return true;
}

// --- Inquiries CRM ---
export function listInquiries(): InquiryRecord[] {
  return getStore()
    .inquiries.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createInquiry(
  input: Omit<InquiryRecord, 'id' | 'status' | 'adminNotes' | 'createdAt' | 'updatedAt'>
): InquiryRecord {
  const store = getStore();
  const now = new Date().toISOString();
  const created: InquiryRecord = {
    ...input,
    id: uid('inq'),
    status: 'NEW',
    adminNotes: '',
    createdAt: now,
    updatedAt: now,
  };
  store.inquiries.unshift(created);
  return { ...created };
}

export function updateInquiry(
  actorId: string,
  id: string,
  patch: { status?: InquiryRecord['status']; adminNotes?: string }
): InquiryRecord | null {
  const store = getStore();
  const idx = store.inquiries.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  store.inquiries[idx] = {
    ...store.inquiries[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  logAudit(actorId, 'UPDATE_INQUIRY', 'Inquiry', id, patch);
  return { ...store.inquiries[idx] };
}

// --- Audit Logs & Subscribers ---
export function listAuditLogs(limit = 40): AuditLogRecord[] {
  return getStore().auditLogs.slice(0, limit);
}

export function addSubscriber(email: string): ContactSubscriberRecord {
  const store = getStore();
  const normalized = email.trim().toLowerCase();
  const existing = store.subscribers.find((s) => s.email === normalized);
  if (existing) return existing;
  const created: ContactSubscriberRecord = {
    id: uid('sub'),
    email: normalized,
    createdAt: new Date().toISOString(),
  };
  store.subscribers.unshift(created);
  return created;
}
