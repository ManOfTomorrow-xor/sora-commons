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