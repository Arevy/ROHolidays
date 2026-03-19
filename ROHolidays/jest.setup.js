import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@notifee/react-native', () => {
  const noop = jest.fn();
  return {
    requestPermission: jest.fn(() => Promise.resolve({ authorizationStatus: 1 })),
    createChannel: noop,
    cancelAllNotifications: noop,
    createTriggerNotification: noop,
    AuthorizationStatus: { DENIED: 0 },
    AndroidImportance: { HIGH: 4 },
    TriggerType: { TIMESTAMP: 'timestamp' },
  };
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  }),
);
