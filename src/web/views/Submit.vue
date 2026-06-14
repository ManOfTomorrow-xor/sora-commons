<template>
  <div class="submit">
    <header class="head">
      <h1>Open the file on your claim</h1>
      <p class="sub">A proposal is a claim on real value. Name what it funds and what evidence releases each payment.</p>
    </header>
    <div v-if="!isConnected" class="notice">You can fill this out now. Submitting comes once an account is connected.</div>
    <section class="sec">
      <div class="sec__body">
        <h2>What is this?</h2>
        <label class="field"><span class="field__label">Title</span><input v-model="commons.draftTitle" type="text" placeholder="One line" maxlength="120" /></label>
        <label class="field"><span class="field__label">Summary</span><textarea v-model="commons.draftDescription" rows="3" placeholder="One or two sentences"></textarea></label>
        <div class="field"><span class="field__label">Category</span>
          <div class="cats">
            <button type="button" class="cat" :class="{ 'cat--on': commons.draftCategory === 'production' }" @click="commons.draftCategory = 'production'"><strong>Production</strong><span>Finances inputs to produce a real good or service.</span></button>
            <button type="button" class="cat" :class="{ 'cat--on': commons.draftCategory === 'productivity_public_good' }" @click="commons.draftCategory = 'productivity_public_good'"><strong>Productivity / Public-good</strong><span>Infrastructure that lowers cost for many.</span></button>
          </div>
          <p class="hint">The Commons does not fund speculation.</p>
        </div>
      </div>
    </section>
    <section class="sec">
      <div class="sec__body">
        <h2>What productive future does this fund?</h2>
        <label class="field"><span class="field__label">The productive claim</span><textarea v-model="commons.draftProductiveClaim" rows="2" placeholder="What capacity will exist?"></textarea></label>
        <label class="field"><span class="field__label">Inputs to be financed</span><textarea v-model="commons.draftInputs" rows="2" placeholder="What the XOR buys"></textarea></label>
        <label class="field"><span class="field__label">Expected output</span><textarea v-model="commons.draftExpectedOutput" rows="2" placeholder="Output on success"></textarea></label>
        <label class="field"><span class="field__label">Demand signal (optional)</span><textarea v-model="commons.draftDemandSignal" rows="2" placeholder="Evidence wanted"></textarea></label>
      </div>
    </section>
    <section class="sec">
      <div class="sec__body">
        <h2>The ask and milestones</h2>
        <label class="field field--narrow"><span class="field__label">Total XOR requested</span><input v-model="commons.draftXorRequested" type="number" min="0" placeholder="0" /></label>
        <div class="ms">
          <div v-for="(m, i) in commons.draftMilestones" :key="i" class="ms__row">
            <div class="ms__head"><span class="ms__tag">Milestone {{ i + 1 }}</span><button v-if="commons.draftMilestones.length > 1" type="button" class="ms__rm" @click="commons.removeMilestone(i)">Remove</button></div>
            <input v-model="m.description" type="text" placeholder="What gets delivered?" />
            <div class="ms__grid"><input v-model="m.xorAmount" type="number" min="0" placeholder="XOR amount" /><input v-model="m.timeline" type="text" placeholder="Timeline" /></div>
            <textarea v-model="m.evidence" rows="2" placeholder="Evidence that releases this milestone"></textarea>
          </div>
          <button type="button" class="ms__add" @click="commons.addMilestone()">+ Add milestone</button>
        </div>
        <div class="tally" :class="{ 'tally--bad': milestoneMismatch }">Milestones total: {{ milestoneSum }} XOR. Requested: {{ commons.draftXorRequested || 0 }} XOR<span v-if="milestoneMismatch"> (must match)</span></div>
        <p class="hint">5 XOR burns on submission. 1% of each milestone burns when confirmed.</p>
      </div>
    </section>
    <section class="sec">
      <div class="sec__body">
        <h2>Risk and failure (optional)</h2>
        <label class="field"><span class="field__label">Who carries the risk?</span><input v-model="commons.draftRiskBearer" type="text" placeholder="Accountable if it fails?" /></label>
        <label class="field"><span class="field__label">On honest failure?</span><textarea v-model="commons.draftFailureHandling" rows="2" placeholder="What then?"></textarea></label>
      </div>
    </section>
    <section class="sec">
      <div class="sec__body">
        <h2>Public spillovers (optional)</h2>
        <label class="field"><span class="field__label">Who else gains?</span><textarea v-model="commons.draftPublicBenefit" rows="2" placeholder="Lower fees, shared infrastructure"></textarea></label>
      </div>
    </section>
    <div class="bar">
      <div class="bar__status"><span v-if="!ready" class="bar__todo">{{ todo }}</span><span v-else class="bar__ok">Ready to submit. 5 XOR will burn.</span></div>
      <button class="bar__btn" :disabled="!ready || submitting" @click="onSubmit">{{ submitting ? "Submitting..." : "Submit proposal" }}</button>
    </div>
    <p v-if="message" class="result" :class="{ 'result--err': isError }">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCommonsStore } from "@/stores/commons";
const emit = defineEmits<{ (e: "nav", id: string): void }>();
const commons = useCommonsStore();
const isConnected = computed(() => commons.isConnected);
const submitting = ref(false);
const message = ref("");
const isError = ref(false);
const milestoneSum = computed(() => commons.draftMilestones.reduce((s, m) => s + Number(m.xorAmount || 0), 0));
const milestoneMismatch = computed(() => {
  const req = Number(commons.draftXorRequested || 0);
  return req > 0 && milestoneSum.value > 0 && req !== milestoneSum.value;
});
const ready = computed(() => !!commons.draftTitle.trim() && !!commons.draftDescription.trim() && !!commons.draftCategory && !!commons.draftProductiveClaim.trim() && !!commons.draftInputs.trim() && !!commons.draftExpectedOutput.trim() && Number(commons.draftXorRequested) > 0 && commons.draftMilestones.length > 0 && commons.draftMilestones.every((m) => m.description.trim() && Number(m.xorAmount) > 0 && m.timeline.trim()) && !milestoneMismatch.value);
const todo = computed(() => {
  if (!commons.draftTitle.trim()) return "Add a title";
  if (!commons.draftDescription.trim()) return "Add a summary";
  if (!commons.draftCategory) return "Pick a category";
  if (!commons.draftProductiveClaim.trim()) return "Describe the productive claim";
  if (!commons.draftInputs.trim()) return "List the inputs";
  if (!commons.draftExpectedOutput.trim()) return "Describe the expected output";
  if (!(Number(commons.draftXorRequested) > 0)) return "Set the XOR requested";
  if (!commons.draftMilestones.every((m) => m.description.trim() && Number(m.xorAmount) > 0 && m.timeline.trim())) return "Complete each milestone";
  if (milestoneMismatch.value) return "Milestones must equal the total";
  return "Complete the required sections";
});
function onSubmit() {
  if (!ready.value) return;
  if (!commons.isConnected) { message.value = "Connect an account to submit."; isError.value = true; return; }
  submitting.value = true; message.value = ""; isError.value = false;
  try {
    const created = commons.submitProposal();
    if (created) { message.value = "Proposal submitted. 5 XOR burned."; emit("nav", "proposals"); }
    else { message.value = "Could not submit."; isError.value = true; }
  } catch (e) { message.value = "Submit failed."; isError.value = true; }
  finally { submitting.value = false; }
}
</script>

<style scoped>
.submit { display: flex; flex-direction: column; gap: 18px; max-width: 760px; }
.head h1 { font-family: var(--display); font-size: 2rem; margin: 0 0 6px; }
.sub { color: var(--ink-dim); margin: 0; }
.notice { background: rgba(126,155,224,.08); border: 1px solid var(--line-soft); border-radius: var(--r); padding: 14px 16px; color: var(--ink-dim); font-size: .9rem; }
.sec { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 22px; }
.sec__body h2 { font-family: var(--display); font-size: 1.25rem; margin: 0 0 16px; }
.field { display: block; margin-bottom: 14px; }
.field--narrow { max-width: 220px; }
.field__label { display: block; font-size: .85rem; color: var(--ink-dim); margin-bottom: 6px; }
input, textarea { width: 100%; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 10px 12px; color: var(--ink); font-family: inherit; font-size: .92rem; resize: vertical; }
input:focus, textarea:focus { outline: none; border-color: var(--gold-600); }
.hint { color: var(--ink-faint); font-size: .82rem; margin: 6px 0 0; }
.cats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cat { text-align: left; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r); padding: 14px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; }
.cat strong { color: var(--ink); font-size: .95rem; }
.cat span { color: var(--ink-faint); font-size: .8rem; }
.cat--on { border-color: var(--gold-500); background: rgba(201,168,76,.08); }
.cat--on strong { color: var(--gold-300); }
.ms { display: flex; flex-direction: column; gap: 12px; }
.ms__row { background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r); padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.ms__head { display: flex; justify-content: space-between; align-items: center; }
.ms__tag { font-family: var(--mono); font-size: .74rem; color: var(--gold-300); }
.ms__rm { background: none; border: none; color: var(--negate); font-size: .8rem; cursor: pointer; width: auto; }
.ms__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ms__add { background: none; border: 1px dashed var(--line); border-radius: var(--r-sm); color: var(--gold-300); padding: 10px; cursor: pointer; width: 100%; }
.tally { font-family: var(--mono); font-size: .82rem; color: var(--ink-dim); margin-top: 12px; }
.tally--bad { color: var(--negate); }
.bar { position: sticky; bottom: 0; display: flex; align-items: center; justify-content: space-between; gap: 14px; background: rgba(11,18,32,.92); backdrop-filter: blur(12px); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px 20px; }
.bar__todo { color: var(--ink-faint); font-size: .88rem; }
.bar__ok { color: var(--affirm); font-size: .88rem; }
.bar__btn { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 12px 22px; font-weight: 700; cursor: pointer; }
.bar__btn:disabled { opacity: .45; cursor: not-allowed; }
.result { padding: 12px 16px; border-radius: var(--r); background: rgba(100,220,170,.1); color: var(--affirm); margin: 0; }
.result--err { background: rgba(255,100,100,.1); color: var(--negate); }
@media (max-width: 720px) { .cats { grid-template-columns: 1fr; } .ms__grid { grid-template-columns: 1fr; } }
</style>
