// ========================================================================
// Construction Markup Calculator — 数据层
// ========================================================================

export type CalculatorMode = "markup-to-price" | "margin-to-price" | "reverse";

export const MODE_LABELS: Record<CalculatorMode, string> = {
  "markup-to-price": "Markup → Price",
  "margin-to-price": "Margin → Price",
  reverse: "Reverse",
};

export const MODE_DESCRIPTIONS: Record<CalculatorMode, string> = {
  "markup-to-price": "Enter your cost and markup % to find the selling price",
  "margin-to-price": "Enter your cost and target margin % to find the selling price",
  reverse: "Enter selling price and cost to see your markup and margin",
};

export interface MarkupCalculatorState {
  mode: CalculatorMode;
  cost: number;
  markup: number;
  margin: number;
  sellingPrice: number;
}

export interface CalculationResult {
  sellingPrice: number;
  profit: number;
  markup: number;
  margin: number;
}

// ========================================================================
// 计算公式
// ========================================================================

export function calcFromMarkup(cost: number, markupPercent: number): CalculationResult {
  const price = cost * (1 + markupPercent / 100);
  const profit = price - cost;
  const marginPercent = (profit / price) * 100;
  return {
    sellingPrice: Math.round(price * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    markup: markupPercent,
    margin: Math.round(marginPercent * 10) / 10,
  };
}

export function calcFromMargin(cost: number, marginPercent: number): CalculationResult {
  const price = cost / (1 - marginPercent / 100);
  const profit = price - cost;
  const markupPercent = (profit / cost) * 100;
  return {
    sellingPrice: Math.round(price * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    markup: Math.round(markupPercent * 10) / 10,
    margin: marginPercent,
  };
}

export function calcReverse(sellingPrice: number, cost: number): CalculationResult {
  const profit = sellingPrice - cost;
  const markupPercent = (profit / cost) * 100;
  const marginPercent = (profit / sellingPrice) * 100;
  return {
    sellingPrice,
    profit: Math.round(profit * 100) / 100,
    markup: Math.round(markupPercent * 10) / 10,
    margin: Math.round(marginPercent * 10) / 10,
  };
}

/** 根据当前模式计算结果 */
export function calculate(state: MarkupCalculatorState): CalculationResult | null {
  if (state.mode === "markup-to-price") {
    if (state.cost <= 0 || state.markup < 0) return null;
    return calcFromMarkup(state.cost, state.markup);
  }
  if (state.mode === "margin-to-price") {
    if (state.cost <= 0 || state.margin <= 0 || state.margin >= 100) return null;
    return calcFromMargin(state.cost, state.margin);
  }
  // reverse
  if (state.cost <= 0 || state.sellingPrice <= state.cost) return null;
  return calcReverse(state.sellingPrice, state.cost);
}

// ========================================================================
// Quick Reference 对照表
// ========================================================================

export interface QuickRefEntry {
  markup: number;
  margin: number;
}

export const quickReference: QuickRefEntry[] = [
  { markup: 10, margin: 9.1 },
  { markup: 15, margin: 13.0 },
  { markup: 20, margin: 16.7 },
  { markup: 25, margin: 20.0 },
  { markup: 30, margin: 23.1 },
  { markup: 35, margin: 25.9 },
  { markup: 40, margin: 28.6 },
  { markup: 50, margin: 33.3 },
  { markup: 60, margin: 37.5 },
  { markup: 75, margin: 42.9 },
  { markup: 100, margin: 50.0 },
];

// ========================================================================
// 行业 Benchmark 参考数据（2026）
// ========================================================================

export interface TradeBenchmark {
  trade: string;
  typicalMarkup: string;
  typicalMargin: string;
}

export const tradeBenchmarks: TradeBenchmark[] = [
  { trade: "HVAC", typicalMarkup: "20–30%", typicalMargin: "17–23%" },
  { trade: "Plumbing", typicalMarkup: "25–35%", typicalMargin: "20–26%" },
  { trade: "Electrical", typicalMarkup: "20–30%", typicalMargin: "17–23%" },
  { trade: "Roofing", typicalMarkup: "25–40%", typicalMargin: "20–29%" },
  { trade: "General Contractor", typicalMarkup: "10–20%", typicalMargin: "9–17%" },
  { trade: "Landscaping", typicalMarkup: "30–50%", typicalMargin: "23–33%" },
];

/** 默认状态 */
export function getDefaultState(): MarkupCalculatorState {
  return {
    mode: "markup-to-price",
    cost: 1000,
    markup: 30,
    margin: 25,
    sellingPrice: 1300,
  };
}