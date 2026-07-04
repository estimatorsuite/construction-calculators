"use client";

import { useState } from "react";
import {
  type FurnaceState, type ClimateSeverity, type InsulationQuality, type FurnaceEfficiency,
  CLIMATE_INFO, INSULATION_INFO, EFFICIENCY_INFO, calculateFurnaceSize, getDefaultState,
} from "../data/furnace-size";

function fc(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function FurnaceSizeCalculator() {
  const [state, setState] = useState<FurnaceState>(getDefaultState());
  const result = calculateFurnaceSize(state);
  function updateState(p: Partial<FurnaceState>) { setState((prev) => ({ ...prev, ...p })); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="house-size" className="block text-sm font-semibold text-foreground mb-1.5">House size (sq ft)</label>
          <input id="house-size" type="number" value={state.houseSizeSqFt || ""} onChange={(e) => updateState({ houseSizeSqFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 2000" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={100} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="climate" className="block text-sm font-semibold text-foreground mb-1.5">Climate zone</label>
          <select id="climate" value={state.climate} onChange={(e) => updateState({ climate: e.target.value as ClimateSeverity })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(CLIMATE_INFO) as ClimateSeverity[]).map((key) => <option key={key} value={key}>{CLIMATE_INFO[key].label}</option>)}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{CLIMATE_INFO[state.climate].example}</p>
        </div>
        <div>
          <label htmlFor="insulation" className="block text-sm font-semibold text-foreground mb-1.5">Insulation quality</label>
          <select id="insulation" value={state.insulation} onChange={(e) => updateState({ insulation: e.target.value as InsulationQuality })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(INSULATION_INFO) as InsulationQuality[]).map((key) => <option key={key} value={key}>{INSULATION_INFO[key].label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="efficiency" className="block text-sm font-semibold text-foreground mb-1.5">Furnace efficiency</label>
          <select id="efficiency" value={state.efficiency} onChange={(e) => updateState({ efficiency: e.target.value as FurnaceEfficiency })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(EFFICIENCY_INFO) as FurnaceEfficiency[]).map((key) => <option key={key} value={key}>{EFFICIENCY_INFO[key].label} (${EFFICIENCY_INFO[key].costLow}-{EFFICIENCY_INFO[key].costHigh})</option>)}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{EFFICIENCY_INFO[state.efficiency].description}</p>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Recommended Furnace Size</h3></div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Output capacity</span>
                <span className="text-2xl font-bold text-accent">{(result.outputBTU / 1000).toFixed(0)}K BTU</span>
                <span className="text-xs text-muted-foreground block mt-0.5">Input: {(result.inputBTU / 1000).toFixed(0)}K BTU</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Recommended model</span>
                <span className="text-sm font-semibold text-foreground">{result.recommendedSize}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-semibold text-foreground block">Total installed cost</span><span className="text-xs text-muted-foreground">Equipment + labor + permits</span></div>
              <div className="text-right"><span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}</span></div>
            </div>
          </div>

          <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Estimated annual fuel cost:</strong> {result.estimatedAnnualFuelCost}
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.houseSizeSqFt.toLocaleString()} sq ft, {CLIMATE_INFO[state.climate].label.toLowerCase()}, {INSULATION_INFO[state.insulation].label.toLowerCase()}. Prices from HomeAdvisor + Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter a house size greater than 0.</div>
      )}
    </div>
  );
}
