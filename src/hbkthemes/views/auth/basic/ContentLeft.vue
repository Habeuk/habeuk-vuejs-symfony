<template>
  <!-- === COLONNE GAUCHE - DESCRIPTION === -->
  <div class="hidden md:flex flex-col p-6 lg:p-8 h-full bg-linear-to-br from-primary-900 to-primary-700 text-white relative">
    <div class="absolute inset-0 bg-[radial-gradient(at_bottom_right,#ffffff15_0%,transparent_50%)]"></div>

    <div class="relative z-10 flex flex-col justify-between h-full">
      <div>
        <!-- Logo -->
        <div class="flex items-center justify-center">
          <a @click.prevent="open_home_page" href="#" class="inline-flex items-center gap-3">
            <img src="/images/hbk-ai-logo.webp" alt="Logo HBK Horizon" class="w-25 h-25 object-contain" />
          </a>
        </div>

        <h2 class="text-3xl lg:text-4xl font-bold leading-tight mb-5 text-center">HBK Horizon</h2>

        <p class="text-primary-100 text-base mb-8 text-center">La plateforme tout-en-un pour gérer votre entreprise avec sérénité.</p>
      </div>

      <!-- Avantages -->
      <div class="space-y-5">
        <div class="flex gap-4">
          <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-lg">⚡</div>
          <div>
            <p class="font-semibold">Productivité accrue</p>
            <p class="text-primary-100 text-sm">Factures, devis et projets en quelques clics</p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-lg">🔒</div>
          <div>
            <p class="font-semibold">Sécurisé &amp; Fiable</p>
            <p class="text-primary-100 text-sm">Protection avancée • Conformité RGPD • Sauvegardes automatiques</p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-lg">📈</div>
          <div>
            <p class="font-semibold">Suivi complet</p>
            <p class="text-primary-100 text-sm">Paiements, relances et vision globale de votre activité</p>
          </div>
        </div>
      </div>

      <div class="pt-10 text-xs text-primary-100 line-height-1.5">
        Pilotez votre entreprise vers de nouveaux horizons.
        <br />
        <div class="opacity-25 mt-3">habeuk-horizon.com</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open_home_page: () => void;
}>();
</script>
