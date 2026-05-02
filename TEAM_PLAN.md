# Build-A-World — Team Plan & Architecture

> **Hackathon Project** | May 2026
> "Turn a product idea into a visual world, cinematic launch kit, and market test."

---

## What Is Build-A-World?

Build-A-World is an **AI Product Lifecycle Engine**. A user types a product idea — e.g. _"Design a futuristic sneaker for urban runners"_ — and the system uses multiple AI agents to instantly produce:

1. A customizable product concept
2. A visual product system (Product / Knolling / Exploded views)
3. Seedance-powered cinematic video generation
4. A go-to-market kit
5. Twitter/X social launch integration
6. A/B testing and validation simulation

---

## Team Ownership

| Module | Owner | Key Files |
|---|---|---|
| UI / Frontend / Interaction | **TEAM 1** | `/agents`, `/components`, `/app`, `/services/zaiService.ts`, `/services/butterbaseService.ts` |
| Video Generation Pipeline | **TEAM 2** | `/services/seedanceService.ts`, `/agents/videoPromptAgent.ts`, `/components/VideoStudio.tsx`, `/app/video/page.tsx` |
| Social Media + GTM Integration | **TEAM 3** | `/services/twitterService.ts`, `/agents/gtmAgent.ts`, `/agents/socialAgent.ts`, `/components/GTMKit.tsx`, `/components/SocialLaunch.tsx`, `/app/gtm/page.tsx` |

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend Framework | **Next.js 14** (App Router, TypeScript) | SSR-friendly, clean routing |
| Styling | **Tailwind CSS** (`darkMode: 'class'`) | Utility-first, dark mode built-in |
| Animations | **anime.js** | Page transitions, view toggles, loading states |
| 3D (optional) | **React Three Fiber / Three.js** | Simulated 3D rotation; fallback to image/video |
| LLM Reasoning | **Z.AI → OpenAI → Anthropic** | Fallback chain; all keys in `.env.local` |
| Video Generation | **Seedance 2.0** | `createVideoTask` / `pollVideoTask` / `getVideoResult` |
| Backend / DB / Deploy | **Butterbase** | App state, JSONB storage, frontend deployment |
| Social | **Twitter/X API v2** | OAuth 1.0a; mock mode available |

---

## Folder Structure

```
betaSuperVideoHackathon/
├── .env.local                        ← All API keys (never commit)
├── .gitignore
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── types/
    │   └── productWorld.ts           ← Central data model (TEAM 1)
    │
    ├── utils/
    │   ├── mockData.ts               ← Rich mock ProductWorld for demo fallback (TEAM 1)
    │   └── promptTemplates.ts        ← All LLM prompt templates as constants (TEAM 1)
    │
    ├── services/
    │   ├── zaiService.ts             ← Z.AI → OpenAI → Anthropic fallback (TEAM 1)
    │   ├── seedanceService.ts        ← Seedance video API + mock fallback (TEAM 2)
    │   ├── twitterService.ts         ← Twitter/X OAuth post + mock metrics (TEAM 3)
    │   └── butterbaseService.ts      ← Save/load ProductWorld to Butterbase (TEAM 1)
    │
    ├── agents/
    │   ├── orchestratorAgent.ts      ← Coordinates all agents (TEAM 1)
    │   ├── productStrategyAgent.ts   ← Product name, tagline, features (TEAM 1)
    │   ├── customizationAgent.ts     ← Component dropdowns (TEAM 1)
    │   ├── styleAgent.ts             ← 9 visual style options (TEAM 1)
    │   ├── visualPromptAgent.ts      ← Product/Knolling/Exploded prompts (TEAM 1)
    │   ├── videoPromptAgent.ts       ← 4 Seedance-optimized video prompts (TEAM 2)
    │   ├── gtmAgent.ts               ← Positioning, audience, GTM kit (TEAM 3)
    │   └── socialAgent.ts            ← Twitter posts + A/B simulation (TEAM 3)
    │
    ├── components/
    │   ├── ThemeToggle.tsx           ← Light/dark toggle (TEAM 1)
    │   ├── PromptInput.tsx           ← Landing prompt box + example chips (TEAM 1)
    │   ├── ProductBuilder.tsx        ← 3-column dashboard shell (TEAM 1)
    │   ├── CustomizationPanel.tsx    ← Left panel: dropdowns per component (TEAM 1)
    │   ├── StyleSelector.tsx         ← Creative Clusters dot-map UI (TEAM 1)
    │   ├── ProductVisualizer.tsx     ← Center panel: view area with transitions (TEAM 1)
    │   ├── ViewToggle.tsx            ← Product / Knolling / Exploded pill toggle (TEAM 1)
    │   ├── VideoStudio.tsx           ← Video cards, polling, player (TEAM 2)
    │   ├── GTMKit.tsx                ← Positioning + audience + post cards (TEAM 3)
    │   ├── SocialLaunch.tsx          ← A/B winner + mock engagement metrics (TEAM 3)
    │   ├── ArchitectureDiagram.tsx   ← Agent flow SVG diagram (TEAM 1)
    │   └── LoadingOverlay.tsx        ← Full-screen generation animation (TEAM 1)
    │
    └── app/
        ├── layout.tsx                ← Global layout, ThemeToggle, fonts (TEAM 1)
        ├── page.tsx                  ← PAGE 1: Landing (TEAM 1)
        ├── builder/
        │   └── page.tsx              ← PAGE 2: Product Builder (TEAM 1)
        ├── video/
        │   └── page.tsx              ← PAGE 3: Video Studio (TEAM 2)
        ├── gtm/
        │   └── page.tsx              ← PAGE 4: GTM + Social (TEAM 3)
        └── architecture/
            └── page.tsx              ← PAGE 5: Architecture Demo (TEAM 1)
```

---

## Environment Variables

Create `.env.local` in the project root. **Never commit this file.**

```env
# ── LLM ────────────────────────────────────────────────────
ZAI_API_KEY=                       # Z.AI primary reasoning
OPENAI_API_KEY=                    # Fallback LLM
ANTHROPIC_API_KEY=                 # Fallback LLM

# ── Video ──────────────────────────────────────────────────
SEEDANCE_API_KEY=                  # Seedance 2.0 video generation

# ── Social ─────────────────────────────────────────────────
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# ── Butterbase ─────────────────────────────────────────────
NEXT_PUBLIC_BUTTERBASE_APP_ID=
NEXT_PUBLIC_BUTTERBASE_API_URL=
BUTTERBASE_SERVICE_KEY=

# ── Feature Flags ──────────────────────────────────────────
MOCK_MODE=false                    # Set to true to skip all external API calls
```

---

## Data Model

The central `ProductWorld` object flows through every agent and every page.

```typescript
// src/types/productWorld.ts

export interface ProductWorld {
  id: string;
  createdAt: string;
  userPrompt: string;
  theme: "light" | "dark";

  productOverview: {
    productName: string;
    tagline: string;
    targetUser: string;
    coreUseCase: string;
    keyFeatures: string[];
    breakthroughInnovation: string;
  };

  customizationSystem: {
    components: Array<{
      name: string;
      options: Array<{
        name: string;
        visualDescription: string;
        functionalImpact: string;
      }>;
    }>;
  };

  styles: Array<{
    name: string;
    materialDirection: string;
    colorPalette: string[];
    lightingDirection: string;
    productFeel: string;
  }>;
  selectedStyle: string;
  selectedComponents: Record<string, string>;

  visualSystem: {
    currentView: "product" | "knolling" | "exploded";
    productViewPrompt: string;
    knollingViewPrompt: string;
    explodedViewPrompt: string;
    componentPrompts: string[];
  };

  videoSystem: {
    heroVideoPrompt: string;
    actionVideoPrompt: string;
    artisticVideoPrompt: string;
    animatedVideoPrompt: string;
    simulated3DTurnaroundPrompt: string;
    videoTasks: Array<{
      id: string;
      type: "hero" | "action" | "artistic" | "animated";
      prompt: string;
      status: "pending" | "processing" | "complete" | "failed";
      url?: string;
    }>;
  };

  gtmKit: {
    positioning: string;
    audience: string;
    valueProposition: string;
    twitterPosts: string[];
    abTestingPlan: {
      variantA: { positioning: string; audience: string; visualStrategy: string };
      variantB: { positioning: string; audience: string; visualStrategy: string };
    };
    metrics: {
      engagementRate: number;
      clickIntent: number;
      conversionProxy: number;
      shareabilityScore: number;
    };
    viralMechanic: string;
  };

  social: {
    selectedPost: string;
    postedStatus: "idle" | "posting" | "posted" | "failed";
    mockMetrics: {
      impressions: number;
      likes: number;
      reposts: number;
      replies: number;
      clickIntent: number;
      shareabilityScore: number;
    };
    abTestWinner: "A" | "B" | null;
  };
}
```

---

## Agent Architecture

```
User Input (product idea text)
        │
        ▼
┌─────────────────────┐
│  OrchestratorAgent  │  generateProductWorld(userPrompt)
└─────────────────────┘
        │
        ├──▶ ProductStrategyAgent   →  productOverview
        ├──▶ CustomizationAgent     →  customizationSystem
        ├──▶ StyleAgent             →  styles[] (9 options)
        ├──▶ VisualPromptAgent      →  visualSystem prompts
        ├──▶ VideoPromptAgent       →  videoSystem prompts  (TEAM 2)
        ├──▶ GTMAgent               →  gtmKit              (TEAM 3)
        └──▶ SocialAgent            →  social + A/B data   (TEAM 3)
                │
                ▼
        Butterbase (save ProductWorld JSON blob)
                │
                ▼
        Frontend renders all 5 pages
```

All agents call `zaiService.callLLM(systemPrompt, userPrompt)` which internally tries Z.AI → OpenAI → Anthropic in order, or returns mock JSON if `MOCK_MODE=true`.

---

## Pages

### PAGE 1 — Landing (`/`)
**Owner: TEAM 1**
- Full-viewport hero section
- App name: **Build-A-World** with large animated title
- Subtitle: _"Turn a product idea into a visual world, cinematic launch kit, and market test."_
- Large textarea prompt input
- Example prompt chips:
  - "Design a futuristic sneaker for urban runners"
  - "Create a smart temperature and humidity sensor for modern homes"
  - "Build a minimal mechanical keyboard for digital nomads"
  - "Design a solar-powered backpack for everyday explorers"
- **"Build My World"** CTA button with anime.js pulse on hover
- Light/dark mode toggle in top-right corner
- anime.js entrance animation on page load

### PAGE 2 — Product Builder (`/builder`)
**Owner: TEAM 1**

3-column layout:

| Left Panel | Center Panel | Right Panel |
|---|---|---|
| Customization dropdowns (per component) | Product visualization area | Product overview |
| Style selector (cluster map) | View toggle: Product / Knolling / Exploded | Key features list |
| Light/dark toggle | Animated cross-fade between views | Breakthrough innovation |
| Regenerate button | Product name label | Selected style summary |

- Component dropdowns generated by `CustomizationAgent`
- Style selector: dot-cluster map with 9 named styles (Futurist, Minimalist, Industrial, Organic, Luxury, Sci-Fi, Brutalist, Vintage, Amorphic)
- View toggle uses anime.js fade transitions
- Right panel shows structured product data from `ProductStrategyAgent`

### PAGE 3 — Video Studio (`/video`)
**Owner: TEAM 2**

- 4 video prompt cards displayed:
  - **Hero Video** — cinematic product reveal
  - **Action Video** — performance/usage scenario
  - **Artistic Video** — styled/mood-driven
  - **Animated Video** — experimental/abstract
- Each card shows the generated Seedance prompt
- Generate buttons trigger `seedanceService.createVideoTask(prompt)`
- anime.js progress bar/spinner during `pollVideoTask(taskId)` polling
- On completion: embedded video player
- Mock fallback: static placeholder card with prompt text and "Demo Mode" badge

### PAGE 4 — GTM + Social (`/gtm`)
**Owner: TEAM 3**

- Positioning statement card
- Target audience card
- Value proposition card
- 3 Twitter/X post cards (Viral / Premium / Experimental):
  - **Copy** button
  - **Post to X** button (real or mock)
  - Mock engagement preview on hover
- A/B Testing section:
  - Variant A vs Variant B comparison table
  - Mock scores: Engagement Rate, Click Intent, Conversion Proxy, Shareability
  - Winner highlighted with animation
- Viral mechanic description
- If real Twitter API unavailable: mock "Posted successfully" state with fake impressions/likes/reposts

### PAGE 5 — Architecture (`/architecture`)
**Owner: TEAM 1**
_Important for hackathon judging._

Clean visual diagram showing:
```
User Input → Orchestrator Agent → Product Strategy Agent
           → Customization Agent → Style Agent
           → Visual Prompt Agent → Video Prompt Agent
           → Seedance Video API  → GTM Agent
           → Social Agent        → Butterbase State
           → Final Product World
```
- Each node styled as a glassmorphism card
- Animated connection lines using anime.js or SVG paths
- Tech stack badges on each node

---

## Agent Specifications

### 1. ProductStrategyAgent
```
Input:  userPrompt (string)
Output: {
  productName, tagline, targetUser,
  coreUseCase, keyFeatures[], breakthroughInnovation
}
```

### 2. CustomizationAgent
```
Input:  productOverview
Output: {
  components: [{ name, options: [{ name, visualDescription, functionalImpact }] }]
}
```

### 3. StyleAgent
```
Input:  productOverview
Output: {
  styles: [{ name, materialDirection, colorPalette[], lightingDirection, productFeel }]
}
```
Generates 9 named styles matching the Creative Clusters UI: Futurist, Minimalist, Industrial, Organic, Luxury, Sci-Fi, Brutalist, Vintage, Amorphic.

### 4. VisualPromptAgent
```
Input:  productOverview + selectedStyle + selectedComponents
Output: {
  productViewPrompt,    ← clean hero render
  knollingViewPrompt,   ← flat-lay components
  explodedViewPrompt,   ← layered spatial view
  componentPrompts[]    ← per-part renders
}
```

### 5. VideoPromptAgent _(TEAM 2)_
```
Input:  productOverview + selectedStyle + visualSystem
Output: {
  heroVideoPrompt,              ← cinematic product reveal
  actionVideoPrompt,            ← performance/usage
  artisticVideoPrompt,          ← mood/style-driven
  animatedVideoPrompt,          ← experimental/abstract
  simulated3DTurnaroundPrompt   ← 360° rotation simulation
}
```
Each prompt must include: environment, lighting, motion, camera movement, product interaction, emotional tone, 30-second target duration, seamless loop instruction.

### 6. GTMAgent _(TEAM 3)_
```
Input:  productOverview + selectedStyle
Output: {
  positioning, audience, valueProposition,
  twitterPosts[],     ← 3 post variants
  abTestingPlan,      ← Variant A + B
  metrics,            ← engagement scores
  viralMechanic
}
```

### 7. SocialAgent _(TEAM 3)_
```
Input:  gtmKit + productOverview
Output: {
  posts[],
  selectedPost,
  mockEngagementResults,
  abTestWinner ("A" | "B")
}
```

### 8. OrchestratorAgent
```typescript
async function generateProductWorld(userPrompt: string): Promise<ProductWorld>
```
Calls all agents sequentially, assembles the `ProductWorld` object, saves to Butterbase via `butterbaseService.saveProductWorld()`, returns the full payload.

---

## Service Interfaces

### zaiService.ts _(TEAM 1)_
```typescript
callLLM(systemPrompt: string, userPrompt: string): Promise<string>
// Tries Z.AI → OpenAI → Anthropic → mock JSON fallback
```

### seedanceService.ts _(TEAM 2)_
```typescript
createVideoTask(prompt: string): Promise<{ taskId: string }>
pollVideoTask(taskId: string): Promise<{ status: string }>
getVideoResult(taskId: string): Promise<{ url: string }>
mockVideoTask(prompt: string): Promise<MockVideoResult>
// TODO: set SEEDANCE_API_KEY in .env.local
```

### twitterService.ts _(TEAM 3)_
```typescript
postToTwitter(text: string): Promise<{ tweetId: string }>
mockPostToTwitter(text: string): Promise<MockTweetMetrics>
// TODO: set TWITTER_* keys in .env.local
```

### butterbaseService.ts _(TEAM 1)_
```typescript
saveProductWorld(pw: ProductWorld): Promise<string>   // returns id
loadProductWorld(id: string): Promise<ProductWorld>
listProductWorlds(): Promise<ProductWorld[]>
```

---

## Butterbase Setup Steps

1. Call `init_app` → captures `app_id` and `api_base_url`
2. Call `apply_schema` → creates `product_worlds` table:
   - `id` UUID PK
   - `user_prompt` TEXT
   - `product_world_json` JSONB
   - `theme` TEXT
   - `created_at` TIMESTAMPTZ DEFAULT now()
3. Call `update_cors` → allow `localhost:3000` + deployment URL
4. Call `update_app_access_mode` → `public` (unauthenticated access for hackathon demo)
5. Copy `app_id` and `api_base_url` into `.env.local`

---

## UI Design Rules

- **Cards**: `rounded-2xl`, `shadow-lg`, `p-6`
- **Dark mode**: near-black/charcoal bg, white text, glassmorphism cards, neon teal accent (`#6EE7F7`)
- **Light mode**: white/soft-gray bg, black text, subtle shadows, clean studio aesthetic
- **Typography**: Inter or Geist font, tight leading for headings
- **Buttons**: rounded-full, accent-colored, hover scale via anime.js
- **Transitions**: all view changes animated, no jarring jumps
- **Loading**: anime.js full-screen overlay during `generateProductWorld()` call

### anime.js Usage
| Interaction | Animation |
|---|---|
| Page load | Staggered card entrance from bottom |
| Product → Knolling → Exploded toggle | Cross-fade + subtle scale |
| Style selector hover | Dot pulse + label appear |
| "Build My World" click | Button morph → loading spinner |
| Video generating | Progress arc animation |
| A/B winner reveal | Score bars fill with easing |

---

## Mock Mode

Every external API has a mock fallback. Set `MOCK_MODE=true` in `.env.local` to run the full demo without any API keys.

| Service | Mock Behavior |
|---|---|
| Z.AI / LLM | Returns pre-built `mockData.ts` ProductWorld |
| Seedance | Returns demo video card with prompt text + placeholder thumbnail |
| Twitter/X | Returns fake metrics: impressions, likes, reposts, replies |
| Butterbase | Falls back to localStorage for state if Butterbase is unreachable |

---

## Hackathon Demo Script (3 minutes)

| Step | Action | Page |
|---|---|---|
| 1 | Type: _"Create a smart temperature and humidity sensor"_ → click Build My World | Landing |
| 2 | Show customization dropdowns auto-populated | Builder |
| 3 | Toggle: **Product → Knolling → Exploded** (animated) | Builder |
| 4 | Change style: **Futurist → Industrial** | Builder |
| 5 | Click Generate Hero Video → show Seedance polling → video plays | Video Studio |
| 6 | Show 3 video concepts with different moods | Video Studio |
| 7 | Show positioning statement + value prop | GTM |
| 8 | Show 3 Twitter/X posts → click Post to X | GTM |
| 9 | Show A/B test winner with score bars | GTM |
| 10 | Open Architecture page for judges | Architecture |

---

## Implementation Checklist

### Phase 0 — Butterbase Provisioning
- [ ] Create Butterbase app via `init_app`
- [ ] Apply `product_worlds` schema
- [ ] Configure CORS and access mode
- [ ] Copy credentials to `.env.local`

### Phase 1 — Project Scaffold
- [ ] `package.json` with all dependencies
- [ ] `next.config.js`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`
- [ ] `.env.local` with all placeholders
- [ ] `.gitignore`

### Phase 2 — Types & Utils
- [ ] `src/types/productWorld.ts`
- [ ] `src/utils/mockData.ts` (temperature sensor example)
- [ ] `src/utils/promptTemplates.ts`

### Phase 3 — Services
- [ ] `zaiService.ts` (TEAM 1)
- [ ] `seedanceService.ts` (TEAM 2)
- [ ] `twitterService.ts` (TEAM 3)
- [ ] `butterbaseService.ts` (TEAM 1)

### Phase 4 — Agents
- [ ] `productStrategyAgent.ts` (TEAM 1)
- [ ] `customizationAgent.ts` (TEAM 1)
- [ ] `styleAgent.ts` (TEAM 1)
- [ ] `visualPromptAgent.ts` (TEAM 1)
- [ ] `videoPromptAgent.ts` (TEAM 2)
- [ ] `gtmAgent.ts` (TEAM 3)
- [ ] `socialAgent.ts` (TEAM 3)
- [ ] `orchestratorAgent.ts` (TEAM 1)

### Phase 5 — Components
- [ ] `ThemeToggle.tsx` (TEAM 1)
- [ ] `PromptInput.tsx` (TEAM 1)
- [ ] `ProductBuilder.tsx` (TEAM 1)
- [ ] `CustomizationPanel.tsx` (TEAM 1)
- [ ] `StyleSelector.tsx` (TEAM 1)
- [ ] `ProductVisualizer.tsx` (TEAM 1)
- [ ] `ViewToggle.tsx` (TEAM 1)
- [ ] `VideoStudio.tsx` (TEAM 2)
- [ ] `GTMKit.tsx` (TEAM 3)
- [ ] `SocialLaunch.tsx` (TEAM 3)
- [ ] `ArchitectureDiagram.tsx` (TEAM 1)
- [ ] `LoadingOverlay.tsx` (TEAM 1)

### Phase 6 — Pages
- [ ] `app/layout.tsx` (TEAM 1)
- [ ] `app/page.tsx` — Landing (TEAM 1)
- [ ] `app/builder/page.tsx` (TEAM 1)
- [ ] `app/video/page.tsx` (TEAM 2)
- [ ] `app/gtm/page.tsx` (TEAM 3)
- [ ] `app/architecture/page.tsx` (TEAM 1)

### Phase 7 — Deploy
- [ ] `npm run build` → static export
- [ ] `create_frontend_deployment` via Butterbase MCP
- [ ] `start_frontend_deployment`
- [ ] `prep_and_submit_hackathon_entry`

---

## Key Rules

- **Every AI output powers a visible UI element** — no text-only pages
- **Every page works in mock mode** — demo survives API failures
- **Never hardcode API keys** — always `.env.local`
- **Each teammate owns clear file boundaries** — merge cleanly at the end
- **Mock fallbacks ship alongside real integrations** — toggle with `MOCK_MODE=true`
- **Prioritize demo impact** over perfect backend completeness
- **Comment every file** with which team member owns it
