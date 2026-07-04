"use client";

import { useState } from "react";
import {
  type InsulationState,
  type ClimateZone,
  type ApplicationArea,
  CLIMATE_ZONES,
  APPLICATION_AREAS,
  calculateInsulation,
  getDefaultState,
} from "../data/insulation-r-value";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function InsulationRValueCalculator() {
  const [state, setState] = useState<InsulationState>(getDefaultState());
  const result = calculateInsulation(state);

  function updateState(partial: Partial<InsulationState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Climate Zone */}
        <div>
          <label
            htmlFor="climate-zone"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Climate zone
          </label>
          <select
            id="climate-zone"
            value={state.climateZone}
            onChange={(e) =>
              updateState({ climateZone: e.target.value as ClimateZone })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {CLIMATE_ZONES.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label} — {z.states}
              </option>
            ))}
          </select>
        </div>

        {/* Application Area */}
        <div>
          <label
            htmlFor="application-area"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Application area
          </label>
          <select
            id="application-area"
            value={state.area}
            onChange={(e) =>
              updateState({ area: e.target.value as ApplicationArea })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {APPLICATION_AREAS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {/* Area Sq Ft */}
        <div className="sm:col-span-2">
          <label
            htmlFor="insulation-area"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Area to insulate (square feet)
          </label>
          <input
            id="insulation-area"
            type="number"
            value={state.areaSqFt || ""}
            onChange={(e) =>
              updateState({ areaSqFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 1000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Attic floor area, wall area, or floor area in square feet.
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
                Recommended Insulation
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Recommended R-Value
                </span>
                <span className="text-xl font-bold text-accent">
                  R-{result.recommendedRValue}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Material type
                </span>
                <span className="text-base font-bold text-foreground">
                  {result.materialType}
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Inches needed
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.inchesNeeded}"
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Batts / Bags needed
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.battsNeeded} batts or {result.bagsNeeded} bags
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
                  Material + labor
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
            <strong>Based on:</strong> {state.areaSqFt} sq ft in{" "}
            {CLIMATE_ZONES.find((z) => z.value === state.climateZone)?.label},{" "}
            {APPLICATION_AREAS.find((a) => a.value === state.area)?.label}. R-value
            from DOE/IRC 2024. Prices from HomeAdvisor 2026 data.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter an area value greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
