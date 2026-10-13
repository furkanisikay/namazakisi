import {
  CANLI_SAYAC_KANALI,
  canliPlanJsonuOlustur,
  canliZamanCizelgesiOlustur,
  nowBarAdaylariniOlustur,
  saatPencereleriniOlustur,
  saatVakitSecimi,
  secimliBaslangic,
  vakitSayacKimligi,
  type CanliAday,
  type PlanGunu,
} from '../canliSayacPlani';
import {
  VARSAYILAN_NOW_BAR_AYARLARI,
  nowBarAyariniBirlestir,
  type NowBarAyarlari,
  type NowBarOgesi,
} from '../nowBar';

// Kotlin ikiziyle (CanliPlanKurallari) ORTAK fikstür.
const fikstur = require('../../../../modules/expo-countdown-notification/android/src/test/resources/canli-plan-ornegi.json') as unknown[];

const DK = 60_000;

/** Yerel saatle bir gün ('YYYY-MM-DD', 'SS:DD' ×6). Saf hesap: tarih SABİT olabilir (bugün filtresi yok). */
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
const GUNLER: PlanGunu[] = [
  gun('2026-10-15', SAATLER),
  gun('2026-10-16', SAATLER),
  gun('2026-10-17', SAATLER),
  gun('2026-10-18', SAATLER),
];
const an = (tarih: string, hhmm: string) => {
  const [y, a, g] = tarih.split('-').map(Number);
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(y, a - 1, g, h, m).getTime();
};

const ayarla = (degisiklikler: Partial<Record<NowBarOgesi, Partial<NowBarAyarlari['ogeler'][NowBarOgesi]>>>) => {
  let a = VARSAYILAN_NOW_BAR_AYARLARI;
  for (const [oge, d] of Object.entries(degisiklikler)) a = nowBarAyariniBirlestir(a, oge as NowBarOgesi, d);
  return a;
};

const adaylar = (ayarlar: NowBarAyarlari, simdiMs: number, ek: Partial<Parameters<typeof nowBarAdaylariniOlustur>[0]> = {}) =>
  nowBarAdaylariniOlustur({
    ayarlar,
    simdiMs,
    gunler: GUNLER,
    kilinmisMi: () => false,
    ozelGundeMi: () => false,
    ...ek,
  });

const sayacAdayi = (oge: NowBarOgesi, id: string, bas: number, hedef: number, dogal?: number): CanliAday => ({
  oge,
  kaynak: 'sayac',
  id,
  baslangicMs: bas,
  dogalBaslangicMs: dogal,
  hedefMs: hedef,
  baslik: oge,
  govdeSablonu: '{time}',
  kanalId: `${oge}_kanal`,
  tema: oge === 'iftar' || oge === 'sahur' || oge === 'seri' ? oge : 'vakit',
  hedefteKaybol: false,
  canli: { baslangicMs: bas, bolumler: [] },
});

describe('nowBarAdaylariniOlustur — planlayıcının kendi adayları', () => {
  test('varsayılanda HİÇ aday yok (vakitler "sayaçla", gerisi kapalı)', () => {
    expect(adaylar(VARSAYILAN_NOW_BAR_AYARLARI, an('2026-10-16', '10:00'))).toEqual([]);
  });

  test('öğle "vakit girince": giriş → çıkış, sayaç kimliğiyle ve "Kıldım" verisiyle', () => {
    const a = ayarla({ ogle: { baslangic: 'girince' } });
    const sonuc = adaylar(a, an('2026-10-16', '10:00')).filter((x) => x.oge === 'ogle');
    expect(sonuc[0]).toMatchObject({
      kaynak: 'nowBar',
      id: vakitSayacKimligi('2026-10-16', 'ogle'),
      baslangicMs: an('2026-10-16', '12:30'),
      hedefMs: an('2026-10-16', '15:40'),
      kanalId: CANLI_SAYAC_KANALI,
      hedefteKaybol: true,
    });
    expect(sonuc[0].canli.kildim).toEqual({ tarih: '2026-10-16', vakit: 'ogle' });
  });

  test('yatsı ertesi günün imsakına uzanır; kılınmış ve özel gün vakti atlanır', () => {
    const a = ayarla({ yatsi: { baslangic: 'sonDk' }, aksam: { baslangic: 'girince' } });
    const simdi = an('2026-10-16', '18:00');
    const tum = adaylar(a, simdi);
    const yatsi = tum.find((x) => x.id === vakitSayacKimligi('2026-10-16', 'yatsi'));
    expect(yatsi?.hedefMs).toBe(an('2026-10-17', '05:30'));
    const kilinmis = adaylar(a, simdi, { kilinmisMi: (t, v) => t === '2026-10-16' && v === 'aksam' });
    expect(kilinmis.some((x) => x.id === vakitSayacKimligi('2026-10-16', 'aksam'))).toBe(false);
    const ozel = adaylar(a, simdi, { ozelGundeMi: (t) => t === '2026-10-16' });
    expect(ozel.some((x) => x.id.includes('2026-10-16'))).toBe(false);
  });

  test('cuma YALNIZ cuma günü: güneş doğuşu → öğle girişi', () => {
    const a = ayarla({ cuma: { acik: true } });
    const sonuc = adaylar(a, an('2026-10-15', '10:00')).filter((x) => x.oge === 'cuma');
    expect(sonuc).toHaveLength(1);
    expect(sonuc[0]).toMatchObject({
      id: 'canli_sayac_cuma_2026-10-16',
      dogalBaslangicMs: an('2026-10-16', '07:00'),
      hedefMs: an('2026-10-16', '12:30'),
      tema: 'cuma',
    });
  });

  test('teheccüdün "girince"si yatsı değil gecenin son üçte biri', () => {
    const a = ayarla({ teheccud: { acik: true } });
    const t = adaylar(a, an('2026-10-16', '20:00')).find((x) => x.id === 'canli_sayac_teheccud_2026-10-16');
    // akşam 18:20 → imsak 05:30 = 670 dk; 2/3 = 446,67 dk → 01:46:40
    expect(t?.baslangicMs).toBe(an('2026-10-17', '01:46') + 40_000);
    expect(t?.hedefMs).toBe(an('2026-10-17', '05:30'));
  });

  test('48 saatten sonra başlayan pencere planlanmaz', () => {
    const a = ayarla({ kusluk: { acik: true } });
    const ids = adaylar(a, an('2026-10-15', '06:00')).map((x) => x.id);
    expect(ids).toContain('canli_sayac_kusluk_2026-10-16');
    expect(ids).not.toContain('canli_sayac_kusluk_2026-10-18');
  });
});

describe('secimliBaslangic', () => {
  const iftar = sayacAdayi('iftar', 'iftar_sayac_x', an('2026-10-16', '05:30'), an('2026-10-16', '18:20'));
  test('"sayaçla" sayacın başladığı an', () => {
    expect(secimliBaslangic(iftar, VARSAYILAN_NOW_BAR_AYARLARI)).toBe(an('2026-10-16', '05:30'));
  });
  test('"son N dk" hedeften geri, doğal başlangıçtan önceye taşmaz', () => {
    expect(secimliBaslangic(iftar, ayarla({ iftar: { baslangic: 'sonDk', sonDk: 45 } }))).toBe(an('2026-10-16', '17:35'));
    const kisa = sayacAdayi('iftar', 'k', an('2026-10-16', '18:00'), an('2026-10-16', '18:20'));
    expect(secimliBaslangic(kisa, ayarla({ iftar: { baslangic: 'sonDk', sonDk: 180 } }))).toBe(an('2026-10-16', '18:00'));
  });
  test('kapalı öğe → null', () => {
    expect(secimliBaslangic(iftar, ayarla({ iftar: { acik: false } }))).toBeNull();
  });
});

describe('canliZamanCizelgesiOlustur — tek öne çıkan', () => {
  test('iftar gün boyu öne çıkar; ikindi sayacı gelince iftar SIRADAN sayaca iner, ikindi bitince geri çıkar', () => {
    const simdi = an('2026-10-16', '09:00');
    const iftar = sayacAdayi('iftar', 'iftar_sayac_2026-10-16', an('2026-10-16', '05:30'), an('2026-10-16', '18:20'));
    const ikindi = sayacAdayi('ikindi', 'sayac_2026-10-16_ikindi', an('2026-10-16', '17:35'), an('2026-10-16', '18:20'));
    const olaylar = canliZamanCizelgesiOlustur([iftar, ikindi], VARSAYILAN_NOW_BAR_AYARLARI, simdi);
    expect(olaylar.map((o) => [o.anMs, o.id, o.eylem])).toEqual([
      [simdi, 'iftar_sayac_2026-10-16', 'oneCikar'],
      [an('2026-10-16', '17:35'), 'sayac_2026-10-16_ikindi', 'oneCikar'],
      [an('2026-10-16', '17:35'), 'iftar_sayac_2026-10-16', 'normal'],
    ]);
    // Aynı anda iki öne çıkan YOK
  });

  test('kaybeden Now Bar adayı GİZLENİR, kazanan bitince öne çıkar', () => {
    const a = ayarla({ cuma: { acik: true, baslangic: 'girince' } });
    const simdi = an('2026-10-16', '06:00');
    const sahur = sayacAdayi('sahur', 'sahur_sayac_x', an('2026-10-15', '19:40'), an('2026-10-16', '07:30'));
    const cuma = adaylar(a, simdi).filter((x) => x.oge === 'cuma');
    const olaylar = canliZamanCizelgesiOlustur([...cuma, sahur], a, simdi);
    expect(olaylar.map((o) => [o.anMs, o.id, o.eylem])).toEqual([
      [simdi, 'sahur_sayac_x', 'oneCikar'],
      // 07:00'de cuma başlar ama sahur (öncelik 3) cumayı (4) yener → olay yok
      [an('2026-10-16', '07:30'), 'canli_sayac_cuma_2026-10-16', 'oneCikar'],
    ]);
  });

  test('öne çıkan Now Bar adayı daha önceliklisi gelince gizlenir (önce gizle, sonra göster)', () => {
    const a = ayarla({ teheccud: { acik: true }, yatsi: { baslangic: 'sonDk', sonDk: 30 } });
    const simdi = an('2026-10-16', '23:00');
    const olaylar = canliZamanCizelgesiOlustur(adaylar(a, simdi), a, simdi);
    const yatsiId = vakitSayacKimligi('2026-10-16', 'yatsi');
    const tehId = 'canli_sayac_teheccud_2026-10-16';
    // Yalnız bu gecenin olayları (ufuk ertesi geceyi de kapsar).
    expect(olaylar.slice(0, 3).map((o) => [o.anMs, o.id, o.eylem])).toEqual([
      [an('2026-10-17', '01:46') + 40_000, tehId, 'oneCikar'],
      [an('2026-10-17', '05:00'), tehId, 'gizle'],
      [an('2026-10-17', '05:00'), yatsiId, 'oneCikar'],
    ]);
  });

  test('vakit "girince/son dk" seçildiyse sayacın bildirdiği vakit adayı yok sayılır (çift yok)', () => {
    const a = ayarla({ ogle: { baslangic: 'girince' } });
    const simdi = an('2026-10-16', '13:00');
    const sayac = sayacAdayi('ogle', vakitSayacKimligi('2026-10-16', 'ogle'), an('2026-10-16', '14:55'), an('2026-10-16', '15:40'));
    const olaylar = canliZamanCizelgesiOlustur([sayac, ...adaylar(a, simdi)], a, simdi);
    const ogle = olaylar.filter((o) => o.id === sayac.id);
    expect(ogle).toHaveLength(1);
    expect(ogle[0].aday?.kaynak).toBe('nowBar');
    expect(ogle[0].anMs).toBe(simdi);
  });

  test('kapalı öğenin sayaç adayı plana girmez (sayaç kendi eski yolunda kalır)', () => {
    const a = ayarla({ iftar: { acik: false } });
    const iftar = sayacAdayi('iftar', 'i', an('2026-10-16', '05:30'), an('2026-10-16', '18:20'));
    expect(canliZamanCizelgesiOlustur([iftar], a, an('2026-10-16', '09:00'))).toEqual([]);
  });

  test('hedefi geçmiş aday yok sayılır', () => {
    const iftar = sayacAdayi('iftar', 'i', an('2026-10-16', '05:30'), an('2026-10-16', '18:20'));
    expect(canliZamanCizelgesiOlustur([iftar], VARSAYILAN_NOW_BAR_AYARLARI, an('2026-10-16', '19:00'))).toEqual([]);
  });
});

describe('native sözleşmesi', () => {
  test('JSON ortak fikstürle birebir aynı (Kotlin aynı dosyayı çözer)', () => {
    const simdi = an('2026-10-16', '09:00');
    const iftar = sayacAdayi('iftar', 'iftar_sayac_2026-10-16', an('2026-10-16', '05:30'), an('2026-10-16', '18:20'));
    iftar.canli = { baslangicMs: an('2026-10-16', '05:30'), bolumler: [{ uzunlukDk: 770, vurgulu: false }] };
    const ikindi = sayacAdayi('ikindi', 'sayac_2026-10-16_ikindi', an('2026-10-16', '17:35'), an('2026-10-16', '18:20'));
    ikindi.canli = { ...ikindi.canli, kildim: { tarih: '2026-10-16', vakit: 'ikindi' } };
    const olaylar = canliZamanCizelgesiOlustur([iftar, ikindi], VARSAYILAN_NOW_BAR_AYARLARI, simdi);
    // Fikstür mutlak zaman taşır; yerel saat dilimine bağlı olmasın diye göreli kıyas.
    const gizle = { anMs: simdi + 60 * DK, id: 'canli_sayac_kusluk_2026-10-16', eylem: 'gizle' as const };
    const json = JSON.parse(canliPlanJsonuOlustur([...olaylar, gizle])) as Record<string, unknown>[];
    const goreli = json.map((o) => ({
      ...o,
      anMs: (o.anMs as number) - simdi,
      ...(o.hedefMs ? { hedefMs: (o.hedefMs as number) - simdi } : {}),
      ...(o.ek ? { ek: { ...(o.ek as object), baslangicMs: ((o.ek as { baslangicMs: number }).baslangicMs) - simdi } } : {}),
    }));
    expect(goreli).toEqual(fikstur);
  });
});

describe('saat (Wear OS)', () => {
  test('öne çıkan dilimler; vakit "sayaçla" adayları saate GİTMEZ (saat kendi sayacını çizer)', () => {
    const a = ayarla({ cuma: { acik: true, baslangic: 'sonDk', sonDk: 60 } });
    const simdi = an('2026-10-16', '09:00');
    const iftar = sayacAdayi('iftar', 'i', an('2026-10-16', '05:30'), an('2026-10-16', '18:20'));
    const ikindi = sayacAdayi('ikindi', 'sayac_2026-10-16_ikindi', an('2026-10-16', '17:35'), an('2026-10-16', '18:20'));
    const p = saatPencereleriniOlustur([iftar, ikindi, ...adaylar(a, simdi)], a, simdi);
    expect(p.map((x) => [x.oge, x.bas, x.bitis])).toEqual([
      ['iftar', simdi, an('2026-10-16', '18:20')],
    ]);
    // Cuma (öncelik 4) iftarın (2) altında kalır.
  });

  test('vakit seçimi: yalnız açık + sayaçla iken saat kendi sayacını gösterir', () => {
    const a = ayarla({ ogle: { baslangic: 'girince' }, aksam: { acik: false } });
    expect(saatVakitSecimi(a)).toEqual({ imsak: true, ogle: false, ikindi: true, aksam: false, yatsi: true });
  });

  test('vakit "girince" saatte pencere olarak gelir, "Kıldım" verisiyle', () => {
    const a = ayarla({ ogle: { baslangic: 'girince' } });
    const simdi = an('2026-10-16', '10:00');
    const p = saatPencereleriniOlustur(adaylar(a, simdi), a, simdi);
    expect(p[0]).toMatchObject({ oge: 'ogle', ad: 'Öğle', tarih: '2026-10-16', vakit: 'ogle', oncelik: 1 });
  });
});
