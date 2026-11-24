import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clapFeedPost,
  createFeedPost,
  createInquiry,
  createProject,
  createWhitelistedMember,
  getFullMemberProfile,
  getSiteSettings,
  incrementProjectFileDownload,
  listProjects,
  resetStoreForTests,
  updateSiteSettings,
} from './repository';

test('seed store exposes 5 visible builders and 16 projects', () => {
  resetStoreForTests();
  const projects = listProjects({ scope: 'ALL' });
  assert.equal(projects.length, 16);
  const omProfile = getFullMemberProfile('om_satange');
  assert.ok(omProfile);
  assert.equal(omProfile.member.role, 'ADMIN');
  assert.ok(omProfile.teamContributions.length >= 4);
  assert.ok(omProfile.personalProjects.length >= 1);
});

test('creating a project, feed post, clapping, and incrementing file downloads mutate state', () => {
  resetStoreForTests();
  const created = createProject('mem_om', {
    title: 'Quantum Relay',
    scope: 'TEAM',
    tagline: 'Sub-millisecond telemetry bridge',
    summary: 'Built to verify full CRUD creation in repository unit tests.',
    techStackJson: ['Rust', 'Next.js'],
    category: 'SYSTEMS',
    projectDate: 'Nov 2026',
    status: 'COMPLETED',
    featured: false,
    displayOrder: 20,
  });
  assert.equal(created.slug, 'quantum-relay');
  assert.equal(listProjects({ scope: 'ALL' }).length, 17);

  const post = createFeedPost('mem_om', {
    postType: 'DEVLOG',
    title: 'Shipped Quantum Relay',
    content: 'Unit-tested feed post creation and clap increment.',
    mediaUrlsJson: [],
    taggedMemberIdsJson: ['mem_om'],
  });
  const clapped = clapFeedPost(post.id);
  assert.equal(clapped?.clapsCount, 2);

  const downloaded = incrementProjectFileDownload('pf_1');
  assert.equal(downloaded?.downloadCount, 185);
});

test('site settings update and whitelist duplicate guard behave deterministically', () => {
  resetStoreForTests();
  const updated = updateSiteSettings('mem_om', {
    announcementActive: true,
    announcementText: 'Live Test Banner',
    availabilityStatus: 'BUSY_HACKATHON',
  });
  assert.equal(updated.announcementActive, true);
  assert.equal(getSiteSettings().availabilityStatus, 'BUSY_HACKATHON');

  const dup = createWhitelistedMember('mem_om', {
    email: 'omsatange72@gmail.com',
    username: 'dup_user',
    fullName: 'Duplicate',
    role: 'MEMBER',
  });
  assert.equal(dup.ok, false);

  const inq = createInquiry({
    name: 'Test Client',
    email: 'client@example.com',
    organization: 'Test Org',
    phone: '',
    serviceType: 'Web Platform',
    budgetRange: '$5,000',
    timeline: '4 Weeks',
    message: 'Testing inquiry submission pipeline end to end.',
  });
  assert.equal(inq.status, 'NEW');
});
