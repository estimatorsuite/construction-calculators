"use client";

import { useState } from "react";
import {
  type GutterCalculatorState,
  type GutterMaterial,
  MATERIAL_PRICES,
  calculateGutter,
  getDefaultState,
} from "../data/gutter";

const MATERIALS: GutterMaterial[] = ["aluminum", "vinyl", "steel", "copper"];

function fc(v: number): string {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function GutterCalculator() {
  const [state, setState] = useState<GutterCalculatorState>(getDefaultState());
  const result = calculateGutter(state);

  function updateState(partial: Partial<GutterCalculatorState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* House perimeter */}
        <div className="sm:col-span-2">
          <label
            htmlFor="perimeter"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Total roof edge length (linear feet)
          </label>
          <input
            id="perimeter"
            type="number"
            value={state.housePerimeterFt || ""}
            onChange={(e) =>
              updateState({ housePerimeterFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 200"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Measure the perimeter of the roof edge where gutters will be installed.
            A typical 2,000 sq ft house has ~180-220 linear feet of roof edge.
          </p>
        </div>

        {/* Material */}
        <div>
          <label
            htmlFor="material"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Gutter material
          </label>
          <select
            id="material"
            value={state.material}
            onChange={(e) =>
              updateState({ material: e.target.value as GutterMaterial })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {MATERIALS.map((mat) => (
              <option key={mat} value={mat}>
                {MATERIAL_PRICES[mat].label} — ${MATERIAL_PRICES[mat].installedLow}-${MATERIAL_PRICES[mat].installedHigh}/lf
              </option>
            ))}
          </select>
        </div>

        {/* Downspouts toggle */}
        <div>
          <label
            htmlFor="downspouts"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Include downspouts?
          </label>
          <select
            id="downspouts"
            value={state.includeDownspouts ? "yes" : "no"}
            onChange={(e) => updateState({ includeDownspouts: e.target.value === "yes" })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            <option value="yes">Yes — include downspouts (+$5-$10/lf)</option>
            <option value="no">No — gutters only</option>
          </select>
        </div>
      </div>

      {/* Selected material description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {MATERIAL_PRICES[state.material].label}:
        </strong>{" "}
        {MATERIAL_PRICES[state.material].description} Lifespan:{" "}
        {MATERIAL_PRICES[state.material].lifespanYears}.
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Gutter Installation Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Material cost
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${fc(result.materialCostLow)} - ${fc(result.materialCostHigh)}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Labor cost
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${fc(result.laborCostLow)} - ${fc(result.laborCostHigh)}
                </span>
              </div>
            </div>
            {state.includeDownspouts && (
              <div className="p-4 pt-0">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Downspouts cost
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    ${fc(result.downspoutCostLow)} - ${fc(result.downspoutCostHigh)}
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
                  {state.housePerimeterFt} linear ft of {MATERIAL_PRICES[state.material].label}
                  {state.includeDownspouts ? " + downspouts" : ""}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ${result.costPerLinearFootLow}-${result.costPerLinearFootHigh}/linear ft
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.housePerimeterFt} linear feet of{" "}
            {MATERIAL_PRICES[state.material].label}
            {state.includeDownspouts ? " including downspouts" : ""}. Prices from HomeAdvisor
            + Angi 2026 data. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter a linear feet value greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
