"use client";

import { useState } from "react";
import {
  type MulchState,
  type MulchType,
  MULCH_PRICES,
  calculateMulch,
  getDefaultState,
} from "../data/mulch";

const MULCH_TYPES: MulchType[] = ["bark", "woodChips", "cedar", "dyedMulch", "rubberMulch", "compost"];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function MulchCalculator() {
  const [state, setState] = useState<MulchState>(getDefaultState());
  const result = calculateMulch(state);

  function updateState(partial: Partial<MulchState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Area */}
        <div className="sm:col-span-2">
          <label
            htmlFor="mulch-area"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Area to cover (square feet)
          </label>
          <input
            id="mulch-area"
            type="number"
            value={state.areaSqFt || ""}
            onChange={(e) =>
              updateState({ areaSqFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 500"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Length × width of garden bed or area to mulch.
          </p>
        </div>

        {/* Depth */}
        <div>
          <label
            htmlFor="mulch-depth"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Mulch depth (inches)
          </label>
          <input
            id="mulch-depth"
            type="number"
            value={state.depthInches || ""}
            onChange={(e) =>
              updateState({ depthInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 3"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">Standard: 2-3 inches.</p>
        </div>

        {/* Material */}
        <div>
          <label
            htmlFor="mulch-type"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Mulch type
          </label>
          <select
            id="mulch-type"
            value={state.mulchType}
            onChange={(e) =>
              updateState({ mulchType: e.target.value as MulchType })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {MULCH_TYPES.map((t) => (
              <option key={t} value={t}>
                {MULCH_PRICES[t].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected material description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {MULCH_PRICES[state.mulchType].label}:
        </strong>{" "}
        {MULCH_PRICES[state.mulchType].description} Lifespan:{" "}
        {MULCH_PRICES[state.mulchType].lifespanYears}.
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Quantity & Cost Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Cubic yards needed
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.cubicYardsNeeded} cu yd
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Cubic feet
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.cubicFeetNeeded} cu ft
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  2 cu ft bags
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.bagsNeeded2CuFt} bags
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  3 cu ft bags
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.bagsNeeded3CuFt} bags
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Material cost (bulk)
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.materialCostLow)} - $
                  {formatCurrency(result.materialCostHigh)}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Delivery
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.deliveryCost > 0
                    ? `$${formatCurrency(result.deliveryCost)} (5+ cu yd)`
                    : "Included"}
                </span>
              </div>
            </div>
          </div>

          {/* Total cost */}
          <div
            className="rounded-xl p-4 border-l-4"
            style={{
              backgroundColor: "hsl(25, 85%, 97%)",
              borderColor: "hsl(25, 85%, 50%)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground block">
                  Total bulk cost
                </span>
                <span className="text-xs text-muted-foreground">
                  Material + delivery
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${formatCurrency(result.totalCostLow)} - $
                  {formatCurrency(result.totalCostHigh)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.areaSqFt} sq ft ×{" "}
            {state.depthInches}" depth ×{" "}
            {MULCH_PRICES[state.mulchType].label}. Formula: cu ft = area ×
            (depth÷12), cu yd = cu ft ÷ 27. Prices from HomeAdvisor + Angi 2026
            data.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter area and depth greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
