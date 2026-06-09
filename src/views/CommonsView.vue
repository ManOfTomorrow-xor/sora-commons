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
<div class="meta-item"><span class="meta-item__label">Protocol Maintenance</span><span class="meta-item__value maintenance-value">{{ commons.activeProposal.xorToMaintainer }} XOR</span></div>
        <div class="meta-item"><span class="meta-item__label">Proposer</span><span class="meta-item__value mono">{{ commons.activeProposal.proposerAccountId.slice(0, 20) }}...</span></div>
        <div class="meta-item"><span class="meta-item__label">Submitted</span><span class="meta-item__value">{{ commons.formatDate(commons.activeProposal.createdAt) }}</span></div>
      </div>

      <!-- Stage 2 Signal -->
      <div v-if="commons.activeProposal.status === 'signal'" class="stage-panel">
        <h3>Community Signal <span class="days-remaining">{{ commons.daysRemaining(commons.activeProposal.signalEndsAt) }} days remaining</span></h3>
        <p class="stage-note">This is a soft signal — not a binding vote. The binding decision happens in Stage 4 Sortition.</p>
        <div class="signal-stats">
          <div class="signal-bar"><div class="signal-bar__fill" :style="`width: ${commons.getSignalStats(commons.activeProposal).ayePercent}%`"></div></div>
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
        <p class="stage-note">5 randomly selected citizens make the binding funding decision. 3 of 5 needed to approve.</p>
        <div class="panel-votes"><div class="panel-votes__count">{{ commons.activeProposal.panelVotes.length }} votes cast</div></div>
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
        <p class="stage-note">XOR releases per milestone on panel confirmation. 1% burns automatically.</p>
        <div class="milestones">
          <div v-for="milestone in commons.activeProposal.milestones" :key="milestone.id" class="milestone-item" :class="{ 'milestone-item--complete': milestone.completed }">
            <div class="milestone-item__check">{{ milestone.completed ? "✓" : "○" }}</div>
            <div class="milestone-item__body">
              <p>{{ milestone.description }}</p>
              <span>{{ milestone.xorAmount }} XOR · {{ milestone.timeline }}</span>
              <span v-if="milestone.completed" class="burn-note">{{ milestone.xorBurned }} XOR burned</span>
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
            <span>{{ milestone.xorAmount }} XOR · {{ milestone.timeline }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'submit'" class="submit-form">
      <h2>Submit a Proposal</h2>
      <div class="fee-notice">
  <div class="fee-notice__split">
    <span class="fee-notice__title">Submission fee: <strong>{{ config.PROPOSAL_FEE_XOR }} XOR</strong></span>
    <span class="fee-split__burn">{{ feeSplit.burnAmount }} XOR burned</span>
    <span class="fee-split__divider">·</span>
    <span class="fee-split__maintainer">{{ feeSplit.maintainerAmount }} XOR protocol maintenance</span>
    <span class="fee-split__note">Both non-refundable</span>
  </div>
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
          <h3>Milestones <span class="delta" :class="{ 'delta--error': parseFloat(commons.milestoneDelta) !== 0 }">{{ commons.milestoneDelta }} XOR remaining</span></h3>
          <p class="milestone-hint">Tip: Make Milestone 1 small and achievable — first delivery = first payment.</p>
          <div v-for="(milestone, index) in commons.draftMilestones" :key="index" class="milestone-row">
            <div class="milestone-row__number">{{ index + 1 }}</div>
            <div class="milestone-row__fields">
              <input v-model="milestone.description" type="text" placeholder="What will you deliver?" />
              <div class="milestone-row__inline">
                <input v-model="milestone.xorAmount" type="number" placeholder="XOR" min="0" />
                <input
  v-model="milestone.timeline"
  type="text"
  placeholder="Expected completion (MM/DD/YYYY)"
  @focus="showDatePicker($event)"
/>
              </div>
            </div>
            <button class="btn btn--ghost btn--small" @click="commons.removeMilestone(index)">✕</button>
          </div>
          <button class="btn btn--ghost" @click="commons.addMilestone()">+ Add Milestone</button>
        </div>
        <div class="burn-preview">
  <p>On submission: <strong>{{ feeSplit.burnAmount }} XOR burned · {{ feeSplit.maintainerAmount }} XOR protocol maintenance</strong></p>
  <p class="fee-transparency">Both portions are non-refundable and recorded publicly on-chain.</p>
  <p>On each milestone: <strong>1% of tranche burns on confirmation</strong></p>
</div>
        <button class="btn btn--primary btn--large" :disabled="!commons.isDraftValid" @click="handleSubmit">
  Submit Proposal — {{ feeSplit.burnAmount }} XOR burned · {{ feeSplit.maintainerAmount }} XOR maintenance
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCommonsStore } from "@/stores/commons";
import { COMMONS_CONFIG as config, calculateFeeSplit } from "@/constants/commonsConfig";

const feeSplit = calculateFeeSplit(parseFloat(config.PROPOSAL_FEE_XOR));
const commons = useCommonsStore();

const minDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});
const activeTab = ref<"live" | "submit" | "completed" | "detail">("live");
const discussionContent = ref("");
const briefContent = ref("");
const remarksContent = ref("");
const panelFeedback = ref("");

const showDatePicker = (event: FocusEvent) => {
  const input = event.target as HTMLInputElement;
  input.type = 'date';
  input.min = minDate.value;
  input.addEventListener('blur', () => {
    if (!input.value) input.type = 'text';
  }, { once: true });
  input.addEventListener('change', () => {
    const date = new Date(input.value);
    input.type = 'text';
    input.value = date.toLocaleDateString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric'
    });
  }, { once: true });
};

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
.milestone-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; align-items: flex-start; }
.milestone-row__number { font-size: 0.8rem; opacity: 0.4; padding-top: 0.75rem; min-width: 16px; }
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
.signal-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-bottom: 0.5rem; overflow: hidden; }
.signal-bar__fill { height: 100%; background: #64dcaa; border-radius: 3px; transition: width 0.3s; }
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
.fee-notice__split { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.fee-notice__title { font-size: 0.85rem; }
.fee-split__burn { color: #ff6464; font-size: 0.82rem; font-weight: 600; }
.fee-split__divider { opacity: 0.3; }
.fee-split__maintainer { color: #64b4ff; font-size: 0.82rem; font-weight: 600; }
.fee-split__note { font-size: 0.75rem; opacity: 0.45; }
.fee-transparency { font-size: 0.78rem; opacity: 0.5; margin: 0.2rem 0; }
.maintenance-value { color: #64b4ff; }
.milestone-date-label { font-size: 0.75rem; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; display: block; }
.proposal-card--rejected { border-color: rgba(255,100,100,0.2); }
.rejection-reasons { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,100,100,0.15); }
.rejection-reasons__label { font-size: 0.72rem; opacity: 0.5; margin: 0 0 0.25rem; text-transform: uppercase; }
.rejection-reasons__item { font-size: 0.82rem; opacity: 0.7; margin: 0.2rem 0; font-style: italic; }
.demo-banner { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.78rem; color: #C9A84C; line-height: 1.6; text-align: center; }
</style>
