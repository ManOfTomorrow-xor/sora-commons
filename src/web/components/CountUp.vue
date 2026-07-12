<template><span>{{ display }}</span></template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const props = withDefaults(defineProps<{
  value: number | string;
  decimals?: number;
  duration?: number;   // ms
}>(), {
  decimals: 0,
  duration: 650,
});

const display = ref("0");
let raf = 0;

function fmt(n: number): string {
  return n.toFixed(props.decimals);
}

function animateTo(target: number, from: number) {
  cancelAnimationFrame(raf);
  const start = performance.now();
  const delta = target - from;
  if (delta === 0) { display.value = fmt(target); return; }
  const dur = props.duration;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    // ease-out cubic — fast then settling
    const eased = 1 - Math.pow(1 - t, 3);
    display.value = fmt(from + delta * eased);
    if (t < 1) raf = requestAnimationFrame(tick);
    else display.value = fmt(target);
  };
  raf = requestAnimationFrame(tick);
}

onMounted(() => {
  // no animation on first paint — just show the value
  display.value = fmt(Number(props.value) || 0);
});

watch(() => props.value, (nv, ov) => {
  const target = Number(nv) || 0;
  const from = Number(ov) || 0;
  animateTo(target, from);
});
</script>
<style scoped>
span { color: inherit !important; }
</style>
<style scoped>
span { color: inherit !important; font: inherit !important; }
</style>