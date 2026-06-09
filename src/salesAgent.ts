import type {
  CampaignPlan,
  ComplianceCheck,
  DistributorProfile,
  HandoffQueue,
  Lead,
  LeadStage,
  LeadWorkspace,
  MockReceipt,
  OnboardingSummary,
  RoleId,
  ScriptPrompt,
  ScriptQaResult,
  IntakeChecklist,
  Task
} from "./types.js";

export const SAFETY_DISCLAIMER =
  "Clean-room non-regulated distribution workflow demo only: synthetic leads/accounts and mocked integrations. No insurance advice, quoting, underwriting, binding, brokerage, eligibility decisions, real outreach, lead scraping, credential collection, or regulated selling. Licensed-professional and compliance review are required before any real use.";

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
      reason: "Lead contains product-selection, transaction, handoff, or jurisdiction-sensitive language."
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
    objective: channel.mode === "internal" ? "Summarize and route work for review." : "Draft operational, consent-based workflow steps for synthetic leads.",
    draftSteps: [
      "Confirm demo consent and synthetic lead source.",
      "Use operational language only; avoid product selection, advice, or eligibility conclusions.",
      "Route regulated phrases to a licensed producer or compliance reviewer.",
      `Keep activity local; ${channel.label} integration is mocked.`
    ],
    blockedActions: distributor.reviewPolicy.blockedActions,
    requiresLicensedReview: regulatedAudience.length > 0 || distributor.reviewPolicy.licensedReviewRequired,
    disclaimer: SAFETY_DISCLAIMER
  };
}

export function buildIntakeChecklist(lead: Lead): IntakeChecklist {
  return {
    leadId: lead.id,
    accountName: lead.companyName,
    checklistItems: [
      "Confirm synthetic source channel and demo consent marker.",
      "Capture preferred contact window without sending outreach.",
      "Collect account operations facts only as intake fields.",
      "Route product-selection, pricing, or transaction requests to the handoff queue.",
      "Do not decide eligibility or suggest insurance products."
    ],
    missingFields: lead.missingFields,
    decisionBoundary: "Checklist captures facts for routing only; it does not decide eligibility or produce regulated outputs.",
    disclaimer: SAFETY_DISCLAIMER
  };
}

export function buildHandoffQueue(distributor: DistributorProfile, leads: Lead[]): HandoffQueue {
  const items = leads
    .filter((lead) => lead.stage === "handoff" || lead.riskFlags.some((flag) => isRegulatedSignal(flag)) || lead.assignedRole !== "sales-ops")
    .map((lead) => ({
      leadId: lead.id,
      accountName: lead.companyName,
      priority: lead.priority,
      assignedRole: lead.assignedRole,
      reasons: buildComplianceWarnings(distributor, lead),
      status: "queued-for-human-review" as const
    }));

  return {
    items,
    disclaimer: SAFETY_DISCLAIMER
  };
}

export function qaScript(text: string, scriptPrompts: ScriptPrompt[], role: RoleId): ScriptQaResult {
  const normalizedText = text.toLowerCase();
  const prompt =
    scriptPrompts.find((candidate) => candidate.signals.some((signal) => normalizedText.includes(signal))) ?? {
      id: "general-safe-response",
      signals: [],
      safeResponse:
        "I can collect operational context and prepare a neutral routing summary. I cannot provide insurance advice, pricing, product selection, or eligibility decisions.",
      requiredReview: "licensed-producer" as RoleId
    };
  const bannedTermHits = bannedTerms().filter((term) => normalizedText.includes(term));

  return {
    promptId: prompt.id,
    response: prompt.safeResponse,
    requiredReview: prompt.requiredReview,
    allowedForRole: bannedTermHits.length === 0 && (role === prompt.requiredReview || role === "compliance-reviewer"),
    bannedTermHits,
    disclaimer: SAFETY_DISCLAIMER
  };
}

export function checkCompliance(distributor: DistributorProfile, action: string, role: RoleId): ComplianceCheck {
  const normalizedAction = normalizeGuardrailText(action);
  const blockedMatches = distributor.reviewPolicy.blockedActions.filter((blocked) => normalizedAction.includes(normalizeGuardrailText(blocked)));
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
  return bannedTerms().some((term) => normalized.includes(term)) || ["product selection", "handoff", "jurisdiction", "credential"].some((term) => normalized.includes(term));
}

function bannedTerms(): string[] {
  return ["advice", "quote", "quoting", "bind", "binding", "policy", "eligibility", "underwrite", "underwriting", "brokerage", "credential"];
}

function normalizeGuardrailText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
