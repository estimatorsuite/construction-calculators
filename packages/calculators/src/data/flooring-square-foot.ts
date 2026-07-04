// lib/calculators/flooring-square-foot-data.ts
// Flooring Square Foot Calculator — 数据层
// 数据来源：Angi 2026, HomeAdvisor 2026, Floor & Decor, Tile Council of North America
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type FlooringType =
  | "carpet"
  | "hardwood"
  | "tile"
  | "laminate"
  | "vinyl"
  | "stone";

export interface FlooringSqFtState {
  roomLengthFt: number;
  roomWidthFt: number;
  wastePercent: number;
  flooringType: FlooringType;
}

export interface FlooringSqFtResult {
  baseAreaSqFt: number;
  totalWithWaste: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
}

// ========================================================================
// 材料价格数据（2026，USD）
// 来源：Angi 2026 Flooring Installation Cost + HomeAdvisor 2026 Flooring Prices
// ========================================================================

export interface FlooringPrice {
  label: string;
  description: string;
  materialLow: number;           // $/sq ft
  materialHigh: number;          // $/sq ft
  laborLow: number;              // $/sq ft
  laborHigh: number;             // $/sq ft
}

export const FLOORING_PRICES: Record<FlooringType, FlooringPrice> = {
  carpet: {
    label: "Carpet",
    description: "Broadloom with padding. Whole-room installation, stretched over tack strips.",
    materialLow: 2,
    materialHigh: 5,
    laborLow: 1,
    laborHigh: 2,
  },
  hardwood: {
    label: "Hardwood",
    description: "Solid or engineered. Solid: 3/4\" oak/maple/hickory. Engineered: wood veneer on plywood.",
    materialLow: 5,
    materialHigh: 12,
    laborLow: 3,
    laborHigh: 5,
  },
  tile: {
    label: "Tile",
    description: "Ceramic, porcelain, or natural stone. Thinset + grout. Waterproof when sealed.",
    materialLow: 2,
    materialHigh: 15,
    laborLow: 4,
    laborHigh: 8,
  },
  laminate: {
    label: "Laminate",
    description: "Click-lock planks with HDF core. Photographic wood image under wear layer.",
    materialLow: 2,
    materialHigh: 5,
    laborLow: 2,
    laborHigh: 4,
  },
  vinyl: {
    label: "Vinyl",
    description: "Sheet, tile, or plank (LVP/LVT). Waterproof. Glue-down or click-lock.",
    materialLow: 2,
    materialHigh: 6,
    laborLow: 2,
    laborHigh: 4,
  },
  stone: {
    label: "Stone",
    description: "Marble, granite, slate, travertine. Premium natural look. Requires sealing.",
    materialLow: 10,
    materialHigh: 30,
    laborLow: 5,
    laborHigh: 10,
  },
};

// ========================================================================
// 默认值
// ========================================================================

export const DEFAULT_WASTE_PERCENT = 10;

// ========================================================================
// 计算函数
// 公式：totalWithWaste = ceil(area × (1 + waste/100))
// ========================================================================

export function calculateFlooringSqFt(state: FlooringSqFtState): FlooringSqFtResult | null {
  if (state.roomLengthFt <= 0 || state.roomWidthFt <= 0) return null;

  const baseArea = state.roomLengthFt * state.roomWidthFt;
  const wasteMultiplier = 1 + state.wastePercent / 100;
  const totalWithWaste = Math.ceil(baseArea * wasteMultiplier);

  const price = FLOORING_PRICES[state.flooringType];

  // 材料按 totalWithWaste 计价
  const materialCostLow = Math.round(totalWithWaste * price.materialLow);
  const materialCostHigh = Math.round(totalWithWaste * price.materialHigh);

  // 人工按 base area 计价（waste 不产生额外人工）
  const laborCostLow = Math.round(baseArea * price.laborLow);
  const laborCostHigh = Math.round(baseArea * price.laborHigh);

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  return {
    baseAreaSqFt: Math.round(baseArea),
    totalWithWaste,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow,
    totalCostHigh,
    costPerSqFtLow: Math.round(((totalCostLow / baseArea) * 100)) / 100,
    costPerSqFtHigh: Math.round(((totalCostHigh / baseArea) * 100)) / 100,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): FlooringSqFtState {
  return {
    roomLengthFt: 16,
    roomWidthFt: 14,
    wastePercent: DEFAULT_WASTE_PERCENT,
    flooringType: "laminate",
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
    component: "Flooring material",
    percentage: "40-50%",
    description: "Carpet + pad, hardwood planks, tile, laminate cartons, vinyl planks, stone slabs",
  },
  {
    component: "Labor",
    percentage: "30-40%",
    description: "Tear-out, subfloor prep, installation, cuts, transitions, baseboards",
  },
  {
    component: "Underlayment & adhesives",
    percentage: "5-10%",
    description: "Foam pad, thinset, grout, moisture barrier, glue",
  },
  {
    component: "Overhead & profit",
    percentage: "10-15%",
    description: "Insurance, truck, tools, office, contractor's margin",
  },
];

// ========================================================================
// 地区价格因子
// ========================================================================

export interface RegionFactor {
  region: string;
  laborMultiplier: number;
  materialMultiplier: number;
  notes: string;
}

export const REGION_FACTORS: RegionFactor[] = [
  { region: "Midwest", laborMultiplier: 1.0, materialMultiplier: 1.0, notes: "Baseline (national average)" },
  { region: "Southeast", laborMultiplier: 0.9, materialMultiplier: 0.95, notes: "Lower labor rates, competitive market" },
  { region: "Southwest", laborMultiplier: 1.05, materialMultiplier: 1.05, notes: "Tile popular, higher demand in Southwest" },
  { region: "Northeast", laborMultiplier: 1.3, materialMultiplier: 1.1, notes: "Higher labor, hardwood popular" },
  { region: "West Coast", laborMultiplier: 1.4, materialMultiplier: 1.15, notes: "Highest costs in US" },
];

// ========================================================================
// FAQ — 6 个
// ========================================================================

export const flooringSqFtFaqs = [
  {
    question: "How do I calculate square feet for flooring?",
    answer:
      "Multiply room length by room width in feet. A 16×14 room = 224 square feet. For irregular shapes (L-shape, bay windows), split the room into rectangles, measure each, then add. Always add 10% for waste — you'll cut planks and tiles to fit, and some will break. For a 224 sq ft room: 224 × 1.10 = 246 sq ft of material to order. The calculator above handles all of this automatically.",
  },
  {
    question: "What waste factor should I add to flooring measurements?",
    answer:
      "10% is standard for straight-lay installations of plank or sheet flooring. Use 15% for tile (more cuts and breakage), diagonal patterns, or L-shaped rooms. Use 20% for small bathrooms or kitchens with many fixture cutouts. Going below 10% risks running out mid-job — and dye-lot differences mean a re-order may not match perfectly. The calculator lets you adjust this from 0-30%.",
  },
  {
    question: "Carpet or hardwood — which costs less per square foot?",
    answer:
      "Carpet is significantly cheaper: $3-$7/sq ft installed (material $2-$5 + labor $1-$2). Hardwood runs $8-$17/sq ft installed (material $5-$12 + labor $3-$5). For a 300 sq ft room, that's $900-$2,100 for carpet vs $2,400-$5,100 for hardwood. But hardwood lasts 50-100+ years (refinishable 4-6 times) while carpet needs replacement every 8-15 years. Over 30 years, hardwood is actually cheaper per year of service.",
  },
  {
    question: "How much does flooring cost per room?",
    answer:
      "For a standard 12×14 bedroom (168 sq ft): carpet $500-$1,200, laminate $700-$1,700, vinyl $700-$1,700, tile $1,000-$3,900, hardwood $1,300-$2,900, stone $2,500-$6,700. These include materials and labor but not tear-out of existing flooring ($1-$5/sq ft extra). Larger rooms scale linearly. Open floor plans over 400 sq ft often get a 10-15% volume discount from contractors.",
  },
  {
    question: "How long does flooring installation take?",
    answer:
      "Carpet: 1 day for 300 sq ft. Laminate or vinyl plank: 1-2 days for 300 sq ft (click-lock is fast). Hardwood: 2-3 days for 300 sq ft (nail-down + sanding for unfinished). Tile: 2-3 days for 200 sq ft (thinset cure time + grout). Stone: 3-5 days (heavier, more cutting, sealing). Add 1 day for tear-out of old flooring. Whole-house (2,000 sq ft) typically takes 5-10 working days.",
  },
  {
    question: "Do I need underlayment under my new flooring?",
    answer:
      "Laminate and vinyl plank: yes, unless it's pre-attached (premium products often include it). Underlayment costs $0.30-$0.60/sq ft. Hardwood: yes, roofing felt or red rosin paper underneath ($0.10-$0.20/sq ft). Tile and stone: no underlayment, but cement board ($1.50-$2/sq ft) if installing over wood subfloor. Carpet: padding is always included with the material price. Skip underlayment only if your subfloor is concrete and you're using glue-down vinyl.",
  },
  {
    question: "Which flooring type adds the most home value?",
    answer:
      "Solid hardwood delivers the highest resale value — appraisers add $5,000-$15,000 to home value vs carpeted homes (National Association of Realtors 2025 data). Hardwood recovers 70-80% of installation cost at sale, carpet 50-60%, tile 60-70%, laminate 40-50%, vinyl plank 50-60%. Buyer preference surveys: 54% of buyers rank hardwood floors as 'essential' or 'important' — only 12% say the same about carpet. For maximum ROI, install hardwood in living rooms, dining rooms, and hallways (high visibility). Use tile in bathrooms/kitchens/laundry. Carpet is acceptable only in bedrooms — and even there, 30% of buyers replace it within the first year of ownership. Avoid laminate in entryway and main living areas for resale.",
  },
  {
    question: "Can I mix different flooring types between rooms?",
    answer:
      "Yes, with design rules. Mix flooring by room function: hardwood in living areas, tile in wet rooms (bath, kitchen, laundry), carpet in bedrooms. Two rules for transitions: (1) always use transition strips (T-molding, reducer, threshold) where materials meet — direct butt joints look unfinished and cause warranty issues, (2) maintain consistent color tone between adjacent rooms (warm-tone hardwood pairs with warm-tone tile, not cool gray). Common layouts: open-plan kitchens + living areas use the same flooring (continuous flow); bedrooms can switch to carpet at the door threshold. Avoid mixing more than 3 flooring types in a 2,000 sq ft home — it creates a choppy, smaller feel. Cost for transition strips: $15-$35 each installed.",
  },
];
