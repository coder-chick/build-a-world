'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2 — Builder
// OWNER: TEAM 1
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateProductWorld, regenerateVisuals } from '@/agents/core/orchestratorAgent';
import { ProductWorld } from '@/types/productWorld';
import ProductBuilder from '@/components/builder/ProductBuilder';
import LoadingOverlay from '@/components/shared/LoadingOverlay';
import Link from 'next/link';

export default function BuilderPage() {
  const router = useRouter();

  const [world,   setWorld  ] = useState<ProductWorld | null>(null);
  const [loading, setLoading] = useState(false);
  const [step,    setStep   ] = useState(0);
  const [error,   setError  ] = useState<string | null>(null);

  // ── On mount: read pending prompt from sessionStorage ──────────
  useEffect(() => {
    const raw = sessionStorage.getItem('baw_pending_prompt');
    if (!raw) { router.replace('/'); return; }

    sessionStorage.removeItem('baw_pending_prompt');

    // Stored as either a plain string or a JSON object { prompt, theme }
    let prompt: string;
    let theme: 'light' | 'dark' | undefined;
    try {
      const parsed = JSON.parse(raw) as { prompt: string; theme?: 'light' | 'dark' };
      prompt = parsed.prompt;
      theme  = parsed.theme;
    } catch {
      prompt = raw;
      theme  = undefined;
    }
    run(prompt, theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function run(prompt: string, theme: 'light' | 'dark' | undefined) {
    setLoading(true);
    setError(null);
    setStep(0);

    // Simulate step increments while agents run
    const ticker = setInterval(() => setStep(s => Math.min(s + 1, 8)), 3000);
    try {
      const pw = await generateProductWorld(prompt, theme);
      setWorld(pw);
      // Persist for downstream pages
      sessionStorage.setItem('baw_world', JSON.stringify(pw));
    } catch (e) {
      setError(String(e));
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }

  // ── Handlers passed to ProductBuilder ─────────────────────────
  const handleComponentChange = useCallback(
    (_componentName: string, _optionLabel: string) => {
      // CustomizationPanel manages selection locally;
      // a full regenerateVisuals() call picks up changes.
    },
    []
  );

  const handleStyleChange = useCallback(
    (_styleId: string) => {
      // StyleSelector manages selection locally via its own state.
    },
    []
  );

  const handleRegenerate = useCallback(async () => {
    if (!world) return;
    setLoading(true);
    setStep(0);
    const ticker = setInterval(() => setStep(s => Math.min(s + 1, 8)), 2000);
    try {
      const updated = await regenerateVisuals(world);
      setWorld(updated);
      sessionStorage.setItem('baw_world', JSON.stringify(updated));
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }, [world]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <LoadingOverlay visible={loading} step={step} />

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error} — <button className="underline" onClick={() => router.replace('/')}>Start over</button>
        </div>
      )}

      {world && !loading && (
        <>
          {/* Breadcrumb nav */}
          <div className="mb-6 flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            <Link href="/" className="hover:text-fg transition-colors" style={{ color: 'inherit' }}>Home</Link>
            <span>/</span>
            <span className="text-fg">{world.productOverview.productName}</span>
            <div className="ml-auto flex gap-2">
              <Link href="/video"        className="btn-ghost text-xs py-1.5 px-3">🎬 Videos</Link>
              <Link href="/gtm"          className="btn-ghost text-xs py-1.5 px-3">🚀 GTM</Link>
              <Link href="/architecture" className="btn-ghost text-xs py-1.5 px-3">🔭 Architecture</Link>
            </div>
          </div>

          <ProductBuilder
            productWorld={world}
            loading={false}
            onComponentChange={handleComponentChange}
            onStyleChange={handleStyleChange}
            onViewChange={() => {/* view managed by ProductBuilder */}}
            onRegenerate={handleRegenerate}
          />
        </>
      )}
    </>
  );
}
