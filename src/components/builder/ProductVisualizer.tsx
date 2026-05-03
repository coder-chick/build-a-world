'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductVisualizer — center panel showing product/knolling/exploded views
// with anime.js cross-fade transitions, regenerate/download/copy actions,
// and interactive component chips for exploded view.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { VisualSystem, VisualizationView, ProductComponent } from '@/types/productWorld';
import ViewToggle from './ViewToggle';

const VIEW_LABELS: Record<VisualizationView, string> = {
  product: 'Product Render',
  knolling: 'Knolling View',
  exploded: 'Exploded View',
};

const VIEW_EMOJIS: Record<VisualizationView, string> = {
  product: '📷',
  knolling: '🔲',
  exploded: '💥',
};

const LOADING_STEPS = [
  'Analysing product design...',
  'Building visual composition...',
  'Rendering product visuals...',
  'Applying style & lighting...',
  'Generating high-res image...',
  'Almost there...',
];

interface Props {
  visualSystem: VisualSystem;
  productName: string;
  components?: ProductComponent[];
  onViewChange: (view: VisualizationView) => void;
  onRegenerate?: () => void;
}

export default function ProductVisualizer({
  visualSystem,
  productName,
  components = [],
  onViewChange,
  onRegenerate,
}: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  const prev = useRef<VisualizationView>(visualSystem.currentView);
  const prevUrl = useRef<string | undefined>(undefined);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const imageMap: Record<VisualizationView, string | undefined> = {
    product: visualSystem.productViewImageUrl,
    knolling: visualSystem.knollingViewImageUrl,
    exploded: visualSystem.explodedViewImageUrl,
  };
  const currentImageUrl = imageMap[visualSystem.currentView];

  useEffect(() => {
    const viewChanged = prev.current !== visualSystem.currentView;
    const urlChanged = prevUrl.current !== currentImageUrl;

    if (viewChanged || urlChanged) {
      setImageLoaded(false);
      prev.current = visualSystem.currentView;
      prevUrl.current = currentImageUrl;
    }

    if (viewChanged) {
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
    }
  }, [visualSystem.currentView, currentImageUrl]);

  useEffect(() => {
    if (visualSystem.imageGenStatus !== 'generating') {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % LOADING_STEPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [visualSystem.imageGenStatus]);

  const isGenerating = visualSystem.imageGenStatus === 'generating' && !currentImageUrl;
  const isExploded = visualSystem.currentView === 'exploded';
  const activeDesc = isExploded && activeComponent
    ? (components.find(c => c.name === activeComponent)?.options[0]?.visualDescription ?? '')
    : '';

  return (
    <div className="flex flex-col gap-4 items-center w-full max-w-lg">
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
        {/* Generated image */}
        {currentImageUrl && (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10"
                style={{ background: 'rgba(15,17,23,0.72)', backdropFilter: 'blur(4px)' }}>
                <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt={`${productName} — ${VIEW_LABELS[visualSystem.currentView]}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </>
        )}

        {/* Prompt fallback when no image and not generating */}
        {!currentImageUrl && !isGenerating && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6"
            style={{ background: 'linear-gradient(135deg, rgb(var(--color-card)) 0%, rgb(var(--color-bg)) 100%)' }}
          >
            <span className="text-4xl">{VIEW_EMOJIS[visualSystem.currentView]}</span>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              {VIEW_LABELS[visualSystem.currentView]}
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent">
              Waiting for generation...
            </span>
          </div>
        )}

        {/* Generating spinner overlay */}
        {isGenerating && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
            style={{ background: 'rgba(15,17,23,0.72)', backdropFilter: 'blur(4px)' }}
          >
            <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            <p className="text-xs font-medium text-accent">Generating image…</p>
            <p className="text-[10px] text-white/50 transition-opacity duration-500">
              {LOADING_STEPS[loadingStep]}
            </p>
          </div>
        )}

        {/* Action buttons (top-right) */}
        {currentImageUrl && !isGenerating && imageLoaded && (
          <div className="absolute top-3 right-3 flex gap-2 z-20">
            {/* Regenerate */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)', color: '#06B6D4' }}
                title="Regenerate"
              >
                ↻
              </button>
            )}
            {/* Download */}
            <a
              href={currentImageUrl}
              download={`${productName}-${visualSystem.currentView}.jpg`}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 text-sm no-underline"
              style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)', color: '#06B6D4' }}
              title="Download image"
            >
              ⬇
            </a>
            {/* Copy URL */}
            <button
              onClick={() => navigator.clipboard.writeText(currentImageUrl)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 text-xs"
              style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)', color: '#06B6D4' }}
              title="Copy image URL"
            >
              📋
            </button>
          </div>
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

      {/* Interactive component chips (exploded view only) */}
      {isExploded && components.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Tap a component to inspect
          </p>
          <div className="flex flex-wrap gap-1.5">
            {components.map(comp => (
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
              style={{ background: 'rgb(var(--color-card))', border: '1px solid rgba(6,182,212,0.25)', color: 'rgb(var(--color-fg))' }}
            >
              <span className="font-semibold text-accent">{activeComponent}:</span> {activeDesc}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
