import { DEFAULT_SETTINGS, UserSettings } from '../domain/types';
import { appStorage } from '../core/storage/mmkv';

const STORAGE_KEY = 'settings/v1';

export async function loadSettings(): Promise<UserSettings> {
  const raw = appStorage.getString(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings) {
  appStorage.set(STORAGE_KEY, JSON.stringify(settings));
}
