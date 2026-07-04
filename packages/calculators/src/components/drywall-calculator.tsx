"use client";

import { useState } from "react";
import {
  type DrywallState, type DrywallThickness, type SheetSize,
  THICKNESS_SPECS, SHEET_SIZES, calculateDrywall, getDefaultState,
} from "../data/drywall";

function fc(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function DrywallCalculator() {
  const [state, setState] = useState<DrywallState>(getDefaultState());
  const result = calculateDrywall(state);
  function updateState(p: Partial<DrywallState>) { setState((prev) => ({ ...prev, ...p })); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="room-length" className="block text-sm font-semibold text-foreground mb-1.5">Room length (ft)</label>
          <input id="room-length" type="number" value={state.roomLengthFt || ""} onChange={(e) => updateState({ roomLengthFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 12" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={0.5} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="room-width" className="block text-sm font-semibold text-foreground mb-1.5">Room width (ft)</label>
          <input id="room-width" type="number" value={state.roomWidthFt || ""} onChange={(e) => updateState({ roomWidthFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 12" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={0.5} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="wall-height" className="block text-sm font-semibold text-foreground mb-1.5">Wall height (ft)</label>
          <input id="wall-height" type="number" value={state.wallHeightFt || ""} onChange={(e) => updateState({ wallHeightFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 8" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={0.5} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="openings" className="block text-sm font-semibold text-foreground mb-1.5">Door/window openings (sq ft)</label>
          <input id="openings" type="number" value={state.openingsSqFt || ""} onChange={(e) => updateState({ openingsSqFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 24 (1 door + window)" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={1} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>
        <div>
          <label htmlFor="thickness" className="block text-sm font-semibold text-foreground mb-1.5">Drywall thickness</label>
          <select id="thickness" value={state.thickness} onChange={(e) => updateState({ thickness: e.target.value as DrywallThickness })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(THICKNESS_SPECS) as DrywallThickness[]).map((key) => (
              <option key={key} value={key}>{THICKNESS_SPECS[key].label} (${THICKNESS_SPECS[key].pricePerSheetLow}-{THICKNESS_SPECS[key].pricePerSheetHigh}/sheet)</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sheet-size" className="block text-sm font-semibold text-foreground mb-1.5">Sheet size</label>
          <select id="sheet-size" value={state.sheetSize} onChange={(e) => updateState({ sheetSize: e.target.value as SheetSize })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(SHEET_SIZES) as SheetSize[]).map((key) => (
              <option key={key} value={key}>{SHEET_SIZES[key].label} ({SHEET_SIZES[key].coverageSqFt} sq ft/sheet)</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={state.includeCeiling} onChange={(e) => updateState({ includeCeiling: e.target.checked })} className="w-5 h-5 rounded border-border" />
            <span className="text-sm font-medium text-foreground">Include ceiling area</span>
          </label>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Drywall Material Estimate</h3></div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><span className="text-xs text-muted-foreground block">Sheets needed</span><span className="text-xl font-bold text-accent">{result.sheetsNeeded}</span><span className="text-xs text-muted-foreground block mt-0.5">{SHEET_SIZES[state.sheetSize].label} (incl. 10% waste)</span></div>
              <div><span className="text-xs text-muted-foreground block">Joint compound</span><span className="text-xl font-bold text-foreground">{result.jointCompoundBoxes} box</span><span className="text-xs text-muted-foreground block mt-0.5">4.5 gal boxes</span></div>
              <div><span className="text-xs text-muted-foreground block">Joint tape</span><span className="text-xl font-bold text-foreground">{result.jointTapeRolls} roll{result.jointTapeRolls > 1 ? "s" : ""}</span></div>
              <div><span className="text-xs text-muted-foreground block">Screws</span><span className="text-xl font-bold text-foreground">{result.screwsLbs} lb</span></div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div><span className="text-xs text-muted-foreground block">Total drywall area</span><span className="text-sm font-semibold text-foreground">{result.totalAreaWithWaste} sq ft</span><span className="text-xs text-muted-foreground">{result.wallAreaSqFt} walls{state.includeCeiling ? ` + ${result.ceilingAreaSqFt} ceiling` : ""} − {state.openingsSqFt || 0} openings</span></div>
              <div><span className="text-xs text-muted-foreground block">Material cost</span><span className="text-sm font-semibold text-foreground">${fc(result.materialCostLow)} - ${fc(result.materialCostHigh)}</span></div>
            </div>
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-semibold text-foreground block">Total installed cost</span><span className="text-xs text-muted-foreground">Materials + hanging + finishing</span></div>
              <div className="text-right"><span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}</span><span className="text-xs text-muted-foreground block mt-0.5">${result.costPerSqFtLow}-${result.costPerSqFtHigh}/sq ft</span></div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.roomLengthFt}'×{state.roomWidthFt}' room, {state.wallHeightFt}' walls{state.includeCeiling ? " + ceiling" : ""}, {THICKNESS_SPECS[state.thickness].label} {SHEET_SIZES[state.sheetSize].label} sheets. Prices from Home Depot + Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter room dimensions greater than 0.</div>
      )}
    </div>
  );
}
