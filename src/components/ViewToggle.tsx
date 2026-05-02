'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ViewToggle — pill toggle for Product / Knolling / Exploded views.
// ─────────────────────────────────────────────────────────────────────────────

import { VisualizationView } from '@/types/productWorld';

interface Props {
  current: VisualizationView;
  onChange: (view: VisualizationView) => void;
}

const VIEWS: { id: VisualizationView; label: string }[] = [
  { id: 'product',  label: 'Product'  },
  { id: 'knolling', label: 'Knolling' },
  { id: 'exploded', label: 'Exploded' },
];

export default function ViewToggle({ current, onChange }: Props) {
  return (
    <div className="
      inline-flex rounded-full p-1
      bg-white/5 border border-white/10
    ">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={`
            px-4 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${current === v.id
              ? 'bg-accent text-surface-dark shadow-neon'
              : 'text-white/50 hover:text-white'}
          `}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
