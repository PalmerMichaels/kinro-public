# Clean-Room Implementation Plan

## Public Concept Summary

Public descriptions for Kinro describe AI sales agents for insurance distribution that help sellers meet buyers across conversational and digital channels. The public YC page mentions buyer qualification, answering questions, personalized explanations, quoting, option comparison, binding, handoff to licensed agents, compliance evaluation, and use by brokers and direct-to-consumer carriers.

## Clean-Room Boundaries

- Build an original TypeScript demonstration from public descriptions only.
- Do not copy proprietary source, private data, visual design, logos, trademarks, carrier assets, or marketing copy.
- Do not implement real insurance advice, quoting, underwriting, binding, brokerage, eligibility decisions, lead scraping, credential collection, or regulated selling.
- Use only synthetic leads, fictional organizations, fictional products, scripted objections, and mocked CRM/email/chat integrations.
- Require licensed-professional review before any simulated outreach, recommendation-like language, quote request, or handoff.
- Keep all channel activity local and non-transmitting.

## Implementation Scope

- Create a runnable TypeScript CLI called `kinro-public-demo`.
- Implement onboarding for a fictional insurance distributor with roles, channels, jurisdictions, and approval rules.
- Implement a synthetic lead workspace with lead stages, risk flags, next tasks, and role-aware task/status management.
- Implement a channel campaign planner for web chat, email, partner portal, and agent-assist channels.
- Implement script and objection handling that produces compliant, non-advisory response snippets.
- Implement a compliance checklist that blocks regulated actions without licensed review.
- Implement mocked CRM, email, and chat integration receipts that never transmit data.
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
