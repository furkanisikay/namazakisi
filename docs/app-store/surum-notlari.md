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

#### 0.45.0

Üretimdeki önceki sürüm 0.30.1 (0.42.0 incelemedeyken yerine geçti); not 0.31.0 ile 0.45.0 arasını kapsar.

```
- Daha sade tasarım: Bugün, Kıble, Kaza, İlerleme ve Ayarlar sekmeleri; 5 adımlı kurulum.
- Tüm hatırlatmalar tek sayfada: cuma, camiye gitme, yatış, toplantı, nafile. Sesli okuma metnini siz yazın.
- Namazda sessiz: camide ve namaz vakitlerinde telefonunuz sessize alınır.
- Wear OS saat uygulaması ve Android TV vakit panosu.
- Kaza Defteri yenilendi. Cihazlar arası şifreli eşitleme (Google Drive).
- Widget ve hızlı ayardan tek dokunuşla "Kıldım".
```

#### 0.42.0

Üretimdeki önceki sürüm 0.30.1; not 0.31.0 ile 0.42.0 arasını kapsar.

```
- Wear OS saat uygulaması: vakitler, kalan süre, kıble ve tesbihat bileğinizde. Android TV için vakit panosu.
- Cuma, camiye gitme, yatış ve toplantı hatırlatmaları. Sesli okuma metnini siz yazın.
- Nafile namaz vakitleri ve isteğe bağlı gerçek alarm.
- Camideyim: camide telefonunuz sessize alınır.
- Kaza Defteri yenilendi.
- Widget ve hızlı ayardan tek dokunuşla "Kıldım".
- Hatırlatmaları özel günlerde durdurun.
- Sade görünüm.
```

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

## App Store

#### 0.41.1

Yayındaki önceki sürüm 0.30.1. Ana ekran widget'ı, canlı etkinlik ve Apple Watch
bu build'de kapalı (bayrak arkasında) olduğu için nota girmedi; Android'e özgü
özellikler (Camideyim, Namaz modu, otomasyon, widget) de girmez. Gerçek alarm
yalnız iOS 26 ve sonrasında çalıştığı için öyle yazıldı.

```
- Her vakit için kendi hatırlatma akışınızı kurabilirsiniz: 1 ile 6 arası hatırlatma, her biri için bildirim ya da sesli anons.
- iOS 26 ve sonrasında seçtiğiniz hatırlatma adımı gerçek bir alarm olarak çalabilir.
- Cuma namazı, camiye zamanında yetişme ve yatmadan önce hatırlatma eklendi.
- Takviminizdeki bir toplantı vaktin sonuna denk gelirse önceden haber veriyoruz. Takviminiz yalnız telefonunuzda okunur.
- Kuşluk, evvâbîn ve teheccüd vakitleri ana ekranda; dilerseniz hatırlatma da alırsınız.
- Tüm hatırlatmalar aynı düzenle tek ekranda.
- Sade görünüm: yalnız şu anki vakit, kalan süre ve büyük bir "Kıldım" düğmesi.
- Siri'ye sıradaki namazı sorabilir, kıldığınız vakti sesinizle işaretleyebilir, Odak'ta hatırlatmaları sessize alabilirsiniz.
- Kaza defteri her eklemeyi ve kılınanı ayrı satır olarak saklar; kaza borcunuz varsa her farzdan sonra bir kaza önerilir.
- Özel gün modunda hatırlatmalar da durur.
- Yolculukta ikamet yerinizden yaklaşık 90 km uzaklaşınca bilgi kartı görünür.
- Bildirim sınırına yaklaştığınızda sizi önceden uyarıyoruz.
```

#### 0.30.1

Yayındaki önceki sürüm 0.28.2 (ilk App Store sürümü). Konum değişikliği bildirimi Android'e özgü olduğu için yok.

```
- Ana ekranda her vaktin giriş saati yazıyor; kıldığınız vakitler bir zincirle birbirine bağlanıyor.
- "Konumunuz güncellendi" gibi kısa mesajlar iPhone'da da görünüyor.
- VoiceOver düğmelerin adını ve durumunu okuyor.
- Hata ekranı ve bazı düğmeler daha okunaklı.
- Paylaştığınız hata kayıtlarında konumunuz gizleniyor.
- Yazım ve metin hataları giderildi.
```
