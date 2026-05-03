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
    <div
      className="inline-flex rounded-full p-1"
      style={{
        background: 'rgb(var(--color-bg))',
        border: '1px solid rgb(var(--color-border) / 0.3)',
      }}
    >
      {VIEWS.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
          style={
            current === v.id
              ? { background: '#06B6D4', color: '#0F1117', boxShadow: '0 0 10px rgba(6,182,212,0.4)' }
              : { color: 'rgb(var(--color-fg-muted))', background: 'transparent' }
          }
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
