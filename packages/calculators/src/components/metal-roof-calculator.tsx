"use client";

import { useState } from "react";
import {
  type MetalRoofState,
  type MetalRoofType,
  ROOF_TYPE_PRICES,
  calculateMetalRoof,
  getDefaultState,
} from "../data/metal-roof";

const ROOF_TYPES: MetalRoofType[] = ["standingSeam", "corrugated", "stoneCoated", "metalShingle"];

function fc(v: number): string {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function MetalRoofCalculator() {
  const [state, setState] = useState<MetalRoofState>(getDefaultState());
  const result = calculateMetalRoof(state);

  function updateState(partial: Partial<MetalRoofState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Roof area */}
        <div className="sm:col-span-2">
          <label
            htmlFor="roof-area"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Total roof area (square feet)
          </label>
          <input
            id="roof-area"
            type="number"
            value={state.roofAreaSqFt || ""}
            onChange={(e) =>
              updateState({ roofAreaSqFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 2000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Enter the actual roof surface area (not house footprint). A 1,800 sq ft
            single-story house typically has 2,000-2,400 sq ft of roof depending on pitch.
          </p>
        </div>

        {/* Roof type */}
        <div>
          <label
            htmlFor="roof-type"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Metal roof type
          </label>
          <select
            id="roof-type"
            value={state.roofType}
            onChange={(e) =>
              updateState({ roofType: e.target.value as MetalRoofType })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {ROOF_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {ROOF_TYPE_PRICES[rt].label} — ${ROOF_TYPE_PRICES[rt].installedLow}-${ROOF_TYPE_PRICES[rt].installedHigh}/sq ft
              </option>
            ))}
          </select>
        </div>

        {/* Tear-off toggle */}
        <div>
          <label
            htmlFor="tearoff"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Tear off existing roof?
          </label>
          <select
            id="tearoff"
            value={state.includeTearoff ? "yes" : "no"}
            onChange={(e) => updateState({ includeTearoff: e.target.value === "yes" })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            <option value="yes">Yes — remove old shingles (+$1-$3/sq ft)</option>
            <option value="no">No — install over existing roof</option>
          </select>
        </div>
      </div>

      {/* Selected type description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {ROOF_TYPE_PRICES[state.roofType].label}:
        </strong>{" "}
        {ROOF_TYPE_PRICES[state.roofType].description} Lifespan:{" "}
        {ROOF_TYPE_PRICES[state.roofType].lifespanYears}.
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Metal Roof Installation Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Roof area</span>
                <span className="text-xl font-bold text-accent">
                  {fc(state.roofAreaSqFt)} sq ft
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ({result.roofAreaSquares} squares)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Material cost</span>
                <span className="text-sm font-semibold text-foreground">
                  ${fc(result.materialCostLow)} - ${fc(result.materialCostHigh)}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Labor cost</span>
                <span className="text-sm font-semibold text-foreground">
                  ${fc(result.laborCostLow)} - ${fc(result.laborCostHigh)}
                </span>
              </div>
            </div>
            {state.includeTearoff && (
              <div className="p-4 pt-0">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Tear-off & disposal
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    ${fc(result.tearoffCostLow)} - ${fc(result.tearoffCostHigh)}
                  </span>
                </div>
              </div>
            )}
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
                  {ROOF_TYPE_PRICES[state.roofType].label}, {fc(state.roofAreaSqFt)} sq ft
                  {state.includeTearoff ? ", with tear-off" : ""}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ${result.costPerSqFtLow}-${result.costPerSqFtHigh}/sq ft
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {fc(state.roofAreaSqFt)} sq ft of{" "}
            {ROOF_TYPE_PRICES[state.roofType].label}
            {state.includeTearoff ? " including tear-off" : ""}. Expected lifespan:{" "}
            {result.lifespanYears}. Prices from HomeAdvisor + Metal Roofing Alliance 2026.
            Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter a roof area value greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
