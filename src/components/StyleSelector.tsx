'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// StyleSelector — Creative Clusters dot-map UI matching hackathon screenshot.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductStyle } from '@/types/productWorld';
import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface Props {
  styles: ProductStyle[];
  selected: string;
  onSelect: (name: string) => void;
}

// Fixed cluster positions (percentage of container) matching screenshot layout
const POSITIONS: Record<string, { x: number; y: number }> = {
  Futurist:   { x: 42, y: 14 },
  'Sci-Fi':   { x: 68, y: 18 },
  Brutalist:  { x: 14, y: 28 },
  Maximalist: { x: 80, y: 26 },
  Minimalist: { x: 26, y: 36 },
  Naturalist: { x: 62, y: 36 },
  Industrial: { x: 16, y: 58 },
  Amorphic:   { x: 64, y: 54 },
  Vintage:    { x: 50, y: 64 },
  Handcrafted:{ x: 28, y: 72 },
  Organic:    { x: 46, y: 50 },
  Luxury:     { x: 78, y: 50 },
};

const DOT_COLOR: Record<string, string> = {
  Futurist:    '#84CC16',
  'Sci-Fi':    '#F9A8D4',
  Brutalist:   '#1C1C1C',
  Maximalist:  '#3B82F6',
  Minimalist:  '#F472B6',
  Naturalist:  '#065F46',
  Industrial:  '#EF4444',
  Amorphic:    '#22C55E',
  Vintage:     '#F97316',
  Handcrafted: '#DC2626',
  Organic:     '#78716C',
  Luxury:      '#D4AF37',
};

export default function StyleSelector({ styles, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate dots in on mount
  useEffect(() => {
    anime({
      targets: '.style-dot',
      scale:   [0, 1],
      opacity: [0, 1],
      delay:   anime.stagger(40),
      easing:  'easeOutBack',
      duration: 400,
    });
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        Style
      </h3>
      <p className="text-[11px]" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        Pick an aesthetic vibe to level up your product look.
      </p>

      {/* Cluster map */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden"
        style={{ background: 'rgb(var(--color-bg))', border: '1px solid rgb(var(--color-border) / 0.15)' }}
      >
        {/* Background scatter dots */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={`bg-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{ background: 'rgb(var(--color-border) / 0.2)',
              left: `${Math.random() * 90 + 5}%`,
              top:  `${Math.random() * 90 + 5}%`,
            }}
          />
        ))}

        {/* Named style nodes */}
        {styles.map((style) => {
          const pos = POSITIONS[style.name] ?? { x: 50, y: 50 };
          const color = DOT_COLOR[style.name] ?? '#6EE7F7';
          const isSelected = style.name === selected;

          return (
            <button
              key={style.name}
              onClick={() => {
                onSelect(style.name);
                anime({
                  targets: `#dot-${style.name.replace(/\s/g, '_')}`,
                  scale:   [1, 1.5, 1],
                  duration: 300,
                  easing:  'easeInOutBack',
                });
              }}
              className="style-dot absolute group flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div
                id={`dot-${style.name.replace(/\s/g, '_')}`}
                className="rounded-full transition-all duration-200"
                style={{
                  width:      isSelected ? 18 : 12,
                  height:     isSelected ? 18 : 12,
                  background: color,
                  boxShadow:  isSelected ? `0 0 12px 3px ${color}88` : 'none',
                }}
              />
              <span
                className="text-[10px] font-medium whitespace-nowrap transition-opacity duration-200"
                style={{
                  opacity: isSelected ? 1 : undefined,
                  color: 'rgb(var(--color-fg))',
                }}
              >
                {style.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected style summary */}
      {selected && (
        <div className="rounded-xl px-4 py-3 text-xs leading-relaxed" style={{ background: 'rgb(var(--color-bg))', border: '1px solid rgb(var(--color-border) / 0.12)', color: 'rgb(var(--color-fg))' }}>
          <span className="font-semibold" style={{ color: 'rgb(var(--color-fg))' }}>{selected}: </span>
          {styles.find((s) => s.name === selected)?.productFeel ?? ''}
        </div>
      )}
    </div>
  );
}
