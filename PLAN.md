# Clean-Room Implementation Plan

## Public Concept Summary

Publicly observable descriptions for the target product describe a business-insurance experience that helps small businesses get quotes, compare options, and ask basic insurance questions. The public site references service trades such as cleaning, plumbing, handyman, and landscaping, plus guidance around coverage needs and claims handling.

## Clean-Room Boundaries

- Build an original TypeScript demonstration using only public descriptions and general insurance-domain concepts.
- Do not copy proprietary source, private data, visual design, logos, carrier assets, branding, or marketing copy.
- Use synthetic business profiles, synthetic coverage packages, and mocked comparison logic only.
- Do not contact real carriers, quote APIs, insurance systems, AI services, payment systems, or third-party services.
- Include clear disclaimers that this is not insurance, legal, financial, underwriting, or claims advice.
- Avoid regulated decisioning: all outputs are illustrative examples for software demonstration.

## Implementation Scope

- Create a runnable TypeScript CLI called `coverage-guide-demo`.
- Provide seeded synthetic businesses for common service trades.
- Provide synthetic market packages with coverage lines, limits, deductibles, monthly premiums, and fit notes.
- Implement deterministic quote comparison scoring based on declared business needs.
- Implement a simple guidance flow that maps common questions to educational, non-advisory responses.
- Implement a mocked handoff preference flow that records the user's preferred contact method without transmitting data.

## Repository Deliverables

- `README.md` with setup, usage, clean-room notes, and disclaimers.
- `package.json`, `tsconfig.json`, and TypeScript source under `src/`.
- Synthetic seed data under `data/`.
- Node test coverage under `test/` using built-in `node:test`.
- Validation scripts for type checking, tests, and a demo run.

## Validation Plan

- Run `npm install` to install TypeScript tooling.
- Run `npm run typecheck`.
- Run `npm test`.
- Run `npm run validate`, which type-checks, tests, and executes the demo.
- Commit all implementation files to `main`, push to `origin`, and verify local `HEAD` equals `origin/main` with a clean worktree.
