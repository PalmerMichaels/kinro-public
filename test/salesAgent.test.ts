import assert from "node:assert/strict";
import test from "node:test";
import { findLead, loadSeedData } from "../src/data.js";
import { buildIntakeChecklist, buildLeadWorkspace, checkCompliance, mockIntegration, onboardDistributor, planCampaign, qaScript, SAFETY_DISCLAIMER } from "../src/salesAgent.js";

test("onboarding exposes channels, review roles, and safety disclaimer", () => {
  const { distributor } = loadSeedData();
  const summary = onboardDistributor(distributor);

  assert.equal(summary.channelCount, 5);
  assert.ok(summary.reviewRoles.includes("licensed-producer"));
  assert.equal(summary.disclaimer, SAFETY_DISCLAIMER);
});

test("lead workspace creates role-aware review tasks for regulated signals", () => {
  const { distributor, leads } = loadSeedData();
  const workspace = buildLeadWorkspace(distributor, findLead(leads, "lead-1001"));

  assert.equal(workspace.nextStatus, "review");
  assert.ok(workspace.tasks.some((task) => task.ownerRole === "licensed-producer"));
  assert.ok(workspace.complianceWarnings.some((warning) => warning.includes("product selection")));
});

test("campaign planner keeps channel activity mocked and review-gated", () => {
  const { distributor, leads } = loadSeedData();
  const plan = planCampaign(distributor, leads, "web-chat");

  assert.equal(plan.channelId, "web-chat");
  assert.equal(plan.requiresLicensedReview, true);
  assert.ok(plan.blockedActions.includes("real-outreach"));
  assert.ok(plan.draftSteps.some((step) => step.includes("mocked")));
});

test("eligibility-safe intake checklist captures facts without decisions", () => {
  const { leads } = loadSeedData();
  const checklist = buildIntakeChecklist(findLead(leads, "lead-1001"));

  assert.match(checklist.decisionBoundary, /does not decide eligibility/);
  assert.match(checklist.decisionBoundary, /does not .* produce regulated outputs/);
  assert.ok(checklist.checklistItems.some((item) => item.includes("Do not decide eligibility")));
});

test("script QA blocks non-approved sales ops role from sensitive script", () => {
  const { scriptPrompts } = loadSeedData();
  const response = qaScript("The buyer wants a human call today", scriptPrompts, "sales-ops");

  assert.equal(response.promptId, "human-handoff");
  assert.equal(response.allowedForRole, false);
  assert.match(response.response, /mocked review queue/);
});

test("script QA reports banned terms", () => {
  const { scriptPrompts } = loadSeedData();
  const response = qaScript("We can quote this policy", scriptPrompts, "compliance-reviewer");

  assert.ok(response.bannedTermHits.includes("quote"));
  assert.equal(response.allowedForRole, false);
});

test("compliance check blocks real outreach and credential collection for sales ops", () => {
  const { distributor } = loadSeedData();
  const check = checkCompliance(distributor, "send real outreach and collect credentials", "sales-ops");

  assert.equal(check.allowed, false);
  assert.ok(check.reasons.some((reason) => reason.includes("real-outreach")));
});

test("mock integrations never send data", () => {
  const { leads } = loadSeedData();
  const receipt = mockIntegration("carrier-style", findLead(leads, "lead-1002"));

  assert.equal(receipt.status, "mocked-not-sent");
  assert.match(receipt.message, /no data was transmitted/i);
});
