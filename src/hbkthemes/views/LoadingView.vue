<!-- views/LoadingView.vue -->
<template>
  <div class="loading-container">
    <div class="loading-card">
      <!-- Logo animé -->
      <div class="logo-wrapper">
        <div class="logo-icon">
          <LoaderCircle class="w-12 h-12 text-primary-500 animate-spin" />
        </div>
      </div>
      <!-- Spinner -->
      <ProgressSpinner strokeWidth="3" class="custom-spinner" />
      <!-- Texte de chargement -->
      <h2 class="loading-title">Chargement de l'application</h2>
      <!-- Barre de progression -->
      <div class="progress-wrapper">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-text">{{ progress }}%</p>
      </div>
      <!-- Messages alternatifs -->
      <p class="loading-message">{{ currentMessage }}</p>
      <!-- Tips -->
      <div class="loading-tips">
        <Lightbulb class="w-4 h-4 text-yellow-500" />
        <span>Astuce : {{ currentTip }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LoaderCircle, Lightbulb } from '@lucide/vue';
import ProgressSpinner from 'primevue/progressspinner';
import { useEntityDefinitionStore } from '@/stores/modules/entityDefinitionStore';
import { useSettingsStore } from '@/stores/modules/settingsStore';
import { addDynamicRoutes } from '@/router/router';
import { useBootstrap } from '@/services/useBootstrap';
// on initialise les variables de bootstrap.
const { isAuthenticated } = useBootstrap();

const route = useRoute();
const router = useRouter();
const entityDefinitionStore = useEntityDefinitionStore();
const settingsStore = useSettingsStore();

const progress = ref(0);
let progressInterval: ReturnType<typeof setInterval>;

const messages = [
  'Préparation de votre espace de travail...',
  'Chargement des modules...',
  'Configuration des permissions...',
  'Finalisation...',
];

const tips = [
  'Vous pouvez personnaliser votre tableau de bord',
  'Gérez facilement vos clients et factures',
  'Exportez vos données en un clic',
  'Activez les notifications pour ne rien rater',
];

const currentMessage = ref(messages[0]);
const currentTip = ref(tips[Math.floor(Math.random() * tips.length)]);
let messageIndex = 0;
// Rotation des messages
const messageInterval = setInterval(() => {
  messageIndex = (messageIndex + 1) % messages.length;
  currentMessage.value = messages[messageIndex];
}, 1500);
/**
 * Contruit les variables de bases à partir des informations de connexion.
 */
const initBootstrap = () => {
  //
};
onMounted(async () => {
  initBootstrap();
  // Animation de progression
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10;
    }
  }, 300);
  try {
    settingsStore.loadConfigsFromSession();

    if (isAuthenticated.value) {
      await entityDefinitionStore.getMenus();
      addDynamicRoutes(router, entityDefinitionStore.dynamicsMenuItems);
    }
    progress.value = 100;
    setTimeout(() => {
      entityDefinitionStore.initializeAllRoutes = true;
      const redirectPath = route.query.redirect as string;
      router.replace(redirectPath || '/dashboard');
    }, 500);
  } catch (error) {
    console.error('Erreur de chargement: ', error);
    currentMessage.value = 'Erreur de chargement. Redirection...';
    setTimeout(() => {
      router.replace('/dashboard');
    }, 200);
  }
});

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
  if (messageInterval) clearInterval(messageInterval);
});
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-card {
  background: white;
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  min-width: 400px;
  animation: fadeInUp 0.5s ease-out;
}

.logo-wrapper {
  margin-bottom: 24px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 24px 0 16px;
}

.progress-wrapper {
  margin: 24px 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 8px;
  font-size: 0.875rem;
  color: #6b7280;
}

.loading-message {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 16px 0;
  min-height: 48px;
}

.loading-tips {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto;
}

:deep(.custom-spinner .p-progress-spinner-circle) {
  stroke: #667eea !important;
}
</style>
