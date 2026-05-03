'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductVisualizer — center panel showing product/knolling/exploded views
// with anime.js cross-fade transitions between views.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { VisualSystem, VisualizationView } from '@/types/productWorld';
import ViewToggle from './ViewToggle';

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
  onViewChange: (view: VisualizationView) => void;
}

export default function ProductVisualizer({ visualSystem, productName, onViewChange }: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  const prev = useRef<VisualizationView>(visualSystem.currentView);
  const prevUrl = useRef<string | undefined>(undefined);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const imageMap: Record<VisualizationView, string | undefined> = {
    product: visualSystem.productViewImageUrl,
    knolling: visualSystem.knollingViewImageUrl,
    exploded: visualSystem.explodedViewImageUrl,
  };
  const currentImageUrl = imageMap[visualSystem.currentView];

  // Reset imageLoaded when the view changes OR when a new URL arrives
  useEffect(() => {
    const viewChanged = prev.current !== visualSystem.currentView;
    const urlChanged = prevUrl.current !== currentImageUrl;

    if (viewChanged || urlChanged) {
      setImageLoaded(false);
      prev.current = visualSystem.currentView;
      prevUrl.current = currentImageUrl;
    }

    if (viewChanged && viewRef.current) {
      anime({
        targets: viewRef.current,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 400,
        easing: 'easeOutQuad',
      });
    }
  }, [visualSystem.currentView, currentImageUrl]);

  // Cycle through loading step messages while generating
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

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <ViewToggle current={visualSystem.currentView} onChange={onViewChange} />

      <div
        ref={viewRef}
        className="
          w-full aspect-square max-w-lg
          rounded-2xl border border-[rgb(var(--color-border))]
          bg-white
          overflow-hidden relative
          flex items-center justify-center
          shadow-sm
        "
      >
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10">
            {/* Shimmer skeleton */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                  animation: 'shimmer 2s infinite',
                }}
              />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-[3px] border-[rgb(var(--color-accent))]/20 flex items-center justify-center">
                  <div className="w-14 h-14 absolute border-[3px] border-transparent border-t-[rgb(var(--color-accent))] rounded-full animate-spin" />
                  <span className="text-2xl">
                    {visualSystem.currentView === 'product' && '📷'}
                    {visualSystem.currentView === 'knolling' && '📐'}
                    {visualSystem.currentView === 'exploded' && '💥'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-sm font-medium text-gray-700">
                  Building product visuals
                </p>
                <p className="text-xs text-gray-400 transition-opacity duration-500">
                  {LOADING_STEPS[loadingStep]}
                </p>
              </div>
              {/* Progress dots */}
              <div className="flex gap-1.5 mt-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-accent))]"
                    style={{
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                      opacity: 0.3,
                    }}
                  />
                ))}
              </div>
            </div>

            <style jsx>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.3); }
              }
            `}</style>
          </div>
        )}

        {currentImageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-[rgb(var(--color-accent))] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt={`${productName} - ${visualSystem.currentView} view`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </>
        ) : !isGenerating && (
          <div className="flex flex-col items-center gap-3 text-[rgb(var(--color-fg-muted))]">
            <div className="text-6xl opacity-30">
              {visualSystem.currentView === 'product' && '📷'}
              {visualSystem.currentView === 'knolling' && '📐'}
              {visualSystem.currentView === 'exploded' && '💥'}
            </div>
            <p className="text-sm">No image generated yet</p>
          </div>
        )}
      </div>

      <p className="text-lg font-semibold tracking-tight text-[rgb(var(--color-fg))]">
        {productName}
      </p>
    </div>
  );
}
