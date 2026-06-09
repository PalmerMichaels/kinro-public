import type {
  CampaignPlan,
  ComplianceCheck,
  DistributorProfile,
  Lead,
  LeadStage,
  LeadWorkspace,
  MockReceipt,
  Objection,
  OnboardingSummary,
  RoleId,
  ScriptResponse,
  Task
} from "./types.js";

export const SAFETY_DISCLAIMER =
  "Clean-room non-regulated demo only: synthetic leads, mocked integrations, no insurance advice, quoting, underwriting, binding, brokerage, eligibility decisions, lead scraping, credential collection, real outreach, or regulated selling. Licensed-professional review is required before any real use.";

export function onboardDistributor(distributor: DistributorProfile): OnboardingSummary {
  return {
    distributorName: distributor.name,
    channelCount: distributor.channels.length,
    jurisdictionCount: distributor.jurisdictions.length,
    regulatedActionPolicy: `Blocked actions: ${distributor.reviewPolicy.blockedActions.join(", ")}`,
    reviewRoles: distributor.reviewPolicy.approvalRoles,
    disclaimer: SAFETY_DISCLAIMER
  };
}

export function buildLeadWorkspace(distributor: DistributorProfile, lead: Lead): LeadWorkspace {
  const tasks: Task[] = [
    {
      id: `${lead.id}-intake-gaps`,
      leadId: lead.id,
      ownerRole: lead.assignedRole,
      status: lead.missingFields.length > 0 ? "ready" : "needs-review",
      title: "Resolve synthetic intake gaps",
      reason: lead.missingFields.length > 0 ? lead.missingFields.join(", ") : "No missing fields; prepare review summary."
    },
    {
      id: `${lead.id}-compliance-check`,
      leadId: lead.id,
      ownerRole: lead.riskFlags.some((flag) => isRegulatedSignal(flag)) ? "compliance-reviewer" : "sales-ops",
      status: lead.riskFlags.some((flag) => isRegulatedSignal(flag)) ? "needs-review" : "ready",
      title: "Run compliance checklist",
      reason: lead.riskFlags.join(", ") || "No risk flags."
    }
  ];

  if (lead.stage === "handoff" || lead.riskFlags.some((flag) => isRegulatedSignal(flag))) {
    tasks.push({
      id: `${lead.id}-licensed-handoff`,
      leadId: lead.id,
      ownerRole: "licensed-producer",
      status: "needs-review",
      title: "Prepare licensed-professional handoff",
      reason: "Lead contains recommendation, quote, binding, certificate, or jurisdiction-sensitive language."
    });
  }

  return {
    lead,
    tasks,
    nextStatus: calculateNextStatus(lead, tasks),
    complianceWarnings: buildComplianceWarnings(distributor, lead),
    disclaimer: SAFETY_DISCLAIMER
  };
}

export function planCampaign(distributor: DistributorProfile, leads: Lead[], channelId: string): CampaignPlan {
  const channel = distributor.channels.find((candidate) => candidate.id === channelId);
  if (!channel) {
    throw new Error(`Unknown channel "${channelId}". Available channels: ${distributor.channels.map((item) => item.id).join(", ")}`);
  }

  const audience = leads.filter((lead) => lead.sourceChannel === channelId || lead.stage === "qualified");
  const regulatedAudience = audience.filter((lead) => lead.riskFlags.some((flag) => isRegulatedSignal(flag)));

  return {
    channelId: channel.id,
    channelLabel: channel.label,
    audienceLeadIds: audience.map((lead) => lead.id),
    objective: channel.mode === "internal" ? "Summarize and route work for licensed review." : "Draft educational, consent-based follow-up for synthetic leads.",
    draftSteps: [
      "Confirm demo consent and synthetic lead source.",
      "Use educational language only; avoid product recommendations or eligibility conclusions.",
      "Route regulated phrases to a licensed producer or compliance reviewer.",
      `Keep activity local; ${channel.label} integration is mocked.`
    ],
    blockedActions: distributor.reviewPolicy.blockedActions,
    requiresLicensedReview: regulatedAudience.length > 0 || distributor.reviewPolicy.licensedReviewRequired,
    disclaimer: SAFETY_DISCLAIMER
  };
}

export function handleObjection(text: string, objections: Objection[], role: RoleId): ScriptResponse {
  const normalizedText = text.toLowerCase();
  const objection =
    objections.find((candidate) => candidate.signals.some((signal) => normalizedText.includes(signal))) ?? {
      id: "general-safe-response",
      signals: [],
      safeResponse:
        "I can collect context and prepare a neutral summary for review. I cannot recommend, quote, bind, or decide eligibility.",
      requiredReview: "licensed-producer" as RoleId
    };

  return {
    objectionId: objection.id,
    response: objection.safeResponse,
    requiredReview: objection.requiredReview,
    allowedForRole: role === objection.requiredReview || role === "compliance-reviewer",
    disclaimer: SAFETY_DISCLAIMER
  };
}

export function checkCompliance(distributor: DistributorProfile, action: string, role: RoleId): ComplianceCheck {
  const normalizedAction = action.toLowerCase();
  const blockedMatches = distributor.reviewPolicy.blockedActions.filter((blocked) => normalizedAction.includes(blocked));
  const roleCanApprove = distributor.reviewPolicy.approvalRoles.includes(role);
  const allowed = blockedMatches.length === 0 || roleCanApprove;
  const reasons = blockedMatches.length === 0
    ? ["Action does not match the configured blocked regulated action list."]
    : [`Action matched blocked regulated terms: ${blockedMatches.join(", ")}.`, `Role ${role} ${roleCanApprove ? "can" : "cannot"} approve regulated language in this demo.`];

  return {
    action,
    allowed,
    requiredReviewRoles: distributor.reviewPolicy.approvalRoles,
    reasons,
    disclaimer: SAFETY_DISCLAIMER
  };
}

export function mockIntegration(integration: MockReceipt["integration"], lead: Lead): MockReceipt {
  return {
    id: `mock-${integration}-${lead.id}`,
    integration,
    status: "mocked-not-sent",
    leadId: lead.id,
    message: `Prepared a local ${integration} receipt for ${lead.companyName}; no data was transmitted.`,
    disclaimer: SAFETY_DISCLAIMER
  };
}

function buildComplianceWarnings(distributor: DistributorProfile, lead: Lead): string[] {
  const warnings = [];
  if (!distributor.jurisdictions.includes(lead.jurisdiction)) {
    warnings.push("Lead jurisdiction is not enabled in the synthetic onboarding profile.");
  }
  if (lead.consent !== "demo-consent-only") {
    warnings.push("Lead is missing demo consent marker.");
  }
  for (const flag of lead.riskFlags) {
    if (isRegulatedSignal(flag)) {
      warnings.push(`Regulated-review signal: ${flag}.`);
    }
  }
  return warnings;
}

function calculateNextStatus(lead: Lead, tasks: Task[]): LeadStage {
  if (tasks.some((task) => task.status === "needs-review")) {
    return "review";
  }
  if (lead.missingFields.length > 0) {
    return "qualified";
  }
  return "handoff";
}

function isRegulatedSignal(value: string): boolean {
  const normalized = value.toLowerCase();
  return ["recommendation", "quote", "bind", "coverage", "certificate", "policy", "eligibility", "jurisdiction"].some((term) =>
    normalized.includes(term)
  );
}
