"use client";

import { useState } from "react";
import {
  type JoistSpanState, type JoistSize, type JoistSpacing, type WoodSpecies,
  JOIST_SIZES, SPECIES_INFO, calculateJoistSpan, getDefaultState,
} from "../data/deck-joist-span";

function fc(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const SPACING_OPTIONS: { value: JoistSpacing; label: string }[] = [
  { value: 12, label: '12" o.c. (heavy duty)' },
  { value: 16, label: '16" o.c. (standard)' },
  { value: 24, label: '24" o.c. (lightweight)' },
];

export function DeckJoistSpanCalculator() {
  const [state, setState] = useState<JoistSpanState>(getDefaultState());
  const result = calculateJoistSpan(state);
  function updateState(p: Partial<JoistSpanState>) { setState((prev) => ({ ...prev, ...p })); }
  const isAdequate = result ? state.deckWidth <= result.maxSpanFt : true;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="joist-size" className="block text-sm font-semibold text-foreground mb-1.5">Joist size</label>
          <select id="joist-size" value={state.joistSize} onChange={(e) => updateState({ joistSize: e.target.value as JoistSize })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(JOIST_SIZES) as JoistSize[]).map((key) => <option key={key} value={key}>{JOIST_SIZES[key].label} ({JOIST_SIZES[key].actualSize})</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="spacing" className="block text-sm font-semibold text-foreground mb-1.5">Joist spacing</label>
          <select id="spacing" value={state.spacing} onChange={(e) => updateState({ spacing: Number(e.target.value) as JoistSpacing })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {SPACING_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="species" className="block text-sm font-semibold text-foreground mb-1.5">Wood species</label>
          <select id="species" value={state.species} onChange={(e) => updateState({ species: e.target.value as WoodSpecies })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" style={{ minHeight: "44px", fontSize: "16px" }}>
            {(Object.keys(SPECIES_INFO) as WoodSpecies[]).map((key) => <option key={key} value={key}>{SPECIES_INFO[key].label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="deck-width" className="block text-sm font-semibold text-foreground mb-1.5">Deck width / joist span (ft)</label>
          <input id="deck-width" type="number" value={state.deckWidth || ""} onChange={(e) => updateState({ deckWidth: Math.max(0, Number(e.target.value) || 0) })} placeholder="e.g. 12" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" min={0} step={0.5} style={{ minHeight: "44px", fontSize: "16px" }} />
          <p className="mt-1 text-xs text-muted-foreground">Direction joists run across the deck.</p>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          {/* Span result with adequacy check */}
          <div className={`rounded-xl p-5 border-l-4 ${isAdequate ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30"}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-sm font-semibold block ${isAdequate ? "text-green-900 dark:text-green-200" : "text-red-900 dark:text-red-200"}`}>
                  {isAdequate ? "✓ Span is adequate" : "✗ Span exceeds maximum"}
                </span>
                <span className="text-xs text-muted-foreground">Max allowable span for {state.joistSize} at {state.spacing}" o.c.</span>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${isAdequate ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>{result.maxSpanDisplay}</span>
              </div>
            </div>
            {!isAdequate && (
              <p className="mt-3 text-xs text-red-800 dark:text-red-300">
                <strong>Recommendation:</strong> {result.recommendedSize}. Or add a mid-span beam to split the load.
              </p>
            )}
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-display text-base font-bold text-foreground">Material Estimate</h3></div>
            <div className="p-4 grid grid-cols-3 gap-4">
              <div><span className="text-xs text-muted-foreground block">Joists needed</span><span className="text-xl font-bold text-accent">{result.joistCount}</span></div>
              <div><span className="text-xs text-muted-foreground block">Board length</span><span className="text-xl font-bold text-foreground">{result.boardLengthNeeded} ft</span></div>
              <div><span className="text-xs text-muted-foreground block">Material cost</span><span className="text-xl font-bold text-foreground">${fc(result.materialCost)}</span></div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.joistSize} {SPECIES_INFO[state.species].label} at {state.spacing}" o.c. Spans from AWC Wood Frame Construction Manual (40 psf LL + 10 psf DL). Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">Enter a deck width greater than 0.</div>
      )}
    </div>
  );
}
