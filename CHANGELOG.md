# Değişiklik Günlüğü

Bu dosyada projenin tüm önemli değişiklikleri belgelenmiştir.

Format [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) standardına dayanmaktadır.
[Semantik Sürümleme](https://semver.org/lang/tr/) kullanılmaktadır.

## [0.52.0] - 2026-10-19

### Eklendi
- feat(saat)!: saat uyandırmasındaki "10 dk ertele" kaldırıldı — yalnız Kıldım / Kapat

## [0.51.0] - 2026-10-19

### Eklendi
- [muhafiz] gece sessizliğinde yatsı uyarıları sessizlik başlangıcına çapalanır
- [hatirlatma] mevcut kullanıcıya 'Daha az bildirim' önerisi; eski düzey ekranda dürüst
- [muhafiz] vakit başına düzey — Vakit çıkmadan sayfasında her vakte Hafif/Normal/Yoğun
- [kurulum] düzey adımına kartlar — Kıldım sorusu, sesli okuma (açık rıza), sabah alarmı, gece sessiz, cuma
- [muhafiz] gece sessiz saatler — gece başlangıcından imsağa muhafız uyarısı gelmez
- [muhafiz] varsayılan düzeyler tekrarsız (1/3/5), Normal'de titreşim; eski düzey tabloları göç için donduruldu

### Düzeltildi
- [muhafiz] gece sessizliği incelemesi — çapa anonsunda süre kalan dakika, akşam kesilmesi ekranda söylenir
- [muhafiz] çapalı yatsı uyarısı çapa dilinde — 'vakit çıkıyor' yok, acil kanal yok
- [hatirlatma] eski düzeyde önizleme gerçek adımları çizer; gece sessizliği servis nöbetçisi

## [0.50.0] - 2026-10-19

### Eklendi
- feat(muhafiz)!: "Ertele" tamamen kaldırıldı — yalnız "Kıldım" kalır

## [0.49.0] - 2026-10-19

### Eklendi
- [widget] yeşil klasik widget'lar geri geldi (Widget 2.0 yanında)

## [0.48.0] - 2026-10-19

### Eklendi
- [saat] kalan süre komplikasyonu yalnız süreyi gösterir; çıkış saati ve sıradaki namaz ayrı kaynak

## [0.47.1] - 2026-10-19

### Düzeltildi
- [muhafiz] kılınmışlık gösterilen namaz gününe yazılır; gün sonu yalnız kayıttan okur
- [hatirlatma] ton adları ekrandan kalktı, metinler kısaltıldı
- [hatirlatma] ham şablon, sesli rıza ve iOS bütçe kartı ekranda düzeltildi
- [metin] suçlayıcı nasslar ve korku dili hatırlatmalardan çıkarıldı
- [seri] gün tamamlanmışsa gün sonu hatırlatması kurulmaz

## [0.47.0] - 2026-10-19

### Eklendi
- [arayuz] görsel anlatı geri — sihirbaz sahneleri, canlı düzey önizlemesi, tek döngü kapısı

### Düzeltildi
- [arayuz] düzey önizlemesi sesli rıza yokken sesli nokta göstermez

## [0.46.0] - 2026-10-19

### Eklendi
- [ana-ekran] vakit kartı eski görünümüne döner, Kıldım dönüşerek ve kartta geri alınır

### Düzeltildi
- [ana-ekran] Kıldım düğmesi metni zemine göre ölçülür, geri alma etiketi durumu söyler

## [0.45.0] - 2026-10-18

### Eklendi
- [takvim] açıklamalı izin, bekleyen değişiklik bandı, "Takvime ekle" hareketi
- [konum] durum kartı + tek "Yenile"; mesafe ve koordinatlar Gelişmiş'te
- [kaza] sade kök — büyük kalan, vakit satırları, tek "Diğer" menüsü
- [kible] konum izni açıklamalı akıştan; ilk odakta diyalog açılmaz
- [sekmeler] Bugün · Kıble · Kaza · İlerleme · Ayarlar

### Düzeltildi
- [sade] Opus incelemesi — takvim izin akışı, bekleyen bant, Diğer geçişi, seri durumu, çapa
- [takvim] adım başlığı Yenile düğmesini düzleştirmesin; son aktarım Depolama'dan; aylık kare içeriği ortalar

### Değiştirildi
- [ana-ekran] Kıble kısayolu kalkınca kullanılmayan gezinme kancası silindi
- [metin] Yedek, Ramazan, Canlı sayaçlar, Görünüm, Tanı sadeleşti

## [0.44.0] - 2026-10-18

### Eklendi
- [neler-yeni] "Daha sade uygulama" duyurusu; hedef sayfalar yeni rotalara
- [ayarlar] tek Hatırlatmalar sayfası, görev gruplu Ayarlar kökü, Namazda sessiz
- [muhafiz] düzey seçici ortak kancada, vakit vakit ayar "Kendim ayarlayayım" katında
- [riza] sesli okuma ve gerçek alarm onayı tüm hatırlatmalar için tek
- [ana-ekran] tek durum alanı, dönüşen Kıldım, tek durum dili
- [kurulum] sihirbaz 5 adıma iner, temaya uyar, izni önce okur

### Düzeltildi
- [camideyim] master'ın "sessiz gelsin" düzeltmesi Namazda sessiz'e taşındı
- [sade] Opus incelemesi — Camilerim veri kaybı, kapatma öncesi seçim, rıza birleşimi
- [sade] Opus incelemesi — kerahat/muhafız, kurulum kaydı, Kılınmadı durumu
- [kurulum] adım sonucu VoiceOver'a da duyurulur

### Değiştirildi
- [metin] kalan "sesli anons" ve ham yer tutucu ekrandan kalktı
- [metin] ekranda teknik terim kalmasın — ton yerine sertlik, anons yerine sesli okuma

## [0.43.0] - 2026-10-18

### Eklendi
- [esitleme] Drive yetkisi yerleşik Google Authorization API'ye geçti

### Düzeltildi
- [esitleme] Drive yetkisi inceleme düzeltmeleri

### Değiştirildi
- [esitleme] Play hizmetleri sorgusu süreç başına bir kez

## [0.42.0] - 2026-10-18

### Eklendi
- [arayuz] ortak bileşenler ve hareket kitaplığı (sade tasarım, Dalga 1)
- [cihaz] cihaz durum katmanı ve küçük native köprüler

### Düzeltildi
- [izin] konum izni durum satırı açıklama adımından geçer; bildirim izni Android 12 ve öncesinde sistem ayarını açar
- [arayuz] geri al bandı modal içinden çağrılabilir (yerel host yığını), Android'de tek duyuru
- [izin] izin akışı ayrılınca bekleme zamanlayıcısı temizlenir, sistem diyaloğu açılmaz
- [cihaz] Samsung, Türkçe ses ve iCloud hesabı okunamazsa bilinmiyor (null) — yanlış uyarı/gizleme yok
- [kible] öne gelişte konum izni istenmez, yalnız okunur (izin penceresi döngüsü)
- [kible] pusula doğruluğu kararlı olmadan çizilmez; açılıştaki 0 okumaları ipucunu yakıp söndürmez
- [camideyim] sessiz gelsin açıklaması her zaman görünür ve ek hatırlatmaları da kapsar
- [cihaz] iOS Türkçe ses satırında sürüme göre değişen tam menü yolu yazılmaz
- [namaz-modu] üreticiye göre değişen menü adları yerine genel Rahatsız Etmeyin/mod ifadesi
- [alarm] AlarmKit desteklenmiyor/bilinmiyor iken sürüm iddiasız ve alarm ekranı vaatsiz metin
- [arayuz] geri al bandı hareket ayarı değişince takılmaz; cihaz alanları zorunlu
- [metin] "sen" dili, tekrarlanan başlıklar ve ölü süre etiketleri
- [kurulum] sihirbaz mevcut bildirim ve konum iznini okur
- [metin] Camideyim sessiz notu ve eşitleme engelleri önceden
- [ses] Türkçe ses indirme tek dokunuş, teheccüd alarm ses düzeyi ölçülür
- [kible] konum izni tek dokunuşla, kalibrasyon ipucu pusula doğruluğuna bağlı
- [metin] Namaz modu, otomasyon, bileklik ve takvim metinleri cihaza göre
- [canli] canlı sayaç metinleri cihazı ölçerek konuşur
- [alarm] sürüm ve izne göre doğru alarm/anons metinleri
- [neler-yeni] gerçek alarmı desteklemeyen iPhone'a alarm vaat etme

## [0.41.3] - 2026-10-18

### Düzeltildi
- [wear] kalan süre çubuksuz düz metin, güneş namaz sayılmaz, olay tetikli hareket

## [0.41.2] - 2026-10-18

## [0.41.1] - 2026-10-18

### Değiştirildi
- [neler-yeni] özellik başına tek duyuru ve sürümlü görülme kaydı

## [0.41.0] - 2026-10-18

### Eklendi
- [wear] bilekten Namaz modu, Camideyim, sessiz uyandırma ve saat anonsu
- [saat] saatten gelen komutlar ve saate Camideyim/Namaz modu durumu
- [wear] şarjdayken telefona devret, bilek jestleri, kıble titreşimi, telefonda açın
- [saat] telefonda Saat ayarları; uyandırma yedeği ve anons yeri üreticide
- [wear] yüke opsiyonel uyandırma listesi, anons yeri ve çözülmüş anons

### Düzeltildi
- [wear] saat iş bölümü inceleme düzeltmeleri — erteleme, yedek, mod kapanışı

## [0.40.0] - 2026-10-18

### Eklendi
- [hatirlatma] sesli okuma metni her yüzeyde düzenlenir; Neler Yeni duyurusu
- [hatirlatma] adım detayı yeniden düzenlendi — iki kanal anahtarı, Gelişmiş bölümü, sesli okuma editörü

### Düzeltildi
- [hatirlatma] inceleme düzeltmeleri — sesli okuma süresi, birleşme, eşik kilidi

### Değiştirildi
- [hatirlatma] tek modül — HatirlatmaModulu + useHatirlatmaDuzenleyici, altı yüzey geçti
- [hatirlatma] sesli okuma metni normalize'dan sağ çıkar, planlayıcılar kullanıcı metnini okur

## [0.39.0] - 2026-10-18

### Eklendi
- [wear] kıble kare hattı, tohum konumu, gizlilik metni ve AGENTS.md
- [wear] kıble komplikasyonu (statik açı, dokunuş pusulayı açar)
- [wear] saatin kendi kıble pusulası ve ana ekran girişi
- [wear] kıble hizalama kararı (histerezis, süzgeç, eğim, kalibrasyon)
- [wear] kıble açısı telefonla ikiz (adhan Qibla, ortak fikstür)
- [wear] yüke opsiyonel kıble konumu (1 ondalık, gevşek doğrulama)

### Düzeltildi
- [wear] kıble karesinde bayat döküm, gizlilik metninde aktarım yolu
- [wear] 08-kible sensör tespiti bayat ekran dökümüyle karar vermez

## [0.38.0] - 2026-10-18

### Eklendi
- [wear] kare hattı yeni ekrana uyarlandı, 07-ana-ambient; AGENTS.md
- [wear] tile'lar yeni düzende, dakikalık kalan süre dinamik
- [wear] tesbihat üç yay, faz parlaması ve 100. sayım
- [wear] vakit yayı ana ekranı, vakit listesi, Kıldım onayı ve ambient
- [wear] ana ekran görünüm kararı ve ortak ambient kaydırması
- [wear] sayılan an tek kural (VakitHesabi.sayilanAn)
- [wear] tek renk kaynağı SaatPaleti ve saat teması

### Düzeltildi
- [wear] Sıradaki vakit tile'ı 24 girdiyle sınırlı (~215 KB -> ~29 KB)
- [wear] tesbihat parlaması iptal edilince yay kalın kalmaz
- [wear] reddedilen Kıldım onayı başarı göstermez, katman TalkBack için modal
- [wear] Kıldım hapı 48 dp, onay açıkken taç arkadaki listeyi kaydırmaz
- [wear] komplikasyon eklenince uygulama açılmıyordu; vaktin çıkışına kalan süre
- [wear] saat simgesi adaptive, beyaz köşeler kalktı

## [0.37.0] - 2026-10-17

### Eklendi
- [takvim] ekran ortak hatırlatma kartıyla — tüm yetenekler
- [takvim] ortak model — adım dizisi, şekilden göç, teslim muhafız katmanından

### Düzeltildi
- [alarm] takvim gerçek alarmı native "Kıldım" sonrası çalmaz
- [takvim] kılınmışlık iptali planlama turlarıyla aynı sıradan geçer
- [takvim] aynı ana düşen adımlar birleşir — güçlü kanal (gerçek alarm) düşmesin

## [0.36.0] - 2026-10-17

### Eklendi
- [yatis] ortak model + teslim muhafız katmanından + ortak kart
- [camiye] ekran ortak hatırlatma kartıyla — tüm yetenekler
- [camiye] ortak model — adım dizisi, şekilden göç, teslim muhafız katmanından

### Düzeltildi
- [yatis] içerik üreten ilk tetikte içerik seç; kayıt-oynat iOS teslimcisini ölçsün
- [yatis] Android alarm payını 35'e çıkar, duyuru sürümünü düzelt

## [0.35.0] - 2026-10-17

### Eklendi
- [cuma] ekran ortak hatırlatma kartıyla — tüm yetenekler
- [cuma] teslim muhafızın teslim katmanından, kendi örneğiyle
- [cuma] adımlı üretici + metin + defter (alarm/anons, pay)
- [cuma] ortak model — adım dizisi + şekilden göç
- [nafile] akış önizlemesi + önizlemede yüzeyin kendi metni
- [hatirlatma] ekHatirlatmaPencereTanimi + yön sabit gerekçesi
- [butce] yüzey payları, defter pay alanı, iOS 64 ortak defteri
- [kanal] ek hatırlatma kaynakları kayıt defteri
- [alarm] bilgi türü alarm yükü (cuma/camiye gitme/takvim)
- [teslim] teslim sahipliği + OzelTeslim kategori/varsayılan kanal/sistem sesi

### Düzeltildi
- [ios] AlarmKit ikincil niyeti açık if/else ile ata
- [anons] kayıt defteri yarışını kilitle, sahipli iptal başarısızsa önekli yola düş
- [cuma] bütçe rehberi öneri uygulamaz; kaynaklar katı okur

### Değiştirildi
- [hatirlatma] ortak adım dizisi (core/hatirlatma/adimDizisi)

## [0.34.0] - 2026-10-17

### Eklendi
- [nafile] "Ana ekranda göster" her nafilenin kendi kartında

## [0.33.0] - 2026-10-17

### Eklendi
- [kaza] Kaza Defteri 2.0 ekranları ve sekme içi yığın
- [kaza] bilinmeyen hareketleri koru, karışık sürüm eşitlemesi, önizleme servisleri
- [kaza] kronolojik fold, ayrı fazla akümülatörü ve ileri uyumlu hareketler

### Düzeltildi
- [kaza] yalnız otomatik eklemeden oluşan kaynak defter de türetilmiş göçü düşürür
- [kaza] aynı milisaniyedeki hareketler eylem sırasıyla katlanır
- [kaza] otomatik izdüşüm yalnız gereken günlerin namaz kaydını okur
- [kaza] eski sürümlü cihazla eşitlemede sonsuz karşılıklı yükleme kesildi
- [kaza] eski yedekteki Şâfiî mezhebi ortak ayara ulaşır, varsayılan kalıcı yazılmaz
- [kaza] JSON null eski kaza kaydı boş sayılır, yanlış "okunamadı" bandı çıkmaz
- [kaza] geç göç defteri ezmez, türetilmiş görüntü çift sayılmaz
- [kaza] eski görüntü tabanı gizlenebilir, ayrıntı metni seri vaat etmez

## [0.32.0] - 2026-10-16

### Eklendi
- [muhafiz] içi boş kapalı eski adımları bir kez temizle
- [onizleme] akış önizlemesi gerçek alarm tetiklerini saatiyle gösterir
- [alarm] adım başına alarm kapsamı — yalnız ilk uyarıda ya da her uyarıda
- [hatirlatma] yetenekler her yüzeyde standart, nafileye gerçek alarm
- [nafile] ana ekran göstergesi nafile başına açılıp kapansın

### Düzeltildi
- [muhafiz] kapalı adım temizliği vakit sayacının eşiğini kaydırmasın
- [nafile] çözülemeyen özel sesleri kanal kurulmadan önce düşür
- [defter] nafile alarmlarını muhafız payına sayma
- [ayarlar] Kıldım işaretleyen uygulamalar yalnız otomasyon rehberinden açılsın

## [0.31.1] - 2026-10-16

### Düzeltildi
- [takvim] expo-calendar eski API'sini /legacy alt yolundan al
- [namaz-modu] üretici karşılaştırmasını null güvenli yap, çift bildirimi kaldır
- [namaz-modu] erişim varken Ayarlar'a yönlendirme, Samsung'da kural sayfasını atla
- [takvim] takvim iznini rıza modalı kapandıktan sonra iste, reddi yeniden doğrula
- [ayarlar] sayısal seçici ızgaraya otursun, basılı tutunca hızlansın
- [android] kullanılmayan "Fiziksel aktivite" iznini manifestten kaldır

## [0.31.0] - 2026-10-15

### Eklendi
- [neler-yeni] duyurular yalnız özelliğin geldiği platformda görünür
- [alarm-ios] AlarmKit canli etkinlik sunumu, kilitli Kildim ve acik notlar
- [saat] Apple Watch uygulamasi, komplikasyonlar ve WatchConnectivity koprusu
- [muhafiz] iOS'ta yarının imsağı bütçe artığı olarak plana girer
- [esitleme] sunucusuz, uçtan uca şifreli cihazlar arası eşitleme
- [tv] Android TV namaz vakitleri panosu
- [ios-canli] canli etkinlik ayar ekrani, duyuru ve simulator derlemesi
- [alarm] iPhone'da gerçek alarm adımı AlarmKit ile sistem alarmı olur
- [alarm] iOS 26 AlarmKit köprüsü, ana hedef intent'leri ve eklenti
- [takvim] takvim çakışması uyarısı — etkinlik vaktin sonunu yutarsa önceden tek bildirim
- [anasayfa] katlanabilir masaustu posturunde buyuk geri sayim
- [ios-widget] WidgetKit uzantisi, kilit ekrani, StandBy, canli etkinlik
- [ios-canli] Now Bar seciminin iOS canli etkinlik ikizi
- [widget] Samsung Flex Window icin kapak ekrani widget'i
- [wear] tesbihat sayacinda always-on (ambient) gorunum
- [ios-widget] widget gorunum karari ve App Group deposu
- [asistan] Android AppFunctions ile cihaz ici asistan fonksiyonlari
- [seferilik] ana ekran bilgi karti ve yolculuk bilgisi ayarlari
- [seferilik] seferilik karar cekirdegi, depolama ve kaynak notu
- [asistan] AppFunctions icin saf karar cekirdegi ve asistan kuyruk kaynagi
- [muhafiz] gercek alarm kanali (setAlarmClock + tam ekran)
- [bildirim] bileklik dostu, onden okunur hatirlatma basliklari
- [sade] yaslilar icin sade gorunum ve dokununca sesli okuma
- [widget] kilit ekrani ve hub icin keyguard kategorisi, salt okunur Kildim
- [otomasyon] sabit bildirim anahtar kelimeleri + "Otomasyonlarla kullanın" rehberi
- [otomasyon] Tasker/MacroDroid/Automate eklentisi (Locale protokolü)
- [kaza] her farzla bir kaza önerisi
- [camiye-git] Bildirim Ayarları'nda "Camide kılacağım" bölümü
- [yatis] yatis saatine gore yatsi hatirlatmasi ve gun sonu muhasebesi
- [ios] Siri, Kısayollar ve Odak filtresi (App Intents)
- [camiye-git] "Camide kılacağım" hatırlatma motoru
- [muhafiz] bildirimde "10/20 dk ertele" — fikhi ust sinirla, native
- [wear] saatte namaz sonrasi tesbihat sayaci
- [wear] saatin canli sayaci Now Bar secimine uyar; Wear OS 6 one cikarma istegi
- [wear] Now Bar secimi saat yukune eklemeli opsiyonel "canli" alaniyla gider
- [ayarlar] "Now Bar ve canli sayaclar" sayfasi, slice ve yedekleme
- [cami] Neler Yeni duyurusu + AGENTS.md Faz 2 kurallari
- [cami] Camideyim haritasi ve uc sekmeli ayar ekrani
- [nafile] adimli plan, kanal secimi ve Kildim iptali
- [sayac] vakit sayaci Now Bar planlayicisina devreder; planlayici testleri
- [cami] MapLibre bagimliligi ve saf harita veri katmani
- [cami] izleme kapsami, acilis bicimi ve "Camide misiniz?" sorusu
- [sayac] canli sayac planlayicisi; iftar/sahur/seri sayaclari pencerelerini bildirir
- [sayac] Now Bar secimi icin saf plan ve native tek alarmli uygulayici
- [cami] guven puani — saf ikiz (JS + Kotlin) ve senaryo fiksturu
- [kildim] otomasyon kaynaklari icin paket basina guven listesi
- [bildirim] bildirim siniri rehberi ekranlari (kart, sayfa, uygula + geri al)
- [kildim] bildirimdeki Kildim native islenir, vaktin alarmlari JS'i beklemeden susar
- [bildirim] bildirim defteri ve butce oneri motoru
- [sayac] Android 16 Live Update / Now Bar icin standart sablonlu ikiz sayac
- [muhafiz] vakit basina 1-6 hatirlatma, ton secici ve sil
- [muhafiz] ton kurali, acil kisiti ve hatirlatma ekle/sil cekirdegi
- [wear] Bugun tile'inda onay durumu korunur; duyuru ve AGENTS.md
- [wear] komplikasyon seti, Bugun tile'i ve son dakikalar sayaci
- [wear] saat yuzeyleri icin saf cekirdek (gun durumu, kerahat, son dakikalar, tile onayi)
- [camideyim] Camideyim ve Namaz modu ayar sayfalari
- [camideyim] JS orkestrasyonu, muhafiz sessizligi ve Namaz modu plani
- [ozel-gun] gun sonu, iftar/sahur ve cuma hatirlatmalari da ozel gunde susar
- [camideyim] cami verisi hatti, saf karar cekirdegi ve native modul iskeleti
- [widget] Widget 2.0, hızlı ayarlar kutusu ve uygulama kısayolları
- [wear] özel gün aralığında saatin muhafız planı da boş
- [wear] telefon yanında değilken de saatte muhafız hatırlatması
- [ozel-gun] ozel gun araliginda namaz hatirlatmalari susar
- [android] buyuk ekranda yon serbest, katla/ac'ta Activity korunur
- [duzen] katlanabilir ve tablet ekranlarda iki bolmeli ana ekran
- [seri] seri hadisi gun sonu hatirlaticisinda ve seri geri sayim bildiriminde
- [android] temali (monokrom) uygulama simgesi
- [android] pil kisiti uyarisi, rehberi ve Samsung kurulum adimi
- [android] Samsung ve Doze'a dayanikli bildirim/alarm altyapisi
- [nafile] ana ekranda nafile vakitleri gunluk akis zincirine girer; ci: APK prebuild'siz derlenir
- [wear] Wear OS saat uygulaması ve telefon senkronu (#269)
- [nafile] kuşluk, evvâbîn ve teheccüd vakitleri, gösterge ve hatırlatma (#77)
- [seri] serinin dayandığı hadisi Seri sekmesinde göster (#72)

### Düzeltildi
- [ci] PR #300 kontrolleri — kayit-oynat yigin tasmasi, iOS plist yolu, TV JDK 21
- [wear] saat ana ekranı ilk öğeyle açılır, kare saatte başlık TimeText altında kalmaz
- [ios] ana hedefte yerel pod'lar internal import ile (SDK 57)
- [sdk57] expo-modules-core acik bagimlilik, expo-audio remove()
- [alarm-ios] planlama turu CALAN AlarmKit alarmini susturmaz
- [tv] gece yarisi-imsak arasi pano dunun gununu cizer
- [katlanabilir] postur akisi arka planda durur, kapak widget'inda ipucu
- [takvim-cakisma] belki etkinlikleri elendi, kapliyor tetigine 60 dk tavan
- [canli-etkinlik] arka planda kilit ekranini bosaltma, 8 saat sinirinda gec basla
- [ios-widget] Kildim dugmesi kilit acar, gecersiz dokunusta etkinligi kapatmaz, goc kaynak kuyrugu temizler
- [android] tablette yon kilidi ekran boyutundan karar verir (letterbox kutusu degil)
- [alarm] Android'de alarm onayı eşzamanlı kalsın; iOS izin akışı testleri
- [nafile] bildirimdeki "Kildim" Android'de native islenir
- [anasayfa] yatsi kartinda bitis saati ertesi imsak olarak gosterilir
- [muhafiz] preset gercek alarm kanalini korur; AGENTS #74 guncellemesi
- [muhafiz] Android planina yarinin imsak vakti de girer
- [muhafiz] Kildim calan gercek alarmi susturur, alarm isi arka planda
- [ios] Siri modulu belge yorumundaki ic ice /* derlemeyi kiriyordu
- [yatis] muhasebe dugmeleri icin kategori kaydi planlamadan once garanti
- [muhafiz] ertelemeyi on plan muhafizi, saat ve iOS Odak da bilir
- [yatis] yatis yatsidan onceyse yatsi hatirlatmasi yatsi girince gelir
- [kaza] yazma thunk'lari diskteki guncel kaydi taban alir
- [ios] AppIntents.framework hedefe Weak eklenir (metadata çıkarımı)
- [butce,kildim] inceleme bulgulari — varsayilan baslatici, iOS slot paritesi, geri al yedegi
- [bildirim] reddedilen adim degisikligi ozel yedekten de geri alinir
- [kildim] guven sorusundaki dugme metinleri kibar siz diliyle
- [wear] son dakikalar penceresi vaktin zamanca son adimindan acilir
- [bildirim] vakit sayaci secenekleri gercek matristen uretilir
- [muhafiz] erken adim eski kayitta da DND delmez; kisit ekranda soylenir
- [muhafiz] esik tekilligi gocu kronolojik siralar ve bozuk hucrede firlatmaz
- [kildim] disaridan gelen "kildim" onaysiz isaretlemez, widget siniri gecikmez
- [camideyim] Rahatsiz Etmeyin takili kalmaz, bayat merkez taze merkezi ezmez
- [wear] guncelleme sonrasi cift bildirim, saat zinciri ve kopru kararinda hatalar
- [wear] Fable incelemesi — çizelge ufku, Wear API'siz cihaz, kilit

### Değiştirildi
- [vakit] olu madhab yapilandirmasi kaldirildi, hesap parametresi tek kaynakta
- [bildirim] nafile, cuma, vakit bildirimi ve vakit sayaci planlari saf ureticilere tasindi
- [bildirim] butce sabitleri tek yerde, muhafiz plani saf ureticiye tasindi
- [muhafiz] degisken uzunluklu seviyeler icin Faz 0 altyapisi

## [0.30.2] - 2026-10-12

### Düzeltildi
- [a11y] tema secici etiketini dilbilgisine uygun hale getir
- [ui] Rozetler sayfasındaki sekme çubuğu erişilebilir hale getirildi
- TaniGeriBildirimSayfasi içindeki butonlara accessibilityRole eklendi
- [a11y] add accessibilityRole to GorunumAyarlari theme selectors

## [0.30.1] - 2026-09-29

### Düzeltildi
- [anasayfa] vakit listesini yerel takvim gunune gore hesapla

## [0.30.0] - 2026-09-29

### Eklendi
- [konum] otomatik konum değişince sessiz bildirim; iOS'ta da görünen kısa mesaj

## [0.29.0] - 2026-09-29

### Eklendi
- [anasayfa] Günlük Akış'ı zincir görünümüne al, vakit giriş saatlerini göster

### Düzeltildi
- [anasayfa] bonus ipucunu kibar 'siz' diline çevir

## [0.28.3] - 2026-09-28

### Düzeltildi
- [a11y] ekran okuyucu rolleri, etiketleri ve durumları
- [ozel-gun] takvim modalını tema desenine taşı, ana buton kontrastını koru
- [konum] konum ayarları sabit renklerini tema token'larına bağla
- [ana-sayfa] VakitAkisi memo'sunu gün ISO dizesiyle koru
- [debug-log] paylaşılan log dosyasını maskele
- [seri] seri kartı modalında kardeş arka plan ve erişilebilir paylaş butonu
- [kaza] sihirbaz modalına kardeş arka plan ekle
- [ErrorBoundary] yedek ekran renklerini tema token'larına bağla

## [0.28.2] - 2026-09-28

### Düzeltildi
- [istatistik] haftalik grafikte gun kisaltmalari cakismasin
- [tarih] gun ve ay adlarini Turkce karakterle yaz

## [0.28.1] - 2026-09-28

### Düzeltildi
- [kaza] motivasyon onerisini kibar "siz" diline cevir

## [0.28.0] - 2026-09-27

### Eklendi
- [magaza] mockup ureticisi repoda; adim karesinde sesli anons gorunsun

## [0.27.9] - 2026-09-27

## [0.27.8] - 2026-09-27

## [0.27.7] - 2026-09-27

## [0.27.6] - 2026-09-27

## [0.27.5] - 2026-09-27

## [0.27.4] - 2026-09-27

## [0.27.3] - 2026-09-27

## [0.27.2] - 2026-09-27

## [0.27.1] - 2026-09-27

## [0.27.0] - 2026-09-27

### Eklendi
- [ios] sesli anons cihazda sentezlenip bildirimin sesi olsun (Faz 2)
- [muhafiz] yon secici zaman seridiyle kendini anlatsin

### Düzeltildi
- [ios] iOS 26 cam gorunumunden gecici olarak cik
- [ios] anahtarlar yerel gorunsun, geri dugmesinde rota adi cikmasin
- [ios] App Review oncesi izin metinleri ve iPad destegi
- [sihirbaz] muhafiz tanitimi kurdugu ayari anlatsin
- [muhafiz] yon degisiminde esikler yone uygun yeniden kurulsun
- [ios] Turkce karakterli dosya adi macOS'ta build'i kiriyordu

## [0.26.1] - 2026-09-14

### Düzeltildi
- [build] .gitignore'daki ios/ kalibini koke sabitle — v0.26.0 build'ini kirdi

## [0.26.0] - 2026-09-14

### Eklendi
- [ios] ekran yetenek kapilari + on plan cift ses kurali (Faz 1)

### Düzeltildi
- [ios] kod incelemesi bulgulari — res/raw cakismasi, buildNumber, butce
- [ios] on plandaki banner sesini sustur (cift ses kuralinin ikinci yarisi)
- [ios] acilis cokmesi + yanlis TTS uyarisi + App Store reddi riskini kapat

### Değiştirildi
- [muhafiz] teslim katmanini platforma gore ayir (iOS Faz 1 mimari)

## [0.25.1] - 2026-08-31

## [0.25.0] - 2026-08-30

### Eklendi
- [duyuru] Faz 0/1/4/5b özelliklerini Neler Yeni'ye ekle
- [muhafiz] titreşim kanalını uçtan uca bağla (Faz 6)
- [hatirlatma] ortak pencere bileşeni + cuma periyodik hatırlatma (Faz 3+4)
- [seri] seri gününün bitimine büyük sayaçlı bildirim (Faz 5b)
- [muhafiz] UyariModu enum'unu UyariKanallari kümesine göçür (Faz 2)
- [muhafiz] servisleri pencere yönüne bağla (Faz 1 servis turu)
- [muhafiz] anons ve özet metinlerini pencere yönüne bağla
- [muhafiz] hatırlatma penceresine yön kavramı (Faz 1 çekirdek)
- [muhafiz] eşik tavanı vaktin gerçek penceresinden türesin
- fix(seri): aynı-gün geri-alımı toparlanma sayacını da geri alsın
- [seri,muhafiz,konum] toparlanma ödülü, açılış sekmesi, sayfa başlıkları, çift anons ve konum yenileme

### Düzeltildi
- [seri] gün sınırı imsağa bağlansın
- [seri] aynı-gün geri-alımı toparlanma sayacını da geri alsın
- [seri] toparlanma ilerlemesi aynı-gün geri-almada sıfırlanmasın

### Değiştirildi
- [muhafiz] adım-kapalı yüklemini anlamıyla aynı ada taşı

## [0.24.0] - 2026-08-17

### Eklendi
- [seri] sürekli hareket — parıltı, nabız ve azaltılmış hareket
- [seri] açılış animasyonu — yıldız girişi ve zincirin örülmesi
- [seri] açılış zaman çizelgesi (zincir sırayla örülür)
- [seri] istatistiklere seri sekmesi eklendi
- [seri] gök paneli — ayın takımyıldızı (statik)
- [seri] tesbih bileşeni ve gök sahnesi sabitleri
- [seri] aylık ızgara, zincir bağları ve gök geometrisi
- [ayarlar] karmaşık ayar sayfalarına arama çapaları eklendi
- [ayarlar] basit ayar sayfalarına arama çapaları eklendi
- [ayarlar] ayarlarda arama ve büyük başlık
- [ayarlar] arama sonucundan gelen kontrolü vurgulama altyapısı
- [ayarlar] arama indeksi, Türkçe metin katlama ve eşleştirme
- [ayarlar] ayarlar sayfası dört gruplu ve dinamik özetli olarak yeniden kuruldu
- [ayarlar] ayar satırı, grup ve kurulum sağlığı bileşenleri
- [ayarlar] bildirim izni salt-okur yolu ve son dışa aktarma damgası
- [ayarlar] ayar özetleri ve kurulum sağlığı saf fonksiyonları

### Düzeltildi
- [ana ekran] gece yarısından sonra dünün vakitleri işaretlenebilsin
- [seri] parıltı dip=0 ve nabız oranı referansa uyumlu (inceleme)
- [seri] yıldız anatomisi referansa hizalandı (cihaz doğrulaması)
- [seri] seri yüklemesi reddedilirse yukleniyor sonsuza kalmasın
- [seri] son inceleme — kontrast, aralık ikizi ve erişilebilirlik
- [seri] gök paneli kontrast + zincir/glow düzeltmeleri (inceleme)
- [ayarlar] AyarCapasi tint overlay'i çocukları sarmalamasın
- [ayarlar] bölüm başlığı rengi metinIkincil — kontrast eşiği
- [ayarlar] son inceleme bulguları — slice hidrasyonu ve metin düzeltmeleri
- [ayarlar] bildirimOzeti imzasını sayı alacak şekilde düzelt, zayıf testi güçlendir
- [test] icon mock any tipini daraltır, dışa aktarma nöbetçisini sertleştirir
- [ayarlar] inceleme bulgularını düzelt (yogunluk görünen adı, testler)
- [muhafiz] kapalı adımın etiketi "Sessiz" yerine "Kapalı"

### Değiştirildi
- [seri] gunTamMi core'a taşındı, özel gün kümesi eklendi
- [navigasyon] ayarlar stack'i tiplendi, ekran adları tek kaynağa alındı
- [hakkinda] tanı ve debug bölümleri kaldırıldı

## [0.23.29] - 2026-07-28

## [0.23.28] - 2026-07-28

## [0.23.27] - 2026-07-28

### Eklendi
- [cuma] cuma namazı hatırlatması (#173)
- [muhafiz] her vaktin adımları tek dokunuşla açılıp kapatılabilsin

### Düzeltildi
- kod incelemesinden gelen beş sertleştirme
- [anasayfa] tarih seçici resetlenmesi ve gece yarısı açılış günü

### Değiştirildi
- [cuma] konum değişimini tek yayma noktasından dinle

## [0.23.26] - 2026-07-28

### Eklendi
- [konum] konuma bağlı tüm tüketiciler için tek yayma noktası
- [konum] konum takibini olay tabanlı geofence'e taşı

## [0.23.25] - 2026-07-27

### Eklendi
- [ui] improve accessibility and theming in bildirim ayarlari (#188)

### Düzeltildi
- [a11y] KurulumSihirbaziSayfasi.tsx içindeki butonlara accessibilityRole ekle (#190)
- [ui] ErrorBoundary bileşeninde erişilebilirlik eksikliği giderildi (#191)

### Değiştirildi
- [ux] replace hardcoded white colors with theme token (#171)

## [0.23.24] - 2026-07-18

### Eklendi
- [muhafiz] bildirim sesini gerçekten seçilebilir yap (sistem ses seçici)
- [muhafiz] bir kerelik preset göçü — tekrar azaltma mevcut kullanıcılara da ulaşsın
- [muhafiz] hazır yoğunluklara sesli anons + etkisiz tekrarları kes
- [muhafiz] önizleme ve "Dinle" akışlarında bildirim sesi de çalsın
- [muhafiz] ozel yogunluk yapilandirmasini hatirla (preset yedegi)

### Düzeltildi
- [muhafiz] Gemini incelemesinden gelen üç sertleştirme
- [muhafiz] aciliyet/ses ayrımını tamamla — kanal, native thread ve ses yaşam döngüsü
- [muhafiz] göç veri kaybı, sesli anons rızası ve ayar-plan senkronu
- [muhafiz] ozel sesli kanal onemini taban kanallarla esitle

## [0.23.23] - 2026-07-18

### Eklendi
- [muhafiz] Faz 5 duyurusu + bilgi tabanı güncellemesi
- [muhafiz] sesli modu ekrana bağla + akış önizleme (Faz 5)
- [muhafiz] ön plan sesli anonsu + çift konuşma önleme (Faz 5)
- [muhafiz] arkaplan bildirimlerine sesli anons bağlantısı (Faz 4)
- [muhafiz] native sesli anons altyapısı — alarm + goAsync TTS (Faz 4)
- [muhafiz] motor adaptörü — üç tüketici vakit×seviye matrisinden okur (Faz 3)
- [muhafiz] vakit-merkezli muhafız ayarları ekranı (Faz 2)
- [muhafiz] vakit özeti + eşik sınırı saf yardımcıları (Faz 2 altyapı)

## [0.23.22] - 2026-07-17

### Eklendi
- [muhafiz] slice'a matris alanı + yükleme migrasyonu + initialState matris
- [muhafiz] eski ayardan matrise migrasyon
- [muhafiz] tümüne uygula + preset uygula
- [muhafiz] aktif seviye çakışma kuralı
- [muhafiz] dinamik seviye özeti
- [muhafiz] anons metni {vakit}/{süre} interpolasyonu
- [muhafiz] matris tipleri ve sabitler

### Düzeltildi
- [muhafiz] code-review max bulgulari — matris bayatlamasi + savunma + verimlilik

### Değiştirildi
- fix(muhafiz): code-review max bulgulari — matris bayatlamasi + savunma + verimlilik

## [0.23.21] - 2026-07-17

### Değiştirildi
- [ayarlar] Tanı ve Geri Bildirim'i Hakkında içine taşı

## [0.23.20] - 2026-07-17

### Eklendi
- [muhafiz] icerik havuzunu vakte gore yeniden kur, dogrulanmamis nasslari ayikla
- [muhafiz] saf metin modulu -- sure basliga tasindi

### Düzeltildi
- [muhafiz] sen dili + emir kipine don, "secdeye kapan" mantik hatasini gider
- [test] banner test basligina seviye ekle + AGENTS.md tr buyuk harf tuzagi
- [muhafiz] "namazını" → "namazı" kip hatası + test parametresi cleanup
- [muhafiz] banner metinlerini kibar 'siz' diline cevir
- [muhafiz] bildirim basliginda kalan sureyi basa al

## [0.23.19] - 2026-07-16

## [0.23.18] - 2026-07-16

### Eklendi
- [ux] presentation katmanındaki sabit renkleri tema token'larıyla değiştir ve erişilebilirliği artır

### Düzeltildi
- [ux] SayiGirisModali disariya tiklayinca kapansin
- [a11y] add accessibility roles and labels to setup wizard buttons
- [SayiGirisModali] remove hardcoded white color and use theme token `birincilMetin`
- [a11y] GuncellemeBildirimi bileşenine erişilebilirlik rolleri eklendi
- [a11y] RozetKarti bileşenine accessibilityRole ve accessibilityLabel eklendi

### Değiştirildi
- [ui] add a11y labels and roles to prayer time cards- [AnaSayfa] timer kaynaklı gereksiz renderları önle

## [0.23.17] - 2026-07-16

### Düzeltildi
- ToparlanmaModal backdrop mimarisi düzeltildi

## [0.23.16] - 2026-07-02

### Düzeltildi
- [security] WebView originWhitelist zafiyeti giderildi (#143)
- [ux] SayiGirisModali icin donanim geri tusu destegi eklendi (#144)

## [0.23.15] - 2026-06-25

### Eklendi
- [ux] Seri Hedef Ayarları sayfasındaki düğmelere erişilebilirlik (a11y) etiketleri eklendi (#123)

## [0.23.14] - 2026-06-25

## [0.23.13] - 2026-06-24

### Eklendi
- [tani] kullanıcı-onaylı, cihazda-kalan sorun bildirme akışı (#120)

## [0.23.12] - 2026-06-24

### Düzeltildi
- [kaza] bozuk KAZA_DURUMU verisinde sonsuz "Yükleniyor" kilidini gider (#119)

## [0.23.11] - 2026-06-23

### Düzeltildi
- [deps] lockfile npm 10 paritesi (cosmiconfig senkronu) (#117)

## [0.23.10] - 2026-06-23

### Düzeltildi
- [guvenlik] WebPusulaView WebView sertlestirme (file erisim kapali, originWhitelist https) (#113)

## [0.23.9] - 2026-06-20

### Değiştirildi
- sayac bildirim temizliginde iptalleri paralel yap (Promise.all)

## [0.23.8] - 2026-06-15

### Düzeltildi
- [kaza] KazaDefteri testi sonsuz render dongusu (mock stabil referans + primitive efekt bagimliligi)
- [yedek] RN PRNG yoklugu duzeltmesi + Alert.alert yerine tema modali
- [guncelleme] indirilen guncelleme onay karti guncellemeMevcut'tan bagimsiz gosterilsin (#104 review)
- [guncelleme] yeniden-baslat kartina kapatma butonu + false-donuste tekrar deneme (#104 review)
- [navigasyon] gun navigasyonu snap-back ve gece yarisi ziplama/toast (#13)
- [guncelleme] otomatik güncelleme sonrası açıl-kapan döngüsünü gider (#91)

### Değiştirildi
- [bildirim] kalan tum Alert.alert kullanimlarini BildirimModali'ya tasi

## [0.23.7] - 2026-06-14

### Eklendi
- [yedekleme] akilli ice-aktarmada seri (streak) rekorunu birlestir

## [0.23.6] - 2026-06-14

### Eklendi
- [yedekleme] ayarlar menusu, navigasyon rotalari ve yeni-ozellik duyurusu
- [yedekleme] akilli ice-aktarma sihirbazi (cok adimli UI)
- [yedekleme] yedekleme giris sayfasi (UI)
- [yedekleme] ice-aktarma orkestrator thunk + slice
- [yedekleme] disa aktarma dosya yaz + sistem paylasimi
- [yedekleme] fark + birlestirme plan servisi (4 strateji, 4 kategori)
- [yedekleme] topla -> sifreli zarf ve coz/dogrula servisi
- [yedekleme] uygulama-anahtarli sifreleme util (tweetnacl)
- [yedekleme] yedek zarf/payload/strateji tipleri (core/types)

### Düzeltildi
- [vakit-sayaci] baslangic esigi kullanicinin sectigi seviyeye uysun (#90 review)
- [muhafiz] gercek-zamanli kilindi/geri-al anahtar tutarliligi (#101 review)
- [kerahat] modal kapanirken namazAdi flicker'ini onle
- [yedekleme] klasik expo-file-system/legacy API + lockfile senkron + dizi guard
- [muhafiz] acilista kilinmis namaza ses calma bug'i (#92)
- [bildirim] muhafiz aciksa vakit sayacinin cakisan bildirimini bastir (#90)
- [anasayfa] kerahat vaktinde namaz işaretlemeyi engelleme, kibar onayla izin ver

## [0.23.5] - 2026-06-14

### Düzeltildi
- [depolama] göç eşzamanlılık kilidi + multiGet ham-string güvenli parse (#98)

## [0.23.4] - 2026-06-14

### Eklendi
- [puan+depolama] puan butunlugu, seri/bonus geri-alma ve gun-bazli depolama (#97)

## [0.23.3] - 2026-06-09

### Düzeltildi
- [guvenlik] WebView dış link devrini http(s) şemalarıyla sınırla
- [deps] npm audit fix ile kritik/yüksek bağımlılık zafiyetlerini gider
- [guvenlik] Kıble WebView navigasyonunu güvenilir alanlarla sınırla
- [guvenlik] kullanılmayan Android izinlerini kaldır ve allowBackup'ı kapat
- [gizlilik] loglardaki konum hassasiyetini şehir seviyesine indir
- [guvenlik] güncelleme indirme bağlantılarını güvenilir domain doğrulamasından geçir

## [0.23.2] - 2026-06-07

### Düzeltildi
- [test] TakvimServisi timeZone testini ortam-bagimsiz yap
- [test] seriSlice gun-siniri flakiligi — uretimle ayni gun hesabi
- CI lock senkronu + K3 geri al + PR review duzeltmeleri
- [bildirim] muhafiz kanal baglama (Ö4) + Iftar/Sahur sayac temizleme (K3)
- [bildirim] "Kıldım" arka plan/ön plan drift'ini gider + native countdown durdur

### Değiştirildi
- [ui] Kurulum 9 adim bilesenini ayri dosyaya cikar (Faz E)
- [ui] Kurulum StyleSheet'i ayri module al (Faz E)
- [ui] TemizleModali'yi ayri dosyaya cikar + sabitler modulu (Faz E)
- [ui] TakvimAyarlari sunum bilesenlerini ayir (Faz E)
- [ui] IlIlceSecici'yi ayri bilesene cikar (Faz E)
- [ui] ortak SayiGirisModali bileseni (KazaDefteri) — Faz E
- [ui] ortak SayisalSecici bileseni (Takvim + Muhafiz) — Faz E
- [bildirim] Iftar/Sahur sayac servisleri icin ortak taban sinif (Ö1)
- Faz C — DRY çekirdeği (tarih, mesafe, kılınan vakit, konum metni, VakitAdi)- [anasayfa] ScrollView key'inden vakit cikarildi (Faz F)
- perf+chore: AppState foreground debounce (Faz F) + eslint varsIgnorePattern (Faz G)
- 1sn timer PrayerTimes onbellegi + VakitAkisi memo (Faz F)

## [0.23.1] - 2026-06-05

### Düzeltildi
- [ci] auto-release job'una actions:write izni (reusable subset kuralı)
- [ci] release workflow'a actions:write izni + Release'i dispatch öncesine al

## [0.23.0] - 2026-06-05

### Eklendi
- [duyuru] config-driven yeni özellik duyuru sistemi + CLAUDE.md
- [takvim] animasyonlu başarı modalı + scroll/geri tuşu düzeltmeleri
- [takvim] özel gün seçimi ve modal yükseklik bug düzeltmesi
- takvim UX yeniden tasarımı — özellik tanıtımı + 2 aşamalı temizle akışı

### Düzeltildi
- [guncelleme] Play Store modalı temiz + güncelleme sonrası tekrar çıkma
- [ci] replace EAS remote versionCode with build-time timestamp
- [ci] install expect before using it in version sync step
- [ci] fix expect heredoc YAML indentation issue
- [ci] use expect to drive interactive eas build:version:set
- [ci] auto-sync EAS remote versionCode with local build.gradle
- [ci] eas submit service account key path
- APK build EAS preview yerine Gradle ile yapılsın

### Değiştirildi
- [takvim] vakit ayarlarını bottom-sheet editöre taşı

## [0.22.0] - 2026-06-02

### Eklendi
- internal testers için otomatik submit desteği ekle
- mevcut takvim etkinliklerini temizle butonu eklendi

### Düzeltildi
- takvim izin ve cleanup duzeltmeleri + testler

## [0.21.0] - 2026-06-02

### Eklendi
- takvim entegrasyonu (#75)

### Düzeltildi
- review düzeltmeleri — orphan temizleme, sequential write, IANA timezone, izin UX

## [0.20.2] - 2026-04-19

### Düzeltildi
- Google Play konum izni prominent disclosure ve UX iyileştirmeleri
- Google Play policy compliance - add data retention/deletion info and update privacy policy

### Değiştirildi
- KonumIzniDisclosureModali code review fixlerini uygula

## [0.20.1] - 2026-04-04

### Eklendi
- [android] 1x1 ve 4x2 namaz widget'ları eklendi

## [0.20.0] - 2026-04-04

### Eklendi
- bildirim izni UX iyileştirmeleri ve seri eşiği düzenlemeleri (#67)
- [AnaSayfa] toparlanma banner + modal + progressive header fire icon wired up
- [HomeHeader] progressive fire icon color/opacity for recovery mode
- [ToparlanmaModal] new bottom-sheet modal wrapping ToparlanmaKarti

### Düzeltildi
- [tests] use act+fakeTimers for animation tests, update recovery scenario to 3-day expectation
- [ToparlanmaKarti] dark mode bg, softer warning, remove full-card pulse and redundant progress bar

## [0.19.4] - 2026-03-21

### Düzeltildi
- [lint] ignore plugins/ directory to fix ESLint parse error
- [deps] regenerate lockfile for CI npm ci compatibility
- [deps] upgrade expo-file-system from v17 to v19 to fix startup crash
- v0.19.6 — fix cleanup not running on first upgrade from pre-tracking versions
- v0.19.5 — clear stale native state on upgrade, guard module-level throws
- withPlayStoreDependency plugin graceful fallback for global eas-cli
- crash-safe PlayStore native modülü ve startup korumaları (v0.19.4)

## [0.19.3] - 2026-03-20

### Düzeltildi
- [ci] update config plugin comment for clarity
- [android] restore play:app-update-ktx dependency lost in 0.19.2 merge
- [android] add Expo config plugin to permanently retain Play Store dependency

## [0.19.2] - 2026-03-20

### Düzeltildi
- [android] restore play:app-update-ktx dependency lost in merge
- migrate existing users past setup wizard on 0.19.0 update

## [0.19.1] - 2026-03-20

### Düzeltildi
- [android] add missing play:app-update-ktx dependency for PlayStoreGuncellemeModulu
- expo-file-system/next import for File and Paths

## [0.19.0] - 2026-03-19

### Eklendi
- uygulama ilk kurulumda ise kurulumsihirbazı ekranı eklendi (#65)

## [0.18.0] - 2026-03-19

### Eklendi
- vakit kartında konum modu etiketi gösterimi eklendi
- kıble butonuna etiket metni eklendi
- kerahat vakti özelliği Ana Sayfa'ya eklendi

## [0.17.0] - 2026-03-15

### Eklendi
- [ci] add Play Store auto-submit to Expo Build workflow
- build+submit automation with auto-publish after EAS build

### Düzeltildi
- [ci] fix YAML syntax error in expo-build.yml workflow
- [ci] use fastlane metadata for Android release notes

## [0.16.1] - 2026-03-15

### Düzeltildi
- [android] add missing Google Play In-App Update dependency to app/build.gradle
- [android] use Gradle init script to force AGP 8.11.0 in all subproject buildscripts

## [0.16.0] - 2026-03-15

### Eklendi
- Play Store submit otomasyonu eklendi

### Düzeltildi
- [android] force AGP 8.11.0 for all subproject buildscripts to fix EAS "No variants exist" error
- PlayStoreGuncellemeModulu ActivityEventListener imzaları düzeltildi
- release notes formatı uygulama içi gösterimle eşleştirildi
- Play Store in-app update Gradle dependency eklendi

## [0.15.0] - 2026-03-13

### Eklendi
- Play Store native in-app update sistemi eklendi (#63)

## [0.14.1] - 2026-03-13

### Düzeltildi
- muhafız bildirimleri her yeni bildirimde öncekini temizler (#62)

## [0.14.0] - 2026-03-06

### Eklendi
- kaza defteri özelliği eklendi (#61)

## [0.13.0] - 2026-03-01

### Eklendi
- hata ayıklama modu eklendi ve hatalar giderildi

## [0.12.0] - 2026-02-24

### Eklendi
- kutlama penceresine paylaş butonu eklendi

### Düzeltildi
- [ui] kutlama penceresi renkleri ve yazıları iyileştirildi
- sayaç bildirimleri düzeltildi

## [0.11.2] - 2026-02-24

### Düzeltildi
- menü tuşlarının navigasyon tuşları altında kalma sorunu giderildi

## [0.11.1] - 2026-02-24

### Düzeltildi
- [workflow] release sirasinda build.gradle versionCode/Name guncelle
- [android] versionCode 22, versionName 0.11.0 olarak guncellendi
- [android] versionCode ve versionName app.json'dan dinamik oku

## [0.11.0] - 2026-02-23

### Eklendi
- açılış hızlandırıldı, sayaçlar düzeltildi, arayüz hataları giderildi
- sahur sayaci icin ozel tema eklendi (mor gradient, calar saat mascot, 'Sahurun Bitmesine' prefix)

### Düzeltildi
- [ci] versiyon hesaplama ve CI startup_failure düzeltildi (#58)
- [release] fetch-tags eklendi, versiyon 0.11.0 olarak duzeltildi
- [build] appVersionSource kalici olarak 'local' yapildi ve CI korumalari eklendi
- [build] appVersionSource 'remote' yerine 'local' olarak degistirildi

## [0.10.0] - 2026-02-22

### Eklendi
- [notifications] expo-countdown-notification native modülü ve android ayarları eklendi
- [notifications] native android geri sayım bildirimi entegrasyonu

### Düzeltildi
- [test] update async storage mock expected values for sayacBaslangicSeviyesi

## [0.9.2] - 2026-02-21

### Düzeltildi
- remove @notifee/react-native from plugins (not a valid config plugin since v7.8.0)
- vakit sayacı ve iftar sayacı bildirimlerinin release APK'da çalışmamasını düzelt

## [0.9.1] - 2026-02-19

### Düzeltildi
- Samsung bildirim gorunurlugu - kanal importance DEFAULT, trigger ID cakismasi cozumu
- release notes parsing and stale update cache after app update

## [0.9.0] - 2026-02-18

### Eklendi
- iftar sayacini ana ekrandan bildirim menusune tasi

## [0.8.0] - 2026-02-18

### Eklendi
- add Ramazan iftar counter feature with settings, component, and tests

### Düzeltildi
- rename typo gopirunur to gorunur in IftarSayaci component

## [0.7.1] - 2026-02-18

### Düzeltildi
- [ci] android release action 3 kritik hatasi duzelt

## [0.7.0] - 2026-02-15

### Eklendi
- add point indicators to prayer time cards and daily flow
- Add Vakit Sayacı (Prayer Time Countdown) feature with notifee
- Rozet ve Seri paylaşım görselleri iyileştirildi

### Düzeltildi
- seri verileri yuklenmeden seriKontrolet/namazKilindiPuanla calismasini engelle ve veri migrasyonu ekle
- hide muhafiz banner when current prayer is completed
- Resolve test failures and add vakitSayacSlice tests
- Improve hash-based message selection in PaylasilabilirRozet
- Address PR review comments - typing, imports, and consistency

### Değiştirildi
- address PR review feedback - improve naming, guard UI dispatch, fix dynamic import, improve test

## [0.6.1] - 2026-02-15

### Düzeltildi
- Invalidate update cache when app version changes
- [ci] release notlarından merge commitlerini filtrele

### Değiştirildi
- Simplify cache validation logic with destructuring

## [0.6.0] - 2026-02-14

### Eklendi
- Merge pull request #28 from furkanisikay/claude/merge-kible-to-master-bRa1M
- Add Qibla finder feature with comprehensive code review fixes
- kible gosterici ozelligi eklendi

### Değiştirildi
- Apply comprehensive code review fixes for SOLID, DRY, KISS, and Clean Code principles- [ci] optimize build times with caching and Gradle configuration

## [0.5.0] - 2026-02-14

### Eklendi
- Merge pull request #25 from furkanisikay/claude/add-auto-update-feature-9Dika

### Düzeltildi
- PR bot yorumları uygulandı - NetInfo, URL doğrulama, typo
- code review düzeltmeleri - kritik hatalar ve iyileştirmeler

## [0.4.0] - 2026-02-14

### Eklendi
- Merge pull request #24 from furkanisikay/claude/add-auto-update-feature-9Dika
- otomatik güncelleme kontrolü ve bildirim sistemi eklendi

## [0.3.0] - 2026-02-13

### Eklendi
- yapılandırılabilir takip profilleri ve pil optimizasyonları eklendi
- arka plan konum canlandırma ve izin iptali yönetimi eklendi

### Düzeltildi
- Merge pull request #23 from furkanisikay/claude/fix-safearea-location-tracking-eb4Pq
- tüm arayüz metinlerinde Türkçe karakter düzeltmesi
- tüm sayfalara SafeArea eklendi ve arka plan konum takibi düzeltildi

### Değiştirildi
- PR inceleme önerileri uygulandı (Copilot ve Gemini)

## [0.2.1] - 2026-02-13

### Düzeltildi
- Merge pull request #22 from furkanisikay/claude/fix-prayer-notifications-WhfeI
- prayer notification Kıldım button reliability and UI sync

### Değiştirildi
- address PR review feedback from Gemini and Copilot

## [0.2.0] - 2026-02-01

### Eklendi
- implement prayer time notifications and fix tests
- [home] Güneş vaktinde Öğle kartının pasif gösterimi ve testleri
- add prayer time arrival notifications (excluding sunrise)
- [home] Güneş vaktinde Öğle kartının pasif gösterimi sağlandı

## [0.1.1] - 2026-01-31

### Düzeltildi
- Merge pull request #16 from furkanisikay/fix/issue-7-seri-hatirlatici-saat-bugu-1810295291482891570
- seri hatırlatıcı sabit saat ayarını düzelt
- seri hatırlatıcı sabit saat ayarını düzelt
- [notifications] move listener to global scope and sync background service
- [notifications] move listener to global scope and sync background service
- [notifications] move listener to global scope and sync background service

## [0.1.0] - 2026-01-26

### Eklendi
- Merge pull request #2 from furkanisikay/feature/ui-yenileme
- Faz 2-3 NativeWind + Expo Icons gecisi tamamlandi

### Düzeltildi
- Turkce karakterler duzeltildi (o->ö, u->ü, s->ş, g->ğ, i->ı, c->ç)

### Değiştirildi
- Tab sayfalari header kaldirildi ve YuklemeGostergesi basitlestirildi

## [0.0.1] - 2026-01-23

### 🎉 Initial Release

**Namaz Akışı**, GPLv3 lisansı altında "Sadaka-i Cariye" projesi olarak ilk kez herkese açık olarak yayınlandı.

### ✨ Özellikler

*   **Çevrimdışı & Gizlilik:** Bulut bağımlılıkları tamamen kaldırıldı. Tüm veriler yerel olarak `AsyncStorage` kullanılarak saklanır.
*   **Akıllı Vakit Hesaplama:** Konuma dayalı olarak `adhan` kütüphanesi kullanılarak (Diyanet uyumlu) otomatik hesaplama yapılır.
*   **'Muhafız' Bildirim Sistemi:**
    *   **İnteraktif Aksiyonlar:** Bildirimler üzerinden doğrudan ("Kıldım") diyerek namazı işaretleyebilme.
    *   **Artan Aciliyet:** 4 seviyeli hatırlatma sistemi (Hatırlatma -> Uyarı -> Mücadele -> Son Çağrı).
    *   **Otomatik Temizlik:** Namaz kılındığında veya yeni vakit girdiğinde eski bildirimleri otomatik temizler.
    *   **Akıllı Sıklık:** Her aciliyet seviyesi için özelleştirilebilir aralıklar.
*   **Kaza Namazı Takibi:** Kılınmayan namazların otomatik tespiti ve kaydedilmesi.
*   **Seri & Oyunlaştırma:** Sürekliliği artırmak için görsel seri takibi ve rozet sistemi.
*   **Modern Arayüz:** Akıcı animasyonlarla optimize edilmiş Karanlık Mod.
*   **Konum Kalıcılığı:** Arka plan izin desteği ile sağlam konum yönetimi.

### 🛠 Teknik

*   **Mimari:** React Native (Expo) + TypeScript + Redux Toolkit.
*   **Lisans:** GNU GPLv3.
