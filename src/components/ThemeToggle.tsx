'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1 — ThemeToggle
// Default: light mode. Persists to localStorage.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);  // default = light
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('baw_theme');
    const isDark = stored === 'dark';  // only dark if explicitly saved
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('baw_theme', next ? 'dark' : 'light');
  };

  if (!mounted) return <div className="w-20 h-8 rounded-full shimmer" />;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
      style={{
        background: 'rgb(var(--color-border) / 0.08)',
        border: '1px solid rgb(var(--color-border) / 0.12)',
        color: 'rgb(var(--color-fg-muted))',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'rgb(var(--color-fg))')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgb(var(--color-fg-muted))')}
    >
      <span className="text-base leading-none" title={dark ? 'Switch to Light' : 'Switch to Dark'}>
        {dark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
