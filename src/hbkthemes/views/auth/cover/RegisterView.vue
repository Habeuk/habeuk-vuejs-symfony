<script setup lang="ts">
import { ref } from 'vue';
// import { useNutribguideStore } from '../stores/nutribguide';
import RegisterTextLeft from '@/hbkthemes/views/auth/cover/RegisterTextLeft.vue';
import { Lock, Mail, Eye, EyeOff, Check, ChevronRight, ArrowLeft, CheckCircle2 } from '@lucide/vue';
import FormRegister from '@/hbkthemes/views/auth/cover/FormRegister.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const emit = defineEmits(['register-success', 'open-dashboard']);
// const store = useNutribguideStore();

// Step state: 1 = "Votre compte", 2 = "Vos objectifs"
const currentStep = ref<1 | 2>(1);

// Form fields
const firstName = ref('Marie');
const lastName = ref('Dupont');
const email = ref('vous@exemple.fr');
const password = ref('••••••••••••••••');
const showPassword = ref(false);
const acceptTerms = ref(true);

// Step 2 Goal selection
const selectedGoal = ref('diabete');
const feedbackMessage = ref<string | null>(null);

function handleContinueStep() {
  if (currentStep.value === 1) {
    currentStep.value = 2;
  } else {
    handleFinalizeRegister();
  }
}

function handleFinalizeRegister() {
  feedbackMessage.value = `Compte créé avec succès ! Bienvenue ${firstName.value}. Votre espace personnalisé est prêt.`;
  //store.accountTier = 'free';
  setTimeout(() => {
    emit('register-success');
  }, 1200);
}

function handleSocialRegister(provider: string) {
  feedbackMessage.value = `Inscription avec ${provider} en cours...`;
  //store.accountTier = 'free';
  setTimeout(() => {
    emit('register-success');
  }, 1000);
}

function handleExploreDemo() {
  emit('open-dashboard');
}

const switchToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen w-full bg-surface-50 flex flex-col lg:flex-row font-sans selection:bg-primary-500 selection:text-white">
    <RegisterTextLeft />

    <!-- ============================================== -->
    <!-- RIGHT PANEL: STEPPED REGISTRATION FORM        -->
    <!-- ============================================== -->
    <div class="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-surface-50">
      <!-- Top Right: Switch to Login -->
      <div class="flex items-center justify-end gap-2 text-xs">
        <span class="text-surface-500">Déjà membre ?</span>
        <button
          @click="switchToLogin"
          class="px-4 py-1.5 rounded-full bg-surface-0 hover:bg-surface-100 border border-surface-200 text-surface-800 font-semibold shadow-xs transition-all cursor-pointer">
          Se connecter
        </button>
      </div>

      <!-- Center Container: Stepped Inscription Form -->
      <div class="max-w-[440px] w-full mx-auto my-6 lg:my-auto">
        <!-- Steps Indicator (from the user's Figma mockup) -->
        <div class="flex items-center gap-6 mb-6">
          <!-- Step 1: Votre compte -->
          <div @click="currentStep = 1" class="flex items-center gap-2.5 cursor-pointer group">
            <div
              :class="[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                currentStep === 1 ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-600',
              ]">
              1
            </div>
            <div class="relative pb-1">
              <span
                :class="[
                  'text-xs font-bold transition-colors',
                  currentStep === 1 ? 'text-surface-900' : 'text-surface-500 group-hover:text-surface-800',
                ]">
                Votre compte
              </span>
              <!-- Underline indicator on active step (matching Figma) -->
              <div v-if="currentStep === 1" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"></div>
            </div>
          </div>

          <!-- Step 2: Vos objectifs -->
          <div @click="currentStep = 2" class="flex items-center gap-2.5 cursor-pointer group">
            <div
              :class="[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                currentStep === 2 ? 'bg-primary-500 text-white' : 'bg-surface-0 border border-surface-300 text-surface-500',
              ]">
              2
            </div>
            <div class="relative pb-1">
              <span
                :class="[
                  'text-xs font-bold transition-colors',
                  currentStep === 2 ? 'text-surface-900' : 'text-surface-400 group-hover:text-surface-600',
                ]">
                Vos objectifs
              </span>
              <div v-if="currentStep === 2" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <!-- Heading & Subtitle (from the Figma mockup) -->
        <div class="mb-6">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            {{ currentStep === 1 ? 'Créons votre compte' : 'Vos priorités nutritionnelles' }}
          </h2>
          <p class="text-xs sm:text-sm text-surface-500 mt-1">
            {{
              currentStep === 1
                ? 'Quelques informations suffisent pour commencer gratuitement.'
                : 'Nutribguide personnalisera vos conseils et alertes bienveillantes.'
            }}
          </p>
        </div>

        <!-- Feedback Alert -->
        <div
          v-if="feedbackMessage"
          class="mb-4 p-3 rounded-xl bg-primary-50 border border-primary-200 text-primary-800 text-xs flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-primary-600 flex-shrink-0" />
          <span>{{ feedbackMessage }}</span>
        </div>

        <!-- ===================================== -->
        <!-- STEP 1: FORM FIELDS FROM FIGMA DESIGN -->
        <!-- ===================================== -->
        <div v-if="currentStep === 1">
          <form @submit.prevent="handleContinueStep" class="space-y-4">
            <!-- Row: Prénom & Nom (2 columns) -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  v-model="firstName"
                  placeholder="Marie"
                  class="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#269B69] focus:ring-1 focus:ring-[#269B69] shadow-xs" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  v-model="lastName"
                  placeholder="Dupont"
                  class="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#269B69] focus:ring-1 focus:ring-[#269B69] shadow-xs" />
              </div>
            </div>

            <!-- Adresse e-mail -->
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Adresse e-mail</label>
              <div class="relative">
                <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  v-model="email"
                  placeholder="vous@exemple.fr"
                  class="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#269B69] focus:ring-1 focus:ring-[#269B69] shadow-xs" />
              </div>
            </div>

            <!-- Créer un mot de passe -->
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Créer un mot de passe</label>
              <div class="relative">
                <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  :type="showPassword ? 'text' : 'password'"
                  required
                  v-model="password"
                  placeholder="••••••••••••••••"
                  class="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#269B69] focus:ring-1 focus:ring-[#269B69] shadow-xs" />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>

              <!-- Password strength bars (from the Figma mockup) -->
              <div class="flex items-center justify-between gap-3 mt-2">
                <div class="flex items-center gap-1.5 flex-1">
                  <div class="h-1 flex-1 bg-[#269B69] rounded-full"></div>
                  <div class="h-1 flex-1 bg-[#269B69] rounded-full"></div>
                  <div class="h-1 flex-1 bg-[#269B69] rounded-full"></div>
                  <div class="h-1 flex-1 bg-slate-200 rounded-full"></div>
                </div>
                <span class="text-[11px] font-semibold text-[#1B8055] whitespace-nowrap">Mot de passe solide</span>
              </div>
            </div>

            <!-- Consent Checkbox (from the Figma mockup) -->
            <div class="flex items-start gap-2.5 pt-1">
              <button
                type="button"
                @click="acceptTerms = !acceptTerms"
                :class="[
                  'w-4 h-4 rounded-md flex items-center justify-center transition-colors cursor-pointer mt-0.5 flex-shrink-0',
                  acceptTerms ? 'bg-[#269B69] text-white' : 'border border-slate-300 bg-white',
                ]">
                <Check v-if="acceptTerms" class="w-3 h-3 stroke-[2.5]" />
              </button>
              <label @click="acceptTerms = !acceptTerms" class="text-xs text-slate-600 font-normal leading-snug cursor-pointer select-none">
                J'accepte les conditions d'utilisation et la politique de confidentialité. Je garde le contrôle de mes données à tout moment.
              </label>
            </div>

            <!-- Main CTA Submit Button from Figma -->
            <button
              type="submit"
              class="w-full py-3 px-4 rounded-xl bg-[#269B69] hover:bg-[#208A5D] active:bg-[#1B7750] text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-[#269B69]/20 cursor-pointer flex items-center justify-center gap-2 mt-4">
              <span>Continuer</span>
              <ChevronRight class="w-4 h-4" />
            </button>

            <!-- Divider: ou s'inscrire avec -->
            <div class="my-6 flex items-center gap-3">
              <span class="h-px flex-1 bg-surface-200"></span>
              <span class="bg-surface-50 px-3 text-xs text-surface-400 font-medium">ou s'inscrire avec</span>
              <span class="h-px flex-1 bg-surface-200"></span>
            </div>

            <!-- Social Buttons: Google & Apple -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <!-- Google Button -->
              <button
                type="button"
                @click="handleSocialRegister('Google')"
                class="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <!-- Apple Button -->
              <button
                type="button"
                @click="handleSocialRegister('Apple')"
                class="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer">
                <svg class="w-4 h-4 flex-shrink-0 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path
                    d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.63-2.66 1.38-.56.65-1.06 1.71-.93 2.74 1.04.08 2.06-.5 2.67-1.25z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            <!-- Bottom Footer Note from Figma -->
            <div class="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2">
              <Lock class="w-3.5 h-3.5 text-slate-400" />
              <span>Inscription gratuite • Sans carte bancaire • Données protégées</span>
            </div>

            <!-- Secondary Link: Explorer le dashboard de démonstration -->
            <div class="text-center pt-2">
              <button
                type="button"
                @click="handleExploreDemo"
                class="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer py-1">
                Explorer le dashboard de démonstration sans inscription
              </button>
            </div>
          </form>
          <!-- dynamics forms -->
          <FormRegister />
        </div>

        <!-- ===================================== -->
        <!-- STEP 2: VOS OBJECTIFS (PERSONALISATION)-->
        <!-- ===================================== -->
        <div v-else class="space-y-4">
          <div class="space-y-2.5">
            <label
              v-for="goal in [
                {
                  id: 'diabete',
                  title: 'Gestion du diabète & index glycémique',
                  desc: 'Vigilance douce sur les pics de glucose et alternatives saines.',
                },
                {
                  id: 'general',
                  title: 'Rééquilibrage & bien-être au quotidien',
                  desc: 'Comprendre facilement ce que je mange sans calcul complexe.',
                },
                {
                  id: 'famille',
                  title: 'La Table Unique (Repas de famille)',
                  desc: 'Des repas sains et partagés pour parents et enfants sans plats multiples.',
                },
                {
                  id: 'budget',
                  title: 'Manger sain avec un budget maîtrisé',
                  desc: 'Découvrir des alternatives économiques à même valeur nutritionnelle.',
                },
                { id: 'sport', title: 'Sport, énergie & récupération', desc: 'Optimisation des protéines et des glucides lents selon mes séances.' },
              ]"
              :key="goal.id"
              @click="selectedGoal = goal.id"
              :class="[
                'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3',
                selectedGoal === goal.id
                  ? 'bg-emerald-50/80 border-[#269B69] ring-1 ring-[#269B69]'
                  : 'bg-white border-slate-200/90 hover:border-slate-300',
              ]">
              <div
                :class="[
                  'w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors',
                  selectedGoal === goal.id ? 'border-[#269B69] bg-[#269B69] text-white' : 'border-slate-300 bg-white',
                ]">
                <div v-if="selectedGoal === goal.id" class="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <div class="min-w-0">
                <span class="text-xs font-bold text-slate-900 block">{{ goal.title }}</span>
                <span class="text-[11px] text-slate-500 leading-tight mt-0.5 block">{{ goal.desc }}</span>
              </div>
            </label>
          </div>

          <div class="pt-2 flex items-center gap-3">
            <button
              type="button"
              @click="currentStep = 1"
              class="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
              <ArrowLeft class="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              type="button"
              @click="handleFinalizeRegister"
              class="flex-1 py-3 px-4 rounded-xl bg-[#269B69] hover:bg-[#208A5D] text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-[#269B69]/20 cursor-pointer flex items-center justify-center gap-2">
              <span>Finaliser et accéder au dashboard</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
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
