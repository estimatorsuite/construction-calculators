"use client";

import { useState } from "react";
import {
  type KitchenRemodelState,
  type KitchenType,
  type RemodelTier,
  KITCHEN_TYPES,
  TIER_PRICING,
  calculateKitchenRemodel,
  getDefaultState,
} from "../data/kitchen-remodel";

function fc(v: number): string {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function KitchenRemodelCalculator() {
  const [state, setState] = useState<KitchenRemodelState>(getDefaultState());
  const result = calculateKitchenRemodel(state);

  function updateState(partial: Partial<KitchenRemodelState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kitchen type */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Kitchen layout
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(KITCHEN_TYPES) as KitchenType[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => updateState({ kitchenType: key })}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  state.kitchenType === key
                    ? "bg-accent text-white"
                    : "bg-accent/10 text-foreground hover:bg-accent/20"
                }`}
                style={{ minHeight: "44px" }}
              >
                {KITCHEN_TYPES[key].label}
                <span className="block text-xs font-normal opacity-80 mt-0.5">
                  ~{KITCHEN_TYPES[key].sqft} sq ft
                </span>
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {KITCHEN_TYPES[state.kitchenType].description}
          </p>
        </div>

        {/* Quality tier */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Quality tier
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(TIER_PRICING) as RemodelTier[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => updateState({ tier: key })}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  state.tier === key
                    ? "bg-accent text-white"
                    : "bg-accent/10 text-foreground hover:bg-accent/20"
                }`}
                style={{ minHeight: "44px" }}
              >
                {TIER_PRICING[key].label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {TIER_PRICING[state.tier].description}
          </p>
        </div>

        {/* Layout change */}
        <div className="sm:col-span-2">
          <label
            htmlFor="layout-change"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Changing the layout?
          </label>
          <select
            id="layout-change"
            value={state.changeLayout ? "yes" : "no"}
            onChange={(e) => updateState({ changeLayout: e.target.value === "yes" })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            <option value="no">No — keep existing layout</option>
            <option value="yes">Yes — moving walls/plumbing/appliances (+25%)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Header card */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Kitchen Remodel Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Kitchen size</span>
                <span className="text-xl font-bold text-accent">
                  {result.estimatedSqFt} sq ft
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">$/sq ft range</span>
                <span className="text-xl font-bold text-foreground">
                  ${result.costPerSqFtLow}-${result.costPerSqFtHigh}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Timeline</span>
                <span className="text-xl font-bold text-foreground">
                  {result.timelineWeeks}
                </span>
              </div>
            </div>
          </div>

          {/* Total cost */}
          <div
            className="rounded-xl p-4 border-l-4"
            style={{
              backgroundColor: "hsl(25, 85%, 97%)",
              borderColor: "hsl(25, 85%, 50%)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground block">
                  Total remodel cost
                </span>
                <span className="text-xs text-muted-foreground">
                  {KITCHEN_TYPES[state.kitchenType].label}, {TIER_PRICING[state.tier].label} tier
                  {state.changeLayout ? ", layout changes" : ""}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${fc(result.totalCostLow)} - ${fc(result.totalCostHigh)}
                </span>
              </div>
            </div>
          </div>

          {/* Layout change note */}
          {state.changeLayout && (
            <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground border-l-4 border-amber-500">
              <strong className="text-foreground">Layout change adds ~25%:</strong> Moving
              walls, sinks, or appliances requires new plumbing rough-ins, electrical
              rerouting, and often gas line work. Load-bearing wall removal needs structural
              engineer sign-off ($500-$1,500) and permit ($200-$800).
            </div>
          )}

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {KITCHEN_TYPES[state.kitchenType].label} ({result.estimatedSqFt} sq ft), {TIER_PRICING[state.tier].label} tier
            {state.changeLayout ? ", with layout changes" : ""}. Prices from HomeAdvisor +
            Angi 2026. Last verified: June 2026.
          </div>
        </div>
      ) : null}
    </div>
  );
}
