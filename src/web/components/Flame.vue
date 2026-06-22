<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
      :fill="`url(#${id})`"
    />
    <defs>
      <linearGradient :id="id" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
        <template v-if="variant === 'fire'">
          <stop stop-color="#FFD27A" />
          <stop offset="0.45" stop-color="#F08A3C" />
          <stop offset="1" stop-color="#C0341B" />
        </template>
        <template v-else>
          <stop stop-color="#E4C77A" />
          <stop offset="0.5" stop-color="#C9A84C" />
          <stop offset="1" stop-color="#A8842F" />
        </template>
      </linearGradient>
    </defs>
  </svg>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; variant?: "gold" | "fire" }>(), { size: 18, variant: "gold" });
const id = "fl-" + Math.random().toString(36).slice(2, 7);
</script>