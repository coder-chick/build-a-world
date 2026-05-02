'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3 — Video Studio
// OWNER: TEAM 2
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { ProductWorld, VideoSystem } from '@/types/productWorld';
import VideoStudio from '@/components/VideoStudio';
import LoadingOverlay from '@/components/LoadingOverlay';
import Link from 'next/link';
export default function VideoPage() {
  const [world,   setWorld  ] = useState<ProductWorld | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('baw_world');
    if (raw) {
      try { setWorld(JSON.parse(raw)); }
      catch { /* malformed session data — stay null */ }
    }
    setLoading(false);
  }, []);

  const handleVideoUpdate = (updated: VideoSystem) => {
    setWorld(prev => {
      if (!prev) return prev;
      const w = { ...prev, videoSystem: updated };
      sessionStorage.setItem('baw_world', JSON.stringify(w));
      return w;
    });
  };

  return (
    <>
      <LoadingOverlay visible={loading} step={0} />

      {!loading && world && (
        <>
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            <Link href="/"        className="hover:text-fg transition-colors" style={{ color: 'inherit' }}>Home</Link>
            <span>/</span>
            <Link href="/builder" className="hover:text-fg transition-colors" style={{ color: 'inherit' }}>Builder</Link>
            <span>/</span>
            <span className="text-fg">Video Studio</span>
            <div className="ml-auto flex gap-2">
              <Link href="/gtm"          className="btn-ghost text-xs py-1.5 px-3">🚀 GTM</Link>
              <Link href="/architecture" className="btn-ghost text-xs py-1.5 px-3">🔭 Architecture</Link>
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-fg">
              🎬 Video Studio — <span className="text-gradient">{world.productOverview.productName}</span>
            </h1>
            <p className="text-sm text-fg-muted mt-1">Generate cinematic product videos powered by Seedance 2.0</p>
          </div>

          <VideoStudio videoSystem={world.videoSystem} onUpdate={handleVideoUpdate} />
        </>
      )}
    </>
  );
}
