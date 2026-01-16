# Namaz Akışı (Offline Edition)

**Gizlilik Odaklı, Tamamen Çevrimdışı İbadet Asistanı**

Namaz Akışı, internet bağlantısına ihtiyaç duymadan namaz vakitlerini takip etmenizi, kaza namazlarınızı kaydetmenizi ve ibadet istikrarınızı (seri) korumanızı sağlayan açık kaynaklı bir mobil uygulamadır.

> 🔒 **Gizlilik Garantisi:** Tüm verileriniz (namaz kayıtları, ayarlar, seriler) sadece sizin cihazınızda saklanır. Hiçbir sunucuya gönderilmez, takip edilmezsiniz.

## 🌟 v1.0.0 Özellikleri

*   **📍 Akıllı Vakit Takibi:** Konumunuza özel, Diyanet uyumlu namaz vakitleri (Internet gerekmez).
*   **🔔 Akıllı 'Muhafız' Bildirim Sistemi:** Sıradan bir hatırlatıcı değil, sizi namaza kaldıran bir dost.
    *   **4 Aşamalı Uyarı:** 
        1.  *Hatırlatma:* Vakit girdiğinde veya yaklaştığında.
        2.  *Uyarı:* Vakit daralıyor.
        3.  *Mücadele:* "Şeytanla Mücadele" modu (Sizi rahatsız eder).
        4.  *Son Çağrı:* Vakit çıkmak üzere (Sıklık artar).
    *   **Esnek Sıklık Modu:** Her seviye için (örn: son 45 dk kala her 5 dakikada bir) ne sıklıkla bildirim alacağınızı siz seçersiniz.
*   **📿 Kaza Hesaplayıcı:** Kılınmayan namazları otomatik takip edin ve kaza çetelenizi tutun.
*   **🔥 Seri (Streak) Motivasyonu:** İbadet devamlılığınızı görselleştirin, zinciri kırmayın.
*   **🏆 Oyunlaştırma:** İbadet performansınıza göre seviye atlayın ve rozetler kazanın.
*   **🌙 Modern Arayüz:** Göz yormayan Karanlık Mod ve akıcı kullanıcı deneyimi.

## 🛠 Teknolojiler

Bu proje, modern mobil geliştirme standartlarına uygun olarak inşa edilmiştir:

*   **Core:** React Native (Expo SDK 50+) & TypeScript
*   **State:** Redux Toolkit
*   **Storage:** AsyncStorage (Yerel Veri Tabanı)
*   **Engine:** Adhan.js (Astronomik Hesaplamalar)

## 🚀 Kurulum

1.  Repoyu klonlayın:
    ```bash
    git clone https://github.com/furkanisikay/namazakisi.git
    cd namazakisi
    ```

2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

3.  Uygulamayı başlatın (Android/iOS):
    ```bash
    npx expo start
    ```

## 🤝 Katkıda Bulunma

Açık kaynak komünitesine katkılarınızı bekliyoruz! PR göndermeden önce lütfen bir Issue açarak tartışın.

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile sunulmaktadır. Özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.
