import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface CalendarTurboSpec extends TurboModule {
  getCachedOrthodoxDay(dateISO: string): Promise<string | null>;
  warmupCalendarIndex(year: number): Promise<boolean>;
}

// [SENIOR_INSIGHT] This contract keeps JS/native boundaries explicit and typed.
// We can ship JS-only now and swap to native TurboModule later without refactoring callers.
export const CalendarTurbo =
  TurboModuleRegistry.get<CalendarTurboSpec>('CalendarTurboModule');
