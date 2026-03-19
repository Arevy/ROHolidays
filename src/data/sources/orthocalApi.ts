import { z } from 'zod';
import { buildQueryString, fetchJson } from '../httpClient';

// Orthocal API has rich fields; we keep only the parts we need.
const orthocalItem = z.object({
  date: z.string(), // ISO date
  title: z.string(),
  feast_level: z.string().nullable().optional(),
});
const orthocalSchema = z.array(orthocalItem);

export type OrthocalEntry = z.infer<typeof orthocalItem>;

export async function fetchOrthocal(year: number): Promise<OrthocalEntry[]> {
  const query = buildQueryString({
    year,
    locale: 'ro',
  });
  const url = `https://orthocal.info/api/feasts${query}`;
  console.info('[orthocal] fetching', url);
  const data = await fetchJson<unknown>(url);
  console.info('[orthocal] received', Array.isArray(data) ? data.length : 0, 'items');
  return orthocalSchema.parse(data);
}
