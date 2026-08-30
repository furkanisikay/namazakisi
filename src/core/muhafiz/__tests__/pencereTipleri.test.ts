import {
  olcuDkHesapla,
  pencereSinirlariniCoz,
  VARSAYILAN_PENCERE_YONU,
  type HatirlatmaPenceresi,
} from '../pencereTipleri';

const tarih = (gun: number, saat: number, dakika: number, saniye = 0) =>
  new Date(2026, 0, gun, saat, dakika, saniye);

/** Öğle 12:00 → ikindi 15:00 (180 dk) */
const ogle = (yon: HatirlatmaPenceresi['yon']): HatirlatmaPenceresi => ({
  kaynak: 'vakit:ogle',
  baslangic: tarih(15, 12, 0),
  bitis: tarih(15, 15, 0),
  yon,
});

describe('olcuDkHesapla — iki yön', () => {
  test('varsayılan yön çıkışa doğrudur (eski davranış)', () => {
    expect(VARSAYILAN_PENCERE_YONU).toBe('cikisaDogru');
  });

  test("'cikisaDogru' → ölçü = bitiş − şimdi (kalan dakika)", () => {
    expect(olcuDkHesapla(ogle('cikisaDogru'), tarih(15, 14, 0))).toBe(60);
    expect(olcuDkHesapla(ogle('cikisaDogru'), tarih(15, 12, 5))).toBe(175);
  });

  test("'girisindenItibaren' → ölçü = şimdi − başlangıç (geçen dakika)", () => {
    expect(olcuDkHesapla(ogle('girisindenItibaren'), tarih(15, 14, 0))).toBe(120);
    expect(olcuDkHesapla(ogle('girisindenItibaren'), tarih(15, 12, 5))).toBe(5);
  });

  test('saniyeler AŞAĞI yuvarlanır (iki yönde de tam dakika)', () => {
    // 59 sn geçmiş: giriş yönünde henüz 0. dakika
    expect(olcuDkHesapla(ogle('girisindenItibaren'), tarih(15, 12, 0, 59))).toBe(0);
    // Çıkışa 60 dk 59 sn kalmış: 60. dakika
    expect(olcuDkHesapla(ogle('cikisaDogru'), tarih(15, 13, 59, 1))).toBe(60);
  });
});

describe('olcuDkHesapla — gece yarısını aşan pencere', () => {
  /**
   * Yatsı 21:15 → imsak 05:15. Ekranın o günkü vakit tablosu iki değeri de AYNI
   * takvim gününe koyar; fark negatif çıkar ve sarma uygulanmazsa pencere ters
   * görünür (`pencereUzunluguDkHesapla` ile aynı sözleşme).
   */
  const yatsi = (yon: HatirlatmaPenceresi['yon']): HatirlatmaPenceresi => ({
    kaynak: 'vakit:yatsi',
    baslangic: tarih(15, 21, 15),
    bitis: tarih(15, 5, 15),
    yon,
  });

  test('bitiş girişten önceyse +24 sa sarılır (pencere 480 dk)', () => {
    const { baslangicMs, bitisMs } = pencereSinirlariniCoz(yatsi('cikisaDogru'));
    expect((bitisMs - baslangicMs) / 60000).toBe(480);
  });

  test('gece yarısından ÖNCE: iki yön de doğru ölçer', () => {
    expect(olcuDkHesapla(yatsi('cikisaDogru'), tarih(15, 23, 15))).toBe(360);
    expect(olcuDkHesapla(yatsi('girisindenItibaren'), tarih(15, 23, 15))).toBe(120);
  });

  test('gece yarısından SONRA: mutlak tarihlerle ölçü sürer', () => {
    expect(olcuDkHesapla(yatsi('cikisaDogru'), tarih(16, 4, 15))).toBe(60);
    expect(olcuDkHesapla(yatsi('girisindenItibaren'), tarih(16, 4, 15))).toBe(420);
  });
});

describe('olcuDkHesapla — pencere dışı', () => {
  test('vakit çıktıktan sonra çıkış ölçüsü NEGATİF olur (motor kapısı eler)', () => {
    expect(olcuDkHesapla(ogle('cikisaDogru'), tarih(15, 15, 30))).toBe(-30);
  });

  test('vakit girmeden önce giriş ölçüsü NEGATİF olur', () => {
    expect(olcuDkHesapla(ogle('girisindenItibaren'), tarih(15, 11, 30))).toBe(-30);
  });

  test('vakit çıktıktan sonra giriş ölçüsü pencereyi AŞAR (adım eşiği bitmiştir)', () => {
    expect(olcuDkHesapla(ogle('girisindenItibaren'), tarih(15, 15, 30))).toBe(210);
  });

  test('bozuk tarih → 0 (NaN sızdırmaz)', () => {
    const bozuk: HatirlatmaPenceresi = {
      kaynak: 'vakit:ogle',
      baslangic: new Date(Number.NaN),
      bitis: tarih(15, 15, 0),
      yon: 'cikisaDogru',
    };
    expect(olcuDkHesapla(bozuk, tarih(15, 14, 0))).toBe(0);
  });
});
