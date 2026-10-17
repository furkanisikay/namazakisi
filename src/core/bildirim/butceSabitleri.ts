/**
 * BİLDİRİM BÜTÇESİ SABİTLERİ — TEK YER (issue #298).
 *
 * İki platformun tavanı da sistemin SESSİZCE uyguladığı bir sınırdır: aşılınca
 * ne hata döner ne de uyarı çıkar — plan "kuruldu" görünür, bildirim gelmez.
 * Muhafız teslimcileri, bildirim defteri ve rehber ekranı aynı sayıları
 * buradan okur; ikizler ayrışırsa ekran "sığıyor" derken teslimci keser.
 *
 * SAF modül.
 */

export type BildirimPlatformu = 'ios' | 'android';

/** iOS'un uygulama başına bekleyen yerel bildirim tavanı (en yakın 64'ü tutar). */
export const IOS_BEKLEYEN_TAVANI = 64;

/**
 * iOS muhafız teslimcisinin bıraktığı güvenlik payı: muhafız dışı tüketiciler
 * (vakit bildirimi, cuma, nafile) planlamayı muhafızdan SONRA da yapabilir.
 */
export const IOS_GUVENLIK_PAYI = 4;

/**
 * iOS'ta BÜTÇE ARTIĞI (yarının imsağı, `yarininImsagiKipi`) doldururken ek olarak
 * BOŞ bırakılan slot. Yedek, bugünün planı sığdıktan sonra kalan yere girer; o yeri
 * sonuna kadar doldursaydı muhafızdan SONRA planlanan tüketiciler (yeni açılan cuma,
 * camiye gitme, nafile turunun büyümesi) 64'ü aşar ve iOS en UZAK tarihlileri — yani
 * onların bildirimlerini, yarın sabahki yedeği değil — sessizce atardı. Yedek kendi
 * başına hiçbir şeyi düşürmemeli: yedek doluyken 64 − 4 − 8 = 52'de durulur.
 */
export const IOS_YEDEK_REZERVI = 8;

/**
 * iPhone AlarmKit TAVANI — bir planlama turunda kurulabilecek en fazla gerçek alarm.
 *
 * AlarmKit'in uygulama başına alarm sınırı BELGELENMEMİŞTİR (yalnız hata kodu var:
 * `AlarmManager.AlarmError.maximumLimitReached`). "Her uyarıda alarm" (#74 kapsamı)
 * tek vakitte onlarca alarm üretebildiği için ihtiyatlı bir tavan konur; fazlası
 * NORMAL bildirim olarak gelir (kayıp değil, zayıflamış teslim). Kesme KRONOLOJİKTİR
 * (en yakınlar alarm kalır). Muhafız ve nafile AYRI teslimci örnekleridir → tavan
 * ikiye bölünür; bildirim defteri aynı payları kullanır (parite).
 */
export const IOS_ALARMKIT_TAVANI = 24;
/**
 * Örnek başına AlarmKit payları (ortak hatırlatma yüzeyleri, plan K2) — HEPSİ AÇIK sabit;
 * toplamları `IOS_ALARMKIT_TAVANI`'nı AŞMAZ (nöbetçi `butceSabitleri.test.ts`). Eskiden
 * nafile `TAVAN − MUHAFIZ` ile türüyordu; yeni yüzey eklenince toplam sessizce kayardı.
 * Ek yüzeylerde alarm varsayılan olarak adımın İLK tetiğindedir → 1 yeter; fazlası
 * bildirim olarak gelir (kayıp değil, zayıflamış teslim).
 */
export const IOS_ALARMKIT_MUHAFIZ_PAYI = 16;
export const IOS_ALARMKIT_NAFILE_PAYI = 4;
export const IOS_ALARMKIT_CUMA_PAYI = 1;
export const IOS_ALARMKIT_CAMIYE_GIT_PAYI = 1;
export const IOS_ALARMKIT_YATIS_PAYI = 1;
export const IOS_ALARMKIT_TAKVIM_PAYI = 1;
/** Tüm payların listesi (toplam nöbetçisi). */
export const IOS_ALARMKIT_PAYLARI: readonly number[] = [
    IOS_ALARMKIT_MUHAFIZ_PAYI,
    IOS_ALARMKIT_NAFILE_PAYI,
    IOS_ALARMKIT_CUMA_PAYI,
    IOS_ALARMKIT_CAMIYE_GIT_PAYI,
    IOS_ALARMKIT_YATIS_PAYI,
    IOS_ALARMKIT_TAKVIM_PAYI,
];

/**
 * Android'de uygulamanın kullandığı TOPLAM alarm havuzu tavanı.
 *
 * Sistem uygulama başına eşzamanlı ~500 alarm tutar; aşılınca `setExact...`
 * SecurityException atar ya da kayıt sessizce düşer. Havuza expo bildirim
 * tetikleri, notifee sayaç tetikleri, native sesli anons alarmları ve widget
 * alarmı birlikte girer. 480'de dururuz (20'lik pay, sistemin/OEM'in kendi
 * sayımındaki belirsizlik içindir).
 */
export const ANDROID_TOPLAM_TAVANI = 480;

/** Muhafız DIŞI tüketicilere (vakit/cuma/nafile/gün sonu/sayaç/widget) ayrılan pay. */
export const ANDROID_DIGER_PAYI = 120;

/**
 * Muhafızın tek planlama turunda kurabileceği en fazla alarm (bildirim + sesli
 * anons). Toplam havuzdan TÜRER — elle ayrı bir sayı yazılmaz.
 */
export const ANDROID_MUHAFIZ_PAYI = ANDROID_TOPLAM_TAVANI - ANDROID_DIGER_PAYI;

/**
 * Android'de rehber kartı YALNIZ bu sayıdan itibaren görünür: hazır yoğunluklar
 * havuzun çok altında kalır, her kullanıcıya "480'den 90" göstermek gürültüdür.
 */
export const ANDROID_UYARI_ESIGI = 400;

/** Kartın turuncuya döndüğü doluluk oranı (sınıra yaklaşma). */
export const YAKINLIK_ORANI = 0.85;

/** Platformun rehberde gösterilen sınırı. */
export const platformSiniri = (platform: BildirimPlatformu): number =>
    platform === 'ios' ? IOS_BEKLEYEN_TAVANI : ANDROID_TOPLAM_TAVANI;

/**
 * Nafile hatırlatmalarının (bildirim + sesli anons alarmı) Android'de bir
 * planlama turunda kurabileceği en fazla alarm (issue #273). `ANDROID_DIGER_PAYI`
 * İÇİNDEDİR: kalan pay vakit bildirimi, cuma, gün sonu, sayaç ve widget içindir.
 * Kesme PLAN ÜRETİCİSİNDE (`nafilePlaniOlustur`) ve kronolojiktir — defter ile
 * servis aynı sayıyı görür; en uzak geceler düşer, sonraki tur kurar.
 */
export const ANDROID_NAFILE_PAYI = 60;

/**
 * EK HATIRLATMA YÜZEYLERİNİN Android alarm payları (ortak hatırlatma yüzeyleri, plan K1 = B).
 *
 * Kesme ÜRETİCİDE ve KRONOLOJİKTİR (nafile deseni): defter ile servis aynı sayıyı görür,
 * teslimcideki sayaç emniyet ağıdır. K1 = B: bu paylar `ANDROID_MUHAFIZ_PAYI`'ndan
 * DÜŞÜLMEZ (muhafız 360 kalır); toplamı defterin 480 kapısı (`degisiklikSimuleEt`)
 * korur — kullanıcı eyleminden bağımsız artış (takvime sonradan eklenen etkinlik)
 * kapıya takılmadan aşabilir, rehber kartı bunu sayıyla söyler.
 *
 * CUMA 60: göçten gelen tekrarlı kayıt BİREBİR aynı planı üretmeli — tek adım, plan
 * bütçesi adım başına en fazla 15 tetik × 4 cuma = 60. Daha düşük bir pay eski
 * kullanıcının 2.–4. cumalarını sessizce keserdi.
 */
export const ANDROID_CUMA_PAYI = 60;
export const ANDROID_CAMIYE_GIT_PAYI = 50;
export const ANDROID_YATIS_PAYI = 21;
export const ANDROID_TAKVIM_CAKISMA_PAYI = 35;
