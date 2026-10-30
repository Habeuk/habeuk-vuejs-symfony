<!-- frontend/src/themes/layout/AppLayout.vue -->
<template>
  <div class="hbk-layout--wrapper text-sm" :class="containerClass">
    <!-- Barre latérale gauche -->
    <SiderBar />

    <!-- Sidebar (statique) + Content -->
    <div class="hbk-layout--main-container relative" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Top Header (statique) -->
      <AppHeader />
      <!-- Zone de contenu principal -->
      <main class="hbk-layout--content pt-80px flex flex-col justify-between">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <div class="mx-auto lg:px-4 lg:py-2 container">
                <component :is="Component" />
              </div>
            </transition>
          </router-view>
        </div>
        <!-- Footer -->
        <footer
          class="border-t border-surface-200 bg-surface-0 px-6 py-4 text-sm text-surface-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400">
          <div class="container mx-auto flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <a href="https://habeuk.com/" target="_blank">© {{ new Date().getFullYear() }} Habeuk — Solutions numériques professionnelles.</a>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <span>Version {{ AppStore.appVersion }}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
    <Toast />
    <!-- <ConfirmDialog>
            <template #message="slotProps">
                <div
                    class="flex flex-col items-center w-full gap-4 border-b border-surface-200 dark:border-surface-700">
                    <TriangleAlert class="w-15 h-15 text-red-900" />
                    <div v-html="slotProps.message.message" class="h4 w-full"></div>
                </div>
            </template>
        </ConfirmDialog> -->
    <ConfirmDialog
      :pt="{
        root: {
          class:
            'w-full max-w-md mx-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden',
        },
        mask: {
          class: 'backdrop-blur-sm bg-zinc-950/40 transition-opacity duration-300',
        },
      }">
      <template #container="{ message, acceptCallback, rejectCallback }">
        <div class="flex flex-col">
          <div class="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div class="flex-shrink-0 flex items-center justify-center w-19 h-19 shadow-sm">
              <TriangleAlert class="w-9 h-9 text-red-700" />
            </div>

            <div class="flex-1 space-y-2 text-center sm:text-left">
              <h3 class="text-lg text-zinc-600 dark:text-zinc-50 tracking-tight">
                {{ message.header }}
              </h3>
              <div class="text-zinc-500 dark:text-zinc-400 leading-relaxed" v-html="message.message"></div>
            </div>
          </div>

          <div
            class="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50">
            <Button
              :label="message.rejectLabel || 'Annuler'"
              @click="rejectCallback"
              class="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 cursor-pointer" />
            <Button
              :label="message.acceptLabel || 'Confirmer'"
              @click="acceptCallback"
              class="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-xl hover:bg-red-700 dark:hover:bg-red-600 shadow-sm shadow-red-600/10 hover:shadow-red-600/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 cursor-pointer" />
          </div>
        </div>
      </template>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import AppHeader from '@/hbkthemes/components/AppHeader.vue';
import SiderBar from '@/hbkthemes/components/SiderBar.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { TriangleAlert } from '@lucide/vue';
import { useAppStore } from '@/stores/modules/appStore';
const AppStore = useAppStore();
const sidebarCollapsed = computed(() => AppStore.sidebarCollapsed);
const containerClass = computed(() => ({
  'sidebar-collapsed': sidebarCollapsed.value,
}));

onMounted(() => {
  // Doit rester dans le main layout (ici) et executér une seule fois.
  AppStore.onMontedSidebarCollapsed();
});
</script>
