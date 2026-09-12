# Public Chat Abuse Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect the public launcher chat endpoint from direct scripted abuse while keeping local development and unconfigured deployments operational.

**Architecture:** Keep the model credential server-only. Add exact-host model proxy restrictions, Turnstile verification that activates only when the server secret is configured, signed anonymous session cookies, IP plus session rate limits, request replay rejection, and a per-IP stream lock backed by the existing Upstash Redis. Keep visitor-supplied API keys only in React memory while persisting non-secret model preferences.

**Tech Stack:** Astro 4, React 18, Vercel Node functions, Upstash Redis/Ratelimit, Cloudflare Turnstile, Vitest, Testing Library.

**Spec:** User authorization in the 2026-09-12 task and the current `api/chat.js`, `server/chat-policy.js`, and `src/launcher/components/WorldTerminal.tsx` behavior.

## Global Constraints

- Existing deployments without Turnstile environment variables must continue to work.
- Once `TURNSTILE_SECRET_KEY` is present, every paid chat request must present and pass a single-use Turnstile token with action `chat`.
- `DEEPSEEK_API_KEY`, `TURNSTILE_SECRET_KEY`, and `CHAT_SESSION_SECRET` remain server-only.
- The public Turnstile site key may be embedded through `PUBLIC_TURNSTILE_SITE_KEY`.
- Existing cursor, prompt, and generated-suggestion edits in the working tree must be preserved.
- All security branches need behavior tests that fail before implementation.

---

### Task 1: Restrict Model Proxying and Stop Persisting BYOK Secrets

**Files:**
- Modify: `server/chat-policy.js`
- Modify: `src/launcher/components/WorldTerminal.tsx`
- Modify: `.env.example`
- Test: `tests/chat-policy.test.js`
- Test: `src/launcher/components/WorldTerminal.test.tsx`

**Interfaces:**
- Consumes: `validateChat(body)` and the current model-settings UI.
- Produces: exact-host `CHAT_ALLOWED_MODEL_HOSTS` enforcement and local storage containing only non-secret preferences.

- [x] **Step 1: Write failing tests**

Add tests proving `validateChat` rejects an HTTPS endpoint whose hostname is not the default DeepSeek host or an exact configured host. Add a component test that saves a visitor API key, proves the in-memory request still includes it, and proves local storage does not.

- [x] **Step 2: Run focused tests and verify the new assertions fail**

Run `npm test -- tests/chat-policy.test.js src/launcher/components/WorldTerminal.test.tsx` and confirm failures show the missing host allowlist and persisted API key.

- [x] **Step 3: Implement the minimum behavior**

Parse `CHAT_ALLOWED_MODEL_HOSTS` as comma-separated exact hostnames, always include `api.deepseek.com`, and reject all other custom endpoint hosts. Save `{ ...config, apiKey: '' }` to local storage while retaining the full normalized config in React state.

- [x] **Step 4: Run the focused tests and verify they pass**

Run `npm test -- tests/chat-policy.test.js src/launcher/components/WorldTerminal.test.tsx`.

### Task 2: Add Optional Turnstile With Mandatory Server Verification When Configured

**Files:**
- Create: `src/launcher/turnstile.ts`
- Modify: `src/launcher/components/WorldTerminal.tsx`
- Modify: `src/env.d.ts`
- Modify: `.env.example`
- Modify: `api/chat.js`
- Test: `src/launcher/turnstile.test.ts`
- Test: `tests/chat-handler.test.js`

**Interfaces:**
- Consumes: `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, request IP, and the existing chat request body.
- Produces: `TurnstileController.execute(container, siteKey): Promise<string>` and server-side `verifyTurnstileToken(...)` behavior.

- [x] **Step 1: Write failing tests**

Add handler tests for missing, invalid, and valid tokens when `TURNSTILE_SECRET_KEY` is configured, including action and hostname checks. Add controller tests proving explicit execution resolves one token and resets before reuse.

- [x] **Step 2: Run focused tests and verify expected failures**

Run `npm test -- tests/chat-handler.test.js src/launcher/turnstile.test.ts`.

- [x] **Step 3: Implement server and client verification**

Load Cloudflare's explicit-render script only when a public site key exists. Render a dark managed widget with `execution: 'execute'`, `appearance: 'interaction-only'`, and action `chat`. Send the returned token as `turnstileToken`. On the server, call Siteverify with the secret, token, request IP, and an idempotency key; require `success`, action `chat`, and a hostname matching the request host or allowed origin.

- [x] **Step 4: Run focused tests and verify they pass**

Run `npm test -- tests/chat-handler.test.js src/launcher/turnstile.test.ts src/launcher/components/WorldTerminal.test.tsx`.

### Task 3: Add Composite Limits, Replay Protection, and Stream Concurrency Lock

**Files:**
- Modify: `api/chat.js`
- Modify: `.env.example`
- Test: `tests/chat-handler.test.js`

**Interfaces:**
- Consumes: existing Upstash Redis and IP-derived identifier.
- Produces: signed `terminal_session` HttpOnly cookie, IP plus session limiter keys, request nonce reservation, and an atomic per-IP stream lock.

- [x] **Step 1: Write failing handler tests**

Add tests proving both IP and signed session identifiers are limited, duplicate `requestId` values are rejected before vector/model calls, a held stream lock returns 429, and the handler releases only its own lock.

- [x] **Step 2: Run the handler tests and verify expected failures**

Run `npm test -- tests/chat-handler.test.js`.

- [x] **Step 3: Implement the minimum Redis-backed behavior**

Sign random anonymous session IDs with HMAC-SHA256 when `CHAT_SESSION_SECRET` is set, set a Secure HttpOnly SameSite=Lax cookie, limit both hashed IP and verified session identifiers, reserve each UUID-like request ID with Redis `SET NX EX`, and acquire/release a per-IP lock using `SET NX EX` plus compare-and-delete Lua.

- [x] **Step 4: Run the handler tests and verify they pass**

Run `npm test -- tests/chat-handler.test.js`.

### Task 4: Document Deployment Configuration and Verify the Whole Project

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Consumes: the environment variables and security behavior from Tasks 1-3.
- Produces: exact Turnstile and Vercel Bot Protection setup steps without embedding secrets.

- [x] **Step 1: Document optional and required variable pairs**

Document `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `CHAT_SESSION_SECRET`, `CHAT_ALLOWED_MODEL_HOSTS`, and the existing budget variables. State that setting only the Turnstile secret intentionally blocks chat until the public site key is deployed.

- [x] **Step 2: Run complete verification**

Run `npm test`, `npm run build`, and `git diff --check`. Inspect `git diff` to ensure unrelated working-tree edits remain intact.
