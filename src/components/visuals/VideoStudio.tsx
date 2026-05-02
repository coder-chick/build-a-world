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
  onUpdate: (updated: VideoSystem) => void;
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
});

export default function VideoStudio({ videoSystem, onUpdate }: Props) {
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  const handleGenerate = async (type: VideoType) => {
    let prompt = PROMPT_MAP(videoSystem)[type];
    if (videoSystem.baseImageUrl) {
      prompt += ' Maintain consistency with the provided image.';
    }
    setGenerating((g) => ({ ...g, [type]: true }));

    try {
      const task: VideoTask = await generateVideo(type, prompt, videoSystem.baseImageUrl);
      const updatedTasks = [
        ...videoSystem.videoTasks.filter((t) => t.type !== type),
        task,
      ];
      onUpdate({ ...videoSystem, videoTasks: updatedTasks });
    } finally {
      setGenerating((g) => ({ ...g, [type]: false }));
    }
  };

  const getTask = (type: VideoType): VideoTask | undefined =>
    videoSystem.videoTasks.find((t) => t.type === type);

  return (
    <div className="flex flex-col gap-6 w-full">
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

            {/* Prompt */}
            <p className="text-xs text-white/40 leading-relaxed line-clamp-4">
              {prompt || 'No prompt generated yet.'}
            </p>

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
  </div>
  );
}
