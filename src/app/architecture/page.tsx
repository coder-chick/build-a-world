'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 5 — Architecture
// OWNER: TEAM 1
// ─────────────────────────────────────────────────────────────────────────────

import ArchitectureDiagram from '@/components/ArchitectureDiagram';
import Link from 'next/link';

const TECH_STACK = [
  { label: 'Next.js 14',   color: 'bg-white/10' },
  { label: 'TypeScript',   color: 'bg-blue-500/20 text-blue-300' },
  { label: 'Tailwind CSS', color: 'bg-cyan-500/20 text-cyan-300' },
  { label: 'anime.js',     color: 'bg-purple-500/20 text-purple-300' },
  { label: 'Z.AI',         color: 'bg-accent/20 text-accent' },
  { label: 'OpenAI',       color: 'bg-green-500/20 text-green-300' },
  { label: 'Anthropic',    color: 'bg-orange-500/20 text-orange-300' },
  { label: 'Seedance 2.0', color: 'bg-pink-500/20 text-pink-300' },
  { label: 'Butterbase',   color: 'bg-yellow-500/20 text-yellow-300' },
  { label: 'Twitter/X',    color: 'bg-sky-500/20 text-sky-300' },
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
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span>/</span>
        <span className="text-white">Architecture</span>
        <div className="ml-auto flex gap-2">
          <Link href="/builder" className="btn-ghost text-xs py-1.5 px-3">🏗️ Builder</Link>
          <Link href="/video"   className="btn-ghost text-xs py-1.5 px-3">🎬 Videos</Link>
          <Link href="/gtm"     className="btn-ghost text-xs py-1.5 px-3">🚀 GTM</Link>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">🔭 System Architecture</h1>
        <p className="text-sm text-gray-400 mt-1">
          8 AI agents · 3 external services · 1 Butterbase backend · full LLM fallback chain
        </p>
      </div>

      {/* Main diagram */}
      <ArchitectureDiagram />

      {/* Tech stack */}
      <section className="glass-card p-6 shadow-glass">
        <h2 className="text-lg font-semibold text-white mb-4">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map(({ label, color }) => (
            <span key={label} className={`badge text-sm py-1 px-3 rounded-full ${color}`}>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Butterbase deployment info */}
      <section className="glass-card p-6 shadow-glass">
        <h2 className="text-lg font-semibold text-white mb-4">Butterbase Deployment</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {BUTTERBASE_INFO.map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white/5 p-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-sm text-white font-mono break-all">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LLM fallback chain */}
      <section className="glass-card p-6 shadow-glass">
        <h2 className="text-lg font-semibold text-white mb-4">LLM Fallback Chain</h2>
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
        <p className="text-xs text-gray-500 mt-3">
          Each agent calls <code className="text-accent">callLLM()</code> which tries providers in order,
          returning <code className="text-accent">&apos;__MOCK__&apos;</code> sentinel on total failure or when{' '}
          <code className="text-accent">MOCK_MODE=true</code>.
        </p>
      </section>
    </div>
  );
}
