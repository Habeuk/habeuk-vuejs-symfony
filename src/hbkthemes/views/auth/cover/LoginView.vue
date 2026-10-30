<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import FormLogin from '@/hbkthemes/views/auth/cover/FormLogin.vue';
import LginTextLeft from '@/hbkthemes/views/auth/cover/LoginTextLeft.vue';
import GoogleLoginOauth from '@/hbkthemes/views/auth/loginOauth/GoogleLoginOauth.vue';
import AppleLoginOauth from '@/hbkthemes/views/auth/loginOauth/AppleLoginOauth.vue';
import { useRouter } from 'vue-router';
//import { useNutribguideStore } from '../stores/nutribguide';
import { Lock, CheckCircle2 } from '@lucide/vue';
const router = useRouter();
const emit = defineEmits(['open-dashboard']);

// Form state
const isSignUpMode = ref(false);
const loginFeedback = ref<string | null>(null);

function handleExploreDemo() {
  emit('open-dashboard');
}
const switchToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <Toast />
  <div class="min-h-screen w-full flex flex-col lg:flex-row font-sans selection:bg-primary-500 selection:text-white">
    <LginTextLeft></LginTextLeft>
    <!-- ========================================== -->
    <!-- RIGHT PANEL: AUTHENTICATION CARD          -->
    <!-- ========================================== -->
    <div class="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:px-14 bg-surface-50">
      <!-- Top Right: Switch to Sign up or Login -->
      <div class="flex items-center justify-end gap-2 text-xs">
        <span class="text-surface-500">Pas encore de compte ?</span>
        <Button label="Créer mon compte" severity="secondary" sev @click="switchToRegister" />
      </div>

      <!-- Center Container: Login Form -->
      <div class="max-w-105 w-full mx-auto my-8 lg:my-auto">
        <!-- Title & Subtitle from Figma -->
        <div class="mb-6">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            {{ isSignUpMode ? 'Créer votre compte' : 'Heureux de vous revoir' }}
          </h2>
          <p class="text-surface-500 mt-1">
            {{
              isSignUpMode ? 'Rejoignez Nutribguide pour un suivi nutritionnel serein.' : 'Connectez-vous pour retrouver votre suivi nutritionnel.'
            }}
          </p>
        </div>

        <!-- Feedback Alert -->
        <div
          v-if="loginFeedback"
          class="mb-4 p-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-800 text-xs flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-primary-600 shrink-0" />
          <span>{{ loginFeedback }}</span>
        </div>

        <!-- Social Buttons: Google & Apple -->
        <div class="grid grid-cols-2 gap-3 mb-5">
          <GoogleLoginOauth />
          <AppleLoginOauth />
        </div>

        <!-- Divider with label -->
        <div class="my-6 flex items-center gap-3">
          <span class="h-px flex-1 bg-surface-200"></span>
          <span class="bg-surface-50 px-3 text-xs text-surface-400 font-medium">ou avec votre adresse e-mail</span>
          <span class="h-px flex-1 bg-surface-200"></span>
        </div>

        <!-- Form Fields -->
        <FormLogin />
        <!-- Secondary Link: Explorer le dashboard de démonstration -->
        <div class="text-center mt-5">
          <span href="#" @click.prevent="handleExploreDemo" class="">Explorer le dashboard de démonstration</span>
        </div>

        <!-- RGPD Privacy & Security Box (from the user's Figma design) -->
        <div class="mt-5 p-3.5 rounded-2xl bg-primary-50 border border-primary-100 flex items-start gap-2.5 text-primary-800">
          <Lock class="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
          <p class="text-[11px] leading-relaxed font-normal">
            Vos données personnelles et de santé sont chiffrées et protégées conformément au RGPD.
          </p>
        </div>
      </div>

      <!-- Footer from the Figma mockup -->
      <div class="flex flex-wrap items-center justify-center gap-4 text-[11px] text-surface-400 pt-6">
        <a href="#" class="hover:text-surface-600 transition-colors">Confidentialité</a>
        <span>•</span>
        <a href="#" class="hover:text-surface-600 transition-colors">Conditions d'utilisation</a>
        <span>•</span>
        <a href="#" class="hover:text-surface-600 transition-colors">Besoin d'aide ?</a>
        <span>•</span>
        <span>© 2026 Nutribguide</span>
      </div>
    </div>
  </div>
</template>
