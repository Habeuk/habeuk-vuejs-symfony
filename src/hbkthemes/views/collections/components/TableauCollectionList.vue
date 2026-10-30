<template>
  <div>
    <DataTable
      :value="entities"
      v-model:selection="selectedEntities"
      :paginator="paginator"
      :rows="rowsPerPage"
      stripedRows
      :showGridlines="showGridlines"
      :loading="isLoading"
      :lazy="true"
      selectionMode="multiple"
      @sort="onSort">
      <Column v-if="showSelectionColumn" selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column
        v-for="(col, fieldName) in visibleColumns"
        v-memo="[col.label, col.sortable, fieldName]"
        :key="fieldName"
        :field="fieldName"
        :header="col.label"
        :sortable="col.sortable !== false">
        <template #body="{ data }">
          <DisplayLine :col="col" :data="data" :fieldName="fieldName" :enums="enums" />
        </template>
      </Column>

      <!-- Colonne Actions -->
      <Column header="Actions" headerStyle="width: 8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button severity="info" variant="outlined" class="border-0" @click="openViewDialog(data)" v-if="canView">
              <template #icon><Eye class="w-4 h-4" /></template>
            </Button>
            <Button severity="success" variant="outlined" class="border-0" @click="goToEditEntity(data)" v-if="canEdit">
              <template #icon><Pencil class="w-4 h-4" /></template>
            </Button>
            <Button
              v-if="canDelete"
              severity="danger"
              variant="outlined"
              @click="confirmDelete(data)"
              title="Supprimer"
              class="border-0">
              <template #icon><Trash2 class="w-4 h-4" /></template>
            </Button>
          </div>
        </template>
      </Column>
      <template #empty>
        <div v-if="loading" class="text-center py-8 h3 gap-4 flex-wrap flex items-center justify-center mt-15">
          <div class="text-primary-900 text-2xl">Chargement encours ...</div>
        </div>
        <div v-else class="text-center py-8 h3 gap-4 flex-wrap flex items-center justify-center">
          <Inbox class="w-5 h-5 text-primary-700 mt-1 block" />
          <div class="text-primary-900 text-2xl">Aucune donnée trouvée</div>
        </div>
      </template>
      <template #paginatorcontainer="{ prevPageCallback, nextPageCallback, firstPageCallback, lastPageCallback }">
        <div v-if="showResumerEntites && collection" class="flex flex-wrap items-center justify-between gap-3 px-0 py-3 my-1 w-full">
          <!-- Left side: Info -->
          <div class="text-gray-400">
            <span class="gap-4 hidden sm:inline flex-wrap">
              <span class="pe-5">{{ collection.items.length }} résultats</span>
              <span>{{ collection.to }} / {{ collection.total }}</span>
            </span>

            <span class="sm:hidden">Page {{ collection.items.length }} / {{ collection.total }}</span>
          </div>

          <!-- Center: Numéros de pages -->
          <div v-if="showPagination" class="flex items-center gap-1 flex-wrap">
            <!-- First -->
            <Button
              severity="secondary"
              text
              rounded
              class="w-8 h-8 p-0 flex items-center justify-center"
              @click="firstPageCallback"
              :disabled="collection.page === 0">
              <ChevronsLeft class="w-4 h-4 text-gray-400" />
            </Button>

            <!-- Previous -->
            <Button
              severity="secondary"
              text
              rounded
              class="w-8 h-8 p-0 flex items-center justify-center"
              @click="prevPageCallback"
              :disabled="collection.page === 0">
              <ChevronLeft class="w-4 h-4 text-gray-400" />
            </Button>

            <!-- Page Numbers -->
            <div class="flex items-center gap-2 mx-2 flex-wrap">
              <template v-for="(n, index_pagin) in paginations" :key="index_pagin">
                <Button
                  v-if="n.label === '...'"
                  :label="'...'"
                  severity="secondary"
                  text
                  rounded
                  size="small"
                  class="w-8 h-8 p-0 flex items-center justify-center cursor-default" />
                <Button
                  v-else
                  :severity="n.page === collection.page ? 'primary' : 'secondary'"
                  :text="n.page !== collection.page"
                  class="w-8 h-8 p-0 flex items-center justify-center"
                  rounded
                  size="small"
                  @click="onPageChange(n.page)">
                  <span class="">{{ n.label }}</span>
                </Button>
              </template>
            </div>

            <!-- Next -->
            <Button
              severity="secondary"
              text
              rounded
              size="small"
              class="w-8 h-8 p-0 flex items-center justify-center"
              @click="nextPageCallback"
              :disabled="collection.page === collection.totalPages - 1">
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </Button>

            <!-- Last -->
            <Button
              severity="secondary"
              text
              rounded
              size="small"
              class="w-8 h-8 p-0 flex items-center justify-center"
              @click="lastPageCallback"
              :disabled="collection.page === collection.totalPages - 1">
              <ChevronsRight class="w-4 h-4 text-gray-400" />
            </Button>
            <div class="flex items-center gap-2 text-sm">
              <Select
                v-model="rowsPerPage"
                :options="rowsPerPageOptions"
                optionLabel="label"
                optionValue="value"
                size="small"
                class="py-1 bg-gray-100 flex justify-between text-sm"
                @change="changeRowsPerPage" />
            </div>
          </div>

          <!-- Right side: Rows per page (optionnel) -->
        </div>
      </template>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import DisplayLine from '@/hbkthemes/views/collections/components/DisplayLine.vue';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Inbox, Pencil, Trash2 } from '@lucide/vue';
import { useCollection } from '@/hbkthemes/views/collections/useCollection';
import { useEntity } from '@/hbkthemes/views/Entity/useEntity';
import { QueryBuilder as QueryBuilderClass } from '@/services/QueryBuilder';
import type { EntityDefinitionInterface, BaseEntityView, columnsInterface, enumsInterface } from '@/types';
import type { QueryParamsInterface } from '@/types/filters';
import type { DataTableSortEvent } from 'primevue/datatable';
interface pageItem {
  page: number;
  index: number;
  label: string;
}
// Start  ==================== PROPS & EMITS ====================
const props = withDefaults(
  defineProps<{
    propEntityName: string;
    showSelectionColumn?: boolean;
    showGridlines?: boolean;
    rowsPerPage?: number;
    paginator?: boolean;
    viewEntity?: boolean;
    editEntity?: boolean;
    deleteEntity?: boolean;
    showResumerEntites?: boolean;
  }>(),
  {
    showSelectionColumn: true,
    showGridlines: false,
    rowsPerPage: 10,
    paginator: true,
    viewEntity: false,
    editEntity: true,
    deleteEntity: true,
    showResumerEntites: true,
  },
);

const emit = defineEmits<{
  (e: 'update:entityDefinition', data: EntityDefinitionInterface): void;
}>();
// END  ==================== PROPS & EMITS ====================

// Start  ==================== MODELES ====================
const modelLoading = defineModel<boolean>('loading', {
  default: false,
});
const modelCanCreate = defineModel<boolean>('canCreate', {
  default: false,
});

// END  ==================== MODELES ====================

// Start  ==================== COMPOSABLES & HOOKS ====================
const entityName = computed<string>(() => props.propEntityName);
const { collection, loadEntities, loading, getEntityDefinition, entityDefinition, reset, saveConfig } = useCollection(entityName.value as string);
const { deleteEntity: deleteEntityFn, loading: entityLoading } = useEntity(entityName.value as string);

const confirm = useConfirm();
const router = useRouter();
// END  ==================== COMPOSABLES & HOOKS ====================

// Start  ==================== ÉTATS LOCAUX ====================
const QueryParams = (): QueryParamsInterface => {
  const params: QueryParamsInterface = { sorts: [], filters: [] };
  params.sorts?.push({
    fieldname: 'id',
    order: 'desc',
  });
  return params;
};
const queryBuilder = ref<QueryBuilderClass>(new QueryBuilderClass(QueryParams()));

const selectedEntities = ref<BaseEntityView[]>([]);
const rowsPerPage = ref<number>(props.rowsPerPage);
const rowsPerPageOptions = ref([
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
]);
const page = ref<number>(1);
// END  ==================== ÉTATS LOCAUX ====================

// Start  ==================== COMPUTED ====================
const isLoading = computed(() => loading.value || entityLoading.value);
const showPagination = computed(() => collection.value?.totalPages && collection.value.totalPages > 1);
const entities = computed<BaseEntityView[]>(() => {
  if (collection.value?.items) return collection.value.items;
  return [];
});

const visibleColumns = computed(() => {
  const cols: columnsInterface = {};
  for (const i in entityDefinition.value.columns) {
    const fieldConfig = entityDefinition.value.columns[i];
    if (fieldConfig && fieldConfig.display) {
      cols[i] = fieldConfig;
    }
  }
  return cols;
});

const enums = computed<enumsInterface>(() => {
  return entityDefinition.value.enums || {};
});
const canCreate = computed(() => {
  if (entityDefinition.value && entityDefinition.value.entity_config) {
    return entityDefinition.value.entity_config.actions.includes('create');
  }
  return false;
});

const canView = computed(() => props.viewEntity);

const canEdit = computed(() => {
  if (props.editEntity && entityDefinition.value.entity_config) {
    return entityDefinition.value.entity_config.actions.includes('edit');
  }
  return false;
});

const canDelete = computed(() => {
  if (props.deleteEntity && entityDefinition.value.entity_config) {
    return entityDefinition.value.entity_config.actions.includes('delete');
  }
  return false;
});
const paginations = computed(() => {
  const totalPages = collection.value.totalPages;
  const currentPage = collection.value.page;
  const pages: pageItem[] = [];
  const maxVisible = 5; // Nombre max de boutons visibles
  if (totalPages && currentPage) {
    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) {
        pages.push({ index: i, page: i + 1, label: (i + 1).toString() });
      }
      return pages;
    }
    pages.push({ index: 0, page: 1, label: '1' }); // première page
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    if (start > 1) pages.push({ index: -1, page: -1, label: '...' });
    for (let i = start; i <= end; i++) {
      pages.push({ index: i, page: i + 1, label: (i + 1).toString() });
    }
    if (end < totalPages - 2) pages.push({ index: -1, page: -1, label: '...' });
    if (totalPages > 1)
      pages.push({
        index: totalPages - 1,
        page: totalPages,
        label: totalPages.toString(),
      }); // dernière page
  }
  return pages;
});
// END  ==================== COMPUTED ====================

// Start  ==================== MÉTHODES ====================
const initloadEntities = () => {
  if (entityName.value) {
    getEntityDefinition(entityName.value).then(() => {
      emit('update:entityDefinition', entityDefinition.value);
      loadEntities(entityName.value, page.value, rowsPerPage.value, queryBuilder.value.toURLSearchParams());
    });
  }
};

const refreshCollection = () => {
  initloadEntities();
};

const saveColumnConfig = (data: Record<string, unknown>) => {
  const config = {
    configKey: entityName.value,
    configValue: data,
    valueType: 'json' as const,
  };
  saveConfig(config);
};

const removeValue = async (id: number | string) => {
  await deleteEntityFn(entityName.value, id);
  initloadEntities();
};

const onSort = (event: DataTableSortEvent) => {
  const sortField = event.sortField as string;
  queryBuilder.value.setDefaultSort(sortField, event.sortOrder === 1 ? 'asc' : 'desc');
  loadEntities(entityName.value, page.value, rowsPerPage.value, queryBuilder.value.toURLSearchParams()).then(() => {
    // on vide les sorts
    queryBuilder.value.resetSorts();
  });
};

const openViewDialog = (item: BaseEntityView) => {
  router.push(`/entity-collection/${entityName.value}/view/${item.id}`);
};

const goToEditEntity = (item: BaseEntityView) => {
  router.push(`/entity-collection/${entityName.value}/edit/${item.id}`);
};

const confirmDelete = (entity: BaseEntityView) => {
  const title = entity.title ?? entity.id;
  confirm.require({
    message: `<p>Êtes-vous certain de vouloir supprimer ce contenu : <b class="text-red-900">${title}</b> ?</p><p>La suppression est irréversible.</p>`,
    header: 'Confirmation de suppression',
    rejectLabel: 'Cancel',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: () => {
      removeValue(entity.id);
    },
    reject: () => {},
  });
};

const goToCreatePage = () => {
  router.push(`/entity-collection/${entityName.value}/create`);
};

const onPageChange = (pageSelect: number) => {
  page.value = pageSelect;
  loadEntities(entityName.value, page.value, rowsPerPage.value);
};

const changeRowsPerPage = (e: { value: number }) => {
  loadEntities(entityName.value, page.value, e.value);
};

const onSearch = (search?: string) => {
  if (search) {
    queryBuilder.value.setSearch(search);
  } else {
    queryBuilder.value.resetSearch();
  }
  page.value = 1;
  loadEntities(entityName.value, page.value, rowsPerPage.value, queryBuilder.value.toURLSearchParams());
};
// END  ==================== MÉTHODES ====================

// Start  ==================== WATCHERS ====================
watch(entityName, (newEntityName) => {
  if (newEntityName) {
    queryBuilder.value = new QueryBuilderClass(QueryParams());
    reset();
    initloadEntities();
  }
});

watch(isLoading, (newLoading) => {
  modelLoading.value = newLoading;
});
watch(canCreate, (newCanCreate) => {
  modelCanCreate.value = newCanCreate;
});
// END  ==================== WATCHERS ====================

// Start  ==================== LIFECYCLE ====================
onMounted(() => {
  initloadEntities();
});
// END  ==================== LIFECYCLE ====================

// Start  ==================== EXPOSES ====================
defineExpose({
  refreshCollection,
  saveColumnConfig,
  goToCreatePage,
  onSearch,
});
// END  ==================== EXPOSES ====================
</script>
