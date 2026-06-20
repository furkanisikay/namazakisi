// setupFilesAfterEnv: test framework (expect/beforeEach) KURULDUKTAN SONRA çalışır.
// @testing-library/react-native import'u extend-expect'i tetikler (expect gerektirir) →
// bu yüzden setupFiles'ta DEĞİL burada olmalı (yoksa "expect is not defined" patlar).
//
// Tam-sayfa render testleri yük altında / Jules'un zayıf VM'inde yavaşlar; `waitFor`'un
// varsayılan 1000ms penceresi async içerik (dosya çözme, modal açılışı vb.) gelmeden
// dolup "eleman bulunamadı" verir → FLAKY (test bozuk değil, yavaş). Pencereyi genişlet
// (testTimeout 30000 ile uyumlu, altında kalır → temiz waitFor hatası verir).
const { configure } = require('@testing-library/react-native');
configure({ asyncUtilTimeout: 10000 });
