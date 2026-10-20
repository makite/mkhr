import { QueryClient } from "@tanstack/react-query";

/**
 * Cache timing policies for ERP domains.
 * - Static lookups (titles, genders, countries, etc.): cached for 10 minutes with background sync.
 * - Organizational structures (depts, branches, grades, scales): cached for 5 minutes.
 * - Dynamic / Transactional data (dashboards, approval queues): fresh for 30s-1m.
 */
export const CACHE_POLICIES = {
  STATIC_LOOKUPS: {
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 30 * 60 * 1000,    // 30 minutes garbage collection
    refetchInterval: 10 * 60 * 1000, // Periodic background sync
    refetchOnWindowFocus: false,
  },
  ORGANIZATION_DATA: {
    staleTime: 5 * 60 * 1000,  // 5 minutes fresh
    gcTime: 20 * 60 * 1000,    // 20 minutes garbage collection
    refetchInterval: 5 * 60 * 1000,  // Sync in background every 5 min
    refetchOnWindowFocus: false,
  },
  DASHBOARD_DATA: {
    staleTime: 60 * 1000,      // 1 minute fresh
    gcTime: 10 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Auto-refresh metrics every 2 minutes
    refetchOnWindowFocus: false,
  },
  TRANSACTIONAL: {
    staleTime: 30 * 1000,      // 30 seconds fresh
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  },
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // Default 2 minutes
      gcTime: 10 * 60 * 1000,   // Default 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
