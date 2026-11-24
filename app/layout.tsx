import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import AppProviders from '@/components/providers/AppProviders';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TurboBits — Engineering Studio & Platform (turbobits.in)',
    template: '%s · TurboBits',
  },
  description:
    'TurboBits (turbobits.in) — Interactive 3D engineering studio showcase, multi-member portfolio CMS, project vault, hackathon registry, live activity feed, and admin control center.',
  openGraph: {
    title: 'TurboBits — Engineering Studio & Platform',
    description:
      'Interactive 3D engineering studio showcase, multi-member portfolios, project downloads vault, hackathon registry, and live studio feed.',
    type: 'website',
    siteName: 'TurboBits',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TurboBits — Engineering Studio & Platform',
    description:
      'Interactive 3D engineering studio showcase, multi-member portfolios, project vault, and live studio feed.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
