import { readFileSync } from "node:fs";

const forbiddenTrackedFiles = [
  ["data", "business-profiles.json"].join("/"),
  ["data", "market-packages.json"].join("/"),
  ["data", "guidance-topics.json"].join("/"),
  ["data", ["objection", "s.json"].join("")].join("/"),
  ["src", ["quote", "Engine.ts"].join("")].join("/"),
  ["src", "guidance.ts"].join("/"),
  ["test", ["quote", "Engine.test.ts"].join("")].join("/"),
  ["test", "guidance.test.ts"].join("/")
];

const requiredFiles = ["README.md", "PLAN.md"];
const requiredPhrases = [
  "clean-room",
  "synthetic",
  "mocked",
  "not an insurance product",
  "does not provide insurance advice, quoting, underwriting, binding, brokerage, eligibility decisions",
  "licensed-professional"
];

const forbiddenImplementationPhrases = [
  ["quote", "comparison"].join(" "),
  ["coverage", "guide"].join(" "),
  ["coverage", "recommendation"].join(" "),
  ["carrier", "package"].join(" "),
  ["package", "ranking"].join(" "),
  ["claims", "advice"].join(" "),
  ["claim", "readiness"].join(" "),
  ["market", "packages"].join(" "),
  ["business", "profiles"].join(" "),
  ["what", "insurance", "your", "business", "needs"].join(" ")
];

for (const file of forbiddenTrackedFiles) {
  try {
    readFileSync(file, "utf8");
    console.error(`Forbidden old-scope file is still present: ${file}`);
    process.exit(1);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

const combinedText = requiredFiles.map((file) => readFileSync(file, "utf8")).join("\n").toLowerCase();
const missing = requiredPhrases.filter((phrase) => !combinedText.includes(phrase));

if (missing.length > 0) {
  console.error(`Missing required clean-room disclaimer phrases: ${missing.join(", ")}`);
  process.exit(1);
}

const forbiddenPhraseHits = forbiddenImplementationPhrases.filter((phrase) => combinedText.includes(phrase));
if (forbiddenPhraseHits.length > 0) {
  console.error(`Forbidden old quote/advice implementation phrases remain: ${forbiddenPhraseHits.join(", ")}`);
  process.exit(1);
}

const seedText = ["data/distributor.json", "data/leads.json", "data/script-prompts.json"]
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
