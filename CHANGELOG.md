# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
