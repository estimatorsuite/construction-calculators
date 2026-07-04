import { AlertTriangle } from "lucide-react";

export interface RedFlagWarningsProps {
  title?: string;
  warnings: string[];
}

export function RedFlagWarnings({
  title = "Red Flags in Contractor Quotes",
  warnings,
}: RedFlagWarningsProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold text-foreground mb-3">
        {title}
      </h2>
      <div className="rounded-xl p-6 border-l-4 border-red-600 bg-red-50 dark:bg-red-950/30">
        <p className="text-sm text-red-900 dark:text-red-200 mb-4">
          We&apos;ve reviewed hundreds of quotes. These are the warning signs
          that a contractor may cut corners or overcharge:
        </p>
        <ul className="space-y-2 text-sm text-red-800 dark:text-red-300">
          {warnings.map((warning, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
