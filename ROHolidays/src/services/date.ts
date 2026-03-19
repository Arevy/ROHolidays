import { dayjs } from '../ui/theme/initDayjs';

export { dayjs } from '../ui/theme/initDayjs';

export function isWithinNextNDays(dateISO: string, days: number): boolean {
  const target = dayjs(dateISO).startOf('day');
  const today = dayjs().startOf('day');
  const diff = target.diff(today, 'day');
  return diff >= 0 && diff <= days;
}
