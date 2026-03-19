/* eslint-env jest */

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

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    createMMKV: () => ({
      set: (key, value) => store.set(key, value),
      getString: key => {
        const value = store.get(key);
        return typeof value === 'string' ? value : undefined;
      },
      remove: key => store.delete(key),
    }),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  const chain = {
    activeOffsetX: () => chain,
    onUpdate: () => chain,
    onEnd: () => chain,
    onBegin: () => chain,
    onFinalize: () => chain,
  };
  return {
    GestureHandlerRootView: ({ children }) => React.createElement(View, null, children),
    GestureDetector: ({ children }) => React.createElement(View, null, children),
    Gesture: {
      Pan: () => chain,
      Tap: () => chain,
      Simultaneous: () => chain,
    },
  };
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { FlatList } = require('react-native');
  return {
    FlashList: React.forwardRef((props, ref) => React.createElement(FlatList, { ...props, ref })),
  };
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  }),
);
