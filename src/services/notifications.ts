import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Event } from '../domain/types';
import { NotificationSettings } from '../domain/types';
import { isWithinNextNDays } from './date';

const CHANNEL_ID = 'holidays';

export async function ensurePermissions() {
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    throw new Error('Notifications permission denied');
  }
}

export async function ensureChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Calendar & sărbători',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

type ScheduleOpts = {
  events: Event[];
  settings: NotificationSettings;
};

export async function scheduleNotifications({ events, settings }: ScheduleOpts) {
  if (!settings.notificationsEnabled) {
    await notifee.cancelAllNotifications();
    return;
  }

  await ensurePermissions();
  await ensureChannel();

  const targets = events.filter(event => {
    if (event.kind === 'LEGAL' && !settings.notifyLegal) {
      return false;
    }
    if (event.kind === 'ORTHODOX' && !settings.notifyOrthodox) {
      return false;
    }
    if (
      event.kind === 'ORTHODOX' &&
      settings.orthodoxLevel === 'RED' &&
      event.level === 'BLACK'
    ) {
      return false;
    }
    return isWithinNextNDays(event.dateISO, settings.lookAheadDays);
  });

  if (targets.length === 0) {
    await notifee.cancelAllNotifications();
    return;
  }

  // Avoid duplicate notifications by reusing event.id-based notification IDs.
  await notifee.cancelAllNotifications();

  const now = Date.now();
  const tasks: Promise<unknown>[] = [];
  for (const event of targets) {
    const candidates = [
      {
        id: `${event.id}-pre`,
        timestamp: buildLocalTimestamp(event.dateISO, settings.dayBeforeHour, -1),
      },
      {
        id: `${event.id}-day`,
        timestamp: buildLocalTimestamp(event.dateISO, settings.sameDayHour, 0),
      },
    ];

    for (const candidate of candidates) {
      // [SENIOR_INSIGHT] Notifee rejects past timestamps. We only schedule future triggers
      // to avoid runtime failures when "day before" is already elapsed.
      if (candidate.timestamp <= now + 1000) {
        continue;
      }
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: candidate.timestamp,
      };
      tasks.push(
        notifee.createTriggerNotification(
          {
            id: candidate.id,
            title: event.title,
            body: formatBody(event),
            android: { channelId: CHANNEL_ID },
          },
          trigger,
        ),
      );
    }
  }

  if (tasks.length === 0) {
    return;
  }
  await Promise.all(tasks);
}

function buildLocalTimestamp(dateISO: string, hour: number, dayOffset: number) {
  const normalizeNumber = (value: number | undefined, fallback: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;

  const [yearRaw, monthRaw, dayRaw] = dateISO.split('-').map(Number);
  const year = normalizeNumber(yearRaw, 1970);
  const month = normalizeNumber(monthRaw, 1);
  const day = normalizeNumber(dayRaw, 1);
  // Build local time explicitly; parsing YYYY-MM-DD with Date() uses UTC and can shift days by timezone.
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date.getTime();
}

function formatBody(event: Event) {
  const flavor = event.kind === 'LEGAL' ? 'Sărbătoare legală' : 'Calendar ortodox';
  const cross = event.level === 'RED' ? ' (cruce roșie)' : event.level === 'BLACK' ? ' (cruce neagră)' : '';
  return `${flavor}${cross} pe ${event.dateISO}`;
}
