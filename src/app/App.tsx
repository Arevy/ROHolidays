import '../ui/theme/initDayjs'; // ensure dayjs plugins load early
import React from 'react';
import { LogBox } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { AppProviders } from './providers/AppProviders';
import RootNavigator from './navigation/RootNavigator';
import { NotificationScheduler } from './bootstrap/NotificationScheduler';
import { TurboModuleWarmup } from './bootstrap/TurboModuleWarmup';

function App() {
  // Improves memory usage for navigation stacks on both architectures.
  enableScreens();
  if (__DEV__) {
    // [SENIOR_INSIGHT] RN 0.83 emits this warning from internal animated bridges in some setups.
    // It is noisy and non-actionable for app code, so we silence only this specific message.
    LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);
  }
  return (
    <AppProviders>
      {/* [SENIOR_INSIGHT] Keep notification orchestration outside screens so user preferences
      apply globally even when Settings route is not mounted. */}
      <NotificationScheduler />
      <TurboModuleWarmup />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
