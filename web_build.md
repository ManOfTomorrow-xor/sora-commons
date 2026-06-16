# SORA Commons — Web Build Status

Browser web-app inside this repo (src/web/), reusing the proven Iroha browser bridge + Vite
config. Electron app untouched.

## >>> READ FIRST: DIRECTION RESET <
Commons was reframed. The OLD plan (vote-to-fund proposals, 5 XOR post fee) is PARKED.
The NEW direction (followable public record of real work, social layer, donate/boost burns)
is below and DECIDED. Next concrete step: build a shareable demo, then real code.

## HOW TO RUN
cd /mnt/c/Users/ntorr/iroha-demo-javascript
npx vite --config vite.config.ts      # http://localhost:5174
# after config changes: rm -rf node_modules/.vite, then hard-reload (Ctrl+Shift+R)
# Paste big files directly into VS Code, NOT via terminal heredoc (heredoc corrupts files).

# ============================================================
# THE VISION (all DECIDED)
# ============================================================

## WHAT COMMONS IS
A public place where every proposal is a STORY you can follow start to finish.
- Proposers tell their story, log verifiable milestones (chapters), connect with people.
- People FOLLOW, LIKE, COMMENT, BOOST, and DONATE — proposer<->community connection.
- The permanent, trusted public record of productive work that the rest of SORA
  (incl. a future Treasury Desk) can read from. Useful even before the Desk exists.
- Sortition repurposed: NOT voting on funding — it ADJUDICATES DISPUTES about whether a
  milestone/claim really happened. Preserves the anti-capture role of the lot.
- Treasury Desk (currently 1 essay) = future allocation layer that plugs into this record.
  Commons does NOT try to be the funding decider.

## BURN MODEL
- PRINCIPLE: burn rides on real value flow, never a toll. Free to post/follow/like/comment.
- Burn always comes from the DEMAND side (people backing/amplifying work), never the SUPPLY
  side (proposers are never charged to appear). "Productive work burns true."
- DONATE: supporter -> proposer. 1% burns, 99% to proposer. Connected accounts only.
  Start as a DIRECT TIP; milestone-linked escrow = later phase.
- BOOST: flat amount (TBD), a cut burns. Ranks by NUMBER OF BOOSTS, not XOR spent
  (isonomia for attention; whales can't buy the top). Lightning rating 1->4 bolts.
- LIKE: free, instant warmth (heart). Distinct from boost (paid, committed support).

## SOCIAL LAYER ("social warmth in service of real work")
TAKE: feed/spotlight main page, following, threaded comments (proposer replies highlighted),
visible REAL momentum (bolts, donation totals, followers, milestone progress), proposer profiles.
LEAVE: engagement-maximizing algorithms, dopamine loops, vanity metrics, pay-to-rank.
Every number reflects real value or real people. Never optimize for time-on-app or spectacle.

# ============================================================
# PAGES (all DECIDED)
# ============================================================

## NAV (~5): Feed / Explore / [Post] / Treasury / About
Profile, Story, Archive (under Explore), Citizens = reached contextually / secondary.

## FEED (main page)
- Single main column (X-style), generous spacing, filled-not-crammed.
- Top Boosted = distinct horizontal band at top, separated from feed below.
- Default sort = MIX (recency + activity). Filters: Newest / Most boosted / Most active / Category.
- STORY CARD hierarchy (loud->quiet): [who] avatar+name + category tag; [hook] BIG title +
  1 truncated story line; [progress] slim milestone bar "Chapter 2 of 4"; [engagement] small
  muted row: likes / bolts / comments / total donated.
- Desktop: optional quiet side rail. Mobile: clean single column. "Post your work" CTA -> Compose.

## STORY PAGE (heart of the app)
Order: 1) HERO: title, proposer(->profile), category, stage; engagement bar =
Like/Boost/DONATE + totals (donated, burned-from-story, backers, followers, Follow); progress.
2) STORY: proposer's full narrative + ATTACHED FILES.
3) FACTS: structured claim fields (productive claim, inputs, output...) = "facts behind the story."
4) CHAPTERS: each milestone (desc, XOR, timeline, EVIDENCE, status: upcoming/in-progress/
verified/disputed). Visual spine = followable progress.
5) CONVERSATION: threaded comments, proposer replies highlighted.
Donate/Boost/Like in BOTH header and bottom.

## EXPLORE
Feed-style cards + strong filters/sort + search + Top Boosted band.
ARCHIVE merged in as Active/Archive toggle (archive = every proposal ever, final outcomes, compact rows).

## PROFILE
Proposer page: avatar, bio, totals (stories, raised, burned, followers), all their stories
w/ outcomes. Future reputation home. Reached by tapping a proposer.

## COMPOSE / POST
Reuse Submit form + rich STORY narrative field + FILE attachments. "Tell the story of your work."
Button/FAB, not a nav tab.

## TREASURY
Burn record fed by real donations + boosts (posting is free). Total burned, recent burns, why-burn explainer.

## ABOUT
Philosophy / 3Gi + "Built on SORA Nexus" context. Reframe to "follow the story of real work."

## CITIZENS (light)
Quick info only: current citizen count + who is currently in sortition (drawn to adjudicate
active disputes). Transparency window, no heavy machinery.

# ============================================================
# DEMO (next concrete step — before real code)
# ============================================================
- SHAREABLE clickable visual mockup (prototype, NOT real app) of the reframed Commons.
- Real design (seal, tokens), feed, story page, donate/boost/like, comments, Top Boosted.
- Populated with believable example stories (MIX: crypto/technical + real-economy).
- Single self-contained HTML file -> host free (Vercel/Pages/Netlify) -> share a link.
- Purpose: community awareness + feel the whole flow before committing to code.
- Simulated interactions, no real chain/XOR. Clearly marked PREVIEW.

# ============================================================
# DONE / REUSABLE (carries over regardless of direction)
# ============================================================
- CORS proxy: vercel.json + Vite server.proxy (/taira, /minamoto)
- Vite config: browser SDK resolution, node polyfills, native-file stubs
- Browser bridge: src/services/irohaBrowserBridge.ts + nativeStub.ts
  (deriveAccountAddress, derivePublicKey, rememberSessionSecret, getSessionSecret,
   fetchAccountAssets — PROVEN real Taira read: 25,000 XOR)
- Shell: src/web/ index.html, main.ts, App.vue, tokens.css, assets/seal.png, assets/flame.png
- Components: CountUp.vue (animated, reduced-motion safe), Flame.vue (gold flame icon)
- PAGES BUILT (will be reframed, not deleted): Overview, About, Proposals, Treasury,
  Citizens, Submit. All real store data + empty states.
- Store: src/stores/commons.ts has first-class underwriting-file fields (category,
  productiveClaim, inputs, expectedOutput, demandSignal, riskBearer, failureHandling,
  publicBenefit) + milestone.evidence + draft refs. discussionPosts field EXISTS (reuse for comments).

# ============================================================
# PARKED / LATER
# ============================================================
- PARKED: "vote-to-fund" framing; 5 XOR post fee; Signal=60% aye; Submit as the main event.
  Reference draft: proposal-underwriting-file-DRAFT.md.
- REPUTATION: designed, not built — gets real DATA once stories/milestones are verified here.
- REAL ON-CHAIN WRITES (bridge methods TBD): donate, boost, milestone verify, dispute, faucet.
- SHARED BACKEND (at deploy): likes, comments, boosts, donations, follows, file storage need
  shared persistence (in-memory works for demo/one session only).
- SORTITION COLD-START (Phase 1B, chain pool-assembly): decision = B (shrink panel) when
  eligible < panel size; never relax deliberator-exclusion. UI only displays chain state.
- TOP-BAR UTILITIES: notifications (client-derived) + feedback icon + connect/wallet button.
- i18n pass NEAR END: English(default), Spanish, Mandarin, Hindi, Arabic(RTL), Portuguese,
  Russian, Japanese, French. Translation files + language switcher.
- MOTION pass: flame flicker on Treasury hero + burn pulse; reduced-motion safe.
- Commons-only router.

# ============================================================
# KEY FACTS
# ============================================================
- Taira XOR asset id: 6TEAJqbb8oEPmLncoNiMRbLEK6tw (src/constants/chains.ts ~line 22)
- "i105" = Iroha account-address format (SDK encodeI105AccountAddress).
- DEMO_MODE:true relaxes gates so flow is walkable solo on Taira.

## WORKING STYLE
One small step at a time. Paste big files in VS Code, not terminal. Commit at each checkpoint.