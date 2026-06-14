<template>
  <div class="citizens">
    <header class="head">
      <h1>Citizens</h1>
      <p class="sub">The people who hold the Commons in trust — and who may be drawn, by lot, to judge what it funds.</p>
    </header>

    <!-- COUNT + JOIN -->
    <section class="banner">
      <div class="banner__count">
        <div class="banner__n"><CountUp v-if="citizenCount !== '—'" :value="citizenCount" /><span v-else>—</span></div>
        <div class="banner__l">Citizens enrolled</div>
      </div>
      <div class="banner__cta">
        <p>Citizenship is open during the testnet preview.</p>
        <button class="join" @click="$emit('nav', 'submit')">Become a citizen</button>
      </div>
    </section>

    <!-- NEEDS YOUR ATTENTION -->
    <section class="block">
      <div class="block__head">
        <h2>Needs your attention</h2>
        <a class="more" @click="$emit('nav', 'proposals')">View all proposals &rarr;</a>
      </div>

      <p v-if="drawn.length === 0 && deliberating.length === 0" class="attn-empty">
        Nothing needs your attention right now. When the lot draws you to a panel, or a proposal opens for deliberation, it will appear here.
      </p>

      <div v-else class="attn-list">
        <div v-for="p in drawn" :key="'d' + p.id" class="attn attn--drawn" @click="$emit('nav', 'proposals')">
          <div class="attn__tier">The lot drew you · Sortition</div>
          <div class="attn__title">{{ p.title }}</div>
          <div class="attn__meta">You sit on this five-member panel. Three of five must decide to fund, reject, or return it.</div>
        </div>

        <div v-for="p in deliberating" :key="'b' + p.id" class="attn attn--delib" @click="$emit('nav', 'proposals')">
          <div class="attn__tier">Open for deliberation</div>
          <div class="attn__title">{{ p.title }}</div>
          <div class="attn__meta">You may contribute to the debate — but taking part removes you from this proposal's draw.</div>
        </div>
      </div>
    </section>

    <!-- WHAT IT MEANS -->
    <section class="block">
      <h2>What citizenship means</h2>
      <div class="cards">
        <div class="duty">
          <div class="duty__icon"><Flame :size="22" /></div>
          <h3>The bond</h3>
          <p>Full citizenship is secured by a bond of <b>10,000 XOR</b>. The bond is skin in the game — it makes a citizen accountable to the system they help govern. <span class="note">Relaxed during the testnet preview.</span></p>
        </div>
        <div class="duty">
          <div class="duty__icon">⚖</div>
          <h3>The draw</h3>
          <p>Any citizen may be selected at random to sit on a five-member panel that judges a proposal. You cannot volunteer for it and you cannot buy your way onto it — the lot decides.</p>
        </div>
        <div class="duty">
          <div class="duty__icon">◷</div>
          <h3>The duty</h3>
          <p>When drawn, a citizen weighs the evidence and votes to fund, reject, or send back for revision. Three of five must agree to release funds. Service is the obligation that balances the privilege.</p>
        </div>
      </div>
    </section>

    <!-- COUNCIL -->
    <section class="block">
      <div class="block__head">
        <h2>Current council</h2>
        <span class="tag">Live from chain</span>
      </div>
      <p class="block__sub">The council stewards the rules of the Commons between proposals.</p>
      <div class="council">
        <p class="empty">{{ councilText }}</p>
      </div>
    </section>

    <!-- NO CASTE -->
    <section class="why">
      <h3>No permanent class</h3>
      <p>Citizenship grants a seat in the lottery of judgment — never a louder vote or a better chance of being drawn. Reputation earned through service can open doors, but it can never weight the draw or the ballot. The moment standing buys power, the Commons would harden into the very thing it exists to prevent.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCommonsStore } from "@/stores/commons";
import CountUp from "../components/CountUp.vue";
import Flame from "../components/Flame.vue";

defineEmits<{ (e: "nav", id: string): void }>();

const commons = useCommonsStore();

const citizenCount = computed(() => commons.citizenCount ?? "—");

// Stage 4: proposals where the chain's draw placed this account on the panel.
const drawn = computed(() =>
  commons.proposals.filter(
    (p) => p.status === "sortition" && p.panelMembers.includes(commons.currentAccountId)
  )
);

// Stage 3: proposals currently open for deliberation (any citizen may contribute).
const deliberating = computed(() =>
  commons.proposals.filter((p) => p.status === "deliberation")
);

// Council read is wired in a later step; honest placeholder for now.
const councilText = computed(() => "Council data loads once the governance read is wired.");
</script>

<style scoped>
.citizens { display: flex; flex-direction: column; gap: 26px; }
.head h1 { font-family: var(--display); font-size: 2rem; margin: 0 0 4px; }
.sub { color: var(--ink-dim); margin: 0; max-width: 64ch; }

.banner { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  background: radial-gradient(600px 200px at 0% 50%, rgba(201,168,76,.08), transparent 70%), var(--navy-850);
  border: 1px solid var(--line); border-radius: var(--r-lg); padding: 24px 28px; }
.banner__n { font-family: var(--mono); font-size: 2.4rem; font-weight: 600; color: var(--gold-300); line-height: 1; }
.banner__l { color: var(--ink-faint); font-size: .82rem; margin-top: 6px; }
.banner__cta { text-align: right; }
.banner__cta p { color: var(--ink-dim); font-size: .88rem; margin: 0 0 10px; }
.join { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 10px 18px; font-weight: 600; cursor: pointer; }
.join:hover { filter: brightness(1.06); }

.block h2 { font-family: var(--display); font-size: 1.5rem; margin: 0; }
.block__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
.block__sub { color: var(--ink-dim); margin: 0 0 14px; font-size: .92rem; }
.more { color: var(--gold-300); font-size: .88rem; cursor: pointer; }
.tag { font-family: var(--mono); font-size: .68rem; letter-spacing: .08em; color: var(--affirm); border: 1px solid var(--line-soft); border-radius: 999px; padding: 3px 10px; }

.attn-empty { color: var(--ink-faint); background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 22px 18px; margin: 0; line-height: 1.55; }
.attn-list { display: flex; flex-direction: column; gap: 12px; }
.attn { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 16px 18px; cursor: pointer; border-left: 3px solid var(--line); transition: border-color .2s var(--ease); }
.attn:hover { border-color: var(--gold-600); }
.attn--drawn { border-left-color: var(--gold-500); }
.attn--delib { border-left-color: var(--info); }
.attn__tier { font-family: var(--mono); font-size: .72rem; letter-spacing: .06em; margin-bottom: 6px; }
.attn--drawn .attn__tier { color: var(--gold-300); }
.attn--delib .attn__tier { color: var(--info); }
.attn__title { font-size: 1.05rem; margin-bottom: 4px; }
.attn__meta { color: var(--ink-faint); font-size: .84rem; line-height: 1.5; }

.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 14px; }
.duty { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 20px; }
.duty__icon { font-size: 1.4rem; color: var(--gold-300); margin-bottom: 12px; height: 26px; display: flex; align-items: center; }
.duty h3 { font-family: var(--display); font-size: 1.15rem; margin: 0 0 8px; }
.duty p { color: var(--ink-dim); font-size: .9rem; line-height: 1.55; margin: 0; }
.duty p b { color: var(--gold-300); }
.note { display: block; margin-top: 8px; color: var(--ink-faint); font-size: .82rem; font-style: italic; }

.council { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); }
.empty { color: var(--ink-faint); padding: 26px 16px; text-align: center; margin: 0; }

.why { background: rgba(126,155,224,.06); border: 1px solid var(--line-soft); border-radius: var(--r); padding: 20px 22px; }
.why h3 { font-family: var(--display); font-size: 1.15rem; margin: 0 0 8px; color: var(--gold-300); }
.why p { color: var(--ink-dim); line-height: 1.6; margin: 0; max-width: 72ch; }

@media (max-width: 720px) {
  .cards { grid-template-columns: 1fr; }
  .banner { flex-direction: column; align-items: flex-start; }
  .banner__cta { text-align: left; }
}
</style>