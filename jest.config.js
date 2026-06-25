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
  // Klasör-bazlı ratchet (mühendislik toleranslı). Kritik iş mantığı (domain) ve veri
  // katmanı YÜKSEKTE kilitli → erozyonları engellenir, yukarı ratchet'lenmeli. Geri kalan
  // (presentation/UI, core, navigation) tolere edilebilir global tabanla korunur — UI
  // render testine zorlamadan, ama eklenen store-slice/hook kazanımı erimeyecek kadar.
  // Mevcut (2026-06-25): domain ~94/87, data ~92/64, global toplam L64/B45; global bucket
  // (domain+data düşülmüş = presentation+core+nav) ~L42/B27. Tabanlar achieved'in birkaç
  // puan altı; coverage yükseldikçe yukarı çekin.
  // NOT: glob anahtarı (**/*.ts) eşiği HER DOSYAYA ayrı uygular; AGGREGATE (klasör toplamı)
  // istediğimiz için DİZİN-YOLU anahtarı kullanılır. Dizin-yolu eşleşen dosyaları global'den
  // düşer, eşik klasör toplamına uygulanır.
  coverageThreshold: {
    global: { statements: 38, branches: 24, functions: 32, lines: 38 },
    "./src/domain/": { statements: 88, branches: 78, functions: 85, lines: 88 },
    "./src/data/": { statements: 78, branches: 53, functions: 80, lines: 78 },
  },
  coverageDirectory: "coverage",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
