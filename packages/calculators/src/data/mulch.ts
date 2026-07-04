// lib/calculators/mulch-data.ts
// Mulch Calculator — 数据层
// 数据来源：HomeAdvisor 2026, Angi 2026, Home Depot bulk mulch pricing
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type MulchType = "bark" | "woodChips" | "cedar" | "dyedMulch" | "rubberMulch" | "compost";

export interface MulchState {
  areaSqFt: number;
  depthInches: number;
  mulchType: MulchType;
}

export interface MulchResult {
  cubicYardsNeeded: number;
  cubicFeetNeeded: number;
  bagsNeeded2CuFt: number;
  bagsNeeded3CuFt: number;
  materialCostLow: number;
  materialCostHigh: number;
  deliveryCost: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// ========================================================================
// 价格数据（2026，USD）
// 来源：HomeAdvisor 2026 Mulch Prices + Angi 2026 Landscaping Cost
// ========================================================================

export interface MulchPrice {
  label: string;
  description: string;
  costLowPerCuYd: number;
  costHighPerCuYd: number;
  lifespanYears: string;
}

export const MULCH_PRICES: Record<MulchType, MulchPrice> = {
  bark: {
    label: "Shredded Hardwood Bark",
    description: "Shredded hardwood bark. Most common. Dark brown, breaks down into soil.",
    costLowPerCuYd: 30,
    costHighPerCuYd: 50,
    lifespanYears: "1-3 years",
  },
  woodChips: {
    label: "Wood Chips",
    description: "Pine or mixed wood chips. Larger pieces, slower decomposition.",
    costLowPerCuYd: 25,
    costHighPerCuYd: 40,
    lifespanYears: "2-4 years",
  },
  cedar: {
    label: "Cedar Mulch",
    description: "Aromatic, rot-resistant. Natural insect repellent. Premium look.",
    costLowPerCuYd: 40,
    costHighPerCuYd: 70,
    lifespanYears: "2-4 years",
  },
  dyedMulch: {
    label: "Dyed Mulch (Red/Brown/Black)",
    description: "Color-enhanced wood. Holds color longer. Red, brown, or black.",
    costLowPerCuYd: 35,
    costHighPerCuYd: 55,
    lifespanYears: "1-2 years",
  },
  rubberMulch: {
    label: "Rubber Mulch",
    description: "Made from recycled tires. Permanent. Does not decompose. 10+ year lifespan.",
    costLowPerCuYd: 80,
    costHighPerCuYd: 150,
    lifespanYears: "10+ years",
  },
  compost: {
    label: "Compost",
    description: "Organic soil amendment. Adds nutrients. Breaks down quickly.",
    costLowPerCuYd: 30,
    costHighPerCuYd: 50,
    lifespanYears: "0.5-1 year",
  },
};

// ========================================================================
// 袋装规格
// 来源：Home Depot / Lowe's 2026 retail pricing
// ========================================================================

export const BAG_2CUFT_PRICE_LOW = 5;
export const BAG_2CUFT_PRICE_HIGH = 8;
export const BAG_3CUFT_PRICE_LOW = 8;
export const BAG_3CUFT_PRICE_HIGH = 12;

// Bulk delivery threshold (5+ cubic yards triggers delivery fee)
export const BULK_DELIVERY_THRESHOLD = 5;
export const DELIVERY_COST_LOW = 50;
export const DELIVERY_COST_HIGH = 150;

// ========================================================================
// 计算函数
// 公式：cubic feet = area × (depth/12), cubic yards = cubic feet / 27
// ========================================================================

export function calculateMulch(state: MulchState): MulchResult | null {
  if (state.areaSqFt <= 0 || state.depthInches <= 0) return null;

  const cubicFeetNeeded = (state.areaSqFt * state.depthInches) / 12;
  const cubicYardsNeeded = Math.ceil((cubicFeetNeeded / 27) * 10) / 10;
  const cubicYardsRounded = Math.ceil(cubicYardsNeeded);

  const bagsNeeded2CuFt = Math.ceil(cubicFeetNeeded / 2);
  const bagsNeeded3CuFt = Math.ceil(cubicFeetNeeded / 3);

  const price = MULCH_PRICES[state.mulchType];

  // Bulk material cost (per cubic yard)
  const materialCostLow = Math.round(cubicYardsRounded * price.costLowPerCuYd);
  const materialCostHigh = Math.round(cubicYardsRounded * price.costHighPerCuYd);

  // Delivery fee applies for bulk orders
  const needsDelivery = cubicYardsNeeded >= BULK_DELIVERY_THRESHOLD;
  const deliveryCost = needsDelivery ? DELIVERY_COST_LOW : 0;

  const totalCostLow = materialCostLow + deliveryCost;
  const totalCostHigh = materialCostHigh + (needsDelivery ? DELIVERY_COST_HIGH : 0);

  return {
    cubicYardsNeeded,
    cubicFeetNeeded: Math.ceil(cubicFeetNeeded),
    bagsNeeded2CuFt,
    bagsNeeded3CuFt,
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

export function getDefaultState(): MulchState {
  return {
    areaSqFt: 500,
    depthInches: 3,
    mulchType: "bark",
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
    component: "Mulch Material",
    percentage: "60-70%",
    description: "Bulk mulch by cubic yard, or bagged mulch at retail price",
  },
  {
    component: "Delivery",
    percentage: "10-15%",
    description: "Dump truck delivery for bulk orders (5+ cubic yards)",
  },
  {
    component: "Labor (if hired)",
    percentage: "20-30%",
    description: "Spreading, edging, cleanup — $40-$75/hour landscaper rate",
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
  { region: "Midwest", multiplier: 1.0, notes: "Baseline (national average)" },
  { region: "Southeast", multiplier: 0.95, notes: "Lower labor, abundant pine mulch" },
  { region: "Southwest", multiplier: 1.1, notes: "Higher transport costs, less local supply" },
  { region: "Northeast", multiplier: 1.2, notes: "Higher labor, hardwood bark abundant" },
  { region: "West Coast", multiplier: 1.35, notes: "Highest costs, strict environmental rules" },
];

// ========================================================================
// Red Flag 警告
// ========================================================================

export const RED_FLAGS = [
  "Quotes significantly below $25/cubic yard for bark mulch — likely inferior or dyed wood filler",
  "Contractor pushing dyed mulch without mentioning color bleed on concrete and light surfaces",
  "No delivery included on 5+ cubic yard orders — you will pay retail bag prices instead",
  "Depth less than 2 inches — will not suppress weeds effectively",
  "Depth over 4 inches — can suffocate plant roots and trap moisture against stems",
];

// ========================================================================
// FAQ
// ========================================================================

export const mulchFaqs = [
  {
    question: "How much mulch do I need for my garden bed?",
    answer:
      "Measure the length and width of your garden bed in feet, multiply to get square footage, then decide on depth. At 3 inches deep, you need 1 cubic yard per 108 square feet. At 2 inches, 1 cubic yard covers 162 square feet. For a 10'x20' bed (200 sq ft) at 3\" deep, you need about 2 cubic yards or 27 bags (2 cu ft each). Use the calculator above to get exact numbers for your specific area.",
  },
  {
    question: "How deep should mulch be applied?",
    answer:
      "Apply mulch 2-3 inches deep for most garden beds. Going below 2 inches won't suppress weeds effectively. Going above 4 inches can suffocate plant roots, trap moisture against stems causing rot, and prevent water from reaching the soil. Around trees, keep mulch 3-6 inches away from the trunk to prevent bark rot. For playgrounds or paths, you may want 4-6 inches for cushioning, but that's a different application.",
  },
  {
    question: "Is it cheaper to buy mulch in bags or bulk?",
    answer:
      "Bulk is significantly cheaper for jobs over 2 cubic yards. Bagged mulch at Home Depot costs about $5-$8 per 2 cu ft bag, which works out to $67-$108 per cubic yard. Bulk delivered mulch costs $25-$50 per cubic yard plus a $50-$150 delivery fee. Break-even is around 3 cubic yards. For small jobs (under 2 cu yd), bags are more convenient. For anything larger, bulk delivery saves 30-50%.",
  },
  {
    question: "How much does mulch cost per cubic yard?",
    answer:
      "Bulk mulch costs $25-$150 per cubic yard depending on type. Shredded hardwood bark is $30-$50/cu yd (most common). Wood chips run $25-$40. Cedar is $40-$70. Dyed mulch is $35-$55. Compost costs $30-$50. Rubber mulch is the most expensive at $80-$150 but lasts 10+ years. Delivery adds $50-$150 flat fee for orders under 10 cubic yards.",
  },
  {
    question: "Rubber mulch vs organic mulch — which is better?",
    answer:
      "Rubber mulch costs 2-3x more upfront ($80-$150/cu yd vs $30-$50 for bark) but lasts 10+ years without replacement, while organic mulch needs replacing every 1-3 years. Rubber mulch doesn't add nutrients to soil, doesn't decompose, and can retain too much heat in sunny areas. For playgrounds, rubber is safer (better fall cushioning). For garden beds and trees, organic mulch is better because it improves soil structure as it breaks down.",
  },
  {
    question: "How long does mulch last before needing replacement?",
    answer:
      "Organic mulch lasts 1-3 years depending on type and climate. Shredded hardwood bark breaks down in 1-2 years in humid climates. Wood chips last 2-4 years. Cedar lasts 2-4 years. Dyed mulch fades in 1-2 years even though the wood lasts longer. Compost decomposes in 6-12 months. Rubber mulch lasts 10+ years without replacement. In hot, wet climates (Southeast US), expect to refresh mulch annually. In dry climates (Southwest), it lasts 2-3 years.",
  },
  {
    question: "Can old mulch be reused?",
    answer:
      "Yes, if it hasn't fully decomposed. Check by squeezing a handful: if it crumbles like soil, it's decomposed and should be worked into the garden as compost. If it still has fiber structure, rake it to break up matted layers, refresh with 1-2 inches of new mulch on top. Old mulch that has developed a hydrophobic (water-repellent) crust should be removed — it blocks water from reaching plant roots. Fungal growth (artillery fungus) on old mulch can stain house siding; replace if spotted.",
  },
  {
    question: "Mulch vs rock: which is cheaper long-term?",
    answer:
      "Over 10 years, rock is cheaper. Organic mulch costs $30-$50/cu yd and needs replacing every 2-3 years — total 10-year cost: $1,200-$2,000 for a typical 500 sq ft bed. River rock or pea gravel costs $50-$150/ton (one-time install) but needs occasional weeding and leaf removal. 10-year cost: $400-$800. However, rock makes future plant changes difficult (digging through stone is backbreaking), and in hot climates rock radiates heat that can stress plants. Choose mulch for plant health, rock for low maintenance.",
  },
];
