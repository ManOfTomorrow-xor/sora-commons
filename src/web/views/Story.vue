<template>
  <div class="story" v-if="p">
    <a class="back" @click="$emit('nav', 'feed')">← Back to feed</a>

    <!-- HERO (full width) -->
    <div class="sd__badges">
      <span v-if="p.category" class="badge" :class="catBadgeClass(p.category)">{{ catLabel(p.category) }}</span>
      <span class="badge" :class="trackClass">{{ trackLabel }}</span>
    </div>
    <h1 class="sd__title">{{ p.title }}</h1>
    <div class="sd__who" @click="goProfile">
      <span class="av" :style="commons.getAvatar(p.proposerAccountId) ? {} : avStyle(p.proposerAccountId)">
        <img v-if="commons.getAvatar(p.proposerAccountId)" :src="commons.getAvatar(p.proposerAccountId)" class="av__img" alt="" />
        <template v-else>{{ initials(p.proposerAccountId) }}</template>
      </span>
      <div class="sd__whoinfo">
        <span class="sd__name"><b>{{ commons.getDisplayName(p.proposerAccountId) || shortId(p.proposerAccountId) }}</b><span class="sd__label" :class="labelClass">{{ commons.proposerLabel(p.proposerAccountId) }}</span></span>
        <span class="sd__chap">{{ chapterText }}</span>
      </div>
    </div>
    <p v-if="p.description" class="sd__summary">{{ p.description }}</p>

    <!-- TWO COLUMN -->
    <div class="sd__grid">
      <div class="sd__main">
        <!-- STORY -->
        <section class="sec">
          <h2>The story</h2>
          <div class="narrative"><Clampable :text="p.story || p.description" :lines="5" pre /></div>
        </section>
         <section class="sec" v-if="(p.documents || []).length">
          <h2>Supporting documents</h2>
          <div class="pdocs">
            <a v-for="d in p.documents" :key="d.id" :href="d.url" target="_blank" rel="noopener" class="pdoc">
              <span class="pdoc_ic">{{ d.fileType === 'pdf' ? '📄' : '🖼️' }}</span>{{ d.filename }}
            </a>
          </div>
        </section>
        <!-- FACTS -->
        <section class="sec" v-if="hasFacts">
          <h2>The facts behind it</h2>
          <div class="facts">
            <div v-if="p.productiveClaim"><div class="fact__l">Productive claim</div><div class="fact__v"><Clampable :text="p.productiveClaim" :lines="5" /></div></div>
            <div v-if="p.inputs"><div class="fact__l">Inputs financed</div><div class="fact__v"><Clampable :text="p.inputs" :lines="5" /></div></div>
            <div v-if="p.expectedOutput"><div class="fact__l">Expected output</div><div class="fact__v"><Clampable :text="p.expectedOutput" :lines="5" /></div></div>
            <div v-if="p.demandSignal"><div class="fact__l">Demand signal</div><div class="fact__v"><Clampable :text="p.demandSignal" :lines="5" /></div></div>
            <div v-if="p.publicBenefit"><div class="fact__l">Public benefit</div><div class="fact__v"><Clampable :text="p.publicBenefit" :lines="5" /></div></div>
          </div>
        </section>
        <!-- ACCOUNTABILITY (distinct trust signal) -->
        <section class="sec accountability" v-if="p.riskBearer || p.failureHandling">
          <h2>Accountability</h2>
          <div class="acc__grid">
            <div v-if="p.riskBearer" class="acc__item">
              <div class="acc__l">Who carries the risk</div>
              <div class="acc__v">{{ p.riskBearer }}</div>
            </div>
            <div v-if="p.failureHandling" class="acc__item">
              <div class="acc__l">If this doesn't work out</div>
              <div class="acc__v">{{ p.failureHandling }}</div>
            </div>
          </div>
        </section>

        <!-- CHAPTERS -->
        <section class="sec">
          <h2>The chapters</h2>
          <p v-if="!p.milestones || p.milestones.length === 0" class="muted">No chapters yet.</p>
          <div v-for="(m, i) in p.milestones" :key="m.id || i" class="chapter" :class="{ 'is-done': m.completed }">
            <div class="ch__dot" :class="m.completed ? 'done' : (i === firstIncomplete ? 'now' : 'up')">
              {{ m.completed ? "✓" : i + 1 }}
            </div>
            <div class="ch__b">
              <h4>{{ m.description }}</h4>
              <div class="ch__meta">due {{ m.timeline || "—" }}</div>
              <div v-if="m.evidence" class="ch__ev"><span class="ch__evlab">Evidence to present:</span> {{ m.evidence }}</div>
              <div v-if="m.completed && m.deliveredEvidence" class="ch__ev ch__ev--delivered">
                <span class="ch__evlab">Evidence presented:</span> {{ m.deliveredEvidence }}
              </div>
              <!-- Challenge window (delivered chapters) -->
              <div v-if="m.completed && m.deliveredAt" class="ch__cw">
                <div class="ch__cwstate" :class="'cw--' + commons.milestoneChallengeState(m)">
                  <template v-if="commons.milestoneChallengeState(m) === 'in-window'">⏳ Challenge window — {{ windowDaysLeft(m) }} day{{ windowDaysLeft(m) === 1 ? '' : 's' }} left for backers to review</template>
                  <template v-else-if="commons.milestoneChallengeState(m) === 'flagged'">⚑ This delivery has an open flag on the record</template>
                  <template v-else-if="commons.milestoneChallengeState(m) === 'confirmed'">✓ Confirmed — challenge window passed</template>
                </div>

                <!-- flag threads -->
                <div v-for="f in (m.flags || [])" :key="f.id" class="ch__flag" :class="{ 'is-withdrawn': f.status === 'withdrawn' }">
                  <div class="ch__flag_h">
                    <span class="ch__flag_who">Flag by {{ commons.getDisplayName(f.flaggerAccountId) || shortId(f.flaggerAccountId) }}</span>
                    <span v-if="f.status === 'withdrawn'" class="ch__flag_wd">withdrawn {{ f.withdrawnAt ? new Date(f.withdrawnAt).toLocaleDateString() : '' }}</span>
                  </div>
                  <p class="ch__flag_reason">{{ f.reason }}</p>
                  <p v-if="f.proposerResponse" class="ch__flag_resp"><span class="ch__evlab">Proposer's response:</span> {{ f.proposerResponse }}</p>
                  <button v-if="f.status === 'open' && f.flaggerAccountId === commons.currentAccountId" class="ch__flag_act" @click="doWithdraw(m.id, f.id)">Withdraw flag</button>
                  <div v-if="isMine && f.status === 'open' && !f.proposerResponse" class="ch__flag_respbox">
                    <textarea v-model="responseText[f.id]" rows="2" placeholder="Respond to this flag (stays on the record)"></textarea>
                    <button class="ch__deliverbtn btn-gold" :disabled="!(responseText[f.id] || '').trim()" @click="doRespond(m.id, f.id)">Post response</button>
                  </div>
                </div>
                <!-- point deeper discussion to the conversation -->
                <button v-if="(m.flags || []).length > 0" class="ch__flag_discuss" @click="goToComments()">
                  Discuss this further in the conversation below ↓
                </button>
                <!-- raise a flag (shown to all non-proposers; gated on click) -->
                <div v-if="!isMine" class="ch__flagraise">
                  <button v-if="!flagOpenFor[m.id]" class="ch__flag_open" @click="openFlag(m)">Flag this delivery</button>
                  <div v-else class="ch__flag_form">
                    <textarea v-model="flagText[m.id]" rows="2" placeholder="Why are you flagging this delivery? (stays permanently on the record)"></textarea>
                    <button class="ch__deliverbtn btn-gold" :disabled="!(flagText[m.id] || '').trim()" @click="doFlag(m.id)">Submit flag</button>
                  </div>
                  <p v-if="flagNotice[m.id]" class="ch__flag_notice">{{ flagNotice[m.id] }}</p>
                </div>
              </div>
              <div v-if="isMine && !m.completed && i === firstIncomplete" class="ch__deliver">
                <textarea v-model="deliverText" rows="2" placeholder="Present the actual evidence this chapter is done (link, receipt, photo description...)"></textarea>
                <button class="ch__attach" @click="pickEvidence(m.id)" :disabled="evUploading[m.id]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.05 12.25 20.2a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24l-9.2 9.19a1 1 0 0 1-1.41-1.41l8.49-8.49"/></svg>
                  {{ evUploading[m.id] ? "Uploading…" : "Attach supporting document" }}
                </button>
                <span class="ch__evhint">Optional — but attaching proof (PDF or image) strengthens your case and helps backers trust the work. You can remove files until you submit; after that they're part of the record.</span>
                <div v-if="(stagedEvidence[m.id] || []).length" class="ch__staged">
                  <div v-for="(f, idx) in stagedEvidence[m.id]" :key="idx" class="ch__stagedrow">
                    <span class="ch__staged_ic">{{ f.type === 'application/pdf' ? '📄' : '🖼️' }}</span>
                    <span class="ch__staged_nm">{{ f.name }}</span>
                    <button class="ch__staged_x" @click="removeStagedEvidence(m.id, idx)" title="Remove">✕</button>
                  </div>
                </div>
                <input :ref="el => setEvInput(el, m.id)" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" style="display:none" @change="onEvidencePicked($event, m.id)" />
                <p v-if="evError[m.id]" class="ch__everr">{{ evError[m.id] }}</p>
                <button class="ch__deliverbtn btn-gold" :disabled="!deliverText.trim() || evUploading[m.id]" @click="submitDelivery(m.id)">{{ evUploading[m.id] ? "Submitting…" : "Submit evidence & mark delivered" }}</button>
                <p v-if="evUploading[m.id]" class="ch__uploadnote">Uploading your documents to the record — this may take a moment.</p>
              </div>
              <div v-if="(m.documents || []).length" class="ch__evdocs">
                  <a v-for="d in m.documents" :key="d.id" :href="d.url" target="_blank" rel="noopener" class="ch__evdoc">
                    <span class="ch__evdoc_ic">{{ d.fileType === 'pdf' ? '📄' : '🖼️' }}</span>{{ d.filename }}
                  </a>
                </div>
            </div>
            <span class="ch__st" :class="m.completed ? 'st-done' : (i === firstIncomplete ? 'st-now' : 'st-up')">
              {{ m.completed ? "✓ Evidence submitted" : (i === firstIncomplete ? "In progress" : "Upcoming") }}
            </span>
          </div>
        </section>

        <!-- CONVERSATION -->
        <section class="sec">
          <h2 id="conversation">Conversation</h2>
          <p v-if="!p.discussionPosts || p.discussionPosts.length === 0" class="muted">No comments yet. Be the first to weigh in.</p>
          <div v-for="c in p.discussionPosts" :key="c.id" class="cmt" :class="{ isprop: c.authorAccountId === p.proposerAccountId }">
            <span class="av sm" :style="commons.getAvatar(c.authorAccountId) ? {} : avStyle(c.authorAccountId)">
              <img v-if="commons.getAvatar(c.authorAccountId)" :src="commons.getAvatar(c.authorAccountId)" class="av__img" alt="" />
              <template v-else>{{ initials(c.authorAccountId) }}</template>
            </span>
            <div class="cmt__b">
              <div class="cmt__h"><b>{{ commons.getDisplayName(c.authorAccountId) || shortId(c.authorAccountId) }}</b><span v-if="c.authorAccountId === p.proposerAccountId" class="prop">PROPOSER</span></div>
              <div class="cmt__t">{{ c.content }}</div>
            </div>
          </div>
          <div class="cmtbox">
            <input v-model="newComment" placeholder="Add a comment..." @keyup.enter="postComment" />
            <button class="btn-gold" @click="postComment">Post</button>
          </div>
        </section>
      </div>

      <!-- STICKY SUPPORT RAIL -->
      <aside class="sd__rail">
        <div class="support">
          <button class="support__donate btn-gold" :disabled="isMine" :title="isMine ? 'You can\'t donate to your own proposal' : 'Donate'" @click="openDonate">Donate</button>
          <div class="support__row">
            <button class="iconbtn" :class="{ on: commons.isLiked(p.id) }" :disabled="isMine" @click="onLike" :title="isMine ? 'You can\'t like your own proposal' : 'Like'">
              <svg :class="{ likepulse: likePulse }" viewBox="0 0 24 24" :fill="commons.isLiked(p.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5C12 20.5 3.5 15 3.5 8.8 3.5 6 5.7 4 8.2 4c1.7 0 3 .9 3.8 2.2C12.8 4.9 14.1 4 15.8 4c2.5 0 4.7 2 4.7 4.8C20.5 15 12 20.5 12 20.5z"/></svg>
              <span>{{ p.likes }}</span>
            </button>
            <button class="iconbtn" :class="{ on: commons.isBoosted(p.id) }" :disabled="isMine" @click="onBoost" :title="isMine ? 'You can\'t boost your own proposal' : 'Boost'">
              <svg :class="{ boostzap: boostPulse }" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
              <span>{{ p.boostCount || 0 }}</span>
            </button>
            <button class="iconbtn" :class="{ on: commons.isSaved(p.id) }" @click="commons.toggleSave(p.id)" :title="commons.isSaved(p.id) ? 'Saved' : 'Save'">
              <svg viewBox="0 0 24 24" :fill="commons.isSaved(p.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M6 4h12v16l-6-4-6 4z"/></svg>
            </button>
          </div>
          <button class="support__follow" :class="{ on: commons.isFollowing(p.id) }" :disabled="isMine" :title="isMine ? 'You can\'t follow your own proposal' : ''" @click="commons.toggleFollow(p.id)">{{ commons.isFollowing(p.id) ? "Following" : "+ Follow" }}</button>
          <WhyExpander label="Why boost?" anchor="boost" @navigate="onWhyNav">
            A boost is free — but you only get three a week, and they don't stack up. That's the point: if you could boost everything, a boost would mean nothing. They can't be bought either, so no one climbs the rankings with money.
          </WhyExpander>

          <div class="support__totals">
            <div><b>{{ p.fundingMode === 'open' ? '—' : (p.xorRequested || 0) }}</b><span>{{ p.fundingMode === 'open' ? 'Open to donations' : 'XOR goal' }}</span></div>
            <div><b><CountUp :value="Number(p.totalDonated) || 0" :decimals="2" /></b><span>XOR raised</span></div>
            <div><b><CountUp :value="Number(p.xorBurned) || 0" :decimals="2" /></b><span>XOR burned</span></div>
            <div><b><CountUp :value="p.backers || 0" :decimals="0" /></b><span>backers</span></div>
            <div><b>{{ p.followers || 0 }}</b><span>followers</span></div>
          </div>
        </div>
      </aside>
    </div>

    <!-- mobile sticky donate -->
    <button class="mobile-donate btn-gold" :disabled="isMine" @click="openDonate">Donate</button>

    <!-- DONATE MODAL -->
    <div v-if="showDonate" class="dm__overlay" @click.self="showDonate = false">
      <div class="dm">
        <button class="dm__x" @click="showDonate = false">×</button>
        <h3 class="dm__title">Support this work</h3>
        <p class="dm__sub">Donate XOR directly to {{ commons.getDisplayName(p.proposerAccountId) || shortId(p.proposerAccountId) }}. 1% is burned; 99% goes to the proposer.</p>

        <div class="dm__picks">
          <button v-for="q in [10, 50, 100, 500]" :key="q" class="dm__pick" :class="{ on: amount === q }" @click="setPick(q)">{{ q }}</button>
        </div>

        <label class="dm__lab">Amount (XOR) <span class="dm__max">· max 1,000,000</span></label>
        <input class="dm__input" type="number" min="0" max="1000000" step="0.0001" v-model.number="amount" placeholder="0" @input="onAmountInput" />
        <p v-if="amount === 1000000" class="dm__capnote">Maximum donation is 1,000,000 XOR.</p>

        <div v-if="amount > 0" class="dm__split">
          <div><span>To proposer</span><b>{{ (amount * 0.99).toFixed(4) }} XOR</b></div>
          <div><span>Burned (1%)</span><b>{{ (amount * 0.01).toFixed(4) }} XOR</b></div>
        </div>

        <WhyExpander label="Why 1%?" anchor="burn" @navigate="onWhyNav">
          It isn't a fee — the Commons collects nothing. The 1% is <b>burned</b>: permanently destroyed, not taken by anyone. Your full conviction still reaches the builder, and the burn ties that support to real work getting done. Productive work burns true.
        </WhyExpander>

        <p class="dm__note">Preview only — updates totals in this session. Real on-chain donations come with chain integration.</p>

        <button class="dm__confirm btn-gold" :disabled="!(amount > 0)" @click="confirmDonate">
          Donate {{ amount > 0 ? amount + " XOR" : "" }}
        </button>
      </div>
    </div>
  </div>

  <!-- no story selected -->
  <div v-else class="empty-wrap">
    <p class="empty">No story selected.</p>
    <button class="postcta" @click="$emit('nav', 'feed')">Back to the feed</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useCommonsStore } from "@/stores/commons";
import WhyExpander from "../components/WhyExpander.vue";
import Clampable from "../components/Clampable.vue";
import { COMMONS_CONFIG } from "@/constants/commonsConfig";
import CountUp from "@/web/components/CountUp.vue";

const emit = defineEmits<{ (e: "nav", id: string): void }>();
const commons = useCommonsStore();

const p = computed(() => commons.activeProposal as any);

const newComment = ref("");

function openDonate() { amount.value = 0; picked.value = false; showDonate.value = true; }
const likePulse = ref(false);
const boostPulse = ref(false);
function onLike() {
  if (!p.value) return;
  const was = commons.isLiked(p.value.id);
  commons.toggleLike(p.value.id);
  if (!was) { likePulse.value = true; setTimeout(() => { likePulse.value = false; }, 400); }
}
function onBoost() {
  if (!p.value) return;
  const was = commons.isBoosted(p.value.id);
  commons.toggleBoost(p.value.id);
  if (!was) { boostPulse.value = true; setTimeout(() => { boostPulse.value = false; }, 500); }
}
function postComment() {
  if (!newComment.value.trim() || !p.value) return;
  commons.postDiscussion?.(p.value.id, newComment.value.trim());
  newComment.value = "";
}
function goProfile() {
  if (p.value) commons.setViewingProfile(p.value.proposerAccountId);
  emit("nav", "profile");
}
function goToComments() {
  document.getElementById("conversation")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

const showDonate = ref(false);
function onWhyNav(target: string) { showDonate.value = false; emit("nav", target); }
const amount = ref<number>(0);
const picked = ref(false);
function setPick(q: number) { amount.value = q; picked.value = true; }
function confirmDonate() {
  if (!p.value || !(amount.value > 0)) return;
  commons.donate(p.value.id, amount.value);
  showDonate.value = false;
  amount.value = 0;
  picked.value = false;
}
function onAmountInput() {
  picked.value = false;
  if (amount.value > 1000000) amount.value = 1000000;
  if (amount.value < 0) amount.value = 0;
}

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
const stagedEvidence = ref<Record<string, File[]>>({});
const evError = ref<Record<string, string>>({});
const evUploading = ref<Record<string, boolean>>({});
const evInputs = ref<Record<string, HTMLInputElement | null>>({});

function setEvInput(el: any, milestoneId: string) { evInputs.value[milestoneId] = el; }
function pickEvidence(milestoneId: string) { evError.value[milestoneId] = ""; evInputs.value[milestoneId]?.click(); }
function onEvidencePicked(e: Event, milestoneId: string) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const okTypes = ["application/pdf","image/jpeg","image/png","image/webp"];
  if (!okTypes.includes(file.type)) { evError.value[milestoneId] = "Use a PDF or image."; return; }
  if (file.size > 10*1024*1024) { evError.value[milestoneId] = "File must be under 10 MB."; return; }
  if (((stagedEvidence.value[milestoneId] || []).length) >= 5) { evError.value[milestoneId] = "Up to 5 files per chapter."; return; }
  (stagedEvidence.value[milestoneId] ??= []).push(file);
  evError.value[milestoneId] = "";
  (e.target as HTMLInputElement).value = "";
}
function removeStagedEvidence(milestoneId: string, idx: number) {
  stagedEvidence.value[milestoneId]?.splice(idx, 1);
}
async function submitDelivery(milestoneId: string) {
  if (!p.value || !deliverText.value.trim()) return;
  evUploading.value = { ...evUploading.value, [milestoneId]: true };
  // upload staged files FIRST (while the deliver block is still visible)
  for (const file of stagedEvidence.value[milestoneId] || []) {
    const res = await commons.uploadDocument(file, { proposalId: p.value.id, milestoneId });
    if (!res.ok) { evError.value = { ...evError.value, [milestoneId]: res.error || "A file failed to upload." }; }
  }
  // THEN mark delivered (this flips m.completed and hides the block)
  const ok = await commons.markChapterDelivered(p.value.id, milestoneId, deliverText.value.trim());
  evUploading.value = { ...evUploading.value, [milestoneId]: false };
  if (!ok) return;
  stagedEvidence.value[milestoneId] = [];
  deliverText.value = "";
  await commons.loadProposals();
}

const flagText = ref<Record<string, string>>({});
const responseText = ref<Record<string, string>>({});
const flagOpenFor = ref<Record<string, boolean>>({});
const flagNotice = ref<Record<string, string>>({});

function windowDaysLeft(m: any): number {
  if (!m.deliveredAt) return 0;
  const ends = new Date(m.deliveredAt).getTime() + COMMONS_CONFIG.CHALLENGE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((ends - Date.now()) / (1000 * 60 * 60 * 24)));
}
function canFlag(m: any): boolean {
  if (!p.value) return false;
  const acct = commons.currentAccountId;
  const isBacker = commons.donatedProposals.includes(acct + "::" + p.value.id);
  return Boolean(m.deliveredAt) && isBacker;
}
function openFlag(m: any) {
  if (!p.value) return;
  if (!canFlag(m)) {
    flagNotice.value[m.id] = "You need to be a backer of this work to flag a delivery. Support it first, then you can raise a flag.";
    return;
  }
  flagNotice.value[m.id] = "";
  flagOpenFor.value[m.id] = true;
}
function doFlag(milestoneId: string) {
  if (!p.value) return;
  const reason = (flagText.value[milestoneId] || "").trim();
  if (!reason) return;
  if (commons.raiseFlag(p.value.id, milestoneId, reason)) {
    flagText.value[milestoneId] = "";
    flagOpenFor.value[milestoneId] = false;
  }
}
function doWithdraw(milestoneId: string, flagId: string) {
  if (!p.value) return;
  commons.withdrawFlag(p.value.id, milestoneId, flagId);
}
function doRespond(milestoneId: string, flagId: string) {
  if (!p.value) return;
  const resp = (responseText.value[flagId] || "").trim();
  if (!resp) return;
  if (commons.respondToFlag(p.value.id, milestoneId, flagId, resp)) {
    responseText.value[flagId] = "";
  }
}
function initials(id?: string) { return (id || "?").slice(0, 2).toUpperCase(); }
function avStyle(id?: string) {
  const colors = ["#C9A84C", "#7E9BE0", "#64DCAA", "#E4C77A", "#A8842F"];
  let h = 0;
  for (let i = 0; i < (id || "").length; i++) h = (id as string).charCodeAt(i) + ((h << 5) - h);
  return { background: colors[Math.abs(h) % colors.length] };
}
watch(() => commons.scrollToComments, (should) => {
  if (should) {
    commons.setScrollToComments(false);
    nextTick(() => {
      setTimeout(() => {
        document.getElementById("conversation")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    });
  } else {
    window.scrollTo(0, 0);
  }
}, { immediate: true });
</script>

<style scoped>
.story { max-width: 1000px; margin: 0 auto; }

/* two-column layout */
.sd__grid { display: grid; grid-template-columns: minmax(0,1fr) 280px; gap: 32px; align-items: start; margin-top: 20px; }
@media (max-width: 920px) {
  .sd__grid { grid-template-columns: 1fr; }
  .sd__rail { position: static; }
  .support { flex-direction: column; }
  .support { flex-direction: column; max-width: 460px; margin: 0 auto; }
}
.sd__main { min-width: 0; }

/* sticky support rail */
.sd__rail { position: sticky; top: 140px; }
.support { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.support__donate { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r); padding: 15px; font-weight: 800; font-size: 1.05rem; letter-spacing: .01em; cursor: pointer; box-shadow: 0 4px 14px rgba(201,168,76,.25); transition: transform .15s var(--ease), box-shadow .15s var(--ease), filter .15s var(--ease); }
.support__donate:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,.35); filter: brightness(1.06); }
.support__row { display: flex; gap: 8px; }
.iconbtn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 10px; color: var(--ink-dim); cursor: pointer; font-size: .86rem; }
.iconbtn svg.likepulse { animation: pop .4s var(--ease-spring); transform-origin: center; }
.iconbtn svg.boostzap { animation: zap .5s var(--ease-spring); transform-origin: center; }
.iconbtn svg { width: 16px; height: 16px; }
.iconbtn:hover { border-color: var(--gold-600); color: var(--ink); }
.iconbtn.on { color: var(--gold-300); border-color: var(--gold-600); }
.iconbtn:disabled, .support__follow:disabled { opacity: .4; cursor: not-allowed; }
.iconbtn:disabled:hover { border-color: var(--line); color: var(--ink-dim); }
.support__follow:disabled:hover { border-color: var(--line); }
.support__donate:disabled, .mobile-donate:disabled { opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; filter: none; }
.support__follow { background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 11px; color: var(--ink); font-weight: 600; font-size: .9rem; cursor: pointer; }
.support__follow:hover { border-color: var(--gold-600); }
.support__follow.on { color: var(--gold-300); border-color: var(--gold-600); }
.support__totals { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid var(--line-soft); padding-top: 14px; }
.support__totals div { display: flex; flex-direction: column; }
.support__totals b { font-family: var(--mono); color: var(--gold-300); font-size: 1.05rem; }
.support__totals span { color: var(--ink-faint); font-size: .74rem; }
.support :deep(.why) { margin: 0; }


/* mobile sticky donate */
.mobile-donate.__unused { display: none; }
@media (max-width: 920px) {
.mobile-donate {
  display: none;
  position: fixed;
  left: 12px; right: 12px;
  bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  z-index: 55;
  padding: 15px;
  border: none;
  border-radius: var(--r);
  background: linear-gradient(180deg, var(--gold-300), var(--gold-500));
  color: #22180a;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: .01em;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,0,0,.4), 0 4px 14px rgba(201,168,76,.3);
  transition: transform .28s var(--ease), opacity .28s var(--ease);
}
}
.back { color: var(--gold-300); font-size: .86rem; margin-bottom: 16px; display: inline-block; cursor: pointer; }
.sd__badges { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
.badge { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; font-family: var(--mono); padding: 4px 10px; border-radius: 999px; }
.cat--production { background: rgba(217,138,91,.12); color: #E0986A; border: 1px solid rgba(217,138,91,.4); }
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
.sd__summary { color: var(--ink-dim); font-size: 1.05rem; line-height: 1.6; max-width: 70ch; margin: 0 0 4px; }
.av { position: relative; overflow: hidden; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #22180a; font-size: .85rem; flex: none; }
.av__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
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
.narrative { color: var(--ink-dim); line-height: 1.7; margin: 0; }

.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
.facts > div { background: var(--navy-900); border: 1px solid var(--line-soft); border-radius: var(--r); padding: 16px 18px; }
.fact__l { font-size: .72rem; color: var(--ink-faint); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; font-weight: 600; }
.fact__v { color: var(--ink); font-size: .93rem; line-height: 1.6; overflow-wrap: break-word; }

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
.ch__deliverbtn { align-self: flex-start; background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 8px 14px; font-weight: 700; font-size: .84rem; cursor: pointer; box-shadow: 0 3px 12px rgba(201,168,76,.22); transition: transform .15s var(--ease), box-shadow .15s var(--ease), filter .15s var(--ease); }
.ch__deliverbtn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,168,76,.34); filter: brightness(1.06); }
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
.cmtbox button:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(201,168,76,.3); filter: brightness(1.06); }
.accountability { border-color: rgba(126,155,224,.25); }
.accountability h2 { color: var(--info); }
.acc__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 600px) { .acc__grid { grid-template-columns: 1fr; } }
.acc__item { background: var(--navy-900); border: 1px solid var(--line-soft); border-radius: var(--r); padding: 14px 16px; }
.acc__l { font-size: .72rem; color: var(--info); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; font-weight: 600; }
.acc__v { color: var(--ink); font-size: .95rem; line-height: 1.55; overflow-wrap: anywhere; }

.empty-wrap { text-align: center; padding: 60px 0; }
.empty { color: var(--ink-faint); margin-bottom: 16px; }
.postcta { background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 11px 20px; font-weight: 700; cursor: pointer; }
.dm__overlay { position: fixed; inset: 0; background: rgba(5,9,16,.7); display: grid; place-items: center; z-index: 100; padding: 20px; }
.dm { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 26px; width: 100%; max-width: 400px; position: relative; }
.dm__x { position: absolute; top: 14px; right: 16px; background: none; border: none; color: var(--ink-faint); font-size: 1.5rem; cursor: pointer; line-height: 1; }
.dm__x:hover { color: var(--ink); }
.dm__title { font-family: var(--display); font-size: 1.3rem; font-weight: 800; margin: 0 0 6px; }
.dm__sub { color: var(--ink-dim); font-size: .86rem; margin: 0 0 18px; line-height: 1.5; }
.dm__picks { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
.dm__pick { background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 10px; color: var(--ink); font-family: var(--mono); cursor: pointer; }
.dm__pick:hover { border-color: var(--gold-600); }
.dm__pick.on { background: rgba(201,168,76,.14); border-color: var(--gold-600); color: var(--gold-300); }
.dm__lab { font-size: .74rem; color: var(--ink-faint); display: block; margin-bottom: 6px; }
.dm__input { width: 100%; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 12px 14px; color: var(--ink); font-family: var(--mono); font-size: 1.1rem; }
.dm__input:focus { outline: none; border-color: var(--gold-600); }
.dm__split { display: flex; justify-content: space-between; gap: 12px; margin: 16px 0; padding: 14px; background: var(--navy-900); border-radius: var(--r-sm); }
.dm__split div { display: flex; flex-direction: column; gap: 3px; }
.dm__split span { font-size: .72rem; color: var(--ink-faint); }
.dm__split b { font-family: var(--mono); color: var(--gold-300); }
.dm__note { font-size: .74rem; color: var(--ink-faint); margin: 0 0 16px; line-height: 1.5; }
.dm__confirm { width: 100%; background: linear-gradient(180deg, var(--gold-300), var(--gold-500)); color: #22180a; border: none; border-radius: var(--r-sm); padding: 14px; font-weight: 800; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(201,168,76,.25); transition: transform .15s var(--ease), box-shadow .15s var(--ease), filter .15s var(--ease); }
.dm__confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,.35); filter: brightness(1.06); }
.dm__confirm:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
.dm__input::-webkit-outer-spin-button,
.dm__input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.dm__input { -moz-appearance: textfield; appearance: textfield; }
.dm__input { overflow: hidden; text-overflow: ellipsis; }
.dm__split b { overflow-wrap: anywhere; }
.dm__max { color: var(--ink-faint); font-weight: 400; }
.dm__capnote { font-size: .74rem; color: var(--gold-300); margin: 6px 0 0; }
.ch__attach { align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; background: var(--navy-900); border: 1px dashed var(--line); border-radius: var(--r-sm); padding: 8px 12px; color: var(--ink-dim); font-size: .82rem; cursor: pointer; transition: border-color .15s var(--ease), color .15s var(--ease), background .15s var(--ease); }
.ch__uploadnote { font-size: .74rem; color: var(--ink-dim); margin: 4px 0 0; font-style: italic; }
.ch__attach:hover:not(:disabled) { border-color: var(--gold-600); color: var(--gold-300); background: rgba(201,168,76,.08); }
.ch__attach:disabled { opacity: .6; cursor: default; }
.ch__attach svg { width: 15px; height: 15px; flex: none; }
.ch__soon { font-size: .68rem; color: var(--ink-faint); opacity: .7; font-style: italic; }
.ch__evhint { font-size: .74rem; color: var(--ink-faint); line-height: 1.4; margin: -2px 0 0; }
.ch__everr { font-size: .78rem; color: var(--negate); margin: 4px 0 0; }
.ch__evdocs { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.ch__evdoc { display: inline-flex; align-items: center; gap: 6px; font-size: .82rem; color: var(--gold-300); text-decoration: none; padding: 4px 0; }
.ch__evdoc:hover { text-decoration: underline; }
.ch__evdoc_ic { flex: none; }
.ch__staged { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.ch__stagedrow { display: flex; align-items: center; gap: 8px; font-size: .82rem; color: var(--ink); background: var(--navy-900); border: 1px solid var(--line-soft); border-radius: var(--r-sm); padding: 5px 10px; }
.ch__staged_ic { flex: none; }
.ch__staged_nm { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ch__staged_x { background: none; border: none; color: var(--ink-dim); cursor: pointer; font-size: .9rem; flex: none; }
.ch__staged_x:hover { color: var(--negate); }
.ch__evdocs_lab { font-size: .72rem; color: var(--ink-faint); font-weight: 600; margin-bottom: 2px; }

@media (max-width: 720px) {
  .back { margin-bottom: 14px; }
  .sd__badges { margin-bottom: 10px; gap: 6px; flex-wrap: wrap; }
  .badge { font-size: .62rem; padding: 3px 8px; white-space: nowrap; }
  .sd__title { font-size: 1.5rem; margin: 0 0 6px; }
  .sd__who { margin-bottom: 12px; }
  .sd__summary { font-size: .95rem; line-height: 1.5; }
  .sec { padding: 16px; margin-bottom: 12px; }
  .sec h2 { font-size: 1.12rem; margin-bottom: 10px; }
  .facts { grid-template-columns: 1fr; gap: 10px; }
  .facts > div { padding: 13px 14px; }
  .fact__v { font-size: .9rem; }
  .support { padding: 16px; gap: 12px; }
  .support__donate { padding: 13px; font-size: 1rem; }
  .support__totals b { font-size: 1rem; }
  .actbar { padding: 12px; gap: 8px; }
  .totals { gap: 16px; padding: 12px 2px 18px; }
  .chapter { gap: 8px; }
  .chapter { gap: 8px; padding: 12px 0; flex-direction: column; }
  .chapter { position: relative; }
  .ch__st { position: absolute; right: 0; top: 10px; }
  .ch__dot { width: 22px; height: 22px; font-size: .7rem; }
  .ch__dot { width: 22px; height: 22px; font-size: .7rem; }
  .av { width: 32px; height: 32px; }
  .ch__ev { font-size: .78rem; line-height: 1.45; padding: 8px 10px; display: block; width: 100%; box-sizing: border-box; }
  .ch__dot { width: 22px; height: 22px; font-size: .7rem; }
  .ch__deliver textarea { font-size: .8rem; line-height: 1.4; min-height: 84px; }
}
.ch__cw { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--line-soft); }
.ch__cwstate { font-size: .78rem; font-family: var(--mono); padding: 4px 0; }
.cw--in-window { color: var(--gold-300); }
.cw--flagged { color: var(--negate); }
.cw--confirmed { color: var(--affirm); }
.ch__flag { background: rgba(139,30,45,.08); border: 1px solid rgba(139,30,45,.3); border-radius: var(--r-sm); padding: 10px 12px; margin: 8px 0; }
.ch__flag.is-withdrawn { opacity: .55; border-style: dashed; }
.ch__flag_h { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.ch__flag_who { font-size: .74rem; font-weight: 700; color: var(--negate); }
.ch__flag_wd { font-size: .68rem; font-family: var(--mono); color: var(--ink-faint); }
.ch__flag_reason { font-size: .88rem; margin: 6px 0; color: var(--ink); }
.ch__flag_resp { font-size: .85rem; margin: 6px 0; color: var(--ink-dim); }
.ch__flag_act { background: none; border: none; color: var(--negate); font-size: .74rem; cursor: pointer; text-decoration: underline; padding: 2px 0; }
.ch__flag_respbox textarea, .ch__flag_form textarea { width: 100%; margin: 6px 0; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 8px; color: var(--ink); font-family: inherit; font-size: .85rem; }
.ch__flagraise { margin-top: 8px; }
.ch__flag_open { background: none; border: 1px solid rgba(139,30,45,.4); color: var(--negate); border-radius: 999px; padding: 5px 12px; font-size: .76rem; cursor: pointer; }
.ch__flag_open:hover { background: rgba(139,30,45,.12); }
.ch__flag_form { margin-top: 6px; }
.ch__flag_notice { font-size: .78rem; color: var(--ink-dim); margin: 6px 0 0; padding: 8px 10px; background: var(--navy-900); border: 1px solid var(--line-soft); border-radius: var(--r-sm); }
.ch__flag_discuss { background: none; border: none; color: var(--ink-dim); font-size: .78rem; cursor: pointer; padding: 4px 0; text-decoration: underline; }
.ch__flag_discuss:hover { color: var(--gold-300); }
.pdocs { display: flex; flex-direction: column; gap: 6px; }
.pdoc { display: inline-flex; align-items: center; gap: 8px; font-size: .9rem; color: var(--gold-300); text-decoration: none; padding: 6px 10px; background: var(--navy-900); border: 1px solid var(--line-soft); border-radius: var(--r-sm); }
.pdoc:hover { text-decoration: underline; border-color: var(--gold-600); }
.pdoc_ic { flex: none; }
</style>
