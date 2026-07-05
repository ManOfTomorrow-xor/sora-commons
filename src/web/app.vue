<template>
  <div class="app">
    <!-- TOP BAR -->
    <header class="topbar" :class="{ 'nav-hidden': navHidden }">
    <div v-if="isTestVersion" class="testbar">
      <span class="testbar__dot"></span>
      Test version — identities and donations are simulated. No real XOR moves.
    </div>
      <div class="topbar__inner">
        <a class="brand" @click="go('feed')">
          <img class="brand__seal" :src="sealUrl" alt="SORA Commons seal" />
          <span class="brand__name">SORA <b>Commons</b></span>
        </a>
        <transition name="boostbanner">
        <div v-if="boostBanner" class="boost-banner" role="status">
        <svg class="i-bolt" viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
        <span>You've used all {{ boostsPerWeek }} boosts this week. Your allotment resets soon.</span>
      </div>
    </transition>
       <nav class="nav">
          <a v-for="t in tabs" :key="t.id" :class="{ active: active === t.id }" @click="go(t.id)">{{ t.label }}</a>
          <button class="nav-post btn-gold" :class="{ active: active === 'post' }" @click="go('post')">Post</button>
        </nav>
        <span class="spacer"></span>
        <select v-if="showDevTools" class="demoswitch" :value="commons.demoAccountId" @change="onDemoSwitch" title="Demo: switch identity (dev only)">
          <option v-for="a in demoAccounts" :key="a" :value="a">{{ a.split('.')[0] }}</option>
        </select>
        <div class="netchip" title="Connected to Taira testnet"><span class="dot"></span><span class="netchip__lbl">TAIRA</span></div>
        <button class="meav" :style="commons.getAvatar(myId) ? {} : avStyle(myId)" @click="goMyProfile" title="Your profile">
          <img v-if="commons.getAvatar(myId)" :src="commons.getAvatar(myId)" class="meav__img" alt="" />
          <template v-else>{{ initials(myId) }}</template>
        </button>

      </div>
    </header>

    <main class="wrap">
      <Feed v-if="active === 'feed'" @nav="go" />
      <Story v-else-if="active === 'story'" @nav="go" />
      <Compose v-else-if="active === 'post'" @nav="go" />
      <Profile v-else-if="active === 'profile'" @nav="go" />
      <Overview v-else-if="active === 'overview'" @nav="go" />
      <About v-else-if="active === 'about'" />
      <Proposals v-else-if="active === 'proposals'" @nav="go" />
      <Treasury v-else-if="active === 'treasury'" />
      <Explore v-else-if="active === 'explore'" @nav="go" />
      <Submit v-else-if="active === 'submit'" @nav="go" />
      <template v-else>
        <h1 class="page-title">{{ tabs.find(t => t.id === active)?.label }}</h1>
        <p class="muted">This page is coming next.</p>
      </template>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useCommonsStore } from "@/stores/commons";
import { COMMONS_CONFIG } from "@/constants/commonsConfig";
const commons = useCommonsStore();
const boostsPerWeek = COMMONS_CONFIG.BOOSTS_PER_WEEK;
const isTestVersion = COMMONS_CONFIG.IS_TEST_VERSION;
import sealUrl from "./assets/seal.png";
import Overview from "./views/Overview.vue";
import About from "./views/About.vue";
import Proposals from "./views/Proposals.vue";
import Treasury from "./views/Treasury.vue";
import Submit from "./views/Submit.vue";
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
const navHidden = ref(false);
let lastY = 0;
const go = (id: string) => {
  const [view, anchor] = id.split("#");
  active.value = view;
  navHidden.value = false;
  lastY = 0;
  if (anchor) {
    nextTick(() => requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" })));
  } else {
    window.scrollTo(0, 0);
  }
};
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
  await commons.initMockWallet();
  commons.loadProposals();
});
onUnmounted(() => window.removeEventListener("scroll", onScroll));
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
</script>

<style scoped>
.topbar { position: sticky; top: 0; z-index: 50; background: rgba(11,18,32,.86); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); }
.topbar__inner { max-width: 1020px; margin: 0 auto; display: flex; align-items: center; gap: 14px; padding: 12px var(--pad); }
.brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.brand__seal { height: 34px; width: auto; display: block; }
.brand__name { font-family: var(--display); font-size: 1.15rem; font-weight: 600; letter-spacing: .01em; }
.brand__name b { color: var(--gold-300); font-weight: 700; }
.nav { display: flex; gap: 4px; }
.nav a { padding: 7px 12px; border-radius: var(--r-sm); color: var(--ink-dim); font-size: .9rem; font-weight: 500; cursor: pointer; }
.nav a:hover { color: var(--ink); background: var(--line-soft); }
.nav a.active { color: var(--gold-300); background: rgba(201,168,76,.10); }
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
  .wrap { padding-bottom: 104px; }
  .tabbar {
    display: flex; position: fixed; z-index: 60;
    left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    align-items: flex-end; justify-content: space-around;
    background: rgba(17,25,40,.92); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid var(--line);
    border-radius: 22px;
    padding: 8px 6px;
    box-shadow: 0 10px 30px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.3);
  }
  .topbar__inner { gap: 8px; padding: 10px var(--pad); }
  .brand__seal { height: 28px; }
  .brand__name { font-size: 1rem; }
  .netchip { padding: 6px; gap: 0; }
  .netchip__lbl { display: none; }
  .meav { width: 30px; height: 30px; margin-left: 4px; }
  .topbar { transition: transform .28s var(--ease); }
  .tabbar { transition: transform .28s var(--ease); }
  .topbar.nav-hidden { transform: translateY(-100%); }
  .tabbar--composing { display: none; }
  .tabbar.nav-hidden { transform: translateY(calc(100% + 16px + env(safe-area-inset-bottom, 0px))); }
  .tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; color: var(--ink-faint); font-size: .62rem; font-weight: 600; min-height: 48px; justify-content: flex-end; cursor: pointer; }
  .tab.active { color: var(--gold-300); }
  .tab__ic :deep(svg) { width: 23px; height: 23px; }
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
</style>