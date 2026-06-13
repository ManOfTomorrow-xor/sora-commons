import { COMMONS_CONFIG } from "@/constants/commonsConfig";
import type { useCommonsStore } from "@/stores/commons";

type Store = ReturnType<typeof useCommonsStore>;

// Demo-only: populate the in-memory store so Overview has realistic content.
// Runs ONLY when DEMO_MODE is true and the store is empty.
export function seedDemoCommons(commons: Store) {
  if (!COMMONS_CONFIG.DEMO_MODE) return;
  if (commons.proposals.length > 0) return;

  const me = commons.currentAccountId || "demo@commons";
  const now = Date.now();
  const iso = (d: number) => new Date(now + d * 86400000).toISOString();

  const base = (over: Partial<any>): any => ({
    id: "p_" + Math.random().toString(36).slice(2, 9),
    proposerAccountId: me,
    title: "",
    description: "",
    xorRequested: "0",
    milestones: [],
    status: "signal",
    signals: [],
    signalEndsAt: null,
    discussionPosts: [],
    amendments: [],
    deliberationEndsAt: null,
    sortitionExcluded: [],
    parliamentBrief: null,
    parliamentRemarks: null,
    panelMembers: [],
    panelVotes: [],
    sortitionEndsAt: null,
    revisionCount: 0,
    xorBurned: "5",
    createdAt: iso(-3),
    ...over,
  });

  commons.proposals.push(
    base({
      title: "Polkaswap liquidity dashboard",
      description: "A public dashboard tracking XOR pair depth, slippage, and burn flow across Polkaswap pools.",
      xorRequested: "1200",
      status: "signal",
      signalEndsAt: iso(2),
      milestones: [
        { id: "m1", description: "Design + data plumbing", xorAmount: "600", timeline: iso(20), completed: false, completedAt: null, xorBurned: "0" },
        { id: "m2", description: "Public release", xorAmount: "600", timeline: iso(45), completed: false, completedAt: null, xorBurned: "0" },
      ],
      signals: [
        { accountId: "a1@commons", vote: "aye", createdAt: iso(-1) },
        { accountId: "a2@commons", vote: "aye", createdAt: iso(-1) },
        { accountId: "a3@commons", vote: "nay", createdAt: iso(-1) },
      ],
      createdAt: iso(-1),
    }),
    base({
      title: "Soracle price-feed adapter",
      description: "An adapter exposing Soracle medianized price feeds to Commons milestone verification.",
      xorRequested: "800",
      status: "deliberation",
      deliberationEndsAt: iso(3),
      revisionCount: 1,
      parliamentBrief: "Panel requests scope clarification on oracle failover before advancing.",
      milestones: [
        { id: "m1", description: "Adapter + tests", xorAmount: "800", timeline: iso(30), completed: false, completedAt: null, xorBurned: "0" },
      ],
      createdAt: iso(-6),
    }),
    base({
      title: "Validator onboarding guide",
      description: "Step-by-step guide and scripts for spinning up a Taira validator.",
      xorRequested: "500",
      status: "sortition",
      sortitionEndsAt: iso(1),
      panelMembers: ["c1@commons", "c2@commons", "c3@commons", "c4@commons", "c5@commons"],
      panelVotes: [
        { accountId: "c1@commons", decision: "approve", feedback: "", votedAt: iso(-1) },
        { accountId: "c2@commons", decision: "approve", feedback: "", votedAt: iso(-1) },
      ],
      createdAt: iso(-8),
    }),
    base({
      title: "Citizen onboarding documentation",
      description: "Complete onboarding docs: bonding, sortition duties, deliberation etiquette.",
      xorRequested: "600",
      status: "funded",
      xorBurned: "12",
      milestones: [
        { id: "m1", description: "Draft + review", xorAmount: "300", timeline: iso(-2), completed: true, completedAt: iso(-2), xorBurned: "3" },
        { id: "m2", description: "Publish + translate", xorAmount: "300", timeline: iso(14), completed: false, completedAt: null, xorBurned: "0" },
      ],
      createdAt: iso(-12),
    }),
  );
}