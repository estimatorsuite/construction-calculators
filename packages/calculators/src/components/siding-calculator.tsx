"use client";

import { useState } from "react";
import {
  type SidingCalculatorState,
  type SidingMaterial,
  type HouseComplexity,
  SIDING_MATERIALS,
  COMPLEXITY_MULTIPLIERS,
  calculateSiding,
  getDefaultState,
} from "../data/siding";

function formatCurrency(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function SidingCalculator() {
  const [state, setState] = useState<SidingCalculatorState>(getDefaultState());
  const result = calculateSiding(state);
  function updateState(p: Partial<SidingCalculatorState>) {
    setState((prev) => ({ ...prev, ...p }));
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="wall-area" className="block text-sm font-semibold text-foreground mb-1.5">
            Total exterior wall area (sq ft)
          </label>
          <input
            id="wall-area"
            type="number"
            value={state.wallAreaSqFt || ""}
            onChange={(e) => updateState({ wallAreaSqFt: Math.max(0, Number(e.target.value) || 0) })}
            placeholder="e.g. 2000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={10}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">Wall length × height for each exterior wall, added together.</p>
        </div>

        <div>
          <label htmlFor="openings" className="block text-sm font-semibold text-foreground mb-1.5">
            Door/window openings (%)
          </label>
          <input
            id="openings"
            type="number"
            value={state.openingsPercent}
            onChange={(e) => updateState({ openingsPercent: Math.min(40, Math.max(0, Number(e.target.value) || 0)) })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            max={40}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        <div>
          <label htmlFor="complexity" className="block text-sm font-semibold text-foreground mb-1.5">
            House complexity
          </label>
          <select
            id="complexity"
            value={state.complexity}
            onChange={(e) => updateState({ complexity: e.target.value as HouseComplexity })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {(Object.keys(COMPLEXITY_MULTIPLIERS) as HouseComplexity[]).map((key) => (
              <option key={key} value={key}>
                {COMPLEXITY_MULTIPLIERS[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="material" className="block text-sm font-semibold text-foreground mb-1.5">
            Siding material
          </label>
          <select
            id="material"
            value={state.material}
            onChange={(e) => updateState({ material: e.target.value as SidingMaterial })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {(Object.keys(SIDING_MATERIALS) as SidingMaterial[]).map((key) => (
              <option key={key} value={key}>
                {SIDING_MATERIALS[key].label} (${SIDING_MATERIALS[key].installedLow}-${SIDING_MATERIALS[key].installedHigh}/sq ft)
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{SIDING_MATERIALS[state.material].description}</p>
        </div>
      </div>

      <div className="glass-card rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div><strong className="text-green-600 dark:text-green-400">Pros:</strong> <span className="text-muted-foreground">{SIDING_MATERIALS[state.material].pros}</span></div>
        <div><strong className="text-red-600 dark:text-red-400">Cons:</strong> <span className="text-muted-foreground">{SIDING_MATERIALS[state.material].cons}</span></div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">Siding Material & Cost Estimate</h3>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Total siding needed</span>
                <span className="text-xl font-bold text-accent">{result.totalSidingNeeded.toLocaleString()} sq ft</span>
                <span className="text-xs text-muted-foreground block mt-0.5">{result.squaresNeeded} squares (incl. 10% waste)</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Material cost</span>
                <span className="text-sm font-semibold text-foreground">${formatCurrency(result.materialCostLow)} - ${formatCurrency(result.materialCostHigh)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Labor cost</span>
                <span className="text-sm font-semibold text-foreground">${formatCurrency(result.laborCostLow)} - ${formatCurrency(result.laborCostHigh)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground block">Total installed cost</span>
                <span className="text-xs text-muted-foreground">Materials + labor + complexity adjustment</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${formatCurrency(result.totalCostLow)} - ${formatCurrency(result.totalCostHigh)}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">${result.costPerSqFtLow}-${result.costPerSqFtHigh}/sq ft</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.wallAreaSqFt.toLocaleString()} sq ft walls − {state.openingsPercent}% openings, {SIDING_MATERIALS[state.material].label}, {COMPLEXITY_MULTIPLIERS[state.complexity].label.toLowerCase()}. Prices from HomeAdvisor + Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter a wall area greater than 0 to see your estimate.</div>
      )}
    </div>
  );
}
