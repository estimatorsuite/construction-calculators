"use client";

import { useState } from "react";
import { Ruler, Package, DollarSign, Truck } from "lucide-react";
import {
  type ConcreteState,
  type ConcreteResult,
  type ProjectType,
  PROJECT_TYPES,
  calculateConcrete,
  getDefaultState,
} from "../data/concrete";

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string; hint: string }[] = [
  { value: "slab", label: "Slab / Patio / Driveway", hint: '4" standard for residential' },
  { value: "footing", label: "Footing (Foundation)", hint: '8" min for residential' },
  { value: "column", label: "Column / Pier", hint: 'Typically 12" Sonotube' },
  { value: "wall", label: "Wall (Basement / Retaining)", hint: '8" standard' },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function ConcreteCalculator() {
  const [state, setState] = useState<ConcreteState>(getDefaultState());
  const result: ConcreteResult | null = calculateConcrete(state);

  function updateState(partial: Partial<ConcreteState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function selectProjectType(pt: ProjectType) {
    setState((prev) => ({
      ...prev,
      projectType: pt,
      depthInches: PROJECT_TYPES[pt].defaultDepth,
    }));
  }

  const isBagsRoute = result ? result.cubicYards < 1 : true;

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Length */}
        <div>
          <label
            htmlFor="length-ft"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Length (feet)
          </label>
          <input
            id="length-ft"
            type="number"
            value={state.lengthFt || ""}
            onChange={(e) =>
              updateState({ lengthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 10"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Width */}
        <div>
          <label
            htmlFor="width-ft"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Width (feet)
          </label>
          <input
            id="width-ft"
            type="number"
            value={state.widthFt || ""}
            onChange={(e) =>
              updateState({ widthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 10"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Depth */}
        <div>
          <label
            htmlFor="depth-in"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Depth / Thickness (inches)
          </label>
          <input
            id="depth-in"
            type="number"
            value={state.depthInches || ""}
            onChange={(e) =>
              updateState({ depthInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 4"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {PROJECT_TYPES[state.projectType].notes}
          </p>
        </div>

        {/* Project type buttons */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Project type
          </label>
          <select
            id="project-type"
            value={state.projectType}
            onChange={(e) => selectProjectType(e.target.value as ProjectType)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {PROJECT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected project description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {PROJECT_TYPES[state.projectType].label}:
        </strong>{" "}
        {PROJECT_TYPES[state.projectType].description}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Volume result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Volume & Material Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Cubic feet</span>
                <span className="text-xl font-bold text-accent">
                  {result.cubicFeet} cu ft
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Cubic yards</span>
                <span className="text-xl font-bold text-foreground">
                  {result.cubicYards} cu yd
                </span>
              </div>
            </div>

            {/* Bags needed (always show) */}
            <div className="p-4 pt-0 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="text-xs text-muted-foreground">40 lb bags</div>
                <div className="font-bold text-foreground">{result.bagsNeeded40lb}</div>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="text-xs text-muted-foreground">60 lb bags</div>
                <div className="font-bold text-foreground">{result.bagsNeeded60lb}</div>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="text-xs text-muted-foreground">80 lb bags</div>
                <div className="font-bold text-foreground">{result.bagsNeeded80lb}</div>
              </div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Cost Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isBagsRoute ? "Bag material" : "Ready-mix concrete"}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.materialCostLow)} - $
                  {formatCurrency(result.materialCostHigh)}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isBagsRoute ? "(No delivery needed)" : "Delivery fee"}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.deliveryCostLow === 0 && result.deliveryCostHigh === 0
                    ? "—"
                    : `$${formatCurrency(result.deliveryCostLow)} - $${formatCurrency(result.deliveryCostHigh)}`}
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
                  Total estimated cost
                </span>
                <span className="text-xs text-muted-foreground">
                  {isBagsRoute
                    ? "DIY bags route (no labor)"
                    : "Ready-mix delivery (no labor)"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${formatCurrency(result.totalCostLow)} - $
                  {formatCurrency(result.totalCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Materials {isBagsRoute ? "+ no delivery" : "+ delivery"}
                </span>
              </div>
            </div>
          </div>

          {/* Route recommendation */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <strong className="text-foreground">
              {isBagsRoute ? "Recommended: Bagged concrete" : "Recommended: Ready-mix delivery"}
            </strong>{" "}
            {isBagsRoute
              ? `Your pour is under 1 cubic yard. Bagged concrete avoids the $${result.deliveryCostLow > 0 ? result.deliveryCostLow : "50"}+ delivery minimum and works well for small slabs, footings, and patch jobs.`
              : `Your pour is over 1 cubic yard. Ready-mix delivery is typically 30-50% cheaper than bags at this volume, and saves 4+ hours of mixing.`}
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.lengthFt}′ × {state.widthFt}′ ×{" "}
            {state.depthInches}" = {result.cubicFeet} cu ft ({result.cubicYards} cu yd).
            Prices from Angi + HomeAdvisor 2026 data. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter length, width, and depth to see your estimate.
        </div>
      )}
    </div>
  );
}
