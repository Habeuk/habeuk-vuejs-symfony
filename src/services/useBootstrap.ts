import { computed, type ComputedRef } from "vue";
import { useAuthStore } from "@/stores/modules/authStore";
import type { userEntity } from "@/types";

type BootstrapContext = {
  currentUser: ComputedRef<userEntity | null>;
  isAuthenticated: ComputedRef<boolean>;
};
/**
 * Pour evier de reconstrure les proprietes et methodes. ( seule le premier appel construit)
 */
let context: BootstrapContext | null = null;
export function useBootstrap(): BootstrapContext {
  if (context !== null) {
    return context;
  }
  const authStore = useAuthStore();
  const currentUser = computed(() => authStore.currentUser);
  const isAuthenticated = computed(() => authStore.isAuthenticated);

  context = {
    currentUser,
    isAuthenticated,
  };
  return context;
}
