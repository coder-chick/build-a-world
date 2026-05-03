// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// StyleAgent — generates 9 visual style directions for the product.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductStyle, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { STYLE_SYSTEM, STYLE_USER } from '@/utils/promptTemplates';
interface StyleAgentOutput {
  styles: ProductStyle[];
}

const FALLBACK_STYLES: ProductStyle[] = [
  { name: 'Futurist', materialDirection: 'Holographic knit, translucent neon polymers', colorPalette: ['#0ff', '#0f0', '#111'], lightingDirection: 'Neon rim light, dark backdrop', productFeel: 'Sci-fi meets streetwear' },
  { name: 'Minimalist', materialDirection: 'Monochrome knit, seamless construction', colorPalette: ['#fff', '#e0e0e0', '#222'], lightingDirection: 'Soft diffused studio light', productFeel: 'Clean and understated' },
  { name: 'Industrial', materialDirection: 'Raw rubber, exposed stitching, gunmetal hardware', colorPalette: ['#333', '#666', '#b87333'], lightingDirection: 'Hard directional light with deep shadows', productFeel: 'Rugged and utilitarian' },
  { name: 'Organic', materialDirection: 'Bio-based knit, cork midsole accents', colorPalette: ['#8B7355', '#6B8E23', '#F5DEB3'], lightingDirection: 'Warm golden-hour glow', productFeel: 'Natural and earth-connected' },
  { name: 'Luxury', materialDirection: 'Premium leather, gold-tone hardware', colorPalette: ['#1a1a1a', '#d4af37', '#8B0000'], lightingDirection: 'Rich warm studio with accent highlights', productFeel: 'Elevated and opulent' },
  { name: 'Sci-Fi', materialDirection: 'Carbon-weave shell, glowing sole unit', colorPalette: ['#0a0a2e', '#00ffff', '#ff00ff'], lightingDirection: 'Dramatic underlighting, lens flares', productFeel: 'Alien technology' },
  { name: 'Brutalist', materialDirection: 'Chunky platform, stark geometric shapes', colorPalette: ['#000', '#fff', '#888'], lightingDirection: 'High-contrast flat lighting', productFeel: 'Bold and confrontational' },
  { name: 'Vintage', materialDirection: 'Suede panels, retro colour-blocking', colorPalette: ['#C19A6B', '#8B4513', '#F4A460'], lightingDirection: 'Warm nostalgic tone, soft vignette', productFeel: 'Retro heritage runner' },
  { name: 'Amorphic', materialDirection: 'Fluid melted shapes, 3D-printed lattice', colorPalette: ['#ff6ec7', '#7b68ee', '#00ced1'], lightingDirection: 'Gradient washes, ethereal glow', productFeel: 'Avant-garde and fluid' },
];

export async function runStyleAgent(overview: ProductOverview): Promise<ProductStyle[]> {
  const raw = await callLLM(STYLE_SYSTEM, STYLE_USER(overview.productName));
  if (raw === '__MOCK__') {
    console.warn('[StyleAgent] Using fallback styles');
    return FALLBACK_STYLES;
  }

  const parsed = parseJSON<StyleAgentOutput>(raw);
  if (!parsed?.styles?.length) {
    console.warn('[StyleAgent] Parse failed, using fallback styles');
    return FALLBACK_STYLES;
  }
  return parsed.styles;
}
