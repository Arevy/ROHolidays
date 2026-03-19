import { dayjs } from '../../services/date';
import {
  mapAzisespalaToEvents,
  mapNagerToEvents,
  mapOpenHolidaysToEvents,
  mapOrthocalToEvents,
  dedupeEvents,
} from '../../domain/mappers';
import { Event } from '../../domain/types';
import { fetchAzisespala } from '../sources/azisespalaApi';
import { fetchNagerHolidays } from '../sources/nagerApi';
import { fetchOpenHolidays } from '../sources/openHolidaysApi';
import { fetchOrthocal } from '../sources/orthocalApi';

async function loadLegal(year: number): Promise<Event[]> {
  try {
    const data = await fetchNagerHolidays(year);
    console.info('[eventsRepo] Nager ok', { year, count: data.length });
    return mapNagerToEvents(data);
  } catch (err) {
    console.warn('Nager.Date failed, trying OpenHolidays', err);
  }

  try {
    const data = await fetchOpenHolidays(year);
    console.info('[eventsRepo] OpenHolidays fallback ok', { year, count: data.length });
    return mapOpenHolidaysToEvents(data);
  } catch (err) {
    console.warn('OpenHolidays failed, returning empty legal list', err);
    return [];
  }
}

async function loadOrthodox(year: number): Promise<Event[]> {
  const batches: Event[] = [];

  // Primary source for Orthodox holidays: azisespala.ro (includes explicit red-cross days).
  try {
    const az = await fetchAzisespala(year);
    console.info('[eventsRepo] Azisespala ok', { year, count: az.length });
    batches.push(...mapAzisespalaToEvents(az));
  } catch (err) {
    console.warn('Azisespala failed, încercăm Orthocal', err);
  }

  try {
    const ortho = await fetchOrthocal(year);
    console.info('[eventsRepo] Orthocal ok', { year, count: ortho.length });
    batches.push(...mapOrthocalToEvents(ortho));
  } catch (err) {
    console.warn('Orthocal failed, trying previous year fallback', err);
    // Fallback: use previous year dates as approximate fixed-date feasts.
    try {
      const prevYear = year - 1;
      const orthoPrev = await fetchOrthocal(prevYear);
      console.info('[eventsRepo] Orthocal fallback prevYear ok', { prevYear, count: orthoPrev.length });
      const shifted = orthoPrev.map(item => ({
        ...item,
        date: item.date.replace(String(prevYear), String(year)),
      }));
      batches.push(...mapOrthocalToEvents(shifted).map(ev => ({ ...ev, metadata: { ...ev.metadata, approximated: true } })));
    } catch (fallbackErr) {
      console.warn('Orthocal fallback failed as well', fallbackErr);
    }
  }

  // If we could not fetch anything, provide a placeholder so users can see the source is unavailable.
  if (batches.length === 0) {
    console.warn('[eventsRepo] No orthodox events fetched, injecting placeholder', { year });
    batches.push({
      id: `ORTHOCAL:${year}-placeholder`,
      dateISO: `${year}-01-01`,
      title: 'Calendar ortodox indisponibil momentan',
      kind: 'ORTHODOX',
      level: 'BLACK',
      source: 'ORTHOCAL',
      metadata: { note: 'fallback local' },
    });
  }

  return batches;
}

export async function fetchAllEvents(): Promise<Event[]> {
  const now = dayjs();
  const prevYear = now.subtract(1, 'year').year();
  const currentYear = now.year();
  const nextYear = now.add(1, 'year').year();

  const results = await Promise.all([
    loadLegal(prevYear),
    loadLegal(currentYear),
    loadLegal(nextYear),
    loadOrthodox(prevYear),
    loadOrthodox(currentYear),
    loadOrthodox(nextYear),
  ]);
  return dedupeEvents(results.flat());
}

export function pickUpcoming(events: Event[], count: number): Event[] {
  const today = dayjs().startOf('day');
  return events
    .filter(ev => dayjs(ev.dateISO).isSameOrAfter(today))
    .sort((a, b) => dayjs(a.dateISO).diff(dayjs(b.dateISO)))
    .slice(0, count);
}
