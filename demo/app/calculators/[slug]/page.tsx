import type { Metadata } from "next";
import { calculators, getCalculatorBySlug, getMaterialCalculators } from "@/lib/calculators-meta";
import { componentRegistry } from "@/lib/component-registry";
import { CalculatorDisclaimer, Breadcrumb, LastUpdated } from "@estimatorsuite/calculators";

export function generateStaticParams() {
  return getMaterialCalculators().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const calc = getCalculatorBySlug(params.slug);
  if (!calc) return {};
  return {
    title: `${calc.title} — Free Online Calculator`,
    description: calc.shortDescription,
    alternates: {
      canonical: `/calculators/${calc.slug}/`,
    },
  };
}

export default function MaterialCalculatorPage({ params }: { params: { slug: string } }) {
  const calc = getCalculatorBySlug(params.slug);
  if (!calc) return null;

  const CalculatorComponent = componentRegistry[calc.componentExport];
  if (!CalculatorComponent) return null;

  const related = calculators
    .filter((c) => c.category === calc.category && c.slug !== calc.slug && c.type === "material")
    .slice(0, 3);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/construction-calculators/" },
          { label: "Calculators", href: "/construction-calculators/calculators/" },
          { label: calc.title },
        ]}
      />

      <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">
        {calc.title}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        {calc.shortDescription}
      </p>

      <div className="mt-2">
        <LastUpdated date={calc.lastUpdated} />
      </div>

      <div className="mt-6">
        <CalculatorComponent />
      </div>

      <div className="mt-4">
        <CalculatorDisclaimer
          variant={calc.needsSafetyWarning ? "safety" : calc.needsBrandDisclaimer ? "brand" : "standard"}
          brandName={calc.needsBrandDisclaimer}
        />
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-base font-bold text-foreground mb-3">
            Related {calc.category} Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map((r) => (
              <a
                key={r.slug}
                href={`/construction-calculators/calculators/${r.slug}/`}
                className="glass-card rounded-lg p-4 hover:border-accent/50 transition-colors group"
              >
                <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  {r.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{r.shortDescription}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
