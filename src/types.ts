export type ChannelMode = "chat" | "email" | "portal" | "internal";
export type LeadStage = "new" | "qualified" | "review" | "handoff" | "closed";
export type Priority = "low" | "medium" | "high";
export type RoleId = "sales-ops" | "licensed-producer" | "compliance-reviewer";

export interface Channel {
  id: string;
  label: string;
  mode: ChannelMode;
  allowedIntents: string[];
}

export interface Role {
  id: RoleId;
  label: string;
  canApproveRegulatedLanguage: boolean;
  canSendMockedOutreach: boolean;
}

export interface ReviewPolicy {
  licensedReviewRequired: boolean;
  blockedActions: string[];
  approvalRoles: RoleId[];
}

export interface DistributorProfile {
  id: string;
  name: string;
  market: string;
  jurisdictions: string[];
  reviewPolicy: ReviewPolicy;
  channels: Channel[];
  roles: Role[];
}

export interface Lead {
  id: string;
  companyName: string;
  segment: "consumer" | "small-commercial";
  sourceChannel: string;
  jurisdiction: string;
  buyerIntent: string;
  stage: LeadStage;
  priority: Priority;
  riskFlags: string[];
  missingFields: string[];
  assignedRole: RoleId;
  consent: "demo-consent-only";
}

export interface Objection {
  id: string;
  signals: string[];
  safeResponse: string;
  requiredReview: RoleId;
}

export interface SeedData {
  distributor: DistributorProfile;
  leads: Lead[];
  objections: Objection[];
}

export interface OnboardingSummary {
  distributorName: string;
  channelCount: number;
  jurisdictionCount: number;
  regulatedActionPolicy: string;
  reviewRoles: RoleId[];
  disclaimer: string;
}

export interface Task {
  id: string;
  leadId: string;
  ownerRole: RoleId;
  status: "blocked" | "ready" | "needs-review";
  title: string;
  reason: string;
}

export interface LeadWorkspace {
  lead: Lead;
  tasks: Task[];
  nextStatus: LeadStage;
  complianceWarnings: string[];
  disclaimer: string;
}

export interface CampaignPlan {
  channelId: string;
  channelLabel: string;
  audienceLeadIds: string[];
  objective: string;
  draftSteps: string[];
  blockedActions: string[];
  requiresLicensedReview: boolean;
  disclaimer: string;
}

export interface ScriptResponse {
  objectionId: string;
  response: string;
  requiredReview: RoleId;
  allowedForRole: boolean;
  disclaimer: string;
}

export interface ComplianceCheck {
  action: string;
  allowed: boolean;
  requiredReviewRoles: RoleId[];
  reasons: string[];
  disclaimer: string;
}

export interface MockReceipt {
  id: string;
  integration: "crm" | "email" | "chat";
  status: "mocked-not-sent";
  leadId: string;
  message: string;
  disclaimer: string;
}
