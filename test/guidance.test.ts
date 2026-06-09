import assert from "node:assert/strict";
import test from "node:test";
import { loadSeedData } from "../src/data.js";
import { answerQuestion } from "../src/guidance.js";
import { OUTPUT_DISCLAIMER } from "../src/quoteEngine.js";

test("answerQuestion matches claim-related questions", () => {
  const { guidanceTopics } = loadSeedData();
  const answer = answerQuestion("What should I collect after property damage for a claim?", guidanceTopics);

  assert.equal(answer.topicId, "claim-readiness");
  assert.match(answer.summary, /claim decisions/);
  assert.equal(answer.disclaimer, OUTPUT_DISCLAIMER);
});

test("answerQuestion falls back for unknown questions", () => {
  const { guidanceTopics } = loadSeedData();
  const answer = answerQuestion("Can this software schedule my office furniture delivery?", guidanceTopics);

  assert.equal(answer.topicId, "general-orientation");
  assert.match(answer.summary, /cannot answer regulated coverage questions/);
});
