<template>
  <div class="sm:p-8 lg:p-12 flex flex-col max-w-125 mx-auto w-full">
    <!-- Version Mobile -->
    <div class="md:hidden mb-6 text-center">
      <a @click.prevent="open_home_page" href="#" class="inline-block">
        <img src="/images/hbk-ai-logo.webp" alt="Logo HBK Horizon" class="mx-auto max-w-22.5" />
      </a>
      <h1 class="text-md font-semibold text-gray-800">HBK Horizon</h1>
      <p class="text-primary-900 text-lg text-center">La plateforme tout-en-un pour gérer votre entreprise avec sérénité.</p>
    </div>

    <div class="flex-1 flex flex-col justify-center">
      <div class="max-w-md lg:max-w-ful mx-auto w-full">
        <h3 v-if="!userAlsoRegistered" class="text-2xl font-semibold text-gray-800 text-center">Créez votre compte gratuitement</h3>
        <h3 v-if="userAlsoRegistered" class="text-2xl font-semibold text-success-800 text-center">Votre compte a été créé avec succès !</h3>
        <!-- Formulaire -->
        <div class="my-9 register-form">
          <CustomForm
            v-if="!userAlsoRegistered"
            customEntityName="UserAnonymousUser"
            :manageCollection="false"
            :enableRedirect="false"
            @emitEntity="afterSaveUser" />
          <div v-else>
            <Message severity="secondary">
              <p class="font-bold text-xl">Votre compte a été créé avec succès !</p>

              <p class="text-gray-600 leading-relaxed mt-2">
                Un e-mail de confirmation vient de vous être envoyé. Veuillez consulter votre boîte de réception et cliquer sur le lien de
                confirmation afin d’activer votre compte.
              </p>
            </Message>
          </div>
        </div>

        <!-- Lien inscription -->
        <div class="mt-8">
          <p class="text-gray-500">
            Vous avez déjà un compte ?
            <router-link to="/login" class="text-primary-600 font-semibold hover:underline">Se connecter</router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <p class="text-center text-xs text-gray-400 mt-10 md:mt-auto">&copy; 2026 HBK Horizon - Tous droits réservés</p>
  </div>
</template>
<script setup lang="ts">
////import rootAxios from '@/configs/rootAxios';
import { ref } from 'vue';
import type { emitEntityToSaveInterface } from '@/types';
import CustomForm from '@/hbkthemes/views/Entity/EntityForm.vue';
import Message from 'primevue/message';
defineProps<{
  open_home_page: () => void;
}>();
const userAlsoRegistered = ref(false);
const afterSaveUser = (data: emitEntityToSaveInterface) => {
  if (data.action) userAlsoRegistered.value = true;
};
</script>

<style>
.register-form .dynamic-form button.p-button {
  max-width: 100% !important;
}
</style>
