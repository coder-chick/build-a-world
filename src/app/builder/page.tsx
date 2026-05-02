'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2 — Builder
// OWNER: TEAM 1
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProductWorld } from '@/types/productWorld';
import ProductBuilder from '@/components/ProductBuilder';
import LoadingOverlay from '@/components/LoadingOverlay';
import Link from 'next/link';

export default function BuilderPage() {
  const router = useRouter();
  const startedRef = useRef(false); // guard against React Strict Mode double-mount

  const [world,   setWorld  ] = useState<ProductWorld | null>(null);
  const [loading, setLoading] = useState(false);
  const [step,    setStep   ] = useState(0);
  const [error,   setError  ] = useState<string | null>(null);

  // ── On mount: read pending prompt from sessionStorage ──────────
  useEffect(() => {
    if (startedRef.current) return; // prevent strict-mode double-run
    startedRef.current = true;

    const raw = sessionStorage.getItem('baw_pending_prompt');
    if (!raw) { router.replace('/'); return; }

    // Keep item in storage until we succeed (so back-nav doesn't lose it)
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
    sessionStorage.removeItem('baw_pending_prompt');
    run(prompt, theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function run(prompt: string, theme: 'light' | 'dark' | undefined) {
    setLoading(true);
    setError(null);
    setStep(0);

    // Simulate step increments while agents run
    const ticker = setInterval(() => setStep(s => Math.min(s + 1, 8)), 3000);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      const pw = data as ProductWorld;
      setWorld(pw);
      // Persist for downstream pages
      try { sessionStorage.setItem('baw_world', JSON.stringify(pw)); } catch { /* quota — state lives in memory */ }
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
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productWorld: world }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      const updated = data as ProductWorld;
      setWorld(updated);
      try { sessionStorage.setItem('baw_world', JSON.stringify(updated)); } catch { /* quota — state lives in memory */ }
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }, [world]);

  const handleImagesGenerated = useCallback(
    (imgs: { product?: string; knolling?: string; exploded?: string }) => {
      setWorld((prev) => {
        if (!prev) return prev;
        const updated: ProductWorld = {
          ...prev,
          visualSystem: {
            ...prev.visualSystem,
            generatedImages: imgs,
          },
        };
        try { sessionStorage.setItem('baw_world', JSON.stringify(updated)); } catch { /* quota — base64 images too large */ }
        return updated;
      });
    },
    []
  );

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
            onImagesGenerated={handleImagesGenerated}
          />

          {/* Next-step CTA — shown once at least the product image has been generated */}
          {world.visualSystem.generatedImages?.product && (
            <div
              className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-5"
              style={{ border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.06)' }}
            >
              <div>
                <p className="font-semibold text-sm" style={{ color: 'rgb(var(--color-fg))' }}>
                  🎬 Ready to make videos?
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                  {[
                    world.visualSystem.generatedImages.product   && 'Product',
                    world.visualSystem.generatedImages.knolling  && 'Knolling',
                    world.visualSystem.generatedImages.exploded  && 'Exploded',
                  ].filter(Boolean).join(' · ')} image{Object.values(world.visualSystem.generatedImages).filter(Boolean).length > 1 ? 's' : ''} ready — Seedance will use them as first frames.
                </p>
              </div>
              <Link
                href="/video"
                className="shrink-0 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(6,182,212,1)', color: '#0F1117', boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}
              >
                Next Step → Video Studio
              </Link>
            </div>
          )}
        </>
      )}
    </>
  );
}
