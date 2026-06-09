import type { CampaignPlan, ComplianceCheck, IntakeChecklist, LeadWorkspace, MockReceipt, OnboardingSummary, ScriptQaResult } from "./types.js";

export function formatOnboarding(summary: OnboardingSummary): string {
  return [
    summary.disclaimer,
    "",
    `Onboarded synthetic distributor: ${summary.distributorName}`,
    `Channels configured: ${summary.channelCount}`,
    `Jurisdictions configured: ${summary.jurisdictionCount}`,
    summary.regulatedActionPolicy,
    `Review roles: ${summary.reviewRoles.join(", ")}`
  ].join("\n");
}

export function formatWorkspace(workspace: LeadWorkspace): string {
  const lines = [
    workspace.disclaimer,
    "",
    `Lead workspace: ${workspace.lead.companyName} (${workspace.lead.id})`,
    `Stage: ${workspace.lead.stage} -> suggested next status: ${workspace.nextStatus}`,
    `Assigned role: ${workspace.lead.assignedRole}`,
    `Buyer intent: ${workspace.lead.buyerIntent}`,
    "",
    "Tasks:"
  ];
  for (const task of workspace.tasks) {
    lines.push(`- ${task.status}: ${task.title} [${task.ownerRole}] - ${task.reason}`);
  }
  lines.push("", "Compliance warnings:");
  for (const warning of workspace.complianceWarnings.length > 0 ? workspace.complianceWarnings : ["No warnings flagged."]) {
    lines.push(`- ${warning}`);
  }
  return lines.join("\n");
}

export function formatCampaign(plan: CampaignPlan): string {
  const lines = [
    plan.disclaimer,
    "",
    `Campaign plan: ${plan.channelLabel}`,
    `Audience leads: ${plan.audienceLeadIds.join(", ") || "none"}`,
    `Objective: ${plan.objective}`,
    `Requires licensed review: ${plan.requiresLicensedReview ? "yes" : "no"}`,
    "",
    "Draft steps:"
  ];
  for (const step of plan.draftSteps) {
    lines.push(`- ${step}`);
  }
  lines.push("", `Blocked actions: ${plan.blockedActions.join(", ")}`);
  return lines.join("\n");
}

export function formatIntake(checklist: IntakeChecklist): string {
  return [
    checklist.disclaimer,
    "",
    `Eligibility-safe intake checklist: ${checklist.accountName} (${checklist.leadId})`,
    `Decision boundary: ${checklist.decisionBoundary}`,
    "",
    "Checklist items:",
    ...checklist.checklistItems.map((item) => `- ${item}`),
    "",
    `Missing fields: ${checklist.missingFields.join(", ") || "none"}`
  ].join("\n");
}

export function formatScript(response: ScriptQaResult): string {
  return [
    response.disclaimer,
    "",
    `Script QA prompt: ${response.promptId}`,
    `Required review: ${response.requiredReview}`,
    `Allowed for selected role: ${response.allowedForRole ? "yes" : "no"}`,
    `Banned term hits: ${response.bannedTermHits.join(", ") || "none"}`,
    "",
    response.response
  ].join("\n");
}

export function formatCompliance(check: ComplianceCheck): string {
  const lines = [
    check.disclaimer,
    "",
    `Action: ${check.action}`,
    `Allowed in demo for selected role: ${check.allowed ? "yes" : "no"}`,
    `Review roles: ${check.requiredReviewRoles.join(", ")}`,
    "",
    "Reasons:"
  ];
  for (const reason of check.reasons) {
    lines.push(`- ${reason}`);
  }
  return lines.join("\n");
}

export function formatReceipt(receipt: MockReceipt): string {
  return [receipt.disclaimer, "", `Mocked ${receipt.integration} receipt: ${receipt.id}`, receipt.message, `Status: ${receipt.status}`].join("\n");
}

export function formatDemo(parts: string[]): string {
  return parts.join("\n\n---\n\n");
}
