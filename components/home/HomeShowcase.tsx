'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import LiquidCrossHero from '@/components/three/LiquidCrossHero';
import LiquidBentoSphere from '@/components/three/LiquidBentoSphere';
import SafeImage from '@/components/ui/SafeImage';
import type {
  FeedPostRecord,
  MemberRecord,
  ProjectRecord,
  SiteSettingRecord,
} from '@/lib/types';

gsap.registerPlugin(ScrollTrigger);

interface HomeShowcaseProps {
  settings: SiteSettingRecord;
  stats: {
    projectsCount: number;
    buildersCount: number;
    hackathonsCount: number;
    achievementsCount: number;
  };
  featuredProjects: ProjectRecord[];
  latestPosts: FeedPostRecord[];
  members: MemberRecord[];
}

const POST_TYPE_LABELS: Record<string, string> = {
  HACKATHON: 'Hackathon',
  PROJECT_LAUNCH: 'Launch',
  ACHIEVEMENT: 'Award',
  DEVLOG: 'Devlog',
  ANNOUNCEMENT: 'Studio',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function HomeShowcase({
  settings,
  stats,
  featuredProjects,
  latestPosts,
  members,
}: HomeShowcaseProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.tb-fan-card', {
        y: 28,
        opacity: 0.7,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.tb-showcase-banner',
          start: 'top 80%',
          once: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const activeTheme: 'dark' | 'light' = !mounted || resolvedTheme === 'dark' ? 'dark' : 'light';
  const heroFeatured = featuredProjects[0];

  const availabilityLabel =
    settings.availabilityStatus === 'AVAILABLE'
      ? 'Available for new engineering builds'
      : settings.availabilityStatus === 'BUSY_HACKATHON'
        ? 'Currently shipping at a live hackathon'
        : null;

  return (
    <div ref={rootRef} className="w-full">
      {/* ===================================================================== */}
      {/* 1. INTERACTIVE 3D LIQUID HERO (Matching Screenshots 1 & 3)            */}
      {/* ===================================================================== */}
      <section className="relative flex min-h-[calc(100vh-74px)] flex-col justify-between overflow-hidden px-5 pb-10 pt-6 md:px-8 md:pb-12">
        {settings.enable3DHero && <LiquidCrossHero theme={activeTheme} />}

        {/* Middle Row: 3 Capability Columns + Centered Stacked Wordmark + Projects Pill */}
        <div className="relative z-10 my-auto grid grid-cols-1 items-center gap-8 py-10 md:grid-cols-12 md:py-16">
          {/* Left 2 capability columns */}
          <div className="order-2 grid grid-cols-2 gap-6 text-sm leading-snug text-[#09090B] md:order-1 md:col-span-4 dark:text-white">
            <ul className="space-y-1 font-medium">
              <li>ai &amp; vision</li>
              <li>systems</li>
              <li>architecture</li>
            </ul>
            <ul className="space-y-1 font-medium">
              <li>full-stack</li>
              <li>android</li>
              <li>webgl 3d</li>
            </ul>
          </div>

          {/* Center Stacked Editorial Wordmark over 3D Sculptural Cross */}
          <div className="order-1 flex flex-col items-center justify-center text-center md:order-2 md:col-span-4">
            <h1 className="tb-display select-none text-[clamp(4.5rem,11vw,8.75rem)] font-bold leading-[0.82] tracking-[-0.06em] text-[#09090B] dark:text-white">
              <span className="block">turbo</span>
              <span className="block">bits</span>
            </h1>
          </div>

          {/* Right capability column + to Projects pill */}
          <div className="order-3 flex items-center justify-between gap-4 md:col-span-4 md:justify-end md:gap-10">
            <ul className="space-y-1 text-sm font-medium leading-snug text-[#09090B] dark:text-white">
              <li>robotics</li>
              <li>cloud</li>
              <li>hardware</li>
            </ul>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-black/20 bg-[#F4F4F0]/80 px-5 py-2.5 text-xs font-medium text-[#09090B] transition-colors hover:border-[#0033FF] hover:text-[#0033FF] dark:border-white/25 dark:bg-black/75 dark:text-white"
            >
              <span>to Projects</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Row: 4 Dynamic Stat Tiles + Intro Copy + Action Pills */}
        <div className="relative z-10 mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            {/* 4 Rounded Stat Tiles computed live from TiDB/Store */}
            <div className="grid max-w-md grid-cols-4 gap-2.5">
              {[
                { value: `${stats.projectsCount}+`, label: 'Projects' },
                { value: `${stats.buildersCount}`, label: 'Builders' },
                { value: `${stats.hackathonsCount}`, label: 'Hackathons' },
                { value: `${stats.achievementsCount}+`, label: 'Awards' },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-2xl border border-black/5 bg-[#EAEAE5] px-3 py-4 text-center dark:border-white/8 dark:bg-[#141416]"
                >
                  <p className="tb-display tb-tabular text-xl font-semibold sm:text-2xl">
                    {tile.value}
                  </p>
                  <p className="mt-1 text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                    {tile.label}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#09090B] sm:text-base dark:text-white/90">
              {settings.heroSubtext}
            </p>

            <a
              href="#about"
              className="mt-3 inline-block text-xs text-[#52525B] underline underline-offset-4 transition-colors hover:text-[#0033FF] dark:text-[#8E8E93]"
            >
              more about us
            </a>

            {/* Bottom Action Pills (Cobalt Blue primary CTA) */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {settings.showFeed && (
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-black/15 bg-[#F4F4F0]/90 px-4 py-2 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20 dark:bg-black/80"
                >
                  <span className="rounded-full bg-[#0033FF] px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                    NEW
                  </span>
                  <span>Live Studio Feed</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
              {settings.showHackathons && (
                <Link
                  href="/hackathons"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/15 px-4 py-2 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
                >
                  <span>Hackathons</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
              {settings.showTeam && (
                <Link
                  href="/team"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/15 px-4 py-2 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
                >
                  <span>Squad &amp; Awards</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#0033FF] px-5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <span>Get in touch</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:col-span-5 lg:items-end">
            {availabilityLabel && (
              <div className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-[#EAEAE5] px-4 py-2 text-xs text-[#52525B] dark:border-white/12 dark:bg-[#141416] dark:text-[#8E8E93]">
                <span className="h-2 w-2 rounded-full bg-[#0033FF]" aria-hidden="true" />
                <span className="font-medium text-[#09090B] dark:text-white">{availabilityLabel}</span>
              </div>
            )}
            <p className="font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
              Move cursor across 3D node to ripple · {settings.heroTagline}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. ABOUT & LIQUID 3D SPHERE BENTO GRID (Matching Screenshot 5)        */}
      {/* ===================================================================== */}
      <section id="about" className="px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left Column: Tall Headline Card + Studio Capabilities Card */}
          <div className="flex flex-col gap-5 lg:col-span-6">
            <div className="flex min-h-[380px] flex-col justify-between rounded-[28px] border border-black/10 bg-[#F4F4F0] p-8 md:p-11 dark:border-white/12 dark:bg-[#0B0B0D]">
              <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">About us</p>
              <h2 className="tb-display mt-8 text-[clamp(3.1rem,6.4vw,5.75rem)] font-semibold leading-[0.94]">
                <span className="block">We build</span>
                <span className="block">digital</span>
                <span className="block">systems.</span>
              </h2>
            </div>

            <div className="rounded-[28px] border border-black/10 bg-[#EAEAE5] p-8 md:p-10 dark:border-white/12 dark:bg-[#0B0B0D]">
              <p className="text-sm leading-relaxed text-[#09090B] sm:text-base dark:text-white/90">
                We combine Swiss-editorial craft with deep systems engineering. Across Next.js,
                TiDB MySQL, Kotlin Jetpack Compose, PyTorch TensorRT, Three.js, and custom STM32
                hardware—TurboBits ships tools and platforms designed to survive real-world load.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-black/10 pt-5 font-mono text-xs text-[#52525B] dark:border-white/10 dark:text-[#8E8E93]">
                <span>Full-Stack &amp; Cloud</span>
                <span>·</span>
                <span>Edge AI &amp; Vision</span>
                <span>·</span>
                <span>Android &amp; Robotics</span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Card + Interactive 3D Liquid Sphere Card */}
          <div className="flex flex-col gap-5 lg:col-span-6">
            <div className="rounded-[28px] border border-black/10 bg-[#EAEAE5] p-8 md:p-10 dark:border-white/12 dark:bg-[#0B0B0D]">
              <p className="text-sm leading-relaxed text-[#09090B] sm:text-base dark:text-white/90">
                Born on national hackathon floors and refined into a full-scale engineering studio,
                TurboBits unites five specialized builders under one unified architecture—from
                downloadable field APKs and Gerber files to real-time browser simulations.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-[28px] border border-black/10 bg-[#EAEAE5] p-8 md:p-10 dark:border-white/12 dark:bg-[#0B0B0D]">
              <div className="relative h-[300px] w-full sm:h-[340px]">
                <LiquidBentoSphere theme={activeTheme} />
              </div>
              <div className="mt-4">
                <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Specialty</p>
                <h3 className="tb-display mt-1 text-3xl font-semibold sm:text-4xl">
                  3D &amp; Interactive Web.
                </h3>
                <p className="mt-2 max-w-md text-sm text-[#52525B] dark:text-[#8E8E93]">
                  Procedural WebGL scenes and custom GLSL displacement shaders rendered live in the
                  browser without bloated external model payloads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. FEATURED PROJECT SHOWCASE BANNER (Matching Screenshot 6)           */}
      {/* ===================================================================== */}
      {heroFeatured && (
        <section className="tb-showcase-banner px-5 py-10 md:px-8 md:py-16">
          <div className="overflow-hidden rounded-[28px] border border-black/15 bg-[#EAEAE5] p-7 md:p-12 dark:border-white/15 dark:bg-[#0B0B0D]">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              {/* Left Info + 3 Rounded Metric Tiles + Pill CTA */}
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#09090B] px-3 py-1 font-mono text-[11px] font-semibold text-white dark:bg-white dark:text-[#09090B]">
                    NEW
                  </span>
                  <span className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Featured Studio Build
                  </span>
                </div>

                <h2 className="tb-display mt-6 text-4xl font-semibold leading-[1.02] sm:text-5xl">
                  {heroFeatured.title}.
                  <span className="block text-[#52525B] dark:text-[#8E8E93]">
                    Built for 4.2ms edge speed.
                  </span>
                </h2>

                <p className="mt-5 text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                  {heroFeatured.summary}
                </p>

                <div className="mt-7 grid grid-cols-3 gap-2.5">
                  {[
                    { val: '4.2 ms', sub: 'INT8 latency' },
                    { val: '60 FPS', sub: 'live telemetry' },
                    { val: '1st Place', sub: 'SIH National' },
                  ].map((m) => (
                    <div
                      key={m.sub}
                      className="rounded-2xl border border-black/10 bg-[#F4F4F0] px-3 py-4 text-center dark:border-white/10 dark:bg-[#141416]"
                    >
                      <p className="tb-display tb-tabular text-lg font-semibold sm:text-xl">
                        {m.val}
                      </p>
                      <p className="mt-1 text-[11px] text-[#52525B] dark:text-[#8E8E93]">{m.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/projects/${heroFeatured.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#09090B] px-6 py-3 text-xs font-medium text-white transition-colors hover:bg-[#0033FF] dark:bg-white dark:text-[#09090B] dark:hover:bg-[#0033FF] dark:hover:text-white"
                  >
                    <span>Open Project Dashboard</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-3 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
                  >
                    <span>All {stats.projectsCount} Projects</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right: Fanned / Angled Interactive Project Mockup Window Cards */}
              <div className="relative flex min-h-[340px] items-center justify-center lg:col-span-7">
                <div className="relative grid w-full max-w-2xl grid-cols-3 items-center gap-3 sm:gap-0">
                  {featuredProjects.slice(0, 3).map((proj, idx) => {
                    const fanStyles =
                      idx === 0
                        ? '-rotate-6 translate-y-4 z-10 hover:z-30 hover:-translate-y-1'
                        : idx === 1
                          ? 'scale-105 z-20 hover:z-30 hover:-translate-y-2'
                          : 'rotate-6 translate-y-4 z-10 hover:z-30 hover:-translate-y-1';

                    return (
                      <Link
                        key={proj.id}
                        href={`/projects/${proj.slug}`}
                        className={`tb-fan-card group block overflow-hidden rounded-2xl border border-black/15 bg-white shadow-2xl transition-transform duration-300 dark:border-white/15 dark:bg-[#141416] ${fanStyles}`}
                      >
                        {/* Browser/App chrome bar */}
                        <div className="flex items-center justify-between border-b border-black/10 px-3 py-2 dark:border-white/10">
                          <div className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-black/20 dark:bg-white/25" />
                            <span className="h-2 w-2 rounded-full bg-black/15 dark:bg-white/15" />
                            <span className="h-2 w-2 rounded-full bg-[#0033FF]" />
                          </div>
                          <span className="truncate font-mono text-[9px] text-[#52525B] dark:text-[#8E8E93]">
                            turbobits.in/{proj.slug.slice(0, 12)}
                          </span>
                        </div>
                        <div className="aspect-[4/3] w-full overflow-hidden">
                          <SafeImage
                            src={proj.coverImageUrl}
                            alt={proj.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3.5">
                          <p className="font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
                            {proj.category.replace('_', ' / ')} · {proj.projectDate}
                          </p>
                          <p className="mt-1 truncate font-display text-sm font-semibold text-[#09090B] dark:text-white">
                            {proj.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#52525B] dark:text-[#8E8E93]">
                            {proj.tagline}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 4. LATEST FROM THE STUDIO / FEED PREVIEW (Matching Screenshot 4)      */}
      {/* ===================================================================== */}
      {settings.showFeed && latestPosts.length > 0 && (
        <section className="px-5 py-16 md:px-8 md:py-24">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Insights</p>
              <h2 className="tb-display mt-3 text-[clamp(2.8rem,6.2vw,5.4rem)] font-semibold leading-[0.95]">
                <span className="block">Built in</span>
                <span className="block">the Studio.</span>
              </h2>
            </div>

            <Link
              href="/feed"
              className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium transition-colors hover:border-[#0033FF] hover:text-[#0033FF] dark:border-white/20"
            >
              <span>all posts</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {latestPosts.slice(0, 3).map((post) => (
              <Link key={post.id} href={`/feed/${post.id}`} className="group block">
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-black/10 bg-[#EAEAE5] dark:border-white/10 dark:bg-[#141416]">
                  <SafeImage
                    src={post.mediaUrlsJson[0] || '/images/feed-typography-card.jpg'}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/20 transition-colors group-hover:border-[#0033FF] group-hover:bg-[#0033FF] group-hover:text-white dark:border-white/25">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#09090B] transition-colors group-hover:text-[#0033FF] dark:text-white">
                      {post.title}
                    </h3>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    {POST_TYPE_LABELS[post.postType] || post.postType}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 5. SQUAD STRIP & SERVICES CTA                                         */}
      {/* ===================================================================== */}
      {settings.showTeam && members.length > 0 && (
        <section className="px-5 pb-24 pt-8 md:px-8">
          <div className="flex flex-col justify-between gap-4 border-t border-black/10 pt-14 sm:flex-row sm:items-end dark:border-white/12">
            <div>
              <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">The Squad</p>
              <h2 className="tb-display mt-2 text-3xl font-semibold sm:text-5xl">
                Five builders. Modular portfolios.
              </h2>
            </div>
            <Link
              href="/team"
              className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
            >
              <span>Team &amp; Hall of Fame</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {members.map((member) => (
              <Link
                key={member.id}
                href={`/${member.username}`}
                className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-[#EAEAE5] p-5 transition-colors hover:border-[#0033FF] dark:border-white/12 dark:bg-[#0B0B0D]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white font-display text-xs font-bold text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white">
                      {member.avatarUrl ? (
                        <SafeImage
                          src={member.avatarUrl}
                          alt={member.fullName}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(member.fullName)
                      )}
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[#52525B] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0033FF] dark:text-[#8E8E93]" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold">{member.fullName}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                    {member.headline}
                  </p>
                </div>
                <p className="mt-5 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                  /{member.username}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
