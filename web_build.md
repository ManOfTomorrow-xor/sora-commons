# SORA Commons — Web Build Status

The real Commons web app, built as a NEW browser entry inside this repo (`src/web/`),
reusing the proven Iroha browser bridge + Vite config. The Electron app is untouched.

## How to run
```bash
cd /mnt/c/Users/ntorr/iroha-demo-javascript
npx vite --config vite.config.ts      # serves http://localhost:5174
# after config changes: rm -rf node_modules/.vite first, then hard-reload (Ctrl+Shift+R)
```

## DONE (proven working)
- [x] CORS proxy: `vercel.json` (prod) + Vite `server.proxy` for /taira & /minamoto (dev)
- [x] Web Vite config: `vite.config.ts` (browser SDK resolution, node polyfills, native-file stubs)
- [x] Browser bridge: `src/services/irohaBrowserBridge.ts` (window.iroha shim) + `nativeStub.ts`
      - deriveAccountAddress, derivePublicKey, isSecureVaultAvailable, rememberSessionSecret,
        getSessionSecret, fetchAccountAssets (real Taira reads via /taira proxy — PROVEN: returned 25,000 XOR)
- [x] New web entry: `src/web/index.html`, `src/web/main.ts`, `src/web/App.vue`
- [x] Design tokens: `src/web/tokens.css` (seal colors, Spectral/Sora/JetBrains Mono)
- [x] Seal asset: `src/web/assets/seal.png` (transparent)
- [x] App shell: sticky top bar (seal + wordmark + TAIRA chip), desktop nav, mobile bottom tab bar (X-style, gold Submit FAB)

## NEXT
- [ ] Step 7a: `src/web/views/Overview.vue` with PLACEHOLDER data
      (order: KPI strip -> My Proposals -> 5-stage strip -> recent burns)
- [ ] Step 7b: wire `useCommonsStore` (real in-memory numbers)
- [ ] Views: Proposals, Submit, Treasury, Citizens, About (+ Commons-only router)
- [ ] Remaining bridge methods as views need them:
      getGovernanceCitizenCount, getGovernanceCouncilCurrent, requestFaucetFunds,
      registerCitizen, submitGovernancePlainBallot
- [ ] Deploy on Vercel (vercel.json already in place)

## KEY FACTS
- Taira XOR asset id: 6TEAJqbb8oEPmLncoNiMRbLEK6tw  (set in src/constants/chains.ts line ~22)
- Citizen bond: 10,000 XOR. Submit fee: 5 XOR (100% burned). Signal: >=60% Aye.
  Sortition: 5-panel, 3-of-5. Milestone burn: 1%.
- "i105" = Iroha account-address format (SDK encodeI105AccountAddress). Your account holds 25,000 test XOR.
- DEMO_MODE: true on Taira -> Commons store runs in-memory, 5-stage flow walkable solo.
- Test in a normal tab (new app has no wallet legacy). Ignore browser-extension console noise.

## WORKING STYLE
One small step at a time. Reuse logic from src/stores/commons.ts + parliament.ts; redesign UI in src/web/.