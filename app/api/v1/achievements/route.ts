import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  createAchievement,
  deleteAchievement,
  listAchievements,
} from '@/lib/data/repository';
import { createAchievementSchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const scopeParam = req.nextUrl.searchParams.get('scope');
  const scope =
    scopeParam === 'TEAM' || scopeParam === 'PERSONAL' || scopeParam === 'ALL'
      ? scopeParam
      : 'ALL';
  const memberId = req.nextUrl.searchParams.get('memberId') || undefined;

  return NextResponse.json({ achievements: listAchievements({ scope, memberId }) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = createAchievementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid achievement data' },
        { status: 400 }
      );
    }

    const achievement = createAchievement(auth.ctx.member.id, {
      ...parsed.data,
      memberId: parsed.data.memberId ?? null,
      certificateUrl: parsed.data.certificateUrl ?? null,
      credentialUrl: parsed.data.credentialUrl ?? null,
    });
    revalidatePath('/');
    revalidatePath('/team');
    revalidatePath(`/${auth.ctx.member.username}`);
    return NextResponse.json({ achievement }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  const ok = deleteAchievement(auth.ctx.member.id, auth.ctx.member.role === 'ADMIN', id);
  if (!ok) {
    return NextResponse.json({ error: 'Achievement not found or forbidden' }, { status: 404 });
  }
  revalidatePath('/team');
  return NextResponse.json({ deleted: true });
}
