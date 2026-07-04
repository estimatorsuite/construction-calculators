// lib/calculators/concrete-block-data.ts
// Concrete Block (CMU) Calculator
// 数据来源：Inch Calculator + concreteblockcalculator.com + Scruggs Concrete

export type BlockWidth = "6inch" | "8inch" | "12inch";

export interface ConcreteBlockState {
  wallLengthFt: number;
  wallHeightFt: number;
  blockWidth: BlockWidth;
  openingsSqFt: number;
}

export interface ConcreteBlockResult {
  wallAreaSqFt: number;
  netAreaSqFt: number;
  blocksNeeded: number;
  mortarBags: number;
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
}

// 标准 CMU 面部尺寸都是 8"×16"（含 mortar joint）
// 不同的是宽度（壁厚）：6" / 8" / 12"
// 每 block 覆盖面积 = 0.889 sq ft
// 每 sq ft 需要 1.125 blocks
export const BLOCK_SPECS: Record<BlockWidth, {
  label: string;
  nominalSize: string;
  blocksPerSqFt: number;
  pricePerBlockLow: number;
  pricePerBlockHigh: number;
  description: string;
}> = {
  "6inch": {
    label: '6" CMU (Half-block)',
    nominalSize: '6"×8"×16"',
    blocksPerSqFt: 1.125,
    pricePerBlockLow: 1.30,
    pricePerBlockHigh: 2.50,
    description: "Thinner wall, non-load-bearing partitions. Lighter weight.",
  },
  "8inch": {
    label: '8" CMU (Standard)',
    nominalSize: '8"×8"×16"',
    blocksPerSqFt: 1.125,
    pricePerBlockLow: 1.50,
    pricePerBlockHigh: 3.00,
    description: "Most common. Load-bearing walls, foundations, retaining walls.",
  },
  "12inch": {
    label: '12" CMU (Heavy-duty)',
    nominalSize: '12"×8"×16"',
    blocksPerSqFt: 1.125,
    pricePerBlockLow: 2.50,
    pricePerBlockHigh: 4.50,
    description: "Thickest standard. Structural walls, tall retaining walls, commercial.",
  },
};

export const WASTE_FACTOR = 0.05; // 5%
export const MORTAR_BAGS_PER_100_BLOCKS = 3; // 3 bags per 100 blocks
export const LABOR_PER_SQ_FT = { low: 8, high: 15 }; // $/sq ft installed (labor only)
export const MORTAR_BAG_PRICE = 7; // $/bag (80 lb premix)

export function calculateConcreteBlock(state: ConcreteBlockState): ConcreteBlockResult | null {
  if (state.wallLengthFt <= 0 || state.wallHeightFt <= 0) return null;
  const spec = BLOCK_SPECS[state.blockWidth];
  const wallArea = state.wallLengthFt * state.wallHeightFt;
  const netArea = Math.max(0, wallArea - state.openingsSqFt);
  const blocksRaw = netArea * spec.blocksPerSqFt;
  const blocksNeeded = Math.ceil(blocksRaw * (1 + WASTE_FACTOR));
  const mortarBags = Math.ceil((blocksNeeded / 100) * MORTAR_BAGS_PER_100_BLOCKS);

  const blockMaterialCost = blocksNeeded * spec.pricePerBlockLow;
  const blockMaterialCostHigh = blocksNeeded * spec.pricePerBlockHigh;
  const mortarCost = mortarBags * MORTAR_BAG_PRICE;
  const materialLow = Math.round(blockMaterialCost + mortarCost);
  const materialHigh = Math.round(blockMaterialCostHigh + mortarCost);

  const laborLow = Math.round(netArea * LABOR_PER_SQ_FT.low);
  const laborHigh = Math.round(netArea * LABOR_PER_SQ_FT.high);

  return {
    wallAreaSqFt: Math.round(wallArea * 10) / 10,
    netAreaSqFt: Math.round(netArea * 10) / 10,
    blocksNeeded,
    mortarBags,
    materialCostLow: materialLow,
    materialCostHigh: materialHigh,
    laborCostLow: laborLow,
    laborCostHigh: laborHigh,
    totalCostLow: materialLow + laborLow,
    totalCostHigh: materialHigh + laborHigh,
    costPerSqFtLow: Math.round((materialLow + laborLow) / netArea * 10) / 10,
    costPerSqFtHigh: Math.round((materialHigh + laborHigh) / netArea * 10) / 10,
  };
}

export function getDefaultState(): ConcreteBlockState {
  return { wallLengthFt: 20, wallHeightFt: 8, blockWidth: "8inch", openingsSqFt: 16 };
}

export const COST_BREAKDOWN = [
  { component: "Blocks (CMU)", percentage: "20-25%", description: "Concrete masonry units, 8x8x16 standard" },
  { component: "Mortar & rebar", percentage: "8-12%", description: "Type S mortar, horizontal/vertical rebar, fill" },
  { component: "Labor (mason + tender)", percentage: "50-60%", description: "Skilled mason + helper, laying blocks, tooling joints" },
  { component: "Equipment & overhead", percentage: "8-12%", description: "Mixer, scaffolding, saw, trucking, contractor overhead" },
];

export const concreteBlockFaqs = [
  {
    question: "How many concrete blocks do I need per square foot?",
    answer:
      "You need 1.125 standard 8\"×8\"×16\" concrete blocks per square foot of wall. This accounts for the 3/8\" mortar joint between blocks. Example: a 10'×8' wall (80 sq ft) needs 80 × 1.125 = 90 blocks. Always add 5% for waste and breakage — so 95 blocks for this wall. The calculator above does this automatically, including openings (doors/windows) subtraction.",
  },
  {
    question: "How many concrete blocks are in a pallet?",
    answer:
      "A standard pallet holds 108 to 144 blocks, depending on block size and manufacturer. For 8\"×8\"×16\" standard CMU: typically 108 per pallet (some suppliers pack 120 or 144). For 6\" blocks: up to 144 per pallet. For 12\" blocks: 72-90 per pallet. A pallet of 108 standard blocks weighs about 2,800-3,400 lbs (26-32 lbs per block). Always confirm pallet count with your supplier — it varies by region.",
  },
  {
    question: "How much mortar do I need for concrete blocks?",
    answer:
      "You need approximately 3 bags of mortar (80 lb each) per 100 blocks laid. For a wall with 90 blocks, that's 3 bags. For 200 blocks, 6 bags. Each 80-lb bag of Type S mortar mix costs about $6-$8 and covers roughly 35 blocks at standard 3/8\" joint thickness. Thicker mortar joints or filling block cores with grout increases mortar usage. The calculator above estimates mortar bags automatically based on block count.",
  },
  {
    question: "How much does a concrete block wall cost per square foot?",
    answer:
      "A concrete block wall costs $10 to $20 per square foot installed in 2026, including materials and labor. Material-only cost runs $3-$6/sq ft (blocks + mortar + rebar). Labor is $8-$15/sq ft for a skilled mason crew. Standard 8\" CMU costs $1.50-$3.00 per block. A 200 sq ft wall (20'×10') runs $2,000-$4,000 total. Retaining walls and structural walls cost more due to engineering requirements, rebar, and concrete fill.",
  },
  {
    question: "How much does a single concrete block cost?",
    answer:
      "Standard 8\"×8\"×16\" CMU costs $1.50-$3.00 per block at most building supply stores (2026). 6\" blocks cost $1.30-$2.50. 12\" blocks cost $2.50-$4.50. Bulk purchases (pallet pricing) save 10-20%. Specialty blocks (corner blocks, half-blocks, lintel blocks) cost 20-50% more. Prices vary by region — urban markets with multiple suppliers are cheaper than rural areas with limited supply.",
  },
  {
    question: "Should I use concrete blocks or poured concrete for my wall?",
    answer:
      "For most residential walls under 8 feet, concrete blocks (CMU) are the standard choice — cheaper ($10-$20/sq ft), easier for small crews, and don't require formwork. Poured concrete walls cost $15-$30/sq ft but are stronger, more water-resistant, and faster for large walls (once forms are set). For foundations and retaining walls over 4 feet, many engineers recommend poured concrete for superior structural integrity. For garden walls and partitions under 4 feet, CMU is almost always the right choice.",
  },
  {
    question: "Can I lay concrete blocks myself?",
    answer:
      "Laying CMU is DIY-possible for low walls (under 4 feet, non-structural) if you learn proper technique: buttering the head joint, leveling each course, maintaining consistent mortar joint thickness. A first-time DIYer can lay about 30-50 blocks per day vs 150-200 for a skilled mason. For structural walls, retaining walls, or anything requiring rebar/core fill, hire a licensed mason — improper installation causes catastrophic failures. Budget $1,500-$3,000 for a pro-installed 200 sq ft wall vs $500-$800 DIY (materials only).",
  },
  {
    question: "How to paint concrete block walls?",
    answer:
      "For interior CMU: apply one coat of masonry primer ($30-$50/gallon, like Kilz Masonry) followed by two coats of 100% acrylic latex paint. For exterior: use elastomeric coating ($50-$80/gallon) which bridges hairline cracks and waterproofs. Always clean the wall first with TSP and let dry 24 hours. New block walls should cure 30 days before painting. Skip primer on bare masonry and the paint will peel within 2 years — concrete is highly alkaline (pH 12-13) and degrades standard paint binders. Coverage: 200-300 sq ft per gallon on rough block (less than on drywall). Total cost: $0.75-$1.50/sq ft DIY, $2-$4/sq ft professional.",
  },
  {
    question: "How to waterproof a block wall from the outside?",
    answer:
      "Exterior waterproofing requires three layers: (1) masonry sealer applied to the wall surface (silane/siloxane, $40-$80/gallon), (2) dimple mat drainage board (like Delta-MS, $1-$2/sq ft) mechanically fastened over the sealer, (3) footer drain pipe (4-inch perforated PVC wrapped in fabric, $3-$5/linear ft) at the base carrying water to a sump or daylight. Install during excavation before backfill — retrofitting costs $50-$150/sq ft because you must dig out the foundation. Required for any block wall below grade (basements, retaining walls). Without proper exterior waterproofing, block walls leak at the mortar joints within 5-10 years.",
  },
];
