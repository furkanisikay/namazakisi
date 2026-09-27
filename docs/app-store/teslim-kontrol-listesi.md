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
| Ekran görüntüleri | 5 kare, iPhone 6.9" (1320×2868), simülatörde üretildi |
| İnceleme iletişim bilgisi | Ad, e-posta, telefon + inceleme notları |

## Kalanlar

Yalnızca **gönderim kararı** kaldı: App Store Connect'te *Add for Review* →
*Submit to App Review*. Bu adım bilinçli olarak otomatikleştirilmedi — uygulamayı
Apple incelemesine göndermek geri alınması zor bir adımdır.

## Ekran görüntüleri nasıl üretiliyor

Fiziksel cihaz gerekmez: `.github/workflows/ios-ekran-goruntuleri.yml` macOS
runner'ında iPhone Pro Max simülatörünü kullanır ve App Store'un istediği
1320×2868 kareyi verir. Yeniden üretmek için:

```bash
gh workflow run ios-ekran-goruntuleri.yml --ref master -f asc_yukle=true
```

`asc_yukle=false` ile kareler yalnızca artifact olarak gelir (önce gözden
geçirmek için). Tuzaklar ve gerekçeler AGENTS.md'de.

### Seçilen kareler

1. **Ana ekran** — sıradaki vakit, geri sayım, günlük akış
2. **Muhafız + zaman şeridi** — yoğunluk, yön seçici, eskalasyon adımları
3. **Adım detayı** — kanallar, eşik, sıklık
4. **Seri** — gök paneli ve gün haritası
5. **Kıble** — pusula

**Rozetler elendi:** rozetler olay-tetiklemeli verildiği için tohumlanmış
geçmişle açılmıyor; kare "0/8 Rozet" ve tümü kilitli görünüyordu.
