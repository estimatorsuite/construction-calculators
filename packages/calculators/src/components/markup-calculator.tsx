"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Percent,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  type CalculatorMode,
  MODE_LABELS,
  MODE_DESCRIPTIONS,
  type MarkupCalculatorState,
  quickReference,
  calculate,
  getDefaultState,
} from "../data/markup";

const MODES: CalculatorMode[] = ["markup-to-price", "margin-to-price", "reverse"];

const MODE_ICONS: Record<CalculatorMode, React.ElementType> = {
  "markup-to-price": Percent,
  "margin-to-price": TrendingUp,
  reverse: ArrowRightLeft,
};

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function MarkupCalculator() {
  const [state, setState] = useState<MarkupCalculatorState>(getDefaultState());
  const result = calculate(state);

  function updateState(partial: Partial<MarkupCalculatorState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function handleModeChange(mode: CalculatorMode) {
    updateState({ mode });
  }

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Calculation Mode
        </label>
        <div className="flex flex-wrap gap-2">
          {MODES.map((mode) => {
            const Icon = MODE_ICONS[mode];
            const isActive = state.mode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-accent/10 text-foreground hover:bg-accent/20"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {MODE_LABELS[mode]}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {MODE_DESCRIPTIONS[state.mode]}
        </p>
      </div>

      {/* Input fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cost input — shown in markup-to-price and margin-to-price modes */}
        {state.mode !== "reverse" && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Cost ($)
            </label>
            <input
              type="number"
              value={state.cost || ""}
              onChange={(e) =>
                updateState({ cost: Math.max(0, Number(e.target.value) || 0) })
              }
              placeholder="e.g. 1000"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              min={0}
              step={1}
            />
          </div>
        )}

        {/* Markup % input */}
        {state.mode === "markup-to-price" && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Markup (%)
            </label>
            <input
              type="number"
              value={state.markup || ""}
              onChange={(e) =>
                updateState({ markup: Math.max(0, Number(e.target.value) || 0) })
              }
              placeholder="e.g. 30"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              min={0}
              step={1}
            />
          </div>
        )}

        {/* Margin % input */}
        {state.mode === "margin-to-price" && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Target Margin (%)
            </label>
            <input
              type="number"
              value={state.margin || ""}
              onChange={(e) =>
                updateState({
                  margin: Math.min(99.9, Math.max(0, Number(e.target.value) || 0)),
                })
              }
              placeholder="e.g. 30"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              min={0}
              max={99.9}
              step={1}
            />
          </div>
        )}

        {/* Reverse mode: Selling Price input */}
        {state.mode === "reverse" && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Selling Price ($)
            </label>
            <input
              type="number"
              value={state.sellingPrice || ""}
              onChange={(e) =>
                updateState({
                  sellingPrice: Math.max(0, Number(e.target.value) || 0),
                })
              }
              placeholder="e.g. 1300"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              min={0}
              step={1}
            />
          </div>
        )}

        {/* Reverse mode: Cost input */}
        {state.mode === "reverse" && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Cost ($)
            </label>
            <input
              type="number"
              value={state.cost || ""}
              onChange={(e) =>
                updateState({ cost: Math.max(0, Number(e.target.value) || 0) })
              }
              placeholder="e.g. 1000"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              min={0}
              step={1}
            />
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-display text-base font-bold text-foreground">
              Result
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Selling Price</span>
              <span className="font-bold text-accent text-lg">
                ${formatCurrency(result.sellingPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Profit</span>
              <span className="font-semibold text-foreground">
                ${formatCurrency(result.profit)}
              </span>
            </div>
            <div className="pt-2 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Markup
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.markup}%
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Margin
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.margin}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          {state.mode === "reverse"
            ? "Enter a selling price higher than cost to see results."
            : "Enter a cost greater than $0 to see results."}
        </div>
      )}

      {/* Key insight */}
      {result && state.mode === "markup-to-price" && state.markup < 100 && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-accent">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Your <strong>{state.markup}% markup</strong> equals a{" "}
              <strong>{result.margin}% margin</strong>. If you meant to keep{" "}
              {state.markup}% as your profit margin, you need to charge{" "}
              <strong>
                $
                {formatCurrency(
                  state.cost / (1 - state.markup / 100)
                )}
              </strong>{" "}
              instead.
            </p>
          </div>
        </div>
      )}

      {result && state.mode === "margin-to-price" && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-accent">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              To achieve a <strong>{state.margin}% margin</strong>, you need a{" "}
              <strong>{result.markup}% markup</strong>. Many contractors
              accidentally charge the markup price when they meant the margin
              price — and lose{" "}
              <strong>
                ${formatCurrency(result.sellingPrice - state.cost * (1 + state.margin / 100))}
              </strong>{" "}
              per job.
            </p>
          </div>
        </div>
      )}

      {result && state.mode === "reverse" && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-accent">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              You&apos;re charging a <strong>{result.markup}% markup</strong> which
              equals a <strong>{result.margin}% margin</strong>.{" "}
              {result.margin < 20
                ? "That's below the typical 20–30% range for most trades. Check if you're covering overhead."
                : result.margin > 35
                  ? "That's above the typical range — make sure your pricing is competitive in your market."
                  : "That falls within the typical 20–30% range for most construction trades."}
            </p>
          </div>
        </div>
      )}

      {/* Quick Reference Table */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Quick Reference: Markup vs Margin
        </h3>
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-2 px-3 font-semibold text-foreground">
                    Markup
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-foreground">
                    Equals Margin
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-foreground">
                    On $1,000 Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {quickReference.map((entry) => (
                  <tr key={entry.markup} className="border-b border-border">
                    <td className="py-2 px-3 font-medium text-foreground">
                      {entry.markup}%
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {entry.margin}%
                    </td>
                    <td className="py-2 px-3 text-right text-muted-foreground">
                      ${(1000 * (1 + entry.markup / 100)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}