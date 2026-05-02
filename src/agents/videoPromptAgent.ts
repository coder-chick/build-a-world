// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 2
// VideoPromptAgent — generates 5 Seedance-optimised video prompts.
// ─────────────────────────────────────────────────────────────────────────────

import { VideoSystem, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { VIDEO_PROMPT_SYSTEM, VIDEO_PROMPT_USER } from '@/utils/promptTemplates';
import { MOCK_PRODUCT_WORLD } from '@/utils/mockData';

interface VideoPromptOutput {
  heroVideoPrompt: string;
  actionVideoPrompt: string;
  artisticVideoPrompt: string;
  animatedVideoPrompt: string;
  simulated3DTurnaroundPrompt: string;
}

export async function runVideoPromptAgent(
  overview: ProductOverview,
  selectedStyle: string
): Promise<VideoSystem> {
  const raw = await callLLM(
    VIDEO_PROMPT_SYSTEM,
    VIDEO_PROMPT_USER(overview.productName, selectedStyle)
  );

  const base = MOCK_PRODUCT_WORLD.videoSystem;

  if (raw === '__MOCK__') return { ...base, videoTasks: [] };

  const parsed = parseJSON<VideoPromptOutput>(raw);
  if (!parsed) {
    console.warn('[VideoPromptAgent] JSON parse failed — using mock');
    return { ...base, videoTasks: [] };
  }

  return {
    heroVideoPrompt:              parsed.heroVideoPrompt,
    actionVideoPrompt:            parsed.actionVideoPrompt,
    artisticVideoPrompt:          parsed.artisticVideoPrompt,
    animatedVideoPrompt:          parsed.animatedVideoPrompt,
    simulated3DTurnaroundPrompt:  parsed.simulated3DTurnaroundPrompt,
    videoTasks:                   [],
  };
}
