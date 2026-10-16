# Article statistics and model overview implementation plan

**Goal:** Read the three source sites without modifying them, replace manual launcher copies with generated site/path-preserving copies, count only those launcher copies, generate root overview.md, and include it in every model request.

**Spec:** Final user corrections: source blog/world/zero repositories are strictly read-only; all intermediate/final files live in launcher; source pushes notify launcher immediately through GitHub Webhooks, with an extra dispatch credential; old manual copies may be cleared without backups because the user already backed them up; every model request carries overview. No Hexo hooks or workflow files are installed into source repositories.

**Architecture:** importSites/refreshContent read sibling projects locally or fixed source branches in CI and write only launcher. A signed raw-body webhook only schedules repository_dispatch, never edits articles. AST-based extraction defines one counting contract. Launcher lifecycle commands and vector sync refresh the cache and overview. Server-side code puts DEVELOPER INFORMATION after the primary system message, using a second system message for DeepSeek compatibility. Website origin is independent of semantic category and is filtered both in the vector query and final source selection.

**Constraints:** Preserve current uncommitted edits, original article body and unrelated frontmatter, BOM/newlines/mtime. Public overview excludes unpublished/private/password-protected content. Overview is not vectorized. All original public header fields are retained in the overview. Token reservation includes overview bytes. No deployment or vector-service calls are needed for verification.

## 1. Counting and generation

- [x] Write failing tests for hand-counted Markdown including links, images, code, HTML, entities, GFM tables, Chinese/Latin text; header/body preservation and idempotence; private exclusions and category totals; malformed YAML causing no partial writes.
- [x] Run `npm test -- scripts/content-overview.test.js` and confirm missing implementation.
- [x] Implement contentStatistics/updateContentOverview and explicit parser dependencies; update both lockfiles without unrelated dependency upgrades.
- [x] Generate actual overview after capturing 155 source Markdown hashes/mtime. 152 public copies, 411425 words by the declared mixed-language rule; source files unchanged.

## 2. Launcher build hooks and vector metadata

- [x] Write a failing test for source statistics reaching vector metadata.
- [x] Implement read-only import, launcher lifecycle updates, vector-sync generation and website/path provenance. No source scripts are installed.
- [x] Test immediate dispatch, raw-body HMAC verification, repository/branch allowlists, deduplication, website filtering, managed-embedding readiness, and bounded cache-publication push retries.

## 3. Model context and delivery verification

- [x] Write failing handler tests: overview in message 2 for both first and later turns, RAG thereafter, and overview included in Redis token reservation.
- [x] Implement bounded server-only overview loading and message construction, plus Vercel includeFiles.
- [x] Run final full suite: 107 tests passed; launcher build, offline vector capacity check and frozen offline lockfile validation passed. Verify all 155 source Markdown hashes/mtime unchanged and all 152 copied bodies/unrelated headers preserved. Repeat refresh with zero imports/statistics/overview writes. Sparse-checkout all three remote source branches and validate 152 public Markdown. Desktop/mobile source selector QA at 1440/390 px passed without page errors or horizontal overflow. Read-only code review findings resolved and re-reviewed.
- [x] Document final read-only source contract, launcher/src/content counting scope, role compatibility, build/runtime behavior, resulting statistics and unconfigured online prerequisites. Leave changes reviewable without deploying or committing.
