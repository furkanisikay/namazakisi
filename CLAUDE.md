# Namaz Akışı — Proje Rehberi (Claude için)

> Proaktif İslami ibadet asistanı. React Native + Expo (bare workflow), `android/` native dizini git'te.
> Bu dosya kısa ve yüksek-sinyal tutulmalıdır; uzun anlatım yerine kural ve reçete yazın.

## ⚙️ Bu dosyayı güncel tut (Claude için talimat)
Çalışırken öğrendiğin kalıcı bilgileri **proaktif olarak buraya ekle** — kullanıcının ayrıca istemesini bekleme. Şunları öğrendiğinde bu dosyayı güncelle (aynı commit içinde):
- Tekrar düşmemen gereken bir tuzak/gotcha veya çözümü (örn. platform sınırı, çakışan desen).
- Yeni bir reçete: "X eklemek için Y dosyasına şunu yap" (örn. yeni özellik duyurusu).
- Yeni komut, konvansiyon, mimari kararı veya kullanıcının net tercihi (örn. dil/üslup kuralları).
- Bir şeyin neden öyle yapıldığı (gelecekte yanlışlıkla geri almayasın).
Kurallar: kısa ve eyleme dönük yaz; mevcut bölümlere ekle, yenisini ancak gerekiyorsa aç; sırrı/jeton/kişisel veri YAZMA; spekülasyon değil yalnızca doğrulanmış bilgi gir; dosyayı şişirme (eskiyen maddeyi güncelle/sil).

## Komutlar
- Tip kontrolü: `npx tsc --noEmit`
- Testler: `npx jest` (tek dosya: `npx jest <isimParçası>`)
- Lint/test CI'da koşar (`.github/workflows`); push öncesi en az `tsc` + ilgili testleri çalıştır.

## Mimari
- Katmanlar: `src/domain` (servisler, iş kuralı), `src/presentation` (ekranlar, bileşenler, store, hooks), `src/core` (sabitler, tema, util, tipler).
- State: Redux Toolkit slice'ları (`src/presentation/store`), kalıcılık AsyncStorage ile thunk içinde. Her slice `*Yukle` / `*Guncelle` deseni izler.
- Navigasyon: `src/navigation/AppNavigator.tsx` — Tab + Stack. Ayar sayfaları `AyarlarStack` içinde.
- Domain servisleri **store'a bağımlı olmamalı**; tipleri dosya-içi yerelleştirin (yapısal uyum yeter).

## Dil ve İsimlendirme
- Kod isimleri **Türkçe** (değişken/fonksiyon/dosya): `vakit`, `ayarlar`, `olustur`, `temizle`...
- **Kullanıcıya gösterilen tüm metinler kibar "siz" dilinde** olmalı: "ekleyebilirsiniz", "kontrol edin", "vakitleriniz". Asla "sen/senin" kullanma.
- Buton/CTA etiketleri de kibar: "Hemen kurun", "İnceleyin".

## Kritik Desenler ve Tuzaklar (bu projede öğrenildi)
- **New Architecture açık** (`app.json: newArchEnabled: true`). Bu yüzden RN core `<Modal>` `onRequestClose`'u Android donanım geri tuşunda **güvenilir çalışmaz**.
  → Her modalda `useDonanimGeriTusu(gorunur, onKapat)` hook'unu kullan (`src/presentation/hooks/useDonanimGeriTusu.ts`). `onRequestClose`'u da bırak (zarar yok).
- **Bottom-sheet deseni**: backdrop'u içeriği saran `TouchableWithoutFeedback` olarak DEĞİL, `StyleSheet.absoluteFill` ile **kardeş (sibling)** olarak koy. Aksi halde içteki FlatList/ScrollView scroll'u takılır.
  → Örnek: `TakvimAyarlariSayfasi.tsx` (TemizleModali, VakitEditorModali).
- **Sabit yükseklikli sheet**: `maxHeight` yerine `height` kullan; `flex:1` çocuklar (FlatList) ancak öyle düzgün çalışır.
- Namaz vakti hesabı **gün bazında**: her gün için `new PrayerTimes(coordinates, tarih, params)` ayrı hesaplanır (`TakvimServisi.takvimOlaylariOlustur`).

## Yeni Özellik Duyurusu (önemli reçete)
Yeni bir özellik eklediğinde kullanıcıya duyurmak için **tek yer**: `src/core/constants/YeniOzellikler.ts`.
- Diziye en üste bir `YeniOzellik` nesnesi ekle (id, surum, tarih, baslik, aciklama özeti, detayAciklama, detaylar[], opsiyonel hedefSayfa/ctaEtiketi/kartGoster).
- Otomatik olarak: Ayarlar tab nokta rozeti + menü "Yeni" rozeti + (kartGoster ise) Ayarlar üstü tanıtım kartı + "Neler Yeni" sayfası beslenir. Ek kod gerekmez.
- Durum: `ozelliklerSlice` (`gorulenIdler` rozetleri kaldırır, `kapatilanKartIdler` kartı gizler). Açılışta `ozellikleriYukle` (MainTabs'te) dispatch edilir.
- Kopya kuralı: `baslik` dikkat çekici, `aciklama` özelliğin ~%70'ini tek bakışta anlatan özet, detaylar tıklayınca açılır. Hepsi kibar "siz" dili.

## Güncelleme Sistemi (gotcha'lar)
- Provider mimarisi: Play Store'dan kurulduysa `PlayStoreGuncellemeKaynagi` (Play Core), aksi halde `GitHubGuncellemeKaynagi` aktif (`GuncellemeServisi`).
- **Play Core API sürüm ADINI ve changelog'u VERMEZ**, sadece `availableVersionCode`. Bu yüzden Play Store güncelleme modalı sürüm adı/özellik gösteremez. Çözüm: modal temiz "Yeni sürüm" etiketi gösterir (`yeniVersiyonEtiketi`), yeni özellikler **güncelleme sonrası "Neler Yeni" sistemiyle** (`YeniOzellikler.ts`) duyurulur. Kullanıcıya asla "versionCode N" gösterme.
- **Önbellek tuzağı**: Play Store sonucu versionCode tabanlı olduğundan `onbellekBayatMi()` ile bayatlığı tespit edilemez → güncelleme sonrası eski "güncelleme var" cache'i takılıp modalı tekrar gösteriyordu. Çözüm: Play Store aktifken `guncellemeKontrolEt` önbelleği ATLAR, her açılışta Play Core'u yeniden sorgular (lokal/ucuz); erteleme ("Sonra") yine de süresince banner'ı bastırır.

## CI / Sürümleme
- APK = **Gradle** (`android-build.yml`), EAS DEĞİL. AAB = EAS (`expo-build.yml`) → Play Store internal track'e otomatik submit.
- `eas.json`: `appVersionSource: local`. CI'da AAB `versionCode` = build anında `date +%s` (timestamp); runner'da local commit edilir, push edilmez.
- Geliştirme branch'i: `claude/feature-development-*`. Push sonrası PR aç (ready, draft değil).

## Test Konvansiyonu
- Slice testleri `src/presentation/store/__tests__`, servis testleri `src/domain/services/__tests__`.
- Mock: `expo-calendar`, `adhan`, `@react-native-async-storage/async-storage`, `react-native` (`Platform`) jest.mock ile. Örnek: `TakvimServisi.test.ts`, `ozelliklerSlice.test.ts`.
- Redux state donmuştur (Immer); testte diziyi `.sort()` etmeden önce `[...dizi]` ile kopyala.
