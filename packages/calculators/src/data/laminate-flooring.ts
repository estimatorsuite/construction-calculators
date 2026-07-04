// lib/calculators/laminate-flooring-data.ts
// Laminate Flooring Calculator — 数据层
// 数据来源：Angi 2026, HomeAdvisor 2026, Floor & Decor, LL Flooring
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type FlooringMaterial =
  | "laminate"
  | "vinylPlank"
  | "engineeredHardwood"
  | "solidHardwood";

export interface LaminateFlooringState {
  roomLengthFt: number;
  roomWidthFt: number;
  wastePercent: number; // default 10
  material: FlooringMaterial;
}

export interface LaminateFlooringResult {
  roomAreaSqFt: number;
  totalWithWaste: number;
  cartonsNeeded: number;
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
// 来源：Angi 2026 Laminate Flooring Installation + HomeAdvisor 2026 Flooring Cost
// ========================================================================

export interface MaterialPrice {
  label: string;
  description: string;
  materialLow: number;           // $/sq ft 材料
  materialHigh: number;          // $/sq ft 材料
  laborLow: number;              // $/sq ft 人工
  laborHigh: number;             // $/sq ft 人工
  lifespanYears: string;
}

export const MATERIAL_PRICES: Record<FlooringMaterial, MaterialPrice> = {
  laminate: {
    label: "Laminate",
    description: "Click-lock planks with HDF core. Photographic wood image under wear layer.",
    materialLow: 2,
    materialHigh: 5,
    laborLow: 2,
    laborHigh: 5,
    lifespanYears: "15-25 years",
  },
  vinylPlank: {
    label: "Vinyl Plank (LVP/LVT)",
    description: "Waterproof, ideal for kitchens, baths, basements. Click-lock or glue-down.",
    materialLow: 2,
    materialHigh: 6,
    laborLow: 2,
    laborHigh: 5,
    lifespanYears: "20-30 years",
  },
  engineeredHardwood: {
    label: "Engineered Hardwood",
    description: "Real wood veneer (1-4mm) on plywood core. Can be refinished 1-2 times.",
    materialLow: 4,
    materialHigh: 10,
    laborLow: 2,
    laborHigh: 5,
    lifespanYears: "30-50 years",
  },
  solidHardwood: {
    label: "Solid Hardwood",
    description: "Solid oak/maple/hickory, 3/4\" thick. Can be refinished 4-6 times.",
    materialLow: 5,
    materialHigh: 12,
    laborLow: 2,
    laborHigh: 5,
    lifespanYears: "50-100+ years",
  },
};

// ========================================================================
// 包装规格
// 来源：Pergo, Mohawk, Shaw Industries product spec sheets
// ========================================================================

export const CARTON_COVERAGE_SQFT = 20;  // 行业标准，范围 18-24 sq ft/carton
export const DEFAULT_WASTE_PERCENT = 10;

// ========================================================================
// 计算函数
// 公式：cartons = ceil(totalWithWaste / 20)
// ========================================================================

export function calculateLaminateFlooring(state: LaminateFlooringState): LaminateFlooringResult | null {
  if (state.roomLengthFt <= 0 || state.roomWidthFt <= 0) return null;

  const roomArea = state.roomLengthFt * state.roomWidthFt;
  const wasteMultiplier = 1 + state.wastePercent / 100;
  const totalWithWaste = Math.ceil(roomArea * wasteMultiplier);

  const cartonsNeeded = Math.ceil(totalWithWaste / CARTON_COVERAGE_SQFT);

  const price = MATERIAL_PRICES[state.material];

  // 材料费（按实际需要的 cartons 对应面积计价更准确，但行业惯例按 totalWithWaste）
  const materialCostLow = Math.round(totalWithWaste * price.materialLow);
  const materialCostHigh = Math.round(totalWithWaste * price.materialHigh);

  // 人工按实际房间面积计价（waste 材料人工不增加）
  const laborCostLow = Math.round(roomArea * price.laborLow);
  const laborCostHigh = Math.round(roomArea * price.laborHigh);

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  return {
    roomAreaSqFt: Math.round(roomArea),
    totalWithWaste,
    cartonsNeeded,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow,
    totalCostHigh,
    costPerSqFtLow: Math.round(((totalCostLow / roomArea) * 100)) / 100,
    costPerSqFtHigh: Math.round(((totalCostHigh / roomArea) * 100)) / 100,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): LaminateFlooringState {
  return {
    roomLengthFt: 16,
    roomWidthFt: 14,
    wastePercent: DEFAULT_WASTE_PERCENT,
    material: "laminate",
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
    percentage: "35-45%",
    description: "Planks or cartons of laminate/vinyl/hardwood, underlayment pad",
  },
  {
    component: "Labor",
    percentage: "35-45%",
    description: "Tear-out old floor, prep subfloor, install new flooring, transitions, baseboards",
  },
  {
    component: "Subfloor prep",
    percentage: "10-15%",
    description: "Leveling compound, moisture barrier, plywood patch",
  },
  {
    component: "Overhead & profit",
    percentage: "10-15%",
    description: "Insurance, truck, tools, dispatcher, contractor's margin",
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
  { region: "Southwest", laborMultiplier: 1.05, materialMultiplier: 1.05, notes: "Slightly higher material transport costs" },
  { region: "Northeast", laborMultiplier: 1.3, materialMultiplier: 1.1, notes: "Higher labor, union influence" },
  { region: "West Coast", laborMultiplier: 1.4, materialMultiplier: 1.15, notes: "Highest costs in US" },
];

// ========================================================================
// FAQ — 6 个
// ========================================================================

export const laminateFlooringFaqs = [
  {
    question: "How many cartons of laminate flooring do I need?",
    answer:
      "First measure room area: length × width in feet. Add 10% for waste (cutting mistakes, odd angles). Divide by 20 (standard carton coverage is 20 sq ft, ranges 18-24). Round up to the nearest whole carton — suppliers don't break cartons. Example: 12×14 room = 168 sq ft × 1.10 = 185 sq ft / 20 = 9.25 → 10 cartons. The calculator above does this automatically.",
  },
  {
    question: "What waste factor should I use for laminate flooring?",
    answer:
      "10% is the industry standard for rectangular rooms with minimal angles. Use 15% for L-shaped rooms, rooms with lots of closets, or diagonal installations (laying planks at 45 degrees). For bathrooms or kitchens with lots of cuts around cabinets and fixtures, 15-20% is safer. Going below 10% means you'll likely run out mid-job and have to wait for another carton delivery, which can delay the project by days.",
  },
  {
    question: "What's better: laminate or vinyl plank flooring?",
    answer:
      "Vinyl plank (LVP) wins for moisture-prone areas — bathrooms, kitchens, basements, laundry rooms. It's 100% waterproof. Laminate has better dimensional stability and a more realistic wood look (the photographic layer can mimic any species). Price is similar: $2-$5/sq ft material for laminate, $2-$6 for vinyl. For whole-house installs, most homeowners mix: vinyl in wet areas, laminate in living rooms and bedrooms.",
  },
  {
    question: "How much does laminate flooring cost per square foot?",
    answer:
      "Installed laminate flooring costs $4-$10 per square foot including materials ($2-$5) and labor ($2-$5). Budget laminate (HDF core, thin wear layer) comes in at $4-$5/sq ft total. Mid-range with attached underlayment runs $6-$8/sq ft. Premium laminate with 12mm+ thickness and AC4 wear rating can reach $9-$10/sq ft. For comparison: vinyl plank $4-$11/sq ft, engineered hardwood $6-$15, solid hardwood $7-$17.",
  },
  {
    question: "Can I install laminate flooring myself?",
    answer:
      "Yes — click-lock laminate is the most DIY-friendly flooring type. You need: tape measure, circular saw or jigsaw, tapping block, pull bar, spacers, underlayment (if not pre-attached). Budget 4-6 hours for a 200 sq ft room if it's your first time. The main challenges are: door casings (you'll cut them with a flush-cut saw), transitions between rooms, and keeping planks staggered properly. Avoid DIY if subfloor is uneven — planks will click but seams will separate within months.",
  },
  {
    question: "How long does laminate flooring last?",
    answer:
      "Laminate flooring lasts 15-25 years in residential use. AC3 wear rating (most common) handles normal foot traffic including pets. AC4 is rated for light commercial and lasts longer in homes. The failure mode is usually the wear layer wearing through at high-traffic paths, not the click-lock failing. Engineered hardwood lasts 30-50 years (can be refinished 1-2 times), solid hardwood 50-100+ years (refinish 4-6 times), vinyl plank 20-30 years.",
  },
  {
    question: "Can laminate flooring be refinished or sanded?",
    answer:
      "No — laminate cannot be sanded or refinished. The surface is a photographic image sealed under an aluminum oxide wear layer (0.2-0.6mm thick). Sanding removes the image and exposes the HDF core, ruining the plank. When laminate wears out, full replacement is the only option. This is the biggest drawback vs hardwood (refinishable 4-6 times, $3-$5/sq ft per refinish). Workaround: replace individual damaged planks using a 'board replacement' technique (cut out damaged plank, glue in new one) — most pros charge $50-$100 per plank. Extend laminate life with felt pads on furniture feet, area rugs in high-traffic zones, and keeping pet nails trimmed. AC4-rated laminate outlasts AC3 by 5-8 years in busy households.",
  },
  {
    question: "How to clean laminate flooring without damaging it?",
    answer:
      "Dry cleaning is preferred: vacuum with hard-floor attachment (no beater bar) or microfiber mop daily to remove grit that scratches the wear layer. For damp cleaning: use a barely-damp microfiber mop (spray bottle with 1 teaspoon dish soap per quart of warm water — never soak). Avoid: steam mops (forced moisture swells the HDF core), vinegar/ammonia/bleach (etch the aluminum oxide finish), wax or polish (leaves cloudy residue on laminate), and excess water at seams. Spot-clean spills within 5 minutes — liquid left standing seeps into joints and causes swelling that can't be repaired. For pet stains, use enzyme cleaners specifically labeled safe for laminate (Bona, Bruce). Re-apply seam sealant annually in wet areas.",
  },
];
