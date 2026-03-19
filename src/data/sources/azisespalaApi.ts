import { fetchJson } from '../httpClient';

type RawDay = {
  date?: string;
  day?: string;
  dateISO?: string;
  name?: string;
  title?: string;
  label?: string;
  isHoliday?: boolean;
  color?: string;
  text?: string;
  noWashing?: boolean;
};

type Normalized = {
  date: string;
  name: string;
  isHoliday: boolean;
  color?: string | null;
  text?: string;
  // noWashing = value used by the UI (after applying extra rules, e.g. Sunday)
  noWashing: boolean;
  // rawNoWashing = exact value from the API, kept for additional decisions
  rawNoWashing: boolean;
  hasCross: boolean;
};

function normalize(raw: RawDay, year: number): Normalized | null {
  const date = raw.date || raw.dateISO || raw.day;
  const name = raw.name || raw.title || raw.label || raw.text;
  if (!date || !name) return null;
  const text = raw.text || raw.title || raw.name || raw.label || '';
  const hasCrossMark = text.includes('†');
  const color: string | null | undefined = raw.color ?? null;
  const isHoliday = raw.isHoliday ?? false;
  const rawNoWashing = !!raw.noWashing;
  return {
    date,
    name,
    isHoliday: !!isHoliday,
    color: color ?? null,
    text,
    noWashing: rawNoWashing,
    rawNoWashing,
    hasCross: hasCrossMark,
  };
}

/**
 * Primary source for Orthodox holidays: azisespala.ro API.
 * 1) try https://azisespala.ro/api/holidays?year=YYYY
 * 2) if it fails or the shape is not an array, try static fallback: https://azisespala.ro/data/holidays-YYYY.json
 * 3) if fallback also fails, try previous year and shift the year in dates (so we don't end up with no events).
 */
export async function fetchAzisespala(year: number): Promise<Normalized[]> {
  const primaryUrl = `https://azisespala.ro/api/holidays?year=${year}`;
  const fallbackUrl = `https://azisespala.ro/data/holidays-${year}.json`;

  const tryUrl = async (url: string): Promise<Normalized[] | null> => {
    try {
      const data = await fetchJson<unknown>(url, { timeoutMs: 10000, headers: { accept: 'application/json' } });
      const arr = Array.isArray(data) ? data : Array.isArray((data as any)?.holidays) ? (data as any).holidays : null;
      let norm: Normalized[] | null = null;

      // Case 1: direct array
      if (arr) {
        norm = arr.map(normalize).filter(Boolean) as Normalized[];
      }

      // Case 2: object keyed by months { "1": [...], "2": [...] }
      if (!norm || !norm.length) {
        const obj = data as Record<string, unknown>;
        const monthKeys = Object.keys(obj || {});
        const looksLikeMonths =
          monthKeys.length &&
          monthKeys.every(k => /^[0-9]+$/.test(k) && Array.isArray((obj as any)[k]));
        if (looksLikeMonths) {
          const out: Normalized[] = [];
          for (const key of monthKeys) {
            const monthNum = parseInt(key, 10);
            const days = (obj as any)[key] as RawDay[];
            for (const d of days) {
              const dayNum = d.date || d.day || d.dateISO;
              if (!dayNum) continue;
              const pad = (n: number | string) => String(n).padStart(2, '0');
              const dateISO = `${year}-${pad(monthNum)}-${pad(dayNum)}`;
              const base = normalize({ ...d, date: dateISO }, year);
              if (base) {
                out.push(base);
              }
            }
          }
          norm = out;
        }
      }

      if (!norm || !norm.length) {
        console.warn('[azisespala] invalid shape', { url, sample: data });
        return null;
      }
      return norm;
    } catch (err) {
      console.warn('[azisespala] fetch failed', { url, err });
      return null;
    }
  };

  const primary = await tryUrl(primaryUrl);
  if (primary && primary.length) {
    console.info('[azisespala] api ok', { year, count: primary.length });
    return primary;
  }

  const fallback = await tryUrl(fallbackUrl);
  if (fallback && fallback.length) {
    console.info('[azisespala] static ok', { year, count: fallback.length });
    return fallback;
  }

  // Last resort: use previous year and shift the year in dates.
  const prev = await tryUrl(`https://azisespala.ro/data/holidays-${year - 1}.json`);
  if (prev && prev.length) {
    const shifted = prev.map(d => ({
      ...d,
      date: d.date.replace(String(year - 1), String(year)),
    }));
    console.warn('[azisespala] using previous year shifted', { from: year - 1, to: year, count: shifted.length });
    return shifted;
  }

  return [];
}
