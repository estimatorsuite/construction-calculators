"use client";

import { useState } from "react";
import { Ruler, Package, DollarSign } from "lucide-react";
import {
  type GambrelRoofState,
  type GambrelPitch,
  PITCH_PRESETS,
  calculateGambrelRoof,
  getDefaultState,
} from "../data/gambrel-roof";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function GambrelRoofCalculator() {
  const [state, setState] = useState<GambrelRoofState>(getDefaultState());
  const [pitchPreset, setPitchPreset] = useState<GambrelPitch>("30-60");
  const result = calculateGambrelRoof(state);

  function updateState(partial: Partial<GambrelRoofState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function handlePresetChange(value: GambrelPitch) {
    setPitchPreset(value);
    const preset = PITCH_PRESETS.find((p) => p.value === value);
    if (preset) {
      updateState({ upperPitch: preset.upper, lowerPitch: preset.lower });
    }
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Building length */}
        <div>
          <label
            htmlFor="building-length"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Building length (feet)
          </label>
          <input
            id="building-length"
            type="number"
            value={state.buildingLengthFt || ""}
            onChange={(e) =>
              updateState({ buildingLengthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 30"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            The length of the building along the ridge.
          </p>
        </div>

        {/* Building width */}
        <div>
          <label
            htmlFor="building-width"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Building width (feet)
          </label>
          <input
            id="building-width"
            type="number"
            value={state.buildingWidthFt || ""}
            onChange={(e) =>
              updateState({ buildingWidthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 24"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            The span across the building (gable end).
          </p>
        </div>

        {/* Pitch preset */}
        <div className="sm:col-span-2">
          <label
            htmlFor="pitch-preset"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Roof pitch preset
          </label>
          <select
            id="pitch-preset"
            value={pitchPreset}
            onChange={(e) => handlePresetChange(e.target.value as GambrelPitch)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {PITCH_PRESETS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {PITCH_PRESETS.find((p) => p.value === pitchPreset)?.description}
          </p>
        </div>

        {/* Upper pitch (custom) */}
        {pitchPreset === "custom" && (
          <>
            <div>
              <label
                htmlFor="upper-pitch"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Upper slope angle (degrees)
              </label>
              <input
                id="upper-pitch"
                type="number"
                value={state.upperPitch || ""}
                onChange={(e) =>
                  updateState({ upperPitch: Math.max(0, Math.min(89, Number(e.target.value) || 0)) })
                }
                placeholder="e.g. 30"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                min={0}
                max={89}
                step={0.5}
                style={{ minHeight: "44px", fontSize: "16px" }}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Shallower upper slope (typically 20-35°).
              </p>
            </div>
            <div>
              <label
                htmlFor="lower-pitch"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Lower slope angle (degrees)
              </label>
              <input
                id="lower-pitch"
                type="number"
                value={state.lowerPitch || ""}
                onChange={(e) =>
                  updateState({ lowerPitch: Math.max(0, Math.min(89, Number(e.target.value) || 0)) })
                }
                placeholder="e.g. 60"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                min={0}
                max={89}
                step={0.5}
                style={{ minHeight: "44px", fontSize: "16px" }}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Steeper lower slope (typically 55-70°).
              </p>
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Rafter lengths */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Rafter Lengths
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Upper rafter (per side)
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.upperRafterLength} ft
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  at {state.upperPitch}° from ridge to break
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Lower rafter (per side)
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.lowerRafterLength} ft
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  at {state.lowerPitch}° from break to wall
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Ridge length
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.ridgeLength} ft
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Building footprint
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.footprintSqFt.toLocaleString()} sq ft
                </span>
              </div>
            </div>
          </div>

          {/* Roof area & materials */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Roof Area & Material Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Total roof area
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.totalRoofAreaSqFt.toLocaleString()} sq ft
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  (incl. 10% waste)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Roofing squares
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.roofingSquares}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ({result.bundlesNeeded} bundles)
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Upper roof area
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.upperRoofAreaSqFt.toLocaleString()} sq ft
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Lower roof area
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.lowerRoofAreaSqFt.toLocaleString()} sq ft
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
                  Estimated roofing cost
                </span>
                <span className="text-xs text-muted-foreground">
                  Asphalt shingles, installed
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${formatCurrency(result.estimatedCostLow)} - $
                  {formatCurrency(result.estimatedCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {result.roofingSquares} squares × $350-$700/square
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.buildingLengthFt} ×{" "}
            {state.buildingWidthFt} ft building, {state.upperPitch}° upper /{" "}
            {state.lowerPitch}° lower pitch. Asphalt shingle pricing from NRCA
            2026. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter building dimensions greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
