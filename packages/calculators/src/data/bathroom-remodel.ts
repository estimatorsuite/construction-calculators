// lib/calculators/bathroom-remodel-data.ts
// Bathroom Remodel Cost Calculator

export type BathroomType = "powder" | "small" | "standard" | "master";
export type RemodelTier = "budget" | "standard" | "premium" | "luxury";

export interface BathroomRemodelState {
  bathroomType: BathroomType;
  tier: RemodelTier;
  changeLayout: boolean;
}

export interface BathroomRemodelResult {
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

export const BATHROOM_TYPES: Record<BathroomType, {
  label: string;
  sqft: number;
  description: string;
}> = {
  powder: { label: "Powder Room (half bath)", sqft: 18, description: "Toilet + sink only. No shower/tub." },
  small: { label: "Small Full Bath (5'×8')", sqft: 40, description: "Toilet, sink, tub/shower combo." },
  standard: { label: "Standard Full Bath (6'×10')", sqft: 60, description: "Toilet, double vanity, separate tub + shower." },
  master: { label: "Master Bath (10'×12'+)", sqft: 120, description: "Large space. Soaking tub, walk-in shower, double vanity." },
};

// 每 sq ft 价格（2026 HomeAdvisor + Angi）
export const TIER_PRICING: Record<RemodelTier, {
  label: string;
  perSqFtLow: number;
  perSqFtHigh: number;
  description: string;
}> = {
  budget: { label: "Budget", perSqFtLow: 125, perSqFtHigh: 200, description: "Big-box store fixtures, basic tile, stock vanity" },
  standard: { label: "Standard", perSqFtLow: 200, perSqFtHigh: 300, description: "Mid-range fixtures, ceramic tile, semi-custom vanity" },
  premium: { label: "Premium", perSqFtLow: 300, perSqFtHigh: 450, description: "High-end fixtures, natural stone tile, custom cabinetry" },
  luxury: { label: "Luxury", perSqFtLow: 450, perSqFtHigh: 700, description: "Designer fixtures, heated floors, smart technology" },
};

// 移动管道/墙体的额外成本
const LAYOUT_CHANGE_MULTIPLIER = 1.3;

const TIMELINES: Record<BathroomType, string> = {
  powder: "1-2 weeks",
  small: "2-3 weeks",
  standard: "3-5 weeks",
  master: "5-8 weeks",
};

export function calculateBathroomRemodel(state: BathroomRemodelState): BathroomRemodelResult | null {
  const bathType = BATHROOM_TYPES[state.bathroomType];
  const tier = TIER_PRICING[state.tier];
  const sqft = bathType.sqft;
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
    timelineWeeks: TIMELINES[state.bathroomType],
  };
}

export function getDefaultState(): BathroomRemodelState {
  return { bathroomType: "standard", tier: "standard", changeLayout: false };
}

export const COST_BREAKDOWN = [
  { component: "Fixtures (tub, shower, toilet, vanity)", percentage: "30-35%", description: "The biggest line item. Tubs $400-$3,000, vanities $300-$3,000" },
  { component: "Labor (plumbing + electrical + tile)", percentage: "35-45%", description: "Multiple trades: plumber, electrician, tile setter, carpenter" },
  { component: "Materials (tile, drywall, paint)", percentage: "15-20%", description: "Tile $2-$30/sq ft, waterproofing, cement board, grout" },
  { component: "Permits & disposal", percentage: "5-10%", description: "Building permit $200-$800, dumpster rental $300-$600" },
];

export const bathroomRemodelFaqs = [
  {
    question: "How much does a bathroom remodel cost?",
    answer:
      "Bathroom remodels cost $6,000 to $30,000+ in 2026, depending on bathroom size and quality tier. A small full bathroom (40 sq ft) with standard materials runs $8,000-$12,000. A standard full bath (60 sq ft) with premium finishes costs $18,000-$27,000. Master bathrooms (120+ sq ft) with luxury features can exceed $50,000. The average US bathroom remodel costs $11,000-$18,000. Moving plumbing or walls adds 25-30%. Use the calculator above for exact estimates.",
  },
  {
    question: "How much does it cost to remodel a small bathroom?",
    answer:
      "A small full bathroom (5'×8', ~40 sq ft) costs $5,000 to $12,000 to remodel in 2026. Budget remodel (big-box fixtures, basic tile) runs $5,000-$8,000. Standard remodel (mid-range fixtures, ceramic tile) costs $8,000-$12,000. Premium small bath runs $12,000-$18,000. The small size limits material costs but labor stays high because the same trades are needed regardless of size. Powder rooms (half baths) cost $3,000-$8,000 since there's no shower/tub.",
  },
  {
    question: "How much does a master bathroom remodel cost?",
    answer:
      "Master bathroom remodels cost $20,000 to $50,000+ in 2026. The large space (120+ sq ft) allows for separate soaking tub, walk-in shower, double vanity, and water closet. Luxury master baths with heated floors, smart mirrors, and designer fixtures can exceed $80,000. The biggest cost drivers: custom cabinetry ($5,000-$15,000), walk-in shower with frameless glass ($5,000-$15,000), and freestanding tub ($1,500-$5,000). Plan 5-8 weeks for completion.",
  },
  {
    question: "What is the most expensive part of a bathroom remodel?",
    answer:
      "Labor is typically the most expensive component (35-45% of total cost) because bathroom remodels require multiple specialized trades: plumber, electrician, tile setter, and carpenter. Each trade charges $75-$150/hour. The second biggest cost is fixtures (30-35%): a single freestanding tub can cost $1,500-$5,000, a custom vanity runs $1,500-$5,000, and a frameless glass shower enclosure adds $1,500-$4,000. To save money, keep the existing layout (moving plumbing is very expensive) and choose mid-range fixtures instead of designer brands.",
  },
  {
    question: "Is a bathroom remodel worth it for resale?",
    answer:
      "Yes — bathroom remodels have one of the highest ROIs of any home improvement. A mid-range bathroom remodel recovers 60-70% of cost at resale (Remodeling Magazine 2026 Cost vs Value Report). An upscale master bath recovers 50-60%. But the real value is in sale speed: homes with updated bathrooms sell 20-30% faster than those with dated baths. If you're selling within 2 years, focus on cosmetic updates (paint, fixtures, lighting) for 50% of the cost of a full remodel. If staying 5+ years, invest in what you'll enjoy.",
  },
  {
    question: "How long does a bathroom remodel take?",
    answer:
      "Bathroom remodels take 2-8 weeks depending on scope. Powder room: 1-2 weeks. Small full bath: 2-3 weeks. Standard full bath: 3-5 weeks. Master bath: 5-8 weeks. The timeline includes: demolition (2-3 days), rough plumbing/electrical (3-5 days), inspection (1-2 days wait), waterproofing + tile (5-7 days), fixture installation (2-3 days), and final touches (2-3 days). Delays are common due to trade scheduling, material delivery, and inspection wait times. Add 20% buffer to any contractor's timeline estimate.",
  },
  {
    question: "Can I remodel a bathroom myself?",
    answer:
      "Partial DIY is possible for experienced homeowners. You can handle: demolition, painting, and simple fixture swaps. But plumbing and electrical work requires licensed professionals in most jurisdictions (and permits). Tile setting is a skill that takes years to master — DIY tile in wet areas often fails within 2-3 years. The typical DIY approach: hire a GC for plumbing/electrical/tile, do demo/paint/cleanup yourself. This saves 15-25% vs full-contractor but adds 2-4 weeks to the timeline.",
  },
  {
    question: "Can I remodel a bathroom for $5,000?",
    answer:
      "Yes, but only for a small bathroom (5x8 feet or smaller) with cosmetic updates only — no layout changes, no plumbing moves. Budget breakdown for a $5,000 refresh: vanity + sink ($400-$700), toilet ($150-$300), tub or shower surround ($500-$1,200), tile ($300-$600 for DIY install), paint ($75), fixtures/hardware ($150-$250), and permit/inspection ($150-$300). Requires DIY demo, painting, and vanity/toilet swap. Hire a plumber for shower valve swap ($300-$500) and an electrician for any new outlets ($200-$400). Materials from Home Depot/Lowe's, not showrooms. Expect contractor quotes of $10,000-$15,000 for the same scope.",
  },
  {
    question: "What is a wet room and is it worth it?",
    answer:
      "A wet room is a bathroom where the shower area is open (no separate shower pan or curb) and the entire room is waterproofed — the tub sits inside the shower zone. Popular in Europe and high-end hotels, they're gaining traction in US master baths. Cost premium: $3,000-$8,000 above a standard bathroom due to full-room tanking (Schluter Kerdi membrane), linear drains ($400-$1,200), and sloped floors. Worth it for: small bathrooms (eliminates shower door/curb, makes space feel larger), aging-in-place (no step-over), and modern minimalist aesthetics. Not worth it for: resale-focused flips (niche market) or bathrooms with poor ventilation.",
  },
];
