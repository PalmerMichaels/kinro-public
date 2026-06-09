# Kinro Public Demo

Kinro Public Demo is an original clean-room TypeScript CLI demonstrating a non-regulated AI sales-agent operations workflow for insurance distribution. It models onboarding, synthetic lead workspaces, channel campaign planning, script and objection handling, compliance gating, role-aware task management, and mocked CRM/email/chat receipts.

The implementation is based only on public descriptions of a company building AI sales agents for insurance distribution. It does not copy proprietary source, private data, product UI, logos, trademarks, branding, carrier assets, marketing copy, or real workflows.

## Clean-Room Scope

- Public concept used: AI sales agents for insurance distribution across conversational and digital channels.
- Local demo features: onboarding, synthetic leads, channel planner, objection scripts, compliance checklist, role-aware tasks, mocked integrations.
- Data source: synthetic files under `data/` only.
- Integrations: mocked receipts only; no CRM, email, chat, carrier, broker, AI, quote, payment, credential, document, or third-party service calls.
- Review model: licensed-professional and compliance-review roles are represented as local workflow gates only.

## Important Limitations

This is not an insurance product and does not provide insurance advice, quoting, underwriting, binding, brokerage, eligibility decisions, real outreach, lead scraping, credential collection, regulated selling, legal advice, financial advice, or claims advice. All leads, organizations, channels, objections, and receipts are synthetic. Any real insurance communication, product explanation, recommendation-like language, quote request, application, bind request, or sales workflow requires review by appropriately licensed professionals and the responsible compliance team.

## Requirements

- Node.js 20 or newer
- npm

## Setup

```bash
npm install
```

## Usage

Run the full deterministic demo:

```bash
npm run demo
```

List synthetic leads:

```bash
npm run build
node dist/src/cli.js leads
```

Build a role-aware lead workspace:

```bash
node dist/src/cli.js workspace lead-1001
```

Plan a mocked channel campaign:

```bash
node dist/src/cli.js campaign web-chat
```

Generate a safe objection-handling snippet:

```bash
node dist/src/cli.js script "I already have insurance" --role sales-ops
```

Check whether an action is blocked by the compliance gate:

```bash
node dist/src/cli.js compliance "quote and bind this policy" --role sales-ops
```

Create a mocked CRM/email/chat receipt:

```bash
node dist/src/cli.js mock lead-1002 --integration email
```

Return JSON for automation demos:

```bash
node dist/src/cli.js workspace lead-1001 --json
```

## Validation

```bash
npm run validate
```

Validation performs TypeScript type checking, compiles the project, runs Node tests, checks required clean-room/non-regulated disclaimer language, and executes the deterministic demo.

## Synthetic Data

- `data/distributor.json` defines a fictional distributor onboarding profile, roles, channels, jurisdictions, and blocked actions.
- `data/leads.json` contains fictional lead records and role assignments.
- `data/objections.json` contains fictional objection signals and safe response snippets.

All records are invented for this repository and must not be used for real sales, insurance, or compliance decisions.
