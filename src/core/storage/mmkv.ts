import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const appStorage = createMMKV({
  id: 'roholidays-storage',
  encryptionKey: 'roholidays-local-key-v1',
});

export const mmkvStateStorage: StateStorage = {
  getItem: key => appStorage.getString(key) ?? null,
  setItem: (key, value) => {
    appStorage.set(key, value);
  },
  removeItem: key => {
    appStorage.remove(key);
  },
};

export const mmkvQueryStorage = {
  getItem: (key: string) => appStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => {
    appStorage.set(key, value);
  },
  removeItem: (key: string) => {
    appStorage.remove(key);
  },
};
