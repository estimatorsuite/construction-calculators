import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation with schema.org markup.
 * Uses plain `<a>` tags for framework agnosticism.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm text-muted-foreground mb-6 glass-card rounded-lg px-3 py-1.5 inline-flex items-center"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-1.5"
            itemScope
            itemProp="itemListElement"
            itemType="https://schema.org/ListItem"
          >
            {i > 0 && <ChevronRight size={12} className="text-border" />}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-accent transition-colors flex items-center gap-1"
                itemProp="item"
              >
                {i === 0 ? (
                  <>
                    <Home size={12} />
                    <span itemProp="name">{item.label}</span>
                  </>
                ) : (
                  <span itemProp="name">{item.label}</span>
                )}
              </a>
            ) : (
              <span className="text-foreground font-medium" itemProp="name">
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(i + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
