import { Event } from './types';

export function isNoWashingDay(event: Event): boolean {
  return event.metadata?.noWashing === true;
}

export function isSundayEvent(event: Event): boolean {
  return event.metadata?.isSunday === true;
}
