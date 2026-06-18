<template>
  <div class="app">
    <!-- TOP BAR -->
    <header class="topbar">
      <div class="topbar__inner">
        <a class="brand" @click="go('feed')">
          <img class="brand__seal" :src="sealUrl" alt="SORA Commons seal" />
          <span class="brand__name">SORA <b>Commons</b></span>
        </a>
       <nav class="nav">
          <a v-for="t in tabs" :key="t.id" :class="{ active: active === t.id }" @click="go(t.id)">{{ t.label }}</a>
          <button class="nav-post" :class="{ active: active === 'post' }" @click="go('post')">Post</button>
        </nav>
        <span class="spacer"></span>
        <div class="netchip"><span class="dot"></span>TAIRA</div>
      </div>
    </header>

    <main class="wrap">
      <Feed v-if="active === 'feed'" @nav="go" />
      <Story v-else-if="active === 'story'" @nav="go" />
      <Compose v-else-if="active === 'post'" @nav="go" />
      <Overview v-else-if="active === 'overview'" @nav="go" />
      <About v-else-if="active === 'about'" />
      <Proposals v-else-if="active === 'proposals'" @nav="go" />
      <Treasury v-else-if="active === 'treasury'" />
      <Citizens v-else-if="active === 'citizens'" @nav="go" />
      <Submit v-else-if="active === 'submit'" @nav="go" />
      <template v-else>
        <h1 class="page-title">{{ tabs.find(t => t.id === active)?.label }}</h1>
        <p class="muted">This page is coming next.</p>
      </template>
    </main>

    <!-- MOBILE BOTTOM TAB BAR -->
    <nav class="tabbar">
      <a v-for="t in mobileTabs" :key="t.id" class="tab" :class="{ active: active === t.id, 'tab-fab': t.id === 'post' }" @click="go(t.id)">
        <span v-if="t.id === 'post'" class="fabc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
        <span v-else class="tab__ic" v-html="t.icon"></span>
        <span class="tab__lbl">{{ t.label }}</span>
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import Story from "./views/Story.vue";
import Feed from "./views/Feed.vue";
import { ref } from "vue";
import sealUrl from "./assets/seal.png";
import Overview from "./views/Overview.vue";
import About from "./views/About.vue";
import Proposals from "./views/Proposals.vue";
import Treasury from "./views/Treasury.vue";
import Citizens from "./views/Citizens.vue";
import Submit from "./views/Submit.vue";
import Compose from "./views/Compose.vue";

const active = ref("feed");
const go = (id: string) => { active.value = id; window.scrollTo(0, 0); };

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
.nav-post { margin-left: 6px; background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 7px 16px; font-family: inherit; font-size: .9rem; font-weight: 700; cursor: pointer; }
.nav-post:hover { filter: brightness(1.05); }
.spacer { flex: 1; }
.netchip { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border: 1px solid var(--line); border-radius: 999px; font-family: var(--mono); font-size: .72rem; color: var(--ink-dim); }
.netchip .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--affirm); }

.wrap { max-width: 1020px; margin: 0 auto; padding: 28px var(--pad) 96px; }
.page-title { font-family: var(--display); font-size: 2rem; margin: 0 0 8px; }
.muted { color: var(--ink-dim); }

/* mobile bottom tab bar */
.tabbar { display: none; }
@media (max-width: 720px) {
  .nav { display: none; }
  .tabbar {
    display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 60;
    align-items: flex-end; justify-content: space-around;
    background: rgba(11,18,32,.94); backdrop-filter: blur(16px); border-top: 1px solid var(--line);
    padding: 7px 4px calc(7px + env(safe-area-inset-bottom, 0px));
  }
  .tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; color: var(--ink-faint); font-size: .62rem; font-weight: 600; min-height: 48px; justify-content: flex-end; cursor: pointer; }
  .tab.active { color: var(--gold-300); }
  .tab__ic :deep(svg) { width: 23px; height: 23px; }
  .tab-fab .fabc { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); display: grid; place-items: center; color: #22180a; box-shadow: 0 8px 22px rgba(201,168,76,.45); border: 3px solid var(--navy-900); margin-top: -20px; }
  .tab-fab .fabc svg { width: 25px; height: 25px; }
  .tab-fab .tab__lbl { color: var(--gold-300); }
}
</style>