"use client";

import { useState } from "react";
import { Paintbrush, Droplet, DollarSign } from "lucide-react";
import {
  type PaintState,
  type PaintQuality,
  PAINT_QUALITY_SPECS,
  PRIMER_SPEC,
  calculatePaint,
  getDefaultState,
} from "../data/paint";

const QUALITIES: PaintQuality[] = ["economy", "standard", "premium"];
const COATS_OPTIONS: { value: 1 | 2 | 3; label: string; hint: string }[] = [
  { value: 1, label: "1 coat", hint: "Same color refresh" },
  { value: 2, label: "2 coats", hint: "Standard for color change" },
  { value: 3, label: "3 coats", hint: "Drastic color change" },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function PaintCalculator() {
  const [state, setState] = useState<PaintState>(getDefaultState());
  const result = calculatePaint(state);

  function updateState(partial: Partial<PaintState>) {
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
            Total wall length (perimeter, ft)
          </label>
          <input
            id="wall-length"
            type="number"
            value={state.wallLengthFt || ""}
            onChange={(e) =>
              updateState({ wallLengthFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 48 (12x12 room)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Add all four walls together. Example: 12+12+12+12 = 48 ft.
          </p>
        </div>

        {/* Wall height */}
        <div>
          <label
            htmlFor="wall-height"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Wall height (ft)
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
          <p className="mt-1 text-xs text-muted-foreground">
            Standard ceilings are 8 ft. Vaulted: 10-14 ft.
          </p>
        </div>

        {/* Ceiling toggle */}
        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state.includeCeiling}
              onChange={(e) => updateState({ includeCeiling: e.target.checked })}
              className="h-5 w-5 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm font-semibold text-foreground">
              Also paint the ceiling
            </span>
          </label>
          {state.includeCeiling && (
            <input
              type="number"
              value={state.roomWidthFt || ""}
              onChange={(e) =>
                updateState({ roomWidthFt: Math.max(0, Number(e.target.value) || 0) })
              }
              placeholder="Room width (ft) — for ceiling area"
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              min={0}
              step={0.5}
              style={{ minHeight: "44px", fontSize: "16px" }}
            />
          )}
        </div>

        {/* Openings (subtract) */}
        <div>
          <label
            htmlFor="openings"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Doors + windows area (sq ft)
          </label>
          <input
            id="openings"
            type="number"
            value={state.openingsSqFt || ""}
            onChange={(e) =>
              updateState({ openingsSqFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 30"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            ~20 sq ft per door, ~15 sq ft per window. Don&apos;t paint these.
          </p>
        </div>

        {/* Paint quality */}
        <div>
          <label
            htmlFor="quality"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Paint quality
          </label>
          <select
            id="quality"
            value={state.quality}
            onChange={(e) =>
              updateState({ quality: e.target.value as PaintQuality })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {QUALITIES.map((q) => (
              <option key={q} value={q}>
                {PAINT_QUALITY_SPECS[q].label} — ${PAINT_QUALITY_SPECS[q].priceLow}-${PAINT_QUALITY_SPECS[q].priceHigh}/gal
              </option>
            ))}
          </select>
        </div>

        {/* Coats */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Number of coats
          </label>
          <div className="flex flex-wrap gap-2">
            {COATS_OPTIONS.map((opt) => {
              const isActive = state.coats === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateState({ coats: opt.value })}
                  className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-accent/10 text-foreground hover:bg-accent/20"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  {opt.label}
                  <span className="block text-xs font-normal opacity-80 mt-0.5">
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected quality description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {PAINT_QUALITY_SPECS[state.quality].label}:
        </strong>{" "}
        {PAINT_QUALITY_SPECS[state.quality].description} Coverage:{" "}
        {PAINT_QUALITY_SPECS[state.quality].coveragePerGallon} sq ft/gal. Primer:{" "}
        ${PRIMER_SPEC.priceLow}-${PRIMER_SPEC.priceHigh}/gal ({PRIMER_SPEC.coveragePerGallon}{" "}
        sq ft/gal).
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Paint & Cost Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Paintable area
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.totalPaintableArea.toLocaleString()} sq ft
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Walls: {result.wallAreaSqFt.toLocaleString()}
                  {result.ceilingAreaSqFt > 0 && (
                    <> · Ceiling: {result.ceilingAreaSqFt.toLocaleString()}</>
                  )}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Paint needed
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.gallonsNeeded} gal
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  + {result.primerGallons} gal primer
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
                  Total estimated cost (materials + labor)
                </span>
                <span className="text-xs text-muted-foreground">
                  Pro painter bid range
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[hsl(25,85%,40%)]">
                  ${formatCurrency(result.totalCostLow)} - $
                  {formatCurrency(result.totalCostHigh)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  DIY materials only: ${formatCurrency(result.materialCostLow)} - $
                  {formatCurrency(result.materialCostHigh)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {result.totalPaintableArea.toLocaleString()}{" "}
            sq ft paintable area × {state.coats} coat
            {state.coats > 1 ? "s" : ""} of{" "}
            {PAINT_QUALITY_SPECS[state.quality].label.toLowerCase()} paint. Prices
            from Angi + HomeAdvisor 2026 data. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter wall length and height greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
