"use client";

import { useState } from "react";
import {
  type AsphaltState,
  type AsphaltProject,
  PROJECT_TYPES,
  calculateAsphalt,
  getDefaultState,
} from "../data/asphalt";

const PROJECT_TYPE_OPTIONS: { value: AsphaltProject; label: string; hint: string }[] = [
  { value: "driveway", label: "Driveway (Residential)", hint: '2" standard, 3" for heavy vehicles' },
  { value: "parkingLot", label: "Parking Lot (Commercial)", hint: '4" commercial standard' },
  { value: "walkway", label: "Walkway / Path", hint: '2" for pedestrian traffic' },
  { value: "patch", label: "Patch / Repair", hint: '3" typical for pothole fill' },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function AsphaltCalculator() {
  const [state, setState] = useState<AsphaltState>(getDefaultState());
  const result = calculateAsphalt(state);

  function updateState(partial: Partial<AsphaltState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function selectProjectType(pt: AsphaltProject) {
    setState((prev) => ({
      ...prev,
      projectType: pt,
      thicknessInches: PROJECT_TYPES[pt].defaultThickness,
    }));
  }

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
            placeholder="e.g. 50"
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
            placeholder="e.g. 18"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Thickness */}
        <div>
          <label
            htmlFor="thickness-in"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Thickness (inches)
          </label>
          <input
            id="thickness-in"
            type="number"
            value={state.thicknessInches || ""}
            onChange={(e) =>
              updateState({ thicknessInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 2"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={1}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {PROJECT_TYPES[state.projectType].notes}
          </p>
        </div>

        {/* Project type */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Project type
          </label>
          <select
            id="project-type"
            value={state.projectType}
            onChange={(e) => selectProjectType(e.target.value as AsphaltProject)}
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
                Material Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Surface area</span>
                <span className="text-xl font-bold text-accent">
                  {result.areaSqFt} sq ft
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Asphalt needed</span>
                <span className="text-xl font-bold text-foreground">
                  {result.tonsNeeded} tons
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ({result.cubicYardsNeeded} cu yd)
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
                  Materials + labor (all-in)
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${formatCurrency(result.totalCostLow)} - $
                  {formatCurrency(result.totalCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ${result.costPerSqFtLow}-${result.costPerSqFtHigh}/sq ft installed
                </span>
              </div>
            </div>
          </div>

          {/* Delivery note */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <strong className="text-foreground">Delivery:</strong> Most asphalt
            suppliers have a 3-5 ton minimum load with a $100-$200 delivery fee.
            For pours under 5 tons, expect a short-load surcharge of $150-$300.
            Hot-mix asphalt must be paved within 30-45 minutes of delivery — plan
            crew size accordingly.
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.lengthFt}′ × {state.widthFt}′ ×{" "}
            {state.thicknessInches}" = {result.tonsNeeded} tons (at 145 lb/cu ft
            density). Prices from Angi + HomeAdvisor 2026 data. Last verified:
            June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter dimensions to see your estimate.
        </div>
      )}
    </div>
  );
}
