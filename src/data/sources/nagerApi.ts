import { z } from 'zod';
import { fetchJson } from '../httpClient';

const nagerItem = z.object({
  date: z.string(),
  localName: z.string(),
  name: z.string(),
  types: z.array(z.string()).optional(),
});
const nagerSchema = z.array(nagerItem);

export type NagerHoliday = z.infer<typeof nagerItem>;

export async function fetchNagerHolidays(year: number): Promise<NagerHoliday[]> {
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/RO`;
  const data = await fetchJson<unknown>(url);
  return nagerSchema.parse(data);
}
