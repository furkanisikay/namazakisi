/**
 * Sade görünüm (issue #295) — saf kararların NÖBETÇİ testleri.
 * Zaman enjekte edilir; sabit takvim tarihi yalnız haftanın GÜNÜ gerektiğinde
 * (cuma etiketi) ve yalnız girdi olarak kullanılır.
 */
import {
  kalanDakika,
  kalanSureKisa,
  kalanSureUzun,
  okunurMetinRengi,
  sadeDurumuHesapla,
  sadeGorunumAyarlariniNormalize,
  sonrakiDakikayaKalanMs,
  type SadeDurumGirdisi,
} from '../sadeGorunum';
import { kontrastOrani } from '../../utils/kontrastOrani';
import { ACIK_TEMA, RENK_PALETLERI } from '../../theme/temalar';

// Perşembe 15:18 (yerel). Cuma etiketi testinde ayrıca cuma kurulur.
const PERSEMBE = new Date(2026, 9, 15, 15, 18, 0);
const CUMA = new Date(2026, 9, 16, 12, 30, 0);

const dk = (t: Date, n: number) => new Date(t.getTime() + n * 60000);

const girdi = (ek: Partial<SadeDurumGirdisi> = {}): SadeDurumGirdisi => ({
  vakit: 'ikindi',
  giris: dk(PERSEMBE, -60),
  sonrakiGiris: dk(PERSEMBE, 42),
  sonrakiVakit: 'aksam',
  simdi: PERSEMBE,
  tamamlandi: false,
  kayitHazir: true,
  mekruhMu: false,
  cumaEtiketi: false,
  ...ek,
});

describe('sadeGorunumAyarlariniNormalize', () => {
  it('bozuk/eksik kayıt KAPALI varsayılana düşer', () => {
    expect(sadeGorunumAyarlariniNormalize(null)).toEqual({ aktif: false });
    expect(sadeGorunumAyarlariniNormalize(42)).toEqual({ aktif: false });
    expect(sadeGorunumAyarlariniNormalize([true])).toEqual({ aktif: false });
    expect(sadeGorunumAyarlariniNormalize({ aktif: 'evet' })).toEqual({ aktif: false });
    expect(sadeGorunumAyarlariniNormalize({ aktif: true, fazla: 1 })).toEqual({ aktif: true });
  });
});

describe('süre biçimi (dakika çözünürlüğü)', () => {
  it('dakika YUKARI yuvarlanır: 30 sn kala "0 dk" yazmaz', () => {
    expect(kalanDakika(30_000)).toBe(1);
    expect(kalanDakika(60_000)).toBe(1);
    expect(kalanDakika(60_001)).toBe(2);
    expect(kalanDakika(0)).toBe(0);
    expect(kalanDakika(-5000)).toBe(0);
    expect(kalanDakika(Number.NaN)).toBe(0);
  });

  it('kısa ve uzun (okunan) biçimler', () => {
    expect(kalanSureKisa(42)).toBe('42 dk');
    expect(kalanSureKisa(60)).toBe('1 sa');
    expect(kalanSureKisa(65)).toBe('1 sa 5 dk');
    expect(kalanSureUzun(42)).toBe('42 dakika');
    expect(kalanSureUzun(120)).toBe('2 saat');
    expect(kalanSureUzun(125)).toBe('2 saat 5 dakika');
  });

  it('dakika saati bir sonraki dakika sınırına hizalanır', () => {
    expect(sonrakiDakikayaKalanMs(PERSEMBE.getTime())).toBe(60000);
    expect(sonrakiDakikayaKalanMs(PERSEMBE.getTime() + 15_000)).toBe(45_000);
  });
});

describe('sadeDurumuHesapla', () => {
  it('issue örneği: "Şimdi İkindi · 42 dk" + Kıldım açık + okunan metin arayüz kaydında', () => {
    const d = sadeDurumuHesapla(girdi());
    expect(d.tur).toBe('vakit');
    expect(d.vakitAdi).toBe('İkindi');
    expect(d.ustEtiket).toBe('Şimdi');
    expect(d.kalanMetni).toBe('42 dk');
    expect(d.kalanEtiketi).toBe('Çıkmasına');
    expect(d.namazAdi).toBe('İkindi');
    expect(d.kildimEtkin).toBe(true);
    expect(d.sonrakiMetni).toBe('Akşam · 16:00');
    expect(d.okunacakMetin).toBe(
      'Şimdi ikindi vakti. Çıkmasına 42 dakika var. Sıradaki akşam vakti, saat 16:00.'
    );
  });

  it('cümle içi küçük harf SABİT haritadan: "İkindi" → "ikindi" (toLowerCase "i̇kindi" verirdi)', () => {
    const d = sadeDurumuHesapla(girdi());
    expect(d.okunacakMetin).toContain('Şimdi ikindi vakti');
    expect(d.okunacakMetin).not.toContain('i̇');
  });

  it('kılındıysa Kıldım KAPALI ve okunan metin bunu söyler', () => {
    const d = sadeDurumuHesapla(girdi({ tamamlandi: true }));
    expect(d.tamamlandi).toBe(true);
    expect(d.kildimEtkin).toBe(false);
    expect(d.okunacakMetin).toContain('İkindi namazını kıldınız.');
  });

  it('aktif günün kaydı yüklü değilse işaretleme yapılamaz', () => {
    expect(sadeDurumuHesapla(girdi({ kayitHazir: false })).kildimEtkin).toBe(false);
  });

  it('KERAHAT işaretlemeyi ENGELLEMEZ (issue #82) — yalnız bilgi verir', () => {
    const d = sadeDurumuHesapla(girdi({ mekruhMu: true }));
    expect(d.kildimEtkin).toBe(true);
    expect(d.kerahat).toBe(true);
    expect(d.okunacakMetin).toContain('Şu an kerahat vakti.');
    // Kılındıktan sonra uyarı anlamsızdır.
    expect(sadeDurumuHesapla(girdi({ mekruhMu: true, tamamlandi: true })).kerahat).toBe(false);
  });

  it('güneş → öğle arası: "Öğle vakti henüz girmedi", Kıldım KAPALI, "Girmesine"', () => {
    const d = sadeDurumuHesapla(
      girdi({ vakit: 'gunes', sonrakiVakit: 'ogle', sonrakiGiris: dk(PERSEMBE, 25), mekruhMu: true })
    );
    expect(d.tur).toBe('girmedi');
    expect(d.vakitAdi).toBe('Öğle');
    expect(d.namazAdi).toBeNull();
    expect(d.kildimEtkin).toBe(false);
    expect(d.kerahat).toBe(false);
    expect(d.kalanEtiketi).toBe('Girmesine');
    expect(d.sonrakiMetni).toBe('Giriş · 15:43');
    expect(d.okunacakMetin).toBe('Öğle vakti henüz girmedi. Girmesine 25 dakika var. Giriş saati 15:43.');
  });

  it('cuma etiketi açıksa cuma günü öğle "Cuma" görünür ve okunur', () => {
    const d = sadeDurumuHesapla(
      girdi({ vakit: 'ogle', simdi: CUMA, giris: dk(CUMA, -30), sonrakiGiris: dk(CUMA, 180), sonrakiVakit: 'ikindi', cumaEtiketi: true })
    );
    expect(d.vakitAdi).toBe('Cuma');
    expect(d.namazAdi).toBe('Öğle'); // kimlik daima Öğle (AGENTS.md cuma kuralı)
    expect(d.okunacakMetin.startsWith('Şimdi cuma vakti.')).toBe(true);
    expect(d.kalanMetni).toBe('3 sa');
  });

  it('sabah vaktinde sıradaki "Güneş doğuşu" (bir namaz değil)', () => {
    const d = sadeDurumuHesapla(girdi({ vakit: 'imsak', sonrakiVakit: 'gunes' }));
    expect(d.vakitAdi).toBe('Sabah');
    expect(d.sonrakiMetni?.startsWith('Güneş doğuşu · ')).toBe(true);
    expect(d.okunacakMetin).toContain('Sıradaki güneş doğuşu, saat');
  });

  it('ilerleme halkası vaktin geçen kısmıdır (0–1 arası sabitlenir)', () => {
    expect(sadeDurumuHesapla(girdi({ giris: dk(PERSEMBE, -58), sonrakiGiris: dk(PERSEMBE, 42) })).ilerleme).toBeCloseTo(0.58);
    expect(sadeDurumuHesapla(girdi({ giris: dk(PERSEMBE, 10) })).ilerleme).toBe(0);
    expect(sadeDurumuHesapla(girdi({ giris: null })).ilerleme).toBe(0);
  });

  it('bilinmeyen sonraki kod "undefined" yazdırmaz', () => {
    const d = sadeDurumuHesapla(girdi({ sonrakiVakit: 'bozuk' as never }));
    expect(d.sonrakiMetni).toBeNull();
    expect(d.okunacakMetin).not.toContain('undefined');
  });

  it('vakit hesabı yoksa "yok" durumu — işaretleme kapalı, yön gösteren okuma', () => {
    for (const g of [girdi({ vakit: null }), girdi({ sonrakiGiris: null }), girdi({ sonrakiGiris: new Date('x') })]) {
      const d = sadeDurumuHesapla(g);
      expect(d.tur).toBe('yok');
      expect(d.kildimEtkin).toBe(false);
      expect(d.okunacakMetin).toContain('Konumunuzu kontrol edin');
    }
  });

  it('ibadet metni değil arayüz kaydı: "sen" dili ve emir kipi yok', () => {
    const metinler = [
      sadeDurumuHesapla(girdi()).okunacakMetin,
      sadeDurumuHesapla(girdi({ tamamlandi: true, mekruhMu: true })).okunacakMetin,
      sadeDurumuHesapla(girdi({ vakit: 'gunes', sonrakiVakit: 'ogle' })).okunacakMetin,
    ];
    for (const m of metinler) {
      // `\b` Türkçe harflerde (ı) sözcük sınırı sanır → sözcüklere bölüp karşılaştır.
      const sozcukler = m.split(/[\s.,]+/).map((x) => x.toLocaleLowerCase('tr-TR'));
      for (const yasak of ['sen', 'senin', 'kıldın', 'kıl']) expect(sozcukler).not.toContain(yasak);
      expect(m).not.toMatch(/secde/i);
    }
  });
});

describe('okunurMetinRengi — Kıldım düğmesi kontrastı (WCAG AA büyük metin ≥ 3:1)', () => {
  it('her palette seçilen metin rengi birincilKoyu zeminde ≥ 3:1', () => {
    for (const palet of RENK_PALETLERI) {
      const renk = okunurMetinRengi(palet.birincilKoyu, ['#FFFFFF', ACIK_TEMA.renkler.metin]);
      expect(kontrastOrani(palet.birincilKoyu, renk)).toBeGreaterThanOrEqual(3);
    }
  });

  it('Güneş paletinde beyaz YETMEZ → koyu metin seçilir (göz kararı değil ölçüm)', () => {
    const gunes = RENK_PALETLERI.find((p) => p.id === 'gunes')!;
    expect(kontrastOrani(gunes.birincilKoyu, '#FFFFFF')).toBeLessThan(3);
    expect(okunurMetinRengi(gunes.birincilKoyu, ['#FFFFFF', ACIK_TEMA.renkler.metin])).toBe(ACIK_TEMA.renkler.metin);
  });
});
