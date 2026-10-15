import type { SeviyeAyari, VakitMuhafizAyari } from './matrisTipleri';
import { SEVIYE_KADEMELERI } from './matrisTipleri';
import { VARSAYILAN_PENCERE_YONU, type PencereYonu } from './pencereTipleri';
import { adimKapaliMi } from './kanalKumesi';

/**
 * `olcuDk` anında hangi adım konuşur?
 *
 * KAPSAMA ve KAZANAN kuralı YÖNE GÖRE TERS DÖNER (Faz 1 / B1):
 *
 * | Yön                 | Kapsama          | Kazanan        | Eşik sırası    |
 * |---------------------|------------------|----------------|----------------|
 * | `cikisaDogru`       | `olcuDk <= esik` | en KÜÇÜK eşik  | kesin AZALAN   |
 * | `girisindenItibaren`| `olcuDk >= esik` | en BÜYÜK eşik  | kesin ARTAN    |
 *
 * Giriş yönünde "en küçük eşik kazanır" kuralı KORUNSAYDI eskalasyon tersine
 * dönerdi: 1. dakikada tüm eşikler kapsanır, en acil kademe kazanır → kullanıcı
 * vakit girer girmez "VAKİT ÇIKIYOR!" tonuyla karşılanır, süre geçtikçe
 * nazikleşir ve en büyük eşik aşılınca motor tümden susardı.
 *
 * EŞİT eşikte tie-break İKİ YÖNDE DE aynıdır: daha sert kademe kazanır. Eşit
 * eşikte iki adım aynı dakika kümesini kapsar; hangisi kaybederse kalıcı gölgede
 * kalır. Sertin kazanması eskalasyonun geri gitmemesini ve iki yön arasındaki
 * simetriyi korur (eski global ayardan göç eden matriste eşit eşik olabilir).
 *
 * KAPALI adım (hiçbir kanalı açık değil) İKİ YÖNDE DE pencere sağlamaz —
 * segmentini bir üst adım devralır.
 */
export function aktifSeviyeyiBul(
  vakitAyari: VakitMuhafizAyari,
  olcuDk: number
): SeviyeAyari | null {
  const yon: PencereYonu = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
  const girisYonu = yon === 'girisindenItibaren';

  const kapsayan = vakitAyari.seviyeler
    .filter((s) => !adimKapaliMi(s.kanallar) && (girisYonu ? olcuDk >= s.esikDk : olcuDk <= s.esikDk))
    .sort((a, b) =>
      a.esikDk !== b.esikDk
        ? girisYonu
          ? b.esikDk - a.esikDk
          : a.esikDk - b.esikDk
        : SEVIYE_KADEMELERI.indexOf(b.kademe) - SEVIYE_KADEMELERI.indexOf(a.kademe)
    );
  return kapsayan[0] ?? null;
}

/**
 * Adımların KRONOLOJİK (eşiğe göre sıralı) görünümü — issue #274.
 *
 * Çıkışta en erken uyarı en BÜYÜK eşiktir (eşik AZALAN), girişte en KÜÇÜK
 * (eşik ARTAN). Dizi indeksi artık tonu (`kademe`) ima etmez; "N. hatırlatma"
 * numarası, sınır hesabı ve plan sırası bu görünümden gelir. Eşit eşikte
 * (yalnız bozuk/eski kayıt) sıralama kararlıdır — dizideki sıra korunur.
 *
 * Kopya döner, girdiye dokunmaz (Immer'ın dondurduğu diziler de güvenle verilir).
 */
export function kronolojikSirala<T extends { esikDk: number }>(
  seviyeler: readonly T[],
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): T[] {
  const girisYonu = yon === 'girisindenItibaren';
  return seviyeler
    .map((s, i) => ({ s, i }))
    .sort((a, b) =>
      a.s.esikDk !== b.s.esikDk
        ? girisYonu
          ? a.s.esikDk - b.s.esikDk
          : b.s.esikDk - a.s.esikDk
        : a.i - b.i
    )
    .map((x) => x.s);
}

/**
 * Bir adımın kronolojik sıra numarası (0'dan) — `UyariPlani.adimIndeks` ve
 * ekrandaki "N. hatırlatma" etiketi buradan beslenir. Adım listede yoksa -1.
 */
export function kronolojikIndeks(
  seviyeler: readonly SeviyeAyari[],
  seviye: SeviyeAyari,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): number {
  return kronolojikSirala(seviyeler, yon).indexOf(seviye);
}

/**
 * Eşikler TEKİL mi? (`matrisGecerliMi` kapısı — issue #274.)
 *
 * Eşit eşikli iki adım aynı dakikaları kapsar ve biri kalıcı gölgede kalır;
 * değişken uzunluklu dizide "N. hatırlatma" numarası da belirsizleşir.
 */
export function esiklerTekilMi(seviyeler: readonly { esikDk: number }[]): boolean {
  return new Set(seviyeler.map((s) => s.esikDk)).size === seviyeler.length;
}

/**
 * Eşik dizisi KRONOLOJİK sırada mı (dizi indeksi = zaman sırası)?
 * - `cikisaDogru`: kesin AZALAN (ilk hatırlatma en büyük eşiği taşır)
 * - `girisindenItibaren`: kesin ARTAN (ilk hatırlatma en küçük eşiği taşır)
 *
 * "Kesin" şart: eşit eşik iki adımı aynı dakikalara koyar, biri kalıcı gölgede
 * kalır (bkz. `aktifSeviyeyiBul` tie-break notu).
 *
 * NEDEN HÂLÂ DİZİ SIRASINA BAKIYOR (issue #274): ekran diziyi daima kronolojik
 * tutar (ekleme sıralı yere yapılır, eşik stepper'ı komşulara kilitlidir).
 * Dizi sırasıyla eşleşen iki tüketici var ve ikisi de İNDEKS hizası ister:
 * `yonYedegi` geri yüklemesi (yedek adım adım, indeksle eşlenir) ve sahadaki
 * ters eskalasyonlu eski kayıtları yakalayan `yonEsiklerineGoc`. Ton artık
 * sırayı ima etmez; bu kapı tona HİÇ bakmaz.
 */
export function esikSiralamasiGecerliMi(
  // `SeviyeAyari[]` DEGIL: yon degisimi ve goc yollari yalniz zamanlama tasiyan
  // ({esikDk, siklik}) yedekleri de bu TEK kapidan dogrulamali — ikinci bir
  // siralama yuklemi yazmak `adimKapaliMi` ikizlerinin tuzagini tekrarlardi.
  seviyeler: readonly { esikDk: number }[],
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): boolean {
  const girisYonu = yon === 'girisindenItibaren';
  for (let i = 1; i < seviyeler.length; i++) {
    const oncekiEsik = seviyeler[i - 1].esikDk;
    const esik = seviyeler[i].esikDk;
    if (girisYonu ? esik <= oncekiEsik : esik >= oncekiEsik) return false;
  }
  return true;
}
