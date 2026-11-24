'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ArrowUpRight,
  Award,
  Briefcase,
  FolderGit2,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Newspaper,
  Settings,
  Shield,
  Sun,
  Trophy,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { MemberRecord } from '@/lib/types';

interface StudioShellProps {
  member: MemberRecord;
  children: React.ReactNode;
}

export default function StudioShell({ member, children }: StudioShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const memberLinks = [
    { href: '/studio', label: 'Overview & Quick-Post', icon: LayoutDashboard },
    { href: '/studio/projects', label: 'Projects & Files', icon: FolderGit2 },
    { href: '/studio/hackathons', label: 'Hackathons', icon: Trophy },
    { href: '/studio/feed', label: 'Live Feed', icon: Newspaper },
    { href: '/studio/achievements', label: 'Achievements', icon: Award },
    { href: '/studio/profile', label: 'Profile Builder', icon: UserCircle },
  ];

  const adminLinks = [
    { href: '/studio/admin/settings', label: 'Live Site Settings', icon: Settings },
    { href: '/studio/admin/members', label: 'Member Whitelist', icon: Users },
    { href: '/studio/admin/services', label: 'Services Editor', icon: Briefcase },
    { href: '/studio/admin/inquiries', label: 'Client CRM Inbox', icon: Inbox },
  ];

  const handleSignOut = async () => {
    await fetch('/api/v1/auth/session', { method: 'DELETE' });
    toast.success('Signed out of TurboBits Studio');
    router.push('/studio/login');
    router.refresh();
  };

  const renderNav = () => (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-black/10 pb-5 dark:border-white/10">
          <Link href="/studio" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/15 font-display text-sm font-bold tracking-[-0.06em] dark:border-white/20">
              tb
            </span>
            <div>
              <p className="font-display text-sm font-semibold leading-none">TurboBits Studio</p>
              <p className="mt-1 font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
                {member.role === 'ADMIN' ? 'Admin Control' : 'Member Workspace'}
              </p>
            </div>
          </Link>
        </div>

        <nav className="mt-6 space-y-6" aria-label="Studio navigation">
          <div>
            <p className="px-3 font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
              Member Workspace
            </p>
            <ul className="mt-2 space-y-1">
              {memberLinks.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === '/studio'
                    ? pathname === '/studio'
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#0033FF] text-white'
                          : 'text-[#09090B] hover:bg-black/5 dark:text-white/85 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {member.role === 'ADMIN' && (
            <div>
              <p className="flex items-center gap-1.5 px-3 font-mono text-[10px] text-[#0033FF]">
                <Shield className="h-3 w-3" />
                <span>Admin Control Center</span>
              </p>
              <ul className="mt-2 space-y-1">
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-[#0033FF] text-white'
                            : 'text-[#09090B] hover:bg-black/5 dark:text-white/85 dark:hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>
      </div>

      <div className="space-y-3 border-t border-black/10 pt-5 dark:border-white/10">
        <div className="rounded-xl border border-black/10 bg-[#F4F4F0] p-3 dark:border-white/10 dark:bg-[#141416]">
          <p className="truncate font-display text-xs font-semibold">{member.fullName}</p>
          <p className="truncate font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
            {member.email}
          </p>
          <Link
            href={`/${member.username}`}
            className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-[#0033FF] hover:underline"
          >
            <span>Live /{member.username}</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/15 px-3 py-2 text-xs font-medium hover:border-[#0033FF] dark:border-white/15"
          >
            <span>Public Site</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle color theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 hover:border-[#0033FF] dark:border-white/15"
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 hover:border-red-500 hover:text-red-500 dark:border-white/15"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#09090B] dark:bg-black dark:text-white">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 lg:hidden dark:border-white/12">
        <Link href="/studio" className="font-display text-sm font-bold">
          TurboBits Studio
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle studio menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 dark:border-white/15"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside
            className="h-full w-72 overflow-y-auto border-r border-black/10 bg-[#EAEAE5] p-5 dark:border-white/12 dark:bg-[#0B0B0D]"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNav()}
          </aside>
        </div>
      )}

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-68 shrink-0 overflow-y-auto border-r border-black/10 bg-[#EAEAE5] p-5 lg:block dark:border-white/12 dark:bg-[#0B0B0D]">
          {renderNav()}
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
