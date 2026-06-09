import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DistributorProfile, Lead, Objection, SeedData } from "./types.js";

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), relativePath), "utf8")) as T;
}

export function loadSeedData(): SeedData {
  return {
    distributor: readJson<DistributorProfile>("data/distributor.json"),
    leads: readJson<Lead[]>("data/leads.json"),
    objections: readJson<Objection[]>("data/objections.json")
  };
}

export function findLead(leads: Lead[], leadId: string): Lead {
  const lead = leads.find((candidate) => candidate.id === leadId);
  if (!lead) {
    throw new Error(`Unknown lead "${leadId}". Available leads: ${leads.map((candidate) => candidate.id).join(", ")}`);
  }
  return lead;
}
