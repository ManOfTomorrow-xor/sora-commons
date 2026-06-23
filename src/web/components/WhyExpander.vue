<template>
  <div class="why">
    <button class="why__btn" :aria-expanded="open" @click="open = !open">
      <span>{{ label }}</span>
      <span class="why__chev" :class="{ 'why__chev--open': open }">▾</span>
    </button>
    <transition name="why">
      <div v-show="open" class="why__body">
        <p><slot /></p>
        <button class="why__link" @click="$emit('navigate', 'about#' + anchor)">{{ linkText }}</button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

withDefaults(defineProps<{
  label: string;
  anchor: string;
  linkText?: string;
}>(), { linkText: "Read more →" });
defineEmits<{ (e: "navigate", target: string): void }>();

const open = ref(false);
</script>

<style scoped>
.why { margin: 0 0 16px; }
.why__btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; padding: 0; color: var(--gold-300); font-family: inherit; font-size: .78rem; font-weight: 600; cursor: pointer; }
.why__btn:hover { filter: brightness(1.12); }
.why__chev { font-size: .7rem; transition: transform .25s var(--ease); }
.why__chev--open { transform: rotate(180deg); }
.why__body { margin-top: 8px; padding: 12px 14px; background: var(--navy-900); border: 1px solid var(--line-soft); border-radius: var(--r-sm); }
.why__body p { font-size: .78rem; color: var(--ink-dim); line-height: 1.55; margin: 0 0 8px; }
.why__body p :deep(b) { color: var(--ink); font-weight: 600; }
.why__link { background: none; border: none; padding: 0; color: var(--gold-300); font-family: inherit; font-size: .78rem; font-weight: 600; cursor: pointer; }
.why__link:hover { text-decoration: underline; }
.why-enter-active, .why-leave-active { transition: opacity .2s var(--ease); }
.why-enter-from, .why-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .why__chev, .why-enter-active, .why-leave-active { transition: none; } }
</style>