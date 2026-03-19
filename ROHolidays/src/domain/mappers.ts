import dayjs from 'dayjs';
import { feastLevelToCross, fromAzisespalaFlag, preferHigherLevel } from './heuristics';
import { Event, EventLevel, EventSource } from './types';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildId = (source: EventSource, dateISO: string, title: string) =>
  `${source}:${dateISO}:${slugify(title)}`;

type NagerHoliday = {
  date: string;
  localName: string;
  name: string;
  types?: string[] | undefined;
};

export function mapNagerToEvents(data: NagerHoliday[]): Event[] {
  return data.map(item => ({
    id: buildId('NAGER', item.date, item.localName ?? item.name),
    dateISO: item.date,
    title: item.localName ?? item.name,
    kind: 'LEGAL',
    level: null,
    source: 'NAGER',
    metadata: { types: item.types },
  }));
}

type OpenHolidaysItem = {
  startDate: string;
  endDate?: string | undefined;
  name: { text: string; language: string }[];
  type?: string | undefined;
};

export function mapOpenHolidaysToEvents(data: OpenHolidaysItem[]): Event[] {
  return data.map(item => {
    const title = item.name?.[0]?.text ?? 'Public Holiday';
    return {
      id: buildId('OPENHOLIDAYS', item.startDate, title),
      dateISO: item.startDate,
      title,
      kind: 'LEGAL',
      level: null,
      source: 'OPENHOLIDAYS',
      metadata: { type: item.type, endDate: item.endDate },
    };
  });
}

type AzisespalaItem = {
  date: string;
  name: string;
  isHoliday: boolean;
  color?: string | null;
  text?: string;
  noWashing?: boolean;
  rawNoWashing?: boolean;
  hasCross?: boolean;
};

export function mapAzisespalaToEvents(data: AzisespalaItem[]): Event[] {
  return data.map(item => {
    let level: EventLevel = null;
    const c = item.color?.toLowerCase();
    const hasCross = !!item.hasCross;
    const rawNoWashing = item.noWashing ?? item.rawNoWashing ?? false;
    const isSunday = dayjs(item.date).day() === 0;
    // Required rules:
    // - Red cross: API marks isHoliday=true (or color red).
    // - Black cross: text contains †, isHoliday=false, and noWashing=false (or it is Sunday with †).
    // - Sundays are treated as "no washing"; if they have a cross, we show it based on the rules above.
    const isRedFromHoliday = item.isHoliday && (!isSunday || hasCross);
    if (isRedFromHoliday || c === 'red') {
      level = 'RED';
    } else if (hasCross && !item.isHoliday && (!rawNoWashing || isSunday)) {
      level = 'BLACK';
    } else if (c === 'black') {
      level = 'BLACK';
    }

    // Effective noWashing: any cross level, source flag, or Sunday.
    const noWashing = level !== null || rawNoWashing || isSunday;

    return {
      id: buildId('AZISESPALA', item.date, item.name),
      dateISO: item.date,
      title: item.name,
      kind: 'ORTHODOX',
      level,
      source: 'AZISESPALA',
      metadata: {
        isHoliday: item.isHoliday,
        color: item.color,
        text: item.text,
        noWashing,
        hasCross,
        rawNoWashing,
        isSunday,
      },
    };
  });
}

type OrthocalItem = { date: string; title: string; feast_level?: string | null | undefined };

export function mapOrthocalToEvents(data: OrthocalItem[]): Event[] {
  return data.map(item => ({
    id: buildId('ORTHOCAL', item.date, item.title),
    dateISO: item.date,
    title: item.title,
    kind: 'ORTHODOX',
    // Orthocal may miss feast_level; default to black cross to keep calendar visibility.
    level: feastLevelToCross(item.feast_level) ?? 'BLACK',
    source: 'ORTHOCAL',
    metadata: { feast_level: item.feast_level },
  }));
}


export function dedupeEvents(events: Event[]): Event[] {
  const byId = new Map<string, Event>();
  for (const event of events) {
    const existing = byId.get(event.id);
    if (!existing) {
      byId.set(event.id, event);
    } else {
      const level: EventLevel = preferHigherLevel(existing.level, event.level);
      byId.set(event.id, { ...existing, ...event, level });
    }
  }
  return Array.from(byId.values()).sort((a, b) =>
    dayjs(a.dateISO).diff(dayjs(b.dateISO), 'millisecond'),
  );
}
