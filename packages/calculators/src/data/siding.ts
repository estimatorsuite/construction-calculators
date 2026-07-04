// lib/calculators/siding-data.ts
// Siding Calculator — 数据层（通用壁板，不限品牌）
// 数据来源：HomeAdvisor 2026 + Angi 2026 + Homewyse May 2026
// 最后验证：2026-06-20

export type SidingMaterial = "vinyl" | "aluminum" | "fiberCement" | "wood" | "steel" | "stucco";
export type HouseComplexity = "simple" | "standard" | "complex";

export interface SidingCalculatorState {
  wallAreaSqFt: number;
  openingsPercent: number;
  material: SidingMaterial;
  complexity: HouseComplexity;
}

export interface SidingResult {
  netSidingArea: number;
  totalSidingNeeded: number;
  squaresNeeded: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
}

export interface SidingMaterialSpec {
  label: string;
  description: string;
  installedLow: number;
  installedHigh: number;
  materialPerSqFt: number;
  laborPerSqFt: number;
  lifespanYears: string;
  pros: string;
  cons: string;
}

export const SIDING_MATERIALS: Record<SidingMaterial, SidingMaterialSpec> = {
  vinyl: {
    label: "Vinyl (PVC)",
    description: "Most common US siding. Low maintenance, DIY-friendly.",
    installedLow: 3,
    installedHigh: 7,
    materialPerSqFt: 1.5,
    laborPerSqFt: 2.5,
    lifespanYears: "20-40 years",
    pros: "Cheapest, low maintenance, many colors",
    cons: "Can crack in cold, fades over time, not premium look",
  },
  aluminum: {
    label: "Aluminum",
    description: "Metal siding, durable and pest-proof. Common in coastal areas.",
    installedLow: 5,
    installedHigh: 9,
    materialPerSqFt: 2.5,
    laborPerSqFt: 3,
    lifespanYears: "30-50 years",
    pros: "Won't rot, fire-resistant, recyclable",
    cons: "Dents easily, fades, noisy in rain",
  },
  fiberCement: {
    label: "Fiber Cement (Hardie)",
    description: "Premium fiber cement. Fire-resistant, matches premium homes.",
    installedLow: 6,
    installedHigh: 15,
    materialPerSqFt: 3.5,
    laborPerSqFt: 4.5,
    lifespanYears: "30-50 years",
    pros: "Fire-resistant, looks like wood, long lifespan",
    cons: "Most expensive, requires certified installer",
  },
  wood: {
    label: "Wood (Cedar/Redwood)",
    description: "Natural wood siding. Premium look, high maintenance.",
    installedLow: 8,
    installedHigh: 15,
    materialPerSqFt: 4,
    laborPerSqFt: 5,
    lifespanYears: "15-40 years (with maintenance)",
    pros: "Beautiful natural look, can be repainted",
    cons: "High maintenance, pest risk, fire risk",
  },
  steel: {
    label: "Steel",
    description: "Metal siding growing in popularity. Very durable.",
    installedLow: 4,
    installedHigh: 8,
    materialPerSqFt: 2.5,
    laborPerSqFt: 3,
    lifespanYears: "40-60 years",
    pros: "Durable, fire/pest-proof, modern look",
    cons: "Can rust if scratched, limited colors",
  },
  stucco: {
    label: "Stucco",
    description: "Cement-based plaster. Common in Southwest US.",
    installedLow: 6,
    installedHigh: 9,
    materialPerSqFt: 3,
    laborPerSqFt: 4,
    lifespanYears: "50-80 years",
    pros: "Very durable, fire-resistant, SW/Mediterranean look",
    cons: "Cracks in freeze-thaw, hard to repair, limited to dry climates",
  },
};

export const COMPLEXITY_MULTIPLIERS: Record<HouseComplexity, { label: string; multiplier: number; description: string }> = {
  simple: { label: "Simple (ranch, box)", multiplier: 1.0, description: "Single story, few corners, minimal trim" },
  standard: { label: "Standard (colonial)", multiplier: 1.15, description: "Two stories, normal window count, standard trim" },
  complex: { label: "Complex (Victorian, custom)", multiplier: 1.35, description: "Multiple stories, many angles, dormers, extensive trim" },
};

export const WASTE_FACTOR = 0.10;
export const DEFAULT_OPENINGS = 12;
export const SQ_FT_PER_SQUARE = 100;

export function calculateSiding(state: SidingCalculatorState): SidingResult | null {
  if (state.wallAreaSqFt <= 0) return null;

  const mat = SIDING_MATERIALS[state.material];
  const complexity = COMPLEXITY_MULTIPLIERS[state.complexity];

  const openingsFactor = 1 - state.openingsPercent / 100;
  const netArea = state.wallAreaSqFt * openingsFactor;
  const totalSiding = Math.ceil(netArea * (1 + WASTE_FACTOR));
  const squares = Math.ceil(totalSiding / SQ_FT_PER_SQUARE);

  const adjMultiplier = complexity.multiplier;
  const materialCostLow = Math.round(totalSiding * mat.materialPerSqFt);
  const materialCostHigh = Math.round(totalSiding * mat.materialPerSqFt * 1.3);
  const laborCostLow = Math.round(totalSiding * mat.laborPerSqFt * adjMultiplier);
  const laborCostHigh = Math.round(totalSiding * mat.laborPerSqFt * 1.4 * adjMultiplier);

  const totalLow = materialCostLow + laborCostLow;
  const totalHigh = materialCostHigh + laborCostHigh;

  return {
    netSidingArea: Math.round(netArea),
    totalSidingNeeded: totalSiding,
    squaresNeeded: squares,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow: totalLow,
    totalCostHigh: totalHigh,
    costPerSqFtLow: Math.round((totalLow / state.wallAreaSqFt) * 10) / 10,
    costPerSqFtHigh: Math.round((totalHigh / state.wallAreaSqFt) * 10) / 10,
  };
}

export function getDefaultState(): SidingCalculatorState {
  return { wallAreaSqFt: 2000, openingsPercent: 12, material: "vinyl", complexity: "standard" };
}

export const COST_BREAKDOWN = [
  { component: "Materials (siding + trim + fasteners)", percentage: "35-45%", description: "Siding panels, J-channel, starter strip, nails, house wrap" },
  { component: "Labor (tear-off + install)", percentage: "40-50%", description: "Remove old siding, install new, trim detail, cleanup" },
  { component: "Overhead", percentage: "8-12%", description: "Insurance, scaffolding, dump trailer, equipment" },
  { component: "Profit", percentage: "8-12%", description: "Contractor margin" },
];

export const sidingFaqs = [
  {
    question: "How much does siding cost per square foot?",
    answer:
      "Siding costs $3 to $15 per square foot installed in 2026, depending on material. Vinyl is cheapest at $3-$7/sq ft. Fiber cement (Hardie) runs $6-$15. Wood siding is $8-$15. Steel costs $4-$8. Stucco is $6-$9. For a typical 2,000 sq ft home with 2,500 sq ft of exterior wall, vinyl siding runs $7,500-$17,500, while fiber cement runs $15,000-$37,500. Use the calculator above for exact numbers.",
  },
  {
    question: "How do I calculate how much siding I need?",
    answer:
      "Measure each exterior wall (length × height in feet), add them together to get total wall area, subtract 10-15% for doors and windows, then add 10% for waste and cuts. Divide by 100 to convert to 'squares' (the unit siding is sold in). Example: 2,000 sq ft of wall × 0.88 (12% openings) × 1.10 (waste) = 1,936 sq ft = ~20 squares. The calculator does this automatically.",
  },
  {
    question: "How many squares of siding do I need for a 2,000 sq ft house?",
    answer:
      "A 2,000 sq ft single-story home typically needs 18-25 squares of siding (1,800-2,500 sq ft). A 2,000 sq ft two-story home needs less wall area per square foot of living space — about 15-20 squares. The exact number depends on ceiling height, number of stories, roof design, and window/door area. Always add 10% for waste. The calculator handles this automatically based on your wall measurements.",
  },
  {
    question: "What is the cheapest siding material?",
    answer:
      "Vinyl siding is the cheapest option at $3-$7/sq ft installed ($7,500-$17,500 for a typical home). Steel siding ($4-$8/sq ft) is next. Aluminum ($5-$9) and stucco ($6-$9) are mid-range. Fiber cement ($6-$15) and wood ($8-$15) are premium options. While vinyl is cheapest upfront, fiber cement lasts longer (30-50 years vs 20-40) and recovers more value at resale (78% vs 63% per Remodeling Magazine 2026).",
  },
  {
    question: "How long does siding installation take?",
    answer:
      "Vinyl siding installation takes 3-5 days for a typical 2,000 sq ft home with an experienced crew. Fiber cement takes 5-10 days (slower cutting and nailing). Wood siding takes 7-14 days. Stucco takes 7-21 days (multiple coats with cure time between). Add 1-2 days for tear-off of existing siding. Weather delays are common — schedule in dry months (May-September in most of the US).",
  },
  {
    question: "Does siding add value to my home?",
    answer:
      "Yes, but the ROI varies by material. Vinyl siding recovers about 63% of cost in added home value (Remodeling Magazine 2026 Cost vs Value Report). Fiber cement (Hardie) recovers 78% — the highest of any siding material. The full value comes when selling: homes with new fiber cement siding sell faster and for more than comparable homes with old vinyl. If you plan to sell within 5 years, fiber cement is the best investment. If you plan to stay 15+ years, vinyl is fine.",
  },
  {
    question: "How to maintain vinyl siding to maximize lifespan?",
    answer:
      "Vinyl siding needs minimal maintenance: (1) Wash annually with a garden hose and mild detergent — never pressure wash (forces water behind siding, causes mold). (2) Do NOT paint vinyl siding — standard paint peels within 2-3 years due to vinyl's expansion/contraction. Use vinyl-safe paint only ($50+/gallon) if you must change color. (3) Check for loose panels after storms — re-engage the locking channel by hand or with a zip tool ($5). (4) Keep grills at least 3 feet from siding — vinyl melts at 160°F. (5) Caulk gaps around windows and doors annually.",
  },
  {
    question: "Can I install new siding over existing siding?",
    answer:
      "Vinyl over old vinyl: yes, if existing is flat and firmly attached. Saves tear-off cost ($1-$3/sq ft) but adds weight and hides underlying problems. Vinyl over wood/OSB: yes, common practice with proper house wrap. Fiber cement (Hardie) over existing: no — Hardie requires a flat solid substrate, and old siding creates uneven surfaces. Always remove: rotted wood, aluminum (dents telegraph through), stucco (too rough). When in doubt, tear off — the $2,000-$4,000 cost prevents $10,000+ in hidden damage repairs later.",
  },
];
