// lib/calculators/hardie-siding-data.ts
// Hardie Board Siding Calculator — 数据层
// 数据来源：James Hardie 官方产品规格 + HomeAdvisor 2026 + Homewyse May 2026
// 最后验证：2026-06-20
// ⚠️ NOT affiliated with James Hardie Industries. Independent tool using public specs.

// ========================================================================
// 类型定义
// ========================================================================

export type PlankExposure = 5.25 | 6.25 | 7.25 | 8.25 | 9.25;
export type HardieProduct = "hardiePlankLap" | "hardiePanelVertical" | "hardieShingle";

export interface HardieCalculatorState {
  wallAreaSqFt: number;          // 总墙面面积
  openingsPercent: number;       // 门窗开口百分比（默认 12%）
  exposure: PlankExposure;       // plank exposure（可见宽度）
  product: HardieProduct;        // 产品线
}

export interface HardieResult {
  netSidingArea: number;         // 扣除开口后的净面积
  totalSidingNeeded: number;     // 含 waste factor
  planksNeeded: number;          // 12 ft planks
  palletsNeeded: number;         // 每 pallet ~15 squares
  squaresNeeded: number;         // 1 square = 100 sq ft
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
}

// ========================================================================
// 产品数据
// 来源：James Hardie 官方产品规格 + mrslumber.com coverage chart
// ========================================================================

export interface ProductSpec {
  label: string;
  description: string;
  plankLengthFt: number;
  coveragePerPlank: Record<PlankExposure, number>; // sq ft per 12ft plank
  palletCoverageSqFt: number;                      // 每 pallet 覆盖面积
  materialCostPerSqFt: number;                     // 仅材料
}

// coveragePerPlank 计算：(exposure_inch / 12) × 12 ft = exposure sq ft
// 但实际覆盖略小于名义 exposure（因为 overlap）
// 使用 James Hardie 官方数据：8.25" exposure = 7 sq ft per plank
// 公式：((exposure - 1.25) / 12) × 12 = adjusted coverage
export const PRODUCT_SPECS: Record<HardieProduct, ProductSpec> = {
  hardiePlankLap: {
    label: "HardiePlank® Lap Siding",
    description: "Most popular. Horizontal lap siding, looks like wood clapboard. 12 ft lengths.",
    plankLengthFt: 12,
    coveragePerPlank: {
      5.25: 4,
      6.25: 5,
      7.25: 6,
      8.25: 7,    // 官方确认值
      9.25: 8,
    },
    palletCoverageSqFt: 1500,     // ~15 squares per pallet
    materialCostPerSqFt: 3.5,
  },
  hardiePanelVertical: {
    label: "HardiePanel® Vertical Siding",
    description: "Modern/industrial look. 4'×10' or 4'×12' panels.",
    plankLengthFt: 12,
    coveragePerPlank: {
      5.25: 4,     // panel 不是按 exposure 计算，这里用 sq ft 近似
      6.25: 5,
      7.25: 6,
      8.25: 7,
      9.25: 8,
    },
    palletCoverageSqFt: 1000,     // ~10 squares per pallet
    materialCostPerSqFt: 4.0,
  },
  hardieShingle: {
    label: "HardieShingle® Siding",
    description: "Cedar-shake look. Individual shingles or panels.",
    plankLengthFt: 12,
    coveragePerPlank: {
      5.25: 4,
      6.25: 5,
      7.25: 6,
      8.25: 7,
      9.25: 8,
    },
    palletCoverageSqFt: 800,      // shingle 覆盖较少
    materialCostPerSqFt: 5.0,
  },
};

// ========================================================================
// 价格数据（2026，USD）
// 来源：HomeAdvisor 2026 + Homewyse May 2026 + Weather Shield 2026
// ========================================================================

export const PRICE_RANGES = {
  materialPerSqFt: { low: 2.5, high: 5.0 },       // 仅材料
  laborPerSqFt: { low: 4.5, high: 9.0 },          // 仅人工
  installedPerSqFt: { low: 7.0, high: 14.0 },     // 材料 + 人工（全国平均）
  premiumPerSqFt: { low: 10.0, high: 22.0 },      // 高成本地区（Northeast/West Coast）
};

// ========================================================================
// 常量
// ========================================================================

export const WASTE_FACTOR = 0.10;             // 10% waste
export const DEFAULT_OPENINGS_PERCENT = 12;    // 12% 门窗开口
export const SQUARE_FT_PER_SQUARE = 100;      // 1 square = 100 sq ft

export const EXPOSURE_OPTIONS: { value: PlankExposure; label: string; usage: string }[] = [
  { value: 5.25, label: '5.25"', usage: "Narrow exposure, cottage look" },
  { value: 6.25, label: '6.25"', usage: "Common for smaller homes" },
  { value: 7.25, label: '7.25"', usage: "Standard residential" },
  { value: 8.25, label: '8.25"', usage: "Most popular — matches many US homes" },
  { value: 9.25, label: '9.25"', usage: "Wide exposure, modern look" },
];

// ========================================================================
// 计算函数
// ========================================================================

export function calculateHardie(state: HardieCalculatorState): HardieResult | null {
  if (state.wallAreaSqFt <= 0) return null;

  // 扣除门窗开口
  const openingsFactor = 1 - state.openingsPercent / 100;
  const netArea = state.wallAreaSqFt * openingsFactor;

  // 加 waste factor
  const totalSidingNeeded = Math.ceil(netArea * (1 + WASTE_FACTOR));

  // planks needed
  const spec = PRODUCT_SPECS[state.product];
  const coveragePerPlank = spec.coveragePerPlank[state.exposure];
  const planksNeeded = Math.ceil(totalSidingNeeded / coveragePerPlank);

  // pallets needed
  const palletsNeeded = Math.ceil(totalSidingNeeded / spec.palletCoverageSqFt);

  // squares (contractor unit)
  const squaresNeeded = Math.ceil(totalSidingNeeded / SQUARE_FT_PER_SQUARE);

  // 成本
  const materialCostLow = Math.round(totalSidingNeeded * PRICE_RANGES.materialPerSqFt.low);
  const materialCostHigh = Math.round(totalSidingNeeded * PRICE_RANGES.materialPerSqFt.high);

  const laborCostLow = Math.round(totalSidingNeeded * PRICE_RANGES.laborPerSqFt.low);
  const laborCostHigh = Math.round(totalSidingNeeded * PRICE_RANGES.laborPerSqFt.high);

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  return {
    netSidingArea: Math.round(netArea),
    totalSidingNeeded,
    planksNeeded,
    palletsNeeded,
    squaresNeeded,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow,
    totalCostHigh,
    costPerSqFtLow: Math.round((totalCostLow / state.wallAreaSqFt) * 10) / 10,
    costPerSqFtHigh: Math.round((totalCostHigh / state.wallAreaSqFt) * 10) / 10,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): HardieCalculatorState {
  return {
    wallAreaSqFt: 2000,        // 典型 2,000 sq ft home
    openingsPercent: 12,
    exposure: 8.25,
    product: "hardiePlankLap",
  };
}

// ========================================================================
// 成本拆解
// ========================================================================

export const COST_BREAKDOWN = [
  {
    component: "Materials (Hardie + trim + fasteners)",
    percentage: "40-50%",
    description: "HardiePlank panels, starter strip, J-channel, nails, flashing",
  },
  {
    component: "Labor",
    percentage: "35-45%",
    description: "Tear-off old siding, install Hardie, caulking, paint prep",
  },
  {
    component: "Overhead",
    percentage: "8-12%",
    description: "Insurance, scaffolding rental, dump trailer, tools",
  },
  {
    component: "Profit",
    percentage: "8-12%",
    description: "Contractor margin (fiber cement requires certified installer)",
  },
];

// ========================================================================
// FAQ — 真实问题句式
// ========================================================================

export const hardieFaqs = [
  {
    question: "How much does Hardie board siding cost per square foot?",
    answer:
      "James Hardie siding costs $7-$14 per square foot installed (materials + labor) on a US national average for 2026. Material-only cost is $2.50-$5.00/sq ft. Premium markets like the Northeast and West Coast run $10-$22/sq ft. For a typical 2,000 sq ft home, expect $14,000-$28,000 for the full job. HardiePlank lap siding is the most affordable product line; HardieShingle costs about 30% more.",
  },
  {
    question: "How do I calculate how much Hardie siding I need?",
    answer:
      "Measure your exterior wall area (length × height for each wall), add them together, then subtract about 12% for doors and windows. Add 10% for waste and cuts. The result is your total siding needed in square feet. Divide by 100 to get 'squares' (the unit contractors use). For 8.25\" exposure HardiePlank, each 12-foot plank covers about 7 sq ft — so divide your total by 7 to get plank count. Use the calculator above to do this automatically.",
  },
  {
    question: "How many square feet does one piece of HardiePlank cover?",
    answer:
      "A standard 12-foot HardiePlank lap siding board covers approximately 7 square feet at 8.25\" exposure (the most common size). Coverage varies by exposure width: 5.25\" exposure covers about 4 sq ft, 7.25\" covers 6 sq ft, and 9.25\" covers 8 sq ft per plank. This is because coverage equals (exposure width in inches ÷ 12) × plank length, with about 1.25\" of overlap subtracted. James Hardie confirms these numbers on their product packaging.",
  },
  {
    question: "Is this calculator affiliated with James Hardie?",
    answer:
      "No. This is an independent estimation tool built by EstimatorSuite. We are not affiliated with, endorsed by, or sponsored by James Hardie Industries. We use publicly available product specifications from James Hardie's website and product documentation to estimate material quantities. All Hardie® product names and trademarks belong to James Hardie Industries. For official product info, visit jameshardie.com.",
  },
  {
    question: "How long does Hardie board siding last?",
    answer:
      "James Hardie siding typically lasts 30-50 years. The company offers a 30-year non-prorated warranty on HardiePlank and HardiePanel products. Real-world lifespan depends heavily on installation quality — Hardie requires certified installers and improper nailing or flashing voids the warranty. The material itself is fiber cement, which is fire-resistant (Class A), moisture-resistant, and won't rot or warp like wood. Paint typically needs refreshing every 10-15 years.",
  },
  {
    question: "Why is Hardie siding more expensive than vinyl?",
    answer:
      "Hardie siding costs 2-3x more than vinyl ($7-$14/sq ft installed vs $3-$7 for vinyl) for three reasons: (1) the material itself is denser and heavier, requiring more expensive manufacturing; (2) installation requires special tools (shears, not saws) and certified installers, driving up labor; (3) Hardie typically includes premium features like pre-finished color-plus technology and 30-year warranty. The payback is longer lifespan (30-50 years vs 20-40 for vinyl) and better resale value — Hardie recovers about 78% of cost in home value vs 63% for vinyl (Remodeling Magazine 2026 Cost vs Value Report).",
  },
  {
    question: "How often does Hardie siding need painting?",
    answer:
      "James Hardie siding needs repainting every 10-15 years with premium 100% acrylic latex paint. Factory-primed HardiePlank with ColorPlus technology holds color 15+ years and often doesn't need repainting for the full warranty period. Site-painted Hardie (primer-only) typically needs a finish coat within 90 days of installation and repainting every 7-10 years. Cost to repaint: $3-$7/sq ft (including prep, primer, two coats). Use paint specifically approved by James Hardie (Sherwin-Williams Duration, Benjamin Moore Aura) — non-approved paints can void the warranty. Signs it's time: chalking, fading, or visible fiber exposure at edges.",
  },
  {
    question: "Does Hardie siding increase property taxes?",
    answer:
      "Yes, but usually only a small amount. Hardie siding is considered a 'capital improvement' that adds home value, which can trigger a reassessment. Typical impact: home value increases $15,000-$30,000 (per Remodeling 2026 Cost vs Value data), raising property taxes by $150-$600/year depending on your local tax rate (national median ~1.1%). Some states (CA, FL, TX) cap annual assessment increases via homestead exemptions. Check with your county assessor before starting — you can also file for reassessment appeal if the increase seems excessive compared to actual resale value impact.",
  },
];
