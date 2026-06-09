#!/usr/bin/env node
import { findLead, loadSeedData } from "./data.js";
import { formatCampaign, formatCompliance, formatDemo, formatHandoffQueue, formatIntake, formatOnboarding, formatReceipt, formatScript, formatWorkspace } from "./format.js";
import { buildHandoffQueue, buildIntakeChecklist, buildLeadWorkspace, checkCompliance, mockIntegration, onboardDistributor, planCampaign, qaScript } from "./salesAgent.js";
import type { MockReceipt, RoleId } from "./types.js";

function main(argv: string[]): void {
  const [command = "help", ...args] = argv;
  const seed = loadSeedData();
  const json = args.includes("--json");

  try {
    if (command === "onboard") {
      write(onboardDistributor(seed.distributor), json, formatOnboarding);
      return;
    }

    if (command === "leads") {
      write(seed.leads, json, (leads) => leads.map((lead) => `${lead.id}: ${lead.companyName} [${lead.stage}, ${lead.assignedRole}]`).join("\n"));
      return;
    }

    if (command === "workspace") {
      const lead = findLead(seed.leads, requiredArg(args, "lead-id"));
      write(buildLeadWorkspace(seed.distributor, lead), json, formatWorkspace);
      return;
    }

    if (command === "campaign") {
      write(planCampaign(seed.distributor, seed.leads, requiredArg(args, "channel-id")), json, formatCampaign);
      return;
    }

    if (command === "intake") {
      const lead = findLead(seed.leads, requiredArg(args, "lead-id"));
      write(buildIntakeChecklist(lead), json, formatIntake);
      return;
    }

    if (command === "handoff") {
      write(buildHandoffQueue(seed.distributor, seed.leads), json, formatHandoffQueue);
      return;
    }

    if (command === "script") {
      const role = readRole(args);
      const text = args.filter((arg) => !arg.startsWith("--") && !isRoleValue(arg)).join(" ");
      write(qaScript(text || "general", seed.scriptPrompts, role), json, formatScript);
      return;
    }

    if (command === "compliance") {
      const role = readRole(args);
      const action = args.filter((arg) => !arg.startsWith("--") && !isRoleValue(arg)).join(" ") || "educational follow up";
      write(checkCompliance(seed.distributor, action, role), json, formatCompliance);
      return;
    }

    if (command === "mock") {
      const integration = readIntegration(args);
      const lead = findLead(seed.leads, requiredArg(args, "lead-id"));
      write(mockIntegration(integration, lead), json, formatReceipt);
      return;
    }

    if (command === "demo") {
      const lead = findLead(seed.leads, "lead-1001");
      const parts = [
        formatOnboarding(onboardDistributor(seed.distributor)),
        formatWorkspace(buildLeadWorkspace(seed.distributor, lead)),
        formatCampaign(planCampaign(seed.distributor, seed.leads, "web-chat")),
        formatIntake(buildIntakeChecklist(lead)),
        formatScript(qaScript("The buyer wants a human call today", seed.scriptPrompts, "sales-ops")),
        formatHandoffQueue(buildHandoffQueue(seed.distributor, seed.leads)),
        formatCompliance(checkCompliance(seed.distributor, "send real outreach and collect credentials", "sales-ops")),
        formatReceipt(mockIntegration("carrier-style", lead))
      ];
      console.log(formatDemo(parts));
      return;
    }

    console.log(helpText());
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

function write<T>(value: T, json: boolean, formatter: (value: T) => string): void {
  console.log(json ? JSON.stringify(value, null, 2) : formatter(value));
}

function requiredArg(args: string[], label: string): string {
  const value = args.find((arg) => !arg.startsWith("--") && !isRoleValue(arg) && !isIntegrationValue(arg));
  if (!value) {
    throw new Error(`Missing ${label}.`);
  }
  return value;
}

function readRole(args: string[]): RoleId {
  const index = args.indexOf("--role");
  const value = index >= 0 ? args[index + 1] : "sales-ops";
  if (value === "sales-ops" || value === "licensed-producer" || value === "compliance-reviewer") {
    return value;
  }
  throw new Error("Role must be one of: sales-ops, licensed-producer, compliance-reviewer");
}

function readIntegration(args: string[]): MockReceipt["integration"] {
  const index = args.indexOf("--integration");
  const value = index >= 0 ? args[index + 1] : "crm";
  if (value === "crm" || value === "email" || value === "chat" || value === "carrier-style") {
    return value;
  }
  throw new Error("Integration must be one of: crm, email, chat, carrier-style");
}

function isRoleValue(value: string): boolean {
  return value === "sales-ops" || value === "licensed-producer" || value === "compliance-reviewer";
}

function isIntegrationValue(value: string): boolean {
  return value === "crm" || value === "email" || value === "chat" || value === "carrier-style";
}

function helpText(): string {
  return [
    "Kinro Public Demo",
    "",
    "Commands:",
    "  demo                                           Run full deterministic demo",
    "  onboard                                        Show synthetic distributor onboarding",
    "  leads                                          List synthetic leads",
    "  workspace <lead-id>                            Build role-aware lead workspace",
    "  campaign <channel-id>                          Plan a safe channel campaign",
    "  intake <lead-id>                                Build eligibility-safe intake checklist",
    "  handoff                                         Show human handoff queue",
    "  script <script text> [--role role]              Run script QA and safe response lookup",
    "  compliance <action text> [--role role]          Check regulated-action gate",
    "  mock <lead-id> [--integration crm|email|chat|carrier-style]   Create mocked integration receipt",
    "",
    "Options:",
    "  --json                                         Return JSON"
  ].join("\n");
}

main(process.argv.slice(2));
