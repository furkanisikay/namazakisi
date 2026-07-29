import { gokYerlesimi, bagYolu, yolUzunlugu, Nokta } from '../gokGeometrisi';

describe('gokYerlesimi', () => {
  const olculer = {
    panelGenislik: 350,
    satirSayisi: 5,
    yatayPay: 10,
    ustPay: 20,
    satirAraligi: 15,
  };

  test('hucreGenislik = (panelGenislik - 2*yatayPay) / 7', () => {
    const yerlesim = gokYerlesimi(olculer);
    expect(yerlesim.hucreGenislik).toBeCloseTo((350 - 20) / 7, 6);
  });

  test('ilk hucrenin (indeks 0) merkezi dogru hesaplanir', () => {
    const yerlesim = gokYerlesimi(olculer);
    const merkez = yerlesim.merkez(0);
    const hucreGenislik = yerlesim.hucreGenislik;
    expect(merkez.x).toBeCloseTo(10 + hucreGenislik * 0.5, 6);
    expect(merkez.y).toBeCloseTo(20 + hucreGenislik / 2, 6);
  });

  test('satirin son hucresinin (indeks 6) merkezi dogru sutunda', () => {
    const yerlesim = gokYerlesimi(olculer);
    const merkez0 = yerlesim.merkez(0);
    const merkez6 = yerlesim.merkez(6);
    expect(merkez6.y).toBeCloseTo(merkez0.y, 6); // ayni satir
    expect(merkez6.x).toBeCloseTo(10 + yerlesim.hucreGenislik * 6.5, 6);
  });

  test('ikinci satirin ilk hucresi (indeks 7) bir satir asagida, ayni sutunda', () => {
    const yerlesim = gokYerlesimi(olculer);
    const merkez0 = yerlesim.merkez(0);
    const merkez7 = yerlesim.merkez(7);
    expect(merkez7.x).toBeCloseTo(merkez0.x, 6);
    expect(merkez7.y).toBeCloseTo(
      20 + (yerlesim.hucreGenislik + 15) * 1 + yerlesim.hucreGenislik / 2,
      6
    );
  });

  test('son hucrenin (5 satir x 7 sutun = indeks 34) merkezi dogru', () => {
    const yerlesim = gokYerlesimi(olculer);
    const merkezSon = yerlesim.merkez(34);
    expect(merkezSon.x).toBeCloseTo(10 + yerlesim.hucreGenislik * 6.5, 6);
    expect(merkezSon.y).toBeCloseTo(
      20 + (yerlesim.hucreGenislik + 15) * 4 + yerlesim.hucreGenislik / 2,
      6
    );
  });

  test('toplamYukseklik satir sayisi ve araligina gore hesaplanir', () => {
    const yerlesim = gokYerlesimi(olculer);
    expect(yerlesim.toplamYukseklik).toBeCloseTo(
      2 * 20 + 5 * yerlesim.hucreGenislik + 4 * 15,
      6
    );
  });
});

describe('bagYolu', () => {
  test('duz bag (satirSarmasi false) tek bir L komutu uretir', () => {
    const a: Nokta = { x: 10, y: 20 };
    const b: Nokta = { x: 60, y: 20 };
    expect(bagYolu(a, b, false, 999, 5)).toBe('M 10 20 L 60 20');
  });

  test('satir sarmali bag tek bir kubik C komutu uretir (kutu bicimi degil)', () => {
    const a: Nokta = { x: 300, y: 50 };
    const b: Nokta = { x: 20, y: 120 };
    const yol = bagYolu(a, b, true, 85, 12);
    expect(yol).toBe('M 300 50 C 312 85 8 85 20 120');
    // Tek bir "C" komutu olmali (kenara gidip geri donen kutu degil).
    expect(yol.match(/C/g)).toHaveLength(1);
  });
});

describe('yolUzunlugu', () => {
  test('duz yol Oklid mesafesini verir (3-4-5 ucgeni)', () => {
    expect(yolUzunlugu('M 0 0 L 3 4')).toBeCloseTo(5, 6);
  });

  test('duz yol - ayni nokta sifir uzunluk verir', () => {
    expect(yolUzunlugu('M 5 5 L 5 5')).toBeCloseTo(0, 6);
  });

  test('kubik yol - 16 adimlik orneklemenin hatasi cok ince orneklemeye (1000 adim) gore < %1', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 0, y: 100 };
    const p2 = { x: 100, y: 100 };
    const p3 = { x: 100, y: 0 };
    const yol = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;

    // "Gercek" uzunluk icin cok ince (1000 adim) bagimsiz orneklem - testin
    // kendi zemin gercegi.
    const cokInceOrneklemeUzunlugu = (adimSayisi: number): number => {
      const nokta = (t: number) => {
        const ters = 1 - t;
        return {
          x:
            ters ** 3 * p0.x +
            3 * ters ** 2 * t * p1.x +
            3 * ters * t ** 2 * p2.x +
            t ** 3 * p3.x,
          y:
            ters ** 3 * p0.y +
            3 * ters ** 2 * t * p1.y +
            3 * ters * t ** 2 * p2.y +
            t ** 3 * p3.y,
        };
      };
      let toplam = 0;
      let onceki = nokta(0);
      for (let i = 1; i <= adimSayisi; i++) {
        const su = nokta(i / adimSayisi);
        toplam += Math.hypot(su.x - onceki.x, su.y - onceki.y);
        onceki = su;
      }
      return toplam;
    };

    const gercekUzunluk = cokInceOrneklemeUzunlugu(1000);
    const hesaplananUzunluk = yolUzunlugu(yol);

    const goreceliHata = Math.abs(hesaplananUzunluk - gercekUzunluk) / gercekUzunluk;
    expect(goreceliHata).toBeLessThan(0.01);
  });
});
