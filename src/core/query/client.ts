import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { mmkvQueryStorage } from '../storage/mmkv';

const MAX_RETRIES = 3;

function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 30_000);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // [SENIOR_INSIGHT] SWR behavior: keep data for quick paint, then revalidate in background.
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      // [SENIOR_INSIGHT] Exponential retry smooths temporary network failures
      // and avoids synchronized retry storms on flaky mobile networks.
      retry: (failureCount, error) => {
        if (failureCount >= MAX_RETRIES) return false;
        if (error instanceof Error && /HTTP 4\\d\\d/.test(error.message)) {
          return false;
        }
        return true;
      },
      retryDelay,
    },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: mmkvQueryStorage,
  key: 'ROHOLIDAYS_QUERY_CACHE',
  throttleTime: 1000,
});
