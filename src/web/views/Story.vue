<template>
  <div class="story" v-if="p">
    <a class="back" @click="$emit('nav', 'feed')">← Back to feed</a>

  <!-- HERO -->
    <div class="sd__badges">
      <span v-if="p.category" class="badge" :class="catBadgeClass(p.category)">{{ catLabel(p.category) }}</span>
    </div>
    <h1 class="sd__title">{{ p.title }}</h1>
    <div class="sd__who" @click="$emit('nav', 'profile')">
      <span class="av" :style="avStyle(p.proposerAccountId)">{{ initials(p.proposerAccountId) }}</span>
      <div class="sd__whoinfo">
        <span class="sd__name"><b>{{ shortId(p.proposerAccountId) }}</b><span class="sd__label" :class="labelClass">{{ commons.proposerLabel(p.proposerAccountId) }}</span></span>
        <span class="sd__chap">{{ chapterText }}</span>
      </div>
    </div>
    <div class="trackline"><span class="track" :class="trackClass">{{ trackLabel }}</span></div>

    <!-- ACTION BAR -->
    <div class="actbar">
      <button class="actbtn" :class="{ on: liked }" @click="toggleLike">♥ <span>{{ likeCount }}</span></button>
      <button class="actbtn" @click="openBoost">⚡ Boost <span>{{ (p.boostCount || 0) }}</span></button>
      <button class="actbtn donate" @click="openDonate">Donate</button>
      <button class="actbtn" :class="{ on: commons.isSaved(p.id) }" @click="commons.toggleSave(p.id)">
        {{ commons.isSaved(p.id) ? "Saved" : "Save" }}
      </button>
      <button class="actbtn" @click="following = !following">{{ following ? "Following" : "+ Follow" }}</button>
    </div>
    <div class="totals">
      <div><b>{{ p.totalDonated || 0 }} XOR</b>raised</div>
      <div><b>{{ p.xorBurned || 0 }} XOR</b>burned</div>
      <div><b>{{ p.backers || 0 }}</b>backers</div>
      <div><b>{{ p.followers || 0 }}</b>followers</div>
    </div>

    <!-- STORY -->
    <section class="sec">
      <h2>The story</h2>
      <p class="narrative">{{ p.description }}</p>
      <div v-if="p.files && p.files.length" class="files">
        <span v-for="f in p.files" :key="f" class="file">📎 {{ f }}</span>
      </div>
    </section>

    <!-- FACTS -->
    <section class="sec" v-if="hasFacts">
      <h2>The facts behind it</h2>
      <div class="facts">
        <div v-if="p.productiveClaim"><div class="fact__l">Productive claim</div><div class="fact__v">{{ p.productiveClaim }}</div></div>
        <div v-if="p.inputs"><div class="fact__l">Inputs financed</div><div class="fact__v">{{ p.inputs }}</div></div>
        <div v-if="p.expectedOutput"><div class="fact__l">Expected output</div><div class="fact__v">{{ p.expectedOutput }}</div></div>
        <div v-if="p.demandSignal"><div class="fact__l">Demand signal</div><div class="fact__v">{{ p.demandSignal }}</div></div>
        <div v-if="p.riskBearer"><div class="fact__l">Who carries the risk</div><div class="fact__v">{{ p.riskBearer }}</div></div>
        <div v-if="p.failureHandling"><div class="fact__l">On honest failure</div><div class="fact__v">{{ p.failureHandling }}</div></div>
        <div v-if="p.publicBenefit"><div class="fact__l">Public benefit</div><div class="fact__v">{{ p.publicBenefit }}</div></div>
      </div>
    </section>

  <!-- CHAPTERS -->
    <section class="sec">
      <h2>The chapters</h2>
      <p v-if="!p.milestones || p.milestones.length === 0" class="muted">No chapters yet.</p>
      <div v-for="(m, i) in p.milestones" :key="m.id || i" class="chapter">
        <div class="ch__dot" :class="m.completed ? 'done' : (i === firstIncomplete ? 'now' : 'up')">
          {{ m.completed ? "✓" : i + 1 }}
        </div>
        <div class="ch__b">
          <h4>{{ m.description }}</h4>
          <div class="ch__meta">{{ m.xorAmount }} XOR · due {{ m.timeline || "—" }}</div>

          <!-- the promise -->
          <div v-if="m.evidence" class="ch__ev"><span class="ch__evlab">Evidence to present:</span> {{ m.evidence }}</div>

          <!-- the delivered claim -->
          <div v-if="m.completed && m.deliveredEvidence" class="ch__ev ch__ev--delivered">
            <span class="ch__evlab">Evidence presented:</span> {{ m.deliveredEvidence }}
          </div>

          <!-- proposer-only: submit evidence & mark delivered (own proposal, current chapter) -->
          <div v-if="isMine && !m.completed && i === firstIncomplete" class="ch__deliver">
            <textarea v-model="deliverText" rows="2" placeholder="Present the actual evidence this chapter is done (link, receipt, photo description...)"></textarea>
            <button class="ch__deliverbtn" :disabled="!deliverText.trim()" @click="submitDelivery(m.id)">Submit evidence &amp; mark delivered</button>
          </div>
        </div>
        <span class="ch__st" :class="m.completed ? 'st-done' : (i === firstIncomplete ? 'st-now' : 'st-up')">
          {{ m.completed ? "Evidence submitted" : (i === firstIncomplete ? "In progress" : "Upcoming") }}
        </span>
      </div>
    </section>

    <!-- CONVERSATION -->
    <section class="sec">
      <h2>Conversation</h2>
      <p v-if="!p.discussionPosts || p.discussionPosts.length === 0" class="muted">No comments yet. Be the first to weigh in.</p>
      <div v-for="c in p.discussionPosts" :key="c.id" class="cmt" :class="{ isprop: c.authorAccountId === p.proposerAccountId }">
        <span class="av sm" :style="avStyle(c.authorAccountId)">{{ initials(c.authorAccountId) }}</span>
        <div class="cmt__b">
          <div class="cmt__h"><b>{{ shortId(c.authorAccountId) }}</b><span v-if="c.authorAccountId === p.proposerAccountId" class="prop">PROPOSER</span></div>
          <div class="cmt__t">{{ c.content }}</div>
        </div>
      </div>
      <div class="cmtbox">
        <input v-model="newComment" placeholder="Add a comment..." @keyup.enter="postComment" />
        <button @click="postComment">Post</button>
      </div>
    </section>

    <!-- bottom action repeat -->
    <div class="actbar">
      <button class="actbtn" :class="{ on: liked }" @click="toggleLike">♥ <span>{{ likeCount }}</span></button>
      <button class="actbtn" @click="openBoost">⚡ Boost</button>
      <button class="actbtn donate" @click="openDonate">Donate</button>
    </div>
  </div>

  <!-- no story selected -->
  <div v-else class="empty-wrap">
    <p class="empty">No story selected.</p>
    <button class="postcta" @click="$emit('nav', 'feed')">Back to the feed</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCommonsStore } from "@/stores/commons";

const emit = defineEmits<{ (e: "nav", id: string): void }>();
const commons = useCommonsStore();

const p = computed(() => commons.activeProposal as any);

// local visual state (real like/boost/donate wired in step 6)
const liked = ref(false);
const following = ref(false);
const newComment = ref("");
const likeCount = computed(() => (p.value?.likes || 0) + (liked.value ? 1 : 0));

function toggleLike() { liked.value = !liked.value; }
function openBoost() { emit("nav", "feed"); /* placeholder; boost modal in step 6 */ }
function openDonate() { /* placeholder; donate modal in step 6 */ }
function postComment() {
  if (!newComment.value.trim() || !p.value) return;
  commons.postDiscussion?.(p.value.id, newComment.value.trim());
  newComment.value = "";
}

const firstIncomplete = computed(() => {
  if (!p.value?.milestones) return -1;
  return p.value.milestones.findIndex((m: any) => !m.completed);
});
const chapterText = computed(() => {
  const ms = p.value?.milestones || [];
  if (!ms.length) return "No chapters yet";
  const done = ms.filter((m: any) => m.completed).length;
  return `Chapter ${Math.min(done + 1, ms.length)} of ${ms.length}`;
});
const hasFacts = computed(() => {
  const x = p.value;
  return x && (x.productiveClaim || x.inputs || x.expectedOutput || x.demandSignal || x.riskBearer || x.failureHandling || x.publicBenefit);
});

const trackLabel = computed(() => (p.value?.track === "desk" ? "🏛 Under Treasury Desk review" : "⚡ Seeking donations"));
const trackClass = computed(() => (p.value?.track === "desk" ? "track--desk" : "track--don"));

function catLabel(c?: string) {
  return c === "production" ? "Production" : c === "productivity_public_good" ? "Productivity / Public-good" : (c || "Proposal");
}
function catBadgeClass(c?: string) {
  return c === "production" ? "cat--production" : "cat--publicgood";
}
const labelClass = computed(() => "lbl--" + commons.proposerLabel(p.value?.proposerAccountId || "").toLowerCase());
function shortId(id?: string) {
  if (!id) return "Unknown";
  return id.length > 16 ? id.slice(0, 8) + "…" + id.slice(-4) : id;
}
const deliverText = ref("");
const isMine = computed(() => p.value && p.value.proposerAccountId === commons.currentAccountId);
function submitDelivery(milestoneId: string) {
  if (!p.value || !deliverText.value.trim()) return;
  const ok = commons.markChapterDelivered(p.value.id, milestoneId, deliverText.value.trim());
  if (ok) deliverText.value = "";
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
.story { max-width: 760px; margin: 0 auto; }
.back { color: var(--gold-300); font-size: .86rem; margin-bottom: 16px; display: inline-block; cursor: pointer; }
.sd__badges { margin-bottom: 10px; }
.badge { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; font-family: var(--mono); padding: 4px 10px; border-radius: 999px; }
.cat--production { background: rgba(168,132,47,.12); color: #D9B871; border: 1px solid rgba(168,132,47,.4); }
.cat--publicgood { background: rgba(100,220,170,.10); color: #8FE0C0; border: 1px solid rgba(100,220,170,.35); }
.sd__whoinfo { display: flex; flex-direction: column; gap: 2px; }
.sd__name { display: inline-flex; align-items: center; gap: 8px; }
.sd__label { font-family: var(--mono); font-size: .58rem; text-transform: uppercase; letter-spacing: .05em; padding: 2px 7px; border-radius: 999px; }
.sd__label.lbl--newcomer { color: var(--info); border: 1px solid rgba(126,155,224,.4); }
.sd__label.lbl--proven { color: var(--affirm); border: 1px solid rgba(100,220,170,.4); }
.sd__label.lbl--veteran { color: var(--gold-300); border: 1px solid var(--gold-600); }
.sd__label.lbl--flagged { color: var(--negate); border: 1px solid rgba(255,100,100,.4); }
.sd__chap { color: var(--ink-dim); font-size: .82rem; }
.sd__title { font-family: var(--display); font-size: clamp(1.8rem,4vw,2.6rem); font-weight: 800; letter-spacing: -.02em; margin: 6px 0 12px; line-height: 1.1; }
.sd__who { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; cursor: pointer; }
.sd__who b { color: var(--ink); } .sd__who span { color: var(--ink-dim); font-size: .88rem; }
.av { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #22180a; font-size: .85rem; flex: none; }
.av.sm { width: 30px; height: 30px; font-size: .72rem; }
.trackline { margin-bottom: 16px; }
.track { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; font-family: var(--mono); padding: 4px 10px; border-radius: 999px; }
.track--don { background: rgba(201,168,76,.12); color: var(--gold-300); border: 1px solid var(--gold-600); }
.track--desk { background: rgba(126,155,224,.12); color: var(--info); border: 1px solid rgba(126,155,224,.4); }

.actbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r); padding: 14px 16px; margin-bottom: 8px; }
.actbtn { border: 1px solid var(--line); background: var(--navy-900); color: var(--ink); border-radius: var(--r-sm); padding: 9px 15px; font-size: .88rem; font-weight: 600; display: inline-flex; align-items: center; gap: 7px; cursor: pointer; }
.actbtn:hover { border-color: var(--gold-600); }
.actbtn.on { border-color: var(--gold-500); color: var(--gold-300); }
.actbtn.donate { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; }
.totals { display: flex; gap: 22px; flex-wrap: wrap; padding: 14px 2px 22px; color: var(--ink-faint); font-size: .84rem; }
.totals > div { text-align: center; }
.totals b { font-family: var(--mono); color: var(--gold-300); font-size: 1.05rem; display: block; }

.sec { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 22px; margin-bottom: 16px; }
.sec h2 { font-family: var(--display); font-size: 1.3rem; font-weight: 700; margin: 0 0 14px; }
.narrative { color: var(--ink-dim); line-height: 1.7; margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }.muted { color: var(--ink-faint); margin: 0; }
.files { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
.file { display: inline-flex; align-items: center; gap: 8px; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 9px 13px; font-size: .84rem; color: var(--ink-dim); }

.facts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .facts { grid-template-columns: 1fr; } }
.fact__l { font-size: .72rem; color: var(--ink-faint); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.fact__v { color: var(--ink-dim); font-size: .92rem; line-height: 1.5; overflow-wrap: anywhere; }

.chapter { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--line-soft); }
.chapter:last-child { border: none; }
.ch__dot { flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-family: var(--mono); font-size: .78rem; }
.ch__dot.done { background: rgba(100,220,170,.16); color: var(--affirm); }
.ch__dot.now { background: rgba(201,168,76,.16); color: var(--gold-300); }
.ch__dot.up { background: var(--navy-700); color: var(--ink-faint); }
.ch__b { flex: 1; }
.ch__b h4 { margin: 0 0 4px; font-size: 1rem; overflow-wrap: anywhere; }
.ch__meta { font-size: .78rem; color: var(--ink-faint); margin-bottom: 6px; font-family: var(--mono); }
.ch__ev { font-size: .82rem; color: var(--ink-dim); background: var(--navy-900); border-left: 2px solid var(--gold-600); padding: 8px 12px; border-radius: 0 var(--r-sm) var(--r-sm) 0; overflow-wrap: anywhere; }
.ch__st { font-size: .72rem; font-family: var(--mono); padding: 2px 8px; border-radius: 999px; align-self: flex-start; }
.ch__evlab { color: var(--ink-faint); font-weight: 600; }
.ch__ev--delivered { border-left-color: var(--affirm); }
.ch__deliver { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.ch__deliver textarea { width: 100%; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 9px 11px; color: var(--ink); font-family: inherit; font-size: .88rem; resize: vertical; }
.ch__deliver textarea:focus { outline: none; border-color: var(--gold-600); }
.ch__deliverbtn { align-self: flex-start; background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 8px 14px; font-weight: 700; font-size: .84rem; cursor: pointer; }
.ch__deliverbtn:disabled { opacity: .45; cursor: not-allowed; }
.st-done { background: rgba(100,220,170,.14); color: var(--affirm); }
.st-now { background: rgba(201,168,76,.14); color: var(--gold-300); }
.st-up { background: var(--line-soft); color: var(--ink-faint); }

.cmt { display: flex; gap: 10px; padding: 13px 0; border-bottom: 1px solid var(--line-soft); }
.cmt:last-of-type { border: none; }
.cmt.isprop { background: rgba(201,168,76,.05); margin: 0 -10px; padding: 13px 10px; border-radius: var(--r-sm); }
.cmt__b { flex: 1; }
.cmt__h { font-size: .84rem; margin-bottom: 3px; }
.cmt__h b { color: var(--ink); }
.cmt__h .prop { color: var(--gold-300); font-size: .64rem; font-family: var(--mono); border: 1px solid var(--gold-600); border-radius: 999px; padding: 1px 7px; margin-left: 6px; }
.cmt__t { color: var(--ink-dim); font-size: .9rem; overflow-wrap: anywhere; }
.cmtbox { display: flex; gap: 10px; margin-top: 14px; }
.cmtbox input { flex: 1; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 10px 12px; color: var(--ink); font-family: inherit; }
.cmtbox button { background: var(--gold-500); color: #22180a; border: none; border-radius: var(--r-sm); padding: 0 16px; font-weight: 600; cursor: pointer; }

.empty-wrap { text-align: center; padding: 60px 0; }
.empty { color: var(--ink-faint); margin-bottom: 16px; }
.postcta { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 11px 20px; font-weight: 700; cursor: pointer; }
</style>