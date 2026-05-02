'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 5 — Architecture
// OWNER: TEAM 1
// ─────────────────────────────────────────────────────────────────────────────

import ArchitectureDiagram from '@/components/ArchitectureDiagram';
import Link from 'next/link';

const TECH_STACK = [
  { label: 'Next.js 14',   color: 'bg-bg-sub text-fg-muted' },
  { label: 'TypeScript',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { label: 'Tailwind CSS', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { label: 'anime.js',     color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  { label: 'Z.AI',         color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { label: 'OpenAI',       color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { label: 'Anthropic',    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { label: 'Seedance 2.0', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  { label: 'Butterbase',   color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { label: 'Twitter/X',    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
];

const BUTTERBASE_INFO = [
  { label: 'App ID',  value: process.env.NEXT_PUBLIC_BUTTERBASE_APP_ID ?? 'app_x3jo6j4gzl8x' },
  { label: 'API URL', value: process.env.NEXT_PUBLIC_BUTTERBASE_API_URL ?? 'https://api.butterbase.ai/v1/app_x3jo6j4gzl8x' },
  { label: 'Live URL', value: 'https://build-a-world.butterbase.dev' },
  { label: 'DB Table', value: 'product_worlds (UUID PK, JSONB data)' },
];

export default function ArchitecturePage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        <Link href="/" className="hover:text-fg transition-colors" style={{ color: 'inherit' }}>Home</Link>
        <span>/</span>
        <span className="text-fg">Architecture</span>
        <div className="ml-auto flex gap-2">
          <Link href="/builder" className="btn-ghost text-xs py-1.5 px-3">🏗️ Builder</Link>
          <Link href="/video"   className="btn-ghost text-xs py-1.5 px-3">🎬 Videos</Link>
          <Link href="/gtm"     className="btn-ghost text-xs py-1.5 px-3">🚀 GTM</Link>
        </div>
      </div>

      <div>
        <h1 className="section-heading">🔭 System Architecture</h1>
        <p className="section-sub">8 AI agents · 3 external services · 1 Butterbase backend · full LLM fallback chain</p>
      </div>

      {/* Main diagram */}
      <ArchitectureDiagram />

      {/* Tech stack */}
      <section className="card p-6">        <h2 className="text-lg font-semibold text-fg mb-4">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map(({ label, color }) => (
            <span key={label} className={`badge text-sm py-1 px-3 rounded-full ${color}`}>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Butterbase deployment info */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-fg mb-4">Butterbase Deployment</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {BUTTERBASE_INFO.map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'rgb(var(--color-border) / 0.05)' }}>
              <p className="text-xs text-fg-muted mb-1">{label}</p>
              <p className="text-sm text-fg font-mono break-all">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LLM fallback chain */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-fg mb-4">LLM Fallback Chain</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {['Z.AI (primary)', 'OpenAI (fallback)', 'Anthropic (fallback)', 'Mock (MOCK_MODE)'].map(
            (label, i, arr) => (
              <div key={label} className="flex items-center gap-3">
                <span className="badge bg-accent/10 text-accent border border-accent/20 py-1 px-3">
                  {label}
                </span>
                {i < arr.length - 1 && <span className="text-gray-600">→</span>}
              </div>
            )
          )}
        </div>
          <p className="text-xs text-fg-muted mt-3">
            Each agent calls <code className="text-gradient font-mono">callLLM()</code> which tries providers in order,
            returning <code className="text-gradient font-mono">&apos;__MOCK__&apos;</code> sentinel on total failure or when{' '}
            <code className="text-gradient font-mono">MOCK_MODE=true</code>.
          </p>
      </section>
    </div>
  );
}
