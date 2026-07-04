"use client";

import { useState } from "react";
import {
  type DeckRailingState,
  type SpindleSize,
  SPINDLE_SPECS,
  calculateDeckRailing,
  getDefaultState,
} from "../data/deck-railing-spacing";

const SPINDLE_TYPES: SpindleSize[] = ["1.5sq", "2sq", "round", "metal"];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function DeckRailingSpacingCalculator() {
  const [state, setState] = useState<DeckRailingState>(getDefaultState());
  const result = calculateDeckRailing(state);

  function updateState(partial: Partial<DeckRailingState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  // When spindle type changes, update the spindleWidth to the default for that type
  function handleSpindleTypeChange(type: SpindleSize) {
    const spec = SPINDLE_SPECS[type];
    updateState({ spindleType: type, spindleWidth: spec.defaultWidth });
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rail length */}
        <div className="sm:col-span-2">
          <label
            htmlFor="rail-length"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Rail length between posts (inches)
          </label>
          <input
            id="rail-length"
            type="number"
            value={state.railLengthInches || ""}
            onChange={(e) =>
              updateState({ railLengthInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 96"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Measure from inside of post to inside of post. Standard section: 96&quot; (8 ft).
          </p>
        </div>

        {/* Spindle type */}
        <div>
          <label
            htmlFor="spindle-type"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Spindle type
          </label>
          <select
            id="spindle-type"
            value={state.spindleType}
            onChange={(e) =>
              handleSpindleTypeChange(e.target.value as SpindleSize)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {SPINDLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SPINDLE_SPECS[t].label}
              </option>
            ))}
          </select>
        </div>

        {/* Spindle width */}
        <div>
          <label
            htmlFor="spindle-width"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Spindle width (inches)
          </label>
          <input
            id="spindle-width"
            type="number"
            value={state.spindleWidth || ""}
            onChange={(e) =>
              updateState({ spindleWidth: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 1.5"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.25}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Auto-set by type. Override if using non-standard sizes.
          </p>
        </div>

        {/* Max gap */}
        <div className="sm:col-span-2">
          <label
            htmlFor="max-gap"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Maximum gap between spindles (inches)
          </label>
          <input
            id="max-gap"
            type="number"
            value={state.maxGap || ""}
            onChange={(e) =>
              updateState({ maxGap: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 4"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            max={6}
            step={0.25}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            IRC building code requires max 4&quot; gap (R318.1.1).
          </p>
        </div>
      </div>

      {/* Selected material description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {SPINDLE_SPECS[state.spindleType].label}:
        </strong>{" "}
        {SPINDLE_SPECS[state.spindleType].description} Cost:{" "}
        ${SPINDLE_SPECS[state.spindleType].costLow}-${SPINDLE_SPECS[state.spindleType].costHigh}/each.
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Spindle Count & Spacing
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Spindles needed
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.spindlesNeeded}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  for this section
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Actual gap between spindles
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.actualGapInches}"
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {result.actualGapInches <= 4
                    ? "(passes IRC code)"
                    : "(FAILS code — reduce gap)"}
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Center-to-center spacing
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.spacingInches}"
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Total sections (8 ft max)
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {result.totalSections} section(s)
                </span>
              </div>
            </div>
            <div className="p-4 pt-0">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Material cost
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.materialCostLow)} - $
                  {formatCurrency(result.materialCostHigh)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.railLengthInches}" rail ×{" "}
            {state.spindleWidth}" spindle width, max {state.maxGap}" gap.
            Formula: spindles = floor((length - 2×3.5) ÷ (width + maxGap)),
            actual gap = (space - spindles×width) ÷ (spindles + 1).
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter a rail length greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
