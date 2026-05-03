'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// CustomizationPanel — left panel: product family, style, color options (3),
// and an edit box for minor product tweaks. Matches "AI Design Workshop" ref.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
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
  const { customizationSystem, selectedComponents, styles, selectedStyle } = productWorld;
  const [editText, setEditText] = useState('');

  const colorComponent = customizationSystem.components.find(
    (c) => c.name.toLowerCase().includes('color') || c.name.toLowerCase().includes('colour')
  );
  const otherComponents = customizationSystem.components.filter(
    (c) => c !== colorComponent
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-[rgb(var(--color-fg))]">
          AI Design Workshop
        </h2>
        <p className="text-xs text-[rgb(var(--color-fg-muted))] mt-0.5">
          Make it yours
        </p>
      </div>

      {/* Product family / other component dropdowns */}
      {otherComponents.map((comp) => (
        <div key={comp.name} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-fg-muted))]">
            {comp.name}
          </label>
          <select
            value={selectedComponents[comp.name] ?? comp.options[0]?.name}
            onChange={(e) => onComponentChange(comp.name, e.target.value)}
            className="
              w-full px-3 py-2.5 rounded-xl text-sm
              bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]
              text-[rgb(var(--color-fg))]
              focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/30
              transition-all duration-200
              appearance-none cursor-pointer
            "
          >
            {comp.options.map((opt) => (
              <option key={opt.name} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Style selector (simplified dropdown) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-fg-muted))]">
          Style
        </label>
        <select
          value={selectedStyle}
          onChange={(e) => onComponentChange('__style__', e.target.value)}
          className="
            w-full px-3 py-2.5 rounded-xl text-sm
            bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]
            text-[rgb(var(--color-fg))]
            focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/30
            transition-all duration-200
            appearance-none cursor-pointer
          "
        >
          {styles.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Color options (show max 3 as swatches + radio) */}
      {colorComponent && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-fg-muted))]">
            {colorComponent.name}
          </label>
          <div className="flex gap-3">
            {colorComponent.options.slice(0, 3).map((opt) => {
              const isSelected = selectedComponents[colorComponent.name] === opt.name;
              return (
                <button
                  key={opt.name}
                  onClick={() => onComponentChange(colorComponent.name, opt.name)}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all duration-200
                    ${isSelected
                      ? 'border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent))]/5 shadow-sm'
                      : 'border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))]/40'
                    }
                  `}
                  title={opt.visualDescription}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ background: getColorFromName(opt.name) }}
                  />
                  <span className="text-[10px] text-[rgb(var(--color-fg-muted))] whitespace-nowrap">
                    {opt.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit box for small product updates */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-fg-muted))]">
          Refine
        </label>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder='Try "Add a pop of neon"'
          rows={2}
          className="
            w-full px-3 py-2.5 rounded-xl text-sm resize-none
            bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]
            text-[rgb(var(--color-fg))] placeholder-[rgb(var(--color-fg-muted))]
            focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/30
            transition-all duration-200
          "
        />
      </div>

      {/* Regenerate */}
      <button
        onClick={onRegenerate}
        disabled={loading}
        className="
          w-full px-4 py-2.5 rounded-xl text-sm font-medium
          bg-[rgb(var(--color-accent))] text-white
          hover:opacity-90 active:scale-[0.98]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Regenerating...
          </>
        ) : (
          '⟳ Regenerate'
        )}
      </button>
    </div>
  );
}

function getColorFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('black')) return '#1a1a1a';
  if (lower.includes('white')) return '#f5f5f5';
  if (lower.includes('red')) return '#ef4444';
  if (lower.includes('blue')) return '#3b82f6';
  if (lower.includes('green')) return '#22c55e';
  if (lower.includes('yellow')) return '#eab308';
  if (lower.includes('orange')) return '#f97316';
  if (lower.includes('purple')) return '#a855f7';
  if (lower.includes('pink')) return '#ec4899';
  if (lower.includes('gold')) return '#d4af37';
  if (lower.includes('silver')) return '#9ca3af';
  if (lower.includes('teal')) return '#14b8a6';
  if (lower.includes('navy')) return '#1e3a5f';
  if (lower.includes('coral')) return '#f87171';
  if (lower.includes('neon')) return '#84cc16';
  if (lower.includes('matte')) return '#6b7280';
  if (lower.includes('chrome')) return '#d1d5db';
  return '#6b7280';
}
