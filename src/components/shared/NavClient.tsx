'use client';
// ─────────────────────────────────────────────────────────────────────────────
// NavClient — client-side nav with active link highlight & mobile drawer
// OWNER: TEAM 1
// ─────────────────────────────────────────────────────────────────────────────

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface NavLink { href: string; label: string; icon: string; }

export default function NavClient({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Desktop ───────────────────────────────────────────── */}
      <nav className="hidden md:flex items-center gap-0.5">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                color: active ? 'rgb(var(--color-fg))' : 'rgb(var(--color-fg-muted))',
                background: active ? 'rgb(var(--color-border) / 0.08)' : 'transparent',
              }}
            >
              {label}
              {active && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: '#06B6D4' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile hamburger ────────────────────────────────────── */}
      <button
        className="md:hidden flex flex-col gap-1 p-2 rounded-lg"
        style={{ color: 'rgb(var(--color-fg-muted))', background: 'rgb(var(--color-border) / 0.06)' }}
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
      >
        <span className="block w-5 h-0.5 rounded" style={{ background: 'currentColor' }} />
        <span className="block w-5 h-0.5 rounded" style={{ background: 'currentColor' }} />
        <span className="block w-4 h-0.5 rounded" style={{ background: 'currentColor' }} />
      </button>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden absolute top-16 left-0 right-0 z-50 px-4 py-3 flex flex-col gap-1 shadow-lg"
          style={{
            background: 'rgb(var(--color-card))',
            borderBottom: '1px solid rgb(var(--color-border) / 0.1)',
          }}
        >
          {links.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  color: active ? '#06B6D4' : 'rgb(var(--color-fg))',
                  background: active ? 'rgba(6,182,212,0.08)' : 'transparent',
                }}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
