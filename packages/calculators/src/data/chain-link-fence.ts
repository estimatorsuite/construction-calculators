// lib/calculators/chain-link-fence-data.ts
// Chain Link Fence Calculator — 数据层
// 数据来源：HomeAdvisor 2026, Angi 2026, Hoover Fence, Master Halco
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type FenceHeight = 4 | 5 | 6;
export type FenceMaterial = "galvanized" | "vinylCoated";

export interface ChainLinkFenceState {
  fenceLengthFt: number;
  fenceHeight: FenceHeight;
  material: FenceMaterial;
  gateCount: number;
  gateWidthFt: number; // default 4
}

export interface ChainLinkFenceResult {
  postsNeeded: number;
  topRailsNeeded: number; // 10 ft sections
  meshRollsNeeded: number; // 50 ft rolls
  tensionBars: number;
  gatesIncluded: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerLinearFtLow: number;
  costPerLinearFtHigh: number;
}

// ========================================================================
// 价格数据（2026，USD）
// 来源：HomeAdvisor 2026 Chain Link Fence Cost + Angi 2026 Fence Installation
// ========================================================================

export interface MaterialSpec {
  label: string;
  perLinearFtLow: number;         // $/linear ft installed (4ft height baseline)
  perLinearFtHigh: number;
  description: string;
  lifespanYears: string;
}

export const MATERIAL_SPECS: Record<FenceMaterial, MaterialSpec> = {
  galvanized: {
    label: "Galvanized Steel",
    perLinearFtLow: 10,
    perLinearFtHigh: 15,
    description: "Silver zinc coating. Most common chain link. 20-30 year lifespan.",
    lifespanYears: "20-30 years",
  },
  vinylCoated: {
    label: "Vinyl-Coated (Black/Green)",
    perLinearFtLow: 15,
    perLinearFtHigh: 25,
    description: "PVC coating over galvanized core. Premium look. 25-40 year lifespan.",
    lifespanYears: "25-40 years",
  },
};

// ========================================================================
// 高度系数（以 4ft 为基准 1.0）
// 来源：Hoover Fence 2026 product catalog
// ========================================================================

export const HEIGHT_MULTIPLIERS: Record<FenceHeight, number> = {
  4: 1.0,
  5: 1.20,
  6: 1.40,
};

export const HEIGHT_OPTIONS: { value: FenceHeight; label: string; usage: string }[] = [
  { value: 4, label: '4 ft', usage: "Standard residential front yard" },
  { value: 5, label: '5 ft', usage: "Common for pets and backyards" },
  { value: 6, label: '6 ft', usage: "Security, commercial, full privacy feel" },
];

// ========================================================================
// 组件规格（每 100 linear ft of 4ft fence 参考）
// 来源：Master Halco installation guide + Hoover Fence
// - Posts: 1 every 10 ft → 11 posts (terminal + line)
// - Top rail: 10 ft sections → 10 rails
// - Mesh: 50 ft rolls → 2 rolls
// - Tension bars: 1 per terminal post (2 corners + gate posts minimum)
// - Gate: $100-$300 each (4ft wide walk gate)
// ========================================================================

export const COMPONENT_PRICES = {
  postGalvanizedLow: 15,
  postGalvanizedHigh: 30,
  postVinylLow: 25,
  postVinylHigh: 45,
  topRailLow: 8,
  topRailHigh: 15,
  meshRollLow: 50,
  meshRollHigh: 100,
  gateLow: 100,
  gateHigh: 300,
};

export const LABOR_PER_LINEAR_FT = { low: 5, high: 10 };

// ========================================================================
// 计算函数
// ========================================================================

export function calculateChainLinkFence(state: ChainLinkFenceState): ChainLinkFenceResult | null {
  if (state.fenceLengthFt <= 0) return null;

  const spec = MATERIAL_SPECS[state.material];
  const heightMult = HEIGHT_MULTIPLIERS[state.fenceHeight];

  // Components
  // Posts every 10 ft (include +1 for terminal post)
  const postsNeeded = Math.ceil(state.fenceLengthFt / 10) + 1;
  // Top rail: 10 ft sections
  const topRailsNeeded = Math.ceil(state.fenceLengthFt / 10);
  // Mesh rolls: 50 ft each
  const meshRollsNeeded = Math.ceil(state.fenceLengthFt / 50);
  // Tension bars: 2 per gate opening + 4 minimum for corners/terminals
  const tensionBars = Math.max(4, state.gateCount * 2 + 4);

  // Cost per linear ft adjusted by height
  const adjLow = spec.perLinearFtLow * heightMult;
  const adjHigh = spec.perLinearFtHigh * heightMult;

  // Gate cost (average ~$200 per 4ft walk gate)
  const gateCostLow = state.gateCount * COMPONENT_PRICES.gateLow;
  const gateCostHigh = state.gateCount * COMPONENT_PRICES.gateHigh;

  // Material vs labor split (roughly 50/50 of installed price, minus gate premium)
  const fenceLength = state.fenceLengthFt;
  const materialLow = Math.round(adjLow * fenceLength * 0.5 + gateCostLow);
  const materialHigh = Math.round(adjHigh * fenceLength * 0.5 + gateCostHigh);
  const laborLow = Math.round(adjLow * fenceLength * 0.5);
  const laborHigh = Math.round(adjHigh * fenceLength * 0.5);

  const totalLow = materialLow + laborLow;
  const totalHigh = materialHigh + laborHigh;

  return {
    postsNeeded,
    topRailsNeeded,
    meshRollsNeeded,
    tensionBars,
    gatesIncluded: state.gateCount,
    materialCostLow: materialLow,
    materialCostHigh: materialHigh,
    laborCostLow: laborLow,
    laborCostHigh: laborHigh,
    totalCostLow: totalLow,
    totalCostHigh: totalHigh,
    costPerLinearFtLow: Math.round((totalLow / fenceLength) * 10) / 10,
    costPerLinearFtHigh: Math.round((totalHigh / fenceLength) * 10) / 10,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): ChainLinkFenceState {
  return {
    fenceLengthFt: 100,
    fenceHeight: 4,
    material: "galvanized",
    gateCount: 1,
    gateWidthFt: 4,
  };
}

// ========================================================================
// 成本拆解数据（用于 Cost Breakdown Table）
// 来源：2026 RSMeans + contractor survey data
// ========================================================================

export interface CostBreakdownRow {
  component: string;
  percentage: string;
  description: string;
}

export const COST_BREAKDOWN: CostBreakdownRow[] = [
  {
    component: "Mesh & Fabric",
    percentage: "20-25%",
    description: "Chain link mesh rolls (50 ft), 9 or 11 gauge",
  },
  {
    component: "Posts & Hardware",
    percentage: "20-25%",
    description: "Terminal posts, line posts, post caps, tension bands",
  },
  {
    component: "Top Rail & Tension",
    percentage: "10-15%",
    description: "Top rail sections, tension bars, tie wires",
  },
  {
    component: "Labor",
    percentage: "30-40%",
    description: "Post hole digging, setting, hanging mesh, gates",
  },
  {
    component: "Overhead & Profit",
    percentage: "10-15%",
    description: "Equipment, insurance, contractor margin",
  },
];

// ========================================================================
// FAQ — 6 个
// ========================================================================

export const chainLinkFenceFaqs = [
  {
    question: "How much does a chain link fence cost per linear foot?",
    answer:
      "Galvanized chain link costs $10-$15 per linear foot installed (4 ft height). Vinyl-coated runs $15-$25 per linear foot. A 6 ft privacy-height fence adds 40% to the base price. Gates are $100-$300 each. For a typical 200 linear foot residential yard with one gate, expect $2,000-$5,000 total installed.",
  },
  {
    question: "Galvanized vs vinyl-coated chain link — which should I choose?",
    answer:
      "Galvanized is silver and costs $10-$15/linear ft. It's the standard for utility fencing and lasts 20-30 years. Vinyl-coated (black or green) costs $15-$25/linear ft but looks significantly better against landscaping and lasts 25-40 years because the PVC shell protects the zinc layer. If the fence is visible from the street or you plan to stay 10+ years, vinyl-coated is worth the extra cost. For a back lot line or dog run, galvanized is fine.",
  },
  {
    question: "How many posts do I need for my chain link fence?",
    answer:
      "Line posts go every 10 feet. For a 100 ft run you need 11 posts (10 line posts + 1 terminal). Add terminal posts (larger diameter) at every corner, gate opening, and end of run. A typical residential yard with 200 linear feet and 4 corners needs about 24-26 posts total. The calculator above computes this automatically from your fence length.",
  },
  {
    question: "Can I install a chain link fence myself or should I hire a pro?",
    answer:
      "DIY is possible for experienced homeowners on flat ground. You'll save 30-40% on labor ($5-$10/linear ft). But you need a post hole digger, concrete, and at least 2 people to stretch the mesh tight. Most DIY installations look wavy or sag within 2 years because the mesh wasn't tensioned properly. For fences over 150 linear ft, on sloped ground, or with multiple gates, hire a pro — the quality difference is obvious.",
  },
  {
    question: "How long does a chain link fence last?",
    answer:
      "Galvanized chain link lasts 20-30 years. Vinyl-coated lasts 25-40 years. The mesh itself almost never fails — what fails first is the hardware (tension bands rust after 15 years) and gate hinges (sag after 10 years of use). In coastal areas with salt air, lifespan drops by about 5 years. In dry climates, galvanized fences can hit 40+ years. Replacing hardware ($100-$300) can extend a fence's life by another decade.",
  },
  {
    question: "Can I install chain link fence on a slope?",
    answer:
      "Yes. Chain link adapts to slopes better than any other fence type. For gentle slopes (under 15 degrees), posts step down gradually and the mesh follows the contour. For steep slopes, each panel section steps down — this adds 10-20% to labor cost because each post height must be calculated individually. The calculator assumes level ground; add 15% to labor for sloped installations.",
  },
  {
    question: "How to make a chain link fence look better?",
    answer:
      "Three upgrades transform chain link aesthetics: (1) Vinyl-coated black or green mesh ($15-$25/linear ft vs $10-$15 for galvanized) — visually recedes into landscaping. (2) Privacy slats woven into the mesh ($1-$3/linear ft) — inserts horizontal PVC slats that block 75-90% visibility. Full coverage takes 4-8 hours for a 100 ft run. (3) Climbing plants (ivy, clematis, jasmine) — free if you have time, takes 2-3 growing seasons for full coverage. Avoid painting galvanized mesh — paint flakes within 2-3 years and requires annual touch-ups. For instant privacy, skip chain link entirely and use corrugated metal panels ($40-$60/panel) mounted to existing posts.",
  },
  {
    question: "What gauge chain link fence should I buy?",
    answer:
      "For residential use, 11.5 gauge (galvanized) or 12 gauge (vinyl-coated) is the sweet spot — strong enough for pets and security, affordable at $10-$15/linear ft installed. 9 gauge is commercial/heavy-duty (sports fields, industrial sites) and costs 40-60% more. Smaller gauge numbers mean thicker wire (counterintuitive). Avoid 14+ gauge 'economy' chain link from big-box stores — it sags under its own weight within 5 years. Mesh size matters too: 2-inch diamond is standard for residential, 2.25-inch for economy, 1.75-inch for high-security or dog containment (prevents small dogs from pushing through).",
  },
];
