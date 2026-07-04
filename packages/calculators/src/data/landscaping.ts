// ========================================================================
// Landscaping Cost Calculator — 数据层
// 供 components/landscaping-estimate-calculator.tsx 和 page.tsx 共用
// ========================================================================

export type LandscapingJobType =
  | "sod-installation"
  | "patio-installation"
  | "mulch-planting"
  | "irrigation-system";

export type EquipmentTier = "basic" | "standard" | "premium";

export const JOB_TYPE_LABELS: Record<LandscapingJobType, string> = {
  "sod-installation": "Sod Installation",
  "patio-installation": "Patio Installation",
  "mulch-planting": "Mulch & Planting",
  "irrigation-system": "Irrigation System",
};

export const TIER_LABELS: Record<EquipmentTier, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

// 表单状态
export interface CalculatorState {
  jobType: LandscapingJobType;
  equipmentTier: EquipmentTier;
  quantity: number;
  laborRatePerHour: number;
  includePermit: boolean;
  profitMarginPercent: number;
}

// 成本行项
export interface EstimateLineItem {
  category: "Equipment" | "Materials" | "Labor" | "Permits";
  item: string;
  quantity: number;
  unitCost: number;
  total: number;
  optional?: boolean;
}

// 计算结果
export interface CostBreakdown {
  equipmentTotal: number;
  materialsTotal: number;
  laborTotal: number;
  permitsTotal: number;
  subtotal: number;
  profitAmount: number;
  grandTotal: number;
  lineItems: EstimateLineItem[];
}

// ========================================================================
// 设备定价（4 种工作类型 × 3 档次）
// Unit = 1 typical residential job:
//   - sod: 1,000 sq ft lawn
//   - patio: 200 sq ft paver patio
//   - mulch-planting: 500 sq ft garden bed refresh
//   - irrigation: 4-zone residential system
// 来源：2026 US 市场均价（Home Depot / SiteOne / 当地 nursery 批发价）
// ========================================================================

interface EquipmentItem {
  name: string;
  cost: number;
}

export const equipmentPricing: Record<
  LandscapingJobType,
  Record<EquipmentTier, EquipmentItem>
> = {
  "sod-installation": {
    basic: { name: "Builder-grade fescue sod (1,000 sq ft)", cost: 700 },
    standard: {
      name: "Premium fescue/bluegrass blend (1,000 sq ft)",
      cost: 1100,
    },
    premium: { name: "Zoysia/Bermuda sod (1,000 sq ft)", cost: 1800 },
  },
  "patio-installation": {
    basic: { name: "Concrete paver stones (200 sq ft)", cost: 600 },
    standard: { name: "Natural bluestone pavers (200 sq ft)", cost: 1100 },
    premium: { name: "Flagstone / travertine (200 sq ft)", cost: 2200 },
  },
  "mulch-planting": {
    basic: { name: "Dyed mulch + 5 starter shrubs", cost: 300 },
    standard: {
      name: "Hardwood mulch + 5 shrubs + 10 perennials",
      cost: 600,
    },
    premium: {
      name: "Hardwood mulch + specimen plants + designer shrubs",
      cost: 1200,
    },
  },
  "irrigation-system": {
    basic: {
      name: "4-zone basic controller + sprinkler heads",
      cost: 800,
    },
    standard: {
      name: "6-zone smart controller + rain sensor + drip lines",
      cost: 1500,
    },
    premium: {
      name: "8-zone WiFi smart controller + full drip irrigation",
      cost: 2400,
    },
  },
};

// ========================================================================
// 辅料定价（每种工作类型一组，按 unit 计）
// ========================================================================

interface MaterialItem {
  name: string;
  cost: number;
}

export const materialsByJobType: Record<LandscapingJobType, MaterialItem[]> = {
  "sod-installation": [
    { name: "Starter fertilizer", cost: 40 },
    { name: "Topsoil (3 cu yd)", cost: 180 },
    { name: "Lawn roller rental", cost: 40 },
    { name: "Soil prep / grading misc", cost: 30 },
  ],
  "patio-installation": [
    { name: "Paver base (crushed stone, 3 cu yd)", cost: 135 },
    { name: "Paver sand (1 ton)", cost: 35 },
    { name: "Aluminum edging", cost: 50 },
    { name: "Polymeric sand", cost: 30 },
    { name: "Misc gravel + leveling", cost: 25 },
  ],
  "mulch-planting": [
    { name: "Hardwood mulch (3 cu yd)", cost: 150 },
    { name: "Compost (1 cu yd)", cost: 40 },
    { name: "Bed edging", cost: 30 },
    { name: "Planting tools + spike", cost: 20 },
  ],
  "irrigation-system": [
    { name: "PVC pipe + fittings", cost: 120 },
    { name: "Sprinkler heads (8-pack)", cost: 80 },
    { name: "Valve box + manifold", cost: 60 },
    { name: "Wire + connectors", cost: 25 },
  ],
};

// ========================================================================
// 许可费用（sod/mulch-planting 无需许可）
// ========================================================================

export const PERMIT_COSTS: Record<LandscapingJobType, number> = {
  "sod-installation": 0,
  "patio-installation": 75, // 部分 jurisdiction 对硬质景观 drainage 改动需 permit
  "mulch-planting": 0,
  "irrigation-system": 100, // backflow preventer 检查许可
};

// ========================================================================
// 默认工时（按 unit 计，2-4 person crew job-time）
// ========================================================================

export const DEFAULT_LABOR_HOURS: Record<LandscapingJobType, number> = {
  "sod-installation": 6, // 1000 sq ft by 2-person crew
  "patio-installation": 16, // 200 sq ft paver install w/ excavation + base
  "mulch-planting": 4, // 500 sq ft bed refresh
  "irrigation-system": 8, // 4-zone system install
};

// ========================================================================
// 利润率选项（与其他计算器保持一致）
// Landscaping 典型 margin 23–33%（来源：lib/markup-calculator-data.ts）
// ========================================================================

export const PROFIT_MARGINS = [10, 15, 20, 25, 30, 35, 40] as const;

// ========================================================================
// 全国均价参考数据（2026）
// 来源：HomeAdvisor / Angi / Fixr 公开定价数据
// ========================================================================

export interface NationalAverage {
  jobType: LandscapingJobType;
  label: string;
  low: number;
  typical: number;
  high: number;
}

export const nationalAverages: NationalAverage[] = [
  {
    jobType: "sod-installation",
    label: "Sod Installation (1,000 sq ft)",
    low: 1000,
    typical: 1800,
    high: 3000,
  },
  {
    jobType: "patio-installation",
    label: "Paver Patio Installation (200 sq ft)",
    low: 2000,
    typical: 3500,
    high: 6000,
  },
  {
    jobType: "mulch-planting",
    label: "Mulch & Planting (garden bed refresh)",
    low: 400,
    typical: 800,
    high: 1500,
  },
  {
    jobType: "irrigation-system",
    label: "Irrigation System (4–6 zones)",
    low: 2000,
    typical: 3200,
    high: 5500,
  },
];

// ========================================================================
// 计算函数
// ========================================================================

/** 计算设备成本（单价 × 数量） */
export function calcEquipment(
  jobType: LandscapingJobType,
  tier: EquipmentTier,
  quantity: number
): EstimateLineItem[] {
  const item = equipmentPricing[jobType][tier];
  return [
    {
      category: "Equipment",
      item: item.name,
      quantity,
      unitCost: item.cost,
      total: item.cost * quantity,
    },
  ];
}

/** 计算辅料成本（按 unit 乘以数量） */
export function calcMaterials(
  jobType: LandscapingJobType,
  quantity: number
): EstimateLineItem[] {
  return materialsByJobType[jobType].map((m) => ({
    category: "Materials" as const,
    item: m.name,
    quantity,
    unitCost: m.cost,
    total: m.cost * quantity,
  }));
}

/** 计算人工成本（工时 × 费率） */
export function calcLabor(
  jobType: LandscapingJobType,
  quantity: number,
  laborRate: number
): EstimateLineItem[] {
  const hoursPerUnit = DEFAULT_LABOR_HOURS[jobType];
  const totalHours = Math.round(hoursPerUnit * quantity);
  const laborCost = totalHours * laborRate;

  return [
    {
      category: "Labor",
      item: `Installation (${totalHours} hrs × $${laborRate}/hr)`,
      quantity: totalHours,
      unitCost: laborRate,
      total: laborCost,
    },
  ];
}

/** 完整成本计算 */
export function calculateBreakdown(state: CalculatorState): CostBreakdown {
  const equipment = calcEquipment(
    state.jobType,
    state.equipmentTier,
    state.quantity
  );
  const materials = calcMaterials(state.jobType, state.quantity);
  const labor = calcLabor(
    state.jobType,
    state.quantity,
    state.laborRatePerHour
  );

  const permitCost =
    state.includePermit && PERMIT_COSTS[state.jobType] > 0
      ? PERMIT_COSTS[state.jobType]
      : 0;
  const permits: EstimateLineItem[] =
    permitCost > 0
      ? [
          {
            category: "Permits",
            item: "Hardscape / irrigation permit + inspection",
            quantity: 1,
            unitCost: permitCost,
            total: permitCost,
            optional: true,
          },
        ]
      : [];

  const lineItems = [...equipment, ...materials, ...labor, ...permits];

  const equipmentTotal = equipment.reduce((sum, i) => sum + i.total, 0);
  const materialsTotal = materials.reduce((sum, i) => sum + i.total, 0);
  const laborTotal = labor.reduce((sum, i) => sum + i.total, 0);
  const permitsTotal = permits.reduce((sum, i) => sum + i.total, 0);

  const subtotal =
    equipmentTotal + materialsTotal + laborTotal + permitsTotal;
  const profitAmount = Math.round(
    subtotal * (state.profitMarginPercent / 100)
  );
  const grandTotal = subtotal + profitAmount;

  return {
    equipmentTotal,
    materialsTotal,
    laborTotal,
    permitsTotal,
    subtotal,
    profitAmount,
    grandTotal,
    lineItems,
  };
}

/** 默认状态 */
export function getDefaultState(
  jobType?: LandscapingJobType
): CalculatorState {
  const job: LandscapingJobType = jobType ?? "sod-installation";
  return {
    jobType: job,
    equipmentTier: "standard",
    quantity: 1,
    laborRatePerHour: 50,
    includePermit: PERMIT_COSTS[job] > 0,
    profitMarginPercent: 25,
  };
}
