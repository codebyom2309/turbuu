'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import type { HackathonRecord, ProjectCategory, ProjectRecord } from '@/lib/types';

interface ProjectsVaultClientProps {
  projects: ProjectRecord[];
  hackathons: Pick<HackathonRecord, 'id' | 'name'>[];
}

const CATEGORIES: Array<{ value: 'ALL' | ProjectCategory; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'AI_ML', label: 'AI & ML' },
  { value: 'WEB', label: 'Web' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'HARDWARE_IOT', label: 'Hardware & IoT' },
  { value: 'SYSTEMS', label: 'Systems' },
  { value: 'TOOLS', label: 'Tools' },
];

const CATEGORY_NAMES: Record<ProjectCategory, string> = {
  AI_ML: 'AI & ML',
  WEB: 'Web',
  MOBILE: 'Mobile',
  HARDWARE_IOT: 'Hardware & IoT',
  SYSTEMS: 'Systems',
  TOOLS: 'Tools',
};

export default function ProjectsVaultClient({ projects, hackathons }: ProjectsVaultClientProps) {
  const [category, setCategory] = useState<'ALL' | ProjectCategory>('ALL');
  const [scope, setScope] = useState<'ALL' | 'TEAM' | 'PERSONAL'>('ALL');
  const [hackathonId, setHackathonId] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (category !== 'ALL' && p.category !== category) return false;
      if (scope !== 'ALL' && p.scope !== scope) return false;
      if (hackathonId !== 'ALL' && p.hackathonId !== hackathonId) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${p.title} ${p.tagline} ${p.summary} ${p.techStackJson.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [projects, category, scope, hackathonId, search]);

  return (
    <div className="px-5 pb-24 pt-10 md:px-8 md:pt-14">
      {/* Massive Projects ↗ Editorial Header (Matching Screenshot 2) */}
      <div className="grid gap-8 border-b border-black/10 pb-12 lg:grid-cols-12 lg:items-end dark:border-white/12">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-4">
            <h1 className="tb-display text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[0.92]">
              Projects
            </h1>
            <ArrowUpRight className="h-12 w-12 shrink-0 stroke-[1.5] sm:h-16 sm:w-16" />
          </div>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-black/10 bg-[#EAEAE5] px-4 py-2 text-xs dark:border-white/12 dark:bg-[#0B0B0D]">
            <span className="h-2 w-2 rounded-full bg-[#0033FF]" aria-hidden="true" />
            <span className="font-medium">
              {projects.length} documented builds with Filebase APKs, PDFs &amp; architecture specs.
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 lg:pl-8">
          <p className="max-w-md text-sm leading-relaxed text-[#52525B] sm:text-base dark:text-[#8E8E93]">
            Filter by engineering domain, tech stack, or hackathon registry to inspect full system
            dashboards, contributors, and downloadable release vaults.
          </p>
        </div>
      </div>

      {/* Filter & Instant Search Controls */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => {
            const active = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                aria-pressed={active}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#0033FF] text-white'
                    : 'border border-black/10 bg-[#EAEAE5] text-[#09090B] hover:border-[#0033FF] dark:border-white/12 dark:bg-[#0B0B0D] dark:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center rounded-full border border-black/10 bg-[#EAEAE5] p-1 text-xs dark:border-white/12 dark:bg-[#0B0B0D]">
            {(['ALL', 'TEAM', 'PERSONAL'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors ${
                  scope === s
                    ? 'bg-[#09090B] text-white dark:bg-white dark:text-[#09090B]'
                    : 'text-[#52525B] dark:text-[#8E8E93]'
                }`}
              >
                {s === 'ALL' ? 'All Scopes' : s === 'TEAM' ? 'Team' : 'Personal'}
              </button>
            ))}
          </div>

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#52525B] dark:text-[#8E8E93]" />
            <label htmlFor="project-hackathon-filter" className="sr-only">
              Filter by hackathon
            </label>
            <select
              id="project-hackathon-filter"
              value={hackathonId}
              onChange={(e) => setHackathonId(e.target.value)}
              className="rounded-full border border-black/10 bg-[#EAEAE5] py-2 pl-9 pr-8 text-xs text-[#09090B] dark:border-white/12 dark:bg-[#0B0B0D] dark:text-white"
            >
              <option value="ALL">All Hackathons</option>
              {hackathons.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#52525B] dark:text-[#8E8E93]" />
            <label htmlFor="project-search-input" className="sr-only">
              Search projects or tech stack
            </label>
            <input
              id="project-search-input"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or tech stack..."
              className="w-full rounded-full border border-black/10 bg-white py-2 pl-9 pr-4 text-xs text-[#09090B] placeholder:text-[#8E8E93] dark:border-white/12 dark:bg-[#0B0B0D] dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="mt-6 font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
        Showing <span className="tb-tabular font-semibold text-[#09090B] dark:text-white">{filtered.length}</span>{' '}
        {filtered.length === 1 ? 'project' : 'projects'}
      </p>

      {/* Responsive Project Cards Grid */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-[28px] border border-black/10 bg-[#EAEAE5] p-12 text-center dark:border-white/12 dark:bg-[#0B0B0D]">
          <p className="text-base font-medium">No projects match this filter combination.</p>
          <button
            type="button"
            onClick={() => {
              setCategory('ALL');
              setScope('ALL');
              setHackathonId('ALL');
              setSearch('');
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-5 py-2 text-xs font-medium text-white"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-[24px] border border-black/10 bg-[#EAEAE5] transition-colors hover:border-[#0033FF] dark:border-white/12 dark:bg-[#0B0B0D]"
            >
              <div>
                <div className="aspect-[16/10] w-full overflow-hidden border-b border-black/10 dark:border-white/10">
                  <SafeImage
                    src={project.coverImageUrl}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                    <span>
                      {CATEGORY_NAMES[project.category]} · {project.scope === 'TEAM' ? 'Team Build' : 'Personal'}
                    </span>
                    <span className="tb-tabular">{project.projectDate}</span>
                  </div>

                  <div className="mt-2.5 flex items-start justify-between gap-3">
                    <h2 className="tb-display text-xl font-semibold leading-snug group-hover:text-[#0033FF]">
                      {project.title}
                    </h2>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/15 transition-colors group-hover:border-[#0033FF] group-hover:bg-[#0033FF] group-hover:text-white dark:border-white/20">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-[#52525B] dark:text-[#8E8E93]">
                    {project.tagline}
                  </p>
                </div>
              </div>

              <div className="border-t border-black/10 px-6 py-4 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                  <span className="truncate">
                    {project.techStackJson.slice(0, 3).join(' · ')}
                  </span>
                  {project.files && project.files.length > 0 && (
                    <span className="shrink-0 font-semibold text-[#0033FF]">
                      {project.files.length} {project.files.length === 1 ? 'File' : 'Files'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
