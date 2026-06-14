<template>
  <div class="proposals">
    <header class="head">
      <div>
        <h1>Proposals</h1>
        <p class="sub">Every proposal in the Commons, across all five stages.</p>
      </div>
      <button class="submit-cta" @click="$emit('nav', 'submit')">+ Submit a proposal</button>
    </header>

    <!-- FILTER BAR -->
    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="chip"
        :class="{ 'chip--on': active === f.key }"
        @click="active = f.key"
      >
        {{ f.label }}
        <span class="chip__n">{{ f.count }}</span>
      </button>
    </div>

    <!-- LIST -->
    <p v-if="visible.length === 0" class="empty">{{ emptyText }}</p>

    <div v-else class="list">
      <article
        v-for="p in visible"
        :key="p.id"
        class="card"
        @click="commons.setActiveProposal(p.id)"
      >
        <div class="card__top">
          <span class="pill" :class="pillClass(p.status)">{{ commons.statusLabel(p.status) }}</span>
          <span class="card__stage">Stage {{ commons.stageNumber(p.status) }} of 5</span>
        </div>

        <h3 class="card__title">{{ p.title }}</h3>
        <p class="card__desc">{{ p.description }}</p>

        <div class="card__foot">
          <span class="req">{{ p.xorRequested }} XOR requested</span>
          <span v-if="Number(p.xorBurned) > 0" class="burned">▲ {{ p.xorBurned }} burned</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCommonsStore } from "@/stores/commons";
import type { ProposalStatus } from "@/stores/commons";

defineEmits<{ (e: "nav", id: string): void }>();

const commons = useCommonsStore();

type FilterKey = "all" | "live" | "funded" | "complete" | "rejected";
const active = ref<FilterKey>("all");

const inStage = (statuses: ProposalStatus[]) =>
  commons.proposals.filter((p) => statuses.includes(p.status));

const live = computed(() => commons.liveProposals);
const funded = computed(() => inStage(["funded"]));
const complete = computed(() => inStage(["complete"]));
const rejected = computed(() => inStage(["rejected", "archived"]));

const filters = computed(() => [
  { key: "all" as const, label: "All", count: commons.proposals.length },
  { key: "live" as const, label: "Live", count: live.value.length },
  { key: "funded" as const, label: "Funded", count: funded.value.length },
  { key: "complete" as const, label: "Complete", count: complete.value.length },
  { key: "rejected" as const, label: "Closed", count: rejected.value.length },
]);

const visible = computed(() => {
  switch (active.value) {
    case "live": return live.value;
    case "funded": return funded.value;
    case "complete": return complete.value;
    case "rejected": return rejected.value;
    default: return commons.proposals;
  }
});

const emptyText = computed(() =>
  commons.proposals.length === 0
    ? "No proposals yet. Be the first to submit one."
    : "Nothing in this stage right now."
);

function pillClass(status: ProposalStatus) {
  if (status === "funded" || status === "complete") return "pill--affirm";
  if (status === "rejected" || status === "archived") return "pill--negate";
  return "pill--live";
}
</script>

<style scoped>
.proposals { display: flex; flex-direction: column; gap: 22px; }

.head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.head h1 { font-family: var(--display); font-size: 2rem; margin: 0 0 4px; }
.sub { color: var(--ink-dim); margin: 0; }
.submit-cta { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 10px 16px; font-weight: 600; font-size: .9rem; cursor: pointer; white-space: nowrap; }
.submit-cta:hover { filter: brightness(1.06); }

.filters { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { display: inline-flex; align-items: center; gap: 7px; background: var(--navy-850); border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px; color: var(--ink-dim); font-size: .88rem; cursor: pointer; }
.chip:hover { color: var(--ink); }
.chip--on { background: rgba(201,168,76,.12); border-color: var(--gold-600); color: var(--gold-300); }
.chip__n { font-family: var(--mono); font-size: .72rem; opacity: .8; }

.empty { color: var(--ink-faint); padding: 40px 0; text-align: center; }

.list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.card { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 18px; cursor: pointer; transition: border-color .2s var(--ease), transform .2s var(--ease); }
.card:hover { border-color: var(--gold-600); transform: translateY(-2px); }
.card__top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.pill { font-size: .72rem; padding: 3px 10px; border-radius: 999px; font-weight: 600; }
.pill--live { background: rgba(126,155,224,.16); color: var(--info); }
.pill--affirm { background: rgba(100,220,170,.14); color: var(--affirm); }
.pill--negate { background: rgba(255,100,100,.12); color: var(--negate); }
.card__stage { font-family: var(--mono); font-size: .72rem; color: var(--ink-faint); }
.card__title { font-size: 1.08rem; margin: 0 0 6px; }
.card__desc { color: var(--ink-dim); font-size: .9rem; line-height: 1.5; margin: 0 0 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card__foot { display: flex; align-items: center; justify-content: space-between; }
.req { font-family: var(--mono); font-size: .82rem; color: var(--ink-dim); }
.burned { font-family: var(--mono); font-size: .8rem; color: var(--gold-300); }

@media (max-width: 720px) {
  .head { flex-direction: column; align-items: flex-start; }
  .list { grid-template-columns: 1fr; }
}
</style>