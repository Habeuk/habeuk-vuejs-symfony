<template>
  <div>
    <CustomForm
      v-if="!userAlsoRegistered"
      customEntityName="UserAnonymousUser"
      :manageCollection="false"
      :enableRedirect="false"
      :fieldsSpacing="fieldsSpacing"
      @emitEntity="afterSaveUser" />
    <div v-else>
      <Message severity="secondary">
        <div class="space-y-2">
          <p class="font-bold text-xl">Votre compte a été créé avec succès !</p>

          <p class="text-surface-600 leading-relaxed">
            Un e-mail de confirmation vient de vous être envoyé. Veuillez consulter votre boîte de réception et cliquer sur le lien de confirmation afin
            d’activer votre compte.
          </p>
        </div>
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { emitEntityToSaveInterface } from '@/types';
import CustomForm from '@/hbkthemes/views/Entity/EntityForm.vue';
import Message from 'primevue/message';

defineProps<{
  /** Classes d'espacement entre les champs, transmises au moteur de formulaire (défaut dans Form.vue : space-y-6). */
  fieldsSpacing?: string;
}>();

const userAlsoRegistered = ref(false);
const afterSaveUser = (data: emitEntityToSaveInterface) => {
  if (data.action) userAlsoRegistered.value = true;
};
</script>
