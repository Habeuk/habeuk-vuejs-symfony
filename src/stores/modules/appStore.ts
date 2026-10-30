// src/stores/modules/appStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { AppState } from '@/types';

//  AJOUTE DES TYPES EXPLICITES
export const useAppStore = defineStore('app', () => {
  // Gestion de l'agrandissement de la sidebar
  const appVersion = ref<string>('1.0.0');
  const sidebarCollapsed = ref<AppState['sidebarCollapsed']>(false);
  const sidebarCollapsedMobile = ref<AppState['sidebarCollapsedMobile']>(false);
  const route = useRoute();
  const title = computed<string>(() => route.meta?.title as string);
  const description = computed<string>(() => route.meta?.description as string);
  const entityName = computed<string | undefined>(() => {
    if (route.meta?.entity) {
      return route.meta?.entity as string;
    }
    return undefined;
  });
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    localStorage.setItem('sidebarCollapsed', '' + sidebarCollapsed.value + '');
  };
  const toggleSidebarMobile = () => {
    // le menu doit toujours etre ouvert.
    sidebarCollapsed.value = false;
    sidebarCollapsedMobile.value = !sidebarCollapsedMobile.value;
    localStorage.setItem('sidebarCollapsedMobile', '' + sidebarCollapsedMobile.value + '');
  };
  const onMontedSidebarCollapsed = () => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      sidebarCollapsed.value = savedState === 'true';
    }
    return sidebarCollapsed;
  };
  // Gestion du theme
  const theme = ref<AppState['theme']>('light');
  const setTheme = (newTheme: typeof theme.value) => {
    theme.value = newTheme;
  };
  const getTheme = () => {
    return theme;
  };
  function closeSidebarMobile() {
    sidebarCollapsedMobile.value = false;
  }

  return {
    toggleSidebar,
    onMontedSidebarCollapsed,
    sidebarCollapsed,
    sidebarCollapsedMobile,
    toggleSidebarMobile,
    closeSidebarMobile,
    setTheme,
    getTheme,
    title,
    description,
    entityName,
    appVersion,
  };
});

// Exporte le type du store ( ???? )
export type AppStore = ReturnType<typeof useAppStore>;
