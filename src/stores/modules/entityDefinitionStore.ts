import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Eye, List, Pencil, Plus, Trash2 } from '@lucide/vue';
import rootAxios from '@/configs/rootAxiosBody';
import { useSettingsStore } from '@/stores/modules/settingsStore';
import type { HbkMenuItem } from '@/configs/routes';
import type { EntitiesDefinitionInterface, EntityDefinitionInterface, BaseEntityConfigInterface, columnsInterface } from '@/types';

export const useEntityDefinitionStore = defineStore('entityDefinition', () => {
  // Récupérer l'instance du settings store
  const settingsStore = useSettingsStore();
  //const router = useRouter();

  const baseMenuUrl = `/api/form`;
  const entitiesDefintion = ref<EntitiesDefinitionInterface>({});

  /**
   * Permet de s'assurer que toutes disponible pour l'utilisateur courant on été definit.
   */
  const initializeAllRoutes = ref<boolean>(false);
  /**
   * contient des routes accessible via le menu..
   */
  const dynamicsMenuItems = ref<HbkMenuItem[]>([]);

  // Fetch menu items from the server
  const getMenus = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (initializeAllRoutes.value) {
        resolve();
        return;
      }
      dynamicsMenuItems.value = [];
      rootAxios
        .get(baseMenuUrl + `/available`)
        .then((response: any) => {
          response.data.forEach((item: any) => {
            if (item.display) {
              const menuItem: HbkMenuItem = {
                key: item.entity,
                entity: item.entity,
                route: '/entity-collection/' + item.entity,
                label: item.label,
                icon: item.icon,
                badge: item.badge ?? undefined,
                requiresAuth: true,
                // Le template doit etre vide afin de permettre le rendu des template enfants.
                template_key: null,
                redirect: '/entity-collection/' + item.entity + '/list',
                display: true,
                items: [
                  {
                    key: item.entity + '.list',
                    route: '/entity-collection/' + item.entity + '/list',
                    label: 'Listes',
                    _icon: List,
                    requiresAuth: true,
                    template_key: 'entity-collection-list',
                    entity: item.entity,
                    display: false,
                  },
                ],
              };
              // on peut aussi souhaiter retirer le menu 'list' comme sous-menu et l'ajouter ici.
              // TODO voir comment retirer le menu 'list' comme sous-menu.
              if (item.actions && item.actions.length) {
                // menu et route pour la creation.
                const itemCreate: HbkMenuItem = {
                  key: item.entity + '.create',
                  entity: item.entity,
                  route: '/entity-collection/' + item.entity + '/create',
                  label: 'Ajouter',
                  _icon: Plus,
                  requiresAuth: true,
                  template_key: 'entity_create',
                  display: true,
                };
                menuItem.items?.push(...item.actions.filter((action: string) => action === 'create').map(() => itemCreate));

                menuItem.items?.push(
                  ...item.actions
                    .filter((action: string) => action === 'edit')
                    .map((action: string) => ({
                      key: item.entity + '.' + action,
                      entity: item.entity,
                      route: '/entity-collection/' + item.entity + '/' + action + '/:entity_id',
                      label: 'Modifier',
                      _icon: Pencil,
                      requiresAuth: true,
                      template_key: 'entity_' + action,
                      display: false,
                    })),
                );

                // Route pour la suppression
                menuItem.items?.push(
                  ...item.actions
                    .filter((action: string) => action === 'delete')
                    .map((action: string) => ({
                      key: item.entity + '.' + action,
                      entity: item.entity,
                      route: '/entity-collection/' + item.entity + '/' + action + '/:entity_id',
                      label: 'Supprimer',
                      _icon: Trash2,
                      requiresAuth: true,
                      template_key: 'entity_' + action,
                      display: false,
                    })),
                );
                // Route pour la visualisation
                menuItem.items?.push(
                  ...item.actions
                    .filter((action: string) => action === 'view')
                    .map((action: string) => ({
                      key: item.entity + '.' + action,
                      entity: item.entity,
                      route: '/entity-collection/' + item.entity + '/' + action + '/:identity_id',
                      label: 'Visualiser',
                      _icon: Eye,
                      requiresAuth: true,
                      template_key: 'entity_' + action,
                      display: false,
                    })),
                );
              }
              dynamicsMenuItems.value.push(menuItem);
            }
          });
          initializeAllRoutes.value = true;
          /**
           * On initialise uniquement les routes dynamiques.
           * ( Pour les menus dynamiques, on laisse le composant "MenusItems" s'en chargé. )
           */
          // if (DynamicRoutes.value?.length > 0) {
          //   addDynamicRoutes(router, DynamicRoutes.value);
          // }
          resolve();
        })
        .catch((error: any) => {
          initializeAllRoutes.value = false;
          reject(error);
        });
    });
  };
  /**
   * Get definition of an entity
   */
  const getEntityDefinition = (entityName: string): Promise<EntityDefinitionInterface> => {
    return new Promise((resolve, reject) => {
      // on ne recupere pas la definition si elle est deja dans le store.
      if (entitiesDefintion.value[entityName]) {
        resolve(entitiesDefintion.value[entityName]);
        return;
      }
      rootAxios
        .get(baseMenuUrl + `/definition/${entityName}`)
        .then(async (response: any) => {
          /**
           * On surcharge les valeurs column.display et column.label avec les valeurs de la surcharge.
           */
          const BaseEntityConfig = await getConfig(entityName);
          if (BaseEntityConfig) {
            const columnsOverride = BaseEntityConfig.configValue as columnsInterface[];
            for (const i in columnsOverride) {
              if (response.data.columns[i] && columnsOverride[i]) {
                response.data.columns[i].display = columnsOverride[i].display;
                response.data.columns[i].label = columnsOverride[i].label;
              }
            }
          }
          entitiesDefintion.value[entityName] = {
            columns: response.data.columns,
            entity_config: response.data.entity_config,
            enums: response.data.enums,
          };
          resolve(entitiesDefintion.value[entityName]);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  };
  /**
   * Sauvegarde la configuration en relation avec la societé pour une entité ou e relation avec l'utilisateur connecté.
   *
   * @param entityName
   * @param data
   */
  const saveConfig = (config: BaseEntityConfigInterface): Promise<BaseEntityConfigInterface> => {
    return settingsStore.saveConfig(config);
  };

  /**
   *
   * @param entityName
   * @returns
   */
  const getConfig = async (configKey: string): Promise<BaseEntityConfigInterface | null> => {
    return await settingsStore.getConfig(configKey);
  };

  const getEmptyEntityDefinition = (): EntityDefinitionInterface => {
    return {
      columns: {},
      entity_config: {
        enabled: false,
        label: '',
        entity: '',
        icon: '',
        order: 0,
        actions: [],
      },
      enums: {},
    };
  };

  return {
    getMenus,
    getEntityDefinition,
    getEmptyEntityDefinition,
    dynamicsMenuItems,
    initializeAllRoutes,
    saveConfig,
    getConfig,
  };
});
