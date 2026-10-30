<template>
  <!-- ========================================== -->
  <!-- LEFT PANEL: FIGMA BRANDING & FRESH VEGGIES -->
  <!-- ========================================== -->
  <div
    class="relative w-full lg:w-1/2 min-h-130 lg:min-h-screen overflow-hidden hidden lg:flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white">
    <!-- Background Image with Moody Overlay -->
    <img
      :src="heroBgImage"
      alt="Légumes frais Nutribguide"
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

    <!-- Center: Headline & Value Proposition -->
    <div class="relative z-10 max-w-xl my-8 lg:my-auto space-y-4">
      <!-- Small Pill Badge -->
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 border border-white/20 backdrop-blur-md text-[11px] sm:text-xs font-medium text-white/95 shadow-sm">
        <Sparkles class="w-3.5 h-3.5 text-primary-300" />
        <span>Votre compagnon nutrition au quotidien</span>
      </div>

      <!-- Big Headline from the user's Figma design -->
      <h1 class="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-white leading-[1.12]">
        Mieux manger
        <br />
        commence par mieux
        <br />
        comprendre.
      </h1>

      <!-- Subtitle from the user's Figma design -->
      <p class="text-xs sm:text-sm lg:text-[15px] text-white/80 leading-relaxed font-normal max-w-md pt-1">
        Retrouvez vos repas, vos objectifs et des conseils personnalisés dans un espace simple, bienveillant et conçu pour votre vie réelle.
      </p>

      <!-- 3 Glassmorphic Feature Cards (from the Figma mockup) -->
      <div class="grid grid-cols-3 gap-2.5 sm:gap-3.5 pt-4">
        <!-- Card 1: 1 sec. -->
        <div class="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 transition-all">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-primary-300 mb-2">
            <Scan class="w-4 h-4" />
          </div>
          <div class="text-sm sm:text-base font-extrabold text-white">1 sec.</div>
          <div class="text-[10px] sm:text-[11px] text-white/70 leading-tight mt-0.5">pour comprendre un produit</div>
        </div>

        <!-- Card 2: 100 % -->
        <div class="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 transition-all">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-primary-300 mb-2">
            <Heart class="w-4 h-4" />
          </div>
          <div class="text-sm sm:text-base font-extrabold text-white">100 %</div>
          <div class="text-[10px] sm:text-[11px] text-white/70 leading-tight mt-0.5">adapté à votre profil</div>
        </div>

        <!-- Card 3: Privé -->
        <div class="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 transition-all">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-primary-300 mb-2">
            <Lock class="w-4 h-4" />
          </div>
          <div class="text-sm sm:text-base font-extrabold text-white">Privé</div>
          <div class="text-[10px] sm:text-[11px] text-white/70 leading-tight mt-0.5">vos données protégées</div>
        </div>
      </div>
    </div>

    <!-- Bottom: Social Proof Avatars Strip -->
    <div class="relative z-10 flex items-center gap-3 pt-6 border-t border-white/15">
      <div class="flex -space-x-2">
        <div class="w-7 h-7 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-950">
          MD
        </div>
        <div class="w-7 h-7 rounded-full bg-info-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-950">
          SL
        </div>
        <div class="w-7 h-7 rounded-full bg-warning-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-950">
          JP
        </div>
      </div>
      <p class="text-[11px] sm:text-xs text-white/85 font-normal">Déjà adopté par des utilisateurs qui veulent avancer sans culpabiliser.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Scan, Heart, Lock, Sparkles } from '@lucide/vue';
// Left hero background image
const heroBgImage = '/images/login-cover.jpeg';
</script>
