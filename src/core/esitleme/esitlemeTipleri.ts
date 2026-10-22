/**
 * Cihazlar arası eşitleme (issue #288) — paylaşılan tipler.
 *
 * SUNUCUSUZ: veri geliştiricinin değil kullanıcının KENDİ bulut alanında durur
 * (Android: Google Drive `appDataFolder`, iOS: iCloud anahtar-değer deposu).
 * Sağlayıcı yalnız şifreli bir metni saklar/verir; birleştirme kararı cihazdadır.
 */

/** Desteklenen sağlayıcılar. */
export type SaglayiciKimligi = 'googleDrive' | 'icloud';

/**
 * Eşitleme hata kodları. Arayüz metni bunlardan üretilir; servisler FIRLATMAZ,
 * sonuç nesnesinde döner.
 * - `agYok`: ağ yok / zaman aşımı / sunucu geçici hatası → sessiz, sonra yeniden dener.
 * - `yetkiYok`: hesap bağlantısı düştü (token iptal edildi) → "yeniden bağlanın".
 * - `yapilandirilmamis`: bu build'de sağlayıcı etkin değil.
 * - `parolaGerekli`: cihazda parola/anahtar yok.
 * - `parolaYanlis`: uzaktaki veri bu parolayla açılmıyor (başka cihazda değiştirilmiş).
 * - `bozukVeri`: uzaktaki kayıt okunamıyor → ÜZERİNE YAZILMAZ.
 * - `surumYeni`: uzaktaki kayıt daha yeni bir uygulama sürümünden → ÜZERİNE YAZILMAZ.
 * - `boyutAsimi`: sağlayıcının boyut sınırı aşıldı.
 * - `bilinmiyor`: beklenmeyen durum.
 */
export type EsitlemeHataKodu =
  | 'agYok'
  | 'yetkiYok'
  | 'yapilandirilmamis'
  | 'parolaGerekli'
  | 'parolaYanlis'
  | 'bozukVeri'
  | 'surumYeni'
  | 'boyutAsimi'
  | 'bilinmiyor';

/** Sağlayıcıların fırlattığı tipli hata (servis bunu sonuç koduna çevirir). */
export class EsitlemeHatasi extends Error {
  readonly kod: EsitlemeHataKodu;

  constructor(kod: EsitlemeHataKodu, mesaj?: string) {
    super(mesaj ?? kod);
    this.name = 'EsitlemeHatasi';
    this.kod = kod;
  }
}

/** Bir hatayı eşitleme koduna indirger (tipsiz hata → `bilinmiyor`). */
export function hataKodunaCevir(hata: unknown): EsitlemeHataKodu {
  return hata instanceof EsitlemeHatasi ? hata.kod : 'bilinmiyor';
}

/** Uzaktaki kaydın sürüm bilgisi (içeriği indirmeden "değişti mi?" sorusu). */
export interface UzakMeta {
  /** Sağlayıcıya özgü, her yazımda değişen etiket (Drive `version`, iCloud rastgele kimlik). */
  etiket: string;
}

/** Uzaktaki kaydın içeriği. */
export interface UzakKayit extends UzakMeta {
  icerik: string;
}

/**
 * Eşitleme sağlayıcısı sözleşmesi. Tek bir şifreli metin (zarf) saklar.
 * Hatalarda `EsitlemeHatasi` fırlatır.
 */
export interface EsitlemeSaglayicisi {
  readonly kimlik: SaglayiciKimligi;
  /** Kullanıcıya gösterilen ad. */
  readonly ad: string;
  /** Bu build'de/platformda kullanılabilir mi? `false` ise ekran onu HİÇ göstermez. */
  yapilandirildiMi(): boolean;
  /** Hesap bağlantısı (oturum) var mı? Ağa çıkmaz. */
  oturumVarMi(): Promise<boolean>;
  /** Etkileşimli bağlanma (ör. Google girişi). İptalde `false`. */
  baglan(): Promise<boolean>;
  /** Bağlantıyı keser, cihazdaki kimlik bilgilerini siler (uzaktaki veriye dokunmaz). */
  baglantiyiKes(): Promise<void>;
  /** Uzaktaki kaydın sürüm etiketi; kayıt yoksa `null`. */
  meta(): Promise<UzakMeta | null>;
  /** Uzaktaki kaydı indirir; yoksa `null`. */
  oku(): Promise<UzakKayit | null>;
  /** Kaydı yazar (yoksa oluşturur), yeni etiketi döndürür. */
  yaz(icerik: string): Promise<UzakMeta>;
  /** Uzaktaki kaydı siler (yoksa sessizce geçer). */
  sil(): Promise<void>;
}

import type { BeklemeNedeni } from './esitlemePolitikasi';

/**
 * Cihazdaki eşitleme durumu (`DEPOLAMA_ANAHTARLARI.ESITLEME_DURUMU`).
 * Cihaza özgüdür → yedeklemeye GİRMEZ. Parola/anahtar burada DEĞİL, güvenli depodadır.
 */
export interface EsitlemeDurumu {
  aktif: boolean;
  saglayici: SaglayiciKimligi | null;
  /** Son başarılı eşitlemede görülen/yazılan uzak etiket. */
  sonEtiket: string | null;
  /** Son başarılı eşitlemede uzakta duran içeriğin özeti. */
  sonOzet: string | null;
  /** Son BAŞARILI eşitleme (ISO). */
  sonEsitleme: string | null;
  /** Son denemenin hatası (başarıda `null`). */
  sonHata: EsitlemeHataKodu | null;
  /** Son TAMAMLANAN turun zamanı (başarılı ya da hatalı; ISO) — sıklık kapısı buna bakar. */
  sonDeneme: string | null;
  /** Son otomatik turun beklediği koşul (Wi-Fi, şarj…); tur koşunca `null`. */
  sonBekleme: BeklemeNedeni | null;
}

export const VARSAYILAN_ESITLEME_DURUMU: EsitlemeDurumu = {
  aktif: false,
  saglayici: null,
  sonEtiket: null,
  sonOzet: null,
  sonEsitleme: null,
  sonHata: null,
  sonDeneme: null,
  sonBekleme: null,
};

/** Diskten gelen değeri güvenle `EsitlemeDurumu`'na çevirir (bozuk → varsayılan). */
const BEKLEME_NEDENLERI: readonly BeklemeNedeni[] = ['elle', 'siklik', 'agYok', 'wifi', 'sarj', 'gucTasarrufu', 'veriTasarrufu'];

export function esitlemeDurumunuNormalizeEt(deger: unknown): EsitlemeDurumu {
  if (!deger || typeof deger !== 'object') return { ...VARSAYILAN_ESITLEME_DURUMU };
  const d = deger as Partial<EsitlemeDurumu>;
  const metinVeyaNull = (x: unknown): string | null => (typeof x === 'string' ? x : null);
  const saglayici: SaglayiciKimligi | null =
    d.saglayici === 'googleDrive' || d.saglayici === 'icloud' ? d.saglayici : null;
  return {
    aktif: d.aktif === true && saglayici !== null,
    saglayici,
    sonEtiket: metinVeyaNull(d.sonEtiket),
    sonOzet: metinVeyaNull(d.sonOzet),
    sonEsitleme: metinVeyaNull(d.sonEsitleme),
    sonHata: typeof d.sonHata === 'string' ? (d.sonHata as EsitlemeHataKodu) : null,
    sonDeneme: metinVeyaNull(d.sonDeneme),
    sonBekleme: BEKLEME_NEDENLERI.includes(d.sonBekleme as BeklemeNedeni) ? (d.sonBekleme as BeklemeNedeni) : null,
  };
}
