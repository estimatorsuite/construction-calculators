// ========================================================================
// Electrical Cost Calculator — 数据层
// 供 components/electrical-estimate-calculator.tsx 和 page.tsx 共用
// ========================================================================

export type ElectricalJobType =
  | "panel-upgrade"
  | "outlet-install"
  | "light-fixture"
  | "ev-charger";

export type EquipmentTier = "basic" | "standard" | "premium";

export const JOB_TYPE_LABELS: Record<ElectricalJobType, string> = {
  "panel-upgrade": "Service Panel Upgrade",
  "outlet-install": "Outlet Installation",
  "light-fixture": "Light Fixture Installation",
  "ev-charger": "EV Charger Installation",
};

export const TIER_LABELS: Record<EquipmentTier, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

// 表单状态
export interface CalculatorState {
  jobType: ElectricalJobType;
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
// 来源：2026 US 市场均价（Home Depot / Lowe's / 供应链批发价）
// ========================================================================

interface EquipmentItem {
  name: string;
  cost: number;
}

export const equipmentPricing: Record<
  ElectricalJobType,
  Record<EquipmentTier, EquipmentItem>
> = {
  "panel-upgrade": {
    basic: { name: "100-amp panel (like-for-like swap)", cost: 400 },
    standard: { name: "200-amp panel upgrade", cost: 800 },
    premium: {
      name: "200-amp panel + whole-house surge protector",
      cost: 1200,
    },
  },
  "outlet-install": {
    basic: { name: "Standard 15A duplex receptacle", cost: 5 },
    standard: { name: "20A GFCI outlet", cost: 25 },
    premium: { name: "Smart outlet (Leviton Decora Smart)", cost: 45 },
  },
  "light-fixture": {
    basic: { name: "Flush-mount LED fixture", cost: 40 },
    standard: { name: "Designer pendant / chandelier", cost: 150 },
    premium: { name: "Smart recessed lighting (4-pack)", cost: 200 },
  },
  "ev-charger": {
    basic: { name: "Level 1 (120V outlet only)", cost: 0 },
    standard: { name: "Level 2 hardwired 32A charger", cost: 500 },
    premium: { name: "Level 2 smart 48A (WiFi)", cost: 700 },
  },
};

// ========================================================================
// 辅料定价（每种工作类型一组，按 unit 计）
// ========================================================================

interface MaterialItem {
  name: string;
  cost: number;
}

export const materialsByJobType: Record<ElectricalJobType, MaterialItem[]> = {
  "panel-upgrade": [
    { name: "Breakers (assorted)", cost: 80 },
    { name: "Main breaker", cost: 45 },
    { name: "Grounding rod + wire", cost: 60 },
    { name: "Conduit + fittings", cost: 40 },
    { name: "SER cable (4/0 aluminum)", cost: 120 },
    { name: "Connectors, labels, misc", cost: 25 },
  ],
  "outlet-install": [
    { name: "Electrical box (old-work)", cost: 3 },
    { name: "Wire (14/2 NM-B, 15ft avg)", cost: 12 },
    { name: "Wire nuts + tape", cost: 3 },
  ],
  "light-fixture": [
    { name: "Electrical box", cost: 5 },
    { name: "Wire nuts", cost: 2 },
    { name: "Hardware + brackets", cost: 3 },
  ],
  "ev-charger": [
    { name: "240V breaker (50A 2-pole)", cost: 15 },
    { name: "Wire (6/3 NM-B, 30ft avg)", cost: 45 },
    { name: "Conduit + fittings", cost: 20 },
    { name: "Misc connectors", cost: 10 },
  ],
};

// ========================================================================
// 许可费用（outlet/light-fixture 无需许可）
// ========================================================================

export const PERMIT_COSTS: Record<ElectricalJobType, number> = {
  "panel-upgrade": 150,
  "outlet-install": 0,
  "light-fixture": 0,
  "ev-charger": 50,
};

// ========================================================================
// 默认工时（按 unit 计）
// ========================================================================

export const DEFAULT_LABOR_HOURS: Record<ElectricalJobType, number> = {
  "panel-upgrade": 8,
  "outlet-install": 1.5,
  "light-fixture": 1,
  "ev-charger": 3,
};

// ========================================================================
// 利润率选项（与其他计算器保持一致）
// ========================================================================

export const PROFIT_MARGINS = [10, 15, 20, 25, 30, 35, 40] as const;

// ========================================================================
// 全国均价参考数据（2026）
// 来源：HomeAdvisor / Angi / Fixr 公开定价数据
// ========================================================================

export interface NationalAverage {
  jobType: ElectricalJobType;
  label: string;
  low: number;
  typical: number;
  high: number;
}

export const nationalAverages: NationalAverage[] = [
  {
    jobType: "panel-upgrade",
    label: "Panel Upgrade (100→200A)",
    low: 1500,
    typical: 2500,
    high: 4000,
  },
  {
    jobType: "outlet-install",
    label: "Outlet Installation",
    low: 100,
    typical: 200,
    high: 350,
  },
  {
    jobType: "light-fixture",
    label: "Light Fixture Installation",
    low: 80,
    typical: 180,
    high: 400,
  },
  {
    jobType: "ev-charger",
    label: "EV Charger Installation",
    low: 500,
    typical: 1000,
    high: 1800,
  },
];

// ========================================================================
// 计算函数
// ========================================================================

/** 计算设备成本（单价 × 数量） */
export function calcEquipment(
  jobType: ElectricalJobType,
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
  jobType: ElectricalJobType,
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
  jobType: ElectricalJobType,
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
            item: "Electrical permit + inspection",
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
export function getDefaultState(jobType?: ElectricalJobType): CalculatorState {
  const job: ElectricalJobType = jobType ?? "panel-upgrade";
  return {
    jobType: job,
    equipmentTier: "standard",
    quantity: 1,
    laborRatePerHour: 90,
    includePermit: PERMIT_COSTS[job] > 0,
    profitMarginPercent: 25,
  };
}
