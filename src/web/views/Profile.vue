<template>
  <div class="profile">
    <a class="back" @click="$emit('nav', 'feed')">← Back to feed</a>

    <!-- IDENTITY HERO -->
    <div class="phero">
      <span class="pavwrap" :class="{ 'pavwrap--clickable': isOwn }" @click="isOwn && (showEditor = true)">
        <span class="pav" :style="commons.getAvatar(accountId) ? {} : avStyle(accountId)">
          <img v-if="commons.getAvatar(accountId)" :src="commons.getAvatar(accountId)" class="pav__img" alt="" />
          <template v-else>{{ initials(accountId) }}</template>
          <span v-if="isOwn" class="pav__edit" title="Change photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </span>
        </span>
      </span>
      <div class="phero__b">
        <div class="phero__name">
          <h1>{{ commons.getDisplayName(accountId) || shortId(accountId) }}</h1>
          <span class="plabel" :class="labelClass">{{ commons.proposerLabel(accountId) }}</span>
        </div>
        <p class="pbio">{{ commons.getBio(accountId) || bio }}</p>
        <div class="prep"><span class="prep__dot"></span> Reputation: {{ reputationWord }}</div>
        <div class="pfollows">
          <b><CountUp :value="commons.getFollowerCount(accountId)" :decimals="0" /></b> followers
          <span class="pfollows__sep">·</span>
          <b><CountUp :value="commons.getFollowingCount(accountId)" :decimals="0" /></b> following
        </div>
      </div>
      <button v-if="isOwn" class="pedit" @click="showEditor = true">Edit profile</button>
      <button v-else-if="commons.currentAccountId" class="pfollow" :class="{ on: commons.isFollowingUser(accountId) }" @click="commons.toggleFollowUser(accountId)">
        {{ commons.isFollowingUser(accountId) ? "Following" : "+ Follow" }}
      </button>
    </div>

    <!-- TRACK-RECORD STRIP -->
    <div class="pstats">
      <div><b>{{ theirProposals.length }}</b><span>proposals</span></div>
      <div><b>{{ deliveredCount }}</b><span>delivered</span></div>
      <div><b>{{ totalRaised }}</b><span>XOR raised</span></div>
      <div><b>{{ totalBackers }}</b><span>backers</span></div>
    </div>

    <!-- TABS -->
    <div class="ptabs">
      <button :class="{ on: tab === 'work' }" @click="tab = 'work'">{{ isOwn ? 'Your work' : 'Their work' }}</button>
      <button v-if="isOwn" :class="{ on: tab === 'activity' }" @click="tab = 'activity'">Your activity</button>
    </div>

    <!-- THEIR WORK -->
    <div v-if="tab === 'work'">
      <p v-if="theirProposals.length === 0" class="empty">{{ isOwn ? "You haven't posted any work yet." : "No proposals yet — their story starts soon." }}</p>
      <article v-for="p in theirProposals" :key="p.id" class="wcard" @click="open(p)">
        <div class="wcard__top">
          <span class="wbadge" :class="p.status === 'complete' ? 'wb--done' : 'wb--prog'">
            {{ p.status === 'complete' ? '✓ Delivered' : 'In progress' }}
          </span>
          <span class="wcat">{{ catLabel(p.category) }}</span>
        </div>
        <h3>{{ p.title }}</h3>
        <p class="wsnip">{{ p.description }}</p>
        <div class="wmeta">{{ p.totalDonated || 0 }} XOR raised · {{ p.backers || 0 }} backers</div>
      </article>
    </div>

    <!-- YOUR ACTIVITY (own only) -->
    <div v-else-if="tab === 'activity' && isOwn">
      <h2 class="asec">Your support</h2>
      <div class="pstats pstats--soft">
        <div><b>{{ youDonated }}</b><span>XOR donated</span></div>
        <div><b>{{ youBoosted }}</b><span>boosts given</span></div>
        <div><b>{{ youBurned }}</b><span>XOR burned</span></div>
      </div>
      <p class="anote">Your contribution totals come alive once donations and boosts are live.</p>

      <h2 class="asec">Saved / tracking</h2>
      <p v-if="saved.length === 0" class="empty">Nothing saved yet. Tap the bookmark on any story to track it here.</p>
      <article v-for="p in saved" :key="p.id" class="wcard" @click="open(p)">
        <div class="wcard__top">
          <span class="wbadge" :class="p.status === 'complete' ? 'wb--done' : 'wb--prog'">
            {{ p.status === 'complete' ? '✓ Delivered' : 'In progress' }}
          </span>
          <span class="wcat">{{ catLabel(p.category) }}</span>
        </div>
        <h3>{{ p.title }}</h3>
        <p class="wsnip">{{ p.description }}</p>
      </article>

      <h2 class="asec">My drafts</h2>
      <div v-if="commons.hasDraft" class="pdraft-row">
        <button class="pdraft" @click="continueDraft">
          <span class="pdraft__title">{{ commons.draftPreview?.title || 'Untitled draft' }}</span>
          <span class="pdraft__go">Continue →</span>
        </button>
        <button v-if="!confirmDeleteDraft" class="pdraft__del" @click="confirmDeleteDraft = true" title="Delete draft">✕</button>
        <template v-else>
          <button class="pdraft__del pdraft__del--yes" @click="onDeleteDraft">Delete?</button>
          <button class="pdraft__del" @click="confirmDeleteDraft = false">Cancel</button>
        </template>
      </div>
      <p v-else class="anote">No saved drafts yet. Start one from Post — you can save and come back anytime.</p>
    </div>
    <ProfileEditor v-if="showEditor" :account-id="accountId" @close="showEditor = false" @saved="onProfileSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCommonsStore } from "@/stores/commons";
import ProfileEditor from "@/web/components/ProfileEditor.vue";
import CountUp from "../components/CountUp.vue";

onMounted(() => { window.scrollTo(0, 0); if (isOwn.value) commons.checkDraft(); });

const emit = defineEmits<{ (e: "nav", id: string): void }>();
const commons = useCommonsStore();
const showEditor = ref(false);
function onProfileSaved() { /* display refreshes reactively via store maps */ }

const tab = ref<"work" | "activity">("work");

const accountId = computed(() => commons.viewingProfileId || commons.currentAccountId);
const isOwn = computed(() => accountId.value === commons.currentAccountId);

const theirProposals = computed(() =>
  commons.proposals.filter((p: any) => p.proposerAccountId === accountId.value)
);
const deliveredCount = computed(() => theirProposals.value.filter((p: any) => p.status === "complete").length);
const totalRaised = computed(() => theirProposals.value.reduce((s: number, p: any) => s + Number(p.totalDonated || 0), 0));
const totalBackers = computed(() => theirProposals.value.reduce((s: number, p: any) => s + Number(p.backers || 0), 0));

const saved = computed(() => commons.proposals.filter((p: any) => commons.isSaved(p.id)));

// own contribution totals — honest zeros until mechanics + backend
const youDonated = ref(0);
const youBoosted = ref(0);
const youBurned = ref(0);
const confirmDeleteDraft = ref(false);
async function onDeleteDraft() { await commons.deleteDraft(); confirmDeleteDraft.value = false; }

const bio = computed(() => isOwn.value ? "Add a short bio once profiles are editable." : "This builder hasn't added a bio yet.");
const reputationWord = computed(() => deliveredCount.value > 0 ? "established" : "building");
const labelClass = computed(() => "lbl--" + commons.proposerLabel(accountId.value).toLowerCase());

function open(p: any) { commons.setActiveProposal(p.id); emit("nav", "story"); }
async function continueDraft() { await commons.loadDraft(); emit("nav", "post"); }

function catLabel(c?: string) {
  return c === "production" ? "Production" : c === "productivity_public_good" ? "Productivity / Public-good" : (c || "Proposal");
}
function shortId(id?: string) {
  if (!id) return "Unknown";
  return id.length > 16 ? id.slice(0, 8) + "…" + id.slice(-4) : id;
}
function initials(id?: string) { return (id || "?").slice(0, 2).toUpperCase(); }
function avStyle(id?: string) {
  const colors = ["#C9A84C", "#7E9BE0", "#64DCAA", "#E4C77A", "#A8842F"];
  let h = 0;
  for (let i = 0; i < (id || "").length; i++) h = (id as string).charCodeAt(i) + ((h << 5) - h);
  return { background: colors[Math.abs(h) % colors.length] };
}
</script>

<style scoped>
.profile { max-width: 820px; margin: 0 auto; }
.back { color: var(--gold-300); font-size: .86rem; margin-bottom: 18px; display: inline-block; cursor: pointer; }

.phero { display: flex; align-items: flex-start; gap: 18px; margin-bottom: 22px; }
.pav { position: relative; overflow: hidden; width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; color: #22180a; font-size: 1.6rem; flex: none; }
.pav__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pav--clickable { cursor: pointer; }
.pav--clickable:hover .pav__edit { opacity: 1; }
.pav__status { font-size: .78rem; color: var(--ink-dim); margin: 6px 0 0; }
.pav__status--err { color: var(--negate); }
.pavwrap { position: relative; display: inline-grid; flex: none; }
.pavwrap--clickable { cursor: pointer; }
.pavwrap { position: relative; display: inline-block; flex: none; line-height: 0; }
.pavwrap--clickable { cursor: pointer; }
.pav__edit { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.45); color: #fff; opacity: 0; transition: opacity .15s; }
.pavwrap--clickable:hover .pav__edit { opacity: 1; }
.pavwrap--clickable:hover .pav__edit { opacity: 1; }
.phero__b { flex: 1; min-width: 0; }
.phero__name { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.phero__name h1 { font-family: var(--display); font-size: 1.8rem; font-weight: 800; margin: 0; }
.plabel { font-family: var(--mono); font-size: .62rem; text-transform: uppercase; letter-spacing: .05em; padding: 3px 9px; border-radius: 999px; }
.pfollows { color: var(--ink-dim); font-size: .84rem; margin-top: 6px; }
.pfollows b { color: var(--ink); font-family: var(--mono); font-weight: 700; }
.pfollows__sep { margin: 0 7px; color: var(--ink-faint); }
.plabel.lbl--newcomer { color: var(--info); border: 1px solid rgba(126,155,224,.4); }
.plabel.lbl--proven { color: var(--affirm); border: 1px solid rgba(100,220,170,.4); }
.plabel.lbl--veteran { color: var(--gold-300); border: 1px solid var(--gold-600); }
.plabel.lbl--flagged { color: var(--negate); border: 1px solid rgba(255,100,100,.4); }
.pbio { color: var(--ink-dim); margin: 6px 0 8px; line-height: 1.5; }
.prep { display: inline-flex; align-items: center; gap: 7px; font-size: .82rem; color: var(--ink-faint); }
.prep__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold-500); }
.pedit { background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 9px 14px; color: var(--ink); font-weight: 600; font-size: .84rem; cursor: pointer; flex: none; }
.pstats--six { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 600px) { .pstats--six { grid-template-columns: repeat(2, 1fr); } }
.pfollow { background: var(--navy-900); border: 1px solid var(--gold-600); color: var(--gold-300); border-radius: var(--r-sm); padding: 9px 18px; font-family: var(--body); font-weight: 600; font-size: .9rem; cursor: pointer; transition: background var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease); }
.pfollow:hover { background: rgba(201,168,76,.12); transform: translateY(-1px); }
.pfollow.on { background: rgba(201,168,76,.14); }
.pedit:hover { border-color: var(--gold-600); }
.pdraft { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 16px; background: rgba(201,168,76,.06); border: 1px solid var(--line); border-radius: var(--r); cursor: pointer; transition: border-color .15s var(--ease), background .15s var(--ease); }
.pdraft:hover { border-color: var(--gold-600); background: rgba(201,168,76,.10); }
.pdraft__title { color: var(--ink); font-weight: 600; }
.pdraft__go { color: var(--gold-300); font-size: .85rem; }
.pdraft-row { display: flex; align-items: stretch; gap: 8px; }
.pdraft-row .pdraft { flex: 1; }
.pdraft__del { padding: 0 14px; background: transparent; border: 1px solid var(--line); border-radius: var(--r); color: var(--ink-faint); cursor: pointer; font-size: .9rem; white-space: nowrap; transition: border-color .15s var(--ease), color .15s var(--ease); }
.pdraft__del:hover { border-color: var(--ink-dim); color: var(--ink); }
.pdraft__del--yes { border-color: var(--negate); color: var(--negate); }
.pdraft__del--yes:hover { background: var(--negate); color: #fff; }

.pstats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 18px; margin-bottom: 22px; }
.pstats--soft { grid-template-columns: repeat(3, 1fr); }
.pstats > div { display: flex; flex-direction: column; align-items: center; text-align: center; }
.pstats b { font-family: var(--mono); color: var(--gold-300); font-size: 1.4rem; }
.pstats span { color: var(--ink-faint); font-size: .76rem; margin-top: 2px; }
@media (max-width: 600px) { .pstats { grid-template-columns: repeat(2, 1fr); } }

.ptabs { display: flex; gap: 6px; border-bottom: 1px solid var(--line); margin-bottom: 18px; }
.ptabs button { background: none; border: none; border-bottom: 2px solid transparent; padding: 10px 14px; color: var(--ink-dim); font-size: .92rem; font-weight: 600; cursor: pointer; margin-bottom: -1px; }
.ptabs button.on { color: var(--gold-300); border-bottom-color: var(--gold-500); }

.empty { color: var(--ink-faint); padding: 36px 0; text-align: center; }
.asec { font-family: var(--display); font-size: 1.15rem; font-weight: 700; margin: 22px 0 12px; }
.anote { color: var(--ink-faint); font-size: .84rem; margin: 0 0 8px; }

.wcard { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; margin-bottom: 12px; cursor: pointer; transition: border-color .2s var(--ease); }
.wcard:hover { border-color: var(--gold-600); }
.wcard__top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.wbadge { font-size: .68rem; font-family: var(--mono); padding: 3px 9px; border-radius: 999px; }
.wb--done { background: rgba(100,220,170,.14); color: var(--affirm); }
.wb--prog { background: rgba(201,168,76,.12); color: var(--gold-300); }
.wcat { font-family: var(--mono); font-size: .62rem; color: var(--ink-faint); text-transform: uppercase; letter-spacing: .05em; margin-left: auto; }
.wcard h3 { font-family: var(--display); font-size: 1.15rem; font-weight: 700; margin: 0 0 5px; }
.wsnip { color: var(--ink-dim); font-size: .88rem; margin: 0 0 8px; overflow-wrap: anywhere; }
.wmeta { font-family: var(--mono); font-size: .78rem; color: var(--ink-faint); }
@media (max-width: 600px) {
  .phero { flex-direction: column; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
  .phero__b { width: 100%; }
  .phero__name h1 { font-size: 1.5rem; }
  .pav { width: 92px; height: 92px; font-size: 2rem; }
  .pavwrap { align-self: center; }
  .pbio { margin: 8px 0 0; }
  .prep { margin-top: 8px; white-space: nowrap; }
  .pfollows { margin-top: 8px; white-space: nowrap; }
  .pedit, .pfollow { width: 100%; text-align: center; }
}
</style>