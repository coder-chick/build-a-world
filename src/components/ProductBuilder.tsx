'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// ProductBuilder — 3-column dashboard shell.
// Assembles left (CustomizationPanel + StyleSelector),
// center (ProductVisualizer + EnvironmentSelector),
// right (product overview).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { ProductWorld, VisualizationView } from '@/types/productWorld';
import CustomizationPanel from './CustomizationPanel';
import StyleSelector from './StyleSelector';
import ProductVisualizer from './ProductVisualizer';
import EnvironmentSelector, { ENVIRONMENTS } from './EnvironmentSelector';

interface Props {
  productWorld: ProductWorld;
  loading: boolean;
  onComponentChange: (comp: string, opt: string) => void;
  onStyleChange: (style: string) => void;
  onViewChange: (view: VisualizationView) => void;
  onRegenerate: () => void;
  onImagesGenerated?: (imgs: { product?: string; knolling?: string; exploded?: string }) => void;
}

export default function ProductBuilder({
  productWorld,
  loading,
  onComponentChange,
  onStyleChange,
  onViewChange,
  onRegenerate,
  onImagesGenerated,
}: Props) {
  const { productOverview, selectedStyle, styles, visualSystem, customizationSystem } = productWorld;
  const selectedStyleObj = styles.find((s) => s.name === selectedStyle);

  // Local view state — keeps the toggle working without needing parent to store it
  const [currentView, setCurrentView] = useState<VisualizationView>(visualSystem.currentView ?? 'product');
  const activeVisualSystem = { ...visualSystem, currentView };

  // Environment selection — lifted here so VideoStudio can receive it
  const [selectedEnvId, setSelectedEnvId] = useState<string | undefined>(
    visualSystem.selectedEnvironment
  );
  const selectedEnv = ENVIRONMENTS.find((e) => e.id === selectedEnvId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 w-full">

      {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col gap-8 p-5 rounded-2xl"
        style={{
          border: '1px solid rgb(var(--color-border) / 0.15)',
          background: 'rgb(var(--color-card))',
        }}
      >
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
      <main className="flex flex-col items-center gap-6 pt-2">
        <ProductVisualizer
          visualSystem={activeVisualSystem}
          productName={productOverview.productName}
          components={customizationSystem?.components ?? []}
          environmentSuffix={selectedEnv?.promptSuffix}
          onViewChange={(v) => { setCurrentView(v); onViewChange(v); }}
          onImagesGenerated={onImagesGenerated}
        />
        <EnvironmentSelector
          selected={selectedEnvId}
          onSelect={setSelectedEnvId}
        />
      </main>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col gap-5 p-5 rounded-2xl"
        style={{
          border: '1px solid rgb(var(--color-border) / 0.15)',
          background: 'rgb(var(--color-card))',
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Product
          </p>
          <h2 className="text-xl font-bold leading-tight" style={{ color: 'rgb(var(--color-fg))' }}>
            {productOverview.productName}
          </h2>
          <p className="text-sm text-accent mt-1 italic">{productOverview.tagline}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Target User
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg))' }}>{productOverview.targetUser}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Key Features
          </p>
          <ul className="flex flex-col gap-1.5">
            {productOverview.keyFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgb(var(--color-fg))' }}>
                <span className="mt-0.5 text-accent">✦</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Breakthrough Innovation
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg))' }}>
            {productOverview.breakthroughInnovation}
          </p>
        </div>

        {selectedStyleObj && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              Applied Style
            </p>
            <div
              className="rounded-xl px-3 py-2.5 text-xs space-y-1"
              style={{ background: 'rgb(var(--color-bg))', border: '1px solid rgb(var(--color-border) / 0.12)' }}
            >
              <p style={{ color: 'rgb(var(--color-fg))' }}>
                <span className="font-medium">Style:</span> {selectedStyleObj.name}
              </p>
              <p style={{ color: 'rgb(var(--color-fg))' }}>
                <span className="font-medium">Feel:</span> {selectedStyleObj.productFeel}
              </p>
              <p style={{ color: 'rgb(var(--color-fg))' }}>
                <span className="font-medium">Lighting:</span> {selectedStyleObj.lightingDirection}
              </p>
              <div className="flex gap-1 pt-1">
                {selectedStyleObj.colorPalette.map((hex) => (
                  <div
                    key={hex}
                    className="w-5 h-5 rounded-full"
                    style={{ background: hex, border: '1px solid rgb(var(--color-border) / 0.2)' }}
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

