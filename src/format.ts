import type { BusinessProfile, GuidanceAnswer, HandoffReceipt, QuoteRecommendation } from "./types.js";
import { OUTPUT_DISCLAIMER, deriveNeeds } from "./quoteEngine.js";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export function formatProfiles(profiles: BusinessProfile[]): string {
  const lines = [OUTPUT_DISCLAIMER, "", "Synthetic business profiles:"];
  for (const profile of profiles) {
    lines.push(
      `- ${profile.id}: ${profile.displayName} (${profile.trade}, ${profile.employees} employees, ${profile.state})`
    );
  }
  return lines.join("\n");
}

export function formatQuote(profile: BusinessProfile, recommendations: QuoteRecommendation[], handoff?: HandoffReceipt): string {
  const lines = [
    OUTPUT_DISCLAIMER,
    "",
    `Synthetic quote comparison for ${profile.displayName}`,
    `Trade: ${profile.trade} | State: ${profile.state} | Revenue: ${moneyFormatter.format(profile.annualRevenue)} | Employees: ${profile.employees}`,
    "",
    "Derived review needs:"
  ];

  for (const need of deriveNeeds(profile)) {
    lines.push(`- ${need.label}: ${need.reason}`);
  }

  lines.push("", "Ranked synthetic packages:");
  for (const recommendation of recommendations.slice(0, 3)) {
    const missing = recommendation.missingNeeds.map((need) => need.label).join(", ") || "none flagged";
    lines.push(
      `${recommendation.rank}. ${recommendation.packageName} (${recommendation.score}/100) - ${moneyFormatter.format(
        recommendation.monthlyPremium
      )}/mo`,
      `   Fit: ${recommendation.fitSummary}`,
      `   Missing review areas: ${missing}`,
      `   Notes: ${recommendation.strengths.join("; ")}`
    );
  }

  if (handoff) {
    lines.push("", "Mocked handoff:", `- ${handoff.message}`, `- Receipt: ${handoff.id}`);
  }

  return lines.join("\n");
}

export function formatGuidance(answer: GuidanceAnswer): string {
  const lines = [answer.disclaimer, "", answer.title, answer.summary, "", "Considerations:"];
  for (const consideration of answer.considerations) {
    lines.push(`- ${consideration}`);
  }
  lines.push("", `Helpful data to gather: ${answer.suggestedData.join(", ")}`);
  return lines.join("\n");
}

export function formatDemo(profile: BusinessProfile, recommendations: QuoteRecommendation[], answer: GuidanceAnswer): string {
  return [
    formatQuote(profile, recommendations),
    "",
    "---",
    "",
    "Sample guidance response:",
    formatGuidance(answer)
  ].join("\n");
}
