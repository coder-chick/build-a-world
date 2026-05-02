'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductVisualizer — center panel.
// • Auto-generates product image via /api/image (CogView-3) on mount.
// • Lazy-generates knolling + exploded images when the user switches views.
// • Exploded view: shows image with interactive component chips below.
// • Generated image URLs are passed up to parent for the video pipeline.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react';
import anime from 'animejs';
import { VisualSystem, VisualizationView, ProductComponent } from '@/types/productWorld';
import ViewToggle from './ViewToggle';

interface Props {
  visualSystem: VisualSystem;
  productName: string;
  components: ProductComponent[];          // for interactive exploded hotspots
  environmentSuffix?: string;              // appended to every image prompt
  onViewChange: (view: VisualizationView) => void;
  onImagesGenerated?: (imgs: { product?: string; knolling?: string; exploded?: string }) => void;
}

const VIEW_LABELS: Record<VisualizationView, string> = {
  product:  'Product Render',
  knolling: 'Knolling View',
  exploded: 'Exploded View',
};

const VIEW_EMOJIS: Record<VisualizationView, string> = {
  product:  '📷',
  knolling: '🔲',
  exploded: '💥',
};

export default function ProductVisualizer({
  visualSystem,
  productName,
  components,
  environmentSuffix,
  onViewChange,
  onImagesGenerated,
}: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  const prevView = useRef<VisualizationView>(visualSystem.currentView);

  // Image URLs per view — initialised from any already-generated images
  const [images, setImages] = useState<Record<VisualizationView, string | null>>({
    product:  visualSystem.generatedImages?.product  ?? null,
    knolling: visualSystem.generatedImages?.knolling ?? null,
    exploded: visualSystem.generatedImages?.exploded ?? null,
  });
  const [generating, setGenerating] = useState<Record<VisualizationView, boolean>>({
    product: false, knolling: false, exploded: false,
  });
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  // Prompt per view, optionally extended with the chosen environment
  const promptMap: Record<VisualizationView, string> = {
    product:  [visualSystem.productViewPrompt,  environmentSuffix].filter(Boolean).join(', '),
    knolling: [visualSystem.knollingViewPrompt, environmentSuffix].filter(Boolean).join(', '),
    exploded: [visualSystem.explodedViewPrompt, environmentSuffix].filter(Boolean).join(', '),
  };

  // Always-fresh ref so the callback never has a stale prompt
  const promptMapRef = useRef(promptMap);
  promptMapRef.current = promptMap;

  // Always-fresh ref for the callback prop
  const onImagesGeneratedRef = useRef(onImagesGenerated);
  onImagesGeneratedRef.current = onImagesGenerated;

  // Synchronous in-flight guard — state updates are batched so we need a ref
  const inFlightRef = useRef<Set<VisualizationView>>(new Set());

  // ── Generate one image view ─────────────────────────────────────────────
  const generateImage = useCallback(async (view: VisualizationView) => {
    if (inFlightRef.current.has(view)) return; // hard guard: prevents concurrent duplicate fetches
    const prompt = promptMapRef.current[view];
    if (!prompt) return; // prompts not ready yet

    inFlightRef.current.add(view);
    setGenerating((g) => ({ ...g, [view]: true }));

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '1024x1024' }),
      });
      if (!res.ok) {
        console.error('[ProductVisualizer] /api/image error', res.status);
        return;
      }
      const data = (await res.json()) as { url?: string };
      const url = data.url ?? null;
      if (!url) return;
      setImages((prev) => ({ ...prev, [view]: url }));
    } catch (err) {
      console.error('[ProductVisualizer] generateImage failed', err);
    } finally {
      inFlightRef.current.delete(view);
      setGenerating((g) => ({ ...g, [view]: false }));
    }
  }, []); // stable — uses refs for all mutable values

  // Notify parent whenever at least one image URL is available
  useEffect(() => {
    if (!images.product && !images.knolling && !images.exploded) return; // skip initial null state
    onImagesGeneratedRef.current?.({
      product:  images.product  ?? undefined,
      knolling: images.knolling ?? undefined,
      exploded: images.exploded ?? undefined,
    });
  }, [images]);

  // Generate product image once the prompt is available (mount + prompt-ready safety)
  useEffect(() => {
    if (!visualSystem.productViewPrompt) return;
    if (images.product) return; // already have it
    generateImage('product');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualSystem.productViewPrompt]);

  // Lazy-generate when user switches to a new view that hasn't been generated yet
  useEffect(() => {
    if (images[visualSystem.currentView]) return; // already have it
    generateImage(visualSystem.currentView);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualSystem.currentView]);

  // Regenerate all images when environment changes
  const prevEnv = useRef(environmentSuffix);
  useEffect(() => {
    if (prevEnv.current === environmentSuffix) return;
    prevEnv.current = environmentSuffix;
    inFlightRef.current.clear();
    setImages({ product: null, knolling: null, exploded: null });
    setActiveComponent(null);
    // Use setTimeout so cleared state is flushed before we re-generate
    setTimeout(() => generateImage(visualSystem.currentView), 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentSuffix]);

  // Cross-fade animation on view change
  useEffect(() => {
    if (prevView.current === visualSystem.currentView) return;
    prevView.current = visualSystem.currentView;
    setActiveComponent(null);
    if (viewRef.current) {
      anime({
        targets: viewRef.current,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 380,
        easing: 'easeOutQuad',
      });
    }
  }, [visualSystem.currentView]);

  const currentImage = images[visualSystem.currentView];
  const isGenerating = generating[visualSystem.currentView];
  const isExploded = visualSystem.currentView === 'exploded';
  const activeDesc = isExploded && activeComponent
    ? (components.find((c) => c.name === activeComponent)?.options[0]?.visualDescription ?? '')
    : '';

  return (
    <div className="flex flex-col gap-4 items-center w-full max-w-lg">
      {/* View toggle */}
      <ViewToggle current={visualSystem.currentView} onChange={onViewChange} />

      {/* Main visualization area */}
      <div
        ref={viewRef}
        className="relative w-full aspect-square rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgb(var(--color-border) / 0.15)',
          background: 'rgb(var(--color-card))',
          boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        }}
      >
        {/* Real generated image */}
        {currentImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImage}
            alt={`${productName} — ${VIEW_LABELS[visualSystem.currentView]}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Prompt card fallback (shown while generating or if image failed) */}
        {!currentImage && !isGenerating && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6"
            style={{ background: 'linear-gradient(135deg, rgb(var(--color-card)) 0%, rgb(var(--color-bg)) 100%)' }}
          >
            <span className="text-4xl">{VIEW_EMOJIS[visualSystem.currentView]}</span>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              {VIEW_LABELS[visualSystem.currentView]}
            </p>
            <p className="text-sm text-center leading-relaxed max-w-xs" style={{ color: 'rgb(var(--color-fg))' }}>
              {promptMap[visualSystem.currentView]}
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent">AI Visual Prompt</span>
          </div>
        )}

        {/* Generating spinner overlay */}
        {isGenerating && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(15,17,23,0.72)', backdropFilter: 'blur(4px)' }}
          >
            <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            <p className="text-xs font-medium text-accent">Generating image…</p>
          </div>
        )}

        {/* Regenerate button (top-right) */}
        {!isGenerating && (
          <button
            onClick={() => {
              const view = visualSystem.currentView;
              inFlightRef.current.delete(view); // allow re-fetch
              setImages((prev) => ({ ...prev, [view]: null }));
              generateImage(view);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(6,182,212,0.15)',
              border: '1px solid rgba(6,182,212,0.35)',
              color: '#06B6D4',
              fontSize: '16px',
            }}
            title="Regenerate this view"
          >
            ↺
          </button>
        )}

        {/* Download image button */}
        {currentImage && !isGenerating && (
          <a
            href={currentImage}
            download={`${productName}-${visualSystem.currentView}.jpg`}
            className="absolute top-3 right-14 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(6,182,212,0.15)',
              border: '1px solid rgba(6,182,212,0.35)',
              color: '#06B6D4',
              fontSize: '14px',
              textDecoration: 'none',
            }}
            title="Download image"
          >
            ⬇
          </a>
        )}

        {/* Copy image button */}
        {currentImage && !isGenerating && (
          <button
            onClick={async () => {
              try {
                const res = await fetch(currentImage);
                const blob = await res.blob();
                await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
              } catch {
                // Fallback: copy data URL as text
                await navigator.clipboard.writeText(currentImage);
              }
            }}
            className="absolute top-3 right-[6.25rem] w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(6,182,212,0.15)',
              border: '1px solid rgba(6,182,212,0.35)',
              color: '#06B6D4',
              fontSize: '13px',
            }}
            title="Copy image"
          >
            📋
          </button>
        )}

        {/* Neon corner accents */}
        <div className="pointer-events-none absolute top-0 left-0 w-12 h-12 rounded-tl-2xl border-t-2 border-l-2 border-accent/30" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-12 h-12 rounded-br-2xl border-b-2 border-r-2 border-accent/30" />
      </div>

      {/* Product name + view label */}
      <p className="text-base font-semibold tracking-tight" style={{ color: 'rgb(var(--color-fg))' }}>
        {productName}
        <span className="ml-2 text-xs font-normal" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          — {VIEW_LABELS[visualSystem.currentView]}
        </span>
      </p>

      {/* ── Interactive component chips (exploded view only) ─────────── */}
      {isExploded && components.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Tap a component to inspect
          </p>
          <div className="flex flex-wrap gap-1.5">
            {components.map((comp) => (
              <button
                key={comp.name}
                onClick={() => setActiveComponent(activeComponent === comp.name ? null : comp.name)}
                className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150"
                style={
                  activeComponent === comp.name
                    ? { background: '#06B6D4', color: '#fff', borderColor: '#06B6D4', boxShadow: '0 0 10px rgba(6,182,212,0.4)', transform: 'scale(1.05)' }
                    : { background: 'rgb(var(--color-card))', color: 'rgb(var(--color-fg))', borderColor: 'rgb(var(--color-border) / 0.3)' }
                }
              >
                {comp.name}
              </button>
            ))}
          </div>
          {activeComponent && activeDesc && (
            <div
              className="rounded-xl p-3 text-xs leading-relaxed"
              style={{
                background: 'rgb(var(--color-card))',
                border: '1px solid rgba(6,182,212,0.25)',
                color: 'rgb(var(--color-fg))',
              }}
            >
              <span className="font-semibold text-accent">{activeComponent}:</span> {activeDesc}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

