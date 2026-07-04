// lib/calculators/concrete-data.ts
// Concrete Calculator — 数据层
// 数据来源：Angi 2026, HomeAdvisor 2026, RSMeans 2026, Quikrete spec sheets
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type ProjectType = "slab" | "footing" | "column" | "wall";

export interface ConcreteState {
  lengthFt: number;
  widthFt: number;
  depthInches: number;
  projectType: ProjectType;
}

export interface ConcreteResult {
  cubicFeet: number;
  cubicYards: number;
  bagsNeeded40lb: number;
  bagsNeeded60lb: number;
  bagsNeeded80lb: number;
  materialCostLow: number;
  materialCostHigh: number;
  deliveryCostLow: number;
  deliveryCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// ========================================================================
// 价格与产品规格（2026，USD）
// 来源：HomeAdvisor 2026 Concrete Slab Cost + Angi Concrete Prices + Quikrete
// ========================================================================

export interface ProjectTypeSpec {
  label: string;
  description: string;
  defaultDepth: number;
  notes: string;
}

export const PROJECT_TYPES: Record<ProjectType, ProjectTypeSpec> = {
  slab: {
    label: "Slab / Patio / Driveway",
    description: "Flat horizontal pour. Most common for driveways, patios, shed bases.",
    defaultDepth: 4,
    notes: "4\" residential standard. 5-6\" for heavy vehicles or RVs.",
  },
  footing: {
    label: "Footing (Foundation)",
    description: "Below-grade strip footing that supports walls.",
    defaultDepth: 8,
    notes: "8\" minimum for residential footings (IRC R403). Frost depth varies.",
  },
  column: {
    label: "Column / Pier",
    description: "Vertical support — deck pier, post column.",
    defaultDepth: 12,
    notes: "Typically formed with cardboard tube (Sonotube).",
  },
  wall: {
    label: "Wall (Basement / Retaining)",
    description: "Vertical formed wall — basement, retaining, stem wall.",
    defaultDepth: 8,
    notes: "8\" standard for residential foundation walls.",
  },
};

// Bag yields（来源：Quikrete spec sheet）
export const BAG_YIELD_CU_FT = {
  "40lb": 0.30,
  "60lb": 0.45,
  "80lb": 0.60,
} as const;

// Bag prices（来源：Home Depot / Lowe's 2026 retail avg）
export const BAG_PRICE = {
  "40lb": 3.0,
  "60lb": 4.5,
  "80lb": 5.5,
} as const;

// Ready-mix delivery（来源：Angi 2026 Concrete Delivery Cost）
export const READY_MIX_PER_YARD_LOW = 120;
export const READY_MIX_PER_YARD_HIGH = 200;
export const DELIVERY_FEE_LOW = 50;
export const DELIVERY_FEE_HIGH = 100;
export const MIN_DELIVERY_YARDS = 1;

// Breakpoint（< 1 cu yd → bags, >= 1 cu yd → delivery）
export const BAGS_VS_DELIVERY_BREAKPOINT = 1;

// ========================================================================
// 计算函数
// 公式：cubic feet = length × width × (depth/12)
//       cubic yards = cubic feet / 27
// ========================================================================

export function calculateConcrete(state: ConcreteState): ConcreteResult | null {
  if (state.lengthFt <= 0 || state.widthFt <= 0 || state.depthInches <= 0) return null;

  const depthInFeet = state.depthInches / 12;
  const cubicFeet = state.lengthFt * state.widthFt * depthInFeet;
  const cubicYards = cubicFeet / 27;

  const bagsNeeded40lb = Math.ceil(cubicFeet / BAG_YIELD_CU_FT["40lb"]);
  const bagsNeeded60lb = Math.ceil(cubicFeet / BAG_YIELD_CU_FT["60lb"]);
  const bagsNeeded80lb = Math.ceil(cubicFeet / BAG_YIELD_CU_FT["80lb"]);

  let materialCostLow: number;
  let materialCostHigh: number;
  let deliveryCostLow: number;
  let deliveryCostHigh: number;

  if (cubicYards < BAGS_VS_DELIVERY_BREAKPOINT) {
    // Bags route（用 60lb 做基准）
    materialCostLow = Math.round(bagsNeeded60lb * BAG_PRICE["60lb"]);
    materialCostHigh = Math.round(materialCostLow * 1.2); // 20% regional variation
    deliveryCostLow = 0;
    deliveryCostHigh = 0;
  } else {
    // Ready-mix delivery route
    const yardsDelivered = Math.max(cubicYards, MIN_DELIVERY_YARDS);
    materialCostLow = Math.round(yardsDelivered * READY_MIX_PER_YARD_LOW);
    materialCostHigh = Math.round(yardsDelivered * READY_MIX_PER_YARD_HIGH);
    deliveryCostLow = DELIVERY_FEE_LOW;
    deliveryCostHigh = DELIVERY_FEE_HIGH;
  }

  const totalCostLow = materialCostLow + deliveryCostLow;
  const totalCostHigh = materialCostHigh + deliveryCostHigh;

  return {
    cubicFeet: Math.round(cubicFeet * 10) / 10,
    cubicYards: Math.round(cubicYards * 100) / 100,
    bagsNeeded40lb,
    bagsNeeded60lb,
    bagsNeeded80lb,
    materialCostLow,
    materialCostHigh,
    deliveryCostLow,
    deliveryCostHigh,
    totalCostLow,
    totalCostHigh,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): ConcreteState {
  return {
    lengthFt: 10,
    widthFt: 10,
    depthInches: 4,
    projectType: "slab",
  };
}

// ========================================================================
// 成本拆解数据（用于 Cost Breakdown Table）
// 来源：2026 RSMeans + contractor survey data
// ========================================================================

export interface CostBreakdownRow {
  component: string;
  percentage: string;
  description: string;
}

export const COST_BREAKDOWN: CostBreakdownRow[] = [
  {
    component: "Materials (Concrete)",
    percentage: "40-50%",
    description: "Ready-mix or bagged concrete, delivered to site",
  },
  {
    component: "Labor",
    percentage: "25-35%",
    description: "Formwork, pour, screed, finish, edging, control joints",
  },
  {
    component: "Site Prep",
    percentage: "10-15%",
    description: "Excavation, grading, base material (gravel), forms",
  },
  {
    component: "Finishing & Sealing",
    percentage: "5-10%",
    description: "Broom finish, sealer, curing compound",
  },
  {
    component: "Overhead & Profit",
    percentage: "10-15%",
    description: "Contractor's margin, insurance, equipment depreciation",
  },
];

// ========================================================================
// FAQ — 6 个真实问题
// ========================================================================

export const concreteFaqs = [
  {
    question: "How many bags of concrete do I need?",
    answer:
      "A standard 80-pound bag of concrete yields 0.60 cubic feet. To calculate: divide your total cubic feet by 0.60. For a 4-inch thick 10×10 slab (33.3 cubic feet), you need 56 bags of 80lb concrete. A 60lb bag yields 0.45 cubic feet (74 bags for the same slab), and a 40lb bag yields 0.30 cubic feet (111 bags). For pours over 1 cubic yard (27 cubic feet), ready-mix delivery is almost always cheaper than bags.",
  },
  {
    question: "What is the formula for cubic yards of concrete?",
    answer:
      "Cubic yards = (length in feet × width in feet × depth in feet) ÷ 27. Example: a 10×10 slab that is 4 inches thick (0.333 feet) = 33.3 cubic feet ÷ 27 = 1.23 cubic yards. Always round up and add 5-10% waste factor. Most ready-mix suppliers have a 1-yard minimum delivery, so for anything under 1 yard consider bags instead.",
  },
  {
    question: "Should I use bags or ready-mix delivery?",
    answer:
      "For pours under 1 cubic yard (27 cubic feet), bags are usually more cost-effective once you factor in delivery fees. A 1-yard delivery costs $170-$300 including the delivery fee, while 45 bags of 80lb concrete ($248) covers the same volume with no minimum. For pours over 1 cubic yard, ready-mix wins — a 5-yard delivery runs $650-$1,100 vs. $1,400+ in bags, and you avoid mixing 225 bags by hand or mixer.",
  },
  {
    question: "How much does concrete cost per cubic yard?",
    answer:
      "Ready-mix concrete costs $120-$200 per cubic yard delivered, with a $50-$100 delivery fee on top. The national average is about $150/yard. Prices vary by region (Northeast and West Coast run 20-30% higher), mix design (5,000 PSI costs more than 3,000 PSI), and additives (fibermesh, accelerator, color). Short loads (under 5 yards) often carry a $50-$100 short-load fee.",
  },
  {
    question: "How thick should a concrete driveway be?",
    answer:
      "Residential concrete driveways should be 4 inches thick minimum for standard passenger vehicles. Use 5-6 inches for heavy vehicles, RVs, or trucks. Building code (IRC R403) requires a minimum 3.5 inches, but 4 inches is the industry standard because it resists cracking under vehicle weight. Add rebar (#3 or #4 at 24\" spacing) or fibermesh for crack control on any slab thicker than 4 inches.",
  },
  {
    question: "How long does concrete take to cure?",
    answer:
      "Concrete reaches 50% strength in 1-2 days, 70% in 7 days, and full design strength at 28 days. You can walk on it after 24-48 hours and drive on it after 7 days. Keep it moist (cure with water or curing compound) for the first 7 days — this prevents surface cracking and can increase final strength by up to 50%. Cold weather (below 40°F) doubles cure time; use insulated blankets or accelerator additive.",
  },
  {
    question: "Can I pour concrete in cold weather (below 40°F)?",
    answer:
      "Yes, but with precautions. Concrete must maintain a minimum temperature of 50°F during the first 48 hours for proper curing. In cold weather: (1) Use hot water in the mix and request accelerating admixtures ($10-$20/cu yd). (2) Cover fresh concrete with insulating blankets or straw immediately after finishing. (3) Do not pour on frozen ground — thaw the subbase first or the concrete will heave. (4) Wait at least 7 days before removing blankets. Pouring below 32°F without protection will result in concrete that never reaches design strength and fails within 1-2 years.",
  },
  {
    question: "How to prevent cracks in concrete slabs?",
    answer:
      "Concrete cracking is natural (it will crack eventually), but you can control WHERE it cracks: (1) Install control joints every 10 feet (or 2-3 times the slab thickness in feet). These create weak points where cracks form below the surface. (2) Use reinforcement: #3 rebar at 24\" spacing or 6\"×6\" wire mesh for slabs 4\"+. (3) Proper base: 4-6 inches of compacted gravel prevents settling cracks. (4) Don't add excess water to the mix — a drier mix (slump 3-4\") is stronger. (5) Cure properly: keep moist for 7 days. These steps prevent 90% of random cracking.",
  },
];
