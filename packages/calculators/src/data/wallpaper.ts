// lib/calculators/wallpaper-data.ts
// Wallpaper Calculator — 数据层
// 数据来源：Angi 2026, HomeAdvisor 2026, York Wallcoverings, Brewster specs
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type WallpaperType = "standard" | "prepasted" | "peelStick" | "grasscloth";

export interface WallpaperState {
  wallLengthFt: number;
  wallHeightFt: number;
  rollWidthInches: number;          // 20.5" or 27" standard
  patternRepeatInches: number;      // 0 for no repeat, 24" typical
  wallpaperType: WallpaperType;
}

export interface WallpaperResult {
  wallAreaSqFt: number;
  rollLengthFt: number;             // standard 33 ft per roll
  stripsPerRoll: number;
  totalStripsNeeded: number;
  rollsNeeded: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// ========================================================================
// 价格数据（2026，USD）
// 来源：Angi 2026 Wallpaper Installation + HomeAdvisor + York Wallcoverings
// ========================================================================

export interface TypePrice {
  label: string;
  description: string;
  priceLow: number;          // $/roll
  priceHigh: number;         // $/roll
  difficultyLevel: string;
}

export const TYPE_PRICES: Record<WallpaperType, TypePrice> = {
  standard: {
    label: "Standard (Unpasted)",
    description: "Traditional wallpaper. Requires separate adhesive paste. Most durable, longest lifespan.",
    priceLow: 15,
    priceHigh: 40,
    difficultyLevel: "Intermediate — needs paste, booking, smoothing",
  },
  prepasted: {
    label: "Prepasted",
    description: "Water-activated adhesive backing. Dip in water tray, book, hang. Common in US since 1990s.",
    priceLow: 20,
    priceHigh: 50,
    difficultyLevel: "Beginner-friendly — just water activate",
  },
  peelStick: {
    label: "Peel & Stick (Removable)",
    description: "Self-adhesive. DIY-friendly. Best for renters, accent walls. Not for textured walls.",
    priceLow: 25,
    priceHigh: 60,
    difficultyLevel: "Beginner — peel backing, stick to wall",
  },
  grasscloth: {
    label: "Grasscloth (Natural)",
    description: "Woven natural fiber (hemp, jute, sisal). Premium look, requires pro install. Color varies roll to roll.",
    priceLow: 40,
    priceHigh: 100,
    difficultyLevel: "Advanced — pro install recommended",
  },
};

// Roll specs（来源：York Wallcoverings + Brewster Home Fashions spec sheets）
export const ROLL_LENGTH_FT = 33;       // US standard single roll
export const ROLL_WIDTH_OPTIONS = [20.5, 27] as const;  // US + European

// Labor（来源：Angi 2026 Wallpaper Installation Cost）
export const LABOR_PER_SQ_FT = {
  standard: { low: 2, high: 6 },
  prepasted: { low: 2, high: 5 },
  peelStick: { low: 1.5, high: 4 },
  grasscloth: { low: 4, high: 10 },
};

// ========================================================================
// 计算函数
// 公式：
//   strips = ceil(wallLength / (rollWidth/12))
//   stripsPerRoll = floor(rollLength / (height + patternRepeat/12))
//   rolls = ceil(totalStrips / stripsPerRoll)
// ========================================================================

export function calculateWallpaper(state: WallpaperState): WallpaperResult | null {
  if (state.wallLengthFt <= 0 || state.wallHeightFt <= 0) return null;
  if (state.rollWidthInches <= 0) return null;

  const rollWidthFt = state.rollWidthInches / 12;
  const patternRepeatFt = state.patternRepeatInches / 12;
  const wallAreaSqFt = state.wallLengthFt * state.wallHeightFt;

  // Number of vertical strips needed (round up to cover full length)
  const totalStripsNeeded = Math.ceil(state.wallLengthFt / rollWidthFt);

  // How many strips we can get from one roll
  // Each strip uses: height + pattern repeat (for matching)
  const stripHeightWithRepeat = state.wallHeightFt + patternRepeatFt;
  const stripsPerRoll = Math.max(1, Math.floor(ROLL_LENGTH_FT / stripHeightWithRepeat));

  // Total rolls needed
  const rollsNeeded = Math.ceil(totalStripsNeeded / stripsPerRoll);

  // Material cost
  const typePrice = TYPE_PRICES[state.wallpaperType];
  const materialCostLow = Math.round(rollsNeeded * typePrice.priceLow);
  const materialCostHigh = Math.round(rollsNeeded * typePrice.priceHigh);

  // Labor cost
  const laborRange = LABOR_PER_SQ_FT[state.wallpaperType];
  const laborCostLow = Math.round(wallAreaSqFt * laborRange.low);
  const laborCostHigh = Math.round(wallAreaSqFt * laborRange.high);

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  return {
    wallAreaSqFt: Math.round(wallAreaSqFt * 10) / 10,
    rollLengthFt: ROLL_LENGTH_FT,
    stripsPerRoll,
    totalStripsNeeded,
    rollsNeeded,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow,
    totalCostHigh,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): WallpaperState {
  return {
    wallLengthFt: 10,
    wallHeightFt: 8,
    rollWidthInches: 20.5,
    patternRepeatInches: 0,
    wallpaperType: "prepasted",
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
    component: "Wallpaper Rolls",
    percentage: "40-55%",
    description: "The wallpaper itself, by roll. Type and brand drive cost variance.",
  },
  {
    component: "Labor",
    percentage: "30-45%",
    description: "Surface prep, paste (if needed), hanging, pattern matching, trimming.",
  },
  {
    component: "Surface Prep",
    percentage: "5-15%",
    description: "Primer, skim coat repairs, sanding. Required for proper adhesion.",
  },
  {
    component: "Adhesive & Tools",
    percentage: "3-5%",
    description: "Paste, water tray, smoothing brush, seam roller, utility knife.",
  },
  {
    component: "Tear-off & Disposal",
    percentage: "5-10%",
    description: "Removing old wallpaper, scraping residue. Adds $1-$3/sq ft.",
  },
];

// ========================================================================
// FAQ — 6 个真实问题
// ========================================================================

export const wallpaperFaqs = [
  {
    question: "How many rolls of wallpaper do I need?",
    answer:
      "A standard US wallpaper roll is 33 feet long by 20.5 inches wide, covering about 56 square feet. For an 8-foot tall, 10-foot wide wall: you need 6 vertical strips (10 ft ÷ 1.7 ft/strip), each strip uses 8 feet of the roll, so you get 4 strips per roll. That means 2 rolls. Always round up and buy one extra roll for pattern matching and future repairs. Use the calculator above to do this automatically with pattern repeat factored in.",
  },
  {
    question: "What is pattern repeat and why does it matter?",
    answer:
      "Pattern repeat is the vertical distance between where a pattern starts repeating on the wallpaper. A 24-inch pattern repeat means you must align adjacent strips 24 inches apart. This wastes more wallpaper than a random-match pattern (0-inch repeat). Larger repeats need more rolls — a 24-inch repeat can increase your roll count by 25-40% compared to no repeat. The calculator accounts for this automatically.",
  },
  {
    question: "Should I choose standard, prepasted, or peel & stick wallpaper?",
    answer:
      "Prepasted is the sweet spot for most homeowners — water-activated, no separate paste, and DIY-friendly. Standard (unpasted) is more durable and preferred by pros, but requires paste mixing and booking. Peel & stick is easiest for renters and accent walls, but doesn&apos;t adhere well to textured walls and can peel at edges within 2-3 years. Grasscloth is premium ($40-$100/roll) and requires professional installation.",
  },
  {
    question: "How much does wallpaper installation cost per room?",
    answer:
      "A standard 10×8 wall (80 sq ft) costs $200-$900 to wallpaper, depending on type. Standard unpasted runs $300-$700, prepasted $250-$550, peel & stick $200-$450 (DIY-friendly), grasscloth $500-$1,200 (pro install recommended). Full room (4 walls, 320 sq ft) runs $800-$3,000+ installed. Labor alone is $2-$6/sq ft for standard, $4-$10 for grasscloth.",
  },
  {
    question: "Is grasscloth wallpaper hard to install?",
    answer:
      "Yes. Grasscloth is the hardest wallpaper to install because natural fibers vary in color between rolls, seams are highly visible, and the material frays easily when trimmed. Professional installation is strongly recommended — budget $4-$10/sq ft for labor, about double standard wallpaper. Even pros charge a premium because each roll must be color-matched and seams hand-finished. The result is a premium woven look that paint and standard wallpaper can&apos;t replicate.",
  },
  {
    question: "What is the difference between removable and traditional wallpaper?",
    answer:
      "Removable (peel & stick) wallpaper peels off in full strips without damaging walls or leaving residue — ideal for renters or accent walls. Traditional wallpaper (standard or prepasted) bonds permanently with adhesive and requires scoring, soaking, and scraping to remove — a 4-8 hour job per room. Removable costs $25-$60/roll vs $15-$50 for traditional, but the convenience premium is worth it for short-term installations. Lifespan: removable 5-10 years, traditional 15-25 years.",
  },
  {
    question: "Can I paint over wallpaper?",
    answer:
      "Not recommended. Paint bonds to the wallpaper's surface, but as wallpaper adhesive absorbs moisture from the paint, it loosens and the wallpaper bubbles and peels within months. If you absolutely must paint over wallpaper (no time to remove): (1) Secure loose edges with wallpaper adhesive. (2) Apply an oil-based primer (not water-based — water loosens adhesive). (3) Use two coats of quality latex paint. Even then, expect failure within 2-3 years. Proper removal is always better.",
  },
  {
    question: "How to remove old wallpaper quickly?",
    answer:
      "Fastest method: (1) Score the wallpaper with a scoring tool ($5) to allow moisture penetration. (2) Mix fabric softener (1 cup per gallon hot water) or commercial enzyme remover ($15/gal). (3) Spray generously and wait 10-15 minutes. (4) Scrape with a 6-inch putty knife. (5) For stubborn adhesive: rent a wallpaper steamer ($30/day) — steam loosens even 30-year-old paste. Most rooms take 4-8 hours. Do NOT use a heat gun (fire risk) or dry scrape (damages drywall face paper).",
  },
];
