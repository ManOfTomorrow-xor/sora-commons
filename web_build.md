# SORA Commons — Build Status

**Repo:** `ManOfTomorrow-xor/iroha-demo-javascript` · branch `testing` · remote `origin/testing`
**Run:** `npx vite --config vite.config.ts` → http://localhost:5174
**Env:** Windows 11 + WSL2 Ubuntu · VS Code · all commands/pastes done by hand (deliberate learning practice)

---

## PHILOSOPHY (drives every decision)

- **Honesty over polish** — no fake data, honest empty states (a new account shows initials, "Newcomer", zeros — never a fake default).
- **Burn rides on real value, never a toll** — 1% donation burns, 99% to the builder.
- **Isonomia** — no pay-to-rank; boosts are free but scarce.
- **The record is the product** — flags/disputes live on the record permanently, never erased.
- **Stakes match safeguards** — launch low-stakes (escrow, real money = later phases).
- **Money code is sacred** — BigInt / exact precision, money stored as TEXT never float. (The Iroha 3 chain itself forbids floats — this is required, not just good practice.)
- **No verdicts** — the challenge window makes disputes visible, it does not adjudicate or claw back.
- Motto: **"Productive work burns true."**

---

## STACK

- **Frontend:** Vue 3 (`<script setup>`) in `src/web/`; Pinia store at `src/stores/commons.ts`.
- **Backend:** Hosted **Supabase** (Postgres + auto REST API + storage). Project ref `uqoecctehyyrdaxvhaep`, Tokyo region.
- **Client:** `src/web/lib/supabase.ts`. Keys in `.env` at repo root (gitignored). Uses the `sb_publishable_...` key (browser-safe with RLS).
- **Config:** `src/constants/commonsConfig.ts` (tunable governance parameters + flags).
- **Chain target:** SORA v3 / SORA Nexus = **Iroha 3** (NOT the v2 Substrate/Polkadot lineage). Taira testnet (prefix 369) / Minamoto mainnet (prefix 753). Ed25519 identity.

---

## CHAIN vs DB SPLIT (decided)

- **Chain** = money (donations, burns) + identity (wallet proof) — unforgeable.
- **DB (Supabase)** = social record (proposals, milestones, comments, social toggles, donation *records*, flags). Fast, queryable mirror.
- If they ever disagree on money, **chain wins**.

---

## DATABASE — TABLES (all RLS-on, dev-stage policies)

`accounts` (account_id text PK, public_key, network default 'taira', joined_at, display_name, bio, **avatar_url**, created_at) ·
`proposals` (id uuid PK, proposer_account_id→accounts, title, summary, story, category, track, funding_mode, xor_requested TEXT, public_benefit, risk_bearer, failure_handling, status, created_at) ·
`milestones` (id uuid PK, proposal_id→proposals CASCADE, position, description, due_date, evidence, delivered_evidence, delivered_at, completed, completed_at) ·
`comments` (id uuid PK, proposal_id CASCADE, author_account_id→accounts, content, is_amendment, created_at) ·
`likes` / `boosts` / `follows` / `saves` (account_id→accounts, proposal_id CASCADE, created_at, PK(account_id, proposal_id) — one-per-person + self-inflation guard at DB level) ·
`flags` (id uuid PK, proposal_id CASCADE, milestone_id CASCADE nullable, flagger_account_id→accounts, reason, **status** default 'open', **withdrawn_at**, **proposer_response**, **responded_at**, created_at; partial unique index: one open flag per flagger per milestone) ·
`donations` (RECORD ONLY — id uuid PK, proposal_id CASCADE, donor_account_id→accounts, amount TEXT, burned TEXT, created_at)

**RLS lesson (cost real debugging time):** a table needs BOTH `grant <op> ... to anon` AND an RLS *policy* for that op. Missing either → silent zero-match with NO error. This bit us on `flags` UPDATE and `accounts` UPDATE. All tables now have what current features need. **All dev-stage policies (`using(true)`) must be TIGHTENED to owner-only at the wallet-auth step.**

**Storage:** `avatars` bucket (public), policies for public read + anon insert/update (dev-stage).

---

## WHAT'S BUILT (this branch, committed & pushed)

### Backend persistence — all six entities migrated (in-memory → Supabase, survive refresh)
Pattern: optimistic in-memory update + Supabase write; `loadProposals()` (App.vue `onMounted`) is the single source of truth on load — fetches everything, maps DB rows back into in-memory shapes, groups children by parent id.

- **Proposals** — write on post (account upsert → insert, capture DB uuid via `.select().single()`); read + map.
- **Milestones (chapters)** — write against captured DB proposal id; read + group. Delivery (`delivered_evidence`/`delivered_at`/`completed`) persists via `markChapterDelivered`.
- **Comments** — write on postDiscussion; read + group.
- **Social toggles** (likes/boosts/follows/saves) — insert/delete on toggle; counts DERIVED from row counts (honest, can't drift); per-account lit-state restored on load and on demo-account switch.
- **Donations** (records only; money is preview) — insert on donate; backers = COUNT(DISTINCT donor), totals = SUM(amount), xorBurned = SUM(burned) — all derived; `donatedProposals` seeded from DB.

### Weekly boost allotment
- `BOOSTS_PER_WEEK: 3`, `BOOST_WEEK_DAYS: 7`. Fixed weekly buckets from each account's `joined_at`.
- `boostsRemaining` computed from boost-row timestamps. `toggleBoost` gated (blocked at 0). Live "N of 3 boosts left this week" indicator in Feed. Floating top-right warning banner on block (auto-dismiss).
- Client-enforced now; gains real teeth at wallet-auth.

### Mock wallet (testnet identity — swappable seam for SoraSwap)
- `src/web/lib/mockWallet.ts`. Real Ed25519 keypair (`@noble/ed25519` v3, key via `crypto.getRandomValues`), persisted in `localStorage` (`sora_commons_mock_wallet_v1`).
- Exposes `getAccountId()`, `getPublicKeyHex()`, `signChallenge(nonce)`, `verifyChallenge(...)` — the interface SoraSwap will later implement.
- **Mock account-id derivation is clearly labeled** (`mock-taira-` + pubkey hex slice) — visibly-mock, NOT the real Iroha 3 derivation; swap the one function when the real SDK lands.
- Default identity in visitor mode. `currentAccountId` precedence = parliament → dev switcher (if SHOW_DEV_TOOLS) → mock wallet (DEMO_MODE) → empty. `initMockWallet()` awaited in `onMounted` before `loadProposals`.
- **Cannot move real test XOR** (needs real signing/submission → SoraSwap). Works with the in-memory donation preview only. Honest and intentional.

### Challenge Window (Phase 1 accountability — "accountability ships with money")
- Config: `CHALLENGE_WINDOW_DAYS: 7`.
- **Derived state** (never stored): a delivered milestone is `in-progress` / `in-window` (countdown) / `flagged` / `confirmed`. `milestoneChallengeState(m)` + proposal-level `proposalChallengeState(p)`.
- **Who flags:** backers/donors (checked vs `donatedProposals`). Non-backers see a "you need to be a backer" message. Proposer can't flag their own.
- **Flag lifecycle (no verdicts):** `raiseFlag` → `respondToFlag` (proposer only) → `withdrawFlag` (flagger only, marks withdrawn, never deletes). Full thread stays visible permanently. One open flag per person per milestone (partial unique index).
- **UI:** Story page shows window state, gated flag button, flag threads (reason → proposer response → withdrawn status), "discuss further ↓" link to Conversation.
- **Feed card label:** flagged proposals get a red left-spine + ⚑ Flagged badge (muted `--negate`, honest wording — a concern on the record, not a verdict).

### Profile editor (display name + bio + avatar crop/zoom/reposition)
- `accounts` columns: `display_name`, `bio`, `avatar_url`. Loaded in `loadProposals` into `displayNameByAccount` / `bioByAccount` / `avatarByAccount`.
- Store: `updateProfile(name,bio)`, `uploadAvatar(File|Blob)` (uploads to `avatars`, saves URL, cache-busted), `getAvatar/getDisplayName/getBio`.
- **`src/web/components/ProfileEditor.vue`** — modal: name field, bio textarea, `vue-advanced-cropper` (CircleStencil) crop/zoom/reposition. Save → crop to JPEG blob → uploadAvatar → updateProfile.
- **Avatars everywhere** with initials fallback: profile, top-bar (`.meav`), feed cards (`.av`), story proposer + comments. All avatar containers use `position:relative; overflow:hidden` + `__img` child (`object-fit:cover`) to clip to the circle.
- Profile shows `getDisplayName || shortId` and `getBio || placeholder`.

### Config flags (visitor-deploy readiness)
- `DEMO_MODE` = testnet mode (relaxed gates, demo data, mock wallet).
- **`SHOW_DEV_TOOLS`** = split OUT from DEMO_MODE — gates the 3-account switcher (LOCAL DEV ONLY). Deploy for visitors with this **false** → they get their own mock wallet, no switcher.
- **`IS_TEST_VERSION`** = honest "no real value moves" flag (banner not yet surfaced — see TODO).

---

## WORKING NOTES / GOTCHAS (hard-won)

- **WSL `/mnt/c` editor↔disk desync:** an edit can look saved while `grep` reads the old file. **Trust `grep` over the editor.** If a save won't land, write with `sed -i`, re-grep, restart Vite.
- **Vite reads `.env` + `vite.config.ts` only at startup** — fully restart after changing them. Stale build → `rm -rf node_modules/.vite` + Ctrl+Shift+R.
- **Vite/esbuild does NOT type-check** — red TS squiggles are hints, don't block the dev server.
- **`grep -c "{"` vs `"}"` counts braces inside strings/comments** — unreliable. Use the `awk` running-balance; "does it run?" is the real test.
- **Silent DB failures:** `.then()` with no error handler hides RLS/permission errors. Always `const { error } = await ...; if (error) console.error(...)`. A `.select()` on an update returns matched rows — `matched: 0` + no error = filter/RLS mismatch.
- **Paste corruption:** pasted code has intermittently arrived with mangled tokens (`v○-if`, `display: f\\nx`) — when layout/behavior breaks right after a paste, suspect a corrupted character; retype the token rather than re-paste.
- **envDir fix:** `vite.config.ts` has `root: src/web`, so `.env` needs `envDir: resolve(__dirname, ".")` to load from repo root.
- Commit at each checkpoint; only surface the commit command when the user is satisfied.

---
a
## REMAINING WORK

### Quick polish (in progress)
- [ ] **`IS_TEST_VERSION` banner** — surface a slim "Test version — identities and donations are simulated, no real XOR moves" bar. Flag exists; banner not yet placed. (Matters now that testnet has been announced.)
- [x] `lang="en"` on `<html>` — already present in both index.html files.
- [ ] **Status-model reconciliation** — everything loads as `"signal"`; reconcile DB `active/delivered/complete` vs in-app lifecycle display.

### Features (unbuilt)
- [ ] **Document / evidence file sharing** — attach files to proposals or chapter evidence (the disabled "attach evidence file" button). Same storage foundation as avatars. Needs scoping: where docs attach, size/type limits, moderation.
- [ ] **Multi-language (i18n)** — DEFERRED TO PHASE 2. Deliberate: touches every component, needs human translators (esp. philosophical terms), better done once on a stable feature set. `lang="en"` correct until then. Habit for now: write clear, self-contained UI strings (don't split sentences across template pieces).

### Blocked on ecosystem (SoraSwap / real Iroha 3 web SDK — not yet released)
- [ ] **Wallet auth (real)** — signed-challenge → verify → Supabase session. Mock wallet is the scaffolding/seam; swap in SoraSwap when it ships. Then **tighten all dev-stage RLS to owner-only**.
- [ ] **Real money on-chain** — construct/sign Iroha 3 ISIs, submit to Taira/Minamoto, BigInt base units, exact 1% split, BBB burn via Polkaswap, on-chain readback, confirm XOR precision. Donations stay preview until then.

### Sequencing note
Wallet auth splits into build-now scaffolding (seam — done via mock wallet) and wire-when-shipped (SoraSwap + RLS activation). Real money is the biggest remaining mountain and is fully ecosystem-gated.

---

## KEY FACTS TO NOT LOSE

- **Account id is network-specific & exact** — derived from Ed25519 pubkey + network prefix (369 Taira / 753 Minamoto). The chain's output is ONE exact string incl. non-ASCII glyphs — never normalize/lowercase/retype; store verbatim. `public_key` is the cross-network-stable thread.
- **SoraSwap is the v3 wallet — NOT released yet.** That's why real auth + real money wait.
- **Polkaswap = v2 Substrate lineage.** Its Polkadot.js wallet-connect pattern does NOT apply to v3/Iroha 3. Polkaswap will itself migrate to Nexus.
- **XOR base-unit precision STILL UNCONFIRMED** — resolve in the money phase.