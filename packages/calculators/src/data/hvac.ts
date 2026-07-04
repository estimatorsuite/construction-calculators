// ========================================================================
// HVAC Estimate Calculator — 数据层
// 供 components/hvac-estimate-calculator.tsx 和 page.tsx 共用
// ========================================================================

export type HVACSystemType =
  | "central-ac"
  | "heat-pump"
  | "furnace-ac"
  | "mini-split";

export type Tonnage = 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5;

export const TONNAGE_OPTIONS: Tonnage[] = [1.5, 2, 2.5, 3, 3.5, 4, 5];

export const SYSTEM_LABELS: Record<HVACSystemType, string> = {
  "central-ac": "Central AC Replacement",
  "heat-pump": "Heat Pump Installation",
  "furnace-ac": "Furnace + AC Combo",
  "mini-split": "Ductless Mini-Split",
};

// 表单状态
export interface CalculatorState {
  systemType: HVACSystemType;
  homeSizeSqFt: number;
  tonnage: Tonnage;
  laborHours: number;
  laborRatePerHour: number;
  includeDuctwork: boolean;
  includeThermostat: boolean;
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
// 设备定价数据（以 3 吨为基准，含 perTonCost 缩放因子）
// 来源：templates-data.ts HVAC 模板 + 行业均价参考
// ========================================================================

interface EquipmentItem {
  name: string;
  baseCost: number;
  perTonCost?: number;
}

export const equipmentPricing: Record<HVACSystemType, EquipmentItem[]> = {
  "central-ac": [
    { name: "Condenser unit", baseCost: 1800, perTonCost: 117 },
    { name: "Air handler with coil", baseCost: 1200, perTonCost: 67 },
    { name: "Refrigerant line set (25 ft)", baseCost: 185 },
  ],
  "heat-pump": [
    { name: "Heat pump outdoor unit", baseCost: 2200, perTonCost: 150 },
    { name: "Air handler with coil", baseCost: 1200, perTonCost: 67 },
    { name: "Refrigerant line set (25 ft)", baseCost: 185 },
  ],
  "furnace-ac": [
    { name: "Gas furnace (80,000 BTU)", baseCost: 1600, perTonCost: 100 },
    { name: "AC condenser", baseCost: 1800, perTonCost: 117 },
    { name: "Evaporator coil", baseCost: 650, perTonCost: 50 },
    { name: "Refrigerant line set (25 ft)", baseCost: 185 },
  ],
  "mini-split": [
    { name: "Outdoor condenser unit", baseCost: 1500, perTonCost: 200 },
    { name: "Indoor wall-mount air handler", baseCost: 600, perTonCost: 50 },
    { name: "Line set + accessories", baseCost: 150 },
  ],
};

// ========================================================================
// 固定材料费用（不随吨位变化，或变化极小）
// ========================================================================

interface MaterialItem {
  name: string;
  cost: number;
  optional?: boolean;
}

export const materialsBySystem: Record<HVACSystemType, MaterialItem[]> = {
  "central-ac": [
    { name: "Condensate drain pipe + fittings", cost: 65 },
    { name: "Electrical wire + breaker (30A)", cost: 95 },
    { name: "Miscellaneous fasteners and sealants", cost: 45 },
  ],
  "heat-pump": [
    { name: "Condensate drain pipe + fittings", cost: 65 },
    { name: "Electrical wire + breaker (30A)", cost: 95 },
    { name: "Miscellaneous fasteners and sealants", cost: 45 },
  ],
  "furnace-ac": [
    { name: "Gas piping + fittings", cost: 120 },
    { name: "Condensate drain pipe + fittings", cost: 65 },
    { name: "Electrical wire + breaker (30A)", cost: 95 },
    { name: "Flue vent pipe", cost: 85 },
    { name: "Miscellaneous fasteners and sealants", cost: 55 },
  ],
  "mini-split": [
    { name: "Electrical disconnect + wiring", cost: 80 },
    { name: "Wall mounting bracket", cost: 45 },
    { name: "Drain tubing", cost: 25 },
  ],
};

// 可选项目
export const OPTIONAL_ITEMS = {
  thermostat: { name: "Smart thermostat (ecobee)", cost: 250 },
  ductwork: { name: "Ductwork replacement (flex + sheet metal)", cost: 420 },
  permit: { name: "HVAC permit + inspection", cost: 150 },
} as const;

// ========================================================================
// 默认劳动工时（按系统类型）
// ========================================================================

export const DEFAULT_LABOR_HOURS: Record<HVACSystemType, number> = {
  "central-ac": 16,
  "heat-pump": 20,
  "furnace-ac": 24,
  "mini-split": 8,
};

// ========================================================================
// 利润率选项
// ========================================================================

export const PROFIT_MARGINS = [10, 15, 20, 25, 30, 35, 40] as const;

// ========================================================================
// 全国均价参考数据（2026）
// ========================================================================

export interface NationalAverage {
  systemType: HVACSystemType;
  label: string;
  low: number;
  typical: number;
  high: number;
}

export const nationalAverages: NationalAverage[] = [
  { systemType: "central-ac", label: "Central AC (3-ton)", low: 4800, typical: 7200, high: 12000 },
  { systemType: "heat-pump", label: "Heat Pump (3-ton)", low: 5500, typical: 8500, high: 15000 },
  { systemType: "furnace-ac", label: "Furnace + AC Combo", low: 6000, typical: 9500, high: 16000 },
  { systemType: "mini-split", label: "Ductless Mini-Split", low: 3000, typical: 5500, high: 9000 },
];

// ========================================================================
// 计算函数
// ========================================================================

/** 根据 home size 建议吨位（1 ton per 400-600 sq ft，取中值 500） */
export function suggestTonnage(sqFt: number): Tonnage {
  const rawTons = sqFt / 500;
  // 找到最接近的可用吨位
  let closest: Tonnage = 1.5;
  let minDiff = Infinity;
  for (const t of TONNAGE_OPTIONS) {
    const diff = Math.abs(t - rawTons);
    if (diff < minDiff) {
      minDiff = diff;
      closest = t;
    }
  }
  return closest;
}

/** 计算设备成本（基于吨位缩放） */
export function calcEquipmentCost(
  systemType: HVACSystemType,
  tonnage: Tonnage
): EstimateLineItem[] {
  const items = equipmentPricing[systemType];
  return items.map((item) => {
    const tonnageDelta = tonnage - 3;
    const unitCost = item.baseCost + tonnageDelta * (item.perTonCost ?? 0);
    return {
      category: "Equipment" as const,
      item: item.name,
      quantity: 1,
      unitCost: Math.round(unitCost),
      total: Math.round(unitCost),
    };
  });
}

/** 计算材料成本 */
export function calcMaterials(
  systemType: HVACSystemType,
  includeDuctwork: boolean
): EstimateLineItem[] {
  const base: EstimateLineItem[] = materialsBySystem[systemType].map((m) => ({
    category: "Materials" as const,
    item: m.name,
    quantity: 1,
    unitCost: m.cost,
    total: m.cost,
  }));

  if (includeDuctwork) {
    base.push({
      category: "Materials",
      item: OPTIONAL_ITEMS.ductwork.name,
      quantity: 1,
      unitCost: OPTIONAL_ITEMS.ductwork.cost,
      total: OPTIONAL_ITEMS.ductwork.cost,
      optional: true,
    });
  }

  return base;
}

/** 完整成本计算 */
export function calculateBreakdown(state: CalculatorState): CostBreakdown {
  const equipment = calcEquipmentCost(state.systemType, state.tonnage);
  const materials = calcMaterials(state.systemType, state.includeDuctwork);
  const labor: EstimateLineItem[] = [
    {
      category: "Labor",
      item: `Installation (${state.laborHours} hrs × $${state.laborRatePerHour}/hr)`,
      quantity: state.laborHours,
      unitCost: state.laborRatePerHour,
      total: state.laborHours * state.laborRatePerHour,
    },
  ];
  const permits: EstimateLineItem[] = state.includePermit
    ? [
        {
          category: "Permits",
          item: OPTIONAL_ITEMS.permit.name,
          quantity: 1,
          unitCost: OPTIONAL_ITEMS.permit.cost,
          total: OPTIONAL_ITEMS.permit.cost,
          optional: true,
        },
      ]
    : [];

  const optionalThermostat: EstimateLineItem[] = state.includeThermostat
    ? [
        {
          category: "Equipment",
          item: OPTIONAL_ITEMS.thermostat.name,
          quantity: 1,
          unitCost: OPTIONAL_ITEMS.thermostat.cost,
          total: OPTIONAL_ITEMS.thermostat.cost,
          optional: true,
        },
      ]
    : [];

  const allEquipment = [...equipment, ...optionalThermostat];

  const lineItems = [...allEquipment, ...materials, ...labor, ...permits];

  const equipmentTotal = allEquipment.reduce((sum, i) => sum + i.total, 0);
  const materialsTotal = materials.reduce((sum, i) => sum + i.total, 0);
  const laborTotal = labor.reduce((sum, i) => sum + i.total, 0);
  const permitsTotal = permits.reduce((sum, i) => sum + i.total, 0);

  const subtotal = equipmentTotal + materialsTotal + laborTotal + permitsTotal;
  const profitAmount = Math.round(subtotal * (state.profitMarginPercent / 100));
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
export function getDefaultState(systemType?: HVACSystemType): CalculatorState {
  const sys = systemType ?? "central-ac";
  return {
    systemType: sys,
    homeSizeSqFt: 1500,
    tonnage: 3,
    laborHours: DEFAULT_LABOR_HOURS[sys],
    laborRatePerHour: 65,
    includeDuctwork: false,
    includeThermostat: true,
    includePermit: true,
    profitMarginPercent: 20,
  };
}
