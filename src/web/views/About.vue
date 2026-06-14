<template>
  <div class="about">
    <!-- HERO -->
    <section class="hero">
      <img class="hero__seal" :src="sealUrl" alt="SORA Commons seal" />
      <div>
        <p class="eyebrow">ABOUT THE COMMONS</p>
        <h1>Productive work burns true.</h1>
        <p class="lead">SORA Commons is a way to fund real work — decided by random lot, not by who holds the most tokens. Every fee burns. Nothing is extracted.</p>
      </div>
    </section>

    <!-- PLAIN LANGUAGE -->
    <section class="block">
      <h2>What this is</h2>
      <p>Most systems for funding work hand the decision to whoever has the most money or the loudest voice. SORA Commons doesn't. Anyone can propose work. The community signals whether it's worth considering. And the binding decision is made by a small panel of citizens chosen at random — by lot, the way a jury is drawn — so the outcome can't be bought.</p>
      <p>When a proposal is submitted, its fee is burned. When milestones are paid, a slice burns too. The burn isn't a tax that someone collects; the XOR is destroyed. That's the meaning of the motto on the seal: work that's real leaves a mark that can't be faked.</p>
    </section>

    <!-- 5 STEPS -->
    <section class="block">
      <h2>How a proposal moves</h2>
      <ol class="steps">
        <li><b>Submit.</b> Anyone posts a proposal with milestones. A 5 XOR fee burns on submission — skin in the game, and the first proof of seriousness.</li>
        <li><b>Signal.</b> The community signals support over a set window. A proposal needs both a quorum and at least 60% in favor to move forward.</li>
        <li><b>Deliberate.</b> Parliament debates the proposal and prepares a brief for the panel. Anyone who weighs in here is excluded from judging it — you can't deliberate and then sit in judgment.</li>
        <li><b>Sortition.</b> Five citizens are drawn at random. Three of five must approve to fund. The panel is fixed when it's drawn; no one chooses who judges.</li>
        <li><b>Milestone escrow.</b> Funds release milestone by milestone as work is confirmed. A small percentage burns at each step.</li>
      </ol>
    </section>

    <!-- THE THINKING BEHIND IT (collapsible) -->
    <section class="block">
      <button class="disclose" :aria-expanded="open" @click="open = !open">
        <span>The thinking behind it</span>
        <span class="chev" :class="{ 'chev--open': open }">▾</span>
      </button>

      <transition name="expand" @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave">
        <div v-show="open" class="deep">
          <div class="deep__inner">
            <h3>One loop, not three slogans</h3>
            <p>The framework underneath the Commons is what we call <b>3Gi — Global Governance, Growth, and intelligence</b>. Governance defines the lawful surface of the system: who can change the rules, and how a change becomes legitimate. Growth defines what the system is for: money created against real production, not speculation. Intelligence is how the system learns whether its rules are actually producing the world it claims to want. They aren't three separate ideas — they're one loop.</p>

            <h3>Why sortition, not voting</h3>
            <p>Elections and token-weighted votes both select for the already-powerful. Whoever has the most reach, or the most coins, wins. Sortition — selection by lot — breaks that. A randomly drawn panel can't be campaigned for or bought in advance, because no one knows who'll be drawn. It's the oldest democratic technology there is, and it's the one mechanism here that capital can't capture.</p>

            <h3>Reputation that can't harden into a caste</h3>
            <p>The Commons keeps a memory: who proposed well, who served on panels, who delivered. But there's a hard line. <b>Reputation may gate access — it never weights a draw or a vote.</b> The moment reliable service buys you more voting power or a better chance of being drawn, you've rebuilt plutocracy, just denominated in tenure instead of tokens. So reputation rewards presence, never punishes absence; it decays over time so no permanent class forms; and it never touches who gets drawn or whose vote counts more.</p>

            <h3>Separation of powers, enforced in the data</h3>
            <p>The people who deliberate on a proposal cannot also judge it. The proposer can't signal for their own proposal or sit on its panel. These aren't UI suggestions — they're enforced at the data level, because the integrity of the whole system rests on no single actor collapsing the loop into themselves.</p>

            <h3>Verify the loop</h3>
            <p>The old world says: trust the institution. The crypto casino says: trust the chart. The technocrat says: trust the model. The Commons says something different — <b>verify the loop.</b> Every decision leaves a record: what was decided, on what evidence, by whom, and what happened after. A system that can be wrong in ways it can inspect, contest, remember, and correct is the only kind worth building.</p>

            <p class="phase-note">This is a testnet preview running on TAIRA. Citizen-bond and role requirements are relaxed here so the full five-stage flow can be walked end to end. On the MINAMOTO mainnet release, full citizenship (a 10,000 XOR bond) and role enforcement apply.</p>
          </div>
        </div>
      </transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import sealUrl from "../assets/seal.png";

const open = ref(false);

// Height-based expand/collapse, reduced-motion safe.
const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
function onEnter(el: Element) {
  const e = el as HTMLElement;
  if (reduce) return;
  e.style.height = "0px";
  void e.offsetHeight;
  e.style.height = e.scrollHeight + "px";
}
function onAfterEnter(el: Element) { (el as HTMLElement).style.height = ""; }
function onLeave(el: Element) {
  const e = el as HTMLElement;
  if (reduce) return;
  e.style.height = e.scrollHeight + "px";
  void e.offsetHeight;
  e.style.height = "0px";
}
</script>

<style scoped>
.about { display: flex; flex-direction: column; gap: 30px; }

.hero { display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: center; }
.hero__seal { width: clamp(110px, 16vw, 160px); height: auto; filter: drop-shadow(0 6px 20px rgba(0,0,0,.45)); }
.eyebrow { font-family: var(--mono); font-size: .72rem; letter-spacing: .18em; color: var(--gold-500); margin: 0 0 10px; }
.hero h1 { font-family: var(--display); font-size: clamp(2rem, 5vw, 3rem); line-height: 1.05; margin: 0 0 12px; }
.lead { color: var(--ink-dim); font-size: 1.05rem; max-width: 60ch; margin: 0; }
@media (max-width: 720px) {
  .hero { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .lead { margin: 0 auto; }
}

.block h2 { font-family: var(--display); font-size: 1.5rem; margin: 0 0 12px; }
.block p { color: var(--ink-dim); line-height: 1.65; margin: 0 0 12px; max-width: 70ch; }
.block p b { color: var(--ink); font-weight: 600; }

.steps { counter-reset: s; list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.steps li { position: relative; padding: 14px 16px 14px 52px; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); color: var(--ink-dim); line-height: 1.55; }
.steps li b { color: var(--ink); }
.steps li::before { counter-increment: s; content: counter(s); position: absolute; left: 14px; top: 14px; width: 26px; height: 26px; border-radius: 50%; background: rgba(201,168,76,.16); color: var(--gold-300); font-family: var(--mono); font-size: .82rem; display: grid; place-items: center; }

.disclose { width: 100%; display: flex; align-items: center; justify-content: space-between; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 16px 18px; color: var(--ink); font-family: var(--display); font-size: 1.25rem; cursor: pointer; }
.disclose:hover { border-color: var(--gold-600); }
.chev { color: var(--gold-300); transition: transform .3s var(--ease); font-size: 1rem; }
.chev--open { transform: rotate(180deg); }

.deep { overflow: hidden; transition: height .35s var(--ease); }
.deep__inner { padding: 18px 4px 4px; }
.deep h3 { font-family: var(--display); font-size: 1.15rem; color: var(--gold-300); margin: 18px 0 8px; }
.deep h3:first-child { margin-top: 4px; }
.phase-note { margin-top: 18px; padding: 14px 16px; background: rgba(126,155,224,.08); border: 1px solid var(--line-soft); border-radius: var(--r); font-size: .9rem; color: var(--ink-faint); }
@media (prefers-reduced-motion: reduce) { .deep { transition: none; } .chev { transition: none; } }
</style>