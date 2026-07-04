export interface PriceDataSourceProps {
  sources: string[];
  verifiedDate: string;
  notes?: string;
}

export function PriceDataSource({
  sources,
  verifiedDate,
  notes,
}: PriceDataSourceProps) {
  return (
    <div className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
      <p>
        <strong>Price data sources:</strong> {sources.join(" · ")}
      </p>
      <p className="mt-1">
        <strong>Last verified:</strong> {verifiedDate}
      </p>
      {notes && <p className="mt-1 italic">{notes}</p>}
    </div>
  );
}
