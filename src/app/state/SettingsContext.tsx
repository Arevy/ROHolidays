import React from 'react';
import { DEFAULT_SETTINGS, UserSettings } from '../../domain/types';

type SettingsContextValue = {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
};

export const SettingsContext = React.createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSettings: () => {},
});

export function useSettings() {
  return React.useContext(SettingsContext);
}
