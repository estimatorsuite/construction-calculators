export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  items: FaqItem[];
  title?: string;
}

/**
 * Renders a FAQ section with question/answer cards.
 */
export function FaqSection({ items, title = "Frequently Asked Questions" }: FaqSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold text-foreground mb-4">
        {title}
      </h2>
      <div className="space-y-4">
        {items.map((faq) => (
          <div key={faq.question} className="glass-card rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {faq.question}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
