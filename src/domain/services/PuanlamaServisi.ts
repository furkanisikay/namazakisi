/**
 * Puanlama turetme servisi (saf, store'dan bagimsiz)
 *
 * Tek dogru kaynak namaz kayitlaridir. toplamKilinanNamaz, mukemmelGunSayisi ve
 * tabanPuan bu kayitlarin SAF FONKSIYONUDUR; diske defter olarak yazilmaz, okuma/
 * acilis aninda buradan turetilir. Boylece toggle (kildim/kilmadim) ile sayilarin
 * sismesi yapisal olarak imkansizlasir (ayni kayit kumesi her zaman ayni sonucu verir).
 *
 * Sparse semantik: kaydi olmayan gun "kilinmadi" sayilir (kayit yok != 0/5 kaydi).
 * Yol-bagimli odüller (seri/toparlanma/rozet bonusu) burada DEGIL; onlar kalici
 * append-only kalemdir (bkz. tasarim: karma turev/defter modeli).
 */

import { NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { PUAN_DEGERLERI } from '../../core/types/SeriTipleri';

/** Tek bir (gun, vakit) namaz kaydi. localVerileriSenkronizasyonIcinAl ciktisiyla uyumlu. */
export interface PuanKayitGirdisi {
  tarih: string;
  namazAdi: NamazAdi;
  tamamlandi: boolean;
}

/** Kayitlardan turetilen puanlama sonucu. */
export interface TurevPuanlama {
  toplamKilinanNamaz: number;
  mukemmelGunSayisi: number;
  tabanPuan: number;
}

/**
 * Namaz kayitlarindan turev puanlamayi hesaplar.
 *
 * @param kayitlar Tum (gun, vakit) kayitlari (yalnizca var olanlar).
 * @param tamGunEsigi Bir gunun "tam/mukemmel" sayilmasi icin gereken minimum kilinan namaz (3/4/5).
 */
export const puanlamayiYenidenDegerlendir = (
  kayitlar: PuanKayitGirdisi[],
  tamGunEsigi: number
): TurevPuanlama => {
  let toplamKilinanNamaz = 0;
  const gunlukKilinan = new Map<string, number>();

  for (const kayit of kayitlar) {
    if (!kayit.tamamlandi) continue;
    toplamKilinanNamaz += 1;
    gunlukKilinan.set(kayit.tarih, (gunlukKilinan.get(kayit.tarih) || 0) + 1);
  }

  let mukemmelGunSayisi = 0;
  for (const gunlukSayi of gunlukKilinan.values()) {
    if (gunlukSayi >= tamGunEsigi) mukemmelGunSayisi += 1;
  }

  return {
    toplamKilinanNamaz,
    mukemmelGunSayisi,
    tabanPuan: toplamKilinanNamaz * PUAN_DEGERLERI.namaz_kilindi,
  };
};
