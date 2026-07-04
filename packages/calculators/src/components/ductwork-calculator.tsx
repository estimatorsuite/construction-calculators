"use client";

import { useState } from "react";
import {
  type DuctworkState, type DuctworkMaterial, type HouseStories,
  DUCT_MATERIALS, ACCESSIBILITY_FACTORS, calculateDuctwork, getDefaultState,
} from "../data/ductwork";

function fc(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function DuctworkCalculator() {
  const [state, setState] = useState<DuctworkState>(getDefaultState());
  const result = calculateDuctwork(state);
  function updateState(p: Partial<DuctworkState>) { setState((prev) => ({ ...prev, ...p })); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="house-size" className="block text-sm font-semibold text-foreground mb-1.5">House size (sq ft)</label>
          <input id="house-size" type="number" value={state.houseSizeSqFt || ""} onChange={(e) => updateState({ houseSizeSqFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 2000" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={100} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="material" className="block text-sm font-semibold text-foreground mb-1.5">Duct material</label>
          <select id="material" value={state.material} onChange={(e) => updateState({ material: e.target.value as DuctworkMaterial })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(DUCT_MATERIALS) as DuctworkMaterial[]).map((key) => (
              <option key={key} value={key}>{DUCT_MATERIALS[key].label} (${DUCT_MATERIALS[key].perLinearFtLow}-{DUCT_MATERIALS[key].perLinearFtHigh}/ft)</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="stories" className="block text-sm font-semibold text-foreground mb-1.5">Stories</label>
          <select id="stories" value={state.stories} onChange={(e) => updateState({ stories: Number(e.target.value) as HouseStories })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            <option value={1}>1 story</option>
            <option value={2}>2 stories (+20%)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="access" className="block text-sm font-semibold text-foreground mb-1.5">Accessibility</label>
          <select id="access" value={state.accessibility} onChange={(e) => updateState({ accessibility: e.target.value as DuctworkState["accessibility"] })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {Object.entries(ACCESSIBILITY_FACTORS).map(([key, val]) => (
              <option key={key} value={key}>{val.label} ({val.multiplier}x)</option>
            ))}
          </select>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Ductwork Estimate</h3></div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><span className="text-xs text-muted-foreground block">Estimated duct length</span><span className="text-xl font-bold text-accent">{result.estimatedLinearFeet} ft</span></div>
              <div><span className="text-xs text-muted-foreground block">Supply ducts</span><span className="text-xl font-bold text-foreground">{result.supplyDucts}</span></div>
              <div><span className="text-xs text-muted-foreground block">Return ducts</span><span className="text-xl font-bold text-foreground">{result.returnDucts}</span></div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div><span className="text-xs text-muted-foreground block">Material cost</span><span className="text-sm font-semibold text-foreground">${fc(result.materialCostLow)} - ${fc(result.materialCostHigh)}</span></div>
              <div><span className="text-xs text-muted-foreground block">Labor cost</span><span className="text-sm font-semibold text-foreground">${fc(result.laborCostLow)} - ${fc(result.laborCostHigh)}</span></div>
            </div>
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-semibold text-foreground block">Total replacement cost</span><span className="text-xs text-muted-foreground">{DUCT_MATERIALS[state.material].label}</span></div>
              <div className="text-right"><span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}</span><span className="text-xs text-muted-foreground block mt-0.5">${result.costPerSqFtLow}-${result.costPerSqFtHigh}/sq ft</span></div>
            </div>
          </div>

          {state.accessibility !== "open" && (
            <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground border-l-4 border-amber-500">
              <strong className="text-foreground">Wall/ceiling repair:</strong> Because ducts are in finished spaces, add $500-$2,000 for drywall patching and paint after duct replacement.
            </div>
          )}

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.houseSizeSqFt.toLocaleString()} sq ft, {state.stories} {state.stories === 1 ? "story" : "stories"}, {DUCT_MATERIALS[state.material].label}, {ACCESSIBILITY_FACTORS[state.accessibility].label.toLowerCase()}. Prices from HomeAdvisor + Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter a house size greater than 0.</div>
      )}
    </div>
  );
}
