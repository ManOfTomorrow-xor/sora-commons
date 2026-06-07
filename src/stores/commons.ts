import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useParliamentStore } from "@/stores/parliament";

export type ProposalStatus =
  | "draft"
  | "voting"
  | "awaiting_panel"
  | "under_review"
  | "funded"
  | "in_progress"
  | "complete"
  | "rejected"
  | "archived";

export type Milestone = {
  id: string;
  description: string;
  xorAmount: string;
  completed: boolean;
  completedAt: string | null;
};

export type CommonsProposal = {
  id: string;
  proposerAccountId: string;
  title: string;
  description: string;
  xorRequested: string;
  milestones: Milestone[];
  status: ProposalStatus;
  votes: string[];
  panelMembers: string[];
  createdAt: string;
  votingEndsAt: string | null;
  reviewEndsAt: string | null;
  xorBurned: string;
};

export type CommonsRole =
  | "visitor"
  | "holder"
  | "citizen"
  | "panel_member"
  | "proposer"
  | "operator";

export const useCommonsStore = defineStore("commons", () => {
  const parliament = useParliamentStore();

  const proposals = ref<CommonsProposal[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const activeProposalId = ref<string | null>(null);

  const draftTitle = ref("");
  const draftDescription = ref("");
  const draftXorRequested = ref("");
  const draftMilestones = ref<Omit<Milestone, "id" | "completed" | "completedAt">[]>([
    { description: "", xorAmount: "" },
  ]);
 const currentAccountId = computed(
    () => parliament.activeAccountDisplayId || parliament.requestAccountId || "",
  );
  const isConnected = computed(() => Boolean(currentAccountId.value));
  const isCitizen = computed(() => parliament.hasCitizenRecord);
  const isOperator = computed(() => parliament.hasParliamentPermission || parliament.hasEnactPermission);
  const citizenCount = computed(() => parliament.citizenCountDisplay);
  const xorBalance = computed(() => parliament.xorBalance);

  const commonsRole = computed((): CommonsRole => {
    if (!isConnected.value) return "visitor";
    if (isOperator.value) return "operator";
    const accountId = currentAccountId.value;
    const isOnPanel = proposals.value.some(
      (p) =>
        (p.status === "under_review" || p.status === "funded" || p.status === "in_progress") &&
        p.panelMembers.includes(accountId),
    );
    if (isOnPanel) return "panel_member";
    const hasActiveProposal = proposals.value.some(
      (p) =>
        p.proposerAccountId === accountId &&
        (p.status === "voting" || p.status === "awaiting_panel" || p.status === "under_review"),
    );
    if (hasActiveProposal) return "proposer";
    if (isCitizen.value) return "citizen";
    return "holder";
  });

  const activeProposal = computed(() =>
    proposals.value.find((p) => p.id === activeProposalId.value) ?? null,
  );

  const proposalsByStatus = computed(() => {
    const groups: Record<ProposalStatus, CommonsProposal[]> = {
      draft: [], voting: [], awaiting_panel: [], under_review: [],
      funded: [], in_progress: [], complete: [], rejected: [], archived: [],
    };
    for (const p of proposals.value) { groups[p.status].push(p); }
    return groups;
  });

  const liveProposals = computed(() => [
    ...proposalsByStatus.value.voting,
    ...proposalsByStatus.value.awaiting_panel,
    ...proposalsByStatus.value.under_review,
    ...proposalsByStatus.value.funded,
    ...proposalsByStatus.value.in_progress,
  ]);

  const completedProposals = computed(() => [
    ...proposalsByStatus.value.complete,
    ...proposalsByStatus.value.rejected,
    ...proposalsByStatus.value.archived,
  ]);

  const totalXorBurned = computed(() =>
    proposals.value.reduce((sum, p) => sum + parseFloat(p.xorBurned || "0"), 0).toFixed(4),
  );

  const isDraftValid = computed(() => {
    if (!draftTitle.value.trim()) return false;
    if (!draftDescription.value.trim()) return false;
    const xor = parseFloat(draftXorRequested.value);
    if (isNaN(xor) || xor <= 0) return false;
    if (draftMilestones.value.length === 0) return false;
    const milestonesValid = draftMilestones.value.every(
      (m) => m.description.trim() && parseFloat(m.xorAmount) > 0,
    );
    if (!milestonesValid) return false;
    const milestoneTotal = draftMilestones.value.reduce(
      (sum, m) => sum + parseFloat(m.xorAmount || "0"), 0,
    );
    return Math.abs(milestoneTotal - xor) < 0.0001;
  });

  const milestoneTotal = computed(() =>
    draftMilestones.value.reduce((sum, m) => sum + parseFloat(m.xorAmount || "0"), 0).toFixed(4),
  );

  const milestoneDelta = computed(() => {
    const requested = parseFloat(draftXorRequested.value || "0");
    const total = parseFloat(milestoneTotal.value);
    return (requested - total).toFixed(4);
  });

  const setActiveProposal = (id: string | null) => { activeProposalId.value = id; };
  const addMilestone = () => { draftMilestones.value.push({ description: "", xorAmount: "" }); };
  const removeMilestone = (index: number) => {
    if (draftMilestones.value.length > 1) draftMilestones.value.splice(index, 1);
  };
  const resetDraft = () => {
    draftTitle.value = "";
    draftDescription.value = "";
    draftXorRequested.value = "";
    draftMilestones.value = [{ description: "", xorAmount: "" }];
  };

  const generateProposalId = (): string => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  };
  const submitProposal = (): CommonsProposal | null => {
    if (!isDraftValid.value || !currentAccountId.value) return null;
    const now = new Date();
    const votingEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newProposal: CommonsProposal = {
      id: generateProposalId(),
      proposerAccountId: currentAccountId.value,
      title: draftTitle.value.trim(),
      description: draftDescription.value.trim(),
      xorRequested: draftXorRequested.value.trim(),
      milestones: draftMilestones.value.map((m, i) => ({
        id: `m-${i}-${Date.now()}`,
        description: m.description.trim(),
        xorAmount: m.xorAmount.trim(),
        completed: false,
        completedAt: null,
      })),
      status: "voting",
      votes: [],
      panelMembers: [],
      createdAt: now.toISOString(),
      votingEndsAt: votingEnd.toISOString(),
      reviewEndsAt: null,
      xorBurned: "0",
    };
    proposals.value.unshift(newProposal);
    resetDraft();
    return newProposal;
  };

  const castVote = (proposalId: string): boolean => {
    if (!isCitizen.value) return false;
    const accountId = currentAccountId.value;
    if (!accountId) return false;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "voting") return false;
    if (proposal.votes.includes(accountId)) return false;
    if (proposal.proposerAccountId === accountId) return false;
    proposal.votes.push(accountId);
    const VOTE_THRESHOLD = 3;
    if (proposal.votes.length >= VOTE_THRESHOLD) advanceToSortition(proposal);
    return true;
  };

  const advanceToSortition = (proposal: CommonsProposal) => {
    proposal.status = "awaiting_panel";
    // Phase 1B: replace with real Parliament sortition contract call
    setTimeout(() => {
      const live = proposals.value.find((p) => p.id === proposal.id);
      if (!live || live.status !== "awaiting_panel") return;
      live.panelMembers = ["[SORTITION PENDING - Phase 1B]"];
      live.status = "under_review";
      live.reviewEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    }, 1500);
  };

  const approveProposal = (proposalId: string): boolean => {
    const accountId = currentAccountId.value;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "under_review") return false;
    if (!proposal.panelMembers.includes(accountId) && !isOperator.value) return false;
    proposal.status = "funded";
    return true;
  };

  const rejectProposal = (proposalId: string): boolean => {
    const accountId = currentAccountId.value;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "under_review") return false;
    if (!proposal.panelMembers.includes(accountId) && !isOperator.value) return false;
    proposal.status = "rejected";
    return true;
  };

  const confirmMilestone = (proposalId: string, milestoneId: string): boolean => {
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal) return false;
    if (proposal.status !== "funded" && proposal.status !== "in_progress") return false;
    const milestone = proposal.milestones.find((m) => m.id === milestoneId);
    if (!milestone || milestone.completed) return false;
    milestone.completed = true;
    milestone.completedAt = new Date().toISOString();
    proposal.status = "in_progress";
    proposal.xorBurned = (parseFloat(proposal.xorBurned) + parseFloat(milestone.xorAmount)).toFixed(4);
    if (proposal.milestones.every((m) => m.completed)) proposal.status = "complete";
    return true;
  };

  const statusLabel = (status: ProposalStatus): string => ({
    draft: "Draft", voting: "Community Vote", awaiting_panel: "Drawing Panel",
    under_review: "Under Review", funded: "Funded", in_progress: "In Progress",
    complete: "Complete", rejected: "Rejected", archived: "Archived",
  }[status]);

  const roleLabel = (role: CommonsRole): string => ({
    visitor: "Visitor", holder: "XOR Holder", citizen: "Citizen",
    panel_member: "Panel Member", proposer: "Proposer", operator: "Operator",
  }[role]);

  const canVote = (proposal: CommonsProposal): boolean => {
    if (!isCitizen.value) return false;
    if (proposal.status !== "voting") return false;
    if (proposal.proposerAccountId === currentAccountId.value) return false;
    if (proposal.votes.includes(currentAccountId.value)) return false;
    return true;
  };

  const hasVoted = (proposal: CommonsProposal): boolean =>
    proposal.votes.includes(currentAccountId.value);

  return {
    proposals, isLoading, error, activeProposalId,
    draftTitle, draftDescription, draftXorRequested, draftMilestones,
    currentAccountId, isConnected, isCitizen, isOperator, citizenCount, xorBalance,
    commonsRole, activeProposal, proposalsByStatus, liveProposals, completedProposals,
    totalXorBurned, isDraftValid, milestoneTotal, milestoneDelta,
    setActiveProposal, addMilestone, removeMilestone, resetDraft, submitProposal,
    castVote, approveProposal, rejectProposal, confirmMilestone,
    statusLabel, roleLabel, canVote, hasVoted,
  };
});
