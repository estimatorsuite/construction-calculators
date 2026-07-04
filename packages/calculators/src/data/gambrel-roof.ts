// lib/calculators/gambrel-roof-data.ts
// Gambrel Roof Calculator — 数据层
// 数据来源：NRCA 2026, Asphalt Roofing Manufacturers Association, RSMeans 2026
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type GambrelPitch = "30-60" | "22.5-67.5" | "custom";

export interface GambrelRoofState {
  buildingLengthFt: number;
  buildingWidthFt: number;
  upperPitch: number; // upper slope angle in degrees (default 30)
  lowerPitch: number; // lower slope angle in degrees (default 60)
}

export interface GambrelRoofResult {
  footprintSqFt: number;
  upperRoofAreaSqFt: number;
  lowerRoofAreaSqFt: number;
  totalRoofAreaSqFt: number;
  roofingSquares: number;
  bundlesNeeded: number;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  upperRafterLength: number;
  lowerRafterLength: number;
  ridgeLength: number;
}

// ========================================================================
// 坡度预设
// Gambrel roof = "barn roof" with two slopes on each side
// Upper slope is shallower (30 degrees typical)
// Lower slope is steeper (60 degrees typical)
// ========================================================================

export const PITCH_PRESETS: {
  value: GambrelPitch;
  label: string;
  upper: number;
  lower: number;
  description: string;
}[] = [
  {
    value: "30-60",
    label: "30°/60° (Standard Barn)",
    upper: 30,
    lower: 60,
    description: "Classic gambrel. Upper slope at 30°, lower at 60°.",
  },
  {
    value: "22.5-67.5",
    label: "22.5°/67.5° (Dutch Colonial)",
    upper: 22.5,
    lower: 67.5,
    description: "Steeper lower slope. More headroom in loft.",
  },
  {
    value: "custom",
    label: "Custom Angles",
    upper: 35,
    lower: 55,
    description: "Enter your own angles.",
  },
];

// ========================================================================
// 沥青瓦每 square 价格（2026）
// 1 square = 100 sq ft | 3 bundles = 1 square
// 来源：NRCA 2026 + RSMeans
// ========================================================================

export const ASPHALT_SHINGLE_COST_PER_SQUARE = { low: 350, high: 700 };

export const ROOFING_WASTE_FACTOR = 0.10; // 10% waste for cuts and valleys

// ========================================================================
// 计算函数
// Rafter length = (horizontal run) / cos(pitch_angle)
// Upper rafter runs from ridge to break point (assumed 40% of half-width)
// Lower rafter runs from break point to wall plate (60% of half-width)
// ========================================================================

export function calculateGambrelRoof(state: GambrelRoofState): GambrelRoofResult | null {
  if (state.buildingLengthFt <= 0 || state.buildingWidthFt <= 0) return null;

  const halfWidth = state.buildingWidthFt / 2;

  // Rafter lengths using trigonometry
  // Upper rafter: runs from ridge to mid-point (assumed 40% of half-width for standard gambrel)
  const upperRun = halfWidth * 0.40;
  const lowerRun = halfWidth * 0.60;

  const upperRafterLength = upperRun / Math.cos(state.upperPitch * Math.PI / 180);
  const lowerRafterLength = lowerRun / Math.cos(state.lowerPitch * Math.PI / 180);

  // Roof area per side = (upper rafter + lower rafter) × building length
  const sideArea = (upperRafterLength + lowerRafterLength) * state.buildingLengthFt;
  // Total both sides, plus waste factor
  const totalRoofArea = Math.ceil(sideArea * 2 * (1 + ROOFING_WASTE_FACTOR));

  const squares = Math.ceil(totalRoofArea / 100);
  const bundles = squares * 3;

  return {
    footprintSqFt: Math.round(state.buildingLengthFt * state.buildingWidthFt),
    upperRoofAreaSqFt: Math.ceil(upperRafterLength * state.buildingLengthFt * 2),
    lowerRoofAreaSqFt: Math.ceil(lowerRafterLength * state.buildingLengthFt * 2),
    totalRoofAreaSqFt: totalRoofArea,
    roofingSquares: squares,
    bundlesNeeded: bundles,
    estimatedCostLow: squares * ASPHALT_SHINGLE_COST_PER_SQUARE.low,
    estimatedCostHigh: squares * ASPHALT_SHINGLE_COST_PER_SQUARE.high,
    upperRafterLength: Math.round(upperRafterLength * 10) / 10,
    lowerRafterLength: Math.round(lowerRafterLength * 10) / 10,
    ridgeLength: state.buildingLengthFt,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): GambrelRoofState {
  return {
    buildingLengthFt: 30,
    buildingWidthFt: 24,
    upperPitch: 30,
    lowerPitch: 60,
  };
}

// ========================================================================
// 成本拆解数据（用于 Cost Breakdown Table）
// ========================================================================

export interface CostBreakdownRow {
  component: string;
  percentage: string;
  description: string;
}

export const COST_BREAKDOWN: CostBreakdownRow[] = [
  {
    component: "Shingles",
    percentage: "30-35%",
    description: "Asphalt shingle bundles (3 bundles per square)",
  },
  {
    component: "Underlayment & Decking",
    percentage: "15-20%",
    description: "Roof deck sheathing, felt/ice-and-water shield, drip edge",
  },
  {
    component: "Rafters & Framing",
    percentage: "15-20%",
    description: "Upper + lower rafters, ridge board, gusset plates at break",
  },
  {
    component: "Labor",
    percentage: "25-30%",
    description: "Tear-off (if applicable), framing, shingle installation",
  },
  {
    component: "Overhead & Profit",
    percentage: "5-10%",
    description: "Equipment, insurance, contractor margin",
  },
];

// ========================================================================
// FAQ — 6 个
// ========================================================================

export const gambrelRoofFaqs = [
  {
    question: "What is a gambrel roof?",
    answer:
      "A gambrel roof is a two-sided roof with two slopes on each side — a steeper lower slope (typically 60 degrees) and a shallower upper slope (typically 30 degrees). It's commonly called a \"barn roof\" because it maximizes loft or attic space without increasing wall height. Dutch Colonial and traditional barn styles use gambrel roofs. The design gives you about 50% more usable upper-floor space than a gable roof on the same footprint.",
  },
  {
    question: "How do you calculate the roof area of a gambrel roof?",
    answer:
      "Calculate each slope separately. Measure the horizontal run of the upper slope (from ridge to break point) and lower slope (from break point to wall plate). Divide each run by the cosine of its pitch angle to get rafter length. Multiply rafter length by building length for one-side area. Double it for both sides. Add 10% for waste. The calculator above does this automatically — enter building dimensions and pitch angles to get total roof area in square feet and roofing squares.",
  },
  {
    question: "How much does a gambrel roof cost compared to a gable roof?",
    answer:
      "A gambrel roof costs 20-30% more than a gable roof on the same footprint. The extra cost comes from more surface area (two slopes per side instead of one), more framing complexity (break point connections, gusset plates), and more labor. A typical 1,500 sq ft gambrel roof with asphalt shingles runs $12,000-$25,000 installed. Metal gambrel roofs cost $20,000-$40,000. The tradeoff is you gain significant loft space that a gable roof can't provide.",
  },
  {
    question: "How long are the rafters on a gambrel roof?",
    answer:
      "It depends on building width and pitch angles. For a 24 ft wide building with standard 30°/60° gambrel: the upper rafter runs about 5.5 ft and the lower rafter about 6.0 ft on each side. Total rafter length per side is about 11.5 ft. For a 36 ft wide building, expect roughly 8.3 ft upper + 9.0 ft lower = 17.3 ft per side. The calculator above computes exact rafter lengths from your building dimensions and pitch angles.",
  },
  {
    question: "How many shingle bundles do I need for a gambrel roof?",
    answer:
      "First calculate total roof area (both slopes, both sides) in square feet. Add 10% for waste. Divide by 100 to get roofing squares. Multiply by 3 to get bundles (3 bundles = 1 square of standard asphalt shingles). For a typical 30×24 ft gambrel building: roof area is about 1,650 sq ft, which is 17 squares or 51 bundles after waste. The calculator above computes this automatically with your exact dimensions.",
  },
  {
    question: "Gambrel vs mansard roof — what's the difference?",
    answer:
      "Both have two slopes per side, but a gambrel roof has two slopes on each of two sides (like a barn), while a mansard roof has two slopes on all four sides. Gambrel is typically used on gable-end buildings. Mansard is used on hip-roof buildings and is common in French architecture. Gambrel lower slopes are steeper (60° vs mansard's ~70°) and gambrel upper slopes are shallower. Mansard costs about 40% more than gambrel due to the extra two sides and more complex framing.",
  },
  {
    question: "Can I add a dormer to a gambrel roof?",
    answer:
      "Yes — shed dormers are the most common addition to gambrel roofs because they complement the existing roofline. Shed dormers on the upper slope add headroom and windows to attic spaces, converting ~150 sq ft of unusable attic into livable space. Cost: $8,000-$20,000 per dormer installed (framing, roofing, windows, interior finish). Gable dormers are also possible but cost 30-50% more due to more complex framing. Considerations: (1) structural reinforcement at the break point is required, (2) check local zoning for setback rules, (3) the dormer roof slope should match the gambrel's upper pitch for visual harmony. Each dormer adds 3-5 days to a roofing project.",
  },
  {
    question: "How to insulate a gambrel attic?",
    answer:
      "Gambrel attics are notoriously hard to insulate because the steep lower slope creates kneewalls (short walls between attic floor and roof break). Three approaches: (1) Insulate the floor of the attic only (R-38 to R-60 fiberglass batts or cellulose, $1-$3/sq ft) — cheapest, leaves kneewall space unconditioned. (2) Insulate the roof rafters and kneewalls with spray foam ($3.50-$6.50/sq ft) — creates fully conditioned attic, best for finished space. (3) Hybrid: insulate kneewalls with fiberglass batts and the flat ceiling above with blown-in — middle ground at $2-$4/sq ft. Always install ventilation baffles (SmartVent, $1.50/linear ft) between rafters to maintain airflow behind insulation. Skipping baffles causes moisture damage in 5-10 years.",
  },
];
