# 📋 Release Notes - Namaz Akışı

## v1.3.2 (16 Ocak 2026)

### 🐛 Hata Düzeltmeleri
- Uygulama adı "Namaz Akışı" olarak Türkçe karakterlerle düzeltildi
- Bildirim kanal adları Türkçe karakterlerle güncellendi (Muhafızı, Hatırlatıcı)
- Yükleme mesajları düzeltildi (Yükleniyor, Günlük, Haftalık, Aylık)
- Alert mesajları düzeltildi (Başarılı, İptal, Sıfırla)
- UI metinleri düzeltildi (Hatırlatma Sıklığı)

---

## v1.3.1 (15 Ocak 2026)

### 🎨 Ayarlar Sayfası UX Refactoring
- **Yeni Yapı**: Ayarlar sayfası tamamen yeniden tasarlandı (Settings UX Best Practices)
- Progressive disclosure prensibi uygulandı - kategorilere ayrıldı
- Ana ayarlar listesi temiz ve minimal hale getirildi
- Bilişsel yük azaltıldı (15+ karar → 6 kategori)

### 📄 Yeni Sayfalar
- `GörünümAyarlariSayfasi`: Tema modu ve renk paleti ayarları
- `BildirimAyarlariSayfasi`: Tüm bildirim ve hatırlatıcı ayarları
- `SeriHedefAyarlariSayfasi`: Seri eşikleri, özel gün modu ve tehlikeli ayarlar
- `HakkindaSayfasi`: Uygulama bilgileri, geliştirici ve versiyon bilgileri

### ✨ UX İyileştirmeleri
- Gereksiz "Önizleme" bölümü kaldırıldı
- Tehlikeli aksiyonlar (seri sıfırlama) izole edildi
- Hızlı ayarlar (titreşim, ses) ana sayfada tutuldu
- Her kategori için açıklayıcı ikon ve açıklama eklendi
- Web sitesi linki tıklanabilir hale getirildi

### 🔧 Teknik İyileştirmeler
- ~1000 satır kod → 6 modüler dosyaya ayrıldı
- Navigation stack'e yeni sayfalar eklendi
- Türkçe karakter desteği (Hakkında sayfası)
- Dinamik yıl gösterimi (telif hakkı)

### 📝 Hakkında Sayfası
- Geliştirici: Furkan Işıkay
- Web sitesi: furkanisikay.com.tr (tıklanabilir)
- Telif hakkı dinamik yıl ile güncellendi

---

## v1.3.0 (15 Ocak 2026)

### 🔔 Bildirim Sistemi
- **Yeni Özellik**: Kapsamlı bildirim servisi eklendi (`BildirimServisi`)
- Namaz vakti hatırlatmaları için akıllı bildirim altyapısı
- Expo Notifications entegrasyonu
- Özelleştirilebilir bildirim ayarları

### ⚙️ Gelişmiş Ayarlar
- **Yeni Sayfa**: Muhafız Ayarları sayfası tamamen yenilendi
- Detaylı tema yönetimi (Açık/Koyu/Sistem modu)
- Renk paleti seçenekleri ve özelleştirme
- Seri sistemi ayarları (tam gün eşiği, toparlanma süresi)
- Bildirim tercihlerini yönetme

### 🎬 Yeni Bileşenler
- `AnimasyonluSayac`: Namaz vakitleri için animasyonlu geri sayım sayacı
- Gelişmiş UI/UX iyileştirmeleri
- Ses servisi optimizasyonları

### 🧪 Test Altyapısı
- Jest test framework'ü entegre edildi
- Unit test desteği eklendi
  - `SeriHesaplayiciServisi` testleri
  - `NamazMuhafiziServisi` testleri
  - `SeriSistemiSimulasyonu` testleri
- TypeScript test tipleri (@types/jest, ts-jest)

### 🔧 İyileştirmeler
- Tarih işleme fonksiyonları yeniden düzenlendi (daha okunabilir ve sürdürülebilir)
- Redux store güncellemeleri (`muhafizSlice`, `seriSlice`)
- `NamazVaktiHesaplayiciServisi` geliştirmeleri
- Kod kalitesi ve temiz kod prensipleri uygulandı
- Ana sayfa performans optimizasyonları

### 📦 Teknik Güncellemeler
- `expo-audio` plugin entegrasyonu (app.json)
- `expo-notifications` plugin entegrasyonu
- Bağımlılık güncellemeleri ve temizliği
- Test konfigürasyonu (jest.config.js)
- TypeScript tip tanımları genişletildi

### 🐛 Hata Düzeltmeleri
- Ses servisi yol sorunları düzeltildi
- Tema renk importları optimize edildi
- Kod tekrarları azaltıldı

---

## v1.2.0 (19 Aralık 2024)

### 🛡️ Namaz Muhafızı
- **Yeni Özellik**: Namaz Muhafızı sistemi eklendi - namaz vakitlerini kaçırmamanız için akıllı hatırlatmalar
- GPS ile otomatik konum algılama
- Manuel şehir seçimi (81 il desteği)
- Konum bilgisi gösterimi (GPS koordinatları veya şehir adı)

### ⏱️ Geri Sayım Sayacı
- Ana sayfada sonraki namaz vaktine kalan süre geri sayımı
- Animasyonlu nabız efekti (son 5 dakikada)

### 🔧 İyileştirmeler
- Navigation hataları düzeltildi
- React import sorunları giderildi
- TypeScript tip tanımları güncellendi
- Kullanıcı profil bilgileri genişletildi (adSoyad, avatarUrl)

### 📦 Teknik Güncellemeler
- `NamazVaktiHesaplayiciServisi` geliştirildi
- `VakitBilgisi` interface'i genişletildi
- `muhafizSlice` Redux state yönetimi eklendi
- Ayarlar sayfasında stack navigation entegrasyonu

---

## v1.1.0 (Önceki Sürüm)

### ✨ Seri ve Rozet Sistemi
- Kesintisiz namaz serisi takibi
- Rozet kazanma sistemi
- Seviye/Rank sistemi
- Özel gün (mazeret) modu

### 🎨 Tema ve Arayüz
- Koyu/Açık/Sistem tema modu
- Renk paleti seçenekleri
- Animasyonlu kutlama modal'ı

### ☁️ Senkronizasyon
- Google ile giriş
- Supabase bulut yedekleme
- Çoklu cihaz senkronizasyonu

---

## v1.0.0 (İlk Sürüm)

### 🕌 Temel Özellikler
- Günlük 5 vakit namaz takibi
- Tarih seçici ile geçmiş günlere erişim
- İstatistik görüntüleme
- Yerel veri depolama
