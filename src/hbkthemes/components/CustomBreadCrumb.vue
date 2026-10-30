<template>
  <div class="custombreadcrund bg-surface-100">
    <BreadCrumb :home="homeDefault" :model="breadcrumbItems" class="bg-surface-100">
      <template #item="{ item, props }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a :href="href" v-bind="props.action" @click="navigate">
            <component :is="item.icon" v-if="item.icon" class="text-color" />
            <span class="text-primary font-semibold">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
          <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
        </a>
      </template>
      <template #separator>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="p-icon p-breadcrumb-separator-icon"
          aria-hidden="true"
          data-pc-section="separatoricon">
          <path
            d="M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z"
            fill="currentColor"></path>
        </svg>
      </template>
    </BreadCrumb>
  </div>
</template>
<script setup lang="ts">
import BreadCrumb from 'primevue/breadcrumb';
import { Home } from '@lucide/vue';
import { computed } from 'vue';
import type { Component } from 'vue';
import type { MenuItem as PrimeMenuItem } from 'primevue/menuitem';
import { useRoute } from 'vue-router';
const route = useRoute();

interface ItemInterface {
  label?: string;
  route?: string;
  /** Icône lucide affichée à gauche du libellé. */
  icon?: Component;
}
const props = defineProps<{
  home?: ItemInterface;
  model?: ItemInterface[];
}>();
const homeDefault = computed<PrimeMenuItem>(
  () =>
    (props.home ?? {
      icon: Home,
      route: '/',
      label: 'Tableau de bord',
      // MenuItem type son icône comme une classe CSS : nos icônes sont des composants
      // lucide rendus par le slot #item, d'où le cast localisé.
    }) as unknown as PrimeMenuItem,
);
const breadcrumbItems = computed(() => {
  const items: PrimeMenuItem[] = [];
  const matchedRoutes = route.matched;
  matchedRoutes.forEach((matchedRoute, index) => {
    if (index === 0 && matchedRoute.path === '/') return;
    if (matchedRoute.path == '/form/:entity') {
      const label = route.params.entity as string;
      items.push({
        label: String(label),
        route: '/' + label,
        class: 'text-primary font-semibold',
      });
      const label2 = matchedRoute.meta?.title || matchedRoute.name || 'Page';
      items.push({ label: String(label2) });
    } else {
      const label = matchedRoute.meta?.title || matchedRoute.name || 'Page';
      // Ne pas mettre de lien sur le dernier élément
      if (index === matchedRoutes.length - 1) {
        items.push({ label: String(label) });
      } else {
        items.push({
          label: String(label),
          route: matchedRoute.path,
          class: 'text-primary font-semibold',
        });
      }
    }
  });
  return items;
});
</script>
<style lang="scss">
.custombreadcrund .p-breadcrumb {
  padding-left: 0;
}
</style>
