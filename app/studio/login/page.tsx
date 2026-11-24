'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface PreviewAccount {
  email: string;
  fullName: string;
  username: string;
  role: 'ADMIN' | 'MEMBER';
}

export default function StudioLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [previewAccounts, setPreviewAccounts] = useState<PreviewAccount[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace('/studio');
          return;
        }
        setGoogleConfigured(Boolean(data.googleOAuthConfigured));
        setPreviewAccounts(data.previewAccounts || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleWhitelistLogin = async (email: string) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Access Restricted to TurboBits Members.');
        toast.error(data.error || 'Access denied');
      } else {
        toast.success(`Welcome back, ${data.member.fullName}`);
        router.push('/studio');
        router.refresh();
      }
    } catch {
      setError('Unable to reach authentication service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="tb-gridlines flex min-h-screen flex-col items-center justify-center bg-[#F4F4F0] px-5 py-16 text-[#09090B] dark:bg-black dark:text-white">
      <div className="w-full max-w-lg rounded-[28px] border border-black/10 bg-[#EAEAE5] p-8 md:p-10 dark:border-white/12 dark:bg-[#0B0B0D]">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-[#52525B] hover:text-[#0033FF] dark:text-[#8E8E93]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to turbobits.in</span>
          </Link>
          <Lock className="h-4 w-4 text-[#0033FF]" />
        </div>

        <h1 className="tb-display mt-6 text-3xl font-semibold sm:text-4xl">
          TurboBits Studio Sign-In
        </h1>
        <p className="mt-2 text-sm text-[#52525B] dark:text-[#8E8E93]">
          Private engineering workspace &amp; website control center. Strictly gated by the TiDB
          Member email whitelist.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-700 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
            Checking authentication configuration...
          </p>
        ) : googleConfigured ? (
          <div className="mt-7">
            <a
              href="/api/auth/signin/google?callbackUrl=/studio"
              className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#0033FF] px-6 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Continue with Google (Whitelisted Account)</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-black/10 bg-[#F4F4F0] p-4 text-xs text-[#52525B] dark:border-white/10 dark:bg-[#141416] dark:text-[#8E8E93]">
              <p className="font-mono font-semibold text-[#09090B] dark:text-white">
                Preview Whitelist Auth Active
              </p>
              <p className="mt-1">
                Google OAuth credentials (<code className="font-mono">GOOGLE_CLIENT_ID</code>) are
                not yet configured in <code className="font-mono">.env</code>. Sign in as a
                whitelisted member below to test all Studio &amp; Admin controls immediately.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleWhitelistLogin(emailInput);
              }}
              className="space-y-3"
            >
              <label htmlFor="studio-email" className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                Whitelisted Member Email
              </label>
              <div className="flex gap-2">
                <input
                  id="studio-email"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="omsatange72@gmail.com"
                  className="flex-1 rounded-full border border-black/15 bg-white px-4 py-2.5 text-xs text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="whitespace-nowrap rounded-full bg-[#0033FF] px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Verifying...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div>
              <p className="font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                Quick-Select Whitelisted Team Accounts
              </p>
              <div className="mt-2.5 space-y-2">
                {previewAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleWhitelistLogin(acc.email)}
                    className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-[#F4F4F0] px-4 py-3 text-left transition-colors hover:border-[#0033FF] dark:border-white/10 dark:bg-[#141416]"
                  >
                    <div>
                      <p className="text-xs font-semibold">{acc.fullName}</p>
                      <p className="font-mono text-[11px] text-[#52525B] dark:text-[#8E8E93]">
                        {acc.email} · /{acc.username}
                      </p>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-semibold ${
                        acc.role === 'ADMIN' ? 'text-[#0033FF]' : 'text-[#52525B] dark:text-[#8E8E93]'
                      }`}
                    >
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
