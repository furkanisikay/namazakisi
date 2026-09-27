# App Store teslim kontrol listesi — v1.0

Kaynak metinler: [magaza-metinleri.md](./magaza-metinleri.md) ·
Gizlilik politikası: <https://furkanisikay.github.io/namazakisi/app-store/gizlilik-politikasi>

## Tamamlananlar (App Store Connect API ile yazıldı)

| Alan | Değer |
|---|---|
| Uygulama adı | Namaz Akışı |
| Alt başlık | Vakit takibi ve namaz muhafızı |
| Anahtar kelimeler | 85 karakter, `magaza-metinleri.md`'den |
| Açıklama | 2197 karakter |
| Promosyon metni | yazıldı |
| Destek adresi | GitHub Issues |
| Pazarlama adresi | GitHub deposu |
| Gizlilik politikası adresi | GitHub Pages |
| Yaş derecelendirmesi | **4+** (tüm başlıklar "yok") |
| İçerik hakları | Üçüncü taraf içerik kullanılmıyor |
| İhracat uyumluluğu | Muaf olmayan şifreleme kullanılmıyor |
| Fiyat | **Ücretsiz** |
| Sürüme bağlı build | En son TestFlight build'i |
| İnceleme iletişim bilgisi | Ad, e-posta, telefon + inceleme notları |

## Kalanlar

### 1. Veri Gizliliği beyanı — yalnızca web arayüzünden
App Store Connect'in `appDataUsages` uç noktaları kamuya açık değil (404), bu adım
API ile yapılamaz.

**Yol:** App Store Connect → Namaz Akışı → **App Privacy** → *Get Started* →
soruya **"No, we do not collect data from this app"** (Veri toplanmıyor) yanıtını
verin → *Publish*.

Gerekçe kayıtlı: uygulama hiçbir veriyi toplamaz, sunucuya göndermez, reklam ve
analitik içermez (bkz. gizlilik politikası). Tek ağ isteği şehir listesi
(`turkiyeapi.dev`) olup kullanıcıya ait bilgi taşımaz.

### 2. Ekran görüntüleri
`supportsTablet: false` olduğu için **iPad görüntüsü istenmiyor**. Gereken tek
boyut kümesi iPhone 6.9":

- **1320 × 2868** veya **1290 × 2796** piksel, dikey (portrait)
- 3–10 görüntü (5 önerilir), durum çubuğu görünür olabilir
- Cihazdan doğrudan ekran görüntüsü yeterlidir; çerçeve/pazarlama grafiği şart değil

Önerilen 5 kare (özellikleri sırayla anlatır):

1. **Ana ekran** — sıradaki vakit + geri sayım, günün vakit akışı
2. **Muhafız ayarları** — vakit kartı açık, **zaman şeridi** görünür
3. **Adım detayı** — kanallar, sesli anons metni, "Dinle" düğmesi
4. **Seri sekmesi** — gök paneli ve gün haritası
5. **Kıble pusulası**

> iOS'ta bulunmayan Android özellikleri (widget, arka plan konum takibi,
> uygulama içi güncelleme) görüntülerde **yer almamalı**.
