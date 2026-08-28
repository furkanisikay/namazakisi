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
 * hicbiri acik degilse adim KAPALIdir (motorun tek kapisi: `hicKanalAcikMi`).
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
   * `hicKanalAcikMi`dir (adim "acik mi" kurali simdiden dogru olsun diye).
   */
  titresim?: boolean;
}

export interface SeviyeAyari {
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
}

export interface VakitMuhafizAyari {
  seviyeler: SeviyeAyari[]; // her zaman 4, SEVIYE_KADEMELERI sırası
  /**
   * Uyarıların hangi uçtan ölçüleceği (Faz 1). Alan YOKSA `'cikisaDogru'` —
   * eski kayıtlar birebir eski davranışı üretir, göç gerekmez.
   *
   * `'girisindenItibaren'` seçildiğinde eşikler kesin ARTAN sıradadır
   * (nazik 5 → acil 45) ve motor pencere sonuna kadar sürer.
   */
  yon?: PencereYonu;
}

export type MuhafizMatrisi = Record<MuhafizVakti, VakitMuhafizAyari>;

export const MUHAFIZ_VAKITLERI: MuhafizVakti[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];
export const SEVIYE_KADEMELERI: SeviyeKademe[] = ['nazik', 'uyari', 'sert', 'acil'];

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
