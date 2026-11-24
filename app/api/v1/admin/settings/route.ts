import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings } from '@/lib/data/repository';
import { updateSiteSettingsSchema } from '@/lib/validators';

export async function GET() {
  return NextResponse.json({ settings: getSiteSettings() });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = updateSiteSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid settings payload' },
        { status: 400 }
      );
    }

    const settings = updateSiteSettings(auth.ctx.member.id, parsed.data);
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/feed');
    revalidatePath('/hackathons');
    revalidatePath('/team');
    revalidatePath('/services');
    revalidatePath('/contact');
    revalidatePath('/maintenance');

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
