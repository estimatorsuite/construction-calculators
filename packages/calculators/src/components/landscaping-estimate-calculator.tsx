"use client";

import { useState, useMemo } from "react";
import {
  Trees,
  Square,
  Sprout,
  Droplets,
  TrendingUp,
  Check,
  DollarSign,
} from "lucide-react";
import {
  type LandscapingJobType,
  type EquipmentTier,
  type CalculatorState,
  JOB_TYPE_LABELS,
  TIER_LABELS,
  PROFIT_MARGINS,
  PERMIT_COSTS,
  nationalAverages,
  calculateBreakdown,
  getDefaultState,
} from "../data/landscaping";

const JOB_TYPE_ICONS: Record<LandscapingJobType, React.ElementType> = {
  "sod-installation": Trees,
  "patio-installation": Square,
  "mulch-planting": Sprout,
  "irrigation-system": Droplets,
};

const JOB_TYPES: LandscapingJobType[] = [
  "sod-installation",
  "patio-installation",
  "mulch-planting",
  "irrigation-system",
];

const TIERS: EquipmentTier[] = ["basic", "standard", "premium"];

export function LandscapingEstimateCalculator() {
  const [state, setState] = useState<CalculatorState>(getDefaultState());
  const breakdown = useMemo(() => calculateBreakdown(state), [state]);

  const nationalAvg = nationalAverages.find(
    (a) => a.jobType === state.jobType
  );

  // 当前 jobType 是否需要许可（sod/mulch-planting 不需要）
  const permitRequired = PERMIT_COSTS[state.jobType] > 0;

  function updateState(partial: Partial<CalculatorState>) {
    setState((prev) => {
      const next = { ...prev, ...partial };
      // 切换工作类型时重置 equipmentTier 为 standard
      if (partial.jobType && partial.jobType !== prev.jobType) {
        const newPermitRequired = PERMIT_COSTS[partial.jobType] > 0;
        next.equipmentTier = "standard";
        // 如果新 jobType 不需要许可，自动关闭 includePermit
        if (!newPermitRequired) {
          next.includePermit = false;
        } else {
          next.includePermit = true;
        }
      }
      return next;
    });
  }

  function handleJobTypeChange(job: LandscapingJobType) {
    updateState({ jobType: job });
  }

  function handleGenerateResult() {
  }

  return (
    <div className="space-y-6">
      {/* Section A: Job Type */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          What are you installing?
        </label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((job) => {
            const Icon = JOB_TYPE_ICONS[job];
            const isActive = state.jobType === job;
            return (
              <button
                key={job}
                onClick={() => handleJobTypeChange(job)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-accent/10 text-foreground hover:bg-accent/20"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {JOB_TYPE_LABELS[job]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section B: Equipment Tier + Quantity + Labor Rate */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Material & Plant Tier
        </label>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => updateState({ equipmentTier: tier })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                state.equipmentTier === tier
                  ? "bg-accent text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {TIER_LABELS[tier]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Quantity
          </label>
          <input
            type="number"
            value={state.quantity}
            onChange={(e) =>
              updateState({
                quantity: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={1}
            max={20}
            step={1}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Number of units (e.g., 2 patios, 3 garden beds)
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
                laborRatePerHour: Math.max(25, Number(e.target.value) || 50),
              })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            min={25}
            step={5}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Landscape crew avg: $40–$75/hr
          </p>
        </div>
      </div>

      {/* Section C: Optional Items */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Project Options
        </label>
        <div className="space-y-2">
          <button
            onClick={() =>
              permitRequired && updateState({ includePermit: !state.includePermit })
            }
            disabled={!permitRequired}
            className={`flex items-center gap-3 w-full rounded-lg border p-3 text-left transition-colors min-h-[44px] ${
              state.includePermit && permitRequired
                ? "border-accent/50 bg-accent/5"
                : "border-border bg-background hover:bg-muted/50"
            } ${!permitRequired ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                state.includePermit && permitRequired
                  ? "bg-accent text-white"
                  : "border border-border"
              }`}
            >
              {state.includePermit && permitRequired && (
                <Check className="w-3 h-3" />
              )}
            </div>
            <span className="text-sm text-foreground flex-1">
              Permit + inspection (hardscape / backflow)
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {permitRequired ? `$${PERMIT_COSTS[state.jobType]}` : "Not required"}
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
            Cost Breakdown — {state.quantity}×{" "}
            {JOB_TYPE_LABELS[state.jobType]}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {TIER_LABELS[state.equipmentTier]} tier · ${state.laborRatePerHour}/hr labor
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
                For a {JOB_TYPE_LABELS[state.jobType].toLowerCase()} (
                {state.quantity} unit{state.quantity > 1 ? "s" : ""}), your
                estimated cost is{" "}
                <strong>${breakdown.grandTotal.toLocaleString()}</strong>.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                National average range:{" "}
                <strong>
                  ${nationalAvg.low.toLocaleString()} – $
                  {nationalAvg.high.toLocaleString()}
                </strong>{" "}
                (typical: ${nationalAvg.typical.toLocaleString()} per unit).
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
            These estimates use national average equipment and material costs
            for 2026. Your actual costs may vary 20–40% based on your region,
            site accessibility, and local labor rates. Large-scale grading,
            tree removal, and drainage work add significant cost not captured
            here. Always verify with your supplier.
          </p>
        </div>
      </div>

    </div>
  );
}
