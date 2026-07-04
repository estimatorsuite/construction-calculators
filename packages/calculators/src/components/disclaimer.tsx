import { AlertTriangle } from "lucide-react";

export interface DisclaimerProps {
  variant?: "standard" | "safety" | "brand";
  brandName?: string;
  children?: React.ReactNode;
}

const STANDARD_TEXT =
  "These estimates are for budgeting purposes only. Actual costs depend on your location, current material prices, and contractor rates. Always get 2-3 quotes from licensed contractors before starting any project.";

const SAFETY_TEXT =
  "This calculator is for preliminary estimation only. All work MUST be performed and verified by a licensed professional. Final sizing must comply with local building codes.";

const VARIANT_COLOR: Record<"standard" | "safety" | "brand", string> = {
  standard: "#3b82f6",
  safety: "#dc2626",
  brand: "#f59e0b",
};

export function CalculatorDisclaimer({
  variant = "standard",
  brandName,
  children,
}: DisclaimerProps) {
  const text =
    variant === "safety"
      ? SAFETY_TEXT
      : variant === "brand"
        ? `Not affiliated with ${brandName ?? "this brand"}. This is an independent estimation tool using publicly available product specifications.`
        : STANDARD_TEXT;

  return (
    <div
      className="glass-card rounded-xl p-4 border-l-4 my-4"
      style={{
        borderColor: VARIANT_COLOR[variant],
      }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="h-5 w-5 shrink-0 mt-0.5"
          style={{
            color: VARIANT_COLOR[variant],
          }}
        />
        <div className="text-sm text-muted-foreground">
          <strong className="text-foreground">
            {variant === "safety" ? "Safety Warning: " : "Disclaimer: "}
          </strong>
          {children || text}
        </div>
      </div>
    </div>
  );
}
