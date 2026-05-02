// ─────────────────────────────────────────────────────────────────────────────
// OWNER: TEAM 1
// Rich mock ProductWorld object based on the "temperature & battery sensor"
// example from the hackathon screenshots. Used when MOCK_MODE=true.
// ─────────────────────────────────────────────────────────────────────────────

import { ProductWorld } from '@/types/productWorld';

export const MOCK_PRODUCT_WORLD: ProductWorld = {
  id: 'mock-001',
  createdAt: new Date().toISOString(),
  userPrompt: 'Create a smart wireless charging pad for modern homes',
  theme: 'dark',

  productOverview: {
    productName: 'ThermoSense Pro',
    tagline: "Your home's climate, beautifully aware.",
    targetUser: 'Design-conscious homeowners and smart-home enthusiasts aged 25–45',
    coreUseCase:
      'Passive ambient monitoring of indoor temperature and battery with a sleek always-on display',
    keyFeatures: [
      'E-ink display with ambient backlight',
      'Bluetooth 5.2 + Zigbee dual-radio',
      'Voice-assistant compatible (Alexa, Google Home, HomeKit)',
      '12-month battery life on 2 AA batteries',
      'Magnetic wall-mount or countertop stand',
      'Real-time alerts via companion app',
    ],
    breakthroughInnovation:
      'Bio-inspired enclosure with acoustic vent pattern that doubles as a speaker grille for ambient audio cues',
  },

  customizationSystem: {
    components: [
      {
        name: 'Display Type',
        options: [
          {
            name: 'E-ink Minimal',
            visualDescription: 'Ultra-low power e-ink, crisp numerals on matte white',
            functionalImpact: 'Highest battery life, no backlight',
          },
          {
            name: 'OLED Vivid',
            visualDescription: 'Bright OLED with color zones for comfort ranges',
            functionalImpact: 'Rich colour, shorter battery, charging required',
          },
          {
            name: 'LCD Backlit',
            visualDescription: 'Classic LCD with blue/purple gradient backlight',
            functionalImpact: 'Balanced cost and power, AA batteries',
          },
        ],
      },
      {
        name: 'Enclosure Material',
        options: [
          {
            name: 'Matte ABS Plastic',
            visualDescription: 'Smooth white polymer with soft-touch coating',
            functionalImpact: 'Lightweight, cost-effective, good for injection moulding',
          },
          {
            name: 'Anodised Aluminium',
            visualDescription: 'Brushed silver metal body with teal accent ring',
            functionalImpact: 'Premium feel, better heat dissipation, heavier',
          },
          {
            name: 'Recycled Bioplastic',
            visualDescription: 'Warm off-white with subtle natural texture',
            functionalImpact: 'Eco-friendly, slightly softer, sustainable story',
          },
        ],
      },
      {
        name: 'Connectivity',
        options: [
          {
            name: 'Bluetooth Only',
            visualDescription: 'Single radio, smaller antenna bump',
            functionalImpact: 'Lowest power, limited range to 10m',
          },
          {
            name: 'BLE + Zigbee',
            visualDescription: 'Dual-radio module, imperceptibly thicker chassis',
            functionalImpact: 'Mesh network support, works in large homes',
          },
          {
            name: 'Wi-Fi Direct',
            visualDescription: 'Standard Wi-Fi chip, USB-C charging port visible',
            functionalImpact: 'No hub needed, requires constant power',
          },
        ],
      },
      {
        name: 'Accent Color',
        options: [
          { name: 'Teal', visualDescription: 'Teal LED ring around display', functionalImpact: 'Default colour' },
          { name: 'Warm White', visualDescription: 'Soft warm backlight', functionalImpact: 'Sleep-safe low blue light' },
          { name: 'Neon Coral', visualDescription: 'Coral accent ring, bold modern look', functionalImpact: 'Unique shelf presence' },
        ],
      },
    ],
  },

  styles: [
    {
      name: 'Futurist',
      materialDirection: 'Glossy white polymer, teal LED accents',
      colorPalette: ['#E8F4F8', '#6EE7F7', '#1B2A3B'],
      lightingDirection: 'Cool studio backlight, sharp shadows',
      productFeel: 'Space-age, clinical, aspirational',
    },
    {
      name: 'Minimalist',
      materialDirection: 'Matte white, no visible screws, flush display',
      colorPalette: ['#FFFFFF', '#E5E5E5', '#333333'],
      lightingDirection: 'Soft diffuse overhead, almost shadowless',
      productFeel: 'Calm, Dieter Rams-inspired, timeless',
    },
    {
      name: 'Industrial',
      materialDirection: 'Gunmetal grey, exposed fasteners, rubber grips',
      colorPalette: ['#3D3D3D', '#B0B0B0', '#FF5722'],
      lightingDirection: 'Dramatic single-source side light, hard shadows',
      productFeel: 'Rugged, honest materials, professional',
    },
    {
      name: 'Organic',
      materialDirection: 'Bioplastic shell with wood-grain inlay, earthy tones',
      colorPalette: ['#D4C5A9', '#7B6D52', '#3E6B48'],
      lightingDirection: 'Warm golden-hour glow, soft bokeh',
      productFeel: 'Eco-conscious, warm, natural',
    },
    {
      name: 'Luxury',
      materialDirection: 'Anodised black aluminium, gold trim, leather base patch',
      colorPalette: ['#1A1A1A', '#C9A84C', '#F5F5F5'],
      lightingDirection: 'Premium jewellery lighting, subtle rim light',
      productFeel: 'High-end, exclusive, gift-worthy',
    },
    {
      name: 'Sci-Fi',
      materialDirection: 'Dark chassis with cyan holographic elements',
      colorPalette: ['#080B10', '#00FFFF', '#7B2FBE'],
      lightingDirection: 'Neon underlighting, purple-to-cyan gradient',
      productFeel: 'Cyberpunk, immersive, collector item',
    },
    {
      name: 'Brutalist',
      materialDirection: 'Raw concrete-textured polymer, exposed circuit visible through window',
      colorPalette: ['#9E9E9E', '#000000', '#F44336'],
      lightingDirection: 'Harsh overhead fluorescent, stark',
      productFeel: 'Architectural, unapologetic, gallery-worthy',
    },
    {
      name: 'Vintage',
      materialDirection: 'Cream bakelite-style body, retro LCD numerals, brass accents',
      colorPalette: ['#F5E6C8', '#C8A96A', '#2C2416'],
      lightingDirection: 'Warm incandescent tone, sepia-adjacent',
      productFeel: 'Nostalgic, artisan, story-driven',
    },
    {
      name: 'Amorphic',
      materialDirection: 'Blob-form translucent silicone shell, internal RGB glow',
      colorPalette: ['#B2DFDB', '#80CBC4', '#E0F7FA'],
      lightingDirection: 'Internal diffused glow, dreamy soft light',
      productFeel: 'Playful, biomorphic, conversation piece',
    },
  ],
  selectedStyle: 'Futurist',
  selectedComponents: {
    'Display Type': 'LCD Backlit',
    'Enclosure Material': 'Matte ABS Plastic',
    Connectivity: 'BLE + Zigbee',
    'Accent Color': 'Teal',
  },

  visualSystem: {
    currentView: 'product',
    productViewPrompt:
      'A clean product studio render of ThermoSense Pro smart sensor. Futurist style. White matte body, teal LED ring around the LCD display showing 22.5°C and 48% RH. Bio-inspired acoustic vent on the front. Placed on a minimal white surface. Professional product photography lighting with cool studio backlight and sharp shadows. 4K, commercial product photo.',
    knollingViewPrompt:
      'Flat-lay knolling photograph of all ThermoSense Pro components arranged neatly on a white surface. Components: PCB circuit board, LCD display module, front enclosure shell, back enclosure with battery compartment, two AA batteries, rubber O-ring seal, spring contact, five mounting screws, two wall-clip brackets, one magnetic wall-mount plate. All items perfectly aligned at right angles. Top-down view. Clean white background. Product photography.',
    explodedViewPrompt:
      'Isometric exploded-view technical illustration of ThermoSense Pro. Layers separated spatially showing: front glass panel, LCD display, PCB with BLE+Zigbee chip, rubber seal, back housing with battery slots, bracket plate. Clean white background, precise draft-quality lines. Each layer floating mid-air with thin guide lines. 3D render style.',
    componentPrompts: [
      'Close-up render of ThermoSense Pro PCB circuit board. Green PCB with BLE/Zigbee chip, capacitors, USB charging port. Clean tech photography.',
      'Close-up product photo of ThermoSense Pro LCD display module showing 22.5°C / 48% RH. Blue-purple backlight. Glass lens with anti-glare coating.',
      'Close-up of ThermoSense Pro bio-inspired acoustic vent grille. White polymer, organic flowing curves. Macro photography.',
    ],
  },

  videoSystem: {
    heroVideoPrompt:
      'Cinematic hero video for ThermoSense Pro smart sensor. Scene: modern minimalist living room, warm morning light streaming through large windows. The sensor sits on a floating shelf. Camera slowly dollies in from medium shot to extreme close-up of the display. LCD shows 22.5°C, backlight pulses gently from teal to white. Shallow depth of field. Lens flare. 30 seconds. Seamless loop. Emotional tone: serene, intelligent, domestic luxury. 4K, Rec.709.',
    actionVideoPrompt:
      'Performance video for ThermoSense Pro. Split-screen montage: left shows sensor on desk during work-from-home setup; right shows iOS notification alert "Humidity too high". Cut to: homeowner adjusting humidifier in response. Cut to: macro of sensor display. Camera: handheld, kinetic edits. Lighting: mixed natural and artificial. Motion: fast cuts, dynamic. Emotional tone: efficient, smart, empowering. 30 seconds.',
    artisticVideoPrompt:
      'Styled artistic video for ThermoSense Pro in Futurist aesthetic. Pure white void studio. Sensor rotates slowly on a glass pedestal. Teal light beams scan the device. Particles of light represent temperature and battery data streaming outward. Abstract data visualisation overlaid in HUD style. Camera: slow orbit 360°. Lighting: neon teal and white. Emotional tone: aspirational, premium, technological wonder. 30 seconds.',
    animatedVideoPrompt:
      'Animated experimental video for ThermoSense Pro. 2.5D motion graphics. Product explodes into its components mid-air, each labelled with animated text. Components re-assemble. Then the assembled sensor morphs into a home floor plan showing coverage zones. Colour palette: dark background with teal and white accents. Smooth easing. anime.js-style motion principles. 30 seconds.',
    simulated3DTurnaroundPrompt:
      'Simulated 3D product turntable video for ThermoSense Pro. White studio background. Product rotates 360° clockwise over 10 seconds. Even studio lighting, soft shadows beneath. No music. Shows all four sides. Infinite seamless loop. 4K.',
    videoTasks: [],
  },

  gtmKit: {
    positioning:
      'ThermoSense Pro is the first smart climate sensor designed as a home object — not a gadget. It fits naturally into modern interiors while giving design-conscious homeowners instant ambient awareness without opening an app.',
    audience:
      'Primary: Tech-forward homeowners 28–42, household income $80k+, who buy considered lifestyle products. Affinity with Muji, Apple HomeKit, and Dyson. Secondary: Smart home integrators and property developers furnishing premium rental units.',
    valueProposition:
      'Where most sensors hide under furniture, ThermoSense Pro works as a display object. Its bio-inspired form and always-on, glanceable display turn climate data into interior design.',
    twitterPosts: [
      '🌡️ Most smart sensors look like WiFi routers.\n\nThermoSense Pro was designed to live on your shelf — not behind it.\n\n22.5°C. 48% RH. Always visible. Always beautiful.\n\n→ Pre-order open [link] #SmartHome #ProductDesign',
      'The thermostat is the most-looked-at object in your home.\n\nSo we made it something worth looking at.\n\nThermoSense Pro — climate sensing, reimagined.\n\n[link]',
      '⚡ Quick thread on why we built ThermoSense Pro differently:\n\n1/ Every smart sensor looks like a router\n2/ Homeowners hide them = lose ambient awareness\n3/ We asked: what if it was an object you wanted to display?\n\nResult 👇 [link] #BuildInPublic',
    ],
    abTestingPlan: {
      variantA: {
        positioning: 'Lead with design — "The sensor that belongs on your shelf"',
        audience: 'Design-first homeowners, Muji/Apple aesthetic affinity',
        visualStrategy: 'Minimalist white studio render on marble surface',
        engagementRate: 4.7,
        clickIntent: 62,
        conversionProxy: 3.2,
        shareabilityScore: 71,
      },
      variantB: {
        positioning: 'Lead with intelligence — "Your home knows before you do"',
        audience: 'Smart home enthusiasts, tech-early-adopters',
        visualStrategy: 'Dark cinematic render with data overlay HUD',
        engagementRate: 5.9,
        clickIntent: 58,
        conversionProxy: 4.1,
        shareabilityScore: 65,
      },
    },
    metrics: {
      engagementRate: 5.3,
      clickIntent: 60,
      conversionProxy: 3.7,
      shareabilityScore: 68,
    },
    viralMechanic:
      `Shareable "What's the climate in your room right now?" social challenge — users post a screenshot of their ThermoSense reading with a branded template, driving organic UGC and awareness.`,
  },

  social: {
    selectedPost:
      '🌡️ Most smart sensors look like WiFi routers.\n\nThermoSense Pro was designed to live on your shelf — not behind it.\n\n22.5°C. 48% RH. Always visible. Always beautiful.\n\n→ Pre-order open [link] #SmartHome #ProductDesign',
    postedStatus: 'idle',
    mockMetrics: {
      impressions: 24700,
      likes: 1842,
      reposts: 437,
      replies: 93,
      clickIntent: 62,
      shareabilityScore: 71,
    },
    abTestWinner: 'B',
  },
};

export const EXAMPLE_PROMPTS = [
  'Create a smart wireless charging pad for modern homes',
  'Design a futuristic sneaker for urban runners',
  'Build a minimal mechanical keyboard for digital nomads',
  'Design a solar-powered backpack for everyday explorers',
  'Create a smart water bottle that tracks hydration',
  'Design a portable espresso machine for coffee enthusiasts',
];
