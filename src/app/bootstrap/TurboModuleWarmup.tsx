import { useEffect } from 'react';
import { env } from '../../core/config/env';
import { CalendarTurbo } from '../../core/native/CalendarTurboModule';
import { dayjs } from '../../services/date';

export function TurboModuleWarmup() {
  useEffect(() => {
    if (!env.turboDemoEnabled || !CalendarTurbo) return;

    const currentYear = dayjs().year();
    CalendarTurbo.warmupCalendarIndex(currentYear).catch(error => {
      console.warn('[turbo] warmup failed', error);
    });
  }, []);

  return null;
}
