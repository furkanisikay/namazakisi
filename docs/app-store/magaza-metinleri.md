# Mağaza kayıt metinleri (App Store + Google Play)

> Bu dosya App Store Connect'e girilecek metinlerin **tek doğru kaynağıdır**. Değişiklik
> yaparken karakter sınırlarına dikkat edin — Apple sınırı aşan metni kaydetmez.
>
> **Doğruluk kuralı (App Review 2.3.1):** burada yazan her cümle iOS'ta GERÇEKTEN
> çalışmalı. Android'e özgü özellikler (ana ekran widget'ları, geri sayım bildirimleri,
> kendi müziğini bildirim sesi yapma, Play Store içi güncelleme) bu metinlerde
> **GEÇMEZ** — Apple yanlış vaadi reddeder.

## Alanlar

`scripts/app-store-surum.js diller` aşağıdaki `#### App Store — …` bloklarını birebir okur (başlıkları değiştirmeyin); öteki diller `docs/app-store/app-store-kayitlari/<ASC dili>.json`.

| Alan | Sınır |
|---|---|
| Ad (Name) | 30 |
| Alt başlık (Subtitle) | 30 |
| Anahtar kelimeler | 100, virgülle, boşluksuz |
| Promosyon metni | 170 (yayındayken güncellenebilir) |
| Açıklama | 4000 |
| Birincil kategori | Referans (Reference) |
| İkincil kategori | Yaşam Tarzı (Lifestyle) |
| Telif (Copyright) | `2026 Furkan IŞIKAY` |

#### App Store — ad

```
Namaz Akışı: Namaz Vakti
```

#### App Store — alt başlık

```
Reklamsız hatırlatıcı ve kıble
```

#### App Store — anahtar kelimeler

```
ezan,vakit,kıble,kaza,imsak,iftar,sahur,oruç,hatırlatma,alarm,internetsiz,diyanet,tesbih,ayet,cami
```

(Ad ve alt başlıktaki sözcükleri tekrar etmeye gerek yok; Apple onları zaten indeksler.)

#### App Store — promosyon metni

```
Vakti kaçırmamanız için hatırlatır, vakit daraldıkça ısrarlı olur. Ücretsiz, reklamsız, internetsiz ve 78 dilde. Verileriniz telefonunuzda kalır.
```

#### App Store — açıklama

```
Gün koşturmacayla geçerken vaktin girdiğini fark etmemek ya da ezanı duyup "birazdan kılarım" deyip unutmak çoğumuzun başına geliyor. Namaz Akışı bu anlar için hazırlandı. Vakit girince haber verir, vakit daraldıkça sizi daha ısrarla çağırır ve namazı gününüzün içine yerleştirmenize yardım eder. Tamamen ücretsizdir, reklam içermez ve internet olmadan çalışır.

BİLDİRİMLERE ALIŞTIYSANIZ
Tek bir bildirim kolayca kaydırılıp geçilir. Namaz Muhafızı her vakit için birden altıya kadar hatırlatma kurar. Vakit daraldıkça hatırlatmalar sıklaşır, tonu da sertleşir. iOS 26 ve sonrasında istediğiniz adımda gerçek alarm çalar. Hatırlatma sesini uygulamanın seslerinden seçebilir ya da kendi ses dosyanızı ekleyebilirsiniz. "Kıldım" dediğinizde o vaktin hatırlatmaları susar.

GÜNÜNÜZ YOĞUNSA
Takviminizdeki bir toplantı vaktin sonuna denk geliyorsa uygulama toplantıdan önce kılmanızı hatırlatır. Cuma günü ve camide kılmak istediğiniz vakitlerde, camiye yürüme süreniz kadar önce haber verir. Yatsıyı kılmadıysanız yatış saatinizden önce uyarır.

CAMİDE TELEFONUNUZ ÇALMASIN
Kısayollar ile bir kez kurduğunuz Namaz odağı, camiye vardığınızda iPhone'unuzu sessize alır, ayrılınca eski hâline döndürür.

YOLDA VE YURT DIŞINDA
Vakitler bulunduğunuz yerin koordinatlarından, o ülkenin camilerinin uyduğu takvime göre hesaplanır. Türkiye'de Diyanet'in yöntemi kullanılır. Başka bir ülkeye gittiğinizde uygulama oranın takvimini önerir, siz onaylamadan yöntem değişmez. Kıbleyi pusulayla ya da kamera görünümüyle bulursunuz. Bunların hiçbiri internet gerektirmez.

KAZA BORCUNUZ GÖZÜNÜZÜ KORKUTUYORSA
Sihirbaz kaza borcunuzu hesaplar. Bir farzı kıldığınızda uygulama yanına bir kaza kılmanızı önerir, tek dokunuşla defterden düşersiniz. İsterseniz kılınmayan farzlar namaz günü bitince deftere kendiliğinden eklenir.

DÜZEN KURMAKTA ZORLANIYORSANIZ
Tam kıldığınız her gün serinizi bir gün uzatır. Uzun bir seri bir gün koparsa iki gün tam kılarak geri alırsınız, tek bir aksak gün emeğinizi silmez. İstatistik ekranı günlük, haftalık ve aylık dökümü gösterir.

GÜNE BİR AYETLE BAŞLAYIN
Her imsakta yenilenen bir ayet ve meali ana ekran ve kilit ekranı widget'ında durur.

KENDİ DİLİNİZDE
Uygulama 78 dilde kullanılabilir. Ekranlar ve bildirimler seçtiğiniz dilde çalışır. Arapça, Urduca ve Farsça gibi dillerde arayüz sağdan sola döner.

APPLE WATCH VE iPAD
• Apple Watch'ta kalan süreyi görür, bilekten "Kıldım" der, kıbleyi bulur ve tesbih çekersiniz. Sabah alarmı yalnız bileğinizi titretebilir.
• iPad'de geniş düzen. Telefonunuzla tabletiniz ev ağınızda "Kıldım" bilgisini birbirine iletir.
• Evdeki Android TV'ye konumunuzu kare kodla gönderin, vakitler büyük ekranda görünsün.

VERİLERİNİZ SİZDE KALIR
Hesap açmanız gerekmez. Uygulamada reklam, izleme ya da analitik yok. Konumunuz yalnız vakit ve kıble hesabında kullanılır ve bize ulaşmaz.

AÇIK KAYNAK
Namaz Akışı'nı sadaka-i cariye niyetiyle geliştiriyorum. Uygulama ücretsiz, kaynak kodları GNU GPLv3 lisansıyla herkese açık:
https://github.com/furkanisikay/namazakisi
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

**Wear OS saat kıblesi (yalnız Play):** telefon, kullanıcının kendi Wear OS saatine
Data Layer üzerinden 1 ondalığa yuvarlanmış (≈11 km) konum gönderir; geliştirici sunucusu yok (Bluetooth bağlı değilken Data Layer Google bulutu üzerinden eşitleyebilir),
saat konum izni istemez. Apple Watch'a konum GİTMEZ (orada kıble yok) → App Store
beyanı değişmez. Play Data Safety: Google'ın "kullanıcının kendi cihazları arasında,
geliştiriciye ulaşmadan" aktarımı "paylaşım/toplama" saymadığını sahibin Play Console
yardım metniyle bir kez doğrulaması önerilir (risk, karar değil).

**DİKKAT — tek ağ çağrısı:** manuel konum seçiminde il/ilçe listesi
`turkiyeapi.dev` adresinden çekiliyor (`TurkiyeKonumServisi`). Bu istek kullanıcı
verisi GÖNDERMEZ, yalnız şehir listesi indirir ve çevrimdışı yedeği vardır. Veri
toplama beyanını etkilemez.

**Cihazlar arası eşitleme (issue #288) — sağlayıcı ETKİNLEŞTİRİLDİĞİNDE yeniden
değerlendirin.** Özellik isteğe bağlıdır ve varsayılan kapalıdır; veri kullanıcının
KENDİ bulut alanına (Drive `appDataFolder` / iCloud) kullanıcı parolasından türetilen
anahtarla **uçtan uca şifreli** gider, geliştiricinin sunucusu yoktur ve geliştirici
içeriği okuyamaz. Ayarlar ve konum gönderilmez. **Android'de Google Drive sağlayıcısı
ARTIK ETKİN** (yerleşik Authorization API; Google Play hizmetleri olan her cihazda
kart görünür) → Play Data Safety beyanı bu sürüm yayımlanmadan ÖNCE gözden geçirilmeli.
iCloud hâlâ bayrak arkasında (iOS beyanı değişmez). Değerlendirme:
- **Apple App Privacy:** Apple, geliştiricinin erişemediği uçtan uca şifreli veriyi
  "toplanan veri" saymayabilir; beyanı yine de ASC'de gözden geçirin (API'den
  yazılamaz, yalnız web arayüzü).
- **Google Play Data Safety:** "Veri aktarımı şifreli" + kullanıcının kendi Google
  hesabına yazılan uçtan uca şifreli içerik; Google'ın "end-to-end encrypted" istisnasının
  bu kullanıma uyduğunu sahibin Play Console yardım metniyle doğrulaması gerekir.
  Google Play hizmetlerinin onay ekranı `drive.appdata` kapsamını gösterir (kapsam
  "hassas" değildir, Google doğrulaması gerekmez; onay ekranı yayında).

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

## Kapsam dışı (bilinçli — iOS'ta yok, App Store metinlerinde GEÇMEZ)

- Kendiliğinden açılan Namaz modu ve Rahatsız Etmeyin (iPhone'da yerine Odak + Kısayollar)
- Wear OS saat, Google Drive eşitlemesi, uygulama içi güncelleme teklifi (Play Core)
- iCloud eşitlemesi (kodda var, kullanıcıya kapalı)
- iOS 26 öncesinde gerçek alarm (AlarmKit yok)

---

# Google Play kayıt metinleri

> Play **Android**'dir: App Store metninde bilinçli olarak geçmeyen widget, akıllı
> konum takibi ve uygulama içi güncelleme burada **geçer**. `scripts/play-magaza.js`
> aşağıdaki üç bloğu birebir okur — başlıkları değiştirmeyin.

#### Play — uygulama adı

```
Namaz Akışı: Namaz Vakti
```

#### Play — kısa açıklama

```
Vakti kaçırmamanız için hatırlatır. Ücretsiz, reklamsız, internetsiz, 78 dilde.
```

#### Play — tam açıklama

```
Gün koşturmacayla geçerken vaktin girdiğini fark etmemek ya da ezanı duyup "birazdan kılarım" deyip unutmak çoğumuzun başına geliyor. Namaz Akışı bu anlar için hazırlandı. Vakit girince haber verir, vakit daraldıkça sizi daha ısrarla çağırır ve namazı gününüzün içine yerleştirmenize yardım eder. Tamamen ücretsizdir, reklam içermez ve internet olmadan çalışır.

BİLDİRİMLERE ALIŞTIYSANIZ
Tek bir bildirim kolayca kaydırılıp geçilir. Namaz Muhafızı her vakit için birden altıya kadar hatırlatma kurar. Vakit daraldıkça hatırlatmalar sıklaşır, tonu da sertleşir. İsterseniz istediğiniz adımda telefonunuzun gerçek alarmı çalar, telefon sessizdeyken de duyulur. Hatırlatmayı telefonunuzun sesiyle okutabilirsiniz. Bildirimden tek dokunuşla "Kıldım" dediğinizde o vaktin hatırlatmaları susar.

GÜNÜNÜZ YOĞUNSA
Takviminizdeki bir toplantı vaktin sonuna denk geliyorsa uygulama toplantıdan önce kılmanızı hatırlatır. Cuma günü ve camide kılmak istediğiniz vakitlerde, camiye yürüme süreniz kadar önce haber verir. Yatsıyı kılmadıysanız yatış saatinizden önce uyarır.

CAMİDE TELEFONUNUZ ÇALMASIN
Vakte yakın bir camide birkaç dakika kaldığınızda Namaz modu kendiliğinden açılır. Emin olunamayan durumlarda önce size sorulur. Namazda aramaların ve bildirimlerin ne olacağını telefonunuzun ayarlarında siz belirlersiniz.

YOLDA VE YURT DIŞINDA
Vakitler bulunduğunuz yerin koordinatlarından, o ülkenin camilerinin uyduğu takvime göre hesaplanır. Türkiye'de Diyanet'in yöntemi kullanılır. Başka bir ülkeye gittiğinizde uygulama oranın takvimini önerir, siz onaylamadan yöntem değişmez. Kıbleyi pusulayla ya da kamera görünümüyle bulursunuz. Kamerada Kâbe işareti kıble yönünde belirir. Bunların hiçbiri internet gerektirmez.

KAZA BORCUNUZ GÖZÜNÜZÜ KORKUTUYORSA
Sihirbaz kaza borcunuzu hesaplar. Bir farzı kıldığınızda uygulama yanına bir kaza kılmanızı önerir, tek dokunuşla defterden düşersiniz. Borç böylece her gün biraz azalır. İsterseniz kılınmayan farzlar namaz günü bitince deftere kendiliğinden eklenir.

DÜZEN KURMAKTA ZORLANIYORSANIZ
Tam kıldığınız her gün serinizi bir gün uzatır. Gün bitmeden eksik vaktiniz varsa kalan süreyi büyük bir geri sayımla görürsünüz. Uzun bir seri bir gün koparsa iki gün tam kılarak geri alırsınız, tek bir aksak gün emeğinizi silmez. İstatistik ekranı günlük, haftalık ve aylık dökümü gösterir.

GÜNE BİR AYETLE BAŞLAYIN
Her imsakta yenilenen bir ayet ve meali ana ekran widget'ında durur. İsterseniz ayet kilit ekranınızın duvar kâğıdı olur. Zemini, yazı tipini ve süsü siz seçersiniz, kendi fotoğrafınızı da kullanabilirsiniz.

KENDİ DİLİNİZDE
Uygulama 78 dilde kullanılabilir. Ekranlar, bildirimler ve sesli okuma seçtiğiniz dilde çalışır. Arapça, Urduca ve Farsça gibi dillerde arayüz sağdan sola döner.

SAAT, TABLET VE TELEVİZYON
• Wear OS saatinizde vakti ve kalan süreyi kadranda görür, bilekten "Kıldım" dersiniz.
• Evdeki Android TV'de vakitler büyük ekranda sizin şehrinize göre görünür.
• Kayıtlarınızı kendi Google Drive alanınızda, sizin parolanızla şifreleyerek tabletinizle eşitleyebilirsiniz.

VERİLERİNİZ SİZDE KALIR
Hesap açmanız gerekmez. Uygulamada reklam, izleme ya da analitik yok. Konumunuz yalnız vakit ve kıble hesabında kullanılır ve bize ulaşmaz. Eşitlemeyi açarsanız verileriniz telefondan çıkmadan önce sizin parolanızla şifrelenir.

AÇIK KAYNAK
Namaz Akışı'nı sadaka-i cariye niyetiyle geliştiriyorum. Uygulama ücretsiz, kaynak kodları GNU GPLv3 lisansıyla herkese açık:
https://github.com/furkanisikay/namazakisi
```
