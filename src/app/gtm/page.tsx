'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 4 — GTM + Social Launch
// OWNER: TEAM 3
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { ProductWorld } from '@/types/productWorld';
import GTMKit from '@/components/GTMKit';
import SocialLaunch from '@/components/SocialLaunch';
import LoadingOverlay from '@/components/LoadingOverlay';
import Link from 'next/link';
import { publishPost } from '@/services/twitterService';

export default function GTMPage() {
  const [world,   setWorld  ] = useState<ProductWorld | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [copied,  setCopied ] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('baw_world');
    if (raw) {
      try { setWorld(JSON.parse(raw)); }
      catch { /* malformed session data — stay null */ }
    }
    setLoading(false);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text.slice(0, 30));
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSelectPost = (post: string) => {
    handleCopy(post);
  };

  const handlePost = async () => {
    if (!world) return;
    const posts = world.gtmKit.twitterPosts;
    const text  = posts[0] ?? 'Check out my new product!';
    setPosting(true);
    try {
      await publishPost(text);
      // Mark as posted in social state
      setWorld(prev => {
        if (!prev) return prev;
        const w = { ...prev, social: { ...prev.social, postedStatus: 'posted' as const } };
        sessionStorage.setItem('baw_world', JSON.stringify(w));
        return w;
      });
    } finally {
      setPosting(false);
    }
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
            <span className="text-fg">GTM + Social</span>
            <div className="ml-auto flex gap-2">
              <Link href="/video"        className="btn-ghost text-xs py-1.5 px-3">🎬 Videos</Link>
              <Link href="/architecture" className="btn-ghost text-xs py-1.5 px-3">🔭 Architecture</Link>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-fg">
              🚀 GTM + Social — <span className="text-gradient">{world.productOverview.productName}</span>
            </h1>
            <p className="text-sm text-fg-muted mt-1">Go-to-market strategy, messaging, and live Twitter launch</p>
          </div>

          {copied && (
            <div className="mb-4 rounded-xl bg-accent/10 border border-accent/20 px-4 py-2 text-sm text-accent">
              ✓ Copied: &quot;{copied}…&quot;
            </div>
          )}

          <div className="flex flex-col gap-8">
            <section>
              <h2 className="text-lg font-semibold text-fg mb-4">📋 GTM Kit</h2>
              <GTMKit
                gtmKit={world.gtmKit}
                onSelectPost={handleSelectPost}
                onCopy={handleCopy}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-fg mb-4">📊 Social Launch Results</h2>
              <SocialLaunch
                gtmKit={world.gtmKit}
                social={world.social}
                posting={posting}
                onPost={handlePost}
              />
            </section>
          </div>
        </>
      )}
    </>
  );
}

