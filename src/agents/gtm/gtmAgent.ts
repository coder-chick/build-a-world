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
  const fallbackKit: GTMKit = {
    positioning: `${overview.productName} — the futuristic sneaker that adapts to every stride and lights up every street`,
    audience: 'Urban runners, sneakerheads, and fitness-tech enthusiasts aged 18-35 who demand performance and style',
    valueProposition: 'AI-adaptive terrain response meets head-turning neon aesthetics — performance you feel, style they see',
    twitterPosts: [
      `Introducing ${overview.productName}. The sneaker that reads the terrain beneath your feet and adapts in real time. ${overview.tagline} 🚀`,
      `Night runs just got legendary. Meet ${overview.productName} — neon LED accents, adaptive cushioning, and nanofiber knit that breathes. The future of running is here. ✨`,
      `Your city. Your pace. Your glow. ${overview.productName} drops soon. Are you ready? 🔥`,
    ],
    abTestingPlan: {
      variantA: { positioning: 'Performance-first: adaptive terrain response, energy-return midsole', audience: 'Serious runners and fitness-tech enthusiasts', visualStrategy: 'Dynamic action shots, motion blur, data overlays', engagementRate: 4.2, clickIntent: 3.8, conversionProxy: 3.5, shareabilityScore: 4.0 },
      variantB: { positioning: 'Style-first: neon LED accents, futuristic knit, the sneaker that glows', audience: 'Sneakerheads and streetwear enthusiasts', visualStrategy: 'Studio glamour shots, neon lighting, lifestyle vibes', engagementRate: 3.9, clickIntent: 4.1, conversionProxy: 3.6, shareabilityScore: 3.7 },
    },
    metrics: { engagementRate: 4.1, clickIntent: 3.9, conversionProxy: 3.5, shareabilityScore: 3.8 },
    viralMechanic: 'AR try-on filter: users see the sneaker on their feet in real-time and share side-by-side before/after clips',
  };

  if (raw === '__MOCK__') {
    console.warn('[GTMAgent] Using fallback');
    return fallbackKit;
  }

  const parsed = parseJSON<GTMKit>(raw);
  if (!parsed) {
    console.warn('[GTMAgent] Parse failed, using fallback');
    return fallbackKit;
  }
  return parsed;
}
