'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 4 — GTM + Social Launch
// OWNER: TEAM 3
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { ProductWorld } from '@/types/productWorld';
import GTMKit from '@/components/gtm/GTMKit';
import SocialLaunch from '@/components/gtm/SocialLaunch';
import LoadingOverlay from '@/components/shared/LoadingOverlay';
import Link from 'next/link';

interface PostStatus {
  posting: boolean;
  posted: boolean;
  tweetId?: string;
  error?: string;
}

export default function GTMPage() {
  const [world, setWorld] = useState<ProductWorld | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [postStatuses, setPostStatuses] = useState<Record<number, PostStatus>>({});
  const [selectedTweetId, setSelectedTweetId] = useState<string | undefined>();

  useEffect(() => {
    const raw = sessionStorage.getItem('baw_world');
    if (raw) {
      try { setWorld(JSON.parse(raw)); }
      catch { /* malformed session data */ }
    }
    setLoading(false);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text.slice(0, 30));
    setTimeout(() => setCopied(null), 2000);
  };

  const getVideoUrl = (): string => {
    if (!world) return '';
    const heroTask = world.videoSystem.videoTasks.find(
      t => t.type === 'hero' && t.status === 'complete'
    );
    if (heroTask?.url) return heroTask.url;
    const anyComplete = world.videoSystem.videoTasks.find(t => t.status === 'complete');
    return anyComplete?.url || '';
  };

  const handleSelectPost = async (post: string, index: number) => {
    if (!world) return;

    setPostStatuses(prev => ({
      ...prev,
      [index]: { posting: true, posted: false },
    }));

    const videoUrl = getVideoUrl();
    const tweetText = videoUrl
      ? `${post}\n\n${videoUrl}`
      : post;

    // Ensure tweet stays under 280 chars (URLs count as 23 chars on X)
    const finalText = tweetText.length > 280 ? post : tweetText;

    try {
      const res = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: finalText }),
      });
      const result = await res.json();

      if (result.success) {
        setPostStatuses(prev => ({
          ...prev,
          [index]: { posting: false, posted: true, tweetId: result.tweetId },
        }));
      } else {
        setPostStatuses(prev => ({
          ...prev,
          [index]: { posting: false, posted: false, error: result.error || 'Post failed' },
        }));
      }
    } catch (e) {
      setPostStatuses(prev => ({
        ...prev,
        [index]: { posting: false, posted: false, error: 'Network error' },
      }));
    }
  };

  const handlePost = async () => {
    if (!world) return;
    const text = world.social.selectedPost || world.gtmKit.twitterPosts[0] || 'Check out my new product!';
    setPosting(true);
    try {
      const videoUrl = getVideoUrl();
      const finalText = videoUrl ? `${text}\n\n${videoUrl}` : text;
      const tweet = finalText.length > 280 ? text : finalText;

      const res = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tweet }),
      });
      const result = await res.json();

      if (result.success) {
        setSelectedTweetId(result.tweetId);
        setWorld(prev => {
          if (!prev) return prev;
          const w = {
            ...prev,
            social: {
              ...prev.social,
              postedStatus: 'posted' as const,
              mockMetrics: result.metrics || prev.social.mockMetrics,
            },
          };
          sessionStorage.setItem('baw_world', JSON.stringify(w));
          return w;
        });
      }
    } catch (e) {
      console.error('[GTM] Post error:', e);
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
            <Link href="/" className="hover:text-fg transition-colors" style={{ color: 'inherit' }}>Home</Link>
            <span>/</span>
            <Link href="/builder" className="hover:text-fg transition-colors" style={{ color: 'inherit' }}>Builder</Link>
            <span>/</span>
            <span className="text-fg">GTM + Social</span>
            <div className="ml-auto flex gap-2">
              <Link href="/video" className="btn-ghost text-xs py-1.5 px-3">🎬 Videos</Link>
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
                postStatuses={postStatuses}
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
                videoUrl={getVideoUrl()}
                tweetId={selectedTweetId}
                onPost={handlePost}
              />
            </section>
          </div>
        </>
      )}
    </>
  );
}
