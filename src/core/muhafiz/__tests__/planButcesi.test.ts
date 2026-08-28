import {
  etkinSiklikHesapla,
  cikisSegmentiHesapla,
  girisSegmentiHesapla,
  PLAN_ADIM_UST_SINIRI,
} from '../planButcesi';
import type { SeviyeAyari, SeviyeKademe, Siklik, UyariModu } from '../matrisTipleri';

const sv = (
  kademe: SeviyeKademe,
  esikDk: number,
  siklikDk: number | 'birkez' = 'birkez',
  mod: UyariModu = 'bildirim'
): SeviyeAyari => ({
  kademe,
  mod,
  esikDk,
  siklik: siklikDk === 'birkez' ? 'birkez' : { herDk: siklikDk },
  bildirimSesi: 'varsayilan',
  anonsMetni: '',
});

/** Varsayılan (göç) matrisin bir vakit satırı: 45/25/10/3 — 15/10/5/1 */
const varsayilanSeviyeler = () => [
  sv('nazik', 45, 15),
  sv('uyari', 25, 10),
  sv('sert', 10, 5),
  sv('acil', 3, 1),
];

describe('cikisSegmentiHesapla — seviyenin GERÇEKTEN kazandığı açıklık', () => {
  test('segment, bir alttaki AÇIK komşunun eşiğine kadardır', () => {
    const s = varsayilanSeviyeler();
    expect(cikisSegmentiHesapla(s, s[0])).toBe(20); // 45 - 25
    expect(cikisSegmentiHesapla(s, s[1])).toBe(15); // 25 - 10
    expect(cikisSegmentiHesapla(s, s[2])).toBe(7); // 10 - 3
    expect(cikisSegmentiHesapla(s, s[3])).toBe(3); // 3 - 0 (en acil)
  });

  test('KAPALI komşunun segmentini üstteki devralır (aktifSeviyeyiBul ile aynı kural)', () => {
    const s = [sv('nazik', 120, 1), sv('uyari', 60, 1, 'sessiz'), sv('sert', 30, 1), sv('acil', 10, 1, 'sessiz')];
    // uyarı kapalı → nazik 30'a kadar kazanır (60'a kadar değil)
    expect(cikisSegmentiHesapla(s, s[0])).toBe(90);
    // acil kapalı → sert tabana kadar kazanır
    expect(cikisSegmentiHesapla(s, s[2])).toBe(30);
  });

  test('tek açık seviye tüm pencereyi kazanır', () => {
    const s = [sv('nazik', 720, 1), sv('uyari', 60, 1, 'sessiz'), sv('sert', 30, 1, 'sessiz'), sv('acil', 10, 1, 'sessiz')];
    expect(cikisSegmentiHesapla(s, s[0])).toBe(720);
  });
});

/**
 * Faz 1 ikizi — `girisindenItibaren` yönünde seviye, KENDİ eşiğinden bir SONRAKİ
 * daha sert AÇIK komşunun eşiğine kadar kazanır; en sert adım pencere sonuna kadar.
 */
describe('girisSegmentiHesapla — giriş yönünde kazanılan açıklık', () => {
  const artan = () => [
    sv('nazik', 5, 10),
    sv('uyari', 60, 15),
    sv('sert', 120, 20),
    sv('acil', 180, 30),
  ];

  test('segment, bir SONRAKİ açık komşunun eşiğine kadardır', () => {
    const s = artan();
    expect(girisSegmentiHesapla(s, s[0], 240)).toBe(55); // 60 - 5
    expect(girisSegmentiHesapla(s, s[1], 240)).toBe(60); // 120 - 60
    expect(girisSegmentiHesapla(s, s[2], 240)).toBe(60); // 180 - 120
  });

  test('en sert adım PENCERE SONUNA kadar kazanır', () => {
    const s = artan();
    expect(girisSegmentiHesapla(s, s[3], 240)).toBe(60); // 240 - 180
  });

  test('KAPALI komşu atlanır (aktifSeviyeyiBul ile aynı kural)', () => {
    const s = [
      sv('nazik', 5, 10),
      sv('uyari', 60, 15, 'sessiz'),
      sv('sert', 120, 20),
      sv('acil', 180, 30, 'sessiz'),
    ];
    expect(girisSegmentiHesapla(s, s[0], 240)).toBe(115); // 120 - 5
    expect(girisSegmentiHesapla(s, s[2], 240)).toBe(120); // 240 - 120
  });

  test('pencere bilinmiyorsa GÜVENLİ taban: seviyenin kendi eşiği', () => {
    const s = artan();
    expect(girisSegmentiHesapla(s, s[3])).toBe(s[3].esikDk);
  });

  test('700 dk pencerede dört adımın hiçbiri üst sınırı aşmaz', () => {
    const s = [sv('nazik', 5, 1), sv('uyari', 15, 1), sv('sert', 30, 1), sv('acil', 45, 1)];
    for (const seviye of s) {
      const span = girisSegmentiHesapla(s, seviye, 700);
      const etkin = etkinSiklikHesapla(span, seviye.siklik);
      const herDk = etkin === 'birkez' ? span : etkin.herDk;
      expect(Math.floor(span / herDk)).toBeLessThanOrEqual(PLAN_ADIM_UST_SINIRI);
    }
  });
});

describe('etkinSiklikHesapla (SEVİYE başına plan bütçesi)', () => {
  test('üst sınır SEVİYE başınadır ve 15’tir', () => {
    expect(PLAN_ADIM_UST_SINIRI).toBe(15);
  });

  test('720 dk açıklık + 1 dk sıklık → 48 dk (ceil(720/15))', () => {
    expect(etkinSiklikHesapla(720, { herDk: 1 })).toEqual({ herDk: 48 });
  });

  test('bütçe uygulanınca seviyenin tetik sayısı üst sınırı AŞMAZ', () => {
    const span = 720;
    const etkin = etkinSiklikHesapla(span, { herDk: 1 });
    const herDk = etkin === 'birkez' ? span : etkin.herDk;
    expect(Math.floor(span / herDk) + 1).toBeLessThanOrEqual(PLAN_ADIM_UST_SINIRI + 1);
    expect(Math.floor(span / herDk)).toBeLessThanOrEqual(PLAN_ADIM_UST_SINIRI);
  });

  test('VARSAYILAN matris HİÇ seyrelmez (aynı referans döner)', () => {
    // En önemli nöbetçi: bugünkü davranış birebir korunmalı, "seyreltildi"
    // bilgi satırı varsayılan ayarda ASLA yanmamalı.
    const s = varsayilanSeviyeler();
    for (const seviye of s) {
      expect(etkinSiklikHesapla(cikisSegmentiHesapla(s, seviye), seviye.siklik)).toBe(seviye.siklik);
    }
  });

  test('sınır: 15 dk açıklık + 1 dk sıklık seyrelmez, 16 dk seyrelir', () => {
    const siklik: Siklik = { herDk: 1 };
    expect(etkinSiklikHesapla(15, siklik)).toBe(siklik);
    expect(etkinSiklikHesapla(16, { herDk: 1 })).toEqual({ herDk: 2 });
  });

  test("'birkez' sıklığa HİÇ DOKUNULMAZ (formül yalnız {herDk} kolunda)", () => {
    expect(etkinSiklikHesapla(720, 'birkez')).toBe('birkez');
    expect(etkinSiklikHesapla(1, 'birkez')).toBe('birkez');
  });

  test('bozuk girdi savunması: sıklık aynen döner (motor kendi kapısında susturur)', () => {
    const sifir: Siklik = { herDk: 0 };
    expect(etkinSiklikHesapla(720, sifir)).toBe(sifir);
    const negatif: Siklik = { herDk: -5 };
    expect(etkinSiklikHesapla(720, negatif)).toBe(negatif);
    const normal: Siklik = { herDk: 3 };
    expect(etkinSiklikHesapla(0, normal)).toBe(normal);
    expect(etkinSiklikHesapla(Number.NaN, normal)).toBe(normal);
  });
});
