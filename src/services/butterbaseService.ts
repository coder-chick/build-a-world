// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// Butterbase REST data API service.
// Saves and loads ProductWorld objects from Butterbase.
// Falls back to localStorage if Butterbase is unreachable.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductWorld } from '@/types/productWorld';

const APP_ID   = process.env.NEXT_PUBLIC_BUTTERBASE_APP_ID  ?? 'app_x3jo6j4gzl8x';
const API_BASE = process.env.NEXT_PUBLIC_BUTTERBASE_API_URL ?? 'https://api.butterbase.ai/v1/app_x3jo6j4gzl8x';

const LS_KEY = 'baw_product_worlds';

// ── Local storage fallback ────────────────────────────────────────────────────

function lsSave(pw: ProductWorld): string {
  const existing = lsList();
  const idx = existing.findIndex((e) => e.id === pw.id);
  if (idx >= 0) existing[idx] = pw;
  else existing.unshift(pw);
  localStorage.setItem(LS_KEY, JSON.stringify(existing));
  return pw.id;
}

function lsLoad(id: string): ProductWorld | null {
  return lsList().find((p) => p.id === id) ?? null;
}

function lsList(): ProductWorld[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ProductWorld[]) : [];
  } catch {
    return [];
  }
}

// ── Butterbase REST helpers ───────────────────────────────────────────────────

async function bbPost(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Butterbase POST ${path} → ${res.status}`);
  return res.json();
}

async function bbGet(path: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Butterbase GET ${path} → ${res.status}`);
  return res.json();
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Upsert a ProductWorld into Butterbase. Returns the row id. */
export async function saveProductWorld(pw: ProductWorld): Promise<string> {
  // Always save to localStorage as a safety net
  if (typeof window !== 'undefined') lsSave(pw);

  try {
    await bbPost('/product_worlds', {
      id: pw.id,
      user_prompt: pw.userPrompt,
      product_world_json: pw,
      theme: pw.theme,
    });
    return pw.id;
  } catch (err) {
    console.warn('[butterbaseService] save failed — using localStorage only', err);
    return pw.id;
  }
}

/** Load a single ProductWorld by id. */
export async function loadProductWorld(id: string): Promise<ProductWorld | null> {
  try {
    const data = (await bbGet(
      `/product_worlds?id=eq.${id}&limit=1`
    )) as Array<{ product_world_json: ProductWorld }>;
    return data[0]?.product_world_json ?? null;
  } catch {
    if (typeof window !== 'undefined') return lsLoad(id);
    return null;
  }
}

/** List recent ProductWorlds (most recent first). */
export async function listProductWorlds(): Promise<ProductWorld[]> {
  try {
    const data = (await bbGet(
      '/product_worlds?order=created_at.desc&limit=20'
    )) as Array<{ product_world_json: ProductWorld }>;
    return data.map((r) => r.product_world_json);
  } catch {
    if (typeof window !== 'undefined') return lsList();
    return [];
  }
}

/** Save only the theme preference for a given ProductWorld. */
export async function saveTheme(id: string, theme: 'light' | 'dark'): Promise<void> {
  if (typeof window !== 'undefined') {
    const worlds = lsList();
    const idx = worlds.findIndex((w) => w.id === id);
    if (idx >= 0) {
      worlds[idx].theme = theme;
      localStorage.setItem(LS_KEY, JSON.stringify(worlds));
    }
  }
  // Best-effort Butterbase update — ignore errors
  try {
    await bbPost(`/product_worlds?id=eq.${id}`, { theme });
  } catch {
    /* silent */
  }
}
