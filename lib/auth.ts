import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import type { NextRequest } from 'next/server';
import { getMemberByEmail, getMemberById } from './data/repository';
import type { AuthContext, MemberRecord } from './types';

export const STUDIO_COOKIE_NAME = 'tb_studio_jwt';

declare global {
  var __TURBOBITS_EPHEMERAL_JWT_SECRET__: string | undefined;
}

function getJwtSecretBytes(): Uint8Array {
  const fromEnv = process.env.JWT_SECRET || process.env.AUTH_SECRET;
  if (fromEnv && fromEnv.trim().length >= 16) {
    return new TextEncoder().encode(fromEnv.trim());
  }
  if (!globalThis.__TURBOBITS_EPHEMERAL_JWT_SECRET__) {
    globalThis.__TURBOBITS_EPHEMERAL_JWT_SECRET__ = crypto.randomBytes(32).toString('hex');
  }
  return new TextEncoder().encode(globalThis.__TURBOBITS_EPHEMERAL_JWT_SECRET__);
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CLIENT_SECRET.trim().length > 0
  );
}

// --- Auth.js (NextAuth v5) Web Configuration with Strict TiDB Whitelist Gate ---
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET || 'turbobits-dev-fallback-secret-change-in-env',
  trustHost: true,
  providers: isGoogleOAuthConfigured()
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : [],
  pages: {
    signIn: '/studio/login',
    error: '/studio/unauthorized',
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase();
      if (!email) return '/studio/unauthorized?reason=missing_email';
      const member = getMemberByEmail(email);
      if (!member || !member.isActive) {
        return '/studio/unauthorized?reason=not_whitelisted';
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const member = getMemberByEmail(user.email);
        if (member) {
          token.memberId = member.id;
          token.role = member.role;
          token.username = member.username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.memberId) {
        (session.user as unknown as Record<string, unknown>).memberId = token.memberId;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).username = token.username;
      }
      return session;
    },
  },
});

// --- Phase 2 Mobile & Studio JWT Helpers (jose HS256) ---
export async function signMemberJwt(member: MemberRecord, expiresIn = '7d'): Promise<string> {
  return new SignJWT({
    sub: member.id,
    email: member.email,
    username: member.username,
    role: member.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('turbobits.in')
    .setAudience('turbobits-api-v1')
    .setExpirationTime(expiresIn)
    .sign(getJwtSecretBytes());
}

export async function verifyMemberJwt(token: string): Promise<MemberRecord | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes(), {
      issuer: 'turbobits.in',
      audience: 'turbobits-api-v1',
    });
    const memberId = typeof payload.sub === 'string' ? payload.sub : null;
    if (!memberId) return null;
    const member = getMemberById(memberId);
    if (!member || !member.isActive) return null;
    return member;
  } catch {
    return null;
  }
}

export async function verifyGoogleMobileIdToken(
  idToken: string
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const audiences = [
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_CLIENT_ID,
  ].filter(Boolean) as string[];

  if (audiences.length === 0) {
    return {
      ok: false,
      error: 'GOOGLE_CLIENT_ID / GOOGLE_ANDROID_CLIENT_ID is not configured on the server.',
    };
  }

  try {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: audiences,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return { ok: false, error: 'Google ID token does not contain a verified email.' };
    }
    return { ok: true, email: payload.email.toLowerCase() };
  } catch {
    return { ok: false, error: 'Invalid or expired Google ID token.' };
  }
}

// --- Unified Server Auth Context (Accepts Mobile Bearer JWT OR Web NextAuth OR Studio Session Cookie) ---
export async function getAuthContext(req?: NextRequest | Request): Promise<AuthContext | null> {
  // 1. Check Authorization: Bearer <jwt> (Phase 2 Kotlin Android App & API clients)
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      const member = await verifyMemberJwt(token);
      if (member) {
        return { member, source: 'bearer' };
      }
      return null;
    }
  }

  // 2. Check Web Auth.js (NextAuth v5) session
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (email) {
      const member = getMemberByEmail(email);
      if (member && member.isActive) {
        return { member, source: 'nextauth' };
      }
    }
  } catch {
    // NextAuth cookie absent or unconfigured in preview; fall through cleanly
  }

  // 3. Check HttpOnly Studio Session JWT Cookie (for preview mode before Google OAuth env keys are supplied)
  try {
    const cookieStore = await cookies();
    const studioJwt = cookieStore.get(STUDIO_COOKIE_NAME)?.value;
    if (studioJwt) {
      const member = await verifyMemberJwt(studioJwt);
      if (member && member.isActive) {
        return { member, source: 'studio-cookie' };
      }
    }
  } catch {
    // Non-request context
  }

  return null;
}

export async function requireAuth(req?: NextRequest | Request): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; status: number; error: string }
> {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return { ok: false, status: 401, error: 'Authentication required. Sign in with a whitelisted TurboBits account.' };
  }
  return { ok: true, ctx };
}

export async function requireAdmin(req?: NextRequest | Request): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; status: number; error: string }
> {
  const authResult = await requireAuth(req);
  if (!authResult.ok) return authResult;
  if (authResult.ctx.member.role !== 'ADMIN') {
    return { ok: false, status: 403, error: 'Admin privileges required for this operation.' };
  }
  return authResult;
}
