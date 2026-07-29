import { AYAR_INDEKSI } from '../aramaIndeksi';
import { CAPALAR } from '../capalar';
import { AYARLAR_EKRANLARI } from '../../../navigation/ayarlarEkranlari';

describe('AYAR_INDEKSI', () => {
  // NÖBETÇİ 1: her `sayfa` gerçekten var olan bir ayarlar ekranına işaret etmeli.
  it('her kaydın sayfası AYARLAR_EKRANLARI içinde', () => {
    const gecerliSayfalar: readonly string[] = AYARLAR_EKRANLARI;
    for (const kayit of AYAR_INDEKSI) {
      expect(gecerliSayfalar).toContain(kayit.sayfa);
    }
  });

  // NÖBETÇİ 2: her `capa` gerçekten tanımlı bir çapa olmalı.
  it('her kaydın çapası (varsa) CAPALAR içinde', () => {
    const gecerliCapalar: readonly string[] = CAPALAR;
    for (const kayit of AYAR_INDEKSI) {
      if (kayit.capa !== undefined) {
        expect(gecerliCapalar).toContain(kayit.capa);
      }
    }
  });

  // NÖBETÇİ 3: id alanları benzersiz olmalı (arama sonucu React key'i olarak da kullanılabilir).
  it('id alanları benzersiz', () => {
    const idler = AYAR_INDEKSI.map(k => k.id);
    expect(new Set(idler).size).toBe(idler.length);
  });

  it('17 çapa kaydının tümü indekste var', () => {
    const indeksteYerAlanCapalar = new Set(AYAR_INDEKSI.map(k => k.capa).filter(Boolean));
    expect(indeksteYerAlanCapalar.size).toBe(CAPALAR.length);
  });

  // Bilinçli dışlama: Titreşim/Ses efektleri toggle'ları indekslenmez (sayfaya götürmezler).
  it('titreşim/ses efektleri indekslenmez', () => {
    const basliklar = AYAR_INDEKSI.map(k => k.baslik);
    expect(basliklar).not.toContain('Titreşim');
    expect(basliklar).not.toContain('Ses efektleri');
  });
});
