// Configuration pour optimiser les performances sur Vercel

export const performanceConfig = {
  // Réduire les timeouts de base de données
  database: {
    connectionTimeout: 5000, // 5 secondes au lieu de 30
    queryTimeout: 10000, // 10 secondes max par requête
    poolSize: 2, // Réduire le pool de connexions
  },
  
  // Cache agressif pour les données statiques
  cache: {
    revalidate: 60, // Revalider toutes les 60 secondes
    staleWhileRevalidate: true,
  },
  
  // Limites de pagination
  pagination: {
    defaultLimit: 10, // Réduire à 10 items par page
    maxLimit: 50,
  }
};

// Hook pour précharger les données
export function usePrefetch() {
  return {
    prefetchDashboard: () => fetch('/api/dashboard', { priority: 'high' }),
    prefetchPentests: () => fetch('/api/pentests?limit=10'),
    prefetchTargets: () => fetch('/api/targets?limit=10'),
    prefetchFindings: () => fetch('/api/findings?limit=10'),
  };
}