import './assets/main.css';
import './hbkthemes/assets/style.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import CustomPreset from './theme/preset';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
// import { initSession, onSessionExpired } from './configs/rootAxios';
import { initSession, onSessionExpired } from './configs/rootAxiosBody';
import App from './App.vue';
import router from './router/router';
import { useAuthStore } from './stores/modules/authStore';
import type { userEntity } from './types';

const bootstrap = async () => {
  // 1. Tenter de restaurer la session (token + user via cookie refresh)
  const { ok, user } = await initSession();
  console.log('Session restored:', ok, user);

  // 2 Creation de l'app Vue, Pinia, Router et PrimeVue
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.use(router);
  app.use(PrimeVue, {
    theme: {
      preset: CustomPreset,
      options: {
        darkModeSelector: '.app-dark',
        cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
      },
    },
  });
  app.use(ToastService);
  app.use(ConfirmationService);

  // 3. Si la session est restaurée et que le backend a renvoyé l'user,
  //    on hydrate le store (Pinia est dispo, on peut appeler useAuthStore()).
  if (ok && user) {
    const authStore = useAuthStore();
    authStore.setUser(user as userEntity);
  }

  // 4. Brancher le handler de session expirée (le router est dispo aussi).
  onSessionExpired(() => {
    const authStore = useAuthStore();
    authStore.reset();
    const currentPath = router.currentRoute.value.fullPath;
    router.push({ path: '/login', query: { redirect: currentPath } });
  });

  // 5. Monter
  app.mount('#app');
};

bootstrap();
