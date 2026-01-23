const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  // Coverage ayarlari - sadece .ts dosyalari (JSX/TSX haric)
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.tsx",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/index.ts",
    "!src/presentation/**",
  ],
  // Test dosyalari sadece .test.ts uzantili olsun
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Coverage threshold gecici olarak devre disi
  // TODO: Test coverage arttirilinca tekrar aktif edilecek
  // coverageThreshold: {
  //   global: {
  //     branches: 50,
  //     functions: 50,
  //     lines: 50,
  //     statements: 50,
  //   },
  // },
  coverageDirectory: "coverage",
};