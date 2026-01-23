# Namaz Akışı

**Gizlilik Odaklı, Tamamen Çevrimdışı İbadet Asistanı**

![License](https://img.shields.io/badge/license-GPLv3-blue.svg) ![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg) ![Offline](https://img.shields.io/badge/mode-Offline%20First-green.svg)

Namaz Akışı, internet bağlantısına ihtiyaç duymadan namaz vakitlerini takip etmenizi, kaza namazlarınızı kaydetmenizi ve ibadet istikrarınızı korumanızı sağlayan modern, açık kaynaklı bir mobil uygulamadır.

> 🔒 **Gizlilik Garantisi:** Tüm verileriniz (namaz kayıtları, ayarlar, seriler) sadece sizin cihazınızda saklanır. Hiçbir sunucuya gönderilmez, takip edilmezsiniz.

---

## 🕌 Proje Felsefesi: Sadaka-i Cariye

Bu proje, ticari bir kaygı güdülmeden, **"Sadaka-i Cariye"** niyetiyle geliştirilmiştir. 

*   **Daima Ücretsiz:** Bu uygulama ve kaynak kodları kıyamete kadar ücretsiz kalacaktır.
*   **Ticari Satışa Kapalı:** Kaynak kodları üzerine kapalı devre ticari bir ürün inşa edilemez.
*   **GPLv3 Güvencesi:** Proje, özgür yazılım lisansı GNU GPLv3 ile korunmaktadır. Bu lisans, projenin her zaman açık kaynak kalmasını teminat altına alır.

> *"İnsan ölünce üç şey hariç ameli kesilir: Sadaka-i cariye (faydası süregelen hayır), kendisinden faydalanılan ilim ve kendisine dua eden hayırlı evlat."*

---

## 🌟 Özellikler

### 📍 Akıllı Vakit Takibi
*   **Tamamen Çevrimdışı:** İnternet gerektirmez. `Adhan.js` kütüphanesi ile koordinatlarınız üzerinden astronomik hesaplama yapar (Diyanet uyumlu).
*   **Otomatik Konum:** Tek seferlik konum izni ile çalışır, gittiğiniz her yerde vakitleri otomatik günceller.

### 🔔 'Muhafız' Bildirim Sistemi
Sıradan bir alarm değil, sizi namaza kaldıran akıllı bir sistem:
*   **4 Aşamalı Uyarı:** Vakit yaklaştıkça artan uyarı seviyeleri (*Hatırlatma -> Uyarı -> Mücadele -> Son Çağrı*).
*   **İnteraktif Bildirimler:** Uygulamayı açmadan bildirim üzerinden **"Kıldım"** diyerek vakti işaretleyin.
*   **Akıllı Temizlik:** Namazı kıldığınızda veya yeni vakit girdiğinde eski bildirimler otomatik temizlenir.
*   **Esnek Ayarlar:** Her aşama için sıklık (örn: son 15 dk kala her dakika uyar) ayarlanabilir.

### 📿 İbadet Takibi & Motivasyon
*   **Kaza Hesaplayıcı:** Kılınmayan namazları otomatik tespit eder ve kaza çetelenizi tutar.
*   **Seri (Streak) Sistemi:** İbadet devamlılığınızı Zinciri Kırma metoduyla görselleştirin.
*   **Oyunlaştırma:** İbadet performansınıza göre seviye atlayın ve rozetler kazanın.

### 🌙 Modern & Kullanıcı Dostu
*   **Göz Yormayan Arayüz:** Gece kullanıma uygun, şık Karanlık Mod.
*   **Reklamsız & Sade:** Sizi ibadetten alıkoyacak hiçbir reklam veya dikkat dağıtıcı unsur içermez.

---

## 🛠 Teknolojiler

Modern mobil geliştirme standartları ile inşa edilmiştir:

*   **Core:** React Native (Expo SDK 50+), TypeScript
*   **State:** Redux Toolkit
*   **Storage:** AsyncStorage (Yerel Veri Tabanı)
*   **Styling:** NativeWind (TailwindCSS)
*   **Engine:** Adhan.js, Expo Background Fetch, Expo Notifications

---

## 🚀 Kurulum

1.  **Repoyu Klonlayın**
    ```bash
    git clone https://github.com/furkanisikay/namazakisi.git
    cd namazakisi
    ```

2.  **Bağımlılıkları Yükleyin**
    ```bash
    npm install
    # veya
    yarn install
    ```

3.  **Başlatın**
    ```bash
    npx expo start
    ```

---

## 🤝 Katkıda Bulunma

Bu proje topluluk katkılarına açıktır! Bir hata bulduysanız veya özellik eklemek isterseniz:
1.  Bir **Issue** açarak tartışın.
2.  Repoyu fork edin.
3.  Geliştirmenizi yapın ve **Pull Request** gönderin.

*Not: Gönderdiğiniz kodların da GPLv3 lisansı kapsamında açık kaynak olacağını kabul etmiş olursunuz.*

## 📄 Lisans

Copyright (c) 2026 Furkan Işıkay.

Bu proje **GNU General Public License v3.0** (GPLv3) ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakabilirsiniz.
