import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin, requireAuth } from '@/lib/auth';
import {
  createWhitelistedMember,
  listMembers,
  updateMemberAdmin,
} from '@/lib/data/repository';
import { createMemberAdminSchema, updateMemberAdminSchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const members = listMembers({ includeInactive: auth.ctx.member.role === 'ADMIN' });
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = createMemberAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid member data' },
        { status: 400 }
      );
    }

    const result = createWhitelistedMember(auth.ctx.member.id, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    revalidatePath('/');
    revalidatePath('/team');
    return NextResponse.json({ member: result.member }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const memberId = typeof body?.id === 'string' ? body.id : '';
    if (!memberId) {
      return NextResponse.json({ error: 'Member id is required' }, { status: 400 });
    }
    const parsed = updateMemberAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    const updated = updateMemberAdmin(auth.ctx.member.id, memberId, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    revalidatePath('/');
    revalidatePath('/team');
    revalidatePath(`/${updated.username}`);
    return NextResponse.json({ member: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
