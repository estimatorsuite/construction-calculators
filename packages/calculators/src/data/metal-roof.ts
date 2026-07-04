// lib/calculators/metal-roof-data.ts
// Metal Roof Cost Calculator
// 数据来源：HomeAdvisor 2026, Angi 2026, Metal Roofing Alliance 2026
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type MetalRoofType = "standingSeam" | "corrugated" | "stoneCoated" | "metalShingle";

export interface MetalRoofState {
  roofAreaSqFt: number;
  roofType: MetalRoofType;
  includeTearoff: boolean;
}

export interface MetalRoofResult {
  roofAreaSquares: number;        // 1 square = 100 sq ft
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  tearoffCostLow: number;
  tearoffCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
  lifespanYears: string;
}

// ========================================================================
// 金属屋顶类型定价（2026 USD / sq ft）
// 来源：Metal Roofing Alliance 2026 + HomeAdvisor 2026 Metal Roofing Cost
// ========================================================================

export interface RoofTypePrice {
  label: string;
  description: string;
  installedLow: number;            // $/sq ft（材料 + 人工，低档）
  installedHigh: number;           // $/sq ft（材料 + 人工，高档）
  materialOnlyPerSqFt: number;     // 仅材料费 $/sq ft
  laborPerSqFt: { low: number; high: number };
  lifespanYears: string;
}

export const ROOF_TYPE_PRICES: Record<MetalRoofType, RoofTypePrice> = {
  standingSeam: {
    label: "Standing Seam",
    description: "Premium hidden fastener. Most popular metal roof.",
    installedLow: 10,
    installedHigh: 16,
    materialOnlyPerSqFt: 4.5,
    laborPerSqFt: { low: 5.5, high: 11.5 },
    lifespanYears: "50-70 years",
  },
  corrugated: {
    label: "Corrugated Panels",
    description: "Exposed fastener panels. Cheapest metal option.",
    installedLow: 5,
    installedHigh: 10,
    materialOnlyPerSqFt: 2,
    laborPerSqFt: { low: 3, high: 8 },
    lifespanYears: "30-50 years",
  },
  stoneCoated: {
    label: "Stone-Coated Steel",
    description: "Steel panels coated with stone granules. Looks like shingle.",
    installedLow: 8,
    installedHigh: 14,
    materialOnlyPerSqFt: 3.5,
    laborPerSqFt: { low: 4.5, high: 10.5 },
    lifespanYears: "40-60 years",
  },
  metalShingle: {
    label: "Metal Shingles",
    description: "Individual metal shingles. Premium look.",
    installedLow: 9,
    installedHigh: 15,
    materialOnlyPerSqFt: 4,
    laborPerSqFt: { low: 5, high: 11 },
    lifespanYears: "40-60 years",
  },
};

// 拆除旧屋顶（每 sq ft）
const TEAROFF_LOW = 1;
const TEAROFF_HIGH = 3;

// ========================================================================
// 计算函数
// ========================================================================

export function calculateMetalRoof(state: MetalRoofState): MetalRoofResult | null {
  if (state.roofAreaSqFt <= 0) return null;

  const sqft = state.roofAreaSqFt;
  const squares = Math.ceil(sqft / 100);
  const price = ROOF_TYPE_PRICES[state.roofType];

  // 材料费
  const materialCostLow = Math.round(sqft * price.materialOnlyPerSqFt);
  const materialCostHigh = Math.round(sqft * price.materialOnlyPerSqFt * 1.25);

  // 人工费
  const laborCostLow = Math.round(sqft * price.laborPerSqFt.low);
  const laborCostHigh = Math.round(sqft * price.laborPerSqFt.high);

  // 拆除费
  const tearoffCostLow = state.includeTearoff ? Math.round(sqft * TEAROFF_LOW) : 0;
  const tearoffCostHigh = state.includeTearoff ? Math.round(sqft * TEAROFF_HIGH) : 0;

  const totalCostLow = materialCostLow + laborCostLow + tearoffCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh + tearoffCostHigh;

  return {
    roofAreaSquares: squares,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    tearoffCostLow,
    tearoffCostHigh,
    totalCostLow,
    totalCostHigh,
    costPerSqFtLow: Math.round((totalCostLow / sqft) * 10) / 10,
    costPerSqFtHigh: Math.round((totalCostHigh / sqft) * 10) / 10,
    lifespanYears: price.lifespanYears,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): MetalRoofState {
  return {
    roofAreaSqFt: 2000,
    roofType: "standingSeam",
    includeTearoff: true,
  };
}

// ========================================================================
// 成本拆解（用于 Cost Breakdown Table）
// ========================================================================

export const COST_BREAKDOWN = [
  {
    component: "Materials (panels + trim)",
    percentage: "35-45%",
    description: "Metal panels, ridge caps, flashing, fasteners, underlayment",
  },
  {
    component: "Labor",
    percentage: "35-45%",
    description: "Tear-off (if needed), panel install, seam folding, trim work",
  },
  {
    component: "Underlayment & accessories",
    percentage: "10-15%",
    description: "Synthetic underlayment, ice/water shield, vents, pipe boots",
  },
  {
    component: "Tear-off & disposal",
    percentage: "5-15%",
    description: "Removing 1-3 layers of old shingles, dumpster, dump fees",
  },
];

// ========================================================================
// FAQ — 6+ 个
// ========================================================================

export const metalRoofFaqs = [
  {
    question: "How much does a metal roof cost per square foot?",
    answer:
      "Metal roofs cost $5-$16 per square foot installed in 2026, depending on type. Corrugated metal panels are cheapest at $5-$10/sq ft. Stone-coated steel runs $8-$14/sq ft. Metal shingles cost $9-$15/sq ft. Standing seam (the most popular metal roof) costs $10-$16/sq ft. For a typical 2,000 sq ft roof (20 squares), total installed cost runs $10,000-$32,000. Tear-off of existing shingles adds $1-$3/sq ft. Premium metals like copper or zinc cost $20-$30+/sq ft. Use the calculator above for exact estimates based on your roof size and type.",
  },
  {
    question: "How does metal roofing compare to asphalt shingles in cost?",
    answer:
      "Metal roofing costs 2-3x more upfront than asphalt shingles but lasts 2-3x longer. Asphalt shingles: $3.50-$5.50/sq ft installed, lifespan 15-30 years. Standing seam metal: $10-$16/sq ft, lifespan 50-70 years. On a 2,000 sq ft roof, asphalt costs $7,000-$11,000; metal costs $20,000-$32,000. But over 50 years, you'd replace asphalt 2-3 times ($21,000-$33,000) vs one metal roof ($20,000-$32,000). Metal also saves 10-25% on cooling costs (reflective coatings) and may qualify for insurance discounts (fire/hail resistance). Break-even: 15-25 years. If selling within 10 years, asphalt is the better financial choice.",
  },
  {
    question: "How long does a metal roof last?",
    answer:
      "Metal roofs last 30-70+ years depending on material and type. Standing seam: 50-70 years (hidden fasteners don't degrade). Corrugated panels: 30-50 years (exposed fasteners fail first, replaceable at $2-$5 each). Stone-coated steel: 40-60 years. Metal shingles: 40-60 years. Premium metals like copper: 100+ years. The most common failure mode isn't the metal itself — it's the fasteners, rubber gaskets, and sealant at penetrations. Re-seal penetrations every 15-20 years ($500-$1,500). Properly maintained standing seam metal roofs routinely outlast the house they're installed on. Most manufacturers offer 30-50 year warranties.",
  },
  {
    question: "Are metal roofs noisy when it rains?",
    answer:
      "Properly installed metal roofs are not noticeably noisier than asphalt. This is a common myth. Modern metal roofs include solid sheathing (plywood or OSB deck) plus underlayment plus the metal panel — this assembly dampens sound to within 2-3 decibels of asphalt shingle roofs. The noise problem comes from old barn-style installations where metal was attached directly to purlins (skip sheathing) with no solid deck. If your contractor is installing over an existing solid roof deck with proper underlayment, rain noise is a non-issue. Attic insulation (R-38+) further reduces any transmitted sound. Hail on metal is briefly louder but rarely causes damage.",
  },
  {
    question: "Do metal roofs save on energy costs?",
    answer:
      "Yes — metal roofs save 10-25% on cooling costs vs asphalt shingles. Reflective metal panels (especially light colors and cool-roof coatings) reflect solar radiation instead of absorbing it like dark asphalt. A Lawrence Berkeley National Lab study measured attic temperatures 20-40°F cooler under metal roofs vs asphalt on 90°F+ days. Annual savings: $100-$400 depending on climate (bigger savings in hot southern states). Some metal roofs qualify for ENERGY STAR tax credits and utility rebates ($200-$500). Cool-roof pigmented coatings (like Kynar 500 in white, light gray, or tan) maximize reflectivity. Dark metal roofs still save energy but less than light colors.",
  },
  {
    question: "Can I install a metal roof myself?",
    answer:
      "DIY metal roofing is possible for corrugated panels on simple roofs (shed, barn, single-story ranch with low pitch) but not recommended for standing seam, stone-coated, or metal shingles. Corrugated panels are the most DIY-friendly: screw-down installation with exposed fasteners, $2-$4/sq ft for materials, and basic tools (drill, metal snips, tape measure, ladder). Plan 2-3 days for a 1,500 sq ft roof with 2 people. Standing seam requires specialized seamers ($500/day rental) and pro training. Metal shingles and stone-coated panels also require pro installation due to interlocking patterns. The biggest DIY risks: incorrect fastener placement (causes leaks), wrong panel overlap direction, and inadequate underlayment.",
  },
  {
    question: "Is a metal roof louder than asphalt when it rains?",
    answer:
      "No — when properly installed over a solid roof deck with underlayment, a metal roof is only 2-3 decibels louder than asphalt during heavy rain (barely perceptible, well under the 10 dB threshold of human perceptibility difference). The myth comes from old barn-style installations where metal panels were screwed directly to purlins with no solid deck or attic space. Modern residential installations include: plywood/OSB deck + synthetic underlayment + metal panel, plus attic insulation (R-38+). This assembly dampens rain noise to within the same range as asphalt. Hail impact is briefly louder (5-10 dB) but rarely exceeds 2-3 seconds per strike. If noise is a concern, choose stone-coated steel — the embedded stone granules dampen sound further.",
  },
  {
    question: "Can I walk on a metal roof without damaging it?",
    answer:
      "Yes, but with technique. Walking on the flat pans of standing seam is safe — step on the raised seams (the structural ribs) or between them, never on the center of wide pans which can oil-can (permanently dent). For corrugated panels, walk only on the screw rows (where panels are fastened to purlins) — stepping between screw rows on unsupported metal causes dents. Wear soft-soled shoes (sneakers, never boots with heels). Stone-coated and metal shingle roofs are walkable but more fragile — step carefully to avoid cracking the coating. Steeper roofs (above 6:12) require fall protection harness ($100-$200) regardless of material. When in doubt, hire a roofer — a single misstep dent costs $200-$500 to repair.",
  },
];
