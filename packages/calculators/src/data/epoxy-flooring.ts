// lib/calculators/epoxy-flooring-data.ts
// Epoxy Flooring Cost Calculator — 数据层
// 数据来源：HomeAdvisor 2026 + Homewyse May 2026 + DG Floors 2026
// 最后验证：2026-06-20

// ========================================================================
// 类型定义
// ========================================================================

export type EpoxyCoatingType = "waterBasedSingle" | "solidDouble" | "polyasparticTriple";
export type SurfaceCondition = "new" | "minorCracks" | "majorRepair";

export interface EpoxyCalculatorState {
  floorAreaSqFt: number;
  coatingType: EpoxyCoatingType;
  surfaceCondition: SurfaceCondition;
}

export interface EpoxyResult {
  materialCostLow: number;
  materialCostHigh: number;
  laborCostLow: number;
  laborCostHigh: number;
  surfacePrepCost: number;
  totalCostLow: number;
  totalCostHigh: number;
  costPerSqFtLow: number;
  costPerSqFtHigh: number;
  cureTimeHours: number;
  lifespanYears: string;
}

// ========================================================================
// 涂层类型数据
// 来源：DG Floors 2026 + Epoxy Custom Flooring 2026 + Minimal & Modern 2026
// ========================================================================

export interface CoatingTypeSpec {
  label: string;
  description: string;
  installedLow: number;           // $/sq ft（材料+人工）
  installedHigh: number;
  materialPerSqFt: number;        // 仅材料
  laborPerSqFt: number;           // 仅人工
  cureTimeHours: number;
  lifespanYears: string;
  pros: string;
  cons: string;
}

export const COATING_TYPES: Record<EpoxyCoatingType, CoatingTypeSpec> = {
  waterBasedSingle: {
    label: "Water-Based Single Coat",
    description: "DIY-friendly, one coat of water-based epoxy. Budget option.",
    installedLow: 3,
    installedHigh: 5,
    materialPerSqFt: 1.5,
    laborPerSqFt: 2,
    cureTimeHours: 24,
    lifespanYears: "3-5 years",
    pros: "Cheapest, DIY-friendly, fast cure",
    cons: "Short lifespan, fades in UV, peels in heavy traffic",
  },
  solidDouble: {
    label: "100% Solid Epoxy (Double Coat)",
    description: "Two coats of industrial-grade epoxy. Most popular pro option.",
    installedLow: 5,
    installedHigh: 8,
    materialPerSqFt: 3,
    laborPerSqFt: 3.5,
    cureTimeHours: 48,
    lifespanYears: "8-15 years",
    pros: "Durable, chemical-resistant, good value",
    cons: "Slower cure, must be done by pro, sensitive to moisture",
  },
  polyasparticTriple: {
    label: "Polyaspartic / Metallic Flake System",
    description: "Premium three-coat system with decorative flakes. UV-stable.",
    installedLow: 8,
    installedHigh: 12,
    materialPerSqFt: 4.5,
    laborPerSqFt: 4.5,
    cureTimeHours: 6,
    lifespanYears: "15-25 years",
    pros: "UV-stable, fast cure (same-day), longest lasting, decorative",
    cons: "Most expensive, requires specialized installer",
  },
};

// ========================================================================
// 表面处理成本
// ========================================================================

export const SURFACE_CONDITIONS: Record<SurfaceCondition, { label: string; prepCostPerSqFt: number; description: string }> = {
  new: {
    label: "New / smooth concrete",
    prepCostPerSqFt: 0,
    description: "Freshly poured or already smooth. Minimal prep needed.",
  },
  minorCracks: {
    label: "Minor cracks / stains",
    prepCostPerSqFt: 1,
    description: "Small cracks, oil stains, or minor spalling. Needs patching + grinding.",
  },
  majorRepair: {
    label: "Major repair needed",
    prepCostPerSqFt: 2.5,
    description: "Large cracks, pitting, or moisture issues. Requires extensive patching.",
  },
};

// ========================================================================
// 计算函数
// ========================================================================

export function calculateEpoxy(state: EpoxyCalculatorState): EpoxyResult | null {
  if (state.floorAreaSqFt <= 0) return null;

  const coating = COATING_TYPES[state.coatingType];
  const surface = SURFACE_CONDITIONS[state.surfaceCondition];

  // 材料成本
  const materialCostLow = Math.round(state.floorAreaSqFt * coating.materialPerSqFt);
  const materialCostHigh = Math.round(state.floorAreaSqFt * coating.materialPerSqFt * 1.4);

  // 人工成本
  const laborCostLow = Math.round(state.floorAreaSqFt * coating.laborPerSqFt);
  const laborCostHigh = Math.round(state.floorAreaSqFt * coating.laborPerSqFt * 1.5);

  // 表面处理（额外）
  const surfacePrepCost = Math.round(state.floorAreaSqFt * surface.prepCostPerSqFt);

  const totalCostLow = materialCostLow + laborCostLow + surfacePrepCost;
  const totalCostHigh = materialCostHigh + laborCostHigh + surfacePrepCost;

  return {
    materialCostLow,
    materialCostHigh,
    laborCostLow,
    laborCostHigh,
    surfacePrepCost,
    totalCostLow,
    totalCostHigh,
    costPerSqFtLow: Math.round((totalCostLow / state.floorAreaSqFt) * 10) / 10,
    costPerSqFtHigh: Math.round((totalCostHigh / state.floorAreaSqFt) * 10) / 10,
    cureTimeHours: coating.cureTimeHours,
    lifespanYears: coating.lifespanYears,
  };
}

// ========================================================================
// 默认状态
// ========================================================================

export function getDefaultState(): EpoxyCalculatorState {
  return {
    floorAreaSqFt: 450,           // 典型 2-car garage
    coatingType: "solidDouble",   // 最常见 pro option
    surfaceCondition: "minorCracks",
  };
}

// ========================================================================
// 成本拆解
// ========================================================================

export const COST_BREAKDOWN = [
  {
    component: "Materials (epoxy + primer + topcoat)",
    percentage: "35-45%",
    description: "Resin, hardener, primer, clear topcoat, decorative flakes (if applicable)",
  },
  {
    component: "Labor (surface prep + application)",
    percentage: "40-50%",
    description: "Grinding, crack repair, mixing, application, finishing",
  },
  {
    component: "Surface preparation",
    percentage: "10-20%",
    description: "Concrete grinding, crack patching, stain removal, moisture testing",
  },
  {
    component: "Overhead & profit",
    percentage: "5-10%",
    description: "Equipment, insurance, contractor margin",
  },
];

// ========================================================================
// FAQ
// ========================================================================

export const epoxyFaqs = [
  {
    question: "How much does it cost to epoxy a 2-car garage floor?",
    answer:
      "A 2-car garage floor (about 450 sq ft) costs $1,500-$5,000 to epoxy professionally, depending on coating type. Water-based single coat runs $1,400-$2,300. 100% solid epoxy double coat (the most popular choice) costs $2,300-$3,600. Premium polyaspartic with metallic flakes runs $3,600-$5,400. Surface condition adds $0-$2.50/sq ft extra for crack repair or moisture mitigation.",
  },
  {
    question: "Is DIY epoxy floor worth it?",
    answer:
      "DIY epoxy kits cost $100-$300 for a 2-car garage (vs $1,500-$5,000 for pro install), but results typically last only 1-2 years vs 8-15 for professional work. The reason: DIY kits use water-based epoxy (weaker) and skip proper surface preparation (mechanical grinding). Most homeowners who try DIY end up paying a pro to remove the failed coating ($2-$4/sq ft removal) plus re-apply. For a garage floor you plan to keep 5+ years, professional installation is almost always cheaper in the long run.",
  },
  {
    question: "What's the difference between epoxy and polyaspartic?",
    answer:
      "Epoxy is a two-part resin that cures over 24-48 hours. Polyaspartic is a newer polyurea-based coating that cures in 4-6 hours. Polyaspartic is UV-stable (won't yellow in sunlight), more flexible (won't crack in freeze-thaw), and can be walked on the same day. The trade-off: polyaspartic costs 30-60% more ($8-$12/sq ft vs $5-$8 for solid epoxy). For interior garages, epoxy is fine. For sun-exposed patios or UV-sensitive areas, polyaspartic is worth the premium.",
  },
  {
    question: "How long does epoxy garage floor last?",
    answer:
      "Professional epoxy garage floors last 8-15 years (100% solid double coat) or 15-25 years (polyaspartic). Water-based single coat lasts only 3-5 years. Lifespan depends heavily on: (1) surface prep quality (mechanical grinding is non-negotiable), (2) coating thickness (3-5 mils minimum for solid epoxy), (3) garage use (heavy vehicle traffic, hot tires, chemical spills all shorten life). Hot tire pickup (where tires stick to coating) is the #1 failure mode for cheap epoxy.",
  },
  {
    question: "Can I epoxy over an old epoxy floor?",
    answer:
      "Usually no. Existing epoxy must be mechanically ground off completely ($2-$4/sq ft) before new coating. Applying new epoxy over old creates adhesion problems and visible imperfections. The exception: if the existing epoxy is a single thin water-based coat in good condition, a pro can sometimes scarify (lightly grind) and re-coat. But for solid epoxy or polyaspartic, full removal is the only reliable option. Budget for removal cost in addition to new coating.",
  },
  {
    question: "When is the best time to epoxy a garage floor?",
    answer:
      "Spring and fall (50-80°F concrete temperature) are ideal. Epoxy won't cure properly below 50°F or above 90°F. Humidity should be below 85% during application. Most pros book 2-4 weeks out in peak season (May-September). Winter installation is possible only in heated garages. If you're getting a new garage floor poured, wait at least 28-30 days for concrete to fully cure before epoxy application — applying too early causes moisture bubbles and adhesion failure.",
  },
  {
    question: "How long before I can park on an epoxy garage floor?",
    answer:
      "Wait times vary by coating type: water-based epoxy needs 72 hours for foot traffic and 7 days for vehicle parking. 100% solid epoxy needs 24 hours for foot traffic and 3-5 days for vehicles. Polyaspartic coatings cure fastest — 6-12 hours for foot traffic and 24 hours for vehicles. Avoid hot tire pickup (tires sticking to coating) by waiting the full cure time, especially in the first month when the coating is still hardening. Park in a different spot each day for the first week to prevent tire impressions on fresh epoxy.",
  },
  {
    question: "Can epoxy flooring be applied over painted concrete?",
    answer:
      "No — paint must be removed first. Existing paint, sealers, or curing compounds prevent epoxy from bonding to the concrete substrate. Removal methods: mechanical grinding (diamond grinder, $80-$150/day rental) is the gold standard. Chemical strippers ($30-$50/gallon) work but leave residue that must also be ground off. After removal, test for moisture by taping a 2x2 foot plastic sheet to the floor for 24 hours — if condensation forms, apply a moisture mitigation primer ($1.50-$3/sq ft) before epoxy. Skipping these steps guarantees peeling within 6-12 months.",
  },
];
