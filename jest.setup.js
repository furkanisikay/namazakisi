jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Reanimated 4.5 (Expo SDK 57) `react-native-reanimated/mock`'u bile gerçek
// `react-native-worklets` girişini yükler; o da modül düzeyinde native TurboModule'ü
// (`loadUnpackers`) çağırıp jest'te patlar. Worklets'in kendi mock'u global kurulur.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
