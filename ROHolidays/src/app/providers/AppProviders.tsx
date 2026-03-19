import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadSettings, saveSettings } from '../../services/settings';
import { UserSettings, DEFAULT_SETTINGS } from '../../domain/types';
import { SettingsContext } from '../state/SettingsContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 60 * 24, // 24h
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export function AppProviders({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings()
      .then(loaded => setSettings(loaded))
      .finally(() => setReady(true));
  }, []);

  const updateSettings = (next: UserSettings) => {
    setSettings(next);
    void saveSettings(next);
  };

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
          <SettingsContext.Provider value={{ settings, setSettings: updateSettings }}>
            <NavigationContainer>{children}</NavigationContainer>
          </SettingsContext.Provider>
        </PersistQueryClientProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
