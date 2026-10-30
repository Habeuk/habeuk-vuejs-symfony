<!-- frontend/src/components/AppHeader.vue -->
<template>
  <header class="app-header absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="px-2 sm:px-4 lg:px-8">
      <div class="flex items-center justify-between h-16 w-full">
        <!-- Logo et menu burger (mobile) -->
        <div class="flex items-center gap-4 grow-0 truncate">
          <!-- Bouton menu mobile -->
          <button @click="toggleSidebar" class="p-2 hover:text-primary-600 hover:bg-gray-100 hidden lg:block cursor-pointer">
            <Menu class="w-6 h-6 text-gray-600 fond-light" />
          </button>
          <button @click="toggleSidebarMobile" class="p-2 flex items-center hover:text-primary-600 hover:bg-gray-100 lg:hidden">
            <Menu class="w-5 h-5 text-gray-900" />
          </button>
        </div>
        <!-- Actions droite -->
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Recherche (desktop) -->
          <div class="hidden lg:block relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Rechercher..."
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              class="pl-9 pr-4 py-2 w-64 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <!-- Bouton recherche mobile -->
          <button class="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100">
            <Search class="w-5 h-5" />
          </button>

          <!-- Notifications -->
          <button @click="toggleNotifications" class="relative p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 hidden">
            <Bell class="w-5 h-5" />
            <span
              v-if="notificationsCount > 0"
              class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
              {{ notificationsCount }}
            </span>
          </button>
          <!-- Bouton mode sombre -->
          <button @click="toggleDarkMode" class="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 hidden">
            <Sun v-if="isDarkMode" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
          <!-- Profil utilisateur -->
          <div v-if="currentUser" class="relative" ref="userMenuRef">
            <button @click="toggleUserMenu" class="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                {{ userInitials }}
              </div>
              <span class="hidden sm:block font-medium text-gray-700">{{ currentUser.title }}</span>
              <ChevronDown class="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>
            <!-- Menu utilisateur dropdown -->
            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <router-link to="#" class="block px-4 py-2 cursor-not-allowed text-gray-300 hover:bg-gray-100" @click="closeUserMenu">
                <User class="w-4 h-4 mr-2" />
                Mon profil
              </router-link>
              <router-link to="#" class="block px-4 py-2 text-gray-300 cursor-not-allowed hover:bg-gray-100" @click="closeUserMenu">
                <Settings class="w-4 h-4 mr-2" />
                Paramètres
              </router-link>
              <hr class="my-1 border-gray-200" />
              <button @click="logout" class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer">
                <LogOut class="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Menu mobile (overlay) -->
    <div v-if="showMobileMenu" class="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" @click="closeMobileMenu">
      <div class="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl" @click.stop>
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <span class="font-bold text-lg text-primary-600">Menu</span>
            <button @click="closeMobileMenu" class="p-1">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav class="p-4">!khlkhlkhvlk</nav>
      </div>
    </div>
    <!-- Panneau notifications -->
    <div
      v-if="showNotifications"
      ref="notificationsRef"
      class="absolute right-20 top-16 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div class="p-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-900">Notifications</h3>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <div v-for="notif in notifications" :key="notif.id" class="p-4 hover:bg-gray-50 border-b border-gray-100">
          <p class="text-gray-800">{{ notif.message }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ notif.time }}</p>
        </div>
      </div>
      <div class="p-3 text-center border-t border-gray-200">
        <button class="text-primary-600 hover:text-primary-700">Voir toutes les notifications</button>
      </div>
    </div>
  </header>
  <!-- Espace réservé pour compenser le header fixe -->
  <div class="h-16"></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, Search, Bell, Sun, Moon, ChevronDown, User, Settings, LogOut, X } from '@lucide/vue';
import { useAppStore } from '@/stores/modules/appStore';
import { useAuthStore } from '@/stores/modules/authStore';
import type { userEntity } from '@/types';
const AppStore = useAppStore();
const authStore = useAuthStore();
// const sidebarCollapsed = computed(() => AppStore.sidebarCollapsed);
const toggleSidebar = () => {
  AppStore.toggleSidebar();
};
const toggleSidebarMobile = () => {
  AppStore.toggleSidebarMobile();
};

const router = useRouter();

// Refs pour les éléments DOM
const userMenuRef = ref<HTMLElement | null>(null);
const notificationsRef = ref<HTMLElement | null>(null);

// État du menu mobile
const showMobileMenu = ref(false);
// const toggleMobileMenu = () => (showMobileMenu.value = !showMobileMenu.value);
const closeMobileMenu = () => (showMobileMenu.value = false);

// État du menu utilisateur
const showUserMenu = ref(false);
const toggleUserMenu = () => (showUserMenu.value = !showUserMenu.value);
const closeUserMenu = () => (showUserMenu.value = false);

// État des notifications
const showNotifications = ref(false);
const toggleNotifications = () => (showNotifications.value = !showNotifications.value);
//const closeNotifications = () => (showNotifications.value = false);

// Gestionnaire de clic outside global
const handleClickOutside = (event: MouseEvent) => {
  // Fermer le menu utilisateur si on clique en dehors
  if (showUserMenu.value && userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false;
  }

  // Fermer les notifications si on clique en dehors
  if (showNotifications.value && notificationsRef.value && !notificationsRef.value.contains(event.target as Node)) {
    showNotifications.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Mode sombre
const isDarkMode = ref(false);
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('hbk-app-dark');
  } else {
    document.documentElement.classList.remove('hbk-app-dark');
  }
};

// Recherche
const searchQuery = ref('');
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/recherche', query: { q: searchQuery.value } });
    searchQuery.value = '';
  }
};

// Données utilisateur (à remplacer par vos vraies données)
const currentUser = computed<userEntity | null>(() => {
  if (authStore.currentUser) {
    return authStore.currentUser;
  }
  return null;
});
const userInitials = computed(() => {
  if (currentUser.value) {
    return currentUser.value.title
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
  return '';
});

// Notifications
const notificationsCount = ref(3);
const notifications = ref([
  { id: 1, message: 'Nouveau devis créé', time: 'Il y a 5 min' },
  { id: 2, message: 'Facture #F001 payée', time: 'Il y a 2h' },
  { id: 3, message: 'Rappel: Relance client', time: 'Il y a 1j' },
]);

// Déconnexion
const logout = async () => {
  // On attend la déconnexion serveur (jetons + session RADIUS) avant de naviguer :
  // sinon le guard voit encore l'utilisateur connecté et le renvoie sur le dashboard.
  closeUserMenu();
  await authStore.logout();
  await router.push('/app/login');
};
</script>
