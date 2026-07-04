export interface CaseStudyMetric {
  label: string;
  value: string;
}

export interface CaseStudyPhase {
  phase: string;
  description: string;
  detail: string;
}

export interface ProjectCaseStudyProps {
  title: string;
  location: string;
  description: string;
  metrics: CaseStudyMetric[];
  phases: CaseStudyPhase[];
  lesson: string;
  source?: string;
}

export function ProjectCaseStudy({
  title,
  location,
  description,
  metrics,
  phases,
  lesson,
  source = "Contractor interviews, 2026",
}: ProjectCaseStudyProps) {
  return (
    <section className="mt-10 no-print">
      <h2 className="font-display text-xl font-bold text-foreground mb-3">
        Real Project Example
      </h2>
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Project header */}
        <div className="p-5 border-b border-border bg-muted/30">
          <h3 className="font-display text-base font-bold text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{location}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Key metrics */}
        <div className="p-5 border-b border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div key={m.label}>
                <span className="text-xs text-muted-foreground block">{m.label}</span>
                <span className="text-lg font-bold text-accent">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project phases */}
        <div className="p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">How It Went Down</h4>
          <div className="space-y-3">
            {phases.map((p, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{p.phase}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                  <p className="text-xs text-muted-foreground italic mt-0.5">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson learned */}
        <div className="p-5 border-t border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">What we learned:</strong> {lesson}
          </p>
          <p className="mt-2 text-xs text-muted-foreground italic">{source}</p>
        </div>
      </div>
    </section>
  );
}
