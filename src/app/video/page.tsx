'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3 — Video Studio
// OWNER: TEAM 2
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { ProductWorld, VideoSystem } from '@/types/productWorld';
import VideoStudio from '@/components/visuals/VideoStudio';
import LoadingOverlay from '@/components/shared/LoadingOverlay';
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

  const handleVideoUpdate = (updated: VideoSystem | ((prev: VideoSystem) => VideoSystem)) => {
    setWorld(prev => {
      if (!prev) return prev;
      const newVs = typeof updated === 'function' ? updated(prev.videoSystem) : updated;
      const w = { ...prev, videoSystem: newVs };
      sessionStorage.setItem('baw_world', JSON.stringify(w));
      return w;
    });
  };

  return (
    <>
      <LoadingOverlay visible={loading} step={0} />

      {!loading && !world && (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
          <h2 className="text-xl font-bold text-fg mb-4">No Product Found</h2>
          <p className="text-sm text-fg-muted mb-6">You need to create a product in the Builder first.</p>
          <div className="flex gap-4">
            <Link href="/" className="btn-primary">Go to Home</Link>
            <button 
              onClick={() => {
                setWorld({
                  id: 'sandbox',
                  createdAt: new Date().toISOString(),
                  userPrompt: 'Sandbox Mode',
                  theme: 'dark',
                  productOverview: {
                    productName: 'Sandbox Testing',
                    tagline: 'Iterate video prompts independently',
                    targetUser: 'Developers',
                    coreUseCase: 'Testing',
                    keyFeatures: [],
                    breakthroughInnovation: 'None'
                  },
                  customizationSystem: { components: [] },
                  styles: [],
                  selectedStyle: '',
                  selectedComponents: {},
                  visualSystem: {
                    currentView: 'product',
                    productViewPrompt: '',
                    knollingViewPrompt: '',
                    explodedViewPrompt: '',
                    componentPrompts: []
                  },
                  videoSystem: {
                    heroVideoPrompt: 'Cinematic shot of the product in the provided image in a minimalist studio room. Dramatic lighting, slow pan, seamless loop.',
                    actionVideoPrompt: 'Action shot of the product in the provided image being used in a realistic context. Dynamic camera motion.',
                    artisticVideoPrompt: 'Abstract artistic interpretation of the product in the provided image. Neon cyberpunk aesthetics, fast cuts.',
                    animatedVideoPrompt: 'Stylized 2D anime animation that prominently showcases and features the product in the provided image. Vibrant colors, expressive cartoony motion highlights, dynamic action, safe for work, and family-friendly content only.',
                    simulated3DTurnaroundPrompt: '',
                    videoTasks: []
                  },
                  gtmKit: {} as any,
                  social: {} as any,
                });
              }}
              className="btn-accent"
            >
              Enter Sandbox Mode
            </button>
          </div>
        </div>
      )}

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
