<script setup lang="ts">
defineProps<{
  title: string;
  value: number | string;
  trend?: string;
  subtext?: string;
  isAlert?: boolean;
}>()


</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <h3 class="text-slate-500 text-sm font-medium mb-4">{{ title }}</h3>
    <div class="text-4xl font-bold text-slate-800 mb-3">{{ value }}</div>
    <div class="flex items-center gap-2 text-sm">

      <span class="text-slate-400 font-light">{{ isAlert ? trend : subtext }}</span>
    </div>
  </div>
</template>