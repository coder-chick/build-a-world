// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// Central data model for the Build-A-World application.
// Every agent populates a slice of this object.
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductOverview {
  productName: string;
  tagline: string;
  targetUser: string;
  coreUseCase: string;
  keyFeatures: string[];
  breakthroughInnovation: string;
}

export interface ComponentOption {
  name: string;
  visualDescription: string;
  functionalImpact: string;
}

export interface ProductComponent {
  name: string;
  options: ComponentOption[];
}

export interface CustomizationSystem {
  components: ProductComponent[];
}

export interface ProductStyle {
  name: string;
  materialDirection: string;
  colorPalette: string[];
  lightingDirection: string;
  productFeel: string;
}

export type VisualizationView = 'product' | 'knolling' | 'exploded';

export interface EnvironmentPreset {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;   // appended to every video prompt when this env is active
  gradient: string;       // CSS gradient for the preview swatch
}

export interface VisualSystem {
  currentView: VisualizationView;
  productViewPrompt: string;
  knollingViewPrompt: string;
  explodedViewPrompt: string;
  componentPrompts: string[];
  // Populated client-side after CogView-3 generation
  generatedImages?: {
    product?: string;
    knolling?: string;
    exploded?: string;
  };
  selectedEnvironment?: string; // EnvironmentPreset.id
}

export type VideoType = 'hero' | 'action' | 'artistic' | 'animated' | 'exploded' | 'interpolation';
export type VideoStatus = 'idle' | 'pending' | 'processing' | 'complete' | 'failed';

export interface VideoTask {
  id: string;
  type: VideoType;
  prompt: string;
  status: VideoStatus;
  url?: string;
  thumbnailUrl?: string;
  firstFrameImageUrl?: string; // CogView image used as first frame
  environmentId?: string;      // environment applied when this task was created
  savedAt?: string;            // ISO timestamp if user saved this video
}

export interface VideoSystem {
  heroVideoPrompt: string;
  actionVideoPrompt: string;
  artisticVideoPrompt: string;
  animatedVideoPrompt: string;
  explodedViewVideoPrompt: string;
  simulated3DTurnaroundPrompt: string;
  interpolationVideoPrompt: string;
  videoTasks: VideoTask[];
}

export interface ABVariant {
  positioning: string;
  audience: string;
  visualStrategy: string;
  engagementRate: number;
  clickIntent: number;
  conversionProxy: number;
  shareabilityScore: number;
}

export interface GTMMetrics {
  engagementRate: number;
  clickIntent: number;
  conversionProxy: number;
  shareabilityScore: number;
}

export interface GTMKit {
  positioning: string;
  audience: string;
  valueProposition: string;
  twitterPosts: string[];
  abTestingPlan: {
    variantA: ABVariant;
    variantB: ABVariant;
  };
  metrics: GTMMetrics;
  viralMechanic: string;
}

export interface MockMetrics {
  impressions: number;
  likes: number;
  reposts: number;
  replies: number;
  clickIntent: number;
  shareabilityScore: number;
}

export interface Social {
  selectedPost: string;
  postedStatus: 'idle' | 'posting' | 'posted' | 'failed';
  mockMetrics: MockMetrics;
  abTestWinner: 'A' | 'B' | null;
}

export interface ProductWorld {
  id: string;
  createdAt: string;
  userPrompt: string;
  theme: 'light' | 'dark';
  productOverview: ProductOverview;
  customizationSystem: CustomizationSystem;
  styles: ProductStyle[];
  selectedStyle: string;
  selectedComponents: Record<string, string>;
  visualSystem: VisualSystem;
  videoSystem: VideoSystem;
  gtmKit: GTMKit;
  social: Social;
}
