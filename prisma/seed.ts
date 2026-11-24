import { PrismaClient } from '@prisma/client';
import { createSeedDataset } from '../lib/data/seed-data';

const prisma = new PrismaClient();

async function main() {
  const seed = createSeedDataset();
  console.log('Seeding TurboBits TiDB Serverless MySQL database...');

  // 1. SiteSetting singleton
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {
      showFeed: seed.siteSetting.showFeed,
      showServices: seed.siteSetting.showServices,
      showAchievements: seed.siteSetting.showAchievements,
      showHackathons: seed.siteSetting.showHackathons,
      showTeam: seed.siteSetting.showTeam,
      enable3DHero: seed.siteSetting.enable3DHero,
      maintenanceMode: seed.siteSetting.maintenanceMode,
      availabilityStatus: seed.siteSetting.availabilityStatus,
      announcementActive: seed.siteSetting.announcementActive,
      announcementText: seed.siteSetting.announcementText,
      announcementLink: seed.siteSetting.announcementLink,
      heroTagline: seed.siteSetting.heroTagline,
      heroSubtext: seed.siteSetting.heroSubtext,
      contactEmail: seed.siteSetting.contactEmail,
    },
    create: {
      id: 1,
      showFeed: seed.siteSetting.showFeed,
      showServices: seed.siteSetting.showServices,
      showAchievements: seed.siteSetting.showAchievements,
      showHackathons: seed.siteSetting.showHackathons,
      showTeam: seed.siteSetting.showTeam,
      enable3DHero: seed.siteSetting.enable3DHero,
      maintenanceMode: seed.siteSetting.maintenanceMode,
      availabilityStatus: seed.siteSetting.availabilityStatus,
      announcementActive: seed.siteSetting.announcementActive,
      announcementText: seed.siteSetting.announcementText,
      announcementLink: seed.siteSetting.announcementLink,
      heroTagline: seed.siteSetting.heroTagline,
      heroSubtext: seed.siteSetting.heroSubtext,
      contactEmail: seed.siteSetting.contactEmail,
    },
  });

  // 2. Members
  for (const m of seed.members) {
    await prisma.member.upsert({
      where: { email: m.email },
      update: {
        username: m.username,
        role: m.role,
        isActive: m.isActive,
        isVisibleOnSite: m.isVisibleOnSite,
        fullName: m.fullName,
        headline: m.headline,
        bio: m.bio,
        location: m.location,
        avatarUrl: m.avatarUrl,
        bannerUrl: m.bannerUrl,
        resumeUrl: m.resumeUrl,
        availabilityBadge: m.availabilityBadge,
        socialsJson: m.socialsJson as object,
        themeAccent: m.themeAccent,
        sectionConfigJson: m.sectionConfigJson as unknown as object[],
      },
      create: {
        id: m.id,
        email: m.email,
        username: m.username,
        role: m.role,
        isActive: m.isActive,
        isVisibleOnSite: m.isVisibleOnSite,
        fullName: m.fullName,
        headline: m.headline,
        bio: m.bio,
        location: m.location,
        avatarUrl: m.avatarUrl,
        bannerUrl: m.bannerUrl,
        resumeUrl: m.resumeUrl,
        availabilityBadge: m.availabilityBadge,
        socialsJson: m.socialsJson as object,
        themeAccent: m.themeAccent,
        sectionConfigJson: m.sectionConfigJson as unknown as object[],
      },
    });
  }

  // 3. Member Experiences & Skills
  for (const exp of seed.experiences) {
    await prisma.memberExperience.upsert({
      where: { id: exp.id },
      update: exp,
      create: exp,
    });
  }
  for (const sk of seed.skills) {
    await prisma.memberSkill.upsert({
      where: { id: sk.id },
      update: sk,
      create: sk,
    });
  }

  // 4. Hackathons
  for (const h of seed.hackathons) {
    await prisma.hackathon.upsert({
      where: { slug: h.slug },
      update: {
        name: h.name,
        organizer: h.organizer,
        location: h.location,
        date: h.date,
        result: h.result,
        summary: h.summary,
        coverImageUrl: h.coverImageUrl,
        galleryUrlsJson: h.galleryUrlsJson,
        participantIdsJson: h.participantIdsJson,
      },
      create: {
        id: h.id,
        slug: h.slug,
        name: h.name,
        organizer: h.organizer,
        location: h.location,
        date: h.date,
        result: h.result,
        summary: h.summary,
        coverImageUrl: h.coverImageUrl,
        galleryUrlsJson: h.galleryUrlsJson,
        participantIdsJson: h.participantIdsJson,
      },
    });
  }

  // 5. Projects, Contributors, Files, Media
  for (const p of seed.projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        tagline: p.tagline,
        summary: p.summary,
        problemStatement: p.problemStatement,
        solutionOverview: p.solutionOverview,
        architectureNotes: p.architectureNotes,
        techStackJson: p.techStackJson,
        category: p.category,
        projectDate: p.projectDate,
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl,
        demoVideoUrl: p.demoVideoUrl,
        coverImageUrl: p.coverImageUrl,
        status: p.status,
        featured: p.featured,
        displayOrder: p.displayOrder,
      },
      create: {
        id: p.id,
        slug: p.slug,
        scope: p.scope,
        ownerId: p.ownerId,
        hackathonId: p.hackathonId,
        title: p.title,
        tagline: p.tagline,
        summary: p.summary,
        problemStatement: p.problemStatement,
        solutionOverview: p.solutionOverview,
        architectureNotes: p.architectureNotes,
        techStackJson: p.techStackJson,
        category: p.category,
        projectDate: p.projectDate,
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl,
        demoVideoUrl: p.demoVideoUrl,
        coverImageUrl: p.coverImageUrl,
        status: p.status,
        featured: p.featured,
        displayOrder: p.displayOrder,
        viewsCount: p.viewsCount,
      },
    });
  }

  for (const c of seed.contributors) {
    await prisma.projectContributor.upsert({
      where: { projectId_memberId: { projectId: c.projectId, memberId: c.memberId } },
      update: { role: c.role, contributionSummary: c.contributionSummary },
      create: {
        id: c.id,
        projectId: c.projectId,
        memberId: c.memberId,
        role: c.role,
        contributionSummary: c.contributionSummary,
      },
    });
  }

  for (const f of seed.projectFiles) {
    await prisma.projectFile.upsert({
      where: { id: f.id },
      update: {
        fileName: f.fileName,
        description: f.description,
        fileType: f.fileType,
        fileSizeBytes: f.fileSizeBytes,
        filebaseKey: f.filebaseKey,
        publicUrl: f.publicUrl,
      },
      create: {
        id: f.id,
        projectId: f.projectId,
        fileName: f.fileName,
        description: f.description,
        fileType: f.fileType,
        fileSizeBytes: f.fileSizeBytes,
        filebaseKey: f.filebaseKey,
        publicUrl: f.publicUrl,
        downloadCount: f.downloadCount,
        uploadedById: f.uploadedById,
      },
    });
  }

  for (const pm of seed.projectMedia) {
    await prisma.projectMedia.upsert({
      where: { id: pm.id },
      update: pm,
      create: pm,
    });
  }

  // 6. Achievements
  for (const a of seed.achievements) {
    await prisma.achievement.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        issuerOrEvent: a.issuerOrEvent,
        rankOrResult: a.rankOrResult,
        date: a.date,
        description: a.description,
        certificateUrl: a.certificateUrl,
        credentialUrl: a.credentialUrl,
        taggedMemberIdsJson: a.taggedMemberIdsJson,
        isFeatured: a.isFeatured,
      },
      create: {
        id: a.id,
        scope: a.scope,
        memberId: a.memberId,
        title: a.title,
        issuerOrEvent: a.issuerOrEvent,
        rankOrResult: a.rankOrResult,
        date: a.date,
        description: a.description,
        certificateUrl: a.certificateUrl,
        credentialUrl: a.credentialUrl,
        taggedMemberIdsJson: a.taggedMemberIdsJson,
        isFeatured: a.isFeatured,
      },
    });
  }

  // 7. Feed Posts
  for (const fp of seed.feedPosts) {
    await prisma.feedPost.upsert({
      where: { id: fp.id },
      update: {
        postType: fp.postType,
        title: fp.title,
        content: fp.content,
        mediaUrlsJson: fp.mediaUrlsJson,
        linkedProjectId: fp.linkedProjectId,
        linkedHackathonId: fp.linkedHackathonId,
        taggedMemberIdsJson: fp.taggedMemberIdsJson,
        isPinned: fp.isPinned,
        isPublished: fp.isPublished,
      },
      create: {
        id: fp.id,
        authorId: fp.authorId,
        postType: fp.postType,
        title: fp.title,
        content: fp.content,
        mediaUrlsJson: fp.mediaUrlsJson,
        linkedProjectId: fp.linkedProjectId,
        linkedHackathonId: fp.linkedHackathonId,
        taggedMemberIdsJson: fp.taggedMemberIdsJson,
        clapsCount: fp.clapsCount,
        isPinned: fp.isPinned,
        isPublished: fp.isPublished,
      },
    });
  }

  // 8. Services & Inquiries
  for (const s of seed.services) {
    await prisma.serviceOffering.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  for (const inq of seed.inquiries) {
    await prisma.inquiry.upsert({
      where: { id: inq.id },
      update: {
        status: inq.status,
        adminNotes: inq.adminNotes,
      },
      create: {
        id: inq.id,
        name: inq.name,
        email: inq.email,
        organization: inq.organization,
        phone: inq.phone,
        serviceType: inq.serviceType,
        budgetRange: inq.budgetRange,
        timeline: inq.timeline,
        message: inq.message,
        status: inq.status,
        adminNotes: inq.adminNotes,
      },
    });
  }

  console.log('TurboBits seed complete: 5 members, 16 projects, 6 hackathons, 10 achievements, 6 feed posts, 4 services.');
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
