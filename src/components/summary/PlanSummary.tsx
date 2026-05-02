'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// PlanSummary — shows the GTM plan, social results, and A/B metrics
// as a recap on the final summary page.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductWorld } from '@/types/productWorld';

interface Props {
  world: ProductWorld;
}

export default function PlanSummary({ world }: Props) {
  const { productOverview, gtmKit, social, styles, selectedStyle } = world;
  const activeStyle = styles.find((s) => s.name === selectedStyle) ?? styles[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Product overview */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-fg mb-3">Product Overview</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-fg-muted mb-1">Product Name</p>
            <p className="text-sm font-medium text-fg">{productOverview.productName}</p>
          </div>
          <div>
            <p className="text-xs text-fg-muted mb-1">Tagline</p>
            <p className="text-sm text-fg">{productOverview.tagline}</p>
          </div>
          <div>
            <p className="text-xs text-fg-muted mb-1">Target User</p>
            <p className="text-sm text-fg">{productOverview.targetUser}</p>
          </div>
          <div>
            <p className="text-xs text-fg-muted mb-1">Selected Style</p>
            <p className="text-sm text-fg">{activeStyle?.name ?? 'None'}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-fg-muted mb-1">Key Features</p>
          <ul className="list-disc list-inside text-sm text-fg space-y-1">
            {productOverview.keyFeatures.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* GTM summary */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-fg mb-3">Go-To-Market Plan</h3>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-fg-muted mb-1">Positioning</p>
            <p className="text-sm text-fg">{gtmKit.positioning || 'Not yet generated'}</p>
          </div>
          <div>
            <p className="text-xs text-fg-muted mb-1">Target Audience</p>
            <p className="text-sm text-fg">{gtmKit.audience || 'Not yet generated'}</p>
          </div>
          <div>
            <p className="text-xs text-fg-muted mb-1">Value Proposition</p>
            <p className="text-sm text-fg">{gtmKit.valueProposition || 'Not yet generated'}</p>
          </div>
        </div>
      </div>

      {/* Social results */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-fg mb-3">Social Launch Results</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Impressions', value: social.mockMetrics.impressions.toLocaleString() },
            { label: 'Likes', value: social.mockMetrics.likes.toLocaleString() },
            { label: 'Reposts', value: social.mockMetrics.reposts.toLocaleString() },
            { label: 'Replies', value: social.mockMetrics.replies.toLocaleString() },
          ].map((m) => (
            <div key={m.label} className="rounded-xl p-3" style={{ background: 'rgb(var(--color-border) / 0.04)' }}>
              <p className="text-xs text-fg-muted mb-1">{m.label}</p>
              <p className="text-lg font-bold text-fg">{m.value}</p>
            </div>
          ))}
        </div>
        {social.abTestWinner && (
          <p className="mt-3 text-sm text-fg-muted">
            A/B Test Winner: <span className="font-semibold text-fg">Variant {social.abTestWinner}</span>
          </p>
        )}
      </div>
    </div>
  );
}
