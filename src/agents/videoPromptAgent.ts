// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 2
// VideoPromptAgent — generates 5 Seedance-optimised video prompts.
// ─────────────────────────────────────────────────────────────────────────────

import { VideoSystem, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { VIDEO_PROMPT_SYSTEM, VIDEO_PROMPT_USER } from '@/utils/promptTemplates';
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

  if (raw === '__MOCK__') throw new Error('[VideoPromptAgent] LLM call failed — no API key available');

  const parsed = parseJSON<VideoPromptOutput>(raw);
  if (!parsed) throw new Error('[VideoPromptAgent] Failed to parse LLM response');

  return {
    heroVideoPrompt:              parsed.heroVideoPrompt,
    actionVideoPrompt:            parsed.actionVideoPrompt,
    artisticVideoPrompt:          parsed.artisticVideoPrompt,
    animatedVideoPrompt:          parsed.animatedVideoPrompt,
    simulated3DTurnaroundPrompt:  parsed.simulated3DTurnaroundPrompt,
    videoTasks:                   [],
  };
}
