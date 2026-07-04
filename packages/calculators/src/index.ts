// Main entry — React components + shared utilities + types

// Utilities
export { cn } from "./utils/cn";

// Shared components
export { Breadcrumb, LastUpdated, FaqSection } from "./shared";
export type {
  BreadcrumbItem,
  LastUpdatedProps,
  FaqItem,
  FaqSectionProps,
} from "./shared";

// Auxiliary + Calculator components
export {
  // Auxiliary
  CalculatorDisclaimer,
  PriceDataSource,
  RegionalPriceTable,
  DEFAULT_REGION_FACTORS,
  RedFlagWarnings,
  ProjectCaseStudy,
  RelatedCalculators,
  // Material calculators
  AsphaltCalculator,
  BathroomRemodelCalculator,
  CarpetCalculator,
  ChainLinkFenceCalculator,
  ConcreteBlockCalculator,
  ConcreteCalculator,
  ConcreteDrivewayCalculator,
  DeckFootingCalculator,
  DeckJoistSpanCalculator,
  DeckRailingSpacingCalculator,
  DeckStairCalculator,
  DrywallCalculator,
  DuctworkCalculator,
  EpoxyFlooringCalculator,
  FlooringSquareFootCalculator,
  FurnaceSizeCalculator,
  GambrelRoofCalculator,
  GravelCalculator,
  GutterCalculator,
  HardieSidingCalculator,
  HeatPumpCalculator,
  HouseRepipingCalculator,
  InsulationRValueCalculator,
  KitchenRemodelCalculator,
  LaminateFlooringCalculator,
  LandscapingCalculator,
  MetalRoofCalculator,
  MulchCalculator,
  PaintCalculator,
  PressureWashingCalculator,
  RoofAreaCalculator,
  SidingCalculator,
  SoffitCalculator,
  SprayFoamInsulationCalculator,
  TileCalculator,
  WallpaperCalculator,
  // Trade estimators
  ElectricalEstimateCalculator,
  HVACEstimateCalculator,
  LandscapingEstimateCalculator,
  MarkupCalculator,
  PlumbingEstimateCalculator,
  RoofingEstimateCalculator,
} from "./components";

// Type re-exports
export type {
  DisclaimerProps,
  PriceDataSourceProps,
  RegionFactor,
  RegionalPriceTableProps,
  RedFlagWarningsProps,
  CaseStudyMetric,
  CaseStudyPhase,
  ProjectCaseStudyProps,
  RelatedCalculatorItem,
  RelatedCalculatorsProps,
} from "./components";
