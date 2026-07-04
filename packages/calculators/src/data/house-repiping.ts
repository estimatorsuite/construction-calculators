// lib/calculators/house-repiping-data.ts
// House Repiping Cost Calculator — 数据层
// 数据来源：Angi 2026 + HomeAdvisor 2026 + Homewyse May 2026
// 最后验证：2026-06-20
// ⚠️ 安全声明：所有水管工作必须由持牌水管工执行

// ========================================================================
// 类型定义
// ========================================================================

export type PipeMaterial = "pex" | "cpvc" | "copper";
export type Stories = 1 | 2;

export interface RepipingCalculatorState {
  houseSizeSqFt: number;
  bathrooms: number;
  material: PipeMaterial;
  stories: Stories;
}

export interface RepipingResult {
  estimatedFixtures: number;
  pipeLengthEstimate: number;     // 估算的总管长（ft）
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
  wallRepairCost: number;         // 干墙修复（额外）
  totalWithWallRepairLow: number;
  totalWithWallRepairHigh: number;
}

// ========================================================================
// 材料数据
// 来源：Angi 2026 + Stultz Plumbing 2026 + localservicecalculator 2026
// ========================================================================

export interface PipeMaterialPrice {
  label: string;
  description: string;
  perSqFtLow: number;             // $/sq ft（材料 + 人工，低档）
  perSqFtHigh: number;            // $/sq ft（材料 + 人工，高档）
  materialPerLinearFoot: number;  // 仅材料 $/linear ft
  lifespanYears: string;
  pros: string;
  cons: string;
}

export const PIPE_MATERIALS: Record<PipeMaterial, PipeMaterialPrice> = {
  pex: {
    label: "PEX (Cross-linked Polyethylene)",
    description: "Flexible plastic tubing. Most common for modern repipes since 2010.",
    perSqFtLow: 2,
    perSqFtHigh: 6,
    materialPerLinearFoot: 0.4,
    lifespanYears: "40-50 years",
    pros: "Cheapest, fastest install, freeze-resistant, no corrosion",
    cons: "Cannot be used outdoors, shorter lifespan than copper",
  },
  cpvc: {
    label: "CPVC (Chlorinated PVC)",
    description: "Rigid plastic pipe. Mid-range option, less common for whole-house repipe.",
    perSqFtLow: 3,
    perSqFtHigh: 5,
    materialPerLinearFoot: 0.8,
    lifespanYears: "50-75 years",
    pros: "Good heat resistance, affordable, easy to work with",
    cons: "Becomes brittle over time, not allowed in some jurisdictions",
  },
  copper: {
    label: "Copper (Type L)",
    description: "Traditional metal pipe. Premium option, longest lasting.",
    perSqFtLow: 4,
    perSqFtHigh: 8,
    materialPerLinearFoot: 2.5,
    lifespanYears: "50-100+ years",
    pros: "Longest lifespan, recyclable, UV-resistant, bacteriostatic",
    cons: "Most expensive, slower install, can corrode in acidic water",
  },
};

// ========================================================================
// 调整因子
// ========================================================================

// 每个浴室约对应 4-5 个 plumbing fixtures（sink, toilet, shower, tub, etc.）
export const FIXTURES_PER_BATHROOM = 4.5;

// 每 fixture 估算约 15 ft of pipe supply line (hot + cold)
export const PIPE_FT_PER_FIXTURE = 30;  // hot + cold lines combined

// 多一个浴室的成本乘数（因管路复杂度增加）
export const BATHROOM_MULTIPLIER = 0.15;  // 每多 1 个浴室加 15%

// 2 层楼的乘数（管路更复杂、需要穿层）
export const TWO_STORY_MULTIPLIER = 1.25;

// 干墙修复估算（repipe 后必须修复打开的墙面）
export const WALL_REPAIR_PER_SQ_FT = 4;   // $/sq ft for drywall patch + texture + paint
export const WALL_REPAIR_FACTOR = 0.15;    // repipe 通常需要打开 ~15% 的墙面

// ========================================================================
// 计算函数
// ========================================================================

export function calculateRepiping(state: RepipingCalculatorState): RepipingResult | null {
  if (state.houseSizeSqFt <= 0 || state.bathrooms <= 0) return null;

  const material = PIPE_MATERIALS[state.material];

  // 基础成本（按 sq ft 计算，含材料 + 人工）
  const baseCostLow = state.houseSizeSqFt * material.perSqFtLow;
  const baseCostHigh = state.houseSizeSqFt * material.perSqFtHigh;

  // 浴室乘数：第 1 个浴室是 baseline，每多 1 个加 15%
  const bathroomMultiplier = 1 + (state.bathrooms - 1) * BATHROOM_MULTIPLIER;

  // 楼层乘数
  const storiesMultiplier = state.stories === 2 ? TWO_STORY_MULTIPLIER : 1;

  // 总成本（含调整）
  const totalMultiplier = bathroomMultiplier * storiesMultiplier;
  const totalCostLow = Math.round(baseCostLow * totalMultiplier);
  const totalCostHigh = Math.round(baseCostHigh * totalMultiplier);

  // 拆分材料和人工（人工约占 70%，来源：Angi 2026）
  const laborRatio = 0.70;
  const laborCostLow = Math.round(totalCostLow * laborRatio);
  const laborCostHigh = Math.round(totalCostHigh * laborRatio);
  const materialCostLow = totalCostLow - laborCostLow;
  const materialCostHigh = totalCostHigh - laborCostHigh;

  // 估算 fixtures 和 pipe length（用于显示）
  const estimatedFixtures = Math.round(state.bathrooms * FIXTURES_PER_BATHROOM + 4); // +4 for kitchen/laundry/etc
  const pipeLengthEstimate = Math.round(estimatedFixtures * PIPE_FT_PER_FIXTURE);

  // 干墙修复（额外成本，通常不包含在 repipe 报价中）
  const wallAreaOpened = state.houseSizeSqFt * WALL_REPAIR_FACTOR;
  const wallRepairCost = Math.round(wallAreaOpened * WALL_REPAIR_PER_SQ_FT);

  return {
    estimatedFixtures,
    pipeLengthEstimate,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow,
    totalCostHigh,
    costPerSqFtLow: Math.round((totalCostLow / state.houseSizeSqFt) * 10) / 10,
    costPerSqFtHigh: Math.round((totalCostHigh / state.houseSizeSqFt) * 10) / 10,
    wallRepairCost,
    totalWithWallRepairLow: totalCostLow + wallRepairCost,
    totalWithWallRepairHigh: totalCostHigh + wallRepairCost,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): RepipingCalculatorState {
  return {
    houseSizeSqFt: 2000,
    bathrooms: 2,
    material: "pex",
    stories: 1,
  };
}

// ========================================================================
// 成本拆解
// 来源：Angi 2026 "Labor makes up most of your home repiping costs, about 70%"
// ========================================================================

export const COST_BREAKDOWN = [
  {
    component: "Labor (licensed plumber)",
    percentage: "60-70%",
    description: "Cutting walls, removing old pipe, running new pipe, fittings, pressure test",
  },
  {
    component: "Materials (pipe + fittings)",
    percentage: "20-25%",
    description: "PEX/copper pipe, connectors, shutoff valves, manifolds",
  },
  {
    component: "Permits & inspection",
    percentage: "5-8%",
    description: "Required in most jurisdictions. Plumbing inspector sign-off.",
  },
  {
    component: "Wall repair (often separate)",
    percentage: "10-15% extra",
    description: "Drywall patching, texture, paint. Usually done by separate contractor.",
  },
];

// ========================================================================
// FAQ
// ========================================================================

export const repipingFaqs = [
  {
    question: "How much does it cost to repipe a house with PEX?",
    answer:
      "PEX repiping costs $4,000-$12,000 for a typical whole-house job (2,000 sq ft, 2 bathrooms). The average is $7,500. Material-only cost runs about $0.40-$2 per linear foot, but labor is the bigger driver (about 70% of total cost). PEX is 40-50% cheaper than copper because it installs faster — a 2-bathroom PEX repipe takes 1-2 days vs 3-5 days for copper.",
  },
  {
    question: "How much does it cost to repipe a house with copper?",
    answer:
      "Copper repiping costs $8,000-$18,000 for a typical whole-house job, roughly 2x the cost of PEX. Copper Type L pipe (the standard for residential) runs $2-$5 per linear foot for materials alone. The higher cost comes from slower installation — each joint must be soldered. Copper lasts 50-100+ years vs 40-50 for PEX, so it can be worth it if you plan to stay long-term.",
  },
  {
    question: "How long does a whole-house repipe take?",
    answer:
      "A PEX whole-house repipe takes 1-3 days for a licensed crew of 2-3 plumbers. Copper takes 3-7 days because each joint requires soldering. The job includes: (1) cutting access holes in walls, (2) removing old pipe, (3) running new pipe, (4) pressure testing, (5) patching walls. Wall repair is often done separately by a drywall contractor 2-5 days later. Total project time from start to finished walls: 1-2 weeks.",
  },
  {
    question: "Does homeowners insurance cover repiping?",
    answer:
      "Generally no — insurance covers sudden water damage (burst pipe), not proactive replacement of aging pipes. However, some policies offer a 'service line coverage' rider ($30-$50/year) that can help with repipe costs if the pipe has failed. If you're repiping because of an active leak that caused damage, the water damage may be covered but the pipe replacement itself usually isn't. Check your policy or call your agent before starting work.",
  },
  {
    question: "Should I choose PEX or copper for repiping?",
    answer:
      "PEX is the right choice for 80% of homes — it's cheaper, faster to install, freeze-resistant, and has a 40-50 year lifespan. Choose copper if: (1) you plan to stay 30+ years and want maximum lifespan, (2) your water is acidic (pH < 6.5) which degrades PEX faster, (3) you're in a high-end home where copper adds resale value, (4) your jurisdiction requires copper for fire sprinkler supply lines. Most plumbers recommend PEX unless there's a specific reason for copper.",
  },
  {
    question: "Can I repipe my house myself?",
    answer:
      "No — repiping requires a licensed plumber in all 50 states. Plumbing permits and inspections are mandatory. A DIY repipe that fails inspection means you must redo the work with a licensed plumber, often at 2x the original cost. More importantly, a failed repipe can cause catastrophic water damage ($10,000-$50,000+ in repairs). The liability and code compliance issues make DIY repiping one of the worst cost-saving ideas in home improvement. Use this calculator to budget, then hire a licensed professional.",
  },
  {
    question: "What are signs my house needs repiping?",
    answer:
      "Common signs: (1) frequent leaks (more than 1 per year), (2) discolored water (brown or yellow = corroding pipes), (3) low water pressure throughout the house, (4) pipes older than 40 years (especially galvanized steel or polybutylene), (5) visible corrosion on exposed pipes. Homes built 1978-1995 with polybutylene pipe (grey plastic) should repipe proactively — polybutylene has a known high failure rate and is no longer code-approved.",
  },
  {
    question: "How to prepare a house for repiping?",
    answer:
      "Clear 3 feet of access along all exterior walls where plumbers will cut into drywall — remove furniture, artwork, baseboard heaters, and wall-mounted TVs. Protect flooring with rosin paper or plastic sheeting ($30-$60). Shut off main water valve 2-3 hours before the crew arrives. Plan to be without water for 8-24 hours (1-3 days for copper). Arrange alternative shower/toilet access (neighbor, gym, hotel). Keep a list of all shut-off valve locations handy. Remove items from under sinks and clear attic/crawl space access paths. Budget $200-$500 for post-repipe drywall repair preparation.",
  },
  {
    question: "Is PEX pipe safe for drinking water?",
    answer:
      "Yes — PEX is approved for potable water by NSF International (NSF-61 standard) and adopted in all major US plumbing codes (IPC, UPC, IRC). Studies by the National Sanitation Foundation found PEX does not leach harmful chemicals at levels exceeding EPA limits. The main concern is MTBE and tert-butanol extractants, which show up in the first few days of use but dissipate quickly with flushing. Use only PEX-A or PEX-B with NSF certification — avoid uncertified imports. Copper is still marginally better for water quality (naturally bacteriostatic) but PEX is fully safe for drinking water when properly installed.",
  },
];
