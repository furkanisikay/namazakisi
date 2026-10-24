import {
  NOW_BAR_BASLANGICLARI,
  NOW_BAR_OGELERI,
  NOW_BAR_OGE_BILGILERI,
  NOW_BAR_ONCELIK,
  nowBarPolitikaUyarisi,
  vakitSayacGereksinimNotu,
  etkinVakitBaslangici,
  nowBarEtkinAyarlari,
  VARSAYILAN_NOW_BAR_AYARLARI,
  acikOgeSayisi,
  nowBarAyariniBirlestir,
  nowBarAyarlariniNormalize,
  sayacOneCikarilsinMi,
} from '../nowBar';

describe('Now Bar seçimi — varsayılan ilk aşamanın davranışıdır', () => {
  test('beş vakit + iftar + sahur açık ve "sayaçla"; cuma, nafile ve SERİ kapalı', () => {
    const o = VARSAYILAN_NOW_BAR_AYARLARI.ogeler;
    for (const v of ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi', 'iftar', 'sahur'] as const) {
      expect(o[v]).toMatchObject({ acik: true, baslangic: 'sayacla' });
      expect(sayacOneCikarilsinMi(VARSAYILAN_NOW_BAR_AYARLARI, v)).toBe(true);
    }
    for (const v of ['cuma', 'kusluk', 'evvabin', 'teheccud', 'seri'] as const) {
      expect(o[v].acik).toBe(false);
    }
    expect(acikOgeSayisi(VARSAYILAN_NOW_BAR_AYARLARI)).toBe(7);
  });

  test('her varsayılan başlangıç o öğe için izinli', () => {
    for (const oge of NOW_BAR_OGELERI) {
      expect(NOW_BAR_BASLANGICLARI[oge]).toContain(VARSAYILAN_NOW_BAR_AYARLARI.ogeler[oge].baslangic);
      for (const b of NOW_BAR_BASLANGICLARI[oge]) {
        expect(NOW_BAR_OGE_BILGILERI[oge].baslangicEtiketleri[b]).toBeTruthy();
      }
    }
  });

  test('öncelik: vakit > iftar > sahur > cuma > nafile > seri', () => {
    const p = NOW_BAR_ONCELIK;
    expect(p.ikindi).toBeLessThan(p.iftar);
    expect(p.iftar).toBeLessThan(p.sahur);
    expect(p.sahur).toBeLessThan(p.cuma);
    expect(p.cuma).toBeLessThan(p.kusluk);
    expect(p.teheccud).toBeLessThan(p.seri);
  });

  test('vakit "Sayaçla" notu ölçerek konuşur: sorun yoksa ya da bilinmiyorsa satır yok', () => {
    expect(vakitSayacGereksinimNotu(true, false)).toBeNull();
    expect(vakitSayacGereksinimNotu(null, null)).toBeNull();
    // Sayaç kapalıyken kart başına not YOK (sayfanın üstünde tek satır).
    expect(vakitSayacGereksinimNotu(false, true)).toBeNull();
    expect(vakitSayacGereksinimNotu(true, true)).toContain('Namaz Muhafızı bu vakti uyardığı');
  });

  test('vakit sayacı KAPALIYKEN "Sayaçla" etkin olarak "Vakit girince"; bilinmiyorsa seçim değişmez', () => {
    expect(etkinVakitBaslangici('sayacla', false)).toBe('girince');
    expect(etkinVakitBaslangici('sayacla', null)).toBe('sayacla');
    expect(etkinVakitBaslangici('sayacla', true)).toBe('sayacla');
    expect(etkinVakitBaslangici('sonDk', false)).toBe('sonDk');
    const etkin = nowBarEtkinAyarlari(VARSAYILAN_NOW_BAR_AYARLARI, false);
    expect(etkin.ogeler.ogle.baslangic).toBe('girince');
    // Vakit DIŞI öğelere dokunulmaz (iftarın "sayaçla"sı kendi sayacına bağlıdır).
    expect(etkin.ogeler.iftar.baslangic).toBe(VARSAYILAN_NOW_BAR_AYARLARI.ogeler.iftar.baslangic);
    expect(nowBarEtkinAyarlari(VARSAYILAN_NOW_BAR_AYARLARI, true)).toBe(VARSAYILAN_NOW_BAR_AYARLARI);
  });

  test('politika uyarısı sahibin istediği cümle', () => {
    expect(nowBarPolitikaUyarisi()).toBe(
      'Google sürekli açık kartları önermez; telefonunuz öne çıkarmayı geri çekebilir.'
    );
  });
});

describe('nowBarAyarlariniNormalize — ASLA fırlatmaz', () => {
  test.each([null, undefined, 42, 'x', [], { ogeler: 'bozuk' }])('%p → varsayılan', (ham) => {
    expect(nowBarAyarlariniNormalize(ham)).toEqual(VARSAYILAN_NOW_BAR_AYARLARI);
  });

  test('öğe için geçersiz başlangıç varsayılana düşer (cuma "sayaçla" olamaz)', () => {
    const a = nowBarAyarlariniNormalize({ ogeler: { cuma: { acik: true, baslangic: 'sayacla', sonDk: 30 } } });
    expect(a.ogeler.cuma).toEqual({ acik: true, baslangic: 'sonDk', sonDk: 30 });
  });

  test('son dakika adıma yuvarlanır ve sınıra kenetlenir', () => {
    const a = nowBarAyarlariniNormalize({
      ogeler: { ogle: { acik: true, baslangic: 'sonDk', sonDk: 999 }, ikindi: { sonDk: 2 }, aksam: { sonDk: 23 } },
    });
    expect(a.ogeler.ogle.sonDk).toBe(180);
    expect(a.ogeler.ikindi.sonDk).toBe(5);
    expect(a.ogeler.aksam.sonDk).toBe(25);
    // Eksik alanlar varsayılandan
    expect(a.ogeler.ikindi.acik).toBe(true);
  });

  test('birleştirme yalnız verilen öğeyi değiştirir', () => {
    const a = nowBarAyariniBirlestir(VARSAYILAN_NOW_BAR_AYARLARI, 'seri', { acik: true });
    expect(a.ogeler.seri.acik).toBe(true);
    expect(a.ogeler.ogle).toEqual(VARSAYILAN_NOW_BAR_AYARLARI.ogeler.ogle);
    expect(sayacOneCikarilsinMi(a, 'seri')).toBe(true);
    const b = nowBarAyariniBirlestir(a, 'ogle', { baslangic: 'girince' });
    expect(sayacOneCikarilsinMi(b, 'ogle')).toBe(false);
  });
});
