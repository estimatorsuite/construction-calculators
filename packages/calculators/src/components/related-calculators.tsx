/**
 * Related calculators navigation card.
 *
 * Accepts a list of related calculators as props (decoupled from any registry).
 * Uses plain `<a>` tags for framework agnosticism.
 */

export interface RelatedCalculatorItem {
  slug: string;
  title: string;
  shortDescription: string;
}

export interface RelatedCalculatorsProps {
  calculators: RelatedCalculatorItem[];
  category?: string;
  basePath?: string; // e.g. "/calculators/" or "/tools/"
  max?: number;
}

export function RelatedCalculators({
  calculators,
  category,
  basePath = "/calculators/",
  max = 3,
}: RelatedCalculatorsProps) {
  const items = calculators.slice(0, max);

  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-base font-bold text-foreground mb-3">
        {category ? `Related ${category} Calculators` : "Related Calculators"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((calc) => (
          <a
            key={calc.slug}
            href={`${basePath}${calc.slug}/`}
            className="glass-card rounded-lg p-4 hover:border-accent/50 transition-colors group"
          >
            <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
              {calc.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{calc.shortDescription}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
