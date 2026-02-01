/** @type {import("jest").Config} **/
module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|expo-.*|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|immer)"
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/index.ts",
  ],
  // Test dosyalari hem .ts hem .tsx olabilir
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  coverageDirectory: "coverage",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
