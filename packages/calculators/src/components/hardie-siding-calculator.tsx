"use client";

import { useState } from "react";
import {
  type HardieCalculatorState,
  type PlankExposure,
  type HardieProduct,
  PRODUCT_SPECS,
  EXPOSURE_OPTIONS,
  DEFAULT_OPENINGS_PERCENT,
  calculateHardie,
  getDefaultState,
} from "../data/hardie-siding";

const PRODUCTS: HardieProduct[] = ["hardiePlankLap", "hardiePanelVertical", "hardieShingle"];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function HardieSidingCalculator() {
  const [state, setState] = useState<HardieCalculatorState>(getDefaultState());
  const result = calculateHardie(state);

  function updateState(partial: Partial<HardieCalculatorState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wall area */}
        <div className="sm:col-span-2">
          <label
            htmlFor="wall-area"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Total exterior wall area (sq ft)
          </label>
          <input
            id="wall-area"
            type="number"
            value={state.wallAreaSqFt || ""}
            onChange={(e) =>
              updateState({ wallAreaSqFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 2000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={10}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Wall length × height for each exterior wall, added together. Typical
            2,000 sq ft home has ~2,000-2,500 sq ft of exterior wall.
          </p>
        </div>

        {/* Openings */}
        <div>
          <label
            htmlFor="openings"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Door & window openings (%)
          </label>
          <input
            id="openings"
            type="number"
            value={state.openingsPercent}
            onChange={(e) =>
              updateState({
                openingsPercent: Math.min(40, Math.max(0, Number(e.target.value) || 0)),
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            max={40}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Default {DEFAULT_OPENINGS_PERCENT}% accounts for typical door/window ratio.
          </p>
        </div>

        {/* Exposure */}
        <div>
          <label
            htmlFor="exposure"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Plank exposure (width)
          </label>
          <select
            id="exposure"
            value={state.exposure}
            onChange={(e) =>
              updateState({ exposure: Number(e.target.value) as PlankExposure })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {EXPOSURE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.usage}
              </option>
            ))}
          </select>
        </div>

        {/* Product line */}
        <div className="sm:col-span-2">
          <label
            htmlFor="product"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Hardie® product line
          </label>
          <select
            id="product"
            value={state.product}
            onChange={(e) =>
              updateState({ product: e.target.value as HardieProduct })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {PRODUCT_SPECS[p].label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {PRODUCT_SPECS[state.product].description}
          </p>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Material & Cost Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Net siding needed
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.totalSidingNeeded.toLocaleString()} sq ft
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ({result.squaresNeeded} squares, incl. 10% waste)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Planks needed
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.planksNeeded.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  12 ft boards
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Pallets to order
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.palletsNeeded}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  full pallets
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Material cost
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.materialCostLow)} - $
                  {formatCurrency(result.materialCostHigh)}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Labor cost
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.laborCostLow)} - $
                  {formatCurrency(result.laborCostHigh)}
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
                  Total installed cost
                </span>
                <span className="text-xs text-muted-foreground">
                  Materials + labor (national average)
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${formatCurrency(result.totalCostLow)} - $
                  {formatCurrency(result.totalCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ${result.costPerSqFtLow}-${result.costPerSqFtHigh}/sq ft
                </span>
              </div>
            </div>
          </div>

          {/* Premium market note */}
          <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Premium markets:</strong>{" "}
            Northeast & West Coast typically run{" "}
            <strong className="text-foreground">$10-$22/sq ft installed</strong>.
            Add 30-50% to the estimate above for these regions.
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.wallAreaSqFt.toLocaleString()} sq ft
            walls − {state.openingsPercent}% openings × 1.10 waste.{" "}
            {PRODUCT_SPECS[state.product].label} at{" "}
            {state.exposure}" exposure. Prices from HomeAdvisor + Homewyse 2026.
            Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter a wall area greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
