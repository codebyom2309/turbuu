'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteSettingRecord } from '@/lib/types';

interface SiteFooterProps {
  settings: SiteSettingRecord;
}

export default function SiteFooter({ settings }: SiteFooterProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not subscribe');
      } else {
        setSubscribed(true);
        setEmail('');
        toast.success('Subscribed to TurboBits release dispatches.');
      }
    } catch {
      toast.error('Network error while subscribing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-black/10 bg-[#F4F4F0] text-[#09090B] dark:border-white/12 dark:bg-black dark:text-white">
      <div className="tb-gridlines mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="tb-display inline-block text-5xl font-bold leading-[0.88] sm:text-6xl">
              <span className="block">turbo</span>
              <span className="block">bits</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
              {settings.heroSubtext}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <span>Start a build</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium transition-colors hover:border-[#0033FF] hover:text-[#0033FF] dark:border-white/20"
              >
                <span>Member Studio</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-4">
            <div>
              <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Platform</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/projects" className="hover:text-[#0033FF]">
                    Projects Vault
                  </Link>
                </li>
                {settings.showHackathons && (
                  <li>
                    <Link href="/hackathons" className="hover:text-[#0033FF]">
                      Hackathons
                    </Link>
                  </li>
                )}
                {settings.showFeed && (
                  <li>
                    <Link href="/feed" className="hover:text-[#0033FF]">
                      Live Feed
                    </Link>
                  </li>
                )}
                {settings.showTeam && (
                  <li>
                    <Link href="/team" className="hover:text-[#0033FF]">
                      Team &amp; Hall of Fame
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Studio</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {settings.showServices && (
                  <li>
                    <Link href="/services" className="hover:text-[#0033FF]">
                      Services
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/contact" className="hover:text-[#0033FF]">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/studio" className="hover:text-[#0033FF]">
                    Member Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Portfolios</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/om_satange" className="hover:text-[#0033FF]">
                    Om Satange
                  </Link>
                </li>
                <li>
                  <Link href="/aarav_deshmukh" className="hover:text-[#0033FF]">
                    Aarav Deshmukh
                  </Link>
                </li>
                <li>
                  <Link href="/priya_nair" className="hover:text-[#0033FF]">
                    Priya Nair
                  </Link>
                </li>
                <li>
                  <Link href="/rohan_kulkarni" className="hover:text-[#0033FF]">
                    Rohan Kulkarni
                  </Link>
                </li>
                <li>
                  <Link href="/neha_sharma" className="hover:text-[#0033FF]">
                    Neha Sharma
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Release Dispatches</p>
            <p className="mt-3 text-sm text-[#52525B] dark:text-[#8E8E93]">
              Get notified when TurboBits ships new open-source hardware, APKs, or engineering write-ups.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex items-center gap-2">
              <label htmlFor="footer-subscribe-email" className="sr-only">
                Email address for release dispatches
              </label>
              <input
                id="footer-subscribe-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-full border border-black/15 bg-white px-4 py-2.5 text-xs text-[#09090B] placeholder:text-[#8E8E93] dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
              />
              <button
                type="submit"
                disabled={submitting}
                aria-label="Subscribe to updates"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#09090B] text-white transition-colors hover:bg-[#0033FF] disabled:opacity-50 dark:bg-white dark:text-[#09090B] dark:hover:bg-[#0033FF] dark:hover:text-white"
              >
                {subscribed ? <Check className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6 text-xs text-[#52525B] dark:border-white/10 dark:text-[#8E8E93]">
          <p>© {new Date().getFullYear()} TurboBits Engineering Studio (turbobits.in). All rights reserved.</p>
          <a href={`mailto:${settings.contactEmail}`} className="hover:text-[#0033FF]">
            {settings.contactEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
