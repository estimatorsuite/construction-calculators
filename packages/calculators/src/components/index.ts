// Auxiliary components (framework-agnostic, no next/link)
export { CalculatorDisclaimer } from "./disclaimer";
export type { DisclaimerProps } from "./disclaimer";

export { PriceDataSource } from "./price-data-source";
export type { PriceDataSourceProps } from "./price-data-source";

export {
  RegionalPriceTable,
  DEFAULT_REGION_FACTORS,
} from "./regional-price-table";
export type {
  RegionFactor,
  RegionalPriceTableProps,
} from "./regional-price-table";

export { RedFlagWarnings } from "./red-flag-warnings";
export type { RedFlagWarningsProps } from "./red-flag-warnings";

export { ProjectCaseStudy } from "./project-case-study";
export type {
  CaseStudyMetric,
  CaseStudyPhase,
  ProjectCaseStudyProps,
} from "./project-case-study";

export { RelatedCalculators } from "./related-calculators";
export type {
  RelatedCalculatorItem,
  RelatedCalculatorsProps,
} from "./related-calculators";

// Material calculators (/calculators/)
export { AsphaltCalculator } from "./asphalt-calculator";
export { BathroomRemodelCalculator } from "./bathroom-remodel-calculator";
export { CarpetCalculator } from "./carpet-calculator";
export { ChainLinkFenceCalculator } from "./chain-link-fence-calculator";
export { ConcreteBlockCalculator } from "./concrete-block-calculator";
export { ConcreteCalculator } from "./concrete-calculator";
export { ConcreteDrivewayCalculator } from "./concrete-driveway-calculator";
export { DeckFootingCalculator } from "./deck-footing-calculator";
export { DeckJoistSpanCalculator } from "./deck-joist-span-calculator";
export { DeckRailingSpacingCalculator } from "./deck-railing-spacing-calculator";
export { DeckStairCalculator } from "./deck-stair-calculator";
export { DrywallCalculator } from "./drywall-calculator";
export { DuctworkCalculator } from "./ductwork-calculator";
export { EpoxyFlooringCalculator } from "./epoxy-flooring-calculator";
export { FlooringSquareFootCalculator } from "./flooring-square-foot-calculator";
export { FurnaceSizeCalculator } from "./furnace-size-calculator";
export { GambrelRoofCalculator } from "./gambrel-roof-calculator";
export { GravelCalculator } from "./gravel-calculator";
export { GutterCalculator } from "./gutter-calculator";
export { HardieSidingCalculator } from "./hardie-siding-calculator";
export { HeatPumpCalculator } from "./heat-pump-calculator";
export { HouseRepipingCalculator } from "./house-repiping-calculator";
export { InsulationRValueCalculator } from "./insulation-r-value-calculator";
export { KitchenRemodelCalculator } from "./kitchen-remodel-calculator";
export { LaminateFlooringCalculator } from "./laminate-flooring-calculator";
export { LandscapingCalculator } from "./landscaping-calculator";
export { MetalRoofCalculator } from "./metal-roof-calculator";
export { MulchCalculator } from "./mulch-calculator";
export { PaintCalculator } from "./paint-calculator";
export { PressureWashingCalculator } from "./pressure-washing-calculator";
export { RoofAreaCalculator } from "./roof-area-calculator";
export { SidingCalculator } from "./siding-calculator";
export { SoffitCalculator } from "./soffit-calculator";
export { SprayFoamInsulationCalculator } from "./spray-foam-insulation-calculator";
export { TileCalculator } from "./tile-calculator";
export { WallpaperCalculator } from "./wallpaper-calculator";

// Trade estimators (/tools/)
export { ElectricalEstimateCalculator } from "./electrical-estimate-calculator";
export { HVACEstimateCalculator } from "./hvac-estimate-calculator";
export { LandscapingEstimateCalculator } from "./landscaping-estimate-calculator";
export { MarkupCalculator } from "./markup-calculator";
export { PlumbingEstimateCalculator } from "./plumbing-estimate-calculator";
export { RoofingEstimateCalculator } from "./roofing-estimate-calculator";
