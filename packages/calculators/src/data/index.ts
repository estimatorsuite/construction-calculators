// Data entry — pure calculation functions + types (zero React dependency)
// Each calculator's exports are namespaced to avoid naming conflicts.
//
// Usage:
//   import { concrete, asphalt } from "@estimatorsuite/calculators/data";
//   const result = concrete.calculateConcrete(state);
//   const defaultState = concrete.getDefaultState();

// Material calculators (/calculators/)
export * as asphalt from "./asphalt";
export * as bathroomRemodel from "./bathroom-remodel";
export * as carpet from "./carpet";
export * as chainLinkFence from "./chain-link-fence";
export * as concrete from "./concrete";
export * as concreteBlock from "./concrete-block";
export * as concreteDriveway from "./concrete-driveway";
export * as deckFooting from "./deck-footing";
export * as deckJoistSpan from "./deck-joist-span";
export * as deckRailingSpacing from "./deck-railing-spacing";
export * as deckStair from "./deck-stair";
export * as drywall from "./drywall";
export * as ductwork from "./ductwork";
export * as epoxyFlooring from "./epoxy-flooring";
export * as flooringSquareFoot from "./flooring-square-foot";
export * as furnaceSize from "./furnace-size";
export * as gambrelRoof from "./gambrel-roof";
export * as gravel from "./gravel";
export * as gutter from "./gutter";
export * as hardieSiding from "./hardie-siding";
export * as heatPump from "./heat-pump";
export * as houseRepiping from "./house-repiping";
export * as insulationRValue from "./insulation-r-value";
export * as kitchenRemodel from "./kitchen-remodel";
export * as laminateFlooring from "./laminate-flooring";
export * as landscapingCost from "./landscaping-cost";
export * as metalRoof from "./metal-roof";
export * as mulch from "./mulch";
export * as paint from "./paint";
export * as pressureWashing from "./pressure-washing";
export * as roofArea from "./roof-area";
export * as siding from "./siding";
export * as soffit from "./soffit";
export * as sprayFoamInsulation from "./spray-foam-insulation";
export * as tile from "./tile";
export * as wallpaper from "./wallpaper";

// Trade estimators (/tools/)
export * as electrical from "./electrical";
export * as hvac from "./hvac";
export * as landscaping from "./landscaping";
export * as markup from "./markup";
export * as plumbing from "./plumbing";
export * as roofing from "./roofing";
