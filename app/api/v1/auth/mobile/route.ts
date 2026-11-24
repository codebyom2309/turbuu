import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signMemberJwt, verifyGoogleMobileIdToken } from '@/lib/auth';
import { getMemberByEmail, logAudit } from '@/lib/data/repository';

const mobileAuthSchema = z.object({
  idToken: z.string().min(10, 'Google ID token is required'),
});

/**
 * POST /api/v1/auth/mobile
 * Phase 2 Kotlin Jetpack Compose Android App Authentication Endpoint.
 * Verifies a Google ID Token, enforces the TiDB Member whitelist (`isActive = true`),
 * and returns a signed HS256 Bearer JWT usable on all `/api/v1/*` routes.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = mobileAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const verification = await verifyGoogleMobileIdToken(parsed.data.idToken);
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error }, { status: 401 });
    }

    const member = getMemberByEmail(verification.email);
    if (!member || !member.isActive) {
      return NextResponse.json(
        { error: 'Access Restricted to TurboBits Members. Your Google account is not whitelisted.' },
        { status: 403 }
      );
    }

    const token = await signMemberJwt(member, '30d');
    logAudit(member.id, 'MOBILE_SIGN_IN', 'Member', member.id, { email: member.email });

    return NextResponse.json({
      token,
      tokenType: 'Bearer',
      expiresInSeconds: 30 * 24 * 60 * 60,
      member: {
        id: member.id,
        email: member.email,
        username: member.username,
        fullName: member.fullName,
        role: member.role,
        avatarUrl: member.avatarUrl,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to process mobile authentication request' }, { status: 400 });
  }
}
