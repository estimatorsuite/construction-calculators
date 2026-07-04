"use client";

import { useState } from "react";
import {
  type PressureWashingState,
  type WashingSurface,
  type DirtLevel,
  SURFACE_TYPES,
  DIRT_LEVELS,
  MINIMUM_SERVICE_FEE,
  calculatePressureWashing,
  getDefaultState,
} from "../data/pressure-washing";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function PressureWashingCalculator() {
  const [state, setState] = useState<PressureWashingState>(getDefaultState());
  const result = calculatePressureWashing(state);

  function updateState(partial: Partial<PressureWashingState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  const surface = SURFACE_TYPES[state.surfaceType];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Surface type */}
        <div className="sm:col-span-2">
          <label htmlFor="surface-type" className="block text-sm font-semibold text-foreground mb-1.5">
            What are you cleaning?
          </label>
          <select
            id="surface-type"
            value={state.surfaceType}
            onChange={(e) => updateState({ surfaceType: e.target.value as WashingSurface })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {(Object.keys(SURFACE_TYPES) as WashingSurface[]).map((key) => (
              <option key={key} value={key}>
                {SURFACE_TYPES[key].label} (${SURFACE_TYPES[key].costPerSqFtLow}-${SURFACE_TYPES[key].costPerSqFtHigh}/sq ft)
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {surface.description} Recommended: {surface.psiRange}
          </p>
        </div>

        {/* Area */}
        <div className="sm:col-span-2">
          <label htmlFor="area" className="block text-sm font-semibold text-foreground mb-1.5">
            Area to clean (sq ft)
          </label>
          <input
            id="area"
            type="number"
            value={state.areaSqFt || ""}
            onChange={(e) => updateState({ areaSqFt: Math.max(0, Number(e.target.value) || 0) })}
            placeholder="e.g. 1000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={10}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">{surface.notes}</p>
        </div>

        {/* Dirt level */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Dirt level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(DIRT_LEVELS) as DirtLevel[]).map((key) => {
              const d = DIRT_LEVELS[key];
              const isActive = state.dirtLevel === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateState({ dirtLevel: key })}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive ? "bg-accent text-white" : "bg-accent/10 text-foreground hover:bg-accent/20"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  {d.label.split(" — ")[0]}
                  <span className="block text-xs font-normal opacity-80 mt-0.5">
                    {d.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Minimum fee warning */}
          {result.totalCostLow === MINIMUM_SERVICE_FEE && (
            <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground border-l-4 border-amber-500">
              <strong className="text-foreground">Small job:</strong> Most pros charge a{" "}
              <strong className="text-foreground">${MINIMUM_SERVICE_FEE} minimum service fee</strong>.
              Your estimate hits this minimum.
            </div>
          )}

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground block">Estimated cost</span>
                <span className="text-xs text-muted-foreground">
                  Pro service, includes chemicals &amp; cleanup
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${formatCurrency(result.totalCostLow)} - ${formatCurrency(result.totalCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ${result.costPerSqFtLow}-${result.costPerSqFtHigh}/sq ft
                </span>
              </div>
            </div>
          </div>

          {/* Job details */}
          <div className="glass-card rounded-lg p-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <strong className="text-foreground block">Estimated time</strong>
              <span className="text-muted-foreground">{result.estimatedHours} hour{result.estimatedHours !== 1 ? "s" : ""}</span>
            </div>
            <div>
              <strong className="text-foreground block">Method</strong>
              <span className="text-muted-foreground">{surface.psiRange}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.areaSqFt.toLocaleString()} sq ft of{" "}
            {surface.label.toLowerCase()},{" "}
            {DIRT_LEVELS[state.dirtLevel].label.toLowerCase()}. Prices from HomeAdvisor + Angi 2026.
            Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter an area greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
