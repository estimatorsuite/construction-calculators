// lib/calculators/landscaping-data.ts
// Landscaping Cost Calculator

export type LandscapeProject = "lawnInstall" | "gardenBed" | "hardscape" | "fullDesign";
export type MaterialTier = "budget" | "standard" | "premium";

export interface LandscapingState {
  areaSqFt: number;
  project: LandscapeProject;
  tier: MaterialTier;
}

export interface LandscapingResult {
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
  timelineWeeks: string;
}

export const PROJECT_TYPES: Record<LandscapeProject, {
  label: string;
  description: string;
  perSqFtLow: number;
  perSqFtHigh: number;
  timeline: string;
}> = {
  lawnInstall: {
    label: "Lawn Installation (Sod/Seed)",
    description: "New lawn via sod or hydroseed. Includes grading and soil prep.",
    perSqFtLow: 1,
    perSqFtHigh: 4,
    timeline: "1-2 weeks",
  },
  gardenBed: {
    label: "Garden Beds & Planting",
    description: "Flower beds, shrubs, trees, mulch. Softscape only.",
    perSqFtLow: 5,
    perSqFtHigh: 15,
    timeline: "2-4 weeks",
  },
  hardscape: {
    label: "Hardscape (Patio/Walkway/Wall)",
    description: "Pavers, stone, retaining walls. Structural elements.",
    perSqFtLow: 10,
    perSqFtHigh: 25,
    timeline: "3-6 weeks",
  },
  fullDesign: {
    label: "Full Landscape Design",
    description: "Complete yard makeover: hardscape + softscape + irrigation + lighting.",
    perSqFtLow: 15,
    perSqFtHigh: 40,
    timeline: "4-12 weeks",
  },
};

export const TIER_INFO: Record<MaterialTier, { label: string; multiplier: number }> = {
  budget: { label: "Budget", multiplier: 0.85 },
  standard: { label: "Standard", multiplier: 1.0 },
  premium: { label: "Premium", multiplier: 1.4 },
};

export function calculateLandscaping(state: LandscapingState): LandscapingResult | null {
  if (state.areaSqFt <= 0) return null;
  const proj = PROJECT_TYPES[state.project];
  const tier = TIER_INFO[state.tier];
  const adjLow = state.areaSqFt * proj.perSqFtLow * tier.multiplier;
  const adjHigh = state.areaSqFt * proj.perSqFtHigh * tier.multiplier;
  return {
    materialCostLow: Math.round(adjLow * 0.45),
    materialCostHigh: Math.round(adjHigh * 0.45),
    laborCostLow: Math.round(adjLow * 0.55),
    laborCostHigh: Math.round(adjHigh * 0.55),
    totalCostLow: Math.round(adjLow),
    totalCostHigh: Math.round(adjHigh),
    costPerSqFtLow: Math.round((adjLow / state.areaSqFt) * 10) / 10,
    costPerSqFtHigh: Math.round((adjHigh / state.areaSqFt) * 10) / 10,
    timelineWeeks: proj.timeline,
  };
}

export function getDefaultState(): LandscapingState {
  return { areaSqFt: 1000, project: "gardenBed", tier: "standard" };
}

export const COST_BREAKDOWN = [
  { component: "Plants & materials", percentage: "35-45%", description: "Sod, plants, trees, mulch, soil, stone, pavers" },
  { component: "Labor (design + install)", percentage: "40-50%", description: "Grading, planting, hardscape install, irrigation" },
  { component: "Equipment rental", percentage: "8-12%", description: "Skid steer, tiller, compactor, trucking" },
  { component: "Design fee (if applicable)", percentage: "5-10%", description: "Landscape architect or designer consultation" },
];

export const landscapingFaqs = [
  {
    question: "How much does landscaping cost per square foot?",
    answer:
      "Landscaping costs $1 to $40 per square foot in 2026, depending on project type. Lawn installation (sod/seed) is cheapest at $1-$4/sq ft. Garden beds run $5-$15/sq ft. Hardscape (patios, walkways, walls) costs $10-$25/sq ft. Full landscape design (complete yard makeover) runs $15-$40/sq ft. A typical 1,000 sq ft front yard landscape project costs $5,000-$15,000 for standard design. Premium materials and mature plants can double the cost.",
  },
  {
    question: "How much does a full landscape design cost?",
    answer:
      "A full landscape design for a typical 1,000-2,000 sq ft yard costs $15,000-$40,000+ in 2026. This includes design consultation ($500-$5,000), hardscape elements (patio/walkway, $5,000-$20,000), softscape (plants/trees/mulch, $3,000-$12,000), irrigation system ($2,000-$5,000), and lighting ($1,000-$4,000). Expect the project to take 4-12 weeks from design to completion. High-end landscapes with mature trees, custom stonework, and water features can exceed $100,000.",
  },
  {
    question: "How much does a new lawn cost?",
    answer:
      "New lawn installation costs $1-$4 per square foot. Sod (pre-grown grass rolls) runs $1-$2/sq ft installed — instant lawn, usable in 2 weeks. Hydroseeding costs $0.10-$0.25/sq ft but takes 4-8 weeks to establish. Seed (DIY) costs $0.05-$0.15/sq ft but takes a full season. A typical 1,000 sq ft lawn runs $1,000-$2,500 with sod, or $100-$250 with hydroseed. Most homeowners choose sod for immediate results despite the higher cost.",
  },
  {
    question: "What increases landscaping cost the most?",
    answer:
      "The biggest cost drivers are: (1) hardscape elements — stone patios and retaining walls cost 3-5x more per sq ft than plants; (2) mature trees — a 15-foot mature tree costs $1,500-$5,000 vs $200 for a sapling; (3) site preparation — grading, demolition, and soil amendment add $1-$3/sq ft; (4) irrigation and lighting systems ($2,000-$5,000 each); (5) designer fees (10-15% of project cost). To save money, phase the project over multiple years and choose smaller plants that will grow.",
  },
  {
    question: "Is landscaping worth the investment?",
    answer:
      "Yes — landscaping returns 100-150% of cost in added home value (ASLA data). A well-designed landscape is one of the few home improvements that appreciates over time (plants grow and mature). Curb appeal landscaping (front yard) has the highest ROI because it affects first impressions and sale speed. Backyard landscaping (patios, outdoor kitchens) adds living space value. Even basic lawn maintenance and clean garden beds increase perceived home value by 5-10%. For resale, invest in front-yard curb appeal first.",
  },
  {
    question: "Should I hire a landscape designer or DIY?",
    answer:
      "For simple projects (lawn install, basic garden beds), DIY is viable if you research plant selection and soil preparation. For anything involving hardscape (patios, walls), irrigation, or complex design, hire a professional. A landscape designer costs $500-$5,000 for plans, but prevents expensive mistakes (wrong plants for climate, poor drainage, structural failures). Many nurseries offer free design consultation with plant purchase — a good middle ground. For projects over $10,000, always use a licensed landscape contractor.",
  },
  {
    question: "How to landscape on a budget?",
    answer:
      "Prioritize three high-impact, low-cost upgrades: (1) fresh mulch ($3-$7/bag, covers 12 sq ft) — instant clean look; (2) define garden bed edges with a spade-cut trench (free DIY) or plastic edging ($1.50/linear ft); (3) plant perennials from 1-gallon containers ($15-$30 each) instead of mature specimens ($150-$500 each) — they'll catch up in 2-3 seasons. Save further with: native plants (lower water/maintenance), local nursery sales in September-October, free wood chips from arborists (ChipDrop app), and split/divide existing perennials. Avoid: hardscape (costs 3-5x per sq ft), mature trees, and designer planters. Budget landscaping adds $2,000-$5,000 resale value.",
  },
  {
    question: "When is the best time of year to plant trees and shrubs?",
    answer:
      "Fall (September-November in most of the US) is the ideal planting season. Cool air reduces transplant shock while warm soil allows root growth until first hard freeze. Spring planting (March-May) is the second choice — plants need 4-6 weeks to establish before summer heat. Avoid planting in peak summer (June-August) unless using container-grown stock with daily irrigation. Bare-root plants should ONLY be planted in early spring before bud break. Evergreens prefer August-September planting so they establish before winter winds. In zones 8-10 (South/Southwest), October-February planting works for most species. Water new plantings weekly for the first year.",
  },
];
