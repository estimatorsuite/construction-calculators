// lib/calculators/insulation-r-value-data.ts
// Insulation R-Value Calculator — 数据层
// 数据来源：DOE Insulation Fact Sheet 2024, IRC 2024, HomeAdvisor 2026
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type ClimateZone = "zone1" | "zone2" | "zone3" | "zone4" | "zone5" | "zone6" | "zone7";
export type ApplicationArea = "attic" | "wall" | "floor" | "basement";

export interface InsulationState {
  climateZone: ClimateZone;
  area: ApplicationArea;
  areaSqFt: number;
}

export interface InsulationResult {
  recommendedRValue: number;
  materialType: string;
  inchesNeeded: number;
  battsNeeded: number;
  bagsNeeded: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// ========================================================================
// R-Value 需求表（DOE / IRC 2024）
// 数据来源：Department of Energy Insulation Fact Sheet
// ========================================================================

export interface RValueSpec {
  label: string;
  recommendedRValue: number;
  materialType: string;
  rValuePerInch: number;
  description: string;
}

// Indexed by `${zone}-${area}`
const R_VALUE_MAP: Record<string, RValueSpec> = {
  // Zone 1 (warm: FL, HI, southern TX)
  "zone1-attic": { label: "Zone 1 Attic", recommendedRValue: 30, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Warm climate. R-30 minimum for attic." },
  "zone1-wall": { label: "Zone 1 Wall", recommendedRValue: 13, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Warm climate. R-13 in 2x4 walls." },
  "zone1-floor": { label: "Zone 1 Floor", recommendedRValue: 13, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Warm climate. R-13 under floors." },
  "zone1-basement": { label: "Zone 1 Basement", recommendedRValue: 13, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Warm climate. R-13 on basement walls." },

  // Zone 2 (warm: Gulf Coast, southern CA)
  "zone2-attic": { label: "Zone 2 Attic", recommendedRValue: 38, materialType: "Blown-in Cellulose", rValuePerInch: 3.5, description: "Warm-humid climate. R-38 recommended for attic." },
  "zone2-wall": { label: "Zone 2 Wall", recommendedRValue: 13, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Warm-humid climate. R-13 in 2x4 walls." },
  "zone2-floor": { label: "Zone 2 Floor", recommendedRValue: 13, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Warm-humid climate. R-13 under floors." },
  "zone2-basement": { label: "Zone 2 Basement", recommendedRValue: 13, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Warm-humid climate. R-13 on basement walls." },

  // Zone 3 (moderate: southern US)
  "zone3-attic": { label: "Zone 3 Attic", recommendedRValue: 38, materialType: "Blown-in Cellulose", rValuePerInch: 3.5, description: "Moderate climate. R-38 recommended for attic." },
  "zone3-wall": { label: "Zone 3 Wall", recommendedRValue: 15, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Moderate climate. R-15 in 2x4 walls." },
  "zone3-floor": { label: "Zone 3 Floor", recommendedRValue: 19, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Moderate climate. R-19 under floors." },
  "zone3-basement": { label: "Zone 3 Basement", recommendedRValue: 15, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Moderate climate. R-15 on basement walls." },

  // Zone 4 (mixed: mid-Atlantic, Pacific NW)
  "zone4-attic": { label: "Zone 4 Attic", recommendedRValue: 49, materialType: "Blown-in Cellulose", rValuePerInch: 3.5, description: "Mixed climate. R-49 recommended for attic." },
  "zone4-wall": { label: "Zone 4 Wall", recommendedRValue: 20, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Mixed climate. R-20 in 2x6 walls." },
  "zone4-floor": { label: "Zone 4 Floor", recommendedRValue: 25, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Mixed climate. R-25 under floors." },
  "zone4-basement": { label: "Zone 4 Basement", recommendedRValue: 19, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Mixed climate. R-19 on basement walls." },

  // Zone 5 (cold: Northeast, Midwest)
  "zone5-attic": { label: "Zone 5 Attic", recommendedRValue: 49, materialType: "Blown-in Cellulose", rValuePerInch: 3.5, description: "Cold climate. R-49 to R-60 recommended for attic." },
  "zone5-wall": { label: "Zone 5 Wall", recommendedRValue: 21, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Cold climate. R-21 in 2x6 walls." },
  "zone5-floor": { label: "Zone 5 Floor", recommendedRValue: 30, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Cold climate. R-30 under floors." },
  "zone5-basement": { label: "Zone 5 Basement", recommendedRValue: 19, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Cold climate. R-19 on basement walls." },

  // Zone 6 (very cold: northern states)
  "zone6-attic": { label: "Zone 6 Attic", recommendedRValue: 49, materialType: "Blown-in Cellulose", rValuePerInch: 3.5, description: "Very cold climate. R-49 to R-60 recommended for attic." },
  "zone6-wall": { label: "Zone 6 Wall", recommendedRValue: 21, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Very cold climate. R-21 in 2x6 walls." },
  "zone6-floor": { label: "Zone 6 Floor", recommendedRValue: 30, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Very cold climate. R-30 under floors." },
  "zone6-basement": { label: "Zone 6 Basement", recommendedRValue: 19, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Very cold climate. R-19 on basement walls." },

  // Zone 7 (extreme cold: Alaska, northern MN)
  "zone7-attic": { label: "Zone 7 Attic", recommendedRValue: 60, materialType: "Closed-cell Spray Foam", rValuePerInch: 6.5, description: "Extreme cold. R-60 recommended for attic." },
  "zone7-wall": { label: "Zone 7 Wall", recommendedRValue: 21, materialType: "Closed-cell Spray Foam", rValuePerInch: 6.5, description: "Extreme cold. R-21+ in walls with thermal break." },
  "zone7-floor": { label: "Zone 7 Floor", recommendedRValue: 30, materialType: "Fiberglass Batt", rValuePerInch: 3.2, description: "Extreme cold. R-30+ under floors." },
  "zone7-basement": { label: "Zone 7 Basement", recommendedRValue: 25, materialType: "Closed-cell Spray Foam", rValuePerInch: 6.5, description: "Extreme cold. R-25+ on basement walls." },
};

// ========================================================================
// 材料成本（2026，USD/sq ft）
// 来源：HomeAdvisor 2026 Insulation Cost + RSMeans
// ========================================================================

export const MATERIAL_COST_PER_SQFT: Record<string, { low: number; high: number }> = {
  "Fiberglass Batt": { low: 0.5, high: 1.5 },
  "Blown-in Cellulose": { low: 1.0, high: 2.0 },
  "Blown-in Fiberglass": { low: 1.0, high: 2.0 },
  "Open-cell Spray Foam": { low: 2.0, high: 3.5 },
  "Closed-cell Spray Foam": { low: 3.0, high: 5.0 },
};

export const LABOR_COST_PER_SQFT = { low: 0.5, high: 1.5 };

// Batt insulation: standard batt covers ~40 sq ft (15" wide × 8' long for 2x4 wall)
export const SQ_FT_PER_BATT = 40;
// Blown-in: one bag covers ~40 sq ft at R-38
export const SQ_FT_PER_BAG = 40;

// ========================================================================
// 计算函数
// ========================================================================

export function calculateInsulation(state: InsulationState): InsulationResult | null {
  if (state.areaSqFt <= 0) return null;

  const key = `${state.climateZone}-${state.area}`;
  const spec = R_VALUE_MAP[key];
  if (!spec) return null;

  const inchesNeeded = Math.ceil((spec.recommendedRValue / spec.rValuePerInch) * 10) / 10;
  const battsNeeded = Math.ceil(state.areaSqFt / SQ_FT_PER_BATT);
  const bagsNeeded = Math.ceil(state.areaSqFt / SQ_FT_PER_BAG);

  const materialCost = MATERIAL_COST_PER_SQFT[spec.materialType] || { low: 1, high: 2 };
  const materialCostLow = Math.round(state.areaSqFt * materialCost.low);
  const materialCostHigh = Math.round(state.areaSqFt * materialCost.high);

  const laborCostLow = Math.round(state.areaSqFt * LABOR_COST_PER_SQFT.low);
  const laborCostHigh = Math.round(state.areaSqFt * LABOR_COST_PER_SQFT.high);

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  return {
    recommendedRValue: spec.recommendedRValue,
    materialType: spec.materialType,
    inchesNeeded,
    battsNeeded,
    bagsNeeded,
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

export function getDefaultState(): InsulationState {
  return {
    climateZone: "zone5",
    area: "attic",
    areaSqFt: 1000,
  };
}

// ========================================================================
// Climate Zone 选项
// ========================================================================

export const CLIMATE_ZONES: { value: ClimateZone; label: string; states: string }[] = [
  { value: "zone1", label: "Zone 1", states: "FL, HI, southern TX, Puerto Rico" },
  { value: "zone2", label: "Zone 2", states: "Gulf Coast, southern CA, AZ" },
  { value: "zone3", label: "Zone 3", states: "Southern US: Atlanta, LA, Dallas" },
  { value: "zone4", label: "Zone 4", states: "Mid-Atlantic, Pacific NW: DC, Seattle" },
  { value: "zone5", label: "Zone 5", states: "Northeast, Midwest: NYC, Chicago" },
  { value: "zone6", label: "Zone 6", states: "Northern states: Minneapolis, Buffalo" },
  { value: "zone7", label: "Zone 7", states: "Alaska, northern MN, high altitude" },
];

export const APPLICATION_AREAS: { value: ApplicationArea; label: string }[] = [
  { value: "attic", label: "Attic / Ceiling" },
  { value: "wall", label: "Wall (exterior)" },
  { value: "floor", label: "Floor (over unconditioned space)" },
  { value: "basement", label: "Basement Wall" },
];

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
    component: "Insulation Material",
    percentage: "50-65%",
    description: "Fiberglass batts, blown-in cellulose, or spray foam",
  },
  {
    component: "Labor",
    percentage: "25-35%",
    description: "Installation, vapor barrier, air sealing prep — $0.50-$1.50/sq ft",
  },
  {
    component: "Air Sealing",
    percentage: "5-10%",
    description: "Caulking, foam sealing gaps before insulation (critical for performance)",
  },
  {
    component: "Vapor Barrier & Misc",
    percentage: "5-10%",
    description: "Poly sheeting, tape, baffles for attic ventilation",
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
  { region: "Midwest", multiplier: 1.0, notes: "Baseline — fiberglass manufacturing hub" },
  { region: "Southeast", multiplier: 0.95, notes: "Lower labor, lower R-value requirements" },
  { region: "Southwest", multiplier: 1.05, notes: "Spray foam popular, higher demand" },
  { region: "Northeast", multiplier: 1.2, notes: "Higher labor, higher R-value requirements" },
  { region: "West Coast", multiplier: 1.35, notes: "Highest costs, strict energy codes" },
];

// ========================================================================
// Red Flag 警告
// ========================================================================

export const RED_FLAGS = [
  "Spray foam quote without mentioning ventilation requirements — closed-cell foam can trap moisture",
  "Attic insulation installed without air sealing first — reduces effective R-value by 30-50%",
  "Fiberglass batts compressed to fit cavities — loses up to 50% of rated R-value",
  "Vapor barrier installed on wrong side — causes condensation and mold in cold climates",
  "R-13 fiberglass used in Zone 5+ attics — well below code minimum R-49",
];

// ========================================================================
// FAQ
// ========================================================================

export const insulationFaqs = [
  {
    question: "What R-value do I need for my home?",
    answer:
      "R-value requirements depend on your climate zone and where the insulation goes. The Department of Energy recommends R-49 to R-60 for attics in cold climates (Zones 5-7), R-38 for moderate climates (Zones 3-4), and R-30 for warm climates (Zones 1-2). Walls typically need R-13 to R-21 depending on stud size. Floors need R-13 to R-30. Enter your zone and application area above to get the exact DOE recommendation for your situation.",
  },
  {
    question: "How many inches of insulation do I need?",
    answer:
      "Inches needed = R-value ÷ R-value per inch of material. Fiberglass batt provides R-3.0 to R-3.8 per inch, so R-49 needs about 13-16 inches. Blown-in cellulose is R-3.2 to R-3.8/inch, so R-49 needs 13-15 inches. Closed-cell spray foam is R-6.5/inch, so R-49 needs only 7.5 inches. Check your attic: if existing insulation is below the top of the joists (less than 10\"), you likely need to top up.",
  },
  {
    question: "Fiberglass vs spray foam insulation — which is better?",
    answer:
      "Fiberglass batts cost $0.50-$1.50/sq ft and provide R-3.0-3.8/inch. They're DIY-friendly but lose effectiveness if poorly installed (gaps, compression). Spray foam costs $2.00-$5.00/sq ft but provides R-3.6 (open-cell) to R-6.5 (closed-cell) per inch AND acts as an air barrier. For tight budgets and simple cavities, fiberglass is adequate. For maximum energy efficiency, moisture control, and irregular spaces, spray foam wins — it can cut heating bills by 30-50% vs fiberglass.",
  },
  {
    question: "How much does insulation cost to install?",
    answer:
      "Insulation costs $1-$7 per square foot installed depending on material. Fiberglass batts are $1-$3/sq ft total. Blown-in cellulose is $1.50-$3.50/sq ft. Open-cell spray foam is $2.50-$5.00/sq ft. Closed-cell spray foam is $3.50-$6.50/sq ft. A 1,000 sq ft attic typically costs $1,500-$3,500 with blown-in cellulose, or $3,500-$6,500 with spray foam. Labor is $0.50-$1.50/sq ft on top of materials for professional installation.",
  },
  {
    question: "How do I find my climate zone for insulation?",
    answer:
      "The DOE divides the US into 8 climate zones (1-7, plus marine). Zone 1 is Florida and Hawaii (warmest). Zone 7 is Alaska (coldest). The Midwest is Zone 5, Northeast is Zone 5-6, Pacific NW is Zone 4, southern states are Zone 2-3. Find your exact zone on the IECC climate zone map or enter your zip code at energystar.gov. Your zone determines minimum code R-values for new construction and the DOE recommended levels for retrofits.",
  },
  {
    question: "Can I install insulation myself or should I hire a pro?",
    answer:
      "Fiberglass batts and blown-in cellulose are DIY-friendly for homeowners with basic tools. A 1,000 sq ft attic can be done in a weekend for $500-$1,000 in materials. Spray foam requires professional equipment and training — DIY kits exist but coverage is inconsistent and off-gassing is dangerous without proper PPE. Always air-seal before insulating (caulk gaps, foam around pipes). For walls and basements, hire a pro — improper installation can trap moisture and cause rot.",
  },
  {
    question: "Can you over-insulate a house?",
    answer:
      "Yes — insulation beyond code minimums can cause problems without proper ventilation. Issues from over-insulation: (1) moisture condensation in walls if vapor barriers are misplaced — leads to mold within 2-5 years; (2) 'sick house' syndrome when fresh air exchange drops below 0.35 air changes per hour (ASHRAE 62.2 minimum) — requires mechanical ventilation (HRV/ERV, $1,500-$4,000 installed); (3) diminished returns — each added R-5 saves less energy than the last. Practical ceiling: R-49 attic insulation in cold climates is the economic sweet spot. Beyond R-60, payback exceeds 30 years. Always pair additional insulation with blower-door testing ($300-$600) to verify the house still breathes properly.",
  },
  {
    question: "What is a vapor barrier and when do I need one?",
    answer:
      "A vapor barrier (or vapor retarder) is a material — typically 6-mil polyethylene sheeting ($0.10-$0.20/sq ft) or kraft-faced insulation — that blocks moisture vapor from passing through walls and ceilings. You need one on the warm side of insulation in cold climates (Zones 4-7): install against the interior drywall. In warm, humid climates (Zones 1-3), install on the exterior side — or skip entirely and use 'vapor-open' assemblies. Wrong placement causes condensation inside the wall cavity, leading to rot and mold. Building codes (IRC R702.7) specify which zones require vapor barriers and where. Spray foam (closed-cell, 2+ inches) acts as its own vapor barrier and doesn't need a separate layer.",
  },
];
