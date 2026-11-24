import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import FeedTimelineClient from '@/components/feed/FeedTimelineClient';
import { getSiteSettings, listFeedPosts } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live Studio Feed',
  description:
    'Real-time engineering dispatches, hackathon sprints, devlogs, awards, and project releases directly from TurboBits builders.',
};

export default function FeedPage() {
  const settings = getSiteSettings();
  const posts = listFeedPosts();

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#09090B] transition-colors dark:bg-black dark:text-white">
      <SiteHeader settings={settings} />
      <main className="pt-24 min-h-[calc(100vh-200px)]">
        <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
          <div className="mb-10 border-b border-black/10 pb-8 dark:border-white/12">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Dispatches &amp; Activity</p>
            <h1 className="tb-display mt-2 text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.95]">
              Live Studio Feed
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
              Chronological build logs, hackathon submissions, awards, and release notes from the collective.
            </p>
          </div>
          <FeedTimelineClient initialPosts={posts} />
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
