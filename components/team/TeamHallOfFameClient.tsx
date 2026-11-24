'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Award, ExternalLink, Eye, MapPin, X } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import type { AchievementRecord, MemberRecord } from '@/lib/types';

interface HydratedAchievement extends AchievementRecord {
  member: MemberRecord | null;
  taggedMembers: Array<{ id: string; username: string; fullName: string }>;
}

interface TeamHallOfFameClientProps {
  members: MemberRecord[];
  achievements: HydratedAchievement[];
  showAchievements: boolean;
}

export default function TeamHallOfFameClient({
  members,
  achievements,
  showAchievements,
}: TeamHallOfFameClientProps) {
  const [scope, setScope] = useState<'ALL' | 'TEAM' | 'PERSONAL'>('ALL');
  const [memberFilter, setMemberFilter] = useState<string>('ALL');
  const [previewCert, setPreviewCert] = useState<HydratedAchievement | null>(null);

  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      if (scope !== 'ALL' && a.scope !== scope) return false;
      if (
        memberFilter !== 'ALL' &&
        a.memberId !== memberFilter &&
        !a.taggedMemberIdsJson.includes(memberFilter)
      ) {
        return false;
      }
      return true;
    });
  }, [achievements, scope, memberFilter]);

  return (
    <div className="px-5 pb-24 pt-10 md:px-8 md:pt-14">
      {/* Header */}
      <div className="grid gap-6 border-b border-black/10 pb-12 lg:grid-cols-12 lg:items-end dark:border-white/12">
        <div className="lg:col-span-8">
          <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">The Collective</p>
          <h1 className="tb-display mt-3 text-[clamp(3rem,7.5vw,6rem)] font-semibold leading-[0.93]">
            Team &amp; Hall of Fame
          </h1>
        </div>
        <div className="lg:col-span-4">
          <p className="text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
            Click any engineer to open their modular portfolio at <code className="font-mono">turbobits.in/[username]</code>,
            or inspect our verified team awards and certifications below.
          </p>
        </div>
      </div>

      {/* Squad Roster */}
      <section className="mt-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/${m.username}`}
              className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-black/10 bg-[#EAEAE5] transition-colors hover:border-[#0033FF] dark:border-white/12 dark:bg-[#0B0B0D]"
            >
              <div>
                <div className="relative h-28 w-full overflow-hidden border-b border-black/10 dark:border-white/10">
                  <SafeImage
                    src={m.bannerUrl || '/images/project-ai-vision.jpg'}
                    alt={`${m.fullName} banner`}
                    className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-6 pb-6">
                  <div className="-mt-7 flex items-end justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#EAEAE5] bg-white font-display text-base font-bold text-[#09090B] dark:border-[#0B0B0D] dark:bg-[#141416] dark:text-white">
                      {m.fullName
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-[#F4F4F0] transition-colors group-hover:border-[#0033FF] group-hover:bg-[#0033FF] group-hover:text-white dark:border-white/20 dark:bg-[#141416]">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="tb-display text-xl font-semibold group-hover:text-[#0033FF]">
                        {m.fullName}
                      </h2>
                      <span className="font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                        /{m.username}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                      {m.headline}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-black/10 px-6 py-3.5 font-mono text-[11px] text-[#52525B] dark:border-white/10 dark:text-[#8E8E93]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {m.location || 'India'}
                </span>
                {m.availabilityBadge && (
                  <span className="truncate text-[#09090B] dark:text-white">
                    {m.availabilityBadge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Unified Hall of Fame */}
      {showAchievements && (
        <section className="mt-20 border-t border-black/10 pt-14 dark:border-white/12">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                Verified Awards &amp; Credentials
              </p>
              <h2 className="tb-display mt-2 text-3xl font-semibold sm:text-5xl">
                Unified Hall of Fame
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center rounded-full border border-black/10 bg-[#EAEAE5] p-1 text-xs dark:border-white/12 dark:bg-[#0B0B0D]">
                {(['ALL', 'TEAM', 'PERSONAL'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScope(s)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-1.5 font-medium transition-colors ${
                      scope === s
                        ? 'bg-[#0033FF] text-white'
                        : 'text-[#52525B] hover:text-[#09090B] dark:text-[#8E8E93] dark:hover:text-white'
                    }`}
                  >
                    {s === 'ALL' ? 'All' : s === 'TEAM' ? 'Team Awards' : 'Certifications'}
                  </button>
                ))}
              </div>

              <label htmlFor="hall-member-filter" className="sr-only">
                Filter achievements by member
              </label>
              <select
                id="hall-member-filter"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="rounded-full border border-black/10 bg-[#EAEAE5] px-4 py-2 text-xs text-[#09090B] dark:border-white/12 dark:bg-[#0B0B0D] dark:text-white"
              >
                <option value="ALL">All Builders</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {filteredAchievements.map((ach) => (
              <div
                key={ach.id}
                className="flex flex-col justify-between rounded-[24px] border border-black/10 bg-[#EAEAE5] p-6 dark:border-white/12 dark:bg-[#0B0B0D]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-[#0033FF]" />
                      {ach.scope === 'TEAM' ? 'Team Award' : 'Personal Credential'} · {ach.issuerOrEvent}
                    </span>
                    <span className="tb-tabular">{ach.date}</span>
                  </div>

                  <h3 className="tb-display mt-3 text-xl font-semibold">{ach.title}</h3>
                  <p className="mt-1 font-mono text-xs font-semibold text-[#0033FF]">
                    {ach.rankOrResult}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                    {ach.description}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 dark:border-white/10">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {ach.taggedMembers.map((tm) => (
                      <Link
                        key={tm.id}
                        href={`/${tm.username}`}
                        className="font-mono text-[11px] text-[#52525B] hover:text-[#0033FF] dark:text-[#8E8E93]"
                      >
                        @{tm.username}
                      </Link>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {ach.certificateUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewCert(ach)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </button>
                    )}
                    {ach.credentialUrl && (
                      <a
                        href={ach.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#09090B] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#0033FF] dark:bg-white dark:text-[#09090B] dark:hover:bg-[#0033FF] dark:hover:text-white"
                      >
                        <span>Verify</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certificate Modal Previewer */}
      {previewCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Certificate preview for ${previewCert.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/15 bg-[#0B0B0D] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="font-mono text-[11px] text-[#8E8E93]">{previewCert.issuerOrEvent}</p>
                <h3 className="font-display text-base font-semibold">{previewCert.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                aria-label="Close certificate preview"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 hover:border-[#0033FF]"
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
                {previewCert.rankOrResult} · {previewCert.date}
              </span>
              {previewCert.credentialUrl && (
                <a
                  href={previewCert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-white hover:text-[#0033FF]"
                >
                  <span>External Credential</span>
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
