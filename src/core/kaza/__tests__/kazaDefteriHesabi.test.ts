/**
 * Kaza Defteri 2.0 — saf türetme (fold), izdüşüm, göç, fazla kuralı, önizleme,
 * temizlik, tarama günlüğü ve geçmiş satırları.
 */
import {
  defterHesapla,
  eskiAnlikGoruntuUret,
  eskiDurumdanHareketler,
  eskiGorunumHareketi,
  gecmisSatirlari,
  izdusumGunleri,
  otomatikBaslangicGecerliMi,
  otomatikDurumu,
  taramaFarki,
  temizlikAdaylari,
  yeniTabanOnizlemesi,
  GECMIS_TARAMA_AZAMI_GUN,
  type DefterHesapGirdisi,
} from '../kazaDefteriHesabi';
import { gunEkle, ISOTarihiDateNesnesiNeCevir } from '../../utils/TarihYardimcisi';
import type { KazaHareketi, KazaVakti } from '../kazaHareketi';

const BUGUN = '2026-10-15';
let sayac = 0;
const h = (kaynak: KazaHareketi['kaynak'], zaman: string, ek: Partial<KazaHareketi> = {}): KazaHareketi => ({
  id: `${kaynak}:${(sayac += 1)}`,
  zaman,
  cihaz: 'abc',
  kaynak,
  ...ek,
});
const SIFIR: Record<KazaVakti, number> = { sabah: 0, ogle: 0, ikindi: 0, aksam: 0, yatsi: 0, vitir: 0 };
const taban = (zaman: string, degerler: Partial<Record<KazaVakti, number>>, ek: Partial<KazaHareketi> = {}) =>
  h('taban', zaman, { taban: { ...SIFIR, ...degerler }, ...ek });
const manuel = (zaman: string, vakit: KazaVakti, adet: number) => h('manuel', zaman, { vakit, adet });
const kilindi = (zaman: string, vakit: KazaVakti, adet: number) => h('kilindi', zaman, { vakit, adet });
const oto = (gun: string, aktif = true, kayitsiz?: 'sor' | 'ekle') =>
  h('otoAyar', `${gun}T06:00:00.000Z`, { aktif, gun, ...(kayitsiz ? { kayitsiz } : {}) });

const girdi = (hareketler: KazaHareketi[], ek: Partial<DefterHesapGirdisi> = {}): DefterHesapGirdisi => ({
  hareketler,
  bugunNamazGunu: BUGUN,
  bugunTakvim: BUGUN,
  isaretliler: {},
  ozelGunler: new Set(),
  vitirDahil: false,
  gunlukHedef: 0,
  toplamGizleMi: false,
  ...ek,
});
const hesap = (hareketler: KazaHareketi[], ek: Partial<DefterHesapGirdisi> = {}) => defterHesapla(girdi(hareketler, ek));
const vakit = (g: ReturnType<typeof hesap>, ad: string) => g.namazlar.find((n) => n.namazAdi === ad)!;
const TUM_FARZ: KazaVakti[] = ['sabah', 'ogle', 'ikindi', 'aksam', 'yatsi'];

describe('göç (eski KAZA_DURUMU → hareketler)', () => {
  const eski = {
    namazlar: [
      { namazAdi: 'Sabah', kalanBorc: 12, tamamlanan: 3, toplamBorc: 15 },
      { namazAdi: 'Vitir', kalanBorc: 4, tamamlanan: 0, toplamBorc: 4 },
    ],
    gunlukHedef: 3,
    toplamGizleMi: true,
  };

  it('her vakitte görünen kalan BİREBİR aynı kalır; fazla oluşmaz', () => {
    const g = eskiDurumdanHareketler(eski, '2026-10-15T10:00:00.000Z', 'abc')!;
    const d = hesap(g.hareketler);
    expect(vakit(d, 'Sabah')).toMatchObject({ kalanBorc: 12, tamamlanan: 3 });
    expect(vakit(d, 'Vitir')).toMatchObject({ kalanBorc: 4, tamamlanan: 0 });
    expect(d.toplamFazla).toBe(0);
    expect(g.ayarlar).toEqual({ gunlukHedef: 3, toplamGizleMi: true });
  });

  it('kimlikler İÇERİKTEN türer: iki cihaz aynı hareketleri üretir', () => {
    const a = eskiDurumdanHareketler(eski, '2026-10-15T10:00:00.000Z', 'a')!;
    const b = eskiDurumdanHareketler(eski, '2026-10-16T11:00:00.000Z', 'b')!;
    expect(a.hareketler.map((x) => x.id)).toEqual(b.hareketler.map((x) => x.id));
  });

  it('boş kayıt hareket üretmez; nesne-dışı değer bozuktur (null)', () => {
    expect(eskiDurumdanHareketler({ namazlar: [] }, 'z', 'a')!.hareketler).toEqual([]);
    expect(eskiDurumdanHareketler(null, 'z', 'a')).toBeNull();
    expect(eskiDurumdanHareketler(42, 'z', 'a')).toBeNull();
  });

  it('iki farklı göç grubu birleşirse yalnız KAZANAN grubun kılınanı sayılır (çift sayım yok)', () => {
    const a = eskiDurumdanHareketler(eski, '2026-10-15T10:00:00.000Z', 'a')!.hareketler;
    const b = eskiDurumdanHareketler(
      { namazlar: [{ namazAdi: 'Sabah', kalanBorc: 10, tamamlanan: 5 }] },
      '2026-10-15T11:00:00.000Z',
      'b'
    )!.hareketler;
    const d = hesap([...a, ...b]);
    expect(vakit(d, 'Sabah')).toMatchObject({ kalanBorc: 10, tamamlanan: 5 });
  });
});

describe('fazla kılınan — AYRI akümülatör (sahip kararı)', () => {
  it('NÖBETÇİ: fazla 50 iken sonradan +30 borç → kalan 30, fazla 50 (fazla borcu yutmaz)', () => {
    const d = hesap([kilindi('2026-10-01T08:00:00.000Z', 'sabah', 50), manuel('2026-10-02T08:00:00.000Z', 'sabah', 30)]);
    expect(vakit(d, 'Sabah').kalanBorc).toBe(30);
    expect(d.fazla.Sabah).toBe(50);
    expect(d.toplamKalan).toBe(30);
  });

  it('kılınan, ÖNCE kapanmış otomatik günlerin borcunu düşer', () => {
    const d = hesap(
      [oto('2026-10-01', true, 'ekle'), kilindi('2026-10-14T20:00:00.000Z', 'sabah', 3)],
      { isaretliler: {} }
    );
    // 1–14 Ekim: 14 gün × 1 sabah otomatik; sonra 3 kılındı.
    expect(vakit(d, 'Sabah')).toMatchObject({ kalanBorc: 11, tamamlanan: 3 });
    expect(d.fazla.Sabah).toBe(0);
  });

  it('sıra anlamlıdır: önce kılıp sonra borç eklemek fazla bırakır', () => {
    const once = hesap([manuel('2026-10-01T08:00:00.000Z', 'ogle', 5), kilindi('2026-10-02T08:00:00.000Z', 'ogle', 5)]);
    const sonra = hesap([kilindi('2026-10-01T08:00:00.000Z', 'ogle', 5), manuel('2026-10-02T08:00:00.000Z', 'ogle', 5)]);
    expect([vakit(once, 'Öğle').kalanBorc, once.fazla['Öğle']]).toEqual([0, 0]);
    expect([vakit(sonra, 'Öğle').kalanBorc, sonra.fazla['Öğle']]).toEqual([5, 5]);
  });

  it('taban daima başlangıçtır (zamanından bağımsız): yeni taban kılınanları yeniden uygular', () => {
    const d = hesap([
      kilindi('2026-09-01T08:00:00.000Z', 'sabah', 200),
      manuel('2026-09-02T08:00:00.000Z', 'sabah', 30),
      taban('2026-10-10T08:00:00.000Z', { sabah: 150 }),
    ]);
    // 150 − 200 → kalan 0, fazla 50; ardından +30 → kalan 30.
    expect(vakit(d, 'Sabah').kalanBorc).toBe(30);
    expect(d.fazla.Sabah).toBe(50);
  });

  it('−düzeltme yalnız fazlayı düşer; kalan değişmez', () => {
    const d = hesap([
      kilindi('2026-10-01T08:00:00.000Z', 'yatsi', 8),
      manuel('2026-10-02T08:00:00.000Z', 'yatsi', 2),
      h('duzeltme', '2026-10-03T08:00:00.000Z', { vakit: 'yatsi', adet: -8 }),
    ]);
    expect(vakit(d, 'Yatsı').kalanBorc).toBe(2);
    expect(d.fazla['Yatsı']).toBe(0);
  });

  it('girdi sırası/tekrarı sonucu DEĞİŞTİRMEZ', () => {
    const liste = [
      taban('2026-09-01T00:00:00.000Z', { sabah: 10, ogle: 4 }),
      kilindi('2026-09-05T00:00:00.000Z', 'sabah', 12),
      manuel('2026-09-06T00:00:00.000Z', 'sabah', 3),
      kilindi('2026-09-07T00:00:00.000Z', 'ogle', 1),
    ];
    const a = hesap(liste);
    const b = hesap([...liste].reverse());
    expect(b.namazlar).toEqual(a.namazlar);
    expect(b.fazla).toEqual(a.fazla);
  });
});

describe('otomatik izdüşüm (namaz kaydının aynası)', () => {
  const ac = oto('2026-10-12', true, 'ekle');

  it('kapanmış günün işaretsiz farzı +1; bugün (süren namaz günü) sayılmaz', () => {
    const d = hesap([ac], { isaretliler: { '2026-10-12': ['sabah', 'ogle', 'ikindi', 'aksam'], '2026-10-13': TUM_FARZ } });
    // 12 Ekim yatsı + 14 Ekim beş vakit (hiç işaret yok, "ekle"); 15 Ekim süren gün.
    expect(d.ozet.otomatik).toBe(6);
    expect(d.otomatikKayitlar.map((o) => o.id)).toContain('oto:2026-10-12_yatsi');
    expect(d.otomatikKayitlar.some((o) => o.gun === BUGUN)).toBe(false);
  });

  it('"kıldım" deyince düşer, "kılmadım" deyince geri gelir (toggle saklanmaz)', () => {
    const isaretsiz = hesap([ac], { isaretliler: { '2026-10-12': ['sabah'], '2026-10-13': TUM_FARZ, '2026-10-14': TUM_FARZ } });
    const kildi = hesap([ac], { isaretliler: { '2026-10-12': TUM_FARZ, '2026-10-13': TUM_FARZ, '2026-10-14': TUM_FARZ } });
    expect(isaretsiz.ozet.otomatik).toBe(4);
    expect(kildi.ozet.otomatik).toBe(0);
  });

  it('vitir yalnız mezhep Hanefî iken ve yatsı işaretsizken eklenir', () => {
    const isaretli = { '2026-10-12': ['sabah', 'ogle', 'ikindi', 'aksam'] as KazaVakti[], '2026-10-13': TUM_FARZ, '2026-10-14': TUM_FARZ };
    expect(hesap([ac], { isaretliler: isaretli, vitirDahil: true }).ozet.otomatik).toBe(2);
    expect(hesap([ac], { isaretliler: isaretli, vitirDahil: false }).ozet.otomatik).toBe(1);
    expect(hesap([ac], { isaretliler: { ...isaretli, '2026-10-12': TUM_FARZ }, vitirDahil: true }).ozet.otomatik).toBe(0);
  });

  it('özel gün (hayız/nifas) eklenmez', () => {
    const d = hesap([ac], { ozelGunler: new Set(['2026-10-12', '2026-10-13', '2026-10-14']) });
    expect(d.ozet.otomatik).toBe(0);
  });

  it('TEKİLLİK: aynı gün+vakit bildirimden eklenmişse otomatik ayrıca sayılmaz', () => {
    const bildirim = h('bildirim', '2026-10-12T21:00:00.000Z', { referans: '2026-10-12_yatsi', vakit: 'yatsi', adet: 1 });
    const d = hesap([ac, bildirim], {
      isaretliler: { '2026-10-12': ['sabah', 'ogle', 'ikindi', 'aksam'], '2026-10-13': TUM_FARZ, '2026-10-14': TUM_FARZ },
    });
    expect(d.ozet.otomatik).toBe(0);
    expect(d.ozet.bildirim).toBe(1);
    expect(d.toplamKalan).toBe(1);
  });

  it('temizlikle gizlenen otomatik kayıt sayılmaz, geri alınınca döner', () => {
    const isaretli = { '2026-10-12': ['sabah', 'ogle', 'ikindi', 'aksam'] as KazaVakti[], '2026-10-13': TUM_FARZ, '2026-10-14': TUM_FARZ };
    const temizlik = h('temizlik', '2026-10-15T08:00:00.000Z', { hedefIdler: ['oto:2026-10-12_yatsi'] });
    expect(hesap([ac, temizlik], { isaretliler: isaretli }).toplamKalan).toBe(0);
    const geri = h('temizlikGeriAl', '2026-10-15T09:00:00.000Z', { hedefId: temizlik.id });
    expect(hesap([ac, temizlik, geri], { isaretliler: isaretli }).toplamKalan).toBe(1);
  });

  it('"bana sorun": hiç işaret olmayan gün bekler; karar "ekle" sayar, "yok say" saymaz', () => {
    const sor = oto('2026-10-13', true, 'sor');
    const d = hesap([sor], { isaretliler: { '2026-10-13': TUM_FARZ } });
    expect(d.bekleyenGunler).toEqual(['2026-10-14']);
    expect(d.ozet.otomatik).toBe(0);
    const ekle = h('gunKarari', '2026-10-15T08:00:00.000Z', { referans: '2026-10-14', karar: 'ekle' });
    expect(hesap([sor, ekle], { isaretliler: { '2026-10-13': TUM_FARZ } }).ozet.otomatik).toBe(5);
    const yoksay = h('gunKarari', '2026-10-15T08:00:00.000Z', { referans: '2026-10-14', karar: 'yoksay' });
    const y = hesap([sor, yoksay], { isaretliler: { '2026-10-13': TUM_FARZ } });
    expect([y.ozet.otomatik, y.bekleyenGunler]).toEqual([0, []]);
  });

  it('namaz kaydı okunamadıysa (izdusumKapali) hiç borç uydurulmaz', () => {
    expect(hesap([ac], { izdusumKapali: true }).ozet.otomatik).toBe(0);
  });

  it('kapatıp açmak ARADAKİ günleri taramaz', () => {
    const liste = [oto('2026-10-01', true, 'ekle'), oto('2026-10-04', false), oto('2026-10-10', true)];
    expect(otomatikDurumu(liste).araliklar).toEqual([
      { baslangic: '2026-10-01', bitis: '2026-10-03' },
      { baslangic: '2026-10-10', bitis: null },
    ]);
    const gunler = izdusumGunleri(liste, BUGUN);
    expect(gunler).toContain('2026-10-03');
    expect(gunler).not.toContain('2026-10-05');
    expect(gunler[gunler.length - 1]).toBe('2026-10-14');
  });

  it('başlangıç sınırı: geçersiz, gelecek ve bir yıldan eski gün reddedilir', () => {
    expect(otomatikBaslangicGecerliMi(BUGUN, BUGUN)).toBe(true);
    expect(otomatikBaslangicGecerliMi(gunEkle(BUGUN, -GECMIS_TARAMA_AZAMI_GUN), BUGUN)).toBe(true);
    expect(otomatikBaslangicGecerliMi(gunEkle(BUGUN, -GECMIS_TARAMA_AZAMI_GUN - 1), BUGUN)).toBe(false);
    expect(otomatikBaslangicGecerliMi(gunEkle(BUGUN, 1), BUGUN)).toBe(false);
    expect(otomatikBaslangicGecerliMi('15.10.2026', BUGUN)).toBe(false);
  });
});

describe('karışık sürüm: eski anlık görüntü', () => {
  const temelDefter = [taban('2026-09-01T00:00:00.000Z', { sabah: 10 })];

  it('türetilmiş görüntü eski KazaDurumu şeklindedir; DEĞİŞMEDEN geri gelirse yeniden içe alınmaz', () => {
    const goruntu = eskiAnlikGoruntuUret(hesap(temelDefter));
    expect(goruntu.namazlar.find((n) => n.namazAdi === 'Sabah')).toMatchObject({ kalanBorc: 10, toplamBorc: 10 });
    expect(eskiGorunumHareketi(goruntu, 'z', 'a')).toBeNull();
  });

  it('eski cihazda kılınanlar "en az bu kadar" olarak girer; MAKSİMUM → tekrar uygulanabilir', () => {
    const goruntu = { ...eskiAnlikGoruntuUret(hesap(temelDefter)), namazlar: [{ namazAdi: 'Sabah', kalanBorc: 7, tamamlanan: 3 }] };
    const e1 = eskiGorunumHareketi(goruntu, '2026-10-15T00:00:00.000Z', 'a')!;
    const e2 = eskiGorunumHareketi(goruntu, '2026-10-16T00:00:00.000Z', 'b')!;
    expect(e1.id).toBe(e2.id);
    const d = hesap([...temelDefter, e1, { ...e2, id: `${e2.id}-kopya` }]);
    expect(vakit(d, 'Sabah')).toMatchObject({ kalanBorc: 7, tamamlanan: 3 });
  });

  it('temizlikle gizlenen eski görüntü tabanı artık uygulanmaz (kaçış yolu)', () => {
    const e = eskiGorunumHareketi({ namazlar: [{ namazAdi: 'Sabah', kalanBorc: 7, tamamlanan: 3 }] }, 'z', 'a')!;
    const gizle = h('temizlik', '2026-10-16T00:00:00.000Z', { hedefIdler: [e.id] });
    expect(vakit(hesap([...temelDefter, e, gizle]), 'Sabah')).toMatchObject({ kalanBorc: 10, tamamlanan: 0 });
  });

  it('defterde zaten daha fazla kılınan varsa etkisi yoktur', () => {
    const e = eskiGorunumHareketi({ namazlar: [{ namazAdi: 'Sabah', kalanBorc: 9, tamamlanan: 1 }] }, 'z', 'a')!;
    const d = hesap([...temelDefter, kilindi('2026-10-01T00:00:00.000Z', 'sabah', 4), e]);
    expect(vakit(d, 'Sabah')).toMatchObject({ kalanBorc: 6, tamamlanan: 4 });
  });
});

describe('yeniTabanOnizlemesi', () => {
  let n = 0;
  const kimlik = (onek: string) => `${onek}:onizleme${(n += 1)}`;

  it('örtüşen otomatik/bildirim kayıtlarını sayar; "gizle" tek temizlik yazar', () => {
    const liste = [
      oto('2026-10-12', true, 'ekle'),
      h('bildirim', '2026-10-01T21:00:00.000Z', { referans: '2026-10-01_ogle', vakit: 'ogle', adet: 1 }),
      manuel('2026-10-02T00:00:00.000Z', 'sabah', 30),
    ];
    const g = girdi(liste, { isaretliler: { '2026-10-12': TUM_FARZ, '2026-10-13': TUM_FARZ } });
    const o = yeniTabanOnizlemesi(g, { ...SIFIR, sabah: 100 }, BUGUN, '2026-10-15T10:00:00.000Z', 'abc', kimlik);
    expect(o.ortusenOtomatik).toBe(5);
    expect(o.ortusenBildirim).toBe(1);
    expect(o.ayrica.toplamKalan).toBe(100 + 30 + 5 + 1);
    expect(o.gizle!.toplamKalan).toBe(130);
    expect(o.yazilacak.ayrica).toHaveLength(1);
    expect(o.yazilacak.gizle.map((x) => x.kaynak)).toEqual(['taban', 'temizlik']);
    expect(o.gocmisTabanDegisiyor).toBe(false);
  });

  it('değişen taban göçle geldiyse bunu bildirir; göçle gelen kılınanlar yeni tabandan da düşer', () => {
    const goc = eskiDurumdanHareketler(
      { namazlar: [{ namazAdi: 'Sabah', kalanBorc: 10, tamamlanan: 5 }] },
      '2026-10-01T00:00:00.000Z',
      'abc'
    )!.hareketler;
    const o = yeniTabanOnizlemesi(girdi(goc), { ...SIFIR, sabah: 40 }, BUGUN, '2026-10-15T10:00:00.000Z', 'abc', kimlik);
    expect(o.gocmisTabanDegisiyor).toBe(true);
    expect(o.eski.toplamKalan).toBe(10);
    expect(o.ayrica.toplamKalan).toBe(35);
    expect(o.gizle).toBeNull();
  });
});

describe('temizlikAdaylari', () => {
  const liste = [
    taban('2026-09-01T00:00:00.000Z', { ogle: 5 }),
    manuel('2026-10-02T10:00:00.000Z', 'ogle', 2),
    kilindi('2026-10-03T10:00:00.000Z', 'sabah', 1),
    h('kilindi', '2026-09-01T00:00:00.000Z', { vakit: 'sabah', adet: 3, gocmis: true, grup: 'goc-x' }),
  ];

  it('taban ve göç kayıtları ADAY DEĞİLDİR; süzgece göre seçer', () => {
    const tumu = temizlikAdaylari(liste, [], { kaynaklar: ['manuel', 'kilindi', 'otomatik', 'bildirim', 'duzeltme'] });
    expect(tumu.map((a) => a.kaynak).sort()).toEqual(['kilindi', 'manuel']);
    expect(temizlikAdaylari(liste, [], { kaynaklar: ['manuel'], vakit: 'sabah' })).toEqual([]);
    expect(temizlikAdaylari(liste, [], { kaynaklar: ['manuel', 'kilindi'], baslangic: '2026-10-03' }).map((a) => a.kaynak)).toEqual([
      'kilindi',
    ]);
  });

  it('otomatik kayıtlar ve etkileri; zaten gizli olan tekrar aday olmaz', () => {
    const otoKayit = { id: 'oto:2026-10-12_ogle', referans: '2026-10-12_ogle', gun: '2026-10-12', vakit: 'ogle' as KazaVakti };
    const adaylar = temizlikAdaylari(liste, [otoKayit], { kaynaklar: ['otomatik', 'kilindi'] });
    expect(adaylar.find((a) => a.kaynak === 'otomatik')).toMatchObject({ etki: 1, gun: '2026-10-12' });
    expect(adaylar.find((a) => a.kaynak === 'kilindi')!.etki).toBe(-1);
    const gizli = h('temizlik', '2026-10-04T00:00:00.000Z', { hedefIdler: [liste[1].id] });
    expect(temizlikAdaylari([...liste, gizli], [], { kaynaklar: ['manuel'] })).toEqual([]);
  });
});

describe('tarama günlüğü ve geçmiş satırları', () => {
  it('taramaFarki önceki taramalara göre giren/çıkanı bulur', () => {
    const t1 = h('tarama', '2026-10-13T06:00:00.000Z', { eklenen: ['2026-10-12_ogle', '2026-10-12_ikindi'], cikan: [] });
    expect(taramaFarki([t1], ['2026-10-12_ogle', '2026-10-13_sabah'])).toEqual({
      eklenen: ['2026-10-13_sabah'],
      cikan: ['2026-10-12_ikindi'],
    });
  });

  it('otomatik satırın zamanı: tarama yoksa namaz gününün ertesi YEREL gece yarısı', () => {
    const satirlar = gecmisSatirlari([], {
      otomatikKayitlar: [{ id: 'oto:2026-10-12_ogle', referans: '2026-10-12_ogle', gun: '2026-10-12', vakit: 'ogle' }],
      otomatikAdaylar: ['2026-10-12_ogle'],
    });
    expect(satirlar[0]).toMatchObject({ tur: 'otomatik', delta: 1, gun: '2026-10-12' });
    expect(satirlar[0].zaman).toBe(ISOTarihiDateNesnesiNeCevir('2026-10-13').toISOString());
  });

  it('tarama varsa ilk görüldüğü an kullanılır; geri alınanlar "otomatikGeri" satırıdır', () => {
    const t1 = h('tarama', '2026-10-13T06:00:00.000Z', { eklenen: ['2026-10-12_ogle'], cikan: [] });
    const t2 = h('tarama', '2026-10-14T06:00:00.000Z', { eklenen: [], cikan: ['2026-10-12_ogle'] });
    const satirlar = gecmisSatirlari([t1, t2], { otomatikKayitlar: [], otomatikAdaylar: [] });
    expect(satirlar.map((s) => s.tur)).toEqual(['otomatikGeri']);
    const s2 = gecmisSatirlari([t1], {
      otomatikKayitlar: [{ id: 'oto:2026-10-12_ogle', referans: '2026-10-12_ogle', gun: '2026-10-12', vakit: 'ogle' }],
      otomatikAdaylar: ['2026-10-12_ogle'],
    });
    expect(s2[0].zaman).toBe(t1.zaman);
  });

  it('gizlenen otomatik kayıt görünür kalır (geri alınabilsin); −düzeltme sayısız bilgi satırıdır', () => {
    const temizlik = h('temizlik', '2026-10-14T00:00:00.000Z', { hedefIdler: ['oto:2026-10-12_ogle'] });
    const duz = h('duzeltme', '2026-10-14T01:00:00.000Z', { vakit: 'ogle', adet: -2 });
    const satirlar = gecmisSatirlari([temizlik, duz], { otomatikKayitlar: [], otomatikAdaylar: ['2026-10-12_ogle'] });
    expect(satirlar.find((s) => s.tur === 'otomatik')).toMatchObject({ gizli: true });
    expect(satirlar.find((s) => s.tur === 'duzeltme')!.delta).toBeNull();
  });
});
