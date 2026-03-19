import { EventLevel } from './types';

// Map Orthocal feast levels into the Romanian convention of "red cross" vs "black cross".
// Documentation: https://orthocal.info/api/docs/ (levels are stable)
const RED_LEVELS = new Set([
  'great_feast',
  'major_feast',
  'twelve_great',
  'polyeleos',
  'vigil',
]);

export function feastLevelToCross(level?: string | null): EventLevel {
  if (!level) {
    return null;
  }
  return RED_LEVELS.has(level.toLowerCase()) ? 'RED' : 'BLACK';
}

// Heuristic for azisespala (it already marks red-cross days with isHoliday = true).
export function fromAzisespalaFlag(isHoliday: boolean): EventLevel {
  return isHoliday ? 'RED' : 'BLACK';
}

export function preferHigherLevel(a: EventLevel, b: EventLevel): EventLevel {
  if (a === 'RED' || b === 'RED') {
    return 'RED';
  }
  if (a === 'BLACK' || b === 'BLACK') {
    return 'BLACK';
  }
  return null;
}
