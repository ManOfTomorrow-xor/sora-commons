import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useParliamentStore } from "@/stores/parliament";
import { COMMONS_CONFIG } from "@/constants/commonsConfig";
import { supabase } from "@/web/lib/supabase";
// ─── Types ────────────────────────────────────────────────────────────────────

export type ProposalStatus =
  | "draft"
  | "active"          // Phase 1 — live / in progress
  | "signal"          // Stage 2 — Community Signal (legacy five-stage; Phase 2)
  | "deliberation"    // Stage 3 — Parliament Deliberation (legacy; Phase 2)
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
  flags?: Flag[];
  documents?: DocumentRef[];
};

export type DiscussionPost = {
  id: string;
  proposalId: string;
  authorAccountId: string;
  content: string;
  isAmendment: boolean;
  createdAt: string;
};

export type Flag = {
  id: string;
  proposalId: string;
  milestoneId: string | null;
  flaggerAccountId: string;
  reason: string;
  status: "open" | "withdrawn";
  withdrawnAt: string | null;
  proposerResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
};

export type DocumentRef = {
  id: string;
  filename: string;
  url: string;
  fileType: string;
  uploadedAt: string;
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
  documents?: DocumentRef[];
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
  const mockWalletId = ref<string>("");
  const avatarUrl = ref<string>("");
  const avatarByAccount = ref<Record<string, string>>({});
  const displayNameByAccount = ref<Record<string, string>>({});
  const bioByAccount = ref<Record<string, string>>({});
  const setDemoAccount = (id: string) => {
    if (!COMMONS_CONFIG.SHOW_DEV_TOOLS) return;
    demoAccountId.value = id;
    const acct = id;
    likedProposals.value = socialRows.value.likes.filter((r) => r.account_id === acct).map((r) => r.proposal_id);
    boostedProposals.value = socialRows.value.boosts.filter((r) => r.account_id === acct).map((r) => r.proposal_id);
    followedProposals.value = socialRows.value.follows.filter((r) => r.account_id === acct).map((r) => r.proposal_id);
    savedProposals.value = socialRows.value.saves.filter((r) => r.account_id === acct).map((r) => r.proposal_id);
    loadNotifications();   // refresh the bell for the newly-selected account
    subscribeToNotifications();   // re-subscribe realtime with the new account's filter

  };

  // ── Derived from Parliament ────────────────────────────────────────────────

 const currentAccountId = computed(
    () =>
      parliament.activeAccountDisplayId ||
      parliament.requestAccountId ||
      (COMMONS_CONFIG.SHOW_DEV_TOOLS ? demoAccountId.value : "") ||
      (COMMONS_CONFIG.DEMO_MODE ? mockWalletId.value : ""),
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
const hasDraft = ref(false);
const draftPreview = ref<{ title: string; updatedAt: string } | null>(null);
const resumingDraft = ref(false);
const draftFiles = ref<any[]>([]);

  async function saveDraft(files: any[] = []): Promise<boolean> {
    if (!currentAccountId.value) return false;
    const data = {
      title: draftTitle.value,
      description: draftDescription.value,
      story: draftStory.value,
      category: draftCategory.value,
      productiveClaim: draftProductiveClaim.value,
      inputs: draftInputs.value,
      expectedOutput: draftExpectedOutput.value,
      demandSignal: draftDemandSignal.value,
      riskBearer: draftRiskBearer.value,
      failureHandling: draftFailureHandling.value,
      publicBenefit: draftPublicBenefit.value,
      fundingMode: draftFundingMode.value,
      xorRequested: draftXorRequested.value,
      milestones: draftMilestones.value, files,
      
    };
    const { error } = await supabase.from("proposal_drafts")
      .upsert({ account_id: currentAccountId.value, data, updated_at: new Date().toISOString() });
    if (error) { console.error("saveDraft failed:", error); return false; }
    hasDraft.value = true;
    return true;
  }

  async function loadDraft(): Promise<boolean> {
    if (!currentAccountId.value) return false;
    const { data: row, error } = await supabase.from("proposal_drafts")
      .select("data").eq("account_id", currentAccountId.value).maybeSingle();
    if (error) { console.error("loadDraft failed:", error); return false; }
    if (!row?.data) { hasDraft.value = false; return false; }
    const d = row.data;
    draftTitle.value = d.title ?? "";
    draftDescription.value = d.description ?? "";
    draftStory.value = d.story ?? "";
    draftCategory.value = d.category ?? "";
    draftProductiveClaim.value = d.productiveClaim ?? "";
    draftInputs.value = d.inputs ?? "";
    draftExpectedOutput.value = d.expectedOutput ?? "";
    draftDemandSignal.value = d.demandSignal ?? "";
    draftRiskBearer.value = d.riskBearer ?? "";
    draftFailureHandling.value = d.failureHandling ?? "";
    draftPublicBenefit.value = d.publicBenefit ?? "";
    draftFundingMode.value = d.fundingMode ?? "goal";
    draftXorRequested.value = d.xorRequested ?? "";
    draftFiles.value = d.files ?? [];
    hasDraft.value = true;
    draftMilestones.value = (d.milestones?.length ? d.milestones : [{ description: "", timeline: "", evidence: "" }]);
    hasDraft.value = true;
    resumingDraft.value = true;
    return true;
  }

  async function deleteDraft(cleanupFiles = true): Promise<void> {
    if (!currentAccountId.value) return;
    if (cleanupFiles) {
      const { data: row } = await supabase.from("proposal_drafts")
        .select("data").eq("account_id", currentAccountId.value).maybeSingle();
      const paths = (row?.data?.files || []).map((f: any) => f.path).filter(Boolean);
      if (paths.length) await deleteDraftFiles(paths);
    }
    const { error } = await supabase.from("proposal_drafts").delete().eq("account_id", currentAccountId.value);
    if (error) console.error("deleteDraft failed:", error);
    hasDraft.value = false;
    draftFiles.value = [];
  }

  async function checkDraft(): Promise<void> {
    if (!currentAccountId.value) { hasDraft.value = false; draftPreview.value = null; return; }
    const { data: row } = await supabase.from("proposal_drafts")
      .select("data, updated_at").eq("account_id", currentAccountId.value).maybeSingle();
    hasDraft.value = !!row;
    draftPreview.value = row ? { title: (row.data?.title || "Untitled draft"), updatedAt: row.updated_at } : null;
  }
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
      productive_claim: p.productiveClaim ?? null,
      inputs: p.inputs ?? null,
      expected_output: p.expectedOutput ?? null,
      demand_signal: p.demandSignal ?? null,
      risk_bearer: p.riskBearer ?? null,
      failure_handling: p.failureHandling ?? null,
      status: "active",
    })
    .select("id")
    .single();
  if (propErr) { console.error("proposal insert failed:", propErr); return; }

  const dbProposalId = propRows.id;
  p.id = dbProposalId;   // adopt the real DB id so later references (documents) resolve
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
  return dbProposalId;
}
 const submitProposal = async (): Promise<CommonsProposal | null> => {
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
      status: "active",
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
    await persistProposalToSupabase(newProposal);   // wait for DB row + adopt real id
    notifyPersonFollowers("person_posted", newProposal.id);
    resetDraft();
    return newProposal;
  };
  async function loadProposals() {
    const { data, error: loadErr } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
   const { data: acctData } = await supabase.from("accounts").select("account_id, avatar_url, display_name, bio");
    const avMap: Record<string, string> = {};
    const nameMap: Record<string, string> = {};
    const bioMap: Record<string, string> = {};
    for (const a of acctData ?? []) {
      if (a.avatar_url) avMap[a.account_id] = a.avatar_url;
      if (a.display_name) nameMap[a.account_id] = a.display_name;
      if (a.bio) bioMap[a.account_id] = a.bio;
    }
    avatarByAccount.value = avMap;
    displayNameByAccount.value = nameMap;
    bioByAccount.value = bioMap;
    avatarUrl.value = avMap[currentAccountId.value] || "";
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
      supabase.from("boosts").select("account_id, proposal_id, created_at"),
      supabase.from("follows").select("account_id, proposal_id"),
      supabase.from("saves").select("account_id, proposal_id"),
    ]);
    const { data: acctRow } = await supabase.from("accounts").select("joined_at").eq("account_id", acct).maybeSingle();
    accountJoinedAt.value = acctRow?.joined_at ?? null;
    boostRows.value = boostsRes.data ?? [];
    const { data: donData } = await supabase.from("donations").select("proposal_id, donor_account_id, amount, burned");
    const backersByProposal: Record<string, Set<string>> = {};
    const totalByProposal: Record<string, number> = {};
    const burnedByProposal: Record<string, number> = {};
    for (const d of donData ?? []) {
      (backersByProposal[d.proposal_id] ??= new Set()).add(d.donor_account_id);
      totalByProposal[d.proposal_id] = (totalByProposal[d.proposal_id] ?? 0) + parseFloat(d.amount || "0");
      burnedByProposal[d.proposal_id] = (burnedByProposal[d.proposal_id] ?? 0) + parseFloat(d.burned || "0");
    }
    backersByProposalRef.value = backersByProposal;
    const { data: flagData } = await supabase
      .from("flags")
      .select("*")
      .order("created_at", { ascending: true });
    const flagsByMilestone: Record<string, any[]> = {};
    for (const f of flagData ?? []) {
      if (f.milestone_id) (flagsByMilestone[f.milestone_id] ??= []).push(f);
    }
    const { data: pDocs } = await supabase.from("proposal_documents").select("*");
    const { data: mDocs } = await supabase.from("milestone_documents").select("*");
    const docsByProposal: Record<string, any[]> = {};
    const docsByMilestone: Record<string, any[]> = {};
    for (const d of pDocs ?? []) { (docsByProposal[d.proposal_id] ??= []).push(d); }
    for (const d of mDocs ?? []) { (docsByMilestone[d.milestone_id] ??= []).push(d); }
    const acctNow = currentAccountId.value;
    donatedProposals.value = (donData ?? [])
      .filter((d) => d.donor_account_id === acctNow)
      .map((d) => d.donor_account_id + "::" + d.proposal_id);
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
    // restore THIS account's lit state on load (not just on account switch)
    const meAcct = currentAccountId.value;
    likedProposals.value = (likesRes.data ?? []).filter((r) => r.account_id === meAcct).map((r) => r.proposal_id);
    boostedProposals.value = (boostsRes.data ?? []).filter((r) => r.account_id === meAcct).map((r) => r.proposal_id);
    followedProposals.value = (followsRes.data ?? []).filter((r) => r.account_id === meAcct).map((r) => r.proposal_id);
    savedProposals.value = (savesRes.data ?? []).filter((r) => r.account_id === meAcct).map((r) => r.proposal_id);
    proposals.value = data.map((row: any): CommonsProposal => ({
      id: row.id,
      proposerAccountId: row.proposer_account_id,
      title: row.title,
      description: row.summary ?? "",
      story: row.story ?? undefined,
      track: row.track ?? "donations",
      category: row.category ?? undefined,
      publicBenefit: row.public_benefit ?? undefined,
      productiveClaim: row.productive_claim ?? undefined,
      inputs: row.inputs ?? undefined,
      expectedOutput: row.expected_output ?? undefined,
      demandSignal: row.demand_signal ?? undefined,
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
        flags: (flagsByMilestone[m.id] ?? []).map((f: any) => ({
        id: f.id,
        proposalId: f.proposal_id,
        milestoneId: f.milestone_id,
        flaggerAccountId: f.flagger_account_id,
        reason: f.reason,
        status: f.status ?? "open",
        withdrawnAt: f.withdrawn_at ?? null,
        proposerResponse: f.proposer_response ?? null,
        respondedAt: f.responded_at ?? null,
        createdAt: f.created_at,
      })),
            documents: (docsByMilestone[m.id] ?? []).map((d: any) => ({ id: d.id, filename: d.filename, url: d.url, fileType: d.file_type, uploadedAt: d.uploaded_at })),
    })),
      status: row.status ?? "active",
      documents: (docsByProposal[row.id] ?? []).map((d: any) => ({ id: d.id, filename: d.filename, url: d.url, fileType: d.file_type, uploadedAt: d.uploaded_at })),
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
      xorBurned: (burnedByProposal[row.id] ?? 0).toFixed(4),
      createdAt: row.created_at,
      likes: likeCount[row.id] ?? 0,
      boostCount: boostCount[row.id] ?? 0,
      followers: followCount[row.id] ?? 0,
      backers: backersByProposal[row.id]?.size ?? 0,
      totalDonated: (totalByProposal[row.id] ?? 0).toFixed(4),
    }));
    const { data: ufData } = await supabase.from("user_follows").select("follower_account_id, followed_account_id");
    const flwerCount: Record<string, number> = {};
    const flwingCount: Record<string, number> = {};
    for (const r of ufData ?? []) {
      flwerCount[r.followed_account_id] = (flwerCount[r.followed_account_id] ?? 0) + 1;
      flwingCount[r.follower_account_id] = (flwingCount[r.follower_account_id] ?? 0) + 1;
    }
    followerCountByAccount.value = flwerCount;
    followingCountByAccount.value = flwingCount;
    followedAccounts.value = (ufData ?? []).filter((r) => r.follower_account_id === currentAccountId.value).map((r) => r.followed_account_id);
    await loadNotifications();
    initFeedSnapshot();
  }

  async function initMockWallet() {
    if (!COMMONS_CONFIG.DEMO_MODE) return;
    const { getAccountId } = await import("@/web/lib/mockWallet");
    mockWalletId.value = await getAccountId();
  }
  async function uploadAvatar(file: File | Blob): Promise<{ ok: boolean; error?: string }> {
    const acct = currentAccountId.value;
    if (!acct) return { ok: false, error: "No account" };
    const okTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(file.type)) return { ok: false, error: "Use a JPG, PNG, or WebP image." };
    if (file.size > 2 * 1024 * 1024) return { ok: false, error: "Image must be under 2 MB." };
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${acct}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { console.error("avatar upload failed:", upErr); return { ok: false, error: upErr.message }; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl + "?t=" + Date.now();
    await supabase.from("accounts").upsert({ account_id: acct, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
    const { error: dbErr } = await supabase.from("accounts").update({ avatar_url: url }).eq("account_id", acct);
    if (dbErr) { console.error("avatar url save failed:", dbErr); return { ok: false, error: dbErr.message }; }
    avatarUrl.value = url;
    avatarByAccount.value[acct] = url;
    return { ok: true };
  }

  function getAvatar(accountId: string): string {
    return avatarByAccount.value[accountId] || "";
  }
  async function searchAll(query: string) {
    const q = query.trim();
    if (!q) return { stories: [], people: [] };
    const { data: storyData, error: sErr } = await supabase.rpc("search_proposals", { q });
    if (sErr) console.error("story search failed:", sErr);
    const { data: peopleData, error: pErr } = await supabase
      .from("accounts")
      .select("account_id, display_name, avatar_url, bio")
      .or(`display_name.ilike.%${q}%,account_id.ilike.%${q}%`)
      .limit(20);
    if (pErr) console.error("people search failed:", pErr);
    return { stories: storyData ?? [], people: peopleData ?? [] };
  }
  async function uploadDocument(
    file: File,
    target: { proposalId?: string; milestoneId?: string }
  ): Promise<{ ok: boolean; error?: string }> {
    const okTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(file.type)) return { ok: false, error: "Use a PDF or image (JPG, PNG, WebP)." };
    if (file.size > 10 * 1024 * 1024) return { ok: false, error: "File must be under 10 MB." };
    const fileType = file.type === "application/pdf" ? "pdf" : "image";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${target.proposalId || target.milestoneId}/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file, { contentType: file.type });
    if (upErr) { console.error("doc upload failed:", upErr); return { ok: false, error: upErr.message }; }
    const { data: pub } = supabase.storage.from("documents").getPublicUrl(path);
    const table = target.milestoneId ? "milestone_documents" : "proposal_documents";
    const row: any = { filename: file.name, url: pub.publicUrl, file_type: fileType };
    if (target.milestoneId) { row.milestone_id = target.milestoneId; row.proposal_id = target.proposalId; }
    else { row.proposal_id = target.proposalId; }
    const { error: dbErr } = await supabase.from(table).insert(row);
    if (dbErr) { console.error("doc record failed:", dbErr); return { ok: false, error: dbErr.message }; }
    return { ok: true };
  }
  async function uploadDraftFile(file: File): Promise<{ name: string; url: string; path: string; type: string } | null> {
    const okTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(file.type)) { console.error("draft file: bad type"); return null; }
    if (file.size > 10 * 1024 * 1024) { console.error("draft file: too large"); return null; }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `drafts/${currentAccountId.value}/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file, { contentType: file.type });
    if (upErr) { console.error("draft file upload failed:", upErr); return null; }
    const { data: pub } = supabase.storage.from("documents").getPublicUrl(path);
    return { name: file.name, url: pub.publicUrl, path, type: file.type };
  }
  async function linkDraftFileToProposal(
    ref: { name: string; url: string; type: string },
    proposalId: string
  ): Promise<{ ok: boolean; error?: string }> {
    const fileType = ref.type === "application/pdf" ? "pdf" : "image";
    const { error } = await supabase.from("proposal_documents")
      .insert({ proposal_id: proposalId, filename: ref.name, url: ref.url, file_type: fileType });
    if (error) { console.error("link draft doc failed:", error); return { ok: false, error: error.message }; }
    return { ok: true };
  }
  async function deleteDraftFiles(paths: string[]): Promise<void> {
    if (!paths?.length) return;
    const { error } = await supabase.storage.from("documents").remove(paths);
    if (error) console.error("delete draft files failed:", error);
  }
  async function updateProfile(name: string, bio: string): Promise<{ ok: boolean; error?: string }> {
    const acct = currentAccountId.value;
    if (!acct) return { ok: false, error: "No account" };
    await supabase.from("accounts").upsert({ account_id: acct, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
    const { error } = await supabase.from("accounts").update({ display_name: name.trim() || null, bio: bio.trim() || null }).eq("account_id", acct);
    if (error) { console.error("profile save failed:", error); return { ok: false, error: error.message }; }
    displayNameByAccount.value[acct] = name.trim();
    bioByAccount.value[acct] = bio.trim();
    return { ok: true };
  }
  function getDisplayName(accountId: string): string { return displayNameByAccount.value[accountId] || ""; }
  function getBio(accountId: string): string { return bioByAccount.value[accountId] || ""; }

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
    if (accountId !== proposal.proposerAccountId) {
      createNotification({ recipient: proposal.proposerAccountId, type: "comment", proposalId });
    } else {
      const priorCommenters = new Set(
        proposal.discussionPosts
          .map((c) => c.authorAccountId)
          .filter((a) => a && a !== proposal.proposerAccountId),
      );
      for (const commenter of priorCommenters) {
        createNotification({ recipient: commenter, type: "reply", proposalId });
      }
    }
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


  // Proposer marks their own chapter delivered + submits actual evidence.
  // This is a CLAIM on the public record — NOT a trustless verification.
  const markChapterDelivered = async (proposalId: string, milestoneId: string, evidence: string): Promise<boolean> => {
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal) return false;
    if (proposal.proposerAccountId !== currentAccountId.value) return false;
    const milestone = proposal.milestones.find((m) => m.id === milestoneId);
    if (!milestone || milestone.completed) return false;
    if (!evidence.trim()) return false;
    const now = new Date().toISOString();
    milestone.deliveredEvidence = evidence.trim();
    milestone.deliveredAt = now;
    milestone.completed = true;
    milestone.completedAt = now;
    notifyFollowersOfEvent(proposalId, "follow_delivered", "person_delivered");
    let statusComplete = false;
    if (proposal.milestones.every((m) => m.completed)) {
      proposal.status = "complete";
      statusComplete = true;
      notifyFollowersOfEvent(proposalId, "follow_completed", "person_completed");
    }
    // persist delivery (and completion) — awaited so callers can reload after commit
    await (async () => {
      const { error } = await supabase.from("milestones").update({
        delivered_evidence: evidence.trim(),
        delivered_at: now,
        completed: true,
        completed_at: now,
      }).eq("id", milestoneId);
      if (error) console.error("delivery persist failed:", error);
      if (statusComplete) {
        const { error: sErr } = await supabase.from("proposals").update({ status: "complete" }).eq("id", proposal.id);
        if (sErr) console.error("status persist failed:", sErr);
      }
    })();
    return true;
  };
  // ── Challenge Window — flags (no verdicts; permanent record) ──────────────

  // Raise a flag on a delivered milestone. Only backers/donors of the proposal.
  const raiseFlag = (proposalId: string, milestoneId: string, reason: string): boolean => {
    const acct = currentAccountId.value;
    if (!acct || !reason.trim()) return false;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal) return false;
    const milestone = proposal.milestones.find((m) => m.id === milestoneId);
    if (!milestone || !milestone.deliveredAt) return false; // can only flag a delivered chapter
    // must be a backer/donor of this proposal
    const isBacker = donatedProposals.value.includes(acct + "::" + proposalId);
    if (!isBacker && proposal.proposerAccountId !== acct) {
      // proposer can't flag their own; and non-donors can't flag
    }
    if (!isBacker) return false;
    // one open flag per person per milestone
    if ((milestone.flags ?? []).some((f) => f.flaggerAccountId === acct && f.status === "open")) return false;

    const now = new Date().toISOString();
    const newFlag: Flag = {
      id: generateId(), proposalId, milestoneId,
      flaggerAccountId: acct, reason: reason.trim(),
      status: "open", withdrawnAt: null,
      proposerResponse: null, respondedAt: null, createdAt: now,
    };
    (milestone.flags ??= []).push(newFlag);
     createNotification({ recipient: proposal.proposerAccountId, type: "flag", proposalId, milestoneId });
     notifyProposalFollowers(proposalId, "follow_flagged", milestoneId);
    (async () => {
      await supabase.from("accounts").upsert({ account_id: acct, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
      const { data, error } = await supabase.from("flags").insert({
        proposal_id: proposalId, milestone_id: milestoneId,
        flagger_account_id: acct, reason: reason.trim(), status: "open",
      }).select("id").single();
      if (error) { console.error("flag insert failed:", error); return; }
      if (data) newFlag.id = data.id; // adopt DB id
    })();
    return true;
  };

  // Withdraw a flag — only the flagger. Not deletion: marks withdrawn, stays visible.
  const withdrawFlag = (proposalId: string, milestoneId: string, flagId: string): boolean => {
    const acct = currentAccountId.value;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    const milestone = proposal?.milestones.find((m) => m.id === milestoneId);
    const flag = milestone?.flags?.find((f) => f.id === flagId);
    if (!flag || flag.flaggerAccountId !== acct || flag.status !== "open") return false;
    const now = new Date().toISOString();
    flag.status = "withdrawn"; flag.withdrawnAt = now;
    (async () => {
      const { error } = await supabase.from("flags")
        .update({ status: "withdrawn", withdrawn_at: now })
        .eq("milestone_id", milestoneId)
        .eq("flagger_account_id", flag.flaggerAccountId)
        .eq("status", "open");
      if (error) console.error("withdraw persist failed:", error);
    })();
    return true;
  };

  // Proposer responds to a flag — response stays in the thread, resolves nothing.
  const respondToFlag = (proposalId: string, milestoneId: string, flagId: string, response: string): boolean => {
    const acct = currentAccountId.value;
    const proposal = proposals.value.find((p) => p.id === proposalId);
    if (!proposal || proposal.proposerAccountId !== acct || !response.trim()) return false;
    const milestone = proposal.milestones.find((m) => m.id === milestoneId);
    const flag = milestone?.flags?.find((f) => f.id === flagId);
    if (!flag) return false;
    const now = new Date().toISOString();
    flag.proposerResponse = response.trim(); flag.respondedAt = now;
    (async () => {
      const { data, error } = await supabase.from("flags")
        .update({ proposer_response: response.trim(), responded_at: now })
        .eq("milestone_id", milestoneId)
        .eq("flagger_account_id", flag.flaggerAccountId)
        .eq("status", "open")
        .select();
    })();
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
  const followedAccounts = ref<string[]>([]);
  const followerCountByAccount = ref<Record<string, number>>({});
  const followingCountByAccount = ref<Record<string, number>>({});
  const donatedProposals = ref<string[]>([]); // proposal ids the current account has donated to (for unique-backer counting)
  const notifications = ref<any[]>([]);
  const backersByProposalRef = ref<Record<string, Set<string>>>({});
  const uniqueBackerCount = computed(() => {
    const all = new Set<string>();
    for (const set of Object.values(backersByProposalRef.value)) {
      for (const acct of set) all.add(acct);
    }
    return all.size;
  });
  const feedShownIds = ref<Set<string>>(new Set());
  const feedScrollY = ref(0);
  const feedShownCount = ref(10);
  const exploreScrollY = ref(0);
  const feedInitialized = ref(false);
  function initFeedSnapshot() {
    if (!feedInitialized.value && proposals.value.length > 0) {
      feedShownIds.value = new Set(proposals.value.map((p) => p.id));
      feedInitialized.value = true;
    }
  }
  function revealFeedPending() {
    const next = new Set(feedShownIds.value);
    for (const p of proposals.value) next.add(p.id);
    feedShownIds.value = next;
  }
  function mapProposalRow(row: any): CommonsProposal {
    return {
      id: row.id,
      proposerAccountId: row.proposer_account_id,
      title: row.title,
      description: row.summary ?? "",
      story: row.story ?? undefined,
      track: row.track ?? "donations",
      category: row.category ?? undefined,
      publicBenefit: row.public_benefit ?? undefined,
      productiveClaim: row.productive_claim ?? undefined,
      inputs: row.inputs ?? undefined,
      expectedOutput: row.expected_output ?? undefined,
      demandSignal: row.demand_signal ?? undefined,
      riskBearer: row.risk_bearer ?? undefined,
      failureHandling: row.failure_handling ?? undefined,
      xorRequested: row.xor_requested ?? "0",
      fundingMode: row.funding_mode ?? "open",
      milestones: [],
      status: row.status ?? "active",
      documents: [],
      signals: [],
      signalEndsAt: null,
      discussionPosts: [],
      amendments: [],
      deliberationEndsAt: null,
      sortitionExcluded: [row.proposer_account_id],
      parliamentBrief: null,
      parliamentRemarks: null,
      panelMembers: [],
      panelVotes: [],
      sortitionEndsAt: null,
      revisionCount: 0,
      xorBurned: "0.0000",
      createdAt: row.created_at,
      likes: 0,
      boostCount: 0,
      followers: 0,
      backers: 0,
      totalDonated: "0.0000",
    };
  }

  let proposalChannel: any = null;
  function subscribeToProposals() {
    if (proposalChannel) return;
    proposalChannel = supabase
      .channel("public:proposals")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "proposals" }, (payload: any) => {
        const row = payload.new;
        if (!row || proposals.value.some((p) => p.id === row.id)) return;   // dedup own optimistic insert
        proposals.value.unshift(mapProposalRow(row));   // → pending computed catches it → pill shows
      })
      .subscribe();
  }
  function unsubscribeProposals() {
    if (proposalChannel) { supabase.removeChannel(proposalChannel); proposalChannel = null; }
  }
  let notifChannel: any = null;
  function subscribeToNotifications() {
    if (notifChannel) { supabase.removeChannel(notifChannel); notifChannel = null; }
    const acct = currentAccountId.value;
    if (!acct) return;
    notifChannel = supabase
      .channel("public:notifications")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_account_id=eq.${acct}` },
        (payload: any) => {
          const row = payload.new;
          if (!row || notifications.value.some((n) => n.id === row.id)) return;
          notifications.value = [row, ...notifications.value];
        })
      .subscribe();
  }
  function unsubscribeNotifications() {
    if (notifChannel) { supabase.removeChannel(notifChannel); notifChannel = null; }
  }
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length);
  let socialChannel: any = null;
  function subscribeToSocial() {
    if (socialChannel) return;
    const bump = (table: string, row: any, delta: number) => {
      if (!row) return;
      if (row.account_id === currentAccountId.value) return;   // skip own actions (handled optimistically)
      const p = proposals.value.find((x) => x.id === row.proposal_id);
      if (!p) return;
      if (table === "likes") p.likes = Math.max(0, p.likes + delta);
      else if (table === "boosts") p.boostCount = Math.max(0, p.boostCount + delta);
      else if (table === "follows") p.followers = Math.max(0, p.followers + delta);
    };
    socialChannel = supabase
      .channel("public:social")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "likes" }, (pl: any) => bump("likes", pl.new, +1))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "likes" }, (pl: any) => bump("likes", pl.old, -1))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "boosts" }, (pl: any) => bump("boosts", pl.new, +1))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "boosts" }, (pl: any) => bump("boosts", pl.old, -1))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "follows" }, (pl: any) => bump("follows", pl.new, +1))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "follows" }, (pl: any) => bump("follows", pl.old, -1))
      .subscribe();
  }
  function unsubscribeSocial() {
    if (socialChannel) { supabase.removeChannel(socialChannel); socialChannel = null; }
  }
  let userFollowChannel: any = null;
  function subscribeToUserFollows() {
    if (userFollowChannel) return;
    const apply = (row: any, delta: number) => {
      if (!row) return;
      const follower = row.follower_account_id;
      const followed = row.followed_account_id;
      if (follower === currentAccountId.value) return;   // our own action — handled optimistically
      followerCountByAccount.value = { ...followerCountByAccount.value, [followed]: Math.max(0, (followerCountByAccount.value[followed] ?? 0) + delta) };
      followingCountByAccount.value = { ...followingCountByAccount.value, [follower]: Math.max(0, (followingCountByAccount.value[follower] ?? 0) + delta) };
    };
    userFollowChannel = supabase
      .channel("public:user_follows")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_follows" }, (pl: any) => apply(pl.new, +1))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "user_follows" }, (pl: any) => apply(pl.old, -1))
      .subscribe();
  }
  function unsubscribeUserFollows() {
    if (userFollowChannel) { supabase.removeChannel(userFollowChannel); userFollowChannel = null; }
  }
  let donationChannel: any = null;
  function subscribeToDonations() {
    if (donationChannel) return;
    donationChannel = supabase
      .channel("public:donations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "donations" }, (pl: any) => {
        const row = pl.new;
        if (!row || row.donor_account_id === currentAccountId.value) return;   // skip own (optimistic)
        const p = proposals.value.find((x) => x.id === row.proposal_id);
        if (!p) return;
        p.totalDonated = (parseFloat(p.totalDonated || "0") + parseFloat(row.amount || "0")).toFixed(4);
        p.xorBurned = (parseFloat(p.xorBurned || "0") + parseFloat(row.burned || "0")).toFixed(4);
        const set = (backersByProposalRef.value[row.proposal_id] ??= new Set());
        if (!set.has(row.donor_account_id)) {
          set.add(row.donor_account_id);
          p.backers = (p.backers || 0) + 1;
        }
      })
      .subscribe();
  }
  function unsubscribeDonations() {
    if (donationChannel) { supabase.removeChannel(donationChannel); donationChannel = null; }
  }
  async function loadNotifications() {
    const acct = currentAccountId.value;
    if (!acct) { notifications.value = []; return; }
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_account_id", acct)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) { console.error("load notifications failed:", error); return; }
    notifications.value = data ?? [];
  }

  async function markNotificationsRead() {
    const acct = currentAccountId.value;
    if (!acct) return;
    notifications.value = notifications.value.map((n) => ({ ...n, read: true }));
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_account_id", acct)
      .eq("read", false);
    if (error) console.error("mark read failed:", error);
  }
  const isFollowingUser = (accountId: string): boolean => followedAccounts.value.includes(accountId);
  const getFollowerCount = (accountId: string): number => followerCountByAccount.value[accountId] ?? 0;
  const getFollowingCount = (accountId: string): number => followingCountByAccount.value[accountId] ?? 0;
  const toggleFollowUser = (accountId: string): void => {
    const me = currentAccountId.value;
    if (!me || me === accountId) return;
    const i = followedAccounts.value.indexOf(accountId);
    if (i >= 0) {
      followedAccounts.value.splice(i, 1);
      followerCountByAccount.value = { ...followerCountByAccount.value, [accountId]: Math.max(0, (followerCountByAccount.value[accountId] ?? 1) - 1) };
      followingCountByAccount.value = { ...followingCountByAccount.value, [me]: Math.max(0, (followingCountByAccount.value[me] ?? 1) - 1) };
      supabase.from("user_follows").delete().match({ follower_account_id: me, followed_account_id: accountId }).then();
    } else {
      followedAccounts.value.push(accountId);
      followerCountByAccount.value = { ...followerCountByAccount.value, [accountId]: (followerCountByAccount.value[accountId] ?? 0) + 1 };
      followingCountByAccount.value = { ...followingCountByAccount.value, [me]: (followingCountByAccount.value[me] ?? 0) + 1 };
      (async () => {
        await supabase.from("accounts").upsert({ account_id: me, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
        await supabase.from("user_follows").insert({ follower_account_id: me, followed_account_id: accountId });
      })();
    }
  };
  const isLiked = (id: string): boolean => likedProposals.value.includes(id);
  const isBoosted = (id: string): boolean => boostedProposals.value.includes(id);
  const isFollowing = (id: string): boolean => followedProposals.value.includes(id);
  const accountJoinedAt = ref<string | null>(null);
  const boostRows = ref<any[]>([]);
  const boostBlockedTick = ref(0); // increments each time a boost is blocked at 0 allotment
async function createNotification(opts: {
    recipient: string;
    type: "like" | "boost" | "donate" | "flag" | "comment" | "reply" | "follow_delivered" | "follow_flagged" | "follow_completed" | "person_posted" | "person_delivered" | "person_completed";
    proposalId: string;
    milestoneId?: string;
    meta?: string;
  }) {
    const actor = currentAccountId.value;
    if (!opts.recipient || opts.recipient === actor) return;   // self-guard
    const { error } = await supabase.from("notifications").insert({
      recipient_account_id: opts.recipient,
      actor_account_id: actor,
      type: opts.type,
      proposal_id: opts.proposalId,
      milestone_id: opts.milestoneId ?? null,
      meta: opts.meta ?? null,
    });
    if (error) console.error("notification insert failed:", error);
  }
  async function notifyProposalFollowers(proposalId: string, type: "follow_delivered" | "follow_flagged" | "follow_completed", meta?: string) {
    const actor = currentAccountId.value;
    const { data } = await supabase.from("follows").select("account_id").eq("proposal_id", proposalId);
    for (const r of data ?? []) {
      if (r.account_id === actor) continue;
      await createNotification({ recipient: r.account_id, type, proposalId, meta });
    }
  }
  async function notifyPersonFollowers(type: "person_posted" | "person_delivered" | "person_completed", proposalId: string, meta?: string) {
    const actor = currentAccountId.value;
    if (!actor) return;
    const { data } = await supabase.from("user_follows").select("follower_account_id").eq("followed_account_id", actor);
    for (const r of data ?? []) {
      if (r.follower_account_id === actor) continue;
      await createNotification({ recipient: r.follower_account_id, type, proposalId, meta });
    }
  }
  async function notifyFollowersOfEvent(proposalId: string, proposalType: "follow_delivered" | "follow_completed", personType: "person_delivered" | "person_completed", meta?: string) {
    const actor = currentAccountId.value;
    if (!actor) return;
    const { data: pf } = await supabase.from("follows").select("account_id").eq("proposal_id", proposalId);
    const { data: uf } = await supabase.from("user_follows").select("follower_account_id").eq("followed_account_id", actor);
    const sent = new Set<string>();
    for (const r of pf ?? []) {
      if (r.account_id === actor || sent.has(r.account_id)) continue;
      sent.add(r.account_id);
      await createNotification({ recipient: r.account_id, type: proposalType, proposalId, meta });
    }
    for (const r of uf ?? []) {
      if (r.follower_account_id === actor || sent.has(r.follower_account_id)) continue;
      sent.add(r.follower_account_id);
      await createNotification({ recipient: r.follower_account_id, type: personType, proposalId, meta });
    }
  }
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
      createNotification({ recipient: p.proposerAccountId, type: "like", proposalId: id });
      (async () => {
        await supabase.from("accounts").upsert({ account_id: acct, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
        await supabase.from("likes").insert({ account_id: acct, proposal_id: id });
      })();
    }
  };
 const toggleBoost = (id: string): void => {
    const p = proposals.value.find((x) => x.id === id);
    if (!p) return;
    // One boost per proposal. Weekly allotment enforced via boostsRemaining.
    const acct = currentAccountId.value;
    const i = boostedProposals.value.indexOf(id);
    if (i >= 0) {
      // un-boost — always allowed, refunds the allotment
      boostedProposals.value.splice(i, 1); p.boostCount = Math.max(0, p.boostCount - 1);
      boostRows.value = boostRows.value.filter((r) => !(r.account_id === acct && r.proposal_id === id));
      supabase.from("boosts").delete().match({ account_id: acct, proposal_id: id }).then();
    } else {
      // new boost — blocked if no allotment left this week
      if (boostsRemaining.value <= 0) { boostBlockedTick.value++; return; }
      boostedProposals.value.push(id); p.boostCount += 1;
      createNotification({ recipient: p.proposerAccountId, type: "boost", proposalId: id });
      boostRows.value.push({ account_id: acct, proposal_id: id, created_at: new Date().toISOString() });
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

  const boostsRemaining = computed((): number => {
    const acct = currentAccountId.value;
    const joined = accountJoinedAt.value;
    if (!joined) return COMMONS_CONFIG.BOOSTS_PER_WEEK; // no join anchor yet → full allotment
    const weekMs = COMMONS_CONFIG.BOOST_WEEK_DAYS * 24 * 60 * 60 * 1000;
    const joinedMs = new Date(joined).getTime();
    const weeksElapsed = Math.floor((Date.now() - joinedMs) / weekMs);
    const bucketStart = joinedMs + weeksElapsed * weekMs;
    const usedThisWeek = boostRows.value.filter(
      (r) => r.account_id === acct && new Date(r.created_at).getTime() >= bucketStart,
    ).length;
    return Math.max(0, COMMONS_CONFIG.BOOSTS_PER_WEEK - usedThisWeek);
  });

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
    const acct = currentAccountId.value;
    const key = acct + "::" + proposalId;
    if (!donatedProposals.value.includes(key)) {
      donatedProposals.value.push(key);
      p.backers = (p.backers || 0) + 1;
    }
    // record to Supabase (display record only — money rides on-chain later)
    (async () => {
      await supabase.from("accounts").upsert({ account_id: acct, public_key: "", network: "taira" }, { onConflict: "account_id", ignoreDuplicates: true });
      const { error: dErr } = await supabase.from("donations").insert({
        proposal_id: proposalId,
        donor_account_id: acct,
        amount: toProposer.toFixed(4),
        burned: burn.toFixed(4),
      });
      if (dErr) console.error("donation insert failed:", dErr);
    })();
        createNotification({ recipient: p.proposerAccountId, type: "donate", proposalId, meta: amount.toFixed(4) });

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
  // Derived challenge-window state for a delivered milestone (no stored status).
  const milestoneChallengeState = (m: Milestone): "in-progress" | "in-window" | "flagged" | "confirmed" => {
    if (!m.deliveredAt) return "in-progress";
    const openFlags = (m.flags ?? []).filter((f) => f.status === "open");
    if (openFlags.length > 0) return "flagged";
    const windowEnds = new Date(m.deliveredAt).getTime() + COMMONS_CONFIG.CHALLENGE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() < windowEnds) return "in-window";
    return "confirmed";
  };
  // Proposal-level challenge state, derived from its milestones.
  const proposalChallengeState = (p: CommonsProposal): "flagged" | "in-window" | null => {
    let inWindow = false;
    for (const m of p.milestones ?? []) {
      const s = milestoneChallengeState(m);
      if (s === "flagged") return "flagged";
      if (s === "in-window") inWindow = true;
    }
    return inWindow ? "in-window" : null;
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
    activeProposal, proposalsByStatus, liveProposals, subscribeToUserFollows, unsubscribeUserFollows,
    completedProposals, totalXorBurned,

    // Draft validation
    isDraftValid, milestoneTotal, milestoneDelta,

    // Actions
    setActiveProposal, addMilestone, removeMilestone,
    resetDraft, submitProposal, loadProposals,
    postDiscussion, markChapterDelivered, milestoneChallengeState, proposalChallengeState, raiseFlag, withdrawFlag, respondToFlag, uploadAvatar, uploadDocument, getAvatar, avatarUrl, avatarByAccount,
    updateProfile, getDisplayName, getBio, displayNameByAccount, bioByAccount, formatDate, feedShownCount, hasDraft, saveDraft, loadDraft, deleteDraft, checkDraft, draftPreview, resumingDraft, uploadDraftFile, linkDraftFileToProposal, deleteDraftFiles, draftFiles,

    // Helpers
    roleLabel, roleHint,
    savedProposals, isSaved, toggleSave, proposerLabel, viewingProfileId, setViewingProfile, isLiked, isBoosted, isFollowing, toggleLike, toggleBoost, toggleFollow, followedProposals, followedAccounts, isFollowingUser, getFollowerCount, getFollowingCount, toggleFollowUser,
    donate, donatedProposals, DEMO_ACCOUNTS, demoAccountId, setDemoAccount, boostsRemaining, boostBlockedTick, mockWalletId, initMockWallet,
    notifications, unreadCount, loadNotifications, markNotificationsRead,
    uniqueBackerCount, feedShownIds, feedScrollY, exploreScrollY, feedInitialized, initFeedSnapshot, revealFeedPending, subscribeToProposals, unsubscribeProposals, subscribeToNotifications, unsubscribeNotifications, subscribeToSocial, unsubscribeSocial, createNotification, boostRows,
    subscribeToDonations, unsubscribeDonations, searchAll,

    // Reputation
    reputation, effectiveReputation, reputationRecord, creditReputation, myReputation,
  };
});
  