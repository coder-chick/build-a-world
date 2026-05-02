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
/ (Landing) → /chat (Ideation) → /builder (Product Builder)
→ /video (Video Studio) → /gtm (GTM + Social) → /summary (Final Plan)
```

`/architecture` is a standalone page for hackathon judging.

---

## Shared Data Contract

All pages share a single `ProductWorld` object defined in `src/types/productWorld.ts`.

**How data flows between pages:**
- `/chat` stores the user's refined prompt in `sessionStorage` under key `baw_pending_prompt` (plain string).
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
│   ├── shared/        ← TEAM 1: Global UI (ThemeToggle, LoadingOverlay, NavClient, ArchitectureDiagram)
│   ├── chat/          ← TEAM 1: Chat ideation page (ChatInterface, ChatMessage, PromptInput)
│   ├── builder/       ← TEAM 1: Builder page (ProductBuilder, CustomizationPanel, StyleSelector)
│   ├── visuals/       ← TEAM 2: Image & video display (ProductVisualizer, ViewToggle, VideoStudio)
│   ├── gtm/           ← TEAM 3: GTM & social (GTMKit, SocialLaunch)
│   └── summary/       ← TEAM 1: Summary page (AssetGallery, PlanSummary)
│
├── agents/
│   ├── core/          ← TEAM 1: orchestratorAgent, productStrategyAgent, customizationAgent, styleAgent
│   ├── visuals/       ← TEAM 2: visualPromptAgent, videoPromptAgent
│   └── gtm/           ← TEAM 3: gtmAgent, socialAgent
│
├── services/
│   ├── zaiService.ts          ← TEAM 1 (shared LLM service — all agents depend on this)
│   ├── butterbaseService.ts   ← TEAM 1 (persistence)
│   ├── seedanceService.ts     ← TEAM 2 (video generation API)
│   └── twitterService.ts      ← TEAM 3 (social media API)
│
├── app/
│   ├── layout.tsx             ← TEAM 1
│   ├── page.tsx               ← TEAM 1 (landing)
│   ├── chat/page.tsx          ← TEAM 1
│   ├── builder/page.tsx       ← TEAM 1
│   ├── video/page.tsx         ← TEAM 2
│   ├── gtm/page.tsx           ← TEAM 3
│   ├── summary/page.tsx       ← TEAM 1
│   └── architecture/page.tsx  ← TEAM 1
│
├── types/productWorld.ts      ← SHARED (do not modify without coordination)
├── utils/mockData.ts          ← SHARED (example prompts)
├── utils/promptTemplates.ts   ← SHARED (LLM prompt templates — each team owns their agent's prompts)
└── lib/nav.ts                 ← TEAM 1 (navigation link definitions)
```

---

## Shared Rules

These rules apply to ALL teams:

### Styling
- Use the CSS design token variables (`--color-fg`, `--color-card`, `--color-border`, etc.)
  defined in `src/app/globals.css`. Do NOT hardcode colors.
- Use the pre-built CSS component classes: `.card`, `.glass-card`, `.btn-accent`,
  `.btn-ghost`, `.btn-outline`, `.badge`, `.badge-accent`, `.section-heading`, `.section-sub`.
- Tailwind utility classes are available. Dark mode uses the `class` strategy (`.dark` on `<html>`).
- All animations use **anime.js** (imported as `animejs`). Do not add other animation libraries.

### Imports
- Use the `@/` path alias for absolute imports (e.g., `@/components/visuals/VideoStudio`).
- Use relative imports (`./`, `../`) only for files within the same team folder.

### Adding a new file
1. Create the file in your team's folder.
2. Add a re-export to the folder's `index.ts` barrel file.
3. Add the `// OWNER: TEAM N` comment at the top of the file.
4. Run `npm run build` to verify the project still compiles.

### Testing
- Run `npm run dev` to start the development server on `localhost:3000`.
- Run `npm run build` to verify types and compilation before committing.
- Run `npm run lint` to check for lint errors.

---

## Team 1 — UI / Frontend / Orchestration

### You are the AI agent for the UI team member.

### Your files (you may create, edit, and delete these)
```
src/components/shared/*          ThemeToggle, LoadingOverlay, NavClient, ArchitectureDiagram
src/components/chat/*            ChatInterface, ChatMessage, PromptInput
src/components/builder/*         ProductBuilder, CustomizationPanel, StyleSelector
src/components/summary/*         AssetGallery, PlanSummary
src/agents/core/*                orchestratorAgent, productStrategyAgent, customizationAgent, styleAgent
src/services/zaiService.ts       LLM fallback chain
src/services/butterbaseService.ts Persistence
src/app/layout.tsx               Global layout + nav
src/app/page.tsx                 Landing page
src/app/chat/page.tsx            Chat ideation page
src/app/builder/page.tsx         Product builder page
src/app/summary/page.tsx         Summary page
src/app/architecture/page.tsx    Architecture diagram page
src/app/globals.css              Design tokens + component classes
src/lib/nav.ts                   Navigation link definitions
tailwind.config.js               Tailwind configuration
```

### DO NOT EDIT (owned by other teams)
```
src/components/visuals/*         ← TEAM 2
src/components/gtm/*             ← TEAM 3
src/agents/visuals/*             ← TEAM 2
src/agents/gtm/*                 ← TEAM 3
src/services/seedanceService.ts  ← TEAM 2
src/services/twitterService.ts   ← TEAM 3
src/app/video/page.tsx           ← TEAM 2
src/app/gtm/page.tsx             ← TEAM 3
```

### How to make global UI changes
- Edit `src/app/globals.css` to update design tokens or component classes.
- Edit `tailwind.config.js` to add new theme colors or extend utilities.
- Edit `src/app/layout.tsx` to update the global nav, header, or footer.
- Edit `src/lib/nav.ts` to add or reorder navigation links.
- Components in `src/components/shared/` are imported by multiple pages across teams.
  Changes here affect the entire app.

### How to add a new page
1. Create `src/app/<route>/page.tsx`.
2. Add the route to `src/lib/nav.ts`.
3. Create a matching `src/components/<route>/` folder for page-specific components.
4. Add an `index.ts` barrel file in the new component folder.

---

## Team 2 — Image & Video Generation

### You are the AI agent for the image/video generation team member.

### Your files (you may create, edit, and delete these)
```
src/components/visuals/*         ProductVisualizer, ViewToggle, VideoStudio
src/agents/visuals/*             visualPromptAgent, videoPromptAgent
src/services/seedanceService.ts  Seedance video API + mock fallback
src/app/video/page.tsx           Video Studio page
```

### DO NOT EDIT (owned by other teams)
```
src/components/shared/*          ← TEAM 1
src/components/chat/*            ← TEAM 1
src/components/builder/*         ← TEAM 1
src/components/summary/*         ← TEAM 1
src/components/gtm/*             ← TEAM 3
src/agents/core/*                ← TEAM 1
src/agents/gtm/*                 ← TEAM 3
src/services/zaiService.ts       ← TEAM 1
src/services/butterbaseService.ts ← TEAM 1
src/services/twitterService.ts   ← TEAM 3
src/app/layout.tsx               ← TEAM 1
src/app/page.tsx                 ← TEAM 1
src/app/builder/page.tsx         ← TEAM 1 (but it imports your ProductVisualizer)
src/app/gtm/page.tsx             ← TEAM 3
```

### Your data contract
Your agents populate these slices of `ProductWorld`:
- `visualSystem` — via `runVisualPromptAgent()` in `agents/visuals/visualPromptAgent.ts`
  - `productViewPrompt`, `knollingViewPrompt`, `explodedViewPrompt`, `componentPrompts[]`
- `videoSystem` — via `runVideoPromptAgent()` in `agents/visuals/videoPromptAgent.ts`
  - `heroVideoPrompt`, `actionVideoPrompt`, `artisticVideoPrompt`, `animatedVideoPrompt`

Your components read from these same slices:
- `ProductVisualizer` reads `visualSystem` and displays the 3 view types.
- `ViewToggle` switches between `product`, `knolling`, and `exploded` views.
- `VideoStudio` reads `videoSystem` and calls `seedanceService.generateVideo()`.

### How to add a new view type
1. Add the new view to the `VisualizationView` type in `src/types/productWorld.ts` (coordinate with Team 1).
2. Add a prompt field in `VisualSystem` interface.
3. Update `visualPromptAgent.ts` to generate the new prompt.
4. Update `ProductVisualizer.tsx` and `ViewToggle.tsx` to display the new view.
5. Export any new components from `src/components/visuals/index.ts`.

### How to update video generation
1. Edit `src/agents/visuals/videoPromptAgent.ts` to change the LLM prompt.
2. Edit `src/services/seedanceService.ts` to change API integration.
3. Edit `src/components/visuals/VideoStudio.tsx` to update the UI.
4. The video page (`src/app/video/page.tsx`) imports `VideoStudio` from your folder.

---

## Team 3 — Social Media & GTM

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
src/agents/visuals/*             ← TEAM 2
src/services/zaiService.ts       ← TEAM 1
src/services/butterbaseService.ts ← TEAM 1
src/services/seedanceService.ts  ← TEAM 2
src/app/layout.tsx               ← TEAM 1
src/app/page.tsx                 ← TEAM 1
src/app/builder/page.tsx         ← TEAM 1
src/app/video/page.tsx           ← TEAM 2
```

### Your data contract
Your agents populate these slices of `ProductWorld`:
- `gtmKit` — via `runGTMAgent()` in `agents/gtm/gtmAgent.ts`
  - `positioning`, `audience`, `valueProposition`, `twitterPosts[]`, `abTestingPlan`, `metrics`, `viralMechanic`
- `social` — via `runSocialAgent()` in `agents/gtm/socialAgent.ts`
  - `selectedPost`, `postedStatus`, `mockMetrics`, `abTestWinner`

Your components read from these same slices:
- `GTMKit` reads `gtmKit` and displays positioning, audience, and post cards.
- `SocialLaunch` reads `social` and `gtmKit` for A/B results and engagement metrics.

### How to add a new social platform
1. Create a new service file in `src/services/` (e.g., `instagramService.ts`).
2. Update `src/agents/gtm/socialAgent.ts` to generate posts for the new platform.
3. Add UI components in `src/components/gtm/`.
4. Update `src/app/gtm/page.tsx` to include the new section.
5. Export any new components from `src/components/gtm/index.ts`.

### How to update GTM agent output
1. Edit the system/user prompts in `src/utils/promptTemplates.ts` (the `GTM_SYSTEM` and `GTM_USER` constants).
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
