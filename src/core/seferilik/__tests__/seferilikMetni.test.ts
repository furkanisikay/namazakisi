import {
  SEFERILIK_BILGI_NOTU,
  SEFERILIK_KAYNAKLARI,
  SEFERILIK_KAYNAK_LISTESI,
  seferilikKartMetniOlustur,
  seferilikOzeti,
} from '../seferilikMetni';
import { MEZHEPLER } from '../seferilikAyarlari';

const tumMetin = (mezhep: 'hanefi' | 'safii') => {
  const m = seferilikKartMetniOlustur(mezhep, 212);
  return [m.baslik, m.mesafeSatiri, ...m.maddeler, m.not].join('\n');
};

describe('seferilikKartMetniOlustur — HÜKÜM DEĞİL BİLGİ (NÖBETÇİ)', () => {
  // Kart kullanıcının durumu hakkında karar vermez ve emir kipi kullanmaz.
  // Arayüz metnidir → kibar "siz"; ibadete çağrı ("kıl", "dur") DEĞİLDİR.
  const YASAK_KIPLER = [
    /malısınız|melisiniz|malıdır|melidir/i,
    /caizdir/i,
    /kılınız|kılın[.!,\s]|kılın$/i,
    /seferîsiniz|seferisiniz|yolcusunuz/i,
    /farzdır|vaciptir|vâciptir|sünnettir|haramdır|mekruhtur/i,
    /secde/i, // AGENTS.md fıkıh kuralı
    /terk/i, // terk etme ≠ geciktirme; burada hiç yeri yok
    /\b(sen|senin|sana)\b/i, // arayüz dili kibar "siz"
  ];

  it.each(MEZHEPLER)('%s metni yasak hüküm/emir kiplerini içermez', (mezhep) => {
    const metin = tumMetin(mezhep);
    for (const kalip of YASAK_KIPLER) {
      expect(metin).not.toMatch(kalip);
    }
  });

  it('başlık "gibi görünüyor" der — kesin yargı değil', () => {
    expect(seferilikKartMetniOlustur('hanefi', 120).baslik).toBe('Yolculuktasınız gibi görünüyor');
  });

  it('mesafe kuş uçuşu ve yaklaşık olarak yazılır', () => {
    expect(seferilikKartMetniOlustur('hanefi', 212).mesafeSatiri).toContain('kuş uçuşu yaklaşık 210 km');
  });

  it('Hanefî: 90 km + 15 gün + kasr + cem yalnız Arafat/Müzdelife ve Diyanet taklit notu', () => {
    const metin = tumMetin('hanefi');
    expect(metin).toContain('90 km');
    expect(metin).toContain('15 gün');
    expect(metin).toContain('iki rekât');
    expect(metin).toContain('Arafat');
    expect(metin).toContain('Müzdelife');
    expect(metin).toContain('diğer mezheplerin');
    expect(metin).toContain('Hanefî mezhebine göre');
    expect(metin).not.toContain('4 gün');
  });

  it('Şâfiî: 90 km + giriş-çıkış hariç 4 gün + kasr + cem için yolculuk mazereti', () => {
    const metin = tumMetin('safii');
    expect(metin).toContain('90 km');
    expect(metin).toContain('giriş ve çıkış günleri hariç 4 gün');
    expect(metin).toContain('iki rekât');
    expect(metin).toContain('(cem)');
    expect(metin).toContain('Şâfiî mezhebine göre');
    expect(metin).not.toContain('15 gün');
  });

  it('kart notu bilgilendirme olduğunu söyler', () => {
    expect(seferilikKartMetniOlustur('safii', 100).not).toBe(SEFERILIK_BILGI_NOTU);
    expect(SEFERILIK_BILGI_NOTU).toContain('hüküm değil, bilgilendirmedir');
  });

  it('dönen madde dizisi kopyadır (çağıranın değişikliği sabit tabloyu bozmaz)', () => {
    const a = seferilikKartMetniOlustur('hanefi', 100);
    a.maddeler.push('x');
    expect(seferilikKartMetniOlustur('hanefi', 100).maddeler).not.toContain('x');
  });
});

describe('SEFERILIK_KAYNAKLARI — birincil Diyanet metinleri', () => {
  it('her kaynak DİYK resmî sitesine (https) gider', () => {
    for (const k of SEFERILIK_KAYNAK_LISTESI) {
      expect(k.url).toMatch(/^https:\/\/kurul\.diyanet\.gov\.tr\/tr\/fetva\//);
      expect(k.etiket.length).toBeGreaterThan(10);
    }
    expect(new Set(SEFERILIK_KAYNAK_LISTESI.map((k) => k.url)).size).toBe(SEFERILIK_KAYNAK_LISTESI.length);
  });

  it('kartın "Diyanet\'te okuyun" düğmesi vatan/mesafe fetvasını açar', () => {
    expect(seferilikKartMetniOlustur('hanefi', 100).kaynak).toBe(SEFERILIK_KAYNAKLARI.vatan);
  });
});

describe('seferilikOzeti', () => {
  it('Ayarlar satırı özeti', () => {
    expect(seferilikOzeti(true, 'hanefi')).toBe('Açık · Hanefî');
    expect(seferilikOzeti(true, 'safii')).toBe('Açık · Şâfiî');
    expect(seferilikOzeti(false, 'safii')).toBe('Kapalı');
  });
});
