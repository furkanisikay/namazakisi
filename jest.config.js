/** @type {import("jest").Config} **/
module.exports = {
  preset: "react-native",
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
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
  coverageDirectory: "coverage",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
