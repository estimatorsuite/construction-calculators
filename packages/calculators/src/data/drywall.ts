// lib/calculators/drywall-data.ts
// Drywall Calculator — 石膏板计算器
// 数据来源：Home Depot 2026 + CertainTeed + costflowai 2026

export type DrywallThickness = "quarter" | "threeEighths" | "half" | "fiveEighths";
export type SheetSize = "4x8" | "4x10" | "4x12";

export interface DrywallState {
  roomLengthFt: number;
  roomWidthFt: number;
  wallHeightFt: number;
  includeCeiling: boolean;
  openingsSqFt: number;
  thickness: DrywallThickness;
  sheetSize: SheetSize;
}

export interface DrywallResult {
  wallAreaSqFt: number;
  ceilingAreaSqFt: number;
  totalAreaSqFt: number;
  netAreaSqFt: number;
  totalAreaWithWaste: number;
  sheetsNeeded: number;
  jointCompoundBoxes: number;
  jointTapeRolls: number;
  screwsLbs: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
}

// 板厚度规格
export const THICKNESS_SPECS: Record<DrywallThickness, {
  label: string;
  actualThickness: string;
  pricePerSheetLow: number;
  pricePerSheetHigh: number;
  description: string;
}> = {
  quarter: {
    label: '1/4" Drywall',
    actualThickness: '1/4"',
    pricePerSheetLow: 9,
    pricePerSheetHigh: 14,
    description: "Thinnest. Used for overlaying existing walls or curved surfaces.",
  },
  threeEighths: {
    label: '3/8" Drywall',
    actualThickness: '3/8"',
    pricePerSheetLow: 10,
    pricePerSheetHigh: 15,
    description: "Lightweight. Repair work and curved walls.",
  },
  half: {
    label: '1/2" Standard',
    actualThickness: '1/2"',
    pricePerSheetLow: 11,
    pricePerSheetHigh: 16,
    description: "Most common for residential walls. Code standard for 16\" o.c. framing.",
  },
  fiveEighths: {
    label: '5/8" Fire-Resistant (Type X)',
    actualThickness: '5/8"',
    pricePerSheetLow: 14,
    pricePerSheetHigh: 22,
    description: "Required for garages, attached walls, and commercial. Fire-rated 1 hour.",
  },
};

// 板尺寸规格
export const SHEET_SIZES: Record<SheetSize, {
  label: string;
  dimensions: string;
  coverageSqFt: number;
}> = {
  "4x8": { label: '4\'×8\'', dimensions: '4\'×8\'', coverageSqFt: 32 },
  "4x10": { label: '4\'×10\'', dimensions: '4\'×10\'', coverageSqFt: 40 },
  "4x12": { label: '4\'×12\'', dimensions: '4\'×12\'', coverageSqFt: 48 },
};

export const WASTE_FACTOR = 0.10; // 10%
// 每 1000 sq ft 需要：~3 boxes joint compound, ~2 rolls tape, ~2 lbs screws
export const COMPOUND_PER_1000_SQFT = 3;
export const TAPE_PER_1000_SQFT = 2;
export const SCREWS_PER_1000_SQFT = 2;
export const LABOR_PER_SQFT = { low: 1.0, high: 2.0 }; // $/sq ft

export function calculateDrywall(state: DrywallState): DrywallResult | null {
  if (state.roomLengthFt <= 0 || state.roomWidthFt <= 0 || state.wallHeightFt <= 0) return null;
  const spec = THICKNESS_SPECS[state.thickness];
  const sheetSpec = SHEET_SIZES[state.sheetSize];

  const perimeter = 2 * (state.roomLengthFt + state.roomWidthFt);
  const wallArea = perimeter * state.wallHeightFt;
  const ceilingArea = state.includeCeiling ? state.roomLengthFt * state.roomWidthFt : 0;
  const grossArea = wallArea + ceilingArea;
  const netArea = Math.max(0, grossArea - state.openingsSqFt);
  const totalWithWaste = Math.ceil(netArea * (1 + WASTE_FACTOR));

  const sheetsNeeded = Math.ceil(totalWithWaste / sheetSpec.coverageSqFt);
  const compoundBoxes = Math.ceil((totalWithWaste / 1000) * COMPOUND_PER_1000_SQFT);
  const tapeRolls = Math.max(1, Math.ceil((totalWithWaste / 1000) * TAPE_PER_1000_SQFT));
  const screwsLbs = Math.max(1, Math.ceil((totalWithWaste / 1000) * SCREWS_PER_1000_SQFT));

  const sheetCostLow = sheetsNeeded * spec.pricePerSheetLow;
  const sheetCostHigh = sheetsNeeded * spec.pricePerSheetHigh;
  const suppliesCost = compoundBoxes * 18 + tapeRolls * 7 + screwsLbs * 8; // compound ~$18/box, tape ~$7/roll, screws ~$8/lb
  const materialLow = Math.round(sheetCostLow + suppliesCost);
  const materialHigh = Math.round(sheetCostHigh + suppliesCost * 1.3);

  const laborLow = Math.round(totalWithWaste * LABOR_PER_SQFT.low);
  const laborHigh = Math.round(totalWithWaste * LABOR_PER_SQFT.high);

  return {
    wallAreaSqFt: Math.round(wallArea),
    ceilingAreaSqFt: Math.round(ceilingArea),
    totalAreaSqFt: Math.round(grossArea),
    netAreaSqFt: Math.round(netArea),
    totalAreaWithWaste: totalWithWaste,
    sheetsNeeded,
    jointCompoundBoxes: compoundBoxes,
    jointTapeRolls: tapeRolls,
    screwsLbs,
    materialCostLow: materialLow,
    materialCostHigh: materialHigh,
    laborCostLow: laborLow,
    laborCostHigh: laborHigh,
    totalCostLow: materialLow + laborLow,
    totalCostHigh: materialHigh + laborHigh,
    costPerSqFtLow: Math.round((materialLow + laborLow) / netArea * 10) / 10,
    costPerSqFtHigh: Math.round((materialHigh + laborHigh) / netArea * 10) / 10,
  };
}

export function getDefaultState(): DrywallState {
  return {
    roomLengthFt: 12,
    roomWidthFt: 12,
    wallHeightFt: 8,
    includeCeiling: true,
    openingsSqFt: 24, // 1 door + 1 window average
    thickness: "half",
    sheetSize: "4x8",
  };
}

export const COST_BREAKDOWN = [
  { component: "Drywall sheets", percentage: "25-30%", description: "Gypsum panels — the primary material" },
  { component: "Joint compound + tape + screws", percentage: "8-12%", description: "Mud (3-4 coats), paper/fiberglass tape, drywall screws" },
  { component: "Labor (hang + finish)", percentage: "50-60%", description: "Hanging sheets, taping, mudding, sanding, texture" },
  { component: "Disposal + cleanup", percentage: "5-8%", description: "Hauling scraps, dust containment, final cleanup" },
];

export const drywallFaqs = [
  {
    question: "How many 4x8 sheets of drywall do I need for a 12x12 room?",
    answer:
      "A 12'×12' room with 8' ceilings needs about 16 sheets of 4'×8' drywall for walls only, or 22 sheets if including the ceiling. Calculate: wall area = (12+12+12+12) × 8 = 384 sq ft. Ceiling = 144 sq ft. Total = 528 sq ft minus 24 sq ft for a door and window = 504 sq ft. Add 10% waste = 554 sq ft. At 32 sq ft/sheet = 17.3 → 18 sheets for walls only, or 23 sheets with ceiling. The calculator does this automatically.",
  },
  {
    question: "How much does drywall cost per square foot?",
    answer:
      "Drywall costs $1.50 to $3.00 per square foot installed in 2026, including materials and labor. Material-only cost runs $0.40-$0.75/sq ft (sheets, mud, tape, screws). Labor (hanging + finishing) runs $1.00-$2.00/sq ft. A typical 12'×12' room (500 sq ft of drywall) costs $750-$1,500 total. Finishing level affects cost — Level 4 (standard paint-ready) is baseline; Level 5 (glass-smooth for high-gloss paint) adds 30-50%.",
  },
  {
    question: "What thickness drywall do I need?",
    answer:
      "1/2\" drywall is the standard for residential walls with 16\" on-center framing. 5/8\" is required for: garage walls attached to living space (fire code), ceilings with 24\" o.c. framing, and commercial applications. 3/8\" is for repair work or curved walls. 1/4\" is for overlaying existing surfaces. Most building codes specify minimum 1/2\" for walls and 5/8\" for ceilings with wider framing. Always check local code.",
  },
  {
    question: "Should I use 4x8 or 4x12 drywall sheets?",
    answer:
      "4'×12' sheets cover 48 sq ft vs 4'×8' at 32 sq ft — 50% more coverage per sheet. Fewer sheets means fewer seams to tape and finish (saving labor). But 4'×12' sheets weigh 80+ lbs and require two people or a drywall lift. For ceilings and long walls (12'+), 4'×12' saves significant labor. For small rooms or DIY, 4'×8' is more manageable (one person can handle it). The calculator lets you compare sheet counts for both sizes.",
  },
  {
    question: "How much joint compound and tape do I need?",
    answer:
      "Rule of thumb per 1,000 sq ft of drywall: 3 boxes of joint compound (4.5 gal each), 2 rolls of joint tape (250 ft each), and 2 lbs of drywall screws. More finish coats require more compound — Level 4 finish uses about 4 boxes per 1,000 sq ft. Level 5 (premium) uses 5+ boxes. The calculator estimates these automatically based on your total square footage.",
  },
  {
    question: "How long does it take to drywall a room?",
    answer:
      "A professional crew can hang and finish drywall in a standard 12'×12' room in 2-3 days. Day 1: hanging sheets (4-6 hours for a 2-person crew). Day 1-2: first two coats of mud and tape. Day 3: final coat, sanding, and cleanup. The compound needs 24 hours dry time between coats (longer in humid conditions). DIY typically takes 5-7 days for the same room. Texture application adds another day after sanding.",
  },
  {
    question: "Can I install drywall myself?",
    answer:
      "DIY drywall installation is possible for walls in small rooms (under 200 sq ft) with 4'×8' sheets. Hanging is straightforward; finishing (taping + mudding) requires practice — first-time DIYers often produce visible seams and uneven surfaces. Professional finishing costs $1-$2/sq ft but produces paint-ready results. For anything beyond a small repair room, hire a professional — the quality difference is dramatic and the labor cost is comparable to materials.",
  },
  {
    question: "What is Level 5 drywall finish and when do I need it?",
    answer:
      "Level 5 is the highest drywall finish standard — a skim coat of joint compound over the entire surface, creating a glass-smooth wall. It's required for: (1) High-gloss or dark paint colors (Level 4 imperfections show through), (2) Raking light conditions (large windows or can lights that cast shadows on walls), (3) Commercial spaces with strict quality standards. Level 5 costs 30-50% more than Level 4 (the standard paint-ready finish most homes use). For most residential rooms with flat or eggshell paint, Level 4 is sufficient and Level 5 is a waste of money.",
  },
  {
    question: "How to reduce drywall dust during renovation?",
    answer:
      "Drywall sanding produces fine silica dust that penetrates everywhere. To minimize: (1) Use a pole sander with a vacuum attachment ($50-$80 rental) — captures 80%+ of dust at the source. (2) Seal the work area with plastic sheeting and zip-door. Cover HVAC vents to prevent dust spreading through the house. (3) Wet-sand instead of dry-sand: use a damp sponge to smooth compound joints (slower but zero dust). (4) Wear a N95 or P100 respirator — silica dust causes lung damage. (5) Schedule a professional cleaning ($200-$500) after the project — household vacuums can't capture fine drywall dust.",
  },
];
