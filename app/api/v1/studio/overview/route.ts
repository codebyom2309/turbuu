import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getSiteSettings,
  getStudioStats,
  listAuditLogs,
  listHackathons,
  listInquiries,
  listMembers,
  listProjects,
} from '@/lib/data/repository';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const isAdmin = auth.ctx.member.role === 'ADMIN';
  return NextResponse.json({
    member: auth.ctx.member,
    stats: getStudioStats(),
    settings: getSiteSettings(),
    auditLogs: listAuditLogs(25),
    projects: listProjects({ scope: 'ALL' }).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      scope: p.scope,
    })),
    hackathons: listHackathons().map((h) => ({
      id: h.id,
      slug: h.slug,
      name: h.name,
    })),
    members: listMembers({ includeInactive: isAdmin }).map((m) => ({
      id: m.id,
      username: m.username,
      fullName: m.fullName,
      role: m.role,
    })),
    openInquiriesCount: isAdmin
      ? listInquiries().filter((i) => i.status === 'NEW' || i.status === 'CONTACTED').length
      : 0,
  });
}
