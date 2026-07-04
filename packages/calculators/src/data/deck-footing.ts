// lib/calculators/deck-footing-data.ts
// Deck Footing Calculator

export type DeckLevel = "attached" | "freestanding" | "multiLevel";
export type FrostDepth = "shallow" | "standard" | "deep";

export interface DeckFootingState {
  deckAreaSqFt: number;
  deckLevel: DeckLevel;
  beamCount: number;
  frostDepth: FrostDepth;
}

export interface DeckFootingResult {
  footingCount: number;
  postCount: number;
  concreteBags: number;
  footingCostLow: number;
  footingCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// 每个 footing 之间的间距
const FOOTING_SPACING_FT = 8;
// 混凝土袋数（每 footing 体积）
const BAGS_PER_FOOTING: Record<FrostDepth, number> = {
  shallow: 3,    // 12" diameter × 24" deep
  standard: 5,   // 12" diameter × 36" deep
  deep: 8,       // 12" diameter × 48" deep
};
// 每 footing 成本（含混凝土袋 + sonotube + post anchor）
const COST_PER_FOOTING: Record<FrostDepth, { low: number; high: number }> = {
  shallow: { low: 75, high: 130 },
  standard: { low: 100, high: 180 },
  deep: { low: 140, high: 250 },
};

export const DECK_LEVEL_INFO: Record<DeckLevel, { label: string; description: string }> = {
  attached: { label: "Attached to house", description: "Ledger board attached to house rim joist" },
  freestanding: { label: "Freestanding", description: "Self-supporting, not attached to house" },
  multiLevel: { label: "Multi-level", description: "Multiple tiers, requires more support" },
};

export const FROST_DEPTH_INFO: Record<FrostDepth, { label: string; description: string }> = {
  shallow: { label: "Shallow (no frost, 24\")", description: "Southern climates without ground freeze" },
  standard: { label: "Standard (36\" deep)", description: "Most of the US — frost line at 36 inches" },
  deep: { label: "Deep (48\"+)", description: "Northern climates with deep frost line" },
};

export function calculateDeckFooting(state: DeckFootingState): DeckFootingResult | null {
  if (state.deckAreaSqFt <= 0 || state.beamCount <= 0) return null;
  // 每条 beam 需要的 footing 数（基于 beam 长度 / spacing）
  const beamLength = Math.sqrt(state.deckAreaSqFt);
  const footingsPerBeam = Math.ceil(beamLength / FOOTING_SPACING_FT) + 1;
  const totalFootings = footingsPerBeam * state.beamCount;
  const posts = totalFootings;
  const bagsPerFooting = BAGS_PER_FOOTING[state.frostDepth];
  const totalBags = totalFootings * bagsPerFooting;
  const cost = COST_PER_FOOTING[state.frostDepth];
  return {
    footingCount: totalFootings,
    postCount: posts,
    concreteBags: totalBags,
    footingCostLow: Math.round(totalFootings * cost.low),
    footingCostHigh: Math.round(totalFootings * cost.high),
    totalCostLow: Math.round(totalFootings * cost.low),
    totalCostHigh: Math.round(totalFootings * cost.high),
  };
}

export function getDefaultState(): DeckFootingState {
  return { deckAreaSqFt: 200, deckLevel: "attached", beamCount: 2, frostDepth: "standard" };
}

export const COST_BREAKDOWN = [
  { component: "Concrete (bagged)", percentage: "30-35%", description: "80 lb bags of concrete mix, ~$5/bag" },
  { component: "Sonotubes (cardboard forms)", percentage: "15-20%", description: "12-inch diameter tubes, $15-$25 each" },
  { component: "Post anchors/hardware", percentage: "20-25%", description: "Galvanized post bases, anchors, ABU-style brackets" },
  { component: "Labor (digging + pouring)", percentage: "25-35%", description: "Post hole digging, tube setting, concrete mixing, curing" },
];

export const deckFootingFaqs = [
  {
    question: "How deep should deck footings be?",
    answer:
      "Deck footings must extend below the local frost line to prevent heaving. In most of the US, that's 36 inches deep. In southern states (FL, TX, AZ), 24 inches is sufficient. Northern states (MN, ME, ND) may require 48-60 inches. Check your local building code for the exact frost depth. The footing diameter is typically 12 inches for residential decks. Going too shallow causes the deck to heave and crack during freeze-thaw cycles.",
  },
  {
    question: "How many footings do I need for my deck?",
    answer:
      "Most decks need footings spaced every 6-8 feet along each beam. A typical 12x16 deck (192 sq ft) with 2 beams needs 6-8 footings total. Calculate: beam length ÷ 8 feet + 1 = footings per beam. Multiply by number of beams. For a 200 sq ft deck with 2 beams of ~14 feet, that's (14÷8+1)×2 = 6 footings. The calculator above does this automatically. Always add one extra footing for safety on multi-level decks.",
  },
  {
    question: "Do I need a permit for deck footings?",
    answer:
      "Yes, in almost all jurisdictions. Most building codes require permits for decks over 30 inches high or over 200 sq ft. The permit process includes footing inspection (before concrete pour) and final inspection. Inspection costs $50-$200 and is required for insurance and resale. Unpermitted decks must be retroactively permitted or removed during home sale — always pull permits.",
  },
  {
    question: "Can I use deck blocks instead of concrete footings?",
    answer:
      "Deck blocks (precast concrete blocks that sit on the ground) work for low, freestanding decks under 30 inches high in non-frost climates. They're cheaper ($10-$15 each vs $100+ for poured footings) and faster to install. But they don't meet code for attached decks, decks over 30 inches, or any deck in frost-prone areas. Most jurisdictions ban deck blocks for anything beyond a small garden platform. For permanent decks, always pour proper footings.",
  },
  {
    question: "How much concrete do I need for one deck footing?",
    answer:
      "A standard 12-inch diameter footing at 36 inches deep requires about 2.8 cubic feet of concrete — roughly 3 bags of 80 lb concrete mix ($15). At 48 inches deep, that's about 4 bags ($20). Buy 10% extra for waste. For multiple footings, bulk concrete delivery (1+ cubic yards at $120-$150/yard) is cheaper than buying individual bags. A typical 6-footing deck needs about 17 cubic feet — under the 1-yard minimum, so bagged is the practical choice.",
  },
  {
    question: "Can helical piers replace concrete deck footings?",
    answer:
      "Yes — helical piers (steel shafts with screw-like helices twisted into the ground) are a code-approved alternative to concrete footings in most jurisdictions. They cost $150-$250 each installed vs $100-$150 for a poured concrete footing, but install in 30 minutes each with no digging, no concrete cure time, and no excavation mess. Load capacity is typically 5-10 tons per pier (vs 2-3 tons for standard concrete footings). Best use cases: wet soils where concrete won't cure, tight access (no room for excavation equipment), and decks built over existing landscaping. Drawback: requires specialized installer — not a DIY option.",
  },
  {
    question: "How to dig deck footing holes without an auger?",
    answer:
      "Use a manual post hole digger (clamshell type, $40-$80 at hardware stores). For a 12-inch diameter × 36-inch deep hole in average soil, expect 30-60 minutes per hole with two people trading off. Rocky soil doubles the time. Alternative tools: digging bar ($40) for breaking up hardpan, mattock ($35) for root cutting, post hole digger with handles extended for deeper holes. Avoid shovel-only digging — holes end up too wide (wasting concrete). Gas auger rental ($75-$120/day) makes sense for 5+ holes. Call 811 (utility locator) at least 48 hours before digging — it's free and legally required.",
  },
];
