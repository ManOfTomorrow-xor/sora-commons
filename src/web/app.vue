<template>
  <div class="app">
    <!-- TOP BAR -->
    <header class="topbar" :class="{ 'nav-hidden': navHidden }">
    <div v-if="isTestVersion" class="testbar">
      <span class="testbar__dot"></span>
      Test version — identities and donations are simulated. No real XOR moves.
    </div>
      <div class="topbar__inner">
        <a class="brand" @click="goHome">
          <img class="brand__seal" :src="sealUrl" alt="SORA Commons seal" />
          <span class="brand__name">SORA <b>Commons</b></span>
        </a>
        <transition name="boostbanner">
        <div v-if="boostBanner" class="boost-banner" role="status">
        <svg class="i-bolt" viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
        <span>You've used all {{ boostsPerWeek }} boosts this week. Your allotment resets soon.</span>
      </div>
    </transition>
       <nav class="nav" ref="navRef">
          <span class="nav__indicator" :style="indicatorStyle"></span>
          <a v-for="t in tabs" :key="t.id" :class="{ active: active === t.id }" @click="go(t.id)">{{ t.label }}</a>
          <button class="nav-post btn-gold" :class="{ active: active === 'post' }" @click="go('post')">Post</button>
        </nav>
        <span class="spacer"></span>
        <select v-if="showDevTools" class="demoswitch" :value="commons.demoAccountId" @change="onDemoSwitch" title="Demo: switch identity (dev only)">
          <option v-for="a in demoAccounts" :key="a" :value="a">{{ a.split('.')[0] }}</option>
        </select>
        <div class="netchip" title="Connected to Taira testnet"><span class="dot"></span><span class="netchip__lbl">TAIRA</span></div>
        <button class="topsearch" @click="go('search')" title="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <div class="bell" v-if="commons.currentAccountId" ref="bellEl">
          <button class="bell__btn" @click="toggleNotifs" title="Notifications">
            <svg class="bell__ring bell__ring--l" :class="{ ringing: bellShake }" viewBox="0 0 12 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6 Q3 12 8 18"/><path d="M11 3 Q4 12 11 21" opacity="0.5"/></svg>
            <svg :class="{ shake: bellShake }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <svg class="bell__ring bell__ring--r" :class="{ ringing: bellShake }" viewBox="0 0 12 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6 Q9 12 4 18"/><path d="M1 3 Q8 12 1 21" opacity="0.5"/></svg>
            <span v-if="commons.unreadCount > 0" class="bell__badge">{{ commons.unreadCount > 9 ? '9+' : commons.unreadCount }}</span>
          </button>
          <Transition name="notifs-pop">
          <div v-if="notifsOpen" class="notifs">
            <div class="notifs__h">Notifications<button class="notifs__x" @click="toggleNotifs">✕</button></div>
            <div v-if="commons.notifications.length === 0" class="notifs__empty">No notifications yet.</div>
            <button v-for="n in commons.notifications" :key="n.id" class="notif" :class="{ 'notif--unread': !n.read }" @click="openNotif(n)">
              <span class="notif__av" :style="commons.getAvatar(n.actor_account_id) ? {} : avStyle(n.actor_account_id)">
                <img v-if="commons.getAvatar(n.actor_account_id)" :src="commons.getAvatar(n.actor_account_id)" class="notif__avimg" alt="" />
                <template v-else>{{ initials(n.actor_account_id) }}</template>
                <span class="notif__badge" :class="'nb--' + n.type">{{ notifIcon(n.type) }}</span>
              </span>
              <span class="notif__body">
                <span class="notif__txt">{{ notifText(n) }}</span>
                <span class="notif__time">{{ notifTime(n.created_at) }}</span>
              </span>
              <span v-if="!n.read" class="notif__dot"></span>
            </button>
          </div>
          </Transition>
        </div>
        <button class="meav" :style="commons.getAvatar(myId) ? {} : avStyle(myId)" @click="goMyProfile" title="Your profile">
          <img v-if="commons.getAvatar(myId)" :src="commons.getAvatar(myId)" class="meav__img" alt="" />
          <template v-else>{{ initials(myId) }}</template>
        </button>

      </div>
    </header>

      <main class="wrap">
      <Transition name="view" mode="out-in">
        <div :key="active" class="view-slot">
          <Feed v-if="active === 'feed'" @nav="go" />
          <Story v-else-if="active === 'story'" @nav="go" />
          <Compose v-else-if="active === 'post'" @nav="go" />
          <Profile v-else-if="active === 'profile'" @nav="go" />
          <About v-else-if="active === 'about'" />
          <Treasury v-else-if="active === 'treasury'" />
          <Explore v-else-if="active === 'explore'" @nav="go" />
          <Search v-else-if="active === 'search'" @nav="go" />
          <div v-else>
            <h1 class="page-title">{{ tabs.find(t => t.id === active)?.label }}</h1>
            <p class="muted">This page is coming next.</p>
          </div>
        </div>
      </Transition>
    </main>

    <!-- MOBILE BOTTOM TAB BAR -->
    <nav class="tabbar" :class="{ 'nav-hidden': navHidden, 'tabbar--composing': active === 'post' }">
      <a v-for="t in mobileTabs" :key="t.id" class="tab" :class="{ active: active === t.id, 'tab-fab': t.id === 'post' }" @click="tabTap(t.id)">
        <span v-if="t.id === 'post'" class="fabc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
        <span v-else class="tab__ic" v-html="t.icon"></span>
        <span class="tab__lbl">{{ t.label }}</span>
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import Story from "./views/Story.vue";
import Explore from "./views/Explore.vue";
import Feed from "./views/Feed.vue";
import Search from "./views/Search.vue";
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useCommonsStore } from "@/stores/commons";
import { COMMONS_CONFIG } from "@/constants/commonsConfig";
const commons = useCommonsStore();
const navRef = ref<HTMLElement | null>(null);
const indicatorStyle = ref({ left: '0px', width: '0px', opacity: '0' });

function moveNavIndicator() {
  const nav = navRef.value;
  if (!nav) { return; }
  const activeEl = nav.querySelector('a.active') as HTMLElement | null;
  if (!activeEl) { indicatorStyle.value = { ...indicatorStyle.value, opacity: '0' }; return; }
  indicatorStyle.value = {
    left: activeEl.offsetLeft + 'px',
    width: activeEl.offsetWidth + 'px',
    opacity: '1',
  };
}

const boostsPerWeek = COMMONS_CONFIG.BOOSTS_PER_WEEK;
const isTestVersion = COMMONS_CONFIG.IS_TEST_VERSION;
import sealUrl from "./assets/seal.png";
import About from "./views/About.vue";
import Treasury from "./views/Treasury.vue";
import Compose from "./views/Compose.vue";
import Profile from "./views/Profile.vue";

const boostBanner = ref(false);
let boostBannerTimer: ReturnType<typeof setTimeout> | null = null;
watch(() => commons.boostBlockedTick, () => {
  boostBanner.value = true;
  if (boostBannerTimer) clearTimeout(boostBannerTimer);
  boostBannerTimer = setTimeout(() => { boostBanner.value = false; }, 3200);
});

const active = ref("feed");
function scheduleMove() { nextTick(() => requestAnimationFrame(moveNavIndicator)); }
watch(active, scheduleMove);
onMounted(() => {
  scheduleMove();
  if (document.fonts?.ready) document.fonts.ready.then(scheduleMove);
});
const navHidden = ref(false);
let lastY = 0;
let resetFeedScroll = false;
const go = (id: string) => {
  const [view, anchor] = id.split("#");
  const sameView = view === active.value && !anchor;   // clicked the tab you're already on
  // save the OUTGOING view's scroll before we leave (skip on same-view or reset)
  if (!sameView && !resetFeedScroll && active.value === 'feed') commons.feedScrollY = window.scrollY;
  else if (!sameView && active.value === 'explore') commons.exploreScrollY = window.scrollY;
  resetFeedScroll = false;
  active.value = view;
  navHidden.value = false;
  lastY = 0;
  if (anchor) {
    nextTick(() => requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" })));
  } else if (sameView) {
    // clicked the current tab → zip to top; clear saved pos so feed/explore restore doesn't fight it
    if (view === 'feed') commons.feedScrollY = 0;
    else if (view === 'explore') commons.exploreScrollY = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
function goHome() { resetFeedScroll = true; commons.feedScrollY = 0; commons.feedShownCount = 10; go('feed'); }


function tabTap(id: string) {
  if (navHidden.value) { navHidden.value = false; lastY = window.scrollY || 0; return; }
  go(id);
}
function onScroll() {
  const y = window.scrollY || 0;
  if (y < 12) { navHidden.value = false; lastY = y; return; }
  if (Math.abs(y - lastY) < 6) return;
  navHidden.value = y > lastY;
  lastY = y;
}
onMounted(async () => {
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("click", onDocClick);
  await commons.initMockWallet();
  commons.loadProposals();
  commons.subscribeToProposals();   // ← add
  commons.subscribeToNotifications();
  commons.subscribeToSocial();
  commons.subscribeToUserFollows();
  commons.subscribeToDonations();

});
onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  document.removeEventListener("click", onDocClick);
  commons.unsubscribeProposals();   // ← add
  commons.unsubscribeNotifications();
  commons.unsubscribeSocial();
  commons.unsubscribeUserFollows();
  commons.unsubscribeDonations();

});
const myId = computed(() => commons.currentAccountId);
function goMyProfile() { commons.setViewingProfile(null); go("profile"); }
const showDevTools = COMMONS_CONFIG.SHOW_DEV_TOOLS;
const demoAccounts = commons.DEMO_ACCOUNTS;
function onDemoSwitch(e: Event) {
  commons.setDemoAccount((e.target as HTMLSelectElement).value);
}
function initials(id: string) { return (id || "?").slice(0, 2).toUpperCase(); }
function avStyle(id: string) {
  const colors = ["#C9A84C", "#7E9BE0", "#64DCAA", "#E4C77A", "#A8842F"];
  let h = 0;
  for (let i = 0; i < (id || "").length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return { background: colors[Math.abs(h) % colors.length] };
}
function shortId(id?: string) { if (!id) return "Someone"; return id.length > 16 ? id.slice(0,8)+"…"+id.slice(-4) : id; }

const tabs = [
  { id: "feed", label: "Feed" },
  { id: "explore", label: "Explore" },
  { id: "treasury", label: "Treasury" },
  { id: "about", label: "About" },
];

const ic = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1.8 2.8 4.5 4.4 4.5 8.2A4.5 4.5 0 0 1 7.5 11C7.5 9.4 8.2 8.3 9 7.5c.2 1.8 1.2 2.8 3 2.8 0-2.8-1-4.5 0-7.3z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16 8 14 14 8 16 10 10"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/></svg>',
};
const mobileTabs = [
  { id: "feed", label: "Feed", icon: ic.home },
  { id: "explore", label: "Explore", icon: ic.compass },
  { id: "post", label: "Post", icon: "" },
  { id: "treasury", label: "Treasury", icon: ic.flame },
  { id: "about", label: "About", icon: ic.info },
];
const notifsOpen = ref(false);
function toggleNotifs() {
  if (notifsOpen.value) {
    notifsOpen.value = false;
    commons.markNotificationsRead();   // closing → mark read (dots were visible while open)
  } else {
    notifsOpen.value = true;
  }
}
const bellShake = ref(false);
watch(() => commons.unreadCount, (n, o) => {
  if (n > o) { bellShake.value = true; setTimeout(() => { bellShake.value = false; }, 550); }
});
function openNotif(n: any) {
  notifsOpen.value = false;
  commons.markNotificationsRead();
  if (n.proposal_id) {
    commons.setActiveProposal(n.proposal_id);
    if (n.type === "comment" || n.type === "reply") commons.setScrollToComments(true);
    go("story");
  }
}
function notifIcon(type: string) {
  return { like: "♥", boost: "⚡", donate: "◈", flag: "⚑", comment: "💬", reply: "↩", follow_delivered: "📦", follow_flagged: "⚑", follow_completed: "🏁", person_posted: "✦", person_delivered: "📦", person_completed: "🏁" }[type] || "•";
}
function notifText(n: any) {
  const who = commons.getDisplayName(n.actor_account_id) || shortId(n.actor_account_id);
  switch (n.type) {
    case "like": return `${who} liked your proposal`;
    case "boost": return `${who} boosted your proposal`;
    case "donate": return `${who} donated ${n.meta || ""} XOR to your proposal`;
    case "flag": return `${who} flagged one of your deliveries`;
    case "comment": return `${who} commented on your proposal`;
    case "reply": return `${who} replied on a proposal you commented on`;
    case "follow_delivered": return `${who} delivered a chapter on a proposal you follow`;
    case "follow_flagged": return `A proposal you follow was flagged`;
    case "follow_completed": return `A proposal you follow is now complete`;
    case "person_posted": return `${who} posted new work`;
    case "person_delivered": return `${who} delivered a chapter`;
    case "person_completed": return `${who} completed a proposal`;
    default: return "New notification";
  }
}
function notifTime(iso: string) {
  const d = new Date(iso), now = Date.now(), diff = (now - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

const bellEl = ref<HTMLElement | null>(null);
function onDocClick(e: MouseEvent) {
  if (notifsOpen.value && bellEl.value && !bellEl.value.contains(e.target as Node)) {
    notifsOpen.value = false;
    commons.markNotificationsRead();
  }
}
</script>

<style scoped>
.topbar { position: sticky; top: 0; z-index: 50; background: rgba(11,18,32,.86); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); }
.topbar__inner { max-width: 1020px; margin: 0 auto; display: flex; align-items: center; gap: 14px; padding: 12px var(--pad); }
.brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.brand__seal { height: 34px; width: auto; display: block; }
.brand__name { font-family: var(--display); font-size: 1.15rem; font-weight: 600; letter-spacing: .01em; }
.brand__name b { color: var(--gold-300); font-weight: 700; }
.nav { display: flex; gap: 4px; position: relative; }
.nav__indicator {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(201,168,76,.10);
  border-radius: var(--r-sm);
  transition: left 0.28s var(--ease), width 0.28s var(--ease), opacity 0.2s var(--ease);
  pointer-events: none;
  z-index: 0;
}
.nav a { position: relative; z-index: 1; }
.nav a { padding: 7px 12px; border-radius: var(--r-sm); color: var(--ink-dim); font-size: .9rem; font-weight: 500; cursor: pointer; }
.nav a:hover { color: var(--ink); background: var(--line-soft); }
.nav a.active { color: var(--gold-300); }
.nav-post { margin-left: 6px; background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 7px 16px; font-family: inherit; font-size: .9rem; font-weight: 700; cursor: pointer; box-shadow: 0 3px 12px rgba(201,168,76,.22); transition: transform .15s var(--ease), box-shadow .15s var(--ease), filter .15s var(--ease); }
.nav-post:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,168,76,.34); filter: brightness(1.06); }
.spacer { flex: 1; }
.netchip { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border: 1px solid var(--line); border-radius: 999px; font-family: var(--mono); font-size: .72rem; color: var(--ink-dim); }
.netchip .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--affirm); }
.demoswitch { background: rgba(139,30,45,.15); border: 1px solid #8B1E2D; border-radius: 999px; padding: 5px 10px; color: var(--ink-dim); font-family: var(--mono); font-size: .68rem; cursor: pointer; margin-right: 8px; }
.demoswitch:hover { border-color: var(--gold-600); }
.meav { position: relative; overflow: hidden; width: 34px; height: 34px; border-radius: 50%; border: none; display: grid; place-items: center; font-weight: 700; color: #22180a; font-size: .8rem; cursor: pointer; margin-left: 10px; flex: none; }
.meav__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.meav:hover { box-shadow: 0 0 0 2px var(--gold-600); }
.app { min-height: 100vh; background: var(--navy-900); }
.testbar { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: .74rem; color: var(--ink-dim); background: rgba(201,168,76,.08); border-bottom: 1px solid var(--line-soft); padding: 6px 12px; text-align: center; letter-spacing: .01em; }
.testbar__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold-400, #d4b95e); flex: none; }

.wrap { max-width: 1020px; margin: 0 auto; padding: 28px var(--pad) 96px; min-height: calc(100vh - 70px); }
.page-title { font-family: var(--display); font-size: 2rem; margin: 0 0 8px; }
.muted { color: var(--ink-dim); }

/* mobile bottom tab bar — floating island */
.tabbar { display: none; }
@media (max-width: 720px) {
  .nav { display: none; }
  .wrap { padding-bottom: 104px; overflow-x: hidden; }
  .tabbar {
    display: flex; position: fixed; z-index: 60;
    left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    align-items: flex-end; justify-content: space-around;
    background: rgba(17,25,40,.92); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid var(--line);
    border-radius: 22px;
    padding: 8px 4px; left: 8px; right: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.3);
  }
  .topbar__inner { gap: 6px; padding: 10px var(--pad); }
  .brand__seal { height: 28px; }
  .brand__name { font-size: 1rem; }
  .netchip { display: none; }
  .topsearch, .bell__btn { padding: 10px; }
  .meav { width: 32px; height: 32px; margin-left: 2px; }
  .topbar { transition: transform .28s var(--ease); }
  .tabbar { transition: transform .28s var(--ease); }
  .topbar.nav-hidden { transform: translateY(-100%); }
  .tabbar--composing { display: none; }
  .tabbar.nav-hidden { transform: translateY(calc(100% + 16px + env(safe-area-inset-bottom, 0px))); }
  .tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; color: var(--ink-faint); font-size: .62rem; font-weight: 600; min-height: 48px; justify-content: flex-end; cursor: pointer; }
  .tab.active { color: var(--gold-300); }
  .tab__ic :deep(svg) { width: 23px; height: 23px; }
  .tab:nth-child(4) .tab__ic :deep(svg) { width: 30px; height: 30px; transform: translateY(6px); }
  .tab-fab .fabc { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); display: grid; place-items: center; color: #22180a; box-shadow: 0 6px 18px rgba(201,168,76,.45); border: 3px solid var(--navy-900); margin-top: -22px; }
  .tab-fab .fabc svg { width: 25px; height: 25px; }
  .tab-fab .tab__lbl { color: var(--gold-300); }
}
@media (prefers-reduced-motion: reduce) {
  .topbar, .tabbar { transition: none !important; }
  .topbar.nav-hidden, .tabbar.nav-hidden { transform: none !important; }
}
.boost-banner {
  position: fixed; top: 18px; right: 18px; z-index: 1000;
  display: flex; align-items: center; gap: 8px;
  background: var(--navy-850); border: 1px solid var(--gold-700, #7a5c1a);
  color: var(--ink); font-size: .84rem; line-height: 1.4;
  padding: 12px 16px; border-radius: var(--r); max-width: 320px;
  box-shadow: 0 8px 24px rgba(0,0,0,.35);
}
.boost-banner .i-bolt { color: var(--gold-300); flex-shrink: 0; }
.boostbanner-enter-active, .boostbanner-leave-active { transition: opacity .25s ease, transform .25s ease; }
.boostbanner-enter-from, .boostbanner-leave-to { opacity: 0; transform: translateY(-8px); }
@media (prefers-reduced-motion: reduce) {
  .boostbanner-enter-active, .boostbanner-leave-active { transition: opacity .25s ease; }
  .boostbanner-enter-from, .boostbanner-leave-to { transform: none; }
}
.bell { position: relative; margin-left: 4px; }
.bell__btn { position: relative; background: none; border: none; color: var(--ink-dim); cursor: pointer; padding: 6px; display: grid; place-items: center; border-radius: 50%; }
.bell__btn:hover { color: var(--ink); background: var(--navy-800); }
.bell__badge { position: absolute; top: 0; right: 0; min-width: 16px; height: 16px; padding: 0 4px; background: var(--gold-500); color: #22180a; font-size: .62rem; font-weight: 800; border-radius: 999px; display: grid; place-items: center; font-family: var(--mono); }
.bell__btn svg.shake { animation: shake 0.5s var(--ease); transform-origin: top center; }
.bell__ring { position: absolute; top: 50%; width: 8px; height: 18px; color: var(--gold-300); pointer-events: none; opacity: 0; transform: translateY(-50%); }
.bell__ring--l { right: 100%; margin-right: 1px; }
.bell__ring--r { left: 100%; margin-left: 1px; }
.bell__ring--l.ringing { animation: ring-l 0.5s var(--ease); }
.bell__ring--r.ringing { animation: ring-r 0.5s var(--ease); }
@keyframes ring-l { 0% { opacity: 0; transform: translateY(-50%) translateX(5px); } 40% { opacity: 1; transform: translateY(-50%) translateX(0); } 100% { opacity: 0; transform: translateY(-50%) translateX(-3px); } }
@keyframes ring-r { 0% { opacity: 0; transform: translateY(-50%) translateX(-5px); } 40% { opacity: 1; transform: translateY(-50%) translateX(0); } 100% { opacity: 0; transform: translateY(-50%) translateX(3px); } }
.notifs { transform-origin: top right; }
.notifs-pop-enter-active { animation: notifs-in var(--dur) var(--ease-spring); }
.notifs-pop-leave-active { animation: notifs-in var(--dur-fast) var(--ease) reverse; }
@keyframes notifs-in { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
.topsearch { background: none; border: none; color: var(--ink-dim); cursor: pointer; padding: 6px; display: grid; place-items: center; border-radius: 50%; }
.topsearch svg { width: 20px; height: 20px; }
.topsearch:hover { color: var(--ink); background: var(--navy-800); }
.notifs { position: absolute; top: 44px; right: 0; width: 340px; max-height: 440px; overflow-y: auto; background: color-mix(in srgb, var(--navy-850) 92%, transparent); backdrop-filter: blur(16px); border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.02) inset; z-index: 200; padding: 8px; }
@media (max-width: 720px) { .notifs { position: fixed; top: 60px; left: 12px; right: 12px; width: auto; max-height: 72vh; background: var(--navy-850); backdrop-filter: none; } }
.notifs__h { display: flex; align-items: center; justify-content: space-between; font-family: var(--display); font-size: .95rem; font-weight: 700; padding: 10px 12px 8px; color: var(--ink); letter-spacing: -.01em; }
.notifs__x { background: none; border: none; color: var(--ink-faint); font-size: 1.1rem; line-height: 1; cursor: pointer; padding: 6px; margin: -6px -6px -6px 0; }
.notifs__x:hover { color: var(--ink); }
.notifs__empty { padding: 28px 12px; color: var(--ink-faint); font-size: .84rem; text-align: center; }
.notif { position: relative; display: flex; gap: 12px; align-items: center; width: 100%; text-align: left; background: none; border: none; border-radius: 12px; padding: 11px 12px; cursor: pointer; transition: background .14s var(--ease); }
.notif:hover { background: var(--navy-900); }
.notif__av { position: relative; flex: none; width: 38px; height: 38px; border-radius: 50%; overflow: visible; display: grid; place-items: center; font-weight: 700; color: #22180a; font-size: .82rem; }
.notif__avimg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.notif__badge { position: absolute; bottom: -3px; right: -3px; width: 18px; height: 18px; border-radius: 50%; background: var(--navy-850); border: 2px solid var(--navy-850); display: grid; place-items: center; font-size: .64rem; color: var(--gold-300); box-shadow: 0 1px 4px rgba(0,0,0,.4); }
.notif__badge.nb--flag { color: var(--negate); }
.notif__badge.nb--donate { color: var(--gold-300); }
@media (max-width: 720px) {
  .notifs {
    position: fixed;
    top: 60px;
    left: 12px; right: 12px;
    width: auto;
    max-height: 72vh;
    background: var(--navy-850);
    backdrop-filter: none;
  }
}
.notif__body { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.notif__txt { font-size: .855rem; color: var(--ink); line-height: 1.4; overflow-wrap: anywhere; }
.notif__time { font-size: .7rem; color: var(--ink-faint); font-family: var(--mono); }
.notif__dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--gold-400, var(--gold-300)); box-shadow: 0 0 8px rgba(201,168,76,.5); }
</style>