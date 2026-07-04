"use client";

import { useState } from "react";
import {
  type WallpaperState,
  type WallpaperType,
  TYPE_PRICES,
  ROLL_WIDTH_OPTIONS,
  calculateWallpaper,
  getDefaultState,
} from "../data/wallpaper";

const TYPES: WallpaperType[] = ["standard", "prepasted", "peelStick", "grasscloth"];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function WallpaperCalculator() {
  const [state, setState] = useState<WallpaperState>(getDefaultState());
  const result = calculateWallpaper(state);

  function updateState(partial: Partial<WallpaperState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wall length */}
        <div>
          <label
            htmlFor="wall-length"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Wall length (feet)
          </label>
          <input
            id="wall-length"
            type="number"
            value={state.wallLengthFt || ""}
            onChange={(e) =>
              updateState({ wallLengthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 10"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Wall height */}
        <div>
          <label
            htmlFor="wall-height"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Wall height (feet)
          </label>
          <input
            id="wall-height"
            type="number"
            value={state.wallHeightFt || ""}
            onChange={(e) =>
              updateState({ wallHeightFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 8"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
        </div>

        {/* Roll width */}
        <div>
          <label
            htmlFor="roll-width"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Roll width
          </label>
          <select
            id="roll-width"
            value={state.rollWidthInches}
            onChange={(e) =>
              updateState({ rollWidthInches: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {ROLL_WIDTH_OPTIONS.map((w) => (
              <option key={w} value={w}>
                {w}" ({w === 20.5 ? "US standard" : "European/wide"})
              </option>
            ))}
          </select>
        </div>

        {/* Pattern repeat */}
        <div>
          <label
            htmlFor="pattern-repeat"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Pattern repeat (inches)
          </label>
          <input
            id="pattern-repeat"
            type="number"
            value={state.patternRepeatInches || ""}
            onChange={(e) =>
              updateState({ patternRepeatInches: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="0 for no repeat, 24 typical"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={0.5}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Check the wallpaper label. 0&Prime; = random match, 24&Prime; = straight match.
          </p>
        </div>

        {/* Wallpaper type */}
        <div className="sm:col-span-2">
          <label
            htmlFor="wallpaper-type"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Wallpaper type
          </label>
          <select
            id="wallpaper-type"
            value={state.wallpaperType}
            onChange={(e) =>
              updateState({ wallpaperType: e.target.value as WallpaperType })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_PRICES[t].label} (${TYPE_PRICES[t].priceLow}-${TYPE_PRICES[t].priceHigh}/roll)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected type description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {TYPE_PRICES[state.wallpaperType].label}:
        </strong>{" "}
        {TYPE_PRICES[state.wallpaperType].description}{" "}
        <strong>Install difficulty:</strong>{" "}
        {TYPE_PRICES[state.wallpaperType].difficultyLevel}.
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Roll count */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Roll Count & Material Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Wall area</span>
                <span className="text-xl font-bold text-accent">
                  {result.wallAreaSqFt} sq ft
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Rolls needed</span>
                <span className="text-xl font-bold text-foreground">
                  {result.rollsNeeded} rolls
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ({result.totalStripsNeeded} strips, {result.stripsPerRoll}/roll)
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
                  Materials + labor (pro install)
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

          {/* Pattern repeat impact note */}
          {state.patternRepeatInches > 0 && (
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
              <strong className="text-foreground">Pattern repeat impact:</strong>{" "}
              Your {state.patternRepeatInches}&Prime; repeat adds waste per strip.
              Without repeat, you&apos;d need{" "}
              {Math.ceil(state.wallLengthFt / (state.rollWidthInches / 12))} strips
              at {Math.floor(result.rollLengthFt / state.wallHeightFt)}/roll. With
              repeat, you get {result.stripsPerRoll}/roll, requiring{" "}
              {result.rollsNeeded} rolls total.
            </div>
          )}

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.wallLengthFt}′ × {state.wallHeightFt}′ ={" "}
            {result.wallAreaSqFt} sq ft. Roll: 33′ × {state.rollWidthInches}&Prime;,
            repeat {state.patternRepeatInches}&Prime;, {TYPE_PRICES[state.wallpaperType].label}.
            Prices from Angi + HomeAdvisor 2026 data. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter wall dimensions to see your estimate.
        </div>
      )}
    </div>
  );
}
