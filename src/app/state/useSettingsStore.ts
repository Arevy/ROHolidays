import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS, NotificationSettings, UserSettings } from '../../domain/types';
import { mmkvStateStorage } from '../../core/storage/mmkv';

type SettingsStore = {
  settings: UserSettings;
  patchNotification: (patch: Partial<NotificationSettings>) => void;
  resetNotification: () => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      settings: DEFAULT_SETTINGS,
      patchNotification: patch =>
        set(state => ({
          settings: {
            ...state.settings,
            notification: {
              ...state.settings.notification,
              ...patch,
            },
          },
        })),
      resetNotification: () =>
        set(state => ({
          settings: {
            ...state.settings,
            notification: DEFAULT_SETTINGS.notification,
          },
        })),
    }),
    {
      name: 'settings/v2',
      // [SENIOR_INSIGHT] Zustand selectors + persisted slices avoid context-wide re-renders.
      // Only components selecting touched keys re-render, keeping interaction latency low.
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
    },
  ),
);
