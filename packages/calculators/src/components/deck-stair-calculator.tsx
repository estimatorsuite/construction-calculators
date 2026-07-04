"use client";

import { useState } from "react";
import {
  type DeckStairState,
  type DeckStairResult,
  CODE_CONSTRAINTS,
  calculateDeckStair,
  getDefaultState,
} from "../data/deck-stair";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatInches(value: number): string {
  const whole = Math.floor(value);
  const remainder = value - whole;
  const fractionMap: Record<string, string> = {
    "0": "",
    "0.125": " 1/8",
    "0.25": " 1/4",
    "0.375": " 3/8",
    "0.5": " 1/2",
    "0.625": " 5/8",
    "0.75": " 3/4",
    "0.875": " 7/8",
  };
  const frac = fractionMap[String(remainder)] || "";
  return `${whole}${frac}"`;
}

export function DeckStairCalculator() {
  const [state, setState] = useState<DeckStairState>(getDefaultState());
  const result: DeckStairResult | null = calculateDeckStair(state);

  function updateState(partial: Partial<DeckStairState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  // Code compliance check
  const isRiseCompliant = result ? result.actualRiseInches <= CODE_CONSTRAINTS.maxRise : true;
  const isRunCompliant = state.desiredRunInches >= CODE_CONSTRAINTS.minRun;
  const isWidthCompliant = state.stairWidthInches >= CODE_CONSTRAINTS.minWidth;

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total rise */}
        <div className="sm:col-span-2">
          <label
            htmlFor="total-rise"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Total rise (inches) — ground to deck surface
          </label>
          <input
            id="total-rise"
            type="number"
            value={state.totalRiseInches || ""}
            onChange={(e) =>
              updateState({ totalRiseInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 36"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.25}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Measure vertical distance from ground to top of deck boards.
          </p>
        </div>

        {/* Desired rise */}
        <div>
          <label
            htmlFor="desired-rise"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Desired riser height (inches)
          </label>
          <input
            id="desired-rise"
            type="number"
            value={state.desiredRiseInches || ""}
            onChange={(e) =>
              updateState({ desiredRiseInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 7"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={4}
            max={8}
            step={0.125}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Code max: {CODE_CONSTRAINTS.maxRise}". Standard: 7".
          </p>
        </div>

        {/* Desired run (tread depth) */}
        <div>
          <label
            htmlFor="desired-run"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Tread depth (inches)
          </label>
          <input
            id="desired-run"
            type="number"
            value={state.desiredRunInches || ""}
            onChange={(e) =>
              updateState({ desiredRunInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 11"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={10}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Code min: {CODE_CONSTRAINTS.minRun}". Standard: 11".
          </p>
        </div>

        {/* Stair width */}
        <div className="sm:col-span-2">
          <label
            htmlFor="stair-width"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Stair width (inches)
          </label>
          <input
            id="stair-width"
            type="number"
            value={state.stairWidthInches || ""}
            onChange={(e) =>
              updateState({ stairWidthInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 36"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={36}
            step={6}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Code min: {CODE_CONSTRAINTS.minWidth}". Standard: 36".
          </p>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Stair geometry */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Stair Geometry & Material Count
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Number of steps</span>
                <span className="text-xl font-bold text-accent">
                  {result.numberOfSteps}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Actual riser height</span>
                <span className="text-xl font-bold text-foreground">
                  {formatInches(result.actualRiseInches)}
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Total run</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatInches(result.totalRunInches)} ({Math.round(result.totalRunInches / 12)}′)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Stringer length</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatInches(result.stringerLengthInches)} ({Math.ceil(result.stringerLengthInches / 12)}′ 2x12)
                </span>
              </div>
            </div>
            <div className="p-4 pt-0 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="text-xs text-muted-foreground">Stringers</div>
                <div className="font-bold text-foreground">{result.stringersNeeded}</div>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="text-xs text-muted-foreground">Tread boards</div>
                <div className="font-bold text-foreground">{result.treadBoardsNeeded}</div>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="text-xs text-muted-foreground">Riser boards</div>
                <div className="font-bold text-foreground">{result.riserBoardsNeeded}</div>
              </div>
            </div>
          </div>

          {/* Code compliance */}
          <div
            className={`rounded-lg p-3 border-l-4 ${
              isRiseCompliant && isRunCompliant && isWidthCompliant
                ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                : "border-red-600 bg-red-50 dark:bg-red-950/30"
            }`}
          >
            <p className="text-xs">
              <strong className={isRiseCompliant && isRunCompliant && isWidthCompliant ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}>
                {isRiseCompliant && isRunCompliant && isWidthCompliant ? "Code-compliant (IRC R311.7)" : "Non-compliant — check values"}
              </strong>
            </p>
            <ul className="text-xs mt-1 space-y-0.5">
              <li className={isRiseCompliant ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                Riser {formatInches(result.actualRiseInches)} (max {CODE_CONSTRAINTS.maxRise}")
              </li>
              <li className={isRunCompliant ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                Tread {formatInches(state.desiredRunInches)} (min {CODE_CONSTRAINTS.minRun}")
              </li>
              <li className={isWidthCompliant ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                Width {formatInches(state.stairWidthInches)} (min {CODE_CONSTRAINTS.minWidth}")
              </li>
            </ul>
          </div>

          {/* Cost breakdown */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Material Cost Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Materials</span>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(result.materialCostLow)} - $
                  {formatCurrency(result.materialCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  PT lumber + hardware
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Total (with labor)
                </span>
                <span className="text-xl font-bold text-accent">
                  ${formatCurrency(result.totalCostLow)} - $
                  {formatCurrency(result.totalCostHigh)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.totalRiseInches}" total rise ÷{" "}
            {result.numberOfSteps} steps = {formatInches(result.actualRiseInches)} per step.
            Stringer = sqrt({state.totalRiseInches}² + {result.totalRunInches}²) + 12" ={" "}
            {formatInches(result.stringerLengthInches)}. IRC R311.7 compliant. Prices from
            Home Depot + Lowe&apos;s 2026. Verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter total rise (and desired step height) to calculate stair layout.
        </div>
      )}
    </div>
  );
}
