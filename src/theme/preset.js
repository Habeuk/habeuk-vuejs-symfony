// Configuration des styles pour le thème Aura avec des couleurs personnalisées pour le projet Nutribeguide.
// Ce fichier utilise la fonction definePreset pour créer un preset basé sur le thème Aura, en remplaçant les couleurs primaires par des nuances de vert émeraude.
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export default definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f0f9f1',
      100: '#dcf1df',
      200: '#b9e3c1',
      300: '#8fd0a0',
      400: '#6bbd80',
      500: '#4caf6a',
      600: '#3a9156',
      700: '#2f7546',
      800: '#265c39',
      900: '#1e4a2e',
      950: '#0f2a19',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.700}',
          focusColor: '{primary.800}',
        },
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '{surface.900}',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
      },
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            primary: {
              background: '{primary.500}',
              hoverBackground: '{primary.600}',
              activeBackground: '{primary.700}',
              color: '#ffffff',
            },
            secondary: {
              background: '{surface.0}',
              hoverBackground: '{surface.100}',
              borderColor: '{surface.200}',
              color: '{surface.800}',
            },
            danger: {
              background: '{danger.500}',
              hoverBackground: '{danger.500}',
              color: '#ffffff',
            },
          },
          outlined: {
            primary: {
              hoverBackground: 'color-mix(in srgb, {primary.500}, transparent 92%)',
              activeBackground: 'color-mix(in srgb, {primary.500}, transparent 84%)',
              borderColor: '{primary.500}',
              color: '{primary.500}',
            },
            secondary: {
              hoverBackground: '{surface.100}',
              activeBackground: '{surface.200}',
              borderColor: '{surface.200}',
              color: '{surface.800}',
            },
            danger: {
              hoverBackground: 'color-mix(in srgb, {danger.500}, transparent 92%)',
              activeBackground: 'color-mix(in srgb, {danger.500}, transparent 84%)',
              borderColor: '{danger.500}',
              color: '{danger.500}',
            },
          },
        },
      },
    },
  },
});
