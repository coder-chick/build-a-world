'use client';
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3 — Video Studio
// OWNER: TEAM 2
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react';
import { ProductWorld, VideoSystem, VideoTask } from '@/types/productWorld';
import VideoStudio from '@/components/visuals/VideoStudio';
import Link from 'next/link';

const POLL_INTERVAL_MS = 5000;

export default function VideoPage() {
  const [world, setWorld] = useState<ProductWorld | null>(null);
  const [loading, setLoading] = useState(true);
  const pollersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Load world from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('baw_world');
    if (!raw) { setLoading(false); return; }
    try {
      setWorld(JSON.parse(raw) as ProductWorld);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Poll all pending/processing video tasks
  useEffect(() => {
    if (!world) return;

    const pendingTasks = world.videoSystem.videoTasks.filter(
      t => (t.status === 'pending' || t.status === 'processing') && t.id && !pollersRef.current.has(t.id)
    );

    for (const task of pendingTasks) {
      console.log(`[video] Starting poll for ${task.type}: ${task.id}`);

      const poll = async () => {
        try {
          const res = await fetch(`/api/video/status?taskId=${encodeURIComponent(task.id)}`);
          if (!res.ok) return;

          const result = await res.json();

          if (result.status === 'complete' || result.status === 'failed') {
            const interval = pollersRef.current.get(task.id);
            if (interval) { clearInterval(interval); pollersRef.current.delete(task.id); }

            const updatedTask: VideoTask = {
              id: task.id,
              type: task.type,
              prompt: task.prompt,
              imageUrl: task.imageUrl,
              status: result.status === 'complete' ? 'complete' : 'failed',
              url: result.url || undefined,
              errorMessage: result.error || undefined,
            };

            setWorld(prev => {
              if (!prev) return prev;
              const updated = {
                ...prev,
                videoSystem: {
                  ...prev.videoSystem,
                  videoTasks: [
                    ...prev.videoSystem.videoTasks.filter(t => t.type !== task.type),
                    updatedTask,
                  ],
                },
              };
              sessionStorage.setItem('baw_world', JSON.stringify(updated));
              return updated;
            });
          }
        } catch (e) {
          console.error(`[video/poll] ${task.type} error:`, e);
        }
      };

      poll();
      const interval = setInterval(poll, POLL_INTERVAL_MS);
      pollersRef.current.set(task.id, interval);
    }

    return () => {
      pollersRef.current.forEach(interval => clearInterval(interval));
      pollersRef.current.clear();
    };
  }, [world]);

  const handleVideoUpdate = (updated: VideoSystem) => {
    setWorld(prev => {
      if (!prev) return prev;
      const w = { ...prev, videoSystem: updated };
      sessionStorage.setItem('baw_world', JSON.stringify(w));
      return w;
    });
  };

  if (loading) return null;

  if (!world) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-[rgb(var(--color-fg-muted))]">No product world found. Start from the home page.</p>
        <Link href="/" className="text-[rgb(var(--color-accent))] underline">Go Home</Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-[rgb(var(--color-fg-muted))]">
        <Link href="/" className="hover:text-[rgb(var(--color-fg))] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/builder" className="hover:text-[rgb(var(--color-fg))] transition-colors">Builder</Link>
        <span>/</span>
        <span className="text-[rgb(var(--color-fg))] font-medium">Video Studio</span>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">
          Video Studio — <span className="text-[rgb(var(--color-accent))]">{world.productOverview.productName}</span>
        </h1>
        <p className="text-sm text-[rgb(var(--color-fg-muted))] mt-1">
          Generate cinematic product videos powered by Seedance 2.0
        </p>
      </div>

      <VideoStudio videoSystem={world.videoSystem} onUpdate={handleVideoUpdate} />

      {/* Next button */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/gtm"
          className="
            px-8 py-3 rounded-xl text-sm font-semibold
            bg-[rgb(var(--color-accent))] text-white
            hover:opacity-90 active:scale-[0.98]
            transition-all duration-200
            flex items-center gap-2
          "
          onClick={() => sessionStorage.setItem('baw_world', JSON.stringify(world))}
        >
          Next: GTM + Social
          <span className="text-lg">→</span>
        </Link>
      </div>
    </>
  );
}
