// lib/calculators/gutter-data.ts
// Gutter Installation Cost Calculator
// 数据来源：HomeAdvisor 2026, Angi 2026, This Old House 2026 Gutter Guide
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type GutterMaterial = "aluminum" | "vinyl" | "steel" | "copper";

export interface GutterCalculatorState {
  housePerimeterFt: number;
  material: GutterMaterial;
  includeDownspouts: boolean;
}

export interface GutterResult {
  linearFeet: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  downspoutCostLow: number;
  downspoutCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerLinearFootLow: number;
  costPerLinearFootHigh: number;
}

// ========================================================================
// 材料价格（2026 USD）
// 来源：HomeAdvisor 2026 Gutter Installation + Angi 2026 Gutter Cost Guide
// ========================================================================

export interface MaterialPrice {
  label: string;
  description: string;
  installedLow: number;            // $/linear ft（材料 + 人工，低档）
  installedHigh: number;           // $/linear ft（材料 + 人工，高档）
  materialOnlyPerLinearFt: number; // 仅材料费 $/linear ft
  laborPerLinearFt: { low: number; high: number };
  downspoutPerLinearFt: { low: number; high: number };
  lifespanYears: string;
}

export const MATERIAL_PRICES: Record<GutterMaterial, MaterialPrice> = {
  aluminum: {
    label: "Aluminum",
    description: "Most common. Seamless option available. 20-30 yr lifespan.",
    installedLow: 4,
    installedHigh: 9,
    materialOnlyPerLinearFt: 2.5,
    laborPerLinearFt: { low: 2, high: 5 },
    downspoutPerLinearFt: { low: 5, high: 8 },
    lifespanYears: "20-30 years",
  },
  vinyl: {
    label: "Vinyl (PVC)",
    description: "Cheapest, DIY-friendly. Cracks in cold. 15-20 yr lifespan.",
    installedLow: 3,
    installedHigh: 6,
    materialOnlyPerLinearFt: 1.5,
    laborPerLinearFt: { low: 1.5, high: 4 },
    downspoutPerLinearFt: { low: 4, high: 7 },
    lifespanYears: "15-20 years",
  },
  steel: {
    label: "Steel (Galvanized/Stainless)",
    description: "Durable, galvanized or stainless. 25-40 yr lifespan.",
    installedLow: 6,
    installedHigh: 12,
    materialOnlyPerLinearFt: 4,
    laborPerLinearFt: { low: 3, high: 6 },
    downspoutPerLinearFt: { low: 7, high: 10 },
    lifespanYears: "25-40 years",
  },
  copper: {
    label: "Copper",
    description: "Premium. Patina over time. 50-100+ yr lifespan.",
    installedLow: 15,
    installedHigh: 30,
    materialOnlyPerLinearFt: 12,
    laborPerLinearFt: { low: 5, high: 10 },
    downspoutPerLinearFt: { low: 15, high: 25 },
    lifespanYears: "50-100+ years",
  },
};

// 估算每 30 linear ft 屋顶边缘需 1 个 downspout，平均 downspout 高度 1 层 = 10 ft
const DOWNSPOUT_PER_LENGTH = 30;
const DOWNSPOUT_HEIGHT_FT = 10;

// ========================================================================
// 计算函数
// ========================================================================

export function calculateGutter(state: GutterCalculatorState): GutterResult | null {
  if (state.housePerimeterFt <= 0) return null;

  const lf = state.housePerimeterFt;
  const price = MATERIAL_PRICES[state.material];

  // 材料费
  const materialCostLow = Math.round(lf * price.materialOnlyPerLinearFt);
  const materialCostHigh = Math.round(lf * price.materialOnlyPerLinearFt * 1.3);

  // 人工费
  const laborCostLow = Math.round(lf * price.laborPerLinearFt.low);
  const laborCostHigh = Math.round(lf * price.laborPerLinearFt.high);

  // Downspout 费用（平均每 30 ft 屋顶 1 根 downspout × 10 ft 高度）
  const downspoutCount = Math.ceil(lf / DOWNSPOUT_PER_LENGTH);
  const downspoutLinearFt = downspoutCount * DOWNSPOUT_HEIGHT_FT;
  const downspoutCostLow = state.includeDownspouts
    ? Math.round(downspoutLinearFt * price.downspoutPerLinearFt.low)
    : 0;
  const downspoutCostHigh = state.includeDownspouts
    ? Math.round(downspoutLinearFt * price.downspoutPerLinearFt.high)
    : 0;

  const totalCostLow = materialCostLow + laborCostLow + downspoutCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh + downspoutCostHigh;

  return {
    linearFeet: lf,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    downspoutCostLow,
    downspoutCostHigh,
    totalCostLow,
    totalCostHigh,
    costPerLinearFootLow: Math.round((totalCostLow / lf) * 10) / 10,
    costPerLinearFootHigh: Math.round((totalCostHigh / lf) * 10) / 10,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): GutterCalculatorState {
  return {
    housePerimeterFt: 200,
    material: "aluminum",
    includeDownspouts: true,
  };
}

// ========================================================================
// 成本拆解（用于 Cost Breakdown Table）
// 来源：RSMeans 2026 + contractor survey data
// ========================================================================

export const COST_BREAKDOWN = [
  {
    component: "Materials (gutter + fasteners)",
    percentage: "40-50%",
    description: "Gutter sections, hangers, brackets, screws, sealant, end caps",
  },
  {
    component: "Labor",
    percentage: "35-45%",
    description: "Removal of old gutters (if replacing), new install, downspout setup",
  },
  {
    component: "Downspouts & extensions",
    percentage: "10-15%",
    description: "Downspout pipe, elbows, splash blocks, underground drains",
  },
  {
    component: "Old gutter removal & disposal",
    percentage: "5-10%",
    description: "Tear-off, haul-away, dumpster rental $200-$500",
  },
];

// ========================================================================
// FAQ — 6+ 个
// ========================================================================

export const gutterFaqs = [
  {
    question: "How much do gutters cost per linear foot?",
    answer:
      "Gutter installation costs $3-$30 per linear foot installed in 2026, depending on material. Vinyl gutters are cheapest at $3-$6/linear ft. Aluminum (the most common choice) costs $4-$9/linear ft. Steel gutters run $6-$12/linear ft. Copper gutters are premium at $15-$30/linear ft. These prices include both materials and labor. For a typical 2,000 sq ft house needing ~200 linear feet of gutters, total cost ranges from $600 (vinyl, DIY) to $6,000 (copper, professional install). Downspouts add $5-$10/linear ft separately. Use the calculator above for exact estimates.",
  },
  {
    question: "Seamless vs sectional gutters — which is better?",
    answer:
      "Seamless gutters are better for most homes. They're custom-extruded on-site from a single piece of aluminum, so there are no joints along the run — only at corners and downspouts. This means fewer leak points and a cleaner look. Seamless aluminum costs $8-$15/linear ft installed vs $4-$9 for sectional. Sectional gutters (vinyl, some steel) come in 10-ft or 20-ft pre-cut pieces joined with connectors. The joints leak over time, typically within 5-10 years. If budget allows, choose seamless aluminum. If DIY-installing on a tight budget, sectional vinyl works for a 10-15 year solution.",
  },
  {
    question: "Can I install gutters myself?",
    answer:
      "Yes for vinyl and some aluminum sectional systems; no for seamless. Vinyl gutters from Home Depot or Lowe's cost $3-$6/linear ft and are fully DIY-able with basic tools (hacksaw, drill, level, tape measure, ladder). Plan 1-2 days for a typical house. Seamless gutters require a $2,000-$5,000 extruding machine that only pros own. Steel and copper gutters also require pro installation — copper in particular needs soldering skills. The biggest DIY risk is incorrect slope (gutters need 1/4\" drop per 10 ft toward downspout). Wrong slope = standing water = mosquito breeding + ice damage in winter.",
  },
  {
    question: "Is copper gutter worth the cost?",
    answer:
      "Copper gutters are worth it only for premium homes ($500K+) where they add architectural character and match copper roofs, bay windows, or high-end trim. Copper costs $15-$30/linear ft vs $4-$9 for aluminum — that's 3-5x more. But copper lasts 50-100+ years (vs 20-30 for aluminum), develops a sought-after patina, and won't corrode. On a 200-linear-ft house, copper adds $4,000-$10,000 to the job. For most homes, aluminum is the better value: you can replace aluminum gutters 3-4 times for the cost of one copper install. Choose copper if you plan to stay 20+ years and the home's architecture supports it.",
  },
  {
    question: "How long do gutters last?",
    answer:
      "Gutter lifespan by material: vinyl 15-20 years, aluminum 20-30 years, galvanized steel 25-40 years, copper 50-100+ years. The most common failure mode isn't material degradation — it's improper installation. Sagging from undersized hangers, leaking seams on sectional systems, and clogged downspouts that cause water to back up and freeze account for 80% of premature failures. With proper installation and annual cleaning, aluminum gutters easily reach 30+ years. Without maintenance, even copper gutters fail at the joints within 15-20 years. Clean gutters twice a year (spring + fall) and inspect hangers every 5 years.",
  },
  {
    question: "How much do gutter guards cost and do they work?",
    answer:
      "Gutter guards cost $1.50-$10 per linear foot installed, adding $300-$2,000 to a typical gutter project. Mesh screen guards are cheapest ($1.50-$3/ft) and work well for leaves but let in small debris. Micro-mesh ($3-$6/ft) blocks pine needles and shingle grit. Reverse-curve/surface-tension guards ($6-$10/ft) are most effective but expensive. Do they work? Yes — they reduce cleaning frequency from 2x/year to every 2-3 years. But they're not maintenance-free: small debris still accumulates and guards make deep cleaning harder. Best value: aluminum micro-mesh on new aluminum gutters. Worst value: cheap plastic screens on old gutters (they crack within 2-3 years).",
  },
  {
    question: "Do gutter guards really eliminate cleaning?",
    answer:
      "No gutter guard eliminates cleaning — but a good system cuts frequency from 2x/year to every 2-3 years. Consumer Reports tested 16 guards in 2025 and found none worked perfectly: pine needles, shingle grit, and seed pods still got through most models. Reverse-curve guards (LeafGuard, Gutter Helmet) performed best but cost $20-$35/linear ft installed (5-10x more than basic mesh). Best value: aluminum micro-mesh bolted on (not slipped under shingles) at $3-$6/linear ft. Avoid: plastic screens (UV-degrade in 3-5 years), foam inserts (clog with shingle grit, breed mosquitoes), and snap-in brush types (trap debris). Total payback vs annual pro cleaning ($150-$300): 7-12 years for mid-tier guards.",
  },
  {
    question: "How to clean gutters without a ladder?",
    answer:
      "Three options: (1) Extension wand with curved end ($40-$80) attaches to your garden hose — reach up to 25 feet from the ground. Works for loose debris but not packed leaves or granular buildup. (2) Telescoping gutter cleaning kit with shop vac attachment ($120-$200, like the Shop-Vac 925-50-00) — 18-foot reach, vacuum or blow debris from the ground. (3) Leaf blower extension tube ($60-$150, Ryobi/Milwaukee) — powerful but can damage loose gutter spikes if you hit them. Best for single-story homes. For two-story gutters (25+ feet), hire a pro — extension tools get dangerous and ineffective at that height. Pro cleaning: $150-$300 per visit, twice a year recommended.",
  },
];
