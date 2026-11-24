'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowUpRight,
  Award,
  CheckCircle2,
  FolderGit2,
  Inbox,
  Layers,
  Newspaper,
  Plus,
  Send,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import StudioShell from '@/components/studio/StudioShell';
import type { MemberRecord, SiteSettingRecord } from '@/lib/types';

interface StudioOverviewData {
  member: MemberRecord;
  stats: {
    projectsCount: number;
    teamProjectsCount: number;
    buildersCount: number;
    hackathonsCount: number;
    achievementsCount: number;
    feedPostsCount: number;
    downloadsTotal: number;
  };
  settings: SiteSettingRecord;
  auditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    actorName?: string;
  }>;
  openInquiriesCount: number;
}

export default function StudioOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudioOverviewData | null>(null);

  // Quick Post State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('DEVLOG');
  const [submittingPost, setSubmittingPost] = useState(false);

  useEffect(() => {
    fetch('/api/v1/studio/overview')
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/studio/login');
          return null;
        }
        if (!res.ok) throw new Error('Failed to load studio overview');
        return res.json();
      })
      .then((resData) => {
        if (resData) setData(resData);
      })
      .catch(() => {
        toast.error('Unable to fetch studio status');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleQuickPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    setSubmittingPost(true);
    try {
      const res = await fetch('/api/v1/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          postType,
          mediaUrlsJson: [],
          taggedMemberIdsJson: data ? [data.member.id] : [],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to dispatch feed post');
      } else {
        toast.success('Dispatched to live studio feed!');
        setPostTitle('');
        setPostContent('');
      }
    } catch {
      toast.error('Network error creating post');
    } finally {
      setSubmittingPost(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F0] dark:bg-black">
        <div className="flex items-center gap-3 font-mono text-sm text-[#52525B] dark:text-[#8E8E93]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0033FF] border-t-transparent" />
          <span>Authenticating Studio Session...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <StudioShell member={data.member}>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-8 sm:flex-row sm:items-center dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0033FF]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#0033FF] dark:bg-[#0033FF]/20">
                <Shield className="h-3 w-3" />
                <span>{data.member.role} CLEARANCE</span>
              </span>
              <span className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                ID: {data.member.id}
              </span>
            </div>
            <h1 className="tb-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {data.member.fullName}
            </h1>
            <p className="mt-1 text-xs text-[#52525B] dark:text-[#8E8E93]">
              TurboBits Studio Control &amp; Continuous Deployment Deck
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${data.member.username}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-4 py-2 text-xs font-medium hover:border-[#0033FF] dark:border-white/15"
            >
              <span>View Live Profile</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Studio Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-[#EAEAE5] p-5 dark:border-white/10 dark:bg-[#0B0B0D]">
            <div className="flex items-center justify-between text-[#52525B] dark:text-[#8E8E93]">
              <span className="font-mono text-xs">Total Projects</span>
              <FolderGit2 className="h-4 w-4 text-[#0033FF]" />
            </div>
            <p className="tb-display tb-tabular mt-3 text-3xl font-bold">
              {data.stats.projectsCount}
            </p>
            <p className="mt-1 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
              {data.stats.teamProjectsCount} Studio Team Builds
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#EAEAE5] p-5 dark:border-white/10 dark:bg-[#0B0B0D]">
            <div className="flex items-center justify-between text-[#52525B] dark:text-[#8E8E93]">
              <span className="font-mono text-xs">Active Builders</span>
              <Users className="h-4 w-4 text-[#0033FF]" />
            </div>
            <p className="tb-display tb-tabular mt-3 text-3xl font-bold">
              {data.stats.buildersCount}
            </p>
            <p className="mt-1 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
              Core Whitelisted Members
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#EAEAE5] p-5 dark:border-white/10 dark:bg-[#0B0B0D]">
            <div className="flex items-center justify-between text-[#52525B] dark:text-[#8E8E93]">
              <span className="font-mono text-xs">Hackathons Won</span>
              <Trophy className="h-4 w-4 text-[#0033FF]" />
            </div>
            <p className="tb-display tb-tabular mt-3 text-3xl font-bold">
              {data.stats.hackathonsCount}
            </p>
            <p className="mt-1 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
              {data.stats.achievementsCount} Verified Awards
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#EAEAE5] p-5 dark:border-white/10 dark:bg-[#0B0B0D]">
            <div className="flex items-center justify-between text-[#52525B] dark:text-[#8E8E93]">
              <span className="font-mono text-xs">Total Downloads</span>
              <Activity className="h-4 w-4 text-[#0033FF]" />
            </div>
            <p className="tb-display tb-tabular mt-3 text-3xl font-bold">
              {data.stats.downloadsTotal}
            </p>
            <p className="mt-1 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
              Project Vault Deliverables
            </p>
          </div>
        </div>

        {/* Quick Post & Activity Stream */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Quick Post to Feed */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-black/10 bg-[#EAEAE5] p-6 dark:border-white/10 dark:bg-[#0B0B0D]">
              <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-[#0033FF]" />
                  <h2 className="tb-display text-lg font-bold">Quick-Post to Live Feed</h2>
                </div>
                <span className="font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                  Instant Dispatch
                </span>
              </div>

              <form onSubmit={handleQuickPost} className="mt-5 space-y-4">
                <div>
                  <label className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Post Category
                  </label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-[#F4F4F0] px-3.5 py-2.5 text-xs text-[#09090B] focus:border-[#0033FF] focus:outline-none dark:border-white/10 dark:bg-[#141416] dark:text-white"
                  >
                    <option value="DEVLOG">Devlog &amp; Sprint Update</option>
                    <option value="PROJECT_LAUNCH">Project Launch</option>
                    <option value="HACKATHON">Hackathon Live Update</option>
                    <option value="ACHIEVEMENT">Award &amp; Milestone</option>
                    <option value="ANNOUNCEMENT">Studio Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Headline / Title
                  </label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Deployed edge ML engine to TiDB cluster..."
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-[#F4F4F0] px-3.5 py-2.5 text-xs text-[#09090B] focus:border-[#0033FF] focus:outline-none dark:border-white/10 dark:bg-[#141416] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Log Message / Markdown
                  </label>
                  <textarea
                    rows={4}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Brief architectural breakdown or sprint notes..."
                    className="mt-1.5 w-full rounded-xl border border-black/10 bg-[#F4F4F0] px-3.5 py-2.5 text-xs text-[#09090B] focus:border-[#0033FF] focus:outline-none dark:border-white/10 dark:bg-[#141416] dark:text-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submittingPost ? 'Broadcasting...' : 'Broadcast to Feed'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Recent Audit & System Activity */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-black/10 bg-[#EAEAE5] p-6 dark:border-white/10 dark:bg-[#0B0B0D]">
              <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#0033FF]" />
                  <h2 className="tb-display text-lg font-bold">Studio Audit Trail</h2>
                </div>
                <span className="font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                  Security Logs
                </span>
              </div>

              <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {data.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between rounded-xl border border-black/5 bg-[#F4F4F0] p-3 text-xs dark:border-white/5 dark:bg-[#141416]"
                  >
                    <div>
                      <p className="font-mono text-[11px] font-semibold text-[#0033FF]">
                        {log.action}
                      </p>
                      <p className="mt-0.5 text-[#52525B] dark:text-[#8E8E93]">
                        {log.actorName || 'System'} · {log.entityType}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
