'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// CustomizationPanel — left panel: component dropdowns + regenerate button.
// Style selection is handled by StyleSelector (separate component below this).
// ─────────────────────────────────────────────────────────────────────────────

import { ProductWorld } from '@/types/productWorld';

interface Props {
  productWorld: ProductWorld;
  onComponentChange: (componentName: string, optionName: string) => void;
  onRegenerate: () => void;
  loading?: boolean;
}

export default function CustomizationPanel({
  productWorld,
  onComponentChange,
  onRegenerate,
  loading,
}: Props) {
  const { customizationSystem, selectedComponents } = productWorld;

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        Customise
      </h3>

      {customizationSystem.components.map((comp) => (
        <div key={comp.name} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'rgb(var(--color-fg-muted))' }}>{comp.name}</label>
          <select
            value={selectedComponents[comp.name] ?? comp.options[0]?.name}
            onChange={(e) => onComponentChange(comp.name, e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-colors duration-200 appearance-none cursor-pointer"
            style={{
              background: 'rgb(var(--color-bg))',
              border: '1px solid rgb(var(--color-border) / 0.2)',
              color: 'rgb(var(--color-fg))',
            }}
          >
            {comp.options.map((opt) => (
              <option key={opt.name} value={opt.name}>{opt.name}</option>
            ))}
          </select>
          <p className="text-[11px] leading-snug" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            {comp.options.find((o) => o.name === selectedComponents[comp.name])?.functionalImpact ?? ''}
          </p>
        </div>
      ))}

      <button
        onClick={onRegenerate}
        disabled={loading}
        className="mt-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium border border-accent/30 text-accent hover:bg-accent/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? '\u27F3 Regenerating\u2026' : '\u27F3 Regenerate Visuals'}
      </button>
    </div>
  );
}
