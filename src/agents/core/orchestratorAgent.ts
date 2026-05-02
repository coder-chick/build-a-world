// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// OrchestratorAgent — coordinates all agents and assembles the ProductWorld.
// Exposes a single function: generateProductWorld(userPrompt)
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { ProductWorld } from '@/types/productWorld';
import { saveProductWorld } from '@/services/butterbaseService';

import { runProductStrategyAgent }  from './productStrategyAgent';
import { runCustomizationAgent }    from './customizationAgent';
import { runStyleAgent }            from './styleAgent';
import { runVisualPromptAgent }     from '../visuals/visualPromptAgent';
import { runVideoPromptAgent }      from '../visuals/videoPromptAgent';
import { runGTMAgent }              from '../gtm/gtmAgent';
import { runSocialAgent }           from '../gtm/socialAgent';

/**
 * Master orchestration function.
 * Runs all agents in a logical sequence and returns a complete ProductWorld.
 * Saves the result to Butterbase automatically.
 *
 * @param userPrompt - The raw product idea from the user
 * @param theme      - Initial UI theme preference
 */
export async function generateProductWorld(
  userPrompt: string,
  theme: 'light' | 'dark' = 'dark'
): Promise<ProductWorld> {

  // ── Step 1: Product Strategy ───────────────────────────────────────────────
  const productOverview = await runProductStrategyAgent(userPrompt);

  // ── Step 2: Customization + Styles (can run in parallel) ──────────────────
  const [customizationSystem, styles] = await Promise.all([
    runCustomizationAgent(productOverview),
    runStyleAgent(productOverview),
  ]);

  const selectedStyle = styles[0]?.name ?? 'Futurist';

  // Default selected components = first option of each component
  const selectedComponents: Record<string, string> = {};
  for (const comp of customizationSystem.components) {
    selectedComponents[comp.name] = comp.options[0]?.name ?? '';
  }

  // ── Step 3: Visual + Video prompts (can run in parallel) ──────────────────
  const [visualSystem, videoSystem] = await Promise.all([
    runVisualPromptAgent(productOverview, selectedStyle),
    runVideoPromptAgent(productOverview, selectedStyle),
  ]);

  // ── Step 4: GTM Kit ────────────────────────────────────────────────────────
  const gtmKit = await runGTMAgent(productOverview);

  // ── Step 5: Social ─────────────────────────────────────────────────────────
  const social = await runSocialAgent(gtmKit);

  // ── Assemble ProductWorld ──────────────────────────────────────────────────
  const productWorld: ProductWorld = {
    id:           uuidv4(),
    createdAt:    new Date().toISOString(),
    userPrompt,
    theme,
    productOverview,
    customizationSystem,
    styles,
    selectedStyle,
    selectedComponents,
    visualSystem,
    videoSystem,
    gtmKit,
    social,
  };

  // ── Persist to Butterbase ──────────────────────────────────────────────────
  await saveProductWorld(productWorld);

  return productWorld;
}

/**
 * Regenerate only the sections affected by a style or component change.
 * Use this instead of full regeneration when the user updates a dropdown.
 */
export async function regenerateVisuals(
  productWorld: ProductWorld,
  newStyle?: string,
  newComponents?: Record<string, string>
): Promise<ProductWorld> {
  const selectedStyle     = newStyle      ?? productWorld.selectedStyle;
  const selectedComponents = newComponents ?? productWorld.selectedComponents;

  const [visualSystem, videoSystem] = await Promise.all([
    runVisualPromptAgent(productWorld.productOverview, selectedStyle),
    runVideoPromptAgent(productWorld.productOverview, selectedStyle),
  ]);

  const updated: ProductWorld = {
    ...productWorld,
    selectedStyle,
    selectedComponents,
    visualSystem:  { ...visualSystem, currentView: productWorld.visualSystem.currentView },
    videoSystem:   { ...videoSystem, videoTasks: productWorld.videoSystem.videoTasks },
  };

  await saveProductWorld(updated);
  return updated;
}
