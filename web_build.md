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
- **Money code is sacred** — BigInt / exact precision, money stored as TEXT never float. (Iroha 3 forbids floats — required, not just good practice.)
- **No verdicts** — the challenge window makes disputes visible, it does not adjudicate or claw back.
- Motto: **"Productive work burns true."**

---

## STACK

- **Frontend:** Vue 3 (`<script setup>`) in `src/web/`; Pinia store at `src/stores/commons.ts`.
- **Backend:** Hosted **Supabase** (Postgres + auto REST API + storage). Project ref `uqoecctehyyrdaxvhaep`, Tokyo region.
- **Client:** `src/web/lib/supabase.ts`. Keys in `.env` at repo root (gitignored). `sb_publishable_...` key (browser-safe with RLS).
- **Config:** `src/constants/commonsConfig.ts` (tunable parameters + flags).
- **Chain target:** SORA v3 / SORA Nexus = **Iroha 3** (NOT v2 Substrate/Polkadot). Taira testnet (prefix 369) / Minamoto mainnet (prefix 753). Ed25519 identity.

---

## CHAIN vs DB SPLIT (decided)

- **Chain** = money (donations, burns) + identity (wallet proof) — unforgeable.
- **DB (Supabase)** = social record (proposals, milestones, comments, social toggles, donation *records*, flags, documents). Fast, queryable mirror.
- If they ever disagree on money, **chain wins**.

---

## DATABASE — TABLES (all RLS-on, dev-stage policies)

`accounts` (account_id text PK, public_key, network default 'taira', joined_at, display_name, bio, avatar_url, created_at) ·
`proposals` (id uuid PK, proposer_account_id→accounts, title, summary, story, category, track, funding_mode, xor_requested TEXT, public_benefit, risk_bearer, failure_handling, **productive_claim, inputs, expected_output, demand_signal**, status, created_at) ·
`milestones` (id uuid PK, proposal_id→proposals CASCADE, position, description, due_date, evidence, delivered_evidence, delivered_at, completed, completed_at) ·
`comments` (id uuid PK, proposal_id CASCADE, author_account_id→accounts, content, is_amendment, created_at) ·
`likes` / `boosts` / `follows` / `saves` (account_id→accounts, proposal_id CASCADE, created_at, PK(account_id, proposal_id) — one-per-person + self-inflation guard) ·
`flags` (id uuid PK, proposal_id CASCADE, milestone_id CASCADE nullable, flagger_account_id→accounts, reason, status default 'open', withdrawn_at, proposer_response, responded_at, created_at; partial unique index: one open flag per flagger per milestone) ·
`donations` (RECORD ONLY — id uuid PK, proposal_id CASCADE, donor_account_id→accounts, amount TEXT, burned TEXT, created_at) ·
`proposal_documents` (id uuid PK, proposal_id→proposals CASCADE, filename, url, file_type, uploaded_at) ·
`milestone_documents` (id uuid PK, milestone_id→milestones CASCADE, proposal_id→proposals CASCADE, filename, url, file_type, uploaded_at) ·
`notifications` (id uuid PK, recipient_account_id→accounts, actor_account_id→accounts, type, proposal_id→proposals CASCADE, milestone_id→milestones CASCADE nullable, meta text, read bool default false, created_at)

**RLS lesson (cost real debugging time):** a table needs BOTH `grant <op> ... to anon` AND an RLS *policy* for that op. Missing either → silent zero-match with NO error. Bit us on `flags` UPDATE, `accounts` UPDATE, `proposals` UPDATE. **All dev-stage policies (`using(true)`) must be TIGHTENED to owner-only at the wallet-auth step.**

**Storage buckets (public, dev-stage policies):** `avatars`, `documents`.

---

## WHAT'S BUILT (this branch, committed & pushed)

### Backend persistence — all six entities (in-memory → Supabase, survive refresh)
`loadProposals()` (App.vue `onMounted`) is the single source of truth on load. Proposals, milestones, comments, social toggles (counts DERIVED from row counts), donations (records; backers = COUNT DISTINCT donor).

### Weekly boost allotment
`BOOSTS_PER_WEEK:3`, `BOOST_WEEK_DAYS:7`, fixed weekly buckets from `joined_at`. `boostsRemaining` computed; gated at 0; Feed indicator + block banner. Client-enforced now; real teeth at wallet-auth.

### Mock wallet (`src/web/lib/mockWallet.ts`)
Real Ed25519 keypair, persisted in localStorage. `getAccountId/getPublicKeyHex/signChallenge/verifyChallenge` — the seam SoraSwap will implement. Mock id clearly labeled (`mock-taira-`+hex). Cannot move real test XOR (needs SoraSwap).

### Challenge Window (Phase 1 accountability)
`CHALLENGE_WINDOW_DAYS:7`. Derived state (never stored): in-progress/in-window/flagged/confirmed. Backers/donors flag (gated); proposer can't flag own. Lifecycle: raiseFlag → respondToFlag (proposer) → withdrawFlag (flagger, marks not deletes). No verdicts. Feed card: red left-spine + ⚑ badge on flagged.

### Profile editor (name + bio + avatar crop/zoom/reposition)
`accounts` cols display_name/bio/avatar_url. `ProfileEditor.vue` modal with `vue-advanced-cropper` (CircleStencil). Avatars + display names show EVERYWHERE with initials/short-id fallback (profile, top-bar, feed, story, comments, flags, donate modal).

### IS_TEST_VERSION banner  [DONE]
Slim gold strip at top of App.vue: "Test version — identities and donations are simulated. No real XOR moves." Gated on `IS_TEST_VERSION` flag.

### Status-model reconciliation  [DONE]
The OLD five-stage model (signal→deliberation→sortition→escrow) is ABANDONED — the real model has NO stages, just proposals (active) with milestone-level lifecycle (deliver → challenge window → confirmed/flagged). Fix: added `"active"` to ProposalStatus; submitProposal stamps `active`; loadProposals reads real `row.status`; "complete" persists to DB when all milestones done (grant+policy added for proposals UPDATE). Live UI only uses `status==='complete'` for "✓ Delivered". Throwaway `active:` placeholders added to `statusLabel`/`stageNumber` (only used by dead Overview/Proposals pages).

### Document sharing (BOTH attach points)  [DONE]
Storage `documents` bucket + `proposal_documents` / `milestone_documents` tables. Store: `DocumentRef` type, `documents?: DocumentRef[]` on proposal + milestone, `uploadDocument(file, {proposalId?, milestoneId?})`, load/group in loadProposals.
- **Chapter evidence** (Story.vue): staged-until-submit (removable before, permanent after). `stagedEvidence` per milestone; `submitDelivery` uploads FIRST then markChapterDelivered (so the loading UI stays visible — the deliver block unmounts on completed=true). Docs display moved OUT of the deliver block to `.ch__b` level so they show on delivered chapters for ALL viewers.
- **Proposal-level docs** (Compose.vue): staged-until-post. `submitProposal` made **async**, **adopts DB id** (`p.id = dbProposalId`) so document FK resolves; `onPost` awaits submitProposal, uploads staged docs, then `await loadProposals()` before nav (else the story shows no docs until F5). Display: "Supporting documents" section on Story after the narrative.
- Rules: PDF + images (jpg/png/webp), ≤10MB, up to 5 each. Public. No moderation (Phase 1). Attach button gold light-up + submit loading states.

### Facts-fields persistence  [DONE — was a real bug]
`productive_claim/inputs/expected_output/demand_signal` were captured in memory + Compose form but NOT in the DB insert or load mapping, and the columns didn't exist → they silently vanished on post. Fixed: added the 4 columns, added to `persistProposalToSupabase` insert, added to loadProposals mapping. Story "The facts behind it" section now shows them (renders via `hasFacts`).

### Compose "what's blocking you" validation  [DONE]
Replaced the single-message `todo` with a `blockers` computed (array of ALL specific issues, per-chapter granular: "Chapter N: set the evidence due date", "Chapter N: the due date can't be in the past", etc.). `ready = blockers.length === 0`. Blockers list is HIDDEN by default and only revealed when the user clicks "Post your story" with something wrong (`showBlockers` ref; Post button always clickable to trigger the check). Includes past-date detection (`m.timeline < todayStr`).

### Notification system  [DONE]
`notifications` table (id, recipient_account_id→accounts, actor_account_id→accounts, type, proposal_id→proposals CASCADE, milestone_id→milestones CASCADE nullable, meta text, read bool, created_at) + grants select/insert/update + RLS policies (update needed for mark-as-read; dev-loose, tighten to recipient=authed at wallet-auth).
- **Write side:** `createNotification({recipient,type,proposalId,milestoneId?,meta?})` async helper with self-guard (skips if recipient empty or === actor). Wired to all six triggers: `toggleLike`/`toggleBoost` (on add only, not un-toggle), `donate` (meta = amount), `raiseFlag` (includes milestoneId), `postDiscussion` — comment (non-proposer → notify proposer) AND reply (proposer comments → notify all OTHER prior commenters, deduped via Set; the honest read of "responded to your comment" given flat non-threaded comments).
- **Read side:** `notifications` ref, `unreadCount` computed, `loadNotifications()` (recipient = current account, order desc, limit 50), `markNotificationsRead()` (optimistic). `loadNotifications()` called at end of `loadProposals` AND in `setDemoAccount` (so the bell refreshes on account switch — setDemoAccount doesn't reload proposals, just re-filters in-memory social rows, so it needs its own call).
- **Bell UI (App.vue):** top-bar bell between netchip + avatar, unread badge (9+ cap). Modernized dropdown panel: actor avatar per row with a small corner type-badge (♥/⚡/◈/⚑/💬/↩, flag in red), frosted-glass panel, glowing gold **dot** on unread rows (tint dropped — dot only). `notifText(n)` builds readable text per type using `getDisplayName(actor)||shortId`. `notifTime` relative.
- **Interactions:** mark-read-on-CLOSE (so unread dots stay visible while the panel is open) via all three close-paths (bell toggle, click-outside via document listener + `bellEl` ref, clicking a notification). Comment/reply notifications `setScrollToComments(true)` → Story scrolls to `#conversation`. **Story scroll uses a `watch(() => commons.scrollToComments, ..., {immediate:true})`, NOT onMounted** — onMounted doesn't re-fire on story→story navigation (Vue reuses the mounted component), so a watch is required for the already-on-a-story case.

### Realtime feed + "new stories" pill  [DONE for proposals]
The pill genuinely REQUIRES realtime to function (no other trigger delivers new data — in-app nav doesn't refetch, full refresh re-snapshots). So proposals-realtime got built now.
- **Supabase realtime** already enabled on `proposals` (`alter publication supabase_realtime add table proposals` — was already a member). `subscribeToProposals()` opens a `channel("public:proposals").on("postgres_changes", {event:"INSERT"})`; `unsubscribeProposals()` removes it. Wired in App.vue onMounted/onUnmounted.
- `mapProposalRow(row)` — standalone mapper for a live INSERT payload: the proposal's own columns + EMPTY children (milestones/comments/documents `[]`) + ZERO counts. Correct for a brand-new proposal; children fill on next full load. Deliberately does NOT touch `loadProposals` (avoids breaking that load-bearing function). Dedup: skips if `proposals` already has the id (your own optimistic insert).
- **Feed snapshot moved to the STORE** (`feedShownIds` Set + `feedInitialized`, `initFeedSnapshot()` called once at end of loadProposals, `revealFeedPending()`). CRITICAL: it had to move out of Feed.vue because views are `v-if`-switched (`<Feed v-if="active==='feed'">`) → Feed unmounts/remounts on nav → component-local snapshot reset every time → nothing ever pended. Store state survives remount.
- `pending` = loaded-but-not-in-snapshot, EXCLUDING your own posts (those show instantly, no pill for your own work). `pendingCount` gated on `feedInitialized` (kills the load-flash). Pill click → `revealFeedPending()`.
- **Pill UI:** translucent gold (`rgba(201,168,76,.12)` + gold border), gold text, `width:fit-content` centered, spring entrance (`loadmore-in` + `--ease-spring`), gently bobbing ↑ arrow (`bob` infinite, disabled under reduced-motion).

### Realtime — notifications + social + donations  [ALL DONE]
Same recipe as proposals, applied to every table. **The whole app is now realtime.**
- **Notifications:** `subscribeToNotifications()` — channel with server-side `filter: recipient_account_id=eq.<current>` (only your notifications cross the wire). Prepends the raw payload row to `notifications` (no mapping needed — bell reads snake_case directly). unreadCount reacts → badge lights up live. Re-subscribes in `setDemoAccount` (the filter is account-specific, so switching accounts must re-subscribe; the function removes any existing channel first, so calling it again just re-subscribes).
- **Social (likes/boosts/follows):** one `subscribeToSocial()` channel, INSERT+DELETE on all three tables. A `bump(table,row,delta)` helper: **skips if `row.account_id === currentAccountId`** (your own action already handled optimistically by toggleLike/Boost/Follow), else adjusts `p.likes`/`p.boostCount`/`p.followers`. REQUIRED: `alter table likes/boosts/follows replica identity full` so DELETE payloads include account_id+proposal_id (default DELETE only sends PK — here PK is (account_id,proposal_id) so it'd actually work, but replica-full is the safe general rule).
- **Donations:** `subscribeToDonations()` INSERT only (no un-donate). Skips own (optimistic). Updates `p.totalDonated`/`p.xorBurned` (parseFloat/toFixed(4), matching the donate preview — replaced by BigInt when real money lands) + unique-backer count. Unique-backer needs cross-event memory: `backersByProposal` was promoted from a loadProposals local to a store ref `backersByProposalRef` (assigned after the backers loop in loadProposals); the handler checks `.has(donor)` before incrementing `p.backers`.
- All subscribe/unsubscribe wired in App.vue onMounted/onUnmounted alongside proposals.
- **Pattern for any future realtime:** enable table in `supabase_realtime` publication → (replica identity full if you need DELETE) → channel with `.on("postgres_changes", {event, schema:"public", table, filter?})` → dedup vs own optimistic update (`account_id === currentAccountId`) → merge into store state.

### Realtime — remaining
- [ ] Reveal animation (deferred): `<TransitionGroup>` around feed cards so clicking the "N new" pill animates new cards expanding at top + others sliding down (`-move` class). Currently the reveal just pops in.

### Motion foundation  [DONE]
In `tokens.css`: motion tokens (`--ease-spring`, `--dur-fast/.dur/.dur-slow`), reusable keyframes (fade-up, fade-in, pop, zap, slide-scale, shake), and a global `@media (prefers-reduced-motion: reduce)` guard that neutralizes all animation/transition app-wide. Feed cards have a staggered `fade-up` entrance (`--i` index × 40ms, capped at 12). NEXT animation targets (not yet built): like/boost micro-interactions (pop/zap keyframes ready), notification panel open transition + bell shake on new, page transitions, value tick-ups.

### Search — server-side FTS (stories) + trigram (people)  [DONE]
Dedicated Search.vue view, opened by a magnifying-glass icon in the top bar (`go("search")`, registered in App.vue's `v-if` switcher as `active === 'search'`).
- **Stories:** `proposals.search_vector` = a `generated always as ... stored` tsvector, weighted `setweight` A=title / B=summary / C=story+productive_claim+expected_output, with a GIN index. Queried via an RPC `search_proposals(q)` (SQL function, `grant execute ... to anon`) that matches **FTS OR substring**: `search_vector @@ websearch_to_tsquery('english', q) OR title/summary/story ILIKE '%q%'`, ordered `ts_rank desc, (title ilike) desc, created_at desc`. This combo was the fix for "sora" returning nothing — pure FTS only matches whole words/stems, so we OR in `ilike` substring matching. `pg_trgm` GIN indexes on proposals title/summary/story keep the ilike fast.
- **People:** trigram — `accounts` has `pg_trgm` GIN indexes on display_name + account_id; queried directly with `.or("display_name.ilike.%q%,account_id.ilike.%q%")`. FTS is pointless on short names; trigram is the right tool (fuzzy/substring).
- **Store:** `searchAll(q)` → `{stories, people}` (FTS RPC + trigram query). Returns raw DB rows (snake_case); Search.vue reads them directly (title/summary/proposer_account_id for stories; account_id/display_name/avatar_url/bio for people).
- **UI:** debounced 280ms with a stale-response guard (ignore a resolved query if the input changed while awaiting), People + Stories sections, resting/loading/empty states, click-through (story → setActiveProposal + Story page; person → setViewingProfile + profile).

### Feed pagination  [DONE]
Feed shows `PAGE_SIZE = 10` at a time via a `paged` computed (`visible.slice(0, shownCount)`), a "Load more stories" button + "Showing X of Y" count when `hasMore`, `shownCount += PAGE_SIZE` on click, resets to first page on sort change (`watch(sort, ...)`). Distinct from the top realtime "N new — show" pill (different feature: bottom = paginate existing, top = reveal new arrivals).

### Config flags
`DEMO_MODE` (testnet mode), `SHOW_DEV_TOOLS` (gates 3-account switcher, LOCAL DEV ONLY — false for visitor deploy), `IS_TEST_VERSION` (honesty flag, banner live).

---

## WORKING NOTES / GOTCHAS (hard-won)

- **WSL `/mnt/c` editor↔disk desync:** an edit can look saved while `grep` reads the old file. **Trust `grep`.** If a save won't land, `sed -i`, re-grep, restart Vite.
- **Vite reads `.env` + `vite.config.ts` only at startup** — fully restart. Stale build → `rm -rf node_modules/.vite` + Ctrl+Shift+R.
- **Vite/esbuild does NOT type-check** — red TS squiggles are hints, don't block the dev server.
- **`grep -c "{"` vs `"}"` counts braces in strings/comments** — unreliable. Use the `awk` running-balance (ends at 0 = balanced); "does it run?" is the real test.
- **Silent DB failures:** always `const { error } = await ...; if (error) console.error(...)`. `.select()` on an update returns matched rows — `matched:0` + no error = filter/RLS mismatch.
- **Vue reactivity:** assigning a NEW key on a reactive Record ref (`obj.value[k]=x`) may not re-render — use immutable spread (`obj.value = {...obj.value, [k]:x}`). This bit the evidence upload loading state.
- **Deliver-block unmount gotcha:** marking a chapter delivered flips `completed=true`, which instantly unmounts the `v-if="isMine && !completed"` deliver block AND anything inside it (loading UI, docs display). Upload files BEFORE marking delivered; put permanent displays OUTSIDE the deliver block.
- **DB-id adoption:** `submitProposal`/`persistProposalToSupabase` must write the real DB uuid back into the in-memory proposal (`p.id = dbProposalId`) or later FK inserts (documents) fail with `23503`.
- **Post-write reload:** after uploading child rows (docs), `await loadProposals()` before navigating, or the viewed story won't have them until a manual F5.
- **Paste corruption:** mangled tokens (`v○-if`, `display: f\\nx`, a stray `v-if="false"` left over from a diagnostic) have appeared — when something breaks right after a paste, suspect a corrupted/leftover char; retype rather than re-paste.
- **envDir fix:** `vite.config.ts` has `root: src/web`, so `.env` needs `envDir: resolve(__dirname, ".")`.
- **Adjacent-deletion collateral:** deleting one function can take a neighbor with it (lost `minDate` when replacing `filesNote`; lost the old `onPost`'s twin left a duplicate). After a deletion, grep for what the template still references.
- **`onMounted` doesn't re-fire on same-component navigation:** navigating story→story reuses the mounted Story component (Vue swaps data, doesn't remount), so an `onMounted` side-effect (e.g. scroll-to-conversation) won't run the 2nd time. Use a `watch(..., {immediate:true})` on the triggering flag instead — it fires on mount AND on every later change.
- **`setDemoAccount` doesn't reload proposals** — it only re-filters already-loaded in-memory social rows for the new account. So any per-account data that comes from the DB (e.g. notifications) needs its own explicit reload call inside setDemoAccount; it won't ride along on a loadProposals that doesn't happen.
- Commit at each checkpoint; only surface the commit command when the user is satisfied.

---

## REMAINING WORK

### Next feature
- (nothing scoped yet — pick the next one at the start of the session)

### PRE-PUBLIC CLEANUP PASS (its own careful session, before repo goes public / shown to Iroha team)
Everything below is DEAD or debug cruft to remove together, methodically, testing each step:
- [ ] **Dead five-stage island** — the pages `Overview.vue`, `Proposals.vue`, `Citizens.vue`, `Submit.vue` (all unreachable; they only link to each other, never to the live app; live post flow is Compose.vue not Submit.vue). They're still wired in App.vue's view switcher but nothing navigates to them.
- [ ] **Dead store machinery** — `statusLabel`, `stageNumber` (only used by the dead pages), plus `castSignal`, `advanceToDeliberation`, `advanceToSortition`, sortition/parliament code, and the legacy `ProposalStatus` values (draft/signal/deliberation/sortition/funded/rejected/archived) + the throwaway `active:` placeholders added to statusLabel/stageNumber.
- [ ] **Debug console.logs** added while chasing bugs — `MS LOAD`, `MDOCS`, `STAGED DOCS`, `UPLOADING SET`, and any others (in commons.ts / Story.vue / Compose.vue).
- [ ] Legacy `p.files` block still in Story.vue (old model, superseded by real documents).

### Multi-language (i18n) — DEFERRED TO PHASE 2
Deliberate: touches every component, needs human translators (esp. philosophical terms), better on a stable feature set. `lang="en"` is the correct HTML attr and is already present. Habit: write clear, self-contained UI strings.

### Blocked on ecosystem (SoraSwap / real Iroha 3 web SDK — not yet released)
- [ ] **Wallet auth (real)** — signed-challenge → verify → Supabase session. Mock wallet is the seam; swap in SoraSwap when it ships. Then **tighten all dev-stage RLS to owner-only**.
- [ ] **Real money on-chain** — Iroha 3 ISIs, BigInt base units, exact 1% split, BBB burn via Polkaswap, on-chain readback, confirm XOR precision. Donations stay preview until then.

---

## KEY FACTS TO NOT LOSE

- **Account id is network-specific & exact** — Ed25519 pubkey + network prefix (369 Taira / 753 Minamoto). ONE exact string incl. non-ASCII glyphs — never normalize/lowercase/retype; store verbatim. `public_key` is cross-network-stable.
- **SoraSwap is the v3 wallet — NOT released yet.** That's why real auth + real money wait.
- **Polkaswap = v2 Substrate lineage.** Its Polkadot.js pattern does NOT apply to v3/Iroha 3. Polkaswap will itself migrate to Nexus.
- **XOR base-unit precision STILL UNCONFIRMED** — resolve in the money phase.
- Deps added across sessions: `@supabase/supabase-js`, `@noble/ed25519` v3 + `@noble/hashes`, `vue-advanced-cropper` v2.8.9.