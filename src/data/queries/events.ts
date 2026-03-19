import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchAllEvents } from '../repositories/eventsRepository';
import { Event } from '../../domain/types';
import { dayjs } from '../../services/date';

// Include current day in the key so cache is invalidated automatically when the day changes.
export const EVENTS_QUERY_KEY = (todayISO: string) =>
  ['events', todayISO] as const;

export function useEvents(): UseQueryResult<Event[]> {
  const today = dayjs().format('YYYY-MM-DD');
  return useQuery<Event[]>({
    queryKey: EVENTS_QUERY_KEY(today),
    queryFn: fetchAllEvents,
    // [SENIOR_INSIGHT] "Stale-while-revalidate":
    // serve cached data immediately, then refresh in background when stale.
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24 * 3, // keep 3 days in cache
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
}
