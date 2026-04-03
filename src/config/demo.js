/**
 * Modo demonstração local — sem Base44, sem APIs externas obrigatórias.
 * Defina VITE_DEMO_MODE=false no .env apenas se no futuro reintroduzir backend real.
 */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';

/** Quando true (padrão em demo), não bloqueia o app com SubscriptionWall */
export const demoBypassSubscription =
  import.meta.env.VITE_DEMO_BYPASS_SUBSCRIPTION !== 'false';
