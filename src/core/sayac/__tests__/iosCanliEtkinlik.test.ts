import type { PlanGunu } from '../canliSayacPlani';
import {
  IOS_CANLI_OGELERI,
  iosAyarlariniUyarla,
  iosBaslangicSecenekleri,
  iosCanliEtkinlikSec,
  iosEtkinBaslangic,
  iosSiradakiCanliBaslangic,
} from '../iosCanliEtkinlik';
import {
  NOW_BAR_OGELERI,
  VARSAYILAN_NOW_BAR_AYARLARI,
  nowBarAyariniBirlestir,
  type NowBarAyarlari,
  type NowBarOgesi,
} from '../nowBar';

const DK = 60_000;

const gun = (tarih: string, s: [string, string, string, string, string, string]): PlanGunu => {
  const [y, a, g] = tarih.split('-').map(Number);
  const an = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return new Date(y, a - 1, g, h, m);
  };
  return {
    tarih,
    vakitler: { imsak: an(s[0]), gunes: an(s[1]), ogle: an(s[2]), ikindi: an(s[3]), aksam: an(s[4]), yatsi: an(s[5]) },
  };
};
const SAATLER: [string, string, string, string, string, string] = ['05:30', '07:00', '12:30', '15:40', '18:20', '19:40'];
// 2026-10-16 CUMA
const GUNLER: PlanGunu[] = ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18'].map((t) => gun(t, SAATLER));
const an = (tarih: string, hhmm: string) => {
  const [y, a, g] = tarih.split('-').map(Number);
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(y, a - 1, g, h, m).getTime();
};
const ayarla = (d: Partial<Record<NowBarOgesi, Partial<NowBarAyarlari['ogeler'][NowBarOgesi]>>>) => {
  let a = VARSAYILAN_NOW_BAR_AYARLARI;
  for (const [oge, v] of Object.entries(d)) a = nowBarAyariniBirlestir(a, oge as NowBarOgesi, v);
  return a;
};
const sec = (ayarlar: NowBarAyarlari, simdiMs: number, ek: Partial<Parameters<typeof iosCanliEtkinlikSec>[0]> = {}) =>
  iosCanliEtkinlikSec({
    ayarlar,
    simdiMs,
    gunler: GUNLER,
    kilinmisMi: () => false,
    ozelGundeMi: () => false,
    ...ek,
  });

describe('iOS canlı etkinlik seçimi (Now Bar ikizi)', () => {
  it('varsayılan ayarda vakit "sayaçla" iOS\'ta son dakikalar (30 dk) olarak çalışır', () => {
    // Öğle 12:30–15:40; varsayılan sonDk 30 → 15:10'dan itibaren.
    expect(sec(VARSAYILAN_NOW_BAR_AYARLARI, an('2026-10-15', '15:00'))).toBeNull();
    const e = sec(VARSAYILAN_NOW_BAR_AYARLARI, an('2026-10-15', '15:20'));
    expect(e).toEqual({
      id: 'sayac_2026-10-15_ogle',
      baslik: '⏱️ Öğle Namazı',
      ad: 'Öğle',
      baslangicMs: an('2026-10-15', '15:10'),
      hedefMs: an('2026-10-15', '15:40'),
      tema: 'vakit',
      kildimTarih: '2026-10-15',
      kildimVakit: 'ogle',
    });
  });

  it('"Vakit girince" vaktin girişinden çıkışına kadar sürer; sabahın kayıt kodu imsak', () => {
    const ayarlar = ayarla({ imsak: { baslangic: 'girince' } });
    const e = sec(ayarlar, an('2026-10-16', '05:45'));
    expect(e?.id).toBe('sayac_2026-10-16_imsak');
    expect(e?.baslangicMs).toBe(an('2026-10-16', '05:30'));
    expect(e?.hedefMs).toBe(an('2026-10-16', '07:00'));
    expect(e?.kildimVakit).toBe('imsak');
  });

  it('kılınmış vakit ve özel gün etkinlik başlatmaz', () => {
    const simdi = an('2026-10-15', '15:20');
    expect(sec(VARSAYILAN_NOW_BAR_AYARLARI, simdi, { kilinmisMi: (t, v) => t === '2026-10-15' && v === 'ogle' })).toBeNull();
    expect(sec(VARSAYILAN_NOW_BAR_AYARLARI, simdi, { ozelGundeMi: () => true })).toBeNull();
  });

  it('kapalı öğe hiç görünmez', () => {
    expect(sec(ayarla({ ogle: { acik: false } }), an('2026-10-15', '15:20'))).toBeNull();
  });

  it('öncelik Android ile aynı: vakit cumayı ve nafileyi yener', () => {
    // Cuma (güneş 07:00 → öğle 12:30, "girince") + kuşluk (açık, girince) + sabah girince.
    const ayarlar = ayarla({
      cuma: { acik: true, baslangic: 'girince' },
      kusluk: { acik: true, baslangic: 'girince' },
      imsak: { baslangic: 'girince' },
    });
    // 09:00 cuma: sabah çıkmış, cuma ve kuşluk yarışır → cuma kazanır.
    expect(sec(ayarlar, an('2026-10-16', '09:00'))?.tema).toBe('cuma');
    expect(sec(ayarlar, an('2026-10-16', '09:00'))?.kildimTarih).toBeNull();
    // Cuma olmayan gün aynı saatte kuşluk.
    expect(sec(ayarlar, an('2026-10-15', '09:00'))?.tema).toBe('nafile');
  });

  it('iftar, sahur ve seri iOS\'ta canlı etkinlik üretmez (sayaç bildirimi yok)', () => {
    const ayarlar = ayarla({ iftar: { acik: true }, sahur: { acik: true }, seri: { acik: true } });
    const uyarlanmis = iosAyarlariniUyarla(ayarlar);
    expect(uyarlanmis.ogeler.iftar.acik).toBe(false);
    expect(uyarlanmis.ogeler.sahur.acik).toBe(false);
    expect(uyarlanmis.ogeler.seri.acik).toBe(false);
    expect(IOS_CANLI_OGELERI).not.toContain('iftar');
    // Kayıt DEĞİŞMEZ.
    expect(ayarlar.ogeler.iftar.acik).toBe(true);
  });

  it('iOS seçenekleri "sayaçla"yı içermez ve etkin başlangıç ekranla tutarlı', () => {
    for (const oge of NOW_BAR_OGELERI) expect(iosBaslangicSecenekleri(oge)).not.toContain('sayacla');
    expect(iosEtkinBaslangic({ acik: true, baslangic: 'sayacla', sonDk: 30 })).toBe('sonDk');
    expect(iosEtkinBaslangic({ acik: true, baslangic: 'girince', sonDk: 30 })).toBe('girince');
    // Etkin başlangıç her iOS öğesinde seçilebilir bir seçenektir (ekranda seçili çip bulunur).
    for (const oge of IOS_CANLI_OGELERI) {
      const v = VARSAYILAN_NOW_BAR_AYARLARI.ogeler[oge];
      expect(iosBaslangicSecenekleri(oge)).toContain(iosEtkinBaslangic(v));
    }
  });

  it('sıradaki başlangıç: uygulama açılınca başlayacak ilk etkinlik', () => {
    const s = iosSiradakiCanliBaslangic({
      ayarlar: VARSAYILAN_NOW_BAR_AYARLARI,
      simdiMs: an('2026-10-15', '13:00'),
      gunler: GUNLER,
      kilinmisMi: () => false,
      ozelGundeMi: () => false,
    });
    expect(s).toEqual({ ad: 'Öğle', basMs: an('2026-10-15', '15:10') });
  });

  it('hedefe varmış etkinlik seçilmez', () => {
    expect(sec(VARSAYILAN_NOW_BAR_AYARLARI, an('2026-10-15', '15:40'))).toBeNull();
    expect(sec(VARSAYILAN_NOW_BAR_AYARLARI, an('2026-10-15', '15:40') - DK)?.id).toBe('sayac_2026-10-15_ogle');
  });
});
