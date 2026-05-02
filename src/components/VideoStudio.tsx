'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 2
// VideoStudio — displays Seedance video prompts, generation controls,
// polling state, and video player (or mock card fallback).
// Now supports:
//   • Environment suffix applied to every prompt before sending to Seedance
//   • First-frame image (product photo) passed to Seedance img2video
//   • Save button per completed video
//   • Night/Day toggle per completed video (re-generates with new prompt suffix)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { ProductOverview, VideoSystem, VideoTask, VideoType, VisualSystem } from '@/types/productWorld';
import { ENVIRONMENTS } from './EnvironmentSelector';

interface Props {
  videoSystem: VideoSystem;
  onUpdate: (updated: VideoSystem) => void;
  selectedEnvironmentId?: string;
  generatedImages?: VisualSystem['generatedImages'];
  productOverview?: ProductOverview;
  originalPrompt?: string;
  selectedStyle?: string;
}

const VIDEO_CONFIG: { type: VideoType; label: string; emoji: string; imageKey: 'product' | 'knolling' | 'exploded'; imageLabel: string }[] = [
  { type: 'hero',          label: 'Hero Video',          emoji: '🎬', imageKey: 'product',  imageLabel: 'Product shot'  },
  { type: 'action',        label: 'Action Video',        emoji: '⚡', imageKey: 'product',  imageLabel: 'Product shot'  },
  { type: 'artistic',      label: 'Artistic Video',      emoji: '🎨', imageKey: 'knolling', imageLabel: 'Knolling shot' },
  { type: 'animated',      label: 'Animated Video',      emoji: '✨', imageKey: 'exploded', imageLabel: 'Exploded shot' },
  { type: 'interpolation', label: 'Interpolation Video', emoji: '🔄', imageKey: 'exploded', imageLabel: 'Exploded shot' },
];

const PROMPT_MAP = (vs: VideoSystem): Record<VideoType, string> => ({
  hero:          vs.heroVideoPrompt,
  action:        vs.actionVideoPrompt,
  artistic:      vs.artisticVideoPrompt,
  animated:      vs.animatedVideoPrompt,
  interpolation: vs.interpolationVideoPrompt,
});

export default function VideoStudio({
  videoSystem,
  onUpdate,
  selectedEnvironmentId,
  generatedImages,
  productOverview,
  originalPrompt,
  selectedStyle,
}: Props) {
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  // Per-task night/day mode: 'night' | 'day' | undefined (= original)
  const [timeOfDay, setTimeOfDay] = useState<Record<string, 'night' | 'day'>>({});

  const selectedEnv = ENVIRONMENTS.find((e) => e.id === selectedEnvironmentId);

  const buildContext = (): string | undefined => {
    if (!productOverview && !originalPrompt && !selectedStyle) return undefined;
    const parts = [
      originalPrompt ? `Original user prompt: ${originalPrompt}` : undefined,
      productOverview ? `Product: ${productOverview.productName}` : undefined,
      productOverview?.tagline ? `Tagline: ${productOverview.tagline}` : undefined,
      productOverview?.targetUser ? `Target user: ${productOverview.targetUser}` : undefined,
      productOverview?.coreUseCase ? `Core use case: ${productOverview.coreUseCase}` : undefined,
      productOverview?.keyFeatures?.length ? `Key features: ${productOverview.keyFeatures.join(', ')}` : undefined,
      productOverview?.breakthroughInnovation ? `Breakthrough innovation: ${productOverview.breakthroughInnovation}` : undefined,
      selectedStyle ? `Selected visual style: ${selectedStyle}` : undefined,
    ].filter(Boolean);
    return `Context to preserve: ${parts.join('; ')}`;
  };

  // Build the final prompt: base + environment suffix + optional night/day override
  const buildPrompt = (basePrompt: string, tod?: 'night' | 'day'): string => {
    const parts = [basePrompt];
    const context = buildContext();
    if (context) parts.push(context);
    if (selectedEnv?.promptSuffix) parts.push(selectedEnv.promptSuffix);
    if (tod === 'night') parts.push('night time, dark dramatic lighting, moonlight, deep shadows, cool blue tones');
    if (tod === 'day')   parts.push('bright natural daylight, golden hour, warm sunlight, vibrant colours');
    return parts.join(', ');
  };

  const handleGenerate = async (type: VideoType, existingTod?: 'night' | 'day') => {
    const basePrompt = PROMPT_MAP(videoSystem)[type];
    if (!basePrompt) return;

    const taskKey = `${type}-${existingTod ?? 'original'}`;
    setGenerating((g) => ({ ...g, [taskKey]: true }));

    const finalPrompt = buildPrompt(basePrompt, existingTod);
    const imageKey = VIDEO_CONFIG.find((c) => c.type === type)?.imageKey ?? 'product';
    const firstFrameImageUrl = generatedImages?.[imageKey];

    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          type,
          imageUrl: firstFrameImageUrl,
          environmentId: selectedEnvironmentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);

      if (data.mock) {
        const task: VideoTask = {
          id: data.id as string,
          type,
          prompt: finalPrompt,
          status: 'complete',
          url: data.url as string | undefined,
          thumbnailUrl: data.thumbnailUrl as string | undefined,
          firstFrameImageUrl,
          environmentId: selectedEnvironmentId,
        };
        onUpdate({
          ...videoSystem,
          videoTasks: [...videoSystem.videoTasks.filter((t) => t.type !== type), task],
        });
      } else {
        const taskId = data.taskId as string;
        let task: VideoTask = {
          id: taskId, type, prompt: finalPrompt, status: 'processing',
          firstFrameImageUrl, environmentId: selectedEnvironmentId,
        };
        onUpdate({
          ...videoSystem,
          videoTasks: [...videoSystem.videoTasks.filter((t) => t.type !== type), task],
        });

        for (let i = 0; i < 36; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          const pollRes = await fetch(`/api/video/${taskId}`);
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            if (pollData.status === 'complete' && pollData.url) {
              task = { ...task, status: 'complete', url: pollData.url as string };
              break;
            }
            if (pollData.status === 'failed') {
              task = { ...task, status: 'failed' };
              break;
            }
          }
        }

        onUpdate({
          ...videoSystem,
          videoTasks: [...videoSystem.videoTasks.filter((t) => t.type !== type), task],
        });
      }
    } catch (err) {
      console.error('[VideoStudio] generation error:', err);
    } finally {
      setGenerating((g) => ({ ...g, [taskKey]: false }));
    }
  };

  const handleSave = (taskId: string) => {
    const savedAt = new Date().toISOString();
    onUpdate({
      ...videoSystem,
      videoTasks: videoSystem.videoTasks.map((t) =>
        t.id === taskId ? { ...t, savedAt } : t
      ),
    });
  };

  const handleTimeOfDay = (type: VideoType, tod: 'night' | 'day') => {
    setTimeOfDay((prev) => ({ ...prev, [type]: tod }));
    // Re-generate with new time-of-day suffix
    handleGenerate(type, tod);
  };

  const getTask = (type: VideoType): VideoTask | undefined =>
    videoSystem.videoTasks.find((t) => t.type === type);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Environment badge */}
      {selectedEnv && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgb(var(--color-card))', border: '1px solid rgb(var(--color-border) / 0.15)' }}>
          <span className="text-sm">🌍</span>
          <p className="text-xs" style={{ color: 'rgb(var(--color-fg))' }}>
            <span className="font-semibold text-accent">Environment:</span> {selectedEnv.name} — applied to all video prompts
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {VIDEO_CONFIG.map(({ type, label, emoji, imageKey, imageLabel }) => {
          const task      = getTask(type);
          const isLoading = generating[`${type}-${timeOfDay[type] ?? 'original'}`] ?? false;
          const basePrompt = PROMPT_MAP(videoSystem)[type];
          const previewPrompt = buildPrompt(basePrompt, timeOfDay[type]);
          const sourceImage = generatedImages?.[imageKey];

          return (
            <div
              key={type}
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{
                border: '1px solid rgb(var(--color-border) / 0.15)',
                background: 'rgb(var(--color-card))',
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <h3 className="font-semibold text-base" style={{ color: 'rgb(var(--color-fg))' }}>{label}</h3>
                {task?.status === 'complete' && (
                  <span className="ml-auto text-xs text-green-400 font-medium">✓ Ready</span>
                )}
                {task?.savedAt && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                    Saved
                  </span>
                )}
              </div>

              {/* Source image frame */}
              {sourceImage && !task?.url && (
                <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img src={sourceImage} alt={imageLabel} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-end p-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(6,182,212,0.25)', border: '1px solid rgba(6,182,212,0.4)', color: '#67e8f9' }}>
                      📷 {imageLabel} — first frame
                    </span>
                  </div>
                </div>
              )}

              {/* Prompt preview */}
              <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                {previewPrompt || 'No prompt generated yet.'}
              </p>

              {/* Video player or mock thumbnail */}
              {task?.status === 'complete' && (
                task.url ? (
                  <video
                    src={task.url}
                    autoPlay loop muted playsInline
                    className="w-full rounded-xl aspect-video object-cover"
                  />
                ) : (
                  <div
                    className="relative w-full rounded-xl aspect-video flex flex-col items-center justify-center gap-2 overflow-hidden"
                    style={{ background: '#0F1117', border: '1px solid rgb(var(--color-border) / 0.15)' }}
                  >
                    {task.thumbnailUrl && (
                      <img
                        src={task.thumbnailUrl}
                        alt="thumbnail"
                        className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-40"
                      />
                    )}
                    <span className="relative text-4xl">{emoji}</span>
                    <p className="relative text-xs font-medium" style={{ color: 'rgb(var(--color-fg-muted))' }}>Generated (Demo Mode)</p>
                    <p className="relative text-[10px]" style={{ color: 'rgb(var(--color-fg-muted))' }}>No Seedance API key — showing placeholder</p>
                  </div>
                )
              )}

              {/* Loading state */}
              {isLoading && (
                <div
                  className="w-full rounded-xl aspect-video flex flex-col items-center justify-center gap-3"
                  style={{ background: 'rgb(var(--color-bg))', border: '1px solid rgb(var(--color-border) / 0.15)' }}
                >
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs animate-pulse-soft" style={{ color: 'rgb(var(--color-fg-muted))' }}>Generating video…</p>
                </div>
              )}

              {/* Generate button */}
              {task?.status !== 'complete' && !isLoading && (
                <button
                  onClick={() => handleGenerate(type, timeOfDay[type])}
                  disabled={!basePrompt}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border border-accent/30 text-accent hover:bg-accent/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  style={{ background: 'rgb(var(--color-bg))' }}
                >
                  Generate {label}
                </button>
              )}

                  {/* Save + Night/Day + Download/Copy actions (only when complete) */}
              {task?.status === 'complete' && (
                <div className="flex gap-2 flex-wrap">
                  {/* Save */}
                  <button
                    onClick={() => handleSave(task.id)}
                    disabled={!!task.savedAt}
                    className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95 disabled:opacity-50"
                    style={{
                      background: task.savedAt ? 'rgba(34,197,94,0.1)' : 'rgb(var(--color-bg))',
                      border: task.savedAt ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgb(var(--color-border) / 0.2)',
                      color: task.savedAt ? 'rgb(134,239,172)' : 'rgb(var(--color-fg))',
                    }}
                  >
                    {task.savedAt ? '✓ Saved' : '💾 Save'}
                  </button>

                  {/* Night toggle */}
                  <button
                    onClick={() => handleTimeOfDay(type, 'night')}
                    disabled={isLoading}
                    className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95 disabled:opacity-40"
                    style={{
                      background: timeOfDay[type] === 'night' ? 'rgba(99,102,241,0.15)' : 'rgb(var(--color-bg))',
                      border: timeOfDay[type] === 'night' ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgb(var(--color-border) / 0.2)',
                      color: timeOfDay[type] === 'night' ? '#a5b4fc' : 'rgb(var(--color-fg))',
                    }}
                  >
                    🌙 Night
                  </button>

                  {/* Day toggle */}
                  <button
                    onClick={() => handleTimeOfDay(type, 'day')}
                    disabled={isLoading}
                    className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95 disabled:opacity-40"
                    style={{
                      background: timeOfDay[type] === 'day' ? 'rgba(251,191,36,0.15)' : 'rgb(var(--color-bg))',
                      border: timeOfDay[type] === 'day' ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgb(var(--color-border) / 0.2)',
                      color: timeOfDay[type] === 'day' ? '#fde68a' : 'rgb(var(--color-fg))',
                    }}
                  >
                    ☀️ Day
                  </button>

                  {/* Download video */}
                  {task.url && (
                    <a
                      href={task.url}
                      download={`${type}-video.mp4`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95 text-center"
                      style={{
                        background: 'rgb(var(--color-bg))',
                        border: '1px solid rgb(var(--color-border) / 0.2)',
                        color: 'rgb(var(--color-fg))',
                        textDecoration: 'none',
                      }}
                    >
                      ⬇ Download
                    </a>
                  )}

                  {/* Copy video URL */}
                  {task.url && (
                    <button
                      onClick={() => navigator.clipboard.writeText(task.url!)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95"
                      style={{
                        background: 'rgb(var(--color-bg))',
                        border: '1px solid rgb(var(--color-border) / 0.2)',
                        color: 'rgb(var(--color-fg))',
                      }}
                    >
                      📋 Copy URL
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

