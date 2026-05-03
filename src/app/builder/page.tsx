'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2 — Builder
// OWNER: TEAM 1
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProductWorld, VisualizationView, VideoTask } from '@/types/productWorld';
import ProductBuilder from '@/components/builder/ProductBuilder';
import LoadingOverlay from '@/components/shared/LoadingOverlay';
import Link from 'next/link';

export default function BuilderPage() {
  const router = useRouter();
  const initialized = useRef(false);

  const [world,   setWorld  ] = useState<ProductWorld | null>(null);
  const [loading, setLoading] = useState(false);
  const [step,    setStep   ] = useState(0);
  const [error,   setError  ] = useState<string | null>(null);

  // ── On mount: read pending prompt from sessionStorage ──────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const raw = sessionStorage.getItem('baw_pending_prompt');

    // New prompt takes priority — always make fresh API calls
    if (raw) {
      sessionStorage.removeItem('baw_pending_prompt');
      sessionStorage.removeItem('baw_world');
    } else {
      // No new prompt — try loading cached world
      const existing = sessionStorage.getItem('baw_world');
      if (existing) {
        try {
          const pw = JSON.parse(existing) as ProductWorld;
          setWorld(pw);
          if (pw.visualSystem.imageGenStatus !== 'complete') {
            fetchImages(pw);
          }
          return;
        } catch { /* fall through */ }
      }
      router.replace('/');
      return;
    }

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

  // ── Phase 1: generate text content (fast ~15-30s) ──────────────
  async function run(prompt: string, theme: 'light' | 'dark' | undefined) {
    setLoading(true);
    setError(null);
    setStep(0);

    const ticker = setInterval(() => setStep(s => Math.min(s + 1, 7)), 3500);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, theme }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || `Generation failed (${res.status})`);
      }

      const pw: ProductWorld = await res.json();
      setWorld(pw);
      sessionStorage.setItem('baw_world', JSON.stringify(pw));

      // Phase 2: kick off image generation in background
      fetchImages(pw);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }

  // ── Phase 2: generate images asynchronously ────────────────────
  async function fetchImages(pw: ProductWorld) {
    try {
      setWorld(prev => prev ? {
        ...prev,
        visualSystem: { ...prev.visualSystem, imageGenStatus: 'generating' as const },
      } : prev);

      const res = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productPrompt: pw.visualSystem.productViewPrompt,
          knollingPrompt: pw.visualSystem.knollingViewPrompt,
          explodedPrompt: pw.visualSystem.explodedViewPrompt,
        }),
      });

      if (!res.ok) {
        console.error('[fetchImages] failed', res.status);
        setWorld(prev => prev ? {
          ...prev,
          visualSystem: { ...prev.visualSystem, imageGenStatus: 'failed' as const },
        } : prev);
        return;
      }

      const images = await res.json();
      const productImageUrl = images.productViewImageUrl || '';
      const knollingUrl = images.knollingViewImageUrl || '';
      const explodedUrl = images.explodedViewImageUrl || '';

      setWorld(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          visualSystem: {
            ...prev.visualSystem,
            productViewImageUrl: productImageUrl,
            knollingViewImageUrl: knollingUrl,
            explodedViewImageUrl: explodedUrl,
            imageGenStatus: 'complete' as const,
          },
          videoSystem: {
            ...prev.videoSystem,
            baseImageUrl: productImageUrl,
          },
        };
        sessionStorage.setItem('baw_world', JSON.stringify(updated));
        return updated;
      });

      // Phase 3: auto-trigger ALL video generation in the background
      if (productImageUrl) {
        startAllVideos(pw, productImageUrl);
      }

      // Phase 2b: silently retry any missing knolling/exploded images
      if (productImageUrl && (!knollingUrl || !explodedUrl)) {
        retryMissingImages(pw, productImageUrl, knollingUrl, explodedUrl);
      }
    } catch (e) {
      console.error('[fetchImages] error', e);
      setWorld(prev => prev ? {
        ...prev,
        visualSystem: { ...prev.visualSystem, imageGenStatus: 'failed' as const },
      } : prev);
    }
  }

  // ── Phase 2b: silently retry missing knolling/exploded images ───
  async function retryMissingImages(
    pw: ProductWorld,
    productImageUrl: string,
    existingKnolling: string,
    existingExploded: string
  ) {
    console.log('[retryMissingImages] Retrying missing views...');
    const body: Record<string, string> = { productPrompt: '' };
    if (!existingKnolling && pw.visualSystem.knollingViewPrompt) {
      body.knollingPrompt = pw.visualSystem.knollingViewPrompt;
    }
    if (!existingExploded && pw.visualSystem.explodedViewPrompt) {
      body.explodedPrompt = pw.visualSystem.explodedViewPrompt;
    }

    if (!body.knollingPrompt && !body.explodedPrompt) return;

    // Small delay before retrying to avoid rate limits
    await new Promise(r => setTimeout(r, 3000));

    try {
      const res = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productPrompt: '',
          knollingPrompt: body.knollingPrompt || '',
          explodedPrompt: body.explodedPrompt || '',
          referenceImageUrl: productImageUrl,
        }),
      });

      if (!res.ok) return;
      const images = await res.json();

      setWorld(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          visualSystem: {
            ...prev.visualSystem,
            knollingViewImageUrl: images.knollingViewImageUrl || prev.visualSystem.knollingViewImageUrl || '',
            explodedViewImageUrl: images.explodedViewImageUrl || prev.visualSystem.explodedViewImageUrl || '',
          },
        };
        sessionStorage.setItem('baw_world', JSON.stringify(updated));
        return updated;
      });
      console.log('[retryMissingImages] Retry complete',
        images.knollingViewImageUrl ? 'knolling:OK' : 'knolling:MISS',
        images.explodedViewImageUrl ? 'exploded:OK' : 'exploded:MISS'
      );
    } catch (e) {
      console.warn('[retryMissingImages] Retry failed silently:', e);
    }
  }

  // ── Phase 3: start all 4 video types in parallel (fire-and-forget) ─
  async function startAllVideos(pw: ProductWorld, productImageUrl: string) {
    const videoTypes = [
      { type: 'hero'     as const, prompt: pw.videoSystem.heroVideoPrompt },
      { type: 'action'   as const, prompt: pw.videoSystem.actionVideoPrompt },
      { type: 'artistic' as const, prompt: pw.videoSystem.artisticVideoPrompt },
      { type: 'animated' as const, prompt: pw.videoSystem.animatedVideoPrompt },
    ];

    console.log('[startAllVideos] Triggering all 4 video types...');

    const results = await Promise.allSettled(
      videoTypes.map(async ({ type, prompt }) => {
        const res = await fetch('/api/video/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, prompt, imageUrl: productImageUrl }),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(body || `HTTP ${res.status}`);
        }
        const { taskId } = await res.json();
        console.log(`[startAllVideos] ${type} submitted: ${taskId}`);
        return { type, taskId };
      })
    );

    const tasks: VideoTask[] = [];
    results.forEach((r, i) => {
      const { type, prompt } = videoTypes[i];
      if (r.status === 'fulfilled') {
        tasks.push({
          id: r.value.taskId,
          type,
          prompt,
          imageUrl: productImageUrl,
          status: 'pending',
        });
      } else {
        tasks.push({
          id: `failed-${type}-${Date.now()}`,
          type,
          prompt,
          imageUrl: productImageUrl,
          status: 'failed',
          errorMessage: r.reason?.message || 'Failed to submit video task',
        });
      }
    });

    setWorld(prev => {
      if (!prev) return prev;
      const newTypes = new Set(tasks.map(t => t.type));
      const updated = {
        ...prev,
        videoSystem: {
          ...prev.videoSystem,
          baseImageUrl: productImageUrl,
          videoTasks: [
            ...prev.videoSystem.videoTasks.filter(t => !newTypes.has(t.type)),
            ...tasks,
          ],
        },
      };
      sessionStorage.setItem('baw_world', JSON.stringify(updated));
      return updated;
    });
  }

  // ── Handlers ─────────────────────────────────────────────────────
  const handleComponentChange = useCallback(
    (componentName: string, optionLabel: string) => {
      if (!world) return;
      const updated = {
        ...world,
        selectedComponents: { ...world.selectedComponents, [componentName]: optionLabel },
      };
      setWorld(updated);
      sessionStorage.setItem('baw_world', JSON.stringify(updated));
    },
    [world]
  );

  const handleStyleChange = useCallback(
    (styleName: string) => {
      if (!world) return;
      const updated = { ...world, selectedStyle: styleName };
      setWorld(updated);
      sessionStorage.setItem('baw_world', JSON.stringify(updated));
    },
    [world]
  );

  const handleViewChange = useCallback(
    (view: VisualizationView) => {
      if (!world) return;
      const updated = {
        ...world,
        visualSystem: { ...world.visualSystem, currentView: view },
      };
      setWorld(updated);
    },
    [world]
  );

  const handleRegenerate = useCallback(async () => {
    if (!world) return;
    fetchImages(world);
  }, [world]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <LoadingOverlay visible={loading} step={step} />

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-600">
          {error} —{' '}
          <button className="underline" onClick={() => router.replace('/')}>
            Start over
          </button>
        </div>
      )}

      {world && !loading && (
        <>
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-[rgb(var(--color-fg-muted))]">
            <Link href="/" className="hover:text-[rgb(var(--color-fg))] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[rgb(var(--color-fg))] font-medium">
              {world.productOverview.productName}
            </span>
          </div>

          <ProductBuilder
            productWorld={world}
            loading={false}
            onComponentChange={handleComponentChange}
            onStyleChange={handleStyleChange}
            onViewChange={handleViewChange}
            onRegenerate={handleRegenerate}
          />

          {/* Next button */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/video"
              className="
                px-8 py-3 rounded-xl text-sm font-semibold
                bg-[rgb(var(--color-accent))] text-white
                hover:opacity-90 active:scale-[0.98]
                transition-all duration-200
                flex items-center gap-2
              "
              onClick={() => sessionStorage.setItem('baw_world', JSON.stringify(world))}
            >
              Next: Video Studio
              <span className="text-lg">→</span>
            </Link>
          </div>
        </>
      )}
    </>
  );
}
