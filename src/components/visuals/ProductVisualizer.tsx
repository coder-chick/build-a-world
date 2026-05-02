'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductVisualizer — center panel showing product/knolling/exploded views
// with anime.js cross-fade transitions between views.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { VisualSystem, VisualizationView } from '@/types/productWorld';
import ViewToggle from './ViewToggle';

interface Props {
  visualSystem: VisualSystem;
  productName: string;
  onViewChange: (view: VisualizationView) => void;
}

const VIEW_LABELS: Record<VisualizationView, string> = {
  product:  '📷 Product Render',
  knolling: '🔲 Knolling View',
  exploded: '💥 Exploded View',
};

const VIEW_ICONS: Record<VisualizationView, string> = {
  product:  '🖼️',
  knolling: '📐',
  exploded: '⚡',
};

export default function ProductVisualizer({ visualSystem, productName, onViewChange }: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  const prev = useRef<VisualizationView>(visualSystem.currentView);

  // Animate on view change
  useEffect(() => {
    if (prev.current === visualSystem.currentView) return;
    prev.current = visualSystem.currentView;

    if (viewRef.current) {
      anime({
        targets:   viewRef.current,
        opacity:   [0, 1],
        translateY: [12, 0],
        duration:  400,
        easing:    'easeOutQuad',
      });
    }
  }, [visualSystem.currentView]);

  const promptMap: Record<VisualizationView, string> = {
    product:  visualSystem.productViewPrompt,
    knolling: visualSystem.knollingViewPrompt,
    exploded: visualSystem.explodedViewPrompt,
  };

  const currentPrompt = promptMap[visualSystem.currentView];

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Toggle */}
      <ViewToggle current={visualSystem.currentView} onChange={onViewChange} />

      {/* Visualization area */}
      <div
        ref={viewRef}
        className="
          w-full aspect-square max-w-md
          rounded-2xl border border-white/10
          bg-gradient-to-br from-white/5 to-white/0
          backdrop-blur-sm overflow-hidden
          relative flex flex-col items-center justify-center gap-4
          shadow-glass
        "
      >
        {/* Big icon placeholder — replace with real generated image */}
        <div className="text-8xl select-none">
          {VIEW_ICONS[visualSystem.currentView]}
        </div>

        {/* View label */}
        <p className="text-sm font-semibold text-white/70">
          {VIEW_LABELS[visualSystem.currentView]}
        </p>

        {/* Prompt hint */}
        <p className="absolute bottom-4 left-4 right-4 text-[10px] text-white/25 leading-relaxed line-clamp-3">
          Prompt: {currentPrompt}
        </p>

        {/* Neon corner accent */}
        <div className="absolute top-0 left-0 w-16 h-16 rounded-tl-2xl border-t-2 border-l-2 border-accent/30" />
        <div className="absolute bottom-0 right-0 w-16 h-16 rounded-br-2xl border-b-2 border-r-2 border-accent/30" />
      </div>

      {/* Product name */}
      <p className="text-lg font-semibold tracking-tight text-white/90">{productName}</p>
    </div>
  );
}
