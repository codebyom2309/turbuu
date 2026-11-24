import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  STUDIO_COOKIE_NAME,
  getAuthContext,
  isGoogleOAuthConfigured,
  signMemberJwt,
} from '@/lib/auth';
import { getMemberByEmail, listMembers, logAudit } from '@/lib/data/repository';

const previewSignInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

export async function GET(req: NextRequest) {
  const ctx = await getAuthContext(req);
  const googleOAuthConfigured = isGoogleOAuthConfigured();
  const previewAccounts = !googleOAuthConfigured
    ? listMembers({ includeInactive: false }).map((m) => ({
        email: m.email,
        fullName: m.fullName,
        username: m.username,
        role: m.role,
      }))
    : [];

  return NextResponse.json({
    authenticated: Boolean(ctx),
    source: ctx?.source ?? null,
    member: ctx?.member ?? null,
    googleOAuthConfigured,
    previewAccounts,
  });
}

export async function POST(req: NextRequest) {
  // Preview whitelist sign-in is strictly disabled once production Google OAuth keys are configured in .env
  if (isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: 'Google OAuth is enabled. Please sign in with Google.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = previewSignInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid email address' },
        { status: 400 }
      );
    }

    const member = getMemberByEmail(parsed.data.email);
    if (!member || !member.isActive) {
      return NextResponse.json(
        { error: 'Access Restricted to TurboBits Members. This email is not on the active whitelist.' },
        { status: 403 }
      );
    }

    const token = await signMemberJwt(member, '7d');
    logAudit(member.id, 'STUDIO_SIGN_IN', 'Member', member.id, { mode: 'preview-whitelist' });

    const res = NextResponse.json({
      authenticated: true,
      token,
      member,
    });
    res.cookies.set(STUDIO_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      partitioned: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set(STUDIO_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    partitioned: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
