// lib/calculators/tile-data.ts
// Tile Calculator — 数据层
// 数据来源：HomeAdvisor 2026, Angi 2026 Tile Installation Cost, Floor Covering Weekly
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export type TileSize = "4x4" | "6x6" | "12x12" | "18x18" | "24x24" | "12x24";
export type TileMaterial = "ceramic" | "porcelain" | "naturalStone" | "glass";

export interface TileState {
  areaSqFt: number;
  tileSize: TileSize;
  material: TileMaterial;
  wastePercent: number;
}

export interface TileResult {
  tilesNeeded: number;
  boxesNeeded: number;
  sqFtPerBox: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// ========================================================================
// 瓷砖规格
// 来源：Tile Council of North America (TCNA) + manufacturer spec sheets
// ========================================================================

export interface TileSizeSpec {
  label: string;
  sqFtPerTile: number;
  sqFtPerBox: number; // typical packaging
  usage: string;
}

export const TILE_SIZES: Record<TileSize, TileSizeSpec> = {
  "4x4": {
    label: '4" × 4"',
    sqFtPerTile: 0.111,
    sqFtPerBox: 10,
    usage: "Backsplash, accents",
  },
  "6x6": {
    label: '6" × 6"',
    sqFtPerTile: 0.25,
    sqFtPerBox: 10,
    usage: "Small floor/wall",
  },
  "12x12": {
    label: '12" × 12"',
    sqFtPerTile: 1.0,
    sqFtPerBox: 10,
    usage: "Standard floor tile",
  },
  "18x18": {
    label: '18" × 18"',
    sqFtPerTile: 2.25,
    sqFtPerBox: 15,
    usage: "Large format floor",
  },
  "24x24": {
    label: '24" × 24"',
    sqFtPerTile: 4.0,
    sqFtPerBox: 15,
    usage: "Extra large format",
  },
  "12x24": {
    label: '12" × 24"',
    sqFtPerTile: 2.0,
    sqFtPerBox: 16,
    usage: "Wood-look plank tile",
  },
};

// ========================================================================
// 材料价格（2026，USD）
// 来源：HomeAdvisor 2026 Tile Installation Cost + Floor Covering Weekly
// ========================================================================

export interface TileMaterialPrice {
  label: string;
  description: string;
  costLowPerSqFt: number;
  costHighPerSqFt: number;
  laborLowPerSqFt: number;
  laborHighPerSqFt: number;
}

export const MATERIAL_PRICES: Record<TileMaterial, TileMaterialPrice> = {
  ceramic: {
    label: "Ceramic",
    description: "Budget-friendly. Glazed surface. Walls and light-traffic floors.",
    costLowPerSqFt: 1,
    costHighPerSqFt: 5,
    laborLowPerSqFt: 4,
    laborHighPerSqFt: 8,
  },
  porcelain: {
    label: "Porcelain",
    description: "Denser, water-resistant. Floors, showers, outdoor. Through-body color.",
    costLowPerSqFt: 3,
    costHighPerSqFt: 10,
    laborLowPerSqFt: 4,
    laborHighPerSqFt: 8,
  },
  naturalStone: {
    label: "Natural Stone",
    description: "Marble, granite, travertine, slate. Premium look. Needs sealing.",
    costLowPerSqFt: 5,
    costHighPerSqFt: 20,
    laborLowPerSqFt: 6,
    laborHighPerSqFt: 12,
  },
  glass: {
    label: "Glass",
    description: "Backsplashes and accents. Not for floors. Requires careful installation.",
    costLowPerSqFt: 7,
    costHighPerSqFt: 30,
    laborLowPerSqFt: 6,
    laborHighPerSqFt: 12,
  },
};

export const DEFAULT_WASTE_PERCENT = 15;

// ========================================================================
// 计算函数
// 公式：tiles = (area × (1 + waste/100)) / sqFtPerTile
//       boxes = ceil(total area / sqFtPerBox)
// ========================================================================

export function calculateTile(state: TileState): TileResult | null {
  if (state.areaSqFt <= 0) return null;

  const sizeSpec = TILE_SIZES[state.tileSize];
  const material = MATERIAL_PRICES[state.material];

  const wasteFactor = 1 + state.wastePercent / 100;
  const totalAreaWithWaste = state.areaSqFt * wasteFactor;

  const tilesNeeded = Math.ceil(totalAreaWithWaste / sizeSpec.sqFtPerTile);
  const boxesNeeded = Math.ceil(totalAreaWithWaste / sizeSpec.sqFtPerBox);

  const materialCostLow = Math.round(totalAreaWithWaste * material.costLowPerSqFt);
  const materialCostHigh = Math.round(totalAreaWithWaste * material.costHighPerSqFt);

  const laborCostLow = Math.round(state.areaSqFt * material.laborLowPerSqFt);
  const laborCostHigh = Math.round(state.areaSqFt * material.laborHighPerSqFt);

  const totalCostLow = materialCostLow + laborCostLow;
  const totalCostHigh = materialCostHigh + laborCostHigh;

  return {
    tilesNeeded,
    boxesNeeded,
    sqFtPerBox: sizeSpec.sqFtPerBox,
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    totalCostLow,
    totalCostHigh,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): TileState {
  return {
    areaSqFt: 200,
    tileSize: "12x12",
    material: "porcelain",
    wastePercent: DEFAULT_WASTE_PERCENT,
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
    component: "Tile Material",
    percentage: "25-40%",
    description: "Tile itself, priced per square foot by material type",
  },
  {
    component: "Labor",
    percentage: "35-50%",
    description: "Surface prep, layout, cutting, setting, grouting — $4-$12/sq ft",
  },
  {
    component: "Subfloor Prep",
    percentage: "10-15%",
    description: "Cement board, self-leveling compound, crack isolation membrane",
  },
  {
    component: "Grout & Thinset",
    percentage: "5-10%",
    description: "Thinset mortar, grout, sealer, spacers, other consumables",
  },
];

// ========================================================================
// 地区价格因子
// ========================================================================

export interface RegionFactor {
  region: string;
  multiplier: number;
  notes: string;
}

export const REGION_FACTORS: RegionFactor[] = [
  { region: "Midwest", multiplier: 1.0, notes: "Baseline (national average)" },
  { region: "Southeast", multiplier: 0.95, notes: "Competitive labor market, lower costs" },
  { region: "Southwest", multiplier: 1.1, notes: "Higher demand, premium for quality installers" },
  { region: "Northeast", multiplier: 1.25, notes: "Higher labor rates, union influence" },
  { region: "West Coast", multiplier: 1.4, notes: "Highest labor costs in US" },
];

// ========================================================================
// Red Flag 警告
// ========================================================================

export const RED_FLAGS = [
  "Labor quotes below $4/sq ft — likely skipping subfloor prep or using unlicensed installers",
  "No waste factor mentioned — a 200 sq ft job needs at least 230 sq ft of tile for cuts and breaks",
  "Natural stone installed without sealing — will stain permanently within months",
  "Glass tile installed on floors — not rated for foot traffic, will crack under weight",
  "Large format tile (24\"+) installed without flat subfloor — will lippage and crack at joints",
];

// ========================================================================
// FAQ
// ========================================================================

export const tileFaqs = [
  {
    question: "How many tiles do I need for my floor or wall?",
    answer:
      "Measure your area in square feet (length × width), then divide by the square footage per tile. A 12\"x12\" tile covers 1 sq ft, so a 100 sq ft room needs 100 tiles. Add 15% for waste (cuts, breaks, future repairs): 115 tiles total. For a 200 sq ft room with 12\"x12\" porcelain tile, you need 230 tiles or 23 boxes (if 10 sq ft per box). The calculator above handles the math for any tile size automatically.",
  },
  {
    question: "What waste factor should I use for tile?",
    answer:
      "Use 15% waste factor for standard installations with rectangular layouts. Use 20% for diagonal layouts (45-degree patterns), bathrooms with many cuts around fixtures, or natural stone (higher breakage rate). Use 10% only for simple open spaces with large format tile and minimal cutting. Always keep 1-2 boxes of leftover tile for future repairs — discontinued patterns are impossible to match later.",
  },
  {
    question: "How much does tile cost per square foot installed?",
    answer:
      "Installed tile costs $5-$32 per square foot including material and labor. Ceramic is the cheapest at $5-$13/sq ft total. Porcelain runs $7-$18. Natural stone is $11-$32. Glass tile (backsplash only) is $13-$42. Labor alone is $4-$8/sq ft for ceramic/porcelain and $6-$12 for stone/glass. Large format tile (24\"+) and intricate patterns add 20-50% to labor cost.",
  },
  {
    question: "Ceramic vs porcelain tile — what's the difference?",
    answer:
      "Porcelain is denser, harder, and less porous than ceramic. It's fired at higher temperatures and made from denser clay. Porcelain absorbs less than 0.5% water (vs 3-7% for ceramic), making it suitable for outdoors, showers, and high-traffic floors. Ceramic is softer, easier to cut, and cheaper — ideal for walls and backsplashes. Porcelain costs $3-$10/sq ft vs ceramic at $1-$5. Through-body porcelain (color runs through) chips less visibly than ceramic.",
  },
  {
    question: "How much does tile installation cost per square foot?",
    answer:
      "Tile installation labor costs $4-$12 per square foot depending on material and complexity. Standard ceramic or porcelain on a flat floor runs $4-$8/sq ft. Natural stone is $6-$12 because it requires sealing and special cutting tools. Glass tile is $6-$12 due to fragility. Diagonal layouts add $1-$3/sq ft. Small mosaic sheets cost more per sq ft because of the detail work. Shower walls cost 30-50% more than floors due to waterproofing.",
  },
  {
    question: "How much grout do I need for my tile project?",
    answer:
      "Grout needed depends on tile size, joint width, and grout type. For 12\"x12\" tile with 1/4\" joints, a 25 lb bag of sanded grout covers about 75-100 sq ft. For 4\"x4\" backsplash tile with 1/8\" joints, a 25 lb bag of unsanded grout covers 150-200 sq ft. Epoxy grout (stain-proof) covers about 50% less per bag and costs 2-3x more. Buy one extra bag beyond your calculated need — running out mid-job is a common problem.",
  },
  {
    question: "Can I tile over existing tile?",
    answer:
      "Yes, if the existing tile is firmly bonded, crack-free, and clean. Score the old tile surface with a grinder (creates mechanical bond), apply a latex-modified thinset, then lay new tile. Do NOT tile over: loose or hollow-sounding tile, cracked substrates, or shower floors (water infiltration risk). Removal is always better than overlay if you can afford the labor ($2-$4/sq ft for tear-out). Tiling over adds 1/4\"-3/8\" to wall thickness — check that trim and outlets still fit.",
  },
  {
    question: "How to choose grout color for tile?",
    answer:
      "Dark grout (charcoal, gray) hides stains and dirt — best for floors and high-traffic areas. Light grout (white, beige) creates a uniform look but shows every spill — best for walls and backsplashes. Matching grout to tile color creates a seamless look but makes individual tiles hard to distinguish. Contrasting grout highlights tile pattern (popular with subway tile). Epoxy grout ($25-$40/bag) resists stains permanently — worth it for white grout in kitchens. Cement grout ($5-$15/bag) needs sealing every 1-2 years.",
  },
];
