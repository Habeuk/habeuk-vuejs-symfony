import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import CustomPreset from './theme/preset';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import App from './App.vue';
import router from './router/router';

const app = createApp(App);

app.use(createPinia());
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
app.mount('#app');
