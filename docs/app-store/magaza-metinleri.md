# Mağaza kayıt metinleri (App Store + Google Play)

> Bu dosya App Store Connect'e girilecek metinlerin **tek doğru kaynağıdır**. Değişiklik
> yaparken karakter sınırlarına dikkat edin — Apple sınırı aşan metni kaydetmez.
>
> **Doğruluk kuralı (App Review 2.3.1):** burada yazan her cümle iOS'ta GERÇEKTEN
> çalışmalı. Android'e özgü özellikler (ana ekran widget'ları, geri sayım bildirimleri,
> kendi müziğini bildirim sesi yapma, Play Store içi güncelleme) bu metinlerde
> **GEÇMEZ** — Apple yanlış vaadi reddeder.

## Alanlar

| Alan | Sınır | Değer |
|---|---|---|
| Ad (Name) | 30 | `Namaz Akışı` |
| Alt başlık (Subtitle) | 30 | `Vakit takibi ve namaz muhafızı` |
| Birincil kategori | — | Referans (Reference) |
| İkincil kategori | — | Yaşam Tarzı (Lifestyle) |
| Telif (Copyright) | — | `2026 Furkan IŞIKAY` |

### Anahtar kelimeler (100 karakter, virgülle, boşluksuz)

```
namaz,vakit,ezan,kıble,kaza,imsak,iftar,sahur,oruç,hatırlatma,alarm,çevrimdışı,takvim
```

(84 karakter. Uygulama adında geçen sözcükleri tekrar etmeye gerek yok — Apple
zaten ad ve alt başlıktaki kelimeleri indeksler.)

### Promosyon metni (170 karakter — yayındayken güncellenebilir)

```
Namaz vakitlerini internetsiz hesaplar, vakit çıkmadan önce giderek artan
hatırlatmalarla sizi namaza çağırır. Reklam yok, takip yok, tüm veriler
telefonunuzda kalır.
```

### Açıklama (4000 karakter)

```
Namaz Akışı, namaz vakitlerinizi takip etmenizi ve vakti kaçırmamanızı sağlayan,
tamamen çevrimdışı çalışan bir ibadet asistanıdır.

İnternet bağlantısı gerektirmez. Vakitler, bulunduğunuz konumun koordinatlarından
astronomik olarak hesaplanır (Diyanet ile uyumlu yöntem). Hiçbir veriniz sunucuya
gönderilmez; namaz kayıtlarınız, ayarlarınız ve konumunuz yalnızca telefonunuzda
kalır.

NAMAZ MUHAFIZI
Sıradan bir alarm değil. Vakit ilerledikçe tonu sertleşen dört kademeli bir
hatırlatma sistemi: nazik hatırlatma, uyarı, sert uyarı ve acil. Her vakit için
ayrı ayrı ayarlanır.

• Hatırlatmaların vaktin sonuna doğru mu yoksa vakit girer girmez mi başlayacağını
  seçebilirsiniz.
• Her adımın zamanını ve tekrar sıklığını kendiniz belirleyebilir, dilediğiniz adımı
  kapatabilirsiniz.
• Hazır yoğunluklar (Hafif, Dengeli, Israrcı) tek dokunuşla hepsini ayarlar.
• Sesli anons: hatırlatma, telefonunuzun Türkçe sesiyle konuşarak gelir. Metni
  kendiniz yazabilirsiniz. İnternet gerekmez.
• Zaman şeridi, seçtiğiniz ayarın o gün hangi saatlerde sizi uyaracağını gösterir.

VAKİT TAKİBİ
• Bir sonraki vakte kalan süre canlı geri sayımla.
• Konumunuz değiştiğinde vakitler kendiliğinden güncellenir.
• Kerahat vakitleri ana ekranda belirtilir.
• Namaz vakitlerini telefonunuzun takvimine etkinlik olarak ekleyebilirsiniz.

KIBLE PUSULASI
Cihazınızın sensörleriyle Kâbe yönünü anlık gösterir.

KAZA DEFTERİ
Kılınmayan namazlar otomatik tespit edilir ve kaza çetelesi tutulur. Geçmişe dönük
kayıt girebilir, kıldıkça düşebilirsiniz.

İSTİKRAR VE MOTİVASYON
• Seri sistemi ibadet devamlılığınızı görselleştirir.
• Bir günü kaçırdığınızda seriyi kurtarma imkânı.
• Rozetler, seviyeler ve haftalık istatistikler.

RAMAZAN
İftar ve sahura kalan süre ana ekranda; sahur için ayrı tema.

GİZLİLİK
• Hesap açmanız gerekmez.
• Reklam yok, izleme yok, analitik yok.
• Konumunuz yalnızca vakit hesabı için kullanılır ve telefonunuzdan çıkmaz.
• Verilerinizi şifreli bir dosyaya yedekleyip başka bir cihaza taşıyabilirsiniz.

AÇIK KAYNAK
Namaz Akışı bir sadaka-i cariye niyetiyle geliştirilmiştir ve daima ücretsizdir.
Kaynak kodları GNU GPLv3 lisansıyla herkese açıktır:
https://github.com/furkanisikay/namazakisi
```

### Sürüm notları — "Neler Yeni" (ilk sürüm)

```
Namaz Akışı'nın iPhone'daki ilk sürümü.

• Çevrimdışı namaz vakti hesabı ve canlı geri sayım
• Dört kademeli Namaz Muhafızı; sesli anons telefonunuzun Türkçe sesiyle konuşur
• Kıble pusulası, kaza defteri, seri takibi ve rozetler
• Ramazan için iftar ve sahur sayacı
• Reklamsız, hesapsız, tamamen cihazınızda
```

## Zorunlu adresler

| Alan | Değer | Durum |
|---|---|---|
| Destek adresi (Support URL) | `https://github.com/furkanisikay/namazakisi/issues` | Hazır |
| Gizlilik politikası (Privacy Policy URL) | — | **EKSİK — yayımlanmalı** |
| Pazarlama adresi (Marketing URL, opsiyonel) | `https://github.com/furkanisikay/namazakisi` | Hazır |

## App Privacy (veri toplama beyanı)

Beyan: **"Data Not Collected"** — uygulama hiçbir veri toplamıyor.

Gerekçe (Apple sorarsa): konum yalnızca cihazda vakit hesabı için kullanılıyor,
uygulamadan hiçbir yere gönderilmiyor; analitik/izleme SDK'sı yok; hesap yok;
tanı e-postası ancak kullanıcı düğmeye basarsa ve içeriği ekranda gösterildikten
sonra açılıyor (kişisel ibadet verisi içermez).

**DİKKAT — tek ağ çağrısı:** manuel konum seçiminde il/ilçe listesi
`turkiyeapi.dev` adresinden çekiliyor (`TurkiyeKonumServisi`). Bu istek kullanıcı
verisi GÖNDERMEZ, yalnız şehir listesi indirir ve çevrimdışı yedeği vardır. Veri
toplama beyanını etkilemez.

## Yaş derecelendirmesi

Tüm sorulara "Yok / Hiçbiri". İbadet içeriği Apple'ın "Horror/Fear Themes" veya
"Mature/Suggestive" başlıklarına girmez. Beklenen sonuç: **4+**.

## Ekran görüntüleri (iPhone'dan çekilmeli)

Apple iki boyut istiyor: **6.9"** (iPhone 17 Pro Max vb.) ve **6.5"**.
Önerilen sıra:

1. Ana ekran — geri sayım ve vakit listesi görünsün
2. Muhafız ayarları — bir vakit açık, **zaman şeridi görünür**
3. Adım detayı — sesli anons metni ve "Dinle"
4. Seri sekmesi
5. Kıble pusulası

## Kapsam dışı (bilinçli — iOS'ta yok, metinlerde GEÇMEZ)

- Ana ekran widget'ları (yalnız Android)
- Native geri sayım bildirimleri (iftar/sahur/vakit — yalnız Android)
- Bildirim sesi olarak kendi müziğini seçme (iOS'ta sistem seçici yok)
- Uygulama içi güncelleme teklifi (Play Core'a özgü)
- Sessiz moddayken duyulan acil uyarı (iOS'ta AlarmKit ile gelecek — Faz 3)

---

# Google Play kayıt metinleri

> Play **Android**'dir: App Store metninde bilinçli olarak geçmeyen widget, akıllı
> konum takibi ve uygulama içi güncelleme burada **geçer**. `scripts/play-magaza.js`
> aşağıdaki üç bloğu birebir okur — başlıkları değiştirmeyin.

#### Play — uygulama adı

```
Namaz Akışı
```

#### Play — kısa açıklama

```
Vakit çıkmadan uyaran namaz muhafızı, kıble ve kaza defteri. Çevrimdışı.
```

#### Play — tam açıklama

```
Namaz Akışı, namaz vakitlerinizi takip etmenizi ve vakti kaçırmamanızı sağlayan, tamamen çevrimdışı çalışan bir ibadet asistanıdır.

İnternet bağlantısı gerektirmez. Vakitler, bulunduğunuz konumun koordinatlarından astronomik olarak hesaplanır. Hiçbir veriniz sunucuya gönderilmez; namaz kayıtlarınız, ayarlarınız ve konumunuz yalnızca telefonunuzda kalır.

★ NAMAZ MUHAFIZI
Sıradan bir alarm değil. Vakit ilerledikçe tonu sertleşen dört kademeli bir hatırlatma sistemi: nazik hatırlatma, uyarı, sert uyarı ve acil. Her vakit için ayrı ayrı ayarlanır.

• Hatırlatmaların vaktin sonuna doğru mu yoksa vakit girer girmez mi başlayacağını seçebilirsiniz.
• Her adımın zamanını ve tekrar sıklığını kendiniz belirleyebilir, dilediğiniz adımı kapatabilirsiniz.
• Hazır yoğunluklar (Hafif, Dengeli, Israrcı) tek dokunuşla hepsini ayarlar.
• Sesli anons: hatırlatma, telefonunuzun Türkçe sesiyle konuşarak gelir. Metni kendiniz yazabilirsiniz. İnternet gerekmez.
• Bildirim sesini kendi müziğinizden seçebilirsiniz.
• Zaman şeridi, seçtiğiniz ayarın o gün hangi saatlerde sizi uyaracağını gösterir.

★ VAKİT TAKİBİ
• Bir sonraki vakte kalan süre canlı geri sayımla.
• Ana ekran widget'ı ile vakitler kilit ekranınızda.
• Akıllı konum takibi: şehir değiştirdiğinizde vakitler kendiliğinden güncellenir, pil tüketmez.
• Kerahat vakitleri ana ekranda belirtilir.
• Namaz vakitlerini telefonunuzun takvimine etkinlik olarak ekleyebilirsiniz.
• Cuma namazı için, öğle vakti girmeden önce ayrı hatırlatma.

★ KIBLE PUSULASI
Cihazınızın sensörleriyle Kâbe yönünü anlık gösterir.

★ KAZA DEFTERİ
Kılınmayan namazlar otomatik tespit edilir ve kaza çetelesi tutulur. Geçmişe dönük kayıt girebilir, kıldıkça düşebilirsiniz.

★ İSTİKRAR VE MOTİVASYON
• Seri sistemi ibadet devamlılığınızı görselleştirir.
• Bir günü kaçırdığınızda seriyi kurtarma imkânı.
• Rozetler, seviyeler ve haftalık istatistikler.

★ RAMAZAN
İftar ve sahura kalan süre ana ekranda; sahur için ayrı tema.

★ GİZLİLİK
• Hesap açmanız gerekmez.
• Reklam yok, izleme yok, analitik yok.
• Konumunuz yalnızca vakit hesabı için kullanılır ve telefonunuzdan çıkmaz.
• Verilerinizi şifreli bir dosyaya yedekleyip başka bir cihaza taşıyabilirsiniz.

★ AÇIK KAYNAK
Namaz Akışı bir sadaka-i cariye niyetiyle geliştirilmiştir ve daima ücretsizdir. Kaynak kodları GNU GPLv3 lisansıyla herkese açıktır:
https://github.com/furkanisikay/namazakisi
```
