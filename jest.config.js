/** @type {import("jest").Config} **/
module.exports = {
  preset: "react-native",
  testEnvironment: "node",
  // Tam-sayfa RN render testleri (KazaDefteri/DebugLogs vb.) gerçek timer + waitFor
  // kullanır; CPU yükü altında veya Jules'un zayıf VM'inde varsayılan 5000ms'i aşıp
  // flaky "timeout" verirler (test BOZUK değil, yalnız yavaş). Bütçeyi gerçek render
  // maliyetine göre genişlet — boştayken tüm suite ~30sn, sınır yalnız üst-bant içindir.
  testTimeout: 30000,
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  // waitFor/findBy süresini (asyncUtilTimeout) burada genişletiyoruz; @testing-library
  // import'u expect gerektirdiği için setupFiles'ta DEĞİL, env kurulduktan SONRA olmalı.
  setupFilesAfterEnv: ["<rootDir>/jest.setup.after-env.js"],
  // Coverage ayarlari
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/index.ts",
  ],
  // Test dosyalari .test.ts ve .test.tsx uzantili olsun
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^expo-notifications$": "<rootDir>/__mocks__/expo-notifications.js",
    "^expo-location$": "<rootDir>/__mocks__/expo-location.js",
  },
  // Expo modullerini transform et
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|expo-.*|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|adhan|@expo/vector-icons|expo-modules-core)"
  ],
  // CI özeti coverage/coverage-summary.json'u okur (Task 2); text+lcov korunur.
  coverageReporters: ["text", "lcov", "json-summary"],
  // Ratchet: mevcut seviyenin birkaç puan altı → erozyonu durdurur, mevcut suite'i bloklamaz.
  // Coverage yükseldikçe bu tabanlar da yükseltilmeli (yukarı doğru ratchet).
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 35,
      functions: 40,
      lines: 50,
    },
  },
  coverageDirectory: "coverage",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
