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
Vakitleri internetsiz hesaplar ve vakit daraldıkça sertleşen hatırlatmalarla sizi namaza çağırır. Reklam içermez, verileriniz telefonunuzda kalır.
```

### Açıklama (4000 karakter)

```
Namaz Akışı namaz vakitlerini takip etmenize ve vakti kaçırmamanıza yardım eden bir ibadet asistanıdır. İnternet bağlantısı olmadan çalışır.

Vakitleri bulunduğunuz yerin koordinatlarından astronomik olarak hesaplar (Diyanet ile uyumlu yöntem). Namaz kayıtlarınız, ayarlarınız ve konumunuz telefonunuzda kalır; uygulama hiçbir veriyi sunucuya göndermez.

NAMAZ MUHAFIZI
Muhafız sizi dört kademede uyarır: nazik hatırlatma, uyarı, sert uyarı ve acil. Vakit daraldıkça ton sertleşir. Her vaktin ayarını ayrı tutarsınız.

• Hatırlatmaların vaktin sonuna doğru mu, vakit girer girmez mi başlayacağını seçersiniz.
• Her adımın kaç dakika kala başlayacağını ve ne sıklıkla tekrarlanacağını belirler, istemediğiniz adımı kapatırsınız.
• Hafif, Normal ve Yoğun hazır ayarlarından biri tek dokunuşla bütün vakitleri düzenler.
• Sesli anonsu telefonunuzun Türkçe sesi okur. Metni kendiniz yazabilirsiniz ve anons için internet gerekmez.
• Zaman şeridi, seçtiğiniz ayarın o gün sizi hangi saatlerde uyaracağını gösterir.

VAKİT TAKİBİ
• Ana ekran bir sonraki vakte kalan süreyi saniye saniye sayar.
• Konumu GPS ile alabilir ya da şehrinizi elle seçebilirsiniz.
• Kerahat vakitlerinde ana ekran sizi uyarır.
• Namaz vakitlerini telefonunuzun takvimine etkinlik olarak ekleyebilirsiniz.

KIBLE PUSULASI
Pusula, cihazınızın sensörleriyle Kâbe yönünü gösterir.

KAZA DEFTERİ
Uygulama kılınmayan namazları tespit edip kaza çetelesine ekler. Geçmişe dönük kayıt girebilir, kıldığınız kazayı çeteleden düşebilirsiniz.

SERİ VE İSTATİSTİK
Tam kıldığınız her gün serinizi bir gün uzatır. 7 günü aşan bir seriniz koparsa, ardından 2 gün tam kılarak seriyi kurtarabilirsiniz. Kıldıkça puan toplar, seviye atlar ve rozet kazanırsınız. İstatistik ekranı günlük, haftalık ve aylık dökümü gösterir.

GİZLİLİK
Hesap açmanız gerekmez. Uygulamada reklam, izleme ya da analitik bulunmaz. Konumunuzu yalnızca vakit hesabı için kullanır ve telefonunuzdan dışarı çıkarmaz. Verilerinizi şifreli bir dosyaya yedekleyip başka bir cihaza taşıyabilirsiniz.

AÇIK KAYNAK
Namaz Akışı'nı sadaka-i cariye niyetiyle geliştiriyorum. Uygulama ücretsizdir ve kaynak kodları GNU GPLv3 lisansıyla herkese açıktır:
https://github.com/furkanisikay/namazakisi
```

### Sürüm notları — "Neler Yeni" (ilk sürüm)

```
Namaz Akışı'nın iPhone'daki ilk sürümü.

• Vakitleri internetsiz hesaplar, bir sonraki vakte kalan süreyi canlı sayar.
• Namaz Muhafızı dört kademede uyarır; sesli anonsu telefonunuzun Türkçe sesi okur.
• Kıble pusulası, kaza defteri, seri takibi ve rozetler.
• Hesap istemez, reklam göstermez.
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
İnternetsiz namaz vakti, kıble ve kaza defteri. Muhafız vakitten önce uyarır.
```

#### Play — tam açıklama

```
Namaz Akışı namaz vakitlerini takip etmenize ve vakti kaçırmamanıza yardım eden bir ibadet asistanıdır. İnternet bağlantısı olmadan çalışır.

Vakitleri bulunduğunuz yerin koordinatlarından astronomik olarak hesaplar (Diyanet ile uyumlu yöntem). Namaz kayıtlarınız, ayarlarınız ve konumunuz telefonunuzda kalır; uygulama hiçbir veriyi sunucuya göndermez.

NAMAZ MUHAFIZI
Muhafız sizi dört kademede uyarır: nazik hatırlatma, uyarı, sert uyarı ve acil. Vakit daraldıkça ton sertleşir. Her vaktin ayarını ayrı tutarsınız.

• Hatırlatmaların vaktin sonuna doğru mu, vakit girer girmez mi başlayacağını seçersiniz.
• Her adımın kaç dakika kala başlayacağını ve ne sıklıkla tekrarlanacağını belirler, istemediğiniz adımı kapatırsınız.
• Hafif, Normal ve Yoğun hazır ayarlarından biri tek dokunuşla bütün vakitleri düzenler.
• Sesli anonsu telefonunuzun Türkçe sesi okur. Metni kendiniz yazabilirsiniz ve anons için internet gerekmez.
• Bildirim sesini telefonunuzdaki seslerden seçebilirsiniz.
• Zaman şeridi, seçtiğiniz ayarın o gün sizi hangi saatlerde uyaracağını gösterir.

VAKİT TAKİBİ
• Ana ekran bir sonraki vakte kalan süreyi saniye saniye sayar.
• Ana ekran widget'ı vakitleri uygulamayı açmadan gösterir.
• Şehir değiştirdiğinizde uygulama vakitleri yeni konuma göre günceller. Konum takibi sürekli GPS yerine bölge sınırlarını izlediği için pili az harcar.
• Kerahat vakitlerinde ana ekran sizi uyarır.
• Cuma günleri, öğle vakti girmeden önce camiye yetişmeniz için ayrı bir hatırlatma kurabilirsiniz.
• Namaz vakitlerini telefonunuzun takvimine etkinlik olarak ekleyebilirsiniz.

KIBLE PUSULASI
Pusula, cihazınızın sensörleriyle Kâbe yönünü gösterir.

KAZA DEFTERİ
Uygulama kılınmayan namazları tespit edip kaza çetelesine ekler. Geçmişe dönük kayıt girebilir, kıldığınız kazayı çeteleden düşebilirsiniz.

SERİ VE İSTATİSTİK
Tam kıldığınız her gün serinizi bir gün uzatır. 7 günü aşan bir seriniz koparsa, ardından 2 gün tam kılarak seriyi kurtarabilirsiniz. Kıldıkça puan toplar, seviye atlar ve rozet kazanırsınız. İstatistik ekranı günlük, haftalık ve aylık dökümü gösterir.

RAMAZAN
İftar ve sahura kalan süreyi bildirimde geri sayımla gösterir.

GİZLİLİK
Hesap açmanız gerekmez. Uygulamada reklam, izleme ya da analitik bulunmaz. Konumunuzu yalnızca vakit hesabı için kullanır ve telefonunuzdan dışarı çıkarmaz. Verilerinizi şifreli bir dosyaya yedekleyip başka bir cihaza taşıyabilirsiniz.

AÇIK KAYNAK
Namaz Akışı'nı sadaka-i cariye niyetiyle geliştiriyorum. Uygulama ücretsizdir ve kaynak kodları GNU GPLv3 lisansıyla herkese açıktır:
https://github.com/furkanisikay/namazakisi
```
