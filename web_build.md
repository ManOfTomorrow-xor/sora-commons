# SORA Commons — Web Build Status

The real Commons web app, built as a NEW browser entry inside this repo (src/web/),
reusing the proven Iroha browser bridge + Vite config. The Electron app is untouched.

## How to run
cd /mnt/c/Users/ntorr/iroha-demo-javascript
npx vite --config vite.config.ts      # serves http://localhost:5174
# after config changes: rm -rf node_modules/.vite first, then hard-reload (Ctrl+Shift+R)
# Test in incognito (clean, no extension noise). No fake/seed data — drive real Taira activity.

## DONE (proven working)
- CORS proxy: vercel.json (prod) + Vite server.proxy for /taira & /minamoto (dev)
- Web Vite config: vite.config.ts (browser SDK resolution, node polyfills, native-file stubs)
- Browser bridge: src/services/irohaBrowserBridge.ts + nativeStub.ts
  - deriveAccountAddress, derivePublicKey, isSecureVaultAvailable, rememberSessionSecret,
    getSessionSecret, fetchAccountAssets (real Taira reads via /taira proxy — PROVEN: 25,000 XOR)
- New web entry: src/web/index.html, main.ts, App.vue, tokens.css, assets/seal.png
- App shell: sticky top bar (seal + wordmark + TAIRA chip), desktop nav, mobile bottom tab bar (X-style, gold Submit FAB)
- CountUp component: count-up animation, re-animates on value change, reduced-motion safe
- OVERVIEW PAGE DONE: real store-wired KPIs (count-up), My Proposals, Closest-to-decision,
  5-stage strip, burn ledger — all real data with empty states. No fake/seed data.

## PAGE-BY-PAGE PLAN (finish each fully before next)
- [x] Overview
- [ ] About (pure content: philosophy, 3Gi, how-it-works)
- [ ] Proposals (full list + stage filters; read-only)
- [ ] Top-bar utilities: notifications bell (CLIENT-DERIVED from store state, no backend)
      + feedback icon (next to bell) + connect/wallet button
- [ ] Treasury (burn ledger / treasury; read-only)
- [ ] Citizens (hub; read + become-a-citizen)
- [ ] Submit (form; needs write path)
- [ ] Commons-only router

## WRITE METHODS TO WIRE (bridge) — when their page needs them
- requestFaucetFunds (FIRST write; test only needs to cover 5 XOR proposal fee)
- submitProposal (Submit page — create proposal, burn 5 XOR)
- castSignal, deliberation posts, castPanelVote, confirmMilestone
- registerCitizen, submitGovernancePlainBallot
- getGovernanceCitizenCount, getGovernanceCouncilCurrent

## FEATURE NOTES
- FEEDBACK: icon in top bar by notifications, opens panel. Start in-app storage,
  upgrade to shared backend at deploy, on-chain possible Phase 2.
- NOTIFICATIONS: client-derived from real proposal/store state. No backend for test.
- INTERNATIONALIZATION (i18n): support multiple languages — the major commonly-spoken
  ones, not every language. Candidate set: English (default), Spanish, Mandarin Chinese,
  Hindi, Arabic, Portuguese, Russian, Japanese, French (final list TBD). Implementation:
  move all hardcoded UI text into translation files keyed by language; add a language
  switcher in the top bar. Do this as a dedicated pass NEAR THE END, after page structure
  is settled (translating text that's still changing wastes effort). Note: Arabic is
  right-to-left → needs RTL layout support (CSS mirroring) if included.
  - FLAME ANIMATION (final motion pass): subtle continuous flicker on the Treasury hero
  flame (gentle scale/sway + glow pulse, "breathing"); brief flare on a new burn (the
  "burn pulse"). Reduced-motion → static flame. Flame icon = src/web/components/Flame.vue.
  - i18n: support major commonly-spoken languages (not all). Candidate: English (default),
  Spanish, Mandarin, Hindi, Arabic, Portuguese, Russian, Japanese, French (final list TBD).
  Move UI text into translation files; language switcher in top bar. Dedicated pass NEAR END.
  Arabic is RTL -> needs layout mirroring if included.
- FLAME: src/web/components/Flame.vue (gold flame icon). Final motion pass: subtle flicker
  on Treasury hero, brief flare on new burn; reduced-motion -> static.
  ## SORTITION / COLD-START (Phase 1B — chain pool-assembly, NOT web app)
- The chain draw picks N from whatever pool it is handed; it does NOT inspect who deliberated.
- Exclusion is enforced by POOL ASSEMBLY before the draw: eligible = citizens − sortitionExcluded.
  (Store already builds sortitionExcluded: proposer @ create, deliberators @ post, brief author.)
- Replace commons.ts ~line 499 placeholder with the real Parliament sortition contract call,
  handing it the pre-filtered eligible pool.
- COLD-START DECISION = B (SHRINK PANEL): when eligible < SORTITION_PANEL_SIZE, draw a smaller
  panel sized to the eligible pool rather than relaxing the deliberator-exclusion invariant.
  Approval threshold scales with panel size. Full 5-of-N / 3-of-5 resumes once enough citizens
  exist. Keeps "no deliberator ever judges" intact at all pool sizes. Implement in pool-assembly.
- Web app only DISPLAYS chain state: panel-vote controls gated to panelMembers; show
  "excluded from this draw" when in sortitionExcluded. UI never enforces the draw.+
  ## PROPOSAL = UNDERWRITING FILE (decided; full draft in proposal-underwriting-file-DRAFT.md)
- Submit captures a "file": S1 Identity (title, summary, *category: Production OR
  Productivity/Public-good), S2 Productive future (claim, inputs financed, expected
  output/capacity, demand signal), S3 Ask + milestones each with EVIDENCE that releases it.
  S1–S3 REQUIRED. S4 Risk/failure + S5 Public spillovers OPTIONAL (test).
- Heavy machinery = Phase 2: proposer/underwriter bonding, auditors, dispute path,
  post-funding tracking ("did suppliers get paid, did output appear"), Treasury Desk roles.
- 5 stages reframed as underwriting (not popularity): Submit=open file; Signal=seriousness
  filter (NOT popularity vote, say so in copy); Deliberate=underwriting exam (are inputs/
  demand real? capacity vs re-labeled claims?); Sortition=verdict on file (fund/reject/revise);
  Milestone=evidence-gated release.
- Vocabulary: UI says "proposal"; Submit framed as "open the file on your claim."
- NOTE (Nick): dApp may become where proposals are WRITTEN, with scrutiny happening
  elsewhere as SORA infra unfolds — so keep Submit focused on capturing a clean file,
  not enforcing heavy judgment. Categories changeable later.
- Infra essays (finality/lanes/dataspaces/fragmentation/neutral-rails) = About CONTEXT only,
  NOT Commons features. Treasury page (burn ledger) stays "Treasury"; "Treasury Desk"
  (issuance underwriting) reserved as Phase 2 concept.

## TEST-PHASE SCOPING
- Faucet only needs to cover the 5 XOR proposal fee.
- Citizens page open to all; DEMO_MODE:true relaxes role/sortition gates.
- FINAL RELEASE (Minamoto): 10,000 XOR citizen bond + role enforcement apply.

## KEY FACTS
- Taira XOR asset id: 6TEAJqbb8oEPmLncoNiMRbLEK6tw  (src/constants/chains.ts line ~22)
- Citizen bond: 10,000 XOR. Submit fee: 5 XOR. Signal: >=60% Aye. Sortition: 5-panel, 3-of-5. Milestone burn: 1%.
- "i105" = Iroha account-address format (SDK encodeI105AccountAddress).
- Store: stores/commons.ts (in-memory) -> parliament.ts -> services/iroha -> window.iroha bridge.
  Status: draft|signal|deliberation|sortition|funded|complete|rejected|archived.

## WORKING STYLE
One small st-ep at a time. Reuse logic from stores/commons.ts + parliament.ts; redesign UI in src/web/.
