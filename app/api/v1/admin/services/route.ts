import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from '@/lib/data/repository';
import { createServiceSchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const includeInactive = req.nextUrl.searchParams.get('all') === 'true';
  return NextResponse.json({ services: listServices(includeInactive) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid service offering' },
        { status: 400 }
      );
    }
    const service = createService(auth.ctx.member.id, parsed.data);
    revalidatePath('/services');
    revalidatePath('/');
    return NextResponse.json({ service }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: 'Service id is required' }, { status: 400 });
    }
    const parsed = createServiceSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid service update' }, { status: 400 });
    }
    const updated = updateService(auth.ctx.member.id, id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    revalidatePath('/services');
    revalidatePath('/');
    return NextResponse.json({ service: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  const ok = deleteService(auth.ctx.member.id, id);
  if (!ok) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }
  revalidatePath('/services');
  return NextResponse.json({ deleted: true });
}
