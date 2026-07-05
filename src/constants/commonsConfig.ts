// SORA Commons — Governance Parameters
// Phase 1A: Fixed constants
// Phase 1B: These become Parliament-controlled on-chain parameters
export const COMMONS_CONFIG = {
  // Network Mode
  // DEMO_MODE: true  = Taira testnet, relaxed gates, demo banner shown
  // DEMO_MODE: false = Minamoto mainnet, full production rules
  DEMO_MODE: true,
// SHOW_DEV_TOOLS: true = show the 3-account identity switcher (LOCAL DEV ONLY).
  // Deploy for visitors with this FALSE — visitors get their own mock wallet, no switcher.
  SHOW_DEV_TOOLS: true,
  // TESTNET_NOTICE: shown to make clear this is a test version — NO real value moves.
  // Donations are an in-memory preview only; no real XOR is transferred on Taira.
  IS_TEST_VERSION: true,

  // Stage 1 — Proposal Submission
  PROPOSAL_FEE_XOR: "5",

  // Stage 2 — Community Signal
  MINIMUM_SIGNAL_BALANCE: "10",
  COMMUNITY_SIGNAL_DAYS: 5,
  MINIMUM_AYE_SIGNALS: 5, 
  MINIMUM_AYE_PERCENT: 60,

  // Social — Boost allotment (isonomia: free but scarce; no pay-to-rank)
  BOOSTS_PER_WEEK: 3,
  BOOST_WEEK_DAYS: 7,

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

 // Challenge Window — accountability period after a delivery is marked.
  // Delivered milestones enter a window where backers/donors can flag.
  // No verdicts: flags are permanent record, never a clawback. (Phase 1)
  CHALLENGE_WINDOW_DAYS: 7,

  // Citizen Reputation (Decision 40)
  // INVARIANT: reputation gates ACCESS only — it NEVER weights a sortition draw
  // or a vote, and NEVER narrows the draw pool. Reward presence, never punish absence.
  REPUTATION_HALF_LIFE_MONTHS: 18,
  REPUTATION_FLOOR_PERCENT: 25,
  REPUTATION_PANEL_VOTE_POINTS: 1,
  REPUTATION_MILESTONE_CONFIRM_POINTS: 1,
  REPUTATION_PROPOSAL_COMPLETE_POINTS: 3,
} as const;
