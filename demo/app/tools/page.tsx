import { getTradeCalculators } from "@/lib/calculators-meta";

export default function ToolsIndexPage() {
  const calculators = getTradeCalculators();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-primary mb-2">
        Trade Estimating Calculators
      </h1>
      <p className="text-muted-foreground mb-8">
        {calculators.length} free trade estimating calculators for HVAC, plumbing, electrical, roofing, landscaping, and markup.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((calc) => (
          <a
            key={calc.slug}
            href={`/construction-calculators/tools/${calc.slug}/`}
            className="glass-card rounded-xl p-5 hover:border-accent/50 transition-colors group"
          >
            <span className="text-xs text-muted-foreground">{calc.category}</span>
            <h2 className="font-display text-base font-bold text-foreground group-hover:text-accent transition-colors mt-1">
              {calc.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{calc.shortDescription}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
