'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// LoadingOverlay — full-screen generation animation shown during
// generateProductWorld() call.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import anime from 'animejs';

const STEPS = [
  'Analysing product idea…',
  'Running Product Strategy Agent…',
  'Generating customization options…',
  'Creating 9 style directions…',
  'Building visual prompts…',
  'Crafting video prompts…',
  'Assembling GTM kit…',
  'Finalising social launch…',
  'Saving to Butterbase…',
];

interface Props {
  visible: boolean;
  step?: number;
}

export default function LoadingOverlay({ visible, step = 0 }: Props) {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !ringRef.current) return;
    anime({
      targets:  ringRef.current,
      rotate:   [0, 360],
      duration: 1200,
      loop:     true,
      easing:   'linear',
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
      style={{ background: 'rgb(var(--color-bg) / 0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      {/* Spinning ring */}
      <div
        ref={ringRef}
        className="w-20 h-20 rounded-full border-4"
        style={{
          borderColor: 'rgba(6,182,212,0.15)',
          borderTopColor: '#06B6D4',
          boxShadow: '0 0 40px rgba(6,182,212,0.2)',
        }}
      />

      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-fg mb-1">Building Your World</h2>
        <p className="text-sm text-fg-muted animate-pulse-soft">
          {STEPS[Math.min(step, STEPS.length - 1)]}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ background: i <= step ? '#06B6D4' : 'rgb(var(--color-border) / 0.2)' }}
          />
        ))}
      </div>
    </div>
  );
}
