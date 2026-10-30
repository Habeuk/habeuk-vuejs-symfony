// frontend/src/router/router.ts
import type { RouteRecordRaw, Router } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '../hbkthemes/layout/AppLayout.vue';
import appConfig from '@/configs/appConfig';
import Sidebar from '@/configs/routes';
import { useAuthStore } from '@/stores/modules/authStore';
import { useEntityDefinitionStore } from '@/stores/modules/entityDefinitionStore';
import type { HbkMenuItem } from '@/configs/routes';

const childrens: RouteRecordRaw[] = [];
const componentMap = Sidebar.getStaticComponents();
const items = Sidebar.getRoutes();
const buildMenus = (items: HbkMenuItem[], rows: RouteRecordRaw[]) => {
  items.forEach((item) => {
    const entityKey = item.entity ?? undefined;

    let componentLoader = item.template_key ? componentMap[item.template_key] : null;

    /**
     * Les entites ont un templates par defaut. mais ce dernier peut etre surcharger en function du besoin.
     */
    if (componentLoader !== null && entityKey !== undefined) {
      const str = entityKey.toLowerCase();
      componentLoader = componentMap[item.template_key + '__' + str] ?? componentLoader;
    }
    if (componentLoader) {
      const row: RouteRecordRaw = {
        path: item.route,
        name: item.key,
        meta: {
          title: item.label,
          entity: entityKey,
          // On opte de proteger toutes les routes.
          requiresAuth: true,
        },
        component: componentLoader,
        children: [],
        redirect: item.redirect ?? undefined,
      };
      if (item.items) {
        buildMenus(item.items, row.children);
      }
      rows.push(row);
    } else {
      const row: RouteRecordRaw = {
        path: item.route,
        name: item.key,
        meta: {
          title: item.label,
          // On opte de proteger toutes les routes.
          requiresAuth: true,
        },
        children: [] as RouteRecordRaw[],
        redirect: item.redirect ?? undefined,
      };

      if (item.items && row.children) {
        buildMenus(item.items, row.children);
      }
      rows.push(row);
    }
  });
};
buildMenus(items, childrens);

/**
 * Permet d'ajouter des routes dynamiques au router.
 * ( si vous souhaitez les ajouter au menus, utilisez Sidebar.addDynamicRoutes )
 * @param router
 * @param newRoutes
 */
export const addDynamicRoutes = (router: Router, newRoutes: HbkMenuItem[]) => {
  const dynamicRoutes: RouteRecordRaw[] = [];
  buildMenus(newRoutes, dynamicRoutes);

  // Trouver la route layout (celle qui a AppLayout)
  const layoutRoute = router.getRoutes().find((r) => r.name === 'app-layout');
  if (layoutRoute) {
    dynamicRoutes.forEach((route) => {
      router.addRoute(layoutRoute.name!, route);
    });
  }
};

// Définir le type des routes pour plus de sécurité
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/app/dashboard',
  },
  {
    // Nouvelle route pour la vérification
    path: '/app/verification',
    name: 'verification',
    component: () => import('@/hbkthemes/views/VerificationView.vue'),
    meta: { requiresAuth: false }, // Accessible sans authentification
  },
  {
    path: '/app/login',
    name: 'login',
    component: () => import('@/hbkthemes/views/auth/cover/LoginView.vue'),
    meta: { requiresAuth: false }, // ← accessible sans auth
  },
  {
    path: '/app/register',
    name: 'register',
    component: () => import('@/hbkthemes/views/auth/cover/RegisterView.vue'),
    meta: { requiresAuth: false }, // ← accessible sans auth
  },
  {
    path: '/app/loading-app',
    name: 'loading-app',
    component: () => import('@/hbkthemes/views/LoadingView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    component: AppLayout,
    name: 'app-layout',
    children: [
      ...childrens,
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/hbkthemes/views/NotFound/NotFoundViewAnimate.vue'),
      },
    ],
  },
];

const clearFullPath = (redirectPath: string): string => {
  // if (redirectPath && redirectPath.startsWith("/app/")) {
  //   redirectPath = redirectPath.replace("/app", "");
  // }
  return redirectPath;
};

const router = createRouter({
  history: createWebHistory('/'), // Base URL, ajustez si nécessaire
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // TODO à quoi ceci sert ?
    // Revenir en haut de page à la navigation
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

/**
 * Vérifie l'authentification des utilisateurs avant chaque navigation.
 *
 * Fonctionnement :
 * - `initSession()` (appelé dans `main.ts` avant le montage) a déjà tenté
 *   de restaurer la session via le cookie refresh HttpOnly, et hydraté
 *   `accessTokenStore` en mémoire. Le `beforeEach` n'a donc plus rien à
 *   déclencher : il lit simplement `authStore.isAuthenticated` (computed
 *   basé sur la présence d'un access token en mémoire).
 * - Si la route exige l'authentification et que l'utilisateur ne l'est pas,
 *   redirection vers `/login` avec la route d'origine en `?redirect=`.
 * - Si l'utilisateur est connecté mais que les routes dynamiques ne sont
 *   pas encore chargées, redirection temporaire vers `/loading-app`.
 * - Si l'utilisateur est déjà connecté et tente d'aller sur `/login` ou
 *   `/register`, redirection vers `/dashboard` (ou la route `?redirect=`).
 */
router.beforeEach(async (to, _from) => {
  const authStore = useAuthStore();

  // `isAuthenticated` est un computed basé sur l'access token en mémoire.
  // Il a déjà été hydraté par `initSession()` dans main.ts, avant le montage.
  const isAuth = authStore.isAuthenticated;
  console.log('router.beforeEach', to.fullPath, 'isAuth:', isAuth);

  // Route protégée + pas authentifié → redirection vers /login avec retour.
  if (to.meta?.requiresAuth !== false && !isAuth) {
    return { path: '/app/login', query: { redirect: clearFullPath(to.fullPath) } };
  }

  // On vérifie que les routes dynamiques ont été initialisées avant de rediriger.
  const entityDefinitionStore = useEntityDefinitionStore();
  if (isAuth && !entityDefinitionStore.initializeAllRoutes && to.path !== '/app/loading-app') {
    return {
      path: '/app/loading-app',
      query: { redirect: clearFullPath(to.fullPath) },
    };
  }

  // Utilisateur déjà connecté sur /login ou /register → on le renvoie ailleurs.
  if ((to.path === '/app/login' || to.path === '/app/register') && isAuth) {
    const redirectPath = to.query.redirect as string;
    return redirectPath || '/app/dashboard';
  }

  // Titre de la page
  if (to.meta?.title) {
    document.title = `${to.meta.title} - ${appConfig.name}`;
  } else {
    document.title = appConfig.name;
  }
  return true;
});

export default router;
