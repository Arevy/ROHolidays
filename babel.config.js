module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // [SENIOR_INSIGHT] Keep worklet extraction last so Reanimated runs animations on the UI thread
    // and avoids JS-thread-induced jank under heavy rendering.
    'react-native-reanimated/plugin',
  ],
};
