# Tasarım referansları

Onaylanmış görsel tasarımların **çalışan** referansları. Bunlar dokümantasyon
değil, **ölçü kaynağıdır**: uygulama bir referanstan saptığında hangisinin doğru
olduğu tartışılmaz — referans doğrudur.

Tarayıcıda açıp inceleyin; animasyonlu olanlarda "Açılışı yeniden oynat"
düğmesi vardır.

| Dosya | Ekran | Durum |
|---|---|---|
| `2026-07-29-seri-sekmesi-takimyildizi-referans.html` | İstatistikler → Seri sekmesi | Onaylandı, uygulanacak |

## Neden HTML olarak saklanıyor

React Native'de bir tasarımı "gözle karşılaştırmak" için çalıştırmak gerekir;
statik bir ekran görüntüsü hareketi, faz farklarını ve zamanlamayı taşımaz.
Bu dosyalar kendi kendine yeter (tek dosya, dış bağımlılık yok) ve yıllar sonra
da açılır.

**Bu dosyalar uygulama koduna dahil DEĞİLDİR** — Metro paketlemez, APK'ya girmez.
Yalnız `docs/` altında referans olarak yaşarlar.

## Değiştirme kuralı

Uygulama ile referans arasında fark oluşursa **önce referansı güncelleyin, sonra
kodu** — tersi, referansı sessizce yalancı hale getirir ve bir sonraki geliştirici
yanlış şeye bakar.
