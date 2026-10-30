<template>
  <div class="verification-page">
    <h2>Vérification en cours...</h2>
    <p v-if="message">{{ message }}</p>
    <p v-if="errorCode">Code d'erreur: {{ errorCode }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'VerificationView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const message = ref<string | null>(null);
    const errorCode = ref<string | null>(null);

    onMounted(() => {
      const status = route.query.status as string;
      const msg = route.query.message as string;
      const code = route.query.code as string;

      if (msg) {
        message.value = msg;
      }
      if (code) {
        errorCode.value = code;
      }
      if (status === 'success') {
        router.push('/');
      } else if (status === 'error') {
        router.push('/login');
      } else {
        // Optionnel: Gérer un statut inconnu ou absent
        console.warn('Statut de vérification inconnu ou absent.');
        router.push('/'); // Rediriger par défaut en cas d'incertitude
      }
    });
    return {
      message,
      errorCode,
    };
  },
});
</script>

<style scoped>
.verification-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  font-family: Arial, sans-serif;
}
h2 {
  color: #333;
}
p {
  color: #666;
  margin-top: 10px;
}
</style>
