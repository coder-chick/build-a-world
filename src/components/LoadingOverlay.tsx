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
    <div className="
      fixed inset-0 z-50
      bg-surface-darker/90 backdrop-blur-md
      flex flex-col items-center justify-center gap-8
    ">
      {/* Spinning ring */}
      <div
        ref={ringRef}
        className="w-24 h-24 rounded-full border-4 border-accent/20 border-t-accent"
        style={{ boxShadow: '0 0 40px 8px rgba(110,231,247,0.15)' }}
      />

      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Building Your World</h2>
        <p className="text-sm text-accent animate-pulse-soft">
          {STEPS[Math.min(step, STEPS.length - 1)]}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-accent' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
