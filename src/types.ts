export type Trade = "cleaning" | "plumbing" | "handyman" | "landscaping";

export type ContactMethod = "email" | "phone" | "chat" | "none";

export interface BusinessOperations {
  worksAtClientSites: boolean;
  usesVehicles: boolean;
  storesTools: boolean;
  hiresSubcontractors: boolean;
  seasonalWork: boolean;
}

export interface BusinessProfile {
  id: string;
  displayName: string;
  trade: Trade;
  annualRevenue: number;
  employees: number;
  state: string;
  operations: BusinessOperations;
  priorities: string[];
}

export interface CoverageLine {
  code: string;
  label: string;
  limit: number;
  deductible: number;
  matchesNeeds: string[];
}

export interface MarketPackage {
  id: string;
  name: string;
  appetite: Trade[];
  baseMonthlyPremium: number;
  coverageLines: CoverageLine[];
  strengths: string[];
  cautions: string[];
}

export interface GuidanceTopic {
  id: string;
  aliases: string[];
  title: string;
  summary: string;
  considerations: string[];
  suggestedData: string[];
}

export interface SeedData {
  profiles: BusinessProfile[];
  packages: MarketPackage[];
  guidanceTopics: GuidanceTopic[];
}

export interface DerivedNeed {
  code: string;
  label: string;
  reason: string;
}

export interface QuoteRecommendation {
  rank: number;
  packageId: string;
  packageName: string;
  score: number;
  monthlyPremium: number;
  annualPremium: number;
  matchedNeeds: DerivedNeed[];
  missingNeeds: DerivedNeed[];
  strengths: string[];
  cautions: string[];
  fitSummary: string;
  disclaimer: string;
}

export interface HandoffReceipt {
  id: string;
  status: "mocked-not-sent";
  contactMethod: ContactMethod;
  profileId: string;
  packageId: string;
  message: string;
}

export interface GuidanceAnswer {
  topicId: string;
  title: string;
  summary: string;
  considerations: string[];
  suggestedData: string[];
  disclaimer: string;
}
