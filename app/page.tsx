import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import HomeShowcase from '@/components/home/HomeShowcase';
import {
  getSiteSettings,
  getStudioStats,
  listFeedPosts,
  listMembers,
  listProjects,
} from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const settings = getSiteSettings();
  const stats = getStudioStats();
  const featuredProjects = listProjects({ featuredOnly: true });
  const latestPosts = listFeedPosts({ limit: 4 });
  const members = listMembers({ onlyVisible: true });

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#09090B] transition-colors dark:bg-black dark:text-white">
      <SiteHeader settings={settings} />
      <main>
        <HomeShowcase
          settings={settings}
          stats={stats}
          featuredProjects={featuredProjects}
          latestPosts={latestPosts}
          members={members}
        />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
