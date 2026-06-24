jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 34, constants: { Model: 'SM-S721B', Release: '16' } },
}));
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { exportLogs: () => 'konum 41.0082, 28.9784\nKaza render error' },
}));

import { loglariMaskele, taniRaporuOlustur } from '../TaniRaporuServisi';

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
  });

  test('token/anahtar desenlerini redakte eder', () => {
    const m = loglariMaskele('token=abc123secret api_key: ZZZ', { konumDahil: false });
    expect(m).not.toContain('abc123secret');
    expect(m).not.toContain('ZZZ');
    expect(m).toContain('[gizlendi]');
  });

  test('sıradan teknik logu değiştirmez', () => {
    const girdi = 'KazaDefteriSayfasi: render error stack at line 5';
    expect(loglariMaskele(girdi, { konumDahil: false })).toBe(girdi);
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
    expect(r.konu).toContain('0.23.11');
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
