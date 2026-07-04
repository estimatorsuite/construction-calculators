// ========================================================================
// Roofing Estimate Calculator — 数据层
// 供 components/roofing-estimate-calculator.tsx 和 page.tsx 共用
// ========================================================================

export type RoofType =
  | "architectural-shingle"
  | "3-tab-shingle"
  | "metal-standing-seam"
  | "flat-tpo";

export type RoofPitch = "flat" | "low" | "medium" | "steep";

export const ROOF_TYPE_LABELS: Record<RoofType, string> = {
  "architectural-shingle": "Architectural Shingle",
  "3-tab-shingle": "3-Tab Shingle",
  "metal-standing-seam": "Metal Standing Seam",
  "flat-tpo": "Flat TPO / Membrane",
};

export const PITCH_LABELS: Record<RoofPitch, string> = {
  flat: "Flat (0–2/12)",
  low: "Low (2–4/12)",
  medium: "Medium (4–8/12)",
  steep: "Steep (8/12+)",
};

// 表单状态
export interface CalculatorState {
  roofType: RoofType;
  groundAreaSqFt: number;
  pitch: RoofPitch;
  squares: number;
  linearFtEdge: number;
  linearFtRidge: number;
  hasTearOff: boolean;
  laborRatePerHour: number;
  crewSize: number;
  includePermit: boolean;
  includeDumpster: boolean;
  profitMarginPercent: number;
}

// 成本行项
export interface EstimateLineItem {
  category: "Materials" | "Labor" | "Permits" | "Disposal";
  item: string;
  quantity: number;
  unitCost: number;
  total: number;
  optional?: boolean;
}

// 计算结果
export interface CostBreakdown {
  materialsTotal: number;
  laborTotal: number;
  permitsTotal: number;
  disposalTotal: number;
  subtotal: number;
  profitAmount: number;
  grandTotal: number;
  lineItems: EstimateLineItem[];
}

// ========================================================================
// 主材定价（按 square，1 square = 100 sq ft）
// 来源：templates-data.ts Roofing 模板 + 2026 US 市场均价
// ========================================================================

export const roofingMaterialPricing: Record<
  RoofType,
  { name: string; costPerSquare: number }
> = {
  "architectural-shingle": {
    name: "Architectural shingles (30-yr)",
    costPerSquare: 90,
  },
  "3-tab-shingle": {
    name: "3-tab shingles (20-yr)",
    costPerSquare: 65,
  },
  "metal-standing-seam": {
    name: "Standing seam metal panels",
    costPerSquare: 275,
  },
  "flat-tpo": {
    name: "TPO membrane + adhesive",
    costPerSquare: 140,
  },
};

// ========================================================================
// 辅料定价（按 squares、edge LF、ridge LF 或固定）
// ========================================================================

interface AccessoryPricing {
  underlaymentPerSquare: number;
  iceWaterShieldPerEdge: number;
  dripEdgePerLF: number;
  ridgeVentPerLF: number;
  pipeBootsEach: number;
  pipeBootsCount: number;
  nailsSealantFlat: number;
}

export const ACCESSORY_PRICING: AccessoryPricing = {
  underlaymentPerSquare: 15,
  iceWaterShieldPerEdge: 75,
  dripEdgePerLF: 2,
  ridgeVentPerLF: 5,
  pipeBootsEach: 25,
  pipeBootsCount: 4,
  nailsSealantFlat: 120,
};

// ========================================================================
// 坡度系数（同时影响屋顶面积和工时）
// ========================================================================

interface PitchFactor {
  areaMultiplier: number;
  laborMultiplier: number;
}

export const PITCH_FACTORS: Record<RoofPitch, PitchFactor> = {
  flat: { areaMultiplier: 1.0, laborMultiplier: 0.85 },
  low: { areaMultiplier: 1.06, laborMultiplier: 1.0 },
  medium: { areaMultiplier: 1.12, laborMultiplier: 1.15 },
  steep: { areaMultiplier: 1.25, laborMultiplier: 1.4 },
};

// ========================================================================
// 安装工时（按 square 计，person-hours/sq）
// ========================================================================

export const INSTALL_HOURS_PER_SQUARE: Record<RoofType, number> = {
  "architectural-shingle": 3.5,
  "3-tab-shingle": 3.0,
  "metal-standing-seam": 6.0,
  "flat-tpo": 4.5,
};

// 拆除成本（按 square 固定，不按工时）
export const TEAR_OFF_COST_PER_SQUARE = 80;

// ========================================================================
// 固定费用
// ========================================================================

export const FIXED_COSTS = {
  buildingPermit: 200,
  dumpsterRental: 450,
} as const;

// ========================================================================
// 利润率选项（与 HVAC 计算器保持一致）
// ========================================================================

export const PROFIT_MARGINS = [10, 15, 20, 25, 30, 35, 40] as const;

// ========================================================================
// 全国均价参考数据（2026）
// 来源：HomeAdvisor / Angi / RoofCalc 公开数据，1,500–2,000 sq ft 住宅
// ========================================================================

export interface NationalAverage {
  roofType: RoofType;
  label: string;
  low: number;
  typical: number;
  high: number;
}

export const nationalAverages: NationalAverage[] = [
  {
    roofType: "architectural-shingle",
    label: "Architectural Shingle (15–20 sq)",
    low: 7500,
    typical: 11000,
    high: 18000,
  },
  {
    roofType: "3-tab-shingle",
    label: "3-Tab Shingle (15–20 sq)",
    low: 5500,
    typical: 8000,
    high: 13000,
  },
  {
    roofType: "metal-standing-seam",
    label: "Metal Standing Seam (15–20 sq)",
    low: 14000,
    typical: 22000,
    high: 35000,
  },
  {
    roofType: "flat-tpo",
    label: "Flat TPO / Membrane (15–20 sq)",
    low: 7000,
    typical: 11500,
    high: 18000,
  },
];

// ========================================================================
// 计算函数
// ========================================================================

/** 根据地面面积和坡度推算 squares（1 square = 100 sq ft 屋顶面积） */
export function suggestSquaresFromSqFt(
  sqFt: number,
  pitch: RoofPitch
): number {
  const areaMultiplier = PITCH_FACTORS[pitch].areaMultiplier;
  return Math.round((sqFt * areaMultiplier) / 100);
}

/** 推算默认 edge / ridge 线性英尺（基于 ground area 几何估算） */
export function estimateLinearFeet(
  sqFt: number,
  type: "edge" | "ridge"
): number {
  // 假设方形屋顶：边长 ≈ √area
  const side = Math.sqrt(sqFt);
  if (type === "edge") {
    // 周长 ≈ 4 × side，1.1 倍冗余用于山谷/天沟
    return Math.round(side * 4 * 1.1);
  }
  // ridge ≈ 1 × side（典型双坡屋顶有一条屋脊）
  return Math.round(side);
}

/** 计算材料成本（主材 + 辅料） */
export function calcMaterials(
  roofType: RoofType,
  squares: number,
  lfEdge: number,
  lfRidge: number
): EstimateLineItem[] {
  const primary = roofingMaterialPricing[roofType];
  const a = ACCESSORY_PRICING;

  return [
    {
      category: "Materials",
      item: `${primary.name} — ${squares} squares`,
      quantity: squares,
      unitCost: primary.costPerSquare,
      total: squares * primary.costPerSquare,
    },
    {
      category: "Materials",
      item: "Synthetic underlayment",
      quantity: squares,
      unitCost: a.underlaymentPerSquare,
      total: squares * a.underlaymentPerSquare,
    },
    {
      category: "Materials",
      item: "Ice & water shield (eave edges)",
      quantity: 3,
      unitCost: a.iceWaterShieldPerEdge,
      total: 3 * a.iceWaterShieldPerEdge,
    },
    {
      category: "Materials",
      item: "Drip edge (aluminum)",
      quantity: lfEdge,
      unitCost: a.dripEdgePerLF,
      total: lfEdge * a.dripEdgePerLF,
    },
    {
      category: "Materials",
      item: "Ridge vent",
      quantity: lfRidge,
      unitCost: a.ridgeVentPerLF,
      total: lfRidge * a.ridgeVentPerLF,
    },
    {
      category: "Materials",
      item: "Pipe boots + flashing",
      quantity: a.pipeBootsCount,
      unitCost: a.pipeBootsEach,
      total: a.pipeBootsCount * a.pipeBootsEach,
    },
    {
      category: "Materials",
      item: "Roofing nails, sealant, misc",
      quantity: 1,
      unitCost: a.nailsSealantFlat,
      total: a.nailsSealantFlat,
    },
  ];
}

/** 计算人工成本（安装 + 可选拆除） */
export function calcLabor(
  roofType: RoofType,
  squares: number,
  pitch: RoofPitch,
  hasTearOff: boolean,
  laborRate: number,
  _crewSize: number
): EstimateLineItem[] {
  const installHoursPerSq = INSTALL_HOURS_PER_SQUARE[roofType];
  const laborMultiplier = PITCH_FACTORS[pitch].laborMultiplier;
  const installHours = Math.round(
    installHoursPerSq * squares * laborMultiplier
  );
  const installCost = installHours * laborRate;

  const items: EstimateLineItem[] = [
    {
      category: "Labor",
      item: `Installation (${installHours} hrs × $${laborRate}/hr)`,
      quantity: installHours,
      unitCost: laborRate,
      total: installCost,
    },
  ];

  if (hasTearOff) {
    const tearOffCost = TEAR_OFF_COST_PER_SQUARE * squares;
    items.push({
      category: "Labor",
      item: `Tear-off existing roof (${squares} squares × $${TEAR_OFF_COST_PER_SQUARE}/sq)`,
      quantity: squares,
      unitCost: TEAR_OFF_COST_PER_SQUARE,
      total: tearOffCost,
      optional: true,
    });
  }

  return items;
}

/** 完整成本计算 */
export function calculateBreakdown(state: CalculatorState): CostBreakdown {
  const materials = calcMaterials(
    state.roofType,
    state.squares,
    state.linearFtEdge,
    state.linearFtRidge
  );
  const labor = calcLabor(
    state.roofType,
    state.squares,
    state.pitch,
    state.hasTearOff,
    state.laborRatePerHour,
    state.crewSize
  );
  const permits: EstimateLineItem[] = state.includePermit
    ? [
        {
          category: "Permits",
          item: "Building permit + inspection",
          quantity: 1,
          unitCost: FIXED_COSTS.buildingPermit,
          total: FIXED_COSTS.buildingPermit,
          optional: true,
        },
      ]
    : [];
  const disposal: EstimateLineItem[] = state.includeDumpster
    ? [
        {
          category: "Disposal",
          item: "Dumpster rental + disposal",
          quantity: 1,
          unitCost: FIXED_COSTS.dumpsterRental,
          total: FIXED_COSTS.dumpsterRental,
          optional: true,
        },
      ]
    : [];

  const lineItems = [...materials, ...labor, ...permits, ...disposal];

  const materialsTotal = materials.reduce((sum, i) => sum + i.total, 0);
  const laborTotal = labor.reduce((sum, i) => sum + i.total, 0);
  const permitsTotal = permits.reduce((sum, i) => sum + i.total, 0);
  const disposalTotal = disposal.reduce((sum, i) => sum + i.total, 0);

  const subtotal =
    materialsTotal + laborTotal + permitsTotal + disposalTotal;
  const profitAmount = Math.round(
    subtotal * (state.profitMarginPercent / 100)
  );
  const grandTotal = subtotal + profitAmount;

  return {
    materialsTotal,
    laborTotal,
    permitsTotal,
    disposalTotal,
    subtotal,
    profitAmount,
    grandTotal,
    lineItems,
  };
}

/** 默认状态 */
export function getDefaultState(roofType?: RoofType): CalculatorState {
  const type: RoofType = roofType ?? "architectural-shingle";
  const groundArea = 1500;
  const pitch: RoofPitch = "medium";
  return {
    roofType: type,
    groundAreaSqFt: groundArea,
    pitch,
    squares: suggestSquaresFromSqFt(groundArea, pitch),
    linearFtEdge: estimateLinearFeet(groundArea, "edge"),
    linearFtRidge: estimateLinearFeet(groundArea, "ridge"),
    hasTearOff: true,
    laborRatePerHour: 45,
    crewSize: 4,
    includePermit: true,
    includeDumpster: true,
    profitMarginPercent: 25,
  };
}
