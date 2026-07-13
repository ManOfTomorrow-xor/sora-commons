<template>
  <div class="search">
    <div class="search__bar">
      <svg class="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        ref="inputEl"
        v-model="q"
        class="search__input"
        type="text"
        placeholder="Search stories and people"
        @input="onInput"
        @keyup.escape="clear"
      />
      <button v-if="q" class="search__clear" @click="clear" title="Clear">×</button>
    </div>

    <!-- resting state (before typing) -->
    <div v-if="!q.trim()" class="search__rest">
      <p>Search the record — find a story by its title or words, or find a builder by name.</p>
    </div>

    <!-- loading -->
    <div v-else-if="loading" class="search__loading">Searching…</div>

    <!-- results -->
    <div v-else class="search__results">
      <p v-if="!people.length && !stories.length" class="search__empty">
        No stories or people match “{{ q.trim() }}”. Try different words.
      </p>

      <!-- PEOPLE -->
      <section v-if="people.length" class="search__sec">
        <h2 class="search__h">People</h2>
        <div class="people">
          <button v-for="p in people" :key="p.account_id" class="person" @click="openPerson(p.account_id)">
            <span class="person__av" :style="p.avatar_url ? {} : avStyle(p.account_id)">
              <img v-if="p.avatar_url" :src="p.avatar_url" class="person__avimg" alt="" />
              <template v-else>{{ initials(p.account_id) }}</template>
            </span>
            <span class="person__body">
              <span class="person__name">{{ p.display_name || shortId(p.account_id) }}</span>
              <span v-if="p.bio" class="person__bio">{{ p.bio }}</span>
              <span v-else class="person__id">{{ shortId(p.account_id) }}</span>
            </span>
          </button>
        </div>
      </section>

      <!-- STORIES -->
      <section v-if="stories.length" class="search__sec">
        <h2 class="search__h">Stories</h2>
        <div class="stories">
          <button v-for="s in stories" :key="s.id" class="sresult" @click="openStory(s.id)">
            <span class="sresult__title">{{ s.title }}</span>
            <span v-if="s.summary" class="sresult__summary">{{ s.summary }}</span>
            <span class="sresult__by">by {{ commons.getDisplayName(s.proposer_account_id) || shortId(s.proposer_account_id) }}</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCommonsStore } from "@/stores/commons";

const emit = defineEmits<{ (e: "nav", id: string): void }>();
const commons = useCommonsStore();

const q = ref("");
const loading = ref(false);
const people = ref<any[]>([]);
const stories = ref<any[]>([]);
const inputEl = ref<HTMLInputElement | null>(null);

let debounce: any = null;
function onInput() {
  clearTimeout(debounce);
  const term = q.value.trim();
  if (!term) { people.value = []; stories.value = []; loading.value = false; return; }
  loading.value = true;
  debounce = setTimeout(runSearch, 280);
}

async function runSearch() {
  const term = q.value.trim();
  if (!term) { loading.value = false; return; }
  const res = await commons.searchAll(term);
  // guard against a stale response if the query changed while awaiting
  if (q.value.trim() !== term) return;
  people.value = res.people ?? [];
  stories.value = res.stories ?? [];
  loading.value = false;
}

function clear() { q.value = ""; people.value = []; stories.value = []; loading.value = false; inputEl.value?.focus(); }

function openStory(id: string) {
  commons.setActiveProposal(id);
  emit("nav", "story");
}
function openPerson(accountId: string) {
  commons.setViewingProfile(accountId);
  emit("nav", "profile");
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

onMounted(() => { window.scrollTo(0, 0); inputEl.value?.focus(); });
</script>

<style scoped>
.search { max-width: 720px; margin: 0 auto; }

.search__bar {
  display: flex; align-items: center; gap: 10px;
  background: var(--navy-850); border: 1px solid var(--line);
  border-radius: 999px; padding: 12px 18px; margin-bottom: 8px;
  transition: border-color var(--dur-fast) var(--ease);
}
.search__bar:focus-within { border-color: var(--gold-600); }
.search__icon { width: 20px; height: 20px; color: var(--ink-faint); flex: none; }
.search__input {
  flex: 1; background: none; border: none; outline: none;
  color: var(--ink); font-family: var(--body); font-size: 1.05rem;
}
.search__input::placeholder { color: var(--ink-faint); }
.search__clear {
  background: none; border: none; color: var(--ink-faint); font-size: 1.4rem;
  line-height: 1; cursor: pointer; flex: none; padding: 0 4px;
}
.search__clear:hover { color: var(--ink); }

.search__rest, .search__loading, .search__empty {
  color: var(--ink-faint); font-size: .92rem; text-align: center;
  padding: 40px 20px; line-height: 1.6;
}

.search__sec { margin-top: 24px; }
.search__h {
  font-family: var(--display); font-size: 1.05rem; font-weight: 700;
  color: var(--gold-300); margin: 0 0 12px; letter-spacing: -.01em;
}

/* people */
.people { display: flex; flex-direction: column; gap: 6px; }
.person {
  display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
  background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r);
  padding: 12px 14px; cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
}
.person:hover { border-color: var(--gold-600); background: var(--navy-800); }
.person__av {
  position: relative; overflow: hidden; flex: none;
  width: 42px; height: 42px; border-radius: 50%;
  display: grid; place-items: center; font-weight: 700; color: #22180a; font-size: .9rem;
}
.person__avimg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.person__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.person__name { color: var(--ink); font-weight: 600; font-size: .95rem; }
.person__bio { color: var(--ink-dim); font-size: .82rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.person__id { color: var(--ink-faint); font-size: .76rem; font-family: var(--mono); }

/* stories */
.stories { display: flex; flex-direction: column; gap: 8px; }
.sresult {
  display: flex; flex-direction: column; gap: 4px; width: 100%; text-align: left;
  background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r);
  padding: 14px 16px; cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
}
.sresult:hover { border-color: var(--gold-600); background: var(--navy-800); }
.sresult__title { color: var(--ink); font-weight: 700; font-size: 1rem; font-family: var(--display); }
.sresult__summary { color: var(--ink-dim); font-size: .88rem; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.sresult__by { color: var(--ink-faint); font-size: .76rem; font-family: var(--mono); }
</style>