<script setup lang="ts"></script>

<template>
  <div :class="$style.layoutWrapper">
    <slot />
  </div>
</template>

<style module>
.layoutWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 24px;
}
</style>
