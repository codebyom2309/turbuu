import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ContactFormClient from '@/components/contact/ContactFormClient';
import { getSiteSettings, listServices } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Start a Build · Contact',
  description:
    'Inquire about engineering collaborations, high-performance web systems, 3D interactive web experiences, and mobile solutions.',
};

export default function ContactPage() {
  const settings = getSiteSettings();
  const services = listServices();

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#09090B] transition-colors dark:bg-black dark:text-white">
      <SiteHeader settings={settings} />
      <main className="pt-24 min-h-[calc(100vh-200px)]">
        <ContactFormClient services={services} contactEmail={settings.contactEmail} />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
