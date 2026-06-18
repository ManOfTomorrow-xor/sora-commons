# SORA Commons — Web Build Status

Browser web-app inside this repo (src/web/), reusing the proven Iroha browser bridge + Vite config.

## HOW TO RUN
cd /mnt/c/Users/ntorr/iroha-demo-javascript
npx vite --config vite.config.ts      # http://localhost:5174
# after config changes: rm -rf node_modules/.vite, then hard-reload (Ctrl+Shift+R)
# Paste big files directly into VS Code, NOT terminal heredoc (heredoc corrupts files).

# ============================================================
# THE VISION (DECIDED)
# ============================================================
## WHAT COMMONS IS
A public place where every proposal is a STORY you can follow start to finish. Proposers tell
their story, log verifiable milestones (chapters), connect with people. People FOLLOW/LIKE/
COMMENT/BOOST/DONATE. The permanent public record of productive work the rest of SORA (incl. a
future Treasury Desk) reads from — useful even before the Desk exists.
- Sortition repurposed: NOT funding votes — ADJUDICATES disputes about whether work happened.
- IDENTITY: Commons = enabler of SMALLER projects + universal proposer tracker. Large funding
  routes to the Treasury Desk; Commons holds the story either way.

## BURN MODEL
- Burn rides on real value flow, never a toll. Free to post/follow/like/comment.
- Burn comes from DEMAND side (backers/amplifiers), never SUPPLY (proposers never charged).
- DONATE: supporter -> proposer. 1% burns, 99% to proposer. Connected accounts only.
  Direct tip now; milestone-escrow later (default NO escrow — stays small-project layer).
- BOOST: flat amount (TBD), a cut burns. Ranks by NUMBER of boosts, not XOR spent. Bolts 1->4.
- LIKE: free instant warmth (heart).

## SOCIAL LAYER ("warmth in service of real work")
TAKE: feed/spotlight, following, threaded comments (proposer replies highlighted), real
momentum (bolts/donations/followers/progress), profiles.
LEAVE: engagement algorithms, dopamine loops, vanity metrics, pay-to-rank.

## COMMONS <-> TREASURY DESK
Commons = front door + record for ALL proposals. Small efforts seek donations here; large ones
route to the Desk. Every card/story shows a TRACK tag: "Seeking donations" vs "Under Treasury
Desk review" + outcome states. Not competitors — Commons is the record + small-tip venue; Desk
is the large-scale allocation layer that reads from it.

# ============================================================
# PAGES (DECIDED)
# ============================================================
NAV (~5): Feed / Explore / [Post] / Treasury / About. Profile, Story, Archive(under Explore),
Citizens = contextual/secondary.

## FEED
Single main column, generous spacing. Default sort = MIX (recency+activity). Filters: Newest/
Most boosted/Most active/Category. STORY CARD (loud->quiet): avatar+name+category tag; BIG
title + 1 story line; track tag; slim milestone bar; muted engagement row (likes/bolts/comments/
donated). "Post your work" CTA -> Compose.
- TODO: Top Boosted = side panel (desktop: top of right rail; mobile: compact strip atop feed),
  NOT a band across the feed.

## STORY PAGE (heart)
1) HERO: title, proposer(->profile), category, stage, track tag; engagement bar Like/Boost/
DONATE + totals (donated, burned, backers, followers, Follow); progress.
2) STORY: narrative + ATTACHED FILES. 3) FACTS: structured claim fields. 4) CHAPTERS:
milestones (desc/XOR/timeline/EVIDENCE/status). 5) CONVERSATION: threaded, proposer replies
highlighted, softened sentiment tag "I'd back this"/"I have concerns". Donate/Boost/Like in
header AND bottom.

## EXPLORE  Feed cards + filters/sort + search + Top Boosted. Archive = Active/Archive toggle.
## PROFILE  Avatar, bio, totals, all their stories+outcomes, labels, reputation level. 
## COMPOSE  Submit form + rich STORY narrative + FILE attachments. Button/FAB, not nav tab.
## TREASURY  Burn record fed by real donations+boosts. Total burned, recent burns, why-burn.
## ABOUT  Philosophy/3Gi + "Built on SORA Nexus". "Follow the story of real work."
## CITIZENS (light)  Citizen count + who's currently in sortition (dispute adjudication).

# ============================================================
# IDENTITY / REPUTATION / ANTI-FRAUD (DECIDED)
# ============================================================
- PROPOSER LABELS (every proposer, on card/story/profile): Newcomer / Delivered /
  Veteran-Proven / Treasury Desk / Flagged-Disputed.
- REPUTATION LEVEL (continuous, separate from labels): DELIVERY-WEIGHTED (verified milestones,
  completion rate, clean disputes = heavy; donations/sentiment = light, capped). INVARIANT:
  gates visibility/trust ONLY, NEVER weights a vote or sortition draw.
- COMMENT SENTIMENT: "I'd back this"/"I have concerns" (softened, not bullish/bearish). Low
  weight, favor verified-backer sentiment, guard brigading.
- ANTI-FRAUD: small-project layer -> low stakes -> protection is TRANSPARENCY not escrow.
  Permanent public track record. Honest UI: tips voluntary, not escrowed, check history.
  Disputes can freeze remaining + mark fraud on record.

# ============================================================
# HERO REDESIGN (TODO for final)
# ============================================================
- Official Sora font (self-hosted, weights incl. ExtraBold 800).
- KEEP descriptor "Follow the work being built on SORA" as headline.
- Make MOTTO "Productive work burns true" shine: GOLD on "burns true", bigger/weighted,
  possibly paired w/ flame + flicker (motion pass). Show Nick options.

# ============================================================
# STRATEGY (DECIDED)
# ============================================================
- LAUNCH: SORA MAINNET as clearly-labeled EARLY BUILD. Live: feed (post/follow/comment/like) +
  DONATIONS. Money code (transfer + 1% burn + signing) tested EXHAUSTIVELY on Taira FIRST.
  "Coming": disputes/sortition (needs citizens), Treasury Desk routing (needs Desk). Lock
  official URL; keep token-scam warning. REGULATORY: Nick to check jurisdiction rules before
  real donations (Claude not a lawyer — flagged).
- INCENTIVES: NO airdrop-for-usage (security risk + attracts farmers + pollutes record).
  Instead: real funnel to funding + founding-builder/supporter badges + white-glove onboarding
  + great seed stories. IF token ever: reward VERIFIED DELIVERY, later, with legal counsel.
- REPO: keep building in iroha-demo-javascript/testing. Public `sora-commons` repo stays EMPTY
  until real code is runnable, then migrate. README drafted & saved.
- FONT: self-host official Sora (woff2 + OFL.txt required) in real app. Demo used Google Fonts.

# ============================================================
# DONE / REUSABLE
# ============================================================
- CORS proxy (vercel.json + Vite proxy /taira,/minamoto); Vite config; browser bridge
  (irohaBrowserBridge.ts + nativeStub.ts — PROVEN Taira read: 25,000 XOR).
- Shell src/web/ (index.html, main.ts, App.vue, tokens.css, assets/seal.png, flame.png).
- Components: CountUp.vue, Flame.vue.
- PAGES BUILT (to be REFRAMED to new direction): Overview, About, Proposals, Treasury,
  Citizens, Submit.
- Store commons.ts: underwriting-file fields + milestone.evidence + draft refs; discussionPosts
  exists (reuse for comments).
- DEMO: shareable single-file mockup built & shared as a link (community vision artifact).

# ============================================================
# PARKED / LATER
# ============================================================
- PARKED: vote-to-fund, 5 XOR post fee, Signal=60% aye. Ref: proposal-underwriting-file-DRAFT.md.
- SHARED BACKEND (at deploy): likes/comments/boosts/donations/follows/files need shared
  persistence (in-memory = demo/one session only).
- REAL ON-CHAIN WRITES (bridge TBD): donate, boost, milestone verify, dispute, faucet.
- SORTITION COLD-START (Phase 1B): decision B (shrink panel); never relax deliberator-exclusion.
- TOP-BAR: notifications (client-derived) + feedback icon + connect/wallet button.
- i18n NEAR END: EN(default), ES, ZH, HI, AR(RTL), PT, RU, JA, FR. Translation files + switcher.
- MOTION pass: flame flicker (hero motto + Treasury) + burn pulse; reduced-motion safe.

# ============================================================
# KEY FACTS
# ============================================================
- Taira XOR asset id: 6TEAJqbb8oEPmLncoNiMRbLEK6tw (src/constants/chains.ts ~line 22)
- "i105" = Iroha account-address format (SDK encodeI105AccountAddress).
- DEMO_MODE:true relaxes gates for solo walkthrough on Taira.

## WORKING STYLE
One small step at a time. Paste big files in VS Code, not terminal. Commit at each checkpoint.

## BUILD ORDER (next)
1. Rework App shell + nav (Feed/Explore/[Post]/Treasury/About).
2. Feed page (cards, Top Boosted side panel, store-wired).
3. Story detail (story/facts/chapters/comments, like/boost/donate).
4. Explore, Profile, Compose (reuse card + form).
5. Social/burn mechanics (in-memory first; real chain + shared backend later).
6. Reframe Treasury/About/Citizens.

## DONATE MODAL (TODO)
- Quick-pick buttons (10/50/100/500) PLUS a manual amount input (any amount).
- SUPPORT FRACTIONS: decimals allowed (e.g. 0.5, 2.75) — keeps small donors able to
  participate as XOR value rises.
- Quick-picks fill/sync the field; typing in field deselects picks. Live 1% burn shown on
  whatever amount is entered.
- Validate: positive, > 0, within balance, within token precision.
- (Boost stays a FLAT amount — no custom field — to preserve isonomia/ranked-by-count.)

## MONEY CODE — DISCIPLINE (non-negotiable)
The donation/burn path moves real XOR irreversibly. Treat it differently from UI code.
- INTEGER/BigInt math only for amounts. Never floating-point on currency. Compute in base
  units using the token's exact decimal precision; format to decimal only for display.
- Confirm XOR's exact decimal precision from chain config before building (don't assume 18).
- 1% burn split computed in base units; verify burn + proposer portions sum EXACTLY to input.
- Validate input rigorously: positive, > 0, within balance, within precision; reject malformed/overflow.
- Explicit confirmation step showing exact amounts (to proposer / burned) before signing.
- Handle every failure path: rejected signature, insufficient balance, network error,
  partial/timeout — clear state, never leave the user unsure if funds moved.
- TEST EXHAUSTIVELY ON TAIRA FIRST: edge amounts (tiny fractions, max, precision limits),
  failures, double-submit. Money code earns its way to mainnet by proving itself on testnet.
- Independent verification: read back the on-chain result; show the actual settled tx, not an
  optimistic UI assumption.

[updates]
- Bookmark/SAVE icon on every story card from the start; wired to store savedProposals (list of ids).
  Saved proposals visible on your own Profile.
- BUILD ORDER bump: Profile -> step 4 (reached by tapping a proposer; shows public facet +
  your-activity facet when it's you).

Revised build order:
1. Shell + nav (DONE)
2. Feed (cards w/ bookmark, Top Boosted side panel)
3. Story detail
4. Profile (public + own-activity: avatar, proposals, status/rep, donated/boosted/burned, saved)
5. Explore, Compose
6. Social/burn mechanics (likes/boosts/donations/follows/saves -> totals; in-memory then chain+backend)
7. Reframe Treasury/About/Citizens

# ============================================================
# ARCHITECTURE — FRONTEND / BACKEND / CHAIN (important)
# ============================================================
The app has three layers. We're building the FRONTEND now against an in-memory store
(a stand-in) so we can design and see the whole experience before the backend exists.
- FRONTEND: the Vue app each person runs in their browser (what we're building).
- SHARED BACKEND (build before/at deploy): a server + database holding ALL shared/social
  data — stories, milestones, comments, likes, boosts, follows, saved proposals, DRAFTS.
  Required because every user must see the same data across all devices. In-memory store
  and localStorage do NOT scale (single-session / single-device) — localStorage is a dead
  end for a multi-user app; we skip it.
- SORA NEXUS CHAIN: source of truth for MONEY (donations, burns) and later disputes/sortition.
Build path: frontend experience first -> shared backend (makes it real + persistent for all)
-> chain integration for money.

# ============================================================
# DEFERRED FEATURES (build once, properly — no throwaway versions)
# ============================================================
- DRAFTS: live in the SHARED BACKEND tied to account (NOT localStorage). "Save draft" button +
  "My Drafts" on Profile to resume any incomplete proposal. Build WITH the backend.
- EVIDENCE DEADLINE + OVERDUE FLAG: each chapter has an evidence due-date; if it passes and the
  milestone isn't complete, the story card + story page show "Evidence overdue" (anti-fraud
  transparency — makes silence visible). Build the FULL version later with the evidence-UPLOAD
  flow + file storage. For now: just CAPTURE chapter due-date (data ready, no half-version).
- EVIDENCE UPLOAD / FILE ATTACHMENTS: need file storage (deploy-time backend). Placeholder for now.

# ============================================================
# COMPOSE — IMMEDIATE TODO (now)
# ============================================================
- Center the form (max-width + margin auto — currently hugs left).
- Chapter "timeline" -> real DATE picker, single target date "Evidence due by [date]".
  Store captures chapter dueDate (full deadline/overdue feature comes later).

## TRACK TAG / TREASURY DESK STATUS (decided)
- Two tracks: "Seeking donations" (community) and "Under Treasury Desk review" (underwriting).
- "Seeking donations" = the default/only track available now (Desk doesn't exist yet).
- "Under Treasury Desk review" is NOT self-claimable and NOT manually dished out by the Desk.
  Instead: when the Desk reviews a proposal, that review produces a SIGNAL (verifiable
  attestation/credential — exact mechanism TBD when Desk is built). The PROPOSER's
  responsibility is to obtain that signal and present it to unlock the Desk track on their
  proposal; the system VERIFIES the signal before allowing the badge. Evidence-gated, like
  milestones — consistent with the whole "claims require evidence" philosophy. No Desk bottleneck.
- COMPOSE NOW: show both options; "Treasury Desk review" VISIBLE but DISABLED ("coming as the
  Desk launches"). "Seeking donations" is the only selectable track for now.

  [Light mode — deferred to end-stage polish pass]
- Add a light theme via the existing CSS-variable system (theme-swappable tokens).
- KEEP gold as the brand accent (gold on warm off-white/cream — NOT stark white, NOT gold→red).
  Red/crimson STAYS reserved for danger/negative (don't collide brand color with error color).
- Invert neutrals: dark navy text on light bg instead of light text on navy.
- Dedicated pass NEAR END (like i18n) — theme a finished set of pages, not re-theme as we build.
- Add a light/dark toggle in the top bar.