<!-- frontend/src/views/NotFoundView.vue -->
<template>
  <div class="not-found-container">
    <!-- Animation de fond -->
    <div class="floating-shapes">
      <div v-for="n in 6" :key="n" class="shape" :class="`shape-${n}`"></div>
    </div>

    <div class="content-wrapper">
      <!-- Message 404 principal -->
      <div class="error-code">
        <span class="digit">4</span>
        <span class="digit zero">
          <span class="glitch">0</span>
        </span>
        <span class="digit">4</span>
      </div>

      <!-- Titre avec animation -->
      <h1 class="error-title">
        <span class="gradient-text">Page non trouvée</span>
      </h1>

      <!-- Description -->
      <p class="error-description">
        Oups ! Il semblerait que cette page se soit perdue dans l'espace-temps.
        <br class="hidden sm:block" />
        Pas de panique, voici quelques options pour vous aider :
      </p>

      <!-- Cartes d'actions -->
      <div class="actions-grid">
        <!-- Carte Accueil -->
        <Card class="action-card" @click="$router.push('/app/dashboard')">
          <template #content>
            <div class="action-content">
              <div class="action-icon bg-primary-100 text-primary-600">
                <Home class="w-6 h-6" />
              </div>
              <h3 class="action-title">Accueil</h3>
              <p class="action-description">Retourner à la page d'accueil</p>
            </div>
          </template>
        </Card>

        <!-- Carte Support -->
        <Card class="action-card" @click="contactSupport">
          <template #content>
            <div class="action-content">
              <div class="action-icon bg-blue-100 text-blue-600">
                <Headphones class="w-6 h-6" />
              </div>
              <h3 class="action-title">Support</h3>
              <p class="action-description">Contacter notre équipe</p>
            </div>
          </template>
        </Card>

        <!-- Carte Documentation -->
        <Card class="action-card" @click="$router.push('/')">
          <template #content>
            <div class="action-content">
              <div class="action-icon bg-green-100 text-green-600">
                <BookOpen class="w-6 h-6" />
              </div>
              <h3 class="action-title">Documentation</h3>
              <p class="action-description">Consulter notre documentation</p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Liens rapides -->
      <div class="quick-links">
        <Divider align="center" class="w-full">
          <span class="text-gray-400">Liens rapides</span>
        </Divider>

        <div class="links-container">
          <Chip v-for="link in quickLinks" :key="link.path" :label="link.label" class="quick-link" @click="$router.push(link.path)">
            <template #icon><component :is="link.icon" class="w-4 h-4" /></template>
          </Chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Chip from 'primevue/chip';
import { Home, Headphones, BookOpen, Users, FileText, Euro } from '@lucide/vue';

const quickLinks = ref([
  { path: '/app/entity-collection/Customer/list', label: 'Clients', icon: Users },
  { path: '/app/entity-collection/Quote/list', label: 'Devis', icon: FileText },
  { path: '/app/entity-collection/Invoice/list', label: 'Factures', icon: Euro },
]);

const contactSupport = () => {
  // Ouvrir modal de contact ou rediriger
  // router.push('/contact');
};
</script>

<style scoped>
.not-found-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  overflow: hidden;
}

/* Formes flottantes animées */
.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.shape {
  position: absolute;
  background: linear-gradient(135deg, var(--primary-100), var(--primary-300));
  border-radius: 50%;
  opacity: 0.2;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: 10%;
  right: 5%;
  background: linear-gradient(135deg, var(--blue-100), var(--blue-300));
  animation-delay: -5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 20%;
  right: 15%;
  background: linear-gradient(135deg, var(--green-100), var(--green-300));
  animation-delay: -2s;
}

.shape-4 {
  width: 250px;
  height: 250px;
  bottom: 20%;
  left: 10%;
  background: linear-gradient(135deg, var(--yellow-100), var(--yellow-300));
  animation-delay: -7s;
}

.shape-5 {
  width: 180px;
  height: 180px;
  top: 40%;
  left: 20%;
  background: linear-gradient(135deg, var(--purple-100), var(--purple-300));
  animation-delay: -3s;
}

.shape-6 {
  width: 220px;
  height: 220px;
  bottom: 30%;
  right: 15%;
  background: linear-gradient(135deg, var(--pink-100), var(--pink-300));
  animation-delay: -9s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateY(20px) rotate(240deg);
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 800px;
  width: 100%;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Code erreur animé */
.error-code {
  font-size: 8rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .error-code {
    font-size: 12rem;
  }
}

.digit {
  display: inline-block;
  animation: bounce 2s infinite;
}

.digit:nth-child(1) {
  animation-delay: 0s;
  color: var(--primary-600);
}

.digit:nth-child(2) {
  animation-delay: 0.3s;
  position: relative;
}

.digit:nth-child(3) {
  animation-delay: 0.6s;
  color: var(--primary-600);
}

.zero {
  position: relative;
  color: var(--primary-500);
}

.glitch {
  position: relative;
  animation: glitch 3s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes glitch {
  0%,
  100% {
    transform: skew(0deg);
  }
  95% {
    transform: skew(0deg);
  }
  96% {
    transform: skew(10deg);
  }
  97% {
    transform: skew(-10deg);
  }
  98% {
    transform: skew(5deg);
  }
}

.error-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .error-title {
    font-size: 2.5rem;
  }
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-600), var(--blue-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-description {
  color: var(--gray-600);
  font-size: 1.1rem;
  margin-bottom: 3rem;
  line-height: 1.6;
}

/* Grille d'actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-200);
  box-shadow: 0 10px 30px -10px var(--primary-300);
}

.action-content {
  padding: 1.5rem 0;
  text-align: center;
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  transition: all 0.3s ease;
}

.action-card:hover .action-icon {
  transform: scale(1.1) rotate(5deg);
}

.action-title {
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.action-description {
  color: var(--gray-500);
  font-size: 0.9rem;
}

/* Liens rapides */
.links-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.quick-link {
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--gray-100);
}

.quick-link:hover {
  background: var(--primary-100);
  transform: scale(1.05);
}

/* Barre de recherche */
.search-section {
  margin-top: 2rem;
}

.search-box {
  display: flex;
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
}

.search-input:deep(input) {
  width: 100%;
}

/* Animation d'entrée pour les cartes */
.action-card {
  animation: cardFadeIn 0.8s ease-out forwards;
  opacity: 0;
}

.action-card:nth-child(1) {
  animation-delay: 0.2s;
}
.action-card:nth-child(2) {
  animation-delay: 0.4s;
}
.action-card:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mode sombre (si supporté) */
@media (prefers-color-scheme: dark) {
  .shape {
    opacity: 0.1;
  }

  .quick-link {
    background: var(--gray-800);
    color: var(--gray-200);
  }

  .action-description {
    color: var(--gray-400);
  }

  .action-title {
    color: var(--gray-200);
  }
}
</style>
