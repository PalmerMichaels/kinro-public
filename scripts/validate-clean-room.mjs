import { readFileSync } from "node:fs";

const requiredFiles = ["README.md", "PLAN.md"];
const requiredPhrases = [
  "clean-room",
  "synthetic",
  "mocked",
  "not an insurance product",
  "does not provide insurance, legal, financial, underwriting, or claims advice"
];

const combinedText = requiredFiles.map((file) => readFileSync(file, "utf8")).join("\n").toLowerCase();
const missing = requiredPhrases.filter((phrase) => !combinedText.includes(phrase));

if (missing.length > 0) {
  console.error(`Missing required clean-room disclaimer phrases: ${missing.join(", ")}`);
  process.exit(1);
}

const packageText = readFileSync("data/market-packages.json", "utf8").toLowerCase();
const blockedTerms = ["attune", "hiscox", "coterie", "hanover", "biberk", "next insurance", "simply business"];
const blockedHits = blockedTerms.filter((term) => packageText.includes(term));

if (blockedHits.length > 0) {
  console.error(`Synthetic market data contains real carrier-like names: ${blockedHits.join(", ")}`);
  process.exit(1);
}

console.log("Clean-room validation passed.");
