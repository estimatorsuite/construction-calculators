"use client";

import { useState } from "react";
import {
  type RepipingCalculatorState,
  type PipeMaterial,
  type Stories,
  PIPE_MATERIALS,
  calculateRepiping,
  getDefaultState,
} from "../data/house-repiping";

const BATHROOM_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function HouseRepipingCalculator() {
  const [state, setState] = useState<RepipingCalculatorState>(getDefaultState());
  const result = calculateRepiping(state);

  function updateState(partial: Partial<RepipingCalculatorState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* House size */}
        <div className="sm:col-span-2">
          <label
            htmlFor="house-size"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            House size (sq ft)
          </label>
          <input
            id="house-size"
            type="number"
            value={state.houseSizeSqFt || ""}
            onChange={(e) =>
              updateState({ houseSizeSqFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 2000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={100}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Bathrooms */}
        <div>
          <label
            htmlFor="bathrooms"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Number of bathrooms
          </label>
          <select
            id="bathrooms"
            value={state.bathrooms}
            onChange={(e) => updateState({ bathrooms: Number(e.target.value) })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {BATHROOM_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b} {b === 1 ? "bathroom" : "bathrooms"}
              </option>
            ))}
          </select>
        </div>

        {/* Stories */}
        <div>
          <label
            htmlFor="stories"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Number of stories
          </label>
          <select
            id="stories"
            value={state.stories}
            onChange={(e) => updateState({ stories: Number(e.target.value) as Stories })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            <option value={1}>1 story (single level)</option>
            <option value={2}>2 stories (+25% complexity)</option>
          </select>
        </div>

        {/* Material */}
        <div className="sm:col-span-2">
          <label
            htmlFor="material"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Pipe material
          </label>
          <select
            id="material"
            value={state.material}
            onChange={(e) => updateState({ material: e.target.value as PipeMaterial })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {(Object.keys(PIPE_MATERIALS) as PipeMaterial[]).map((key) => (
              <option key={key} value={key}>
                {PIPE_MATERIALS[key].label} (${PIPE_MATERIALS[key].perSqFtLow}-${PIPE_MATERIALS[key].perSqFtHigh}/sq ft)
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {PIPE_MATERIALS[state.material].description} Lifespan:{" "}
            {PIPE_MATERIALS[state.material].lifespanYears}.
          </p>
        </div>
      </div>

      {/* Material pros/cons */}
      <div className="glass-card rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <strong className="text-green-600 dark:text-green-400">Pros:</strong>{" "}
          <span className="text-muted-foreground">
            {PIPE_MATERIALS[state.material].pros}
          </span>
        </div>
        <div>
          <strong className="text-red-600 dark:text-red-400">Cons:</strong>{" "}
          <span className="text-muted-foreground">
            {PIPE_MATERIALS[state.material].cons}
          </span>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Whole-House Repipe Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Estimated fixtures
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.estimatedFixtures}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  sinks, toilets, showers
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Pipe length estimate
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.pipeLengthEstimate} ft
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  hot + cold lines
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
                  Labor cost (~70%)
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
                  Total repipe cost
                </span>
                <span className="text-xs text-muted-foreground">
                  Plumbing work only (permits included)
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

          {/* Wall repair note */}
          <div className="glass-card rounded-lg p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Don&apos;t forget wall repair (+${formatCurrency(result.wallRepairCost)})
            </h4>
            <p className="text-xs text-muted-foreground">
              Repiping requires cutting access holes in ~15% of your walls. Most
              plumbers don&apos;t include drywall repair in their quote. Budget
              an additional{" "}
              <strong className="text-foreground">
                ${formatCurrency(result.wallRepairCost)}
              </strong>{" "}
              for patching, texture, and paint — usually done by a separate drywall
              contractor.
            </p>
            <p className="text-xs font-semibold text-foreground mt-2">
              Total project cost (plumbing + wall repair):{" "}
              ${formatCurrency(result.totalWithWallRepairLow)} - $
              {formatCurrency(result.totalWithWallRepairHigh)}
            </p>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.houseSizeSqFt.toLocaleString()} sq ft
            home, {state.bathrooms} bathrooms, {state.stories}{" "}
            {state.stories === 1 ? "story" : "stories"},{" "}
            {PIPE_MATERIALS[state.material].label}. Prices from Angi + HomeAdvisor
            2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter a house size greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
