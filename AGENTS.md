# Build-A-World — AI Agent Instructions

> **This file is written for Cursor AI agents**, not humans.
> Each team member's AI agent should read this file to understand what it can edit,
> what it must not touch, and how to make changes correctly.

---

## Project Overview

Build-A-World is a **Next.js 14 + TypeScript + Tailwind CSS** hackathon app.
A user types a product idea, and 8 AI agents collaboratively generate a full
`ProductWorld` — a structured product brief, visual/video prompts, GTM kit,
and social media launch plan.

**Tech stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3.4,
anime.js, Z.AI / OpenAI / Anthropic LLM chain, Seedance 2.0 video, Twitter/X API,
Butterbase persistence.

---

## App Flow

The user moves through these pages in order:

```
/ (Home + Ideation) → /builder (Product Builder) → /video (Video Studio)
→ /gtm (GTM + Social) → /summary (Final Plan)
```

`/architecture` exists for hackathon judging but is hidden from the nav.

---

## Team Assignments

| Team | Focus | Person works on |
|------|-------|-----------------|
| **Team 1** | **Builder** | Product builder page — customization, styles, product/knolling/exploded views, core AI agents |
| **Team 2** | **Video** | Video generation pipeline — Seedance API, video prompts, Video Studio page |
| **Team 3** | **GTM + Social** | Go-to-market — positioning, audience, Twitter posts, A/B testing, social launch |

---

## Shared Data Contract

All pages share a single `ProductWorld` object defined in `src/types/productWorld.ts`.

**How data flows between pages:**
- `/` (Home) stores the user's prompt in `sessionStorage` under key `baw_pending_prompt` (plain string).
- `/builder` reads `baw_pending_prompt`, runs the agent pipeline, and stores the resulting `ProductWorld` JSON in `sessionStorage` under key `baw_world`.
- All downstream pages (`/video`, `/gtm`, `/summary`) read `baw_world` from `sessionStorage`.
- Each page may update its slice of `ProductWorld` and write it back to `sessionStorage`.

**IMPORTANT:** Do NOT change the `ProductWorld` interface shape without coordinating
with all three teams. It is the contract that ties everything together.

---

## Folder Structure

```
src/
├── components/
│   ├── shared/        ← Shared UI (ThemeToggle, LoadingOverlay, NavClient, ArchitectureDiagram)
│   ├── chat/          ← Home/ideation (ChatInterface, ChatMessage, PromptInput)
│   ├── builder/       ← TEAM 1: Builder page (ProductBuilder, CustomizationPanel, StyleSelector,
│   │                     ProductVisualizer, ViewToggle)
│   ├── visuals/       ← TEAM 2: Video display (VideoStudio)
│   ├── gtm/           ← TEAM 3: GTM & social (GTMKit, SocialLaunch)
│   └── summary/       ← Summary page (AssetGallery, PlanSummary)
│
├── agents/
│   ├── core/          ← TEAM 1: orchestratorAgent, productStrategyAgent, customizationAgent, styleAgent
│   ├── visuals/       ← TEAM 1 owns visualPromptAgent, TEAM 2 owns videoPromptAgent
│   └── gtm/           ← TEAM 3: gtmAgent, socialAgent
│
├── services/
│   ├── zaiService.ts          ← Shared LLM service (all agents depend on this)
│   ├── butterbaseService.ts   ← Persistence
│   ├── seedanceService.ts     ← TEAM 2: Seedance video API
│   └── twitterService.ts      ← TEAM 3: Twitter/X API
│
├── app/
│   ├── layout.tsx             ← Global layout + nav
│   ├── page.tsx               ← Home / ideation page
│   ├── builder/page.tsx       ← TEAM 1: Product builder
│   ├── video/page.tsx         ← TEAM 2: Video studio
│   ├── gtm/page.tsx           ← TEAM 3: GTM + social
│   ├── summary/page.tsx       ← Summary page
│   └── architecture/page.tsx  ← Architecture diagram (hidden from nav)
│
├── types/productWorld.ts      ← SHARED (do not modify without coordination)
├── utils/mockData.ts          ← SHARED (example prompts)
├── utils/promptTemplates.ts   ← SHARED (LLM prompt templates)
└── lib/nav.ts                 ← Navigation link definitions
```

---

## Shared Rules

These rules apply to ALL teams:

### Styling
- Use CSS design token variables (`--color-fg`, `--color-card`, `--color-border`, etc.)
  defined in `src/app/globals.css`. Do NOT hardcode colors.
- Use pre-built CSS component classes: `.card`, `.glass-card`, `.btn-accent`,
  `.btn-ghost`, `.btn-outline`, `.badge`, `.badge-accent`, `.section-heading`, `.section-sub`.
- Dark mode uses the `class` strategy (`.dark` on `<html>`).
- All animations use **anime.js**. Do not add other animation libraries.

### Imports
- Use the `@/` path alias for absolute imports (e.g., `@/components/builder/ProductBuilder`).
- Use relative imports (`./`, `../`) only for files within the same folder.

### Adding a new file
1. Create the file in your team's folder.
2. Add a re-export to the folder's `index.ts` barrel file.
3. Add the `// OWNER: TEAM N` comment at the top of the file.
4. Run `npm run build` to verify the project still compiles.

### Testing
- `npm run dev` — start dev server on localhost:3000.
- `npm run build` — verify types and compilation.
- `npm run lint` — check for lint errors.

---

## Team 1 — Builder

### You are the AI agent for the builder team member.

### Your files (you may create, edit, and delete these)
```
src/components/builder/*         ProductBuilder, CustomizationPanel, StyleSelector,
                                 ProductVisualizer, ViewToggle
src/agents/core/*                orchestratorAgent, productStrategyAgent,
                                 customizationAgent, styleAgent
src/agents/visuals/visualPromptAgent.ts   Visual prompt generation (product/knolling/exploded)
src/app/builder/page.tsx         Product builder page
```

### Files you may also edit (shared ownership)
```
src/components/shared/*          ThemeToggle, LoadingOverlay, NavClient, ArchitectureDiagram
src/components/chat/*            ChatInterface, ChatMessage, PromptInput
src/components/summary/*         AssetGallery, PlanSummary
src/services/zaiService.ts       LLM fallback chain
src/services/butterbaseService.ts Persistence
src/app/layout.tsx               Global layout + nav
src/app/page.tsx                 Home / ideation page
src/app/summary/page.tsx         Summary page
src/app/architecture/page.tsx    Architecture page
src/app/globals.css              Design tokens + component classes
src/lib/nav.ts                   Navigation links
tailwind.config.js               Tailwind configuration
```

### DO NOT EDIT (owned by other teams)
```
src/components/visuals/*         ← TEAM 2 (VideoStudio)
src/components/gtm/*             ← TEAM 3 (GTMKit, SocialLaunch)
src/agents/visuals/videoPromptAgent.ts  ← TEAM 2
src/agents/gtm/*                 ← TEAM 3
src/services/seedanceService.ts  ← TEAM 2
src/services/twitterService.ts   ← TEAM 3
src/app/video/page.tsx           ← TEAM 2
src/app/gtm/page.tsx             ← TEAM 3
```

### What you build
- The 3-column builder layout: left panel (customization dropdowns + style selector),
  center panel (product/knolling/exploded views with animated transitions),
  right panel (product overview + features).
- The core AI agents that generate the product strategy, customization options,
  styles, and visual prompts.
- The visual prompt agent that creates prompts for the 3 view types.

### How to add a new view type
1. Add the view to `VisualizationView` type in `src/types/productWorld.ts` (coordinate with all teams).
2. Add a prompt field in `VisualSystem` interface.
3. Update `agents/visuals/visualPromptAgent.ts` to generate the new prompt.
4. Update `ProductVisualizer.tsx` and `ViewToggle.tsx` in `components/builder/`.

---

## Team 2 — Video Generation & Video Studio

### You are the AI agent for the video generation team member.

### Your files (you may create, edit, and delete these)
```
src/components/visuals/*                VideoStudio
src/agents/visuals/videoPromptAgent.ts  Video prompt generation
src/services/seedanceService.ts         Seedance video API + mock fallback
src/app/video/page.tsx                  Video Studio page
```

### DO NOT EDIT (owned by other teams)
```
src/components/shared/*          ← TEAM 1
src/components/chat/*            ← TEAM 1
src/components/builder/*         ← TEAM 1 (ProductBuilder, ProductVisualizer, ViewToggle, etc.)
src/components/summary/*         ← TEAM 1
src/components/gtm/*             ← TEAM 3
src/agents/core/*                ← TEAM 1
src/agents/visuals/visualPromptAgent.ts  ← TEAM 1
src/agents/gtm/*                 ← TEAM 3
src/services/zaiService.ts       ← TEAM 1
src/services/butterbaseService.ts ← TEAM 1
src/services/twitterService.ts   ← TEAM 3
src/app/layout.tsx               ← TEAM 1
src/app/page.tsx                 ← TEAM 1
src/app/builder/page.tsx         ← TEAM 1
src/app/gtm/page.tsx             ← TEAM 3
```

### What you build
- The Video Studio page with 4 video types: Hero, Action, Artistic, Animated.
- The Seedance API integration (create tasks, poll for results, handle errors).
- Image-to-video support (base image URL input for product consistency).
- The video prompt agent that generates Seedance-optimized prompts.

### Your data contract
Your agent populates `videoSystem` in `ProductWorld`:
- `heroVideoPrompt`, `actionVideoPrompt`, `artisticVideoPrompt`, `animatedVideoPrompt`
- `baseImageUrl` (optional, for image-to-video)
- `videoTasks[]` (status tracking for each generation)

### How to add a new video type
1. Add the type to `VideoType` in `src/types/productWorld.ts` (coordinate with all teams).
2. Add a prompt field in `VideoSystem` interface.
3. Update `agents/visuals/videoPromptAgent.ts` to generate the new prompt.
4. Update `VideoStudio.tsx` to display the new video card.

### How to update the Seedance API
1. Edit `src/services/seedanceService.ts` for endpoint/model changes.
2. The service has `'use server'` — it runs server-side for API key safety.
3. Update `VIDEO_CONFIG` in `VideoStudio.tsx` if UI needs to reflect new capabilities.

---

## Team 3 — GTM + Social Media

### You are the AI agent for the social media / go-to-market team member.

### Your files (you may create, edit, and delete these)
```
src/components/gtm/*             GTMKit, SocialLaunch
src/agents/gtm/*                 gtmAgent, socialAgent
src/services/twitterService.ts   Twitter/X API + mock fallback
src/app/gtm/page.tsx             GTM + Social page
```

### DO NOT EDIT (owned by other teams)
```
src/components/shared/*          ← TEAM 1
src/components/chat/*            ← TEAM 1
src/components/builder/*         ← TEAM 1
src/components/summary/*         ← TEAM 1
src/components/visuals/*         ← TEAM 2
src/agents/core/*                ← TEAM 1
src/agents/visuals/*             ← TEAM 1 + TEAM 2
src/services/zaiService.ts       ← TEAM 1
src/services/butterbaseService.ts ← TEAM 1
src/services/seedanceService.ts  ← TEAM 2
src/app/layout.tsx               ← TEAM 1
src/app/page.tsx                 ← TEAM 1
src/app/builder/page.tsx         ← TEAM 1
src/app/video/page.tsx           ← TEAM 2
```

### What you build
- The GTM page with positioning, audience, and value proposition cards.
- 3 Twitter/X post variants (Viral, Premium, Experimental) with copy/post buttons.
- A/B testing section with variant comparison and mock engagement scores.
- The social agent that generates posts and simulates engagement metrics.

### Your data contract
Your agents populate `gtmKit` and `social` in `ProductWorld`:
- `gtmKit`: `positioning`, `audience`, `valueProposition`, `twitterPosts[]`,
  `abTestingPlan`, `metrics`, `viralMechanic`
- `social`: `selectedPost`, `postedStatus`, `mockMetrics`, `abTestWinner`

### How to add a new social platform
1. Create a new service file (e.g., `src/services/instagramService.ts`).
2. Update `src/agents/gtm/socialAgent.ts` to generate posts for the new platform.
3. Add UI components in `src/components/gtm/`.
4. Update `src/app/gtm/page.tsx` to include the new section.
5. Export new components from `src/components/gtm/index.ts`.

### How to update GTM agent output
1. Edit prompt templates in `src/utils/promptTemplates.ts` (`GTM_SYSTEM`, `GTM_USER`).
2. Edit `src/agents/gtm/gtmAgent.ts` to parse the new output format.
3. Update `GTMKit.tsx` to display the new fields.

---

## Quick Reference

| Action | Command |
|--------|---------|
| Install dependencies | `npm install` |
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Lint | `npm run lint` |
| SessionStorage key: pending prompt | `baw_pending_prompt` |
| SessionStorage key: product world | `baw_world` |
