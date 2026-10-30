<template>
  <Toast />

  <div class="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100">
    <div class="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <div v-if="showError" class="mb-9">
        <Message closable severity="error">
          <template #icon><TriangleAlert class="w-4 h-4" /></template>
          <div v-html="errorMessage"></div>
        </Message>
      </div>
      <div class="w-full max-w-3xl mx-auto">
        <div class="grid md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
          <!-- === COLONNE GAUCHE - DESCRIPTION === -->
          <ContentLeft :open_home_page="open_home_page" />

          <!-- === COLONNE DROITE - FORMULAIRE === -->
          <div class="p-6 lg:p-8 flex flex-col lg:max-w-100 items-center lg:ms-4">
            <!-- Version Mobile -->
            <div class="md:hidden mb-6 text-center">
              <a @click.prevent="open_home_page" href="#" class="inline-block">
                <img src="/images/hbk-ai-logo.webp" alt="Logo HBK Horizon" class="mx-auto max-w-22.5" />
              </a>
              <h1 class="text-md font-semibold text-gray-800">HBK Horizon</h1>
            </div>

            <div class="flex-1 flex flex-col justify-center">
              <div class="max-w-md mx-auto w-full">
                <h2 class="text-2xl font-semibold text-gray-800 mb-2 text-center md:text-left">Connexion</h2>
                <p class="text-gray-500 text-base mb-8 text-center md:text-left">Accédez à votre espace professionnel</p>

                <!-- Formulaire -->
                <form @submit.prevent="handleLogin" class="space-y-5">
                  <!-- Email -->
                  <div class="space-y-1.5">
                    <label class="block font-medium text-gray-700">
                      <Mail class="w-4 h-4 mr-2 text-primary-500" />
                      Adresse email
                    </label>
                    <InputText
                      v-model="formData.email"
                      type="email"
                      placeholder="exemple@entreprise.com"
                      :class="[
                        'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        errors.email ? 'border-red-500 ring-red-200' : '',
                      ]" />
                    <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
                  </div>

                  <!-- Mot de passe -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between items-center">
                      <label class="block font-medium text-gray-700">
                        <Lock class="w-4 h-4 mr-2 text-primary-500" />
                        Mot de passe
                      </label>
                    </div>
                    <Password
                      v-model="formData.password"
                      :feedback="false"
                      placeholder="Votre mot de passe"
                      toggleMask
                      :class="{ 'p-invalid': errors.password }"
                      class="w-full [&>input]:w-full [&>input]:px-4 [&>input]:py-2.5 [&>input]:rounded-xl [&>input]:border [&>input]:border-gray-200" />
                    <p v-if="errors.password" class="text-red-500 text-sm">{{ errors.password }}</p>
                  </div>

                  <!-- Options -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <Checkbox v-model="formData.rememberMe" binary inputId="remember" />
                      <label for="remember" class="text-gray-600 cursor-pointer text-sm">Se souvenir de moi</label>
                    </div>
                    <button type="button" @click="forgotPassword" class="text-sm text-primary-600 hover:text-primary-700 hover:underline hidden">
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <!-- Bouton -->
                  <Button
                    type="submit"
                    :loading="loading"
                    :disabled="!formData.email || !formData.password"
                    severity="transparent"
                    variant="outline"
                    :class="[
                      'w-full bg-linear-to-r from-slate-600 border-0!  via-slate-700 to-slate-800 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-200 max-w-75',
                      !formData.email || !formData.password
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]',
                    ]">
                    <LogIn class="w-4 h-4 mr-2" />
                    {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
                  </Button>
                </form>

                <!-- Lien inscription -->
                <div class="text-center mt-8">
                  <p class="text-gray-500">
                    Pas encore de compte ?
                    <router-link to="/register" class="text-primary-600 font-semibold hover:underline pl-2">Créer un compte</router-link>
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <p class="text-center text-sm text-gray-400 mt-8 md:mt-auto">&copy; {{ currentYear }} HBK Horizon - Tous droits réservés</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Mail, Lock, LogIn, TriangleAlert } from '@lucide/vue';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import ContentLeft from '@/hbkthemes/views/auth/basic/ContentLeft.vue';
import { useAuthStore } from '@/stores/modules/authStore';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

// Données du formulaire
const currentYear = computed(() => new Date().getFullYear());
const loading = ref(false);
const templateRegisterIsloanding = ref(false);
const showError = ref(false);
const errorMessage = ref<string>('');
const errors = computed(() => authStore.errors);

const formData = computed(() => authStore.formData);

// Validation du formulaire
const validateForm = (): boolean => {
  return authStore.validateForm();
};

// Connexion
const handleLogin = async () => {
  showError.value = false;
  if (!validateForm()) return;
  loading.value = true;
  authStore
    .handleLogin()
    .then(() => {
      loading.value = false;
      toast.add({
        severity: 'success',
        summary: 'Connexion réussie',
        detail: 'Bienvenue dans votre espace professionnel',
        life: 3000,
      });
      authStore.clearForm();
      setTimeout(() => {
        const redirectPath = route.query.redirect as string;
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.push('/dashboard');
        }
      }, 1000);
    })
    .catch((errors) => {
      showError.value = true;
      loading.value = false;
      if (errors.data && errors.data.message && errors.data.message !== '') {
        errorMessage.value = errors.data.message;
      } else {
        errorMessage.value = 'Une erreur est survenue lors du chargement du formulaire.';
      }
      toast.add({
        severity: 'error',
        summary: 'Erreur de connexion',
        detail: errors.statusText || 'Email ou mot de passe incorrect',
        life: 5000,
      });
    });
};

// ===== NOUVEAU : Fonction de préchargement =====
const preloadRegisterPage = async () => {
  try {
    // Précharger en parallèle tous les composants de la page d'inscription
    if (templateRegisterIsloanding.value) return;
    templateRegisterIsloanding.value = true;
    await Promise.all([
      import('@/hbkthemes/views/auth/basic/RegisterView.vue'),
      import('@/hbkthemes/views/auth/basic/FormRegister.vue'),
      import('@/hbkthemes/views/auth/basic/ContentLeft.vue'),
    ]);
  } catch (error) {
    console.warn('⚠️ Erreur lors du préchargement:', error);
  }
};

onMounted(() => {
  preloadRegisterPage();
});

const open_home_page = () => {
  router.push('/');
};

// Mot de passe oublié
const forgotPassword = () => {
  router.push('/forgot-password');
};
</script>
