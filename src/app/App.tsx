import '../ui/theme/initDayjs'; // ensure dayjs plugins load early
import React from 'react';
import { enableScreens } from 'react-native-screens';
import { AppProviders } from './providers/AppProviders';
import RootNavigator from './navigation/RootNavigator';

function App() {
  // Improves memory usage for navigation stacks on both architectures.
  enableScreens();
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
