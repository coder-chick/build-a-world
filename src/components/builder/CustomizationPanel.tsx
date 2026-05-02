'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// CustomizationPanel — left panel with component dropdowns and Regenerate button.
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
      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
        Customise
      </h3>

      {customizationSystem.components.map((comp) => (
        <div key={comp.name} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/60">{comp.name}</label>
          <select
            value={selectedComponents[comp.name] ?? comp.options[0]?.name}
            onChange={(e) => onComponentChange(comp.name, e.target.value)}
            className="
              w-full px-3 py-2 rounded-xl text-sm
              bg-white/5 border border-white/10
              text-white
              focus:outline-none focus:border-accent/50
              transition-colors duration-200
              appearance-none cursor-pointer
            "
          >
            {comp.options.map((opt) => (
              <option
                key={opt.name}
                value={opt.name}
                className="bg-surface-dark text-white"
              >
                {opt.name}
              </option>
            ))}
          </select>
          {/* Show impact of selected option */}
          <p className="text-[11px] text-white/30 leading-snug">
            {comp.options.find((o) => o.name === selectedComponents[comp.name])?.functionalImpact ?? ''}
          </p>
        </div>
      ))}

      {/* Regenerate */}
      <button
        onClick={onRegenerate}
        disabled={loading}
        className="
          mt-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium
          border border-accent/30 text-accent
          hover:bg-accent/10 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        {loading ? '⟳ Regenerating…' : '⟳ Regenerate Visuals'}
      </button>
    </div>
  );
}
