#!/usr/bin/env node
import { findProfile, loadSeedData } from "./data.js";
import { formatDemo, formatGuidance, formatProfiles, formatQuote } from "./format.js";
import { answerQuestion } from "./guidance.js";
import { comparePackages, createHandoffReceipt } from "./quoteEngine.js";
import type { ContactMethod } from "./types.js";

function main(argv: string[]): void {
  const [command = "help", ...args] = argv;
  const seedData = loadSeedData();
  const json = args.includes("--json");

  try {
    if (command === "profiles") {
      write(json ? seedData.profiles : formatProfiles(seedData.profiles), json);
      return;
    }

    if (command === "quote") {
      const profileId = args.find((arg) => !arg.startsWith("--"));
      if (!profileId) {
        throw new Error("Usage: coverage-guide-demo quote <profile-id> [--contact email|phone|chat|none] [--json]");
      }
      const profile = findProfile(seedData.profiles, profileId);
      const recommendations = comparePackages(profile, seedData.packages);
      const contactMethod = readContactMethod(args);
      const handoff = createHandoffReceipt(profile, contactMethod, recommendations[0]);
      write(json ? { profile, recommendations, handoff } : formatQuote(profile, recommendations, handoff), json);
      return;
    }

    if (command === "ask") {
      const question = args.filter((arg) => arg !== "--json").join(" ").trim();
      if (!question) {
        throw new Error("Usage: coverage-guide-demo ask <question> [--json]");
      }
      const answer = answerQuestion(question, seedData.guidanceTopics);
      write(json ? answer : formatGuidance(answer), json);
      return;
    }

    if (command === "demo") {
      const profile = findProfile(seedData.profiles, "riverbend-cleaning");
      const recommendations = comparePackages(profile, seedData.packages);
      const answer = answerQuestion("what should I know before filing a claim", seedData.guidanceTopics);
      write(json ? { profile, recommendations, answer } : formatDemo(profile, recommendations, answer), json);
      return;
    }

    write(helpText(), false);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

function readContactMethod(args: string[]): ContactMethod {
  const contactIndex = args.indexOf("--contact");
  const value = contactIndex >= 0 ? args[contactIndex + 1] : "none";
  if (value === "email" || value === "phone" || value === "chat" || value === "none") {
    return value;
  }
  throw new Error("Contact method must be one of: email, phone, chat, none");
}

function write(value: unknown, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }
  console.log(String(value));
}

function helpText(): string {
  return [
    "Coverage Guide Demo",
    "",
    "Commands:",
    "  demo                                      Run a deterministic demo",
    "  profiles                                  List synthetic profiles",
    "  quote <profile-id> [--contact method]     Compare synthetic packages",
    "  ask <question>                            Show educational guidance",
    "",
    "Options:",
    "  --json                                    Print JSON output",
    "  --contact email|phone|chat|none           Record a mocked handoff preference"
  ].join("\n");
}

main(process.argv.slice(2));
