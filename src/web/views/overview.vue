<template>
  <div class="overview">
  <!-- HERO -->
    <section class="hero">
      <img class="hero__seal" :src="sealUrl" alt="SORA Commons seal" />
      <div class="hero__text">
        <p class="hero__eyebrow">SORTITION-GOVERNED FUNDING</p>
        <h1 class="hero__title">Productive work burns true.</h1>
        <p class="hero__lead">Propose work that matters. Let the community signal support. Decisions made by lot, not by capital — and every fee burns.</p>
      </div>
    </section>

    <section class="kpis">
      <div class="kpi">
        <div class="kpi__n gold"><CountUp :value="kpi.burned" /></div>
        <div class="kpi__l">XOR Burned</div>
      </div>
      <div class="kpi">
        <div class="kpi__n"><CountUp v-if="kpi.citizens !== '—'" :value="kpi.citizens" /><span v-else>—</span></div>
        <div class="kpi__l">Citizens</div>
      </div>
      <div class="kpi">
        <div class="kpi__n affirm"><CountUp :value="kpi.live" /></div>
        <div class="kpi__l">Live Proposals</div>
      </div>
    </section>

    <!-- MY PROPOSALS -->
    <section class="block">
      <div class="block__head">
        <h2>My proposals</h2>
        <a class="more" @click="$emit('nav', 'submit')">Submit another &rarr;</a>
      </div>
      <p class="block__sub">Track your proposals and respond when an action is needed.</p>

      <div class="mine">
        <p v-if="mine.length === 0" class="muted">No proposals yet. Submit one to get started.</p>
        <div v-for="p in mine" :key="p.id" class="pcard">
          <div class="pcard__top">
            <span class="stage-pill" :class="p.actionNeeded ? 'stage-pill--action' : ''">
              {{ p.actionNeeded ? 'Action needed' : p.stageLabel }}
            </span>
            <span class="pcard__xor">{{ p.xor }} XOR</span>
          </div>
          <h3 class="pcard__title">{{ p.title }}</h3>
          <div class="pcard__meta">Stage {{ p.stage }} of 5 · {{ p.note }}</div>
        </div>
      </div>
    </section>

    <!-- CLOSEST TO A DECISION -->
    <section class="block">
      <div class="block__head">
        <h2>Closest to a decision</h2>
        <a class="more" @click="$emit('nav', 'proposals')">All proposals &rarr;</a>
      </div>
      <p class="block__sub">The community's most advanced live proposals.</p>

      <div class="mine">
        <p v-if="topProposals.length === 0" class="muted">No live proposals yet.</p>
        <div v-for="p in topProposals" :key="p.id" class="pcard" @click="$emit('nav', 'proposals')">
          <div class="pcard__top">
            <span class="stage-pill">{{ p.stageLabel }}</span>
            <span class="pcard__xor">{{ p.xorRequested }} XOR</span>
          </div>
          <h3 class="pcard__title">{{ p.title }}</h3>
          <div class="pcard__meta">Stage {{ p.stage }} of 5</div>
        </div>
      </div>
    </section>

    <!-- 5-STAGE STRIP -->
    <section class="block">
      <div class="block__head"><h2>How it works</h2></div>
      <div class="stages">
        <div v-for="(s, i) in stages" :key="i" class="stage">
          <div class="stage__n">{{ i + 1 }}</div>
          <div class="stage__name">{{ s.name }}</div>
          <div class="stage__desc">{{ s.desc }}</div>
        </div>
      </div>
    </section>

    <!-- RECENT BURNS -->
    <section class="block">
      <div class="block__head"><h2>Recent burns</h2></div>
      <div class="ledger">
        <p v-if="burns.length === 0" class="muted" style="padding:14px 16px;margin:0;">No burns recorded yet.</p>
        <div v-for="(b, i) in burns" :key="i" class="ledger__row">
          <span class="ledger__flame">&#9650;</span>
          <span class="ledger__amt">{{ b.amt }} XOR</span>
          <span class="ledger__what">{{ b.what }}</span>
          <span class="ledger__time">{{ b.time }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import sealUrl from "../assets/seal.png";
import { computed } from "vue";
import { useCommonsStore } from "@/stores/commons";
import CountUp from "../components/CountUp.vue";

defineEmits<{ (e: "nav", id: string): void }>();

const commons = useCommonsStore();

const kpi = computed(() => ({
  burned: commons.totalXorBurned ?? "0",
  citizens: commons.citizenCount ?? "0",
  live: commons.liveProposals.length,
}));

const mine = computed(() =>
  commons.proposals
    .filter((p) => p.proposerAccountId === commons.currentAccountId)
    .map((p) => ({
      id: p.id,
      title: p.title,
      stage: commons.stageNumber(p.status),
      stageLabel: commons.statusLabel(p.status),
      xor: p.xorBurned,
      actionNeeded: p.status === "deliberation" && p.revisionCount > 0,
      note:
        p.status === "deliberation" && p.revisionCount > 0
          ? "Revision requested — respond soon"
          : commons.statusLabel(p.status),
    }))
);

const topProposals = computed(() =>
  [...commons.liveProposals]
    .sort((a, b) => commons.stageNumber(b.status) - commons.stageNumber(a.status))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      title: p.title,
      stage: commons.stageNumber(p.status),
      stageLabel: commons.statusLabel(p.status),
      xorRequested: p.xorRequested,
    }))
);

const stages = [
  { name: "Submit", desc: "Post a proposal. 5 XOR burns on submission." },
  { name: "Signal", desc: "Citizens signal support. Needs quorum + 60% Aye." },
  { name: "Deliberate", desc: "Parliament debates. Posting excludes you from the draw." },
  { name: "Sortition", desc: "5 citizens drawn by lot. 3 of 5 approve to fund." },
  { name: "Milestone", desc: "Funds released per milestone. 1% burns on each." },
];

const burns = computed(() => {
  const rows: { amt: string; what: string; time: string }[] = [];
  for (const p of commons.proposals) {
    if (Number(p.xorBurned) > 0) {
      rows.push({ amt: p.xorBurned, what: `Proposal: ${p.title}`, time: commons.formatDate(p.createdAt) });
    }
    for (const m of p.milestones) {
      if (Number(m.xorBurned) > 0) {
        rows.push({ amt: m.xorBurned, what: `Milestone: ${p.title}`, time: m.completedAt ? commons.formatDate(m.completedAt) : "" });
      }
    }
  }
  return rows.reverse();
});
</script>

<style scoped>
.overview { display: flex; flex-direction: column; gap: 34px; }
.muted { color: var(--ink-dim); }
.hero { display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: center; }
.hero__seal { width: clamp(120px, 18vw, 180px); height: auto; display: block; filter: drop-shadow(0 6px 20px rgba(0,0,0,.45)); }
@media (max-width: 720px) {
  .hero { grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 16px; }
  .hero__lead { margin-left: auto; margin-right: auto; }
}
.hero__eyebrow { font-family: var(--mono); font-size: .72rem; letter-spacing: .18em; color: var(--gold-500); margin: 0 0 10px; }
.hero__title { font-family: var(--display); font-size: clamp(2rem, 5vw, 3rem); line-height: 1.05; margin: 0 0 14px; }
.hero__lead { color: var(--ink-dim); max-width: 60ch; font-size: 1.05rem; margin: 0; }

.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.kpi { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 20px; }
.kpi__n { font-family: var(--mono); font-size: 1.9rem; font-weight: 600; }
.kpi__n.gold { color: var(--gold-300); }
.kpi__n.affirm { color: var(--affirm); }
.kpi__l { color: var(--ink-faint); font-size: .82rem; margin-top: 4px; }

.block__head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
.block__head h2 { font-family: var(--display); font-size: 1.4rem; margin: 0; }
.more { color: var(--gold-300); font-size: .88rem; cursor: pointer; }
.block__sub { color: var(--ink-dim); margin: 0 0 16px; font-size: .92rem; }

.mine { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.pcard { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 16px; cursor: pointer; }
.pcard__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.stage-pill { font-size: .72rem; padding: 3px 9px; border-radius: 999px; background: var(--line-soft); color: var(--ink-dim); }
.stage-pill--action { background: rgba(201,168,76,.16); color: var(--gold-300); font-weight: 600; }
.pcard__xor { font-family: var(--mono); font-size: .78rem; color: var(--ink-faint); }
.pcard__title { font-size: 1.02rem; margin: 0 0 6px; }
.pcard__meta { color: var(--ink-faint); font-size: .8rem; }

.stages { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.stage { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 16px; }
.stage__n { width: 26px; height: 26px; border-radius: 50%; background: rgba(201,168,76,.16); color: var(--gold-300); font-family: var(--mono); font-size: .82rem; display: grid; place-items: center; margin-bottom: 10px; }
.stage__name { font-weight: 600; margin-bottom: 4px; }
.stage__desc { color: var(--ink-faint); font-size: .8rem; line-height: 1.4; }

.ledger { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; }
.ledger__row { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: 12px; padding: 13px 16px; border-bottom: 1px solid var(--line-soft); }
.ledger__row:last-child { border-bottom: none; }
.ledger__flame { color: var(--gold-500); }
.ledger__amt { font-family: var(--mono); color: var(--gold-300); font-size: .9rem; }
.ledger__what { color: var(--ink-dim); font-size: .9rem; }
.ledger__time { color: var(--ink-faint); font-size: .78rem; }

@media (max-width: 720px) {
  .kpis { grid-template-columns: 1fr; }
  .stages { grid-template-columns: 1fr 1fr; }
  .ledger__row { grid-template-columns: auto auto 1fr; }
  .ledger__time { display: none; }
}
</style>