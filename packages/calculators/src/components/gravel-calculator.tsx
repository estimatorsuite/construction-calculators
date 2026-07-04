"use client";

import { useState } from "react";
import {
  type GravelState,
  type GravelType,
  GRAVEL_PRICES,
  calculateGravel,
  getDefaultState,
} from "../data/gravel";

const GRAVEL_TYPES: GravelType[] = ["crushedStone", "peaGravel", "riverRock", "limestone", "decomposedGranite", "slag"];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function GravelCalculator() {
  const [state, setState] = useState<GravelState>(getDefaultState());
  const result = calculateGravel(state);

  function updateState(partial: Partial<GravelState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Area */}
        <div className="sm:col-span-2">
          <label
            htmlFor="gravel-area"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Area to cover (square feet)
          </label>
          <input
            id="gravel-area"
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
            Length × width of driveway, path, or garden bed.
          </p>
        </div>

        {/* Depth */}
        <div>
          <label
            htmlFor="gravel-depth"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Gravel depth (inches)
          </label>
          <input
            id="gravel-depth"
            type="number"
            value={state.depthInches || ""}
            onChange={(e) =>
              updateState({ depthInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 4"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">Driveways: 4-6". Paths: 2-3".</p>
        </div>

        {/* Material */}
        <div>
          <label
            htmlFor="gravel-type"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Gravel type
          </label>
          <select
            id="gravel-type"
            value={state.gravelType}
            onChange={(e) =>
              updateState({ gravelType: e.target.value as GravelType })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {GRAVEL_TYPES.map((t) => (
              <option key={t} value={t}>
                {GRAVEL_PRICES[t].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected material description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {GRAVEL_PRICES[state.gravelType].label}:
        </strong>{" "}
        {GRAVEL_PRICES[state.gravelType].description} Best for:{" "}
        {GRAVEL_PRICES[state.gravelType].bestUse}.
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
                  Tons needed
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.tonsNeeded} tons
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  0.5 cu ft bags (retail)
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.bagsNeeded05CuFt} bags
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Material cost (bulk/ton)
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.materialCostLow)} - $
                  {formatCurrency(result.materialCostHigh)}
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
                  Total delivered cost
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
            {GRAVEL_PRICES[state.gravelType].label}. Formula: cu ft = area ×
            (depth÷12), cu yd = cu ft ÷ 27, tons = cu yd × 1.4. Prices from
            HomeAdvisor + Angi 2026 data.
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
