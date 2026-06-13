/**
 * PuanlamaServisi - saf turetme fonksiyonu testleri
 * Tek dogru kaynak (namaz kayitlari) -> toplamKilinanNamaz, mukemmelGunSayisi, tabanPuan
 */

import { puanlamayiYenidenDegerlendir } from '../PuanlamaServisi';
import { NamazAdi, NAMAZ_ISIMLERI } from '../../../core/constants/UygulamaSabitleri';
import { PUAN_DEGERLERI } from '../../../core/types/SeriTipleri';

type Kayit = { tarih: string; namazAdi: NamazAdi; tamamlandi: boolean };

/** Bir gun icin verilen sayida kilinan namaz kaydi uretir (kalanlar false). */
const gunKayitlari = (tarih: string, kilinan: number): Kayit[] =>
  NAMAZ_ISIMLERI.map((namazAdi, i) => ({
    tarih,
    namazAdi,
    tamamlandi: i < kilinan,
  }));

describe('puanlamayiYenidenDegerlendir', () => {
  test('bos kayit -> hepsi sifir', () => {
    const sonuc = puanlamayiYenidenDegerlendir([], 5);
    expect(sonuc.toplamKilinanNamaz).toBe(0);
    expect(sonuc.mukemmelGunSayisi).toBe(0);
    expect(sonuc.tabanPuan).toBe(0);
  });

  test('kismi gun: kilinan sayilir, esik altinda mukemmel degil', () => {
    const sonuc = puanlamayiYenidenDegerlendir(gunKayitlari('2026-06-14', 3), 5);
    expect(sonuc.toplamKilinanNamaz).toBe(3);
    expect(sonuc.mukemmelGunSayisi).toBe(0);
    expect(sonuc.tabanPuan).toBe(3 * PUAN_DEGERLERI.namaz_kilindi);
  });

  test('mukemmel gun esige gore (tamGunEsigi=3): 3 kilinan mukemmel sayilir', () => {
    const sonuc = puanlamayiYenidenDegerlendir(gunKayitlari('2026-06-14', 3), 3);
    expect(sonuc.mukemmelGunSayisi).toBe(1);
  });

  test('tamGunEsigi=4: 3 kilinan mukemmel degil, 4 kilinan mukemmel', () => {
    expect(puanlamayiYenidenDegerlendir(gunKayitlari('2026-06-14', 3), 4).mukemmelGunSayisi).toBe(0);
    expect(puanlamayiYenidenDegerlendir(gunKayitlari('2026-06-14', 4), 4).mukemmelGunSayisi).toBe(1);
  });

  test('tamamlanmamis (false) kayitlar sayilmaz', () => {
    const kayitlar: Kayit[] = [
      { tarih: '2026-06-14', namazAdi: NamazAdi.Sabah, tamamlandi: true },
      { tarih: '2026-06-14', namazAdi: NamazAdi.Ogle, tamamlandi: false },
    ];
    const sonuc = puanlamayiYenidenDegerlendir(kayitlar, 5);
    expect(sonuc.toplamKilinanNamaz).toBe(1);
    expect(sonuc.tabanPuan).toBe(1 * PUAN_DEGERLERI.namaz_kilindi);
  });

  test('coklu gun: toplam ve mukemmel dogru toplanir', () => {
    const kayitlar = [
      ...gunKayitlari('2026-06-13', 5),
      ...gunKayitlari('2026-06-14', 5),
      ...gunKayitlari('2026-06-12', 2),
    ];
    const sonuc = puanlamayiYenidenDegerlendir(kayitlar, 5);
    expect(sonuc.toplamKilinanNamaz).toBe(12);
    expect(sonuc.mukemmelGunSayisi).toBe(2);
    expect(sonuc.tabanPuan).toBe(12 * PUAN_DEGERLERI.namaz_kilindi);
  });

  test('sparse: kaydi olmayan gun katki vermez (kilinmadi sayilir)', () => {
    // Yalnizca tek gun kaydi var; digerleri "kayit yok" -> 0
    const sonuc = puanlamayiYenidenDegerlendir(gunKayitlari('2026-06-14', 5), 5);
    expect(sonuc.toplamKilinanNamaz).toBe(5);
    expect(sonuc.mukemmelGunSayisi).toBe(1);
  });
});
