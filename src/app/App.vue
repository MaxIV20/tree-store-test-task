<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
</script>

<template>
  <div :class="$style.app">
    <AppLayout>
      <RouterView />
    </AppLayout>
  </div>
</template>

<style module>
.app {
  display: flex;
}
</style>
