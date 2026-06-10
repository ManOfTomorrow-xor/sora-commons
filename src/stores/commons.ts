import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useParliamentStore } from "@/stores/parliament";
import { COMMONS_CONFIG } from "@/constants/commonsConfig";
// ─── Types ────────────────────────────────────────────────────────────────────

export type ProposalStatus =
  | "draft"
  | "signal"          // Stage 2 — Community Signal
  | "deliberation"    // Stage 3 — Parliament Deliberation
  | "sortition"       // Stage 4 — Sortition Decision
  | "funded"          // Stage 5 — Milestone Escrow active
  | "complete"        // All milestones confirmed
  | "rejected"        // Rejected by sortition
  | "archived";       // Failed community signal

export type SignalVote = "aye" | "nay";

export type Signal = {
  accountId: string;
  vote: SignalVote;
  createdAt: string;
};

export type Milestone = {
  id: string;
  description: string;
  xorAmount: string;
  timeline: string;
  completed: boolean;
  completedAt: string | null;
  xorBurned: string;
};

export type DiscussionPost = {
  id: string;
  proposalId: string;
  authorAccountId: string;
  content: string;
  isAmendment: boolean;
  createdAt: string;
};

export type Amendment = {
  id: string;
  proposalId: string;
  version: number;
  description: string;
  milestones: Omit<Milestone, "id" | "completed" | "completedAt" | "xorBurned">[];
  submittedAt: string;
};

export type SortitionDecision = "approve" | "reject" | "revision";

export type PanelVote = {
  accountId: string;
  decision: SortitionDecision;
  feedback: string;
  votedAt: string;
};

export type CommonsProposal = {
  id: string;
  proposerAccountId: string;
  title: string;
  description: string;
  xorRequested: string;
  milestones: Milestone[];
  status: ProposalStatus;

  // Stage 2
  signals: Signal[];
  signalEndsAt: string | null;

  // Stage 3
  discussionPosts: DiscussionPost[];
  amendments: Amendment[];
  deliberationEndsAt: string | null;
  sortitionExcluded: string[];  // accounts excluded from sortition pool
  parliamentBrief: string | null;
  parliamentRemarks: string | null;

  // Stage 4
  panelMembers: string[];
  panelVotes: PanelVote[];
  sortitionEndsAt: string | null;
  revisionCount: number;

  // Stage 5
  xorBurned: string;

  createdAt: string;
};

export type CommonsRole =
  | "visitor"
  | "holder"
  | "citizen"
  | "panel_member"
  | "proposer"
  | "operator";
  // ─── Store ────────────────────────────────────────────────────────────────────

export const useCommonsStore = defineStore("commons", () => {
  const parliament = useParliamentStore();

  // ── State ──────────────────────────────────────────────────────────────────

  const proposals = ref<CommonsProposal[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const activeProposalId = ref<string | null>(null);

  // Draft state
  const draftTitle = ref("");
  const draftDescription = ref("");
  const draftXorRequested = ref("");
  const draftMilestones = ref<
    Omit<Milestone, "id" | "completed" | "completedAt" | "xorBurned">[]
  >([{ description: "", xorAmount: "", timeline: "" }]);

  // ── Derived from Parliament ────────────────────────────────────────────────

  const currentAccountId = computed(
    () => parliament.activeAccountDisplayId || parliament.requestAccountId || "",
  );
  const isConnected = computed(() => Boolean(currentAccountId.value));
  const isCitizen = computed(() => parliament.hasCitizenRecord);
  const isOperator = computed(
    () => parliament.hasParliamentPermission || parliament.hasEnactPermission || COMMONS_CONFIG.DEMO_MODE,
  );
  const citizenCount = computed(() => parliament.citizenCountDisplay);
  const xorBalance = computed(() => parliament.xorBalance);

  // ── Commons Role ───────────────────────────────────────────────────────────

  const commonsRole = computed((): CommonsRole => {
    if (!isConnected.value) return "visitor";
    if (isOperator.value) return "operator";
    const accountId = currentAccountId.value;
    const isOnPanel = proposals.value.some(
      (p) =>
        p.status === "sortition" &&
        p.panelMembers.includes(accountId),
    );
    if (isOnPanel) return "panel_member";
    const hasActiveProposal = proposals.value.some(
      (p) =>
        p.proposerAccountId === accountId &&
        (p.status === "signal" ||
          p.status === "deliberation" ||
          p.status === "sortition"),
    );
   if (hasActiveProposal) return "proposer";
    if (isCitizen.value) return "citizen";
    if (COMMONS_CONFIG.DEMO_MODE) return "citizen";
    return "holder";
  });

  // ── Computed: Proposal Views ───────────────────────────────────────────────

  // ── Computed: Proposal Views ───────────────────────────────────────────────

  const activeProposal = computed(() =>
    proposals.value.find((p) => p.id === activeProposalId.value) ?? null,
  );

  const proposalsByStatus = computed(() => {
    const groups: Record<ProposalStatus, CommonsProposal[]> = {
      draft: [], signal: [], deliberation: [], sortition: [],
      funded: [], complete: [], rejected: [], archived: [],
    };
    for (const p of proposals.value) { groups[p.status].push(p); }
    return groups;
  });

  const liveProposals = computed(() => [
    ...proposalsByStatus.value.signal,
    ...proposalsByStatus.value.deliberation,
    ...proposalsByStatus.value.sortition,
    ...proposalsByStatus.value.funded,
  ]);

  const completedProposals = computed(() => [
    ...proposalsByStatus.value.complete,
    ...proposalsByStatus.value.rejected,
    ...proposalsByStatus.value.archived,
  ]);

  const totalXorBurned = computed(() =>
    proposals.value
      .reduce((sum, p) => sum + parseFloat(p.xorBurned || "0"), 0)
      .toFixed(4),
  );

  // ── Signal Stats ───────────────────────────────────────────────────────────

  const getSignalStats = (proposal: CommonsProposal) => {
    const aye = proposal.signals.filter((s) => s.vote === "aye").length;
    const nay = proposal.signals.filter((s) => s.vote === "nay").length;
    const total = aye + nay;
    const ayePercent = total > 0 ? Math.round((aye / total) * 100) : 0;
    const meetsQuorum = aye >= COMMONS_CONFIG.MINIMUM_AYE_SIGNALS;
    const meetsPercent = ayePercent >= COMMONS_CONFIG.MINIMUM_AYE_PERCENT;
    const passes = meetsQuorum && meetsPercent;
    return { aye, nay, total, ayePercent, meetsQuorum, meetsPercent, passes };
  };

 const canSignal = (proposal: CommonsProposal): boolean => {
    if (proposal.status !== "signal") return false;
    if (!COMMONS_CONFIG.DEMO_MODE && proposal.proposerAccountId === currentAccountId.value) return false;
    if (!COMMONS_CONFIG.DEMO_MODE) {
      if (parseFloat(xorBalance.value) < parseFloat(COMMONS_CONFIG.MINIMUM_SIGNAL_BALANCE)) return false;
    }
    if (proposal.signals.some((s) => s.accountId === currentAccountId.value)) return false;
    return true;
  };

  const hasSignaled = (proposal: CommonsProposal): SignalVote | null => {
    const signal = proposal.signals.find((s) => s.accountId === currentAccountId.value);
    return signal?.vote ?? null;
  };

  // ── Draft Validation ───────────────────────────────────────────────────────

  const milestoneTotal = computed(() =>
    draftMilestones.value
      .reduce((sum, m) => sum + parseFloat(m.xorAmount || "0"), 0)
      .toFixed(4),
  );

  const milestoneDelta = computed(() => {
    const requested = parseFloat(draftXorRequested.value || "0");
    const total = parseFloat(milestoneTotal.value);
    return (requested - total).toFixed(4);
  });

  const isDraftValid = computed(() => {
    if (!draftTitle.value.trim()) return false;
    if (!draftDescription.value.trim()) return false;
    const xor = parseFloat(draftXorRequested.value);
    if (isNaN(xor) || xor <= 0) return false;
    if (parseFloat(xorBalance.value) < parseFloat(COMMONS_CONFIG.PROPOSAL_FEE_XOR)) return false;
    if (draftMilestones.value.length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const milestonesValid = draftMilestones.value.every(
      (m) => {
        if (!m.description.trim() || parseFloat(m.xorAmount) <= 0 || !m.timeline.trim()) return false;
        const date = new Date(m.timeline);
        return !isNaN(date.getTime()) && date > today;
      },
    );
    if (!milestonesValid) return false;
    return Math.abs(parseFloat(milestoneTotal.value) - xor) < 0.0001;
  });
  // ── Actions ────────────────────────────────────────────────────────────────

  const generateId = (): string => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const setActiveProposal = (id: string | null) => { activeProposalId.value = id; };
  const addMilestone = () => {
    draftMilestones.value.push({ description: "", xorAmount: "", timeline: "" });
  };
  const removeMilestone = (index: number) => {
    if (draftMilestones.value.length > 1) draftMilestones.value.splice(index, 1);
  };
  const resetDraft = () => {
    draftTitle.value = "";
    draftDescription.value = "";
    draftXorRequested.value = "";
    draftMilestones.value = [{ description: "", xorAmount: "", timeline: "" }];
  };

  // Stage 1 — Submit Proposal
  const submitProposal = (): CommonsProposal | null => {
    if (!isDraftValid.value || !currentAccountId.value) return null;
    const now = new Date();
    const signalEnd = new Date(
      now.getTime() + COMMONS_CONFIG.COMMUNITY_SIGNAL_DAYS * 24 * 60 * 60 * 1000,
    );
    const newProposal: CommonsProposal = {
      id: generateId(),
      proposerAccountId: currentAccountId.value,
      title: draftTitle.value.trim(),
      description: draftDescription.value.trim(),
      xorRequested: String(draftXorRequested.value).trim(),
      milestones: draftMilestones.value.map((m, i) => ({
        id: `m-${i}-${Date.now()}`,
        description: String(m.description).trim(),
        xorAmount: String(m.xorAmount).trim(),
        timeline: String(m.timeline).trim(),
        completed: false,
        completedAt: null,
        xorBurned: "0",
      })),
      status: "signal",
      signals: [],
      signalEndsAt: signalEnd.toISOString(),
      discussionPosts: [],
      amendments: [],
      deliberationEndsAt: null,
      sortitionExcluded: [currentAccountId.value],
      parliamentBrief: null,
      parliamentRemarks: null,
      panelMembers: [],
      panelVotes: [],
      sortitionEndsAt: null,
      revisionCount: 0,
      xorBurned: COMMONS_CONFIG.PROPOSAL_FEE_XOR,
      createdAt: now.toISOString(),
    };
    proposals.value.unshift(newProposal);
    resetDraft();
    return newProposal;
  };

  // Stage 2 — Cast Signal (Aye or Nay)
  const castSignal = (proposalId: string, vote: SignalVote): boolean => {
    const accountId = currentAccountId.value;
    if (!accountId) return false;
    if (!COMMONS_CONFIG.DEMO_MODE) {
      if (parseFloat(xorBalance.value) < parseFloat(COMMONS_CONFIG.MINIMUM_SIGNAL_BALANCE)) return false;
    }
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "signal") return false;
    if (!COMMONS_CONFIG.DEMO_MODE && proposal.proposerAccountId === accountId) return false;
    const existing = proposal.signals.findIndex((s) => s.accountId === accountId);
    if (existing >= 0) {
      // Allow changing vote during signal window
      proposal.signals[existing].vote = vote;
    } else {
      proposal.signals.push({
        accountId,
        vote,
        createdAt: new Date().toISOString(),
      });
    }
    // Check if signal window passed threshold
    const stats = getSignalStats(proposal);
    if (stats.passes) {
      advanceToDeliberation(proposal);
    }
    return true;
  };

  // Advance to Stage 3
  const advanceToDeliberation = (proposal: CommonsProposal) => {
    proposal.status = "deliberation";
    const deliberationEnd = new Date(
      Date.now() + COMMONS_CONFIG.PARLIAMENT_DELIBERATION_DAYS * 24 * 60 * 60 * 1000,
    );
    proposal.deliberationEndsAt = deliberationEnd.toISOString();
  };

  // Stage 3 — Post Discussion
  const postDiscussion = (proposalId: string, content: string): boolean => {
    const accountId = currentAccountId.value;
    if (!accountId || !content.trim()) return false;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "deliberation") return false;
    // Panel members cannot post in discussion
    if (proposal.panelMembers.includes(accountId)) return false;

    const post: DiscussionPost = {
      id: generateId(),
      proposalId,
      authorAccountId: accountId,
      content: content.trim(),
      isAmendment: false,
      createdAt: new Date().toISOString(),
    };
    proposal.discussionPosts.push(post);

    // Add to sortition excluded list if citizen and not proposer
    if (
      isCitizen.value &&
      accountId !== proposal.proposerAccountId &&
      !proposal.sortitionExcluded.includes(accountId)
    ) {
      proposal.sortitionExcluded.push(accountId);
    }
    return true;
  };

  // Stage 3 — Submit Amendment
  const submitAmendment = (
    proposalId: string,
    newDescription: string,
    newMilestones: Omit<Milestone, "id" | "completed" | "completedAt" | "xorBurned">[],
  ): boolean => {
    const accountId = currentAccountId.value;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "deliberation") return false;
    if (proposal.proposerAccountId !== accountId) return false;
    if (proposal.amendments.length >= COMMONS_CONFIG.MAX_AMENDMENTS) return false;

    // Validate milestone total still equals xorRequested
    const total = newMilestones.reduce((sum, m) => sum + parseFloat(m.xorAmount || "0"), 0);
    if (Math.abs(total - parseFloat(proposal.xorRequested)) > 0.0001) return false;

    const amendment: Amendment = {
      id: generateId(),
      proposalId,
      version: proposal.amendments.length + 1,
      description: newDescription.trim(),
      milestones: newMilestones,
      submittedAt: new Date().toISOString(),
    };
    proposal.amendments.push(amendment);

    // Apply amendment to proposal
    proposal.description = newDescription.trim();
    proposal.milestones = newMilestones.map((m, i) => ({
      id: `m-${i}-${Date.now()}`,
      description: String(m.description).trim(),
      xorAmount: String(m.xorAmount).trim(),
      timeline: String(m.timeline).trim(),
      completed: false,
      completedAt: null,
      xorBurned: "0",
    }));

    // Add 48hr extension
    const currentEnd = new Date(proposal.deliberationEndsAt ?? Date.now());
    const newEnd = new Date(
      currentEnd.getTime() + COMMONS_CONFIG.AMENDMENT_EXTENSION_HOURS * 60 * 60 * 1000,
    );
    proposal.deliberationEndsAt = newEnd.toISOString();

    // Post amendment notice to discussion
    proposal.discussionPosts.push({
      id: generateId(),
      proposalId,
      authorAccountId: accountId,
      content: `Amendment ${amendment.version} submitted. Description and milestones updated.`,
      isAmendment: true,
      createdAt: new Date().toISOString(),
    });

    return true;
  };

  // Stage 3 — Submit Parliament Brief (operator only)
  const submitParliamentBrief = (proposalId: string, brief: string): boolean => {
    if (!isOperator.value) return false;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "deliberation") return false;
    proposal.parliamentBrief = brief.trim();

    // Brief author excluded from sortition
    const accountId = currentAccountId.value;
    if (!proposal.sortitionExcluded.includes(accountId)) {
      proposal.sortitionExcluded.push(accountId);
    }
    return true;
  };

  // Stage 3 — Submit Parliament Final Remarks (operator only)
  const submitParliamentRemarks = (proposalId: string, remarks: string): boolean => {
    if (!isOperator.value) return false;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "deliberation") return false;
    if (!proposal.parliamentBrief) return false;
    proposal.parliamentRemarks = remarks.trim();
    return true;
  };

  // Advance to Stage 4 — Sortition
 const advanceToSortition = (proposalId: string): boolean => {
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "deliberation") return false;
    proposal.status = "sortition";
    const sortitionEnd = new Date(
      Date.now() + COMMONS_CONFIG.SORTITION_DECISION_DAYS * 24 * 60 * 60 * 1000,
    );
    proposal.sortitionEndsAt = sortitionEnd.toISOString();
    // Phase 1B: replace with real Parliament sortition contract call
    proposal.panelMembers = ["[SORTITION PENDING - Phase 1B]"];
    return true;
  };

  // Stage 4 — Panel Vote
  const castPanelVote = (
    proposalId: string,
    decision: SortitionDecision,
    feedback: string,
  ): boolean => {
    const accountId = currentAccountId.value;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "sortition") return false;
    if (!proposal.panelMembers.includes(accountId) && !isOperator.value) return false;
    if (proposal.panelVotes.some((v) => v.accountId === accountId)) return false;

    proposal.panelVotes.push({
      accountId,
      decision,
      feedback: feedback.trim(),
      votedAt: new Date().toISOString(),
    });

    // Check if threshold reached
    const approvals = proposal.panelVotes.filter((v) => v.decision === "approve").length;
    const rejections = proposal.panelVotes.filter((v) => v.decision === "reject").length;
    const revisions = proposal.panelVotes.filter((v) => v.decision === "revision").length;
    const threshold = COMMONS_CONFIG.SORTITION_APPROVAL_THRESHOLD;

    if (approvals >= threshold) {
      proposal.status = "funded";
    } else if (rejections >= threshold) {
      proposal.status = "rejected";
    } else if (revisions >= threshold && proposal.revisionCount < 1) {
      // Send back to deliberation once only
      proposal.revisionCount += 1;
      proposal.status = "deliberation";
      proposal.panelVotes = [];
      const revisionEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      proposal.deliberationEndsAt = revisionEnd.toISOString();
    }
    return true;
  };
  // Stage 5 — Confirm Milestone
  const confirmMilestone = (proposalId: string, milestoneId: string): boolean => {
    const accountId = currentAccountId.value;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal) return false;
    if (proposal.status !== "funded") return false;
    if (!proposal.panelMembers.includes(accountId) && !isOperator.value) return false;

    const milestone = proposal.milestones.find((m) => m.id === milestoneId);
    if (!milestone || milestone.completed) return false;

    // Calculate burn — 1% of tranche
    const tranche = parseFloat(milestone.xorAmount);
    const burn = (tranche * COMMONS_CONFIG.MILESTONE_BURN_PERCENT) / 100;
    const received = tranche - burn;

    milestone.completed = true;
    milestone.completedAt = new Date().toISOString();
    milestone.xorBurned = burn.toFixed(4);

    // Add to proposal total burn
    proposal.xorBurned = (
      parseFloat(proposal.xorBurned) + burn
    ).toFixed(4);

    // Check if all milestones complete
    if (proposal.milestones.every((m) => m.completed)) {
      proposal.status = "complete";
    }

    console.log(
      `Milestone confirmed. Tranche: ${tranche} XOR. ` +
      `Burned: ${burn.toFixed(4)} XOR. Received: ${received.toFixed(4)} XOR.`
    );

    return true;
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const statusLabel = (status: ProposalStatus): string => ({
    draft: "Draft",
    signal: "Community Signal",
    deliberation: "Parliament Deliberation",
    sortition: "Sortition",
    funded: "Funded",
    complete: "Complete",
    rejected: "Rejected",
    archived: "Archived",
  }[status]);

  const stageNumber = (status: ProposalStatus): number => ({
    draft: 0,
    signal: 2,
    deliberation: 3,
    sortition: 4,
    funded: 5,
    complete: 5,
    rejected: 4,
    archived: 2,
  }[status]);

  const roleLabel = (role: CommonsRole): string => ({
    visitor: "Visitor",
    holder: "XOR Holder",
    citizen: "Citizen",
    panel_member: "Panel Member",
    proposer: "Proposer",
    operator: "Operator",
  }[role]);

  const roleHint = (role: CommonsRole): string => ({
    visitor: "Connect a wallet to participate.",
    holder: "You can signal Aye or Nay on proposals. Bond 10,000 XOR in Governance to become a citizen.",
    citizen: "You can signal, deliberate in Stage 3, and are eligible for sortition.",
    panel_member: "You have been randomly selected to make a binding funding decision.",
    proposer: "You have an active proposal. You can respond in Parliament deliberation.",
    operator: "Parliament operator. You can submit briefs and confirm escalated milestones.",
  }[role]);

  const formatDate = (iso: string | null): string => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const daysRemaining = (iso: string | null): number => {
    if (!iso) return 0;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  // Revise and Resubmit — pre-fills draft from rejected proposal
  const reviseAndResubmit = (proposalId: string): void => {
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "rejected") return;
    draftTitle.value = proposal.title;
    draftDescription.value = proposal.description;
    draftXorRequested.value = proposal.xorRequested;
    draftMilestones.value = proposal.milestones.map((m) => ({
      description: m.description,
      xorAmount: m.xorAmount,
      timeline: "",
    }));
  };

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    // State
    proposals, isLoading, error, activeProposalId,
    draftTitle, draftDescription, draftXorRequested, draftMilestones,

    // Derived from Parliament
    currentAccountId, isConnected, isCitizen, isOperator,
    citizenCount, xorBalance,

    // Commons role
    commonsRole,

    // Proposal views
    activeProposal, proposalsByStatus, liveProposals,
    completedProposals, totalXorBurned,

    // Signal
    getSignalStats, canSignal, hasSignaled,

    // Draft validation
    isDraftValid, milestoneTotal, milestoneDelta,

    // Actions
    setActiveProposal, addMilestone, removeMilestone,
    resetDraft, submitProposal, castSignal,
    postDiscussion, submitAmendment, submitParliamentBrief, submitParliamentRemarks, reviseAndResubmit,
   advanceToSortition, castPanelVote, confirmMilestone,

    // Helpers
    statusLabel, stageNumber, roleLabel, roleHint,
    formatDate, daysRemaining,
  };
});
  