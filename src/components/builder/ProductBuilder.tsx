'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductBuilder — 2-column layout: left (customization panel),
// center (ProductVisualizer with product images).
// Right panel (product info) integrated below the image on mobile.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductWorld, VisualizationView } from '@/types/productWorld';
import CustomizationPanel from './CustomizationPanel';
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
  const { productOverview, visualSystem } = productWorld;

  const handleComponentChange = (name: string, value: string) => {
    if (name === '__style__') {
      onStyleChange(value);
    } else {
      onComponentChange(name, value);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 w-full">

      {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <aside className="
        card flex flex-col gap-6 p-5
        rounded-2xl border border-[rgb(var(--color-border))]
        bg-[rgb(var(--color-card))]
        h-fit lg:sticky lg:top-24
      ">
        <CustomizationPanel
          productWorld={productWorld}
          onComponentChange={handleComponentChange}
          onRegenerate={onRegenerate}
          loading={loading}
        />
      </aside>

      {/* ── CENTER PANEL ────────────────────────────────────────────────────── */}
      <main className="flex flex-col items-center gap-6">
        <ProductVisualizer
          visualSystem={visualSystem}
          productName={productOverview.productName}
          onViewChange={onViewChange}
        />

        {/* Product info below the image */}
        <div className="w-full max-w-lg space-y-4 px-2">
          <div>
            <p className="text-sm text-[rgb(var(--color-fg-muted))]">
              {productOverview.tagline}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {productOverview.keyFeatures.slice(0, 4).map((f) => (
              <span
                key={f}
                className="text-xs px-2.5 py-1 rounded-full bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
