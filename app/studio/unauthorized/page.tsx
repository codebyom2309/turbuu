import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function StudioUnauthorizedPage() {
  return (
    <main className="tb-gridlines flex min-h-screen flex-col items-center justify-center bg-[#F4F4F0] px-5 py-16 text-[#09090B] dark:bg-black dark:text-white">
      <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-[#EAEAE5] p-8 text-center dark:border-white/12 dark:bg-[#0B0B0D]">
        <ShieldAlert className="mx-auto h-10 w-10 text-[#0033FF]" />
        <h1 className="tb-display mt-5 text-3xl font-semibold">
          Access Restricted to TurboBits Members
        </h1>
        <p className="mt-3 text-sm text-[#52525B] dark:text-[#8E8E93]">
          Your Google account is not on the active TurboBits team whitelist. Ask a TurboBits Admin
          to add your email under Studio → Admin → Member Whitelist.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium hover:border-[#0033FF] dark:border-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to turbobits.in</span>
          </Link>
          <Link
            href="/studio/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-5 py-2.5 text-xs font-medium text-white"
          >
            Try Another Account
          </Link>
        </div>
      </div>
    </main>
  );
}
