# @estimatorsuite/calculators

42 React construction calculators with pure calculation functions.

[![npm version](https://img.shields.io/npm/v/@estimatorsuite/calculators)](https://www.npmjs.com/package/@estimatorsuite/calculators)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Installation

```bash
npm install @estimatorsuite/calculators
```

## Quick Start

```tsx
import { ConcreteCalculator } from "@estimatorsuite/calculators";
import "@estimatorsuite/calculators/styles.css";

function App() {
  return <ConcreteCalculator />;
}
```

Pure calculation functions (no React needed):

```ts
import { concrete } from "@estimatorsuite/calculators/data";

const result = concrete.calculateConcrete({
  lengthFt: 10,
  widthFt: 10,
  depthInches: 4,
  projectType: "slab",
});
```

## Full Documentation

See the [main repository README](https://github.com/estimatorsuite/construction-calculators) for the full list of 42 calculators, theming, and Tailwind setup instructions.

## Live Demo

[estimatorsuite.github.io/construction-calculators](https://estimatorsuite.github.io/construction-calculators/)

## License

MIT &copy; [EstimatorSuite](https://estimatorsuite.com)
