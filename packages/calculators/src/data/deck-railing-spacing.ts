// lib/calculators/deck-railing-spacing-data.ts
// Deck Railing Spindle Spacing Calculator — 数据层
// 数据来源：IRC R318.1.1 Building Code, HomeAdvisor 2026 Deck Railing Cost
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type SpindleSize = "1.5sq" | "2sq" | "round" | "metal";

export interface DeckRailingState {
  railLengthInches: number;
  spindleWidth: number;
  maxGap: number;
  spindleType: SpindleSize;
}

export interface DeckRailingResult {
  spindlesNeeded: number;
  actualGapInches: number;
  spacingInches: number;
  materialCostLow: number;
  materialCostHigh: number;
  totalSections: number;
}

// ========================================================================
// Spindle 规格和价格
// 来源：Home Depot / Lowe's 2026 retail + HomeAdvisor deck railing cost
// ========================================================================

export interface SpindleSpec {
  label: string;
  description: string;
  defaultWidth: number;
  costLow: number;
  costHigh: number;
}

export const SPINDLE_SPECS: Record<SpindleSize, SpindleSpec> = {
  "1.5sq": {
    label: '1.5" × 1.5" Wood Square',
    description: 'Standard 1.5"×1.5" wood spindle (baluster). Most common for pressure-treated decks.',
    defaultWidth: 1.5,
    costLow: 3,
    costHigh: 6,
  },
  "2sq": {
    label: '2" × 2" Wood Square',
    description: '2"×2" wood spindle. Heavier look, often cedar or composite.',
    defaultWidth: 2,
    costLow: 4,
    costHigh: 8,
  },
  round: {
    label: "Round Wood Dowel",
    description: 'Round wood dowel spindles, typically 1-1.5" diameter. Traditional look.',
    defaultWidth: 1.5,
    costLow: 3,
    costHigh: 7,
  },
  metal: {
    label: "Metal (Aluminum/Steel)",
    description: "Aluminum or steel spindles. Modern look, low maintenance, powder-coated finish.",
    defaultWidth: 0.75,
    costLow: 8,
    costHigh: 15,
  },
};

// ========================================================================
// Building Code Constants
// 来源：International Residential Code (IRC) R318.1.1
// ========================================================================

export const MAX_CODE_GAP = 4; // IRC: a 4" sphere cannot pass through
export const POST_WIDTH = 3.5; // Standard 4x4 post actual width
export const SECTION_LENGTH = 96; // 8 ft max section between posts

// ========================================================================
// 计算函数
// 公式：
//   availableSpace = railLength - (2 × postWidth)
//   unitWidth = spindleWidth + maxGap
//   spindles = floor(availableSpace / unitWidth)
//   actualGap = (availableSpace - spindles × spindleWidth) / (spindles + 1)
//   spacing = actualGap + spindleWidth (center-to-center)
// ========================================================================

export function calculateDeckRailing(state: DeckRailingState): DeckRailingResult | null {
  if (state.railLengthInches <= 0 || state.spindleWidth <= 0 || state.maxGap <= 0) return null;

  const spec = SPINDLE_SPECS[state.spindleType];

  // Available space between the two posts
  const availableSpace = state.railLengthInches - 2 * POST_WIDTH;

  if (availableSpace <= 0) return null;

  // Calculate how many spindles fit without exceeding maxGap
  const unitWidth = state.spindleWidth + state.maxGap;
  const spindlesNeeded = Math.floor(availableSpace / unitWidth);

  if (spindlesNeeded < 1) return null;

  // Distribute remaining space evenly: gaps on both sides of each spindle
  const totalSpindleWidth = spindlesNeeded * state.spindleWidth;
  const remainingSpace = availableSpace - totalSpindleWidth;
  const actualGapInches = Math.round((remainingSpace / (spindlesNeeded + 1)) * 1000) / 1000;

  // Center-to-center spacing
  const spacingInches = Math.round((actualGapInches + state.spindleWidth) * 1000) / 1000;

  const materialCostLow = Math.round(spindlesNeeded * spec.costLow);
  const materialCostHigh = Math.round(spindlesNeeded * spec.costHigh);

  const totalSections = Math.max(1, Math.ceil(state.railLengthInches / SECTION_LENGTH));

  return {
    spindlesNeeded,
    actualGapInches,
    spacingInches,
    materialCostLow,
    materialCostHigh,
    totalSections,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): DeckRailingState {
  return {
    railLengthInches: 96,
    spindleWidth: 1.5,
    maxGap: 4,
    spindleType: "1.5sq",
  };
}

// ========================================================================
// 成本拆解数据
// ========================================================================

export interface CostBreakdownRow {
  component: string;
  percentage: string;
  description: string;
}

export const COST_BREAKDOWN: CostBreakdownRow[] = [
  {
    component: "Spindles (Balusters)",
    percentage: "40-50%",
    description: "Individual spindles at $3-$15 each depending on material",
  },
  {
    component: "Rail Material (Top & Bottom)",
    percentage: "25-35%",
    description: "2x4 or 2x6 pressure-treated rails, top and bottom per section",
  },
  {
    component: "Posts & Post Caps",
    percentage: "15-20%",
    description: "4x4 or 6x6 posts every 6-8 feet, plus decorative caps",
  },
  {
    component: "Hardware & Labor",
    percentage: "10-15%",
    description: "Screws, brackets, concrete post anchors, and installation labor",
  },
];

// ========================================================================
// 地区价格因子
// ========================================================================

export interface RegionFactor {
  region: string;
  multiplier: number;
  notes: string;
}

export const REGION_FACTORS: RegionFactor[] = [
  { region: "Midwest", multiplier: 1.0, notes: "Baseline — PT lumber abundant and cheap" },
  { region: "Southeast", multiplier: 0.95, notes: "Competitive market, PT lumber common" },
  { region: "Southwest", multiplier: 1.15, notes: "Composite and metal more popular than wood" },
  { region: "Northeast", multiplier: 1.2, notes: "Higher labor, cedar and composite popular" },
  { region: "West Coast", multiplier: 1.35, notes: "Highest costs, metal and cable railings popular" },
];

// ========================================================================
// Red Flag 警告
// ========================================================================

export const RED_FLAGS = [
  "Gaps between spindles exceeding 4 inches — fails IRC R318.1.1 building code inspection",
  "Spindles face-nailed instead of toe-screwed — will loosen within 1-2 seasons",
  "Posts set without concrete footings — railing will wobble and fail code",
  "Wood spindles installed without stain/sealer — will warp and split within 2 years",
  "Metal spindles used with wood rails without proper adapters — galvanic corrosion",
];

// ========================================================================
// FAQ
// ========================================================================

export const deckRailingFaqs = [
  {
    question: "How do I calculate spindle spacing for my deck railing?",
    answer:
      "Measure the total rail length between posts in inches. Subtract the width of both posts (typically 3.5\" each for 4x4). Divide the remaining space into units of spindle width + max gap (4\"). Floor the result to get spindle count. The actual gap is then: (available space - spindle count × spindle width) ÷ (spindle count + 1). This distributes leftover space evenly. For a 96\" rail with 1.5\" spindles: (96-7) ÷ 5.5 = 16 spindles, gap = (89 - 24) ÷ 17 = 3.82\".",
  },
  {
    question: "What is the building code requirement for deck spindle spacing?",
    answer:
      "IRC R318.1.1 requires that no sphere larger than 4 inches can pass through any opening in a deck railing. This means the gap between spindles must be 4 inches or less. For decks under 30\" high, railings may not be required (check local code). For decks 30\" or higher, railings must be at least 36\" tall (42\" in some jurisdictions). The 4-inch sphere rule applies horizontally and diagonally — you cannot create a diamond pattern that allows a 4\" sphere through.",
  },
  {
    question: "How many spindles do I need per 8-foot railing section?",
    answer:
      "For a standard 8-foot (96\") section between 4x4 posts with 1.5\" wood spindles: 16 spindles per section. With 2\" spindles: 12 per section. With 0.75\" metal spindles: 18-19 per section. The formula is: (96 - 7) ÷ (spindle width + 4) = spindle count. Always verify the actual gap is under 4\" after calculating. Order 5-10% extra for breaks and future repairs.",
  },
  {
    question: "How much do deck railing spindles cost?",
    answer:
      "Wood spindles cost $3-$8 each. Pressure-treated 1.5\"×1.5\" are the cheapest at $3-$6. Cedar 2\"×2\" run $4-$8. Round dowels are $3-$7. Metal (aluminum or steel) spindles are $8-$15 each but last longer and need no maintenance. For a typical 200 sq ft deck with 40 linear feet of railing at 16 spindles per 8\" section, you need about 80 spindles: $240-$480 in wood, or $640-$1,200 in metal.",
  },
  {
    question: "Wood vs metal deck spindles — which should I choose?",
    answer:
      "Wood spindles (pressure-treated or cedar) cost $3-$8 each and match traditional deck aesthetics, but require staining every 2-3 years and can warp or split over time. Metal spindles (aluminum or powder-coated steel) cost $8-$15 each but are maintenance-free for 20+ years and offer a modern look. Metal spindles are thinner (0.75\"-1\" vs 1.5\"-2\" for wood), allowing cleaner sightlines. For rental properties or low-maintenance homes, metal wins. For budget decks, wood is adequate.",
  },
  {
    question: "What is the formula for even spindle spacing?",
    answer:
      "The equal spacing formula is: gap = (total length - sum of spindle widths) ÷ (number of spindles + 1). First, calculate how many spindles fit without exceeding the 4\" max gap: count = floor((rail length - 2 × post width) ÷ (spindle width + 4)). Then redistribute the leftover space evenly: actual gap = (available space - count × spindle width) ÷ (count + 1). Center-to-center spacing = actual gap + spindle width. This ensures every gap is equal and under code maximum.",
  },
  {
    question: "Can I use cable railing instead of spindles?",
    answer:
      "Yes — stainless steel cable railing (horizontal cables strung between posts, 3/16-inch diameter) is code-approved under IRC R318.1.1 if cables are spaced less than 3 inches apart (tighter than the 4-inch rule for rigid spindles because cables can flex). Cost: $30-$60 per linear foot installed — 4-6x more than wood spindles. Pros: virtually invisible views, modern aesthetic, low maintenance (316-grade stainless won't corrode). Cons: (1) not legal for decks serving as egress (some California jurisdictions ban horizontal cables as ladder-like climbing hazards, check local code), (2) requires tensioning every 6-12 months ($0 if DIY, $150-$300 if pro), (3) difficult for DIY install (requires special swaging tools, $80-$200 rental). Best for view properties and modern homes.",
  },
  {
    question: "How to maintain wood deck railings?",
    answer:
      "Annual maintenance cycle: (1) Spring — inspect for loose spindles and wobbly posts, tighten screws, replace split boards ($2-$5 each). (2) Clean with deck cleaner (oxygen bleach, not chlorine — $20/gallon) and a stiff brush. (3) Restain or reseal every 2-3 years ($30-$60/gallon, covers 200 sq ft). Use a semi-transparent penetrating oil stain (like Cabot Australian Timber Oil) — film-forming stains peel and require stripping. (4) Check post-to-rim-joist connections annually — lag bolts can loosen from freeze-thaw cycles; retighten or replace with through-bolts if wobbly. Skipping maintenance for 4+ years causes warping, splitting, and code-failure-level spindle looseness — full railing replacement runs $25-$60/linear ft vs $5-$15/linear ft for regular maintenance.",
  },
];
