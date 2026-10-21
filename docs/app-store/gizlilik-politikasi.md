---
title: Gizlilik Politikası — Namaz Akışı
---

# Gizlilik Politikası — Namaz Akışı

**Son güncelleme:** 20 Ekim 2026

Namaz Akışı, hiçbir kişisel verinizi toplamaz, saklamaz veya üçüncü taraflarla
paylaşmaz. Uygulamayı kullanmak için hesap açmanız gerekmez.

## Kısaca

- Verileriniz **yalnızca telefonunuzda** tutulur (isteğe bağlı cihazlar arası eşitlemeyi açarsanız, şifreli bir kopyası kendi bulut hesabınızda da durur).
- Reklam, izleme (tracking) ve analitik **yoktur**.
- Uygulama namaz vakitlerini **internetsiz** hesaplar.
- Kaynak kodları herkese açıktır; bu politikada yazanları kodda doğrulayabilirsiniz:
  <https://github.com/furkanisikay/namazakisi>

## Uygulamanın eriştiği bilgiler

### Konum

Namaz vakitleri bulunduğunuz yerin enlem ve boylamından hesaplanır. Konumunuz:

- yalnızca bu hesap için kullanılır,
- telefonunuzun içinde kalır, **hiçbir sunucuya gönderilmez**,
- Wear OS saat uygulamasını kullanıyorsanız, saatteki kıble pusulası için
  **yaklaşık** konumunuz (yaklaşık 11 km hassasiyetle yuvarlanmış enlem ve boylam)
  telefonunuzdan **yalnızca kendi saatinize**, Google'ın Wear OS veri eşitlemesiyle
  aktarılır (cihazlar Bluetooth ile bağlı değilken bu eşitleme Google'ın altyapısı
  üzerinden geçebilir); geliştiriciye ulaşmaz, saat konum izni istemez ve bu bilgi
  saatten de hiçbir yere gönderilmez,
- Apple Watch uygulamasını kullanıyorsanız, saatinize konumunuz **gönderilmez**;
  yalnızca hesaplanmış vakit saatleri, kıldığınız vakitler ve konumunuzun adı
  (ilçe/şehir) Apple'ın iPhone ile Apple Watch arasındaki eşitlemesiyle **yalnızca
  kendi saatinize** gider ve geliştiriciye ulaşmaz,
- Camideyim'i kullanıyorsanız, camide olduğunuz bilgisi (caminin adı, durumun bitiş
  saati ve "Camide misiniz?" sorusu) ile Namaz modunun bitiş saati de aynı yolla
  **yalnızca kendi saatinize** gider; saatten verdiğiniz cevap ("Burası cami değil")
  yalnız telefonunuza döner. Bu bilgiler de geliştiriciye ulaşmaz,
- dilerseniz hiç verilmeyebilir: konumu kapatıp şehrinizi elle seçebilirsiniz.

Konum izni vermezseniz uygulama çalışmaya devam eder.

### Takvim

Takvim izni yalnızca aşağıdaki iki özellikten birini siz açtığınızda istenir:

- **Namaz vakitlerini takvime ekleme:** izin yalnızca uygulamanın kendi namaz
  etkinliklerini oluşturmak ve silmek için kullanılır.
- **Takvim çakışması uyarısı** (varsayılan kapalı): açarken ekranda ayrıca
  onayınız alınır. Takviminizdeki etkinliklerin başlangıç ve bitiş saatleri,
  "tüm gün" ve "meşgul" bilgisi bir namaz vaktiyle çakışıp çakışmadığını
  anlamak için **yalnızca telefonunuzda** okunur. Etkinlik adı, siz ayrıca
  açmadıkça bildirimde kullanılmaz. Adı göstermeyi açarsanız ad, bildirimin bir
  parçası olarak kilit ekranında ve bildirimleri aynalayan saat, bileklik ya da
  benzeri uygulamalarda da görünebilir; bu uygulamaların bildirimleri nasıl
  işlediği kendi gizlilik koşullarına bağlıdır. Uyarıyı sesli anons ya da
  gerçek alarm olarak duymayı seçerseniz anons yalnızca vakti söyler ("Takviminizdeki
  bir etkinlik öğle vaktine denk geliyor") ve alarm ekranı yalnızca vakti ve
  saatleri gösterir: etkinlik adı, ayar açık olsa bile, sesli anonsa ve alarm
  ekranına **hiçbir zaman** girmez. Anons sesi telefonunuzda üretilir.

Her iki durumda da takvim bilgileriniz **saklanmaz, yedeğe girmez ve hiçbir
yere gönderilmez**; uygulama bu bilgileri toplamaz ve kimseyle paylaşmaz.

### Bildirimler

Namaz vakti hatırlatmaları telefonunuzda oluşturulur ve telefonunuzda gösterilir.
Uzaktan bildirim (push) gönderilmez; bunun için bir sunucu ya da cihaz kimliği
kullanılmaz.

### Hareket ve pusula sensörleri

Kıble pusulası (telefonda ve Wear OS saatte), yönü göstermek için cihazın pusula
ve hareket sensörlerini kullanır. Bu veri anlık olarak ekranda kullanılır, kaydedilmez.

### Kamera

Kıble ekranının isteğe bağlı **Kamera** görünümü, Kâbe yönünü kamera görüntüsünün
üzerinde gösterir. Kamera izni yalnızca bu görünümü açtığınızda istenir. Görüntü
yalnızca ekranda gösterilir; fotoğraf ya da video **kaydedilmez**, telefonunuzdan
çıkmaz ve hiçbir yere gönderilmez. İzni vermezseniz kıble pusulası kamerasız çalışır.

Aynı izin, **Televizyonda gösterin** sayfasında televizyonunuzun ekranındaki kare kodu
okumak için de kullanılır. Kod telefonunuzun içinde çözülür; görüntü kaydedilmez ve hiçbir
yere gönderilmez.

### Televizyona konum aktarma (isteğe bağlı)

Evdeki Android TV'de vakitleri sizin konumunuza göre göstermek için telefonunuzun
konumunu (koordinat ve "Kadıköy, İstanbul" gibi yer adı) **evinizin Wi-Fi ağı içinde,
doğrudan televizyona** gönderebilirsiniz. Bu aktarım yalnızca siz televizyondaki kodu
okuttuğunuzda yapılır; arada sunucu yoktur, hesap açılmaz, veri internete çıkmaz.
Televizyon uygulaması yalnızca eşleştirme ekranı açıkken ve yalnızca evinizin yerel
ağında dinler, her seferinde yeni bir tek kullanımlık anahtar kullanır. Wi-Fi
kullanmak istemezseniz televizyona 7 haneli bir kodu kumandayla girebilirsiniz; bu yolda
hiçbir ağ kullanılmaz. iPhone ilk aktarımda "yerel ağ" izni sorar.

## İnternet kullanımı

Uygulama namaz vakitleri için internete **ihtiyaç duymaz**. İnternet yalnızca şu
iki durumda ve yalnızca bilgi **indirmek** için kullanılır:

1. **Şehir listesi:** Konumu elle seçerken il ve ilçe listesi `turkiyeapi.dev`
   adresinden indirilir. Bu istekte size ait hiçbir bilgi gönderilmez; liste
   ayrıca uygulamanın içinde çevrimdışı olarak da bulunur.
2. **Güncelleme kontrolü (yalnız Android):** Yeni sürüm olup olmadığı sorulur.
   iOS'ta güncellemeler App Store üzerinden gelir; uygulama böyle bir istek yapmaz.

## Verilerinizin saklanması

Namaz kayıtlarınız, kaza defteriniz, seriniz, rozetleriniz ve tüm ayarlarınız
telefonunuzun kendi depolama alanında tutulur. Uygulamayı silmeniz bu verileri de
siler.

**Yedekleme:** Verilerinizi bir yedek dosyasına aktarıp başka bir cihaza
taşıyabilirsiniz. Bu dosya siz nereye kaydederseniz oraya gider; uygulama onu
hiçbir yere yüklemez. Dosya bozulmaya karşı korunur ancak parola içermez ve
herkesin okuyabileceği bir anahtarla kodlanır; dosyayı ele geçiren biri içeriğini
okuyabilir. Bu yüzden onu yalnız güvendiğiniz bir yerde saklayın.

## Cihazlar arası eşitleme (isteğe bağlı)

Bu özellik **varsayılan olarak kapalıdır** ve yalnızca uygulamanın o sürümünde bir
eşitleme hizmeti etkinse görünür. Siz açarsanız:

- Namaz kayıtlarınız, kaza defteriniz, rozetleriniz ve bonus puanınız **sizin kendi**
  bulut hesabınıza (Android'de Google Drive'ın uygulamaya özel gizli klasörü
  `appDataFolder`, iPhone'da iCloud) yazılır. Bizim bir sunucumuz yoktur; veriler
  bize hiç gelmez.
- Veriler telefonunuzdan çıkmadan önce **yalnızca sizin bildiğiniz bir parolayla**
  şifrelenir (uçtan uca şifreleme). Ne biz ne de bulut hizmeti içeriği okuyabilir.
- Ayarlarınız ve **konumunuz eşitlenmez**; her cihazda ayrı kalır.
- Google Drive'da uygulama yalnızca kendi gizli klasörüne erişir (`drive.appdata`
  izni); diğer dosyalarınızı göremez. Google hesabınız telefonunuzdaki Google Play
  hizmetlerinin onay ekranıyla bağlanır; uygulama Google parolanızı görmez ve izni
  Google hesap ayarlarınızdan istediğiniz an geri alabilirsiniz.
- Parolanız yalnızca o cihazın güvenli anahtar deposunda tutulur ve yedeklere girmez.
  Parolanızı unutursanız buluttaki veri **kurtarılamaz**; cihazlarınızdaki kayıtlar
  yerinde kalır.
- Eşitlemeyi istediğiniz an kapatabilir, buluttaki eşitleme verisini de
  silebilirsiniz.

## Sorun bildirme

Uygulamada bir sorunla karşılaşırsanız tanı raporu göndermeyi seçebilirsiniz.
Bu tümüyle isteğe bağlıdır ve şöyle çalışır:

- Gönderilecek metin, göndermeden **önce ekranda size gösterilir**.
- Rapor; uygulama sürümü, cihaz modeli, işletim sistemi sürümü ve teknik kayıtları
  içerir. **Namaz kayıtlarınız ve kişisel verileriniz yer almaz.**
- Konum bilgisi **varsayılan olarak gizlenir**; açmayı seçerseniz yalnızca şehir
  düzeyinde (yaklaşık 11 km) yuvarlanarak eklenir.
- Rapor, telefonunuzun kendi e-posta uygulaması açılarak gönderilir. Otomatik
  gönderim yoktur.

## Çocuklar

Uygulama her yaştan kullanıcıya uygundur ve kimseden kişisel bilgi toplamadığı
için çocuklardan da veri toplamaz.

## Değişiklikler

Bu politika değişirse bu sayfadaki "Son güncelleme" tarihi yenilenir. Değişiklik
geçmişi, kaynak kodlarıyla birlikte herkese açık olarak izlenebilir.

## İletişim

Soru ve talepleriniz için: **support@furkanisikay.com**

Hata bildirimi ve öneri için:
<https://github.com/furkanisikay/namazakisi/issues>
