import { calculators, getCalculatorsByCategory } from "@/lib/calculators-meta";

export default function HomePage() {
  const grouped = getCalculatorsByCategory();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">
          Construction Calculators
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          42 free, open-source construction calculators for contractors and DIYers.
          Concrete, roofing, flooring, HVAC, plumbing, and more. Pure calculation
          functions plus React components.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <a
            href="https://github.com/estimatorsuite/construction-calculators"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            View on GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@estimatorsuite/calculators"
            className="inline-flex items-center px-4 py-2 border border-border text-foreground rounded-lg font-semibold hover:bg-muted/50 transition-colors"
          >
            npm Package
          </a>
        </div>
      </section>

      {/* Calculator grid by category */}
      {Object.entries(grouped).map(([category, calcs]) => (
        <section key={category} className="mb-10">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {calcs.map((calc) => (
              <a
                key={calc.slug}
                href={`/construction-calculators/${calc.type === "material" ? "calculators" : "tools"}/${calc.slug}/`}
                className="glass-card rounded-xl p-5 hover:border-accent/50 transition-colors group"
              >
                <h3 className="font-display text-base font-bold text-foreground group-hover:text-accent transition-colors">
                  {calc.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {calc.shortDescription}
                </p>
              </a>
            ))}
          </div>
        </section>
      ))}

      {/* About section */}
      <section className="mt-12 glass-card rounded-xl p-6">
        <h2 className="font-display text-xl font-bold text-foreground mb-3">
          About This Project
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These calculators are built from the calculator suite that powers{" "}
          <a href="https://estimatorsuite.com" className="text-accent font-semibold hover:underline">
            EstimatorSuite.com
          </a>
          {" "}— an independent construction estimating software review site. Each
          calculator includes pure calculation functions (zero UI dependencies,
          usable in Node.js or any JS runtime) and a ready-to-use React component.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Price data is sourced from publicly available market research (Angi,
          HomeAdvisor, RSMeans). All calculators are MIT licensed and free to use,
          modify, and distribute.
        </p>
      </section>
    </div>
  );
}
