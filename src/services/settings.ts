import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, UserSettings } from '../domain/types';

const STORAGE_KEY = 'settings/v1';

export async function loadSettings(): Promise<UserSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
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
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
