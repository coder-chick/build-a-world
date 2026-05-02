'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductBuilder — 3-column dashboard shell.
// Assembles left (CustomizationPanel + StyleSelector),
// center (ProductVisualizer), right (product overview).
// ─────────────────────────────────────────────────────────────────────────────

import { ProductWorld, VisualizationView } from '@/types/productWorld';
import CustomizationPanel from './CustomizationPanel';
import StyleSelector from './StyleSelector';
import ProductVisualizer from './ProductVisualizer';

interface Props {
  productWorld: ProductWorld;
  loading: boolean;
  onComponentChange: (comp: string, opt: string) => void;
  onStyleChange: (style: string) => void;
  onViewChange: (view: VisualizationView) => void;
  onRegenerate: () => void;
}

export default function ProductBuilder({
  productWorld,
  loading,
  onComponentChange,
  onStyleChange,
  onViewChange,
  onRegenerate,
}: Props) {
  const { productOverview, selectedStyle, styles, visualSystem } = productWorld;
  const selectedStyleObj = styles.find((s) => s.name === selectedStyle);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 w-full">

      {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <aside className="
        glass-card flex flex-col gap-8 p-5
        rounded-2xl border border-white/10 bg-white/5
      ">
        <CustomizationPanel
          productWorld={productWorld}
          onComponentChange={onComponentChange}
          onRegenerate={onRegenerate}
          loading={loading}
        />
        <StyleSelector
          styles={styles}
          selected={selectedStyle}
          onSelect={onStyleChange}
        />
      </aside>

      {/* ── CENTER PANEL ────────────────────────────────────────────────────── */}
      <main className="flex items-start justify-center pt-2">
        <ProductVisualizer
          visualSystem={visualSystem}
          productName={productOverview.productName}
          onViewChange={onViewChange}
        />
      </main>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <aside className="
        glass-card flex flex-col gap-5 p-5
        rounded-2xl border border-white/10 bg-white/5
      ">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">
            Product
          </p>
          <h2 className="text-xl font-bold text-white leading-tight">
            {productOverview.productName}
          </h2>
          <p className="text-sm text-accent mt-1 italic">{productOverview.tagline}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
            Target User
          </p>
          <p className="text-sm text-white/70 leading-relaxed">{productOverview.targetUser}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
            Key Features
          </p>
          <ul className="flex flex-col gap-1.5">
            {productOverview.keyFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-0.5 text-accent">✦</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
            Breakthrough Innovation
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            {productOverview.breakthroughInnovation}
          </p>
        </div>

        {selectedStyleObj && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
              Applied Style
            </p>
            <div className="rounded-xl bg-white/5 px-3 py-2.5 text-xs text-white/60 space-y-1">
              <p><span className="text-white/80 font-medium">Style:</span> {selectedStyleObj.name}</p>
              <p><span className="text-white/80 font-medium">Feel:</span> {selectedStyleObj.productFeel}</p>
              <p><span className="text-white/80 font-medium">Lighting:</span> {selectedStyleObj.lightingDirection}</p>
              <div className="flex gap-1 pt-1">
                {selectedStyleObj.colorPalette.map((hex) => (
                  <div
                    key={hex}
                    className="w-5 h-5 rounded-full border border-white/20"
                    style={{ background: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
