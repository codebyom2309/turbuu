'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Download,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import type {
  AchievementRecord,
  FeedPostRecord,
  HackathonRecord,
  MemberExperienceRecord,
  MemberRecord,
  MemberSkillRecord,
  ProfileSectionKey,
  ProjectContributorRecord,
  ProjectRecord,
  SkillCategory,
} from '@/lib/types';

interface MemberPortfolioClientProps {
  profile: {
    member: MemberRecord;
    experiences: MemberExperienceRecord[];
    skills: MemberSkillRecord[];
    personalProjects: ProjectRecord[];
    teamContributions: Array<ProjectContributorRecord & { project: ProjectRecord }>;
    achievements: AchievementRecord[];
    hackathons: HackathonRecord[];
    feedPosts: FeedPostRecord[];
  };
}

const SKILL_CAT_LABELS: Record<SkillCategory, string> = {
  LANGUAGES: 'Languages',
  FRAMEWORKS: 'Frameworks & Libraries',
  AI_ML: 'AI & Machine Learning',
  CLOUD_DEVOPS: 'Cloud & DevOps',
  HARDWARE_ECE: 'Hardware & Embedded',
  TOOLS: 'Tools & Platforms',
};

export default function MemberPortfolioClient({ profile }: MemberPortfolioClientProps) {
  const {
    member,
    experiences,
    skills,
    personalProjects,
    teamContributions,
    achievements,
    hackathons,
    feedPosts,
  } = profile;

  const [previewCert, setPreviewCert] = useState<AchievementRecord | null>(null);

  const orderedSections = [...member.sectionConfigJson]
    .filter((s) => s.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const groupedSkills = skills.reduce<Record<string, MemberSkillRecord[]>>((acc, sk) => {
    if (!acc[sk.category]) acc[sk.category] = [];
    acc[sk.category].push(sk);
    return acc;
  }, {});

  const workExps = experiences.filter((e) => e.category === 'WORK');
  const leadershipExps = experiences.filter((e) => e.category === 'LEADERSHIP');
  const eduExps = experiences.filter((e) => e.category === 'EDUCATION');

  const renderSection = (key: ProfileSectionKey) => {
    switch (key) {
      case 'about':
        return (
          <section key="about" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">About</p>
            <p className="mt-3 text-sm leading-relaxed text-[#09090B] sm:text-base dark:text-white/90">
              {member.bio}
            </p>
          </section>
        );

      case 'skills':
        if (skills.length === 0) return null;
        return (
          <section key="skills" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Capabilities</p>
            <h2 className="tb-display mt-1 text-2xl font-semibold">Skills &amp; Tech Stack</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {Object.entries(groupedSkills).map(([cat, list]) => (
                <div key={cat} className="rounded-2xl border border-black/10 bg-[#F4F4F0] p-4 dark:border-white/10 dark:bg-[#141416]">
                  <p className="font-mono text-[11px] font-semibold text-[#0033FF]">
                    {SKILL_CAT_LABELS[cat as SkillCategory] || cat}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
                    {list.map((sk) => (
                      <span key={sk.id} className="inline-flex items-baseline gap-1.5">
                        <span className="font-medium">{sk.name}</span>
                        <span className="font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
                          ({sk.proficiency.toLowerCase()})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'experience':
        if (workExps.length === 0) return null;
        return (
          <section key="experience" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#0033FF]" />
              <h2 className="tb-display text-2xl font-semibold">Experience</h2>
            </div>
            <div className="mt-5 divide-y divide-black/10 dark:divide-white/10">
              {workExps.map((exp) => (
                <div key={exp.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-semibold">{exp.title}</h3>
                    <span className="tb-tabular font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                      {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-[#0033FF]">
                    {exp.organization} {exp.location ? `· ${exp.location}` : ''}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'leadership':
        if (leadershipExps.length === 0) return null;
        return (
          <section key="leadership" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#0033FF]" />
              <h2 className="tb-display text-2xl font-semibold">Leadership</h2>
            </div>
            <div className="mt-5 divide-y divide-black/10 dark:divide-white/10">
              {leadershipExps.map((exp) => (
                <div key={exp.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-semibold">{exp.title}</h3>
                    <span className="tb-tabular font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                      {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-[#0033FF]">{exp.organization}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'education':
        if (eduExps.length === 0) return null;
        return (
          <section key="education" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#0033FF]" />
              <h2 className="tb-display text-2xl font-semibold">Education</h2>
            </div>
            <div className="mt-5 divide-y divide-black/10 dark:divide-white/10">
              {eduExps.map((exp) => (
                <div key={exp.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-semibold">{exp.title}</h3>
                    <span className="tb-tabular font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                      {exp.startDate} — {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-[#0033FF]">{exp.organization}</p>
                  <p className="mt-2 text-sm text-[#52525B] dark:text-[#8E8E93]">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'teamContributions':
        if (teamContributions.length === 0) return null;
        return (
          <section key="teamContributions" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Auto-Synced Squad Builds</p>
            <h2 className="tb-display mt-1 text-2xl font-semibold">TurboBits Team Contributions</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {teamContributions.map((item) => (
                <Link
                  key={item.id}
                  href={`/projects/${item.project.slug}`}
                  className="group rounded-2xl border border-black/10 bg-[#F4F4F0] p-5 transition-colors hover:border-[#0033FF] dark:border-white/10 dark:bg-[#141416]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-semibold group-hover:text-[#0033FF]">
                      {item.project.title}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </div>
                  <p className="mt-1 font-mono text-[11px] font-semibold text-[#0033FF]">{item.role}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                    {item.contributionSummary || item.project.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );

      case 'personalProjects':
        if (personalProjects.length === 0) return null;
        return (
          <section key="personalProjects" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Independent Research</p>
            <h2 className="tb-display mt-1 text-2xl font-semibold">Personal Projects</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {personalProjects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.slug}`}
                  className="group rounded-2xl border border-black/10 bg-[#F4F4F0] p-5 transition-colors hover:border-[#0033FF] dark:border-white/10 dark:bg-[#141416]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-semibold group-hover:text-[#0033FF]">
                      {proj.title}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                    {proj.tagline}
                  </p>
                  <p className="mt-3 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                    {proj.techStackJson.slice(0, 3).join(' · ')}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (achievements.length === 0) return null;
        return (
          <section key="certifications" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#0033FF]" />
              <h2 className="tb-display text-2xl font-semibold">Certifications &amp; Awards</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#F4F4F0] p-4 dark:border-white/10 dark:bg-[#141416]"
                >
                  <div>
                    <p className="font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                      {ach.issuerOrEvent} · {ach.date}
                    </p>
                    <h3 className="mt-1 font-display text-sm font-semibold">{ach.title}</h3>
                    <p className="mt-0.5 font-mono text-xs text-[#0033FF]">{ach.rankOrResult}</p>
                  </div>
                  {ach.certificateUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewCert(ach)}
                      className="mt-3 w-fit text-xs font-medium underline underline-offset-4 hover:text-[#0033FF]"
                    >
                      Preview certificate
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'hackathons':
        if (hackathons.length === 0) return null;
        return (
          <section key="hackathons" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#0033FF]" />
              <h2 className="tb-display text-2xl font-semibold">Hackathons Attended</h2>
            </div>
            <div className="mt-5 divide-y divide-black/10 dark:divide-white/10">
              {hackathons.map((h) => (
                <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-display text-sm font-semibold">{h.name}</p>
                    <p className="font-mono text-xs text-[#0033FF]">{h.result}</p>
                  </div>
                  <span className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    {h.location} · {h.date}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'activity':
        if (feedPosts.length === 0) return null;
        return (
          <section key="activity" className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Auto-Pulled from /feed</p>
            <h2 className="tb-display mt-1 text-2xl font-semibold">Studio Feed Activity</h2>
            <div className="mt-5 space-y-3">
              {feedPosts.slice(0, 4).map((post) => (
                <Link
                  key={post.id}
                  href={`/feed/${post.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-[#F4F4F0] p-4 transition-colors hover:border-[#0033FF] dark:border-white/10 dark:bg-[#141416]"
                >
                  <div>
                    <p className="font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
                      {post.postType} · {post.clapsCount} claps
                    </p>
                    <p className="mt-0.5 text-sm font-semibold group-hover:text-[#0033FF]">
                      {post.title}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        );
    }
  };

  return (
    <div className="px-5 pb-24 pt-8 md:px-8">
      {/* LinkedIn-Style Editorial Profile Header */}
      <div className="overflow-hidden rounded-[28px] border border-black/10 bg-[#EAEAE5] dark:border-white/12 dark:bg-[#0B0B0D]">
        <div className="relative h-44 w-full overflow-hidden border-b border-black/10 sm:h-56 dark:border-white/10">
          <SafeImage
            src={member.bannerUrl || '/images/project-ai-vision.jpg'}
            alt={`${member.fullName} cover banner`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="px-6 pb-8 sm:px-10">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#EAEAE5] bg-white font-display text-2xl font-bold text-[#09090B] shadow-md dark:border-[#0B0B0D] dark:bg-[#141416] dark:text-white">
              {member.avatarUrl ? (
                <SafeImage
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="h-full w-full rounded-[20px] object-cover"
                />
              ) : (
                member.fullName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {member.resumeUrl && (
                <a
                  href={member.resumeUrl}
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Resume PDF</span>
                </a>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
              >
                <span>Collaborate</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="tb-display text-3xl font-semibold sm:text-4xl">{member.fullName}</h1>
                <span className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                  /{member.username}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-[#09090B] sm:text-base dark:text-white/90">
                {member.headline}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                {member.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {member.location}
                  </span>
                )}
                {member.availabilityBadge && (
                  <span className="inline-flex items-center gap-1.5 text-[#09090B] dark:text-white">
                    <span className="h-2 w-2 rounded-full bg-[#0033FF]" aria-hidden="true" />
                    {member.availabilityBadge}
                  </span>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2 lg:col-span-4 lg:justify-end lg:self-end">
              {member.socialsJson.github && (
                <a
                  href={member.socialsJson.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 hover:border-[#0033FF] hover:text-[#0033FF] dark:border-white/20"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {member.socialsJson.linkedin && (
                <a
                  href={member.socialsJson.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 hover:border-[#0033FF] hover:text-[#0033FF] dark:border-white/20"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {member.socialsJson.portfolio && (
                <a
                  href={member.socialsJson.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 hover:border-[#0033FF] hover:text-[#0033FF] dark:border-white/20"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {member.socialsJson.email && (
                <a
                  href={`mailto:${member.socialsJson.email}`}
                  aria-label="Email"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 hover:border-[#0033FF] hover:text-[#0033FF] dark:border-white/20"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modular Ordered Profile Sections */}
      <div className="mx-auto mt-8 max-w-4xl space-y-6">
        {orderedSections.map((sec) => renderSection(sec.key))}
      </div>

      {/* Certificate Modal Preview */}
      {previewCert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/15 bg-[#0B0B0D] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="font-display text-base font-semibold">{previewCert.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-[16/10] w-full bg-black">
              <SafeImage
                src={previewCert.certificateUrl}
                alt={previewCert.title}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between px-6 py-4 text-xs text-[#8E8E93]">
              <span>
                {previewCert.issuerOrEvent} · {previewCert.rankOrResult}
              </span>
              {previewCert.credentialUrl && (
                <a
                  href={previewCert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white hover:text-[#0033FF]"
                >
                  <span>Verify</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
