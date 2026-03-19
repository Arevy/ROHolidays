export type EventKind = 'LEGAL' | 'ORTHODOX';
export type EventLevel = 'RED' | 'BLACK' | null;
export type EventSource = 'NAGER' | 'OPENHOLIDAYS' | 'AZISESPALA' | 'ORTHOCAL';

export type EventMetadata = {
  types?: string[];
  type?: string;
  endDate?: string;
  feast_level?: string | null;
  isHoliday?: boolean;
  color?: string | null;
  text?: string;
  noWashing?: boolean;
  hasCross?: boolean;
  rawNoWashing?: boolean;
  isSunday?: boolean;
  approximated?: boolean;
  note?: string;
};

export type Event = {
  id: string;
  dateISO: string; // UTC ISO date string (yyyy-mm-dd)
  title: string;
  kind: EventKind;
  level: EventLevel;
  source: EventSource;
  metadata?: EventMetadata;
};

export type NotificationSettings = {
  notificationsEnabled: boolean;
  notifyLegal: boolean;
  notifyOrthodox: boolean;
  orthodoxLevel: 'RED' | 'RED_BLACK';
  dayBeforeHour: number; // 0-23 local time
  sameDayHour: number; // 0-23 local time
  lookAheadDays: number;
};

export type UserSettings = {
  notification: NotificationSettings;
};

export const DEFAULT_SETTINGS: UserSettings = {
  notification: {
    notificationsEnabled: true,
    notifyLegal: true,
    notifyOrthodox: true,
    orthodoxLevel: 'RED',
    dayBeforeHour: 18,
    sameDayHour: 8,
    lookAheadDays: 90,
  },
};
