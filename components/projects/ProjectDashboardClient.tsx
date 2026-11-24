'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Cpu,
  Download,
  ExternalLink,
  FileArchive,
  FileCode2,
  FileText,
  Github,
  Layers,
  Play,
  Trophy,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import SafeImage from '@/components/ui/SafeImage';
import { formatFileSize } from '@/lib/validators';
import type { ProjectFileRecord, ProjectMediaRecord, ProjectRecord } from '@/lib/types';

interface ProjectDashboardClientProps {
  project: ProjectRecord;
}

export default function ProjectDashboardClient({ project }: ProjectDashboardClientProps) {
  const [files, setFiles] = useState<ProjectFileRecord[]>(project.files || []);
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'downloads'>('overview');
  const [lightbox, setLightbox] = useState<ProjectMediaRecord | null>(null);

  const handleDownload = async (file: ProjectFileRecord) => {
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/files`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setFiles((prev) =>
          prev.map((item) => (item.id === file.id ? { ...item, downloadCount: data.file.downloadCount } : item))
        );
      }
    } catch {
      // Proceed with download even if counter update fails
    }

    toast.success(`Downloading ${file.fileName}`);
    const anchor = document.createElement('a');
    anchor.href = file.publicUrl;
    anchor.download = file.fileName;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const renderFileIcon = (type: ProjectFileRecord['fileType']) => {
    switch (type) {
      case 'APK':
        return <FileCode2 className="h-5 w-5 text-[#0033FF]" />;
      case 'ZIP':
        return <FileArchive className="h-5 w-5 text-[#0033FF]" />;
      default:
        return <FileText className="h-5 w-5 text-[#0033FF]" />;
    }
  };

  return (
    <div className="px-5 pb-24 pt-8 md:px-8 md:pt-12">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-medium text-[#52525B] transition-colors hover:text-[#0033FF] dark:text-[#8E8E93]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Projects Vault</span>
      </Link>

      {/* Top Project Header */}
      <div className="mt-6 grid gap-10 border-b border-black/10 pb-12 lg:grid-cols-12 dark:border-white/12">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
            <span>{project.category.replace('_', ' / ')}</span>
            <span aria-hidden="true">·</span>
            <span>{project.scope === 'TEAM' ? 'TurboBits Team Build' : 'Personal Build'}</span>
            <span aria-hidden="true">·</span>
            <span>{project.projectDate}</span>
            <span aria-hidden="true">·</span>
            <span>{project.status.replace('_', ' ')}</span>
          </div>

          <h1 className="tb-display mt-4 text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[0.98]">
            {project.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#52525B] sm:text-lg dark:text-[#8E8E93]">
            {project.tagline}
          </p>

          {/* Action Links */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Live Deployment</span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
              >
                <Github className="h-3.5 w-3.5" />
                <span>Source Repository</span>
              </a>
            )}
            {project.demoVideoUrl && (
              <a
                href={project.demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/20"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Demo Reel</span>
              </a>
            )}
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('downloads')}
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-[#EAEAE5] px-5 py-2.5 text-xs font-medium transition-colors hover:border-[#0033FF] dark:border-white/15 dark:bg-[#141416]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Downloads Vault ({files.length})</span>
              </button>
            )}
          </div>

          {project.hackathon && (
            <Link
              href="/hackathons"
              className="mt-6 inline-flex items-center gap-2.5 rounded-2xl border border-black/10 bg-[#EAEAE5] px-4 py-3 text-xs transition-colors hover:border-[#0033FF] dark:border-white/12 dark:bg-[#0B0B0D]"
            >
              <Trophy className="h-4 w-4 text-[#0033FF]" />
              <span>
                Built at <strong>{project.hackathon.name}</strong> · {project.hackathon.result}
              </span>
            </Link>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-[24px] border border-black/10 bg-[#EAEAE5] dark:border-white/12 dark:bg-[#0B0B0D]">
            <SafeImage
              src={project.coverImageUrl}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
            <span>Tech: {project.techStackJson.join(' · ')}</span>
            <span className="tb-tabular">{project.viewsCount.toLocaleString()} views</span>
          </div>
        </div>
      </div>

      {/* Interactive Workspace Navigation Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-black/10 pb-4 dark:border-white/12" role="tablist">
        {[
          { id: 'overview', label: 'Overview & Problem / Solution' },
          { id: 'architecture', label: 'System Architecture & Media' },
          { id: 'downloads', label: `Downloads Vault (${files.length})` },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-medium transition-colors ${
                active
                  ? 'bg-[#09090B] text-white dark:bg-white dark:text-[#09090B]'
                  : 'border border-black/10 bg-[#EAEAE5] text-[#52525B] hover:text-[#09090B] dark:border-white/12 dark:bg-[#0B0B0D] dark:text-[#8E8E93] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {/* Main Interactive Content Pane */}
        <div className="space-y-8 lg:col-span-8">
          {activeTab === 'overview' && (
            <>
              <section className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
                <h2 className="tb-display text-2xl font-semibold">Executive Summary</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#09090B] sm:text-base dark:text-white/90">
                  {project.summary}
                </p>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-[24px] border border-black/10 bg-[#F4F4F0] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
                  <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">01. Problem Statement</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#09090B] dark:text-white/90">
                    {project.problemStatement || 'Engineered to solve real-world reliability and latency bottlenecks.'}
                  </p>
                </section>
                <section className="rounded-[24px] border border-black/10 bg-[#F4F4F0] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
                  <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">02. Solution Overview</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#09090B] dark:text-white/90">
                    {project.solutionOverview || project.summary}
                  </p>
                </section>
              </div>
            </>
          )}

          {activeTab === 'architecture' && (
            <>
              <section className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
                <div className="flex items-center gap-2.5">
                  <Cpu className="h-5 w-5 text-[#0033FF]" />
                  <h2 className="tb-display text-2xl font-semibold">Architecture Breakdown</h2>
                </div>
                <p className="mt-4 font-mono text-xs leading-relaxed text-[#09090B] sm:text-sm dark:text-white/90">
                  {project.architectureNotes || 'Modular multi-tier architecture backed by typed APIs.'}
                </p>
                <div className="mt-6 border-t border-black/10 pt-5 dark:border-white/10">
                  <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Core Stack</p>
                  <p className="mt-2 text-sm font-medium">{project.techStackJson.join(' · ')}</p>
                </div>
              </section>

              {/* Interactive Media Gallery */}
              {project.media && project.media.length > 0 && (
                <section>
                  <h3 className="tb-display text-xl font-semibold">Media &amp; Diagrams</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {project.media.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLightbox(item)}
                        className="group overflow-hidden rounded-2xl border border-black/10 bg-[#EAEAE5] text-left transition-colors hover:border-[#0033FF] dark:border-white/12 dark:bg-[#0B0B0D]"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden">
                          <SafeImage
                            src={item.url}
                            alt={item.caption || project.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3 p-4">
                          <span className="line-clamp-1 text-xs font-medium">{item.caption}</span>
                          <span className="font-mono text-[10px] text-[#52525B] dark:text-[#8E8E93]">
                            {item.mediaType}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === 'downloads' && (
            <section className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-7 dark:border-white/12 dark:bg-[#0B0B0D]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="tb-display text-2xl font-semibold">Filebase Downloads Vault</h2>
                  <p className="mt-1 text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Direct S3-hosted APKs, architecture PDFs, jury PPTX decks, and hardware Gerber ZIPs.
                  </p>
                </div>
                <Layers className="h-5 w-5 text-[#0033FF]" />
              </div>

              {files.length === 0 ? (
                <p className="mt-6 text-sm text-[#52525B] dark:text-[#8E8E93]">
                  No downloadable packages attached to this build yet. Members can upload files from
                  the Studio.
                </p>
              ) : (
                <div className="mt-6 divide-y divide-black/10 border-t border-black/10 dark:divide-white/10 dark:border-white/10">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white dark:border-white/12 dark:bg-[#141416]">
                          {renderFileIcon(file.fileType)}
                        </div>
                        <div>
                          <p className="font-mono text-sm font-semibold">{file.fileName}</p>
                          <p className="mt-1 text-xs text-[#52525B] dark:text-[#8E8E93]">
                            {file.description}
                          </p>
                          <p className="tb-tabular mt-1.5 font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                            {file.fileType} · {formatFileSize(file.fileSizeBytes)} ·{' '}
                            <span data-testid={`download-count-${file.id}`}>
                              {file.downloadCount} downloads
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(file)}
                        className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#09090B] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#0033FF] dark:bg-white dark:text-[#09090B] dark:hover:bg-[#0033FF] dark:hover:text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download {file.fileType}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Sidebar: Tagged Contributors + Quick Downloads Preview */}
        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-[24px] border border-black/10 bg-[#EAEAE5] p-6 dark:border-white/12 dark:bg-[#0B0B0D]">
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Team Attribution</p>
            <h3 className="tb-display mt-1 text-xl font-semibold">Tagged Contributors</h3>

            <div className="mt-5 space-y-4">
              {project.contributors && project.contributors.length > 0 ? (
                project.contributors.map((contrib) => (
                  <Link
                    key={contrib.id}
                    href={contrib.member ? `/${contrib.member.username}` : '/team'}
                    className="group block rounded-2xl border border-black/10 bg-[#F4F4F0] p-4 transition-colors hover:border-[#0033FF] dark:border-white/10 dark:bg-[#141416]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-sm font-semibold group-hover:text-[#0033FF]">
                        {contrib.member?.fullName || 'TurboBits Engineer'}
                      </p>
                      <ArrowUpRight className="h-4 w-4 text-[#52525B] group-hover:text-[#0033FF] dark:text-[#8E8E93]" />
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-[#0033FF]">{contrib.role}</p>
                    {contrib.contributionSummary && (
                      <p className="mt-2 text-xs leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                        {contrib.contributionSummary}
                      </p>
                    )}
                  </Link>
                ))
              ) : (
                <p className="text-xs text-[#52525B] dark:text-[#8E8E93]">
                  Core TurboBits Engineering Studio build.
                </p>
              )}
            </div>
          </div>

          {files.length > 0 && activeTab !== 'downloads' && (
            <div className="rounded-[24px] border border-black/10 bg-[#F4F4F0] p-6 dark:border-white/12 dark:bg-[#0B0B0D]">
              <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Downloads Vault</p>
              <p className="mt-1 text-sm font-semibold">
                {files.length} verified release {files.length === 1 ? 'artifact' : 'artifacts'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('downloads')}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-4 py-2 text-xs font-medium text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Inspect Downloads</span>
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Fullscreen Media Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-[#0B0B0D]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white hover:bg-[#0033FF]"
            >
              <X className="h-5 w-5" />
            </button>
            <SafeImage
              src={lightbox.url}
              alt={lightbox.caption || project.title}
              className="max-h-[75vh] w-full object-contain"
            />
            {lightbox.caption && (
              <div className="border-t border-white/10 p-4 text-xs text-white/85">
                {lightbox.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
