# SORA Commons — Web Build Status

Browser web-app inside this repo (src/web/), reusing the proven Iroha browser bridge + Vite config.

## HOW TO RUN
cd /mnt/c/Users/ntorr/iroha-demo-javascript
npx vite --config vite.config.ts      # http://localhost:5174
# after config changes: rm -rf node_modules/.vite, then hard-reload (Ctrl+Shift+R)
# Paste big files directly into VS Code, NOT terminal heredoc (heredoc corrupts files).
# One small step at a time. Commit at each checkpoint.

# >>> STATUS: ENTIRE FRONTEND DONE (steps 1-7). Next: optional Donate "Why 1%?" expander -> MOBILE
#     polish pass -> SHARED BACKEND (Phase-1 scope incl. challenge window) -> CHAIN -> end-stage polish.

# ============================================================
# PHASE 1 vs PHASE 2 — SHARPENED (DECIDED — read this first)
# ============================================================
PRINCIPLE: the public testnet tests exactly what launches day-1. Whatever is day-1 must be
testnet-ready; anything not testnet-ready is Phase 2 by definition. No withholding a launch feature
from the test of that launch. NO DEADLINE — do the work, launch when truly ready.

PHASE 1 (day-1 launch; ALL built + Taira-tested + publicly reviewed before any real XOR moves):
- Feed / stories / follow / like / comment
- Donations (1% burn / 99% builder) — money code; the highest-stakes review surface
- CHALLENGE WINDOW + dispute/concern system (MOVED INTO PHASE 1 — decided this session). Reason:
  don't launch real money without the accountability mechanism live. Can't predict growth; a
  popularity spike with disputes un-built = caught under-built. Requires backend (timers, multi-user
  flags, notifications, Delivered->Confirmed graduation).
- Proposer labels / reputation (meaningful as data accrues)
- Boosts (free but scarce: per-user allotment + replenishment)

PHASE 2 (later — only after ~1yr proven real operation + audit capacity + legal footing):
- ESCROW (Raising + milestone): holding/releasing pooled funds, batch refunds, burn-at-release.
  A direction the COMMONS may build later; heavy custody/regulatory weight.
- TREASURY DESK: a SORA NEXUS initiative (NOT Commons-built) — large-scale funding layer the Commons
  connects to / routes large proposals toward, while Commons holds the story either way.
- FORMAL ADJUDICATION: only matters once funds are HELD in escrow (a decision determines release vs
  refund). For that, Commons looks to the wider SORA Nexus ecosystem (incl. its sortition work) —
  Commons itself issues NO verdicts. At the donation layer (money already delivered) none of this applies.
- FRAUD-BOUNTY (if ever — parked/risky).

SORTITION = a SORA NEXUS ecosystem initiative, NOT a Commons feature. Commons does not build/own it.
We admire its logic (a random draw can't be bought/campaigned-for) and will watch how it evolves to
see if it ever fits — NO promise. Kept out of Commons phase lists; referenced only as ecosystem context.

# ============================================================
# THE VISION (DECIDED)
# ============================================================
A public place where every proposal is a STORY you can follow start to finish. Proposers tell their
story, log verifiable milestones (chapters), connect with people via FOLLOW/LIKE/COMMENT/BOOST/DONATE.
The permanent public record of productive work the rest of SORA reads from.
- IDENTITY: Commons = enabler of SMALLER projects + universal proposer tracker + front door to the
  ecosystem. Large funding routes to the SORA-Nexus Treasury Desk; Commons holds the story either way.
- WHY ADOPTION IS PLAUSIBLE: SORA Nexus exists in part to FUND BUILDING (Desk is core to XOR's purpose).
  Builders are already oriented at this ecosystem; XOR donations give a concrete economic reason to
  post on Commons. Commons = natural front door / track-record on-ramp to ecosystem funding.

# ============================================================
# BURN MODEL (DECIDED)
# ============================================================
- Burn rides on real value flow, never a toll / never an end in itself. Free to post/follow/like/comment.
- Burn comes from DEMAND side (backers), never SUPPLY (proposers never charged).
- DONATE: supporter -> proposer. 1% burns, 99% to proposer. Connected accounts only. Direct tip now;
  escrow is Phase 2. Donations are ALSO the conviction signal ("X XOR raised from Y backers").
- BOOST: FREE but SCARCE (see BOOST MODEL). Ranks by NUMBER of boosts, not XOR. NOT purchasable.
- LIKE: free instant warmth (heart).

# ============================================================
# BOOST MODEL (DECIDED — free but scarce)
# ============================================================
- FREE but SCARCE — limited per-user allotment (~3-5/week, tune later) that replenishes. One boost per
  proposal. Ranks by boost COUNT. Scarcity = signal; free+equal = isonomia, no pay-to-rank, no whales.
- NOTE: in-memory now = simple one-boost-per-proposal toggle. Real allotment+replenishment = backend.
- DECLINED: buy-boost-packages (breaks isonomia) + conviction-burn (cannibalizes donations).

# ============================================================
# SOCIAL LAYER ("warmth in service of real work")
# ============================================================
TAKE: feed/spotlight, following, threaded comments (proposer replies highlighted), real momentum
(bolts/donations/followers/progress), profiles.
LEAVE: engagement algorithms, dopamine loops, vanity metrics, pay-to-rank.

# ============================================================
# COMMONS <-> TREASURY DESK (Desk = SORA Nexus initiative, NOT Commons-built)
# ============================================================
Commons = front door + record for ALL proposals. Small efforts seek donations here; large ones route
to the Desk (a SORA Nexus layer). Every card/story shows a TRACK tag: "Seeking donations" vs "Under
Treasury Desk review" + outcome states.
## TRACK TAG / DESK STATUS (decided)
- "Seeking donations" = default/only track now. Store stamps track:"donations".
- "Under Treasury Desk review" NOT self-claimable. When the Desk (ecosystem) reviews, it produces a
  SIGNAL (verifiable attestation, mechanism TBD); proposer presents it to unlock the Desk track;
  system VERIFIES it. Evidence-gated.
- COMPOSE NOW: both shown; "Treasury Desk review" VISIBLE but DISABLED ("coming"). Donations selectable.

# ============================================================
# PAGES — ALL DONE
# ============================================================
NAV (5): Feed / Explore / [Post button] / Treasury / About. Profile + Story = contextual. Citizens
REMOVED from nav (see FUTURE note).

## FEED (DONE)
Sort chips (Active/Newest/Most boosted). STORY CARD: avatar+shortId+proposer label + color category
badge (terracotta Production / teal Public-good) + bookmark; title + summary; track badge; milestone
progress bar; engagement row — INTERACTIVE like/boost (lit + count, hover-pill web / always-pill
mobile, self-support GUARDED) + comment (opens story scrolled to conversation) + donated. Top Boosted
(⚡ lightning) + "Commons today" stats in a STICKY right rail (desktop) / strip (mobile).

## STORY PAGE (DONE)
Hero (category badge, title, proposer->profile + label, track tag). Two-column: MAIN (story, FACTS
grid, ACCOUNTABILITY [hides when empty], CHAPTERS w/ evidence submit + dashed ATTACH-FILE placeholder
'coming with file storage', CONVERSATION) + STICKY SUPPORT RAIL (Donate primary, like/boost/save row,
+Follow, totals raised/burned/backers/followers). All support actions GUARDED (disabled on own
proposal; Save stays enabled). DONATE MODAL lives here. Mobile: rail reflows below (full parity).

## COMPOSE (DONE)
Story-first form: title, summary, THE STORY (gold border), file attach (placeholder), category,
funding track (donations active / Desk disabled), facts, chapters (desc / XOR amount [labeled,
aligned] / "Evidence due by" date w/ sequential validation / "Evidence you'll present"), risk +
public benefit. Gold "Post" button in nav.

## PROFILE (DONE)
PUBLIC: avatar, bio, label, reputation, posted proposals + outcomes, track record. OWN: profile pic
(placeholder), totals DONATED/BOOSTED/BURNED, SAVED proposals (works), My Drafts (backend-era).
Reached by tapping a proposer OR top-right avatar (own).

## EXPLORE (DONE)
Search + category/track filter chips + status toggle (Active/Delivered/All) + sort, contained panel;
reuses Feed card (terracotta matched). Engagement icons DISPLAY-ONLY here (Feed's are interactive) —
deferred to <StoryCard> refactor (see note). Top-bar search + pagination = backend-era.

## TREASURY (DONE — reframed, step 7)
Donation-framed burn record. Subtitle "1% of every donation burns." Hero total burned (reads
commons.totalXorBurned) with FIRE-variant flame. Stats: XOR raised for builders / Burn events /
Backers. Ledger reads donation-driven xorBurned rows ("From donations"), honest empty state.
Why-burn explainer (donation framing). Dropped dead proposal-fee + milestone-burn stats.

## ABOUT (DONE — reframed, step 7)
Hero (followable-record identity) + "What this is" + HOW IT WORKS (deep-link ids: #burn #follow
#challenge #boost, all Phase-1 present-tense; challenge-window section says no-verdicts BECAUSE a
donation already reached the builder — nothing to claw back) + WHAT'S COMING (#desk: Desk = SORA
Nexus initiative; escrow = maybe-Commons-later; formal adjudication = looks to ecosystem, only matters
with escrow) + collapsible "thinking behind it" (3Gi, reputation-can't-harden, separation-of-powers
[now cites the self-support guard], SORTITION as SORA-Nexus-initiative-we-watch/no-promise, verify-
the-loop) + honest phase note. .mech sections have scroll-margin-top for deep-linking.

# ============================================================
# IDENTITY / REPUTATION / ANTI-FRAUD (DECIDED)
# ============================================================
- PROPOSER LABELS: Newcomer / Proven / Veteran / Treasury Desk / Flagged. proposerLabel: completed>=3
  Veteran, >=1 Proven, rejected=Flagged, else Newcomer. Today everyone=Newcomer (correct). TODO when
  data exists: weight completion RATE / time active / clean disputes.
- REPUTATION LEVEL (continuous): DELIVERY-WEIGHTED. INVARIANT: gates visibility/trust ONLY, NEVER
  weights a vote or a draw.
- SELF-SUPPORT GUARD (DONE): a proposer can't like/boost/follow/donate their OWN proposal — buttons
  stay VISIBLE (owner sees counts) but DISABLED, so numbers can't be self-inflated to trick others.
  Save stays enabled (personal bookmark). Frontend disable + store-level guard on donate(); real
  enforcement = backend account checks.
- ANTI-FRAUD: small-project layer -> low stakes -> protection is TRANSPARENCY not escrow. Permanent
  public record. Tips voluntary, not escrowed.

# ============================================================
# VERIFICATION + CHALLENGE WINDOW (DECIDED — Phase 1; validated vs Kickstarter)
# ============================================================
Honest + lightweight. Does NOT claim trustless proof real work happened (oracle problem).
- Proposer submits evidence -> chapter "Delivered" (challenge window opens, ~7 days, countdown).
- No concern by close -> "Confirmed" (NEVER "Verified" — silence isn't proof).
- Concern raised -> contested; does NOT auto-graduate; proposer responds; both on permanent record.
- FLAGGING: anyone, but must give a WRITTEN REASON. Weighted by source (verified backer > random). A
  single flag must NOT publicly brand — opens a concern + notifies proposer first; escalates only on
  stronger signal.
- FRAMING: NO punitive "Disputed" scarlet letter (most small failures = honest inexperience). NEUTRAL
  "concern raised / update requested." REAL trust signal = update/evidence CADENCE; SILENCE is the red flag.
- NO VERDICTS ON COMMONS — and this is SELF-CONSISTENT: at the donation layer money already reached
  the builder, so there's nothing to claw back or rule on. Formal adjudication only becomes relevant
  with ESCROW (Phase 2), where funds are HELD and a decision determines release vs refund — and even
  then Commons looks to the SORA ecosystem, not its own verdict.
- PROFILE MARK: track RESPONSIVENESS / SILENCE (behavioral) — NOT a raw disputed-count.
- BUILD: frontend now only does in-memory "Delivered" (markChapterDelivered). Full window (timers,
  multi-user flags, notifications, Delivered->Confirmed graduation) = SHARED BACKEND, PHASE 1.

# ============================================================
# STRATEGY (DECIDED)
# ============================================================
- LAUNCH: SORA MAINNET as clearly-labeled EARLY BUILD, at LOW stakes. Phase-1 set (feed + donations +
  CHALLENGE WINDOW + boosts + labels) all built & tested first. NO DEADLINE.
- INCENTIVES: NO airdrop-for-usage. Real funnel to ecosystem funding + founding badges + white-glove +
  seed stories. (Adoption tailwind: ecosystem is funding-oriented; XOR is the builder incentive.)
- REPO: build in iroha-demo-javascript/testing. Public `sora-commons` repo EMPTY until runnable.
- FONT: self-host official Sora (woff2 + OFL.txt) in real app. Demo used Google Fonts.
- REGULATORY: Nick checks jurisdiction rules before real donations (Claude not a lawyer — flagged).
- AUDITING (realistic): mostly SELF-audit (Nick), peer review a MAYBE, no pro-firm budget now.
  CONSEQUENCE: auditing capacity = CEILING on money the system touches. Escrow/Desk MUST NOT ship until
  real audit capacity. Substitutes: open-source money code (free "many eyes"), exhaustive Taira testing,
  keep money code tiny+isolated+simple. Ask SORA ecosystem re: audit support.

# ============================================================
# MONEY CODE — DISCIPLINE (non-negotiable)
# ============================================================
- INTEGER/BigInt math only; never floating-point on currency. Base units at exact decimal precision
  (CONFIRM precision from chain, don't assume 18); format to decimal only for display.
- 1% split computed in base units; burn + proposer portions sum EXACTLY to input.
- Rigorous validation (positive, >0, within balance, within precision, reject malformed/overflow).
- Explicit confirmation showing exact amounts before signing. Handle every failure path.
- TEST EXHAUSTIVELY ON TAIRA FIRST (edge amounts, failures, double-submit). Read back on-chain.

## DONATE MODAL (DONE — in-memory preview)
- Quick-picks (10/50/100/500) + manual decimal amount + live 1% split + confirm. Spinner arrows
  removed, overflow-safe, capped 1,000,000 XOR (clamp + label hint + cap note "Maximum donation is
  1,000,000 XOR").
- In-memory donate(): 99/1 split updates totalDonated/xorBurned; UNIQUE-backer counting keyed
  account::proposal (different accounts each count once; same account twice = once); self-donation
  guarded. Honest "preview only" note.
- WARNING: stub uses simple decimal math for PREVIEW ONLY. Real path MUST follow MONEY-CODE DISCIPLINE.
  Swap real chain transfer in where donate() mutates totals.
- TODO (smart UX, do incrementally): inline "Why 1%?" expander in the modal -> concise explanation +
  optional deep-link to About #burn. Then similar contextual expanders for boost scarcity (#boost),
  challenge window (#challenge), Desk track, labels — place each at its decision point. Donate one first.

# ============================================================
# ARCHITECTURE — FRONTEND / BACKEND / CHAIN
# ============================================================
- FRONTEND (DONE, against in-memory store): the Vue app.
- SHARED BACKEND (next-major; PHASE-1 SCOPE): server + DB for ALL social data — stories, milestones,
  comments, likes, boosts (+allotment/replenish), follows, saved, donations, DRAFTS,
  cadence/responsiveness, CHALLENGE WINDOWS + flags + notifications. All users must see same data
  across devices. localStorage = dead end.
- SORA NEXUS CHAIN: source of truth for MONEY (donations, burns).
Build path: frontend (done) -> shared backend (makes it real, Phase-1 incl. challenge window) ->
chain integration (money, Taira first) -> end-stage polish.

# ============================================================
# DEFERRED FEATURES (build once, properly)
# ============================================================
- DRAFTS: SHARED BACKEND tied to account (NOT localStorage). "Save draft" + "My Drafts" on Profile.
- EVIDENCE DEADLINE + OVERDUE FLAG + evidence FILE UPLOAD + "promised vs delivered" + persistence =
  backend + file storage. (Attach button is a dashed placeholder now.)
- FILE ATTACHMENTS: need storage (backend). Placeholder now.
- LIKE/BOOST/FOLLOW/DONATE persistence: in-memory now (vanish on refresh) — real w/ backend.
- SCARCE-BOOST ALLOTMENT: per-user weekly allotment + replenishment = backend.
- PROPOSER DISPLAY NAME: raw account id now; real name w/ Profile + backend.

# ============================================================
# PROPOSAL LIFECYCLE — three paths (DECIDED; mostly backend-era)
# ============================================================
PATH 1 — Donations, ALREADY building: post -> milestones tick from start (current).
PATH 2 — Donations, NEEDS FUNDS FIRST ("Raising") [KS-style all-or-nothing]: GOAL + reasonable
  DEADLINE; sits in RAISING (no delivery clock). Goal MET -> "Start building" -> milestone clocks begin
  relative to start. Goal MISSED -> "Did not reach funding goal — unable to build": NEUTRAL/archived/no
  penalty. Donations stay IMMEDIATE tips (NO escrow at this layer; escrow is Phase 2). Anti-abuse:
  cadence/silence (long Raising + no start = red flag).
PATH 3 — TREASURY DESK track (SORA Nexus): "Under review" (no clock/penalty) -> Approved (milestones
  begin) OR Not approved (neutral archive).
BUILD: states/transitions/clocks/review-states need persistent state (backend).

# ============================================================
# END-STAGE POLISH PASSES (near the end, like i18n)
# ============================================================
- MOBILE PASS (NEXT after frontend, BEFORE backend per Nick): full PARITY already built (reflows/
  stacks); this pass = touch-targets, spacing, type-scale, collapse-filters-on-mobile, switcher/modals/
  sticky-rails feel on phone.
- LIGHT MODE: CSS-variable tokens. Gold on warm off-white/cream (NOT stark white, NOT gold->red). Red
  = danger. Light/dark toggle in top bar.
- FONT PASS: self-host official Sora; decide which labels stay JetBrains Mono.
- HERO REDESIGN: make motto "Productive work burns true" shine (gold on "burns true", flame flicker).
- MOTION pass: flame flicker (hero + Treasury) + burn pulse; reduced-motion safe.
- COMPOSE VALIDATION UX: inline field-level errors. NUMBER INPUTS: apply Donate's spinner-removal to
  Compose XOR field. i18n: EN default + ES/ZH/HI/AR(RTL)/PT/RU/JA/FR.
- Contextual "Why?" expanders (see Donate-modal TODO) rolled out app-wide.

# ============================================================
# DONE / REUSABLE
# ============================================================
- CORS proxy (vercel.json + Vite proxy /taira,/minamoto); Vite config; browser bridge
  (irohaBrowserBridge.ts + nativeStub.ts — PROVEN Taira read: 25,000 XOR).
- Shell src/web/ (index.html, main.ts, App.vue [nav + gold Post btn + top-right avatar->own profile +
  DEMO account switcher], tokens.css [+themed scrollbars], assets/seal.png, flame.png). Components:
  CountUp.vue, Flame.vue (now gold|fire variant).
- BUILT (new direction, ALL DONE): Feed, Story, Compose, Profile, Explore, Treasury, About. Social
  mechanics + Donate modal wired (in-memory). Citizens unwired from nav (dormant on disk). Old
  Overview/Proposals/Submit dormant.
- GOLD BUTTONS unified hover (lift + brighten + shadow) in-place across nav Post / Compose / Donate /
  deliver / modal confirm / comment Post (standardize-in-place, not a shared class — Vue scoped styles).
- DEMO ACCOUNT SWITCHER (App.vue, DEMO_MODE only, crimson-tinted): DEMO_ACCOUNTS = demo/viewer/maker;
  setDemoAccount; currentAccountId falls back to demoAccountId. Lets solo dev TEST non-owner experience
  (evidence control hidden, no PROPOSER label on others' comments, "Their work" profile, support enabled
  for others). NEVER SHIPS — gate before launch. (This tool surfaced the per-account backer bug.)
- Store commons.ts: underwriting + story + track + milestone fields; savedProposals/isSaved/toggleSave;
  proposerLabel; markChapterDelivered; viewingProfileId/setViewingProfile; draft refs. submitProposal
  stamps xorBurned "0" + track "donations". DEMO_MODE relaxed gates.
- Store social/donate: liked/boosted/followed/donatedProposals + isLiked/isBoosted/isFollowing +
  toggleLike/toggleBoost/toggleFollow + donate (in-memory, unique-backer keyed account::proposal,
  self-donation guarded). Proposal type +likes/boostCount/followers/backers/totalDonated. scrollToComments
  flag (comment->story jump). DEMO_ACCOUNTS/demoAccountId/setDemoAccount.

# ============================================================
# BUILD ORDER
# ============================================================
1. Shell + nav .......... DONE
2. Feed ................. DONE
3. Story detail ........ DONE
4. Profile ............. DONE
5. Explore ............. DONE
6. Social/burn mechanics  DONE (6a like/boost/follow/comment; 6b Donate modal — in-memory)
7. Reframe Treasury/About/Citizens  DONE (Treasury+About reframed; Citizens removed from nav)
>>> FRONTEND COMPLETE <<<
Next: (opt) Donate "Why 1%?" expander -> MOBILE polish pass -> SHARED BACKEND (Phase-1 incl. challenge
window) -> CHAIN INTEGRATION (money, Taira first) -> end-stage polish passes.

# ============================================================
# KEY FACTS
# ============================================================
- Taira XOR asset id: 6TEAJqbb8oEPmLncoNiMRbLEK6tw (src/constants/chains.ts ~line 22)
- "i105" = Iroha account-address format (SDK encodeI105AccountAddress).
- DEMO_MODE:true relaxes gates + powers demo switcher; EXPERIENCE-ONLY, touches no XOR, gate before ship.
- citizenCount reads parliament.citizenCountDisplay (real number, or "—" if null) — connectable if a
  Commons-citizen role ever exists.
- PARKED: vote-to-fund, 5 XOR post fee, Signal=60% aye. Ref: proposal-underwriting-file-DRAFT.md.
- TOP-BAR (later): notifications (client-derived) + feedback icon + connect/wallet button.

[SEARCH — TWO entry points, ONE system]
- Explore: primary search + filters + sort (DONE). Top-bar global search: express lane -> Explore (later).
- Covers proposals + profiles. Client-side filter works now; REAL scalable search = backend.

[PAGINATION — strategy decided, build with backend]
- EXPLORE: NUMBERED PAGES (~20/page, "showing X-Y of N"). FEED: "LOAD MORE" (~15-20/batch) — NOT
  infinite scroll (dopamine pattern SOCIAL LAYER rejects). Real pagination = backend (?page&limit).

[EXPLORE status filter — expand at backend era]
- Now: Active / Delivered / All. Later (backend dispute): "Confirmed", "Open concern / response
  requested" (NEUTRAL, not "Disputed"), "Overdue". NO "Disputed" scarlet-letter filter.

[PRE-LAUNCH PUBLIC REVIEW — practice (decided)]
- Publish ship-ready code PUBLIC + invite scrutiny BEFORE real XOR moves (free audit substitute).
  Point reviewers at money code; make runnable on Taira; real time + solicit in SORA channels; act on
  findings; credit bug-finders. SEQUENCE: build -> Taira test -> PUBLIC REVIEW -> fix -> launch low-stakes
  -> ~1yr uneventful -> THEN escrow/Desk.

[Compose — "Post your story" button polish] — DONE (got unified gold hover). (XOR-field spinner-removal
  still TODO in polish.)

[Explore card icons — make interactive when <StoryCard> extracted]
- Explore engagement icons DISPLAY-ONLY; Feed's interactive+guarded. Make them match when extracting a
  shared <StoryCard> (card markup duplicated Feed/Explore — every change done twice). DEFER; revisit
  during public test based on feedback.
[REFACTOR — extract shared <StoryCard>] — de-duplicate Feed/Explore card. Do before/with backend.

[FUTURE — "Commons citizen" (idea, not committed)]
- Citizens REMOVED from nav: old content = sortition-funding panel system Commons no longer operates;
  citizenship is a SORA Governance concept + sortition is a SORA Nexus initiative. Citizens.vue kept
  on disk (dormant), unwired.
- IDEA worth keeping: one day a "Commons citizen" = a real earned stake/role WITHIN Commons (not just
  inherited from SORA Governance). Revive with genuine Commons purpose if/when that role exists. No commitment.
