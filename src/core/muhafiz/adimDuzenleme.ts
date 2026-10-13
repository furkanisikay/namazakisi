/**
 * Hatırlatma EKLE / SİL ve ton notu (issue #274) — SAF.
 *
 * Vakit artık 1..`MUHAFIZ_MAKS_ADIM` hatırlatma taşır. Bu dosya ekranın üç
 * kararını tek yerde tutar; bileşen yalnız sonucu yazar:
 *   - yeni hatırlatmanın VARSAYILANI ve yeri,
 *   - silmenin alt sınırı (en az bir hatırlatma kalır),
 *   - "ton geri gidiyor" notunun hangi hatırlatmada çıkacağı.
 *
 * DİZİ KRONOLOJİK KALIR: ekleme sıralı yere yapılır (ekrandaki "N. hatırlatma"
 * numarası dizi indeksidir, `yonYedegi` de indeksle hizalanır).
 */
import type { SeviyeAyari, VakitMuhafizAyari } from './matrisTipleri';
import {
  MUHAFIZ_MAKS_ADIM,
  MUHAFIZ_MIN_ADIM,
  SEVIYE_KADEMELERI,
  VARSAYILAN_SES,
} from './matrisTipleri';
import { VARSAYILAN_PENCERE_YONU, type PencereYonu } from './pencereTipleri';
import { kronolojikSirala } from './aktifSeviye';
import { esikSinirlariniHesapla, ESIK_MUTLAK_MIN } from './esikSinirlari';
import { etkinKademe } from './motorAdaptoru';
import { adimKapaliMi } from './kanalKumesi';

/** Yeni hatırlatma en erken hatırlatmadan bu kadar ÖNCE konur. */
export const YENI_ADIM_ONCESI_DK = 15;
/** Yeni hatırlatmanın varsayılan tekrar aralığı. */
export const YENI_ADIM_TEKRAR_DK = 15;

/** Vakte bir hatırlatma daha eklenebilir mi? */
export const adimEklenebilirMi = (vakitAyari: VakitMuhafizAyari): boolean =>
  vakitAyari.seviyeler.length < MUHAFIZ_MAKS_ADIM;

/** Bu hatırlatma silinebilir mi? (En az bir hatırlatma kalır.) */
export const adimSilinebilirMi = (vakitAyari: VakitMuhafizAyari): boolean =>
  vakitAyari.seviyeler.length > MUHAFIZ_MIN_ADIM;

/**
 * Yeni hatırlatmanın eşiği: en ERKEN hatırlatmanın 15 dk öncesi, pencereye
 * sığacak şekilde kırpılır; dolu dakikaya düşerse en yakın boş dakikaya kayar.
 *
 * - Çıkışta "önce" = daha BÜYÜK eşik (vaktin çıkmasına daha çok varken).
 * - Girişte "önce" = daha KÜÇÜK eşik (vakit girdikten daha kısa süre sonra).
 *
 * Boş dakika yoksa `null` (pratikte olmaz: 6 adım < pencere).
 */
export function yeniAdimEsigi(
  seviyeler: readonly SeviyeAyari[],
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
  pencereUzunluguDk?: number
): number | null {
  const tavan = esikSinirlariniHesapla([], 0, { pencereUzunluguDk }).max;
  const dolu = new Set(seviyeler.map((s) => s.esikDk));
  const girisYonu = yon === 'girisindenItibaren';

  const ilk = kronolojikSirala(seviyeler, yon)[0];
  const hedef = ilk
    ? girisYonu
      ? ilk.esikDk - YENI_ADIM_ONCESI_DK
      : ilk.esikDk + YENI_ADIM_ONCESI_DK
    : 30;
  const kirpilmis = Math.min(tavan, Math.max(ESIK_MUTLAK_MIN, hedef));

  // Önce "daha erken" yöne, sonra öbür yöne doğru en yakın boş dakika.
  const erkenAdim = girisYonu ? -1 : 1;
  for (let fark = 0; fark <= tavan; fark++) {
    for (const aday of [kirpilmis + erkenAdim * fark, kirpilmis - erkenAdim * fark]) {
      if (aday >= ESIK_MUTLAK_MIN && aday <= tavan && !dolu.has(aday)) return aday;
    }
  }
  return null;
}

/**
 * Vakte yeni bir hatırlatma ekler. Varsayılan: NAZİK ton, yalnız bildirim,
 * 15 dk'da bir tekrar; ses uygulama sesi, anons metni boş (sesli kanal
 * açılınca ekran şablonla doldurur).
 *
 * Eklenemiyorsa (en fazla 6) AYNI referans döner.
 *
 * `yonYedegi` TEMİZLENİR: yedek adım adım (indeksle) hizalıdır; adım sayısı
 * değişince bayatlar — bırakılsaydı geri dönüşte yanlış adımlara yazılırdı
 * (zaten `yonYedegiGecerliMi` uzunluk farkını reddeder, bu yalnız temizlik).
 */
export function adimEkle(
  vakitAyari: VakitMuhafizAyari,
  pencereUzunluguDk?: number
): VakitMuhafizAyari {
  if (!adimEklenebilirMi(vakitAyari)) return vakitAyari;
  const yon = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
  const esikDk = yeniAdimEsigi(vakitAyari.seviyeler, yon, pencereUzunluguDk);
  if (esikDk === null) return vakitAyari;

  const yeni: SeviyeAyari = {
    kademe: 'nazik',
    kanallar: { bildirim: true },
    esikDk,
    siklik: { herDk: YENI_ADIM_TEKRAR_DK },
    bildirimSesi: VARSAYILAN_SES,
    acilKanal: false,
    anonsMetni: '',
  };
  return {
    ...vakitAyari,
    seviyeler: kronolojikSirala([...vakitAyari.seviyeler, yeni], yon),
    yonYedegi: undefined,
  };
}

/** `indeks`teki hatırlatmayı siler; son hatırlatma silinemez (AYNI referans). */
export function adimSil(vakitAyari: VakitMuhafizAyari, indeks: number): VakitMuhafizAyari {
  if (!adimSilinebilirMi(vakitAyari)) return vakitAyari;
  if (indeks < 0 || indeks >= vakitAyari.seviyeler.length) return vakitAyari;
  return {
    ...vakitAyari,
    seviyeler: vakitAyari.seviyeler.filter((_, i) => i !== indeks),
    yonYedegi: undefined,
  };
}

/**
 * Ton GERİ gidiyor mu? Kronolojik sırada bir hatırlatmanın (AÇIK olanlar
 * arasında) tonu bir öncekinden YUMUŞAKSA o hatırlatmanın 1'den başlayan
 * numarası, yoksa 0.
 *
 * Motor bunu ENGELLEMEZ (Fable kararı): bilinçli bir seçim olabilir ("sert
 * hatırlat, sonra nazikçe tekrar et"). Ekran yalnız kısa bir not düşer.
 * Ton `etkinKademe` ile okunur — acil kısıtı yüzünden sert konuşan adım
 * ekranda da sert görünür, not da ona göre çıkar.
 */
export function tonGeriGidenAdim(
  seviyeler: readonly SeviyeAyari[],
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): number {
  const sirali = kronolojikSirala(seviyeler, yon);
  let oncekiSertlik = -1;
  for (let i = 0; i < sirali.length; i++) {
    const s = sirali[i];
    if (adimKapaliMi(s.kanallar)) continue; // kapalı adım konuşmaz, notu da tetiklemez
    const sertlik = SEVIYE_KADEMELERI.indexOf(etkinKademe(s, yon));
    if (sertlik < oncekiSertlik) return i + 1;
    oncekiSertlik = sertlik;
  }
  return 0;
}
