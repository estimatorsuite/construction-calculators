"use client";

import { useState } from "react";
import {
  type TileState,
  type TileSize,
  type TileMaterial,
  TILE_SIZES,
  MATERIAL_PRICES,
  calculateTile,
  getDefaultState,
} from "../data/tile";

const TILE_SIZE_KEYS: TileSize[] = ["4x4", "6x6", "12x12", "18x18", "24x24", "12x24"];
const MATERIAL_KEYS: TileMaterial[] = ["ceramic", "porcelain", "naturalStone", "glass"];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function TileCalculator() {
  const [state, setState] = useState<TileState>(getDefaultState());
  const result = calculateTile(state);

  function updateState(partial: Partial<TileState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Area */}
        <div className="sm:col-span-2">
          <label
            htmlFor="tile-area"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Area to tile (square feet)
          </label>
          <input
            id="tile-area"
            type="number"
            value={state.areaSqFt || ""}
            onChange={(e) =>
              updateState({ areaSqFt: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 200"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Length × width of floor or wall area.
          </p>
        </div>

        {/* Tile size */}
        <div>
          <label
            htmlFor="tile-size"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Tile size
          </label>
          <select
            id="tile-size"
            value={state.tileSize}
            onChange={(e) =>
              updateState({ tileSize: e.target.value as TileSize })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {TILE_SIZE_KEYS.map((s) => (
              <option key={s} value={s}>
                {TILE_SIZES[s].label} — {TILE_SIZES[s].usage}
              </option>
            ))}
          </select>
        </div>

        {/* Material */}
        <div>
          <label
            htmlFor="tile-material"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Material
          </label>
          <select
            id="tile-material"
            value={state.material}
            onChange={(e) =>
              updateState({ material: e.target.value as TileMaterial })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {MATERIAL_KEYS.map((m) => (
              <option key={m} value={m}>
                {MATERIAL_PRICES[m].label}
              </option>
            ))}
          </select>
        </div>

        {/* Waste percent */}
        <div className="sm:col-span-2">
          <label
            htmlFor="tile-waste"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Waste factor (%)
          </label>
          <input
            id="tile-waste"
            type="number"
            value={state.wastePercent || ""}
            onChange={(e) =>
              updateState({ wastePercent: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 15"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            max={50}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Standard: 15%. Use 20% for diagonal layouts or natural stone.
          </p>
        </div>
      </div>

      {/* Selected material description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {MATERIAL_PRICES[state.material].label}:
        </strong>{" "}
        {MATERIAL_PRICES[state.material].description}
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Tile Quantity & Cost Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Tiles needed
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.tilesNeeded} tiles
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  (incl. {state.wastePercent}% waste)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Boxes needed
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.boxesNeeded} boxes
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ({result.sqFtPerBox} sq ft/box)
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
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.areaSqFt} sq ft ×{" "}
            {TILE_SIZES[state.tileSize].label} ×{" "}
            {MATERIAL_PRICES[state.material].label} with {state.wastePercent}%
            waste. Prices from HomeAdvisor + Angi 2026 data.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter an area value greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
