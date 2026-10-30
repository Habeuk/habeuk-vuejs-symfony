<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <div>
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center flex-wrap">
        <h1 class="text-3xl! font-bold text-primary-700 mb-2">Tableau de bord</h1>
        <p class="text-surface-500 font-bold text-lg">Bienvenue dans votre espace de gestion</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
:deep(.p-card) {
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

:deep(.p-card .p-card-content) {
  padding: 1.5rem;
}
</style>
