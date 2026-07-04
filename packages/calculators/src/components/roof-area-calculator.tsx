"use client";

import { useState } from "react";
import {
  type RoofAreaState, type RoofPitch, type RoofShape,
  PITCH_OPTIONS, SHAPE_MULTIPLIERS, calculateRoofArea, getDefaultState,
} from "../data/roof-area";

function fc(v: number): string { return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

export function RoofAreaCalculator() {
  const [state, setState] = useState<RoofAreaState>(getDefaultState());
  const result = calculateRoofArea(state);
  function updateState(p: Partial<RoofAreaState>) { setState((prev) => ({ ...prev, ...p })); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="house-length" className="block text-sm font-semibold text-foreground mb-1.5">House length (ft)</label>
          <input id="house-length" type="number" value={state.houseLengthFt || ""} onChange={(e) => updateState({ houseLengthFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 40" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={1} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="house-width" className="block text-sm font-semibold text-foreground mb-1.5">House width (ft)</label>
          <input id="house-width" type="number" value={state.houseWidthFt || ""} onChange={(e) => updateState({ houseWidthFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 30" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={1} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="pitch" className="block text-sm font-semibold text-foreground mb-1.5">Roof pitch (rise:run)</label>
          <select id="pitch" value={state.pitch} onChange={(e) => updateState({ pitch: Number(e.target.value) as RoofPitch })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {PITCH_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label} — {opt.usage}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="shape" className="block text-sm font-semibold text-foreground mb-1.5">Roof shape</label>
          <select id="shape" value={state.shape} onChange={(e) => updateState({ shape: e.target.value as RoofShape })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(SHAPE_MULTIPLIERS) as RoofShape[]).map((key) => <option key={key} value={key}>{SHAPE_MULTIPLIERS[key].label}</option>)}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{SHAPE_MULTIPLIERS[state.shape].description}</p>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Roof Area Calculation</h3></div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><span className="text-xs text-muted-foreground block">Total roof area</span><span className="text-2xl font-bold text-accent">{fc(result.totalRoofAreaSqFt)} sq ft</span></div>
              <div><span className="text-xs text-muted-foreground block">Roofing squares</span><span className="text-xl font-bold text-foreground">{result.roofingSquares} sq</span><span className="text-xs text-muted-foreground block mt-0.5">1 sq = 100 sq ft</span></div>
              <div><span className="text-xs text-muted-foreground block">Shingle bundles</span><span className="text-xl font-bold text-foreground">{result.bundlesNeeded}</span><span className="text-xs text-muted-foreground block mt-0.5">3 bundles/square</span></div>
            </div>
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-semibold text-foreground block">Estimated cost (asphalt shingle)</span><span className="text-xs text-muted-foreground">Materials + labor, 2026 prices</span></div>
              <div className="text-right"><span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${fc(result.estimatedCostLow)} - ${fc(result.estimatedCostHigh)}</span></div>
            </div>
          </div>

          <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Calculation:</strong> {state.houseLengthFt}'×{state.houseWidthFt}' = {result.houseFootprintSqFt} sq ft footprint × {result.pitchFactor} (pitch factor) × {result.shapeMultiplier} (shape) = {result.totalRoofAreaSqFt} sq ft roof area.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter house dimensions greater than 0.</div>
      )}
    </div>
  );
}
