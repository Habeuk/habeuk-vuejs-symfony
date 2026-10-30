<template>
  <aside
    class="hbk-layout--sidebar flex flex-col justify-between"
    :class="{ 'sidebar-collapsed': sidebarCollapsed, 'sidebar-collapsed-mobile': sidebarCollapsedMobile }">
    <div class="mobile-cover" @click="AppStore.closeSidebarMobile()"></div>
    <a @click="router.push('/app')" class="sidebar-header flex items-center p-3 mb-5 border-b border-gray-500 cursor-pointer">
      <img src="/images/hbk-ai-logo.webp" alt="Logo" class="sidebar-logo max-w-[120px] max-h-[39px]" />

      <span v-if="!sidebarCollapsed" class="sidebar-title px-3 font-bold text-white text-2xl truncate">
        {{ appConfig.name }}
      </span>
    </a>
    <div class="flex-1">
      <MenusItems></MenusItems>
    </div>
    <!-- End footer sidebar -->
    <div class="sidebar-header flex items-center p-3 mt-5 border-t border-gray-800">
      <div class="w-full">
        <!-- Bouton réduire/étendre la sidebar -->
        <button
          @click="toggleSidebar"
          class="w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors hidden lg:flex cursor-pointer"
          :class="sidebarCollapsed ? 'justify-center' : 'justify-start'">
          <ChevronRight v-if="sidebarCollapsed" class="w-4 h-4 text-surface-500" />
          <ChevronLeft v-else class="w-4 h-4 text-surface-500" />
          <span v-if="!sidebarCollapsed" class="text-sm text-surface-500">Réduire le menu</span>
        </button>
        <button
          @click="toggleSidebarMobile"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors lg:hidden cursor-pointer"
          :class="sidebarCollapsed ? 'justify-center' : 'justify-start'">
          <ChevronRight v-if="sidebarCollapsed" class="w-4 h-4 text-surface-500" />
          <ChevronLeft v-else class="w-4 h-4 text-surface-500" />
          <span v-if="!sidebarCollapsed" class="text-sm text-surface-500">Réduire le menu</span>
        </button>

        <!-- Bouton de déconnexion -->
        <button
          @click="logout"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger-50 transition-colors cursor-pointer"
          :class="sidebarCollapsed ? 'justify-center' : 'justify-start'">
          <LogOut class="w-4 h-4 text-surface-500" />
          <span v-if="!sidebarCollapsed" class="text-sm text-surface-500">Déconnexion</span>
        </button>
      </div>
    </div>
  </aside>
</template>
<script setup lang="ts">
import MenusItems from '@/hbkthemes/components/MenusItems.vue';
import appConfig from '@/configs/appConfig';
import { computed } from 'vue';
import { ChevronRight, ChevronLeft, LogOut } from '@lucide/vue';
import { useAppStore } from '@/stores/modules/appStore';
import { useAuthStore } from '@/stores/modules/authStore';
import { useRouter } from 'vue-router';
const AppStore = useAppStore();
const AuthStore = useAuthStore();
const router = useRouter();
const sidebarCollapsed = computed(() => AppStore.sidebarCollapsed);
const sidebarCollapsedMobile = computed(() => AppStore.sidebarCollapsedMobile);

const toggleSidebarMobile = () => {
  AppStore.toggleSidebarMobile();
};

const toggleSidebar = () => {
  AppStore.toggleSidebar();
};

const logout = async () => {
  await AuthStore.logout();
  await router.push('/app/login');
};
</script>
