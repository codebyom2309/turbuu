import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Wrench } from 'lucide-react';
import { getSiteSettings } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export default function MaintenancePage() {
  const settings = getSiteSettings();

  return (
    <main className="tb-gridlines flex min-h-screen flex-col items-center justify-center bg-[#F4F4F0] px-6 py-20 text-[#09090B] dark:bg-black dark:text-white">
      <div className="w-full max-w-xl rounded-[28px] border border-black/10 bg-[#EAEAE5] p-8 md:p-12 dark:border-white/12 dark:bg-[#0B0B0D]">
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/15 font-display text-sm font-bold tracking-[-0.06em] dark:border-white/20">
            tb
          </span>
          <Wrench className="h-5 w-5 text-[#0033FF]" />
        </div>

        <h1 className="tb-display mt-8 text-4xl font-semibold sm:text-5xl">
          Scheduled studio maintenance.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
          TurboBits ({settings.contactEmail}) is currently deploying updates to the showcase and
          database cluster. Public routes will return shortly.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {!settings.maintenanceMode && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-5 py-2.5 text-xs font-medium text-white"
            >
              <span>Return to Home</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Authorized Member Studio</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
