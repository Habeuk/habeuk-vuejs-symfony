<template>
  <PanelMenu
    :model="panelMenuModel"
    v-model:expandedKeys="expandedKeys"
    class="hbk-panel-menu"
    :class="[sidebarCollapsed ? 'sidebar-collapsed' : '']">
    <template #item="{ item }">
      <div v-if="item.display">
        <router-link v-if="item.route" :to="item.route" custom v-slot="{ href, navigate, isActive }">
          <div class="flex items-center nav-item text-white" :class="[isActive ? 'is-active' : '']">
            <a
              :href="href"
              @click.prevent="onNavigate(navigate)"
              class="flex items-center transition-colors duration-200 text-white nav-link"
              :class="[isActive ? 'is-active' : '']">
              <component v-if="item._icon" :is="resolveMenuIcon(item._icon)" class="mr-3 menu-icon w-4 h-4" :class="isActive ? 'active' : ''" />
              <span v-if="!sidebarCollapsed" class="flex-1 menu-label">{{ item.label }}</span>
              <Badge v-if="item.badge" :value="item.badge" class="bg-primary-500" />
            </a>
            <template v-if="item.items && item.items.length && !sidebarCollapsed">
              <ChevronDown v-if="expandedKeys[getKey(item)]" class="ml-2 transition-transform text-xs text-gray-500 w-4 h-4" />
              <ChevronRight v-else class="ml-2 transition-transform text-xs text-gray-500 w-4 h-4" />
            </template>
          </div>
        </router-link>
        <div v-else class="flex items-center nav-item text-white">
          <a :href="item.url" :target="item.target" class="text-white nav-link">
            <component v-if="item._icon" :is="resolveMenuIcon(item._icon)" class="mr-3 menu-icon w-4 h-4" />
            <span v-if="!sidebarCollapsed" class="flex-1 menu-label">{{ item.label }}</span>
          </a>
          <template v-if="item.items && !sidebarCollapsed">
            <ChevronDown v-if="expandedKeys[getKey(item)]" class="ml-2 transition-transform text-xs text-gray-500 w-4 h-4" />
            <ChevronRight v-else class="ml-2 transition-transform text-xs text-gray-500 w-4 h-4" />
          </template>
        </div>
      </div>
    </template>
  </PanelMenu>
</template>

<script setup lang="ts">
import PanelMenu from 'primevue/panelmenu';
import Badge from 'primevue/badge';
//import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import { ChevronDown, ChevronRight } from '@lucide/vue';
import { resolveMenuIcon } from '@/configs/icons';
import type { HbkMenuItem } from '@/configs/routes';
import type { MenuItem } from 'primevue/menuitem';
import Sidebar from '@/configs/routes';
import { useAppStore } from '@/stores/modules/appStore';
import { useEntityDefinitionStore } from '@/stores/modules/entityDefinitionStore';
const AppStore = useAppStore();
const entityDefinitionStore = useEntityDefinitionStore();
//const router = useRouter();
const sidebarCollapsed = computed(() => AppStore.sidebarCollapsed);
const expandedKeys = ref<Record<string, boolean>>({});
/**
 * Menus affichés
 */
const menuItems = ref<HbkMenuItem[]>([]);
// methode
entityDefinitionStore.getMenus().then(() => {
  Sidebar.dynamicRoutes = entityDefinitionStore.dynamicsMenuItems;
  menuItems.value = Sidebar.getRoutes();
});
const getKey = (item: MenuItem) => {
  return item.key ?? item.route;
};
const menuItemsFiltered = computed(() =>
  menuItems.value.filter((item) => {
    return item.display !== undefined ? item.display : false;
  }),
);
/**
 * PanelMenu n'accepte que des icônes sous forme de classe CSS : on caste le modèle.
 * Le rendu réel des icônes est assuré par le slot #item (composants lucide).
 */
const panelMenuModel = computed(
  () =>
    menuItemsFiltered.value.map((item) => ({
      ...item,
      _icon: item.icon,
      icon: undefined,
    })) as unknown as MenuItem[],
);
console.log('panelMenuModel : ', panelMenuModel);
const onNavigate = (navigate: () => void) => {
  navigate();
  AppStore.closeSidebarMobile();
};
</script>
