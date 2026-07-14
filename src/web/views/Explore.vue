<template>
  <div class="explore">
    <h1 class="ex__h">Explore the work</h1>
    <p class="ex__sub">Search and filter every proposal on the Commons.</p>

    <!-- SEARCH -->
    <div class="ex__search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input v-model="query" type="text" placeholder="Search by title, story, or keyword..." />
      <button v-if="query" class="ex__clear" @click="query = ''" title="Clear">×</button>
    </div>

    <!-- FILTERS -->
    <button class="ex__filtoggle" @click="filtersOpen = !filtersOpen">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
      Filters<span v-if="activeFilterCount" class="ex__filcount">{{ activeFilterCount }}</span>
      <span class="ex__filcaret" :class="{ open: filtersOpen }">▾</span>
    </button>
    <Transition name="slidefilters">
    <div class="ex__filters" v-show="filtersOpen">
      <div class="ex__group">
        <span class="ex__lab">Category</span>
        <div class="ex__chips">
          <button v-for="c in categories" :key="c.v" class="chip" :class="{ on: category === c.v }" @click="category = c.v">{{ c.t }}</button>
        </div>
      </div>
      <div class="ex__group">
        <span class="ex__lab">Track</span>
        <div class="ex__chips">
          <button v-for="t in tracks" :key="t.v" class="chip" :class="{ on: track === t.v }" @click="track = t.v">{{ t.t }}</button>
        </div>
      </div>
      <div class="ex__group">
        <span class="ex__lab">Status</span>
        <div class="ex__chips">
          <button class="chip" :class="{ on: status === 'active' }" @click="status = 'active'">Active</button>
          <button class="chip" :class="{ on: status === 'archive' }" @click="status = 'archive'">Delivered</button>
          <button class="chip" :class="{ on: status === 'flagged' }" @click="status = 'flagged'">Flagged</button>
          <button class="chip" :class="{ on: status === 'all' }" @click="status = 'all'">All</button>
        </div>
      </div>
      <div class="ex__group" v-if="commons.currentAccountId">
        <span class="ex__lab">Show</span>
        <div class="ex__chips">
          <button class="chip" :class="{ on: show === 'all' }" @click="show = 'all'">All</button>
          <button class="chip" :class="{ on: show === 'following' }" @click="show = 'following'">Following</button>
          <button class="chip" :class="{ on: show === 'backed' }" @click="show = 'backed'">Backed</button>
        </div>
      </div>
      <div class="ex__group">
        <span class="ex__lab">Funding</span>
        <div class="ex__chips">
          <button class="chip" :class="{ on: funding === 'all' }" @click="funding = 'all'">All</button>
          <button class="chip" :class="{ on: funding === 'goal' }" @click="funding = 'goal'">Goal</button>
          <button class="chip" :class="{ on: funding === 'open' }" @click="funding = 'open'">Open</button>
        </div>
      </div>
      <div class="ex__group ex__group--sort">
        <span class="ex__lab">Sort</span>
        <select v-model="sort" class="ex__select">
          <option>Active</option>
          <option>Newest</option>
          <option>Most boosted</option>
          <option>Most funded</option>
          <option>Most backers</option>
        </select>
      </div>
    </div>
    </Transition>

    <p class="ex__count">{{ results.length }} {{ results.length === 1 ? "proposal" : "proposals" }}</p>

    <!-- RESULTS -->
    <p v-if="commons.proposals.length === 0" class="empty">No proposals yet. Be the first to post your work.</p>
    <p v-else-if="results.length === 0" class="empty">No proposals match your search and filters.</p>

    <TransitionGroup name="card" tag="div" class="ex__cardlist">
    <article v-for="p in results" :key="p.id" class="card" @click="open(p)">
      <div class="card__top">
        <span class="av" :style="avStyle(p.proposerAccountId)">{{ initials(p.proposerAccountId) }}</span>
        <span class="card__who">{{ commons.getDisplayName(p.proposerAccountId) || shortId(p.proposerAccountId) }}</span>
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
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { useCommonsStore } from "@/stores/commons";

const emit = defineEmits<{ (e: "nav", id: string): void }>();
const commons = useCommonsStore();
const sort = ref<"Active" | "Newest" | "Most boosted" | "Most funded" | "Most backers">("Active");
const show = ref<"all" | "following" | "backed">("all");

const query = ref("");
const category = ref("all");
const track = ref("all");
const status = ref<"active" | "archive" | "all" | "flagged">("active");
const funding = ref<"all" | "goal" | "open">("all");
const filtersOpen = ref(false);
const activeFilterCount = computed(() => {
  let n = 0;
  if (category.value !== "all") n++;
  if (track.value !== "all") n++;
  if (status.value !== "active") n++;
  if (show.value !== "all") n++;
  if (funding.value !== "all") n++;
  return n;
});

const categories = [
  { v: "all", t: "All" },
  { v: "production", t: "Production" },
  { v: "productivity_public_good", t: "Productivity / Public-good" },
];
const tracks = [
  { v: "all", t: "All" },
  { v: "donations", t: "Seeking donations" },
  { v: "desk", t: "Treasury Desk" },
];

const results = computed(() => {
  let list = [...commons.proposals];

  // search
  const q = query.value.trim().toLowerCase();
  if (q) {
    list = list.filter((p: any) => {
      const hay = [p.title, p.description, p.story, p.category].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  // category
  if (category.value !== "all") list = list.filter((p: any) => p.category === category.value);

  // track (default donations when unset)
  if (track.value !== "all") list = list.filter((p: any) => (p.track || "donations") === track.value);

if (funding.value !== "all") list = list.filter((p: any) => (p.fundingMode || "open") === funding.value);

// status
  if (status.value === "active") list = list.filter((p: any) => p.status !== "complete");
  else if (status.value === "archive") list = list.filter((p: any) => p.status === "complete");
  else if (status.value === "flagged") list = list.filter((p: any) => commons.proposalChallengeState(p) === "flagged");
  // show (personal — following / backed)
  if (show.value === "following") list = list.filter((p: any) => commons.isFollowing(p.id));
  else if (show.value === "backed") {
    const acct = commons.currentAccountId;
    list = list.filter((p: any) => commons.donatedProposals.includes(acct + "::" + p.id));
  }
  // sort
  if (sort.value === "Newest") list.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  else if (sort.value === "Most boosted") list.sort((a: any, b: any) => (b.boostCount || 0) - (a.boostCount || 0));
  else if (sort.value === "Most funded") list.sort((a: any, b: any) => parseFloat(b.totalDonated || "0") - parseFloat(a.totalDonated || "0"));
  else if (sort.value === "Most backers") list.sort((a: any, b: any) => (b.backers || 0) - (a.backers || 0));
  return list;
});

function open(p: any) { commons.exploreScrollY = window.scrollY; commons.setActiveProposal?.(p.id); emit("nav", "story"); }

onMounted(() => { nextTick(() => requestAnimationFrame(() => window.scrollTo(0, commons.exploreScrollY))); });

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
  return (p.track === "desk") ? "Under Treasury Desk review" : "Seeking donations";
}
function trackClass(p: any) {
  return (p.track === "desk") ? "track--desk" : "track--don";
}
function labelClass(p: any) {
  return "lbl--" + commons.proposerLabel(p.proposerAccountId).toLowerCase();
}
function shortId(id: string) {
  if (!id) return "Unknown";
  return id.length > 16 ? id.slice(0, 8) + "…" + id.slice(-4) : id;
}
function initials(id: string) { return (id || "?").slice(0, 2).toUpperCase(); }
function avStyle(id: string) {
  const colors = ["#C9A84C", "#7E9BE0", "#64DCAA", "#E4C77A", "#A8842F"];
  let h = 0;
  for (let i = 0; i < (id || "").length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return { background: colors[Math.abs(h) % colors.length] };
}
</script>

<style scoped>
.explore { max-width: 720px; margin: 0 auto; }
.ex__h { font-family: var(--display); font-size: 1.9rem; font-weight: 800; margin: 0 0 4px; }
.ex__sub { color: var(--ink-dim); margin: 0 0 22px; }

.ex__search { display: flex; align-items: center; gap: 10px; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 0 14px; margin-bottom: 18px; }
.ex__search svg { width: 18px; height: 18px; color: var(--ink-faint); flex: none; }
.ex__search input { flex: 1; background: none; border: none; outline: none; color: var(--ink); font-family: inherit; font-size: .95rem; padding: 13px 0; }
.ex__clear { background: none; border: none; color: var(--ink-faint); font-size: 1.4rem; cursor: pointer; line-height: 1; padding: 0 4px; }
.ex__clear:hover { color: var(--ink); }

.ex__filters { display: flex; flex-direction: column; gap: 14px; margin-bottom: 18px; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 18px 20px; }
@media (min-width: 721px) { .ex__filters { display: flex !important; } }
.slidefilters-enter-active, .slidefilters-leave-active { transition: opacity .25s var(--ease); }
.slidefilters-enter-from, .slidefilters-leave-to { opacity: 0; }
.ex__group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ex__group--sort { margin-top: 2px; }
.ex__lab { font-family: var(--mono); font-size: .66rem; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-faint); width: 64px; flex: none; }
.chip { background: var(--navy-900); border: 1px solid var(--line); border-radius: 999px; padding: 6px 13px; color: var(--ink-dim); font-size: .82rem; cursor: pointer; transition: all .15s var(--ease); }
.chip:hover { border-color: var(--gold-600); color: var(--ink); }
.chip.on { background: rgba(201,168,76,.14); border-color: var(--gold-600); color: var(--gold-300); }
.ex__select { background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 7px 12px; color: var(--ink); font-family: inherit; font-size: .84rem; cursor: pointer; }

.ex__count { font-family: var(--mono); font-size: .76rem; color: var(--ink-faint); margin: 0 0 14px; }
.empty { color: var(--ink-faint); padding: 48px 0; text-align: center; }

/* card — mirrors Feed.vue */
.card { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 18px; margin-bottom: 14px; cursor: pointer; transition: border-color .2s var(--ease); }
.ex__cardlist { display: block; }
.card-enter-active { transition: opacity .35s var(--ease), transform .35s var(--ease-spring); }
.card-enter-from { opacity: 0; transform: translateY(-16px) scale(.98); }
.card-leave-active { transition: opacity .2s var(--ease); position: absolute; }
.card-leave-to { opacity: 0; }
.card-move { transition: transform .4s var(--ease); }
.card:hover { border-color: var(--gold-600); }
.card__top { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }
.av { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #22180a; font-size: .72rem; flex: none; }
.card__who { font-family: var(--mono); font-size: .82rem; color: var(--ink-dim); }
.card__label { font-family: var(--mono); font-size: .58rem; text-transform: uppercase; letter-spacing: .05em; padding: 2px 8px; border-radius: 999px; }
.card__label.lbl--newcomer { color: var(--info); border: 1px solid rgba(126,155,224,.4); }
.card__label.lbl--proven { color: var(--affirm); border: 1px solid rgba(100,220,170,.4); }
.card__label.lbl--veteran { color: var(--gold-300); border: 1px solid var(--gold-600); }
.card__label.lbl--flagged { color: var(--negate); border: 1px solid rgba(255,100,100,.4); }
.card__save { margin-left: auto; background: none; border: none; color: var(--ink-faint); cursor: pointer; padding: 0; }
.card__save svg { width: 17px; height: 17px; }
.card__save.on { color: var(--gold-300); }
.card__save:hover { color: var(--gold-300); }
.card__title { font-family: var(--display); font-size: 1.3rem; font-weight: 700; margin: 0 0 5px; }
.card__snip { color: var(--ink-dim); font-size: .9rem; margin: 0 0 12px; overflow-wrap: anywhere; }
.badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.badge { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; padding: 4px 11px; border-radius: 999px; }
.badge__ic { width: 13px; height: 13px; flex: none; }
.cat--production { background: rgba(217,138,91,.12); color: #E0986A; border: 1px solid rgba(217,138,91,.4); }
.cat--publicgood { background: rgba(100,220,170,.10); color: #8FE0C0; border: 1px solid rgba(100,220,170,.35); }
.track--don { background: rgba(201,168,76,.12); color: var(--gold-300); border: 1px solid var(--gold-600); }
.track--desk { background: rgba(126,155,224,.12); color: var(--info); border: 1px solid rgba(126,155,224,.4); }
.prog { margin-bottom: 12px; }
.prog__lab { display: flex; justify-content: space-between; font-size: .76rem; color: var(--ink-faint); margin-bottom: 5px; }
.prog__done { color: var(--affirm); font-weight: 700; }
.prog__bar { height: 5px; background: var(--navy-900); border-radius: 99px; overflow: hidden; }
.prog__fill { height: 100%; background: linear-gradient(90deg, var(--gold-500), var(--gold-300)); border-radius: 99px; }
.prog__fill--done { background: linear-gradient(90deg, var(--affirm), #8FE0C0); }
.eng { display: flex; align-items: center; gap: 18px; font-size: .82rem; color: var(--ink-faint); }
.eng span { display: inline-flex; align-items: center; gap: 5px; }
.i-heart, .i-cmt, .i-bolt { width: 13px; height: 13px; vertical-align: -2px; margin-right: 4px; }
.eng .bolts { color: var(--ink-faint); }
.eng .donated { margin-left: auto; font-family: var(--mono); color: var(--gold-300); }
.ex__filtoggle { display: none; }
@media (max-width: 600px) { .ex__lab { width: 100%; } }
@media (max-width: 720px) {
  .ex__filtoggle { display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 12px; color: var(--ink); font-family: inherit; font-size: .9rem; font-weight: 600; cursor: pointer; margin-bottom: 14px; }
  .ex__filcount { background: var(--gold-500); color: #22180a; font-family: var(--mono); font-size: .7rem; font-weight: 800; border-radius: 999px; padding: 1px 7px; }
  .ex__filcaret { margin-left: auto; transition: transform .2s var(--ease); }
  .ex__filcaret.open { transform: rotate(180deg); }
  .ex__h { font-size: 1.5rem; }
  .ex__sub { font-size: .92rem; margin-bottom: 16px; }
  .ex__filters { padding: 14px; gap: 12px; }
  .ex__group { flex-direction: column; align-items: stretch; gap: 8px; }
  .ex__lab { width: 100%; }
  .ex__chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .chip { min-height: 38px; padding: 8px 14px; white-space: normal; max-width: 100%; }
  .ex__select { min-height: 44px; width: 100%; }
.ex__filters { max-width: 640px; margin: 0 auto 18px; }
  .ex__search { max-width: 640px; margin: 0 auto 18px; }
}
@media (max-width: 980px) {
  .explore { max-width: 600px; }
}
</style>
