// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 3
// GTMAgent — generates the full go-to-market kit.
// ─────────────────────────────────────────────────────────────────────────────

import { GTMKit, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { GTM_SYSTEM, GTM_USER } from '@/utils/promptTemplates';
import { MOCK_PRODUCT_WORLD } from '@/utils/mockData';

export async function runGTMAgent(overview: ProductOverview): Promise<GTMKit> {
  const raw = await callLLM(
    GTM_SYSTEM,
    GTM_USER(overview.productName, overview.tagline, overview.keyFeatures)
  );
  if (raw === '__MOCK__') return MOCK_PRODUCT_WORLD.gtmKit;

  const parsed = parseJSON<GTMKit>(raw);
  if (!parsed) {
    console.warn('[GTMAgent] JSON parse failed — using mock');
    return MOCK_PRODUCT_WORLD.gtmKit;
  }
  return parsed;
}
