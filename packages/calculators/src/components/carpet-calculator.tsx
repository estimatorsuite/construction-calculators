"use client";

import { useState } from "react";
import {
  type CarpetState,
  type CarpetGrade,
  GRADE_PRICES,
  calculateCarpet,
  getDefaultState,
} from "../data/carpet";

const GRADES: CarpetGrade[] = ["budget", "standard", "premium", "luxury"];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function CarpetCalculator() {
  const [state, setState] = useState<CarpetState>(getDefaultState());
  const result = calculateCarpet(state);

  function updateState(partial: Partial<CarpetState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Room length */}
        <div>
          <label
            htmlFor="room-length"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Room length (feet)
          </label>
          <input
            id="room-length"
            type="number"
            value={state.roomLengthFt || ""}
            onChange={(e) =>
              updateState({ roomLengthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 12"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Room width */}
        <div>
          <label
            htmlFor="room-width"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Room width (feet)
          </label>
          <input
            id="room-width"
            type="number"
            value={state.roomWidthFt || ""}
            onChange={(e) =>
              updateState({ roomWidthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 12"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Carpet grade */}
        <div className="sm:col-span-2">
          <label
            htmlFor="grade"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Carpet grade
          </label>
          <select
            id="grade"
            value={state.grade}
            onChange={(e) => updateState({ grade: e.target.value as CarpetGrade })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {GRADE_PRICES[g].label} (${GRADE_PRICES[g].priceLow}-${GRADE_PRICES[g].priceHigh}/sq yd)
              </option>
            ))}
          </select>
        </div>

        {/* Toggles */}
        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateState({ includePadding: !state.includePadding })}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              state.includePadding
                ? "bg-accent text-white"
                : "bg-accent/10 text-foreground hover:bg-accent/20"
            }`}
            style={{ minHeight: "44px" }}
          >
            Include padding
            <span className="block text-xs font-normal opacity-80 mt-0.5">
              $1-$3/sq yd rebond foam
            </span>
          </button>
          <button
            type="button"
            onClick={() => updateState({ includeInstall: !state.includeInstall })}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              state.includeInstall
                ? "bg-accent text-white"
                : "bg-accent/10 text-foreground hover:bg-accent/20"
            }`}
            style={{ minHeight: "44px" }}
          >
            Include installation
            <span className="block text-xs font-normal opacity-80 mt-0.5">
              $2-$4/sq yd stretch-in
            </span>
          </button>
        </div>
      </div>

      {/* Selected grade description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {GRADE_PRICES[state.grade].label}:
        </strong>{" "}
        {GRADE_PRICES[state.grade].description} Lifespan:{" "}
        {GRADE_PRICES[state.grade].lifespanYears}. Best for:{" "}
        {GRADE_PRICES[state.grade].recommendedUse}.
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
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Room area
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.roomAreaSqFt} sq ft
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Carpet needed
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.carpetNeededSqYd} sq yd
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ({result.carpetNeededSqFt} sq ft incl. 10% waste)
                </span>
              </div>
            </div>

            {state.includePadding && (
              <div className="p-4 pt-0 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Padding needed
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {result.paddingNeededSqYd} sq yd
                  </span>
                </div>
                <div />
              </div>
            )}

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
                  {result.laborCostLow === 0
                    ? "DIY (excluded)"
                    : `$${formatCurrency(result.laborCostLow)} - $${formatCurrency(result.laborCostHigh)}`}
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
                  Total estimated cost
                </span>
                <span className="text-xs text-muted-foreground">
                  {state.includeInstall ? "Materials + labor" : "Materials only (DIY)"}
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
            <strong>Based on:</strong> {state.roomLengthFt}′ × {state.roomWidthFt}′ ={" "}
            {result.roomAreaSqFt} sq ft, {GRADE_PRICES[state.grade].label}. Prices
            from Angi + HomeAdvisor 2026 data. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter room dimensions to see your estimate.
        </div>
      )}
    </div>
  );
}
