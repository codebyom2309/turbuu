import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { createHackathon, deleteHackathon, listHackathons } from '@/lib/data/repository';
import { createHackathonSchema } from '@/lib/validators';

export async function GET() {
  return NextResponse.json({ hackathons: listHackathons() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = createHackathonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid hackathon data' },
        { status: 400 }
      );
    }

    const hackathon = createHackathon(auth.ctx.member.id, {
      ...parsed.data,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
    });
    revalidatePath('/');
    revalidatePath('/hackathons');
    return NextResponse.json({ hackathon }, { status: 201 });
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
  const ok = deleteHackathon(auth.ctx.member.id, id);
  if (!ok) {
    return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
  }
  revalidatePath('/');
  revalidatePath('/hackathons');
  return NextResponse.json({ deleted: true });
}
