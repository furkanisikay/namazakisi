# Sürüm notları ("Yenilikler")

Mağazadaki "Bu sürümdeki yenilikler" metninin **tek doğru kaynağı**. Play'e
`gh workflow run play-magaza.yml -f mod=uretime-al -f surum=X.Y.Z` bu dosyadaki
`#### X.Y.Z` bloğunu yazar. Mağazaya elle yazılan not repoda iz bırakmaz ve bir
sonraki sürümde üslup kayar.

**Kurallar**
- Play sınırı **500 karakter** (betik aşımı reddeder).
- Not, **üretimdeki önceki sürümden** bu yana kullanıcının fark edeceği her şeyi
  kapsar; ara sürümler (iç test) kullanıcıya hiç ulaşmadığı için atlanmaz.
- Yalnız o platformda görünen değişiklikler. iOS'a özgü düzeltmeler Play notuna,
  Android'e özgü özellikler (widget, akıllı konum takibi) App Store notuna girmez.
- Araç, CI ve belge değişiklikleri girmez.
- Tireyle başlayan kısa maddeler, kibar "siz" dili. Em/en tire yok, "X değil Y"
  kalıbı yok, dolgu zarf yok.

## Google Play

#### 0.30.1

Üretimdeki önceki sürüm 0.28.2; not 0.28.3 ile 0.30.1 arasını kapsar.

```
- Ana ekranda her vaktin giriş saati yazıyor; kıldığınız vakitler bir zincirle birbirine bağlanıyor.
- Seyahatte ilçeniz ya da şehriniz değişince sessiz bir bildirim gelir. Konum Ayarları'ndan kapatabilirsiniz.
- Ekran okuyucu düğmelerin adını ve durumunu okuyor.
- Hata ekranı ve bazı düğmeler daha okunaklı.
- Paylaştığınız hata kayıtlarında konumunuz gizleniyor.
- Yazım ve metin hataları giderildi.
```

#### 0.28.2

Üretimdeki önceki sürüm 0.24.0; not 0.25.0 ile 0.28.2 arasını kapsar.

```
- Hatırlatmalar vakit girer girmez de başlayabilir; zaman şeridi uyarı saatlerini gösterir.
- Hatırlatmalara titreşim ekleyebilirsiniz.
- Uzun vakitlerde ilk uyarıyı daha erken kurabilirsiniz.
- Cuma hatırlatmasını tekrarlatabilirsiniz.
- Seri günü ertesi imsakta biter; namaz eksikse bitmeden geri sayım bildirimi gelir.
- 7 günü aşan bir seri koparsa 2 günde kurtarabilirsiniz.
- Konumunuzu tek dokunuşla yenileyebilirsiniz.
- Çift sesli anons, seri ve tarih yazımı hataları giderildi.
```

#### 0.24.0

Kayıt için (üretimdeki not, mağazadan okundu).

```
- Namaz Muhafızı artık sesli anons yapıyor: vakit çıkmadan önce kalan süreyi söylüyor.
- Her vakit için ayrı ayar: bildirim, sesli anons, ikisi ya da kapalı. Sesi siz seçin.
- Cuma hatırlatması: vakit girmeden önce uyarır.
- Şifreli yedekleme ve yeni cihaza aktarım.
- Seri sekmesi: her gün bir yıldız, beş ışın beş vakit.
- Ayarlarda arama ve kurulum sağlığı.
- Konum takibi pil dostu oldu, kalıcı bildirim yok.
- Kullanılmayan izinler kaldırıldı.
- Puan ve bildirim hataları giderildi.
```
