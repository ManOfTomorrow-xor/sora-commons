<template>
  <div class="compose">
    <header class="head">
      <h1>Tell the story of your work</h1>
      <p class="sub">Posting is free. Share what you're building, prove it milestone by milestone, and let people follow and support it.</p>
    </header>
    <div v-if="!isConnected" class="notice">You can write your story now. Posting comes once an account is connected.</div>

    <section class="sec">
      <div class="sec__body">
        <h2>Your story</h2>
        <label class="field"><span class="field__label">Title</span><input v-model="commons.draftTitle" type="text" placeholder="One line — what are you building?" /><CharCount :value="commons.draftTitle" :max="LIMITS.title" /></label>
        <label class="field"><span class="field__label">One-line summary <span class="hint">(shows on your story card)</span></span><input v-model="commons.draftDescription" type="text" placeholder="A single sentence that draws people in" /><CharCount :value="commons.draftDescription" :max="LIMITS.description" /></label>
        <label class="field field--story">
          <span class="field__label">The story <span class="hint">(the heart of your post)</span></span>
          <textarea v-model="commons.draftStory" rows="8" placeholder="Who are you? What are you building, and why does it matter? Tell people the real story behind the work — the more honest and specific, the more they'll connect with it."></textarea>
          <CharCount :value="commons.draftStory" :max="LIMITS.story" />
        </label>
        <label class="field"><span class="field__label">Attach files <span class="hint">(coming soon)</span></span>
          <button type="button" class="filebtn" @click="filesNote">📎 Add files</button>
        </label>
        <div class="field"><span class="field__label">Category</span>
          <div class="cats">
            <button type="button" class="cat" :class="{ 'cat--on': commons.draftCategory === 'production' }" @click="commons.draftCategory = 'production'"><strong>Production</strong><span>Finances inputs to produce a real good or service.</span></button>
            <button type="button" class="cat" :class="{ 'cat--on': commons.draftCategory === 'productivity_public_good' }" @click="commons.draftCategory = 'productivity_public_good'"><strong>Productivity / Public-good</strong><span>Infrastructure that lowers cost for many.</span></button>
          </div>
        </div>
        <div class="field"><span class="field__label">Funding track</span>
          <div class="cats">
            <button type="button" class="cat cat--on"><strong><svg class="track__ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg> Seeking donations</strong><span>Community supports your work directly. Available now.</span></button>
            <button type="button" class="cat cat--disabled" disabled><strong>🏛 Treasury Desk review</strong><span>Unlocks once the Desk is reviewing your proposal and issues a signal. Coming soon.</span></button>
          </div>
        </div>
      </div>
    </section>

    <section class="sec">
      <div class="sec__body">
        <h2>The facts behind it</h2>
        <label class="field"><span class="field__label">The productive claim</span><textarea v-model="commons.draftProductiveClaim" rows="2" placeholder="What capacity will exist that does not now?"></textarea><CharCount :value="commons.draftProductiveClaim" :max="LIMITS.productiveClaim" /></label>
        <label class="field"><span class="field__label">Inputs to be financed</span><textarea v-model="commons.draftInputs" rows="2" placeholder="What the support actually buys"></textarea><CharCount :value="commons.draftInputs" :max="LIMITS.inputs" /></label>
        <label class="field"><span class="field__label">Expected output</span><textarea v-model="commons.draftExpectedOutput" rows="2" placeholder="The concrete thing that should exist on success"></textarea><CharCount :value="commons.draftExpectedOutput" :max="LIMITS.expectedOutput" /></label>
        <label class="field"><span class="field__label">Demand signal <span class="hint">(optional)</span></span><textarea v-model="commons.draftDemandSignal" rows="2" placeholder="Evidence the output is wanted"></textarea><CharCount :value="commons.draftDemandSignal" :max="LIMITS.demandSignal" /></label>
      </div>
    </section>

    <section class="sec">
      <div class="sec__body">
        <h2>The chapters</h2>

        <div class="field"><span class="field__label">Funding</span>
          <div class="cats">
            <button type="button" class="cat" :class="{ 'cat--on': commons.draftFundingMode === 'goal' }" @click="commons.draftFundingMode = 'goal'"><strong>Set a funding goal</strong><span>Ask for a specific total XOR amount.</span></button>
            <button type="button" class="cat" :class="{ 'cat--on': commons.draftFundingMode === 'open' }" @click="commons.draftFundingMode = 'open'"><strong>Open to any donations</strong><span>No set goal — accept whatever supporters give.</span></button>
          </div>
        </div>

        <label v-if="commons.draftFundingMode === 'goal'" class="field field--narrow"><span class="field__label">Total XOR requested</span><input v-model="commons.draftXorRequested" type="number" min="0" placeholder="0" /></label>
        <p v-else class="openhint">Open to any donations — supporters give what they like, and no goal amount is shown. You can still lay out the chapters you'll deliver below.</p>

        <div class="ms">
          <div v-for="(m, i) in commons.draftMilestones" :key="i" class="ms__row">
            <div class="ms__head"><span class="ms__tag">Chapter {{ i + 1 }}</span><button v-if="commons.draftMilestones.length > 1" type="button" class="ms__rm" @click="commons.removeMilestone(i)">Remove</button></div>
            <input v-model="m.description" type="text" placeholder="What gets delivered in this chapter?" />
            <CharCount :value="m.description" :max="LIMITS.chapterDesc" />
            <label class="ms__date"><span>Evidence due by</span><input v-model="m.timeline" type="date" :min="minDate(i)" /></label>
            <label class="ms__evlabel">Evidence you'll present</label>
            <textarea v-model="m.evidence" rows="2" placeholder="What proof will you show when this chapter is done? (e.g. receipts, photos, a working link)"></textarea>
            <CharCount :value="m.evidence" :max="LIMITS.chapterEvidence" />
          </div>
          <button type="button" class="ms__add" @click="commons.addMilestone()">+ Add chapter</button>
        </div>
      </div>
    </section>

    <section class="sec">
      <div class="sec__body">
        <h2>Risk and failure <span class="hint">(optional)</span></h2>
        <label class="field"><span class="field__label">Who carries the risk?</span><input v-model="commons.draftRiskBearer" type="text" placeholder="Who is accountable if this fails?" /><CharCount :value="commons.draftRiskBearer" :max="LIMITS.riskBearer" /></label>
        <label class="field"><span class="field__label">On honest failure?</span><textarea v-model="commons.draftFailureHandling" rows="2" placeholder="If attempted in good faith but it does not deliver, what then?"></textarea><CharCount :value="commons.draftFailureHandling" :max="LIMITS.failureHandling" /></label>
        <label class="field"><span class="field__label">Public spillovers</span><textarea v-model="commons.draftPublicBenefit" rows="2" placeholder="Who else gains? Lower fees, shared infrastructure..."></textarea><CharCount :value="commons.draftPublicBenefit" :max="LIMITS.publicBenefit" /></label>
      </div>
    </section>

    <div class="bar">
      <div class="bar__status"><span v-if="overLimit" class="bar__over">Some fields are over the character limit — trim them to post.</span><span v-else-if="!ready" class="bar__todo">{{ todo }}</span><span v-else class="bar__ok">Ready to post your story.</span></div>
      <button class="bar__btn btn-gold" :disabled="!ready || posting" @click="onPost">{{ posting ? "Posting..." : "Post your story" }}</button>
    </div>
    <p v-if="message" class="result" :class="{ 'result--err': isError }">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCommonsStore } from "@/stores/commons";
import CharCount from "../components/CharCount.vue";

const emit = defineEmits<{ (e: "nav", id: string): void }>();
const commons = useCommonsStore();

const LIMITS = {
  title: 120,
  description: 160,
  story: 5000,
  productiveClaim: 400,
  inputs: 400,
  expectedOutput: 400,
  demandSignal: 400,
  riskBearer: 160,
  failureHandling: 400,
  publicBenefit: 400,
  chapterDesc: 200,
  chapterEvidence: 500,
};

const isConnected = computed(() => commons.isConnected);
const posting = ref(false);
const message = ref("");
const isError = ref(false);

const datesOutOfOrder = computed(() => {
  const ms = commons.draftMilestones;
  for (let i = 1; i < ms.length; i++) {
    const prev = ms[i - 1].timeline;
    const cur = ms[i].timeline;
    if (prev && cur && cur < prev) return true; // chapter i is before chapter i-1
  }
  return false;
});

const overLimit = computed(() => {
  const c = commons;
  const len = (s: any) => String(s || "").length;
  if (len(c.draftTitle) > LIMITS.title) return true;
  if (len(c.draftDescription) > LIMITS.description) return true;
  if (len(c.draftStory) > LIMITS.story) return true;
  if (len(c.draftProductiveClaim) > LIMITS.productiveClaim) return true;
  if (len(c.draftInputs) > LIMITS.inputs) return true;
  if (len(c.draftExpectedOutput) > LIMITS.expectedOutput) return true;
  if (len(c.draftDemandSignal) > LIMITS.demandSignal) return true;
  if (len(c.draftRiskBearer) > LIMITS.riskBearer) return true;
  if (len(c.draftFailureHandling) > LIMITS.failureHandling) return true;
  if (len(c.draftPublicBenefit) > LIMITS.publicBenefit) return true;
  return c.draftMilestones.some((m: any) => len(m.description) > LIMITS.chapterDesc || len(m.evidence) > LIMITS.chapterEvidence);
});

const ready = computed(() => {
  if (!commons.draftTitle.trim()) return false;
  if (!commons.draftDescription.trim()) return false;
  if (!commons.draftStory.trim()) return false;
  if (!commons.draftCategory) return false;
  if (commons.draftFundingMode === "goal" && !(Number(commons.draftXorRequested) > 0)) return false;
  if (commons.draftMilestones.length === 0) return false;
  if (!commons.draftMilestones.every((m: any) => m.description.trim() && m.timeline.trim() && (m.evidence || "").trim())) return false;
  if (datesOutOfOrder.value) return false;
  if (overLimit.value) return false;
  return true;
});

const todo = computed(() => {
  if (!commons.draftTitle.trim()) return "Add a title";
  if (!commons.draftDescription.trim()) return "Add a one-line summary";
  if (!commons.draftStory.trim()) return "Tell your story";
  if (!commons.draftCategory) return "Pick a category";
  if (commons.draftFundingMode === "goal" && !(Number(commons.draftXorRequested) > 0)) return "Set the total XOR requested";
  if (!commons.draftMilestones.every((m: any) => m.description.trim() && m.timeline.trim() && (m.evidence || "").trim())) return "Each chapter needs a description, a due date, and the evidence you'll present";
  if (datesOutOfOrder.value) return "Each chapter's date must be on or after the previous chapter's";
  return "Complete the required fields";
});

function filesNote() { message.value = "File attachments are coming soon."; isError.value = false; }

function minDate(i: number): string {
  // a chapter's date can't be before the previous chapter's date
  if (i === 0) {
    const today = new Date();
    return today.toISOString().split("T")[0]; // first chapter: not in the past
  }
  const prev = commons.draftMilestones[i - 1]?.timeline;
  return prev || new Date().toISOString().split("T")[0];
}

function onPost() {
  if (!ready.value) return;
  if (!commons.isConnected) { message.value = "Connect an account to post. Your story is saved in this form."; isError.value = true; return; }
  posting.value = true; message.value = ""; isError.value = false;
  try {
    const created = commons.submitProposal();
    if (created) { message.value = "Your story is live."; commons.setActiveProposal(created.id); emit("nav", "story"); }
    else { message.value = "Could not post. Check the required fields."; isError.value = true; }
  } catch (e) { message.value = "Post failed."; isError.value = true; }
  finally { posting.value = false; }
}
</script>

<style scoped>
.track__ic { width: 15px; height: 15px; vertical-align: -2px; }
.compose { display: flex; flex-direction: column; gap: 16px; max-width: 760px; margin: 0 auto; width: 100%; }
.head h1 { font-family: var(--display); font-size: 2rem; font-weight: 800; letter-spacing: -.02em; margin: 0 0 6px; }
.sub { color: var(--ink-dim); margin: 0; line-height: 1.6; }
.notice { background: rgba(126,155,224,.08); border: 1px solid var(--line-soft); border-radius: var(--r); padding: 14px 16px; color: var(--ink-dim); font-size: .9rem; }
.sec { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 22px; }
.sec__body h2 { font-family: var(--display); font-size: 1.25rem; font-weight: 700; margin: 0 0 16px; }
.hint { color: var(--ink-faint); font-weight: 400; font-size: .76rem; }
.field { display: block; margin-bottom: 14px; }
.field--narrow { max-width: 220px; }
.field--story textarea { border-color: var(--gold-600); }
.field__label { display: block; font-size: .85rem; color: var(--ink-dim); margin-bottom: 6px; }
input, textarea { width: 100%; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 10px 12px; color: var(--ink); font-family: inherit; font-size: .92rem; resize: vertical; }
input:focus, textarea:focus { outline: none; border-color: var(--gold-600); }
.field--story textarea { font-size: 1rem; line-height: 1.6; }
.filebtn { background: var(--navy-900); border: 1px dashed var(--line); border-radius: var(--r-sm); color: var(--ink-dim); padding: 10px 14px; cursor: pointer; }
.filebtn:hover { border-color: var(--gold-600); color: var(--gold-300); }
.openhint { color: var(--ink-dim); font-size: .85rem; line-height: 1.55; background: var(--navy-900); border: 1px solid var(--line-soft); border-radius: var(--r-sm); padding: 12px 14px; margin: 0 0 14px; }
.cats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cat { text-align: left; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r); padding: 14px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; }
.cat strong { color: var(--ink); font-size: .95rem; }
.cat span { color: var(--ink-faint); font-size: .8rem; }
.cat--on { border-color: var(--gold-500); background: rgba(201,168,76,.08); }
.cat--disabled { opacity: .45; cursor: not-allowed; }
.cat--disabled:hover { border-color: var(--line); }
.ms { display: flex; flex-direction: column; gap: 12px; }
.ms__row { background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r); padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.ms__head { display: flex; justify-content: space-between; align-items: center; }
.ms__tag { font-family: var(--mono); font-size: .74rem; color: var(--gold-300); }
.ms__rm { background: none; border: none; color: var(--negate); font-size: .8rem; cursor: pointer; width: auto; }
.ms__add { background: none; border: 1px dashed var(--line); border-radius: var(--r-sm); color: var(--gold-300); padding: 10px; cursor: pointer; width: 100%; }
.ms__date { display: flex; flex-direction: column; gap: 4px; max-width: 240px; }
.ms__date span { font-size: .7rem; color: var(--ink-faint); }
.ms__date input { width: 100%; }
.ms__date input::-webkit-calendar-picker-indicator { filter: invert(1) sepia(1) saturate(3) hue-rotate(5deg); opacity: .7; cursor: pointer; }
.ms__date input::-webkit-calendar-picker-indicator:hover { opacity: 1; }
.ms__evlabel { font-size: .7rem; color: var(--ink-faint); }
.bar { position: sticky; bottom: 0; display: flex; align-items: center; justify-content: space-between; gap: 14px; background: rgba(11,18,32,.92); backdrop-filter: blur(12px); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px 20px; }
.bar__todo { color: var(--ink-faint); font-size: .88rem; }
.bar__ok { color: var(--affirm); font-size: .88rem; }
.bar__over { color: var(--negate); font-size: .88rem; font-weight: 600; }
.bar__btn { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 12px 22px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 12px rgba(201,168,76,.22); transition: transform .15s var(--ease), box-shadow .15s var(--ease), filter .15s var(--ease); }
.bar__btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,168,76,.34); filter: brightness(1.06); }
.bar__btn:disabled { opacity: .45; cursor: not-allowed; }
.result { padding: 12px 16px; border-radius: var(--r); background: rgba(100,220,170,.1); color: var(--affirm); margin: 0; }
.result--err { background: rgba(255,100,100,.1); color: var(--negate); }
@media (max-width: 720px) { .cats { grid-template-columns: 1fr; } }
@media (max-width: 720px) 
  .head h1 { font-size: 1.5rem; }
  .sec { padding: 16px; }
  .sec__body h2 { font-size: 1.12rem; margin-bottom: 12px; }
  .cats { grid-template-columns: 1fr; }
  .cat { padding: 12px; }
  .field { margin-bottom: 12px; }
  .ms__row { padding: 12px; }
  .ms__date { max-width: 100%; }
  .bar { padding: 12px 14px; gap: 10px; flex-wrap: wrap; }
  .bar__btn { padding: 11px 18px; }
  .bar { position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); z-index: 40; }
  .compose { padding-bottom: 84px; }
  .ms__row input, .ms__row textarea { font-size: .74rem; line-height: 1.4; }
  .ms__row textarea { min-height: 76px; }
</style>