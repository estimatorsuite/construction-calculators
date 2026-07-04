// lib/calculators/soffit-data.ts
// Soffit Calculator — 数据层
// 数据来源：Angi 2026, HomeAdvisor 2026, Georgia-Pacific, CertainTeed
// 最后验证：2026-06-20

// ========================================================================
// 类型定义
// ========================================================================

export type SoffitMaterial = "vinyl" | "aluminum" | "wood" | "fiberCement";
export type OverhangDepth = 8 | 12 | 16 | 18 | 24;
export type VentedType = "vented" | "solid" | "mixed";

export interface SoffitCalculatorState {
  linearFeet: number;
  overhangDepth: OverhangDepth;
  material: SoffitMaterial;
  ventedType: VentedType;
}

export interface SoffitResult {
  totalArea: number;              // sq ft（含 waste factor，向上取整）
  baseArea: number;               // sq ft（不含 waste）
  panelsNeeded: number;           // 12"×12' vinyl 标准面板
  cartonsNeeded: number;          // 每箱 16 panels = 192 sq ft
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerLinearFootLow: number;
  costPerLinearFootHigh: number;
}

// ========================================================================
// 价格数据（2026，USD）
// 来源：Angi 2026 Soffit Replacement Cost + HomeAdvisor 2026 Fascia/Soffit Cost
// ========================================================================

export interface MaterialPrice {
  label: string;
  description: string;
  installedLow: number;           // $/sq ft（材料 + 人工，低档）
  installedHigh: number;          // $/sq ft（材料 + 人工，高档）
  materialOnlyPerSqFt: number;    // 仅材料费 $/sq ft
  laborPerLinearFoot: { low: number; high: number };
  lifespanYears: string;          // 预期寿命
}

export const MATERIAL_PRICES: Record<SoffitMaterial, MaterialPrice> = {
  vinyl: {
    label: "Vinyl (PVC)",
    description: "Most common. Low maintenance, DIY-friendly. 0.040\" thickness standard.",
    installedLow: 6,
    installedHigh: 9,
    materialOnlyPerSqFt: 2.5,
    laborPerLinearFoot: { low: 6, high: 14 },
    lifespanYears: "20-40 years",
  },
  aluminum: {
    label: "Aluminum",
    description: "Durable, pest-proof, won't rot. Common in coastal areas.",
    installedLow: 8,
    installedHigh: 12,
    materialOnlyPerSqFt: 3.5,
    laborPerLinearFoot: { low: 8, high: 16 },
    lifespanYears: "30-50 years",
  },
  wood: {
    label: "Wood (Pine/Cedar)",
    description: "Traditional look. Requires painting every 5-7 years. Higher maintenance.",
    installedLow: 10,
    installedHigh: 15,
    materialOnlyPerSqFt: 4.5,
    laborPerLinearFoot: { low: 10, high: 18 },
    lifespanYears: "15-30 years (with maintenance)",
  },
  fiberCement: {
    label: "Fiber Cement (Hardie)",
    description: "Premium. Fire-resistant, matches Hardie siding. Needs pro installation.",
    installedLow: 12,
    installedHigh: 18,
    materialOnlyPerSqFt: 6,
    laborPerLinearFoot: { low: 12, high: 22 },
    lifespanYears: "30-50 years",
  },
};

// ========================================================================
// 面板规格
// 来源：Georgia-Pacific 12" Vinyl Soffit spec sheet + CertainTeed Universal
// ========================================================================

export const PANEL_COVERAGE_SQFT = 12;      // 标准 12" × 12' panel = 12 sq ft
export const CARTON_PANELS = 16;            // 每箱 16 panels
export const CARTON_COVERAGE_SQFT = 192;    // 每箱 1.92 squares (192 sq ft)
export const WASTE_FACTOR = 0.10;           // 10% waste（行业惯例）

export const OVERHANG_OPTIONS: { value: OverhangDepth; label: string; usage: string }[] = [
  { value: 8, label: '8"', usage: "Tight eave, minimal overhang" },
  { value: 12, label: '12"', usage: "Standard residential (most common)" },
  { value: 16, label: '16"', usage: "Wider overhang, better shade" },
  { value: 18, label: '18"', usage: "Craftsman / Prairie style" },
  { value: 24, label: '24"', usage: "Deep overhang, premium homes" },
];

// ========================================================================
// 计算函数
// 公式：linear feet × (depth_inches / 12) × (1 + waste) = total sq ft
// ========================================================================

export function calculateSoffit(state: SoffitCalculatorState): SoffitResult | null {
  if (state.linearFeet <= 0 || state.overhangDepth <= 0) return null;

  const depthInFeet = state.overhangDepth / 12;
  const baseArea = state.linearFeet * depthInFeet;
  const totalArea = Math.ceil(baseArea * (1 + WASTE_FACTOR));

  const panelsNeeded = Math.ceil(totalArea / PANEL_COVERAGE_SQFT);
  const cartonsNeeded = Math.ceil(panelsNeeded / CARTON_PANELS);

  const price = MATERIAL_PRICES[state.material];

  // 材料费（不含人工）
  const materialCostLow = Math.round(totalArea * price.materialOnlyPerSqFt);
  const materialCostHigh = Math.round(totalArea * price.materialOnlyPerSqFt * 1.3);

  // 人工费（按 linear foot 计价更准确，因为人工主要按长度而非面积）
  const laborCostLow = Math.round(state.linearFeet * price.laborPerLinearFoot.low);
  const laborCostHigh = Math.round(state.linearFeet * price.laborPerLinearFoot.high);

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  return {
    totalArea,
    baseArea: Math.round(baseArea * 10) / 10,
    panelsNeeded,
    cartonsNeeded,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow,
    totalCostHigh,
    costPerLinearFootLow: Math.round((totalCostLow / state.linearFeet) * 10) / 10,
    costPerLinearFootHigh: Math.round((totalCostHigh / state.linearFeet) * 10) / 10,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): SoffitCalculatorState {
  return {
    linearFeet: 180,
    overhangDepth: 12,
    material: "vinyl",
    ventedType: "vented",
  };
}

// ========================================================================
// 成本拆解数据（用于 Cost Breakdown Table）
// 来源：2026 RSMeans + Contractor survey data
// ========================================================================

export interface CostBreakdownRow {
  component: string;
  percentage: string;
  description: string;
}

export const COST_BREAKDOWN: CostBreakdownRow[] = [
  {
    component: "Materials",
    percentage: "35-45%",
    description: "Soffit panels, nails, J-channel, F-channel, trim pieces",
  },
  {
    component: "Labor",
    percentage: "30-40%",
    description: "Tear-off old soffit, install new, finish work",
  },
  {
    component: "Overhead",
    percentage: "10-15%",
    description: "Insurance, truck, tools, dispatcher, office",
  },
  {
    component: "Profit",
    percentage: "10-15%",
    description: "Contractor's margin after all costs",
  },
];

// ========================================================================
// 地区价格因子（用于 Location Adjustment Table）
// 来源：RSMeans City Cost Indexes 2025, relative to national average (1.0)
// ========================================================================

export interface RegionFactor {
  region: string;
  laborMultiplier: number;
  materialMultiplier: number;
  notes: string;
}

export const REGION_FACTORS: RegionFactor[] = [
  { region: "Midwest", laborMultiplier: 1.0, materialMultiplier: 1.0, notes: "Baseline (national average)" },
  { region: "Southeast", laborMultiplier: 0.9, materialMultiplier: 0.95, notes: "Lower labor rates, competitive market" },
  { region: "Southwest", laborMultiplier: 1.05, materialMultiplier: 1.1, notes: "Heat-resistant materials cost more" },
  { region: "Northeast", laborMultiplier: 1.3, materialMultiplier: 1.2, notes: "Higher labor, union influence" },
  { region: "West Coast", laborMultiplier: 1.4, materialMultiplier: 1.25, notes: "Highest costs in US" },
];

// ========================================================================
// FAQ — 至少 5 个，用真实问题句式
// ========================================================================

export const soffitFaqs = [
  {
    question: "How do I calculate how much soffit I need?",
    answer:
      "Measure the linear feet around all eaves and rakes of your roof (the edges where the roof overhangs the walls). Multiply by the overhang depth in feet. For example, 180 linear feet with a 12-inch (1 foot) overhang = 180 square feet of soffit. Add 10% for waste and cuts: 180 × 1.10 = 198 square feet. Use the calculator above to do this automatically and estimate material quantities.",
  },
  {
    question: "How much does vinyl soffit cost per linear foot?",
    answer:
      "Vinyl soffit installation costs $6-$14 per linear foot, including materials and labor. Material-only cost runs about $2-$3 per square foot (or $200-$300 per square, where 1 square = 100 sq ft). Labor is typically $4-$11 per linear foot depending on your region, job complexity, and whether old soffit needs tear-off. Aluminum costs $8-$16/linear foot, wood $10-$18, fiber cement $12-$22.",
  },
  {
    question: "What size overhang is standard for a house?",
    answer:
      "Standard residential overhangs are 12-16 inches. Newer homes built after 2000 typically have 12\" overhangs, while Craftsman, Prairie, and premium custom homes use 18-24\" for better shade and architectural presence. Tight eaves on older ranch homes may be only 8\". Wider overhangs (24\") cost about 2x more in materials but provide meaningfully better weather protection for siding and windows.",
  },
  {
    question: "Should I choose vented or solid soffit panels?",
    answer:
      "Most homes need vented soffit for proper attic ventilation. Building code (IRC R806.2) requires 1 square foot of net free vent area (NFA) per 300 square feet of attic floor space, with half at the soffit and half at the ridge. Vented vinyl soffit panels provide about 5.9 sq in of NFA per linear foot. Use solid soffit only in non-attic areas (porches, carports) or where you have other ventilation like gable vents.",
  },
  {
    question: "How long do vinyl soffits last?",
    answer:
      "Vinyl soffits last 20-40 years. Premium brands (CertainTeed, Georgia-Pacific) often carry lifetime limited warranties but real-world lifespan depends on sun exposure, climate, and whether the panels were installed correctly. Aluminum lasts 30-50 years, wood 15-30 years (requires repainting every 5-7 years), fiber cement 30-50 years. The most common failure mode is sagging from improper fastener spacing, not material degradation.",
  },
  {
    question: "How many square feet are in a carton of vinyl soffit?",
    answer:
      "A standard carton of 12-inch vinyl soffit contains 16 panels, each 12 feet long, covering 192 square feet (1.92 'squares' in contractor terms). Smaller cartons with shorter panels cover 100-150 sq ft. Always order full cartons — suppliers don't break cartons. Calculate your need, add 10% waste, then round up to the nearest full carton. Use the calculator above to get this number automatically.",
  },
  {
    question: "How to clean vinyl soffits without a pressure washer?",
    answer:
      "Mix 1/3 cup mild dish soap and 2/3 cup white vinegar in 1 gallon of warm water. Spray on with a pump sprayer, let sit 5-10 minutes, then scrub gently with a soft-bristle brush on an extension pole. Rinse with a garden hose (not pressure washer). For stubborn mildew, add 1 quart of household bleach per gallon of water and test on an inconspicuous spot first. Avoid pressure washers above 1,500 PSI — they force water behind the soffit and soak attic insulation, a $500-$2,000 damage risk. Clean soffits every 1-2 years to prevent staining and UV degradation.",
  },
  {
    question: "Can I install new soffits without removing fascia?",
    answer:
      "Yes, in most cases. Soffit installs under the fascia board and into a J-channel or F-channel nailed to the wall — it's an independent system. If the existing fascia is solid and rot-free, leave it in place and wrap it with aluminum coil stock ($2-$4/linear foot) for a low-maintenance finish. The exception: if you're replacing rotting fascia, you must remove the old soffit first to access the rafter tails. Budget $6-$14/linear foot for soffit-only replacement vs $12-$22/linear foot when fascia and soffit are done together.",
  },
];
