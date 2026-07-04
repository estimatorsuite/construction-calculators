"use client";

import { useState, useMemo } from "react";
import {
  Thermometer,
  Flame,
  Wind,
  Home,
  Wrench,
  DollarSign,
  TrendingUp,
  Check,
} from "lucide-react";
import {
  type HVACSystemType,
  type CalculatorState,
  TONNAGE_OPTIONS,
  SYSTEM_LABELS,
  PROFIT_MARGINS,
  OPTIONAL_ITEMS,
  nationalAverages,
  suggestTonnage,
  calculateBreakdown,
  getDefaultState,
} from "../data/hvac";

const SYSTEM_ICONS: Record<HVACSystemType, React.ElementType> = {
  "central-ac": Wind,
  "heat-pump": Flame,
  "furnace-ac": Thermometer,
  "mini-split": Home,
};

const SYSTEM_TYPES: HVACSystemType[] = [
  "central-ac",
  "heat-pump",
  "furnace-ac",
  "mini-split",
];

export function HVACEstimateCalculator() {
  const [state, setState] = useState<CalculatorState>(getDefaultState());
  const breakdown = useMemo(() => calculateBreakdown(state), [state]);

  const nationalAvg = nationalAverages.find(
    (a) => a.systemType === state.systemType
  );

  function updateState(partial: Partial<CalculatorState>) {
    setState((prev) => {
      const next = { ...prev, ...partial };
      // 如果切换系统类型，更新默认工时
      if (partial.systemType && partial.systemType !== prev.systemType) {
        const defaults = getDefaultState(partial.systemType);
        next.laborHours = defaults.laborHours;
        next.tonnage = defaults.tonnage;
      }
      return next;
    });
  }

  function handleSystemChange(sys: HVACSystemType) {
    updateState({ systemType: sys });
  }

  function handleHomeSizeChange(sqFt: number) {
    const suggestedTonnage = suggestTonnage(sqFt);
    updateState({ homeSizeSqFt: sqFt, tonnage: suggestedTonnage });
  }

  function handleGenerateResult() {
  }

  return (
    <div className="space-y-6">
      {/* Section A: System Type */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          What are you installing?
        </label>
        <div className="flex flex-wrap gap-2">
          {SYSTEM_TYPES.map((sys) => {
            const Icon = SYSTEM_ICONS[sys];
            const isActive = state.systemType === sys;
            return (
              <button
                key={sys}
                onClick={() => handleSystemChange(sys)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-accent/10 text-foreground hover:bg-accent/20"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {SYSTEM_LABELS[sys]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section B: Project Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Home Size (sq ft)
          </label>
          <input
            type="number"
            value={state.homeSizeSqFt}
            onChange={(e) =>
              handleHomeSizeChange(
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
            System Tonnage
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TONNAGE_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => updateState({ tonnage: t })}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-[36px] ${
                  state.tonnage === t
                    ? "bg-accent text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {t}T
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Labor Hours
          </label>
          <input
            type="number"
            value={state.laborHours}
            onChange={(e) =>
              updateState({
                laborHours: Math.max(1, Number(e.target.value) || 8),
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={1}
            step={1}
          />
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
                laborRatePerHour: Math.max(20, Number(e.target.value) || 65),
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={20}
            step={5}
          />
        </div>
      </div>

      {/* Section C: Optional Items */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Include Optional Items
        </label>
        <div className="space-y-2">
          {(
            [
              {
                key: "includeThermostat" as const,
                label: OPTIONAL_ITEMS.thermostat.name,
                cost: OPTIONAL_ITEMS.thermostat.cost,
              },
              {
                key: "includeDuctwork" as const,
                label: OPTIONAL_ITEMS.ductwork.name,
                cost: OPTIONAL_ITEMS.ductwork.cost,
              },
              {
                key: "includePermit" as const,
                label: OPTIONAL_ITEMS.permit.name,
                cost: OPTIONAL_ITEMS.permit.cost,
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => updateState({ [opt.key]: !state[opt.key] })}
              className={`flex items-center gap-3 w-full rounded-lg border p-3 text-left transition-colors min-h-[44px] ${
                state[opt.key]
                  ? "border-accent/50 bg-accent/5"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                  state[opt.key]
                    ? "bg-accent text-white"
                    : "border border-border"
                }`}
              >
                {state[opt.key] && <Check className="w-3 h-3" />}
              </div>
              <span className="text-sm text-foreground flex-1">{opt.label}</span>
              <span className="text-sm font-medium text-muted-foreground">
                ${opt.cost.toLocaleString()}
              </span>
            </button>
          ))}
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
            Cost Breakdown —{" "}
            {state.tonnage}T {SYSTEM_LABELS[state.systemType]}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {state.homeSizeSqFt.toLocaleString()} sq ft home
          </p>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Equipment</span>
            <span className="font-medium text-foreground">
              ${breakdown.equipmentTotal.toLocaleString()}
            </span>
          </div>
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
                For a {state.tonnage}T {SYSTEM_LABELS[state.systemType].toLowerCase()} in a{" "}
                {state.homeSizeSqFt.toLocaleString()} sq ft home, your estimated
                cost is{" "}
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
            These estimates use national average material and equipment costs for
            2026. Your actual costs may vary 20–40% based on your region,
            equipment brand, and local labor rates. Always verify with your
            supplier.
          </p>
        </div>
      </div>

    </div>
  );
}
