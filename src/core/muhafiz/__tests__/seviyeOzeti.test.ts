import { adimOzetiOlustur, kanalListesiMetni, seviyeOzetiOlustur } from '../seviyeOzeti';
import type { SeviyeAyari } from '../matrisTipleri';
import { VARSAYILAN_SES } from '../matrisTipleri';

const OZEL_SES = 'content://media/internal/audio/media/42';

const temel = (o: Partial<SeviyeAyari>): SeviyeAyari => ({
  kademe: 'nazik', kanallar: { bildirim: true }, esikDk: 30, siklik: 'birkez',
  bildirimSesi: VARSAYILAN_SES, anonsMetni: '', ...o,
});

describe('adimOzetiOlustur — yapısal özet (ekran: zaman + ikon çipleri)', () => {
  test('bildirim: zaman, kanal ve ses adı ayrı alanlardır', () => {
    expect(adimOzetiOlustur(temel({ esikDk: 20 }))).toEqual({
      kapali: false, zaman: '20 dk kala', kanallar: ['bildirim'], sesAdi: 'Uygulama sesi', kademe: 'nazik',
    });
  });
  test('kanallar GÖSTERİM sırasındadır (bildirim, sesli, titreşim, alarm)', () => {
    const ozet = adimOzetiOlustur(temel({ kanallar: { alarm: true, titresim: true, sesli: true, bildirim: true } }));
    expect(ozet.kanallar).toEqual(['bildirim', 'sesli', 'titresim', 'alarm']);
  });
  test('tekrar aralığı yalnız tekrarlıysa yazılır', () => {
    expect(adimOzetiOlustur(temel({ siklik: { herDk: 5 } })).tekrarDk).toBe(5);
    expect(adimOzetiOlustur(temel({})).tekrarDk).toBeUndefined();
  });
  test('ses adı yalnız bildirim açıkken (sesli okumanın sesi yoktur)', () => {
    expect(adimOzetiOlustur(temel({ kanallar: { sesli: true } })).sesAdi).toBeUndefined();
  });
  test('kapalı adımda kanal ve tekrar yok', () => {
    expect(adimOzetiOlustur(temel({ kanallar: {}, siklik: { herDk: 5 } }))).toEqual({
      kapali: true, zaman: '30 dk kala', kanallar: [], kademe: 'nazik',
    });
  });
  test('giriş yönünde zaman "girişten N dk sonra"', () => {
    expect(adimOzetiOlustur(temel({ esikDk: 15 }), 'girisindenItibaren').zaman).toBe('girişten 15 dk sonra');
  });
  test('ham content:// URI ses adında GÖRÜNMEZ', () => {
    expect(adimOzetiOlustur(temel({ bildirimSesi: OZEL_SES })).sesAdi).toBe('Seçtiğiniz ses');
  });
});

describe('kanalListesiMetni', () => {
  test('Türkçe liste: virgül + "ve"', () => {
    expect(kanalListesiMetni(['bildirim'])).toBe('bildirim');
    expect(kanalListesiMetni(['bildirim', 'titresim'])).toBe('bildirim ve titreşim');
    expect(kanalListesiMetni(['bildirim', 'sesli', 'alarm'], 'Hızır')).toBe('bildirim (Hızır), sesli okuma ve gerçek alarm');
  });
});

describe('seviyeOzetiOlustur (ekran okuyucu cümlesi)', () => {
  test('kapalı adım: "Kapalı — uyarı almazsınız"', () => {
    expect(seviyeOzetiOlustur(temel({ kanallar: {} }))).toBe('Kapalı — uyarı almazsınız');
  });
  test('bildirim: eşik + bildirim (ses adı)', () => {
    expect(seviyeOzetiOlustur(temel({ kanallar: { bildirim: true }, esikDk: 30 })))
      .toBe('30 dk kala: bildirim (Uygulama sesi)');
  });
  test('kullanıcının seçtiği sesin ADI okunur', () => {
    expect(seviyeOzetiOlustur(temel({ esikDk: 30, bildirimSesi: OZEL_SES, sesAdi: 'Hızır' })))
      .toBe('30 dk kala: bildirim (Hızır)');
  });
  test('ad çözülemediyse HAM content:// URI GÖSTERİLMEZ (kullanıcıya hiçbir şey anlatmaz)', () => {
    const ozet = seviyeOzetiOlustur(temel({ bildirimSesi: OZEL_SES }));
    expect(ozet).not.toContain('content://');
    expect(ozet).toBe('30 dk kala: bildirim (Seçtiğiniz ses)');
  });
  test('ESKİ palet id de kibar yedek metne düşer (göç gerekmez)', () => {
    expect(seviyeOzetiOlustur(temel({ bildirimSesi: 'melodi' })))
      .toBe('30 dk kala: bildirim (Uygulama sesi)');
  });
  test('bildirim + sesli', () => {
    expect(seviyeOzetiOlustur(temel({ kanallar: { bildirim: true, sesli: true }, esikDk: 15, bildirimSesi: OZEL_SES, sesAdi: 'Melodi 3' })))
      .toBe('15 dk kala: bildirim (Melodi 3) ve sesli okuma');
  });
  test('sesli: yalnız sesli okuma (ses adı yok)', () => {
    expect(seviyeOzetiOlustur(temel({ kanallar: { sesli: true }, esikDk: 8 })))
      .toBe('8 dk kala: sesli okuma');
  });

  // FAZ 6 — titreşim kanalı özette görünür; yoksa kullanıcı ayarı yaptığını
  // kart satırından doğrulayamaz (sessiz sapma).
  test('titreşim kanalı listeye eklenir', () => {
    expect(seviyeOzetiOlustur(temel({ kanallar: { bildirim: true, titresim: true }, esikDk: 30 })))
      .toBe('30 dk kala: bildirim (Uygulama sesi) ve titreşim');
  });
  test('YALNIZ titreşimle kurulmuş adım kapalı DEĞİLDİR', () => {
    expect(seviyeOzetiOlustur(temel({ kanallar: { titresim: true }, esikDk: 12 })))
      .toBe('12 dk kala: titreşim');
  });
  test('tekrar cümlenin sonunda söylenir', () => {
    expect(seviyeOzetiOlustur(temel({ siklik: { herDk: 5 }, esikDk: 20 })))
      .toBe('20 dk kala: bildirim (Uygulama sesi); 5 dakikada bir tekrarlanır');
  });

  test('giriş yönünde eşik "girişten N dk sonra" olur', () => {
    expect(seviyeOzetiOlustur(temel({ kanallar: { bildirim: true }, esikDk: 45 }), 'girisindenItibaren'))
      .toBe('girişten 45 dk sonra: bildirim (Uygulama sesi)');
  });
  test('giriş yönünde de kapalı adım aynı cümledir', () => {
    expect(seviyeOzetiOlustur(temel({ kanallar: {} }), 'girisindenItibaren'))
      .toBe('Kapalı — uyarı almazsınız');
  });
  test('orta nokta ayracı (·) HİÇBİR bileşimde yok', () => {
    const tam = temel({ kanallar: { bildirim: true, sesli: true, titresim: true, alarm: true }, siklik: { herDk: 3 } });
    expect(seviyeOzetiOlustur(tam)).not.toContain('·');
  });
});
