// lib/calculators/carpet-data.ts
// Carpet Calculator — 数据层
// 数据来源：Angi 2026, HomeAdvisor 2026, Shaw Floors, Mohawk product specs
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type CarpetGrade = "budget" | "standard" | "premium" | "luxury";

export interface CarpetState {
  roomLengthFt: number;
  roomWidthFt: number;
  grade: CarpetGrade;
  includePadding: boolean;
  includeInstall: boolean;
}

export interface CarpetResult {
  roomAreaSqFt: number;
  carpetNeededSqYd: number;        // 含 10% waste（按 sq yd 卖）
  carpetNeededSqFt: number;        // 含 10% waste
  paddingNeededSqYd: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// ========================================================================
// 价格数据（2026，USD）
// 来源：Angi 2026 Carpet Installation Cost + HomeAdvisor + Shaw Floors pricing
// ========================================================================

export interface GradePrice {
  label: string;
  description: string;
  priceLow: number;          // $/sq yd（仅地毯）
  priceHigh: number;         // $/sq yd
  lifespanYears: string;
  recommendedUse: string;
}

export const GRADE_PRICES: Record<CarpetGrade, GradePrice> = {
  budget: {
    label: "Budget (Olefin/Berber)",
    description: "Olefin or berber. Builder grade. Thin pile, stains easily but inexpensive.",
    priceLow: 2,
    priceHigh: 4,
    lifespanYears: "5-10 years",
    recommendedUse: "Rental units, low-traffic rooms, budget flips",
  },
  standard: {
    label: "Standard (Nylon Plush)",
    description: "Nylon plush. Most common. Good balance of durability, softness, and price.",
    priceLow: 4,
    priceHigh: 8,
    lifespanYears: "10-15 years",
    recommendedUse: "Living rooms, bedrooms, family rooms (most homes)",
  },
  premium: {
    label: "Premium (Stainmaster)",
    description: "Stainmaster or patterned nylon. Superior stain resistance. Plusher feel.",
    priceLow: 8,
    priceHigh: 15,
    lifespanYears: "15-20 years",
    recommendedUse: "Homes with pets/kids, high-traffic areas, stairs",
  },
  luxury: {
    label: "Luxury (Wool/Saxony)",
    description: "Wool, saxony, or custom patterns. Premium fiber, premium feel. Requires pro cleaning.",
    priceLow: 15,
    priceHigh: 30,
    lifespanYears: "20-30 years",
    recommendedUse: "High-end homes, formal living rooms, master suites",
  },
};

// Padding（来源：Home Depot rebond foam pricing 2026）
export const PADDING_PRICE_LOW = 1;      // $/sq yd
export const PADDING_PRICE_HIGH = 3;     // $/sq yd

// Labor（来源：Angi 2026 Carpet Installation Cost）
export const LABOR_PRICE_LOW = 2;        // $/sq yd (stretch-in + tack strip + seam)
export const LABOR_PRICE_HIGH = 4;       // $/sq yd

// Waste factor
export const WASTE_FACTOR = 0.10;        // 10%

// ========================================================================
// 计算函数
// 公式：sq yd = (length × width × (1 + waste)) / 9
// ========================================================================

export function calculateCarpet(state: CarpetState): CarpetResult | null {
  if (state.roomLengthFt <= 0 || state.roomWidthFt <= 0) return null;

  const baseAreaSqFt = state.roomLengthFt * state.roomWidthFt;
  const carpetNeededSqFt = baseAreaSqFt * (1 + WASTE_FACTOR);
  const carpetNeededSqYd = carpetNeededSqFt / 9;
  const paddingNeededSqYd = carpetNeededSqYd; // 1:1 coverage

  const grade = GRADE_PRICES[state.grade];

  // Material cost
  const materialLow = carpetNeededSqYd * grade.priceLow;
  const materialHigh = carpetNeededSqYd * grade.priceHigh;

  let paddingLow = 0;
  let paddingHigh = 0;
  if (state.includePadding) {
    paddingLow = paddingNeededSqYd * PADDING_PRICE_LOW;
    paddingHigh = paddingNeededSqYd * PADDING_PRICE_HIGH;
  }

  const materialCostLow = Math.round(materialLow + paddingLow);
  const materialCostHigh = Math.round(materialHigh + paddingHigh);

  // Labor cost
  let laborCostLow = 0;
  let laborCostHigh = 0;
  if (state.includeInstall) {
    laborCostLow = Math.round(carpetNeededSqYd * LABOR_PRICE_LOW);
    laborCostHigh = Math.round(carpetNeededSqYd * LABOR_PRICE_HIGH);
  }

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  return {
    roomAreaSqFt: Math.round(baseAreaSqFt * 10) / 10,
    carpetNeededSqYd: Math.round(carpetNeededSqYd * 10) / 10,
    carpetNeededSqFt: Math.round(carpetNeededSqFt),
    paddingNeededSqYd: Math.round(paddingNeededSqYd * 10) / 10,
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

export function getDefaultState(): CarpetState {
  return {
    roomLengthFt: 12,
    roomWidthFt: 12,
    grade: "standard",
    includePadding: true,
    includeInstall: true,
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
    component: "Carpet Material",
    percentage: "30-50%",
    description: "The carpet itself, by square yard. Grade drives most of the cost variance.",
  },
  {
    component: "Padding",
    percentage: "5-10%",
    description: "Rebond foam underlayment. Skimping here shortens carpet life by 30-50%.",
  },
  {
    component: "Labor",
    percentage: "30-45%",
    description: "Stretch-in installation, tack strip, seaming, transitions, door trim.",
  },
  {
    component: "Tear-off & Disposal",
    percentage: "5-10%",
    description: "Removing old carpet, pad, tack strip. Often an add-on ($1-$2/sq yd).",
  },
  {
    component: "Overhead & Profit",
    percentage: "10-15%",
    description: "Installer's margin, insurance, van, tools.",
  },
];

// ========================================================================
// FAQ — 6 个真实问题
// ========================================================================

export const carpetFaqs = [
  {
    question: "How much carpet do I need for my room?",
    answer:
      "Measure the room's length and width in feet, multiply for square feet, then add 10% for waste and seams. Convert to square yards by dividing by 9. A 12×12 bedroom = 144 sq ft × 1.10 = 158 sq ft ÷ 9 = 17.6 sq yd. Most carpet comes in 12-foot rolls, so a room wider than 12 feet will need a seam — which increases waste. Order 10% extra minimum for pattern matching.",
  },
  {
    question: "How do I convert square feet to square yards?",
    answer:
      "Divide square feet by 9 to get square yards. One square yard = 9 square feet (3 feet × 3 feet). Example: 180 sq ft ÷ 9 = 20 sq yd. Carpet is sold by the square yard because it comes in 12-foot-wide rolls — pricing per yard makes it easier to compare across suppliers. Our calculator does this conversion automatically.",
  },
  {
    question: "How much does carpet cost per room?",
    answer:
      "A standard 12×12 bedroom (144 sq ft) costs $300-$1,000 fully installed, depending on grade. Budget olefin runs $200-$400, standard nylon plush $400-$700, premium Stainmaster $700-$1,200, luxury wool $1,200-$2,500. Add $100-$200 for tear-off of old carpet and $50-$100 for furniture moving. Stairs add $8-$15 per step.",
  },
  {
    question: "Is padding included in carpet installation cost?",
    answer:
      "Usually yes, but check the quote. Some contractors list carpet + install but exclude padding as a line item, then charge $1-$3/sq yd extra. Standard 7/16-inch rebond foam (6-8 lb density) is the baseline. Upgraded memory foam padding costs $3-$6/sq yd and extends carpet life. Cheap 4 lb padding feels fine initially but breaks down in 3-5 years, voiding most carpet warranties.",
  },
  {
    question: "How long does carpet last?",
    answer:
      "Budget olefin/berber: 5-10 years. Standard nylon plush: 10-15 years. Premium Stainmaster: 15-20 years. Wool/saxony: 20-30 years with professional cleaning. Real-world lifespan depends heavily on foot traffic, pets, and padding quality. A $4/sq yd carpet with premium padding often outlasts a $10/sq yd carpet with cheap padding by 3-5 years.",
  },
  {
    question: "What does a carpet stain warranty actually cover?",
    answer:
      "Most stain warranties cover specific food and beverage stains (coffee, juice, wine) for 5-10 years, but exclude pet urine, bleach, paint, ink, and burns. Stainmaster's warranty requires professional cleaning every 18-24 months to stay valid. Read the exclusions — many homeowners are surprised that 'lifetime stain warranty' actually means 5-7 years for common household stains.",
  },
  {
    question: "Can I install carpet myself?",
    answer:
      "Not recommended for wall-to-wall carpeting. Professional installation requires a power stretcher ($40/day rental), knee kicker, seam iron ($30/day), and tack strip installation. DIY carpet typically wrinkles within 1 year because knee-kicking (vs power-stretching) doesn't achieve proper tension. Seams are the hardest part — mismatched patterns and visible seams scream 'amateur.' For area rugs or small rooms under 100 sq ft, DIY is possible. For anything with seams, stairs, or pattern matching, hire a pro ($2-$4/sq yd).",
  },
  {
    question: "How does carpet fiber type affect lifespan?",
    answer:
      "Nylon lasts 15-20 years and is the most durable residential fiber — resists crushing and maintains appearance. Triexta (PTT) lasts 12-18 years with excellent stain resistance but slightly less durability than nylon. Polyester lasts 8-12 years — budget-friendly but flattens in high traffic. Olefin (polypropylene) lasts 8-12 years — solution-dyed (won't fade) but crushes easily, best for low-traffic areas and outdoor use. Wool lasts 20-30 years — premium natural fiber, but costs 3-5x more and requires professional cleaning.",
  },
];
