// lib/calculators/heat-pump-data.ts
// Heat Pump Cost Calculator

export type HeatPumpType = "airSource" | "geothermal";
export type EfficiencyTier = "standard" | "high" | "premium";

export interface HeatPumpState {
  houseSizeSqFt: number;
  climateZone: "warm" | "moderate" | "cold";
  pumpType: HeatPumpType;
  efficiency: EfficiencyTier;
}

export interface HeatPumpResult {
  recommendedTons: number;
  recommendedBTU: number;
  equipmentCostLow: number;
  equipmentCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  estimatedAnnualSavings: string;
}

// 每 sq ft 需要的 ton 数（按气候）
const TONS_PER_SQFT: Record<string, number> = {
  warm: 0.001,      // 南方温暖地区
  moderate: 0.00125, // 中部温和
  cold: 0.0015,     // 北方寒冷
};

// 每 ton 设备价格（含安装）
const PRICING: Record<HeatPumpType, Record<EfficiencyTier, { low: number; high: number }>> = {
  airSource: {
    standard: { low: 2000, high: 3000 },
    high: { low: 2800, high: 4200 },
    premium: { low: 3500, high: 5500 },
  },
  geothermal: {
    standard: { low: 5000, high: 7500 },
    high: { low: 6500, high: 9500 },
    premium: { low: 8000, high: 12000 },
  },
};

export const PUMP_TYPE_INFO: Record<HeatPumpType, { label: string; description: string; lifespan: string; pros: string; cons: string }> = {
  airSource: {
    label: "Air-Source Heat Pump",
    description: "Most common. Extracts heat from outside air. Works down to ~0°F.",
    lifespan: "15-20 years",
    pros: "Affordable, no ground drilling, fast install",
    cons: "Less efficient below 20°F, needs backup heat",
  },
  geothermal: {
    label: "Geothermal (Ground-Source) Heat Pump",
    description: "Uses stable ground temperature. Most efficient but expensive to install.",
    lifespan: "25-50 years (indoor unit)",
    pros: "Highest efficiency, lowest operating cost, long lifespan",
    cons: "Most expensive install, requires yard space for ground loops",
  },
};

export const EFFICIENCY_INFO: Record<EfficiencyTier, { label: string; description: string }> = {
  standard: { label: "Standard Efficiency (14-16 SEER)", description: "Meets minimum code. Most affordable." },
  high: { label: "High Efficiency (18-20 SEER)", description: "ENERGY STAR rated. 25% more efficient." },
  premium: { label: "Premium Efficiency (22+ SEER)", description: "Top-tier inverter-driven. 40%+ more efficient." },
};

export function calculateHeatPump(state: HeatPumpState): HeatPumpResult | null {
  if (state.houseSizeSqFt <= 0) return null;
  const tonsNeeded = Math.max(1.5, Math.ceil(state.houseSizeSqFt * TONS_PER_SQFT[state.climateZone] * 2) / 2); // round to nearest 0.5
  const btu = Math.round(tonsNeeded * 12000);
  const pricing = PRICING[state.pumpType][state.efficiency];
  const equipLow = tonsNeeded * pricing.low;
  const equipHigh = tonsNeeded * pricing.high;
  // Labor ~30% of equipment
  const laborLow = Math.round(equipLow * 0.3);
  const laborHigh = Math.round(equipHigh * 0.3);
  const savings = state.pumpType === "geothermal" ? "$500-$1,500/year" : "$300-$800/year";
  return {
    recommendedTons: tonsNeeded,
    recommendedBTU: btu,
    equipmentCostLow: Math.round(equipLow),
    equipmentCostHigh: Math.round(equipHigh),
    laborCostLow: laborLow,
    laborCostHigh: laborHigh,
    totalCostLow: Math.round(equipLow + laborLow),
    totalCostHigh: Math.round(equipHigh + laborHigh),
    estimatedAnnualSavings: savings,
  };
}

export function getDefaultState(): HeatPumpState {
  return { houseSizeSqFt: 2000, climateZone: "moderate", pumpType: "airSource", efficiency: "high" };
}

export const COST_BREAKDOWN = [
  { component: "Equipment (heat pump unit)", percentage: "55-65%", description: "Outdoor compressor/condenser + indoor air handler" },
  { component: "Labor (installation)", percentage: "20-30%", description: "Removal of old system, install new, electrical, refrigerant" },
  { component: "Materials (lines, pad, ductwork mods)", percentage: "8-12%", description: "Refrigerant lines, pad, wiring, minor duct modifications" },
  { component: "Permits & inspection", percentage: "5-8%", description: "Electrical permit, HVAC permit, final inspection" },
];

export const heatPumpFaqs = [
  {
    question: "How much does a heat pump cost installed?",
    answer:
      "Air-source heat pumps cost $4,000 to $12,000 installed in 2026, depending on size (tons) and efficiency. A typical 3-ton high-efficiency unit runs $8,000-$12,000. Geothermal heat pumps cost $15,000-$30,000+ due to ground loop drilling. The calculator above estimates your cost based on house size and climate zone. Heat pumps cost more upfront than traditional furnaces but save $300-$1,500/year on energy (depending on your current heating source).",
  },
  {
    question: "What size heat pump do I need for my house?",
    answer:
      "Heat pump sizing depends on house size and climate. Rule of thumb: 1 ton per 1,000 sq ft in warm climates, 1 ton per 700 sq ft in cold climates. A 2,000 sq ft home in a moderate climate typically needs a 2.5-3 ton unit. The calculator estimates this automatically. For precise sizing, an HVAC contractor performs a Manual J load calculation (accounts for insulation, windows, ceiling height, sun exposure). Oversized units short-cycle and dehumidify poorly; undersized units run constantly and can't keep up.",
  },
  {
    question: "Is a heat pump worth it compared to a furnace?",
    answer:
      "For most US climates, yes. Heat pumps provide both heating and cooling in one system, eliminating the need for separate furnace + AC. They're 2-3x more efficient than electric resistance heat and competitive with gas furnaces on cost. Break-even is typically 5-10 years vs gas furnace replacement. In very cold climates (below -10°F), heat pumps need backup heat (electric resistance or gas), reducing savings. In warm/moderate climates, heat pumps almost always win on total cost of ownership.",
  },
  {
    question: "How long does a heat pump last?",
    answer:
      "Air-source heat pumps last 15-20 years. Geothermal indoor units last 25+ years (ground loops last 50+ years). Lifespan depends on maintenance (annual service doubles expected life), usage patterns, and climate. Cold-climate heat pumps work harder and typically last 12-15 years. Signs of failure: frequent cycling, inadequate heating/cooling, unusual noises, rising energy bills, and refrigerant leaks. Most manufacturers offer 10-year parts warranties; labor is typically 1-2 years.",
  },
  {
    question: "What is the difference between air-source and geothermal heat pumps?",
    answer:
      "Air-source extracts heat from outside air (works down to ~0°F with cold-climate models). Costs $4,000-$12,000 installed. Geothermal uses stable ground temperature (50-60°F year-round) via buried loops. Costs $15,000-$30,000+ installed but operates at 300-600% efficiency (COP 3-6) vs air-source's 200-300%. Geothermal pays back in 7-15 years vs air-source, then saves $500-$1,500/year. Geothermal requires yard space for loop installation (vertical drilling or horizontal trenching).",
  },
  {
    question: "Are there tax credits for heat pump installation?",
    answer:
      "Yes — the Inflation Reduction Act provides a 30% federal tax credit (up to $2,000) for heat pump installation through 2032. ENERGY STAR-certified units qualify. Some states offer additional rebates ($500-$5,000). Check dsireusa.org for your state's incentives. Geothermal qualifies for a separate 26% federal tax credit (no cap). Combined incentives can reduce your effective cost by $2,000-$8,000 depending on location and system type.",
  },
];
