'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 2
// VideoStudio — enhanced video generation UI with 6 video types, environment
// badge, night/day toggle, save/download actions, and source image preview.
// Backend: uses our /api/video/start + /api/video/status polling pipeline.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { VideoSystem, VideoTask, VideoType } from '@/types/productWorld';
import { ENVIRONMENTS } from '@/components/builder/EnvironmentSelector';

interface Props {
  videoSystem: VideoSystem;
  onUpdate: (updated: VideoSystem) => void;
  selectedEnvironmentId?: string;
  productImageUrl?: string;
}

const VIDEO_CONFIG: { type: VideoType; label: string; emoji: string }[] = [
  { type: 'hero',          label: 'Hero Video',          emoji: '🎬' },
  { type: 'action',        label: 'Action Video',        emoji: '⚡' },
  { type: 'artistic',      label: 'Artistic Video',      emoji: '🎨' },
  { type: 'animated',      label: 'Animated Video',      emoji: '✨' },
  { type: 'exploded',      label: 'Exploded View Video', emoji: '💥' },
  { type: 'interpolation', label: 'Interpolation Video', emoji: '🔄' },
];

const PROMPT_MAP = (vs: VideoSystem): Record<VideoType, string> => ({
  hero:          vs.heroVideoPrompt,
  action:        vs.actionVideoPrompt,
  artistic:      vs.artisticVideoPrompt,
  animated:      vs.animatedVideoPrompt,
  exploded:      vs.explodedViewVideoPrompt || '',
  interpolation: vs.interpolationVideoPrompt || '',
});

export default function VideoStudio({ videoSystem, onUpdate, selectedEnvironmentId, productImageUrl }: Props) {
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [timeOfDay, setTimeOfDay] = useState<Record<string, 'night' | 'day'>>({});
  const latestRef = useRef(videoSystem);

  useEffect(() => { latestRef.current = videoSystem; }, [videoSystem]);

  const selectedEnv = ENVIRONMENTS.find(e => e.id === selectedEnvironmentId);

  const updateTask = (task: VideoTask) => {
    const current = latestRef.current;
    const updated: VideoSystem = {
      ...current,
      videoTasks: [...current.videoTasks.filter(t => t.type !== task.type), task],
    };
    latestRef.current = updated;
    onUpdate(updated);
  };

  const buildPrompt = (basePrompt: string, tod?: 'night' | 'day'): string => {
    const parts = [basePrompt];
    if (selectedEnv?.promptSuffix) parts.push(selectedEnv.promptSuffix);
    if (tod === 'night') parts.push('night time, dark dramatic lighting, moonlight, deep shadows, cool blue tones');
    if (tod === 'day') parts.push('bright natural daylight, golden hour, warm sunlight, vibrant colours');
    return parts.join(', ');
  };

  const handleGenerate = async (type: VideoType, tod?: 'night' | 'day') => {
    const basePrompt = PROMPT_MAP(videoSystem)[type];
    if (!basePrompt) return;

    const taskKey = `${type}-${tod ?? 'original'}`;
    setGenerating(g => ({ ...g, [taskKey]: true }));

    const finalPrompt = buildPrompt(basePrompt, tod);

    try {
      const res = await fetch('/api/video/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, prompt: finalPrompt, imageUrl: productImageUrl || videoSystem.baseImageUrl }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { taskId } = await res.json();

      const task: VideoTask = {
        id: taskId, type, prompt: finalPrompt, status: 'processing',
        firstFrameImageUrl: productImageUrl || videoSystem.baseImageUrl,
        environmentId: selectedEnvironmentId,
      };
      updateTask(task);

      // Poll until complete
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const pollRes = await fetch(`/api/video/status?taskId=${encodeURIComponent(taskId)}`);
        if (pollRes.ok) {
          const pollData = await pollRes.json();
          if (pollData.status === 'complete' && pollData.url) {
            updateTask({ ...task, status: 'complete', url: pollData.url });
            break;
          }
          if (pollData.status === 'failed') {
            updateTask({ ...task, status: 'failed', errorMessage: pollData.error });
            break;
          }
        }
      }
    } catch (err) {
      console.error('[VideoStudio] generation error:', err);
    } finally {
      setGenerating(g => ({ ...g, [taskKey]: false }));
    }
  };

  const handleSave = (taskId: string) => {
    const current = latestRef.current;
    const updated = {
      ...current,
      videoTasks: current.videoTasks.map(t => t.id === taskId ? { ...t, savedAt: new Date().toISOString() } : t),
    };
    latestRef.current = updated;
    onUpdate(updated);
  };

  const handleTimeOfDay = (type: VideoType, tod: 'night' | 'day') => {
    setTimeOfDay(prev => ({ ...prev, [type]: tod }));
    handleGenerate(type, tod);
  };

  const getTask = (type: VideoType): VideoTask | undefined =>
    videoSystem.videoTasks.find(t => t.type === type);

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

      {/* Base image */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-2">
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <span>🖼️</span> Product Base Image
        </h3>
        <input
          type="url"
          placeholder="https://example.com/your-product-image.png"
          value={videoSystem.baseImageUrl || ''}
          onChange={(e) => onUpdate({ ...videoSystem, baseImageUrl: e.target.value })}
          className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {VIDEO_CONFIG.map(({ type, label, emoji }) => {
          const task = getTask(type);
          const isLoading = generating[`${type}-${timeOfDay[type] ?? 'original'}`]
            || task?.status === 'pending' || task?.status === 'processing';
          const basePrompt = PROMPT_MAP(videoSystem)[type];

          return (
            <div
              key={type}
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ border: '1px solid rgb(var(--color-border) / 0.15)', background: 'rgb(var(--color-card))' }}
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <h3 className="font-semibold text-base" style={{ color: 'rgb(var(--color-fg))' }}>{label}</h3>
                {task?.status === 'complete' && (
                  <span className="ml-auto text-xs text-green-400 font-medium">✓ Ready</span>
                )}
                {task?.savedAt && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">Saved</span>
                )}
              </div>

              {/* Source image preview (when no video yet) */}
              {productImageUrl && !task?.url && !isLoading && task?.status !== 'failed' && (
                <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImageUrl} alt="Source" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-end p-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(6,182,212,0.25)', border: '1px solid rgba(6,182,212,0.4)', color: '#67e8f9' }}>
                      📷 Product shot — first frame
                    </span>
                  </div>
                </div>
              )}

              {/* Prompt preview */}
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                {basePrompt || 'No prompt generated yet.'}
              </p>

              {/* Video player */}
              {task?.status === 'complete' && task.url && (
                <video src={task.url} autoPlay loop muted playsInline className="w-full rounded-xl aspect-video object-cover" />
              )}

              {/* Complete but no URL */}
              {task?.status === 'complete' && !task.url && (
                <div className="w-full rounded-xl aspect-video flex flex-col items-center justify-center gap-2"
                  style={{ background: '#0F1117', border: '1px solid rgb(var(--color-border) / 0.15)' }}>
                  {task.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={task.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-40" />
                  )}
                  <span className="text-4xl">{emoji}</span>
                  <p className="text-xs font-medium" style={{ color: 'rgb(var(--color-fg-muted))' }}>Generated (Demo Mode)</p>
                </div>
              )}

              {/* Failed state */}
              {task?.status === 'failed' && (
                <div className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-red-300">Video generation failed</p>
                  <p className="mt-1 text-xs text-red-200/80 break-words">{task.errorMessage || 'Request failed.'}</p>
                </div>
              )}

              {/* Loading state */}
              {isLoading && task?.status !== 'complete' && task?.status !== 'failed' && (
                <div className="w-full rounded-xl aspect-video flex flex-col items-center justify-center gap-3"
                  style={{ background: 'rgb(var(--color-bg))', border: '1px solid rgb(var(--color-border) / 0.15)' }}>
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs" style={{ color: 'rgb(var(--color-fg-muted))' }}>Generating video…</p>
                </div>
              )}

              {/* Generate button */}
              {task?.status !== 'complete' && !isLoading && task?.status !== 'failed' && (
                <button
                  onClick={() => handleGenerate(type, timeOfDay[type])}
                  disabled={!basePrompt}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border border-accent/30 text-accent hover:bg-accent/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  style={{ background: 'rgb(var(--color-bg))' }}
                >
                  Generate {label}
                </button>
              )}

              {/* Retry button for failed */}
              {task?.status === 'failed' && (
                <button
                  onClick={() => handleGenerate(type, timeOfDay[type])}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border border-accent/30 text-accent hover:bg-accent/10 active:scale-95 transition-all duration-200"
                  style={{ background: 'rgb(var(--color-bg))' }}
                >
                  ↻ Retry {label}
                </button>
              )}

              {/* Actions when complete */}
              {task?.status === 'complete' && (
                <div className="flex gap-2 flex-wrap">
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

                  <button
                    onClick={() => handleTimeOfDay(type, 'night')}
                    disabled={!!generating[`${type}-night`]}
                    className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95 disabled:opacity-40"
                    style={{
                      background: timeOfDay[type] === 'night' ? 'rgba(99,102,241,0.15)' : 'rgb(var(--color-bg))',
                      border: timeOfDay[type] === 'night' ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgb(var(--color-border) / 0.2)',
                      color: timeOfDay[type] === 'night' ? '#a5b4fc' : 'rgb(var(--color-fg))',
                    }}
                  >
                    🌙 Night
                  </button>

                  <button
                    onClick={() => handleTimeOfDay(type, 'day')}
                    disabled={!!generating[`${type}-day`]}
                    className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95 disabled:opacity-40"
                    style={{
                      background: timeOfDay[type] === 'day' ? 'rgba(251,191,36,0.15)' : 'rgb(var(--color-bg))',
                      border: timeOfDay[type] === 'day' ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgb(var(--color-border) / 0.2)',
                      color: timeOfDay[type] === 'day' ? '#fde68a' : 'rgb(var(--color-fg))',
                    }}
                  >
                    ☀️ Day
                  </button>

                  {task.url && (
                    <a
                      href={task.url}
                      download={`${type}-video.mp4`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95 text-center no-underline"
                      style={{ background: 'rgb(var(--color-bg))', border: '1px solid rgb(var(--color-border) / 0.2)', color: 'rgb(var(--color-fg))' }}
                    >
                      ⬇ Download
                    </a>
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
