// SORA Commons — Governance Parameters
// Phase 1A: Fixed constants
// Phase 1B: These become Parliament-controlled on-chain parameters
export const COMMONS_CONFIG = {
  // Network Mode
  // DEMO_MODE: true  = Taira testnet, relaxed gates, demo banner shown
  // DEMO_MODE: false = Minamoto mainnet, full production rules
  DEMO_MODE: false,

  // Stage 1 — Proposal Submission
  PROPOSAL_FEE_XOR: "5",

  // Fee Split — Phase 1A
  // 80% burned, 20% to maintainer, capped at 5 XOR
  // Phase 1B: dynamic fee via Soracle + same split logic
  MAINTENANCE_FEE_PERCENT: 20,
  MAINTENANCE_FEE_CAP_XOR: 5,
  MAINTENANCE_WALLET: "cnEWm5...YOUR_WALLET_ADDRESS_HERE", // replace with Champions2026 address

  // Stage 2 — Community Signal
  MINIMUM_SIGNAL_BALANCE: "10",
  COMMUNITY_SIGNAL_DAYS: 5,
  MINIMUM_AYE_SIGNALS: 1, // lowered from 10 for testing
  MINIMUM_AYE_PERCENT: 60,

  // Stage 3 — Parliament Deliberation
  PARLIAMENT_DELIBERATION_DAYS: 10,
  MAX_AMENDMENTS: 2,
  AMENDMENT_EXTENSION_HOURS: 48,

  // Stage 4 — Sortition
  SORTITION_PANEL_SIZE: 5,
  SORTITION_APPROVAL_THRESHOLD: 3,
  SORTITION_DECISION_DAYS: 5,

  // Stage 5 — Milestone Execution
  MILESTONE_CONFIRM_DAYS: 7,
  MILESTONE_BURN_PERCENT: 1,
} as const;

// Fee split calculator
// Returns burn and maintainer amounts for any given fee
// Works for both Phase 1A (flat 5 XOR) and Phase 1B (dynamic)
export function calculateFeeSplit(feeXor: number): {
  burnAmount: number;
  maintainerAmount: number;
} {
  const maintainerAmount = Math.min(
    feeXor * (COMMONS_CONFIG.MAINTENANCE_FEE_PERCENT / 100),
    COMMONS_CONFIG.MAINTENANCE_FEE_CAP_XOR
  );
  const burnAmount = feeXor - maintainerAmount;
  return { burnAmount, maintainerAmount };
}