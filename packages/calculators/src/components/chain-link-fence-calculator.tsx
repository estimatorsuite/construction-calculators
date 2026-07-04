"use client";

import { useState } from "react";
import { Ruler, Package, DollarSign } from "lucide-react";
import {
  type ChainLinkFenceState,
  type FenceHeight,
  type FenceMaterial,
  MATERIAL_SPECS,
  HEIGHT_OPTIONS,
  calculateChainLinkFence,
  getDefaultState,
} from "../data/chain-link-fence";

const MATERIALS: FenceMaterial[] = ["galvanized", "vinylCoated"];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function ChainLinkFenceCalculator() {
  const [state, setState] = useState<ChainLinkFenceState>(getDefaultState());
  const result = calculateChainLinkFence(state);

  function updateState(partial: Partial<ChainLinkFenceState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fence length */}
        <div className="sm:col-span-2">
          <label
            htmlFor="fence-length"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Total fence length (linear feet)
          </label>
          <input
            id="fence-length"
            type="number"
            value={state.fenceLengthFt || ""}
            onChange={(e) =>
              updateState({ fenceLengthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 200"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Measure the full perimeter where the fence will run.
          </p>
        </div>

        {/* Fence height */}
        <div>
          <label
            htmlFor="fence-height"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Fence height
          </label>
          <select
            id="fence-height"
            value={state.fenceHeight}
            onChange={(e) =>
              updateState({ fenceHeight: Number(e.target.value) as FenceHeight })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {HEIGHT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.usage}
              </option>
            ))}
          </select>
        </div>

        {/* Material */}
        <div>
          <label
            htmlFor="material"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Material
          </label>
          <select
            id="material"
            value={state.material}
            onChange={(e) =>
              updateState({ material: e.target.value as FenceMaterial })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {MATERIALS.map((mat) => (
              <option key={mat} value={mat}>
                {MATERIAL_SPECS[mat].label}
              </option>
            ))}
          </select>
        </div>

        {/* Gate count */}
        <div>
          <label
            htmlFor="gate-count"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Number of gates
          </label>
          <input
            id="gate-count"
            type="number"
            value={state.gateCount || ""}
            onChange={(e) =>
              updateState({ gateCount: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Standard 4 ft wide walk gates ($100-$300 each).
          </p>
        </div>

        {/* Gate width */}
        <div>
          <label
            htmlFor="gate-width"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Gate width (feet)
          </label>
          <input
            id="gate-width"
            type="number"
            value={state.gateWidthFt || ""}
            onChange={(e) =>
              updateState({ gateWidthFt: Math.max(1, Number(e.target.value) || 1) })
            }
            placeholder="e.g. 4"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={1}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            4 ft walk gate is standard. 10 ft for driveway.
          </p>
        </div>
      </div>

      {/* Selected material description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {MATERIAL_SPECS[state.material].label}:
        </strong>{" "}
        {MATERIAL_SPECS[state.material].description} Lifespan:{" "}
        {MATERIAL_SPECS[state.material].lifespanYears}.
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Material list */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Material Takeoff
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Posts needed
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.postsNeeded}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  (every 10 ft)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Top rails
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.topRailsNeeded}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  (10 ft sections)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Mesh rolls
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.meshRollsNeeded}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  (50 ft rolls)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Tension bars
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.tensionBars}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  + {result.gatesIncluded} gate{result.gatesIncluded === 1 ? "" : "s"}
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Material cost
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.materialCostLow)} - $
                  {formatCurrency(result.materialCostHigh)}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Labor cost
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.laborCostLow)} - $
                  {formatCurrency(result.laborCostHigh)}
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
                  Total installed cost
                </span>
                <span className="text-xs text-muted-foreground">
                  Materials + labor
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${formatCurrency(result.totalCostLow)} - $
                  {formatCurrency(result.totalCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ${result.costPerLinearFtLow}-${result.costPerLinearFtHigh}/linear ft
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.fenceLengthFt} linear feet ×{" "}
            {state.fenceHeight} ft height ×{" "}
            {MATERIAL_SPECS[state.material].label}. {state.gateCount} gate
            {state.gateCount === 1 ? "" : "s"}. Prices from HomeAdvisor + Angi
            2026 data. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter a fence length greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
