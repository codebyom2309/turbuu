import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAuthContext, requireAuth } from '@/lib/auth';
import { createFeedPost, listFeedPosts } from '@/lib/data/repository';
import { createFeedPostSchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const postType = req.nextUrl.searchParams.get('postType') || 'ALL';
  const includeDraftsParam = req.nextUrl.searchParams.get('includeDrafts') === 'true';
  const limitParam = Number(req.nextUrl.searchParams.get('limit') || '0');

  let includeDrafts = false;
  if (includeDraftsParam) {
    const ctx = await getAuthContext(req);
    includeDrafts = Boolean(ctx);
  }

  const posts = listFeedPosts({
    postType,
    includeDrafts,
    limit: Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined,
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = createFeedPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid feed post data' },
        { status: 400 }
      );
    }

    const post = createFeedPost(auth.ctx.member.id, parsed.data);
    revalidatePath('/');
    revalidatePath('/feed');
    revalidatePath(`/${auth.ctx.member.username}`);
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
