import { config } from '@vue/test-utils'
import { beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

/**
 * Configuration globale des tests unitaires (référencée par vitest.config.js).
 *
 * - les plugins équivalents à ceux de main.js sont installés sur chaque montage :
 *   useToast() (Form.vue, EntityForm.vue) et useConfirm() (champs Entity) en dépendent ;
 * - un Pinia neuf est activé avant chaque test : aucune donnée ne fuit d'un test à l'autre
 *   (les stores de formulaire sont indexés par clé, une fuite rendrait les tests dépendants
 *   de leur ordre d'exécution).
 */
config.global.plugins = [PrimeVue, ToastService, ConfirmationService]

/**
 * jsdom n'implémente pas matchMedia. PrimeVue l'appelle au montage
 * (PrimeVue Select, overlays) via l'API globale `matchMedia(query)`.
 * Ce faux MediaQueryList couvre le contrat utilisé (matches + écouteurs).
 */
if (typeof globalThis.matchMedia !== 'function') {
  globalThis.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})
