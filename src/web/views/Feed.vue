<template>
  <div class="feed">
    <!-- HERO -->
    <header class="hero">
      <p class="hero__ey">THE PUBLIC RECORD OF REAL WORK</p>
      <h1>Follow the work being built on SORA.</h1>
      <p class="hero__sub">A public record where builders share what they're making, prove it step by step, and earn direct support.</p>
      <div class="hero__cta">
        <button class="hero__btn" @click="$emit('nav', 'post')">Post your work</button>
        <button class="hero__link" @click="$emit('nav', 'explore')">Explore the work →</button>
      </div>
    </header>

    <div class="grid">
      <!-- MAIN COLUMN -->
      <div class="col">
        <!-- mobile top-boosted strip -->
        <div v-if="topBoosted.length" class="tbstrip">
          <div class="tbstrip__h"><svg class="i-bolt" viewBox="0 0 24 24" fill="currentColor" style="width:13px;height:13px"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg> Top Boosted</div>
          <div class="tbstrip__row">
            <button v-for="(p, i) in topBoosted" :key="p.id" class="tbchip" @click="open(p)">
              <span class="tbchip__r">{{ i + 1 }}</span>
              <span class="tbchip__t">{{ p.title }}</span>
              <span class="tbchip__b"><svg viewBox="0 0 24 24" fill="currentColor" style="width:11px;height:11px"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>{{ p.boostCount || 0 }}</span>
            </button>
          </div>
        </div>

<!-- controls: sorts left, following-tabs right -->
        <div class="feedcontrols">
          <div class="sort">
            <button v-for="s in sorts" :key="s" :class="{ on: sort === s }" @click="sort = s">{{ s }}</button>
          </div>
          <div class="ftabs" v-if="commons.currentAccountId" ref="tabsRef">
            <span class="ftabs__indicator" :style="tabIndicator"></span>
            <button :class="{ on: tab === 'all' }" @click="tab = 'all'">All work</button>
            <button :class="{ on: tab === 'following' }" @click="tab = 'following'">Following</button>
          </div>
        </div>

        <!-- weekly boost allotment indicator -->
        <div class="boostmeter" :class="{ empty: commons.boostsRemaining === 0 }">
          <svg class="i-bolt" viewBox="0 0 24 24" fill="currentColor" style="width:12px;height:12px"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
          <span v-if="commons.boostsRemaining > 0">{{ commons.boostsRemaining }} of {{ boostsPerWeek }} boosts left this week</span>
          <span v-else>No boosts left this week — resets soon</span>
        </div>

        <!-- empty state -->
        <p v-if="visible.length === 0 && tab === 'following'" class="empty">
          You're not following anything yet. Follow proposals or builders to see their work here.
        </p>
        <p v-else-if="visible.length === 0" class="empty">
          No stories yet. Be the first to post your work.
        </p>

        <!-- story cards -->
        <!-- story cards -->
        <button v-if="pendingCount > 0" class="loadmore" @click="revealNew">
          <span class="loadmore__ic">↑</span>
          {{ pendingCount }} new {{ pendingCount === 1 ? 'story' : 'stories' }} — show
        </button>
                <TransitionGroup name="card" tag="div" class="cardlist">
       <article v-for="(p, i) in paged" :key="p.id" class="card" :class="{ 'card--flagged': commons.proposalChallengeState(p) === 'flagged' }" :style="{ '--i': Math.min(i, 12) }" @click="open(p)">
          <div class="card__top">
            <span class="av" :style="commons.getAvatar(p.proposerAccountId) ? {} : avStyle(p.proposerAccountId)">
              <img v-if="commons.getAvatar(p.proposerAccountId)" :src="commons.getAvatar(p.proposerAccountId)" class="av__img" alt="" />
              <template v-else>{{ initials(p.proposerAccountId) }}</template>
            </span>
            <span class="card__who">{{ commons.getDisplayName(p.proposerAccountId) || shortId(p.proposerAccountId) }}</span>
            <span class="card__label" :class="labelClass(p)">{{ commons.proposerLabel(p.proposerAccountId) }}</span>
            <button class="card__save" :class="{ on: commons.isSaved(p.id) }" @click.stop="commons.toggleSave(p.id)" :title="commons.isSaved(p.id) ? 'Saved' : 'Save'">
              <svg viewBox="0 0 24 24" :fill="commons.isSaved(p.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M6 4h12v16l-6-4-6 4z"/></svg>
            </button>
          </div>

          <h3 class="card__title">
            {{ p.title }}
            <span v-if="commons.proposalChallengeState(p) === 'flagged'" class="card__flag">⚑ Flagged</span>
          </h3>
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
            <button class="engbtn" :class="{ on: commons.isLiked(p.id) }" :disabled="isOwn(p)" @click.stop="onLike(p.id)"><svg class="i-heart" :class="{ pulse: likePulse === p.id }" viewBox="0 0 24 24" :fill="commons.isLiked(p.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5C12 20.5 3.5 15 3.5 8.8 3.5 6 5.7 4 8.2 4c1.7 0 3 .9 3.8 2.2C12.8 4.9 14.1 4 15.8 4c2.5 0 4.7 2 4.7 4.8C20.5 15 12 20.5 12 20.5z"/></svg>{{ p.likes || 0 }}</button>
            <button class="engbtn bolts" :class="{ on: commons.isBoosted(p.id) }" :disabled="isOwn(p)" @click.stop="onBoost(p.id)"><svg class="i-bolt" :class="{ zapping: boostPulse === p.id }" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>{{ p.boostCount || 0 }}</button>
            <button class="engbtn" @click.stop="openComments(p)"><svg class="i-cmt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>{{ (p.discussionPosts && p.discussionPosts.length) || 0 }}</button>
            <span class="donated"><template v-if="p.fundingMode === 'open'">{{ p.totalDonated || 0 }} XOR raised</template><template v-else>{{ p.totalDonated || 0 }} / {{ p.xorRequested || 0 }} XOR raised</template></span>
          </div>
          </article>
          </TransitionGroup>
        <div v-if="hasMore" class="loadmore-wrap">
          <span class="loadmore-count">Showing {{ paged.length }} of {{ visible.length }}</span>
          <button class="loadmore-btn" @click="loadMore">Load more stories</button>
        </div>
      </div>

<!-- RIGHT RAIL -->
      <aside class="rail">
        <div v-if="topBoosted.length" class="panel">
          <div class="panel__h"><svg class="i-bolt" viewBox="0 0 24 24" fill="currentColor" style="width:15px;height:15px"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg> Top Boosted</div>
          <button v-for="(p, i) in topBoosted" :key="p.id" class="tbrow" @click="open(p)">
            <span class="tbrow__r">{{ i + 1 }}</span>
            <span class="tbrow__mid">
              <span v-if="p.category" class="tbrow__cat">{{ catLabel(p.category) }}</span>
              <span class="tbrow__t">{{ p.title }}</span>
            </span>
            <span class="tbrow__b"><svg class="i-bolt" viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>{{ p.boostCount || 0 }}</span>
          </button>
        </div>

        <!-- Commons today stats -->
        <div class="panel">
          <div class="panel__h">The Commons today</div>
          <div class="rstat"><span>Proposals</span><b>{{ commons.proposals.length }}</b></div>
          <div class="rstat"><span>XOR burned</span><b>{{ totalBurned }}</b></div>
          <div class="rstat"><span>XOR raised</span><b>{{ totalRaised }}</b></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useCommonsStore } from "@/stores/commons";
import { COMMONS_CONFIG } from "@/constants/commonsConfig";
const boostsPerWeek = COMMONS_CONFIG.BOOSTS_PER_WEEK;

const emit = defineEmits<{ (e: "nav", id: string): void }>();
const commons = useCommonsStore();

const sorts = ["Active", "Newest", "Most boosted"] as const;
const sort = ref<(typeof sorts)[number]>("Active");
const tab = ref<"all" | "following">("all");
const tabsRef = ref<HTMLElement | null>(null);
const tabIndicator = ref({ left: '0px', width: '0px', opacity: '0' });
function moveTabIndicator() {
  const el = tabsRef.value;
  if (!el) return;
  const activeBtn = el.querySelector('button.on') as HTMLElement | null;
  if (!activeBtn) { tabIndicator.value = { ...tabIndicator.value, opacity: '0' }; return; }
  tabIndicator.value = { left: activeBtn.offsetLeft + 'px', width: activeBtn.offsetWidth + 'px', opacity: '1' };
}
function scheduleTabMove() { nextTick(() => requestAnimationFrame(moveTabIndicator)); }
watch(tab, scheduleTabMove);
onMounted(() => { scheduleTabMove(); if (document.fonts?.ready) document.fonts.ready.then(scheduleTabMove); });
onMounted(() => { nextTick(() => requestAnimationFrame(() => window.scrollTo(0, commons.feedScrollY))); });
// snapshot lives in the store (survives Feed's mount/unmount on nav)
// pending = loaded but not yet revealed, EXCLUDING your own posts (those show instantly)
const pending = computed(() =>
  commons.proposals.filter((p: any) =>
    !commons.feedShownIds.has(p.id) && p.proposerAccountId !== commons.currentAccountId
  )
);

const pendingCount = computed(() => commons.feedInitialized ? pending.value.length : 0);

function revealNew() { commons.revealFeedPending(); }

const visible = computed(() => {
  // show only revealed cards + always your own posts (instant, no pill for your work)
  let list = commons.proposals.filter((p: any) =>
    commons.feedShownIds.has(p.id) || p.proposerAccountId === commons.currentAccountId
  );
  if (tab.value === "following" && commons.currentAccountId) {
    list = list.filter((p: any) =>
      (commons.followedProposals || []).includes(p.id) ||
      (commons.followedAccounts || []).includes(p.proposerAccountId)
    );
  }
  if (sort.value === "Newest") {
    return list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }
  if (sort.value === "Most boosted") {
    return list.sort((a, b) => (b.boostCount || 0) - (a.boostCount || 0));
  }
  return list; // Active = store order
});
const PAGE_SIZE = 10;
const paged = computed(() => visible.value.slice(0, commons.feedShownCount));
const hasMore = computed(() => visible.value.length > commons.feedShownCount);
function loadMore() { commons.feedShownCount += PAGE_SIZE; }

watch(sort, () => { commons.feedShownCount = PAGE_SIZE; });
watch(tab, () => { commons.feedShownCount = PAGE_SIZE; });

const topBoosted = computed(() =>
  [...commons.proposals]
    .filter((p) => (p.boostCount || 0) > 0)
    .sort((a, b) => (b.boostCount || 0) - (a.boostCount || 0))
    .slice(0, 4)
);

const totalBurned = computed(() => commons.totalXorBurned ?? "0");
const totalRaised = computed(() =>
  commons.proposals.reduce((s: number, p: any) => s + Number(p.totalDonated || 0), 0)
);
const likePulse = ref<string | null>(null);
const boostPulse = ref<string | null>(null);

function onLike(id: string) {
  const wasLiked = commons.isLiked(id);
  commons.toggleLike(id);
  if (!wasLiked) {   // only animate on the positive action (liking, not un-liking)
    likePulse.value = id;
    setTimeout(() => { if (likePulse.value === id) likePulse.value = null; }, 400);
  }
}
function onBoost(id: string) {
  const wasBoosted = commons.isBoosted(id);
  commons.toggleBoost(id);
  if (!wasBoosted) {
    boostPulse.value = id;
    setTimeout(() => { if (boostPulse.value === id) boostPulse.value = null; }, 500);
  }
}

function open(p: any) { commons.feedScrollY = window.scrollY; commons.setActiveProposal?.(p.id); emit("nav", "story"); }
function pct(p: any) {
  const done = p.milestones?.filter((m: any) => m.completed).length || 0;
  const total = p.milestones?.length || 0;
  return total ? Math.round((done / total) * 100) : 0;
}
function openComments(p: any) {
  commons.feedScrollY = window.scrollY;
  commons.setActiveProposal?.(p.id);
  commons.setScrollToComments(true);
  emit("nav", "story");
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
function isOwn(p: any) { 
  return p.proposerAccountId === commons.currentAccountId; }

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
.hero__sub { font-size: 1.02rem; color: var(--ink-dim); line-height: 1.55; margin: 8px 0 18px; max-width: 56ch; }
.hero__cta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.hero__btn { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 11px 20px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 12px rgba(201,168,76,.22); transition: transform .15s var(--ease), box-shadow .15s var(--ease), filter .15s var(--ease); }
.hero__btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,168,76,.34); filter: brightness(1.06); }
.hero__link { background: none; border: none; color: var(--gold-300); font-family: inherit; font-size: .95rem; font-weight: 600; cursor: pointer; padding: 6px 4px; }
.hero__link:hover { text-decoration: underline; }

.grid { display: grid; grid-template-columns: minmax(0,1fr) 280px; gap: 24px; align-items: start; }
@media (max-width: 980px) { .grid { grid-template-columns: 1fr; }}
.sort { display: flex; gap: 6px; flex-wrap: wrap; }
.sort button { background: var(--navy-850); border: 1px solid var(--line); border-radius: 999px; padding: 6px 13px; color: var(--ink-dim); font-size: .82rem; cursor: pointer; }
.sort button.on { background: rgba(201,168,76,.12); border-color: var(--gold-600); color: var(--gold-300); }

.empty { color: var(--ink-faint); padding: 48px 0; text-align: center; }
.i-heart.pulse { animation: pop var(--dur) var(--ease-spring) both; transform-origin: center; }
.i-bolt.zapping { animation: zap var(--dur) var(--ease-spring) both; transform-origin: center; }
.card { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 18px; margin-bottom: 14px; cursor: pointer; transition: border-color .2s var(--ease), transform .2s var(--ease); }
.card:hover { border-color: var(--gold-600); transform: translateY(-2px); }
.card__top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.av { position: relative; overflow: hidden; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #22180a; font-size: .8rem; flex: none; }
.av__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.card__who { font-size: .86rem; color: var(--ink); font-weight: 600; }
.card__label { font-family: var(--mono); font-size: .6rem; text-transform: uppercase; letter-spacing: .05em; padding: 3px 8px; border-radius: 999px; }
.card__label.lbl--newcomer { color: var(--info); border: 1px solid rgba(126,155,224,.4); }
.card__label.lbl--proven { color: var(--affirm); border: 1px solid rgba(100,220,170,.4); }
.card__label.lbl--veteran { color: var(--gold-300); border: 1px solid var(--gold-600); }
.card__label.lbl--flagged { color: var(--negate); border: 1px solid rgba(255,100,100,.4); }
.card__save { margin-left: auto; background: none; border: none; color: var(--ink-faint); cursor: pointer; padding: 4px; display: flex; }
.card__save svg { width: 18px; height: 18px; }
.card__save:hover, .card__save.on { color: var(--gold-300); }
.cardlist { display: block; }
.card-enter-active { transition: opacity .4s var(--ease), transform .4s var(--ease-spring); transition-delay: calc(var(--i, 0) * 40ms); }
.card-enter-from { opacity: 0; transform: translateY(-16px) scale(0.97); }
.card-leave-active { transition: opacity .25s var(--ease); }
.card-leave-to { opacity: 0; }
.card-move { transition: transform .45s var(--ease); }
.card--flagged { border-left: 4px solid var(--negate); padding-left: calc(var(--card-pad, 18px) - 4px); }
.card__flag { display: inline-flex; align-items: center; gap: 3px; font-size: .66rem; font-weight: 700; font-family: var(--mono); color: var(--negate); background: rgba(139,30,45,.12); border: 1px solid rgba(139,30,45,.3); border-radius: 999px; padding: 2px 8px; margin-left: 8px; vertical-align: middle; letter-spacing: .02em; }
.loadmore { display: flex; width: fit-content; align-items: center; gap: 8px; margin: 0 auto 18px; background: rgba(201,168,76,.12); color: var(--gold-300); border: 1px solid var(--gold-600); border-radius: 999px; padding: 9px 20px; font-family: var(--body); font-weight: 600; font-size: .84rem; letter-spacing: .01em; cursor: pointer; backdrop-filter: blur(8px); box-shadow: 0 4px 20px rgba(201,168,76,.15); animation: loadmore-in var(--dur) var(--ease-spring) both; transition: transform var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease); }
.loadmore:hover { background: rgba(201,168,76,.2); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(201,168,76,.28); }
.loadmore__ic { font-size: .95rem; animation: bob 1.6s var(--ease) infinite; }
.loadmore-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; margin: 20px 0 8px; }
.loadmore-count { font-size: .76rem; color: var(--ink-faint); font-family: var(--mono); }
.loadmore-btn { background: var(--navy-850); border: 1px solid var(--line); color: var(--ink-dim); border-radius: 999px; padding: 10px 24px; font-family: var(--body); font-weight: 600; font-size: .86rem; cursor: pointer; transition: border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease); }
.loadmore-btn:hover { border-color: var(--gold-600); color: var(--gold-300); background: var(--navy-800); }
.ftabs { display: inline-flex; gap: 4px; background: var(--navy-850); border: 1px solid var(--line); border-radius: 999px; padding: 4px; position: relative; }
.ftabs button { background: none; border: none; color: var(--ink-dim); padding: 6px 16px; border-radius: 999px; font-family: var(--body); font-weight: 600; font-size: .85rem; cursor: pointer; transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease); }
.ftabs button.on { color: #22180a; }
.ftabs button:hover:not(.on) { color: var(--ink); }
.feedcontrols { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.ftabs button { position: relative; z-index: 1; }
.ftabs__indicator { position: absolute; top: 4px; bottom: 4px; height: auto; background: var(--gold-600); border-radius: 999px; transition: left 0.28s var(--ease), width 0.28s var(--ease), opacity 0.2s var(--ease); pointer-events: none; z-index: 0; }
@keyframes loadmore-in { from { opacity: 0; transform: translateY(-10px) scale(.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes pop { 0% { transform:scale(1); } 30% { transform:scale(1.5); filter: drop-shadow(0 0 6px currentColor); } 60% { transform:scale(0.92); } 100% { transform:scale(1); } }
@keyframes zap { 0% { transform:scale(1) rotate(0); } 25% { transform:scale(1.55) rotate(-15deg); filter: drop-shadow(0 0 8px var(--gold-300)); } 55% { transform:scale(1.2) rotate(10deg); } 100% { transform:scale(1) rotate(0); } }

.badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.badge__ic { width: 13px; height: 13px; flex: none; }
.badge { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; font-family: var(--mono); padding: 4px 10px; border-radius: 999px; }
.cat--production { background: rgba(217,138,91,.12); color: #E0986A; border: 1px solid rgba(217,138,91,.4); }
.cat--publicgood { background: rgba(100,220,170,.10); color: #8FE0C0; border: 1px solid rgba(100,220,170,.35); }.track--don { background: rgba(201,168,76,.12); color: var(--gold-300); border: 1px solid var(--gold-600); }
.track--desk { background: rgba(126,155,224,.12); color: var(--info); border: 1px solid rgba(126,155,224,.4); }
.fund--goal { background: rgba(201,168,76,.12); color: var(--gold-300); border: 1px solid var(--gold-600); }
.fund--open { background: rgba(126,155,224,.10); color: var(--info); border: 1px solid rgba(126,155,224,.35); }

.i-heart, .i-cmt, .i-bolt { width: 13px; height: 13px; vertical-align: -2px; margin-right: 4px; }
.i-bolt { color: var(--gold-300); }
.i-heart.pulse { animation: pop var(--dur-slow) var(--ease-spring) both; transform-origin: center; }
.i-bolt.zapping { animation: zap var(--dur-slow) var(--ease-spring) both; transform-origin: center; }
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
.eng .bolts { color: var(--ink-faint); }
.engbtn:disabled { opacity: .4; cursor: not-allowed; }
.engbtn:disabled:hover { background: rgba(255,255,255,.03); border-color: var(--line-soft); color: inherit; }
.engbtn { background: rgba(255,255,255,.03); border: 1px solid var(--line-soft); border-radius: 999px; padding: 4px 10px; font: inherit; color: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: background .15s var(--ease), border-color .15s var(--ease), color .15s var(--ease); }
.engbtn:hover { background: rgba(201,168,76,.12); border-color: var(--gold-600); color: var(--ink); }
.engbtn.on { background: rgba(201,168,76,.14); border-color: var(--gold-600); color: var(--gold-300); }
@media (hover: none) { .engbtn { background: rgba(255,255,255,.05); border-color: var(--line); } }
@media (max-width: 720px) {
  .hero__cta { display: none; }
  .engbtn { min-height: 44px; padding: 8px 12px; }
  .sort button { min-height: 44px; padding: 8px 16px; }
}
 .boostmeter { display: inline-flex; align-items: center; gap: 6px; font-size: .78rem; color: var(--ink-dim);
  background: var(--navy-900); border: 1px solid var(--line-soft); border-radius: var(--r-sm); padding: 6px 12px; margin: 0 0 14px; }
.boostmeter .i-bolt { color: var(--gold-300); }
.boostmeter.empty { color: var(--gold-300); border-color: var(--gold-700, #7a5c1a); }

.rail { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 140px; align-self: start; }
@media (max-width: 980px) { .rail { display: none; } }
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
.tbrow__b { display: inline-flex; align-items: center; gap: 3px; font-size: .82rem; font-weight: 600; color: var(--gold-300); flex: none; }

.tbstrip { display: none; }
@media (max-width: 980px) {
  .tbstrip { display: block; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 12px; margin-bottom: 16px; }
  .tbstrip__h { display: flex; align-items: center; gap: 6px; font-family: var(--display); font-weight: 700; font-size: .92rem; margin-bottom: 8px; }
  .tbstrip__row { display: flex; flex-direction: column; gap: 2px; max-height: 138px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
  .tbstrip__row::-webkit-scrollbar { display: none; }
  .tbchip { width: 100%; display: flex; align-items: center; gap: 10px; background: none; border: none; border-bottom: 1px solid var(--line-soft); border-radius: 0; padding: 9px 2px; color: var(--ink-dim); font-size: .86rem; text-align: left; cursor: pointer; }
  .tbchip:last-child { border-bottom: none; }
  .tbchip:hover { background: var(--line-soft); border-radius: var(--r-sm); }
  .tbchip__r { color: var(--gold-500); font-weight: 800; font-family: var(--display); flex: none; width: 16px; }
  .tbchip__t { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ink); }
  .tbchip__b { flex: none; display: inline-flex; align-items: center; gap: 3px; color: var(--gold-300); font-family: var(--mono); font-size: .78rem; }
}

@media (max-width: 720px) {
  .card { padding: 14px; margin-bottom: 10px; }
  .card__title { font-size: 1.12rem; }
  .card__snip { font-size: .88rem; margin-bottom: 10px; }
  .av { width: 30px; height: 30px; }
  .badges { margin-bottom: 10px; }
  .prog { margin-bottom: 10px; }
  .eng { flex-wrap: wrap; gap: 10px 14px; }
   .eng { flex-wrap: wrap; gap: 10px 14px; }
}


</style>