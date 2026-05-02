'use client';
// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// AssetGallery — displays all generated assets (visual prompts, video prompts)
// in a grid layout for the final summary page.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductWorld } from '@/types/productWorld';

interface Props {
  world: ProductWorld;
}

export default function AssetGallery({ world }: Props) {
  const { visualSystem, videoSystem } = world;

  const visualAssets = [
    { label: 'Product View', prompt: visualSystem.productViewPrompt, icon: '📦' },
    { label: 'Knolling View', prompt: visualSystem.knollingViewPrompt, icon: '🔩' },
    { label: 'Exploded View', prompt: visualSystem.explodedViewPrompt, icon: '💥' },
  ];

  const videoAssets = [
    { label: 'Hero Video', prompt: videoSystem.heroVideoPrompt, icon: '🎬' },
    { label: 'Action Video', prompt: videoSystem.actionVideoPrompt, icon: '⚡' },
    { label: 'Artistic Video', prompt: videoSystem.artisticVideoPrompt, icon: '🎨' },
    { label: 'Animated Video', prompt: videoSystem.animatedVideoPrompt, icon: '✨' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Visual prompts */}
      <div>
        <h3 className="text-base font-semibold text-fg mb-3">Visual Assets</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {visualAssets.map((a) => (
            <div key={a.label} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{a.icon}</span>
                <span className="text-sm font-medium text-fg">{a.label}</span>
              </div>
              <p className="text-xs text-fg-muted leading-relaxed line-clamp-4">
                {a.prompt || 'Not yet generated'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Video prompts */}
      <div>
        <h3 className="text-base font-semibold text-fg mb-3">Video Assets</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {videoAssets.map((a) => (
            <div key={a.label} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{a.icon}</span>
                <span className="text-sm font-medium text-fg">{a.label}</span>
              </div>
              <p className="text-xs text-fg-muted leading-relaxed line-clamp-4">
                {a.prompt || 'Not yet generated'}
              </p>
              {videoSystem.videoTasks.find((t) => t.type === a.label.split(' ')[0].toLowerCase())?.url && (
                <span className="badge badge-accent text-xs mt-1 w-fit">Video ready</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
