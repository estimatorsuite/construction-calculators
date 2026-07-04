// ========================================================================
// Plumbing Cost Calculator — 数据层
// 供 components/plumbing-estimate-calculator.tsx 和 page.tsx 共用
// ========================================================================

export type PlumbingJobType =
  | "water-heater-tank"
  | "water-heater-tankless"
  | "toilet-replace"
  | "faucet-replace";

export type EquipmentTier = "basic" | "standard" | "premium";

export const JOB_TYPE_LABELS: Record<PlumbingJobType, string> = {
  "water-heater-tank": "Water Heater (Tank)",
  "water-heater-tankless": "Tankless Water Heater",
  "toilet-replace": "Toilet Replacement",
  "faucet-replace": "Faucet Replacement",
};

export const TIER_LABELS: Record<EquipmentTier, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

// 表单状态
export interface CalculatorState {
  jobType: PlumbingJobType;
  equipmentTier: EquipmentTier;
  quantity: number;
  laborRatePerHour: number;
  includePermit: boolean;
  includeEmergencyCall: boolean;
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
// 来源：2026 US 市场均价（Home Depot / SupplyHouse / Ferguson 批发价）
// ========================================================================

interface EquipmentItem {
  name: string;
  cost: number;
}

export const equipmentPricing: Record<
  PlumbingJobType,
  Record<EquipmentTier, EquipmentItem>
> = {
  "water-heater-tank": {
    basic: { name: "40-gal gas water heater", cost: 750 },
    standard: { name: "50-gal gas water heater", cost: 950 },
    premium: { name: "75-gal power-vent heater", cost: 1500 },
  },
  "water-heater-tankless": {
    basic: { name: "Tankless 7 GPM (140k BTU)", cost: 1200 },
    standard: { name: "Tankless 9 GPM (180k BTU)", cost: 1700 },
    premium: { name: "Tankless 11 GPM condensing", cost: 2400 },
  },
  "toilet-replace": {
    basic: { name: "Standard 2-piece toilet", cost: 150 },
    standard: { name: "Chair-height elongated toilet", cost: 300 },
    premium: { name: "Smart toilet (TOTO tier)", cost: 1200 },
  },
  "faucet-replace": {
    basic: { name: "Standard bathroom faucet", cost: 60 },
    standard: { name: "Kitchen pull-down faucet", cost: 180 },
    premium: { name: "Touchless / smart faucet", cost: 450 },
  },
};

// ========================================================================
// 辅料定价（每种工作类型一组，按 unit 计）
// ========================================================================

interface MaterialItem {
  name: string;
  cost: number;
}

export const materialsByJobType: Record<PlumbingJobType, MaterialItem[]> = {
  "water-heater-tank": [
    { name: "T&P valve + overflow tube", cost: 35 },
    { name: "Water connectors (flex)", cost: 25 },
    { name: "Gas shut-off valve", cost: 30 },
    { name: "Vent pipe (type-B)", cost: 45 },
    { name: "Expansion tank", cost: 45 },
    { name: "Drip pan", cost: 20 },
    { name: "Pipe dope, tape, misc", cost: 25 },
  ],
  "water-heater-tankless": [
    { name: "Gas line upgrade", cost: 120 },
    { name: "Stainless vent pipe (cat III)", cost: 180 },
    { name: "Isolation valve kit", cost: 60 },
    { name: "Water connectors", cost: 35 },
    { name: "Pressure relief valve", cost: 35 },
    { name: "Misc fittings + sealant", cost: 30 },
  ],
  "toilet-replace": [
    { name: "Wax ring (jumbo)", cost: 8 },
    { name: "Supply line (braided)", cost: 12 },
    { name: "Closet bolts", cost: 5 },
    { name: "Caulk", cost: 5 },
  ],
  "faucet-replace": [
    { name: "Supply lines (2x braided)", cost: 15 },
    { name: "Plumber's putty", cost: 5 },
    { name: "Teflon tape + misc", cost: 5 },
  ],
};

// ========================================================================
// 许可费用（按 jobType，toilet/faucet 无需许可）
// ========================================================================

export const PERMIT_COSTS: Record<PlumbingJobType, number> = {
  "water-heater-tank": 100,
  "water-heater-tankless": 150,
  "toilet-replace": 0,
  "faucet-replace": 0,
};

// 紧急上门费（非工作时间固定附加）
export const EMERGENCY_SURCHARGE = 150;

// ========================================================================
// 默认工时（按 unit 计）
// ========================================================================

export const DEFAULT_LABOR_HOURS: Record<PlumbingJobType, number> = {
  "water-heater-tank": 3,
  "water-heater-tankless": 6,
  "toilet-replace": 1.5,
  "faucet-replace": 1,
};

// ========================================================================
// 利润率选项（与 HVAC / Roofing 保持一致）
// ========================================================================

export const PROFIT_MARGINS = [10, 15, 20, 25, 30, 35, 40] as const;

// ========================================================================
// 全国均价参考数据（2026）
// 来源：HomeAdvisor / Angi 公开定价数据，含设备 + 材料 + 人工 + 许可
// ========================================================================

export interface NationalAverage {
  jobType: PlumbingJobType;
  label: string;
  low: number;
  typical: number;
  high: number;
}

export const nationalAverages: NationalAverage[] = [
  {
    jobType: "water-heater-tank",
    label: "Water Heater Tank (50-gal)",
    low: 1200,
    typical: 1800,
    high: 2800,
  },
  {
    jobType: "water-heater-tankless",
    label: "Tankless Water Heater",
    low: 2500,
    typical: 3800,
    high: 6000,
  },
  {
    jobType: "toilet-replace",
    label: "Toilet Installation",
    low: 250,
    typical: 400,
    high: 700,
  },
  {
    jobType: "faucet-replace",
    label: "Faucet Installation",
    low: 180,
    typical: 300,
    high: 550,
  },
];

// ========================================================================
// 计算函数
// ========================================================================

/** 计算设备成本（单价 × 数量） */
export function calcEquipment(
  jobType: PlumbingJobType,
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
  jobType: PlumbingJobType,
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

/** 计算人工成本（工时 × 费率 + 可选紧急上门费） */
export function calcLabor(
  jobType: PlumbingJobType,
  quantity: number,
  laborRate: number,
  includeEmergency: boolean
): EstimateLineItem[] {
  const hoursPerUnit = DEFAULT_LABOR_HOURS[jobType];
  const totalHours = Math.round(hoursPerUnit * quantity);
  const laborCost = totalHours * laborRate;

  const items: EstimateLineItem[] = [
    {
      category: "Labor",
      item: `Installation (${totalHours} hrs × $${laborRate}/hr)`,
      quantity: totalHours,
      unitCost: laborRate,
      total: laborCost,
    },
  ];

  if (includeEmergency) {
    items.push({
      category: "Labor",
      item: "Emergency / after-hours call-out fee",
      quantity: 1,
      unitCost: EMERGENCY_SURCHARGE,
      total: EMERGENCY_SURCHARGE,
      optional: true,
    });
  }

  return items;
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
    state.laborRatePerHour,
    state.includeEmergencyCall
  );

  // 许可费（toilet/faucet 自动为 0，includePermit 开关不影响）
  const permitCost =
    state.includePermit && PERMIT_COSTS[state.jobType] > 0
      ? PERMIT_COSTS[state.jobType]
      : 0;
  const permits: EstimateLineItem[] =
    permitCost > 0
      ? [
          {
            category: "Permits",
            item: "Plumbing permit + inspection",
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
export function getDefaultState(jobType?: PlumbingJobType): CalculatorState {
  const job: PlumbingJobType = jobType ?? "water-heater-tank";
  return {
    jobType: job,
    equipmentTier: "standard",
    quantity: 1,
    laborRatePerHour: 85,
    includePermit: PERMIT_COSTS[job] > 0,
    includeEmergencyCall: false,
    profitMarginPercent: 25,
  };
}
