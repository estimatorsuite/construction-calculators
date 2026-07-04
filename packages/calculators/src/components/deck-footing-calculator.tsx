"use client";

import { useState } from "react";
import {
  type DeckFootingState, type DeckLevel, type FrostDepth,
  DECK_LEVEL_INFO, FROST_DEPTH_INFO, calculateDeckFooting, getDefaultState,
} from "../data/deck-footing";

function fc(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function DeckFootingCalculator() {
  const [state, setState] = useState<DeckFootingState>(getDefaultState());
  const result = calculateDeckFooting(state);
  function updateState(p: Partial<DeckFootingState>) { setState((prev) => ({ ...prev, ...p })); }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="deck-area" className="block text-sm font-semibold text-foreground mb-1.5">Deck area (sq ft)</label>
          <input id="deck-area" type="number" value={state.deckAreaSqFt || ""} onChange={(e) => updateState({ deckAreaSqFt: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 200 (12x16 deck)" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={10} style={{ minHeight: "44px", fontSize: "16px" }} />
        </div>

        <div>
          <label htmlFor="deck-level" className="block text-sm font-semibold text-foreground mb-1.5">Deck type</label>
          <select id="deck-level" value={state.deckLevel} onChange={(e) => updateState({ deckLevel: e.target.value as DeckLevel })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(DECK_LEVEL_INFO) as DeckLevel[]).map((key) => <option key={key} value={key}>{DECK_LEVEL_INFO[key].label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="beam-count" className="block text-sm font-semibold text-foreground mb-1.5">Number of beams</label>
          <select id="beam-count" value={state.beamCount} onChange={(e) => updateState({ beamCount: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            <option value={1}>1 beam (small deck)</option>
            <option value={2}>2 beams (standard)</option>
            <option value={3}>3 beams (large deck)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="frost" className="block text-sm font-semibold text-foreground mb-1.5">Frost depth</label>
          <select id="frost" value={state.frostDepth} onChange={(e) => updateState({ frostDepth: e.target.value as FrostDepth })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(FROST_DEPTH_INFO) as FrostDepth[]).map((key) => <option key={key} value={key}>{FROST_DEPTH_INFO[key].label}</option>)}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{FROST_DEPTH_INFO[state.frostDepth].description}</p>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Footing & Material Estimate</h3></div>
            <div className="p-4 grid grid-cols-3 gap-4">
              <div><span className="text-xs text-muted-foreground block">Footings needed</span><span className="text-xl font-bold text-accent">{result.footingCount}</span></div>
              <div><span className="text-xs text-muted-foreground block">Posts (4x4/6x6)</span><span className="text-xl font-bold text-foreground">{result.postCount}</span></div>
              <div><span className="text-xs text-muted-foreground block">Concrete bags (80 lb)</span><span className="text-xl font-bold text-foreground">{result.concreteBags}</span></div>
            </div>
          </div>

          <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: "hsl(25, 85%, 97%)", borderColor: "hsl(25, 85%, 50%)" }}>
            <div className="flex items-center justify-between">
              <div><span className="text-sm font-semibold text-foreground block">Total footing cost</span><span className="text-xs text-muted-foreground">Concrete + sonotubes + hardware + labor</span></div>
              <div className="text-right"><span className="text-2xl font-bold text-[hsl(25,85%,40%)]">${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}</span></div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.deckAreaSqFt} sq ft deck, {state.beamCount} beams, {FROST_DEPTH_INFO[state.frostDepth].label.toLowerCase()}. Footings spaced 8 ft apart. Prices from HomeAdvisor + Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter a deck area greater than 0.</div>
      )}
    </div>
  );
}
