// lib/calculators/roof-area-data.ts
// Roof Area Calculator — 屋顶面积计算器

export type RoofPitch = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12;
export type RoofShape = "gable" | "hip" | "shed" | "flat";

export interface RoofAreaState {
  houseLengthFt: number;
  houseWidthFt: number;
  pitch: RoofPitch;
  shape: RoofShape;
}

export interface RoofAreaResult {
  houseFootprintSqFt: number;
  pitchFactor: number;
  shapeMultiplier: number;
  totalRoofAreaSqFt: number;
  roofingSquares: number;
  bundlesNeeded: number;
  estimatedCostLow: number;
  estimatedCostHigh: number;
}

// 标准 pitch factor（来自 NRCA 屋顶施工手册）
export const PITCH_FACTORS: Record<RoofPitch, number> = {
  2: 1.014, 3: 1.031, 4: 1.054, 5: 1.083,
  6: 1.118, 7: 1.158, 8: 1.202, 9: 1.250,
  10: 1.302, 12: 1.414,
};

export const PITCH_OPTIONS: { value: RoofPitch; label: string; usage: string }[] = [
  { value: 2, label: "2:12", usage: "Very low slope (modern/flat)" },
  { value: 3, label: "3:12", usage: "Low slope" },
  { value: 4, label: "4:12", usage: "Low-pitch residential" },
  { value: 5, label: "5:12", usage: "Moderate" },
  { value: 6, label: "6:12", usage: "Standard residential (most common)" },
  { value: 7, label: "7:12", usage: "Moderate-steep" },
  { value: 8, label: "8:12", usage: "Steep" },
  { value: 9, label: "9:12", usage: "Very steep" },
  { value: 10, label: "10:12", usage: "Very steep (Victorian)" },
  { value: 12, label: "12:12", usage: "45 degrees (A-frame, Gothic)" },
];

export const SHAPE_MULTIPLIERS: Record<RoofShape, { label: string; multiplier: number; description: string }> = {
  gable: { label: "Gable (peaked)", multiplier: 1.0, description: "Two slopes meeting at ridge. Most common US roof." },
  hip: { label: "Hip", multiplier: 1.10, description: "Slopes on all four sides. More surface area than gable." },
  shed: { label: "Shed (single slope)", multiplier: 1.0, description: "One slope, flat-to-angled. Modern architecture." },
  flat: { label: "Flat", multiplier: 0.95, description: "Nearly flat, minimal slope for drainage." },
};

// 沥青瓦价格（每 square = 100 sq ft）
export const ASPHALT_SHINGLE_COST_PER_SQUARE = { low: 350, high: 700 };
export const BUNDLES_PER_SQUARE = 3;

export function calculateRoofArea(state: RoofAreaState): RoofAreaResult | null {
  if (state.houseLengthFt <= 0 || state.houseWidthFt <= 0) return null;
  const footprint = state.houseLengthFt * state.houseWidthFt;
  const pitchFactor = PITCH_FACTORS[state.pitch];
  const shapeMult = SHAPE_MULTIPLIERS[state.shape].multiplier;
  const roofArea = Math.ceil(footprint * pitchFactor * shapeMult);
  const squares = Math.ceil(roofArea / 100);
  const bundles = squares * BUNDLES_PER_SQUARE;
  return {
    houseFootprintSqFt: footprint,
    pitchFactor,
    shapeMultiplier: shapeMult,
    totalRoofAreaSqFt: roofArea,
    roofingSquares: squares,
    bundlesNeeded: bundles,
    estimatedCostLow: squares * ASPHALT_SHINGLE_COST_PER_SQUARE.low,
    estimatedCostHigh: squares * ASPHALT_SHINGLE_COST_PER_SQUARE.high,
  };
}

export function getDefaultState(): RoofAreaState {
  return { houseLengthFt: 40, houseWidthFt: 30, pitch: 6, shape: "gable" };
}

export const COST_BREAKDOWN = [
  { component: "Shingles (asphalt)", percentage: "30-35%", description: "3-tab or architectural, ~$35-$100/bundle (3 bundles/square)" },
  { component: "Underlayment + ice/water shield", percentage: "10-15%", description: "Felt or synthetic underlayment, ice shield on eaves" },
  { component: "Labor (tear-off + install)", percentage: "40-50%", description: "Remove old roof, install new, flashing, cleanup" },
  { component: "Flashing + ventilation", percentage: "8-12%", description: "Drip edge, valley flashing, ridge vent, pipe boots" },
];

export const roofAreaFaqs = [
  {
    question: "How do I calculate the area of my roof?",
    answer:
      "Measure your house footprint (length × width in feet), multiply by the pitch factor for your roof slope. Example: 40'×30' house = 1,200 sq ft footprint. At 6:12 pitch (factor 1.118), roof area = 1,200 × 1.118 = 1,342 sq ft. For hip roofs, add 10% (more surface area). The calculator above does this automatically — just enter your house dimensions and select the pitch.",
  },
  {
    question: "What is a roof pitch factor?",
    answer:
      "Roof pitch factor converts flat footprint area to actual sloped roof area. A steeper roof has more surface area than a flat one covering the same footprint. Common factors: 4:12 pitch = 1.054x, 6:12 = 1.118x, 8:12 = 1.202x, 12:12 = 1.414x (45 degrees). At 12:12, the roof has 41% more surface area than the footprint. These factors come from the Pythagorean theorem applied to the roof triangle.",
  },
  {
    question: "How many squares of shingles do I need for my roof?",
    answer:
      "One 'square' of roofing covers 100 square feet. To calculate: roof area ÷ 100 = squares. Add 10-15% for waste, cuts, and starter courses. Example: 1,342 sq ft roof ÷ 100 = 13.4 → 14 squares, plus 15% waste = 16 squares. Each square of asphalt shingles is 3 bundles. So 16 squares = 48 bundles. The calculator handles this automatically.",
  },
  {
    question: "How is roof area different from house square footage?",
    answer:
      "House square footage measures living space (interior). Roof area is always larger because: (1) roof slope adds surface area (6:12 pitch = 12% more than footprint), (2) roof overhangs extend 1-2 feet beyond walls, (3) hip roofs have more surface than gable. A 2,000 sq ft house typically has 2,400-2,800 sq ft of roof area depending on pitch and shape. Always calculate roof area separately — estimating from house sq ft leads to material shortages.",
  },
  {
    question: "What is the most common roof pitch in the US?",
    answer:
      "6:12 (rise of 6 inches per 12 inches horizontal) is the most common residential roof pitch in the US. It's steep enough for good water drainage and attic space, but walkable for roofers with safety equipment. Range: 4:12 to 9:12 covers 80% of US homes. Flatter roofs (2:12-3:12) are common in Southwest and commercial. Steeper (10:12-12:12) on Victorian, Gothic, and premium homes.",
  },
  {
    question: "Does roof shape affect the total area?",
    answer:
      "Yes. A gable roof (two slopes) has the least surface area for a given footprint. A hip roof (four slopes) has about 10% more surface area because the hip ends add area. Flat roofs have slightly less area (5% reduction) due to no slope. Mansard and gambrel roofs have significantly more area due to double slopes. The calculator includes a shape multiplier for common types.",
  },
  {
    question: "How to measure roof pitch from the ground?",
    answer:
      "Three methods: (1) Pitch gauge app on your phone ($0-$5, uses camera + accelerometer) — point at the roofline, read the pitch directly. (2) Photo + protractor — take a photo perpendicular to the gable end, measure the angle between roof slope and horizontal ceiling line with a digital protractor. (3) Shadow measurement — measure the shadow of a 12-inch horizontal reference on the ground (only works on sunny days with exposed shadow). Most accurate: use the app method — Android 'Pitch Gauge' and iPhone 'Pitch Finder' are reliable within 1 degree. Confirm by checking attic rafter angle with a speed square.",
  },
  {
    question: "Does roof color affect energy costs?",
    answer:
      "Yes, significantly. Dark roofs (black, dark gray, brown) absorb solar heat, raising attic temperatures 20-40°F above ambient on sunny days. Light roofs (white, light gray, tan) reflect solar radiation, keeping attics 15-25°F cooler. Lawrence Berkeley National Lab studies show cool roofs reduce cooling energy use 10-20% in hot climates ($100-$300/year savings). In cold climates, the heating penalty from light-colored roofs is only $20-$80/year — cool roofs still win net. ENERGY STAR-certified cool roof shingles (like CertainTeed Landmark Solaris, GAF Timberline Cool Series) cost 15-25% more than standard shingles but qualify for utility rebates ($200-$500) in some states.",
  },
];
