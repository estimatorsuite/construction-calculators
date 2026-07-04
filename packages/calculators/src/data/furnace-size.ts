// lib/calculators/furnace-size-data.ts
// Furnace Size Calculator

export type ClimateSeverity = "warm" | "moderate" | "cold" | "veryCold";
export type InsulationQuality = "good" | "average" | "poor";
export type FurnaceEfficiency = "afue80" | "afue95" | "afue97";

export interface FurnaceState {
  houseSizeSqFt: number;
  climate: ClimateSeverity;
  insulation: InsulationQuality;
  efficiency: FurnaceEfficiency;
}

export interface FurnaceResult {
  inputBTU: number;           // 输入 BTU（炉子额定功率）
  outputBTU: number;          // 输出 BTU（实际供热）
  recommendedSize: string;    // 推荐型号描述
  equipmentCostLow: number;
  equipmentCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  estimatedAnnualFuelCost: string;
}

// 每 sq ft BTU 需求（基于气候 + insulation）
const BTU_PER_SQFT: Record<ClimateSeverity, Record<InsulationQuality, number>> = {
  warm:    { good: 25, average: 30, poor: 35 },
  moderate:{ good: 35, average: 40, poor: 45 },
  cold:    { good: 45, average: 50, poor: 55 },
  veryCold:{ good: 55, average: 60, poor: 70 },
};

export const CLIMATE_INFO: Record<ClimateSeverity, { label: string; example: string }> = {
  warm:     { label: "Warm (South/Southwest)", example: "FL, TX, AZ, Southern CA" },
  moderate: { label: "Moderate (Mid-Atlantic/Midwest)", example: "VA, NC, TN, MO" },
  cold:     { label: "Cold (Northeast/Mountain West)", example: "NY, MA, CO, UT" },
  veryCold: { label: "Very Cold (Upper Midwest/Northern New England)", example: "MN, ND, ME, MT" },
};

export const INSULATION_INFO: Record<InsulationQuality, { label: string; description: string }> = {
  good:    { label: "Well-insulated", description: "R-30+ attic, double-pane windows, sealed. Post-2000 construction or upgraded." },
  average: { label: "Average insulation", description: "R-19 attic, some double-pane. Typical 1980-2000 construction." },
  poor:    { label: "Poorly insulated", description: "Minimal attic insulation, single-pane windows. Pre-1980 construction." },
};

export const EFFICIENCY_INFO: Record<FurnaceEfficiency, { label: string; afue: number; costLow: number; costHigh: number; description: string }> = {
  afue80: { label: "80% AFUE (Standard)", afue: 0.80, costLow: 2000, costHigh: 3500, description: "Minimum code. Vents through chimney. Cheapest option." },
  afue95: { label: "95% AFUE (High-Efficiency)", afue: 0.95, costLow: 3000, costHigh: 5000, description: "Condensing furnace. PVC venting. ENERGY STAR rated." },
  afue97: { label: "97%+ AFUE (Premium)", afue: 0.97, costLow: 4000, costHigh: 6500, description: "Modulating gas valve. Best efficiency. Variable-speed blower." },
};

// 标准炉子 BTU 等级
const FURNACE_BTU_STEPS = [40000, 60000, 80000, 100000, 120000, 150000];

export function calculateFurnaceSize(state: FurnaceState): FurnaceResult | null {
  if (state.houseSizeSqFt <= 0) return null;
  const btuPerSqFt = BTU_PER_SQFT[state.climate][state.insulation];
  const outputBTURaw = state.houseSizeSqFt * btuPerSqFt;
  // 向上取整到最近的标称 BTU 等级
  const recommendedBTU = FURNACE_BTU_STEPS.find((btu) => btu >= outputBTURaw) || 150000;
  const eff = EFFICIENCY_INFO[state.efficiency];
  const inputBTU = Math.round(recommendedBTU / eff.afue);
  // 成本
  const equipLow = eff.costLow;
  const equipHigh = eff.costHigh;
  const laborLow = 2000;
  const laborHigh = 4000;
  const fuelCost = state.climate === "warm" ? "$500-$900/year" :
                   state.climate === "moderate" ? "$800-$1,400/year" :
                   state.climate === "cold" ? "$1,200-$2,000/year" : "$1,800-$3,000/year";
  return {
    inputBTU,
    outputBTU: recommendedBTU,
    recommendedSize: `${(recommendedBTU / 1000).toFixed(0)}K BTU ${eff.label}`,
    equipmentCostLow: equipLow,
    equipmentCostHigh: equipHigh,
    laborCostLow: laborLow,
    laborCostHigh: laborHigh,
    totalCostLow: equipLow + laborLow,
    totalCostHigh: equipHigh + laborHigh,
    estimatedAnnualFuelCost: fuelCost,
  };
}

export function getDefaultState(): FurnaceState {
  return { houseSizeSqFt: 2000, climate: "moderate", insulation: "average", efficiency: "afue95" };
}

export const COST_BREAKDOWN = [
  { component: "Equipment (furnace unit)", percentage: "40-50%", description: "Gas furnace, variable-speed blower, igniter system" },
  { component: "Labor (installation)", percentage: "35-45%", description: "Removal of old furnace, new install, gas/electrical connections, venting" },
  { component: "Materials & permits", percentage: "10-15%", description: "Sheet metal ductwork, PVC vent pipe, gas line, permit $200-$500" },
  { component: "Old unit disposal", percentage: "5-8%", description: "Hauling and recycling old furnace, environmental fees" },
];

export const furnaceFaqs = [
  {
    question: "What size furnace do I need for a 2,000 square foot house?",
    answer:
      "A 2,000 sq ft home typically needs a 60,000-100,000 BTU furnace, depending on climate and insulation. In warm climates (FL, TX), 60,000-70,000 BTU is sufficient. In moderate climates (VA, NC), 80,000 BTU. In cold climates (NY, MA), 100,000 BTU. For poorly insulated homes, add 10-15%. The calculator above accounts for all three factors — house size, climate zone, and insulation quality — to give you the exact recommendation.",
  },
  {
    question: "How do I calculate what size furnace I need?",
    answer:
      "The basic rule of thumb: multiply house square footage by 30-60 BTU per square foot, depending on climate. Warm climates need 30 BTU/sq ft. Moderate need 40. Cold need 50. Very cold need 60+. Then adjust for insulation quality: well-insulated homes subtract 5-10 BTU/sq ft, poorly insulated add 5-10. Example: 2,000 sq ft × 40 BTU (moderate climate, average insulation) = 80,000 BTU furnace. The calculator does this automatically.",
  },
  {
    question: "How many BTUs do I need per square foot?",
    answer:
      "You need 30-70 BTU per square foot for whole-house heating, depending on climate zone. Zone 1-2 (warm, South): 30-35 BTU/sq ft. Zone 3-4 (moderate, Mid-Atlantic): 35-45 BTU/sq ft. Zone 5 (cold, Northeast): 45-55 BTU/sq ft. Zone 6-7 (very cold, Upper Midwest): 55-70 BTU/sq ft. Poor insulation adds 10-15 BTU/sq ft. These numbers are based on Manual J calculations simplified for residential use. For exact sizing, hire an HVAC contractor to perform a full Manual J load calculation.",
  },
  {
    question: "How much does a furnace cost installed?",
    answer:
      "A new furnace costs $4,000-$10,000 installed in 2026, depending on efficiency and size. An 80% AFUE standard furnace costs $4,000-$6,500 total. A 95% AFUE high-efficiency model costs $5,000-$9,000. A 97%+ AFUE premium modulating furnace costs $6,000-$10,500. Equipment alone runs $2,000-$6,500. Labor is $2,000-$4,000. High-efficiency furnaces cost 40-60% more upfront but save $200-$500/year on gas bills, paying back the difference in 5-8 years.",
  },
  {
    question: "What happens if my furnace is too big?",
    answer:
      "An oversized furnace causes three problems: (1) Short-cycling — the furnace heats the house too fast, shuts off, then restarts. This wastes energy and creates temperature swings. (2) Poor dehumidification — short run times don't remove enough moisture from the air, leading to clammy comfort. (3) Premature wear — frequent starts/stops stress components, shortening the furnace's lifespan by 5-10 years. An oversized furnace is worse than a correctly-sized one. Always size based on actual heat loss, not 'bigger is better.'",
  },
  {
    question: "What happens if my furnace is too small?",
    answer:
      "An undersized furnace runs constantly during cold snaps and still can't maintain the set temperature. The house feels drafty and cold when outdoor temps drop below design temperature (typically 10-20°F in cold climates). Running 24/7 also increases wear and energy bills. If your furnace runs continuously during normal winter weather and can't reach 68°F, it's likely undersized — or your home has serious insulation problems. The calculator helps you avoid this by recommending the right size.",
  },
  {
    question: "Should I choose an 80% or 95% AFUE furnace?",
    answer:
      "In warm/moderate climates, an 80% AFUE furnace is usually the right choice — it's $1,500-$3,000 cheaper and the energy savings from higher efficiency won't pay back within the furnace's lifespan (15-20 years). In cold/very cold climates, a 95% AFUE furnace almost always pays back in 5-8 years through lower gas bills ($200-$500/year savings). The 95% furnace also qualifies for ENERGY STAR rebates and may be required by local code in some jurisdictions. Going to 97% AFUE (modulating) is a premium upgrade justified by comfort, not just savings.",
  },
  {
    question: "Can a furnace be too efficient?",
    answer:
      "Yes — beyond ~96% AFUE, returns diminish sharply and comfort can actually decrease. Modulating 98-99% AFUE furnaces cycle at very low BTU output, which can cause: (1) shorter run times that don't mix air well, creating stratification (cold floors, warm ceilings), (2) inadequate dehumidification in shoulder seasons, (3) higher repair costs ($300-$800 per board vs $150-$300 for standard furnaces). In warm climates (zones 1-3), a 98% AFUE furnace rarely runs at high output, so the efficiency premium never pays back. Stick with 95% AFUE for cold climates and 80% AFUE for warm climates. The extra $1,500-$3,000 for 98%+ is better spent on insulation or air sealing.",
  },
  {
    question: "How to tell if a furnace is oversized?",
    answer:
      "Oversized furnace symptoms: (1) short cycles — furnace runs less than 10 minutes per call for heat (check thermostat cycle log), (2) temperature overshoot — set to 68°F but rooms spike to 73°F before cooling back down, (3) hot/cold spots — some rooms overheat while others stay cold because air mixing is poor, (4) frequent ignition sounds — 6+ ignitions per hour in cold weather, (5) higher than expected gas bills despite short run times (from inefficient startup cycles). Ideal run time during design temperature weather is 20-40 minutes per cycle. If your furnace runs under 10 minutes when it's 20°F outside, it's likely oversized — confirm with a Manual J load calculation.",
  },
];
