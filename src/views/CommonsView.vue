<template>
  <div class="commons-view">
    <div v-if="config.DEMO_MODE" class="demo-banner">
      ⚠️ DEMO MODE — Taira Testnet · Role restrictions relaxed so you can experience the full 5-stage flow · On Minamoto mainnet all citizen and bonded XOR requirements apply · Early participants will be recognized in Phase 2 $COMMONS distribution
    </div>
    <div class="commons-header">
      <div class="commons-header__title">
        <h1>SORA Commons</h1>
        <p>Propose productive work. Signal support. Fund what matters.</p>
      </div>
      <div class="commons-header__stats">
        <div class="stat">
          <span class="stat__value">{{ commons.totalXorBurned }}</span>
          <span class="stat__label">XOR Burned</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ commons.citizenCount }}</span>
          <span class="stat__label">Citizens</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ commons.liveProposals.length }}</span>
          <span class="stat__label">Live Proposals</span>
        </div>
      </div>
    </div>
    <div class="role-banner" :class="`role-banner--${commons.commonsRole}`">
      <span class="role-banner__role">{{ commons.roleLabel(commons.commonsRole) }}</span>
      <span class="role-banner__hint">{{ commons.roleHint(commons.commonsRole) }}</span>
    <span class="role-banner__hint">{{ commons.roleHint(commons.commonsRole) }}</span>
      <span
        v-if="myRep.panelEvents > 0 || myRep.proposerEvents > 0"
        class="role-banner__rep"
        title="Standing reflects recent, on-time service and gently decays when idle — it never goes negative."
      >
        <span v-if="myRep.panelEvents > 0" class="rep-chip">
          Panel service · {{ myRep.panelEvents }} · standing {{ myRep.panel.toFixed(1) }}
        </span>
        <span v-if="myRep.proposerEvents > 0" class="rep-chip">
          Delivered · {{ myRep.proposerEvents }} · standing {{ myRep.proposer.toFixed(1) }}
        </span>
      </span>
    </div>
    </div>
    <div class="commons-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="commons-tab"
        :class="{ 'commons-tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.count" class="commons-tab__count">{{ tab.count }}</span>
      </button>
    </div>
    <div v-if="activeTab === 'live'" class="proposal-list">
      <div v-if="commons.liveProposals.length === 0" class="empty-state">
        <p>No live proposals yet.</p>
        <button class="btn btn--primary" @click="activeTab = 'submit'">Submit the first proposal</button>
      </div>
      <div
        v-for="proposal in commons.liveProposals"
        :key="proposal.id"
        class="proposal-card"
        @click="commons.setActiveProposal(proposal.id); activeTab = 'detail'"
      >
        <div class="proposal-card__header">
          <span class="proposal-card__stage">Stage {{ commons.stageNumber(proposal.status) }} — {{ commons.statusLabel(proposal.status) }}</span>
          <span class="proposal-card__xor">{{ proposal.xorRequested }} XOR</span>
        </div>
        <h3 class="proposal-card__title">{{ proposal.title }}</h3>
        <p class="proposal-card__description">{{ proposal.description.slice(0, 120) }}...</p>
        <div class="proposal-card__footer">
          <span v-if="proposal.status === 'signal'">{{ commons.getSignalStats(proposal).aye }} Aye · {{ commons.getSignalStats(proposal).nay }} Nay · {{ commons.getSignalStats(proposal).ayePercent }}%</span>
          <span>{{ proposal.milestones.length }} milestones</span>
          <span v-if="commons.hasSignaled(proposal)" class="voted-badge">✓ {{ commons.hasSignaled(proposal) === 'aye' ? 'Aye' : 'Nay' }}</span>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'detail' && commons.activeProposal" class="proposal-detail">
      <button class="btn btn--ghost" @click="activeTab = 'live'">← Back</button>
      <div class="proposal-detail__header">
        <h2>{{ commons.activeProposal.title }}</h2>
        <span class="stage-badge">Stage {{ commons.stageNumber(commons.activeProposal.status) }} — {{ commons.statusLabel(commons.activeProposal.status) }}</span>
      </div>
      <p class="proposal-detail__description">{{ commons.activeProposal.description }}</p>
      <div class="proposal-detail__meta">
        <div class="meta-item"><span class="meta-item__label">XOR Requested</span><span class="meta-item__value">{{ commons.activeProposal.xorRequested }} XOR</span></div>
       <div class="meta-item"><span class="meta-item__label">XOR Burned</span><span class="meta-item__value">{{ commons.activeProposal.xorBurned }} XOR</span></div>
        <div class="meta-item"><span class="meta-item__label">Proposer</span><span class="meta-item__value mono">{{ commons.activeProposal.proposerAccountId.slice(0, 20) }}...</span></div>
        <div class="meta-item"><span class="meta-item__label">Submitted</span><span class="meta-item__value">{{ commons.formatDate(commons.activeProposal.createdAt) }}</span></div>
      </div>

      <!-- Stage 2 Signal -->
      <div v-if="commons.activeProposal.status === 'signal'" class="stage-panel">
        <h3>Community Signal <span class="days-remaining">{{ commons.daysRemaining(commons.activeProposal.signalEndsAt) }} days remaining</span></h3>
        <p class="stage-note">This is a soft signal — not a binding vote. The binding decision happens in Stage 4 Sortition.</p>
        <div class="signal-stats">
<div class="signal-bar-wrap">
  <div class="signal-bar">
    <div class="signal-bar__aye" :style="`width: ${commons.getSignalStats(commons.activeProposal).total > 0 ? commons.getSignalStats(commons.activeProposal).ayePercent : 0}%`"></div>
    <div class="signal-bar__nay" :style="`width: ${commons.getSignalStats(commons.activeProposal).total > 0 ? (100 - commons.getSignalStats(commons.activeProposal).ayePercent) : 0}%`"></div>
    <div class="signal-bar__threshold" :style="`left: ${config.MINIMUM_AYE_PERCENT}%`"></div>
  </div>
  <div class="signal-bar__threshold-marker" :style="`left: ${config.MINIMUM_AYE_PERCENT}%`"></div>
<div class="signal-bar__threshold-text" :style="`left: ${config.MINIMUM_AYE_PERCENT}%`">
  {{ config.MINIMUM_AYE_PERCENT }}% needed to pass
</div>
</div>
<div class="signal-numbers">
            <span class="aye">{{ commons.getSignalStats(commons.activeProposal).aye }} Aye</span>
            <span class="percent">{{ commons.getSignalStats(commons.activeProposal).ayePercent }}%</span>
            <span class="nay">{{ commons.getSignalStats(commons.activeProposal).nay }} Nay</span>
          </div>
          <div class="signal-thresholds">
            <span :class="{ met: commons.getSignalStats(commons.activeProposal).meetsQuorum }">{{ commons.getSignalStats(commons.activeProposal).meetsQuorum ? "✓" : "○" }} Minimum {{ config.MINIMUM_AYE_SIGNALS }} Aye</span>
            <span :class="{ met: commons.getSignalStats(commons.activeProposal).meetsPercent }">{{ commons.getSignalStats(commons.activeProposal).meetsPercent ? "✓" : "○" }} 60% threshold</span>
          </div>
        </div>
        <div v-if="commons.canSignal(commons.activeProposal)" class="signal-actions">
          <button class="btn btn--aye" @click="commons.castSignal(commons.activeProposal.id, 'aye')">Aye</button>
          <button class="btn btn--nay" @click="commons.castSignal(commons.activeProposal.id, 'nay')">Nay</button>
        </div>
        <div v-else-if="commons.hasSignaled(commons.activeProposal)" class="already-signaled">You signaled {{ commons.hasSignaled(commons.activeProposal) === "aye" ? "Aye ✓" : "Nay ✗" }}</div>
        <div v-else class="signal-gate">{{ commons.activeProposal.proposerAccountId === commons.currentAccountId ? "You cannot signal on your own proposal." : "You need at least 1 XOR to signal." }}</div>
      </div>

      <!-- Stage 3 Deliberation -->
      <div v-if="commons.activeProposal.status === 'deliberation'" class="stage-panel">
        <h3>Parliament Deliberation <span class="days-remaining">{{ commons.daysRemaining(commons.activeProposal.deliberationEndsAt) }} days remaining</span></h3>
        <p class="stage-note">Open discussion. Citizens who post here are excluded from Stage 4 sortition.</p>
        <div v-if="commons.activeProposal.parliamentBrief" class="parliament-brief">
          <h4>Parliament Brief</h4>
          <p>{{ commons.activeProposal.parliamentBrief }}</p>
        </div>
        <div class="discussion">
          <h4>Discussion ({{ commons.activeProposal.discussionPosts.length }} posts)</h4>
          <div v-for="post in commons.activeProposal.discussionPosts" :key="post.id" class="discussion-post" :class="{ 'discussion-post--amendment': post.isAmendment }">
            <div class="discussion-post__header">
              <span class="discussion-post__author">{{ post.authorAccountId.slice(0, 16) }}... {{ post.authorAccountId === commons.activeProposal.proposerAccountId ? "(Proposer)" : "" }}</span>
              <span class="discussion-post__date">{{ commons.formatDate(post.createdAt) }}</span>
            </div>
            <p>{{ post.content }}</p>
          </div>
          <div v-if="commons.isConnected" class="post-form">
            <textarea v-model="discussionContent" rows="3" placeholder="Ask a question or raise a concern..." />
            <button class="btn btn--primary" :disabled="!discussionContent.trim()" @click="commons.postDiscussion(commons.activeProposal.id, discussionContent); discussionContent = ''">Post</button>
          </div>
        </div>
       <div v-if="commons.isOperator" class="operator-actions">
  <div v-if="!commons.activeProposal.parliamentBrief" class="form-group">
    <label>Parliament Brief</label>
    <textarea v-model="briefContent" rows="4" placeholder="Summarise deliberation — pros, cons, risks, recommended questions for panel..." />
    <button class="btn btn--primary" :disabled="!briefContent.trim()" @click="commons.submitParliamentBrief(commons.activeProposal.id, briefContent); briefContent = ''">Submit Brief</button>
  </div>
  <div v-else-if="!commons.activeProposal.parliamentRemarks" class="form-group">
    <label>Parliament Final Remarks</label>
    <p class="stage-note">Brief submitted. Add final remarks for the sortition panel before advancing.</p>
    <textarea v-model="remarksContent" rows="4" placeholder="Final guidance to the sortition panel..." />
    <button class="btn btn--primary" :disabled="!remarksContent.trim()" @click="commons.submitParliamentRemarks(commons.activeProposal.id, remarksContent); remarksContent = ''">Submit Final Remarks</button>
  </div>
  <div v-else>
    <button class="btn btn--primary" @click="commons.advanceToSortition(commons.activeProposal.id)">Advance to Sortition</button>
  </div>
</div>
      </div>

      <!-- Stage 4 Sortition -->
      <div v-if="commons.activeProposal.status === 'sortition'" class="stage-panel">
        <h3>Sortition — Binding Decision <span class="days-remaining">{{ commons.daysRemaining(commons.activeProposal.sortitionEndsAt) }} days remaining</span></h3>
        <p class="stage-note">{{ config.SORTITION_PANEL_SIZE }} citizens drawn by lot make the binding funding decision. {{ config.SORTITION_APPROVAL_THRESHOLD }} of {{ config.SORTITION_PANEL_SIZE }} needed to approve.</p>
        <p v-if="config.DEMO_MODE" class="stage-note demo-note">Demo note: This proposal needs {{ config.SORTITION_APPROVAL_THRESHOLD }} separate panel members to approve. With one wallet you can cast one vote — invite others to test the full sortition, or the proposal will wait at this stage until {{ config.SORTITION_APPROVAL_THRESHOLD }} approvals are reached.</p>
        <div v-if="commons.activeProposal.parliamentRemarks" class="parliament-remarks">
  <h4>Parliament Final Remarks</h4>
  <p>{{ commons.activeProposal.parliamentRemarks }}</p>
</div>
<div v-if="commons.activeProposal.parliamentBrief" class="parliament-brief-collapse">
  <button class="brief-toggle" @click="showBrief = !showBrief">
    {{ showBrief ? '▾' : '▸' }} View full Parliament Brief
  </button>
  <div v-if="showBrief" class="parliament-brief">
    <p>{{ commons.activeProposal.parliamentBrief }}</p>
  </div>
</div>
        <div class="panel-votes">
  <div class="panel-votes__breakdown">
    <span class="vote-tally vote-tally--approve">Approve: {{ commons.activeProposal.panelVotes.filter(v => v.decision === 'approve').length }}</span>
    <span class="vote-tally vote-tally--reject">Reject: {{ commons.activeProposal.panelVotes.filter(v => v.decision === 'reject').length }}</span>
    <span class="vote-tally vote-tally--revision">Revision: {{ commons.activeProposal.panelVotes.filter(v => v.decision === 'revision').length }}</span>
  </div>
  <div class="panel-votes__count">
  {{ commons.activeProposal.panelVotes.length }} of {{ config.SORTITION_PANEL_SIZE }} votes cast
  <span v-if="approvalsNeeded > 0" class="votes-needed">· {{ approvalsNeeded }} more approval{{ approvalsNeeded === 1 ? '' : 's' }} needed to fund</span>
  <span v-else class="votes-met">· approval threshold reached</span>
</div>
</div>
        <div v-if="commons.isOperator" class="panel-actions">
          <h4>Cast Vote</h4>
          <textarea v-model="panelFeedback" rows="3" placeholder="Feedback..." />
          <div class="panel-buttons">
            <button class="btn btn--aye" @click="commons.castPanelVote(commons.activeProposal.id, 'approve', panelFeedback)">Approve</button>
            <button class="btn btn--nay" @click="commons.castPanelVote(commons.activeProposal.id, 'reject', panelFeedback)">Reject</button>
            <button v-if="commons.activeProposal.revisionCount < 1" class="btn btn--ghost" @click="commons.castPanelVote(commons.activeProposal.id, 'revision', panelFeedback)">Request Revision</button>
          </div>
        </div>
      </div>

      <!-- Stage 5 Milestones -->
      <div v-if="commons.activeProposal.status === 'funded' || commons.activeProposal.status === 'complete'" class="stage-panel">
  <h3>Milestone Execution</h3>
  <p class="stage-note">Confirmation by the <strong>Sortition Panel</strong> — the same members drawn by lot in Stage 4 oversee delivery. XOR releases per milestone on their confirmation. 1% burns automatically.</p>
        <div class="milestones">
          <div v-for="milestone in commons.activeProposal.milestones" :key="milestone.id" class="milestone-item" :class="{ 'milestone-item--complete': milestone.completed }">
            <div class="milestone-item__check">{{ milestone.completed ? "✓" : "○" }}</div>
            <div class="milestone-item__body">
              <p>{{ milestone.description }}</p>
             <span>{{ milestone.xorAmount }} XOR · {{ commons.formatDate(milestone.timeline) }}</span>              <span v-if="milestone.completed" class="burn-note">{{ milestone.xorBurned }} XOR burned</span>
            </div>
            <button v-if="!milestone.completed && commons.isOperator" class="btn btn--small btn--primary" @click="commons.confirmMilestone(commons.activeProposal.id, milestone.id)">Confirm</button>
          </div>
        </div>
      </div>

      <!-- Milestones Overview -->
      <div class="milestones-overview">
        <h3>Milestones</h3>
        <div v-for="milestone in commons.activeProposal.milestones" :key="milestone.id" class="milestone-item" :class="{ 'milestone-item--complete': milestone.completed }">
          <div class="milestone-item__check">{{ milestone.completed ? "✓" : "○" }}</div>
          <div class="milestone-item__body">
            <p>{{ milestone.description }}</p>
            <span>{{ milestone.xorAmount }} XOR · {{ commons.formatDate(milestone.timeline) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'submit'" class="submit-form">
      <h2>Submit a Proposal</h2>
     <div class="fee-notice">
  <span>Submission fee: <strong>{{ config.PROPOSAL_FEE_XOR }} XOR</strong> — burned on submission, non-refundable</span>
  <span>Balance: <strong>{{ commons.xorBalance }} XOR</strong></span>
</div>
      <div v-if="parseFloat(commons.xorBalance) < parseFloat(config.PROPOSAL_FEE_XOR)" class="fee-gate">
        <p>You need at least {{ config.PROPOSAL_FEE_XOR }} XOR to submit.</p>
      </div>
      <div v-else>
        <div class="form-group">
          <label>Title</label>
          <input v-model="commons.draftTitle" type="text" placeholder="What are you building?" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="commons.draftDescription" rows="6" placeholder="Describe the productive output..." />
        </div>
        <div class="form-group">
          <label>Total XOR Requested</label>
          <input v-model="commons.draftXorRequested" type="number" placeholder="0" min="0" />
        </div>
        <div class="milestones-form">
         <h3>Milestones</h3>
          <p v-if="parseFloat(commons.milestoneDelta) < 0" class="milestone-warning">
  Milestones total {{ commons.milestoneTotal }} XOR but you requested {{ commons.draftXorRequested }} XOR. Reduce milestone amounts by {{ Math.abs(parseFloat(commons.milestoneDelta)).toFixed(4) }} XOR, or increase your total XOR requested.
</p>
<p v-else-if="parseFloat(commons.milestoneDelta) > 0 && parseFloat(commons.milestoneTotal) > 0" class="milestone-warning milestone-warning--under">
  You have {{ commons.milestoneDelta }} XOR unallocated. Add it to a milestone, or reduce your total XOR requested to match.
</p>
          <p class="milestone-hint">Tip: Make Milestone 1 small and achievable — first delivery = first payment.</p>
          <div v-for="(milestone, index) in commons.draftMilestones" :key="index" class="milestone-row">
            <div class="milestone-row__number">{{ index + 1 }}</div>
            <div class="milestone-row__fields">
              <input v-model="milestone.description" type="text" placeholder="What will you deliver?" />
              <div class="milestone-row__inline">
                <input v-model="milestone.xorAmount" type="number" placeholder="XOR" min="0" />
                <div class="date-field-wrap">
                  <input
                    v-model="milestone.timeline"
                    type="date"
                    :min="minDate"
                    class="milestone-date-input"
                  />
                  <span v-if="milestone.timeline && !isDateValid(milestone.timeline)" class="date-error">
                    Completion date cannot be in the past
                  </span>
                </div>
              </div>
            </div>
            <button class="btn btn--ghost btn--small" @click="commons.removeMilestone(index)">✕</button>
          </div>
          <button class="btn btn--ghost" @click="commons.addMilestone()">+ Add Milestone</button>
        </div>
        <div class="burn-preview">
  <p>On submission: <strong>{{ config.PROPOSAL_FEE_XOR }} XOR burned</strong> — non-refundable, recorded on-chain</p>
  <p>On each milestone: <strong>1% of tranche burns on confirmation</strong></p>
</div>
        <button class="btn btn--primary btn--large" :disabled="!commons.isDraftValid" @click="handleSubmit">
  Submit Proposal — Burn {{ config.PROPOSAL_FEE_XOR }} XOR
</button>
      </div>
    </div>
    <div v-if="activeTab === 'completed'" class="proposal-list">
      <div v-if="commons.completedProposals.length === 0" class="empty-state">
        <p>No completed proposals yet.</p>
      </div>
     <div v-for="proposal in commons.completedProposals" :key="proposal.id" class="proposal-card" :class="{ 'proposal-card--rejected': proposal.status === 'rejected' }" @click="commons.setActiveProposal(proposal.id); activeTab = 'detail'">
  <div class="proposal-card__header">
    <span class="proposal-card__stage">{{ commons.statusLabel(proposal.status) }}</span>
    <span class="proposal-card__xor">{{ proposal.xorBurned }} XOR burned</span>
  </div>
  <h3 class="proposal-card__title">{{ proposal.title }}</h3>
  <div v-if="proposal.status === 'rejected' && proposal.panelVotes.length > 0" class="rejection-reasons">
    <p class="rejection-reasons__label">Panel feedback:</p>
    <p v-for="vote in proposal.panelVotes.filter(v => v.feedback)" :key="vote.accountId" class="rejection-reasons__item">
      "{{ vote.feedback }}"
    </p>
  </div>
</div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCommonsStore } from "@/stores/commons";
import { COMMONS_CONFIG as config } from "@/constants/commonsConfig";

const approvalsNeeded = computed(() => {
  const p = commons.activeProposal;
  if (!p) return 0;
  const approvals = p.panelVotes.filter(v => v.decision === 'approve').length;
  return Math.max(0, config.SORTITION_APPROVAL_THRESHOLD - approvals);
});
const commons = useCommonsStore();
const myRep = computed(() => commons.myReputation);
const showBrief = ref(false);
const minDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});
const isDateValid = (dateStr: string): boolean => {
  if (!dateStr) return true;
  // Only validate complete dates (YYYY-MM-DD with 4-digit year)
  const match = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  if (!match) return true; // incomplete date — don't flag yet
  const year = parseInt(dateStr.slice(0, 4), 10);
  if (year < 1000) return true; // still typing the year
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !isNaN(date.getTime()) && date > today;
};
const activeTab = ref<"live" | "submit" | "completed" | "detail">("live");
const discussionContent = ref("");
const briefContent = ref("");
const remarksContent = ref("");
const panelFeedback = ref("");

const tabs = computed(() => [
  { id: "live" as const, label: "Live Proposals", count: commons.liveProposals.length },
  { id: "submit" as const, label: "Submit", count: 0 },
  { id: "completed" as const, label: "Completed", count: commons.completedProposals.length },
]);

const handleSubmit = () => {
  const proposal = commons.submitProposal();
  if (proposal) {
    commons.setActiveProposal(proposal.id);
    activeTab.value = "detail";
  }
};
</script>

<style scoped>
.commons-view { padding: 1.5rem; font-family: "Sora", sans-serif; max-width: 800px; margin: 0 auto; }
.commons-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.commons-header__title h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem; }
.commons-header__title p { font-size: 0.85rem; opacity: 0.6; margin: 0; }
.commons-header__stats { display: flex; gap: 1.5rem; }
.stat { display: flex; flex-direction: column; align-items: flex-end; }
.stat__value { font-size: 1.2rem; font-weight: 700; }
.stat__label { font-size: 0.7rem; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.05em; }
.role-banner { padding: 0.75rem 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
.role-banner--citizen { border-color: rgba(100,220,150,0.3); }
.role-banner--operator { border-color: rgba(100,150,255,0.3); }
.role-banner--panel_member { border-color: rgba(255,200,100,0.3); }
.role-banner__role { font-weight: 600; font-size: 0.9rem; }
.role-banner__hint { font-size: 0.8rem; opacity: 0.6; max-width: 60%; text-align: right; }
.commons-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
.commons-tab { background: none; border: none; color: inherit; opacity: 0.5; cursor: pointer; padding: 0.4rem 0.75rem; font-family: "Sora", sans-serif; font-size: 0.85rem; border-radius: 6px; display: flex; align-items: center; gap: 0.4rem; }
.commons-tab--active { opacity: 1; background: rgba(255,255,255,0.08); }
.commons-tab__count { background: rgba(255,255,255,0.15); border-radius: 10px; padding: 0.1rem 0.4rem; font-size: 0.7rem; }
.proposal-card { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 1rem; margin-bottom: 0.75rem; cursor: pointer; transition: border-color 0.2s; }
.proposal-card:hover { border-color: rgba(255,255,255,0.25); }
.proposal-card__header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.proposal-card__stage { font-size: 0.75rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; }
.proposal-card__title { margin: 0 0 0.4rem; font-size: 1rem; font-weight: 600; }
.proposal-card__description { font-size: 0.85rem; opacity: 0.6; margin: 0 0 0.5rem; }
.proposal-card__footer { display: flex; gap: 1rem; font-size: 0.75rem; opacity: 0.5; }
.proposal-card__xor { font-weight: 600; font-size: 0.85rem; }
.empty-state { text-align: center; padding: 3rem; opacity: 0.5; }
.fee-notice { display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(255,255,255,0.04); border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.85rem; }
.fee-gate { padding: 1.5rem; border: 1px solid rgba(255,200,100,0.3); border-radius: 10px; opacity: 0.7; text-align: center; }
.form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.8rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; }
.form-group input, .form-group textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.75rem; color: inherit; font-family: "Sora", sans-serif; font-size: 0.9rem; width: 100%; box-sizing: border-box; }
.milestones-form h3 { margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem; }
.milestone-hint { font-size: 0.78rem; opacity: 0.5; margin-bottom: 0.75rem; }
.delta { font-size: 0.8rem; font-weight: 400; opacity: 0.6; }
.delta--error { color: #ff6464; opacity: 1; }
.milestone-row { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; align-items: flex-start; }.milestone-row__number { font-size: 0.8rem; opacity: 0.4; padding-top: 0.75rem; min-width: 16px; }
.milestone-row__fields { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.milestone-row__fields input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.65rem 0.75rem; color: inherit; font-family: "Sora", sans-serif; font-size: 0.85rem; width: 100%; box-sizing: border-box; }
.milestone-row__inline { display: flex; gap: 0.4rem; }
.milestone-row__inline input:first-child { flex: 0 0 80px; }
.milestone-row__inline input:last-child { flex: 1; }
.burn-preview { padding: 0.75rem 1rem; background: rgba(255,100,100,0.05); border: 1px solid rgba(255,100,100,0.15); border-radius: 8px; margin-bottom: 1rem; font-size: 0.82rem; opacity: 0.8; }
.burn-preview p { margin: 0.2rem 0; }
.voted-badge { color: #64dcaa; }
.btn { padding: 0.6rem 1.2rem; border-radius: 8px; border: none; cursor: pointer; font-family: "Sora", sans-serif; font-size: 0.85rem; font-weight: 600; transition: opacity 0.2s; }
.btn:disabled { opacity: 0.3; cursor: not-allowed; }
.btn--primary { background: #64dcaa; color: #000; }
.btn--aye { background: #64dcaa; color: #000; }
.btn--nay { background: #ff6464; color: #fff; }
.btn--ghost { background: rgba(255,255,255,0.08); color: inherit; }
.btn--small { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
.btn--large { width: 100%; padding: 0.9rem; font-size: 1rem; margin-top: 1rem; }

.proposal-detail__header { display: flex; align-items: center; gap: 1rem; margin: 1rem 0; }
.proposal-detail__header h2 { margin: 0; }
.stage-badge { font-size: 0.75rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; }
.proposal-detail__description { opacity: 0.7; line-height: 1.6; margin-bottom: 1.5rem; }
.proposal-detail__meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
.meta-item__label { font-size: 0.7rem; opacity: 0.5; text-transform: uppercase; }
.meta-item__value { font-weight: 600; }
.mono { font-family: monospace; }
.stage-panel { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 1.25rem; margin-bottom: 1.5rem; }
.stage-panel h3 { margin: 0 0 0.5rem; font-size: 1rem; display: flex; align-items: center; gap: 0.75rem; }
.days-remaining { font-size: 0.75rem; font-weight: 400; opacity: 0.5; }
.stage-note { font-size: 0.82rem; opacity: 0.6; margin-bottom: 1rem; line-height: 1.5; }
.signal-stats { margin-bottom: 1rem; }
.signal-bar { height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; margin-bottom: 0.5rem; overflow: hidden; position: relative; display: flex; }
.signal-bar__aye { height: 100%; background: #64dcaa; transition: width 0.3s; }
.signal-bar__nay { height: 100%; background: #ff6464; transition: width 0.3s; }
.signal-bar__threshold { position: absolute; top: -3px; bottom: -3px; width: 3px; background: #fff; box-shadow: 0 0 0 1px #C9A84C, 0 0 4px rgba(201,168,76,0.8); z-index: 2; border-radius: 1px; }
.signal-numbers { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.5rem; }
.aye { color: #64dcaa; font-weight: 600; }
.nay { color: #ff6464; font-weight: 600; }
.percent { opacity: 0.6; }
.signal-thresholds { display: flex; gap: 1rem; font-size: 0.78rem; opacity: 0.5; }
.signal-thresholds .met { opacity: 1; color: #64dcaa; }
.signal-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
.already-signaled { font-size: 0.85rem; color: #64dcaa; margin-top: 1rem; }
.signal-gate { font-size: 0.85rem; opacity: 0.5; margin-top: 1rem; }
.parliament-brief { background: rgba(100,150,255,0.05); border: 1px solid rgba(100,150,255,0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.parliament-brief h4 { margin: 0 0 0.5rem; font-size: 0.85rem; opacity: 0.7; }
.post-form textarea { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.75rem; color: inherit; font-family: "Sora", sans-serif; font-size: 0.85rem; box-sizing: border-box; margin-bottom: 0.5rem; resize: vertical; }
.discussion h4 { margin: 1rem 0 0.75rem; font-size: 0.9rem; }
.discussion-post { border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; }
.discussion-post--amendment { border-color: rgba(255,200,100,0.3); background: rgba(255,200,100,0.03); }
.discussion-post__header { display: flex; justify-content: space-between; margin-bottom: 0.4rem; }
.discussion-post__author { font-size: 0.78rem; font-weight: 600; font-family: monospace; }
.discussion-post__date { font-size: 0.72rem; opacity: 0.4; }
.panel-votes { margin-bottom: 1rem; }
.panel-votes__count { font-size: 0.85rem; opacity: 0.6; }
.panel-buttons { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
.operator-actions { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
.milestones h3 { margin-bottom: 0.75rem; }
.milestones-overview { margin-top: 1.5rem; }
.milestones-overview h3 { margin-bottom: 0.75rem; }
.milestone-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 0.5rem; }
.milestone-item--complete { opacity: 0.6; border-color: rgba(100,220,150,0.2); }
.milestone-item__check { font-size: 1.1rem; color: #64dcaa; padding-top: 0.1rem; }
.milestone-item__body { flex: 1; }
.milestone-item__body p { margin: 0 0 0.2rem; font-size: 0.9rem; }
.milestone-item__body span { font-size: 0.78rem; opacity: 0.5; display: block; }
.burn-note { color: #ff6464 !important; opacity: 1 !important; }
.milestone-date-label { font-size: 0.75rem; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; display: block; }
.proposal-card--rejected { border-color: rgba(255,100,100,0.2); }
.rejection-reasons { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,100,100,0.15); }
.rejection-reasons__label { font-size: 0.72rem; opacity: 0.5; margin: 0 0 0.25rem; text-transform: uppercase; }
.rejection-reasons__item { font-size: 0.82rem; opacity: 0.7; margin: 0.2rem 0; font-style: italic; }
.demo-banner { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.78rem; color: #C9A84C; line-height: 1.6; text-align: center; }
.panel-votes__breakdown { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
.vote-tally { font-size: 0.85rem; font-weight: 600; }
.vote-tally--approve { color: #64dcaa; }
.vote-tally--reject { color: #ff6464; }
.vote-tally--revision { color: #C9A84C; }
.demo-note { color: #C9A84C; opacity: 0.8; border-left: 2px solid rgba(201,168,76,0.4); padding-left: 0.75rem; margin-top: 0.5rem; }
.milestone-warning { font-size: 0.8rem; color: #ff6464; background: rgba(255,100,100,0.05); border: 1px solid rgba(255,100,100,0.15); border-radius: 8px; padding: 0.6rem 0.75rem; margin-bottom: 0.75rem; line-height: 1.5; }
.milestone-warning--under { color: #C9A84C; background: rgba(201,168,76,0.05); border-color: rgba(201,168,76,0.15); }
.signal-bar-wrap { margin-bottom: 1.75rem; position: relative; }
.signal-bar__threshold-label { position: absolute; top: 10px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; white-space: nowrap; }
.signal-bar__threshold-marker { position: absolute; top: 10px; transform: translateX(calc(-50% + 2px)); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 5px solid #C9A84C; }
.signal-bar__threshold-text { position: absolute; top: 17px; transform: translateX(-50%); color: #C9A84C; font-size: 0.7rem; opacity: 0.85; white-space: nowrap; }
.date-field-wrap { flex: 1; position: relative; }
.milestone-date-input { color-scheme: dark; width: 100%; box-sizing: border-box; }
.date-error { position: absolute; top: 100%; left: 0; margin-top: 0.2rem; font-size: 0.72rem; color: #ff6464; white-space: nowrap; }
.parliament-remarks { background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.parliament-remarks h4 { margin: 0 0 0.5rem; font-size: 0.85rem; color: #C9A84C; }
.parliament-brief-collapse { margin-bottom: 1rem; }
.brief-toggle { background: none; border: none; color: #8b949e; cursor: pointer; font-family: "Sora", sans-serif; font-size: 0.8rem; padding: 0.4rem 0; opacity: 0.7; transition: opacity 0.2s; }
.brief-toggle:hover { opacity: 1; }
.votes-needed { color: #C9A84C; }
.votes-met { color: #64dcaa; }
.signal-bar__threshold { position: absolute; top: -3px; bottom: -3px; width: 3px; background: #C9A84C; box-shadow: 0 0 0 1px rgba(0,0,0,0.4); z-index: 2; border-radius: 1px; }
.role-banner__rep { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.rep-chip { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 10px; background: rgba(100,220,150,0.08); border: 1px solid rgba(100,220,150,0.2); color: #64dcaa; }
</style>


