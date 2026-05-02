// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 3
// GTMAgent — generates the full go-to-market kit.
// ─────────────────────────────────────────────────────────────────────────────

import { GTMKit, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { GTM_SYSTEM, GTM_USER } from '@/utils/promptTemplates';
export async function runGTMAgent(overview: ProductOverview): Promise<GTMKit> {
  const raw = await callLLM(
    GTM_SYSTEM,
    GTM_USER(overview.productName, overview.tagline, overview.keyFeatures)
  );
  if (raw === '__MOCK__') throw new Error('[GTMAgent] LLM call failed — no API key available');

  const parsed = parseJSON<GTMKit>(raw);
  if (!parsed) throw new Error('[GTMAgent] Failed to parse LLM response');
  return parsed;
}
