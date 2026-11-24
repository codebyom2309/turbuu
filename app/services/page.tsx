import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { getSiteSettings, listServices } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services & Capabilities',
  description:
    'Explore TurboBits capabilities across interactive 3D web platforms, AI systems, mobile engineering, and high-performance cloud infrastructure.',
};

export default function ServicesPage() {
  const settings = getSiteSettings();
  const services = listServices();

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#09090B] transition-colors dark:bg-black dark:text-white">
      <SiteHeader settings={settings} />
      <main className="pt-24 min-h-[calc(100vh-200px)] px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="border-b border-black/10 pb-12 dark:border-white/12">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Studio Capabilities</p>
            <h1 className="tb-display mt-3 text-[clamp(2.5rem,6.5vw,5.5rem)] font-semibold leading-[0.93]">
              Engineering Offerings
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#52525B] md:text-base dark:text-[#8E8E93]">
              We build custom software, interactive 3D graphics, robust backend systems, and edge ML pipelines for forward-thinking products.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {services.map((service, idx) => (
              <div
                key={service.id}
                className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-[#EAEAE5] p-6 transition-all hover:border-[#0033FF] md:p-8 dark:border-white/12 dark:bg-[#0B0B0D]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                      0{idx + 1} // SERVICE
                    </span>
                    <span className="font-mono text-xs font-medium text-[#0033FF]">
                      {service.startingPriceLabel}
                    </span>
                  </div>

                  <h2 className="tb-display mt-4 text-2xl font-bold tracking-tight md:text-3xl">
                    {service.title}
                  </h2>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#52525B] dark:text-[#8E8E93]">
                    {service.tagline}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                    {service.description}
                  </p>

                  <div className="mt-6 border-t border-black/10 pt-5 dark:border-white/10">
                    <p className="font-mono text-[11px] font-medium text-[#09090B] dark:text-white">
                      Key Deliverables
                    </p>
                    <ul className="mt-3 space-y-2">
                      {service.deliverablesJson.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#52525B] dark:text-[#8E8E93]">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0033FF]" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-5 dark:border-white/10">
                  <span className="font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                    Est. {service.turnaroundLabel}
                  </span>
                  <Link
                    href={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0033FF] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <span>Inquire this build</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
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
