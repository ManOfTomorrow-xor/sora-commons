# SORA Commons — Web Build Status

Browser web-app inside this repo (src/web/), reusing the proven Iroha browser bridge + Vite config.

## HOW TO RUN
cd /mnt/c/Users/ntorr/iroha-demo-javascript
npx vite --config vite.config.ts      # http://localhost:5174
# after config changes: rm -rf node_modules/.vite, then hard-reload (Ctrl+Shift+R)
# "changed it but nothing happened" = stale Vite build -> rm -rf node_modules/.vite + Ctrl+Shift+R.
# Paste big files directly into VS Code, NOT terminal heredoc (heredoc corrupts files).
# Full-file replacement (select-all, delete, paste) is SAFER than scattered micro-edits — most paste
#   failures this session were half-applied multi-edits. Verify after: grep -c "{" vs "}".
# One small step at a time. Commit at each checkpoint.

# >>> STATUS: ENTIRE FRONTEND DONE (steps 1-7) + post-frontend UX pass DONE (contextual expanders,
#     char limits, See-more clamps, funding modes, story-display fixes). Next: MOBILE polish pass ->
#     SHARED BACKEND (Phase-1 scope incl. challenge window) -> CHAIN (money, Taira first) -> end-stage polish.

# ============================================================
# PHILOSOPHY / GUIDING PRINCIPLES (read FIRST — the "why" behind every decision)
# ============================================================
# When a question isn't explicitly answered below, derive the answer from these. They are the spirit
# of the project; the rest of this doc is their application.

1. HONESTY OVER POLISH. The app must never imply something is real when it isn't. No fake/seed data —
   honest empty states instead. Features that aren't built are clearly "coming," not faked. In-memory
   previews are labeled as previews. This matters MOST around money and evidence. If a choice trades a
   slicker demo for an honest one, choose honest.

2. BURN RIDES ON REAL VALUE, NEVER A TOLL. Burning only happens as a byproduct of real support
   (1% of a donation). Proposers are NEVER charged — not to post, not to deliver. Nothing is collected
   or extracted; burned XOR is destroyed. The motto: "productive work burns true."

3. ISONOMIA — NO PAY-TO-RANK, NO WHALES. Standing is earned, never bought. Boosts are free + equally
   allotted (scarce so they carry signal). Donations fund builders but never buy rank. Reputation may
   GATE access but NEVER weights a vote or a draw — the moment tenure buys power, you've rebuilt
   plutocracy in a new denomination. Guard against self-dealing (a proposer can't inflate their own
   numbers).

4. WARMTH IN SERVICE OF REAL WORK — NOT ENGAGEMENT-MAXIMIZING. TAKE the good social parts (following,
   comments, real momentum, profiles). LEAVE the manipulative ones (engagement algorithms, dopamine
   loops, infinite scroll, vanity metrics). Every social feature must serve the work, not addiction.
   (E.g. Feed uses "Load more," not infinite scroll, on purpose.) NOTE: contextual "Why?" expanders
   serve the work (they explain a mechanism at the decision point); they must NOT become nag-prompts.
   Each one has to earn its place at a real moment of doubt — collapsed by default, never auto-opened.

5. THE RECORD IS THE PRODUCT. Commons is a permanent, public, followable record of real work — a story
   you follow start to finish. Trust comes from TRANSPARENCY + CADENCE (real updates over time), not
   from verdicts. SILENCE is the real red flag, not a single concern. The Commons surfaces concerns and
   lets people judge; it issues NO verdicts (it can afford not to, because donations aren't held — see
   #6). Never punish honest failure; most small failures are inexperience, not fraud.

6. STAKES MATCH SAFEGUARDS — GROW THE CEILING BEFORE RAISING STAKES. Launch LOW-stakes (small direct
   tips, no escrow, no pooled funds). Heavier capability (escrow, formal adjudication) only arrives once
   the system has earned trust through real operation AND there's real audit capacity + legal footing.
   Auditing capacity is the CEILING on how much money the system may touch. "No verdicts" works
   precisely because nothing is held; the moment money is HELD (escrow), binding resolution becomes
   necessary — which is exactly why escrow is deferred to a later, heavier phase.

7. MONEY CODE IS SACRED. Integer/BigInt only, exact precision, splits sum exactly, validate everything,
   explicit confirmation, Taira-tested first, read back on-chain. Keep it tiny, isolated, simple. Open-
   source it and invite public review BEFORE any real XOR moves. (Full discipline in MONEY CODE section.)

8. COMMONS IS PART OF SORA NEXUS, NOT A STANDALONE EMPIRE. Some things are Commons' to build (the
   record, donations, the challenge window). Some are SORA Nexus ecosystem initiatives the Commons
   merely connects to or watches (the Treasury Desk; sortition). Don't claim ownership of, or promise,
   ecosystem-level things. The ecosystem being funding-oriented is WHY adoption is plausible — builders
   are already here; XOR is the incentive; Commons is the front door / track-record on-ramp.

9. NO DEADLINE; DO THE WORK PROPERLY. Solo is fine — great things start solo. Take all the time needed;
   build one careful step at a time; commit at every checkpoint. The risk to manage is momentum + the
   regulatory footing, not capability. Don't ship the heavy stuff early to hit a date that doesn't exist.

10. VERIFY THE LOOP. Don't ask anyone to "trust the institution / the chart / the model." Every action
    leaves an inspectable, contestable, correctable record. A system that can be wrong in ways it can
    see and fix is the only kind worth building. (This + 3Gi — Global Governance, Growth, intelligence
    as ONE loop — is the intellectual spine; full prose lives in About's "thinking behind it.")

# WORKING STYLE (process): ONE small step at a time. Paste big files into VS Code (not heredoc). Commit
# each checkpoint. Claude's sandbox CANNOT reach Nick's machine — Nick runs all commands + pastes code
# himself (he PREFERS this; learns the codebase). Watch for paste artifacts (dup lines, extra/missing
# braces, stray chars like maxlength=:"400", wrong import path commons vs commonsConfig, editing a stale
# Downloads copy, a <template> tag appearing mid-script = file pasted INTO old file instead of replacing).
# Brace-debug: grep -c "{" vs "}", then awk running-balance to find the line. NOTE: Vite/esbuild does NOT
# type-check — TS errors in the Problems panel don't block the dev server; they're editor hints to clean.

# ============================================================
# PHASE 1 vs PHASE 2 — SHARPENED (DECIDED)
# ============================================================
PRINCIPLE: the public testnet tests exactly what launches day-1. Whatever is day-1 must be testnet-
ready; anything not testnet-ready is Phase 2 by definition. NO DEADLINE — launch when truly ready.

PHASE 1 (day-1; ALL built + Taira-tested + publicly reviewed before any real XOR moves):
- Feed / stories / follow / like / comment
- Donations (1% burn / 99% builder) — money code; highest-stakes review surface
- CHALLENGE WINDOW + dispute/concern system (decided this session — accountability ships WITH money;
  can't predict growth, won't get caught under-built). Needs backend (timers, multi-user flags,
  notifications, Delivered->Confirmed graduation).
- Proposer labels / reputation (meaningful as data accrues)
- Boosts (free but scarce: per-user allotment + replenishment)

PHASE 2 (later — only after ~1yr proven operation + audit capacity + legal footing):
- ESCROW (Raising + milestone) — a COMMONS direction; heavy custody/regulatory weight. NOTE: per-chapter
  XOR amounts (retired from the tip model this session) RETURN here — escrow is the only context where a
  per-milestone amount means anything (money released per tranche).
- TREASURY DESK — a SORA NEXUS initiative (NOT Commons-built); Commons routes large proposals to it.
- FORMAL ADJUDICATION — only matters once funds are HELD (escrow); Commons looks to SORA ecosystem,
  never issues its own verdict. At the donation layer (money already delivered) it doesn't apply.
- FRAUD-BOUNTY (if ever — parked/risky).

SORTITION = SORA NEXUS ecosystem initiative, NOT a Commons feature. Admire its logic (a random draw
can't be bought); watch how it evolves; NO promise it ever enters Commons.

# ============================================================
# SOURCE ARTICLES — 3Gi FOUNDATION (Nick's/Makoto's SORA essays the Commons is built on)
# ============================================================
# These are the founder's published SORA essays ("In 2016", "Infrastructure becomes valuable", the
# 3-part Global Governance / Growth / intelligence series, "The observer effect"). Commons is the
# concrete, small-scale instantiation of their ideas. The through-line, faithful to the texts:
#
# 3Gi = GLOBAL GOVERNANCE + GROWTH + intelligence, understood as ONE LOOP (not 3 slogans):
#   - GLOBAL GOVERNANCE defines the lawful surface — WHO can change shared rules and HOW a change
#     becomes legitimate. Designed at the MECHANISM level, not campaign-slogan level. Anti-capture.
#     "The old world already has global governance; it's just hidden, captured, unaccountable." Goal:
#     make these powers explicit, auditable, democratic.
#   - GROWTH defines what the system is FOR: money created against REAL PRODUCTION, not speculation.
#     Core distinction: CLAIMS are not CAPACITY. "Issue tokens only against production" / "create
#     claims only where claims can become output." Werner's disaggregated credit (credit for
#     production ≠ credit for speculation/assets). Target = maximum PRODUCTIVE CONVERSION, not max
#     issuance. Token price is NOT the economy ("a chart is not an economy").
#   - INTELLIGENCE = the disciplined process by which a system gets WISER after contact with reality
#     (Shōtoku: "Few are born knowing; by earnest reflection one becomes wise"). Observe -> remember
#     -> evaluate -> act -> AUDIT THE ACTION -> update. NOT "AI bolted onto a token." AI produces
#     evidence/forecasts/recommendations INSIDE a governed process; it must NEVER become the judge
#     ("the machine can assist judgment; it must not become judgment without a constitution").
#
# KEY DOCTRINES (carry these into every Commons decision):
#   - VERIFY THE LOOP: not "trust the institution" (old world) / "trust the chart" (crypto casino) /
#     "trust the model" (technocrat) — instead, every action leaves an inspectable, contestable,
#     correctable record. "A system that can be wrong in ways it can inspect, contest, remember, and
#     correct is the only kind worth building." (This IS the Commons' public-record + challenge-window.)
#   - SEPARATION OF CONCERNS / DON'T COMPLECT: the old system fuses money+politics+collateral+class;
#     crypto re-fused governance+token-ownership, TVL+value, attention+legitimacy. Keep functions
#     SEPARATE: underwriters allocate, auditors test, producers deliver, citizens govern, models
#     assist, protocol remembers. No single actor collapses the loop into themselves. (Commons echo:
#     self-support guard — a proposer can't judge or inflate their own work. ALSO: funding-goal vs
#     open-donations kept as two CLEAN modes, never blended — mixing them rebuilds the goal piecemeal.)
#   - INVARIANT vs PARAMETER: invariants define identity and never bend (no unauthorized issuance, no
#     hidden mutation, no model silently becoming law, no governance change without process).
#     Parameters are steering surfaces that adapt through a DEFINED process. "Trust does not require
#     paralysis; trust requires lawful change." (Maps to: Commons launches strict/low-stakes; phases
#     expand deliberately, never by quiet exception.)
#   - REPUTATION MEMORY WITHOUT CASTE: the system remembers who delivered/repaid/went silent, with
#     explicit scope + decay + privacy. But reputation gates ACCESS, NEVER weights a vote/draw —
#     else plutocracy in tenure-denomination. "Memory without forgetting becomes surveillance;
#     forgetting without memory becomes repetition." (Commons: delivery-weighted labels, cadence.)
#   - ACCOUNTABLE DISCLOSURE, NOT PANOPTICON: "the right to narrow proof" — prove what's required,
#     reveal no more than the process needs. (Future Commons: evidence hashes/commitments before full
#     disclosure; privacy-preserving verification.)
#   - SIMPLE != EASY; BUILD INVISIBLE, REBUILD BEFORE CRITICAL: durable infrastructure is built away
#     from the market's gaze (the observer effect — being watched makes you build for traders). It
#     removes accidental complexity rather than piling features. (Maps to: no-deadline, build clean,
#     public review before stakes, keep money code tiny/isolated/simple.)
#   - NEUTRAL ADAPTIVE INFRASTRUCTURE > spectacle / sovereignty-silo (the three paths). Commons takes
#     the "system that learns" path, not the "ask the market to believe" path.
#   - XOR IS A TIME BRIDGE / PRODUCTION LEDGER: brings future production into the present without lying
#     about the future. Burn/donations on Commons = the small-scale honest version of "claims tied to
#     real value." CITIZEN (bond 10,000 XOR) = entering the constitutional machinery, not a spectator
#     (full citizen/Parliament/sortition machinery is SORA-level, not Commons-built).
#
# HOW COMMONS INSTANTIATES 3Gi (the mapping to keep honest):
#   Governance   -> the rules of the record + challenge window + no-verdicts + anti-self-dealing.
#   Growth       -> donations fund REAL work; the record makes productive work legible; burn rides on
#                   real value. Commons is a tiny, low-stakes production-legibility layer.
#   intelligence -> the loop: post -> evidence -> challenge window -> confirmed/concern -> permanent
#                   record the ecosystem learns from. "Verify the loop" made concrete at small scale.
# Commons is deliberately the SMALL, honest, low-stakes front door to this larger 3Gi vision — proving
# the loop at tip-scale before the heavy machinery (escrow, Desk, formal adjudication) is earned.

# ============================================================
# THE VISION (DECIDED)
# ============================================================
Every proposal is a STORY you follow start to finish. Proposers log verifiable milestones (chapters);
people FOLLOW/LIKE/COMMENT/BOOST/DONATE. Permanent public record of productive work the rest of SORA
reads from.
- IDENTITY: Commons = enabler of SMALLER projects + universal proposer tracker + front door to the
  ecosystem. Large funding routes to the SORA-Nexus Treasury Desk; Commons holds the story either way.
- ADOPTION TAILWIND: SORA Nexus exists in part to FUND BUILDING (Desk is core to XOR's purpose).
  Builders already oriented here; XOR donations = concrete reason to post on Commons.

# ============================================================
# BURN MODEL (DECIDED)
# ============================================================
- Free to post/follow/like/comment. Burn from DEMAND side (backers), never SUPPLY (proposers).
- DONATE: 1% burns, 99% to proposer. Direct tip now; escrow is Phase 2. Donations = conviction signal.
- BOOST: free but scarce, ranks by COUNT, not purchasable. LIKE: free heart.

# ============================================================
# FUNDING MODES (DECIDED this session) — one ask per proposal, never per-chapter
# ============================================================
WHY: per-chapter XOR amounts only mean something under ESCROW (money released per tranche). In a direct-
tip model the donation goes straight to the proposer; it isn't allocated across chapters. Attaching
amounts per chapter implied a structure that doesn't exist -> RETIRED until Phase 2 escrow.

- GOAL mode: proposer asks for a single "Total XOR requested." Card shows "X / Y XOR raised"; Story rail
  shows the goal as a stat ("XOR goal").
- OPEN mode ("Open to any donations"): no goal, accept whatever supporters give — the most honest, lowest-
  stakes option (no fake target to invent, none to miss). Card shows "X XOR raised"; Story rail stat reads
  "— / Open to donations". xorRequested stored as "0" in this mode.
- CHAPTERS are IDENTICAL in both modes: description + due date + evidence-you'll-present. NO amount.
  Both modes still REQUIRE >=1 chapter with description + due date + evidence (the deliver-then-prove loop
  is the trust core; only the budget is removed in open mode).
- Two CLEAN modes — never blended (no "open but with amounts on chapters"); that would rebuild the goal
  piecemeal (don't-complect).
- Card carries the funding signal via the RAISED LINE only (no extra badge — was redundant with the
  "Seeking donations" track pill + the raised line; dropped).
- Store: CommonsProposal.fundingMode?: "goal"|"open"; Milestone.xorAmount now OPTIONAL (dormant escrow
  code still references it). draftFundingMode ref (default "goal"). isDraftValid is mode-aware + requires
  evidence + NO milestone-sum-match. submitProposal stamps fundingMode + xorRequested "0" when open.

# ============================================================
# BOOST MODEL (free but scarce) — SPEC SHARPENED this session
# ============================================================
- 3 boosts per person, FRESH EACH WEEK, NO ROLLOVER (unused expire; you never hold more than 3).
  (Supersedes the old "~3-5/week" note.) One boost per proposal. Scarcity = signal; free+equal = isonomia.
- Weekly cycle anchored to EACH PERSON'S JOIN DATE (not a global reset) -> backend MUST store joinedAt
  per account. Mechanic: weekIndex = floor((now - joinedAt)/7d); each new weekIndex resets to 3; track
  spent-this-week; never carry leftovers.
- In-memory now = simple one-boost-per-proposal toggle (cap NOT enforced yet); real allotment = backend.
- About copy + rail "Why boost?" expander state "three a week."
- DECLINED: buy-boost-packages (breaks isonomia) + conviction-burn (cannibalizes donations).

# ============================================================
# CONTEXTUAL "WHY?" EXPANDERS (DONE — shared component) — "warmth in service of work" #4
# ============================================================
- WhyExpander.vue (src/web/components/): collapsed-by-default toggle + concise copy slot + deep-link that
  closes any modal and navigates to an About anchor. Props: label, anchor, linkText. Emits "navigate"
  (parent forwards to App nav). App.go(id) now parses an optional "#anchor" suffix (e.g. "about#burn") and
  scrolls to it via nextTick+rAF; plain ids unchanged (backward-compatible).
- DONE: Donate modal "Why 1%?" -> About #burn (fee-vs-burn honesty copy). Story rail "Why boost?" ->
  About #boost (3/week scarcity copy).
- NEXT candidates (only at REAL doubt points): challenge window / "Confirmed" -> #challenge (gated on
  backend; honest interim = a short inline note, not a live expander). Treasury Desk badge (only once Desk
  exists; must point outward as "coming"). SKIP: proposer labels (tooltip is enough, everyone=Newcomer),
  self-support guard (existing title tooltip), like (it's a heart).

# ============================================================
# CHAR LIMITS + COUNTERS (DONE — shared component) — honesty #1
# ============================================================
- CharCount.vue (src/web/components/): live "N / max" under a field; turns red + " · over the limit" when
  over. Compose validation blocks Post while any field is over; status bar warns "Some fields are over the
  character limit — trim them to post."
- SOFT caps (not hard maxlength) on the long fields ON PURPOSE: a hard maxlength can never "exceed," so no
  warning could fire — the chosen behavior is type-past-then-warn-and-block.
- LIMITS: title 120 · summary 160 · STORY 5000 · each fact 400 · risk-bearer 160 · failure 400 ·
  public-benefit 400 · chapter description 200 · evidence-you'll-present 500.
- Structured fields stay short by design (a counter, not an essay). The STORY field is the one long-form
  surface (5000).

# ============================================================
# SOCIAL LAYER ("warmth in service of real work")
# ============================================================
TAKE: feed/spotlight, following, threaded comments (proposer replies highlighted), real momentum,
profiles. LEAVE: engagement algorithms, dopamine loops, vanity metrics, pay-to-rank.

# ============================================================
# COMMONS <-> TREASURY DESK (Desk = SORA Nexus initiative, NOT Commons-built)
# ============================================================
Commons = front door + record for ALL proposals. Track tag: "Seeking donations" (default/only now) vs
"Under Treasury Desk review" (NOT self-claimable; Desk produces a verifiable SIGNAL the proposer
presents; system verifies; mechanism TBD when Desk exists). COMPOSE: both shown, Desk DISABLED ("coming").

# ============================================================
# PAGES — ALL DONE
# ============================================================
NAV (5): Feed / Explore / [Post button] / Treasury / About. Profile + Story = contextual. Citizens
REMOVED from nav (see FUTURE note).

## FEED (DONE)
Sort chips. STORY CARD: avatar+shortId+proposer label + color category badge (terracotta Production /
teal Public-good) + bookmark; title + summary; track badge; progress bar; engagement row — INTERACTIVE
like/boost (lit + count, hover-pill web / always-pill mobile, self-support GUARDED) + comment (opens
story scrolled to conversation) + RAISED LINE. Top Boosted (⚡) + "Commons today" stats in STICKY right rail.
- RAISED LINE is funding-aware: GOAL -> "X / Y XOR raised"; OPEN -> "X XOR raised". This single line carries
  the goal-vs-open signal (no separate funding badge — dropped as redundant).

## STORY (DONE)
Hero + two columns: MAIN (one-line SUMMARY at top + "The story" [full p.story, See-more clamp], FACTS grid
[See-more clamp], ACCOUNTABILITY [hides empty], CHAPTERS w/ evidence submit + dashed ATTACH-FILE placeholder,
CONVERSATION) + STICKY SUPPORT RAIL (Donate primary, like/boost/save, +Follow, "Why boost?" expander, totals).
All support actions GUARDED (disabled on own proposal; Save enabled). DONATE MODAL here.
- DISPLAY FIX: "The story" now renders p.story (full narrative); the one-line summary shows separately at top
  (was a bug — story section had been showing the summary).
- Clampable.vue (src/web/components/): collapses text to ~5 lines, "See more"/"See less" toggle, only shown
  when the text actually overflows (measured on mount). Applied to story + each fact box.
- BADGES grouped on one row under the title: category + track ("Seeking donations"), color-matched to Feed
  card (Production terracotta #E0986A). Old standalone trackline removed.
- CHAPTERS show "due {date}" only (no per-chapter amount). Funding ask lives ONCE in the rail totals as a
  stat: GOAL -> "{xorRequested} / XOR goal"; OPEN -> "— / Open to donations".
- RAIL TOTALS grid: goal · raised · burned · backers · followers (funding ask folded in as the first stat,
  not a floating line).

## COMPOSE (DONE)
Story-first: title, summary, THE STORY (gold border), file attach (placeholder), category, track
(donations active / Desk disabled), facts, FUNDING toggle (goal vs open), [goal: Total XOR requested],
chapters (desc / "Evidence due by" date w/ sequential validation / "Evidence you'll present"), risk + public
benefit. Every text field has a live CharCount; Post blocks on over-limit or missing required field.
- Chapters have NO per-chapter XOR field (retired — see FUNDING MODES). Evidence is now REQUIRED per chapter.
- Removed: per-chapter amount, the chapters-sum tally/mismatch, redundant "(optional)" on Public spillovers.

## PROFILE (DONE)
PUBLIC: avatar/bio/label/reputation/posted proposals/track record. OWN: profile pic (placeholder),
totals DONATED/BOOSTED/BURNED, SAVED (works), My Drafts (backend). Tap proposer OR top-right avatar.
- NOTE: proposer LABEL is per-ACCOUNT (the person's track record), so it shows on ALL their stories —
  correct (one delivery -> "Proven" everywhere their name appears). Per-PROPOSAL state lives on the chapters
  (In progress / Delivered / Confirmed), separate from the account label.

## EXPLORE (DONE)
Search + category/track chips + status toggle (Active/Delivered/All) + sort. Reuses Feed card. Icons
DISPLAY-ONLY here (Feed's interactive) — deferred to <StoryCard> refactor. Top-bar search + pagination = backend.

## TREASURY (DONE — reframed)
Donation-framed burn record. Hero total burned (commons.totalXorBurned) + FIRE-variant flame. Stats:
XOR raised / Burn events / Backers. Ledger reads donation-driven xorBurned ("From donations"), honest
empty state. Why-burn explainer. Dropped dead proposal-fee + milestone-burn stats.

## ABOUT (DONE — reframed)
Hero (followable-record identity) + "What this is" + HOW IT WORKS (deep-link ids #burn #follow
#challenge #boost, Phase-1 present-tense; challenge-window says no-verdicts BECAUSE donation already
reached builder; #boost says "three a week") + WHAT'S COMING (#desk: Desk = SORA Nexus initiative; escrow
= maybe-Commons-later; adjudication = ecosystem, only matters w/ escrow) + collapsible "thinking behind it"
(3Gi, reputation-can't-harden, separation-of-powers [cites self-support guard], SORTITION as ecosystem-
watch/no-promise, verify-the-loop) + honest phase note. .mech sections have scroll-margin-top for deep-links
(WhyExpander links land here via App.go("about#anchor")).

# ============================================================
# IDENTITY / REPUTATION / ANTI-FRAUD (DECIDED)
# ============================================================
- PROPOSER LABELS: Newcomer/Proven/Veteran/Treasury Desk/Flagged. Today everyone=Newcomer (correct).
  Later weight completion RATE / time active / clean disputes, not raw count. Label is per-ACCOUNT.
- REPUTATION: delivery-weighted; gates visibility/trust ONLY, NEVER weights a vote/draw.
- SELF-SUPPORT GUARD (DONE): proposer can't like/boost/follow/donate own proposal — buttons VISIBLE but
  DISABLED (owner sees counts; can't self-inflate). Save enabled. Frontend disable + store guard on
  donate(); real enforcement = backend.
- ANTI-FRAUD: low stakes -> protection is TRANSPARENCY not escrow. Permanent public record.

# ============================================================
# VERIFICATION + CHALLENGE WINDOW (DECIDED — Phase 1; validated vs Kickstarter)
# ============================================================
- Submit evidence -> "Delivered" (challenge window opens ~7d). No concern -> "Confirmed" (NEVER
  "Verified" — silence isn't proof). Concern -> contested, no auto-graduate, proposer responds, both on record.
- FLAGGING: anyone, WRITTEN REASON required, weighted by source; single flag must NOT publicly brand.
- FRAMING: NO punitive "Disputed" scarlet letter. NEUTRAL "concern raised." CADENCE = trust signal;
  SILENCE = red flag.
- NO VERDICTS (self-consistent: donation already reached builder -> nothing to claw back/rule on).
  Adjudication only relevant with ESCROW (Phase 2) where funds are HELD; even then -> SORA ecosystem.
- BUILD: frontend now = in-memory "Delivered" only. Full window (timers/flags/notifications/graduation)
  = SHARED BACKEND, PHASE 1.

# ============================================================
# FRAUD-BOUNTY — RISKY / PARKED (not launch)
# ============================================================
~5% -> 2.5% burn + 2.5% pot to reward fraud-catchers. RISKY: changes split, needs reliable adjudication
(else extortion/collusion), custody/governance/regulatory. Only viable later atop proven adjudication.

# ============================================================
# STRATEGY (DECIDED)
# ============================================================
- LAUNCH: SORA MAINNET (Minamoto), clearly-labeled EARLY BUILD, LOW stakes. Phase-1 set built+tested first.
  NO DEADLINE. Rehearse everything on Taira until "failures are boring," then move the SAME proven ops to
  Minamoto with SEPARATE keys.
- INCENTIVES: NO airdrop-for-usage. Funnel to ecosystem funding + founding badges + white-glove + seed stories.
- REPO: iroha-demo-javascript/testing. Public `sora-commons` repo EMPTY until runnable.
- FONT: self-host official SORA typeface in real app. Demo used Google Fonts. (Details in FONT PASS.)
- REGULATORY: Nick checks jurisdiction before real donations (Claude not a lawyer — flagged).
- AUDITING: mostly self-audit; capacity = CEILING on money touched. Escrow/Desk MUST NOT ship until real
  capacity. Substitutes: open-source money code, exhaustive Taira testing, tiny/isolated/simple code.

# ============================================================
# MONEY CODE — DISCIPLINE (non-negotiable)
# ============================================================
- INTEGER/BigInt only; base units at exact precision (CONFIRM from chain, don't assume 18 — STILL OPEN,
  Iroha docs don't state XOR precision); decimal for display.
- 1% split in base units; burn + proposer sum EXACTLY to input.
- Validate (positive, >0, within balance, within precision, reject malformed/overflow). Explicit confirm.
- TEST ON TAIRA FIRST (edge amounts, failures, double-submit). Read back on-chain.
- Read-only Taira MCP bridge (taira.sora.org/v1/mcp) = useful inspection surface during money-code testing
  (read-first, explicit human approval before any write) — fits public-review discipline.

## DONATE MODAL (DONE — in-memory preview)
- Quick-picks (10/50/100/500) + manual decimal + live 1% split + confirm. Spinner-arrows removed,
  overflow-safe, capped 1,000,000 XOR (clamp + label hint + cap note).
- donate(): 99/1 split updates totalDonated/xorBurned; UNIQUE-backer keyed account::proposal;
  self-donation guarded. "Preview only" note. WARNING: simple decimal math = PREVIEW ONLY; real path =
  MONEY-CODE DISCIPLINE.
- "Why 1%?" expander DONE (WhyExpander -> About #burn).

# ============================================================
# ARCHITECTURE — FRONTEND / BACKEND / CHAIN
# ============================================================
- FRONTEND (DONE, against in-memory store): the Vue app.
- SHARED BACKEND (next-major; PHASE-1 SCOPE): DB for ALL social data — stories, milestones, comments,
  likes, boosts (+allotment + joinedAt), follows, saved, donations, DRAFTS, cadence, CHALLENGE WINDOWS +
  flags + notifications. All users see same data across devices. localStorage = dead end.
- SORA NEXUS CHAIN: truth for MONEY (donations, burns). Taira testnet first, then Minamoto mainnet.
Path: frontend (done) -> shared backend (Phase-1 incl. challenge window) -> chain (money, Taira first) -> polish.

# ============================================================
# DEFERRED FEATURES (build once, properly)
# ============================================================
- DRAFTS (backend, not localStorage). EVIDENCE deadline/overdue/UPLOAD/persistence (backend+storage).
- FILE ATTACHMENTS (storage). LIKE/BOOST/FOLLOW/DONATE persistence (in-memory now). SCARCE-BOOST
  ALLOTMENT + joinedAt (backend). PROPOSER DISPLAY NAME (backend).

# ============================================================
# PROPOSAL LIFECYCLE — three paths (DECIDED; mostly backend-era)
# ============================================================
P1 Donations, already building: milestones from start (current). Funding = GOAL or OPEN (this session).
P2 Donations, "Raising" first (KS all-or-nothing: goal+deadline; met -> build, missed -> neutral "unable to
build"; NO escrow here, escrow is Phase 2). P3 Treasury Desk track (SORA Nexus): under review -> approved
(milestones) / not (neutral archive). States/clocks = backend.

# ============================================================
# END-STAGE POLISH PASSES
# ============================================================
- MOBILE PASS (NEXT, before backend): parity already built; this = touch-targets/spacing/type-scale/
  collapse-filters/feel on phone.
- LIGHT MODE (CSS tokens; gold on warm cream, red=danger).
- FONT PASS: self-host official SORA typeface — repo github.com/sora-xor/sora-font (OFL-1.1). Full weight
  range Thin100..ExtraBold800 + italics + a VARIABLE font. Ship a small SUBSET (e.g. 400/500/600/700, +800
  for hero) OR the single variable woff2. OBLIGATIONS: bundle OFL.txt, keep copyright/reserved-name notice,
  don't sell the font alone. VERIFY the repo's fonts/ dir contents FIRST (may need TTF/OTF->woff2 conversion
  from sources) before wiring @font-face — don't assume prebuilt woff2 exist.
- HERO motto shine. MOTION (flame flicker, reduced-motion safe). COMPOSE inline field errors.
  i18n (EN+ES/ZH/HI/AR-RTL/PT/RU/JA/FR). Remaining contextual "Why?" expanders (challenge #challenge once
  backend exists; Desk when it exists).
- "See more" clamp already on Story story+facts (Clampable); could extend to chapter evidence / delivered
  evidence if those run long.

# ============================================================
# DONE / REUSABLE
# ============================================================
- CORS proxy + Vite config + browser bridge (irohaBrowserBridge.ts + nativeStub.ts — PROVEN Taira read 25,000 XOR).
- Shell src/web/ (App.vue [nav + gold Post + avatar->own profile + DEMO switcher; go(id) handles "#anchor"
  deep-links], tokens.css [+themed scrollbars], seal.png, flame.png).
- COMPONENTS: CountUp.vue, Flame.vue (gold|fire variant), WhyExpander.vue (contextual expander + About deep-
  link), CharCount.vue (live N/max counter, red over limit), Clampable.vue (See-more clamp, overflow-measured).
- BUILT (ALL DONE): Feed, Story, Compose, Profile, Explore, Treasury, About. Citizens unwired (dormant).
  Old Overview/Proposals/Submit dormant (still reference milestone.xorAmount — that's why it's kept OPTIONAL).
- GOLD BUTTONS unified hover (lift+brighten+shadow) in-place (Vue scoped styles, not a shared class).
- DEMO ACCOUNT SWITCHER (DEMO_MODE only, crimson): DEMO_ACCOUNTS demo/viewer/maker; setDemoAccount;
  currentAccountId falls back to demoAccountId. Tests non-owner experience. NEVER SHIPS — gate before launch.
- Store commons.ts: story/track/category/fact/milestone fields; fundingMode (goal|open); Milestone.xorAmount
  OPTIONAL; saved/proposerLabel/markChapterDelivered/viewingProfileId/draft refs (incl. draftFundingMode).
  isDraftValid mode-aware (requires title/summary/story/category + each chapter desc+date+evidence; goal mode
  also requires xorRequested>0; NO sum-match). submitProposal stamps xorBurned "0" + track "donations" +
  fundingMode + xorRequested "0" when open.
- Store social/donate: liked/boosted/followed/donatedProposals + isLiked/isBoosted/isFollowing +
  toggle* + donate (in-memory, unique-backer account::proposal, self-donation guarded). Proposal type
  +likes/boostCount/followers/backers/totalDonated. scrollToComments flag. DEMO_ACCOUNTS/demoAccountId/setDemoAccount.

# ============================================================
# BUILD ORDER
# ============================================================
1 Shell+nav DONE · 2 Feed DONE · 3 Story DONE · 4 Profile DONE · 5 Explore DONE ·
6 Social/burn mechanics DONE (6a like/boost/follow/comment; 6b Donate modal — in-memory) ·
7 Reframe Treasury/About/Citizens DONE (Treasury+About reframed; Citizens removed from nav)
>>> FRONTEND COMPLETE <<<
8 POST-FRONTEND UX PASS DONE: contextual "Why?" expanders (WhyExpander; Donate #burn + boost #boost);
  per-field char limits + over-limit warning (CharCount); See-more clamps + summary line + full-story fix
  (Clampable); funding modes (goal vs open) + per-chapter amounts retired; Story rail/badge cleanup; Feed
  raised-line funding-aware.
Next: MOBILE polish -> SHARED BACKEND (Phase-1 incl. challenge window) -> CHAIN (money, Taira first) -> end-stage polish.

# ============================================================
# KEY FACTS
# ============================================================
- CHAIN: Taira testnet = https://taira.sora.org · Minamoto mainnet = https://minamoto.sora.org.
  chain_discriminant: 369 = Taira, 753 = Minamoto. Rehearse on Taira, then same ops on Minamoto w/ separate keys.
- Taira XOR (fee) asset id: 6TEAJqbb8oEPmLncoNiMRbLEK6tw (src/constants/chains.ts ~line 22) — confirmed as the
  Taira fee asset the public faucet funds (~25,000 XOR).
- Read-only Taira MCP bridge: https://taira.sora.org/v1/mcp (read-first, human-approval before writes).
- XOR base-unit precision = STILL UNCONFIRMED from chain (don't assume 18) — resolve in CHAIN phase.
- "i105" = Iroha account-address format (derived per-network from pubkey + prefix; NOT the TOML domain).
- DEMO_MODE:true relaxes gates + powers demo switcher; no XOR; gate before ship.
- citizenCount reads parliament.citizenCountDisplay (real number or "—") — connectable if a Commons-citizen role ever exists.
- COMMONS_CONFIG import path = @/constants/commonsConfig (NOT commons). Vite root=src/web, port 5174.
- VITE/esbuild does NOT type-check — Problems-panel TS errors don't block the dev server (clean them anyway).
- PARKED: vote-to-fund, 5 XOR post fee, Signal=60% aye. TOP-BAR (later): notifications + feedback + connect/wallet.

[SEARCH] Explore = primary search+filters+sort (DONE). Top-bar global search -> Explore (later). Real search = backend.
[PAGINATION] Explore = numbered pages (~20). Feed = "Load more" (~15-20), NOT infinite scroll. Real = backend.
[EXPLORE status filter later] add neutral "Confirmed"/"Open concern"/"Overdue" (NOT "Disputed") at backend era.
[PUBLIC REVIEW] publish ship-ready code public + invite scrutiny BEFORE real XOR; runnable on Taira; credit finders.
[Explore card icons / <StoryCard> refactor] Explore icons display-only; make interactive when extracting shared
  <StoryCard> (card duplicated Feed/Explore). DEFER; revisit during public test based on feedback.
[FUTURE — "Commons citizen"] Citizens removed from nav (old sortition-funding content; citizenship is SORA Governance,
  sortition is SORA Nexus). Citizens.vue dormant on disk. IDEA: one day a real earned role WITHIN Commons. No commitment.