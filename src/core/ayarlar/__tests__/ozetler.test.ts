import {
  konumOzeti,
  takvimOzeti,
  muhafizOzeti,
  bildirimOzeti,
  seriOzeti,
  ramazanOzeti,
  gorunumOzeti,
  yedeklemeOzeti,
  hakkindaOzeti,
} from '../ozetler';

describe('konumOzeti', () => {
  it('oto mod + gpsAdres → "ilçe, il · otomatik"', () => {
    expect(
      konumOzeti({
        konumModu: 'oto',
        gpsAdres: { ilce: 'Kadıköy', il: 'İstanbul' },
        seciliIlceAdi: '',
        seciliIlAdi: '',
      })
    ).toBe('Kadıköy, İstanbul · otomatik');
  });

  it('manuel mod → "ilçe, il · manuel"', () => {
    expect(
      konumOzeti({
        konumModu: 'manuel',
        gpsAdres: null,
        seciliIlceAdi: 'Çankaya',
        seciliIlAdi: 'Ankara',
      })
    ).toBe('Çankaya, Ankara · manuel');
  });

  it('oto + gpsAdres yok → "Konum takip ediliyor · otomatik"', () => {
    expect(
      konumOzeti({ konumModu: 'oto', gpsAdres: null, seciliIlceAdi: '', seciliIlAdi: '' })
    ).toBe('Konum takip ediliyor · otomatik');
  });

  // NÖBETÇİ: oto modda bayat şehir kuralı — gpsAdres varken seciliIlAdi
  // ASLA okunmamalı (bayat "İstanbul" gösterip kullanıcıyı Erzurum'da yanıltmamalı).
  it('NÖBETÇİ: oto modda gpsAdres öncelikli — bayat seciliIlAdi görmezden gelinir', () => {
    const sonuc = konumOzeti({
      konumModu: 'oto',
      gpsAdres: { ilce: '', il: 'Erzurum' },
      seciliIlceAdi: 'Kadıköy',
      seciliIlAdi: 'İstanbul',
    });
    expect(sonuc).toContain('Erzurum');
    expect(sonuc).not.toContain('İstanbul');
  });
});

describe('takvimOzeti', () => {
  it('açık', () => expect(takvimOzeti(true)).toBe('Açık'));
  it('kapalı', () => expect(takvimOzeti(false)).toBe('Kapalı'));
});

describe('muhafizOzeti', () => {
  it('kapalı', () => expect(muhafizOzeti({ aktif: false, yogunluk: 'normal' })).toBe('Kapalı'));
  it('açık + normal', () =>
    expect(muhafizOzeti({ aktif: true, yogunluk: 'normal' })).toBe('Açık · normal yoğunluk'));
  it('açık + hafif', () =>
    expect(muhafizOzeti({ aktif: true, yogunluk: 'hafif' })).toBe('Açık · hafif yoğunluk'));
  it('açık + yogun', () =>
    expect(muhafizOzeti({ aktif: true, yogunluk: 'yogun' })).toBe('Açık · yogun yoğunluk'));
  it('açık + ozel → "özel ayarlar"', () =>
    expect(muhafizOzeti({ aktif: true, yogunluk: 'ozel' })).toBe('Açık · özel ayarlar'));
});

describe('bildirimOzeti', () => {
  it('0 açık, cuma kapalı → "Kapalı"', () => {
    expect(bildirimOzeti({}, false)).toBe('Kapalı');
  });

  it('0 açık, cuma açık → "Yalnız cuma hatırlatması"', () => {
    expect(bildirimOzeti({ sabah: false, ogle: false }, true)).toBe('Yalnız cuma hatırlatması');
  });

  it('n>0, cuma kapalı → "3 vakit"', () => {
    expect(
      bildirimOzeti({ sabah: true, ogle: true, ikindi: true, aksam: false, yatsi: false }, false)
    ).toBe('3 vakit');
  });

  it('n>0, cuma açık → "3 vakit · cuma hatırlatması açık"', () => {
    expect(
      bildirimOzeti({ sabah: true, ogle: true, ikindi: true, aksam: false, yatsi: false }, true)
    ).toBe('3 vakit · cuma hatırlatması açık');
  });

  it('boş vakitler nesnesinde çökmez', () => {
    expect(bildirimOzeti({}, false)).toBe('Kapalı');
  });
});

describe('seriOzeti', () => {
  it('gün sonu açık', () => {
    expect(seriOzeti({ tamGunEsigi: 5, gunSonuBildirimAktif: true })).toBe(
      'Tam gün: 5 namaz · gün sonu açık'
    );
  });

  it('gün sonu kapalı', () => {
    expect(seriOzeti({ tamGunEsigi: 3, gunSonuBildirimAktif: false })).toBe(
      'Tam gün: 3 namaz · gün sonu kapalı'
    );
  });
});

describe('ramazanOzeti', () => {
  it('ikisi de açık', () => expect(ramazanOzeti(true, true)).toBe('İftar ve sahur sayacı açık'));
  it('yalnız iftar', () => expect(ramazanOzeti(true, false)).toBe('İftar sayacı açık'));
  it('yalnız sahur', () => expect(ramazanOzeti(false, true)).toBe('Sahur sayacı açık'));
  it('hiçbiri', () => expect(ramazanOzeti(false, false)).toBe('Kapalı'));
});

describe('gorunumOzeti', () => {
  it('koyu tema', () => expect(gorunumOzeti('koyu', 'Zümrüt')).toBe('Koyu tema · Zümrüt'));
  it('açık tema', () => expect(gorunumOzeti('acik', 'Zümrüt')).toBe('Açık tema · Zümrüt'));
});

describe('yedeklemeOzeti', () => {
  it('null → "Henüz dışa aktarılmadı"', () => {
    expect(yedeklemeOzeti(null, new Date('2026-07-29T00:00:00.000Z'))).toBe(
      'Henüz dışa aktarılmadı'
    );
  });

  it('aynı yıl → yıl yazılmaz', () => {
    expect(yedeklemeOzeti('2026-07-12T10:00:00.000Z', new Date('2026-07-29T00:00:00.000Z'))).toBe(
      'Son dışa aktarma: 12 Temmuz'
    );
  });

  it('farklı yıl (geçen yıla ait damga) → yıl yazılır', () => {
    expect(yedeklemeOzeti('2025-07-12T10:00:00.000Z', new Date('2026-07-29T00:00:00.000Z'))).toBe(
      'Son dışa aktarma: 12 Temmuz 2025'
    );
  });

  it('yıl geçişi sınırı: bir gün sonrası farklı yılsa yıl yazılır, aynı yılsa yazılmaz', () => {
    // Bugünün yılı 2027, damga 2026'ya ait → farklı yıl.
    expect(yedeklemeOzeti('2026-12-31T10:00:00.000Z', new Date('2027-01-01T00:00:00.000Z'))).toBe(
      'Son dışa aktarma: 31 Aralık 2026'
    );
    // İkisi de 2027 → yıl yazılmaz.
    expect(yedeklemeOzeti('2027-01-01T10:00:00.000Z', new Date('2027-01-01T12:00:00.000Z'))).toBe(
      'Son dışa aktarma: 1 Ocak'
    );
  });
});

describe('hakkindaOzeti', () => {
  it('güncel', () => expect(hakkindaOzeti('0.23.28', false)).toBe('Sürüm 0.23.28 · güncel'));
  it('güncelleme var', () =>
    expect(hakkindaOzeti('0.23.28', true)).toBe('Sürüm 0.23.28 · güncelleme var'));
});
