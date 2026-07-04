"use client";

import { useState } from "react";
import { Ruler, Layers, DollarSign } from "lucide-react";
import {
  type FlooringSqFtState,
  type FlooringType,
  FLOORING_PRICES,
  calculateFlooringSqFt,
  getDefaultState,
} from "../data/flooring-square-foot";

const FLOORING_TYPES: FlooringType[] = [
  "carpet",
  "hardwood",
  "tile",
  "laminate",
  "vinyl",
  "stone",
];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function FlooringSquareFootCalculator() {
  const [state, setState] = useState<FlooringSqFtState>(getDefaultState());
  const result = calculateFlooringSqFt(state);

  function updateState(partial: Partial<FlooringSqFtState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Room length */}
        <div>
          <label
            htmlFor="room-length"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Room length (ft)
          </label>
          <input
            id="room-length"
            type="number"
            value={state.roomLengthFt || ""}
            onChange={(e) =>
              updateState({ roomLengthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 16"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Room width */}
        <div>
          <label
            htmlFor="room-width"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Room width (ft)
          </label>
          <input
            id="room-width"
            type="number"
            value={state.roomWidthFt || ""}
            onChange={(e) =>
              updateState({ roomWidthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 14"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Waste percent */}
        <div>
          <label
            htmlFor="waste-percent"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Waste factor (%)
          </label>
          <input
            id="waste-percent"
            type="number"
            value={state.wastePercent || ""}
            onChange={(e) =>
              updateState({ wastePercent: Math.max(0, Math.min(30, Number(e.target.value) || 0)) })
            }
            placeholder="e.g. 10"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            max={30}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            10% standard, 15% for tile or diagonal layouts.
          </p>
        </div>

        {/* Flooring type */}
        <div>
          <label
            htmlFor="flooring-type"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Flooring type
          </label>
          <select
            id="flooring-type"
            value={state.flooringType}
            onChange={(e) =>
              updateState({ flooringType: e.target.value as FlooringType })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {FLOORING_TYPES.map((t) => (
              <option key={t} value={t}>
                {FLOORING_PRICES[t].label} — ${FLOORING_PRICES[t].materialLow}-${FLOORING_PRICES[t].materialHigh}/sq ft
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected material description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {FLOORING_PRICES[state.flooringType].label}:
        </strong>{" "}
        {FLOORING_PRICES[state.flooringType].description}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Square Footage & Cost Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Room area
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.baseAreaSqFt.toLocaleString()} sq ft
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Order {result.totalWithWaste.toLocaleString()} sq ft (with waste)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Cost per sq ft
                </span>
                <span className="text-xl font-bold text-foreground">
                  ${result.costPerSqFtLow}-${result.costPerSqFtHigh}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Installed (material + labor)
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
                  Labor cost (if hired)
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
                  {FLOORING_PRICES[state.flooringType].label},{" "}
                  {result.baseAreaSqFt.toLocaleString()} sq ft
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${formatCurrency(result.totalCostLow)} - $
                  {formatCurrency(result.totalCostHigh)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {result.baseAreaSqFt.toLocaleString()} sq ft
            × {state.wastePercent}% waste +{" "}
            {FLOORING_PRICES[state.flooringType].label} flooring. Prices from Angi
            + HomeAdvisor 2026 data. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter room length and width greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
