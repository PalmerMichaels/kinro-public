# Clean-Room Implementation Plan

## Public Concept Summary

Public descriptions for Kinro describe AI sales agents for insurance distribution that help sellers meet buyers across conversational and digital channels while operating with strong compliance controls. This clean-room repository demonstrates only the non-regulated sales-operations layer around that concept.

## Clean-Room Boundaries

- Build an original TypeScript demonstration from public descriptions only.
- Do not copy proprietary source, private data, visual design, logos, trademarks, assets, or marketing copy.
- Do not implement insurance advice, quoting, product recommendations, underwriting, binding, brokerage, eligibility decisions, lead scraping, credential collection, real outreach, or regulated selling.
- Use only synthetic leads, fictional accounts, synthetic scripts, and mocked CRM/email/carrier-style integrations.
- Require licensed-professional or compliance review before any simulated handoff that would become real-world insurance communication.
- Keep all channel activity local and non-transmitting.

## Implementation Scope

- Create a runnable TypeScript CLI called `kinro-public-demo`.
- Implement onboarding for a fictional insurance distributor with roles, channels, jurisdictions, and approval rules.
- Implement synthetic account and lead workspaces with source, consent, intake-completeness, and handoff readiness checks.
- Implement an outreach planner that drafts internal campaign steps without sending real messages.
- Implement script QA for banned terms, escalation triggers, and non-advisory response snippets.
- Implement eligibility-safe intake checklists that collect facts without making eligibility decisions.
- Implement a compliance guardrail that blocks regulated actions without changing external systems.
- Implement a human handoff queue for leads requiring licensed-professional or compliance review.
- Implement mocked CRM, email, and carrier-style integration receipts that never transmit data.
- Include seed data, tests, validation scripts, and documentation.

## Repository Deliverables

- `README.md` with setup, usage, clean-room notes, and non-regulated disclaimers.
- TypeScript source under `src/`.
- Synthetic seed data under `data/`.
- Node tests under `test/` using built-in `node:test`.
- Validation script for clean-room and safety text.

## Validation Plan

- Run `npm install` if dependencies are missing.
- Run `npm run typecheck`.
- Run `npm test`.
- Run `npm run validate`, which type-checks, tests, checks clean-room disclaimers, and executes a deterministic demo.
- Commit on `main`, push to `origin`, and verify the worktree is clean with local `HEAD` equal to `origin/main`.
