<template>
  <div class="about">
    <!-- HERO -->
    <section class="hero">
      <img class="hero__seal" :src="sealUrl" alt="SORA Commons seal" />
      <div>
        <p class="eyebrow">ABOUT THE COMMONS</p>
        <h1>Productive work burns true.</h1>
        <p class="lead">SORA Commons is a public, permanent record of real work being built on SORA. Every proposal is a story you can follow start to finish — supported directly by the people who believe in it, and held to account in the open.</p>
      </div>
    </section>

    <!-- WHAT THIS IS -->
    <section class="block">
      <h2>What this is</h2>
      <p>Most platforms for funding work hand the decision to whoever has the most money or the loudest voice. The Commons doesn't. Anyone can post the work they're doing as a story, with milestones they'll deliver and the evidence they'll show. People who want it to happen support it directly. The record of what was promised, what was delivered, and what happened after stays public and permanent: once posted, work can't be edited or deleted — so the work, not the marketing, is what speaks.</p>
      <p>When someone supports work with a donation, 99% goes to the builder and 1% is destroyed. The burn isn't a tax that anyone collects; the XOR is gone. That's the meaning of the motto on the seal: work that's real leaves a mark that can't be faked.</p>
    </section>

    <!-- HOW IT WORKS -->
    <section class="block">
      <h2>How it works</h2>

      <div id="burn" class="mech">
        <h3>The 1% burn</h3>
        <p>Supporting work is a donation: <b>99% goes straight to the builder, 1% burns.</b> The burn rides on real support — it only happens when someone chooses to give. Proposers are never charged to post or to deliver. Nothing is collected, nothing is extracted; the destroyed XOR is the proof that real value flowed to real work.</p>
      </div>

      <div id="follow" class="mech">
        <h3>Stories, chapters, and evidence</h3>
        <p>A proposal is a story. Its milestones are chapters. As a builder makes progress, they present the actual evidence a chapter is done — a link, a receipt, a working result — and the record updates in public. You can follow any story, and the cadence of real updates is the clearest signal of whether work is genuinely happening.</p>
      </div>

      <div id="challenge" class="mech">
        <h3>The challenge window</h3>
        <p>When a builder marks a chapter delivered and presents evidence, a short <b>challenge window</b> opens. If no one raises a concern, the chapter becomes <b>Confirmed</b> — not "verified" (silence isn't proof), just unchallenged in the open. If someone does raise a concern, it must come with a written reason, the builder gets to respond, and both sides stay on the permanent record. Because a donation already reached the builder, there's nothing for the Commons to claw back or rule on — so it issues no verdicts. It surfaces concerns, keeps everything transparent, and lets supporters judge for themselves. The real red flag is never a single flag — it's silence.</p>
      </div>

      <div id="boost" class="mech">
        <h3>Boosts: free, but scarce</h3>
        <p>A boost is a free signal of support — but each person gets just <b>three a week</b>. They refresh each week and don't stack up, so you can never hoard them: a boost always costs you something to give. And because they're free and equal, no one can buy their way up the rankings — boosts can't be purchased, ever.</p>
      </div>
    </section>

    <!-- WHAT'S COMING -->
    <section class="block">
      <h2 id="desk">What's coming</h2>
      <p>The Commons launches deliberately, at low stakes, and grows only as the system earns trust through real operation. Some capabilities come later — some the Commons may build, some are wider SORA Nexus initiatives it will connect to as they evolve:</p>
      <ul class="coming">
        <li><b>The Treasury Desk</b> — a <b>SORA Nexus</b> initiative for large-scale funding, not something the Commons builds. As it develops, larger proposals could route to the Desk while the Commons holds the story either way.</li>
        <li><b>Escrow</b> — holding and releasing pooled funds milestone by milestone, with refunds if a goal isn't met. This is a direction the Commons may take later: it raises the stakes considerably, so it belongs to a phase with proper custody, testing, and legal grounding — not the early small-tips layer.</li>
        <li><b>Formal adjudication</b> — only matters once funds are <i>held</i> in escrow, where a decision actually determines whether money is released or refunded. For that rare case, the Commons would look to the wider SORA Nexus ecosystem (including its sortition work) rather than issuing verdicts itself. At the donation layer, where money already reached the builder, none of this applies.</li>
      </ul>
      <p class="soft">These are directions, not promises with dates. The Commons will add them when they're genuinely ready, not on a clock.</p>
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
            <p>The framework underneath the Commons is what we call <b>3Gi — Global Governance, Growth, and Intelligence</b>. Governance defines the lawful surface of the system: who can change the rules, and how a change becomes legitimate. Growth defines what the system is for: money created against real production, not speculation. Intelligence is how the system learns whether its rules are actually producing the world it claims to want. They aren't three separate ideas — they're one loop.</p>

            <h3>Reputation that can't harden into a caste</h3>
            <p>The Commons keeps a memory: who proposed well, who delivered, who went silent. But there's a hard line. <b>Reputation may gate access — it never weights a vote or a draw.</b> The moment a track record buys you more power over others' work, you've rebuilt plutocracy, just denominated in tenure instead of tokens. So reputation rewards presence, never punishes honest failure, and decays over time so no permanent class forms.</p>

            <h3>Separation of powers, enforced in the data</h3>
            <p>No one should be able to collapse the loop into themselves. A proposer can't inflate their own work — they can't like, boost, follow, or donate to their own proposal. The numbers you see reflect what other people actually did. These aren't UI suggestions; they're enforced in the data, because the integrity of the whole system rests on no single actor playing every role at once.</p>

            <h3>On sortition</h3>
            <p>Sortition — decision by random lot — is an initiative within the wider <b>SORA Nexus</b> ecosystem, not something the Commons builds or owns. We find its core logic compelling: a randomly drawn panel can't be campaigned for or bought in advance, because no one knows who'll be drawn. It's the oldest democratic technology there is, and one of the few mechanisms capital can't capture. As SORA's work on sortition evolves, we'll be watching closely to see how — if at all — it might one day fit the Commons. No promises; just an idea from the ecosystem we think is worth paying attention to.</p>

            <h3>Verify the loop</h3>
            <p>The old world says: trust the institution. The crypto casino says: trust the chart. The technocrat says: trust the model. The Commons says something different — <b>verify the loop.</b> Every proposal leaves a record: what was promised, on what evidence, by whom, and what happened after. A system that can be wrong in ways it can inspect, contest, remember, and correct is the only kind worth building.</p>

            <p class="phase-note">This is an early build running on the TAIRA testnet. The core loop — posting work, following stories, supporting with donations, and the challenge window — is what the Commons launches with. Heavier capabilities arrive later: some the Commons may build (like escrow), some are wider SORA Nexus initiatives it will connect to as they evolve (like the Treasury Desk and sortition). Money moves only after the code has been openly reviewed and exhaustively tested.</p>
          </div>
        </div>
      </transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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
.lead { color: var(--ink-dim); font-size: 1.05rem; max-width: 60ch; margin: 0; line-height: 1.6; }
@media (max-width: 720px) {
  .hero { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .about { gap: 22px; }
  .hero__seal { width: 90px; }
  .hero h1 { font-size: 1.7rem; }
  .lead { font-size: .95rem; }
  .block h2 { font-size: 1.25rem; }
  .mech { padding: 14px; }
  .mech h3 { font-size: 1.05rem; }
  .coming li { padding: 12px 14px; }
  .disclose { font-size: 1.05rem; padding: 14px; }
  .deep h3 { font-size: 1.05rem; }
}

.block h2 { font-family: var(--display); font-size: 1.5rem; margin: 0 0 12px; }
.block p { color: var(--ink-dim); line-height: 1.65; margin: 0 0 12px; max-width: 70ch; }
.block p b { color: var(--ink); font-weight: 600; }

.mech { padding: 16px 18px; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); margin-bottom: 12px; scroll-margin-top: 90px; }
.mech h3 { font-family: var(--display); font-size: 1.18rem; color: var(--gold-300); margin: 0 0 8px; }
.mech p { margin: 0; }

.coming { list-style: none; padding: 0; margin: 0 0 12px; display: flex; flex-direction: column; gap: 10px; }
.coming li { padding: 14px 16px; background: rgba(126,155,224,.06); border: 1px solid var(--line-soft); border-radius: var(--r); color: var(--ink-dim); line-height: 1.55; }
.coming li b { color: var(--ink); }
.soft { color: var(--ink-faint); font-size: .92rem; }

.disclose { width: 100%; display: flex; align-items: center; justify-content: space-between; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 16px 18px; color: var(--ink); font-family: var(--display); font-size: 1.25rem; cursor: pointer; }
.disclose:hover { border-color: var(--gold-600); }
.chev { color: var(--gold-300); transition: transform .3s var(--ease); font-size: 1rem; }
.chev--open { transform: rotate(180deg); }

.deep { overflow: hidden; transition: height .35s var(--ease); }
.deep__inner { padding: 18px 4px 4px; }
.deep h3 { font-family: var(--display); font-size: 1.15rem; color: var(--gold-300); margin: 18px 0 8px; }
.deep h3:first-child { margin-top: 4px; }
.deep p { color: var(--ink-dim); line-height: 1.65; margin: 0 0 12px; max-width: 72ch; }
.deep p b { color: var(--ink); font-weight: 600; }
.phase-note { margin-top: 18px; padding: 14px 16px; background: rgba(126,155,224,.08); border: 1px solid var(--line-soft); border-radius: var(--r); font-size: .9rem; color: var(--ink-faint); }
@media (prefers-reduced-motion: reduce) { .deep { transition: none; } .chev { transition: none; } }
</style>
