"use client";

import { useState } from "react";
import {
  type ConcreteDrivewayState,
  type ConcreteFinish,
  type DrivewayThickness,
  FINISH_TYPES,
  THICKNESS_OPTIONS,
  calculateConcreteDriveway,
  getDefaultState,
} from "../data/concrete-driveway";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function ConcreteDrivewayCalculator() {
  const [state, setState] = useState<ConcreteDrivewayState>(getDefaultState());
  const result = calculateConcreteDriveway(state);

  function updateState(partial: Partial<ConcreteDrivewayState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Driveway area */}
        <div className="sm:col-span-2">
          <label htmlFor="driveway-area" className="block text-sm font-semibold text-foreground mb-1.5">
            Driveway area (sq ft)
          </label>
          <input
            id="driveway-area"
            type="number"
            value={state.drivewayAreaSqFt || ""}
            onChange={(e) => updateState({ drivewayAreaSqFt: Math.max(0, Number(e.target.value) || 0) })}
            placeholder="e.g. 1000 (typical 2-car driveway)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={10}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Single-car ~600-800 sq ft · 2-car ~1,000-1,200 · 3-car ~1,500+
          </p>
        </div>

        {/* Finish */}
        <div className="sm:col-span-2">
          <label htmlFor="finish" className="block text-sm font-semibold text-foreground mb-1.5">
            Finish type
          </label>
          <select
            id="finish"
            value={state.finish}
            onChange={(e) => updateState({ finish: e.target.value as ConcreteFinish })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {(Object.keys(FINISH_TYPES) as ConcreteFinish[]).map((key) => (
              <option key={key} value={key}>
                {FINISH_TYPES[key].label} (${FINISH_TYPES[key].installedLow}-${FINISH_TYPES[key].installedHigh}/sq ft)
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{FINISH_TYPES[state.finish].description}</p>
        </div>

        {/* Thickness */}
        <div>
          <label htmlFor="thickness" className="block text-sm font-semibold text-foreground mb-1.5">
            Thickness
          </label>
          <select
            id="thickness"
            value={state.thickness}
            onChange={(e) => updateState({ thickness: Number(e.target.value) as DrivewayThickness })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {THICKNESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.usage}
              </option>
            ))}
          </select>
        </div>

        {/* Tear-off */}
        <div>
          <label htmlFor="tearoff" className="block text-sm font-semibold text-foreground mb-1.5">
            Remove old driveway?
          </label>
          <select
            id="tearoff"
            value={state.needsTearoff ? "yes" : "no"}
            onChange={(e) => updateState({ needsTearoff: e.target.value === "yes" })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            <option value="no">No — new construction</option>
            <option value="yes">Yes — remove existing (+$3/sq ft)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">Concrete Driveway Estimate</h3>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Concrete needed</span>
                <span className="text-xl font-bold text-accent">{result.concreteYardsNeeded} yd³</span>
                <span className="text-xs text-muted-foreground block mt-0.5">cubic yards</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Material cost</span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.materialCostLow)} - ${formatCurrency(result.materialCostHigh)}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Labor cost</span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.laborCostLow)} - ${formatCurrency(result.laborCostHigh)}
                </span>
              </div>
            </div>
            {result.tearoffCost > 0 && (
              <div className="p-4 pt-0">
                <span className="text-xs text-muted-foreground block">Old driveway removal</span>
                <span className="text-sm font-semibold text-foreground">
                  +${formatCurrency(result.tearoffCost)} (tear-off + disposal)
                </span>
              </div>
            )}
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground block">Total installed cost</span>
                <span className="text-xs text-muted-foreground">All-inclusive (materials + labor + permits)</span>
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

          <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Expected lifespan:</strong> {result.lifespanYears} ·{" "}
            <strong className="text-foreground">Tip:</strong> Order 10% extra concrete for waste.
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.drivewayAreaSqFt.toLocaleString()} sq ft,{" "}
            {FINISH_TYPES[state.finish].label}, {state.thickness}" thickness
            {state.needsTearoff ? ", with tear-off" : ", new construction"}. Prices from HomeAdvisor + Angi 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter a driveway area greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
