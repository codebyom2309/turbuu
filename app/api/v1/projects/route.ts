import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { createProject, listProjects } from '@/lib/data/repository';
import { createProjectSchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const scopeParam = searchParams.get('scope');
  const scope =
    scopeParam === 'TEAM' || scopeParam === 'PERSONAL' || scopeParam === 'ALL'
      ? scopeParam
      : 'ALL';
  const category = searchParams.get('category') || undefined;
  const hackathonId = searchParams.get('hackathonId') || undefined;
  const search = searchParams.get('search') || undefined;
  const featuredOnly = searchParams.get('featured') === 'true';

  const projects = listProjects({ scope, category, hackathonId, search, featuredOnly });
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid project data' },
        { status: 400 }
      );
    }

    const project = createProject(auth.ctx.member.id, parsed.data);
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath(`/${auth.ctx.member.username}`);
    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
