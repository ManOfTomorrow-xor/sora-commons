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
- Why scarce: a free UNLIMITED boost carries no signal (boosting everything = meaningless).
  Scarcity makes each boost a deliberate choice -> real signal. Free + equal allotment -> isonomia
  intact, no pay-to-rank, no whales. (Original "5 boosters" instinct — kept, but withOUT selling more.)
- Optional later: decay (fresh rankings) + light reputation-weighting (resist sockpuppets).
- Needs backend (per-user allotment + replenishment). Design locked; build later.
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
label badge + color-coded category badge + bookmark; BIG title + 1-line summary; track badge;
milestone progress bar (green "✓ Delivered" + green bar when complete); muted engagement row
(like/⚡boost/comment/donated). Top Boosted = right rail (desktop) / strip (mobile), only if boostCount>0.
"The Commons today" stats + "Tell your story" CTA in rail.

## STORY PAGE (DONE)
Full-width hero (color-coded category badge, title, proposer->profile + label badge, track tag).
Two-column: MAIN (story narrative+files, FACTS grid [boxed], ACCOUNTABILITY section [risk/failure,
blue-accented, hides when empty], CHAPTERS, CONVERSATION) + STICKY SUPPORT RAIL (Donate primary,
clean SVG icon row like/boost/save, +Follow, totals raised/burned/backers/followers). Mobile: rail
reflows below content (full parity). Honest done-signals (green check-dot + tinted row + "✓ Evidence submitted").

## COMPOSE (DONE)
Story-first form: title, one-line summary (card), THE STORY (big narrative, gold border), file attach
(placeholder), category, funding track (donations active / Desk disabled), facts, chapters
(desc/XOR/"Evidence you'll present"/date picker "Evidence due by" w/ sequential validation), risk+
public benefit. Centered. Gold "Post" button in desktop nav. Posts via submitProposal -> Story.

## PROFILE (DONE — step 4)
Two facets, one page:
- PUBLIC (anyone): avatar, bio, label, reputation, their posted proposals + outcomes, track record.
- OWN (viewing self): set profile picture; totals DONATED + BOOSTED + BURNED-from-contributions;
  SAVED/tracked proposals; My Drafts (drafts come w/ backend).
- Reached by tapping a proposer. Picture upload needs storage (backend) — placeholder/generated avatar now.

## EXPLORE (DONE — step 5)  Search + category/track filter chips + status toggle (Active/Delivered/All) + sort, in a contained filter panel; reuses Feed card; works in-session over store. (Top Boosted + profile-search + top-bar search = later.)
## TREASURY  Burn record fed by real donations. Total burned, recent burns, why-burn explainer.
## ABOUT  Philosophy/3Gi + "Built on SORA Nexus". "Follow the story of real work."
## CITIZENS (light)  Citizen count + who's currently in sortition.

# ============================================================
# IDENTITY / REPUTATION / ANTI-FRAUD (DECIDED)
# ============================================================
- PROPOSER LABELS (every proposer, card/story/profile): Newcomer / Proven / Veteran / Treasury Desk
  / Flagged. proposerLabel helper grades: completed>=3 Veteran, >=1 Proven, rejected=Flagged
  (placeholder), else Newcomer. NOT yet meaningful (nothing completes proposals until verification
  flow + backend exist; today everyone = Newcomer, correct). TODO when data exists: weight completion
  RATE / time active / clean disputes, not raw count.
- REPUTATION LEVEL (continuous, separate from labels): DELIVERY-WEIGHTED (verified milestones,
  completion rate, clean disputes = heavy; donations/sentiment = light, capped). INVARIANT: gates
  visibility/trust ONLY, NEVER weights a vote or sortition draw.
- COMMENT SENTIMENT: "I'd back this"/"I have concerns" (softened). Low weight, favor verified-backer.
- ANTI-FRAUD: small-project layer -> low stakes -> protection is TRANSPARENCY not escrow. Permanent
  public record. Honest UI: tips voluntary, not escrowed, check history. (Real money protection =
  escrow/bonds at the Desk.)

# ============================================================
# VERIFICATION MODEL (DECIDED — optimistic challenge window)
# ============================================================
Honest + lightweight. Does NOT claim trustless proof real-world work happened (oracle problem).
- Proposer submits evidence -> chapter "Delivered" (challenge window opens, ~7 days, countdown).
- No concern by window close -> "Confirmed" (unchallenged). Use "Confirmed"/"Unchallenged", NEVER
  "Verified" (silence isn't proof; overclaims).
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
  random account). A single flag must NOT publicly brand a proposal — opens a concern + notifies
  proposer to respond first; escalates to visible contested state only on stronger signal.
- FRAMING (key): NO punitive "Disputed" scarlet letter (most small failures = honest inexperience,
  not fraud; would punish honest small builders). Use NEUTRAL "concern raised / update requested."
  REAL trust signal = update/evidence CADENCE, not flags. Show proposer activity (last update,
  on-time vs overdue, responsiveness). SILENCE is the real red flag.
- RESOLUTION: NO verdict on Commons. Transparency + proposer response, both permanent. Donors judge.
  Formal adjudication only at the Desk (real money).
- PROFILE MARK: track RESPONSIVENESS / SILENCE (behavioral, fair) — "went silent on a chapter" — NOT
  a raw disputed-count.
- TEETH: purely reputational. Does NOT stop reputation-indifferent hit-and-run — which is WHY Commons
  stays small-stakes; real money + escrow/bonds = Desk.
- UI MUST make risk explicit: supporting is voluntary + carries risk, like backing a project not buying.
- Needs SHARED BACKEND (timers, multi-user flags, notifications).

# ============================================================
# FRAUD-BOUNTY IDEA — RISKY / PARKED (do NOT build at launch)
# ============================================================
- Idea: ~5% of donations -> 2.5% burn + 2.5% to a "treasury pot"; reward people who catch fraud.
- RISKY: changes core split (proposer 95% not 99%); REQUIRES reliable fraud adjudication (without it:
  false accusations / extortion / collusion to farm bounties — makes fraud worse); standing pot needs
  custody + governance; regulatory (managed financial mechanism). Only viable LATER atop a proven
  adjudication mechanism w/ anti-abuse safeguards. NOT launch.

# ============================================================
# STRATEGY (DECIDED)
# ============================================================
- LAUNCH: SORA MAINNET as clearly-labeled EARLY BUILD. Live: feed (post/follow/comment/like) +
  DONATIONS. Money code tested EXHAUSTIVELY on Taira FIRST. "Coming": disputes/sortition, Desk routing.
  Lock official URL; keep token-scam warning. REGULATORY: Nick checks jurisdiction rules before real
  donations (Claude not a lawyer — flagged).
- INCENTIVES: NO airdrop-for-usage (security risk + farmers + pollutes record). Instead: real funnel
  to funding + founding-builder/supporter badges + white-glove onboarding + great seed stories. IF
  token ever: reward VERIFIED DELIVERY, later, with legal counsel.
- REPO: build in iroha-demo-javascript/testing. Public `sora-commons` repo stays EMPTY until real
  code runnable, then migrate. README drafted & saved.
- FONT: self-host official Sora (woff2 + OFL.txt required) in real app. Demo used Google Fonts.

# ============================================================
# MONEY CODE — DISCIPLINE (non-negotiable)
# ============================================================
- INTEGER/BigInt math only; never floating-point on currency. Compute in base units at token's exact
  decimal precision (CONFIRM precision from chain, don't assume 18); format to decimal only for display.
- 1% split computed in base units; burn + proposer portions sum EXACTLY to input.
- Rigorous input validation (positive, >0, within balance, within precision, reject malformed/overflow).
- Explicit confirmation showing exact amounts before signing. Handle every failure path.
- TEST EXHAUSTIVELY ON TAIRA FIRST (edge amounts, failures, double-submit). Read back on-chain result.

## DONATE MODAL (TODO)
- Quick-picks (10/50/100/500) + manual amount input (any amount) + SUPPORT FRACTIONS (decimals;
  matters as XOR rises). Quick-picks fill/sync field; typing deselects picks. Live 1% burn shown.
- Validate positive/>0/within balance/within precision. (Boost is NOT XOR — no donate-style modal.)

# ============================================================
# ARCHITECTURE — FRONTEND / BACKEND / CHAIN
# ============================================================
- FRONTEND (building now, against in-memory store as stand-in): the Vue app.
- SHARED BACKEND (before/at deploy): server + DB for ALL social data — stories, milestones, comments,
  likes, boosts (+allotment/replenish), follows, saved, DRAFTS, cadence/responsiveness, challenge
  windows. Needed because all users must see same data across devices. localStorage = dead end, skip.
- SORA NEXUS CHAIN: source of truth for MONEY (donations, burns) + later disputes/sortition.
Build path: frontend experience -> shared backend (makes it real) -> chain integration (money).

# ============================================================
# DEFERRED FEATURES (build once, properly)
# ============================================================
- DRAFTS: in SHARED BACKEND tied to account (NOT localStorage). "Save draft" + "My Drafts" on Profile.
- EVIDENCE DEADLINE + OVERDUE FLAG: chapter due-date captured now; full overdue flag + evidence UPLOAD
  + "promised vs delivered" display + persistence = later w/ backend + file storage. No half-version now.
- FILE ATTACHMENTS: need storage (backend). Placeholder now.
- LIKE / COMMENT persistence: currently in-memory (vanish on refresh) — real w/ backend.
- PROPOSER DISPLAY NAME: cards show raw account id now; real name w/ Profile + backend.

# ============================================================
# END-STAGE POLISH PASSES (near the end, like i18n)
# ============================================================
- LIGHT MODE: via CSS-variable tokens. KEEP gold accent on warm off-white/cream (NOT stark white,
  NOT gold->red). Red stays for danger. Invert neutrals. Light/dark toggle in top bar.
- MOBILE PASS: full PARITY required (all actions + info; never punish phone users — most are mobile).
  Currently reflows/stacks (functional); needs spacing/touch-target/type-scale polish.
- FONT PASS: self-host official Sora everywhere; decide per-use which small labels stay JetBrains Mono.
- HERO REDESIGN: keep descriptor headline; make motto "Productive work burns true" shine (GOLD on
  "burns true", bigger/weighted, maybe flame + flicker).
- MOTION pass: flame flicker (hero motto + Treasury) + burn pulse; reduced-motion safe.
- COMPOSE VALIDATION UX: inline field-level errors (red border + message on the bad field), ideally
  alongside real submission + money-code validation. (Now: passive "what's missing" bar — adequate.)
- i18n: EN(default), ES, ZH, HI, AR(RTL), PT, RU, JA, FR. Translation files + switcher.
- Button/icon polish pass: consistent refined button styling app-wide.

# ============================================================
# DONE / REUSABLE
# ============================================================
- CORS proxy (vercel.json + Vite proxy /taira,/minamoto); Vite config; browser bridge
  (irohaBrowserBridge.ts + nativeStub.ts — PROVEN Taira read: 25,000 XOR).
- Shell src/web/ (index.html, main.ts, App.vue [new nav + gold Post btn], tokens.css [+themed
  scrollbars], assets/seal.png, flame.png). Components: CountUp.vue, Flame.vue.
- BUILT (new direction): Feed.vue, Story.vue, Compose.vue. (Old Overview/About/Proposals/Treasury/
  Citizens/Submit dormant, to be reframed/removed.)
- Store commons.ts: underwriting fields + story + track + milestone.evidence/deliveredEvidence/
  deliveredAt; savedProposals/isSaved/toggleSave; proposerLabel; markChapterDelivered; draft refs
  (incl. draftStory, cleared in resetDraft). submitProposal stamps xorBurned "0" (free) + track "donations".
  postDiscussion relaxed (anyone comments). DEMO_MODE: currentAccountId falls back to "demo.commons.test".
- DEMO: shareable single-file mockup shared as community link (uses Google Fonts Sora everywhere).

# ============================================================
# BUILD ORDER
# ============================================================
1. Shell + nav .......... DONE
2. Feed ................. DONE
3. Story detail ........ DONE
4. Profile ............. DONE
5. Explore ............. DONE
6. SOCIAL/BURN MECHANICS (likes/boosts/donations/follows/saves -> totals; in-memory then chain+backend) <- NEXT
7. Reframe Treasury / About / Citizens
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
- Explore page: primary search + filters (category/track/status) + sort — the full find experience.
- Top-bar global search: quick-access express lane from ANYWHERE; routes to Explore results.
- They're ONE search system with two entry points (like GitHub) — not two separate searches.
- Covers proposals (title/story/category/keywords) + profiles (name/handle).
- SEQUENCE: build Explore first (the destination), then top-bar search (express entry to it).
- BUILD: client-side keyword filter possible now (in-session only); REAL scalable search = backend-era.

[RAISING ESCROW — considered; deferred to Desk-layer / later phase]
- Q: hold Raising donations in escrow, release if goal met, refund if not (Kickstarter-style)?
- Technically doable on Nexus. But heavy: needs custody mechanism (WHO/what holds + releases —
  trust question), conditional release + BATCH REFUNDS to many backers (the hard/risky part),
  burn moved to release-time (can't burn pre-refund), and MUCH heavier regulatory exposure
  (holding/refunding pooled funds >> peer tips).
- Conflicts with the core division: escrow was deliberately placed at the DESK, NOT the Commons
  small-tips layer. Escrow at Raising erases that line + raises stakes/expectations/regulatory weight.
- LEAN: wanting escrow = signal a proposal has outgrown the small-tips layer -> that's a DESK ask.
  Commons Raising stays NO-escrow (immediate tips; goal gates build-commitment; neutral "unable to
  build" if missed). Escrow = Desk-layer capability OR a deliberate later phase w/ legal counsel +
  exhaustive Taira testing (esp. refund edge cases). NOT the current frontend layer.

  [PRE-LAUNCH PUBLIC REVIEW — practice (decided)]
- Before launch: publish ship-ready code to PUBLIC GitHub + openly invite the community to scrutinize
  it BEFORE any real XOR moves. Free substitute for a paid audit ("many eyes" before stakes exist).
- Do it RIGHT (or it's crickets): (1) point reviewers AT the money code specifically (clear
  "review this" README — donation/burn/signing); (2) make it RUNNABLE on Taira so people poke it,
  not just read; (3) give it real TIME (weeks) + actively solicit in SORA channels; (4) act on
  findings, don't get defensive; (5) recognize/credit anyone who finds a real bug (motivates scrutiny).
- SEQUENCE: build clean -> exhaustive Taira testing -> PUBLIC REVIEW PERIOD -> fix findings -> launch
  small-tips low-stakes on mainnet -> ~1 yr uneventful real operation builds confidence -> THEN escrow/Desk
  (escrow ~1+ yr post-launch, by which point audit capacity hopefully grown). The year = money code
  earning trust through real operation before stakes rise.

  [EXPLORE status filter — expand at backend era]
- Current (honest to in-memory data): Active / Delivered / All.
- LATER (with backend dispute/challenge system): add neutral status filters consistent with the
  dispute model — e.g. "Confirmed" (window passed clean), "Open concern / response requested"
  (NEUTRAL framing, NOT punitive "Disputed"), "Overdue" (evidence past due — cadence signal).
  Do NOT add a "Disputed" scarlet-letter filter — contradicts the decided dispute model.
- All depend on backend (windows, flags, cadence) — no dispute data to filter on now.

[Compose — XOR amount field sizing (small fix)]
- The "XOR amount" input in chapters is too big / disproportionate vs other fields (looks
  oversized next to "Evidence due by" and the textareas). Resize to match field proportions.

  [Compose — XOR amount field alignment (small fix)]
- XOR amount box sits HIGHER than the "Evidence due by" date field because the date has a label
  above its input ("Evidence due by") pushing it down, while XOR is placeholder-only with no label.
- FIX: give XOR a matching label above it (e.g. "XOR amount" label + input below), so both columns
  have label-above-input structure and align. OR align the grid items to the bottom. Cleanest =
  matching labels (consistent structure).