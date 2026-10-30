<template>
  <div>
    <HeaderPage />
    <Card class="mb-8">
      <template #title>Gestions des données</template>
      <template #subtitle>
        <div
          class="mb-2 flex flex-wrap justify-between items-center min-h-[43px]"
        >
          <span
            >Vous pouvez rechercher, ajouter, modifier ou supprimer les
            éléments</span
          >
          <Button
            label="Ajouter"
            severity="primary"
            size="normal"
            outlined
            @click="goToCreatePage"
            v-if="canCreate"
          >
            <template #icon><Plus class="w-4 h-4" /></template>
          </Button>
        </div>
      </template>
      <template #content>
        <!-- Barre d'outils -->
        <Toolbar class="mb-4 flex">
          <template #start>
            <IconField iconPosition="left" class="max-w-full">
              <InputIcon>
                <Search class="w-4 h-4" />
              </InputIcon>
              <InputText
                placeholder="Rechercher..."
                class="max-w-full"
                @update:modelValue="searchQuery"
              />
            </IconField>
          </template>
          <template #end>
            <div class="flex gap-2 flex-wrap">
              <Button
                label="Actualiser"
                severity="secondary"
                size="small"
                outlined
                @click="fetchCollection"
                :loading="loading"
              >
                <template #icon><RefreshCw class="w-4 h-4" /></template>
              </Button>
              <Button
                label="Exporter"
                severity="secondary"
                size="small"
                outlined
                @click="exportData"
                :disabled="true"
              >
                <template #icon><Download class="w-4 h-4" /></template>
              </Button>
              <Button
                label="Imprimer"
                severity="secondary"
                size="small"
                outlined
                @click="printData"
                :disabled="true"
              >
                <template #icon><Printer class="w-4 h-4" /></template>
              </Button>
              <FilterColumns
                v-if="entityDefinition"
                :entityDefinition="entityDefinition"
                @saveConfig="onSaveConfig"
                :disabled="loading"
              />
            </div>
          </template>
        </Toolbar>
        <TableauCollectionList
          v-if="entityName"
          ref="tableauCollectionRef"
          v-model:entityDefinition="entityDefinition"
          v-model:loading="loading"
          v-model:canCreate="canCreate"
          :propEntityName="entityName"
          :fetchCollection="fetchCollection"
          :rowsPerPage="50"
          :viewEntity="true"
        />
      </template>
    </Card>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Download, Printer, Search } from "@lucide/vue";
import { defineAsyncComponent } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
// import TableauCollectionList from '@/hbkthemes/views/collections/components/TableauCollectionList.vue';
// import FilterColumns from '@/hbkthemes/views/collections/components/FilterColumuns.vue';
// import CompanyRequired from '@/hbkthemes/components/CompanyRequired.vue';
import Toast from "primevue/toast";

import type { EntityDefinitionInterface } from "@/types";

import { computed, ref } from "vue";
import HeaderPage from "@/hbkthemes/components/HeaderPage.vue";
import { useAppStore } from "@/stores/modules/appStore";

const appStore = useAppStore();

const entityName = computed(() => appStore.entityName);
const tableauCollectionRef = ref<InstanceType<typeof TableauCollectionList>>();
const entityDefinition = ref<EntityDefinitionInterface>();

const TableauCollectionList = defineAsyncComponent(async () => {
  try {
    return await import("@/hbkthemes/views/collections/components/TableauCollectionList.vue");
  } finally {
  }
});
const FilterColumns = defineAsyncComponent(async () => {
  try {
    return await import("@/hbkthemes/views/collections/components/FilterColumuns.vue");
  } finally {
  }
});

////////////////////////////////////////////////////////////////////////////////////////////
//
const loading = ref(false);
const canCreate = ref(false);

//

const exportData = () => {
  // À implémenter
};
const printData = () => {
  window.print();
};
const timeTyping = ref(500);
const timeoutInstance = ref();
const searchQuery = (search: any) => {
  clearTimeout(timeoutInstance.value);
  timeoutInstance.value = setTimeout(() => {
    // search doit avoir au moins 1 caractère pour être valide.
    if (search.length > 0) {
      tableauCollectionRef.value?.onSearch(search);
    } else {
      tableauCollectionRef.value?.onSearch(undefined);
    }
  }, timeTyping.value);
};

const fetchCollection = () => {
  tableauCollectionRef.value?.refreshCollection();
};
const onSaveConfig = (data: Record<string, any>) => {
  tableauCollectionRef.value?.saveColumnConfig(data);
};
const goToCreatePage = () => {
  tableauCollectionRef.value?.goToCreatePage();
};
</script>
