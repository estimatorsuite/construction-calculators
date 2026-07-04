// lib/calculators/kitchen-remodel-data.ts
// Kitchen Remodel Cost Calculator
// 数据来源：HomeAdvisor 2026, Angi 2026, NKBA 2026 Kitchen Trends
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type KitchenType = "galley" | "lShape" | "uShape" | "openPlan";
export type RemodelTier = "budget" | "standard" | "premium" | "luxury";

export interface KitchenRemodelState {
  kitchenType: KitchenType;
  tier: RemodelTier;
  changeLayout: boolean;
}

export interface KitchenRemodelResult {
  estimatedSqFt: number;
  baseCostLow: number;
  baseCostHigh: number;
  layoutChangeCost: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
  timelineWeeks: string;
}

// ========================================================================
// 厨房类型（按面积分档）
// 来源：NKBA 2026 Kitchen Design Standards + Angi 2026 Kitchen Remodel Cost
// ========================================================================

export const KITCHEN_TYPES: Record<KitchenType, {
  label: string;
  sqft: number;
  description: string;
}> = {
  galley: { label: "Galley Kitchen", sqft: 60, description: "Narrow corridor kitchen, parallel counters" },
  lShape: { label: "L-Shaped Kitchen", sqft: 100, description: "L-shaped counters, common in apartments" },
  uShape: { label: "U-Shaped Kitchen", sqft: 120, description: "U-shaped, typical suburban kitchen" },
  openPlan: { label: "Open Plan with Island", sqft: 200, description: "Open concept with island, large home" },
};

// ========================================================================
// 装修档次定价（2026 USD / sq ft）
// 来源：HomeAdvisor 2026 Kitchen Remodel + Angi 2026 Kitchen Cost Guide
// ========================================================================

export const TIER_PRICING: Record<RemodelTier, {
  label: string;
  perSqFtLow: number;
  perSqFtHigh: number;
  description: string;
}> = {
  budget: {
    label: "Budget",
    perSqFtLow: 100,
    perSqFtHigh: 200,
    description: "Big-box cabinets, laminate counters, basic appliances",
  },
  standard: {
    label: "Standard",
    perSqFtLow: 200,
    perSqFtHigh: 350,
    description: "Semi-custom cabinets, granite/quartz, mid-range appliances",
  },
  premium: {
    label: "Premium",
    perSqFtLow: 350,
    perSqFtHigh: 500,
    description: "Custom cabinets, stone counters, high-end appliances",
  },
  luxury: {
    label: "Luxury",
    perSqFtLow: 500,
    perSqFtHigh: 800,
    description: "Designer everything, built-in appliances, smart tech",
  },
};

// 移动管道/墙体的额外成本乘数
const LAYOUT_CHANGE_MULTIPLIER = 1.25;

// 工期估计
const TIMELINES: Record<KitchenType, string> = {
  galley: "3-5 weeks",
  lShape: "4-6 weeks",
  uShape: "5-8 weeks",
  openPlan: "8-12 weeks",
};

// ========================================================================
// 计算函数
// 公式：sqft × tier_price × (layout_change ? 1.25 : 1.0)
// ========================================================================

export function calculateKitchenRemodel(state: KitchenRemodelState): KitchenRemodelResult | null {
  const kitchenType = KITCHEN_TYPES[state.kitchenType];
  const tier = TIER_PRICING[state.tier];
  const sqft = kitchenType.sqft;

  const baseLow = sqft * tier.perSqFtLow;
  const baseHigh = sqft * tier.perSqFtHigh;
  const layoutCost = state.changeLayout ? Math.round((baseHigh - baseLow) * 0.5) : 0;
  const multiplier = state.changeLayout ? LAYOUT_CHANGE_MULTIPLIER : 1.0;

  const totalLow = Math.round(baseLow * multiplier);
  const totalHigh = Math.round(baseHigh * multiplier);

  return {
    estimatedSqFt: sqft,
    baseCostLow: Math.round(baseLow),
    baseCostHigh: Math.round(baseHigh),
    layoutChangeCost: layoutCost,
    totalCostLow: totalLow,
    totalCostHigh: totalHigh,
    costPerSqFtLow: tier.perSqFtLow,
    costPerSqFtHigh: tier.perSqFtHigh,
    timelineWeeks: TIMELINES[state.kitchenType],
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): KitchenRemodelState {
  return { kitchenType: "uShape", tier: "standard", changeLayout: false };
}

// ========================================================================
// 成本拆解（用于 Cost Breakdown Table）
// 来源：NKBA 2026 Cost Breakdown Study + HomeAdvisor contractor survey
// ========================================================================

export const COST_BREAKDOWN = [
  {
    component: "Cabinets & hardware",
    percentage: "30-35%",
    description: "Stock $2,000-$8,000, semi-custom $8,000-$20,000, custom $20,000-$50,000+",
  },
  {
    component: "Labor (GC + trades)",
    percentage: "20-25%",
    description: "Carpenter, plumber, electrician, tile setter, painter",
  },
  {
    component: "Appliances",
    percentage: "15-20%",
    description: "Refrigerator, range, dishwasher, microwave, range hood",
  },
  {
    component: "Countertops",
    percentage: "10-15%",
    description: "Laminate $30/sq ft, quartz $50-$100, marble $100-$200",
  },
  {
    component: "Flooring & lighting",
    percentage: "5-10%",
    description: "Tile/LVP flooring + under-cabinet and recessed lighting",
  },
  {
    component: "Plumbing & electrical",
    percentage: "5-10%",
    description: "Sink/faucet install, new circuits, panel upgrades if needed",
  },
];

// ========================================================================
// FAQ — 6+ 个，真实问题句式
// ========================================================================

export const kitchenRemodelFaqs = [
  {
    question: "How much does a kitchen remodel cost per square foot?",
    answer:
      "Kitchen remodels cost $100-$800 per square foot in 2026, depending on quality tier. Budget remodels (big-box cabinets, laminate counters, basic appliances) run $100-$200/sq ft. Standard remodels (semi-custom cabinets, granite or quartz, mid-range appliances) cost $200-$350/sq ft. Premium kitchens with custom cabinetry and stone counters run $350-$500/sq ft. Luxury kitchens with designer finishes and built-in smart appliances exceed $500-$800/sq ft. The average US kitchen remodel costs $150-$300/sq ft, or $15,000-$40,000 total for a typical 120 sq ft kitchen.",
  },
  {
    question: "How long does a kitchen remodel take?",
    answer:
      "Kitchen remodels take 3-12 weeks depending on scope. Galley kitchens: 3-5 weeks. L-shaped: 4-6 weeks. U-shaped suburban kitchen: 5-8 weeks. Open plan with island: 8-12 weeks. The timeline includes demolition (2-3 days), rough plumbing/electrical (5-7 days), inspection wait (3-5 days), cabinet install (3-5 days), countertop template + fabrication (1-2 weeks lead time), and finish work (tile, paint, trim, fixtures — 5-7 days). Countertop fabrication is the most common bottleneck: templating cannot happen until cabinets are set, and fabrication takes 7-14 days. Add 20% buffer to any contractor's timeline.",
  },
  {
    question: "What is the most expensive part of a kitchen remodel?",
    answer:
      "Cabinets are the single biggest line item, typically 30-35% of total cost. Stock cabinets cost $2,000-$8,000, semi-custom $8,000-$20,000, and custom cabinetry $20,000-$50,000+. The second biggest cost is labor (20-25%) because kitchens require 5-6 trades: carpenter, plumber, electrician, tile setter, painter, and sometimes HVAC for range hood ducting. Appliances (15-20%) come third — a pro-style range alone can cost $3,000-$10,000. To control cost: keep existing cabinet layout (moving plumbing/gas lines is very expensive), choose semi-custom over custom cabinets, and buy appliances during holiday sales.",
  },
  {
    question: "What is the ROI on a kitchen remodel?",
    answer:
      "A mid-range kitchen remodel recovers 50-60% of cost at resale; an upscale kitchen recovers 40-50% (Remodeling Magazine 2026 Cost vs Value Report). But ROI isn't just resale — updated kitchens are the #1 feature buyers look for and can speed sale by 20-30%. If selling within 2 years, focus on cosmetic refresh (paint, hardware, lighting, new countertops on existing cabinets) for 30-50% of full remodel cost. If staying 5+ years, invest in what you'll enjoy daily. The worst ROI move: over-improving for the neighborhood. A $80,000 kitchen in a $300,000 neighborhood will not appraise.",
  },
  {
    question: "Can I remodel a kitchen myself?",
    answer:
      "Partial DIY is realistic for experienced homeowners. Safe DIY: demolition, painting, cabinet hardware swap, backsplash tile (with practice), and finish trim. Do NOT DIY: plumbing (requires licensed pro and permits in most jurisdictions), electrical (new circuits need permit + inspection), gas line work (extreme safety risk), and countertop fabrication (requires pro tools and templating). The typical approach: hire a GC for plumbing/electrical/countertops, do demo/paint/backsplash yourself. This saves 15-25% vs full-contractor but adds 3-5 weeks to timeline and requires you to be on-site daily to coordinate trades.",
  },
  {
    question: "Do I need a permit for a kitchen remodel?",
    answer:
      "Yes, if you're moving plumbing, electrical, gas lines, or load-bearing walls — permits are required in nearly all US jurisdictions. Permit cost: $500-$1,500 for kitchen remodels, typically pulled by your contractor (never by the homeowner unless you're DIYing). The permit covers plumbing rough-in, electrical rough-in, and any structural changes. If you're only doing cosmetic work (cabinet swap, paint, countertops, backsplash), most areas don't require a permit — but always check with your local building department. Skipping required permits creates problems at resale and can void homeowner insurance if a non-permitted fire or flood occurs.",
  },
  {
    question: "Can I remodel a kitchen for $10,000?",
    answer:
      "Yes, but only with a 'facelift' remodel — keeping existing cabinets, layout, and all plumbing/electrical. Budget breakdown for $10,000: cabinet refacing ($3,000-$5,000, new doors/drawer fronts/hardware on existing boxes), laminate or entry-level quartz countertops ($1,500-$2,500), mid-range appliances (suite of range/fridge/dishwasher, $2,500-$3,500 during holiday sales), backsplash tile DIY ($300-$500), paint ($150), and sink/faucet ($300-$500). Requires: DIY demo, painting, backsplash, and fixture install. Hire pros for: countertop templation/install (included in price) and appliance delivery/install (often free at $2,500+). This saves 50-60% vs a full $25,000-$40,000 remodel.",
  },
  {
    question: "What is the kitchen work triangle?",
    answer:
      "The kitchen work triangle is a design principle from the 1950s: the three main work areas (sink, refrigerator, cooktop/range) should form a triangle with total sides between 12 and 26 feet, with no side shorter than 4 feet or longer than 9 feet. No major traffic patterns should cross through the triangle. Purpose: minimize walking between cooking tasks (studies show 30-40% reduction in steps). Modern variations: with islands and open-plan kitchens, designers now use 'work zones' (prep zone, cooking zone, cleanup zone), but the triangle principle still applies within the primary zone. Violating it (e.g., refrigerator across the room from the sink) creates daily annoyance for decades.",
  },
];
