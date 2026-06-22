# SORA Commons — Web Build Status

Browser web-app inside this repo (src/web/), reusing the proven Iroha browser bridge + Vite config.

## HOW TO RUN
cd /mnt/c/Users/ntorr/iroha-demo-javascript
npx vite --config vite.config.ts      # http://localhost:5174
# after config changes: rm -rf node_modules/.vite, then hard-reload (Ctrl+Shift+R)
# Paste big files directly into VS Code, NOT terminal heredoc (heredoc corrupts files).
# One small step at a time. Commit at each checkpoint.

# ============================================================
# THE VISION (DECIDED)
# ============================================================
A public place where every proposal is a STORY you can follow start to finish. Proposers tell
their story, log verifiable milestones (chapters), connect with people via FOLLOW/LIKE/COMMENT/
BOOST/DONATE. The permanent public record of productive work the rest of SORA (incl. a future
Treasury Desk) reads from — useful even before the Desk exists.
- Sortition repurposed: NOT funding votes — adjudicates disputes (but see DISPUTE MODEL: Commons
  itself does NOT issue verdicts; formal adjudication is the Desk's job).
- IDENTITY: Commons = enabler of SMALLER projects + universal proposer tracker. Large funding
  routes to the Treasury Desk; Commons holds the story either way.

# ============================================================
# BURN MODEL (DECIDED)
# ============================================================
- Burn rides on real value flow, never a toll / never an end in itself. Free to post/follow/like/comment.
- Burn comes from DEMAND side (backers), never SUPPLY (proposers never charged).
- DONATE: supporter -> proposer. 1% burns, 99% to proposer. Connected accounts only. Direct tip
  now; milestone-escrow later (default NO escrow — stays small-project layer). Donations are ALSO
  the conviction signal (bigger donors = higher conviction; "X XOR raised from Y backers").
- BOOST: FREE but SCARCE (see BOOST MODEL). Ranks by NUMBER of boosts, not XOR. NOT purchasable.
- LIKE: free instant warmth (heart).
- (See "BOOST MODEL" for why buy-boost-packages / conviction-burn were DECLINED.)

# ============================================================
# BOOST MODEL (DECIDED — free but scarce)
# ============================================================
- Boosts are FREE but SCARCE — each user gets a limited allotment (~3-5/week, tune later) that
  replenishes. One boost per proposal. Ranks by boost COUNT.
- Why scarce: a free UNLIMITED boost carries no signal. Scarcity makes each boost a deliberate choice
  -> real signal. Free + equal allotment -> isonomia intact, no pay-to-rank, no whales. (Original
  "5 boosters" instinct — kept, but withOUT selling more.)
- Optional later: decay (fresh rankings) + light reputation-weighting (resist sockpuppets).
- NOTE: in-memory now = simple one-boost-per-proposal toggle. Real scarce weekly allotment +
  replenishment tracking = backend-era.
- DECLINED (buy-boost-packages / conviction-burn): purchasable boosts break isonomia (buying rank);
  conviction-burn cannibalizes donations (100% gone, proposer gets nothing) + violates "burn rides
  on real value flow." Keep burn as a byproduct of donations only.

# ============================================================
# SOCIAL LAYER ("warmth in service of real work")
# ============================================================
TAKE: feed/spotlight, following, threaded comments (proposer replies highlighted), real momentum
(bolts/donations/followers/progress), profiles.
LEAVE: engagement algorithms, dopamine loops, vanity metrics, pay-to-rank.

# ============================================================
# COMMONS <-> TREASURY DESK
# ============================================================
Commons = front door + record for ALL proposals. Small efforts seek donations here; large ones
route to the Desk. Every card/story shows a TRACK tag: "Seeking donations" vs "Under Treasury Desk
review" + outcome states. Not competitors — Commons is the record + small-tip venue; Desk is the
large-scale allocation + real-money verification layer that reads from it.

## TRACK TAG / TREASURY DESK STATUS (decided)
- "Seeking donations" = default/only track now (Desk doesn't exist yet). Store stamps track:"donations".
- "Under Treasury Desk review" is NOT self-claimable and NOT manually dished out by the Desk.
  When the Desk reviews a proposal it produces a SIGNAL (verifiable attestation/credential, mechanism
  TBD when Desk built); the PROPOSER obtains it and presents it to unlock the Desk track; system
  VERIFIES it. Evidence-gated, like milestones. No Desk bottleneck.
- COMPOSE NOW: both shown; "Treasury Desk review" VISIBLE but DISABLED ("coming"). Donations only selectable.

# ============================================================
# PAGES
# ============================================================
NAV (~5): Feed / Explore / [Post button] / Treasury / About. Profile, Story, Archive(under Explore),
Citizens = contextual/secondary.

## FEED (DONE)
Single main column. Sort chips (Active/Newest/Most boosted). STORY CARD: avatar+shortId+proposer
label badge + color-coded category badge (terracotta Production / teal Public-good) + bookmark; BIG
title + 1-line summary; track badge; milestone progress bar (green "✓ Delivered" + green bar when
complete); engagement row — INTERACTIVE like/boost (lit + count, hover-pill web / always-pill mobile)
+ comment (opens story scrolled to conversation) + donated. Top Boosted (⚡ lightning) + "Commons
today" stats in a STICKY right rail (desktop) / strip (mobile).

## STORY PAGE (DONE)
Full-width hero (color-coded category badge, title, proposer->profile + label badge, track tag).
Two-column: MAIN (story narrative+files, FACTS grid [boxed], ACCOUNTABILITY section [risk/failure,
blue-accented, hides when empty], CHAPTERS, CONVERSATION) + STICKY SUPPORT RAIL (Donate primary,
clean SVG icon row like/boost/save [wired to store], +Follow, totals raised/burned/backers/followers).
Mobile: rail reflows below content (full parity). Honest done-signals. DONATE MODAL lives here.

## COMPOSE (DONE)
Story-first form: title, one-line summary (card), THE STORY (big narrative, gold border), file attach
(placeholder), category, funding track (donations active / Desk disabled), facts, chapters
(desc / XOR amount [labeled, aligned] / date picker "Evidence due by" w/ sequential validation /
"Evidence you'll present"), risk + public benefit. Centered. Gold "Post" button in desktop nav.

## PROFILE (DONE — step 4)
Two facets, one page:
- PUBLIC (anyone): avatar, bio, label, reputation, their posted proposals + outcomes, track record.
- OWN (viewing self): profile picture (placeholder), totals DONATED + BOOSTED + BURNED, SAVED/tracked
  proposals (works), My Drafts (backend-era).
- Reached by tapping a proposer OR top-right avatar (own). Picture upload needs storage (backend).

## EXPLORE (DONE — step 5)
Search + category/track filter chips + status toggle (Active/Delivered/All) + sort, in a contained
filter panel; reuses Feed card; works in-session over store. (Top Boosted + profile-search +
top-bar search + pagination = later/backend.)

## TREASURY (reframe — step 7)  Burn record fed by real donations. Total burned, recent burns, why-burn explainer.
## ABOUT (reframe — step 7)  Philosophy/3Gi + "Built on SORA Nexus". "Follow the story of real work."
## CITIZENS (reframe — step 7, light)  Citizen count + who's in sortition. (Maybe deprioritize — sortition backend-era.)

# ============================================================
# IDENTITY / REPUTATION / ANTI-FRAUD (DECIDED)
# ============================================================
- PROPOSER LABELS (every proposer, card/story/profile): Newcomer / Proven / Veteran / Treasury Desk
  / Flagged. proposerLabel: completed>=3 Veteran, >=1 Proven, rejected=Flagged (placeholder), else
  Newcomer. NOT yet meaningful (nothing completes until verification flow + backend; today everyone =
  Newcomer, correct). TODO when data exists: weight completion RATE / time active / clean disputes.
- REPUTATION LEVEL (continuous, separate from labels): DELIVERY-WEIGHTED. INVARIANT: gates
  visibility/trust ONLY, NEVER weights a vote or sortition draw.
- COMMENT SENTIMENT: "I'd back this"/"I have concerns" (softened). Low weight, favor verified-backer.
- ANTI-FRAUD: small-project layer -> low stakes -> protection is TRANSPARENCY not escrow. Permanent
  public record. Honest UI: tips voluntary, not escrowed, check history. (Real money = escrow/bonds at Desk.)

# ============================================================
# VERIFICATION MODEL (DECIDED — optimistic challenge window)
# ============================================================
Honest + lightweight. Does NOT claim trustless proof real-world work happened (oracle problem).
- Proposer submits evidence -> chapter "Delivered" (challenge window opens, ~7 days, countdown).
- No concern by close -> "Confirmed" (unchallenged). Use "Confirmed"/"Unchallenged", NEVER "Verified".
- Concern raised -> contested state; does NOT auto-graduate; proposer responds; both on record.
- CARD badge: "✓ Delivered" while windows open; "✓ Confirmed" once all closed cleanly.
- BUILD: only "Delivered" buildable now (in-memory claim via markChapterDelivered). Window timer,
  flagging, Delivered->Confirmed graduation need the SHARED BACKEND.

# ============================================================
# DISPUTE / CHALLENGE WINDOW (DECIDED — validated vs Kickstarter)
# ============================================================
Major platforms deliberately do NOT adjudicate (can't tell honest failure from fraud). Backing =
"support with risk," not a purchase. Commons follows this.
CORE: the window is a REPUTATIONAL INTEGRITY mechanism — not fund-recovery (tips aren't escrowed),
not truth-adjudication. Keeps "Confirmed" meaningful; surfaces concerns; issues NO verdicts.
- FLAGGING: anyone can flag BUT must give a written reason. Weighted by source (verified backer >
  random). A single flag must NOT publicly brand — opens a concern + notifies proposer first;
  escalates to visible contested state only on stronger signal.
- FRAMING (key): NO punitive "Disputed" scarlet letter (most small failures = honest inexperience).
  Use NEUTRAL "concern raised / update requested." REAL trust signal = update/evidence CADENCE, not
  flags. Show proposer activity (last update, on-time vs overdue). SILENCE is the real red flag.
- RESOLUTION: NO verdict on Commons. Transparency + proposer response, both permanent. Donors judge.
  Formal adjudication only at the Desk (real money).
- PROFILE MARK: track RESPONSIVENESS / SILENCE (behavioral, fair) — NOT a raw disputed-count.
- TEETH: purely reputational. Does NOT stop hit-and-run — WHY Commons stays small-stakes; real money
  + escrow/bonds = Desk.
- UI MUST make risk explicit: supporting is voluntary + carries risk, like backing a project not buying.
- Needs SHARED BACKEND (timers, multi-user flags, notifications).

# ============================================================
# FRAUD-BOUNTY IDEA — RISKY / PARKED (do NOT build at launch)
# ============================================================
- Idea: ~5% of donations -> 2.5% burn + 2.5% to a "treasury pot"; reward people who catch fraud.
- RISKY: changes core split (95% not 99%); REQUIRES reliable fraud adjudication (without it: false
  accusations / extortion / collusion — makes fraud worse); standing pot needs custody + governance;
  regulatory. Only viable LATER atop a proven adjudication mechanism w/ safeguards. NOT launch.

# ============================================================
# STRATEGY (DECIDED)
# ============================================================
- LAUNCH: SORA MAINNET as clearly-labeled EARLY BUILD. Live: feed (post/follow/comment/like) +
  DONATIONS. Money code tested EXHAUSTIVELY on Taira FIRST. "Coming": disputes/sortition, Desk routing.
  Lock official URL; token-scam warning. REGULATORY: Nick checks jurisdiction rules (Claude not a lawyer).
- INCENTIVES: NO airdrop-for-usage. Real funnel to funding + founding badges + white-glove + seed stories.
- REPO: build in iroha-demo-javascript/testing. Public `sora-commons` repo EMPTY until runnable.
- FONT: self-host official Sora (woff2 + OFL.txt) in real app. Demo used Google Fonts.
- AUDITING (realistic): mostly SELF-audit (Nick), peer review a MAYBE, no pro-firm budget now.
  CONSEQUENCE: auditing capacity = CEILING on how much money the system touches. Launch keeps stakes
  LOW (small tips, no escrow/pooled/Desk). Escrow/pooled/Desk MUST NOT ship until real audit capacity.
  Substitutes: open-source money code (free "many eyes"), exhaustive Taira testing, keep money code
  tiny+isolated+simple. Ask SORA ecosystem re: audit support. Grow ceiling before stakes.

# ============================================================
# MONEY CODE — DISCIPLINE (non-negotiable)
# ============================================================
- INTEGER/BigInt math only; never floating-point on currency. Base units at exact decimal precision
  (CONFIRM precision from chain, don't assume 18); format to decimal only for display.
- 1% split computed in base units; burn + proposer portions sum EXACTLY to input.
- Rigorous input validation (positive, >0, within balance, within precision, reject malformed/overflow).
- Explicit confirmation showing exact amounts before signing. Handle every failure path.
- TEST EXHAUSTIVELY ON TAIRA FIRST (edge amounts, failures, double-submit). Read back on-chain result.

## DONATE MODAL (DONE — in-memory preview)
- Quick-picks (10/50/100/500) + manual decimal amount + live 1% burn split display + confirm.
- In-memory donate() updates totalDonated/xorBurned (99/1 split) + UNIQUE-backer counting
  (donatedProposals — same account donating twice = still 1 backer). Capped 1,000,000 XOR (clamp +
  label hint + cap note). Spinner arrows removed, overflow-safe. Honest "preview only" note.
- WARNING: stub uses simple decimal math for PREVIEW ONLY. Real donation path MUST follow MONEY-CODE
  DISCIPLINE (integer/BigInt base units, exact precision, sum-exact split, validation incl. balance,
  Taira-first, on-chain readback). Swap the real chain transfer in where donate() mutates totals.

# ============================================================
# ARCHITECTURE — FRONTEND / BACKEND / CHAIN
# ============================================================
- FRONTEND (building now, against in-memory store as stand-in): the Vue app.
- SHARED BACKEND (before/at deploy): server + DB for ALL social data — stories, milestones, comments,
  likes, boosts (+allotment/replenish), follows, saved, donations, DRAFTS, cadence/responsiveness,
  challenge windows. Needed because all users must see same data across devices. localStorage = dead end.
- SORA NEXUS CHAIN: source of truth for MONEY (donations, burns) + later disputes/sortition.
Build path: frontend experience -> shared backend (makes it real) -> chain integration (money).

# ============================================================
# DEFERRED FEATURES (build once, properly)
# ============================================================
- DRAFTS: in SHARED BACKEND tied to account (NOT localStorage). "Save draft" + "My Drafts" on Profile.
- EVIDENCE DEADLINE + OVERDUE FLAG: chapter due-date captured now; full overdue flag + evidence UPLOAD
  + "promised vs delivered" + persistence = later w/ backend + file storage.
- FILE ATTACHMENTS: need storage (backend). Placeholder now.
- LIKE / BOOST / FOLLOW / DONATE persistence: currently in-memory (vanish on refresh) — real w/ backend.
- SCARCE-BOOST ALLOTMENT: per-user weekly allotment + replenishment = backend (now: simple toggle).
- PROPOSER DISPLAY NAME: cards show raw account id now; real name w/ Profile + backend.

# ============================================================
# PROPOSAL LIFECYCLE — three paths, not one rigid format (DECIDED)
# ============================================================
A proposal is a STATE MACHINE; path depends on funding type + whether work started. UI reflects the
CURRENT STATE honestly. (Most lifecycle logic = backend-era; frontend reflects states.)
PATH 1 — Donations, ALREADY building: post -> milestones tick from start (current model).
PATH 2 — Donations, NEEDS FUNDS FIRST ("Raising") [validated vs Kickstarter all-or-nothing]:
  set GOAL + reasonable DEADLINE (KS caps 60d). Sits in RAISING (no delivery clock; "raised X / goal").
  Goal MET -> "Start building" -> milestone clocks begin RELATIVE TO START. Goal MISSED -> "Did not
  reach funding goal — unable to build": NEUTRAL, archived, NO penalty. All-or-nothing protects backers
  from under-funded delivery promises. Donations stay IMMEDIATE tips (NO escrow at this layer — see
  RAISING ESCROW). Anti-abuse: cadence/silence (long Raising + no start = visible red flag).
PATH 3 — TREASURY DESK track: awaiting review. Status "Under Treasury Desk review" (NOT a delivery
  state); NO delivery clock / overdue flags. Outcomes: "Under review" -> "Approved/Funded" (THEN
  milestones begin) OR "Not approved" = NEUTRAL archive, NO reputation hit.
BUILD: states/transitions/relative-clocks/review-states need persistent state (backend). Compose could
later ask "already building or raising first?"; state machine itself = backend work.

# ============================================================
# END-STAGE POLISH PASSES (near the end, like i18n)
# ============================================================
- LIGHT MODE: via CSS-variable tokens. KEEP gold accent on warm off-white/cream (NOT stark white,
  NOT gold->red). Red stays for danger. Invert neutrals. Light/dark toggle in top bar.
- MOBILE PASS: full PARITY required (all actions + info; never punish phone users — most are mobile).
  Currently reflows/stacks (functional); needs spacing/touch-target/type-scale polish.
- FONT PASS: self-host official Sora everywhere; decide which small labels stay JetBrains Mono.
- HERO REDESIGN: keep descriptor headline; make motto "Productive work burns true" shine (GOLD on
  "burns true", bigger/weighted, maybe flame + flicker).
- MOTION pass: flame flicker (hero motto + Treasury) + burn pulse; reduced-motion safe.
- COMPOSE VALIDATION UX: inline field-level errors (red border + message on the bad field), ideally
  alongside real submission + money-code validation. (Now: passive "what's missing" bar — adequate.)
- NUMBER INPUTS: spinner arrows removed on Donate field; apply same to Compose XOR field in polish.
- i18n: EN(default), ES, ZH, HI, AR(RTL), PT, RU, JA, FR. Translation files + switcher.
- Button/icon polish pass: consistent refined button styling app-wide.

# ============================================================
# DONE / REUSABLE
# ============================================================
- CORS proxy (vercel.json + Vite proxy /taira,/minamoto); Vite config; browser bridge
  (irohaBrowserBridge.ts + nativeStub.ts — PROVEN Taira read: 25,000 XOR).
- Shell src/web/ (index.html, main.ts, App.vue [nav + gold Post btn + top-right avatar->own profile],
  tokens.css [+themed scrollbars], assets/seal.png, flame.png). Components: CountUp.vue, Flame.vue.
- BUILT (new direction): Feed.vue, Story.vue, Compose.vue, Profile.vue, Explore.vue. Social mechanics
  + Donate modal wired (in-memory). (Old Overview/About/Proposals/Treasury/Citizens/Submit dormant,
  to be reframed/removed in step 7.)
- Store commons.ts: underwriting fields + story + track + milestone.evidence/deliveredEvidence/
  deliveredAt; savedProposals/isSaved/toggleSave; proposerLabel; markChapterDelivered; viewingProfileId/
  setViewingProfile; draft refs (incl. draftStory, cleared in resetDraft). submitProposal stamps
  xorBurned "0" (free) + track "donations". postDiscussion relaxed. DEMO_MODE: currentAccountId falls
  back to "demo.commons.test".
- Store social/donate: liked/boosted/followed/donatedProposals + isLiked/isBoosted/isFollowing +
  toggleLike/toggleBoost/toggleFollow + donate (in-memory, unique-backer). Proposal type gained
  likes/boostCount/followers/backers/totalDonated (init 0). scrollToComments flag (comment->story jump).
- DEMO: shareable single-file mockup shared as community link (Google Fonts Sora everywhere).

# ============================================================
# BUILD ORDER
# ============================================================
1. Shell + nav .......... DONE
2. Feed ................. DONE
3. Story detail ........ DONE
4. Profile ............. DONE
5. Explore ............. DONE
6. Social/burn mechanics  DONE (6a: like/boost/follow/comment in-memory; 6b: Donate modal in-memory preview)
7. REFRAME Treasury / About / Citizens <- NEXT (last frontend step)
Then: SHARED BACKEND, CHAIN INTEGRATION (money code, Taira first), end-stage polish passes.

# ============================================================
# KEY FACTS
# ============================================================
- Taira XOR asset id: 6TEAJqbb8oEPmLncoNiMRbLEK6tw (src/constants/chains.ts ~line 22)
- "i105" = Iroha account-address format (SDK encodeI105AccountAddress).
- DEMO_MODE:true relaxes gates for solo walkthrough; EXPERIENCE-ONLY, touches no XOR, gate before ship.
- PARKED: vote-to-fund, 5 XOR post fee, Signal=60% aye. Ref: proposal-underwriting-file-DRAFT.md.
- SORTITION COLD-START (Phase 1B): decision B (shrink panel); never relax deliberator-exclusion.
- TOP-BAR (later): notifications (client-derived) + feedback icon + connect/wallet button.

[SEARCH — planned, TWO entry points, ONE system]
- Explore page: primary search + filters (category/track/status) + sort — full find experience (DONE).
- Top-bar global search: quick-access express lane from ANYWHERE; routes to Explore results (later).
- ONE search system, two entry points (like GitHub). Covers proposals + profiles.
- BUILD: client-side keyword filter works now (in-session); REAL scalable search = backend-era.

[PAGINATION — strategy decided, build with backend]
- EXPLORE: NUMBERED PAGES (Google-style), ~20/page, "showing X–Y of N."
- FEED: "LOAD MORE" button, ~15-20/batch — NOT infinite scroll (dopamine-loop pattern SOCIAL LAYER
  says to LEAVE; "Load more" keeps browse-flow intentional). Counts tunable.
- BUILD: real pagination = BACKEND (server returns slice ?page&limit). Same family as SEARCH —
  build together, backend-era. Client-side scaffolding now is invisible over a few proposals — skip.

[RAISING ESCROW — considered; deferred to Desk-layer / later phase]
- Hold Raising donations in escrow, release if goal met, refund if not (Kickstarter-style)? Doable on
  Nexus but heavy: custody (trust), batch refunds (hard/risky), burn-at-release, heavier regulatory.
- Conflicts with the core division: escrow belongs at the DESK, not the small-tips layer.
- LEAN: wanting escrow = a proposal has outgrown the small-tips layer (a DESK ask). Commons Raising
  stays NO-escrow. Escrow = Desk-layer OR a deliberate later phase w/ legal counsel + Taira testing.

[PRE-LAUNCH PUBLIC REVIEW — practice (decided)]
- Publish ship-ready code to PUBLIC GitHub + invite scrutiny BEFORE any real XOR moves. Free audit
  substitute. Do it right: point reviewers AT money code (README); make it RUNNABLE on Taira; real
  TIME (weeks) + solicit in SORA channels; act on findings; credit bug-finders.
- SEQUENCE: build clean -> exhaustive Taira -> PUBLIC REVIEW -> fix -> launch small-tips low-stakes ->
  ~1 yr uneventful real operation -> THEN escrow/Desk. The year = money code earning trust before stakes rise.

[EXPLORE status filter — expand at backend era]
- Current (honest to in-memory data): Active / Delivered / All.
- LATER (backend dispute system): neutral filters — "Confirmed", "Open concern / response requested"
  (NEUTRAL, NOT punitive "Disputed"), "Overdue". Do NOT add a "Disputed" scarlet-letter filter.
