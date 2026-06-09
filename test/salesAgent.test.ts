import assert from "node:assert/strict";
import test from "node:test";
import { findLead, loadSeedData } from "../src/data.js";
import { buildLeadWorkspace, checkCompliance, handleObjection, mockIntegration, onboardDistributor, planCampaign, SAFETY_DISCLAIMER } from "../src/salesAgent.js";

test("onboarding exposes channels, review roles, and safety disclaimer", () => {
  const { distributor } = loadSeedData();
  const summary = onboardDistributor(distributor);

  assert.equal(summary.channelCount, 4);
  assert.ok(summary.reviewRoles.includes("licensed-producer"));
  assert.equal(summary.disclaimer, SAFETY_DISCLAIMER);
});

test("lead workspace creates role-aware review tasks for regulated signals", () => {
  const { distributor, leads } = loadSeedData();
  const workspace = buildLeadWorkspace(distributor, findLead(leads, "lead-1001"));

  assert.equal(workspace.nextStatus, "review");
  assert.ok(workspace.tasks.some((task) => task.ownerRole === "licensed-producer"));
  assert.ok(workspace.complianceWarnings.some((warning) => warning.includes("recommendation")));
});

test("campaign planner keeps channel activity mocked and review-gated", () => {
  const { distributor, leads } = loadSeedData();
  const plan = planCampaign(distributor, leads, "web-chat");

  assert.equal(plan.channelId, "web-chat");
  assert.equal(plan.requiresLicensedReview, true);
  assert.ok(plan.blockedActions.includes("quote"));
  assert.ok(plan.draftSteps.some((step) => step.includes("mocked")));
});

test("objection handling blocks non-approved sales ops role from regulated response", () => {
  const { objections } = loadSeedData();
  const response = handleObjection("The price is too expensive", objections, "sales-ops");

  assert.equal(response.objectionId, "price-too-high");
  assert.equal(response.allowedForRole, false);
  assert.match(response.response, /cannot recommend/);
});

test("compliance check blocks quote actions for sales ops", () => {
  const { distributor } = loadSeedData();
  const check = checkCompliance(distributor, "quote and bind", "sales-ops");

  assert.equal(check.allowed, false);
  assert.ok(check.reasons.some((reason) => reason.includes("quote")));
});

test("mock integrations never send data", () => {
  const { leads } = loadSeedData();
  const receipt = mockIntegration("email", findLead(leads, "lead-1002"));

  assert.equal(receipt.status, "mocked-not-sent");
  assert.match(receipt.message, /no data was transmitted/i);
});
