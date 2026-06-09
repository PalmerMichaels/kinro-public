import { readFileSync } from "node:fs";

const requiredFiles = ["README.md", "PLAN.md"];
const requiredPhrases = [
  "clean-room",
  "synthetic",
  "mocked",
  "not an insurance product",
  "does not provide insurance advice, quoting, underwriting, binding, brokerage, eligibility decisions",
  "licensed-professional"
];

const combinedText = requiredFiles.map((file) => readFileSync(file, "utf8")).join("\n").toLowerCase();
const missing = requiredPhrases.filter((phrase) => !combinedText.includes(phrase));

if (missing.length > 0) {
  console.error(`Missing required clean-room disclaimer phrases: ${missing.join(", ")}`);
  process.exit(1);
}

const seedText = ["data/distributor.json", "data/leads.json", "data/objections.json"]
  .map((file) => readFileSync(file, "utf8"))
  .join("\n")
  .toLowerCase();
const blockedTerms = ["attune", "hiscox", "coterie", "hanover", "biberk", "next insurance", "simply business", "gmail", "salesforce.com", "hubspot.com"];
const blockedHits = blockedTerms.filter((term) => seedText.includes(term));

if (blockedHits.length > 0) {
  console.error(`Synthetic seed data contains real carrier or integration-like names: ${blockedHits.join(", ")}`);
  process.exit(1);
}

console.log("Clean-room validation passed.");
