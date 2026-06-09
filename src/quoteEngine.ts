import type {
  BusinessProfile,
  ContactMethod,
  DerivedNeed,
  HandoffReceipt,
  MarketPackage,
  QuoteRecommendation
} from "./types.js";

export const OUTPUT_DISCLAIMER =
  "Clean-room demo only: synthetic data, mocked integrations, no real quotes, no coverage placement, and no insurance, legal, financial, underwriting, or claims advice.";

export function deriveNeeds(profile: BusinessProfile): DerivedNeed[] {
  const needs: DerivedNeed[] = [];

  if (profile.operations.worksAtClientSites) {
    needs.push({
      code: "client-site-liability",
      label: "Client-site liability",
      reason: "The business performs work at customer locations."
    });
    needs.push({
      code: "property-damage",
      label: "Customer property damage",
      reason: "Service work can accidentally damage customer property."
    });
  }

  if (profile.operations.usesVehicles) {
    needs.push({
      code: "vehicle-exposure",
      label: "Vehicle exposure",
      reason: "The profile uses vehicles for job travel or operations."
    });
  }

  if (profile.operations.storesTools) {
    needs.push({
      code: "tools-equipment",
      label: "Tools and equipment",
      reason: "Portable equipment is part of the synthetic operation."
    });
  }

  if (profile.employees > 0) {
    needs.push({
      code: "employee-injury-planning",
      label: "Employee injury planning",
      reason: "The profile includes employees and payroll exposure."
    });
  }

  if (profile.operations.hiresSubcontractors) {
    needs.push({
      code: "subcontractor-controls",
      label: "Subcontractor controls",
      reason: "The profile uses subcontractors and may need contract controls."
    });
    needs.push({
      code: "contract-review",
      label: "Contract review",
      reason: "Subcontracted jobs often introduce certificate and contract requirements."
    });
  }

  if (profile.operations.seasonalWork) {
    needs.push({
      code: "seasonal-operations",
      label: "Seasonal operations",
      reason: "The profile changes operations or payroll seasonally."
    });
    needs.push({
      code: "seasonal-payroll",
      label: "Seasonal payroll review",
      reason: "Seasonal crews can change rating assumptions in real policies."
    });
  }

  if (profile.annualRevenue >= 750000 || profile.priorities.some((priority) => priority.includes("higher liability"))) {
    needs.push({
      code: "higher-liability-limit",
      label: "Higher liability limit review",
      reason: "Revenue or stated priorities suggest reviewing higher limits."
    });
  }

  return needs;
}

export function comparePackages(profile: BusinessProfile, packages: MarketPackage[]): QuoteRecommendation[] {
  const needs = deriveNeeds(profile);

  return packages
    .map((marketPackage) => scorePackage(profile, marketPackage, needs))
    .sort((left, right) => right.score - left.score || left.monthlyPremium - right.monthlyPremium)
    .map((recommendation, index) => ({ ...recommendation, rank: index + 1 }));
}

function scorePackage(
  profile: BusinessProfile,
  marketPackage: MarketPackage,
  needs: DerivedNeed[]
): QuoteRecommendation {
  const matchedNeeds = needs.filter((need) => coversNeed(marketPackage, need.code));
  const missingNeeds = needs.filter((need) => !coversNeed(marketPackage, need.code));
  const appetiteFit = marketPackage.appetite.includes(profile.trade);
  const revenueFactor = profile.annualRevenue > 700000 ? 1.18 : profile.annualRevenue < 300000 ? 0.92 : 1;
  const employeeFactor = 1 + Math.min(profile.employees, 20) * 0.015;
  const monthlyPremium = Math.round(marketPackage.baseMonthlyPremium * revenueFactor * employeeFactor);
  const score = Math.max(
    0,
    Math.round(
      (appetiteFit ? 34 : -18) +
        matchedNeeds.length * 12 -
        missingNeeds.length * 8 +
        premiumScore(monthlyPremium, profile) +
        limitScore(marketPackage)
    )
  );

  return {
    rank: 0,
    packageId: marketPackage.id,
    packageName: marketPackage.name,
    score,
    monthlyPremium,
    annualPremium: monthlyPremium * 12,
    matchedNeeds,
    missingNeeds,
    strengths: marketPackage.strengths,
    cautions: marketPackage.cautions,
    fitSummary: buildFitSummary(appetiteFit, matchedNeeds.length, missingNeeds.length),
    disclaimer: OUTPUT_DISCLAIMER
  };
}

function coversNeed(marketPackage: MarketPackage, needCode: string): boolean {
  return marketPackage.coverageLines.some((line) => line.matchesNeeds.includes(needCode));
}

function premiumScore(monthlyPremium: number, profile: BusinessProfile): number {
  const revenueRatio = monthlyPremium / Math.max(profile.annualRevenue / 12, 1);
  if (revenueRatio < 0.006) {
    return 16;
  }
  if (revenueRatio < 0.012) {
    return 10;
  }
  if (revenueRatio < 0.02) {
    return 4;
  }
  return -4;
}

function limitScore(marketPackage: MarketPackage): number {
  const totalLimit = marketPackage.coverageLines.reduce((sum, line) => sum + line.limit, 0);
  if (totalLimit >= 4_000_000) {
    return 8;
  }
  if (totalLimit >= 2_000_000) {
    return 5;
  }
  return 2;
}

function buildFitSummary(appetiteFit: boolean, matchedCount: number, missingCount: number): string {
  if (!appetiteFit) {
    return "Low fit because this synthetic package does not list the trade in its appetite.";
  }
  if (missingCount === 0) {
    return "Strong synthetic fit because all derived needs are represented in the package notes.";
  }
  if (matchedCount > missingCount) {
    return "Moderate synthetic fit with several matches and a few review gaps.";
  }
  return "Limited synthetic fit because multiple derived needs are not represented.";
}

export function createHandoffReceipt(
  profile: BusinessProfile,
  contactMethod: ContactMethod,
  recommendation: QuoteRecommendation
): HandoffReceipt {
  return {
    id: `mock-${profile.id}-${recommendation.packageId}-${contactMethod}`,
    status: "mocked-not-sent",
    contactMethod,
    profileId: profile.id,
    packageId: recommendation.packageId,
    message:
      contactMethod === "none"
        ? "No contact preference recorded. Nothing was transmitted."
        : `Recorded ${contactMethod} as a mocked preference only. Nothing was transmitted.`
  };
}
