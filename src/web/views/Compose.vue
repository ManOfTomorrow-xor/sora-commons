<template>
  <div class="compose">
    <header class="head">
      <h1>Tell the story of your work</h1>
      <p class="sub">Posting is free. Share what you're building, prove it milestone by milestone, and let people follow and support it.</p>
    </header>
    <div v-if="commons.hasDraft && !draftLoaded" class="draftbar">
      <span class="draftbar__txt">You have a saved draft.</span>
      <button class="draftbar__btn" @click="onResumeDraft">Resume</button>
      <button class="draftbar__btn draftbar__btn--ghost" @click="onDiscardDraft">Discard</button>
    </div>
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
        <label class="field"><span class="field__label">Supporting documents <span class="hint">(optional)</span></span>
          <button type="button" class="filebtn" @click="pickDoc" :disabled="posting">📎 Add files</button>
          <span class="field__hint">Optional — attaching a spec, whitepaper, or reference (PDF or image) strengthens your story and helps backers trust the work. Removable until you post.</span>
          <div v-if="stagedDocs.length" class="cdocs">
            <div v-for="(item, idx) in stagedDocs" :key="idx" class="cdocrow">
              <span class="cdoc_ic">{{ item.type === 'application/pdf' ? '📄' : '🖼️' }}</span>
              <span class="cdoc_nm">{{ item.name }}</span>
              <button type="button" class="cdoc_x" @click="removeDoc(idx)" title="Remove">✕</button>
            </div>
          </div>
          <input ref="docInput" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" style="display:none" @change="onDocPicked" />
          <p v-if="docError" class="cdoc_err">{{ docError }}</p>
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

    <div class="bar__status">
        <div v-if="showBlockers && blockers.length" class="bar__blockers">
          <span class="bar__blockers_h">To post, finish {{ blockers.length }} {{ blockers.length === 1 ? 'thing' : 'things' }}:</span>
          <ul><li v-for="(b, i) in blockers" :key="i">{{ b }}</li></ul>
        </div>
      </div>
      <label class="confirm-permanent">
        <input type="checkbox" v-model="confirmedPermanent" />
        <span>Once published, this becomes a permanent part of the public record — it can't be edited or deleted.</span>
      </label>
      <div v-if="showOverwritePrompt" class="overwrite">
        <span>You already have a saved draft. Overwrite it with this one?</span>
        <button class="bar__btn bar__btn--ghost" @click="doSaveDraft">Overwrite</button>
        <button class="bar__btn bar__btn--ghost" @click="showOverwritePrompt = false">Keep old</button>
      </div>
      <button class="bar__btn bar__btn--ghost" :disabled="posting || savingDraft" @click="onSaveDraft">{{ savingDraft ? "Saving…" : "Save for later" }}</button>
      <button class="bar__btn btn-gold" :disabled="posting || !confirmedPermanent" @click="onPost">{{ posting ? "Posting..." : "Post your story" }}</button>
    <p v-if="message" class="result" :class="{ 'result--err': isError }">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount  } from "vue";
import { useCommonsStore } from "@/stores/commons";
import CharCount from "../components/CharCount.vue";

onMounted(async () => {
  window.scrollTo(0, 0);
  // sync decision FIRST (no await before it) so the form never flashes old content
 if (commons.resumingDraft) {
    commons.resumingDraft = false;   // arrived via Resume/Continue — keep loaded content
    stagedDocs.value = (commons.draftFiles || []).map((f: any) => ({ kind: 'draft', name: f.name, url: f.url, path: f.path, type: f.type }));
    draftLoaded.value = true;
  } else {
    draftLoaded.value = false;       // fresh nav — store already cleared on last unmount
  }
  await commons.checkDraft();        // sets hasDraft for the banner
});

onBeforeUnmount(() => {
  // live form is ephemeral — clear it on leave (saved draft lives in the DB, so this is safe)
  if (!commons.resumingDraft) commons.resetDraft();
});

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
const confirmedPermanent = ref(false);
const savingDraft = ref(false);
const showOverwritePrompt = ref(false);
async function onSaveDraft() {
  if (commons.hasDraft && !draftLoaded.value) { showOverwritePrompt.value = true; return; }
  await doSaveDraft();
}
async function doSaveDraft() {
  showOverwritePrompt.value = false;
  savingDraft.value = true;
  const fileRefs: any[] = [];
  for (const item of stagedDocs.value) {
    if (item.kind === 'draft') {
      fileRefs.push({ name: item.name, url: item.url, path: item.path, type: item.type });
    } else {
      const r = await commons.uploadDraftFile(item.file);
      if (r) fileRefs.push(r);
    }
  }
  const ok = await commons.saveDraft(fileRefs);
  savingDraft.value = false;
  message.value = ok ? "Draft saved. Resume it from Post or your profile." : "Couldn't save draft — try again.";
  isError.value = !ok;
}
const draftLoaded = ref(false);
async function onResumeDraft() {
  await commons.loadDraft();
  stagedDocs.value = (commons.draftFiles || []).map((f: any) => ({ kind: 'draft', name: f.name, url: f.url, path: f.path, type: f.type }));
  draftLoaded.value = true;
  message.value = "";
}
async function onDiscardDraft() { await commons.deleteDraft(); draftLoaded.value = true; }
const message = ref("");
const isError = ref(false);
const showBlockers = ref(false);

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

const ready = computed(() => blockers.value.length === 0);

const blockers = computed(() => {
  const c = commons;
  const out: string[] = [];
  const todayStr = new Date().toISOString().split("T")[0];
  if (!c.draftTitle.trim()) out.push("Add a title");
  if (!c.draftDescription.trim()) out.push("Add a one-line summary");
  if (!c.draftStory.trim()) out.push("Tell your story");
  if (!c.draftCategory) out.push("Pick a category (Production or Productivity / Public-good)");
  if (c.draftFundingMode === "goal" && !(Number(c.draftXorRequested) > 0)) out.push("Set the total XOR requested");
  if (c.draftMilestones.length === 0) out.push("Add at least one chapter");
  c.draftMilestones.forEach((m: any, i: number) => {
    const n = i + 1;
    if (!m.description.trim()) out.push(`Chapter ${n}: add what gets delivered`);
    if (!m.timeline.trim()) out.push(`Chapter ${n}: set the evidence due date`);
    else if (m.timeline < todayStr) out.push(`Chapter ${n}: the due date can't be in the past`);
    if (!(m.evidence || "").trim()) out.push(`Chapter ${n}: add the evidence you'll present`);
  });
  if (datesOutOfOrder.value) out.push("Each chapter's date must be on or after the previous chapter's");
  if (overLimit.value) out.push("Some fields are over the character limit — trim them");
  return out;
});

type StagedItem =
  | { kind: 'new'; file: File; name: string; type: string }
  | { kind: 'draft'; name: string; url: string; path: string; type: string };
const stagedDocs = ref<StagedItem[]>([]);
const docInput = ref<HTMLInputElement | null>(null);
const docError = ref("");
function pickDoc() { docError.value = ""; docInput.value?.click(); }
function onDocPicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const okTypes = ["application/pdf","image/jpeg","image/png","image/webp"];
  if (!okTypes.includes(file.type)) { docError.value = "Use a PDF or image."; return; }
  if (file.size > 10*1024*1024) { docError.value = "File must be under 10 MB."; return; }
  if (stagedDocs.value.length >= 5) { docError.value = "Up to 5 files."; return; }
 stagedDocs.value = [...stagedDocs.value, { kind: 'new', file, name: file.name, type: file.type }];
  docError.value = "";
  (e.target as HTMLInputElement).value = "";
}
function removeDoc(idx: number) { stagedDocs.value = stagedDocs.value.filter((_, i) => i !== idx); }
function minDate(_i?: number): string {
  // earliest selectable date for a chapter's due-date input = today
  return new Date().toISOString().split("T")[0];
}
async function onPost() {
  if (!ready.value) { showBlockers.value = true; return; }
  showBlockers.value = false;
  if (!commons.isConnected) { message.value = "Connect an account to post. Your story is saved in this form."; isError.value = true; return; }
  posting.value = true; message.value = ""; isError.value = false;
  try {
    const created = await commons.submitProposal();
    if (created) {
      // upload staged supporting documents against the new proposal id
      for (const item of stagedDocs.value) {
        if (item.kind === 'new') {
          const res = await commons.uploadDocument(item.file, { proposalId: created.id });
          if (!res.ok) console.error("proposal doc upload failed:", res.error);
        } else {
          const res = await commons.linkDraftFileToProposal(item, created.id);
          if (!res.ok) console.error("draft doc link failed:", res.error);
        }
      }
      stagedDocs.value = [];
      await commons.deleteDraft(false);
      await commons.loadProposals();
      message.value = "Your story is live.";
      emit("nav", "feed");
    } else {
      message.value = "Could not post. Check the required fields."; isError.value = true;
    }
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
.confirm-permanent { display: flex; gap: 9px; align-items: center; font-size: .82rem; color: var(--ink-dim); line-height: 1.35; cursor: pointer; margin: 4px 0 10px; }
.confirm-permanent input { accent-color: var(--gold-500); cursor: pointer; flex-shrink: 0; width: 16px; height: 16px; }
.confirm-permanent:hover { color: var(--ink); }
.bar__btn--ghost { background: transparent; color: var(--gold-300); border: 1px solid var(--line); box-shadow: none; margin-right: 8px; }
.bar__btn--ghost:hover { border-color: var(--gold-600); background: var(--line-soft); transform: none; filter: none; box-shadow: none; }
.draftbar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 16px; background: rgba(201,168,76,.08); border: 1px solid var(--line); border-radius: var(--r); }
.draftbar__txt { color: var(--ink-dim); font-size: .9rem; flex: 1; }
.draftbar__btn { padding: 6px 14px; border-radius: var(--r-sm); border: none; background: var(--gold-600); color: #22180a; font-weight: 600; font-size: .85rem; cursor: pointer; }
.draftbar__btn--ghost { background: transparent; color: var(--ink-dim); border: 1px solid var(--line); }
.bar__btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,168,76,.34); filter: brightness(1.06); }
.bar__btn:disabled { opacity: .45; cursor: not-allowed; }
.bar__blockers { font-size: .8rem; max-height: 120px; overflow-y: auto; }
.bar__blockers_h { color: var(--negate); font-weight: 600; display: block; margin-bottom: 4px; }
.bar__blockers ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 2px; }
.bar__blockers li { color: var(--ink-dim); }
.result { padding: 12px 16px; border-radius: var(--r); background: rgba(100,220,170,.1); color: var(--affirm); margin: 0; }
.result--err { background: rgba(255,100,100,.1); color: var(--negate); }
.ch__attach:hover:not(:disabled) { border-color: var(--gold-600); color: var(--gold-300); }
.cdocs { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.cdocrow { display: flex; align-items: center; gap: 8px; font-size: .82rem; color: var(--ink); background: var(--navy-900); border: 1px solid var(--line-soft); border-radius: var(--r-sm); padding: 5px 10px; }
.cdoc_ic { flex: none; }
.cdoc_nm { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cdoc_x { background: none; border: none; color: var(--ink-dim); cursor: pointer; font-size: .9rem; flex: none; }
.cdoc_x:hover { color: var(--negate); }
.cdoc_err { font-size: .78rem; color: var(--negate); margin: 4px 0 0; }
.field__hint { font-size: .74rem; color: var(--ink-faint); line-height: 1.4; margin-top: 4px; display: block; }
.overwrite { display: flex; align-items: center; gap: 10px; padding: 10px 14px; margin-bottom: 10px; background: rgba(201,168,76,.10); border: 1px solid var(--gold-600); border-radius: var(--r-sm); font-size: .85rem; color: var(--ink-dim); flex-wrap: wrap; }
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