import { zincirBaglari } from '../zincir';
import { GunDurumu, IzgaraGunu } from '../aylikIzgara';

const gun = (tarih: string, durum: GunDurumu, digerAy = false): IzgaraGunu => ({
  tarih,
  gunNo: Number(tarih.slice(-2)),
  digerAy,
  durum,
});

const tam5 = (tarih: string, digerAy = false): IzgaraGunu =>
  gun(tarih, { tip: 'kilindi', vakitler: [true, true, true, true, true] }, digerAy);

const kilinanSayi = (tarih: string, sayi: number, digerAy = false): IzgaraGunu => {
  const vakitler = Array.from({ length: 5 }, (_, i) => i < sayi);
  return gun(tarih, { tip: 'kilindi', vakitler }, digerAy);
};

const dondurulmus = (tarih: string, digerAy = false): IzgaraGunu =>
  gun(tarih, { tip: 'dondurulmus' }, digerAy);

const gelecek = (tarih: string, digerAy = false): IzgaraGunu => gun(tarih, { tip: 'gelecek' }, digerAy);

describe('zincirBaglari', () => {
  test('yalnizca zincirKorur olan ardisik ciftler arasinda bag kurulur', () => {
    const izgara = [tam5('2026-07-01'), kilinanSayi('2026-07-02', 2), tam5('2026-07-03')];
    const baglar = zincirBaglari(izgara, 5);
    // 0-1 arasi: gun1 esigi karsilamiyor -> bag YOK. 1-2 arasi da YOK.
    expect(baglar).toHaveLength(0);
  });

  test('ay sinirinda bag KURULUR (30 Haziran -> 1 Temmuz)', () => {
    const izgara = [tam5('2026-06-30', true), tam5('2026-07-01', false)];
    const baglar = zincirBaglari(izgara, 5);
    expect(baglar).toHaveLength(1);
    expect(baglar[0].indeks).toBe(0);
  });

  test('dondurulmus gun zinciri korur (gelecek gun korumaz)', () => {
    const izgaraDondurulmus = [tam5('2026-07-01'), dondurulmus('2026-07-02'), tam5('2026-07-03')];
    const baglarDondurulmus = zincirBaglari(izgaraDondurulmus, 5);
    expect(baglarDondurulmus).toHaveLength(2); // 0-1 ve 1-2

    const izgaraGelecek = [tam5('2026-07-01'), gelecek('2026-07-02'), tam5('2026-07-03')];
    const baglarGelecek = zincirBaglari(izgaraGelecek, 5);
    expect(baglarGelecek).toHaveLength(0);
  });

  test('satir sonunda (indeks % 7 === 6) satirSarmasi true isaretlenir', () => {
    // 8 gunluk tam-dolu bir dizi: indeks 6-7 arasi satir sarmasidir.
    const izgara = Array.from({ length: 8 }, (_, i) =>
      tam5(`2026-07-${String(i + 1).padStart(2, '0')}`)
    );
    const baglar = zincirBaglari(izgara, 5);
    expect(baglar).toHaveLength(7);
    const satirSarmaBagi = baglar.find((b) => b.indeks === 6);
    expect(satirSarmaBagi?.satirSarmasi).toBe(true);
    expect(baglar.filter((b) => b.indeks !== 6).every((b) => b.satirSarmasi === false)).toBe(true);
  });

  test('ikisiTam yalnizca iki ucun da HARFIYEN 5/5 oldugu bagda true olur', () => {
    // esik=3 iken 4/5 de "tam" sayilir ama 5/5 degildir -> ikisiTam false olmali.
    const izgara = [kilinanSayi('2026-07-01', 4), tam5('2026-07-02'), tam5('2026-07-03')];
    const baglar = zincirBaglari(izgara, 3);
    expect(baglar).toHaveLength(2);
    const bagDortBes = baglar.find((b) => b.indeks === 0);
    const bagBesBes = baglar.find((b) => b.indeks === 1);
    expect(bagDortBes?.ikisiTam).toBe(false);
    expect(bagBesBes?.ikisiTam).toBe(true);
  });

  test('esik degisince (3 vs 5) bag sayisi degisir', () => {
    // Uc gun de 4/5 kilinmis: esik=3 -> hepsi tam, esik=5 -> hicbiri tam degil.
    const izgara = [kilinanSayi('2026-07-01', 4), kilinanSayi('2026-07-02', 4), kilinanSayi('2026-07-03', 4)];

    const baglarDusukEsik = zincirBaglari(izgara, 3);
    expect(baglarDusukEsik).toHaveLength(2);

    const baglarYuksekEsik = zincirBaglari(izgara, 5);
    expect(baglarYuksekEsik).toHaveLength(0);
  });
});
