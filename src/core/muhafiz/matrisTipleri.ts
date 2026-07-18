import type { VakitAdi } from '../types';

export type MuhafizVakti = Exclude<VakitAdi, 'gunes'>;
export type SeviyeKademe = 'nazik' | 'uyari' | 'sert' | 'acil';
export type UyariModu = 'sessiz' | 'bildirim' | 'sesli' | 'ikisi';
export type Siklik = 'birkez' | { herDk: number };

export interface SeviyeAyari {
  kademe: SeviyeKademe;
  mod: UyariModu;
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
  anonsMetni: string;
}

export interface VakitMuhafizAyari {
  seviyeler: SeviyeAyari[]; // her zaman 4, SEVIYE_KADEMELERI sırası
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
