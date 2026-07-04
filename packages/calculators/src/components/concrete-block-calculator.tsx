"use client";

import { useState } from "react";
import {
  type ConcreteBlockState, type BlockWidth,
  BLOCK_SPECS, calculateConcreteBlock, getDefaultState,
} from "../data/concrete-block";

function fc(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function ConcreteBlockCalculator() {
  const [state, setState] = useState<ConcreteBlockState>(getDefaultState());
  const result = calculateConcreteBlock(state);
  function updateState(p: Partial<ConcreteBlockState>) { setState((prev) => ({ ...prev, ...p })); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wall-length" className="block text-sm font-semibold text-foreground mb-1.5">Wall length (ft)</label>
          <input id="wall-length" type="number" value={state.wallLengthFt || ""} onChange={(e) => updateState({ wallLengthFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 20" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={0.5} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="wall-height" className="block text-sm font-semibold text-foreground mb-1.5">Wall height (ft)</label>
          <input id="wall-height" type="number" value={state.wallHeightFt || ""} onChange={(e) => updateState({ wallHeightFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 8" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={0.5} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="block-width" className="block text-sm font-semibold text-foreground mb-1.5">Block type</label>
          <select id="block-width" value={state.blockWidth} onChange={(e) => updateState({ blockWidth: e.target.value as BlockWidth })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(BLOCK_SPECS) as BlockWidth[]).map((key) => (
              <option key={key} value={key}>{BLOCK_SPECS[key].label} (${BLOCK_SPECS[key].pricePerBlockLow}-{BLOCK_SPECS[key].pricePerBlockHigh}/block)</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{BLOCK_SPECS[state.blockWidth].description}</p>
        </div>
        <div>
          <label htmlFor="openings" className="block text-sm font-semibold text-foreground mb-1.5">Door/window openings (sq ft)</label>
          <input id="openings" type="number" value={state.openingsSqFt || ""} onChange={(e) => updateState({ openingsSqFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 16 (one door)" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={1} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Material & Cost Estimate</h3></div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><span className="text-xs text-muted-foreground block">Blocks needed</span><span className="text-xl font-bold text-accent">{result.blocksNeeded}</span><span className="text-xs text-muted-foreground block mt-0.5">{BLOCK_SPECS[state.blockWidth].nominalSize} (incl. 5% waste)</span></div>
              <div><span className="text-xs text-muted-foreground block">Mortar bags (80 lb)</span><span className="text-xl font-bold text-foreground">{result.mortarBags}</span></div>
              <div><span className="text-xs text-muted-foreground block">Net wall area</span><span className="text-xl font-bold text-foreground">{result.netAreaSqFt} sq ft</span></div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div><span className="text-xs text-muted-foreground block">Material cost</span><span className="text-sm font-semibold text-foreground">${fc(result.materialCostLow)} - ${fc(result.materialCostHigh)}</span></div>
              <div><span className="text-xs text-muted-foreground block">Labor cost (mason)</span><span className="text-sm font-semibold text-foreground">${fc(result.laborCostLow)} - ${fc(result.laborCostHigh)}</span></div>
            </div>
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-semibold text-foreground block">Total installed cost</span><span className="text-xs text-muted-foreground">{BLOCK_SPECS[state.blockWidth].label} wall</span></div>
              <div className="text-right"><span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}</span><span className="text-xs text-muted-foreground block mt-0.5">${result.costPerSqFtLow}-${result.costPerSqFtHigh}/sq ft</span></div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.wallLengthFt}'×{state.wallHeightFt}' wall ({result.wallAreaSqFt} sq ft gross, {result.netAreaSqFt} sq ft net), {BLOCK_SPECS[state.blockWidth].label}. 1.125 blocks/sq ft + 5% waste. Prices from HomeAdvisor + Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter wall dimensions greater than 0.</div>
      )}
    </div>
  );
}
