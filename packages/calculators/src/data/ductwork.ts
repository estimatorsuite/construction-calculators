// lib/calculators/ductwork-data.ts
// Ductwork Replacement Cost Calculator

export type DuctworkMaterial = "galvanizedSteel" | "flexDuct" | "fiberglassBoard";
export type HouseStories = 1 | 2;

export interface DuctworkState {
  houseSizeSqFt: number;
  material: DuctworkMaterial;
  stories: HouseStories;
  accessibility: "open" | "limited" | "sealed";
}

export interface DuctworkResult {
  estimatedLinearFeet: number;
  supplyDucts: number;
  returnDucts: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
}

export const DUCT_MATERIALS: Record<DuctworkMaterial, {
  label: string;
  perLinearFtLow: number;
  perLinearFtHigh: number;
  lifespanYears: string;
  pros: string;
  cons: string;
}> = {
  galvanizedSteel: {
    label: "Galvanized Steel (Sheet Metal)",
    perLinearFtLow: 12,
    perLinearFtHigh: 25,
    lifespanYears: "30-50 years",
    pros: "Durable, smooth interior airflow, pest-proof",
    cons: "Most expensive, requires custom fabrication",
  },
  flexDuct: {
    label: "Flexible Duct (Flex)",
    perLinearFtLow: 8,
    perLinearFtHigh: 18,
    lifespanYears: "15-25 years",
    pros: "Cheapest, easy to install, versatile routing",
    cons: "Restricts airflow if bent, punctures easily, shorter lifespan",
  },
  fiberglassBoard: {
    label: "Fiberglass Duct Board",
    perLinearFtLow: 10,
    perLinearFtHigh: 22,
    lifespanYears: "20-30 years",
    pros: "Built-in insulation, sound dampening",
    cons: "Can shed fibers into airstream, degrades in humidity",
  },
};

export const ACCESSIBILITY_FACTORS: Record<string, { label: string; multiplier: number }> = {
  open: { label: "Open basement/attic", multiplier: 1.0 },
  limited: { label: "Finished ceiling/walls", multiplier: 1.35 },
  sealed: { label: "Enclosed in walls (sealed)", multiplier: 1.6 },
};

export function calculateDuctwork(state: DuctworkState): DuctworkResult | null {
  if (state.houseSizeSqFt <= 0) return null;
  const mat = DUCT_MATERIALS[state.material];
  // 估算 linear feet：约每 100 sq ft 需要 8-12 ft of ductwork
  const baseLinearFeet = state.houseSizeSqFt * 0.10;
  const storiesMultiplier = state.stories === 2 ? 1.2 : 1;
  const accessMultiplier = ACCESSIBILITY_FACTORS[state.accessibility].multiplier;
  const linearFeet = Math.round(baseLinearFeet * storiesMultiplier);
  // 估算 supply/return ducts
  const supplyDucts = Math.ceil(state.houseSizeSqFt / 400);
  const returnDucts = Math.ceil(supplyDucts / 3);
  // 成本
  const costLow = linearFeet * mat.perLinearFtLow * accessMultiplier;
  const costHigh = linearFeet * mat.perLinearFtHigh * accessMultiplier;
  return {
    estimatedLinearFeet: linearFeet,
    supplyDucts,
    returnDucts,
    materialCostLow: Math.round(costLow * 0.45),
    materialCostHigh: Math.round(costHigh * 0.45),
    laborCostLow: Math.round(costLow * 0.55),
    laborCostHigh: Math.round(costHigh * 0.55),
    totalCostLow: Math.round(costLow),
    totalCostHigh: Math.round(costHigh),
    costPerSqFtLow: Math.round((costLow / state.houseSizeSqFt) * 10) / 10,
    costPerSqFtHigh: Math.round((costHigh / state.houseSizeSqFt) * 10) / 10,
  };
}

export function getDefaultState(): DuctworkState {
  return { houseSizeSqFt: 2000, material: "galvanizedSteel", stories: 1, accessibility: "open" };
}

export const COST_BREAKDOWN = [
  { component: "Materials (ducts + fittings + registers)", percentage: "40-50%", description: "Duct pipe/metal, elbows, boots, grilles, dampers, sealant" },
  { component: "Labor (demo + install + balance)", percentage: "40-50%", description: "Remove old ducts, install new, connect to HVAC, balance airflow" },
  { component: "Equipment & permits", percentage: "5-10%", description: "Sheet metal tools, disposal, HVAC permit ($75-$300)" },
  { component: "Wall/ceiling repair", percentage: "10-20% extra", description: "If ducts are in finished walls/ceilings, add drywall repair cost" },
];

export const ductworkFaqs = [
  {
    question: "How much does it cost to replace ductwork?",
    answer:
      "Whole-house ductwork replacement costs $3,000 to $15,000 in 2026, depending on house size and material. Galvanized steel ducts run $12-$25/linear foot. Flexible duct costs $8-$18/linear foot. A typical 2,000 sq ft single-story home needs about 200 linear feet of ductwork, costing $2,400-$5,000 for flex or $2,400-$5,000 for steel. Two-story homes cost 20% more. If ducts are sealed in walls or finished ceilings, add 35-60% for access and repair.",
  },
  {
    question: "How long does ductwork last?",
    answer:
      "Galvanized steel ductwork lasts 30-50 years. Flexible duct lasts 15-25 years. Fiberglass duct board lasts 20-30 years. Signs your ducts need replacement: visible rust/corrosion, tears in flex duct, disconnected sections, uneven heating/cooling between rooms, higher utility bills, musty smell from ducts, and dust/debris from registers. Most homes built before 1990 with original ducts are candidates for replacement.",
  },
  {
    question: "Can I replace ductwork myself?",
    answer:
      "Flex duct installation is DIY-possible for exposed areas (unfinished basement, attic) if you understand airflow principles. But galvanized steel requires specialized tools (snips, brakes, solder) and sheet metal skills. Most jurisdictions require a permit and inspection for ductwork changes. Improper installation causes airflow imbalance (some rooms too hot/cold), reduced HVAC efficiency, and moisture problems. For anything beyond replacing a single flex duct run, hire an HVAC professional.",
  },
  {
    question: "Should I choose flex duct or sheet metal ductwork?",
    answer:
      "Galvanized sheet metal is the professional standard — smoother interior means better airflow, longer lifespan (40+ years), and won't harbor mold. Flex duct is cheaper and easier to route through tight spaces but restricts airflow if bent, lasts only 15-25 years, and can puncture. Rule of thumb: use sheet metal for main trunks and long straight runs; use flex only for short final runs to registers where routing is complex. Avoid flex for runs over 15 feet.",
  },
  {
    question: "Does ductwork replacement improve HVAC efficiency?",
    answer:
      "Yes — old leaky ducts lose 20-30% of conditioned air (DOE estimate). Replacing with properly sealed new ducts can reduce heating/cooling costs by 15-25%. The payback is typically 5-8 years on energy savings alone. Additional benefits: more even temperatures between rooms, quieter system operation, better indoor air quality (no dust/mold infiltration from leaks). If your ducts are 25+ years old, replacement almost always pays for itself within the system's remaining lifespan.",
  },
  {
    question: "How do I know if my ductwork needs replacement vs repair?",
    answer:
      "Replace if: (1) ducts are 25+ years old, (2) widespread rust or corrosion on metal ducts, (3) tears or gaps in flex duct exceeding 10% of total length, (4) persistent uneven heating/cooling despite HVAC service, (5) visible mold or moisture damage. Repair if: (1) isolated damage at one joint or section, (2) single disconnected section, (3) minor flex duct tear under 12 inches. A professional duct inspection ($200-$400) includes pressure testing and camera evaluation to determine the right scope.",
  },
  {
    question: "What is duct sealing and does it replace replacement?",
    answer:
      "Duct sealing ($1,000-$2,000) uses aerosol sealant (Aeroseal) to close leaks from inside. It's effective for reducing air leakage 70-90% without tearing walls. But sealing does NOT fix: crushed ducts, disconnected sections, undersized ducts, or mold contamination. If your ducts are structurally sound but leaky, sealing is a cost-effective alternative to replacement. If they're 30+ years old or physically damaged, replacement is the right choice. Many contractors recommend sealing first, then replacing only the sections that can't be sealed.",
  },
];
