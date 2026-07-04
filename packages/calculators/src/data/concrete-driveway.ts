// lib/calculators/concrete-driveway-data.ts
// Concrete Driveway Cost Calculator — 数据层
// 数据来源：HomeAdvisor 2026 + Angi 2026 + Homewyse May 2026
// 最后验证：2026-06-20

// ========================================================================
// 类型定义
// ========================================================================

export type ConcreteFinish = "broomStandard" | "colored" | "stamped";
export type DrivewayThickness = 4 | 5 | 6;

export interface ConcreteDrivewayState {
  drivewayAreaSqFt: number;
  finish: ConcreteFinish;
  thickness: DrivewayThickness;
  needsTearoff: boolean;
}

export interface ConcreteDrivewayResult {
  concreteYardsNeeded: number;    // cubic yards (订购单位)
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  tearoffCost: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
  lifespanYears: string;
}

// ========================================================================
// 完工类型数据
// 来源：HomeAdvisor 2026 Concrete Driveway Cost + Angi 2026
// ========================================================================

export interface FinishSpec {
  label: string;
  description: string;
  installedLow: number;            // $/sq ft（材料+人工）
  installedHigh: number;
  lifespanYears: string;
  pros: string;
  cons: string;
}

export const FINISH_TYPES: Record<ConcreteFinish, FinishSpec> = {
  broomStandard: {
    label: "Standard Broom Finish",
    description: "Plain concrete with broom-brushed surface for traction. Most common.",
    installedLow: 4,
    installedHigh: 8,
    lifespanYears: "30-50 years",
    pros: "Cheapest, low maintenance, fast install, slip-resistant",
    cons: "Plain look, cracks show easily, no decorative value",
  },
  colored: {
    label: "Integral Color Concrete",
    description: "Color mixed into concrete. Subtle, uniform appearance.",
    installedLow: 6,
    installedHigh: 12,
    lifespanYears: "30-50 years",
    pros: "Color won't fade (integral), hides stains, warmer look",
    cons: "Limited color options, cost 50% more than broom",
  },
  stamped: {
    label: "Stamped / Decorative Concrete",
    description: "Pattern stamped to look like stone, brick, or slate. Premium.",
    installedLow: 8,
    installedHigh: 15,
    lifespanYears: "25-40 years",
    pros: "High-end look, mimics expensive materials, adds resale value",
    cons: "Most expensive, requires resealing every 2-3 years, can crack",
  },
};

// ========================================================================
// 厚度影响（每增加 1" 加约 $0.50-$1/sq ft 材料+结构）
// ========================================================================

export const THICKNESS_OPTIONS: { value: DrivewayThickness; label: string; costMultiplier: number; usage: string }[] = [
  { value: 4, label: '4 inches', costMultiplier: 1.0, usage: "Standard passenger cars (most common)" },
  { value: 5, label: '5 inches', costMultiplier: 1.1, usage: "SUVs, light trucks, colder climates" },
  { value: 6, label: '6 inches', costMultiplier: 1.2, usage: "Heavy vehicles, RVs, commercial" },
];

// ========================================================================
// 拆除成本
// ========================================================================

export const TEAROFF_COST_PER_SQ_FT = 3; // $2-$4/sq ft to remove + dispose old driveway

// ========================================================================
// 混凝土体积计算
// 1 cubic yard = 27 cubic feet
// concrete volume (cu yd) = area × (thickness_inches / 12) / 27
// ========================================================================

export const CUBIC_FEET_PER_YARD = 27;

export function calculateConcreteYards(areaSqFt: number, thicknessInches: number): number {
  const cubicFeet = areaSqFt * (thicknessInches / 12);
  return Math.ceil((cubicFeet / CUBIC_FEET_PER_YARD) * 10) / 10; // 1 decimal
}

// ========================================================================
// 计算函数
// ========================================================================

export function calculateConcreteDriveway(state: ConcreteDrivewayState): ConcreteDrivewayResult | null {
  if (state.drivewayAreaSqFt <= 0) return null;

  const finish = FINISH_TYPES[state.finish];
  const thickness = THICKNESS_OPTIONS.find((t) => t.value === state.thickness)!;
  const concreteYards = calculateConcreteYards(state.drivewayAreaSqFt, state.thickness);

  // 基础安装成本（含厚度调整）
  const baseLow = state.drivewayAreaSqFt * finish.installedLow * thickness.costMultiplier;
  const baseHigh = state.drivewayAreaSqFt * finish.installedHigh * thickness.costMultiplier;

  // 拆分材料和人工（材料约 40%，人工约 60%）
  const materialCostLow = Math.round(baseLow * 0.40);
  const materialCostHigh = Math.round(baseHigh * 0.40);
  const laborCostLow = Math.round(baseLow * 0.60);
  const laborCostHigh = Math.round(baseHigh * 0.60);

  // 拆除旧车道（额外）
  const tearoffCost = state.needsTearoff ? Math.round(state.drivewayAreaSqFt * TEAROFF_COST_PER_SQ_FT) : 0;

  const totalCostLow = materialCostLow + laborCostLow + tearoffCost;
  const totalCostHigh = materialCostHigh + laborCostHigh + tearoffCost;

  return {
    concreteYardsNeeded: concreteYards,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    tearoffCost,
    totalCostLow,
    totalCostHigh,
    costPerSqFtLow: Math.round((totalCostLow / state.drivewayAreaSqFt) * 10) / 10,
    costPerSqFtHigh: Math.round((totalCostHigh / state.drivewayAreaSqFt) * 10) / 10,
    lifespanYears: finish.lifespanYears,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): ConcreteDrivewayState {
  return {
    drivewayAreaSqFt: 1000,       // 典型 2-car driveway
    finish: "broomStandard",
    thickness: 4,
    needsTearoff: false,
  };
}

// ========================================================================
// 成本拆解
// ========================================================================

export const COST_BREAKDOWN = [
  {
    component: "Materials (concrete + reinforcement)",
    percentage: "35-45%",
    description: "Ready-mix concrete, rebar/wire mesh, forms, expansion joints",
  },
  {
    component: "Labor (excavation + pour + finish)",
    percentage: "40-50%",
    description: "Site prep, grading, forming, pouring, screeding, finishing",
  },
  {
    component: "Equipment & disposal",
    percentage: "8-12%",
    description: "Concrete mixer/pump rental, dump fees, excavation equipment",
  },
  {
    component: "Permits & inspection",
    percentage: "5-8%",
    description: "Required in most jurisdictions for new driveway or expansion",
  },
];

// ========================================================================
// FAQ
// ========================================================================

export const concreteDrivewayFaqs = [
  {
    question: "How much does a concrete driveway cost per square foot?",
    answer:
      "A standard broom-finish concrete driveway costs $4-$8 per square foot installed. Integral colored concrete runs $6-$12/sq ft. Stamped decorative concrete (mimicking stone or brick) costs $8-$15/sq ft. For a typical 2-car driveway (1,000 sq ft), expect $4,000-$8,000 for standard, $6,000-$12,000 for colored, or $8,000-$15,000 for stamped. Prices from HomeAdvisor and Angi 2026 data.",
  },
  {
    question: "How much concrete do I need for my driveway?",
    answer:
      "Calculate cubic yards by multiplying driveway area (sq ft) by thickness (inches), dividing by 12 to get cubic feet, then dividing by 27 to get cubic yards. Example: 1,000 sq ft × 4 inches ÷ 12 ÷ 27 = 12.3 cubic yards. Always order 10% extra for waste — so 13.5 yards for this example. Ready-mix suppliers sell by the yard with a 1-yard minimum. The calculator above does this automatically.",
  },
  {
    question: "How thick should a concrete driveway be?",
    answer:
      "4 inches is the standard for passenger cars and light SUVs in moderate climates. Choose 5 inches if you have heavier vehicles (full-size trucks, SUVs) or live in a cold climate with freeze-thaw cycles. 6 inches is needed for RVs, commercial vehicles, or heavy equipment. Going below 4 inches voids most warranties and guarantees cracking within 5 years. Adding wire mesh or rebar reinforcement is recommended regardless of thickness.",
  },
  {
    question: "How long does a concrete driveway last?",
    answer:
      "A properly installed concrete driveway lasts 30-50 years. Stamped concrete lasts 25-40 years (the sealant needs reapplication every 2-3 years). Lifespan depends on: (1) base preparation (4-6 inches of compacted gravel), (2) concrete mix design (correct PSI for climate), (3) reinforcement (wire mesh or rebar), (4) joint spacing (control joints every 10 feet), (5) sealing (every 2-5 years). Poor installation can cause cracking within 2-5 years.",
  },
  {
    question: "Should I choose concrete or asphalt for my driveway?",
    answer:
      "Concrete costs 2-3x more upfront ($4-$15/sq ft vs $2-$5 for asphalt) but lasts 2x longer (30-50 years vs 15-20). Concrete requires less maintenance (seal every 2-5 years vs every 2-3 for asphalt). Concrete handles heat better (stays cooler in summer, doesn't get sticky). Asphalt handles salt better for snow removal. In cold climates with heavy snow, asphalt may be more practical. In warm climates, concrete is the clear winner. Resale value: concrete adds more home value.",
  },
  {
    question: "How much does it cost to remove an old concrete driveway?",
    answer:
      "Removing an existing concrete driveway costs $2-$4 per square foot, including break-up, hauling, and disposal. For a 1,000 sq ft driveway, that's $2,000-$4,000 added to the new installation cost. Jackhammer rental ($50-$100/day) makes DIY possible but is extremely labor-intensive. Most contractors include tear-off as a separate line item — budget for it explicitly. Asphalt tear-off is cheaper ($1-$3/sq ft) because it's softer.",
  },
  {
    question: "When should I seal a new concrete driveway?",
    answer:
      "Wait 28-30 days after pouring before the first sealcoat — concrete needs to fully cure and release moisture. Apply a penetrating silane/siloxane sealer ($0.25-$0.50/sq ft) for invisible protection, or an acrylic film-forming sealer ($0.30-$0.75/sq ft) for a wet-look finish. Reseal every 2-5 years depending on traffic and climate (cold climates with de-icing salts need sealing every 2 years). Skip sealing and you'll see surface scaling, hairline cracks, and stain absorption within 3-5 years. Best temperature for sealing: 50-80°F with no rain forecast for 24 hours.",
  },
  {
    question: "How to fix cracks in a concrete driveway?",
    answer:
      "For hairline cracks (under 1/4 inch wide): clean with a wire brush, fill with liquid crack filler ($8-$15 per bottle). For cracks 1/4 to 1/2 inch: use polyurethane caulk ($6-$12 per 10 oz tube) or epoxy paste — backer rod first for deep cracks. For cracks over 1/2 inch or with height difference (heaving): call a pro — this signals subbase failure and needs mudjacking ($500-$1,500) or full panel replacement ($300-$800 per panel). Always fix cracks before sealing — sealing over cracks traps moisture and accelerates damage. DIY patching typically lasts 1-3 years; professional epoxy injection lasts 10+ years.",
  },
];
