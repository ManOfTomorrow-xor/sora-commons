import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useParliamentStore } from "@/stores/parliament";
import { COMMONS_CONFIG } from "@/constants/commonsConfig";
import { supabase } from "@/web/lib/supabase";
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
  xorAmount?: string;
  timeline: string;
  evidence?: string;              // the PROMISE — "evidence you'll present" (set at creation)
  deliveredEvidence?: string;     // the ACTUAL evidence submitted at delivery (the claim)
  deliveredAt?: string | null;    // when the proposer marked it delivered
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
  description: string;        // short summary — shows on the feed card
  story?: string;             // full narrative — shows on the Story page
  track?: "donations" | "desk";   // funding track; "desk" requires Desk signal (later)
  publicBenefit?: string;     // who else gains (S5, optional)
  xorRequested: string;
  fundingMode?: "goal" | "open";   // "open" = no set goal, accept any donations
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
  // Social / engagement counts (in-memory now; backend-persisted later)
  likes: number;
  boostCount: number;
  followers: number;
  backers: number;
  totalDonated: string;
};

export type CommonsRole =
  | "visitor"
  | "holder"
  | "citizen"
  | "panel_member"
  | "proposer"
  | "operator";

// ─── Reputation (Decision 40) ───────────────────────────────────────────────
// Scoped, decaying, floored, presence-only. There is deliberately NO field and
// NO code path that records absence or subtracts points. Absence is expressed
// solely by read-side decay, which never falls below the floor — dignity lives
// in the math, not in restraint. `points`/`events` only ever increase.

export type ReputationScope = "panel" | "proposer";

export type ReputationRecord = {
  accountId: string;
  scope: ReputationScope;
  points: number;
  lastActiveAt: string;
  events: number;
};
  // ─── Store ────────────────────────────────────────────────────────────────────

export const useCommonsStore = defineStore("commons", () => {
  const parliament = useParliamentStore();

  // ── State ──────────────────────────────────────────────────────────────────

  const proposals = ref<CommonsProposal[]>([]);
  const savedProposals = ref<string[]>([]); // proposal ids the user has bookmarked
  const socialRows = ref<{ likes: any[]; boosts: any[]; follows: any[]; saves: any[] }>({ likes: [], boosts: [], follows: [], saves: [] });
  const reputation = ref<ReputationRecord[]>([]);
  const viewingProfileId = ref<string | null>(null); // whose profile we're viewing (null = own)
  const setViewingProfile = (accountId: string | null) => { viewingProfileId.value = accountId; };
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const activeProposalId = ref<string | null>(null);
  const scrollToComments = ref(false);
  const setScrollToComments = (v: boolean) => { scrollToComments.value = v; };

  // Draft state
  const draftTitle = ref("");
  const draftDescription = ref("");
 const draftStory = ref("");
  const draftCategory = ref<"production" | "productivity_public_good" | "">("");
  const draftProductiveClaim = ref("");
  const draftInputs = ref("");
  const draftExpectedOutput = ref("");
  const draftDemandSignal = ref("");
  const draftRiskBearer = ref("");
  const draftFailureHandling = ref("");
  const draftPublicBenefit = ref("");
  const draftFundingMode = ref<"goal" | "open">("goal");
  const draftXorRequested = ref("");
  const draftMilestones = ref<
    Omit<Milestone, "id" | "completed" | "completedAt" | "xorBurned">[]
  >([{ description: "", timeline: "", evidence: "" }]);

  // Demo-only identity switcher (DEMO_MODE) — lets a solo dev test the non-owner experience.
  // Gated to DEMO_MODE; never ships. Real identity = wallet-connect + backend.
  const DEMO_ACCOUNTS = ["demo.commons.test", "viewer.commons.test", "maker.commons.test"];
  const demoAccountId = ref<string>("demo.commons.test");
  const setDemoAccount = (id: string) => {
    if (!COMMONS_CONFIG.DEMO_MODE) return;
    demoAccountId.value = id;
    const acct = id;
    likedProposals.value = socialRows.value.likes.filter((r) => r.account_id === acct).map((r) => r.proposal_id);
    boostedProposals.value = socialRows.value.boosts.filter((r) => r.account_id === acct).map((r) => r.proposal_id);
    followedProposals.value = socialRows.value.follows.filter((r) => r.account_id === acct).map((r) => r.proposal_id);
    savedProposals.value = socialRows.value.saves.filter((r) => r.account_id === acct).map((r) => r.proposal_id);
  };
  // ── Derived from Parliament ────────────────────────────────────────────────

 const currentAccountId = computed(
    () =>
      parliament.activeAccountDisplayId ||
      parliament.requestAccountId ||
      (COMMONS_CONFIG.DEMO_MODE ? demoAccountId.value : ""),
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
    if (!draftStory.value.trim()) return false;
    if (!draftCategory.value) return false;
    // Goal mode requires a positive total; open mode has no goal.
    if (draftFundingMode.value === "goal") {
      const xor = parseFloat(draftXorRequested.value);
      if (isNaN(xor) || xor <= 0) return false;
    }
    if (draftMilestones.value.length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const milestonesValid = draftMilestones.value.every((m) => {
      if (!m.description.trim() || !m.timeline.trim() || !(m.evidence ?? "").trim()) return false;
      const date = new Date(m.timeline);
      return !isNaN(date.getTime()) && date > today;
    });
    return milestonesValid;
  });
  // ── Actions ────────────────────────────────────────────────────────────────

  const generateId = (): string => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const setActiveProposal = (id: string | null) => { activeProposalId.value = id; };
  const addMilestone = () => {
    draftMilestones.value.push({ description: "", timeline: "", evidence: "" });
  };
  const removeMilestone = (index: number) => {
    if (draftMilestones.value.length > 1) draftMilestones.value.splice(index, 1);
  };
  const resetDraft = () => {
    draftTitle.value = "";
    draftDescription.value = "";
    draftStory.value = "";
    draftCategory.value = "";
    draftProductiveClaim.value = "";
    draftInputs.value = "";
    draftExpectedOutput.value = "";
    draftDemandSignal.value = "";
    draftRiskBearer.value = "";
    draftFailureHandling.value = "";
    draftPublicBenefit.value = "";
    draftXorRequested.value = "";
    draftFundingMode.value = "goal";
    draftMilestones.value = [{ description: "", timeline: "", evidence: "" }];
  };

  // Stage 1 — Submit Proposal
  async function persistProposalToSupabase(p: CommonsProposal) {
  // 1. ensure the proposer's account row exists (FK target)
  const { error: accErr } = await supabase
    .from("accounts")
    .upsert(
      { account_id: p.proposerAccountId, public_key: "", network: "taira" },
      { onConflict: "account_id", ignoreDuplicates: true },
    );
  if (accErr) { console.error("account upsert failed:", accErr); return; }

  // 2. insert the proposal, returning its DB-generated id
  const { data: propRows, error: propErr } = await supabase
    .from("proposals")
    .insert({
      proposer_account_id: p.proposerAccountId,
      title: p.title,
      summary: p.description,
      story: p.story ?? null,
      category: p.category ?? null,
      track: p.track,
      funding_mode: p.fundingMode ?? "open",
      xor_requested: p.xorRequested ?? "0",
      public_benefit: p.publicBenefit ?? null,
      risk_bearer: p.riskBearer ?? null,
      failure_handling: p.failureHandling ?? null,
      status: "active",
    })
    .select("id")
    .single();
  if (propErr) { console.error("proposal insert failed:", propErr); return; }

  const dbProposalId = propRows.id;

  // 3. insert the milestones (chapters) against the DB proposal id
  if (p.milestones.length > 0) {
    const rows = p.milestones.map((m, i) => ({
      proposal_id: dbProposalId,
      position: i,
      description: m.description,
      due_date: m.timeline || null,
      evidence: m.evidence ?? null,
      completed: false,
    }));
    const { error: msErr } = await supabase.from("milestones").insert(rows);
    if (msErr) { console.error("milestone insert failed:", msErr); return; }
  }

  console.log("✓ proposal + milestones persisted:", dbProposalId);
}
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
       story: draftStory.value.trim() || undefined,
       track: "donations",   // only community track available now; Desk track unlocked via signal later
       category: draftCategory.value || undefined,
      productiveClaim: draftProductiveClaim.value.trim() || undefined,
      inputs: draftInputs.value.trim() || undefined,
      expectedOutput: draftExpectedOutput.value.trim() || undefined,
      demandSignal: draftDemandSignal.value.trim() || undefined,
      riskBearer: draftRiskBearer.value.trim() || undefined,
      failureHandling: draftFailureHandling.value.trim() || undefined,
      publicBenefit: draftPublicBenefit.value.trim() || undefined,
     xorRequested: draftFundingMode.value === "goal" ? String(draftXorRequested.value).trim() : "0",
      fundingMode: draftFundingMode.value,
      milestones: draftMilestones.value.map((m, i) => ({
        id: `m-${i}-${Date.now()}`,
        description: String(m.description).trim(),
        timeline: String(m.timeline).trim(),
        evidence: String(m.evidence ?? "").trim() || undefined,
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
      xorBurned: "0",
      createdAt: now.toISOString(),
      likes: 0,
      boostCount: 0,
      followers: 0,
      backers: 0,
      totalDonated: "0",
    };
    proposals.value.unshift(newProposal);   // optimistic: instant feedback
    persistProposalToSupabase(newProposal).then(() => loadProposals());  // then DB becomes source of truth
    resetDraft();
    return newProposal;
  };
  async function loadProposals() {
    const { data, error: loadErr } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (loadErr) { console.error("load proposals failed:", loadErr); return; }
    if (!data) return;
    const { data: msData } = await supabase
      .from("milestones")
      .select("*")
      .order("position", { ascending: true });
      const { data: cData } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });
    const cByProposal: Record<string, any[]> = {};
    for (const c of cData ?? []) {
      (cByProposal[c.proposal_id] ??= []).push(c);
    }
    const msByProposal: Record<string, any[]> = {};
    for (const m of msData ?? []) {
      (msByProposal[m.proposal_id] ??= []).push(m);
    }
    const acct = currentAccountId.value;
    const [likesRes, boostsRes, followsRes, savesRes] = await Promise.all([
      supabase.from("likes").select("account_id, proposal_id"),
      supabase.from("boosts").select("account_id, proposal_id"),
      supabase.from("follows").select("account_id, proposal_id"),
      supabase.from("saves").select("account_id, proposal_id"),
    ]);
    const countBy = (rows: any[] | null) => {
      const m: Record<string, number> = {};
      for (const r of rows ?? []) m[r.proposal_id] = (m[r.proposal_id] ?? 0) + 1;
      return m;
    };
    const likeCount = countBy(likesRes.data);
    const boostCount = countBy(boostsRes.data);
    const followCount = countBy(followsRes.data);
    // restore current account's lit state
    socialRows.value = {
      likes: likesRes.data ?? [],
      boosts: boostsRes.data ?? [],
      follows: followsRes.data ?? [],
      saves: savesRes.data ?? [],
    };
    proposals.value = data.map((row: any): CommonsProposal => ({
      id: row.id,
      proposerAccountId: row.proposer_account_id,
      title: row.title,
      description: row.summary ?? "",
      story: row.story ?? undefined,
      track: row.track ?? "donations",
      category: row.category ?? undefined,
      publicBenefit: row.public_benefit ?? undefined,
      riskBearer: row.risk_bearer ?? undefined,
      failureHandling: row.failure_handling ?? undefined,
      xorRequested: row.xor_requested ?? "0",
      fundingMode: row.funding_mode ?? "open",
    milestones: (msByProposal[row.id] ?? []).map((m: any) => ({
      id: m.id,
      description: m.description,
      timeline: m.due_date ?? "",
      evidence: m.evidence ?? undefined,
      deliveredEvidence: m.delivered_evidence ?? undefined,
      deliveredAt: m.delivered_at ?? null,
      completed: m.completed ?? false,
      completedAt: m.completed_at ?? null,
      xorBurned: "0",
    })),
      status: "signal",
      signals: [],
      signalEndsAt: null,
      discussionPosts: (cByProposal[row.id] ?? []).map((c: any) => ({
        id: c.id,
        proposalId: c.proposal_id,
        authorAccountId: c.author_account_id,
        content: c.content,
        isAmendment: c.is_amendment ?? false,
        createdAt: c.created_at,
      })),
      amendments: [],
      deliberationEndsAt: null,
      sortitionExcluded: [row.proposer_account_id],
      parliamentBrief: null,
      parliamentRemarks: null,
      panelMembers: [],
      panelVotes: [],
      sortitionEndsAt: null,
      revisionCount: 0,
      xorBurned: "0",
      createdAt: row.created_at,
      likes: likeCount[row.id] ?? 0,
      boostCount: boostCount[row.id] ?? 0,
      followers: followCount[row.id] ?? 0,
      backers: 0,
      totalDonated: "0",
    }));
    console.log(`✓ loaded ${proposals.value.length} proposals from Supabase`);
  }
  

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
    if (!proposal) return false;
    const post: DiscussionPost = {
      id: generateId(),
      proposalId,
      authorAccountId: accountId,
      content: content.trim(),
      isAmendment: false,
      createdAt: new Date().toISOString(),
    };
    proposal.discussionPosts.push(post);
    // persist to Supabase (account upsert first to satisfy FK, then insert comment)
    (async () => {
      await supabase.from("accounts").upsert(
        { account_id: accountId, public_key: "", network: "taira" },
        { onConflict: "account_id", ignoreDuplicates: true },
      );
      const { error: cErr } = await supabase.from("comments").insert({
        proposal_id: proposalId,
        author_account_id: accountId,
        content: content.trim(),
        is_amendment: false,
      });
      if (cErr) console.error("comment insert failed:", cErr);
    })();
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
    // On-time panel vote → panel reputation. This runs only while status is still
    // "sortition" (window open). A late juror reaches a transitioned proposal and
    // earns nothing — never a penalty.
    creditReputation(accountId, "panel", COMMONS_CONFIG.REPUTATION_PANEL_VOTE_POINTS);
    // Check if threshold reached
    const approvals = proposal.panelVotes.filter((v) => v.decision === "approve").length;
    const rejections = proposal.panelVotes.filter((v) => v.decision === "reject").length;
    const revisions = proposal.panelVotes.filter((v) => v.decision === "revision").length;
    const threshold = COMMONS_CONFIG.SORTITION_APPROVAL_THRESHOLD;
    const panelSize = COMMONS_CONFIG.SORTITION_PANEL_SIZE;

    const sendToRevision = () => {
      proposal.revisionCount += 1;
      proposal.status = "deliberation";
      proposal.panelVotes = [];
      const revisionEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      proposal.deliberationEndsAt = revisionEnd.toISOString();
    };

    if (approvals >= threshold) {
      proposal.status = "funded";
    } else if (rejections >= threshold) {
      proposal.status = "rejected";
    } else if (revisions >= threshold && proposal.revisionCount < 1) {
      sendToRevision();
    } else if (proposal.panelVotes.length >= panelSize) {
      // All panel members have voted but no option reached the threshold —
      // deadlock (e.g. 2 Approve / 2 Reject / 1 Revision).
      // First deadlock → Revision (refine, try once more).
      // Already revised → Reject (cannot agree twice = no funding).
      if (proposal.revisionCount < 1) {
        sendToRevision();
      } else {
        proposal.status = "rejected";
      }
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
    // Confirming a delivered milestone is panel oversight → panel reputation.
    creditReputation(accountId, "panel", COMMONS_CONFIG.REPUTATION_MILESTONE_CONFIRM_POINTS);
    // Add to proposal total burn
    proposal.xorBurned = (
      parseFloat(proposal.xorBurned) + burn
    ).toFixed(4);

    // Check if all milestones complete
    if (proposal.milestones.every((m) => m.completed)) {
      proposal.status = "complete";
    // Completion → proposer reputation (separate scope, never blended with panel).
      creditReputation(
        proposal.proposerAccountId,
        "proposer",
        COMMONS_CONFIG.REPUTATION_PROPOSAL_COMPLETE_POINTS,
      );
    }

    console.log(
      `Milestone confirmed. Tranche: ${tranche} XOR. ` +
      `Burned: ${burn.toFixed(4)} XOR. Received: ${received.toFixed(4)} XOR.`
    );

    return true;
  };
  // Proposer marks their own chapter delivered + submits actual evidence.
  // This is a CLAIM on the public record — NOT a trustless verification.
  const markChapterDelivered = (proposalId: string, milestoneId: string, evidence: string): boolean => {
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal) return false;
    if (proposal.proposerAccountId !== currentAccountId.value) return false;
    const milestone = proposal.milestones.find((m) => m.id === milestoneId);
    if (!milestone || milestone.completed) return false;
    if (!evidence.trim()) return false;
    milestone.deliveredEvidence = evidence.trim();
    milestone.deliveredAt = new Date().toISOString();
    milestone.completed = true;
    milestone.completedAt = new Date().toISOString();
    if (proposal.milestones.every((m) => m.completed)) {
      proposal.status = "complete";
    }
    return true;
  };
// ── Reputation ───────────────────────────────────────────────────────────

  const MS_PER_MONTH = 30.4375 * 24 * 60 * 60 * 1000;

  const reputationRecord = (accountId: string, scope: ReputationScope) =>
    reputation.value.find((r) => r.accountId === accountId && r.scope === scope) ?? null;

  // effective = points × ( floor% + (1 − floor%) × 2^(−Δmonths / halfLife) )
  // Δ=0 → full points · Δ→∞ → floor% × points (never zero) · any credit resets Δ→0.
  const effectiveReputation = (
    accountId: string,
    scope: ReputationScope,
    now: number = Date.now(),
  ): number => {
    const rec = reputationRecord(accountId, scope);
    if (!rec || rec.points <= 0) return 0;
    const floor = COMMONS_CONFIG.REPUTATION_FLOOR_PERCENT / 100;
    const halfLife = COMMONS_CONFIG.REPUTATION_HALF_LIFE_MONTHS;
    const elapsedMonths = Math.max(
      0,
      (now - new Date(rec.lastActiveAt).getTime()) / MS_PER_MONTH,
    );
    const decayable = (1 - floor) * Math.pow(2, -elapsedMonths / halfLife);
    return rec.points * (floor + decayable);
  };

  // The ONLY writer of reputation. It can only ADD — no caller may decrement.
  const creditReputation = (
    accountId: string,
    scope: ReputationScope,
    points: number,
  ): void => {
    if (!accountId || points <= 0) return;
    const now = new Date().toISOString();
    const rec = reputationRecord(accountId, scope);
    if (rec) {
      rec.points += points;
      rec.events += 1;
      rec.lastActiveAt = now;
    } else {
      reputation.value.push({ accountId, scope, points, lastActiveAt: now, events: 1 });
    }
  };

  const myReputation = computed(() => {
    const id = currentAccountId.value;
    return {
      panel: effectiveReputation(id, "panel"),
      proposer: effectiveReputation(id, "proposer"),
      panelEvents: reputationRecord(id, "panel")?.events ?? 0,
      proposerEvents: reputationRecord(id, "proposer")?.events ?? 0,
    };
  });

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

  const proposerLabel = (accountId: string): string => {
    const theirs = proposals.value.filter((p) => p.proposerAccountId === accountId);
    const completed = theirs.filter((p) => p.status === "complete").length;
    const flagged = theirs.some((p) => p.status === "rejected"); // placeholder; real dispute flag later
    if (flagged) return "Flagged";
    if (completed >= 3) return "Veteran";
    if (completed >= 1) return "Proven";
    return "Newcomer";
  };

  // ── Social engagement (in-memory; backend-persisted later). No XOR involved.
  const likedProposals = ref<string[]>([]);
  const boostedProposals = ref<string[]>([]);
  const followedProposals = ref<string[]>([]);
  const donatedProposals = ref<string[]>([]); // proposal ids the current account has donated to (for unique-backer counting)
  const isLiked = (id: string): boolean => likedProposals.value.includes(id);
  const isBoosted = (id: string): boolean => boostedProposals.value.includes(id);
  const isFollowing = (id: string): boolean => followedProposals.value.includes(id);

 const toggleLike = (id: string): void => {
    const p = proposals.value.find((x) => x.id === id);
    if (!p) return;
    const acct = currentAccountId.value;
    const i = likedProposals.value.indexOf(id);
    if (i >= 0) {
      likedProposals.value.splice(i, 1); p.likes = Math.max(0, p.likes - 1);
      supabase.from("likes").delete().match({ account_id: acct, proposal_id: id }).then();
    } else {
      likedProposals.value.push(id); p.likes += 1;
      (async () => {
        await supabase.from("accounts").upsert({ account_id: acct, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
        await supabase.from("likes").insert({ account_id: acct, proposal_id: id });
      })();
    }
  };
  const toggleBoost = (id: string): void => {
    const p = proposals.value.find((x) => x.id === id);
    if (!p) return;
    // One boost per proposal. (Scarce weekly allotment per user = backend-era.)
    const acct = currentAccountId.value;
    const i = boostedProposals.value.indexOf(id);
    if (i >= 0) {
      boostedProposals.value.splice(i, 1); p.boostCount = Math.max(0, p.boostCount - 1);
      supabase.from("boosts").delete().match({ account_id: acct, proposal_id: id }).then();
    } else {
      boostedProposals.value.push(id); p.boostCount += 1;
      (async () => {
        await supabase.from("accounts").upsert({ account_id: acct, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
        await supabase.from("boosts").insert({ account_id: acct, proposal_id: id });
      })();
    }
  };
const toggleFollow = (id: string): void => {
    const p = proposals.value.find((x) => x.id === id);
    if (!p) return;
    const acct = currentAccountId.value;
    const i = followedProposals.value.indexOf(id);
    if (i >= 0) {
      followedProposals.value.splice(i, 1); p.followers = Math.max(0, p.followers - 1);
      supabase.from("follows").delete().match({ account_id: acct, proposal_id: id }).then();
    } else {
      followedProposals.value.push(id); p.followers += 1;
      (async () => {
        await supabase.from("accounts").upsert({ account_id: acct, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
        await supabase.from("follows").insert({ account_id: acct, proposal_id: id });
      })();
    }
  };

  // IN-MEMORY DONATION PREVIEW ONLY — NOT real money, NOT the production path.
  // Real donations must use the MONEY-CODE DISCIPLINE: integer/BigInt base units, exact
  // precision, 1% split summing exactly, validation, confirm, Taira-first, on-chain readback.
  // This stub updates in-memory totals so the experience can be seen/refined. No XOR moves.
  const donate = (proposalId: string, amount: number): boolean => {
    const p = proposals.value.find((x) => x.id === proposalId);
    if (!p) return false;
    if (p.proposerAccountId === currentAccountId.value) return false; // no self-donation
    if (!(amount > 0)) return false;
    const burn = amount * 0.01;            // 1% burns
    const toProposer = amount - burn;       // 99% to proposer
    p.totalDonated = (parseFloat(p.totalDonated || "0") + toProposer).toFixed(4);
    p.xorBurned = (parseFloat(p.xorBurned || "0") + burn).toFixed(4);
    // Backers = UNIQUE donors per proposal. Key by account+proposal so different accounts
    // each count once (and the same account donating twice still counts once).
    const key = currentAccountId.value + "::" + proposalId;
    if (!donatedProposals.value.includes(key)) {
      donatedProposals.value.push(key);
      p.backers = (p.backers || 0) + 1;
    }
    return true;
  };

  const isSaved = (proposalId: string): boolean =>
    savedProposals.value.includes(proposalId);

  const toggleSave = (proposalId: string): void => {
    const acct = currentAccountId.value;
    const i = savedProposals.value.indexOf(proposalId);
    if (i >= 0) {
      savedProposals.value.splice(i, 1);
      supabase.from("saves").delete().match({ account_id: acct, proposal_id: proposalId }).then();
    } else {
      savedProposals.value.push(proposalId);
      (async () => {
        await supabase.from("accounts").upsert({ account_id: acct, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
        await supabase.from("saves").insert({ account_id: acct, proposal_id: proposalId });
      })();
    }
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
    draftStory.value = proposal.story;
    draftXorRequested.value = proposal.xorRequested;
    draftMilestones.value = proposal.milestones.map((m) => ({
      description: m.description,
      timeline: "",
      evidence: m.evidence ?? "",
    }));
  };

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    // State
    proposals, isLoading, error, activeProposalId,
  draftTitle, draftDescription, draftStory, draftXorRequested, draftFundingMode, draftMilestones,
    draftCategory, draftProductiveClaim, draftInputs, draftExpectedOutput,
    draftDemandSignal, draftRiskBearer, draftFailureHandling, draftPublicBenefit, scrollToComments, setScrollToComments,

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
    resetDraft, submitProposal,loadProposals, castSignal,
    postDiscussion, submitAmendment, submitParliamentBrief, submitParliamentRemarks, reviseAndResubmit,
    advanceToSortition, castPanelVote, confirmMilestone, markChapterDelivered,

    // Helpers
    statusLabel, stageNumber, roleLabel, roleHint,
    savedProposals, isSaved, toggleSave, proposerLabel, viewingProfileId, setViewingProfile, isLiked, isBoosted, isFollowing, toggleLike, toggleBoost, toggleFollow, 
    donate, donatedProposals, DEMO_ACCOUNTS, demoAccountId, setDemoAccount,
    // Reputation
    reputation, effectiveReputation, reputationRecord, creditReputation, myReputation,
  };
});
  