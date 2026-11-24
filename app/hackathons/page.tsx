import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Calendar, MapPin, Trophy } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import SafeImage from '@/components/ui/SafeImage';
import { getSiteSettings, listHackathons } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hackathons & Sprints',
  description:
    'Competitive hackathons, championships, national hackathons, and high-intensity build sprints won and attended by the TurboBits collective.',
};

export default function HackathonsPage() {
  const settings = getSiteSettings();
  const hackathons = listHackathons();

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#09090B] transition-colors dark:bg-black dark:text-white">
      <SiteHeader settings={settings} />
      <main className="pt-24 min-h-[calc(100vh-200px)] px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="border-b border-black/10 pb-12 dark:border-white/12">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">High-Intensity Sprints</p>
            <h1 className="tb-display mt-3 text-[clamp(2.5rem,6.5vw,5.5rem)] font-semibold leading-[0.93]">
              Hackathons &amp; Arenas
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#52525B] md:text-base dark:text-[#8E8E93]">
              Where our teams prototype at 100x speed under 36-hour deadlines, win top podium finishes, and turn rough ideas into ship-ready software.
            </p>
          </div>

          <div className="mt-12 space-y-8">
            {hackathons.map((hackathon) => (
              <div
                key={hackathon.id}
                className="grid gap-6 rounded-3xl border border-black/10 bg-[#EAEAE5] p-6 transition-all hover:border-[#0033FF] lg:grid-cols-12 md:p-8 dark:border-white/12 dark:bg-[#0B0B0D]"
              >
                {hackathon.coverImageUrl && (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-2xl lg:col-span-5">
                    <SafeImage
                      src={hackathon.coverImageUrl}
                      alt={hackathon.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className={`${hackathon.coverImageUrl ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col justify-between`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0033FF]/10 px-3 py-1 font-mono text-xs font-semibold text-[#0033FF] dark:bg-[#0033FF]/20">
                        <Trophy className="h-3.5 w-3.5" />
                        <span>{hackathon.result}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-[#52525B] dark:border-white/10 dark:text-[#8E8E93]">
                        <Calendar className="h-3 w-3" />
                        <span>{hackathon.date}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-[#52525B] dark:border-white/10 dark:text-[#8E8E93]">
                        <MapPin className="h-3 w-3" />
                        <span>{hackathon.location}</span>
                      </span>
                    </div>

                    <h2 className="tb-display mt-4 text-2xl font-bold tracking-tight md:text-3xl">
                      {hackathon.name}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                      Organized by {hackathon.organizer}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-[#52525B] md:text-base dark:text-[#8E8E93]">
                      {hackathon.summary}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-black/10 pt-5 dark:border-white/10">
                    <Link
                      href={`/projects?hackathon=${hackathon.id}`}
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#0033FF] hover:underline"
                    >
                      <span>Explore projects built at {hackathon.name}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
