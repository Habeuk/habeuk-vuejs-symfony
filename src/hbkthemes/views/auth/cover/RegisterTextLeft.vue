<template>
  <!-- =============================================== -->
  <!-- LEFT PANEL: FIGMA BRANDING & COOKING AT HOME    -->
  <!-- =============================================== -->
  <div
    class="relative w-full lg:w-1/2 min-h-130 lg:min-h-screen overflow-hidden hidden lg:flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white">
    <!-- Background Photo with Atmospheric Moody Overlay -->
    <img
      :src="heroBgImage"
      alt="Cuisine saine à la maison Nutribguide"
      class="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.08] scale-105"
      referrerPolicy="no-referrer" />
    <!-- Dark Teal/Emerald Gradient Overlay -->
    <div class="absolute inset-0 bg-linear-to-b from-surface-700/75 via-surface-700/70 to-surface-950/90 backdrop-blur-[1px]"></div>

    <!-- Top: Nutribguide Brand Logo -->
    <div class="relative z-10 flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
        <!-- Custom organic leaf icon matching the mockup -->
        <svg
          class="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>
      <span class="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">Nutribguide</span>
    </div>

    <!-- Center: Heart Icon Badge, Headline & Subtitle -->
    <div class="relative z-10 max-w-xl my-8 lg:my-auto space-y-4">
      <!-- Rounded Heart Badge (from the Figma mockup) -->
      <div
        class="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 shadow-sm">
        <Heart class="w-5 h-5 text-white stroke-[1.8]" />
      </div>

      <!-- Big Headline from the user's Figma design -->
      <h1 class="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-white leading-[1.14]">
        Votre alimentation, à
        <br />
        votre rythme.
      </h1>

      <!-- Subtitle from the user's Figma design -->
      <p class="text-xs sm:text-sm lg:text-[15px] text-white/80 leading-relaxed font-normal max-w-md pt-1">
        Créez gratuitement votre espace et commencez à comprendre vos repas, sans jugement ni règles impossibles à suivre.
      </p>

      <!-- 3 Feature Bullets from the Figma mockup -->
      <div class="space-y-3 pt-6">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-primary-300 shrink-0">
            <Scan class="w-4 h-4" />
          </div>
          <span class="text-xs sm:text-sm text-white/90 font-medium">Scans illimités et historique complet</span>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-primary-300 shrink-0">
            <Sparkles class="w-4 h-4" />
          </div>
          <span class="text-xs sm:text-sm text-white/90 font-medium">Conseils adaptés à vos objectifs</span>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-primary-300 shrink-0">
            <Lock class="w-4 h-4" />
          </div>
          <span class="text-xs sm:text-sm text-white/90 font-medium">Données personnelles protégées</span>
        </div>
      </div>
    </div>

    <!-- Bottom Spacer -->
    <div class="relative z-10 text-[11px] text-white/60">Rejoignez des milliers de personnes qui mangent mieux sans culpabiliser.</div>
  </div>
</template>

<script setup lang="ts">
import { Heart, Scan, Sparkles, Lock } from '@lucide/vue';
// Left hero background image
const heroBgImage = '/images/register-cover.jpeg';
</script>
