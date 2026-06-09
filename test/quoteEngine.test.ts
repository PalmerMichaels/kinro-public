import assert from "node:assert/strict";
import test from "node:test";
import { findProfile, loadSeedData } from "../src/data.js";
import { comparePackages, createHandoffReceipt, deriveNeeds, OUTPUT_DISCLAIMER } from "../src/quoteEngine.js";

test("deriveNeeds maps profile operations to review needs", () => {
  const { profiles } = loadSeedData();
  const profile = findProfile(profiles, "copperline-plumbing");
  const needs = deriveNeeds(profile).map((need) => need.code);

  assert.ok(needs.includes("vehicle-exposure"));
  assert.ok(needs.includes("employee-injury-planning"));
  assert.ok(needs.includes("subcontractor-controls"));
  assert.ok(needs.includes("higher-liability-limit"));
});

test("comparePackages returns ranked deterministic synthetic recommendations", () => {
  const { profiles, packages: marketPackages } = loadSeedData();
  const profile = findProfile(profiles, "sage-hill-landscaping");
  const recommendations = comparePackages(profile, marketPackages);

  assert.equal(recommendations.length, marketPackages.length);
  assert.equal(recommendations[0].rank, 1);
  assert.ok(recommendations[0].score >= recommendations[1].score);
  assert.equal(recommendations[0].disclaimer, OUTPUT_DISCLAIMER);
  assert.ok(recommendations.some((recommendation) => recommendation.missingNeeds.length > 0));
});

test("handoff receipts are explicitly mocked and not transmitted", () => {
  const { profiles, packages: marketPackages } = loadSeedData();
  const profile = findProfile(profiles, "riverbend-cleaning");
  const [recommendation] = comparePackages(profile, marketPackages);
  const receipt = createHandoffReceipt(profile, "email", recommendation);

  assert.equal(receipt.status, "mocked-not-sent");
  assert.match(receipt.message, /Nothing was transmitted/);
});
