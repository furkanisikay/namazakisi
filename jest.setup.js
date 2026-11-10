jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Reanimated 4.5 (Expo SDK 57) `react-native-reanimated/mock`'u bile gerçek
// `react-native-worklets` girişini yükler; o da modül düzeyinde native TurboModule'ü
// (`loadUnpackers`) çağırıp jest'te patlar. Worklets'in kendi mock'u global kurulur.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

// Reanimated 4.7.1 (Expo SDK 58): jest'te modül JSReanimated'ı seçer ama native
// başlatıcı (`initializers.native.ts`) yine `setCSSEventHandler` çağırır; JSReanimated
// bunu fırlatır → `react-native-reanimated/mock` bile yüklenemez. CSS olay köprüsü
// jest'te yok sayılır (CSS animasyonu kullanılmıyor), geri kalan vekil gerçek kalır.
jest.mock('react-native-reanimated/src/css/native/proxy', () => ({
  ...jest.requireActual('react-native-reanimated/src/css/native/proxy'),
  setCSSEventHandler: () => undefined,
}));
