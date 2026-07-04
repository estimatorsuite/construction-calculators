"use client";

import { useState } from "react";
import {
  type EpoxyCalculatorState,
  type EpoxyCoatingType,
  type SurfaceCondition,
  COATING_TYPES,
  SURFACE_CONDITIONS,
  calculateEpoxy,
  getDefaultState,
} from "../data/epoxy-flooring";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function EpoxyFlooringCalculator() {
  const [state, setState] = useState<EpoxyCalculatorState>(getDefaultState());
  const result = calculateEpoxy(state);

  function updateState(partial: Partial<EpoxyCalculatorState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Floor area */}
        <div className="sm:col-span-2">
          <label
            htmlFor="floor-area"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Floor area (sq ft)
          </label>
          <input
            id="floor-area"
            type="number"
            value={state.floorAreaSqFt || ""}
            onChange={(e) =>
              updateState({ floorAreaSqFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 450 (typical 2-car garage)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={10}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            1-car garage ~250 sq ft · 2-car ~450 · 3-car ~650 · 4-car ~900
          </p>
        </div>

        {/* Coating type */}
        <div className="sm:col-span-2">
          <label
            htmlFor="coating"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Coating system
          </label>
          <select
            id="coating"
            value={state.coatingType}
            onChange={(e) =>
              updateState({ coatingType: e.target.value as EpoxyCoatingType })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {(Object.keys(COATING_TYPES) as EpoxyCoatingType[]).map((key) => (
              <option key={key} value={key}>
                {COATING_TYPES[key].label} (${COATING_TYPES[key].installedLow}-${COATING_TYPES[key].installedHigh}/sq ft)
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {COATING_TYPES[state.coatingType].description} Cures in{" "}
            {COATING_TYPES[state.coatingType].cureTimeHours}h. Lifespan:{" "}
            {COATING_TYPES[state.coatingType].lifespanYears}.
          </p>
        </div>

        {/* Surface condition */}
        <div className="sm:col-span-2">
          <label
            htmlFor="surface"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Current floor condition
          </label>
          <select
            id="surface"
            value={state.surfaceCondition}
            onChange={(e) =>
              updateState({ surfaceCondition: e.target.value as SurfaceCondition })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {(Object.keys(SURFACE_CONDITIONS) as SurfaceCondition[]).map((key) => (
              <option key={key} value={key}>
                {SURFACE_CONDITIONS[key].label}
                {SURFACE_CONDITIONS[key].prepCostPerSqFt > 0 &&
                  ` (+$${SURFACE_CONDITIONS[key].prepCostPerSqFt}/sq ft prep)`}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {SURFACE_CONDITIONS[state.surfaceCondition].description}
          </p>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Epoxy Floor Cost Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
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
            {result.surfacePrepCost > 0 && (
              <div className="p-4 pt-0">
                <span className="text-xs text-muted-foreground block">
                  Surface preparation
                </span>
                <span className="text-sm font-semibold text-foreground">
                  +${formatCurrency(result.surfacePrepCost)} (crack repair / grinding)
                </span>
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
                  Materials + labor + surface prep
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

          {/* Cure time */}
          <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Cure time:</strong>{" "}
            {result.cureTimeHours} hours ·{" "}
            <strong className="text-foreground">Expected lifespan:</strong>{" "}
            {result.lifespanYears}
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.floorAreaSqFt.toLocaleString()} sq ft,{" "}
            {COATING_TYPES[state.coatingType].label},{" "}
            {SURFACE_CONDITIONS[state.surfaceCondition].label.toLowerCase()}. Prices
            from HomeAdvisor + Homewyse 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter a floor area greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
