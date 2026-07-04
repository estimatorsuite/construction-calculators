"use client";

import { useState } from "react";
import {
  type HeatPumpState, type HeatPumpType, type EfficiencyTier,
  PUMP_TYPE_INFO, EFFICIENCY_INFO, calculateHeatPump, getDefaultState,
} from "../data/heat-pump";

function fc(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const CLIMATE_ZONES = [
  { value: "warm", label: "Warm (South/Southwest)", example: "FL, TX, AZ, Southern CA" },
  { value: "moderate", label: "Moderate (Mid-Atlantic/Midwest)", example: "VA, NC, TN, MO, KS" },
  { value: "cold", label: "Cold (North/Northeast)", example: "MN, MI, NY, New England" },
] as const;

export function HeatPumpCalculator() {
  const [state, setState] = useState<HeatPumpState>(getDefaultState());
  const result = calculateHeatPump(state);
  function updateState(p: Partial<HeatPumpState>) { setState((prev) => ({ ...prev, ...p })); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="house-size" className="block text-sm font-semibold text-foreground mb-1.5">House size (sq ft)</label>
          <input id="house-size" type="number" value={state.houseSizeSqFt || ""} onChange={(e) => updateState({ houseSizeSqFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 2000" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={100} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>

        <div>
          <label htmlFor="climate" className="block text-sm font-semibold text-foreground mb-1.5">Climate zone</label>
          <select id="climate" value={state.climateZone} onChange={(e) => updateState({ climateZone: e.target.value as typeof state.climateZone })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {CLIMATE_ZONES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{CLIMATE_ZONES.find((c) => c.value === state.climateZone)?.example}</p>
        </div>

        <div>
          <label htmlFor="pump-type" className="block text-sm font-semibold text-foreground mb-1.5">Heat pump type</label>
          <select id="pump-type" value={state.pumpType} onChange={(e) => updateState({ pumpType: e.target.value as HeatPumpType })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(PUMP_TYPE_INFO) as HeatPumpType[]).map((key) => <option key={key} value={key}>{PUMP_TYPE_INFO[key].label}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="efficiency" className="block text-sm font-semibold text-foreground mb-1.5">Efficiency tier</label>
          <select id="efficiency" value={state.efficiency} onChange={(e) => updateState({ efficiency: e.target.value as EfficiencyTier })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(EFFICIENCY_INFO) as EfficiencyTier[]).map((key) => <option key={key} value={key}>{EFFICIENCY_INFO[key].label}</option>)}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{EFFICIENCY_INFO[state.efficiency].description}</p>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Heat Pump Size & Cost Estimate</h3></div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><span className="text-xs text-muted-foreground block">Recommended size</span><span className="text-xl font-bold text-accent">{result.recommendedTons} tons</span><span className="text-xs text-muted-foreground block mt-0.5">{result.recommendedBTU.toLocaleString()} BTU</span></div>
              <div><span className="text-xs text-muted-foreground block">Equipment cost</span><span className="text-sm font-semibold text-foreground">${fc(result.equipmentCostLow)} - ${fc(result.equipmentCostHigh)}</span></div>
              <div><span className="text-xs text-muted-foreground block">Labor cost</span><span className="text-sm font-semibold text-foreground">${fc(result.laborCostLow)} - ${fc(result.laborCostHigh)}</span></div>
            </div>
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-semibold text-foreground block">Total installed cost</span><span className="text-xs text-muted-foreground">{PUMP_TYPE_INFO[state.pumpType].label}</span></div>
              <div className="text-right"><span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}</span></div>
            </div>
          </div>

          <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Estimated energy savings:</strong> {result.estimatedAnnualSavings} vs traditional furnace + AC
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.houseSizeSqFt.toLocaleString()} sq ft in {CLIMATE_ZONES.find((c) => c.value === state.climateZone)?.label.toLowerCase()}, {PUMP_TYPE_INFO[state.pumpType].label}, {EFFICIENCY_INFO[state.efficiency].label.split("(")[0].trim()}. Prices from HomeAdvisor + Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter a house size greater than 0.</div>
      )}
    </div>
  );
}
