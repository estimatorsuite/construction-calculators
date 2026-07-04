"use client";

import { useState } from "react";
import {
  type LandscapingState, type LandscapeProject, type MaterialTier,
  PROJECT_TYPES, TIER_INFO, calculateLandscaping, getDefaultState,
} from "../data/landscaping-cost";

function fc(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function LandscapingCalculator() {
  const [state, setState] = useState<LandscapingState>(getDefaultState());
  const result = calculateLandscaping(state);
  function updateState(p: Partial<LandscapingState>) { setState((prev) => ({ ...prev, ...p })); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="area" className="block text-sm font-semibold text-foreground mb-1.5">Area to landscape (sq ft)</label>
          <input id="area" type="number" value={state.areaSqFt || ""} onChange={(e) => updateState({ areaSqFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 1000" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={50} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="project" className="block text-sm font-semibold text-foreground mb-1.5">Project type</label>
          <select id="project" value={state.project} onChange={(e) => updateState({ project: e.target.value as LandscapeProject })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(PROJECT_TYPES) as LandscapeProject[]).map((key) => (
              <option key={key} value={key}>{PROJECT_TYPES[key].label} (${PROJECT_TYPES[key].perSqFtLow}-{PROJECT_TYPES[key].perSqFtHigh}/sq ft)</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{PROJECT_TYPES[state.project].description}</p>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-foreground mb-2">Material tier</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TIER_INFO) as MaterialTier[]).map((key) => (
              <button key={key} type="button" onClick={() => updateState({ tier: key })} className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${state.tier === key ? "bg-accent text-white" : "bg-accent/10 text-foreground hover:bg-accent/20"}`} style={{ minHeight: "44px" }}>{TIER_INFO[key].label}</button>
            ))}
          </div>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Landscaping Estimate</h3></div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div><span className="text-xs text-muted-foreground block">Material cost</span><span className="text-sm font-semibold text-foreground">${fc(result.materialCostLow)} - ${fc(result.materialCostHigh)}</span></div>
              <div><span className="text-xs text-muted-foreground block">Labor cost</span><span className="text-sm font-semibold text-foreground">${fc(result.laborCostLow)} - ${fc(result.laborCostHigh)}</span></div>
            </div>
          </div>
          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-semibold text-foreground block">Total project cost</span><span className="text-xs text-muted-foreground">{PROJECT_TYPES[state.project].label}, {TIER_INFO[state.tier].label} tier</span></div>
              <div className="text-right"><span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}</span><span className="text-xs text-muted-foreground block mt-0.5">${result.costPerSqFtLow}-${result.costPerSqFtHigh}/sq ft</span></div>
            </div>
          </div>
          <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Timeline:</strong> {result.timelineWeeks}
          </div>
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.areaSqFt.toLocaleString()} sq ft, {PROJECT_TYPES[state.project].label.toLowerCase()}, {TIER_INFO[state.tier].label.toLowerCase()} materials. Prices from HomeAdvisor + Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter an area greater than 0.</div>
      )}
    </div>
  );
}
