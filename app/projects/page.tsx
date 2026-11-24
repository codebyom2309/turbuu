import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ProjectsVaultClient from '@/components/projects/ProjectsVaultClient';
import { getSiteSettings, listHackathons, listProjects } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Project Vault',
  description:
    'Explore the TurboBits engineering vault — full-stack platforms, hardware-software robotics, AI agents, mobile tools, and hackathon prototypes.',
};

export default function ProjectsPage() {
  const settings = getSiteSettings();
  const projects = listProjects({ scope: 'ALL' });
  const hackathons = listHackathons().map((h) => ({ id: h.id, name: h.name }));

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#09090B] transition-colors dark:bg-black dark:text-white">
      <SiteHeader settings={settings} />
      <main className="pt-24 min-h-[calc(100vh-200px)]">
        <ProjectsVaultClient projects={projects} hackathons={hackathons} />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
