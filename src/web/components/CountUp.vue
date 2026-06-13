<template>
  <span>{{ display }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const props = withDefaults(
  defineProps<{ value: number | string; duration?: number }>(),
  { duration: 900 }
);

const display = ref("0");

function parse(v: number | string): { target: number; decimals: number } {
  const raw = String(v).replace(/,/g, "").trim();
  const target = Number(raw) || 0;
  const dec = raw.includes(".") ? Math.min(raw.split(".")[1].replace(/0+$/, "").length, 4) : 0;
  return { target, decimals: dec };
}

function format(n: number, decimals: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function animate() {
  const { target, decimals } = parse(props.value);
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduce || target === 0) {
    display.value = format(target, decimals);
    return;
  }
  const start = performance.now();
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const tick = (now: number) => {
    const p = Math.min((now - start) / props.duration, 1);
    display.value = format(target * ease(p), decimals);
    if (p < 1) requestAnimationFrame(tick);
    else display.value = format(target, decimals);
  };
  requestAnimationFrame(tick);
}

onMounted(animate);
watch(() => props.value, animate); // re-animate whenever the value changes
</script>