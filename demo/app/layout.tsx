import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  src: "../public/fonts/Inter-Regular.woff2",
  weight: "400",
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  src: "../public/fonts/Manrope-Bold.woff2",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Construction Calculators — 42 Free Online Tools",
    template: "%s — Construction Calculators",
  },
  description:
    "42 free construction calculators: concrete, roofing, flooring, HVAC, plumbing, siding, drywall, and more. Pure calculation functions and React components, open source under MIT.",
  keywords: [
    "construction calculator",
    "concrete calculator",
    "roofing calculator",
    "HVAC calculator",
    "estimating tools",
    "contractor calculators",
  ],
  authors: [{ name: "EstimatorSuite" }],
  openGraph: {
    title: "Construction Calculators — 42 Free Online Tools",
    description:
      "42 free construction calculators with pure calculation functions and React components. Open source MIT.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased`}>
        <header className="border-b border-border">
          <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/construction-calculators/" className="font-display text-lg font-bold text-primary">
              Construction Calculators
            </a>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="/construction-calculators/calculators/" className="hover:text-accent transition-colors">Material</a>
              <a href="/construction-calculators/tools/" className="hover:text-accent transition-colors">Trade</a>
              <a href="https://github.com/estimatorsuite/construction-calculators" className="hover:text-accent transition-colors">GitHub</a>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* Dofollow backlink footer — this is the core SEO backlink */}
        <footer className="border-t border-border mt-16 py-8">
          <div className="container mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
            <p>
              Built by{" "}
              <a
                href="https://estimatorsuite.com"
                className="text-accent font-semibold hover:underline"
              >
                EstimatorSuite
              </a>
              {" "}&mdash; Construction Estimating Software Reviews
            </p>
            <p className="mt-2">
              42 open-source construction calculators &middot;{" "}
              <a
                href="https://github.com/estimatorsuite/construction-calculators"
                className="text-accent hover:underline"
              >
                View on GitHub
              </a>
              {" "}&middot;{" "}
              <a
                href="https://www.npmjs.com/package/@estimatorsuite/calculators"
                className="text-accent hover:underline"
              >
                npm
              </a>
            </p>
            <p className="mt-2 text-xs">
              MIT Licensed &middot; Price data from publicly available market research (Angi, HomeAdvisor, RSMeans)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
