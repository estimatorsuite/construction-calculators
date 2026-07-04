export interface RegionFactor {
  region: string;
  laborMultiplier: number;
  materialMultiplier: number;
  notes: string;
}

export const DEFAULT_REGION_FACTORS: RegionFactor[] = [
  { region: "Midwest", laborMultiplier: 1.0, materialMultiplier: 1.0, notes: "Baseline (national average)" },
  { region: "Southeast", laborMultiplier: 0.9, materialMultiplier: 0.95, notes: "Lower labor rates, competitive market" },
  { region: "Southwest", laborMultiplier: 1.05, materialMultiplier: 1.1, notes: "Heat-resistant materials cost more" },
  { region: "Northeast", laborMultiplier: 1.3, materialMultiplier: 1.2, notes: "Higher labor, union influence" },
  { region: "West Coast", laborMultiplier: 1.4, materialMultiplier: 1.25, notes: "Highest costs in US" },
];

export interface RegionalPriceTableProps {
  factors?: RegionFactor[];
  source?: string;
}

export function RegionalPriceTable({
  factors = DEFAULT_REGION_FACTORS,
  source = "RSMeans City Cost Indexes 2025, adjusted for 2026",
}: RegionalPriceTableProps) {
  return (
    <section className="mt-6">
      <h3 className="font-display text-base font-bold text-foreground mb-3">
        How Location Affects Your Cost
      </h3>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2 px-3 font-semibold text-foreground">
                  Region
                </th>
                <th className="text-right py-2 px-3 font-semibold text-foreground">
                  Labor
                </th>
                <th className="text-right py-2 px-3 font-semibold text-foreground">
                  Materials
                </th>
                <th className="text-left py-2 px-3 font-semibold text-foreground hidden sm:table-cell">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {factors.map((r) => (
                <tr key={r.region} className="border-b border-border">
                  <td className="py-2 px-3 font-medium text-foreground">
                    {r.region}
                  </td>
                  <td className="py-2 px-3 text-right text-muted-foreground">
                    {r.laborMultiplier}x
                  </td>
                  <td className="py-2 px-3 text-right text-muted-foreground">
                    {r.materialMultiplier}x
                  </td>
                  <td className="py-2 px-3 text-muted-foreground text-xs hidden sm:table-cell">
                    {r.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        To adjust: multiply the calculator&apos;s total by your region&apos;s
        average multiplier. Source: {source}.
      </p>
    </section>
  );
}
