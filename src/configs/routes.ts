import type { HbkMenuItem as HbkMenuItemBase } from '@/types';
import { Home } from '@lucide/vue';

export type HbkMenuItem = HbkMenuItemBase;

const Sidebar = {
  /**
   * Les routes dynamiques à ajouter à la sidebar.
   * @private
   */
  dynamicRoutes: [] as HbkMenuItem[],

  /**
   * Permet de creer les routes et aussi de les ajouter sur le menu.
   * ( si vous souhaitez ajouter uniquement des routes sans affchage sur le menu, utilisez Router.addDynamicRoutes )
   * @param router
   * @param newRoutes
   */
  addDynamicRoutes: (router: any, newRoutes: HbkMenuItem[]) => {
    Sidebar.dynamicRoutes = newRoutes;
    // Reconstruire le router si nécessaire
    import('@/router/router').then(({ addDynamicRoutes }) => {
      addDynamicRoutes(router, newRoutes);
    });
  },

  /**
   * Definie les routes de la sidebar.
   */
  getRoutes: (): HbkMenuItem[] => {
    return [
      {
        route: '/app/dashboard',
        key: 'dashboard',
        template_key: 'dashboard',
        label: 'Tableau de bord',
        _icon: Home,
        display: true,
      },
      ...Sidebar.dynamicRoutes,
      //...Sidebar.testRoutes(),
      //...Sidebar.footerRoutes(),
    ];
  },

  getStaticComponents: (): Record<string, () => Promise<any>> => {
    return {
      dashboard: () => import('@/hbkthemes/views/dashboard/DashBoard.vue'),
      'entity-collection-list': () => import('@/hbkthemes/views/collections/EntityCollectionList.vue'),
      entity_create: () => import('@/hbkthemes/views/Entity/EntityCreate.vue'),
      entity_edit: () => import('@/hbkthemes/views/Entity/EntityEdit.vue'),
      entity_delete: () => import('@/hbkthemes/views/Entity/EntityDelete.vue'),
      entity_view: () => import('@/hbkthemes/views/Entity/EntityView.vue'),
    };
  },
};
export default Sidebar;
