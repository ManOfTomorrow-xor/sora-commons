<template>
  <div class="feed">
    <!-- HERO -->
    <header class="hero">
      <p class="hero__ey">THE PUBLIC RECORD OF REAL WORK</p>
      <h1>Follow the work being built on SORA.</h1>
      <p class="hero__motto">Productive work <span class="bt">burns true</span>.</p>
    </header>

    <div class="grid">
      <!-- MAIN COLUMN -->
      <div class="col">
        <!-- mobile top-boosted strip -->
        <div v-if="topBoosted.length" class="tbstrip">
          <div class="tbstrip__h"><Flame :size="13" /> Top Boosted</div>
          <div class="tbstrip__row">
            <button v-for="(p, i) in topBoosted" :key="p.id" class="tbchip" @click="open(p)">
              <span class="tbchip__r">{{ i + 1 }}</span>{{ p.title }}
            </button>
          </div>
        </div>

        <!-- sort -->
        <div class="sort">
          <button v-for="s in sorts" :key="s" :class="{ on: sort === s }" @click="sort = s">{{ s }}</button>
        </div>

        <!-- empty state -->
        <p v-if="visible.length === 0" class="empty">
          No stories yet. Be the first to post your work.
        </p>

        <!-- story cards -->
       <article v-for="p in visible" :key="p.id" class="card" @click="open(p)">
          <div class="card__top">
            <span class="av" :style="avStyle(p.proposerAccountId)">{{ initials(p.proposerAccountId) }}</span>
            <span class="card__who">{{ shortId(p.proposerAccountId) }}</span>
            <span class="card__label" :class="labelClass(p)">{{ commons.proposerLabel(p.proposerAccountId) }}</span>
            <button class="card__save" :class="{ on: commons.isSaved(p.id) }" @click.stop="commons.toggleSave(p.id)" :title="commons.isSaved(p.id) ? 'Saved' : 'Save'">
              <svg viewBox="0 0 24 24" :fill="commons.isSaved(p.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M6 4h12v16l-6-4-6 4z"/></svg>
            </button>
          </div>

          <h3 class="card__title">{{ p.title }}</h3>
          <p class="card__snip">{{ p.description }}</p>

          <div class="badges">
            <span v-if="p.category" class="badge" :class="catBadgeClass(p.category)">{{ catLabel(p.category) }}</span>
            <span class="badge" :class="trackClass(p)">
              <svg v-if="p.track === 'desk'" class="badge__ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/></svg>
             <svg v-else class="badge__ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg>
              {{ trackLabel(p) }}
            </span>
          </div>

          <div class="prog">
            <div class="prog__lab">
              <span v-if="p.status === 'complete'" class="prog__done">✓ Delivered</span>
              <span v-else>{{ chapterText(p) }}</span>
              <span>{{ pct(p) }}%</span>
            </div>
            <div class="prog__bar"><div class="prog__fill" :class="{ 'prog__fill--done': p.status === 'complete' }" :style="{ width: pct(p) + '%' }"></div></div>
          </div>

          <div class="eng">
            <span><svg class="i-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5C12 20.5 3.5 15 3.5 8.8 3.5 6 5.7 4 8.2 4c1.7 0 3 .9 3.8 2.2C12.8 4.9 14.1 4 15.8 4c2.5 0 4.7 2 4.7 4.8C20.5 15 12 20.5 12 20.5z"/></svg>{{ p.likes || 0 }}</span>
            <span class="bolts"><svg class="i-bolt" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>{{ p.boostCount || 0 }}</span>
            <span><svg class="i-cmt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>{{ (p.discussionPosts && p.discussionPosts.length) || 0 }}</span>
            <span class="donated">{{ p.totalDonated || 0 }} XOR donated</span>
          </div>
        </article>
      </div>

      <!-- RIGHT RAIL -->
      <aside class="rail">
        <div v-if="topBoosted.length" class="panel">
          <div class="panel__h"><Flame :size="14" /> Top Boosted</div>
          <button v-for="(p, i) in topBoosted" :key="p.id" class="tbrow" @click="open(p)">
            <span class="tbrow__r">{{ i + 1 }}</span>
            <span class="tbrow__mid">
              <span v-if="p.category" class="tbrow__cat">{{ catLabel(p.category) }}</span>
              <span class="tbrow__t">{{ p.title }}</span>
            </span>
            <span class="tbrow__b"><Flame :size="11" /> {{ p.boostCount || 0 }}</span>
          </button>
        </div>

        <div class="panel">
          <div class="panel__h">The Commons today</div>
          <div class="rstat"><span>Live stories</span><b>{{ commons.liveProposals.length }}</b></div>
          <div class="rstat"><span>XOR burned</span><b>{{ totalBurned }}</b></div>
          <div class="rstat"><span>Proposals</span><b>{{ commons.proposals.length }}</b></div>
        </div>

        <div class="panel">
          <div class="panel__h">Tell your story</div>
          <p class="panel__p">Posting is free. Support flows to you; a small part burns.</p>
          <button class="postcta" @click="$emit('nav', 'post')">Post your work</button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCommonsStore } from "@/stores/commons";
import Flame from "../components/Flame.vue";

const emit = defineEmits<{ (e: "nav", id: string): void }>();
const commons = useCommonsStore();

const sorts = ["Active", "Newest", "Most boosted"] as const;
const sort = ref<(typeof sorts)[number]>("Active");

const visible = computed(() => {
  const list = [...commons.proposals];
  if (sort.value === "Newest") {
    return list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }
  if (sort.value === "Most boosted") {
    return list.sort((a, b) => (b.boostCount || 0) - (a.boostCount || 0));
  }
  return list; // Active = store order (recent activity first)
});

const topBoosted = computed(() =>
  [...commons.proposals]
    .filter((p) => (p.boostCount || 0) > 0)
    .sort((a, b) => (b.boostCount || 0) - (a.boostCount || 0))
    .slice(0, 4)
);

const totalBurned = computed(() => commons.totalXorBurned ?? "0");

function open(p: any) { commons.setActiveProposal?.(p.id); emit("nav", "story"); }
function pct(p: any) {
  const done = p.milestones?.filter((m: any) => m.completed).length || 0;
  const total = p.milestones?.length || 0;
  return total ? Math.round((done / total) * 100) : 0;
}
function chapterText(p: any) {
  const done = p.milestones?.filter((m: any) => m.completed).length || 0;
  const total = p.milestones?.length || 0;
  return total ? `Chapter ${Math.min(done + 1, total)} of ${total}` : "No chapters yet";
}
function catLabel(c: string) {
  return c === "production" ? "Production" : c === "productivity_public_good" ? "Productivity / Public-good" : c;
}
function catBadgeClass(c: string) {
  return c === "production" ? "cat--production" : "cat--publicgood";
}
function trackLabel(p: any) {
  return p.track === "desk" ? "Under Treasury Desk review" : "Seeking donations";
}
function labelClass(p: any) {
  const l = commons.proposerLabel(p.proposerAccountId).toLowerCase();
  return "lbl--" + l;
}
function trackClass(p: any) {
  return p.track === "desk" ? "track--desk" : "track--don";
}
function shortId(id: string) {
  if (!id) return "Unknown";
  return id.length > 16 ? id.slice(0, 8) + "…" + id.slice(-4) : id;
}
function initials(id: string) {
  if (!id) return "?";
  return id.slice(0, 2).toUpperCase();
}
function avStyle(id: string) {
  const colors = ["#C9A84C", "#7E9BE0", "#64DCAA", "#E4C77A", "#A8842F"];
  let h = 0;
  for (let i = 0; i < (id || "").length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return { background: colors[Math.abs(h) % colors.length] };
}
</script>

<style scoped>
.feed { display: flex; flex-direction: column; }
.hero { margin-bottom: 22px; }
.hero__ey { font-family: var(--mono); font-size: .72rem; letter-spacing: .16em; color: var(--gold-500); margin: 0 0 8px; }
.hero h1 { font-family: var(--display); font-size: clamp(1.7rem, 4vw, 2.5rem); font-weight: 800; letter-spacing: -.02em; margin: 0 0 6px; line-height: 1.08; }
.hero__motto { font-family: var(--display); font-size: 1.15rem; font-weight: 600; color: var(--ink-dim); margin: 0; }
.hero__motto .bt { color: var(--gold-300); }

.grid { display: grid; grid-template-columns: minmax(0,1fr) 280px; gap: 24px; align-items: start; }
@media (max-width: 980px) { .grid { grid-template-columns: 1fr; } .rail { display: none; } }

.sort { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.sort button { background: var(--navy-850); border: 1px solid var(--line); border-radius: 999px; padding: 6px 13px; color: var(--ink-dim); font-size: .82rem; cursor: pointer; }
.sort button.on { background: rgba(201,168,76,.12); border-color: var(--gold-600); color: var(--gold-300); }

.empty { color: var(--ink-faint); padding: 48px 0; text-align: center; }

.card { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 18px; margin-bottom: 14px; cursor: pointer; transition: border-color .2s var(--ease), transform .2s var(--ease); }
.card:hover { border-color: var(--gold-600); transform: translateY(-2px); }
.card__top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.av { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #22180a; font-size: .8rem; flex: none; }
.card__who { font-size: .86rem; color: var(--ink); font-weight: 600; }
.card__label { font-family: var(--mono); font-size: .6rem; text-transform: uppercase; letter-spacing: .05em; padding: 3px 8px; border-radius: 999px; }
.card__label.lbl--newcomer { color: var(--info); border: 1px solid rgba(126,155,224,.4); }
.card__label.lbl--proven { color: var(--affirm); border: 1px solid rgba(100,220,170,.4); }
.card__label.lbl--veteran { color: var(--gold-300); border: 1px solid var(--gold-600); }
.card__label.lbl--flagged { color: var(--negate); border: 1px solid rgba(255,100,100,.4); }
.card__save { margin-left: auto; background: none; border: none; color: var(--ink-faint); cursor: pointer; padding: 4px; display: flex; }
.card__save svg { width: 18px; height: 18px; }
.card__save:hover, .card__save.on { color: var(--gold-300); }

.badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.badge__ic { width: 13px; height: 13px; flex: none; }
.badge { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; font-family: var(--mono); padding: 4px 10px; border-radius: 999px; }
.cat--production { background: rgba(168,132,47,.12); color: #D9B871; border: 1px solid rgba(168,132,47,.4); }
.cat--publicgood { background: rgba(100,220,170,.10); color: #8FE0C0; border: 1px solid rgba(100,220,170,.35); }.track--don { background: rgba(201,168,76,.12); color: var(--gold-300); border: 1px solid var(--gold-600); }
.track--desk { background: rgba(126,155,224,.12); color: var(--info); border: 1px solid rgba(126,155,224,.4); }

.i-heart, .i-cmt, .i-bolt { width: 13px; height: 13px; vertical-align: -2px; margin-right: 4px; }
.i-bolt { color: var(--gold-300); }
.eng .i-bolt { color: inherit; }
.card__title { font-family: var(--display); font-size: 1.3rem; font-weight: 700; margin: 0 0 6px; line-height: 1.2; }
.card__snip { color: var(--ink-dim); font-size: .92rem; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.track { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; font-family: var(--mono); padding: 4px 10px; border-radius: 999px; margin-bottom: 14px; }
.track--don { background: rgba(201,168,76,.12); color: var(--gold-300); border: 1px solid var(--gold-600); }
.track--desk { background: rgba(126,155,224,.12); color: var(--info); border: 1px solid rgba(126,155,224,.4); }
.prog { margin-bottom: 14px; }
.prog__lab { display: flex; justify-content: space-between; font-size: .74rem; color: var(--ink-faint); margin-bottom: 5px; }
.prog__bar { height: 5px; background: var(--navy-700); border-radius: 99px; overflow: hidden; }
.prog__fill { height: 100%; background: linear-gradient(90deg, var(--gold-500), var(--gold-300)); border-radius: 99px; }
.prog__fill--done { background: linear-gradient(90deg, var(--affirm), #8FE0C0); }
.prog__done { color: var(--affirm); font-weight: 700; }
.eng { display: flex; align-items: center; gap: 18px; font-size: .82rem; color: var(--ink-faint); }
.eng span { display: inline-flex; align-items: center; gap: 5px; }
.eng .bolts { color: var(--ink-faint); }
.eng .donated { margin-left: auto; font-family: var(--mono); color: var(--gold-300); }

.rail { display: flex; flex-direction: column; gap: 16px; }
.panel { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 16px; }
.panel__h { display: flex; align-items: center; gap: 8px; font-family: var(--display); font-size: 1rem; font-weight: 700; margin-bottom: 12px; }
.panel__p { color: var(--ink-dim); font-size: .86rem; margin: 0 0 12px; }
.postcta { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 11px; font-weight: 700; width: 100%; cursor: pointer; }
.rstat { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid var(--line-soft); font-size: .86rem; color: var(--ink-dim); }
.rstat:last-child { border: none; }
.rstat b { font-family: var(--mono); color: var(--gold-300); }
.tbrow { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 4px; border: none; background: none; border-bottom: 1px solid var(--line-soft); cursor: pointer; text-align: left; }
.tbrow:last-child { border: none; }
.tbrow:hover { background: var(--line-soft); border-radius: var(--r-sm); }
.tbrow__r { font-family: var(--display); font-size: 1.1rem; font-weight: 800; color: var(--gold-500); width: 18px; flex: none; }
.tbrow__mid { flex: 1; min-width: 0; }
.tbrow__cat { display: block; font-family: var(--mono); font-size: .58rem; color: var(--ink-faint); text-transform: uppercase; }
.tbrow__t { display: block; font-family: var(--display); font-size: .92rem; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tbrow__b { color: var(--gold-300); font-size: .78rem; font-family: var(--mono); flex: none; display: inline-flex; align-items: center; gap: 3px; }

.tbstrip { display: none; }
@media (max-width: 980px) {
  .tbstrip { display: block; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 12px; margin-bottom: 16px; }
  .tbstrip__h { display: flex; align-items: center; gap: 6px; font-family: var(--display); font-weight: 700; font-size: .92rem; margin-bottom: 8px; }
  .tbstrip__row { display: flex; gap: 8px; overflow-x: auto; }
  .tbchip { flex: none; display: inline-flex; align-items: center; gap: 6px; background: var(--navy-900); border: 1px solid var(--line); border-radius: 999px; padding: 7px 12px; color: var(--ink-dim); font-size: .8rem; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
  .tbchip__r { color: var(--gold-500); font-weight: 700; }
}
</style>