'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Pin,
  Share2,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import SafeImage from '@/components/ui/SafeImage';
import type { FeedPostRecord, FeedPostType } from '@/lib/types';

interface FeedTimelineClientProps {
  initialPosts: FeedPostRecord[];
  singlePostMode?: boolean;
}

const FILTERS: Array<{ value: 'ALL' | FeedPostType; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'PROJECT_LAUNCH', label: 'Project Launch' },
  { value: 'ACHIEVEMENT', label: 'Achievement' },
  { value: 'DEVLOG', label: 'Devlog' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
];

const TYPE_LABEL: Record<FeedPostType, string> = {
  HACKATHON: 'Hackathon',
  PROJECT_LAUNCH: 'Project Launch',
  ACHIEVEMENT: 'Achievement',
  DEVLOG: 'Devlog',
  ANNOUNCEMENT: 'Announcement',
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export default function FeedTimelineClient({
  initialPosts,
  singlePostMode = false,
}: FeedTimelineClientProps) {
  const [posts, setPosts] = useState<FeedPostRecord[]>(initialPosts);
  const [filter, setFilter] = useState<'ALL' | FeedPostType>('ALL');
  const [clappedIds, setClappedIds] = useState<Record<string, boolean>>({});
  const [slideIndex, setSlideIndex] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    if (filter === 'ALL') return posts;
    return posts.filter((p) => p.postType === filter);
  }, [posts, filter]);

  const handleClap = async (postId: string) => {
    // Optimistic update
    setClappedIds((prev) => ({ ...prev, [postId]: true }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, clapsCount: p.clapsCount + 1 } : p))
    );

    try {
      const res = await fetch(`/api/v1/feed/${postId}/clap`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, clapsCount: data.clapsCount } : p))
        );
      }
    } catch {
      // Keep optimistic count
    }
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/feed/${postId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Post link copied to clipboard');
    } catch {
      toast.info(shareUrl);
    }
  };

  const stepSlide = (postId: string, total: number, delta: number) => {
    setSlideIndex((prev) => {
      const cur = prev[postId] ?? 0;
      const next = (cur + delta + total) % total;
      return { ...prev, [postId]: next };
    });
  };

  return (
    <div className="px-5 pb-24 pt-10 md:px-8 md:pt-14">
      {!singlePostMode && (
        <>
          <div className="grid gap-6 border-b border-black/10 pb-10 lg:grid-cols-12 lg:items-end dark:border-white/12">
            <div className="lg:col-span-8">
              <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                Live Activity Timeline
              </p>
              <h1 className="tb-display mt-3 text-[clamp(3rem,7.5vw,6rem)] font-semibold leading-[0.93]">
                Studio Feed
              </h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                Real-time dispatches from hackathon floors, hardware bench tests, APK releases, and
                deep-dive architecture devlogs.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter feed posts">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  aria-pressed={active}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#0033FF] text-white'
                      : 'border border-black/10 bg-[#EAEAE5] text-[#09090B] hover:border-[#0033FF] dark:border-white/12 dark:bg-[#0B0B0D] dark:text-white'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mx-auto mt-10 max-w-3xl space-y-8">
        {filtered.length === 0 ? (
          <div className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-10 text-center dark:border-white/12 dark:bg-[#0B0B0D]">
            <p className="text-sm text-[#52525B] dark:text-[#8E8E93]">
              No posts in this category yet.
            </p>
          </div>
        ) : (
          filtered.map((post) => {
            const images = post.mediaUrlsJson || [];
            const activeImg = slideIndex[post.id] ?? 0;

            return (
              <article
                key={post.id}
                data-testid={`feed-post-${post.id}`}
                className="overflow-hidden rounded-[26px] border border-black/10 bg-[#EAEAE5] p-6 sm:p-8 dark:border-white/12 dark:bg-[#0B0B0D]"
              >
                {/* Author Header */}
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={post.author ? `/${post.author.username}` : '/team'}
                    className="group flex items-center gap-3.5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white font-display text-xs font-bold dark:border-white/15 dark:bg-[#141416]">
                      {post.author?.fullName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2) || 'TB'}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold group-hover:text-[#0033FF]">
                        {post.author?.fullName || 'TurboBits Studio'}
                      </p>
                      <p className="font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                        {TYPE_LABEL[post.postType]} · {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                    {post.isPinned && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0033FF]">
                        <Pin className="h-3.5 w-3.5" /> Pinned
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Content */}
                <div className="mt-5">
                  <Link href={`/feed/${post.id}`} className="group block">
                    <h2 className="tb-display text-xl font-semibold leading-snug group-hover:text-[#0033FF] sm:text-2xl">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#09090B] sm:text-base dark:text-white/90">
                    {post.content}
                  </p>
                </div>

                {/* Tagged Teammates */}
                {post.taggedMembers && post.taggedMembers.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    <span>With:</span>
                    {post.taggedMembers.map((tm) => (
                      <Link
                        key={tm.id}
                        href={`/${tm.username}`}
                        className="text-[#09090B] underline-offset-4 hover:text-[#0033FF] hover:underline dark:text-white"
                      >
                        @{tm.username}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Multi-Photo Carousel */}
                {images.length > 0 && (
                  <div className="relative mt-5 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
                    <div className="aspect-[16/10] w-full">
                      <SafeImage
                        src={images[activeImg]}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => stepSlide(post.id, images.length, -1)}
                          aria-label="Previous photo"
                          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white hover:bg-[#0033FF]"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => stepSlide(post.id, images.length, 1)}
                          aria-label="Next photo"
                          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white hover:bg-[#0033FF]"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <span className="tb-tabular absolute bottom-3 right-3 rounded-full bg-black/75 px-3 py-1 font-mono text-[11px] text-white">
                          {activeImg + 1} / {images.length}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Embedded Linked Project / Hackathon Cards */}
                {(post.linkedProject || post.linkedHackathon) && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {post.linkedProject && (
                      <Link
                        href={`/projects/${post.linkedProject.slug}`}
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-[#F4F4F0] p-4 transition-colors hover:border-[#0033FF] dark:border-white/10 dark:bg-[#141416]"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
                            Linked Project
                          </p>
                          <p className="truncate font-display text-sm font-semibold group-hover:text-[#0033FF]">
                            {post.linkedProject.title}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0" />
                      </Link>
                    )}
                    {post.linkedHackathon && (
                      <Link
                        href="/hackathons"
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-[#F4F4F0] p-4 transition-colors hover:border-[#0033FF] dark:border-white/10 dark:bg-[#141416]"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
                            Hackathon Event
                          </p>
                          <p className="truncate font-display text-sm font-semibold group-hover:text-[#0033FF]">
                            {post.linkedHackathon.name}
                          </p>
                        </div>
                        <Trophy className="h-4 w-4 shrink-0 text-[#0033FF]" />
                      </Link>
                    )}
                  </div>
                )}

                {/* Actions Footer: Optimistic Clap + Share */}
                <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => handleClap(post.id)}
                    aria-label={`Clap for ${post.title}`}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                      clappedIds[post.id]
                        ? 'border-[#0033FF] bg-[#0033FF] text-white'
                        : 'border-black/15 hover:border-[#0033FF] dark:border-white/20'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${clappedIds[post.id] ? 'fill-current' : ''}`} />
                    <span className="tb-tabular" data-testid={`clap-count-${post.id}`}>
                      {post.clapsCount}
                    </span>
                    <span>Clap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(post.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
