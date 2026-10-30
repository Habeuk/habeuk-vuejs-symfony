<template>
  <Toast />
  <div class="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100">
    <div class="container mx-auto px-4 py-8 min-h-screen flex items-center">
      <div class="w-full max-w-100 sm:max-w-225 mx-auto">
        <div class="grid md:grid-cols-2 gap-0 lg:gap-0 md:bg-white md:rounded-3xl md:shadow-2xl overflow-hidden">
          <ContentLeft :open_home_page="open_home_page" />
          <!-- === COLONNE DROITE - FORMULAIRE === -->
          <FormRegister :open_home_page="open_home_page" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Toast from 'primevue/toast';
import ContentLeft from '@/hbkthemes/views/auth/basic/ContentLeft.vue';
import FormRegister from '@/hbkthemes/views/auth/basic/FormRegister.vue';

const router = useRouter();

const open_home_page = () => {
  router.push('/');
};
</script>
