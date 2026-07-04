export interface LastUpdatedProps {
  date: string;
}

/**
 * Displays a "Last updated: {Month Year}" line.
 */
export function LastUpdated({ date }: LastUpdatedProps) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <p className="text-xs text-muted-foreground">
      Last updated: {formatted}
    </p>
  );
}
