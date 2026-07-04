"use client";

import { useState, useMemo } from "react";
import {
  Home,
  Layers,
  Square,
  Building2,
  TrendingUp,
  Check,
  DollarSign,
} from "lucide-react";
import {
  type RoofType,
  type RoofPitch,
  type CalculatorState,
  ROOF_TYPE_LABELS,
  PITCH_LABELS,
  PROFIT_MARGINS,
  FIXED_COSTS,
  TEAR_OFF_COST_PER_SQUARE,
  nationalAverages,
  suggestSquaresFromSqFt,
  estimateLinearFeet,
  calculateBreakdown,
  getDefaultState,
} from "../data/roofing";

const ROOF_TYPE_ICONS: Record<RoofType, React.ElementType> = {
  "architectural-shingle": Layers,
  "3-tab-shingle": Square,
  "metal-standing-seam": Home,
  "flat-tpo": Building2,
};

const ROOF_TYPES: RoofType[] = [
  "architectural-shingle",
  "3-tab-shingle",
  "metal-standing-seam",
  "flat-tpo",
];

const PITCH_OPTIONS: RoofPitch[] = ["flat", "low", "medium", "steep"];

export function RoofingEstimateCalculator() {
  const [state, setState] = useState<CalculatorState>(getDefaultState());
  const breakdown = useMemo(() => calculateBreakdown(state), [state]);

  const nationalAvg = nationalAverages.find(
    (a) => a.roofType === state.roofType
  );

  function updateState(partial: Partial<CalculatorState>) {
    setState((prev) => {
      const next = { ...prev, ...partial };
      // 切换到平顶 TPO 时，自动关闭 tear-off（TPO 通常覆盖在现有屋顶上）
      if (
        partial.roofType === "flat-tpo" &&
        prev.roofType !== "flat-tpo" &&
        next.hasTearOff
      ) {
        next.hasTearOff = false;
      }
      return next;
    });
  }

  function handleRoofTypeChange(type: RoofType) {
    updateState({ roofType: type });
  }

  function handleGroundAreaChange(sqFt: number) {
    const squares = suggestSquaresFromSqFt(sqFt, state.pitch);
    const lfEdge = estimateLinearFeet(sqFt, "edge");
    const lfRidge = estimateLinearFeet(sqFt, "ridge");
    updateState({
      groundAreaSqFt: sqFt,
      squares,
      linearFtEdge: lfEdge,
      linearFtRidge: lfRidge,
    });
  }

  function handlePitchChange(pitch: RoofPitch) {
    const squares = suggestSquaresFromSqFt(state.groundAreaSqFt, pitch);
    updateState({ pitch, squares });
  }

  function handleGenerateResult() {
  }

  return (
    <div className="space-y-6">
      {/* Section A: Roof Type */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          What type of roof are you installing?
        </label>
        <div className="flex flex-wrap gap-2">
          {ROOF_TYPES.map((type) => {
            const Icon = ROOF_TYPE_ICONS[type];
            const isActive = state.roofType === type;
            return (
              <button
                key={type}
                onClick={() => handleRoofTypeChange(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-accent/10 text-foreground hover:bg-accent/20"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {ROOF_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section B: Project Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Ground Area (sq ft)
          </label>
          <input
            type="number"
            value={state.groundAreaSqFt}
            onChange={(e) =>
              handleGroundAreaChange(
                Math.max(500, Math.min(5000, Number(e.target.value) || 1500))
              )
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={500}
            max={5000}
            step={100}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Roof Pitch
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PITCH_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => handlePitchChange(p)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-[36px] ${
                  state.pitch === p
                    ? "bg-accent text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {PITCH_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Roofing Squares{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (auto-calculated)
            </span>
          </label>
          <input
            type="number"
            value={state.squares}
            onChange={(e) =>
              updateState({
                squares: Math.max(1, Number(e.target.value) || 15),
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={1}
            step={1}
          />
          <p className="text-xs text-muted-foreground mt-1">
            1 square = 100 sq ft of roof area
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Labor Rate ($/hr)
          </label>
          <input
            type="number"
            value={state.laborRatePerHour}
            onChange={(e) =>
              updateState({
                laborRatePerHour: Math.max(20, Number(e.target.value) || 45),
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={20}
            step={5}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Drip Edge Linear Feet
          </label>
          <input
            type="number"
            value={state.linearFtEdge}
            onChange={(e) =>
              updateState({
                linearFtEdge: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={10}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Ridge Vent Linear Feet
          </label>
          <input
            type="number"
            value={state.linearFtRidge}
            onChange={(e) =>
              updateState({
                linearFtRidge: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={0}
            step={10}
          />
        </div>
      </div>

      {/* Section C: Optional Items */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Project Options
        </label>
        <div className="space-y-2">
          <button
            onClick={() => updateState({ hasTearOff: !state.hasTearOff })}
            disabled={state.roofType === "flat-tpo"}
            className={`flex items-center gap-3 w-full rounded-lg border p-3 text-left transition-colors min-h-[44px] ${
              state.hasTearOff
                ? "border-accent/50 bg-accent/5"
                : "border-border bg-background hover:bg-muted/50"
            } ${state.roofType === "flat-tpo" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                state.hasTearOff
                  ? "bg-accent text-white"
                  : "border border-border"
              }`}
            >
              {state.hasTearOff && <Check className="w-3 h-3" />}
            </div>
            <span className="text-sm text-foreground flex-1">
              Tear-off existing roof
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              ${TEAR_OFF_COST_PER_SQUARE}/sq
            </span>
          </button>

          <button
            onClick={() => updateState({ includePermit: !state.includePermit })}
            className={`flex items-center gap-3 w-full rounded-lg border p-3 text-left transition-colors min-h-[44px] ${
              state.includePermit
                ? "border-accent/50 bg-accent/5"
                : "border-border bg-background hover:bg-muted/50"
            }`}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                state.includePermit
                  ? "bg-accent text-white"
                  : "border border-border"
              }`}
            >
              {state.includePermit && <Check className="w-3 h-3" />}
            </div>
            <span className="text-sm text-foreground flex-1">
              Building permit + inspection
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              ${FIXED_COSTS.buildingPermit}
            </span>
          </button>

          <button
            onClick={() =>
              updateState({ includeDumpster: !state.includeDumpster })
            }
            className={`flex items-center gap-3 w-full rounded-lg border p-3 text-left transition-colors min-h-[44px] ${
              state.includeDumpster
                ? "border-accent/50 bg-accent/5"
                : "border-border bg-background hover:bg-muted/50"
            }`}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                state.includeDumpster
                  ? "bg-accent text-white"
                  : "border border-border"
              }`}
            >
              {state.includeDumpster && <Check className="w-3 h-3" />}
            </div>
            <span className="text-sm text-foreground flex-1">
              Dumpster rental + disposal
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              ${FIXED_COSTS.dumpsterRental}
            </span>
          </button>
        </div>
      </div>

      {/* Section D: Profit Margin */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Profit Margin
        </label>
        <div className="flex flex-wrap gap-2">
          {PROFIT_MARGINS.map((pct) => (
            <button
              key={pct}
              onClick={() => updateState({ profitMarginPercent: pct })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px] ${
                state.profitMarginPercent === pct
                  ? "bg-accent text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Generate / Calculate Button */}
      <button
        onClick={handleGenerateResult}
        className="w-full px-6 py-3 bg-[hsl(25,85%,50%)] text-white rounded-md font-semibold hover:bg-[hsl(25,85%,42%)] transition-colors min-h-[44px]"
      >
        Calculate Estimate
      </button>

      {/* Section E: Results */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-display text-base font-bold text-foreground">
            Cost Breakdown — {state.squares} sq{" "}
            {ROOF_TYPE_LABELS[state.roofType]}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {state.groundAreaSqFt.toLocaleString()} sq ft ground area ·{" "}
            {PITCH_LABELS[state.pitch].split(" ")[0].toLowerCase()} pitch
          </p>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Materials</span>
            <span className="font-medium text-foreground">
              ${breakdown.materialsTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Labor</span>
            <span className="font-medium text-foreground">
              ${breakdown.laborTotal.toLocaleString()}
            </span>
          </div>
          {breakdown.permitsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Permits</span>
              <span className="font-medium text-foreground">
                ${breakdown.permitsTotal.toLocaleString()}
              </span>
            </div>
          )}
          {breakdown.disposalTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Disposal</span>
              <span className="font-medium text-foreground">
                ${breakdown.disposalTotal.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="font-medium text-foreground">Subtotal</span>
            <span className="font-semibold text-foreground">
              ${breakdown.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Profit ({state.profitMarginPercent}%)
            </span>
            <span className="font-medium text-foreground">
              ${breakdown.profitAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="font-bold text-foreground text-base">
              Grand Total
            </span>
            <span className="font-bold text-accent text-lg">
              ${breakdown.grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* National Average Comparison */}
      {nationalAvg && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-accent">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground">
                For a {state.squares}-square{" "}
                {ROOF_TYPE_LABELS[state.roofType].toLowerCase()} replacement,
                your estimated cost is{" "}
                <strong>${breakdown.grandTotal.toLocaleString()}</strong>.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                National average range:{" "}
                <strong>
                  ${nationalAvg.low.toLocaleString()} – $
                  {nationalAvg.high.toLocaleString()}
                </strong>{" "}
                (typical: ${nationalAvg.typical.toLocaleString()}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <DollarSign className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            These estimates use national average material and labor costs for
            2026. Your actual costs may vary 20–40% based on your region, roof
            complexity, and local labor rates. Always verify with your supplier.
          </p>
        </div>
      </div>

    </div>
  );
}
