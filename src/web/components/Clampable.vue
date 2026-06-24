<template>
  <div class="clamp">
    <div ref="bodyEl" class="clamp__body" :class="{ collapsed, pre }" :style="{ '--clamp-lines': lines }">{{ text }}</div>
    <button v-if="overflows" type="button" class="clamp__btn" @click="collapsed = !collapsed">
      {{ collapsed ? "See more" : "See less" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";

withDefaults(defineProps<{ text: string; lines?: number; pre?: boolean }>(), { lines: 5, pre: false });

const collapsed = ref(true);
const overflows = ref(false);
const bodyEl = ref<HTMLElement | null>(null);

onMounted(async () => {
  await nextTick();
  const el = bodyEl.value;
  if (el) overflows.value = el.scrollHeight > el.clientHeight + 2;
});
</script>

<style scoped>
.clamp__body { color: inherit; line-height: inherit; overflow-wrap: break-word; }
.clamp__body.pre { white-space: pre-wrap; }
.clamp__body.collapsed {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--clamp-lines, 5);
  line-clamp: var(--clamp-lines, 5);
  overflow: hidden;
}
.clamp__btn { margin-top: 6px; background: none; border: none; padding: 0; color: var(--gold-300); font-family: inherit; font-size: .8rem; font-weight: 600; cursor: pointer; }
.clamp__btn:hover { text-decoration: underline; }
</style>