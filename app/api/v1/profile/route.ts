import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  addMemberExperience,
  addMemberSkill,
  deleteMemberExperience,
  deleteMemberSkill,
  getFullMemberProfile,
  updateMemberProfile,
} from '@/lib/data/repository';
import {
  createExperienceSchema,
  createSkillSchema,
  updateProfileSchema,
} from '@/lib/validators';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const full = getFullMemberProfile(auth.ctx.member.username);
  return NextResponse.json(full);
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid profile update' },
        { status: 400 }
      );
    }

    const updated = updateMemberProfile(auth.ctx.member.id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    revalidatePath(`/${updated.username}`);
    revalidatePath('/team');
    revalidatePath('/');
    return NextResponse.json({ member: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const kind = body?.kind;

    if (kind === 'experience') {
      const parsed = createExperienceSchema.safeParse(body.data);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || 'Invalid experience data' },
          { status: 400 }
        );
      }
      const experience = addMemberExperience(auth.ctx.member.id, {
        ...parsed.data,
        endDate: parsed.data.endDate ?? null,
      });
      revalidatePath(`/${auth.ctx.member.username}`);
      return NextResponse.json({ experience }, { status: 201 });
    }

    if (kind === 'skill') {
      const parsed = createSkillSchema.safeParse(body.data);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || 'Invalid skill data' },
          { status: 400 }
        );
      }
      const skill = addMemberSkill(auth.ctx.member.id, parsed.data);
      revalidatePath(`/${auth.ctx.member.username}`);
      return NextResponse.json({ skill }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported profile item kind' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const kind = req.nextUrl.searchParams.get('kind');
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const isAdmin = auth.ctx.member.role === 'ADMIN';
  let ok = false;
  if (kind === 'experience') {
    ok = deleteMemberExperience(auth.ctx.member.id, id, isAdmin);
  } else if (kind === 'skill') {
    ok = deleteMemberSkill(auth.ctx.member.id, id, isAdmin);
  }
  if (!ok) {
    return NextResponse.json({ error: 'Item not found or forbidden' }, { status: 404 });
  }

  revalidatePath(`/${auth.ctx.member.username}`);
  return NextResponse.json({ deleted: true });
}
