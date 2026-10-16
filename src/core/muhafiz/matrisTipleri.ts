import type { VakitAdi } from '../types';
import type { PencereYonu } from './pencereTipleri';

export type MuhafizVakti = Exclude<VakitAdi, 'gunes'>;
export type SeviyeKademe = 'nazik' | 'uyari' | 'sert' | 'acil';
export type Siklik = 'birkez' | { herDk: number };

/**
 * ESKI DISK SEMASI (Faz 2 oncesi) — yalniz GOC okur, motor DEGIL.
 *
 * Dort durum ('sessiz'|'bildirim'|'sesli'|'ikisi') bagimsiz iki kanali tek eksene
 * sikistiriyordu; ucuncu bir kanal (titresim) eklemek kombinasyon sayisini
 * ikiye katlardi ("sesli+titresim", "bildirim+titresim", "ucu birden"...).
 * Yerine `UyariKanallari` KUMESI geldi. Bkz. `muhafizGoc.modlariKanallaraGoc`.
 */
export type EskiUyariModu = 'sessiz' | 'bildirim' | 'sesli' | 'ikisi';

/**
 * Bir adimin HANGI KANALLARDAN uyaracagi. Kanallar BAGIMSIZ acilir/kapanir;
 * hicbiri acik degilse adim KAPALIdir (motorun tek kapisi: `adimKapaliMi`).
 *
 * Eksik alan ile `false` AYNI anlamdadir (kapali) — diskteki kismi kayitlar da
 * boylece dogru okunur.
 */
export interface UyariKanallari {
  /** Android bildirimi gonderilsin mi (ve on planda bildirim sesi calsin mi)? */
  bildirim?: boolean;
  /** Sesli anons (TTS) okunsun mu? */
  sesli?: boolean;
  /**
   * Titresim — ALAN ACIK, HENUZ BAGLI DEGIL (Faz 6 / A7 baglayacak).
   * Bugun hicbir motor, servis veya ekran bu alani yazmaz; okuyan tek yer
   * `adimKapaliMi`dir (adim "acik mi" kurali simdiden dogru olsun diye).
   */
  titresim?: boolean;
  /**
   * GERCEK ALARM (issue #74) — adimin ILK tetiginde isletim sisteminin alarmi
   * calar (Android: `setAlarmClock` + tam ekran alarm etkinligi, `USAGE_ALARM`
   * sesi; iOS: AlarmKit gelene kadar zamana duyarli bildirim + uzun ses).
   *
   * NEDEN KANAL: titresim gibi bagimsiz bir eksendir — kullanici "her vakit
   * icin" istedigi adimda acar. Ekranda cip DEGIL, ayri bir anahtardir.
   * Alan YOKSA kapali: eski kayitlar birebir eski plani uretir, goc gerekmez.
   * Hazir yogunluklar bu alani YAZMAZ (riza: alarm sessiz modu delebilir).
   */
  alarm?: boolean;
}

export interface SeviyeAyari {
  /**
   * Adimin TONU (issue #274) — nazik/uyari/sert/acil. Eskiden hem SIRAYI hem
   * metnin sertligini tasiyordu; artik yalniz sertligi tasir: bildirim
   * metni, onem (`muhafizAcilKanalMi`), iOS kesinti seviyesi ve serit cubuk
   * boyu buradan gelir. SIRA zamandan (esikten) gelir — iki adim ayni tonu
   * tasiyabilir, ton geri de gidebilir (motor bir sey yapmaz, ekran not duser).
   */
  kademe: SeviyeKademe;
  /**
   * Bu adim hangi kanallardan uyarir? (Faz 2'de `mod: UyariModu` yerini aldi.)
   * Bos kume = adim KAPALI.
   */
  kanallar: UyariKanallari;
  esikDk: number;
  siklik: Siklik;
  /**
   * HANGI SES calacak — `VARSAYILAN_SES` ya da kullanicinin sistem seciciden
   * sectigi `content://...` URI'si. ONEM/ACILIYET tasimaz (bkz. `acilKanal`).
   */
  bildirimSesi: string;
  /**
   * Secilen sesin kullaniciya gosterilecek adi (sistem seciciden gelir).
   * Yalniz gorunum icindir; yoksa `VARSAYILAN_SES_ADI` gosterilir.
   */
  sesAdi?: string;
  /**
   * Bu adim ACIL kanaldan mi gonderilsin (MAX onem + bypassDnd)?
   *
   * NEDEN AYRI ALAN: eskiden aciliyet `bildirimSesi === 'alarm'` ile tasiniyordu.
   * Ses artik kullanicinin sectigi rastgele bir URI oldugu icin bu bag KOPTU —
   * aksi halde hazir yogunluk preset'i her uygulandiginda kullanicinin sectigi
   * muzik silinirdi. Simdi preset ACILIYETI yazar, sesi kullanici secer.
   */
  acilKanal?: boolean;
  /**
   * Adim KAPATILDIGINDA (tum kanallar kapanirken) o anki KANAL KUMESI burada
   * saklanir; adim yeniden acilinca geri konur. Boylece "bildirim + sesli + ozel
   * ses + anons metni" ile kurulmus bir adimi kapatip acmak kullanicinin kurdugu
   * seyi YOK ETMEZ.
   *
   * MOTOR BU ALANI OKUMAZ — kapaliligin tek dogruluk kaynagi `kanallar`dir ve
   * oyle kalir (`UyariPlani` bu alani tasimaz). Salt bir UI geri-alma hafizasidir.
   * Deger UYDURULAMAZ: yalniz `seviyeAcKapa.seviyeyiKapat` yazar.
   */
  oncekiKanallar?: UyariKanallari;
  anonsMetni: string;
  /**
   * GERÇEK ALARM hangi tetiklerde çalar? (yalnız `kanallar.alarm` açıkken anlamlı)
   * - `'ilk'` (alan YOKSA da bu): yalnız adımın İLK tetiğinde; tekrarlar bildirim.
   * - `'hepsi'`: adımın HER tetiğinde (tekrarlar dahil). Her alarm tam ekran açılır
   *   ve bildirim sınırına sayılır; iPhone'da tur başına AlarmKit payı vardır
   *   (`IOS_ALARMKIT_MUHAFIZ_PAYI`), fazlası bildirim olarak gelir.
   * Alan yoksa `'ilk'` → göç yok, kayıt-oynat planı birebir aynı.
   */
  alarmKapsami?: AlarmKapsami;
}

/** Gerçek alarmın adım içindeki kapsamı (bkz. `SeviyeAyari.alarmKapsami`). */
export type AlarmKapsami = 'ilk' | 'hepsi';

export interface VakitMuhafizAyari {
  /**
   * Vaktin hatırlatmaları — DEĞİŞKEN UZUNLUKLU, 1..`MUHAFIZ_MAKS_ADIM` (issue #274).
   *
   * Dizi daima KRONOLOJİK sırada tutulur (çıkışta eşik AZALAN, girişte ARTAN);
   * ekrandaki "N. hatırlatma" numarası dizi indeksinin +1'idir. Eşikler TEKİLDİR
   * (`matrisGecerliMi`). Eski 4 elemanlı kayıt (nazik → acil) bu kuralı zaten
   * sağlar → göçsüz okunur.
   */
  seviyeler: SeviyeAyari[];
  /**
   * Uyarıların hangi uçtan ölçüleceği (Faz 1). Alan YOKSA `'cikisaDogru'` —
   * eski kayıtlar birebir eski davranışı üretir, göç gerekmez.
   *
   * `'girisindenItibaren'` seçildiğinde eşikler kesin ARTAN sıradadır
   * (nazik 5 → acil 45) ve motor pencere sonuna kadar sürer.
   */
  yon?: PencereYonu;
  /**
   * AYRILAN yönün zamanlaması (yalnızca `esikDk` + `siklik`, adım başına bir
   * eleman, KRONOLOJİK sırada — `seviyeler` ile aynı uzunlukta).
   *
   * Yön değişimi eşikleri hedef yöne uygun yeniden kurar (çıkış eşikleri
   * AZALAN, giriş eşikleri ARTAN olmak zorunda). Yedek olmasaydı kullanıcı
   * yönü deneyip geri döndüğünde elle kurduğu zamanlama sessizce kaybolurdu.
   *
   * MOTOR BU ALANI OKUMAZ — `oncekiKanallar` gibi salt bir UI geri-alma
   * hafızasıdır ve yalnız `matrisIslemleri.yonuDegistir` yazar. Preset
   * uygulaması onu TEMİZLER: preset zamanlamayı ezdiği için yedek bayatlar
   * ("özel çıkış → girişe geç → preset → çıkışa dön" zincirinde kullanıcıya
   * eski özel ayarını geri verirdi).
   */
  yonYedegi?: Partial<Record<PencereYonu, YonZamanlamaYedegi[]>>;
}

/** `VakitMuhafizAyari.yonYedegi` içindeki tek adım. */
export interface YonZamanlamaYedegi {
  esikDk: number;
  siklik: Siklik;
}

export type MuhafizMatrisi = Record<MuhafizVakti, VakitMuhafizAyari>;

export const MUHAFIZ_VAKITLERI: MuhafizVakti[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];
export const SEVIYE_KADEMELERI: SeviyeKademe[] = ['nazik', 'uyari', 'sert', 'acil'];

/** Bir vakitte en az / en fazla kaç hatırlatma kurulabilir (issue #274). */
export const MUHAFIZ_MIN_ADIM = 1;
export const MUHAFIZ_MAKS_ADIM = 6;

/**
 * Uygulamayla gelen ses. Kullanici sistem seciciden baska bir ses secerse
 * `bildirimSesi` bir `content://...` URI'si olur (bkz. `sesKimligi.ts`).
 *
 * SABIT PALET KALDIRILDI: eski `SES_PALETI` uc isim ('Çan'/'Melodi'/'Alarm')
 * vaat ediyordu ama ucu de ayni dosyaya cozuluyordu — palet yalandi. Yerine
 * sistem ses secici geldi (kullanicinin kendi muzikleri dahil).
 */
export const VARSAYILAN_SES = 'varsayilan';
export const VARSAYILAN_SES_ADI = 'Uygulama sesi';
