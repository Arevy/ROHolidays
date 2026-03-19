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

  const tasks: Promise<unknown>[] = [];
  for (const event of targets) {
    const dayBefore: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: buildLocalTimestamp(event.dateISO, settings.dayBeforeHour, -1),
    };
    const sameDay: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: buildLocalTimestamp(event.dateISO, settings.sameDayHour, 0),
    };

    tasks.push(
      notifee.createTriggerNotification(
        {
          id: `${event.id}-pre`,
          title: event.title,
          body: formatBody(event),
          android: { channelId: CHANNEL_ID },
        },
        dayBefore,
      ),
    );
    tasks.push(
      notifee.createTriggerNotification(
        {
          id: `${event.id}-day`,
          title: event.title,
          body: formatBody(event),
          android: { channelId: CHANNEL_ID },
        },
        sameDay,
      ),
    );
  }

  await Promise.all(tasks);
}

function buildLocalTimestamp(dateISO: string, hour: number, dayOffset: number) {
  const date = new Date(dateISO);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date.getTime();
}

function formatBody(event: Event) {
  const flavor = event.kind === 'LEGAL' ? 'Sărbătoare legală' : 'Calendar ortodox';
  const cross = event.level === 'RED' ? ' (cruce roșie)' : event.level === 'BLACK' ? ' (cruce neagră)' : '';
  return `${flavor}${cross} pe ${event.dateISO}`;
}
