"use client";

import { useState } from "react";
import {
  type SprayFoamState,
  type FoamType,
  type ApplicationArea,
  FOAM_TYPES,
  AREA_DEFAULTS,
  calculateSprayFoam,
  getDefaultState,
} from "../data/spray-foam-insulation";

function formatCurrency(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function SprayFoamInsulationCalculator() {
  const [state, setState] = useState<SprayFoamState>(getDefaultState());
  const result = calculateSprayFoam(state);
  function updateState(p: Partial<SprayFoamState>) {
    setState((prev) => ({ ...prev, ...p }));
  }
  function handleAreaChange(area: ApplicationArea) {
    updateState({ area, thicknessInches: AREA_DEFAULTS[area].defaultThickness });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="area-sqft" className="block text-sm font-semibold text-foreground mb-1.5">Area to insulate (sq ft)</label>
          <input id="area-sqft" type="number" value={state.areaSqFt || ""} onChange={(e) => updateState({ areaSqFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 1000" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={10} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>

        <div>
          <label htmlFor="foam-type" className="block text-sm font-semibold text-foreground mb-1.5">Foam type</label>
          <select id="foam-type" value={state.foamType} onChange={(e) => updateState({ foamType: e.target.value as FoamType })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(FOAM_TYPES) as FoamType[]).map((key) => (
              <option key={key} value={key}>{FOAM_TYPES[key].label} (${FOAM_TYPES[key].pricePerBoardFtLow}-{FOAM_TYPES[key].pricePerBoardFtHigh}/board ft)</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="thickness" className="block text-sm font-semibold text-foreground mb-1.5">Thickness (inches)</label>
          <input id="thickness" type="number" value={state.thicknessInches || ""} onChange={(e) => updateState({ thicknessInches: Math.max(0, Number(e.target.value) || 0) })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} max={12} step={0.5} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-foreground mb-2">Application area</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(AREA_DEFAULTS) as ApplicationArea[]).map((key) => (
              <button key={key} type="button" onClick={() => handleAreaChange(key)} className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${state.area === key ? "bg-accent text-white" : "bg-accent/10 text-foreground hover:bg-accent/20"}`} style={{ minHeight: "44px" }}>
                {AREA_DEFAULTS[key].label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{AREA_DEFAULTS[state.area].notes}</p>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Spray Foam Estimate</h3></div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Board feet needed</span>
                <span className="text-xl font-bold text-accent">{result.boardFeet.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">sq ft × thickness</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Total R-value</span>
                <span className="text-xl font-bold text-foreground">R-{result.rValue}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">{FOAM_TYPES[state.foamType].rValuePerInch}/inch × {state.thicknessInches}"</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Material cost</span>
                <span className="text-sm font-semibold text-foreground">${formatCurrency(result.materialCostLow)} - ${formatCurrency(result.materialCostHigh)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground block">Total installed cost</span>
                <span className="text-xs text-muted-foreground">{FOAM_TYPES[state.foamType].label}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${formatCurrency(result.totalCostLow)} - ${formatCurrency(result.totalCostHigh)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div><strong className="text-green-600 dark:text-green-400">Pros:</strong> <span className="text-muted-foreground">{FOAM_TYPES[state.foamType].pros}</span></div>
            <div><strong className="text-red-600 dark:text-red-400">Cons:</strong> <span className="text-muted-foreground">{FOAM_TYPES[state.foamType].cons}</span></div>
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.areaSqFt.toLocaleString()} sq ft × {state.thicknessInches}" = {result.boardFeet.toLocaleString()} board feet of {FOAM_TYPES[state.foamType].label}. Prices from HomeAdvisor + Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter an area and thickness greater than 0.</div>
      )}
    </div>
  );
}
