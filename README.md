# Coverage Guide Demo

Coverage Guide Demo is an original clean-room TypeScript CLI that demonstrates a public product concept: helping small service businesses compare synthetic insurance packages, understand general coverage topics, and choose a mocked follow-up preference.

This repository is intentionally generic. It does not use proprietary source, private data, carrier integrations, trademarks, logos, brand assets, copied marketing language, or regulated decisioning.

## Clean-Room Scope

- Public concept used: small-business insurance quote comparison and basic insurance guidance.
- Data source: synthetic seed data in `data/` only.
- Integrations: mocked only; no real carrier, broker, AI, payment, email, SMS, CRM, or insurance-system calls.
- Outputs: deterministic examples for software demonstration.
- Not included: binding coverage, policy issuance, underwriting, claims handling, legal advice, financial advice, or insurance recommendations.

## Disclaimers

This project is not affiliated with, endorsed by, or connected to any real insurance agency, carrier, broker, or public product referenced by the repository name or public descriptions. It is not an insurance product and does not provide insurance, legal, financial, underwriting, or claims advice. Synthetic quote amounts and coverage details are illustrative only and must not be used for real insurance decisions.

## Requirements

- Node.js 20 or newer
- npm

## Setup

```bash
npm install
```

## Usage

Run the default demonstration:

```bash
npm run demo
```

List synthetic business profiles:

```bash
npm run build
node dist/src/cli.js profiles
```

Compare synthetic packages for a profile:

```bash
node dist/src/cli.js quote riverbend-cleaning --contact email
```

Ask a general educational question:

```bash
node dist/src/cli.js ask "what should I know before filing a claim"
```

Return machine-readable output:

```bash
node dist/src/cli.js quote copperline-plumbing --json
```

## Validation

```bash
npm run validate
```

The validation script type-checks the TypeScript project, runs Node tests, verifies required clean-room disclaimer text, and executes the demo.

## Synthetic Data

- `data/business-profiles.json` contains fictional service businesses.
- `data/market-packages.json` contains fictional package options and premiums.
- `data/guidance-topics.json` contains educational, non-advisory topic responses.

All names, premiums, limits, risk notes, and package details are invented for this demo.
