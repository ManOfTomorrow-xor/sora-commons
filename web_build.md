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
One small step at a time. Reuse logic from stores/commons.ts + parliament.ts; redesign UI in src/web/.