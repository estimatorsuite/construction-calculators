// lib/calculators/pressure-washing-data.ts
// Pressure Washing Estimate Calculator — 数据层
// 数据来源：HomeAdvisor 2026 + Angi 2026 + Homewyse May 2026
// 最后验证：2026-06-20

// ========================================================================
// 类型定义
// ========================================================================

export type WashingSurface = "driveway" | "houseSiding" | "deck" | "fence" | "roof";
export type DirtLevel = "light" | "moderate" | "heavy";

export interface PressureWashingState {
  surfaceType: WashingSurface;
  areaSqFt: number;
  dirtLevel: DirtLevel;
}

export interface PressureWashingResult {
  baseCostLow: number;
  baseCostHigh: number;
  dirtMultiplierLow: number;
  dirtMultiplierHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
  estimatedHours: number;
  includesChemicals: boolean;
}

// ========================================================================
// 表面类型数据
// 来源：HomeAdvisor 2026 Pressure Washing Cost + Angi 2026
// ========================================================================

export interface SurfaceSpec {
  label: string;
  description: string;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
  psiRange: string;               // 推荐压力
  notes: string;
  usesChemicals: boolean;
}

export const SURFACE_TYPES: Record<WashingSurface, SurfaceSpec> = {
  driveway: {
    label: "Concrete driveway / walkway",
    description: "Concrete or asphalt surfaces. Oil stains need chemical treatment.",
    costPerSqFtLow: 0.20,
    costPerSqFtHigh: 0.40,
    psiRange: "3,000-4,000 PSI",
    notes: "High pressure OK on concrete. Watch for joint sand displacement.",
    usesChemicals: true,
  },
  houseSiding: {
    label: "House siding (vinyl/stucco/brick)",
    description: "Exterior wall cleaning. Low-pressure 'soft wash' recommended.",
    costPerSqFtLow: 0.15,
    costPerSqFtHigh: 0.35,
    psiRange: "500-1,500 PSI (soft wash)",
    notes: "High pressure damages siding and forces water behind. Soft wash only.",
    usesChemicals: true,
  },
  deck: {
    label: "Wood deck / patio",
    description: "Wooden surfaces require careful pressure to avoid etching.",
    costPerSqFtLow: 0.50,
    costPerSqFtHigh: 1.00,
    psiRange: "1,200-1,500 PSI",
    notes: "Wood etches easily. Needs sanding after if refinishing.",
    usesChemicals: true,
  },
  fence: {
    label: "Wood or vinyl fence",
    description: "Vertical surface cleaning. Per linear foot pricing common.",
    costPerSqFtLow: 0.30,
    costPerSqFtHigh: 0.60,
    psiRange: "1,200-2,000 PSI",
    notes: "Difficult access. Often priced per linear foot.",
    usesChemicals: true,
  },
  roof: {
    label: "Roof (asphalt shingle)",
    description: "Moss/algae removal. MUST use low-pressure soft wash.",
    costPerSqFtLow: 0.50,
    costPerSqFtHigh: 1.00,
    psiRange: "100-500 PSI (soft wash only)",
    notes: "High pressure strips granules and voids warranty. Soft wash with bleach solution.",
    usesChemicals: true,
  },
};

// ========================================================================
// 污垢程度乘数
// ========================================================================

export const DIRT_LEVELS: Record<DirtLevel, { label: string; multiplierLow: number; multiplierHigh: number; description: string }> = {
  light: {
    label: "Light — annual maintenance",
    multiplierLow: 0.85,
    multiplierHigh: 0.90,
    description: "Light dust, pollen, minor organic growth. Typical yearly clean.",
  },
  moderate: {
    label: "Moderate — 2-3 years since last clean",
    multiplierLow: 1.0,
    multiplierHigh: 1.1,
    description: "Visible green algae, some black streaks, moderate dirt buildup.",
  },
  heavy: {
    label: "Heavy — 5+ years or neglected",
    multiplierLow: 1.2,
    multiplierHigh: 1.4,
    description: "Thick moss, deep oil stains, heavy organic growth. Needs pre-treatment.",
  },
};

// ========================================================================
// 最小上门费
// ========================================================================

export const MINIMUM_SERVICE_FEE = 100; // 大多数 pro 的最低收费

// ========================================================================
// 计算函数
// ========================================================================

export function calculatePressureWashing(state: PressureWashingState): PressureWashingResult | null {
  if (state.areaSqFt <= 0) return null;

  const surface = SURFACE_TYPES[state.surfaceType];
  const dirt = DIRT_LEVELS[state.dirtLevel];

  const baseCostLow = state.areaSqFt * surface.costPerSqFtLow;
  const baseCostHigh = state.areaSqFt * surface.costPerSqFtHigh;

  const adjustedLow = baseCostLow * dirt.multiplierLow;
  const adjustedHigh = baseCostHigh * dirt.multiplierHigh;

  // 应用最小上门费
  const totalCostLow = Math.max(MINIMUM_SERVICE_FEE, Math.round(adjustedLow));
  const totalCostHigh = Math.max(MINIMUM_SERVICE_FEE, Math.round(adjustedHigh));

  // 估算工时（平均 500-800 sq ft/hour for pro crew）
  const sqFtPerHour = 600;
  const estimatedHours = Math.max(1, Math.round((state.areaSqFt / sqFtPerHour) * 10) / 10);

  return {
    baseCostLow: Math.round(baseCostLow),
    baseCostHigh: Math.round(baseCostHigh),
    dirtMultiplierLow: dirt.multiplierLow,
    dirtMultiplierHigh: dirt.multiplierHigh,
    totalCostLow,
    totalCostHigh,
    costPerSqFtLow: Math.round((totalCostLow / state.areaSqFt) * 100) / 100,
    costPerSqFtHigh: Math.round((totalCostHigh / state.areaSqFt) * 100) / 100,
    estimatedHours,
    includesChemicals: surface.usesChemicals,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): PressureWashingState {
  return {
    surfaceType: "driveway",
    areaSqFt: 1000,
    dirtLevel: "moderate",
  };
}

// ========================================================================
// 成本拆解
// ========================================================================

export const COST_BREAKDOWN = [
  {
    component: "Labor (crew + travel)",
    percentage: "50-60%",
    description: "Setup, application, cleanup. Most companies charge 1-2 hour minimum.",
  },
  {
    component: "Equipment & fuel",
    percentage: "15-20%",
    description: "Commercial washer depreciation, gas, maintenance, nozzles",
  },
  {
    component: "Chemicals & cleaners",
    percentage: "15-25%",
    description: "Bleach solution, detergents, degreasers, brighteners",
  },
  {
    component: "Overhead & profit",
    percentage: "10-15%",
    description: "Insurance (critical for roof work), marketing, contractor margin",
  },
];

// ========================================================================
// FAQ
// ========================================================================

export const pressureWashingFaqs = [
  {
    question: "How much does pressure washing cost per square foot?",
    answer:
      "Pressure washing costs $0.15-$1.00 per square foot depending on surface type. Concrete driveways are cheapest ($0.20-$0.40/sq ft). House siding runs $0.15-$0.35/sq ft (soft wash). Wood decks and roofs cost $0.50-$1.00/sq ft due to specialized low-pressure requirements. Most companies have a $100-$150 minimum service fee, so small jobs cost more per square foot.",
  },
  {
    question: "How much does it cost to pressure wash a driveway?",
    answer:
      "A standard 2-car driveway (1,000 sq ft) costs $200-$400 to pressure wash. This includes pre-treatment for oil stains, high-pressure cleaning (3,000-4,000 PSI), and rinsing. Heavily stained driveways with 5+ years of neglect cost 20-40% more. Most contractors bundle driveway + walkway + porch for $300-$600 total.",
  },
  {
    question: "How much does it cost to pressure wash a house?",
    answer:
      "Pressure washing a house exterior costs $200-$800 depending on size and siding material. A 1,500 sq ft single-story vinyl home runs $250-$450. A 2,500 sq ft two-story stucco home runs $500-$800. Siding cleaning must use low-pressure 'soft wash' (500-1,500 PSI) with chemical detergents — high pressure forces water behind siding and causes mold. Brick and stucco cost more than vinyl.",
  },
  {
    question: "What's the difference between pressure washing and soft washing?",
    answer:
      "Pressure washing uses high-pressure water (1,500-4,000 PSI) to physically blast away dirt. Good for concrete, brick, and metal. Soft washing uses low-pressure water (100-500 PSI) combined with chemical solutions (bleach-based) to kill algae/mold and dissolve grime. Required for roofs, siding, and wood — high pressure on these surfaces causes permanent damage and voids warranties. Most pros offer both, choosing based on surface.",
  },
  {
    question: "How often should I pressure wash my house?",
    answer:
      "Most homes benefit from pressure washing every 1-2 years. Homes in humid climates (Southeast US, Gulf Coast) need annual cleaning to control algae and mold. Dry climates (Southwest) can go 2-3 years between washes. Driveways and walkways need cleaning every 1-2 years or when oil stains appear. Roofs with visible black streaks (gloeocapsa magma algae) should be soft-washed immediately — the algae eats away at shingle granules.",
  },
  {
    question: "Can I pressure wash my own house?",
    answer:
      "DIY pressure washing is possible for concrete surfaces (driveways, walkways) if you own or rent a gas-powered washer ($200-$500 rental for a weekend). But house siding and roofs should always be done by pros: (1) consumer-grade electric washers (1,500-2,000 PSI) are too weak for effective cleaning; (2) improper technique damages siding, etches wood, strips roof granules; (3) chemical handling requires training (bleach solutions can kill landscaping if not neutralized). For anything beyond concrete, hire a pro.",
  },
  {
    question: "Is pressure washing a profitable business?",
    answer:
      "Pressure washing has some of the highest margins in home services — typically 60-80% gross margin. Overhead is low (equipment $2,000-$5,000 for pro setup, no storefront needed). Average job ticket is $300-$600, and an experienced tech can do 3-5 jobs per day. The challenge is seasonality (cold-climate businesses close November-March) and customer acquisition. Most successful pressure washing businesses use Google Business Profile + nextdoor + door hangers for leads.",
  },
  {
    question: "Can pressure washing damage concrete?",
    answer:
      "Yes — using too much pressure or the wrong nozzle damages concrete permanently. Safe limits: 3,000-4,000 PSI for uncoated concrete with a 25-degree green nozzle at 12 inches distance. Damage starts above 4,000 PSI or with a 0-degree red nozzle held too close — it etches lines called 'zebra striping' that show up clearly when the concrete dries. Stamped or sealed concrete requires even lower pressure (1,500-2,500 PSI) to avoid stripping the sealer or wearing the color. Older concrete (20+ years) with surface scaling is most vulnerable. Test a small area first.",
  },
  {
    question: "What PSI is safe for house siding?",
    answer:
      "Safe pressure depends on siding material: vinyl 1,300-1,600 PSI, aluminum 1,200-1,500 PSI, stucco 1,000-1,500 PSI, wood 600-1,000 PSI, brick 1,500-2,500 PSI. Always use a wide-fan nozzle (25-40 degree) and keep the wand at least 12 inches from the surface. Never use 0-degree nozzles on siding — the concentrated stream cuts through vinyl and dents aluminum. Better yet, use 'soft wash' (100-500 PSI) with bleach-based detergent for siding — the chemicals do the cleaning, not pressure. High pressure forces water behind siding, causing mold and rot ($2,000-$8,000 damage).",
  },
];
