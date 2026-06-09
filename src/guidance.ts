import type { GuidanceAnswer, GuidanceTopic } from "./types.js";
import { OUTPUT_DISCLAIMER } from "./quoteEngine.js";

const FALLBACK_TOPIC: GuidanceTopic = {
  id: "general-orientation",
  aliases: [],
  title: "General Orientation",
  summary:
    "This clean-room demo can organize common insurance questions, but it cannot answer regulated coverage questions or decide what a business should buy.",
  considerations: [
    "Use the quote flow to see synthetic package comparisons.",
    "Use specific topics such as coverage, quote, certificate, or claim for a closer educational match.",
    "Contact a licensed professional for real-world decisions."
  ],
  suggestedData: ["business trade", "operations", "employee count", "current policy documents"]
};

export function answerQuestion(question: string, topics: GuidanceTopic[]): GuidanceAnswer {
  const normalizedQuestion = question.toLowerCase();
  const topic =
    topics.find((candidate) => candidate.aliases.some((alias) => normalizedQuestion.includes(alias))) ?? FALLBACK_TOPIC;

  return {
    topicId: topic.id,
    title: topic.title,
    summary: topic.summary,
    considerations: topic.considerations,
    suggestedData: topic.suggestedData,
    disclaimer: OUTPUT_DISCLAIMER
  };
}
