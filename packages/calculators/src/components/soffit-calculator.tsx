"use client";

import { useState } from "react";
import { Ruler, Package, DollarSign, TrendingDown } from "lucide-react";
import {
  type SoffitCalculatorState,
  type SoffitMaterial,
  type OverhangDepth,
  type VentedType,
  MATERIAL_PRICES,
  OVERHANG_OPTIONS,
  calculateSoffit,
  getDefaultState,
} from "../data/soffit";

const MATERIALS: SoffitMaterial[] = ["vinyl", "aluminum", "wood", "fiberCement"];
const VENTED_TYPES: { value: VentedType; label: string; hint: string }[] = [
  { value: "vented", label: "Vented", hint: "Recommended for attic ventilation" },
  { value: "solid", label: "Solid", hint: "For porches, carports, non-attic areas" },
  { value: "mixed", label: "Mixed", hint: "50/50 vented and solid panels" },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function SoffitCalculator() {
  const [state, setState] = useState<SoffitCalculatorState>(getDefaultState());
  const result = calculateSoffit(state);

  function updateState(partial: Partial<SoffitCalculatorState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Linear feet */}
        <div className="sm:col-span-2">
          <label
            htmlFor="linear-feet"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Total eave / perimeter length (linear feet)
          </label>
          <input
            id="linear-feet"
            type="number"
            value={state.linearFeet || ""}
            onChange={(e) =>
              updateState({ linearFeet: Math.max(0, Number(e.target.value) || 0) })
            }
            placeholder="e.g. 180"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={1}
            style={{ minHeight: "44px", fontSize: "16px" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Measure along all roof eaves and rakes where soffit is needed.
          </p>
        </div>

        {/* Overhang depth */}
        <div>
          <label
            htmlFor="overhang-depth"
            className="block text-sm font-semibold text-foreground mb-1.5"
          >
            Overhang depth
          </label>
          <select
            id="overhang-depth"
            value={state.overhangDepth}
            onChange={(e) =>
              updateState({ overhangDepth: Number(e.target.value) as OverhangDepth })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {OVERHANG_OPTIONS.map((opt) => (
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
              updateState({ material: e.target.value as SoffitMaterial })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{ minHeight: "44px", fontSize: "16px" }}
          >
            {MATERIALS.map((mat) => (
              <option key={mat} value={mat}>
                {MATERIAL_PRICES[mat].label}
              </option>
            ))}
          </select>
        </div>

        {/* Vented type */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Panel type
          </label>
          <div className="flex flex-wrap gap-2">
            {VENTED_TYPES.map((vt) => {
              const isActive = state.ventedType === vt.value;
              return (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => updateState({ ventedType: vt.value })}
                  className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-accent/10 text-foreground hover:bg-accent/20"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  {vt.label}
                  <span className="block text-xs font-normal opacity-80 mt-0.5">
                    {vt.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected material description */}
      <div className="glass-card rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {MATERIAL_PRICES[state.material].label}:
        </strong>{" "}
        {MATERIAL_PRICES[state.material].description} Lifespan:{" "}
        {MATERIAL_PRICES[state.material].lifespanYears}.
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          {/* Main result */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display text-base font-bold text-foreground">
                Material & Cost Estimate
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Total soffit area
                </span>
                <span className="text-xl font-bold text-accent">
                  {result.totalArea} sq ft
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  (incl. 10% waste)
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Panels needed
                </span>
                <span className="text-xl font-bold text-foreground">
                  {result.panelsNeeded}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ({result.cartonsNeeded} cartons)
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
                  ${result.costPerLinearFootLow}-${result.costPerLinearFootHigh}/linear ft
                </span>
              </div>
            </div>
          </div>

          {/* Calculation basis */}
          <div className="text-xs text-muted-foreground border-t border-border pt-2">
            <strong>Based on:</strong> {state.linearFeet} linear feet ×{" "}
            {state.overhangDepth}" overhang ×{" "}
            {MATERIAL_PRICES[state.material].label}. Prices from Angi + HomeAdvisor
            2026 data. Last verified: June 2026.
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
          Enter a linear feet value greater than 0 to see your estimate.
        </div>
      )}
    </div>
  );
}
