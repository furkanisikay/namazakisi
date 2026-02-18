# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.1] - 2026-02-18

### Fixed
- [ci] android release action 3 kritik hatasi duzelt

## [0.7.0] - 2026-02-15

### Added
- add point indicators to prayer time cards and daily flow
- Add Vakit Sayacı (Prayer Time Countdown) feature with notifee
- Rozet ve Seri paylaşım görselleri iyileştirildi

### Fixed
- seri verileri yuklenmeden seriKontrolet/namazKilindiPuanla calismasini engelle ve veri migrasyonu ekle
- hide muhafiz banner when current prayer is completed
- Resolve test failures and add vakitSayacSlice tests
- Improve hash-based message selection in PaylasilabilirRozet
- Address PR review comments - typing, imports, and consistency

### Changed
- address PR review feedback - improve naming, guard UI dispatch, fix dynamic import, improve test

## [0.6.1] - 2026-02-15

### Fixed
- Invalidate update cache when app version changes
- [ci] release notlarından merge commitlerini filtrele

### Changed
- Simplify cache validation logic with destructuring

## [0.6.0] - 2026-02-14

### Added
- Merge pull request #28 from furkanisikay/claude/merge-kible-to-master-bRa1M
- Add Qibla finder feature with comprehensive code review fixes
- kible gosterici ozelligi eklendi

### Changed
- Apply comprehensive code review fixes for SOLID, DRY, KISS, and Clean Code principles- [ci] optimize build times with caching and Gradle configuration

## [0.5.0] - 2026-02-14

### Added
- Merge pull request #25 from furkanisikay/claude/add-auto-update-feature-9Dika

### Fixed
- PR bot yorumları uygulandı - NetInfo, URL doğrulama, typo
- code review düzeltmeleri - kritik hatalar ve iyileştirmeler

## [0.4.0] - 2026-02-14

### Added
- Merge pull request #24 from furkanisikay/claude/add-auto-update-feature-9Dika
- otomatik güncelleme kontrolü ve bildirim sistemi eklendi

## [0.3.0] - 2026-02-13

### Added
- yapılandırılabilir takip profilleri ve pil optimizasyonları eklendi
- arka plan konum canlandırma ve izin iptali yönetimi eklendi

### Fixed
- Merge pull request #23 from furkanisikay/claude/fix-safearea-location-tracking-eb4Pq
- tüm arayüz metinlerinde Türkçe karakter düzeltmesi
- tüm sayfalara SafeArea eklendi ve arka plan konum takibi düzeltildi

### Changed
- PR inceleme önerileri uygulandı (Copilot ve Gemini)

## [0.2.1] - 2026-02-13

### Fixed
- Merge pull request #22 from furkanisikay/claude/fix-prayer-notifications-WhfeI
- prayer notification Kıldım button reliability and UI sync

### Changed
- address PR review feedback from Gemini and Copilot

## [0.2.0] - 2026-02-01

### Added
- implement prayer time notifications and fix tests
- [home] Güneş vaktinde Öğle kartının pasif gösterimi ve testleri
- add prayer time arrival notifications (excluding sunrise)
- [home] Güneş vaktinde Öğle kartının pasif gösterimi sağlandı

## [0.1.1] - 2026-01-31

### Fixed
- Merge pull request #16 from furkanisikay/fix/issue-7-seri-hatirlatici-saat-bugu-1810295291482891570
- seri hatırlatıcı sabit saat ayarını düzelt
- seri hatırlatıcı sabit saat ayarını düzelt
- [notifications] move listener to global scope and sync background service
- [notifications] move listener to global scope and sync background service
- [notifications] move listener to global scope and sync background service

## [0.1.0] - 2026-01-26

### Added
- Merge pull request #2 from furkanisikay/feature/ui-yenileme
- Faz 2-3 NativeWind + Expo Icons gecisi tamamlandi

### Fixed
- Turkce karakterler duzeltildi (o->ö, u->ü, s->ş, g->ğ, i->ı, c->ç)

### Changed
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
