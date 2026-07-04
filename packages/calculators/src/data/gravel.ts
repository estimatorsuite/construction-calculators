// lib/calculators/gravel-data.ts
// Gravel Calculator — 数据层
// 数据来源：HomeAdvisor 2026, Angi 2026, Home Depot bulk gravel pricing
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type GravelType = "crushedStone" | "peaGravel" | "riverRock" | "limestone" | "decomposedGranite" | "slag";

export interface GravelState {
  areaSqFt: number;
  depthInches: number;
  gravelType: GravelType;
}

export interface GravelResult {
  cubicYardsNeeded: number;
  tonsNeeded: number;
  bagsNeeded05CuFt: number;
  materialCostLow: number;
  materialCostHigh: number;
  deliveryCost: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// ========================================================================
// 价格数据（2026，USD）
// 来源：HomeAdvisor 2026 Gravel Prices + Angi 2026 Driveway Gravel Cost
// ========================================================================

export interface GravelPrice {
  label: string;
  description: string;
  costLowPerTon: number;
  costHighPerTon: number;
  bestUse: string;
}

export const GRAVEL_PRICES: Record<GravelType, GravelPrice> = {
  crushedStone: {
    label: "#57 Crushed Stone",
    description: "#57 crushed stone (3/4\" to 1\"). Most common for driveways and drainage.",
    costLowPerTon: 10,
    costHighPerTon: 50,
    bestUse: "Driveways, drainage, base layer",
  },
  peaGravel: {
    label: "Pea Gravel",
    description: "Small round stones (3/8\"). Smooth, comfortable to walk on.",
    costLowPerTon: 25,
    costHighPerTon: 50,
    bestUse: "Walkways, garden beds, patios",
  },
  riverRock: {
    label: "River Rock",
    description: "Large smooth stones (1\"-3\"). Decorative, premium look.",
    costLowPerTon: 50,
    costHighPerTon: 150,
    bestUse: "Decorative landscaping, dry creek beds",
  },
  limestone: {
    label: "Crushed Limestone",
    description: "Compacts well. Gray-white color. Common driveway base in Midwest.",
    costLowPerTon: 30,
    costHighPerTon: 50,
    bestUse: "Driveways, base material, paths",
  },
  decomposedGranite: {
    label: "Decomposed Granite (DG)",
    description: "Fine granite particles. Packs firm. Golden/reddish color.",
    costLowPerTon: 30,
    costHighPerTon: 70,
    bestUse: "Pathways, xeriscaping, patios",
  },
  slag: {
    label: "Steel Slag",
    description: "Byproduct of steel manufacturing. Compacts extremely hard.",
    costLowPerTon: 20,
    costHighPerTon: 40,
    bestUse: "Driveway base, heavy-duty surfaces",
  },
};

// ========================================================================
// 换算常数
// ========================================================================

export const TONS_PER_CUBIC_YARD = 1.4; // 1 cu yd ≈ 1.4 tons (industry standard)
export const BAG_SIZE_CU_FT = 0.5; // Home Depot 0.5 cu ft bags

// Bulk delivery pricing
export const DELIVERY_FLAT_LOW = 50;
export const DELIVERY_FLAT_HIGH = 100;
export const DELIVERY_PER_TON_LOW = 5;
export const DELIVERY_PER_TON_HIGH = 10;
export const BULK_DELIVERY_THRESHOLD_TONS = 2;

// ========================================================================
// 计算函数
// 公式：cubic feet = area × (depth/12), cubic yards = cubic feet / 27
//       tons = cubic yards × 1.4
// ========================================================================

export function calculateGravel(state: GravelState): GravelResult | null {
  if (state.areaSqFt <= 0 || state.depthInches <= 0) return null;

  const cubicFeetNeeded = (state.areaSqFt * state.depthInches) / 12;
  const cubicYardsNeeded = Math.ceil((cubicFeetNeeded / 27) * 10) / 10;
  const cubicYardsRounded = Math.ceil(cubicYardsNeeded);

  const tonsNeeded = Math.ceil(cubicYardsRounded * TONS_PER_CUBIC_YARD * 10) / 10;
  const tonsRounded = Math.ceil(tonsNeeded);

  const bagsNeeded05CuFt = Math.ceil(cubicFeetNeeded / BAG_SIZE_CU_FT);

  const price = GRAVEL_PRICES[state.gravelType];

  // Material cost (per ton)
  const materialCostLow = Math.round(tonsRounded * price.costLowPerTon);
  const materialCostHigh = Math.round(tonsRounded * price.costHighPerTon);

  // Delivery fee: flat for small orders, per-ton for bulk
  const needsBulkDelivery = tonsNeeded >= BULK_DELIVERY_THRESHOLD_TONS;
  const deliveryCost = needsBulkDelivery
    ? Math.round(tonsRounded * DELIVERY_PER_TON_LOW)
    : DELIVERY_FLAT_LOW;
  const deliveryCostHigh = needsBulkDelivery
    ? Math.round(tonsRounded * DELIVERY_PER_TON_HIGH)
    : DELIVERY_FLAT_HIGH;

  const totalCostLow = materialCostLow + deliveryCost;
  const totalCostHigh = materialCostHigh + deliveryCostHigh;

  return {
    cubicYardsNeeded,
    tonsNeeded,
    bagsNeeded05CuFt,
    materialCostLow,
    materialCostHigh,
    deliveryCost,
    totalCostLow,
    totalCostHigh,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): GravelState {
  return {
    areaSqFt: 500,
    depthInches: 3,
    gravelType: "crushedStone",
  };
}

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
    component: "Gravel Material",
    percentage: "55-65%",
    description: "Bulk gravel priced per ton at quarry or landscape supply",
  },
  {
    component: "Delivery",
    percentage: "15-25%",
    description: "Dump truck or trailer delivery — $5-$10/ton for bulk, $50-$100 flat for small loads",
  },
  {
    component: "Site Prep & Edging",
    percentage: "10-15%",
    description: "Excavation, weed barrier fabric, steel/brick edging to contain gravel",
  },
  {
    component: "Labor (spreading)",
    percentage: "10-15%",
    description: "Spreading, leveling, compacting — DIY or $40-$75/hour landscaper",
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
  { region: "Midwest", multiplier: 1.0, notes: "Baseline — limestone quarries abundant, low transport" },
  { region: "Southeast", multiplier: 1.05, notes: "Granite quarries common, moderate transport" },
  { region: "Southwest", multiplier: 1.15, notes: "DG locally available, river rock imported" },
  { region: "Northeast", multiplier: 1.2, notes: "Higher labor, crushed stone from local quarries" },
  { region: "West Coast", multiplier: 1.3, notes: "Highest transport, strict mining regulations" },
];

// ========================================================================
// Red Flag 警告
// ========================================================================

export const RED_FLAGS = [
  "Quotes below $10/ton for crushed stone — likely fill dirt or recycled concrete, not clean gravel",
  "Driveway installed without compacted base layer — will rut and shift within one season",
  "No weed barrier fabric installed under decorative gravel — weeds will dominate within months",
  "Pea gravel used for driveways — round stones shift and rut under vehicle weight",
  "Depth under 2 inches for driveways — insufficient for load bearing, will need replenishment",
];

// ========================================================================
// FAQ
// ========================================================================

export const gravelFaqs = [
  {
    question: "How much gravel do I need for my driveway or path?",
    answer:
      "Measure length × width in feet to get square footage, then multiply by depth in feet (divide inches by 12). This gives cubic feet. Divide by 27 to get cubic yards, then multiply by 1.4 to convert to tons. For a 12'x50' driveway (600 sq ft) at 4\" deep: 600 × (4/12) = 200 cubic feet = 7.4 cubic yards = 10.4 tons. Use the calculator above to get exact numbers instantly.",
  },
  {
    question: "Why do gravel suppliers quote in tons instead of cubic yards?",
    answer:
      "Quarries sell by weight (tons) because volume shrinks when gravel is wet or compacted. A cubic yard of dry loose gravel weighs about 2,800 lbs (1.4 tons), but a cubic yard of wet compacted gravel weighs 3,000+ lbs. Buying by ton ensures you get exactly what you pay for. When ordering, convert: 1 cubic yard ≈ 1.4 tons. For delivery, trucks typically carry 10-20 tons per load.",
  },
  {
    question: "How much does gravel cost per ton delivered?",
    answer:
      "Delivered gravel costs $15-$160 per ton depending on type and distance. Crushed stone (#57) is $10-$50/ton plus delivery. Pea gravel is $25-$50/ton. Limestone is $30-$50/ton. River rock is $50-$150/ton. Delivery adds $5-$10/ton for bulk orders (2+ tons) or a flat $50-$100 for smaller loads. Quarry-direct pickup avoids delivery fees but requires a truck capable of hauling 1+ tons.",
  },
  {
    question: "How deep should gravel be for a driveway?",
    answer:
      "A proper gravel driveway needs 4-6 inches total depth in two layers. Start with a 2-3\" base of larger crushed stone (#3 or #57), compacted. Top with a 2-3\" surface layer of smaller crushed stone or limestone fines. A single 2\" layer will rut under vehicle weight and need annual replenishment. For walkways, 2-3\" is sufficient. For decorative beds, 2\" covers weed barrier adequately.",
  },
  {
    question: "Bags vs bulk delivery — which should I buy?",
    answer:
      "Bulk is cheaper for anything over 1 cubic yard. Home Depot 0.5 cu ft bags cost $4-$7 each, which works out to $216-$378 per cubic yard — 5-10x the bulk price. For a 100 sq ft garden bed at 2\" deep (0.6 cubic yards), you'd need 33 bags at $130-$230 total. Bulk delivered for the same job: $25-$50 in material plus $50 delivery. Break-even is around 20 bags (1 cubic yard).",
  },
  {
    question: "What are the different types of gravel and what are they used for?",
    answer:
      "Crushed stone (#57) is the all-purpose choice for driveways and drainage at $10-$50/ton. Pea gravel (round stones) is for walkways and garden beds but shifts under weight. Limestone compacts hard, ideal for driveway bases. River rock is decorative only — large, smooth, expensive ($50-$150/ton). Decomposed granite (DG) packs firm for pathways. Slag is a budget driveway base that compacts extremely hard. Choose based on use: structural (crushed/limestone/slag) vs decorative (pea/river/DG).",
  },
  {
    question: "Does gravel attract pests or weeds?",
    answer:
      "Gravel itself doesn't attract pests — in fact, it deters some insects better than organic mulch (no moisture retention for nesting). However, weeds will grow through gravel over time as wind-blown seeds settle between stones. Solutions: (1) Install landscape fabric under gravel (not plastic — it blocks water). (2) Apply pre-emergent herbicide in spring. (3) Use larger stones (3/4\"+) which are harder for seeds to germinate in. Avoid pea gravel near foundations — it can harbor ants and allows water to pool.",
  },
  {
    question: "How to keep gravel from spreading into the lawn?",
    answer:
      "Three solutions: (1) Steel or aluminum landscape edging ($3-$8/linear ft) — buried 2-3 inches deep, creates a physical barrier. (2) Trench edging — dig a 4-inch V-trench along the gravel edge; gravel settles into the trench instead of spreading. Free but needs annual maintenance. (3) Choose angular crushed stone (locks together) over round pea gravel (rolls everywhere). Adding a stabilizer grid (TrueGrid, $4-$6/sq ft) under the gravel permanently prevents migration for driveway applications.",
  },
];
