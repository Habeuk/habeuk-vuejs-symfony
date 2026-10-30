<!-- frontend/src/views/NotFoundView.vue -->
<template>
  <div class="not-found-view flex flex-column align-items-center justify-content-center" style="min-height: 70vh">
    <!-- Illustration 404 -->
    <div class="text-center">
      <div class="text-9xl font-bold text-gray-300 mb-4">404</div>

      <!-- Icône ou illustration -->
      <div class="mb-4">
        <TriangleAlert class="w-18 h-18 text-yellow-500" />
      </div>

      <!-- Message principal -->
      <h1 class="text-3xl font-semibold text-gray-800 mb-3">Page non trouvée</h1>

      <!-- Description -->
      <p class="text-gray-500 text-xl mb-5">Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>

      <!-- Actions -->
      <div class="flex flex-wrap gap-3 justify-content-center">
        <Button label="Retour à l'accueil" severity="primary" @click="$router.push('/')">
          <template #icon><Home class="w-4 h-4" /></template>
        </Button>
        <Button label="Contacter le support" severity="secondary" @click="contactSupport">
          <template #icon><Headphones class="w-4 h-4" /></template>
        </Button>
      </div>
    </div>

    <!-- Suggestions de navigation (optionnel) -->
    <div class="mt-6 text-center" v-if="suggestedPages.length > 0">
      <p class="text-gray-500 mb-3">Pages populaires :</p>
      <div class="flex flex-wrap gap-2 justify-content-center">
        <Chip
          v-for="page in suggestedPages"
          :key="page.path"
          :label="page.label"
          class="cursor-pointer hover:bg-primary-100"
          @click="$router.push(page.path)">
          <template #icon><component :is="page.icon" class="w-4 h-4" /></template>
        </Chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Home, Headphones, Users, FileText, Euro, TriangleAlert } from '@lucide/vue';
// import { useRouter } from "vue-router";

// const router = useRouter();

// Suggestions de navigation (optionnel)
const suggestedPages = ref([
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/devis', label: 'Devis', icon: FileText },
  { path: '/factures', label: 'Factures', icon: Euro },
]);

// Action de contact support
const contactSupport = () => {
  // Rediriger vers la page de contact ou ouvrir un chat
  // router.push('/contact');
};
</script>

<style scoped>
.not-found-view {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Style pour les chips cliquables */
:deep(.p-chip) {
  transition: all 0.2s ease;
}

:deep(.p-chip:hover) {
  background: var(--primary-100) !important;
  transform: translateY(-2px);
}
</style>
