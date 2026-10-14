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
