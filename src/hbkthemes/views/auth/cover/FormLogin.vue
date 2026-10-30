<template>
  <div>
    <div v-if="loginFeedback" class="mb-4 p-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-800 text-xs flex items-center gap-2">
      <CheckCircle2 class="w-4 h-4 text-primary-600 shrink-0" />
      <span>{{ loginFeedback }}</span>
    </div>
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label class="block font-bold text-surface-800 mb-1">Adresse e-mail</label>
        <div class="relative">
          <Mail class="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <InputText
            v-model="formData.email"
            type="email"
            required
            placeholder="marie.dupont@exemple.fr"
            class="w-full pl-10"
            :class="errors.email ? 'border-red-500 ring-red-200' : ''" />
        </div>
        <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
      </div>
      <!-- Password with forgotten password link -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="font-bold text-surface-800">Mot de passe</label>
          <Button variant="link" severity="secondary" size="small" label="Mot de passe oublié ?" class="text-xs!" />
        </div>
        <div class="relative">
          <Lock class="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-1" />
          <Password v-model="formData.password" :feedback="false" toggleMask placeholder="••••••••••••" class="w-full" inputClass="w-full  pl-10" />
        </div>
      </div>
      <!-- Remember me checkbox -->
      <div class="flex items-center gap-2 pt-1">
        <Checkbox v-model="formData.rememberMe" binary inputId="remember" />
        <label for="remember" class="text-surface-600 font-normal cursor-pointer select-none">Rester connecté sur cet appareil</label>
      </div>

      <!-- Main CTA Submit Button from Figma -->
      <Button type="submit" :loading="loading" :disabled="!formData.email || !formData.password" :label="'Se connecter'" class="w-full mt-4">
        <LogIn class="w-4 h-4 mr-2" />
        {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
      </Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Lock, Mail, LogIn, CheckCircle2 } from '@lucide/vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/modules/authStore';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const errors = computed(() => authStore.errors);
const formData = computed(() => authStore.formData);
const showError = ref(false);
const loading = ref(false);
const errorMessage = ref<string>('');
const loginFeedback = ref<string | null>(null);

// Validation du formulaire
const validateForm = (): boolean => {
  return authStore.validateForm();
};

const handleLogin = async () => {
  showError.value = false;
  if (!validateForm()) return;
  loading.value = true;
  authStore
    .handleLogin()
    .then(() => {
      loading.value = false;
      loginFeedback.value = 'Connexion réussie ! Redirection en cours...';
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
          router.push('/app/dashboard');
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
</script>
