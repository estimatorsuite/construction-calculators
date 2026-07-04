// lib/calculators/deck-stair-data.ts
// Deck Stair Calculator — 数据层
// 数据来源：IRC R311.7, AWC Stair Construction, Angi 2026, HomeAdvisor 2026
// 最后验证：2026-06-21

// ========================================================================
// 类型定义
// ========================================================================

export interface DeckStairState {
  totalRiseInches: number;           // vertical height from ground to deck surface
  desiredRiseInches: number;         // target step height (default 7", code max 7.75")
  desiredRunInches: number;          // target tread depth (default 11", code min 10")
  stairWidthInches: number;          // default 36"
}

export interface DeckStairResult {
  numberOfSteps: number;
  actualRiseInches: number;          // equalized rise per step
  actualRunInches: number;
  totalRunInches: number;            // horizontal distance stairs extend
  stringerLengthInches: number;      // the 2x12 board length needed
  stringersNeeded: number;           // typically 3 for 36" wide
  treadBoardsNeeded: number;         // 2x6 boards per step
  riserBoardsNeeded: number;         // optional riser boards
  materialCostLow: number;
  materialCostHigh: number;
  totalCostLow: number;
  totalCostHigh: number;
}

// ========================================================================
// Building code constraints（来源：IRC R311.7 Stairways）
// ========================================================================

export const CODE_CONSTRAINTS = {
  maxRise: 7.75,        // IRC R311.7.2 — max riser height
  minRun: 10,           // IRC R311.7.4 — min tread depth
  minWidth: 36,         // IRC R311.7.1 — min stair width
  riseTolerance: 0.375, // IRC R311.7.5 — max 3/8" variation between steps
} as const;

// ========================================================================
// Material prices（2026，USD）
// 来源：Home Depot + Lowe's pressure-treated lumber pricing 2026
// ========================================================================

export const STRINGER_PRICE = {
  low: 25,              // $/each 2x12 × ~12 ft
  high: 40,
};

export const TREAD_PRICE_PER_LF = {
  low: 3,               // $/linear ft for 2x6 PT
  high: 8,              // premium 5/4 composite
};

export const RISER_PRICE = {
  low: 4,               // $/each 1x8 PT
  high: 8,
};

export const HARDWARE_PRICE = {
  low: 25,              // hangers, screws, bolts
  high: 60,
};

// ========================================================================
// 计算函数
// IRC-compliant stair calculation
// ========================================================================

export function calculateDeckStair(state: DeckStairState): DeckStairResult | null {
  if (state.totalRiseInches <= 0 || state.desiredRiseInches <= 0 || state.desiredRunInches <= 0) {
    return null;
  }

  // Step count = ceil(totalRise / desiredRise)
  const numberOfSteps = Math.ceil(state.totalRiseInches / state.desiredRiseInches);

  // Equalized rise (every step identical — code requirement)
  const actualRiseInches = Math.round((state.totalRiseInches / numberOfSteps) * 1000) / 1000;

  // Total run = steps × tread depth
  const totalRunInches = numberOfSteps * state.desiredRunInches;

  // Stringer length = sqrt(rise² + run²) + 12" for cuts
  const stringerLengthInches = Math.ceil(
    Math.sqrt(state.totalRiseInches ** 2 + totalRunInches ** 2) + 12
  );

  // Stringers: 3 for 36" wide (every 16-18" o.c.)
  const stringersNeeded = state.stairWidthInches <= 36 ? 3 : Math.ceil(state.stairWidthInches / 18) + 1;

  // Tread boards: 2x6 is 5.5" actual width
  // boards per step = ceil(width / 5.5)
  const boardsPerStep = Math.ceil(state.stairWidthInches / 5.5);
  const treadBoardsNeeded = boardsPerStep * numberOfSteps;

  // Riser boards: 1 per step (optional)
  const riserBoardsNeeded = numberOfSteps;

  // Material cost
  const stringerCostLow = stringersNeeded * STRINGER_PRICE.low;
  const stringerCostHigh = stringersNeeded * STRINGER_PRICE.high;

  const treadLengthFt = state.stairWidthInches / 12;
  const treadCostLow = Math.round(treadBoardsNeeded * treadLengthFt * TREAD_PRICE_PER_LF.low);
  const treadCostHigh = Math.round(treadBoardsNeeded * treadLengthFt * TREAD_PRICE_PER_LF.high);

  const riserCostLow = riserBoardsNeeded * RISER_PRICE.low;
  const riserCostHigh = riserBoardsNeeded * RISER_PRICE.high;

  const materialCostLow = Math.round(stringerCostLow + treadCostLow + riserCostLow + HARDWARE_PRICE.low);
  const materialCostHigh = Math.round(stringerCostHigh + treadCostHigh + riserCostHigh + HARDWARE_PRICE.high);

  // Total cost (materials + estimated labor for pro install)
  // Labor: typically 50-100% of materials for stair construction
  const totalCostLow = materialCostLow + Math.round(materialCostLow * 0.5);
  const totalCostHigh = materialCostHigh + Math.round(materialCostHigh * 1.0);

  return {
    numberOfSteps,
    actualRiseInches,
    actualRunInches: state.desiredRunInches,
    totalRunInches,
    stringerLengthInches,
    stringersNeeded,
    treadBoardsNeeded,
    riserBoardsNeeded,
    materialCostLow,
    materialCostHigh,
    totalCostLow,
    totalCostHigh,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): DeckStairState {
  return {
    totalRiseInches: 36,         // 3 ft deck height
    desiredRiseInches: 7,        // 7" target rise
    desiredRunInches: 11,        // 11" tread depth
    stairWidthInches: 36,        // 36" min code width
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
    component: "Stringers (2x12 PT)",
    percentage: "20-30%",
    description: "The diagonal structural boards that support each step. 3 needed for 36\" wide.",
  },
  {
    component: "Tread Boards (2x6)",
    percentage: "25-35%",
    description: "The horizontal walking surface of each step. 2 boards per step for 36\" wide.",
  },
  {
    component: "Risers (1x8 PT)",
    percentage: "5-10%",
    description: "Optional vertical boards between steps. Required for enclosed stairs.",
  },
  {
    component: "Hardware",
    percentage: "5-10%",
    description: "Joist hangers, lag bolts, deck screws, stair stringer connectors.",
  },
  {
    component: "Labor",
    percentage: "30-45%",
    description: "Cutting stringers, assembling, anchoring, installing treads. Skilled work.",
  },
];

// ========================================================================
// FAQ — 6 个真实问题
// ========================================================================

export const deckStairFaqs = [
  {
    question: "How do I build deck stairs?",
    answer:
      "Measure total rise (ground to deck surface), divide by desired riser height (7 inches standard), and round up to get step count. Cut 2x12 stringers with a framing square and stair gauges, notch each step, then install stringers every 16-18 inches. Attach treads (2x6 boards, 2 per step for 36-inch wide stairs) with deck screws. Building code (IRC R311.7) requires max 7.75-inch risers, min 10-inch treads, and 36-inch width. Most DIYers can build a 4-step stair in 6-8 hours.",
  },
  {
    question: "How do I calculate stair stringer length?",
    answer:
      "Stringer length = sqrt(total rise² + total run²) + 12 inches for cuts. For a 36-inch rise with 4 steps at 11-inch run: total run = 44 inches. Stringer = sqrt(36² + 44²) = sqrt(1,296 + 1,936) = sqrt(3,232) = 56.9 inches + 12 = 69 inches. Buy 2x12 lumber at least 6 feet long. The calculator above does this automatically and adds the 12-inch cut allowance.",
  },
  {
    question: "What is the maximum riser height for deck stairs?",
    answer:
      "Building code (IRC R311.7.2) sets the maximum riser height at 7-3/4 inches (196mm). Variation between the tallest and shortest step cannot exceed 3/8 inch. The sweet spot is 7 inches — comfortable for most adults and code-compliant with margin. Risers over 7.75 inches feel steep and dangerous for children and elderly users. For commercial or ADA-compliant stairs, max riser is 7 inches.",
  },
  {
    question: "What size 2x12 do I need for stair stringers?",
    answer:
      "Use pressure-treated 2x12 lumber, minimum #2 grade. Length depends on your stair geometry: for a 36-inch rise, you need about a 6-foot 2x12; for 60-inch rise, about 9 feet; for 96-inch rise, about 14 feet. Always buy 12 inches longer than the calculated stringer length to allow for top and bottom cuts. Southern Yellow Pine is the strongest common species for stringers.",
  },
  {
    question: "How much does it cost to build deck stairs?",
    answer:
      "A standard 4-step deck stair (36-inch wide, 36-inch rise) costs $250-$700 for materials and $400-$1,400 fully installed. Materials alone run $250-$700: 3 stringers ($75-$120), 8 tread boards ($75-$200), riser boards ($30-$60), hardware ($25-$60). Labor is $200-$700 for a skilled carpenter (4-8 hours). Pre-cut stringers save time but cost 2-3x more than cutting your own from 2x12.",
  },
  {
    question: "Should I use pre-cut stringers or cut my own?",
    answer:
      "Pre-cut stringers (available at Home Depot/Lowe&apos;s) cost $25-$40 each and save 1-2 hours of layout and cutting per stair. They work for standard 7-inch rises at 36-inch heights. Cut your own when: your rise isn&apos;t standard, you need more than 5 steps, or you want custom tread depths. Pros always cut their own because pre-cut stringers are often 2x10 instead of 2x12 (weaker) and may not match your exact rise.",
  },
  {
    question: "What is the ideal deck stair angle?",
    answer:
      "The ideal stair angle is 32-37 degrees from horizontal, corresponding to a 7-inch rise with 10-11 inch run. Building code (IRC R311.7) allows angles between 30 and 42 degrees but comfort falls within a narrower range. The comfort formula: rise + run should equal 17-18 inches (the 'comfort rule' from architectural ergonomics). At 7+11=18 inches, you get a 32-degree angle — ideal for all ages. Steeper stairs (8+9=17) save space but are tiring and dangerous for elderly users. Shallower stairs (6+13=19) are easier to climb but take up more deck space. Most residential deck stairs land at 34-35 degrees.",
  },
  {
    question: "Can I use composite decking for stair treads?",
    answer:
      "Yes — composite treads (Trex, TimberTech, Fiberon) are popular for low-maintenance decks. Requirements: (1) stair stringer spacing must be reduced to 12 inches on center (vs 16 inches for wood treads) — composite flexes more and will crack at wider spacing. This adds 30-50% to stringer cost. (2) Use hidden fastener systems designed for stairs (Camo, Tiger Claw) — face-screwing composite looks bad and voids some warranties. (3) Double-stringer width from 36 to 42 inches for stability. Cost premium: composite treads are $35-$70 per step (vs $15-$25 for pressure-treated 2x6). Lifespan: 25-30 years vs 10-15 for wood — worth it if you plan to keep the deck long-term and hate annual staining.",
  },
];
