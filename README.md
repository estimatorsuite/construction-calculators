# construction-calculators

42 React construction calculators with pure calculation functions — concrete, roofing, flooring, HVAC, plumbing, siding, drywall, and more.

[![npm version](https://img.shields.io/npm/v/@estimatorsuite/calculators)](https://www.npmjs.com/package/@estimatorsuite/calculators)
[![Live Demo](https://img.shields.io/badge/Live-Demo-ff4785)](https://estimatorsuite.github.io/construction-calculators/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Calculators](https://img.shields.io/badge/Calculators-42-blue)](https://estimatorsuite.github.io/construction-calculators/)

## Why construction-calculators?

Built from the calculator suite that powers [EstimatorSuite.com](https://estimatorsuite.com) — an independent construction estimating software review site. These calculators were designed for real contractor use, not a component showcase.

42 calculators covering concrete, roofing, siding, flooring, HVAC, plumbing, insulation, decking, landscaping, and trade markup. Each calculator includes:

- **Pure calculation functions** — zero UI dependencies, usable in Node.js, CLI tools, or any JS runtime
- **Ready-to-use React components** — accessible, responsive, styled with Tailwind CSS
- **Real 2026 price data** — sourced from Angi, HomeAdvisor, and RSMeans market research

## Installation

```bash
npm install @estimatorsuite/calculators
```

## Quick Start

### Use a React component

```tsx
import { ConcreteCalculator } from "@estimatorsuite/calculators";
import "@estimatorsuite/calculators/styles.css";

function App() {
  return <ConcreteCalculator />;
}
```

### Use pure calculation functions (no React needed)

```ts
import { concrete } from "@estimatorsuite/calculators/data";

const result = concrete.calculateConcrete({
  lengthFt: 10,
  widthFt: 10,
  depthInches: 4,
  projectType: "slab",
});

console.log(result);
// { cubicFeet: 33.3, cubicYards: 1.23, bagsNeeded80lb: 56, totalCostLow: 170, ... }
```

## Available Calculators

### Material Calculators (36)

| Category | Calculators |
|----------|-------------|
| **Concrete & Asphalt** | Concrete, Asphalt, Concrete Block, Concrete Driveway, Gravel |
| **Roof** | Roof Area, Metal Roof, Gambrel Roof, Gutter, Soffit |
| **Flooring** | Tile, Carpet, Laminate, Flooring Sq Ft, Epoxy Flooring |
| **Siding & Drywall** | Siding, Hardie Siding, Drywall, Paint, Wallpaper |
| **Deck & Fence** | Deck Footing, Deck Joist Span, Deck Railing, Deck Stair, Chain Link Fence |
| **HVAC** | Heat Pump, Furnace Size, Ductwork |
| **Plumbing** | House Repiping |
| **Insulation** | Spray Foam, Insulation R-Value |
| **Remodel** | Kitchen, Bathroom |
| **Landscape** | Mulch, Landscaping, Pressure Washing |

### Trade Estimators (6)

| Calculator | Use Case |
|-----------|----------|
| **Markup Calculator** | Calculate markup, margin, and selling price |
| **HVAC Estimate** | Price HVAC installation by system type and tonnage |
| **Electrical Estimate** | Estimate electrical job costs |
| **Plumbing Estimate** | Estimate plumbing job costs |
| **Roofing Estimate** | Estimate roofing job costs by squares |
| **Landscaping Estimate** | Estimate landscaping job costs |

## Theming

Override CSS custom properties to match your brand:

```css
:root {
  --esc-primary: 215 75% 34%;
  --esc-accent: 215 75% 34%;
  --esc-action: 25 85% 50%;
  --esc-border: 215 12% 88%;
  --esc-muted-foreground: 215 12% 45%;
}
```

Add the `esc-dark` class for dark mode:

```html
<div class="esc-dark">
  <!-- Calculators use dark theme -->
</div>
```

## Tailwind CSS Setup

This library uses Tailwind utility classes internally. Add `@estimatorsuite/calculators` to your content paths:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@estimatorsuite/calculators/dist/**/*.{js,mjs}",
  ],
};
```

## Live Demo

Try all 42 calculators at [estimatorsuite.github.io/construction-calculators](https://estimatorsuite.github.io/construction-calculators/)

## Used In Production

- [EstimatorSuite.com](https://estimatorsuite.com) — Independent construction estimating software reviews and calculator suite

## Price Data

Price constants reflect US national averages for 2026, sourced from:
- Angi cost guides
- HomeAdvisor pricing data
- RSMeans Building Construction Cost Data
- Retail pricing from Home Depot / Lowe's

Regional variations can reach ±30%. Always confirm with local suppliers.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

[MIT](./LICENSE) &copy; [EstimatorSuite](https://estimatorsuite.com)
