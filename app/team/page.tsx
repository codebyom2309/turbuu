import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import TeamHallOfFameClient from '@/components/team/TeamHallOfFameClient';
import { getSiteSettings, listAchievements, listMembers } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Team & Hall of Fame',
  description:
    'Meet the core builders, engineers, and designers behind TurboBits and explore our verified competitive hackathon awards and achievements.',
};

export default function TeamPage() {
  const settings = getSiteSettings();
  const members = listMembers({ onlyVisible: true });
  const achievements = listAchievements();

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#09090B] transition-colors dark:bg-black dark:text-white">
      <SiteHeader settings={settings} />
      <main className="pt-20 min-h-[calc(100vh-200px)]">
        <TeamHallOfFameClient
          members={members}
          achievements={achievements}
          showAchievements={settings.showAchievements}
        />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
