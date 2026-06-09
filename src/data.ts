import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { BusinessProfile, GuidanceTopic, MarketPackage, SeedData } from "./types.js";

function readJson<T>(relativePath: string): T {
  const absolutePath = join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
}

export function loadSeedData(): SeedData {
  return {
    profiles: readJson<BusinessProfile[]>("data/business-profiles.json"),
    packages: readJson<MarketPackage[]>("data/market-packages.json"),
    guidanceTopics: readJson<GuidanceTopic[]>("data/guidance-topics.json")
  };
}

export function findProfile(profiles: BusinessProfile[], profileId: string): BusinessProfile {
  const profile = profiles.find((candidate) => candidate.id === profileId);
  if (!profile) {
    const available = profiles.map((candidate) => candidate.id).join(", ");
    throw new Error(`Unknown profile "${profileId}". Available profiles: ${available}`);
  }
  return profile;
}
