import { z } from 'zod';
import { buildQueryString, fetchJson } from '../httpClient';

const translationSchema = z.object({
  language: z.string(),
  text: z.string(),
});

const openHolidayItem = z.object({
  startDate: z.string(),
  endDate: z.string().optional(),
  name: z.array(translationSchema),
  type: z.string().optional(),
});

const openHolidaySchema = z.array(openHolidayItem);

export type OpenHoliday = z.infer<typeof openHolidayItem>;

export async function fetchOpenHolidays(year: number): Promise<OpenHoliday[]> {
  const query = buildQueryString({
    countryIsoCode: 'RO',
    validFrom: `${year}-01-01`,
    validTo: `${year}-12-31`,
  });
  const url = `https://openholidaysapi.org/PublicHolidays${query}`;
  const data = await fetchJson<unknown>(url, {
    headers: { accept: 'text/json' },
  });
  return openHolidaySchema.parse(data);
}
