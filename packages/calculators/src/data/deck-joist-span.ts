// lib/calculators/deck-joist-span-data.ts
// Deck Joist Span Calculator
// 数据来源：AWC (American Wood Council) Span Tables for Joists and Rafters
// 基于 40 psf live load + 10 psf dead load（住宅甲板标准）

export type JoistSize = "2x6" | "2x8" | "2x10" | "2x12";
export type JoistSpacing = 12 | 16 | 24;
export type WoodSpecies = "southernPine" | "spf" | "hemFir" | "redwood";

// 最大允许跨度（ft）— Southern Pine 为基准
// 来源：AWC Span Table，40 psf LL + 10 psf DL
const SP_BASE_SPANS: Record<JoistSize, Record<JoistSpacing, number>> = {
  "2x6":  { 12: 12.5, 16: 10.75, 24: 9.1 },
  "2x8":  { 12: 16.2, 16: 13.75, 24: 11.5 },
  "2x10": { 12: 20.3, 16: 17.3, 24: 14.5 },
  "2x12": { 12: 24.0, 16: 20.5, 24: 17.0 },
};

// 木材种类强度乘数（相对于 Southern Pine #2）
const SPECIES_MULTIPLIER: Record<WoodSpecies, number> = {
  southernPine: 1.0,    // 最强常用品种
  spf: 0.85,            // Spruce-Pine-Fir，较弱
  hemFir: 0.90,         // Hem-Fir，中等
  redwood: 0.80,        // Redwood/Cedar，美观但弱
};

export interface JoistSpanResult {
  maxSpanFt: number;
  maxSpanDisplay: string;
  recommendedSize: string;
  joistCount: number;
  boardLengthNeeded: number;
  materialCost: number;
}

export interface JoistSpanState {
  joistSize: JoistSize;
  spacing: JoistSpacing;
  species: WoodSpecies;
  deckWidth: number; // 甲板宽度（ft），joist 跨越的方向
}

export const JOIST_SIZES: Record<JoistSize, { label: string; actualSize: string }> = {
  "2x6": { label: "2x6", actualSize: '1.5" × 5.5"' },
  "2x8": { label: "2x8", actualSize: '1.5" × 7.25"' },
  "2x10": { label: "2x10", actualSize: '1.5" × 9.25"' },
  "2x12": { label: "2x12", actualSize: '1.5" × 11.25"' },
};

export const SPECIES_INFO: Record<WoodSpecies, { label: string; description: string }> = {
  southernPine: { label: "Southern Pine (#2)", description: "Strongest common species. Pressure-treated for outdoor use." },
  spf: { label: "Spruce-Pine-Fir (SPF)", description: "Lighter, weaker. Common in northern US/Canada." },
  hemFir: { label: "Hem-Fir", description: "Moderate strength. Common on West Coast." },
  redwood: { label: "Redwood / Cedar", description: "Natural decay resistance. Premium look, lower strength." },
};

export function calculateJoistSpan(state: JoistSpanState): JoistSpanResult | null {
  if (state.deckWidth <= 0) return null;
  const baseSpan = SP_BASE_SPANS[state.joistSize][state.spacing];
  const adjustedSpan = baseSpan * SPECIES_MULTIPLIER[state.species];
  const roundedSpan = Math.floor(adjustedSpan * 10) / 10;

  // 计算 joist 数量（基于 deck width 和 spacing）
  // 如果 deck 有 beam 支持，joist 跨度 = deck_width
  // joist 数量 = deck_length / spacing + 1
  // 这里简化：假设 deck_width 就是 joist 需要跨越的长度
  const isSpanAdequate = state.deckWidth <= roundedSpan;
  const recommendedSize = isSpanAdequate ? state.joistSize : recommendLargerSize(state.joistSize, state.spacing, state.species, state.deckWidth);

  // 估算 joist 数量（假设 deck_length = deck_width 的 1.5 倍）
  const deckLength = state.deckWidth * 1.5;
  const joistCount = Math.ceil((deckLength * 12) / state.spacing) + 1;
  const boardLengthNeeded = Math.ceil(state.deckWidth);

  // 材料成本估算
  const costPerLinearFt: Record<JoistSize, number> = { "2x6": 1.5, "2x8": 2.5, "2x10": 3.5, "2x12": 4.5 };
  const materialCost = Math.round(joistCount * boardLengthNeeded * costPerLinearFt[state.joistSize]);

  return {
    maxSpanFt: roundedSpan,
    maxSpanDisplay: `${Math.floor(roundedSpan)}' ${Math.round((roundedSpan % 1) * 12)}"`,
    recommendedSize,
    joistCount,
    boardLengthNeeded,
    materialCost,
  };
}

function recommendLargerSize(current: JoistSize, spacing: JoistSpacing, species: WoodSpecies, deckWidth: number): string {
  const sizes: JoistSize[] = ["2x6", "2x8", "2x10", "2x12"];
  const currentIndex = sizes.indexOf(current);
  for (let i = currentIndex + 1; i < sizes.length; i++) {
    const span = SP_BASE_SPANS[sizes[i]][spacing] * SPECIES_MULTIPLIER[species];
    if (deckWidth <= span) return `${sizes[i]} (upgrade needed)`;
  }
  return "2x12 + mid-span beam (needs engineering)";
}

export function getDefaultState(): JoistSpanState {
  return { joistSize: "2x8", spacing: 16, species: "southernPine", deckWidth: 12 };
}

export const deckJoistFaqs = [
  {
    question: "How far can a 2x8 deck joist span?",
    answer:
      "A 2x8 pressure-treated joist (Southern Pine #2) can span up to 13 feet 9 inches at 16-inch spacing under standard residential deck loads (40 psf live + 10 psf dead). At 12-inch spacing, the same 2x8 can span 16 feet 2 inches. At 24-inch spacing, it drops to 11 feet 6 inches. Weaker wood species (SPF, Hem-Fir) reduce these spans by 10-15%. Always check the AWC span table or local building code for exact requirements.",
  },
  {
    question: "How far can a 2x10 deck joist span?",
    answer:
      "A 2x10 Southern Pine joist spans 17 feet 4 inches at 16-inch spacing, 20 feet 4 inches at 12-inch spacing, and 14 feet 6 inches at 24-inch spacing. For most residential decks (12-16 feet wide), 2x10 at 16 inches o.c. is the standard choice — strong enough without being overkill. Going to 2x12 allows spans up to 20+ feet but costs 30% more in materials.",
  },
  {
    question: "What spacing should I use for deck joists?",
    answer:
      "16 inches on center (o.c.) is the standard for most residential decks. It balances strength, material cost, and decking compatibility. Use 12-inch spacing for: heavy loads (hot tubs), composite decking (requires closer spacing), or longer spans. Use 24-inch spacing only for: lightweight decks with 5/4x6 wood decking (not composite). Composite decking manufacturers typically specify 16-inch maximum joist spacing — check your decking warranty.",
  },
  {
    question: "Do I need a beam in the middle of my deck?",
    answer:
      "If your joist span exceeds the maximum allowable (from the calculator above), you need a mid-span beam to reduce the effective joist span. Example: a 2x8 at 16-inch spacing can span 13'9\". If your deck is 16 feet wide, you need a beam at 8 feet to split the span. Adding a beam means more footings, posts, and hardware (~$300-$600 extra), but it's required for code compliance. Alternatively, upgrade to 2x10 or 2x12 joists to eliminate the mid-span beam.",
  },
  {
    question: "What wood is best for deck joists?",
    answer:
      "Pressure-treated Southern Pine (#2 grade) is the industry standard for deck joists — strongest common species, widely available, and affordable. SPF (Spruce-Pine-Fir) is common in northern states but 15% weaker. Hem-Fir is a West Coast option. Redwood and cedar are beautiful for visible components but weaker for structural joists — use them for decking boards and railing, not joists. Always use pressure-treated lumber for ground-contact structural members.",
  },
  {
    question: "Can I sister joists to extend deck span?",
    answer:
      "Yes — 'sistering' (nailing a second joist alongside an existing one) increases load capacity but does NOT increase the allowable span per code. Sistering fixes bouncy or undersized joists but cannot replace a mid-span beam when code maximum span is exceeded. The IRC requires joists to meet span tables based on size, spacing, and species — sistering doesn't change the effective span length. Cost: $5-$12 per linear foot for the sister joist (2x8 pressure-treated) plus $20-$30 for through-bolts every 16 inches. For genuinely overspanned decks, add a beam or replace joists with larger dimensional lumber.",
  },
  {
    question: "What is deck joist blocking and is it required?",
    answer:
      "Blocking (also called 'cross bracing' or 'solid blocking') is short pieces of the same dimensional lumber installed perpendicular between joists, typically at mid-span and at 8-foot intervals. IRC R301.4 requires blocking on decks over 6 feet above ground and on all decks with joists 2x10 or larger. Purpose: prevents joist rotation (twisting), reduces bounce, and distributes point loads (like a hot tub) across multiple joists. Cost: $1-$2 per block installed. Skipping blocking is a common inspection failure and makes the deck feel bouncy even when joist sizing is correct.",
  },
];
