// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// VisualPromptAgent — generates Product, Knolling, Exploded image prompts.
// ─────────────────────────────────────────────────────────────────────────────

import { VisualSystem, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { VISUAL_PROMPT_SYSTEM, VISUAL_PROMPT_USER } from '@/utils/promptTemplates';
interface VisualPromptOutput {
  productViewPrompt: string;
  knollingViewPrompt: string;
  explodedViewPrompt: string;
  componentPrompts: string[];
}

export async function runVisualPromptAgent(
  overview: ProductOverview,
  selectedStyle: string
): Promise<VisualSystem> {
  const productDescription = [
    overview.coreUseCase,
    `Target user: ${overview.targetUser}`,
    `Key features: ${overview.keyFeatures.join(', ')}`,
    overview.breakthroughInnovation ? `Innovation: ${overview.breakthroughInnovation}` : '',
  ].filter(Boolean).join('. ');

  const raw = await callLLM(
    VISUAL_PROMPT_SYSTEM,
    VISUAL_PROMPT_USER(overview.productName, selectedStyle, productDescription)
  );

  const sneakerFallback: VisualSystem = {
    currentView: 'product',
    productViewPrompt: `A sleek futuristic running sneaker with a breathable nanofiber knit upper in dark grey, neon-blue LED light-pipe accents along the midsole, a translucent responsive foam sole with visible air cushioning, chrome heel counter, and reflective lace loops. ${selectedStyle} style. Photographed on a concrete pedestal in an urban setting at dusk, dramatic studio lighting, shallow depth of field, 8K commercial render`,
    knollingViewPrompt: `Top-down knolling layout of every component of a futuristic running sneaker disassembled and neatly arranged on a light grey surface: nanofiber knit upper (left and right), flat reflective laces, foam midsole cut in half showing air chambers, rubber outsole with multi-directional lugs, LED light-pipe strip, chrome heel counter, padded tongue, insole with embedded micro-sensor chip, and lace-lock toggle. ${selectedStyle} style, clean studio lighting, 8K product photography`,
    explodedViewPrompt: `Technical exploded-view diagram of a futuristic running sneaker with all parts floating apart vertically: at top the nanofiber knit upper shell, below it the padded tongue and lacing system, then the internal lining, the foam midsole showing dual-density layers and air chambers, the LED light-pipe strip, the embedded smart chip on a tiny PCB, and at the bottom the rubber outsole with grip lugs. ${selectedStyle} style, labelled callouts for each part, neutral grey background, technical illustration, 8K render`,
    componentPrompts: [],
  };

  if (raw === '__MOCK__') {
    console.warn('[VisualPromptAgent] Using sneaker fallback prompts');
    return sneakerFallback;
  }

  const parsed = parseJSON<VisualPromptOutput>(raw);
  if (!parsed) {
    console.warn('[VisualPromptAgent] Parse failed, using sneaker fallback');
    return sneakerFallback;
  }

  return {
    currentView: 'product',
    productViewPrompt: parsed.productViewPrompt,
    knollingViewPrompt: parsed.knollingViewPrompt,
    explodedViewPrompt: parsed.explodedViewPrompt,
    componentPrompts: parsed.componentPrompts,
  };
}
