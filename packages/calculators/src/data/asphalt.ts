// lib/calculators/asphalt-data.ts
// Asphalt Calculator — 数据层
// 数据来源：Angi 2026, HomeAdvisor 2026, NAPA (National Asphalt Pavement Assoc)
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type AsphaltProject = "driveway" | "parkingLot" | "walkway" | "patch";

export interface AsphaltState {
  lengthFt: number;
  widthFt: number;
  thicknessInches: number;
  projectType: AsphaltProject;
}

export interface AsphaltResult {
  areaSqFt: number;
  tonsNeeded: number;
  cubicYardsNeeded: number;
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
// Project type specs
// ========================================================================

export interface ProjectTypeSpec {
  label: string;
  description: string;
  defaultThickness: number;
  notes: string;
}

export const PROJECT_TYPES: Record<AsphaltProject, ProjectTypeSpec> = {
  driveway: {
    label: "Driveway (Residential)",
    description: "Standard residential driveway. Most common asphalt project.",
    defaultThickness: 2,
    notes: '2" residential standard. 3" for heavy vehicles or RVs.',
  },
  parkingLot: {
    label: "Parking Lot (Commercial)",
    description: "Commercial parking lot. Higher traffic load requires thicker base.",
    defaultThickness: 4,
    notes: '4" commercial standard. May require subbase engineering.',
  },
  walkway: {
    label: "Walkway / Path",
    description: "Foot traffic only. Thinner profile acceptable.",
    defaultThickness: 2,
    notes: '2" sufficient for pedestrian traffic.',
  },
  patch: {
    label: "Patch / Repair",
    description: "Pothole or section repair. Uses hot or cold mix asphalt.",
    defaultThickness: 3,
    notes: '3" typical for pothole fill. Compact in 1" lifts.',
  },
};

// ========================================================================
// 物理常数（来源：NAPA — National Asphalt Pavement Association）
// ========================================================================

export const ASPHALT_DENSITY_LB_PER_CU_FT = 145;        // 典型密级配沥青混凝土
export const ASPHALT_DENSITY_TONS_PER_CU_YD = 1.96;     // 3,915 lb/cu yd ÷ 2,000 = 1.96 tons

// ========================================================================
// 价格数据（2026，USD）
// 来源：Angi 2026 Asphalt Driveway Cost + HomeAdvisor + NAPA pricing survey
// ========================================================================

export const COST_PER_TON_LOW = 100;         // material + delivery
export const COST_PER_TON_HIGH = 200;

export const LABOR_PER_SQ_FT_LOW = 1;        // grading, compaction, finishing
export const LABOR_PER_SQ_FT_HIGH = 3;

export const INSTALLED_PER_SQ_FT_LOW = 2;    // residential driveway (all-in)
export const INSTALLED_PER_SQ_FT_HIGH = 6;

// ========================================================================
// 计算函数
// 公式：tons = (length × width × thickness/12) / 27 × 1.96
// ========================================================================

export function calculateAsphalt(state: AsphaltState): AsphaltResult | null {
  if (state.lengthFt <= 0 || state.widthFt <= 0 || state.thicknessInches <= 0) return null;

  const thicknessInFeet = state.thicknessInches / 12;
  const areaSqFt = state.lengthFt * state.widthFt;
  const cubicFeet = areaSqFt * thicknessInFeet;
  const cubicYardsNeeded = cubicFeet / 27;
  const tonsNeeded = cubicYardsNeeded * ASPHALT_DENSITY_TONS_PER_CU_YD;

  // Material cost
  const materialCostLow = Math.round(tonsNeeded * COST_PER_TON_LOW);
  const materialCostHigh = Math.round(tonsNeeded * COST_PER_TON_HIGH);

  // Labor cost (grading, compaction, finishing)
  const laborCostLow = Math.round(areaSqFt * LABOR_PER_SQ_FT_LOW);
  const laborCostHigh = Math.round(areaSqFt * LABOR_PER_SQ_FT_HIGH);

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  // Cost per sq ft (installed)
  const costPerSqFtLow = Math.round((totalCostLow / areaSqFt) * 100) / 100;
  const costPerSqFtHigh = Math.round((totalCostHigh / areaSqFt) * 100) / 100;

  return {
    areaSqFt: Math.round(areaSqFt * 10) / 10,
    tonsNeeded: Math.round(tonsNeeded * 100) / 100,
    cubicYardsNeeded: Math.round(cubicYardsNeeded * 100) / 100,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow,
    totalCostHigh,
    costPerSqFtLow,
    costPerSqFtHigh,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): AsphaltState {
  return {
    lengthFt: 50,
    widthFt: 18,             // standard 2-car driveway
    thicknessInches: 2,
    projectType: "driveway",
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
    component: "Asphalt Material",
    percentage: "40-50%",
    description: "Hot mix asphalt delivered by truck. Priced per ton.",
  },
  {
    component: "Site Prep & Grading",
    percentage: "20-30%",
    description: "Excavation, grading, gravel base (6-8\" compacted), forms.",
  },
  {
    component: "Labor (Paving & Compaction)",
    percentage: "15-25%",
    description: "Machine paving, rolling, hand finishing, edge shaping.",
  },
  {
    component: "Equipment",
    percentage: "5-10%",
    description: "Paver, roller, skid steer, dump truck. Mobilization fee.",
  },
  {
    component: "Sealcoating (Optional)",
    percentage: "5-10%",
    description: "Coal tar or asphalt emulsion sealer. Recommended after 90-day cure.",
  },
];

// ========================================================================
// FAQ — 6 个真实问题
// ========================================================================

export const asphaltFaqs = [
  {
    question: "How much asphalt do I need?",
    answer:
      "Calculate by area and thickness. For a 2-car driveway (50×18 feet) at 2 inches thick: 50 × 18 × (2/12) = 150 cubic feet ÷ 27 = 5.56 cubic yards × 1.96 (asphalt density) = 10.9 tons. Most suppliers deliver in 3-5 ton minimum loads with a $100-$200 delivery fee. Use the calculator above to do this automatically for any size and thickness.",
  },
  {
    question: "How do I calculate tons of asphalt needed?",
    answer:
      "Tons = (length × width × thickness in feet) ÷ 27 × 1.96. The 1.96 factor converts cubic yards to tons based on asphalt density (145 lb/cu ft, or 3,915 lb/cu yd). Example: 1,000 sq ft at 3 inches thick = 1,000 × 0.25 ÷ 27 × 1.96 = 18.1 tons. Always round up and add 5% waste for spillage and edge shaping.",
  },
  {
    question: "How much does an asphalt driveway cost per square foot?",
    answer:
      "Asphalt driveways cost $2-$6 per square foot installed, with the national average around $4/sq ft. A standard 2-car driveway (900 sq ft) runs $1,800-$5,400. Cost varies by region (Northeast and West Coast 30% higher), thickness (3\" costs 50% more than 2\"), and site prep requirements. Concrete costs $5-$15/sq ft by comparison — asphalt is roughly half the price.",
  },
  {
    question: "How thick should an asphalt driveway be?",
    answer:
      "Residential driveways should be 2-3 inches thick after compaction. 2 inches is standard for passenger vehicles; 3 inches for heavy trucks or RVs. Commercial parking lots require 4+ inches. The base underneath matters more than the asphalt thickness — 6-8 inches of compacted gravel (crusher run or Class 5) is essential. Without proper base, even 4-inch asphalt will crack within 3-5 years.",
  },
  {
    question: "Is asphalt or concrete better for a driveway?",
    answer:
      "Asphalt costs $2-$6/sq ft vs concrete at $5-$15/sq ft — asphalt is 40-60% cheaper. Asphalt flexes with freeze-thaw cycles (less cracking in cold climates), while concrete is more durable in hot climates (won&apos;t soften). Asphalt lasts 15-20 years with sealcoating every 3-5 years; concrete lasts 30-40 years with minimal maintenance. For most homeowners, asphalt wins on cost-to-lifespan ratio.",
  },
  {
    question: "How long does an asphalt driveway last?",
    answer:
      "A properly installed asphalt driveway lasts 15-20 years. Key factors: base quality (6-8\" compacted gravel extends life by 5-10 years), drainage (standing water destroys asphalt in 5 years), and maintenance (sealcoat every 3-5 years adds 5-8 years of life). Without sealcoating, expect surface cracks within 2-3 years and major failure by year 12. Climate matters: freeze-thaw cycles reduce lifespan by 20-30%.",
  },
  {
    question: "Is recycled asphalt worth it for a driveway?",
    answer:
      "Recycled asphalt (millings) costs $0.50-$1.50/sq ft — about 60-80% cheaper than new asphalt ($2-$6/sq ft). It compacts well and looks similar to new asphalt initially. But recycled asphalt breaks down faster (8-12 years vs 15-20), fades more quickly, and may not meet local building code for residential driveways. It's a good budget option for rural properties or long driveways where appearance is less critical. For suburban homes where curb appeal matters, new asphalt or concrete is the better investment.",
  },
  {
    question: "How to maintain an asphalt driveway?",
    answer:
      "Three maintenance tasks extend asphalt driveway life: (1) Sealcoat every 3-5 years ($0.15-$0.25/sq ft, DIY or pro) — protects against UV and water penetration. (2) Fill cracks immediately when they appear ($2-$5/linear ft for hot rubber crack fill) — prevents water from undermining the base. (3) Ensure proper drainage — standing water is the #1 cause of premature asphalt failure. Total maintenance cost over 20 years: $1,500-$3,000. Skipping maintenance reduces driveway life by 5-8 years and doubles the cost per year of use.",
  },
];
