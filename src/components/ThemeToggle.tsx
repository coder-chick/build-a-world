'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ThemeToggle — sun/moon toggle that writes `dark` class to <html>.
// Persists selection to localStorage.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('baw_theme');
    const isDark = stored !== null ? stored === 'dark' : true;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('baw_theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="
        relative flex items-center gap-2 px-3 py-1.5
        rounded-full border border-white/10
        bg-white/5 hover:bg-white/10
        text-sm font-medium text-white/70 hover:text-white
        transition-all duration-200
      "
    >
      <span className="text-base">{dark ? '🌙' : '☀️'}</span>
      <span className="hidden sm:inline">{dark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
