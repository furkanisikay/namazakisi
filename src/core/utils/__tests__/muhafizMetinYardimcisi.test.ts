import {
  basligiOlustur,
  bildirimGovdesiOlustur,
  VAKIT_ADLARI_BUYUK,
  GIRIS_ICERIK_HAVUZU,
} from '../muhafizMetinYardimcisi';

describe('basligiOlustur', () => {
  test('seviye 1: süre + vakit adı', () => {
    expect(basligiOlustur('imsak', 1, 30)).toBe('⏰ 30 dk · Sabah vakti');
  });

  test('seviye 2: daralıyor', () => {
    expect(basligiOlustur('ogle', 2, 15)).toBe('⚠️ 15 dk · Öğle vakti daralıyor');
  });

  test('seviye 3: kaçıyor', () => {
    expect(basligiOlustur('aksam', 3, 8)).toBe('🔥 8 dk · Akşam vakti kaçıyor');
  });

  test('seviye 4: büyük harf + ÇIKIYOR', () => {
    expect(basligiOlustur('yatsi', 4, 3)).toBe('🚨 3 dk · YATSI VAKTİ ÇIKIYOR');
  });

  // NÖBETÇİ TEST — bu testin sebebi:
  // 'İkindi'.toUpperCase() => 'İKINDI' (noktalı İ kaybolur, i -> I).
  // Sabit harita kullanılmazsa kullanıcıya yanlış yazılmış namaz adı gider.
  // Diğer dört vakitte harf tuzağı YOK, o yüzden yalnız bu test koruyor.
  test('İkindi seviye 4 başlığı noktalı İKİNDİ üretir (toUpperCase tuzağı)', () => {
    expect(basligiOlustur('ikindi', 4, 5)).toBe('🚨 5 dk · İKİNDİ VAKTİ ÇIKIYOR');
    expect(basligiOlustur('ikindi', 4, 5)).not.toContain('İKINDI');
  });

  test('VAKIT_ADLARI_BUYUK ham toUpperCase ile aynı DEĞİL (regresyon nöbetçisi)', () => {
    expect(VAKIT_ADLARI_BUYUK.ikindi).toBe('İKİNDİ');
    expect('İkindi'.toUpperCase()).toBe('İKINDI'); // tuzağın kanıtı
  });

  test('süre daima ikondan sonraki ilk sözcük', () => {
    const seviyeler: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
    for (const s of seviyeler) {
      expect(basligiOlustur('aksam', s, 7)).toMatch(/^\S+ 7 dk · /u);
    }
  });

  test('beş vaktin beşi de doğru ada çözülür', () => {
    expect(basligiOlustur('imsak', 1, 1)).toContain('Sabah');
    expect(basligiOlustur('ogle', 1, 1)).toContain('Öğle');
    expect(basligiOlustur('ikindi', 1, 1)).toContain('İkindi');
    expect(basligiOlustur('aksam', 1, 1)).toContain('Akşam');
    expect(basligiOlustur('yatsi', 1, 1)).toContain('Yatsı');
  });
});

describe('bildirimGovdesiOlustur', () => {
  test('gövde sondaki kalan süreyi TAŞIMAZ (süre başlıkta)', () => {
    for (const s of [1, 2, 3, 4] as const) {
      expect(bildirimGovdesiOlustur(s)).not.toMatch(/dk kaldı|dakika kaldı/u);
    }
  });

  test('gövde başlığın durum ifadesini birebir tekrarlamaz', () => {
    // Seviye 4 başlığı "... VAKTİ ÇIKIYOR" diyor; gövde bunu tekrar etmemeli.
    expect(bildirimGovdesiOlustur(4)).not.toContain('ÇIKIYOR');
    expect(bildirimGovdesiOlustur(4)).not.toContain('çıkmak üzere');
    // Seviye 2 başlığı "daralıyor" diyor.
    expect(bildirimGovdesiOlustur(2)).not.toContain('daralıyor');
  });

  // NÖBETÇİ: "secdeye kapan" mantık hatasıydı — secde namazın İÇİNDEKİ bir rükün,
  // başlangıcı değil. Vakit daralınca kişi namaza durur, secdeye kapanmaz.
  test('seviye 4: "namaza dur" der, "secde" demez', () => {
    const govde = bildirimGovdesiOlustur(4);
    expect(govde).toContain('namaza dur');
    expect(govde).not.toMatch(/secde/i);
  });
});

// ── Faz 1 / B11: GİRİŞ yönü metinleri ────────────────────────────────────────
//
// Motor iki yönlü olunca çıkış dili giriş yönünde yalnız garip değil YANLIŞ olur:
// yatsı 700 dk sürerken "acil" adım girişten 45 dk sonra tetiklenir ve çıkışa
// hâlâ 655 dk vardır → çıkış başlığı "🚨 655 dk · YATSI VAKTİ ÇIKIYOR" derdi.
describe('giriş yönü metinleri', () => {
  test('yön verilmezse çıkış dili BİREBİR korunur (sıfır göç)', () => {
    expect(basligiOlustur('yatsi', 4, 3)).toBe(basligiOlustur('yatsi', 4, 3, 'cikisaDogru'));
    expect(bildirimGovdesiOlustur(2)).toBe(bildirimGovdesiOlustur(2, 'cikisaDogru'));
  });

  test('giriş başlığı "geçen süre" der, "çıkıyor/kaldı" DEMEZ', () => {
    for (const s of [1, 2, 3, 4] as const) {
      const baslik = basligiOlustur('yatsi', s, 45, 'girisindenItibaren');
      expect(baslik).toContain('45');
      expect(baslik).not.toMatch(/ÇIKIYOR|kaçıyor|daralıyor|kaldı/u);
    }
  });

  test('giriş başlığında süre yine ikondan sonraki ilk sözcük (Android kırpması)', () => {
    for (const s of [1, 2, 3, 4] as const) {
      const baslik = basligiOlustur('ogle', s, 12, 'girisindenItibaren');
      expect(baslik.split(' ')[1]).toBe('12');
    }
  });

  test('giriş başlığı seviye 4: noktalı İKİNDİ (toUpperCase tuzağı burada da)', () => {
    const baslik = basligiOlustur('ikindi', 4, 20, 'girisindenItibaren');
    expect(baslik).toContain('İKİNDİ');
    expect(baslik).not.toContain('İKINDI');
  });

  test('giriş gövdesi çıkış diline sızmaz ve "secde" demez', () => {
    for (const s of [1, 2, 3, 4] as const) {
      const govde = bildirimGovdesiOlustur(s, 'girisindenItibaren');
      // Çıkış yönünün gövdesi ASLA aynen dönmemeli (yön parametresi yutulursa
      // seviye 1 "Vakit daralmaya başladı" der — vakit yeni girmişken yanlış).
      expect(govde).not.toBe(bildirimGovdesiOlustur(s, 'cikisaDogru'));
      expect(govde).not.toMatch(/daralmaya|son dakika|çıkıyor|kaldı/iu);
      expect(govde).not.toMatch(/secde/i);
    }
    expect(bildirimGovdesiOlustur(4, 'girisindenItibaren')).toContain('namaza dur');
  });

  test('GİRİŞ içerik havuzu doludur ve terk-etme suçlaması taşımaz', () => {
    // Fıkıh kuralı (AGENTS.md): terk etme ≠ geciktirme. Bildirimi alan kişi
    // namazı terk etmiş değil, geciktirmiştir; "terk edenin küfrü" türü nasslar
    // bu kişiye YANLIŞ hedeftir. Havuz vakte özgü nass da taşımaz.
    for (const s of [1, 2, 3, 4] as const) {
      expect(GIRIS_ICERIK_HAVUZU[s].length).toBeGreaterThan(0);
      for (const metin of GIRIS_ICERIK_HAVUZU[s]) {
        expect(metin).not.toMatch(/terk|küfr|kâfir|secde/iu);
        expect(metin).not.toMatch(/çıkıyor|son dakika/iu);
      }
    }
  });
});
