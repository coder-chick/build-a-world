'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE — Summary
// OWNER: TEAM 1
// Final page showing the complete GTM plan, all generated assets, and a recap.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { ProductWorld } from '@/types/productWorld';
import AssetGallery from '@/components/summary/AssetGallery';
import PlanSummary from '@/components/summary/PlanSummary';
import LoadingOverlay from '@/components/shared/LoadingOverlay';
import Link from 'next/link';

export default function SummaryPage() {
  const [world, setWorld] = useState<ProductWorld | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('baw_world');
    if (raw) {
      try { setWorld(JSON.parse(raw)); }
      catch { /* fall through */ }
    }
    setLoading(false);
  }, []);

  if (loading) return <LoadingOverlay visible step={0} />;

  if (!world) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-fg-muted">No product world found. Start from the beginning to generate one.</p>
        <Link href="/chat" className="btn-accent">Start Ideation</Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        <Link href="/" className="hover:text-fg transition-colors" style={{ color: 'inherit' }}>Home</Link>
        <span>/</span>
        <Link href="/builder" className="hover:text-fg transition-colors" style={{ color: 'inherit' }}>Builder</Link>
        <span>/</span>
        <span className="text-fg">Summary</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fg">
          <span className="text-gradient">{world.productOverview.productName}</span> — Summary
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Complete overview of your product world, generated assets, and go-to-market plan
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="section-heading mb-4">Generated Assets</h2>
          <AssetGallery world={world} />
        </section>

        <hr className="divider" />

        <section>
          <h2 className="section-heading mb-4">Plan & Results</h2>
          <PlanSummary world={world} />
        </section>

        {/* Navigation back to flow */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Link href="/builder" className="btn-ghost">Back to Builder</Link>
          <Link href="/video" className="btn-ghost">Video Studio</Link>
          <Link href="/gtm" className="btn-ghost">GTM + Social</Link>
          <Link href="/architecture" className="btn-ghost">Architecture</Link>
        </div>
      </div>
    </>
  );
}
