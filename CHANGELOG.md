# Değişiklik Günlüğü

Bu dosyada projenin tüm önemli değişiklikleri belgelenmiştir.

Format [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) standardına dayanmaktadır.
[Semantik Sürümleme](https://semver.org/lang/tr/) kullanılmaktadır.

## [0.13.0] - 2026-03-01

### Eklendi
- hata ayıklama modu eklendi ve hatalar giderildi

## [0.12.0] - 2026-02-24

### Eklendi
- kutlama penceresine paylaş butonu eklendi

### Düzeltildi
- [ui] kutlama penceresi renkleri ve yazıları iyileştirildi
- sayaç bildirimleri düzeltildi

## [0.11.2] - 2026-02-24

### Düzeltildi
- menü tuşlarının navigasyon tuşları altında kalma sorunu giderildi

## [0.11.1] - 2026-02-24

### Düzeltildi
- [workflow] release sirasinda build.gradle versionCode/Name guncelle
- [android] versionCode 22, versionName 0.11.0 olarak guncellendi
- [android] versionCode ve versionName app.json'dan dinamik oku

## [0.11.0] - 2026-02-23

### Eklendi
- açılış hızlandırıldı, sayaçlar düzeltildi, arayüz hataları giderildi
- sahur sayaci icin ozel tema eklendi (mor gradient, calar saat mascot, 'Sahurun Bitmesine' prefix)

### Düzeltildi
- [ci] versiyon hesaplama ve CI startup_failure düzeltildi (#58)
- [release] fetch-tags eklendi, versiyon 0.11.0 olarak duzeltildi
- [build] appVersionSource kalici olarak 'local' yapildi ve CI korumalari eklendi
- [build] appVersionSource 'remote' yerine 'local' olarak degistirildi

## [0.10.0] - 2026-02-22

### Eklendi
- [notifications] expo-countdown-notification native modülü ve android ayarları eklendi
- [notifications] native android geri sayım bildirimi entegrasyonu

### Düzeltildi
- [test] update async storage mock expected values for sayacBaslangicSeviyesi

## [0.9.2] - 2026-02-21

### Düzeltildi
- remove @notifee/react-native from plugins (not a valid config plugin since v7.8.0)
- vakit sayacı ve iftar sayacı bildirimlerinin release APK'da çalışmamasını düzelt

## [0.9.1] - 2026-02-19

### Düzeltildi
- Samsung bildirim gorunurlugu - kanal importance DEFAULT, trigger ID cakismasi cozumu
- release notes parsing and stale update cache after app update

## [0.9.0] - 2026-02-18

### Eklendi
- iftar sayacini ana ekrandan bildirim menusune tasi

## [0.8.0] - 2026-02-18

### Eklendi
- add Ramazan iftar counter feature with settings, component, and tests

### Düzeltildi
- rename typo gopirunur to gorunur in IftarSayaci component

## [0.7.1] - 2026-02-18

### Düzeltildi
- [ci] android release action 3 kritik hatasi duzelt

## [0.7.0] - 2026-02-15

### Eklendi
- add point indicators to prayer time cards and daily flow
- Add Vakit Sayacı (Prayer Time Countdown) feature with notifee
- Rozet ve Seri paylaşım görselleri iyileştirildi

### Düzeltildi
- seri verileri yuklenmeden seriKontrolet/namazKilindiPuanla calismasini engelle ve veri migrasyonu ekle
- hide muhafiz banner when current prayer is completed
- Resolve test failures and add vakitSayacSlice tests
- Improve hash-based message selection in PaylasilabilirRozet
- Address PR review comments - typing, imports, and consistency

### Değiştirildi
- address PR review feedback - improve naming, guard UI dispatch, fix dynamic import, improve test

## [0.6.1] - 2026-02-15

### Düzeltildi
- Invalidate update cache when app version changes
- [ci] release notlarından merge commitlerini filtrele

### Değiştirildi
- Simplify cache validation logic with destructuring

## [0.6.0] - 2026-02-14

### Eklendi
- Merge pull request #28 from furkanisikay/claude/merge-kible-to-master-bRa1M
- Add Qibla finder feature with comprehensive code review fixes
- kible gosterici ozelligi eklendi

### Değiştirildi
- Apply comprehensive code review fixes for SOLID, DRY, KISS, and Clean Code principles- [ci] optimize build times with caching and Gradle configuration

## [0.5.0] - 2026-02-14

### Eklendi
- Merge pull request #25 from furkanisikay/claude/add-auto-update-feature-9Dika

### Düzeltildi
- PR bot yorumları uygulandı - NetInfo, URL doğrulama, typo
- code review düzeltmeleri - kritik hatalar ve iyileştirmeler

## [0.4.0] - 2026-02-14

### Eklendi
- Merge pull request #24 from furkanisikay/claude/add-auto-update-feature-9Dika
- otomatik güncelleme kontrolü ve bildirim sistemi eklendi

## [0.3.0] - 2026-02-13

### Eklendi
- yapılandırılabilir takip profilleri ve pil optimizasyonları eklendi
- arka plan konum canlandırma ve izin iptali yönetimi eklendi

### Düzeltildi
- Merge pull request #23 from furkanisikay/claude/fix-safearea-location-tracking-eb4Pq
- tüm arayüz metinlerinde Türkçe karakter düzeltmesi
- tüm sayfalara SafeArea eklendi ve arka plan konum takibi düzeltildi

### Değiştirildi
- PR inceleme önerileri uygulandı (Copilot ve Gemini)

## [0.2.1] - 2026-02-13

### Düzeltildi
- Merge pull request #22 from furkanisikay/claude/fix-prayer-notifications-WhfeI
- prayer notification Kıldım button reliability and UI sync

### Değiştirildi
- address PR review feedback from Gemini and Copilot

## [0.2.0] - 2026-02-01

### Eklendi
- implement prayer time notifications and fix tests
- [home] Güneş vaktinde Öğle kartının pasif gösterimi ve testleri
- add prayer time arrival notifications (excluding sunrise)
- [home] Güneş vaktinde Öğle kartının pasif gösterimi sağlandı

## [0.1.1] - 2026-01-31

### Düzeltildi
- Merge pull request #16 from furkanisikay/fix/issue-7-seri-hatirlatici-saat-bugu-1810295291482891570
- seri hatırlatıcı sabit saat ayarını düzelt
- seri hatırlatıcı sabit saat ayarını düzelt
- [notifications] move listener to global scope and sync background service
- [notifications] move listener to global scope and sync background service
- [notifications] move listener to global scope and sync background service

## [0.1.0] - 2026-01-26

### Eklendi
- Merge pull request #2 from furkanisikay/feature/ui-yenileme
- Faz 2-3 NativeWind + Expo Icons gecisi tamamlandi

### Düzeltildi
- Turkce karakterler duzeltildi (o->ö, u->ü, s->ş, g->ğ, i->ı, c->ç)

### Değiştirildi
- Tab sayfalari header kaldirildi ve YuklemeGostergesi basitlestirildi

## [0.0.1] - 2026-01-23

### 🎉 Initial Release

**Namaz Akışı**, GPLv3 lisansı altında "Sadaka-i Cariye" projesi olarak ilk kez herkese açık olarak yayınlandı.

### ✨ Özellikler

*   **Çevrimdışı & Gizlilik:** Bulut bağımlılıkları tamamen kaldırıldı. Tüm veriler yerel olarak `AsyncStorage` kullanılarak saklanır.
*   **Akıllı Vakit Hesaplama:** Konuma dayalı olarak `adhan` kütüphanesi kullanılarak (Diyanet uyumlu) otomatik hesaplama yapılır.
*   **'Muhafız' Bildirim Sistemi:**
    *   **İnteraktif Aksiyonlar:** Bildirimler üzerinden doğrudan ("Kıldım") diyerek namazı işaretleyebilme.
    *   **Artan Aciliyet:** 4 seviyeli hatırlatma sistemi (Hatırlatma -> Uyarı -> Mücadele -> Son Çağrı).
    *   **Otomatik Temizlik:** Namaz kılındığında veya yeni vakit girdiğinde eski bildirimleri otomatik temizler.
    *   **Akıllı Sıklık:** Her aciliyet seviyesi için özelleştirilebilir aralıklar.
*   **Kaza Namazı Takibi:** Kılınmayan namazların otomatik tespiti ve kaydedilmesi.
*   **Seri & Oyunlaştırma:** Sürekliliği artırmak için görsel seri takibi ve rozet sistemi.
*   **Modern Arayüz:** Akıcı animasyonlarla optimize edilmiş Karanlık Mod.
*   **Konum Kalıcılığı:** Arka plan izin desteği ile sağlam konum yönetimi.

### 🛠 Teknik

*   **Mimari:** React Native (Expo) + TypeScript + Redux Toolkit.
*   **Lisans:** GNU GPLv3.
