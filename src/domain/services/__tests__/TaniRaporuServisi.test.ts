jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 34, constants: { Model: 'SM-S721B', Release: '16' } },
}));
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { exportLogs: () => 'konum 41.0082, 28.9784\nKaza render error' },
}));

import { loglariMaskele, taniRaporuOlustur } from '../TaniRaporuServisi';
import { UYGULAMA } from '../../../core/constants/UygulamaSabitleri';

describe('loglariMaskele', () => {
  test('konumDahil=false → koordinatları gizler', () => {
    const m = loglariMaskele('Yeni konum: 41.0082, 28.9784 alindi', { konumDahil: false });
    expect(m).toContain('[konum gizlendi]');
    expect(m).not.toContain('41.0082');
    expect(m).not.toContain('28.9784');
  });

  test('konumDahil=true → koordinatı şehir düzeyine (toFixed 1) indirir', () => {
    const m = loglariMaskele('konum 41.0082, 28.9784', { konumDahil: true });
    expect(m).toContain('41.0');
    expect(m).toContain('29.0');
    expect(m).not.toContain('41.0082');
    expect(m).not.toContain('28.9784');
  });

  test('token/anahtar desenlerini redakte eder', () => {
    const m = loglariMaskele('token=abc123secret api_key: ZZZ', { konumDahil: false });
    expect(m).not.toContain('abc123secret');
    expect(m).not.toContain('ZZZ');
    expect(m).toContain('[gizlendi]');
  });

  test('Authorization: Bearer <jwt> → JWT tümden gizlenir', () => {
    const m = loglariMaskele('Authorization: Bearer eyJ0.payload.sig', { konumDahil: false });
    expect(m).not.toContain('eyJ0');
    expect(m).not.toContain('payload.sig');
    expect(m).toContain('[gizlendi]');
  });

  test('SIR koordinatı yutmamalı: "secret 41.0082, 28.9784" → koordinat sızmaz', () => {
    const m = loglariMaskele('secret 41.0082, 28.9784', { konumDahil: false });
    expect(m).not.toContain('41.0082');
    expect(m).not.toContain('28.9784');
    expect(m).toContain('[gizlendi]');
  });

  test('tırnaklı çok-kelimeli sır → değer tümden gizlenir', () => {
    const m = loglariMaskele('"password": "my secret password"', { konumDahil: false });
    expect(m).not.toContain('secret password');
    expect(m).not.toContain('my secret password');
    expect(m).toContain('[gizlendi]');
  });

  test('konumDahil=false → büyük-harfli "Il" alanındaki şehir adını gizler', () => {
    const log = 'Data: {\n  "Il": "Istanbul",\n  "konumModu": "manuel"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    expect(m).not.toContain('Istanbul');
    expect(m).toContain('[konum gizlendi]');
  });

  test('konumDahil=false → adres alanını gizler', () => {
    const log = 'Data: {\n  "adres": "Atatürk Cad. No:5",\n  "konumModu": "manuel"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    expect(m).not.toContain('Atatürk Cad. No:5');
    expect(m).toContain('[konum gizlendi]');
    expect(m).toContain('"konumModu": "manuel"');
  });

  test('sıradan teknik logu değiştirmez', () => {
    const girdi = 'KazaDefteriSayfasi: render error stack at line 5';
    expect(loglariMaskele(girdi, { konumDahil: false })).toBe(girdi);
  });

  // exportLogs() formatı: [tarih] [SEVİYE] [TAG] mesaj\nData: {"alan": "değer"}
  const exampleLogLine =
    '[2024-01-01T10:00:00.000Z] [INFO] [LocalKonumServisi] Yuklenen veri:\nData: {\n  "mod": "manuel",\n  "il": "Istanbul"\n}';

  test('konumDahil=false → il alanındaki şehir adını gizler', () => {
    const m = loglariMaskele(exampleLogLine, { konumDahil: false });
    expect(m).not.toContain('Istanbul');
    expect(m).toContain('[konum gizlendi]');
    // Alan adı ve yapı korunmalı
    expect(m).toContain('"il"');
  });

  test('konumDahil=true → il alanındaki şehir adı korunur', () => {
    const m = loglariMaskele(exampleLogLine, { konumDahil: true });
    expect(m).toContain('Istanbul');
    expect(m).not.toContain('[konum gizlendi]');
  });

  test('konumDahil=false → seciliIlAdi alanını gizler', () => {
    const log =
      '[2024-01-01T10:00:00.000Z] [DEBUG] [KonumSlice] State guncelleniyor (sync)\nData: {\n  "konumModu": "manuel",\n  "seciliIlAdi": "Ankara"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    expect(m).not.toContain('Ankara');
    expect(m).toContain('[konum gizlendi]');
    // konumModu gibi konum-dışı alan etkilenmemeli
    expect(m).toContain('"konumModu": "manuel"');
  });

  test('konumDahil=false → ilce alanını gizler', () => {
    const log = 'Data: {\n  "ilce": "Kadıköy",\n  "il": "Istanbul"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    expect(m).not.toContain('Kadıköy');
    expect(m).not.toContain('Istanbul');
    expect(m).toContain('[konum gizlendi]');
  });

  test('konumDahil=false → konum-dışı string alanı etkilenmez', () => {
    const log = 'Data: {\n  "mesaj": "islem tamam",\n  "tag": "LocalKonumServisi"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    // "mesaj" ve "tag" şehir alanı değil — maskelenmemeli
    expect(m).toContain('"mesaj": "islem tamam"');
    expect(m).toContain('"tag": "LocalKonumServisi"');
  });

  test('1-ondalıklı koordinatı gizler (konumDahil=false)', () => {
    const m = loglariMaskele('Yeni konum: 41.0, 28.9 alindi', { konumDahil: false });
    expect(m).toContain('[konum gizlendi]');
    expect(m).not.toContain('41.0, 28.9');
  });

  test('1-ondalıklı koordinatı konumDahil=true ile korur', () => {
    const m = loglariMaskele('konum 41.0, 28.9', { konumDahil: true });
    expect(m).toContain('41.0');
    expect(m).toContain('28.9');
  });

  test('negatif ve çoklu koordinat çiftlerini gizler (konumDahil=false)', () => {
    const m = loglariMaskele('a 41.0, -0.12 b 38.4, 27.1', { konumDahil: false });
    expect(m).not.toContain('41.0, -0.12');
    expect(m).not.toContain('38.4, 27.1');
  });
});

describe('taniRaporuOlustur', () => {
  test('konu sürümü içerir, gövde ortam+bağlam taşır, log maskeli (konum kapalı)', () => {
    const r = taniRaporuOlustur({ baglam: 'Kaza sayfası yüklenemedi', konumDahil: false, neOldu: 'açılmadı' });
    expect(r.konu).toContain(UYGULAMA.VERSIYON);
    expect(r.govde).toContain('Kaza sayfası yüklenemedi');
    expect(r.govde).toContain('SM-S721B');
    expect(r.govde).toContain('açılmadı');
    expect(r.logMetni).toContain('[konum gizlendi]');
    expect(r.logMetni).not.toContain('41.0082');
  });

  test('konumDahil=true → log şehir düzeyi konum içerir', () => {
    const r = taniRaporuOlustur({ konumDahil: true });
    expect(r.logMetni).toContain('41.0');
  });
});
