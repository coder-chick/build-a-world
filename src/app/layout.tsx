import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Build-A-World | AI Product Lifecycle Engine',
  description:
    'Transform any product idea into a fully visualised, market-ready world — powered by 8 AI agents.',
};

const NAV_LINKS = [
  { href: '/',             label: 'Home'         },
  { href: '/builder',      label: 'Builder'      },
  { href: '/video',        label: 'Video Studio' },
  { href: '/gtm',          label: 'GTM + Social' },
  { href: '/architecture', label: 'Architecture' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-surface-dark text-gray-100`}>
        {/* ── Top nav ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-surface-dark/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <span className="text-xl">🌍</span>
              <span className="text-white">Build-A-</span>
              <span className="text-accent">World</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────────── */}
        <main className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-600">
          Build-A-World · Powered by Z.AI, Seedance, Butterbase &amp; Twitter/X · Hackathon 2025
        </footer>
      </body>
    </html>
  );
}
