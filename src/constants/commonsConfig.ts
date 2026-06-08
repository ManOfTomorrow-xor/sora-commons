// SORA Commons — Governance Parameters
// Phase 1A: Fixed constants
// Phase 1B: These become Parliament-controlled on-chain parameters

export const COMMONS_CONFIG = {
  // Stage 1 — Proposal Submission
  PROPOSAL_FEE_XOR: "5",

  // Stage 2 — Community Signal
  MINIMUM_SIGNAL_BALANCE: "1",
  COMMUNITY_SIGNAL_DAYS: 5,
  MINIMUM_AYE_SIGNALS: 10,
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
