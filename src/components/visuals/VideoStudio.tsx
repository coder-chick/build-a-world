'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 2
// VideoStudio — displays Seedance video prompts, generation controls,
// polling state, and video player (or mock card fallback).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { VideoSystem, VideoTask, VideoType } from '@/types/productWorld';
import { generateVideo } from '@/services/seedanceService';

interface Props {
  videoSystem: VideoSystem;
  onUpdate: (updated: VideoSystem | ((prev: VideoSystem) => VideoSystem)) => void;
}

const VIDEO_CONFIG: { type: VideoType; label: string; emoji: string }[] = [
  { type: 'hero',     label: 'Hero Video',     emoji: '🎬' },
  { type: 'action',   label: 'Action Video',   emoji: '⚡' },
  { type: 'artistic', label: 'Artistic Video', emoji: '🎨' },
  { type: 'animated', label: 'Animated Video', emoji: '✨' },
];

const PROMPT_MAP = (vs: VideoSystem): Record<VideoType, string> => ({
  hero:     vs.heroVideoPrompt,
  action:   vs.actionVideoPrompt,
  artistic: vs.artisticVideoPrompt,
  animated: vs.animatedVideoPrompt,
  interpolation: vs.interpolationVideoPrompt,
});

export default function VideoStudio({ videoSystem, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'standard' | 'interpolation'>('standard');
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  const handleGenerate = async (type: VideoType) => {
    let prompt = PROMPT_MAP(videoSystem)[type] || (type === 'interpolation' ? 'Smooth interpolation from an exploded parts view to a fully assembled product view. Showcase the engineering and fit of the components.' : '');
    
    // For standard videos
    if (type !== 'interpolation' && videoSystem.baseImageUrl) {
      prompt += ' Maintain consistency with the provided image.';
    } 
    // For interpolation
    if (type === 'interpolation' && videoSystem.interpolationStartImageUrl) {
      prompt += ' Interpolate from the provided start image to the provided end image.';
    }

    setGenerating((g) => ({ ...g, [type]: true }));

    try {
      const task: VideoTask = await generateVideo(
        type, 
        prompt, 
        type === 'interpolation' ? videoSystem.interpolationStartImageUrl : videoSystem.baseImageUrl, 
        type === 'interpolation' ? videoSystem.interpolationEndImageUrl : undefined
      );
      onUpdate((currentVs) => {
        const updatedTasks = [
          ...currentVs.videoTasks.filter((t) => t.type !== type),
          task,
        ];
        return { ...currentVs, videoTasks: updatedTasks };
      });
    } finally {
      setGenerating((g) => ({ ...g, [type]: false }));
    }
  };

  const getTask = (type: VideoType): VideoTask | undefined =>
    videoSystem.videoTasks.find((t) => t.type === type);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Tabs */}
      <div className="flex border-b border-white/10 w-full gap-4">
        <button
          onClick={() => setActiveTab('standard')}
          className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'standard' ? 'border-accent text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}
        >
          Standard
        </button>
        <button
          onClick={() => setActiveTab('interpolation')}
          className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'interpolation' ? 'border-accent text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}
        >
          Interpolation
        </button>
      </div>

      {activeTab === 'standard' && (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-2">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <span>🖼️</span> Product Base Image (Optional)
            </h3>
            <p className="text-xs text-white/40">
              Provide a base image of your product (e.g. sneakers) to keep the product design unchanged in generated videos using Image-to-Video ModelArk capabilities.
            </p>
            <input
              type="url"
              placeholder="https://example.com/your-product-image.png"
              value={videoSystem.baseImageUrl || ''}
              onChange={(e) => onUpdate({ ...videoSystem, baseImageUrl: e.target.value })}
              className="mt-2 w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {VIDEO_CONFIG.map(({ type, label, emoji }) => {
            const task     = getTask(type);
            const isLoading = generating[type] ?? false;
            const prompt   = PROMPT_MAP(videoSystem)[type];

            return (
              <div
                key={type}
                className="
                  rounded-2xl border border-white/10 bg-white/5
                  p-5 flex flex-col gap-4
                "
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{emoji}</span>
                  <h3 className="font-semibold text-white text-base">{label}</h3>
                  {task?.status === 'complete' && (
                    <span className="ml-auto text-xs text-green-400 font-medium">✓ Ready</span>
                  )}
                </div>

                {/* Prompt text hidden from user per request */}

                {/* Video player or mock thumbnail */}
                {task?.status === 'complete' && (
                  task.url ? (
                    <video
                      src={task.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full rounded-xl aspect-video object-cover"
                    />
                  ) : (
                    <div
                      className="w-full rounded-xl aspect-video flex flex-col items-center justify-center gap-2
                        bg-gradient-to-br from-surface-dark to-white/5 border border-white/10"
                    >
                      <span className="text-4xl">{emoji}</span>
                      <p className="text-xs text-white/40">Generated without a playable video URL</p>
                      {task.thumbnailUrl && (
                        <img
                          src={task.thumbnailUrl}
                          alt="thumbnail"
                          className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-30"
                        />
                      )}
                    </div>
                  )
                )}

                {task?.status === 'failed' && (
                  <div className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3">
                    <p className="text-sm font-medium text-red-300">Video generation failed</p>
                    <p className="mt-1 text-xs text-red-200/80 break-words">
                      {task.errorMessage || 'The Seedance request failed before returning a video.'}
                    </p>
                  </div>
                )}

                {/* Loading state */}
                {isLoading && (
                  <div className="w-full rounded-xl aspect-video flex flex-col items-center justify-center gap-3
                    bg-white/5 border border-white/10">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-white/40 animate-pulse-soft">Generating video…</p>
                  </div>
                )}

                {/* Generate button */}
                {task?.status !== 'complete' && !isLoading && (
                  <button
                    onClick={() => handleGenerate(type)}
                    disabled={!prompt}
                    className="
                      w-full py-2.5 rounded-xl text-sm font-medium
                      bg-accent/10 border border-accent/30 text-accent
                      hover:bg-accent/20 active:scale-95
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all duration-200
                    "
                  >
                    Generate {label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </>
      )}

      {activeTab === 'interpolation' && (() => {
        const type = 'interpolation';
        const task = getTask(type);
        const isLoading = generating[type] ?? false;
        const prompt = PROMPT_MAP(videoSystem)[type] || 'Smooth interpolation from an exploded parts view to a fully assembled product view.';

        return (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <span>🔄</span> Interpolation Images
              </h3>
              <p className="text-xs text-white/40">
                Provide a start image and end image to interpolate from an exploded view to an assembled view of your product.
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="url"
                  placeholder="Start Image URL (e.g. Exploded View)"
                  value={videoSystem.interpolationStartImageUrl || ''}
                  onChange={(e) => onUpdate({ ...videoSystem, interpolationStartImageUrl: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
                />
                <input
                  type="url"
                  placeholder="End Image URL (e.g. Assembled View)"
                  value={videoSystem.interpolationEndImageUrl || ''}
                  onChange={(e) => onUpdate({ ...videoSystem, interpolationEndImageUrl: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                <h3 className="font-semibold text-white text-base">Interpolation Video</h3>
                {task?.status === 'complete' && (
                  <span className="ml-auto text-xs text-green-400 font-medium">✓ Ready</span>
                )}
              </div>

              {task?.status === 'complete' && (
                task.url ? (
                  <video
                    src={task.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full rounded-xl aspect-video object-cover"
                  />
                ) : (
                  <div
                    className="w-full rounded-xl aspect-video flex flex-col items-center justify-center gap-2
                      bg-gradient-to-br from-surface-dark to-white/5 border border-white/10"
                  >
                    <span className="text-4xl">🔄</span>
                    <p className="text-xs text-white/40">Generated without a playable video URL</p>
                    {task.thumbnailUrl && (
                      <img
                        src={task.thumbnailUrl}
                        alt="thumbnail"
                        className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-30"
                      />
                    )}
                  </div>
                )
              )}

              {task?.status === 'failed' && (
                <div className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-red-300">Video generation failed</p>
                  <p className="mt-1 text-xs text-red-200/80 break-words">
                    {task.errorMessage || 'The Seedance request failed before returning a video.'}
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="w-full rounded-xl aspect-video flex flex-col items-center justify-center gap-3
                  bg-white/5 border border-white/10">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-white/40 animate-pulse-soft">Generating video…</p>
                </div>
              )}

              {task?.status !== 'complete' && !isLoading && (
                <button
                  onClick={() => handleGenerate(type)}
                  disabled={!prompt || !videoSystem.interpolationStartImageUrl || !videoSystem.interpolationEndImageUrl}
                  className="
                    w-full py-2.5 rounded-xl text-sm font-medium
                    bg-accent/10 border border-accent/30 text-accent
                    hover:bg-accent/20 active:scale-95
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                >
                  Generate Interpolation
                </button>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}
