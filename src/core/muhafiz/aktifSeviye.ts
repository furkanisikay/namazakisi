import type { SeviyeAyari, VakitMuhafizAyari } from './matrisTipleri';
import { SEVIYE_KADEMELERI } from './matrisTipleri';
import { VARSAYILAN_PENCERE_YONU, type PencereYonu } from './pencereTipleri';
import { hicKanalAcikMi } from './kanalKumesi';

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
    .filter((s) => !hicKanalAcikMi(s.kanallar) && (girisYonu ? olcuDk >= s.esikDk : olcuDk <= s.esikDk))
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
 * Eşik dizisi (SEVIYE_KADEMELERI sırası: nazik → acil) yöne uygun mu?
 * - `cikisaDogru`: kesin AZALAN (nazik en büyük eşiği taşır)
 * - `girisindenItibaren`: kesin ARTAN (nazik en küçük eşiği taşır)
 *
 * "Kesin" şart: eşit eşik iki adımı aynı dakikalara koyar, biri kalıcı gölgede
 * kalır (bkz. `aktifSeviyeyiBul` tie-break notu).
 */
export function esikSiralamasiGecerliMi(
  seviyeler: SeviyeAyari[],
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
