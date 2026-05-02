import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeToggle from '@/components/shared/ThemeToggle';
import NavClient from '@/components/shared/NavClient';
import Link from 'next/link';
import { NAV_LINKS } from '@/lib/nav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Build-A-World — AI Product Lifecycle Engine',
  description:
    'Transform any product idea into a fully visualised, market-ready world — powered by 8 AI agents.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('baw_theme');
                  if (t === 'dark') document.documentElement.classList.add('dark');
                } catch(e) {}
              })()
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen bg-bg text-fg`}>

        {/* ── Top nav ─────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-40 w-full"
          style={{ background: 'var(--nav-blur-bg)', borderBottom: '1px solid rgb(var(--color-border) / 0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight select-none group">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🌍</span>
              <span className="text-fg font-extrabold text-lg tracking-tight">
                Build-A-<span className="text-gradient">World</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <NavClient links={NAV_LINKS} />

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────────── */}
        <main className="mx-auto max-w-7xl px-5 py-10">
          {children}
        </main>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="mt-20 py-8 text-center" style={{ borderTop: '1px solid rgb(var(--color-border) / 0.08)' }}>
          <p className="text-fg-muted text-xs">
            Build-A-World &middot; Powered by Z.AI, Seedance 2.0, Butterbase &amp; Twitter/X &middot; Hackathon 2025
          </p>
        </footer>
      </body>
    </html>
  );
}
