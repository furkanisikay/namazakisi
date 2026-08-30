import {
  anonsMetniniCoz,
  anonsSablonlari,
  varsayilanAnonsMetni,
  ANONS_SABLONLARI,
  ANONS_SABLONLARI_GIRIS,
} from '../anonsMetni';

describe('anonsMetniniCoz', () => {
  test('{vakit} ve {süre} yerine gerçek değer koyar', () => {
    expect(anonsMetniniCoz('{vakit} vakti çıkıyor, son {süre} dakika.', 'ikindi', 18))
      .toBe('İkindi vakti çıkıyor, son 18 dakika.');
  });
  test('imsak → Sabah adıyla okunur', () => {
    expect(anonsMetniniCoz('{vakit} namazı', 'imsak', 5)).toBe('Sabah namazı');
  });
  test('aynı placeholder birden çok kez geçerse hepsini değiştirir', () => {
    expect(anonsMetniniCoz('{süre} - {süre}', 'ogle', 7)).toBe('7 - 7');
  });
  test('placeholder yoksa metni aynen döndürür', () => {
    expect(anonsMetniniCoz('Namaz vakti', 'aksam', 3)).toBe('Namaz vakti');
  });
  test('şablonlar vakit-agnostik ({vakit} içerir, sabit vakit adı içermez)', () => {
    for (const s of [...ANONS_SABLONLARI, ...ANONS_SABLONLARI_GIRIS]) {
      expect(s).toContain('{vakit}');
      expect(s).not.toMatch(/İkindi|Sabah|Öğle|Akşam|Yatsı/);
    }
  });
});

describe('yön-uygun şablon havuzu', () => {
  // REGRESYON: çıkış yönü metinleri Faz 1'den ÖNCEKİ hâliyle birebir aynı kalmalı;
  // mevcut kullanıcıların hücrelerinde bu diziler yazılı duruyor.
  test('çıkış havuzu birebir korunur', () => {
    expect(ANONS_SABLONLARI).toEqual([
      '{vakit} vakti çıkıyor, son {süre} dakika.',
      '{vakit} namazını kaçırma, {süre} dakika kaldı.',
      'Vakit daralıyor, {vakit} namazına {süre} dakika.',
    ]);
  });

  test('giriş havuzu çıkış havuzuyla BİREBİR eşlenir (aynı uzunluk, indeks indeks)', () => {
    expect(ANONS_SABLONLARI_GIRIS).toHaveLength(ANONS_SABLONLARI.length);
    for (let i = 0; i < ANONS_SABLONLARI.length; i++) {
      expect(ANONS_SABLONLARI_GIRIS[i]).not.toBe(ANONS_SABLONLARI[i]);
    }
  });

  test('giriş şablonları çıkış dili KULLANMAZ (kaldı/çıkıyor/daralıyor)', () => {
    for (const s of ANONS_SABLONLARI_GIRIS) {
      expect(s).not.toMatch(/kaldı|çıkıyor|daralıyor|son \{süre\}/);
    }
  });

  test('anonsSablonlari yöne göre havuz döner; varsayılan çıkıştır', () => {
    expect(anonsSablonlari('cikisaDogru')).toBe(ANONS_SABLONLARI);
    expect(anonsSablonlari('girisindenItibaren')).toBe(ANONS_SABLONLARI_GIRIS);
    expect(anonsSablonlari()).toBe(ANONS_SABLONLARI);
  });

  test('varsayilanAnonsMetni boş kutuyu dolduran ilk şablondur', () => {
    expect(varsayilanAnonsMetni()).toBe(ANONS_SABLONLARI[0]);
    expect(varsayilanAnonsMetni('girisindenItibaren')).toBe(ANONS_SABLONLARI_GIRIS[0]);
  });
});

describe('{yön} yer tutucusu', () => {
  test('çıkış yönünde "kaldı" olur (parametresiz varsayılan dahil)', () => {
    expect(anonsMetniniCoz('{vakit} namazına {süre} dakika {yön}.', 'ogle', 12))
      .toBe('Öğle namazına 12 dakika kaldı.');
    expect(anonsMetniniCoz('{süre} dk {yön}', 'ogle', 3, 'cikisaDogru')).toBe('3 dk kaldı');
  });

  test('giriş yönünde "geçti" olur', () => {
    expect(anonsMetniniCoz('{vakit} namazına {süre} dakika {yön}.', 'ogle', 12, 'girisindenItibaren'))
      .toBe('Öğle namazına 12 dakika geçti.');
  });
});
