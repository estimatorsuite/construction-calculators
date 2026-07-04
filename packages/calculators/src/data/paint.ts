// lib/calculators/paint-data.ts
// Paint Calculator — 数据层
// 关键词：paint calculator | Vol: 5,000+ | KD: 15
// 数据来源：Angi 2026, HomeAdvisor 2026, Sherwin-Williams, Benjamin Moore
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type PaintQuality = "economy" | "standard" | "premium";

export interface PaintState {
  wallLengthFt: number;
  wallHeightFt: number;
  includeCeiling: boolean;
  roomWidthFt: number; // 用于天花板面积计算
  openingsSqFt: number; // 门窗总面积（从 paintable area 中扣除）
  coats: 1 | 2 | 3;
  quality: PaintQuality;
}

export interface PaintResult {
  wallAreaSqFt: number;
  ceilingAreaSqFt: number;
  totalPaintableArea: number;
  gallonsNeeded: number;
  primerGallons: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// ========================================================================
// 价格数据（2026，USD）
// 来源：Angi 2026 Interior Painting Cost + HomeAdvisor 2026 Paint Cost
// ========================================================================

export interface PaintSpec {
  label: string;
  description: string;
  priceLow: number;             // $/gallon 低端
  priceHigh: number;            // $/gallon 高端
  coveragePerGallon: number;    // sq ft/gal（单层 coat）
}

export const PAINT_QUALITY_SPECS: Record<PaintQuality, PaintSpec> = {
  economy: {
    label: "Economy",
    description: 'Big-box store brand. Good for rentals and flip properties.',
    priceLow: 15,
    priceHigh: 25,
    coveragePerGallon: 400,
  },
  standard: {
    label: "Standard",
    description: "Sherwin Williams, Behr. Most common choice for primary residences.",
    priceLow: 25,
    priceHigh: 40,
    coveragePerGallon: 350,
  },
  premium: {
    label: "Premium",
    description: "Benjamin Moore, Farrow & Ball. Designer-grade finish, higher hide pigment.",
    priceLow: 40,
    priceHigh: 70,
    coveragePerGallon: 300,
  },
};

export const PRIMER_SPEC = {
  label: "Primer",
  priceLow: 20,
  priceHigh: 35,
  coveragePerGallon: 300,
};

export const LABOR_PER_SQ_FT = { low: 1, high: 3 }; // 含 roller + brush + prep

// ========================================================================
// 计算函数
// 公式：gallons = ceil((totalArea × coats) / coveragePerGallon)
// ========================================================================

export function calculatePaint(state: PaintState): PaintResult | null {
  if (
    state.wallLengthFt <= 0 ||
    state.wallHeightFt <= 0
  ) {
    return null;
  }

  const wallArea = state.wallLengthFt * state.wallHeightFt;
  const ceilingArea = state.includeCeiling && state.roomWidthFt > 0
    ? state.wallLengthFt * state.roomWidthFt
    : 0;

  // 扣除门窗（但不超过总面积）
  const grossArea = wallArea + ceilingArea;
  const openings = Math.min(state.openingsSqFt, grossArea * 0.5); // cap at 50%
  const totalPaintableArea = Math.max(0, grossArea - openings);

  const spec = PAINT_QUALITY_SPECS[state.quality];

  // 油漆用量 = ceil((totalArea × coats) / coverage)
  const gallonsNeeded = Math.ceil(
    (totalPaintableArea * state.coats) / spec.coveragePerGallon
  );

  // 底漆用量（单层）
  const primerGallons = Math.ceil(
    totalPaintableArea / PRIMER_SPEC.coveragePerGallon
  );

  // 材料费 = 油漆 + 底漆
  const paintCostLow = gallonsNeeded * spec.priceLow;
  const paintCostHigh = gallonsNeeded * spec.priceHigh;
  const primerCostLow = primerGallons * PRIMER_SPEC.priceLow;
  const primerCostHigh = primerGallons * PRIMER_SPEC.priceHigh;
  const materialCostLow = Math.round(paintCostLow + primerCostLow);
  const materialCostHigh = Math.round(paintCostHigh + primerCostHigh);

  // 人工费 = $/sq ft × paintable area
  const laborCostLow = Math.round(totalPaintableArea * LABOR_PER_SQ_FT.low);
  const laborCostHigh = Math.round(totalPaintableArea * LABOR_PER_SQ_FT.high);

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  return {
    wallAreaSqFt: Math.round(wallArea),
    ceilingAreaSqFt: Math.round(ceilingArea),
    totalPaintableArea: Math.round(totalPaintableArea),
    gallonsNeeded,
    primerGallons,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow,
    totalCostHigh,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): PaintState {
  return {
    wallLengthFt: 40,
    wallHeightFt: 8,
    includeCeiling: false,
    roomWidthFt: 12,
    openingsSqFt: 30,
    coats: 2,
    quality: "standard",
  };
}

// ========================================================================
// 成本拆解数据（用于 Cost Breakdown Table）
// ========================================================================

export interface CostBreakdownRow {
  component: string;
  percentage: string;
  description: string;
}

export const COST_BREAKDOWN: CostBreakdownRow[] = [
  {
    component: "Materials (paint + primer)",
    percentage: "20-30%",
    description: "Interior wall paint, primer, rollers, brushes, drop cloths, tape",
  },
  {
    component: "Labor",
    percentage: "50-60%",
    description: "Surface prep, patching, sanding, cutting in, rolling 2 coats",
  },
  {
    component: "Overhead",
    percentage: "10-15%",
    description: "Insurance, truck, ladders, sprayer equipment, office",
  },
  {
    component: "Profit",
    percentage: "10-15%",
    description: "Contractor's margin after all costs",
  },
];

// ========================================================================
// 地区价格因子（用于 Location Adjustment Table）
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
  { region: "Southwest", laborMultiplier: 1.05, materialMultiplier: 1.0, notes: "Slightly higher labor, dry climate prep" },
  { region: "Northeast", laborMultiplier: 1.3, materialMultiplier: 1.1, notes: "Higher labor, union influence" },
  { region: "West Coast", laborMultiplier: 1.4, materialMultiplier: 1.15, notes: "Highest costs in US" },
];

// ========================================================================
// FAQ — 6 个，用真实问题句式
// ========================================================================

export const paintFaqs = [
  {
    question: "How much paint do I need for a room?",
    answer:
      "Measure the perimeter of the room (all four walls added together) and multiply by ceiling height. A standard 12x12 room with 8-foot ceilings has 384 square feet of wall. Subtract about 20 square feet per door and 15 square feet per window. For two coats of standard-quality paint (350 sq ft/gal coverage), you need about 2 gallons. The calculator above handles this automatically — including primer and ceiling if you need it.",
  },
  {
    question: "How much does it cost to paint a room?",
    answer:
      "DIY painting a standard 12x12 bedroom costs $100-$200 in materials (paint, primer, rollers, tape, drop cloths). Hiring a professional runs $300-$800 for the same room, including labor. Larger rooms, vaulted ceilings, or premium paint (Benjamin Moore, Farrow & Ball at $50-$70/gallon) push the high end up. Most painters charge $1-$3 per square foot of paintable wall area.",
  },
  {
    question: "Is one coat of paint enough?",
    answer:
      "One coat works if you are repainting the same color with a clean, primed surface in good condition. For any color change — especially going dark over light or light over dark — you need two coats for full coverage. Three coats is only necessary for drastic color changes (red over white, black over pastel) or when using low-hide economy paint. Two coats is the industry standard for professional results.",
  },
  {
    question: "Do I really need to use primer?",
    answer:
      "Yes, in these situations: painting over a dark color, painting new drywall or spackle, covering water stains or smoke damage, switching from oil-based to latex paint, or painting bare wood. Primer costs $20-$35 per gallon and covers about 300 sq ft. Skipping primer on these surfaces means your topcoat will require 3-4 coats instead of 2, which costs more in paint than the primer would have.",
  },
  {
    question: "How long does it take to paint a room?",
    answer:
      "A professional painter can prep and paint a standard 12x12 room in 4-6 hours: 1 hour for prep (patch, sand, tape), 30 minutes to cut in edges, 1-2 hours per coat with drying time between coats. DIY takes about double that. Plan for the room to be unusable for 24 hours total — the paint needs to dry to the touch between coats (2-4 hours for latex) and fully cure over 2-4 weeks.",
  },
  {
    question: "Should I paint it myself or hire a pro?",
    answer:
      "DIY makes sense for single rooms under standard 8-foot ceilings where you don't mind the time investment. The materials cost $100-$200 vs $400-$800 for a pro. Hire a professional for: vaulted ceilings (ladder work), multiple connected rooms (you'll lose weekend after weekend), drastic color changes, or if surface prep reveals water damage, cracks, or lead paint in pre-1978 homes (federal law requires EPA-certified renovators).",
  },
  {
    question: "How to choose the right paint sheen?",
    answer:
      "Sheen determines durability and washability. Flat/Matte: hides wall imperfections, no reflection — best for ceilings and low-traffic walls. Eggshell: slight shine, washable — most popular for living areas and bedrooms. Satin: noticeable shine, very washable — kitchens, bathrooms, hallways. Semi-gloss: high shine, scrubbable — trim, doors, cabinets. High-gloss: mirror-like, dramatic — accent furniture, front doors. Rule of thumb: higher sheen = more durable but shows more surface flaws.",
  },
  {
    question: "Is primer always necessary before painting?",
    answer:
      "No. Skip primer when: repainting with the same color in good condition, painting over existing latex paint in good shape. Always use primer when: painting new drywall (absorbs paint unevenly), covering dark colors with light (2 coats of primer saves 2+ coats of finish paint), painting over oil-based paint with latex (bonding primer required), covering water stains or smoke damage (stain-blocking primer like Kilz). Primer costs $25-$35/gallon vs $35-$60 for finish paint — cheaper base coat saves money.",
  },
];
