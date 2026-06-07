<template>
  <div class="commons-view">
    <!-- Header -->
    <div class="commons-header">
      <div class="commons-header__title">
        <h1>SORA Commons</h1>
        <p>Propose productive work. Vote as a citizen. Fund what matters.</p>
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

    <!-- Role Banner -->
    <div class="role-banner" :class="`role-banner--${commons.commonsRole}`">
      <span class="role-banner__role">{{ commons.roleLabel(commons.commonsRole) }}</span>
      <span class="role-banner__hint">{{ roleHint }}</span>
    </div>

    <!-- Tabs -->
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

    <!-- Proposal List -->
    <div v-if="activeTab === 'live'" class="proposal-list">
      <div v-if="commons.liveProposals.length === 0" class="empty-state">
        <p>No live proposals yet.</p>
        <button class="btn btn--primary" @click="activeTab = 'submit'">
          Submit the first proposal
        </button>
      </div>
      <div
        v-for="proposal in commons.liveProposals"
        :key="proposal.id"
        class="proposal-card"
        @click="commons.setActiveProposal(proposal.id); activeTab = 'detail'"
      >
        <div class="proposal-card__header">
          <span class="proposal-card__status" :class="`status--${proposal.status}`">
            {{ commons.statusLabel(proposal.status) }}
          </span>
          <span class="proposal-card__xor">{{ proposal.xorRequested }} XOR</span>
        </div>
        <h3 class="proposal-card__title">{{ proposal.title }}</h3>
        <p class="proposal-card__description">{{ proposal.description.slice(0, 120) }}...</p>
        <div class="proposal-card__footer">
          <span>{{ proposal.votes.length }} votes</span>
          <span>{{ proposal.milestones.length }} milestones</span>
          <span v-if="commons.hasVoted(proposal)" class="voted-badge">✓ Voted</span>
        </div>
      </div>
    </div>
    <!-- Proposal Detail -->
    <div v-if="activeTab === 'detail' && commons.activeProposal" class="proposal-detail">
      <button class="btn btn--ghost" @click="activeTab = 'live'">← Back</button>
      <div class="proposal-detail__header">
        <h2>{{ commons.activeProposal.title }}</h2>
        <span class="proposal-card__status" :class="`status--${commons.activeProposal.status}`">
          {{ commons.statusLabel(commons.activeProposal.status) }}
        </span>
      </div>
      <p class="proposal-detail__description">{{ commons.activeProposal.description }}</p>
      <div class="proposal-detail__meta">
        <div class="meta-item">
          <span class="meta-item__label">Requested</span>
          <span class="meta-item__value">{{ commons.activeProposal.xorRequested }} XOR</span>
        </div>
        <div class="meta-item">
          <span class="meta-item__label">Proposer</span>
          <span class="meta-item__value mono">{{ commons.activeProposal.proposerAccountId.slice(0, 16) }}...</span>
        </div>
        <div class="meta-item">
          <span class="meta-item__label">Votes</span>
          <span class="meta-item__value">{{ commons.activeProposal.votes.length }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-item__label">XOR Burned</span>
          <span class="meta-item__value">{{ commons.activeProposal.xorBurned }} XOR</span>
        </div>
      </div>

      <!-- Milestones -->
      <div class="milestones">
        <h3>Milestones</h3>
        <div
          v-for="milestone in commons.activeProposal.milestones"
          :key="milestone.id"
          class="milestone-item"
          :class="{ 'milestone-item--complete': milestone.completed }"
        >
          <div class="milestone-item__check">{{ milestone.completed ? '✓' : '○' }}</div>
          <div class="milestone-item__body">
            <p>{{ milestone.description }}</p>
            <span>{{ milestone.xorAmount }} XOR</span>
          </div>
          <button
            v-if="!milestone.completed && (commons.isOperator || commons.activeProposal.panelMembers.includes(commons.currentAccountId))"
            class="btn btn--small btn--primary"
            @click="commons.confirmMilestone(commons.activeProposal!.id, milestone.id)"
          >
            Confirm
          </button>
        </div>
      </div>

      <!-- Vote / Panel Actions -->
      <div class="proposal-actions">
        <button
          v-if="commons.canVote(commons.activeProposal)"
          class="btn btn--primary"
          @click="commons.castVote(commons.activeProposal!.id)"
        >
          Cast Vote
        </button>
        <span v-else-if="commons.hasVoted(commons.activeProposal)" class="voted-badge">
          ✓ You voted on this proposal
        </span>
        <div v-if="commons.activeProposal.status === 'under_review' && commons.isOperator" class="panel-actions">
          <button class="btn btn--primary" @click="commons.approveProposal(commons.activeProposal!.id)">
            Approve
          </button>
          <button class="btn btn--danger" @click="commons.rejectProposal(commons.activeProposal!.id)">
            Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Submit Proposal -->
    <div v-if="activeTab === 'submit'" class="submit-form">
      <h2>Submit a Proposal</h2>
      <div v-if="!commons.isCitizen" class="citizen-gate">
        <p>You must be a registered citizen with bonded XOR to submit a proposal.</p>
        <p>Bond 10,000 XOR through the Governance tab to become a citizen.</p>
      </div>
      <div v-else>
        <div class="form-group">
          <label>Title</label>
          <input v-model="commons.draftTitle" type="text" placeholder="What are you building?" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="commons.draftDescription" rows="5" placeholder="Describe the productive output, who benefits, and how it advances the SORA ecosystem." />
        </div>
        <div class="form-group">
          <label>Total XOR Requested</label>
          <input v-model="commons.draftXorRequested" type="number" placeholder="0" />
        </div>
        <div class="milestones-form">
          <h3>Milestones <span class="delta" :class="{ 'delta--error': parseFloat(commons.milestoneDelta) !== 0 }">{{ commons.milestoneDelta }} XOR remaining</span></h3>
          <div v-for="(milestone, index) in commons.draftMilestones" :key="index" class="milestone-row">
            <input v-model="milestone.description" type="text" placeholder="Milestone description" />
            <input v-model="milestone.xorAmount" type="number" placeholder="XOR" />
            <button class="btn btn--ghost btn--small" @click="commons.removeMilestone(index)">✕</button>
          </div>
          <button class="btn btn--ghost" @click="commons.addMilestone()">+ Add Milestone</button>
        </div>
        <button
          class="btn btn--primary btn--large"
          :disabled="!commons.isDraftValid"
          @click="handleSubmit"
        >
          Submit Proposal
        </button>
      </div>
    </div>

    <!-- Completed -->
    <div v-if="activeTab === 'completed'" class="proposal-list">
      <div v-if="commons.completedProposals.length === 0" class="empty-state">
        <p>No completed proposals yet. Be the first to finish one.</p>
      </div>
      <div
        v-for="proposal in commons.completedProposals"
        :key="proposal.id"
        class="proposal-card"
        @click="commons.setActiveProposal(proposal.id); activeTab = 'detail'"
      >
        <div class="proposal-card__header">
          <span class="proposal-card__status" :class="`status--${proposal.status}`">
            {{ commons.statusLabel(proposal.status) }}
          </span>
          <span class="proposal-card__xor">{{ proposal.xorBurned }} XOR burned</span>
        </div>
        <h3 class="proposal-card__title">{{ proposal.title }}</h3>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useCommonsStore } from "@/stores/commons";

const commons = useCommonsStore();

const activeTab = ref<"live" | "submit" | "completed" | "detail">("live");

const tabs = computed(() => [
{ id: "live" as const, label: "Live Proposals", count: commons.liveProposals.length },
{ id: "submit" as const, label: "Submit", count: 0 },
{ id: "completed" as const, label: "Completed", count: commons.completedProposals.length },
]);

const roleHint = computed(() => {
  switch (commons.commonsRole) {
    case "visitor": return "Connect a wallet to participate.";
    case "holder": return "Bond 10,000 XOR in Governance to become a citizen and vote.";
    case "citizen": return "You can vote on proposals and submit your own.";
    case "panel_member": return "You have been selected to review a proposal.";
    case "proposer": return "You have an active proposal under review.";
    case "operator": return "You have operator access to approve and manage proposals.";
  }
});

const handleSubmit = () => {
  const proposal = commons.submitProposal();
  if (proposal) {
    commons.setActiveProposal(proposal.id);
    activeTab.value = "detail";
  }
};
</script>

<style scoped>
.commons-view {
  padding: 1.5rem;
  font-family: "Sora", sans-serif;
  max-width: 800px;
  margin: 0 auto;
}
.commons-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.commons-header__title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}
.commons-header__title p {
  font-size: 0.85rem;
  opacity: 0.6;
  margin: 0;
}
.commons-header__stats {
  display: flex;
  gap: 1.5rem;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.stat__value {
  font-size: 1.2rem;
  font-weight: 700;
}
.stat__label {
  font-size: 0.7rem;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.role-banner {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
}
.role-banner--citizen { border-color: rgba(100, 220, 150, 0.3); }
.role-banner--operator { border-color: rgba(100, 150, 255, 0.3); }
.role-banner--panel_member { border-color: rgba(255, 200, 100, 0.3); }
.role-banner__role { font-weight: 600; font-size: 0.9rem; }
.role-banner__hint { font-size: 0.8rem; opacity: 0.6; }
.commons-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 0.5rem;
}
.commons-tab {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.5;
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  font-family: "Sora", sans-serif;
  font-size: 0.85rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.commons-tab--active { opacity: 1; background: rgba(255,255,255,0.08); }
.commons-tab__count {
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 0.1rem 0.4rem;
  font-size: 0.7rem;
}
.proposal-card {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: border-color 0.2s;
}
.proposal-card:hover { border-color: rgba(255,255,255,0.25); }
.proposal-card__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.proposal-card__title { margin: 0 0 0.4rem; font-size: 1rem; font-weight: 600; }
.proposal-card__description { font-size: 0.85rem; opacity: 0.6; margin: 0 0 0.5rem; }
.proposal-card__footer { display: flex; gap: 1rem; font-size: 0.75rem; opacity: 0.5; }
.proposal-card__xor { font-weight: 600; font-size: 0.85rem; }
.status--voting { color: #64dcaa; }
.status--awaiting_panel { color: #ffc864; }
.status--under_review { color: #6496ff; }
.status--funded { color: #64dcaa; }
.status--in_progress { color: #ffc864; }
.status--complete { color: #64dcaa; }
.status--rejected { color: #ff6464; }
.voted-badge { color: #64dcaa; font-size: 0.8rem; }
.empty-state { text-align: center; padding: 3rem; opacity: 0.5; }
.proposal-detail { padding: 1rem 0; }
.proposal-detail__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}
.proposal-detail__header h2 { margin: 0; }
.proposal-detail__description { opacity: 0.7; line-height: 1.6; margin-bottom: 1.5rem; }
.proposal-detail__meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
.meta-item__label { font-size: 0.7rem; opacity: 0.5; text-transform: uppercase; }
.meta-item__value { font-weight: 600; }
.mono { font-family: monospace; }
.milestones h3 { margin-bottom: 0.75rem; }
.milestone-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}
.milestone-item--complete { opacity: 0.5; border-color: rgba(100,220,150,0.2); }
.milestone-item__check { font-size: 1.2rem; color: #64dcaa; }
.milestone-item__body { flex: 1; }
.milestone-item__body p { margin: 0 0 0.2rem; font-size: 0.9rem; }
.milestone-item__body span { font-size: 0.8rem; opacity: 0.6; }
.proposal-actions { margin-top: 1.5rem; display: flex; gap: 0.75rem; align-items: center; }
.panel-actions { display: flex; gap: 0.75rem; }
.submit-form h2 { margin-bottom: 1.5rem; }
.citizen-gate {
  padding: 1.5rem;
  border: 1px solid rgba(255,200,100,0.3);
  border-radius: 10px;
  opacity: 0.7;
}
.form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.8rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; }
.form-group input, .form-group textarea {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 0.75rem;
  color: inherit;
  font-family: "Sora", sans-serif;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
}
.milestones-form h3 { margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; }
.delta { font-size: 0.8rem; font-weight: 400; opacity: 0.6; }
.delta--error { color: #ff6464; opacity: 1; }
.milestone-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center; }
.milestone-row input { flex: 1; }
.milestone-row input:last-of-type { flex: 0 0 80px; }
.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: "Sora", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  transition: opacity 0.2s;
}
.btn:disabled { opacity: 0.3; cursor: not-allowed; }
.btn--primary { background: #64dcaa; color: #000; }
.btn--danger { background: #ff6464; color: #fff; }
.btn--ghost { background: rgba(255,255,255,0.08); color: inherit; }
.btn--small { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
.btn--large { width: 100%; padding: 0.9rem; font-size: 1rem; margin-top: 1rem; }
</style>