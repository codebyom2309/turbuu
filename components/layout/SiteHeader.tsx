'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, Mail, ShieldCheck, X } from 'lucide-react';
import type { SiteSettingRecord } from '@/lib/types';

interface SiteHeaderProps {
  settings: SiteSettingRecord;
}

export default function SiteHeader({ settings }: SiteHeaderProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) return;

    const handleMove = (e: PointerEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const handleLeave = () => setCursorPos(null);
    window.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const isDark = !mounted || resolvedTheme === 'dark';

  const navItems = [
    { href: '/', label: 'Home', meta: '01', visible: true },
    { href: '/projects', label: 'Projects', meta: '02', visible: true },
    { href: '/hackathons', label: 'Hackathons', meta: '03', visible: settings.showHackathons },
    { href: '/feed', label: 'Live Feed', meta: '04', visible: settings.showFeed },
    { href: '/team', label: 'Team & Hall of Fame', meta: '05', visible: settings.showTeam },
    { href: '/services', label: 'Services', meta: '06', visible: settings.showServices },
    { href: '/contact', label: 'Contact', meta: '07', visible: true },
  ].filter((item) => item.visible);

  return (
    <>
      {/* Subtle Cobalt Blue custom cursor dot (matching reference screenshots) */}
      {cursorPos && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-2.5 w-2.5 rounded-full bg-[#0033FF] transition-transform duration-75 ease-out md:block"
          style={{
            transform: `translate3d(${cursorPos.x - 5}px, ${cursorPos.y - 5}px, 0)`,
          }}
        />
      )}

      {/* Dynamic Live Announcement Bar controlled by Admin SiteSetting */}
      {settings.announcementActive && settings.announcementText && (
        <div
          data-testid="live-announcement-bar"
          className="relative z-50 border-b border-black/10 bg-[#0033FF] px-4 py-2 text-center text-xs font-medium text-white"
        >
          <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2">
            {settings.announcementLink ? (
              <Link
                href={settings.announcementLink}
                className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
              >
                <span>{settings.announcementText}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
              </Link>
            ) : (
              <span>{settings.announcementText}</span>
            )}
          </div>
        </div>
      )}

      {/* Persistent 3-Zone Swiss Editorial Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#F4F4F0]/90 backdrop-blur-none transition-colors dark:bg-black/90">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 md:px-8">
          {/* Zone 1: Minimal TB Geometric Monogram */}
          <Link
            href="/"
            aria-label="TurboBits Home"
            className="group inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[#09090B] dark:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/15 font-display text-sm font-bold tracking-[-0.06em] transition-colors group-hover:border-[#0033FF] group-hover:text-[#0033FF] dark:border-white/20">
              tb
            </span>
          </Link>

          {/* Zone 2: Centered Floating [ darkmode | lightmode ] Pill Toggle */}
          <div
            role="group"
            aria-label="Color theme mode"
            className="inline-flex shrink-0 items-center rounded-full border border-black/10 bg-[#EAEAE5] p-1 text-xs font-medium dark:border-white/15 dark:bg-[#141416]"
          >
            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-pressed={isDark}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors ${
                isDark
                  ? 'bg-white text-[#09090B] shadow-xs'
                  : 'text-[#52525B] hover:text-[#09090B] dark:text-[#8E8E93] dark:hover:text-white'
              }`}
            >
              darkmode
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-pressed={!isDark}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors ${
                !isDark
                  ? 'bg-[#09090B] text-white shadow-xs'
                  : 'text-[#52525B] hover:text-[#09090B] dark:text-[#8E8E93] dark:hover:text-white'
              }`}
            >
              lightmode
            </button>
          </div>

          {/* Zone 3: Quick-contact icon, Get in touch pill, Menu ↙ pill */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/contact"
              aria-label="Quick contact"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/15 text-[#09090B] transition-colors hover:border-[#0033FF] hover:text-[#0033FF] sm:inline-flex dark:border-white/20 dark:text-white"
            >
              <Mail className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="hidden whitespace-nowrap rounded-full border border-black/15 px-4 py-2 text-xs font-medium text-[#09090B] transition-colors hover:border-[#0033FF] hover:text-[#0033FF] md:inline-flex dark:border-white/20 dark:text-white"
            >
              Get in touch
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-[#EAEAE5] px-4 text-xs font-medium text-[#09090B] transition-colors hover:border-[#0033FF] dark:border-white/15 dark:bg-[#141416] dark:text-white"
            >
              <span>{menuOpen ? 'Close' : 'Menu'}</span>
              {menuOpen ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownLeft className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Animated Editorial Navigation Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#F4F4F0] text-[#09090B] dark:bg-black dark:text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="tb-gridlines mx-auto flex min-h-screen max-w-[1440px] flex-col justify-between px-5 py-6 md:px-8">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/15 font-display text-sm font-bold tracking-[-0.06em] dark:border-white/20"
                >
                  tb
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-black/15 px-4 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
                >
                  <span>Close</span>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="my-10 grid gap-10 lg:grid-cols-12">
                <nav className="lg:col-span-8" aria-label="Primary pages">
                  <ul className="divide-y divide-black/10 border-y border-black/10 dark:divide-white/10 dark:border-white/10">
                    {navItems.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="group flex items-center justify-between py-5 transition-colors hover:text-[#0033FF]"
                          >
                            <div className="flex items-baseline gap-5">
                              <span className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                                {item.meta}
                              </span>
                              <span className="tb-display text-3xl font-semibold sm:text-5xl">
                                {item.label}
                              </span>
                              {active && (
                                <span className="h-2 w-2 rounded-full bg-[#0033FF]" aria-hidden="true" />
                              )}
                            </div>
                            <ArrowUpRight className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="flex flex-col justify-between gap-8 lg:col-span-4 lg:pl-8">
                  <div className="rounded-3xl border border-black/10 bg-[#EAEAE5] p-6 dark:border-white/12 dark:bg-[#0B0B0D]">
                    <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                      Private Workspace
                    </p>
                    <h2 className="tb-display mt-2 text-2xl font-semibold">
                      Member Studio &amp; Control Center
                    </h2>
                    <p className="mt-2 text-sm text-[#52525B] dark:text-[#8E8E93]">
                      Authorized TurboBits engineers sign in to publish builds, manage Filebase
                      downloads, edit portfolios, and toggle live site flags.
                    </p>
                    <Link
                      href="/studio"
                      onClick={() => setMenuOpen(false)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Open Member Studio</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-2 text-sm text-[#52525B] dark:text-[#8E8E93]">
                    <p className="font-mono text-xs">Direct Engineering Desk</p>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="block text-base font-medium text-[#09090B] underline-offset-4 hover:underline dark:text-white"
                    >
                      {settings.contactEmail}
                    </a>
                    <p className="text-xs">Pune &amp; Bengaluru · Building for global teams</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-5 text-xs text-[#52525B] dark:border-white/10 dark:text-[#8E8E93]">
                <span>TurboBits (turbobits.in)</span>
                <div className="flex items-center gap-5">
                  <Link href="/om_satange" onClick={() => setMenuOpen(false)} className="hover:text-[#0033FF]">
                    /om_satange
                  </Link>
                  <Link href="/aarav_deshmukh" onClick={() => setMenuOpen(false)} className="hover:text-[#0033FF]">
                    /aarav_deshmukh
                  </Link>
                  <Link href="/priya_nair" onClick={() => setMenuOpen(false)} className="hover:text-[#0033FF]">
                    /priya_nair
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
