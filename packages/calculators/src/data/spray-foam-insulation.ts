// lib/calculators/spray-foam-insulation-data.ts
// Spray Foam Insulation Cost Calculator
// 数据来源：HomeAdvisor 2026 + Angi 2026 + Homewyse May 2026

export type FoamType = "openCell" | "closedCell";
export type ApplicationArea = "attic" | "walls" | "basement" | "crawlspace";

export interface SprayFoamState {
  areaSqFt: number;
  thicknessInches: number;
  foamType: FoamType;
  area: ApplicationArea;
}

export interface SprayFoamResult {
  boardFeet: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  rValue: number;
}

export const FOAM_TYPES: Record<FoamType, {
  label: string;
  description: string;
  pricePerBoardFtLow: number;
  pricePerBoardFtHigh: number;
  rValuePerInch: number;
  lifespanYears: string;
  pros: string;
  cons: string;
}> = {
  openCell: {
    label: "Open-Cell Spray Foam",
    description: "Softer, expanding foam. Good for indoor sound + air sealing.",
    pricePerBoardFtLow: 0.44,
    pricePerBoardFtHigh: 0.65,
    rValuePerInch: 3.6,
    lifespanYears: "80+ years",
    pros: "Cheaper, sound dampening, expands to fill gaps",
    cons: "Absorbs moisture, lower R-value, not for exterior",
  },
  closedCell: {
    label: "Closed-Cell Spray Foam",
    description: "Dense, moisture-resistant. Highest R-value per inch. Adds structural strength.",
    pricePerBoardFtLow: 1.0,
    pricePerBoardFtHigh: 1.5,
    rValuePerInch: 6.5,
    lifespanYears: "80+ years",
    pros: "Highest R-value, moisture barrier, adds wall strength",
    cons: "Most expensive, doesn't expand as much, needs pro install",
  },
};

export const AREA_DEFAULTS: Record<ApplicationArea, { label: string; defaultThickness: number; notes: string }> = {
  attic: { label: "Attic", defaultThickness: 6, notes: "Most common application. Open-cell typical for attic floor." },
  walls: { label: "Exterior Walls", defaultThickness: 3, notes: "Closed-cell preferred for moisture barrier. 2x4 walls = 3.5\" max." },
  basement: { label: "Basement Walls", defaultThickness: 2, notes: "Closed-cell required (moisture resistance). Code minimum in many areas." },
  crawlspace: { label: "Crawlspace", defaultThickness: 2, notes: "Closed-cell required. Must cover rim joist for air sealing." },
};

export function calculateSprayFoam(state: SprayFoamState): SprayFoamResult | null {
  if (state.areaSqFt <= 0 || state.thicknessInches <= 0) return null;
  const foam = FOAM_TYPES[state.foamType];
  const boardFeet = state.areaSqFt * state.thicknessInches;
  const totalLow = boardFeet * foam.pricePerBoardFtLow;
  const totalHigh = boardFeet * foam.pricePerBoardFtHigh;
  // Material ~60%, labor ~40%
  return {
    boardFeet: Math.round(boardFeet),
    materialCostLow: Math.round(totalLow * 0.6),
    materialCostHigh: Math.round(totalHigh * 0.6),
    laborCostLow: Math.round(totalLow * 0.4),
    laborCostHigh: Math.round(totalHigh * 0.4),
    totalCostLow: Math.round(totalLow),
    totalCostHigh: Math.round(totalHigh),
    rValue: Math.round(state.thicknessInches * foam.rValuePerInch * 10) / 10,
  };
}

export function getDefaultState(): SprayFoamState {
  return { areaSqFt: 1000, thicknessInches: 6, foamType: "openCell", area: "attic" };
}

export const COST_BREAKDOWN = [
  { component: "Materials (foam kits / bulk)", percentage: "55-65%", description: "Spray foam resin + hardener, either DIY kits or bulk delivery" },
  { component: "Labor (certified installer)", percentage: "30-40%", description: "Surface prep, application, trimming, cleanup" },
  { component: "Equipment & travel", percentage: "5-10%", description: "Spray rig, hoses, PPE, ventilation setup" },
];

export const sprayFoamFaqs = [
  {
    question: "How much does spray foam insulation cost per square foot?",
    answer:
      "Spray foam costs $0.44-$1.50 per board foot (1 board foot = 1 sq ft × 1 inch thick) in 2026. Open-cell foam runs $0.44-$0.65/board ft. Closed-cell foam runs $1.00-$1.50/board ft. For a typical attic (1,000 sq ft at 6 inches thick = 6,000 board feet), open-cell costs $2,640-$3,900 and closed-cell costs $6,000-$9,000. The calculator above converts your area and thickness to board feet automatically.",
  },
  {
    question: "What is the difference between open-cell and closed-cell spray foam?",
    answer:
      "Open-cell foam is softer, lighter, and expands more (fills gaps better). It has an R-value of ~3.6 per inch and costs about half as much as closed-cell. But it absorbs moisture, so it can't be used in damp areas. Closed-cell foam is dense, rigid, moisture-proof, and has a higher R-value (~6.5 per inch). It also adds structural strength to walls. Choose open-cell for dry indoor areas (attics, interior walls). Choose closed-cell for basements, crawlspaces, exterior walls, and anywhere moisture is a concern.",
  },
  {
    question: "How thick should spray foam insulation be?",
    answer:
      "Recommended thickness depends on area and foam type. Attics: 6-10 inches open-cell (R-21 to R-36) or 3-5 inches closed-cell (R-19 to R-32). Exterior 2x4 walls: 3 inches closed-cell (R-19, fills the cavity). 2x6 walls: 5.5 inches open-cell (R-20) or 3 inches closed-cell (R-19). Basements/crawlspaces: 2 inches closed-cell minimum (R-13, code compliant in most areas). Going thicker than cavity depth wastes money — foam can't exceed stud depth.",
  },
  {
    question: "Is spray foam worth the cost?",
    answer:
      "For most homes, yes — spray foam pays back in 5-10 years through energy savings. A typical $4,000-$8,000 attic insulation job saves $200-$600/year on heating/cooling (Department of Energy data). Beyond energy savings, spray foam also: (1) seals air leaks (eliminates drafts), (2) reduces outside noise, (3) blocks moisture and mold, (4) improves indoor air quality. Fiberglass and cellulose are cheaper upfront ($1-$3/sq ft) but don't air-seal and settle over time.",
  },
  {
    question: "Can I spray foam insulation myself?",
    answer:
      "DIY spray foam kits (Froth-Pak, Tiger Foam) cost $300-$600 for 200-600 board feet — cheaper than pro install. But DIY has major drawbacks: (1) inconsistent application creates voids and weak spots; (2) improper mixing causes the foam not to cure (toxic off-gassing); (3) no warranty; (4) you must wear full PPE (respirator, suit, gloves); (5) overspray is extremely difficult to remove. For jobs over 500 board feet, professional installation is almost always cheaper and definitely better quality.",
  },
  {
    question: "Does spray foam insulation add resale value to my home?",
    answer:
      "Yes — spray foam is one of the few insulation upgrades that appraisers recognize. A properly insulated attic with spray foam can increase home value by 3-5% in energy-conscious markets (Pacific Northwest, Northeast). The energy audit documentation (pre/post utility bills) strengthens the value proposition. Most real estate agents in 2026 list spray foam insulation as a selling feature in markets where buyers prioritize energy efficiency.",
  },
  {
    question: "What is the R-value of spray foam insulation?",
    answer:
      "Open-cell spray foam has an R-value of approximately 3.6 per inch. Closed-cell spray foam has an R-value of approximately 6.5 per inch — nearly double. For a typical 6-inch attic application: open-cell achieves R-21.6, closed-cell achieves R-39. Building code (IRC 2024) requires R-49 for attics in most US climate zones, which means 14 inches of open-cell or 7.5 inches of closed-cell. The calculator above shows your total R-value based on selected thickness.",
  },
];
