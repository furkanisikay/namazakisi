/** @type {import("jest").Config} **/
module.exports = {
  preset: "react-native",
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  // Coverage ayarlari
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.tsx", // TSX'i de ekleyelim
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/index.ts",
  ],
  // Test dosyalari .test.ts ve .test.tsx uzantili olsun
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  // Expo modullerini transform et
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|expo-.*|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],
  coverageDirectory: "coverage",
};
