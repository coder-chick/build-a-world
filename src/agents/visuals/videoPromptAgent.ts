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

  const fallback: VideoPromptOutput = {
    heroVideoPrompt: `Cinematic hero reveal of a futuristic running sneaker — dark grey nanofiber knit upper with neon-blue LED midsole accents — rising from smoke on a reflective black platform, dramatic volumetric lighting, slow 180-degree camera orbit, ${selectedStyle} aesthetic, 30 seconds`,
    actionVideoPrompt: `A runner wearing futuristic neon-accented sneakers sprinting through rain-soaked city streets at night, puddle splashes catching LED glow from the shoes, dynamic low-angle tracking shot, cinematic depth of field, urban environment, 30 seconds`,
    artisticVideoPrompt: `Abstract artistic close-up of a futuristic sneaker dissolving into particles of light and re-forming, neon-blue and electric-purple colour palette, moody fog, slow-motion macro details of knit texture and sole cushioning, ${selectedStyle} aesthetic, 30 seconds`,
    animatedVideoPrompt: `Motion-graphics product showcase of a futuristic running sneaker: exploded-view animation assembling each component (outsole, midsole foam, knit upper, laces, LED strip) in sequence, floating on a clean dark background, smooth easing transitions, 30 seconds`,
    simulated3DTurnaroundPrompt: `Smooth 360-degree turnaround of a futuristic running sneaker on a rotating pedestal, studio lighting with soft rim light, dark background, showing all angles of the nanofiber upper, translucent sole, and LED accents, seamless loop, 30 seconds`,
  };

  if (raw === '__MOCK__') {
    console.warn('[VideoPromptAgent] Using fallback prompts');
    return { ...fallback, videoTasks: [] };
  }

  const parsed = parseJSON<VideoPromptOutput>(raw);
  if (!parsed) {
    console.warn('[VideoPromptAgent] Parse failed, using fallback');
    return { ...fallback, videoTasks: [] };
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
