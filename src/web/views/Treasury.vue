<template>
  <div class="treasury">
    <header class="head">
      <h1>Treasury</h1>
      <p class="sub">Every fee in the Commons burns. Nothing is collected, nothing is extracted.</p>
    </header>

    <!-- HEADLINE BURN -->
    <section class="hero-burn">
      <Flame :size="42" class="flame" />
      <div>
        <div class="hero-burn__n"><CountUp :value="totalBurned" /> <span class="unit">XOR</span></div>
        <div class="hero-burn__l">Total burned to date</div>
      </div>
    </section>

    <!-- BREAKDOWN -->
    <section class="stats">
      <div class="stat">
        <div class="stat__n"><CountUp :value="proposalBurnTotal" /></div>
        <div class="stat__l">From proposal fees</div>
      </div>
      <div class="stat">
        <div class="stat__n"><CountUp :value="milestoneBurnTotal" /></div>
        <div class="stat__l">From milestone burns</div>
      </div>
      <div class="stat">
        <div class="stat__n"><CountUp :value="burns.length" /></div>
        <div class="stat__l">Burn events</div>
      </div>
    </section>

    <!-- LEDGER -->
    <section class="block">
      <h2>Burn ledger</h2>
      <div class="ledger">
        <p v-if="burns.length === 0" class="empty">No burns recorded yet. The first proposal fee will appear here.</p>
        <div v-for="(b, i) in burns" :key="i" class="row">
          <Flame :size="16" class="row__flame" />
          <div class="row__main">
            <div class="row__what">{{ b.what }}</div>
            <div class="row__kind">{{ b.kind }}</div>
          </div>
          <div class="row__right">
            <div class="row__amt">{{ b.amt }} XOR</div>
            <div class="row__time">{{ b.time }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHY -->
    <section class="why">
      <h3>Why burn instead of collect?</h3>
      <p>A fee that someone collects creates an incentive to extract. A fee that burns can't be captured — the XOR is destroyed, and the act of destroying it is the proof that real work was put forward. No treasury skims it, no operator pockets it. That's what the seal means: productive work burns true.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCommonsStore } from "@/stores/commons";
import CountUp from "../components/CountUp.vue";
import Flame from "../components/Flame.vue";


const commons = useCommonsStore();

const totalBurned = computed(() => commons.totalXorBurned ?? "0");

const proposalBurnTotal = computed(() =>
  commons.proposals.reduce((sum, p) => sum + Number(p.xorBurned || 0), 0)
);

const milestoneBurnTotal = computed(() =>
  commons.proposals.reduce(
    (sum, p) => sum + p.milestones.reduce((s, m) => s + Number(m.xorBurned || 0), 0),
    0
  )
);

const burns = computed(() => {
  const rows: { amt: string; what: string; kind: string; time: string }[] = [];
  for (const p of commons.proposals) {
    if (Number(p.xorBurned) > 0) {
      rows.push({ amt: p.xorBurned, what: p.title, kind: "Proposal fee", time: commons.formatDate(p.createdAt) });
    }
    for (const m of p.milestones) {
      if (Number(m.xorBurned) > 0) {
        rows.push({
          amt: m.xorBurned,
          what: `${p.title} — ${m.description}`,
          kind: "Milestone burn",
          time: m.completedAt ? commons.formatDate(m.completedAt) : "",
        });
      }
    }
  }
  return rows.reverse();
});
</script>

<style scoped>
.treasury { display: flex; flex-direction: column; gap: 24px; }
.head h1 { font-family: var(--display); font-size: 2rem; margin: 0 0 4px; }
.sub { color: var(--ink-dim); margin: 0; max-width: 60ch; }

.hero-burn { display: flex; align-items: center; gap: 18px; background:
  radial-gradient(600px 200px at 0% 50%, rgba(201,168,76,.10), transparent 70%), var(--navy-850);
  border: 1px solid var(--line); border-radius: var(--r-lg); padding: 26px 28px; }
.flame { filter: drop-shadow(0 0 14px rgba(201,168,76,.5)); }
.hero-burn__n { font-family: var(--mono); font-size: 2.6rem; font-weight: 600; color: var(--gold-300); line-height: 1; }
.hero-burn__n .unit { font-size: 1.1rem; color: var(--ink-dim); }
.hero-burn__l { color: var(--ink-faint); font-size: .85rem; margin-top: 6px; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.stat { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 18px; }
.stat__n { font-family: var(--mono); font-size: 1.5rem; font-weight: 600; }
.stat__l { color: var(--ink-faint); font-size: .8rem; margin-top: 4px; }

.block h2 { font-family: var(--display); font-size: 1.4rem; margin: 0 0 12px; }
.ledger { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; }
.empty { color: var(--ink-faint); padding: 28px 16px; text-align: center; margin: 0; }
.row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-bottom: 1px solid var(--line-soft); }
.row:last-child { border-bottom: none; }
.row__flame { color: var(--gold-500); }
.row__main { flex: 1; min-width: 0; }
.row__what { color: var(--ink); font-size: .92rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row__kind { color: var(--ink-faint); font-size: .76rem; margin-top: 2px; }
.row__right { text-align: right; }
.row__amt { font-family: var(--mono); color: var(--gold-300); font-size: .9rem; }
.row__time { color: var(--ink-faint); font-size: .74rem; margin-top: 2px; }

.why { background: rgba(126,155,224,.06); border: 1px solid var(--line-soft); border-radius: var(--r); padding: 20px 22px; }
.why h3 { font-family: var(--display); font-size: 1.15rem; margin: 0 0 8px; color: var(--gold-300); }
.why p { color: var(--ink-dim); line-height: 1.6; margin: 0; max-width: 72ch; }

@media (max-width: 720px) {
  .stats { grid-template-columns: 1fr; }
  .hero-burn__n { font-size: 2rem; }
}
</style>