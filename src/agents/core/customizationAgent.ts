// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// CustomizationAgent — generates product component dropdown options.
// ─────────────────────────────────────────────────────────────────────────────

import { CustomizationSystem, ProductOverview } from '@/types/productWorld';
import { callLLM, parseJSON } from '@/services/zaiService';
import { CUSTOMIZATION_SYSTEM, CUSTOMIZATION_USER } from '@/utils/promptTemplates';
function fallbackCustomization(): CustomizationSystem {
  return {
    components: [
      { name: 'Upper Material', options: [
        { name: 'Breathable Mesh', visualDescription: 'Lightweight engineered mesh knit upper with ventilation zones', functionalImpact: 'Maximum airflow for hot-weather runs' },
        { name: 'Knit Fabric', visualDescription: 'Seamless nanofiber knit upper with adaptive stretch', functionalImpact: 'Sock-like fit that adapts to foot shape' },
        { name: 'Synthetic Leather', visualDescription: 'Premium synthetic leather with metallic sheen accents', functionalImpact: 'Water-resistant durability for all conditions' },
      ]},
      { name: 'Midsole Cushioning', options: [
        { name: 'Responsive Foam', visualDescription: 'High-rebound responsive foam midsole for energy return', functionalImpact: 'Energy return on every stride' },
        { name: 'Dual-Density Gel', visualDescription: 'Dual-density gel cushioning with visible air chamber', functionalImpact: 'Impact absorption for long-distance comfort' },
      ]},
      { name: 'Outsole Grip', options: [
        { name: 'Urban Traction', visualDescription: 'Multi-directional rubber lugs for wet city streets', functionalImpact: 'Reliable grip on wet urban surfaces' },
        { name: 'Multi-Terrain', visualDescription: 'Adaptive high-grip rubber outsole for mixed surfaces', functionalImpact: 'Versatile traction across pavement and trails' },
      ]},
      { name: 'Lacing System', options: [
        { name: 'Traditional Laces', visualDescription: 'Flat reflective laces with reinforced eyelets', functionalImpact: 'Classic adjustable fit with nighttime visibility' },
        { name: 'Quick-Toggle', visualDescription: 'Single-pull toggle lacing with cable lock mechanism', functionalImpact: 'Instant secure fit with one hand' },
      ]},
      { name: 'Color Scheme', options: [
        { name: 'Neon Blaze', visualDescription: 'Black base with electric neon green and orange accents', functionalImpact: 'High visibility for night runs' },
        { name: 'Stealth Black', visualDescription: 'All-black matte finish with subtle reflective piping', functionalImpact: 'Versatile style for street and gym' },
        { name: 'Urban Frost', visualDescription: 'Cool grey and ice-blue gradient with white sole', functionalImpact: 'Clean aesthetic for casual and active wear' },
      ]},
    ],
  };
}

export async function runCustomizationAgent(
  overview: ProductOverview
): Promise<CustomizationSystem> {
  const raw = await callLLM(
    CUSTOMIZATION_SYSTEM,
    CUSTOMIZATION_USER(overview.productName, overview.coreUseCase)
  );
  if (raw === '__MOCK__') {
    console.warn('[CustomizationAgent] Using fallback');
    return fallbackCustomization();
  }

  const parsed = parseJSON<CustomizationSystem>(raw);
  if (!parsed) {
    console.warn('[CustomizationAgent] Parse failed, using fallback');
    return fallbackCustomization();
  }
  return parsed;
}
