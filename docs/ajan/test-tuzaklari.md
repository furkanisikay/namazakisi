# Test tuzakları (Jest + RN Testing Library)

Ne zaman okunur: test yazarken/düzeltirken, "yerelde geçti, CI'da patladı" ya da suite hiç çalışmadan düşüyorsa.

## Yerleşim ve temel mock'lar
- **Slice testleri `src/presentation/store/__tests__`, servis testleri `src/domain/services/__tests__`.**
- **Tipik mock'lar `jest.mock` ile:** `expo-calendar`, `adhan`, `@react-native-async-storage/async-storage`, `react-native` (`Platform`). Örnek: `TakvimServisi.test.ts`.
- **Redux state Immer ile donmuştur → `.sort()` öncesi `[...dizi]` ile kopyala.**
- **Testlerde sabit tarih yazma; `bugunuAl()`/`dunuAl()` (`TarihYardimcisi`) kullan.** Muhafız bildirim kimlikleri `muhafiz_{tarih}_vakit_...` biçimindedir ve servis bugün/dün ile süzer; sabit tarihli mock kimliği test yazıldığı günden sonra patlar.

## Platform
- **Jest'te `Platform.OS` varsayılanı `'ios'`tur, `'android'` DEĞİL.** `jest.config.js > preset: "@react-native/jest-preset"` → `haste.defaultPlatform: 'ios'`; `react-native`/`Platform` mock'lamayan her test iOS olarak koşar.
  - Domain servisine `Platform.OS` dallanması eklediğinde, o servisi kullanan testlerde platformu **açıkça** mock'la; yoksa "Android davranışı" sanılan suite sessizce iOS dalını ölçer. (Bugüne kadar zararsızdı çünkü Android davranışı native köprü mock'larıyla kuruluyordu — ör. `ArkaplanMuhafizServisi.test.ts`.)
  - **(a)** `jest.mock('react-native', () => ({ Platform: ... }))` diğer export'ları DÜŞÜRÜR (`NativeModules`, `NativeEventEmitter`, `Vibration`…) → transitif modül modül düzeyinde okuyorsa suite çalışmadan patlar; gerekenleri ekle ya da `jest.requireActual` ile yay.
  - **(b)** ES `import`'ları `const mockPlatformDurumu = {...}`'dan ÖNCE koşar (hoisting) → getter'lı Platform mock'u, modül düzeyinde `Platform.OS` okuyan transitif modülle TDZ hatası verir; o zinciri `jest.mock` ile kes (örnek: `GuncellemeKaynagiPlatform.test.ts`).
  - Platform değiştirmek için `jest.replaceProperty(Platform, 'OS', …)`; `react-native/Libraries/Utilities/Platform` modülünü mock'lamak css-interop/safe-area iç parçalarını kırar.

## Native modüller ve varlıklar
- **`requireNativeModule` jest'te YOKTUR → native modül import eden servisi (doğrudan VEYA dolaylı) yükleyen HER test dosyası köprüyü mock'lamalı.** `jest.mock('../ArkaplanMuhafizServisi')` gibi automock bile gerçek modülü yükler ve `Cannot read properties of undefined (reading 'EventEmitter')` ile suite çalışmaz; ör. `jest.mock('../../../../modules/expo-countdown-notification/src', () => ({ ... }))`. Servise native import eklerken onu yükleyen tüm testleri tara.
- **`expo-audio` native köprüdür → `moduleNameMapper` ile `__mocks__/expo-audio.js`'e bağlı.** `createAudioPlayer` sahte çalar döndürür (play/pause/seekTo/remove `jest.fn`); testler çalara `mock.results` ile ulaşır.
- **`moduleNameMapper`'la eşlenen mock'a testten `require(...)` ile ulaş, `jest.requireMock` ile DEĞİL** (ör. `__mocks__/expo-cami-geofence.js`). İkincisi servisin gördüğünden ayrı örnek döndürür ("0 kez çağrıldı").
- **`jest.config.js > transform` RN preset'inin varlık dönüştürücüsünü ezer → ses dosyaları `moduleNameMapper` `\\.(mp3|wav|m4a|ogg)$` → `__mocks__/sesDosyasiMock.js` ile eşlenir** (metro gibi sayı döndürür). Görseller (`png/jpg/jpeg`, harita cami ikonu) da aynı mock'a eşli; yeni varlık türü (ttf…) eklenirse aynı desen, yoksa `require('...mp3')` `SyntaxError: Invalid or unexpected token` verir.
- **`jest.isolateModules` ile modül durumunu sıfırlarken bağımlı mock'u da AYNI izole defterden al:** `jest.isolateModules(() => { audio = require('expo-audio'); servis = require('../X'); })`, assertion'lar `audio.*` üzerinden. Dosya tepesindeki `import` başka bir örnektir (yaşandı: `OnizlemeSesServisi.test.ts`).

## Mock durumu ve zaman
- **`jest.clearAllMocks()` mock İMPLEMENTASYONUNU silmez, yalnız çağrı kaydını.** Bir testteki `mockRejectedValue` sonrakine sızar (yaşandı: `startGeofencingAsync`); her `describe`'ın `beforeEach`'inde kullanılan mock'ları açıkça `mockResolvedValue` ile sıfırla — kardeş `describe`'lar üstteki `beforeEach`'ten yararlanmaz.
- **`Math.random`'u GLOBAL sabitleme (`jest.spyOn(Math,'random').mockReturnValue(0)`).** Coverage altında `source-map`'in quick-sort'u da onu kullanır; sabit 0 sıralı veride `RangeError: Maximum call stack size exceeded` verir (yalnız CI'da). Rastgeleliği parametre alan fonksiyonu sar (`muhafizGovdesiSec`'in `oran`'ı), spy'ı `afterEach`'te geri al.
- **CI testleri UTC'de koşar, yerel makine UTC+3.** Yerel `new Date(y,a,g,s,d)` + İstanbul vakitlerine dayanan test CI'da düşebilir; şüpheli suite'i `TZ=UTC npx jest <ad>` ile de koş, gerekirse boylamı kaydır (`ISTANBUL.lng + (yerelFark − 3) × 15` aynı yerel vakitleri verir).

## Tam sayfa render, süre sınırları, asılma
- **İki ayrı süre sınırı var, düşürme:** `jest.config.js > testTimeout: 30000` (test gövdesi) ve `jest.setup.after-env.js > configure({ asyncUtilTimeout: 10000 })` (`waitFor`/`findBy` penceresi; testTimeout'tan bağımsız). Tam sayfa testleri yük altında/zayıf VM'de (Jules) varsayılanları aşıp flaky oluyordu.
- **`jest.useFakeTimers` + tam sayfa RN render = CI'da ASILMA (yerelde görünmez).** Sahte zamanlayıcı React scheduler'ının `setImmediate`/`MessageChannel`'ını da sahteler, `act` sonsuza dek bekler; timeout mesajı `for a hook` da diyorsa test asılıyordur, yavaş değil. Senaryoyu sahte saatle değil **mock girdisinden** kur (AnaSayfa: `fajr = 23:59` → gece yarısı dalı, `fajr = 00:00` → gündüz) ve tick'i `waitFor` ile gerçek zamanda bekle; şart ise `doNotFake` ile scheduler API'lerini dışarıda bırak.
- **Mock bileşene çocuk render ETTİRME (ölçtüğün şeye katkısı yoksa).** `AnaSayfa` pager'ı 92 gün sayfası alır; `return <View>{props.children}</View>` CI'da coverage altında 30 sn'yi aştı, `return <View />` suite'i 20 sn → 8.4 sn indirdi. Timeout büyütmek semptomu erteler.
- **Mount'ta promise çözen hook'lu ekran testinde `act(...)` uyarısı:** render yardımcısını async yap ve `await act(async () => { await Promise.resolve(); })` ile mikro görevleri boşalt (`MuhafizAyarlariSayfasi.test.tsx > kur`), çağrıları `await`le (ör. `useTurkceTtsDestegi`).

## Lint
- **Kullanılmayan `catch` parametresi warning'dir; `argsIgnorePattern: '^_'` ona işlemez** (`eslint.config.js`'te `caughtErrorsIgnorePattern` yok). Kullanmayacaksan `catch { }`, kullanacaksan `catch (error)` + `Logger`.

## Cihaz durumu ve ortak bileşenler (sade tasarım)
- **`CihazDurumOkuyucu` / `useCihazDurumu` / `DurumEylemleri` her native modülü fonksiyon İÇİNDE `require` eder.** Tek bir statik native import (expo-location, notifee, köprü) kancayı kullanan HER ekran testini `requireNativeModule` tuzağına düşürür. Ekran testlerinde kancayı `jest.mock('…/hooks/useCihazDurumu', () => ({ useCihazDurumu: () => ({ durum: mockCihaz, yenile: jest.fn() }) }))` ile besle.
- **Saf bir fonksiyonu test ederken bile, onu dışa veren modal native köprü grafiği çekiyorsa köprüyü mock'la.** `SesliOnayMaddeleri.test.ts` tek başına geçti, tam suite'te sıraya bağlı olarak düştü (`SesliOnayModal` → `OnizlemeSesServisi` → countdown köprüsü).
- **Asenkron okuma yapan kancalar değer DEĞİŞMEDİYSE setState çağırmamalı** (`useHareketAzalt`, `useCihazDurumu`: ref ile karşılaştır). Aynı değerle setState de "not wrapped in act" uyarısı üretir; fonksiyonel güncelleyici (`setX(o => o)`) bile uyarıyı önlemez.

## Test dışı ama aynı turda öğrenilen
- **`.github/workflows` içinde `ios/*/Info.plist` glob'u KULLANMA:** prebuild uzantı/saat hedefleri birden çok Info.plist üretir; ana plist `ios/<xcodeproj adı>/Info.plist` (`ios-siri-derleme.yml` deseni).
- **TV JVM testleri JDK 21 ister** (adhan2/kotlinx-datetime; JDK 17'de `UnsupportedClassVersionError`).
- **Testten `tar`'a mutlak Windows yolu verme** (GNU tar `D:` önekini uzak makine sanar) — göreli yol + `cwd`.
- **Android SDK yokken saf `android/app/.../cekirdek/` Kotlin'i JVM'de koşmak:** Gradle önbelleğindeki `kotlin-compiler-embeddable` 2.1.20 (+ stdlib, script-runtime, reflect, daemon-embeddable, trove4j, annotations, coroutines) ile `java -cp … org.jetbrains.kotlin.cli.jvm.K2JVMCompiler -no-stdlib -cp <stdlib;org.json;junit;hamcrest> -d <çıktı> cekirdek/*.kt test/.../cekirdek/*.kt`, sonra `org.junit.runner.JUnitCore`. Windows'ta iki tuzak: `java -cp`'ye giden jar yolları `cygpath -w` ile çevrilmeli (Git Bash `/c/...` yolunda `K2JVMCompiler` "bulunamadı" der) ve JUnit **`android/app` içinden** koşmalı (bazı testler fikstürü `../../wear/...` göreli yoldan okur). `alarm/`, `kildim/`, `wear/` gibi Android API'li dosyalar böyle derlenmez → CI (`android-build.yml`).
