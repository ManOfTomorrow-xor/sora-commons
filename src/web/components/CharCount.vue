<template>
  <div class="cc" :class="{ 'cc--over': over }">
    {{ len }} / {{ max }}<span v-if="over"> · over the limit</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ value: string; max: number }>();

const len = computed(() => (props.value || "").length);
const over = computed(() => len.value > props.max);
</script>

<style scoped>
.cc { font-family: var(--mono); font-size: .7rem; color: var(--ink-faint); text-align: right; margin-top: 4px; }
.cc--over { color: var(--negate); font-weight: 600; }
</style>