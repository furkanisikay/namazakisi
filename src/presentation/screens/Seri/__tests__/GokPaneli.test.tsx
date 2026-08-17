import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';

// react-native-svg mock reçetesi — task-4-report.md'deki reçeteyle AYNI.
// Her bileşen düz bir STRING'e indirgenir (React.createElement ÇAĞIRMA —
// nativewind'in cssInterop babel eklentisi jest.mock fabrikasında
// "_ReactNativeCSSInterop scope dışı" hatası veriyor, doğrulandı).
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  G: 'G',
  Defs: 'Defs',
  RadialGradient: 'RadialGradient',
  LinearGradient: 'LinearGradient',
  Path: 'Path',
  Circle: 'Circle',
  Ellipse: 'Ellipse',
  Line: 'Line',
  Rect: 'Rect',
  Stop: 'Stop',
  Text: 'Text',
}));

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    birincil: '#4CAF50',
    metinIkincil: '#757575',
    birincilMetin: '#FFFFFF',
  }),
}));

// react-native-reanimated mock reçetesi (ortak-notlar.md, aynen kullan + iki
// ekleme): taban `.../mock` NOOP'tur; `withRepeat`/`withTiming`/`withDelay`
// çağrı ARGÜMANLARINI (süre/gecikme) ölçmek için `jest.fn(...)` ile sarılır
// (düz fonksiyon oldukları için varsayılan mock'ta `toHaveBeenCalledWith`
// çalışmaz), `useReducedMotion` mock'ta hiç YOK, elle eklenir. Task 3:
// `withRepeat` de aynı şekilde sarıldı — parıltı/nabız sonsuz döngüsünü
// kurar, "reduced motion açıkken HİÇ çağrılmadı" iddiası bunsuz ölçülemez.
jest.mock('react-native-reanimated', () => {
  const m = require('react-native-reanimated/mock');
  return {
    ...m,
    withRepeat: jest.fn(m.withRepeat),
    withTiming: jest.fn(m.withTiming),
    withDelay: jest.fn(m.withDelay),
    useReducedMotion: jest.fn(() => false),
  };
});

import { GokPaneli } from '../GokPaneli';
import { Parilti } from '../Parilti';
import { BugununNabzi } from '../BugununNabzi';
import { aylikIzgaraOlustur } from '../../../../core/seri/aylikIzgara';
import { zincirBaglari } from '../../../../core/seri/zincir';
import { gokErisimEtiketi } from '../../../../core/seri/gokErisimEtiketi';
import { acilisCizelgesi } from '../../../../core/seri/acilisCizelgesi';
import { GOK_TONLARI, GOK_ZAMANLAMA } from '../sabitler';

const { G, Path, Rect, Text: SvgTextMock } = require('react-native-svg');
const {
  withTiming: withTimingMock,
  withDelay: withDelayMock,
  withRepeat: withRepeatMock,
  useReducedMotion: useReducedMotionMock,
} = require('react-native-reanimated');

const TAM_GUN_ESIGI = 5;

function ornekIzgaraKur() {
  // Temmuz 2026: 1 Temmuz Çarşamba -> ızgara pazartesiden (29 Haziran) başlar,
  // Ağustos'un ilk birkaç günüyle biter. Bilinçli olarak birkaç 5/5 gün +
  // birkaç kısmi gün + bir dondurulmuş gün içerir ki zincir/yıldız çeşitliliği
  // test edilebilsin.
  const kayitlar: Record<string, boolean[]> = {
    '2026-07-01': [true, true, true, true, true],
    '2026-07-02': [true, true, true, true, true],
    '2026-07-03': [true, true, false, false, false],
    '2026-07-06': [true, false, false, false, false],
  };
  const izgara = aylikIzgaraOlustur({
    yil: 2026,
    ay: 6, // Temmuz (0-tabanlı)
    kayitlar,
    dondurulmusTarihler: new Set(['2026-07-04']),
    bugun: '2026-07-10',
  });
  const zincirler = zincirBaglari(izgara, TAM_GUN_ESIGI);
  return { izgara, zincirler };
}

function render(ui: React.ReactElement): renderer.ReactTestRenderer {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(ui);
  });
  return tree;
}

/** Panelin ölçüm View'ına gerçek bir layout genişliği simüle eder. */
function genislikSimuleEt(tree: renderer.ReactTestRenderer, genislik: number) {
  const govde = tree.root.findByProps({ testID: 'gok-paneli-govde' });
  act(() => {
    govde.props.onLayout({ nativeEvent: { layout: { width: genislik, height: 0, x: 0, y: 0 } } });
  });
}

describe('GokPaneli', () => {
  beforeEach(() => {
    withTimingMock.mockClear();
    withDelayMock.mockClear();
    withRepeatMock.mockClear();
    useReducedMotionMock.mockReturnValue(false);
  });

  test('panelGenislik 0 iken (onLayout tetiklenmeden) çökmez ve Svg çizmez', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    expect(() =>
      render(
        <GokPaneli
          izgara={izgara}
          zincirler={zincirler}
          ayAdi="Temmuz 2026"
          bugun="2026-07-10"
          tamGunEsigi={TAM_GUN_ESIGI}
          mevcutSeri={3}
        />
      )
    ).not.toThrow();
  });

  test('onLayout ile genişlik geldikten sonra doğru sayıda yıldız (izgara.length kadar G) render eder', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );

    genislikSimuleEt(tree, 350);

    // Her yıldız kendi `<G transform="translate(...) scale(...)">` içinde
    // konumlanır; ızgara katmanının tamamını (0, HEADER_YUKSEKLIK) kadar
    // kaydıran TEK bir sarmalayıcı `<G>` da vardır (scale içermez) — o yüzden
    // `scale(` içeren transform'a göre süzülür, ham G sayısı izgara.length+1'dir.
    const yildizGruplari = tree.root
      .findAllByType(G)
      .filter((d) => typeof d.props.transform === 'string' && d.props.transform.includes('scale('));
    expect(yildizGruplari).toHaveLength(izgara.length);
  });

  test('zincir yolu (Path) sayısı zincirBaglari çıktısıyla birebir uyumludur', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );

    genislikSimuleEt(tree, 350);

    expect(zincirler.length).toBeGreaterThan(0); // ornekIzgaraKur zincir uretecek sekilde kuruldu
    expect(tree.root.findAllByType(Path)).toHaveLength(zincirler.length);
  });

  test('erişim etiketi panelde ve gokErisimEtiketi çıktısıyla birebir aynı', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );

    const govde = tree.root.findByProps({ testID: 'gok-paneli-govde' });
    expect(govde.props.accessibilityRole).toBe('image');
    expect(govde.props.accessible).toBe(true);
    expect(govde.props.accessibilityLabel).toBe(
      gokErisimEtiketi(izgara, 'Temmuz 2026', 3, TAM_GUN_ESIGI)
    );
  });

  test('KRITIK (inceleme bulgusu #1 — kontrast): ay adı ve gün harfleri koyu panelin İÇİNDE (SVG Text), tema token DEĞİL sabit sahne tonuyla çizilir', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );
    genislikSimuleEt(tree, 350);

    const metinler = tree.root.findAllByType(SvgTextMock);
    const ayAdiMetni = metinler.find((d) => d.props.children === 'Temmuz 2026');
    expect(ayAdiMetni).toBeDefined();
    // Sabit gök sahnesi tonu (AGENTS.md'nin tek istisnası) — tema `renkler.*`
    // DEĞİL; panelin dışına taşınsaydı bu değer açık temada okunmaz olurdu.
    expect(ayAdiMetni!.props.fill).toBe(GOK_TONLARI.AY_ADI);

    const gunHarfi = metinler.find((d) => d.props.children === 'P' && d.props.fill === GOK_TONLARI.GUN_ADI);
    expect(gunHarfi).toBeDefined();
  });

  test('KRITIK (inceleme bulgusu #2 — zincir): ikisiTam düz bağ, yıldız merkezlerinden İÇERİ ÇEKİLMİŞ uçlarla çizilir (halka/bloom bölgesinin İÇİNDEN geçmez)', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );
    genislikSimuleEt(tree, 350);

    // 2026-07-01 ve 2026-07-02 ardışık, ornekIzgaraKur'da ikisi de 5/5 ve aynı
    // satırda (satır sarması değil) -> aralarındaki bağ ikisiTam + düz olmalı.
    const idx = izgara.findIndex((g) => g.tarih === '2026-07-01');
    const bagSirasi = zincirler.findIndex((b) => b.indeks === idx);
    expect(bagSirasi).toBeGreaterThanOrEqual(0);
    expect(zincirler[bagSirasi].ikisiTam).toBe(true);
    expect(zincirler[bagSirasi].satirSarmasi).toBe(false);

    // Gün numaraları izgara sırasıyla render edilir ve `x=merkez.x` taşır —
    // yıldızın GERÇEK merkezini (GokPaneli'nin özel geometri sabitlerini
    // tekrarlamadan) buradan okuyoruz.
    const gunNumaralari = tree.root.findAllByType(SvgTextMock).slice(0, izgara.length);
    const merkezXBaslangic = gunNumaralari[idx].props.x as number;
    const merkezXBitis = gunNumaralari[idx + 1].props.x as number;

    const yol = tree.root.findAllByType(Path)[bagSirasi].props.d as string;
    const sayilar = yol.match(/-?\d+(\.\d+)?/g)!.map(Number);
    const yolBaslangicX = sayilar[0];

    // Inceleme öncesi: yolBaslangicX === merkezXBaslangic (merkez-merkez, bosluk
    // yok sayılıyordu) -> bağ yıldızın halka/bloom bölgesinin içinden geçiyordu.
    // Düzeltme sonrası: baslangic, iki merkez arasında, ilk merkezin KESİNLİKLE
    // içinde (merkeze eşit değil) olmalı.
    expect(yolBaslangicX).toBeGreaterThan(merkezXBaslangic);
    expect(yolBaslangicX).toBeLessThan(merkezXBitis);
  });

  test('boş izgarada (hiç zincir bağı yokken) çökmez', () => {
    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6,
      kayitlar: {},
      dondurulmusTarihler: new Set(),
      bugun: '2026-06-01',
    });
    const tree = render(
      <GokPaneli izgara={izgara} zincirler={[]} ayAdi="Temmuz 2026" bugun="2026-06-01" tamGunEsigi={5} mevcutSeri={0} />
    );
    genislikSimuleEt(tree, 350);
    expect(tree.root.findAllByType(Path)).toHaveLength(0);
  });

  test('AÇILIŞ ANİMASYONU (2a — zincir): strokeDasharray STATİK, strokeDashoffset animatedProps ile taşınır ve mount anında henüz ÇİZİLMEMİŞ (offset === dasharray)', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );
    genislikSimuleEt(tree, 350);

    expect(zincirler).toHaveLength(1); // ornekIzgaraKur -> yalnız 07-01<->07-02 bağı (tek bağ smoke testi)
    const bagYolu = tree.root.findAllByType(Path)[0];

    // "dasharray statik + dashoffset animasyonlu" iddiası (ortak-notlar.md):
    // strokeDasharray düz sayısal prop, animatedProps.strokeDashoffset ayrı.
    expect(typeof bagYolu.props.strokeDasharray).toBe('number');
    expect(bagYolu.props.strokeDasharray).toBeGreaterThan(0);
    expect(typeof bagYolu.props.animatedProps.strokeDashoffset).toBe('number');

    // Mount anında (efekt henüz "withTiming" ile 0'a inmeden ÖNCEKİ render
    // turunun anlık görüntüsü) offset === dasharray -> yol tamamen GİZLİ.
    expect(bagYolu.props.animatedProps.strokeDashoffset).toBe(bagYolu.props.strokeDasharray);

    // withDelay/withTiming gerçekten çağrıldı (bağ zamanı acilisCizelgesi'nden
    // geliyor, 0'a animasyonlanıyor).
    expect(withDelayMock).toHaveBeenCalled();
    expect(withTimingMock).toHaveBeenCalledWith(0, expect.objectContaining({ duration: expect.any(Number) }));
  });

  test('AÇILIŞ ANİMASYONU (2b — yıldız girişi): üç kademe (5/5 · hedef-tuttu · diğer) ayrı sürelerle withTiming çağırır', () => {
    // TAM_GUN_ESIGI=5 ile "hedef tuttu" kademesi hiç oluşamaz (5/5 dışında
    // esiği tutmanın tek yolu >=5 kılınan, yani zaten tam) — bu test için
    // esik=3 ile ayrı bir izgara kuruluyor (acilisCizelgesi.test.ts'teki
    // "esik=3" desenine benzer).
    const kayitlar: Record<string, boolean[]> = {
      '2026-07-01': [true, true, true, true, true], // 5/5 -> GIRIS_TAM
      '2026-07-02': [true, true, true, true, false], // 4/5, esik=3 -> hedef tuttu -> GIRIS_HEDEF
      '2026-07-03': [true, false, false, false, false], // 1/5 -> diger -> GIRIS_SADE
    };
    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6,
      kayitlar,
      dondurulmusTarihler: new Set(),
      bugun: '2026-07-10',
    });
    const zincirler = zincirBaglari(izgara, 3);
    const tree = render(
      <GokPaneli izgara={izgara} zincirler={zincirler} ayAdi="Temmuz 2026" bugun="2026-07-10" tamGunEsigi={3} mevcutSeri={3} />
    );
    genislikSimuleEt(tree, 350);

    const sureler = withTimingMock.mock.calls.map(([, cfg]: [unknown, { duration?: number }]) => cfg?.duration);
    expect(sureler).toContain(GOK_ZAMANLAMA.GIRIS_TAM_MS);
    expect(sureler).toContain(GOK_ZAMANLAMA.GIRIS_HEDEF_MS);
    expect(sureler).toContain(GOK_ZAMANLAMA.GIRIS_SADE_MS);
  });

  test('AÇILIŞ ANİMASYONU: azaltılmış hareket (useReducedMotion=true) açıkken hiçbir animasyon KURULMUYOR — bağ/yıldız mount anında NİHAİ durumda doğar', () => {
    useReducedMotionMock.mockReturnValue(true);
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );
    genislikSimuleEt(tree, 350);

    // withTiming/withDelay hiç çağrılmadı — animasyon objesi hiç kurulmadı.
    expect(withTimingMock).not.toHaveBeenCalled();
    expect(withDelayMock).not.toHaveBeenCalled();

    const bagYolu = tree.root.findAllByType(Path)[0];
    expect(bagYolu.props.animatedProps.strokeDashoffset).toBe(0); // nihai: tam çizili

    const idx = izgara.findIndex((g) => g.tarih === '2026-07-01'); // 5/5, digerAy=false -> nihai opacity 1
    const yildizGruplari = tree.root
      .findAllByType(G)
      .filter((d) => typeof d.props.transform === 'string' && d.props.transform.includes('scale('));
    expect(yildizGruplari[idx].props.animatedProps.opacity).toBe(1);
  });

  test('AÇILIŞ ANİMASYONU (2c — oynatıldı nöbetçisi): mevcut bağ/yıldız veri güncellemesinde YENİDEN BAŞLAMAZ; ilk oynatımdan SONRA beliren bağ NİHAİ durumda doğar', () => {
    const { izgara, zincirler } = ornekIzgaraKur();

    // İlk mount: bağ HENÜZ YOK (zincirler=[]) -> yalnız yıldızlar oynar.
    const tree = render(
      <GokPaneli izgara={izgara} zincirler={[]} ayAdi="Temmuz 2026" bugun="2026-07-10" tamGunEsigi={TAM_GUN_ESIGI} mevcutSeri={3} />
    );
    genislikSimuleEt(tree, 350);

    const yildizCagriSayisi = withTimingMock.mock.calls.length;
    expect(yildizCagriSayisi).toBeGreaterThan(0); // yıldızlar oynadı

    // Mevcut yıldız bileşen ÖRNEĞİ aynı kalırken (key=gun.tarih değişmedi)
    // ikinci bir render tetikle (küçük bir genişlik değişimi) — animasyon
    // YENİDEN BAŞLAMAMALI: `useEffect` `deps=[]` olduğu için ikinci render'da
    // TEKRAR çalışmaz, dolayısıyla withTiming/withDelay çağrı sayısı artmaz
    // (NOT: mock'un `useSharedValue`'su gerçek reanimated'ın aksine render'lar
    // arası KALICI değildir — bu yüzden burada "nihai opacity" DEĞERİ değil,
    // "efekt yeniden tetiklenmedi" ÇAĞRI SAYISI doğrulanıyor; asıl garanti
    // zaten React'in `useEffect(fn, [])` sözleşmesidir).
    genislikSimuleEt(tree, 351);
    expect(withTimingMock.mock.calls.length).toBe(yildizCagriSayisi);

    // Şimdi GERÇEK zincirler'i (bir bağ içeren) geçirerek güncelle — bu bağ
    // İLK KEZ mount olur, ama `oynatildiRef.current` artık `true` (ilk mount
    // effect'i çoktan çalıştı) -> animasyon OYNAMADAN nihai (offset=0) doğar.
    act(() => {
      tree.update(
        <GokPaneli
          izgara={izgara}
          zincirler={zincirler}
          ayAdi="Temmuz 2026"
          bugun="2026-07-10"
          tamGunEsigi={TAM_GUN_ESIGI}
          mevcutSeri={3}
        />
      );
    });

    const bagCagriSayisiOncesi = withTimingMock.mock.calls.length;
    const bagYolu = tree.root.findAllByType(Path)[0];
    expect(bagYolu.props.animatedProps.strokeDashoffset).toBe(0); // dogrudan nihai
    // Sonradan mount olan bağ için withTiming/withDelay HİÇ çağrılmadı (erken
    // dönüş — oynatilacakMi=false).
    expect(withTimingMock.mock.calls.length).toBe(bagCagriSayisiOncesi);
  });

  test('SÜREKLİ HAREKET (3a — parıltı): yalnız 5/5 (tam) günlerde kurulur, süreler yıldızdan yıldıza FARKLIDIR (faz farkı nöbetçisi)', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    // ornekIzgaraKur -> 2026-07-01 ve 2026-07-02 iki AYRI 5/5 gün içerir.
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );
    genislikSimuleEt(tree, 350);

    const tamGunSayisi = izgara.filter(
      (g) => g.durum.tip === 'kilindi' && g.durum.vakitler.filter(Boolean).length === 5
    ).length;
    expect(tamGunSayisi).toBe(2);

    // Parıltı yalnız 5/5 günlerde: overlay sayısı tam gün sayısıyla birebir.
    // `Animated.View` mock'ta GERÇEK RN `View`'dur (forwardRef) — bu yüzden
    // `testID` hem composite (forwardRef) hem HOST düğümde görünür; yalnız
    // HOST eşleşmeleri (`typeof type === 'string'`) sayılır, aksi halde
    // sayım ikiye katlanır.
    const pariltiKatmanlari = tree.root
      .findAllByProps({ testID: 'seri-parilti' })
      .filter((d) => typeof d.type === 'string');
    expect(pariltiKatmanlari).toHaveLength(tamGunSayisi);

    // withRepeat gerçekten kuruldu (sonsuz döngü).
    expect(withRepeatMock).toHaveBeenCalled();

    // Faz farkı nöbetçisi: parıltıya özgü süreler (>= PARILTI_SURE_TABAN_MS;
    // giriş süreleri en fazla GIRIS_TAM_MS=380, nabız NABIZ_SURE_MS=3200 —
    // ikisi de bu eşiğin altında, filtre yalnız parıltıyı yakalar) YILDIZDAN
    // YILDIZA FARKLI olmalı — hepsi aynıysa senkron yanıp söner (yapay durur).
    const pariltiSureleri = withTimingMock.mock.calls
      .map(([, cfg]: [unknown, { duration?: number }]) => cfg?.duration)
      .filter((d: number | undefined): d is number => typeof d === 'number' && d >= GOK_ZAMANLAMA.PARILTI_SURE_TABAN_MS);
    expect(pariltiSureleri).toHaveLength(tamGunSayisi);
    expect(new Set(pariltiSureleri).size).toBe(tamGunSayisi); // hepsi BİRBİRİNDEN farklı

    // Faz farkı gecikmede de var: parıltı gecikmesi her zaman cizelge.toplam'dan
    // BÜYÜKTÜR (açılış zinciri bitmeden başlamaz — GokPaneli'nin kendi
    // hesapladığıyla AYNI algoritma burada da çalıştırılır, bkz. acilisCizelgesi
    // import'u) — bu eşikle giriş gecikmelerinden ayrıştırılır.
    const cizelge = acilisCizelgesi(izgara, zincirler, {
      cizgiOnce: GOK_ZAMANLAMA.CIZGI_ONCE_MS,
      segNormal: GOK_ZAMANLAMA.SEG_NORMAL_MS,
      segVurgu: GOK_ZAMANLAMA.SEG_VURGU_MS,
      kopukBosluk: GOK_ZAMANLAMA.KOPUK_BOSLUK_MS,
    });
    const pariltiGecikmeleri = withDelayMock.mock.calls
      .map(([gecikme]: [number]) => gecikme)
      .filter((g: number) => g > cizelge.toplam);
    expect(pariltiGecikmeleri).toHaveLength(tamGunSayisi);
    expect(new Set(pariltiGecikmeleri).size).toBe(tamGunSayisi);
  });

  test('SÜREKLİ HAREKET (3a — parıltı dip nöbetçisi): gecikme dolmadan (mount anında) opaklık 0dır — Faz 1de bu katman hiç yoktu', () => {
    // İNCELEME BULGUSU (düzeltildi): paylaşılan değer ÖNCEDEN 0.25 ile
    // doğuyordu; `withDelay` yalnız ANİMASYONU geciktirir, GÖRÜNÜRLÜĞÜ değil
    // — açılış zinciri bitmeden 5/5 hücrelerinde sabit bir hâle lekesi
    // duruyordu. Şimdi dip HER ZAMAN 0.
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );
    genislikSimuleEt(tree, 350);

    const pariltiKatmanlari = tree.root
      .findAllByProps({ testID: 'seri-parilti' })
      .filter((d) => typeof d.type === 'string');
    expect(pariltiKatmanlari.length).toBeGreaterThan(0);
    for (const katman of pariltiKatmanlari) {
      const stilDizisi = katman.props.style as Array<{ opacity?: number }>;
      const animatedStil = stilDizisi[stilDizisi.length - 1];
      expect(animatedStil.opacity).toBe(0);
    }
  });

  test('SÜREKLİ HAREKET (3a — parıltı konumu): "ust" hesabına HEADER_YUKSEKLIK dahildir (silinse hiçbir test yakalamazdı — nöbetçi)', () => {
    // Aynı gün HEM "bugün" (BugununNabzi, Svg İÇİNDE header'sız koordinat)
    // HEM 5/5 (Parilti, Svg DIŞINDA header'lı koordinat) olsun diye tek-günlük
    // özel bir ızgara kuruldu — ikisinin merkezi AYNI hücreye karşılık gelir,
    // fark TAM OLARAK HEADER_YUKSEKLIK olmalı.
    const kayitlar: Record<string, boolean[]> = {
      '2026-07-05': [true, true, true, true, true],
    };
    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6,
      kayitlar,
      dondurulmusTarihler: new Set(),
      bugun: '2026-07-05',
    });
    const zincirler = zincirBaglari(izgara, TAM_GUN_ESIGI);
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-05"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={1}
      />
    );
    genislikSimuleEt(tree, 350);

    const nabiz = tree.root.findByType(BugununNabzi);
    const parilti = tree.root.findByType(Parilti);
    // HEADER_YUKSEKLIK = 46 (GokPaneli.tsx'teki dokümante, stabil sabit).
    // `+ HEADER_YUKSEKLIK` terimi silinse bu fark 0 çıkar ve test DÜŞER.
    const HEADER_YUKSEKLIK_BEKLENEN = 46;
    const ustFarki = parilti.props.ust + parilti.props.boyut / 2 - nabiz.props.merkezY;
    expect(ustFarki).toBeCloseTo(HEADER_YUKSEKLIK_BEKLENEN, 6);

    // Yatayda header ofseti YOK — sol, merkez.x'ten dolaysız türetilir.
    const solFarki = parilti.props.sol + parilti.props.boyut / 2 - nabiz.props.merkezX;
    expect(solFarki).toBeCloseTo(0, 6);
  });

  test('SÜREKLİ HAREKET (3b — nabız): yalnız bugünün hücresinde kurulur', () => {
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );
    genislikSimuleEt(tree, 350);

    // BugununNabzi tek bir AnimatedRect'tir — `animatedProps` prop'u taşıyan
    // TEK Rect bu olmalı (zemin gradyan dikdörtgenlerinde animatedProps yok).
    const animatedRectler = tree.root
      .findAllByType(Rect)
      .filter((d) => d.props.animatedProps !== undefined);
    expect(animatedRectler).toHaveLength(1);

    // withRepeat NABIZ_SURE_MS ile çağrıldı.
    const nabizSureleri = withTimingMock.mock.calls
      .map(([, cfg]: [unknown, { duration?: number }]) => cfg?.duration)
      .filter((d: number | undefined) => d === GOK_ZAMANLAMA.NABIZ_SURE_MS);
    expect(nabizSureleri.length).toBeGreaterThan(0);
  });

  test('SÜREKLİ HAREKET (3c — azaltılmış hareket): parıltı/nabız HİÇ kurulmaz — parıltı hiç RENDER edilmez, nabız Faz 1 statik değerleriyle doğar', () => {
    useReducedMotionMock.mockReturnValue(true);
    const { izgara, zincirler } = ornekIzgaraKur();
    const tree = render(
      <GokPaneli
        izgara={izgara}
        zincirler={zincirler}
        ayAdi="Temmuz 2026"
        bugun="2026-07-10"
        tamGunEsigi={TAM_GUN_ESIGI}
        mevcutSeri={3}
      />
    );
    genislikSimuleEt(tree, 350);

    expect(withRepeatMock).not.toHaveBeenCalled();
    expect(withTimingMock).not.toHaveBeenCalled();
    expect(withDelayMock).not.toHaveBeenCalled();

    // Parıltı — Faz 1'de bu katman hiç yoktu, azaltılmış hareket açıkken de
    // HİÇ render edilmemeli (global-constraints.md "Faz 1 nihai görünüm DEĞİŞMEZ").
    expect(tree.root.findAllByProps({ testID: 'seri-parilti' })).toHaveLength(0);

    // Nabız — Faz 1'deki STATİK "bugün" karesiyle BİREBİR aynı değerlerle doğar.
    const bugunKaresi = tree.root.findAllByType(Rect).find((d) => d.props.animatedProps !== undefined)!;
    expect(bugunKaresi.props.animatedProps.opacity).toBe(0.4);
  });
});
