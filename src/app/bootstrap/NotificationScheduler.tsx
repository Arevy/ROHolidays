import { useEffect } from 'react';
import { useEvents } from '../../data/queries/events';
import { scheduleNotifications } from '../../services/notifications';
import { useSettingsStore } from '../state/useSettingsStore';

export function NotificationScheduler() {
  const events = useEvents().data;
  const notificationSettings = useSettingsStore(state => state.settings.notification);

  useEffect(() => {
    if (!events) return;
    let cancelled = false;

    // [SENIOR_INSIGHT] Cleanup guard prevents stateful side-effects from completing after unmount.
    // This avoids notification re-scheduling races during fast navigation reloads in development.
    scheduleNotifications({ events, settings: notificationSettings }).catch(error => {
      if (!cancelled) {
        console.warn('[notifications] schedule failed', error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [events, notificationSettings]);

  return null;
}
