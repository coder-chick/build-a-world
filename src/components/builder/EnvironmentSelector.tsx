'use client';

import { EnvironmentPreset } from '@/types/productWorld';
import { useEffect, useRef } from 'react';
import anime from 'animejs';

export const ENVIRONMENTS: EnvironmentPreset[] = [
  {
    id: 'studio-white',
    name: 'Studio White',
    description: 'Clean, professional',
    promptSuffix: 'clean white cyclorama studio, soft-box lighting, professional product photography, pure white background, sharp shadows',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  },
  {
    id: 'dark-dramatic',
    name: 'Dark Dramatic',
    description: 'Moody, cinematic',
    promptSuffix: 'dark moody studio environment, dramatic rim lighting, deep shadows, cinematic noir aesthetic, black background, teal accent light',
    gradient: 'linear-gradient(135deg, #0F1117 0%, #1e293b 100%)',
  },
  {
    id: 'urban-street',
    name: 'Urban Street',
    description: 'Raw, authentic',
    promptSuffix: 'urban city street environment, neon sign reflections on wet pavement, city lights bokeh, concrete textures, authentic street photography',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm, aspirational',
    promptSuffix: 'golden hour outdoor setting, warm sunlight at 15 degrees, long shadows, natural organic environment, aspirational lifestyle feel',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
  },
  {
    id: 'luxury-marble',
    name: 'Luxury Marble',
    description: 'Premium, editorial',
    promptSuffix: 'luxury white marble surface, soft diffused studio lighting, gold and chrome accents, premium editorial product photography, high fashion aesthetic',
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #d4af37 100%)',
  },
  {
    id: 'digital-void',
    name: 'Digital Void',
    description: 'Futuristic, abstract',
    promptSuffix: 'infinite digital void, holographic particle effects, floating in cyberspace, glowing neon grid lines, sci-fi abstract environment, translucent surfaces',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 50%, #8B5CF6 100%)',
  },
];

interface Props {
  selected: string | undefined;
  onSelect: (id: string) => void;
}

export default function EnvironmentSelector({ selected, onSelect }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    anime({
      targets: '.env-card',
      opacity: [0, 1],
      translateY: [8, 0],
      delay: anime.stagger(60),
      easing: 'easeOutQuad',
      duration: 300,
    });
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          Environment
        </h3>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">
          Applied to images &amp; videos
        </span>
      </div>

      <div ref={rowRef} className="grid grid-cols-3 gap-2">
        {ENVIRONMENTS.map((env) => {
          const isSelected = selected === env.id;
          return (
            <button
              key={env.id}
              onClick={() => onSelect(env.id)}
              className={`env-card relative flex flex-col items-start gap-1 p-2 rounded-xl border transition-all duration-200 text-left ${
                isSelected
                  ? 'border-accent shadow-neon-sm scale-[1.02]'
                  : 'border-border/30 hover:border-accent/40 hover:scale-[1.01]'
              }`}
              style={{ background: 'rgb(var(--color-card))' }}
            >
              <div className="w-full h-10 rounded-lg mb-1" style={{ background: env.gradient }} />
              <p className="text-[11px] font-semibold leading-tight" style={{ color: 'rgb(var(--color-fg))' }}>
                {env.name}
              </p>
              <p className="text-[10px]" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                {env.description}
              </p>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">&#10004;</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}