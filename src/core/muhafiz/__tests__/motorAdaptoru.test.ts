import {
  kademeSeviyeNo,
  siklikDakikasi,
  sesliAnonsGerekliMi,
  seviyeTetiklenirMi,
  vakitUyariPlaniOlustur,
  muhafizKanaliSec,
  muhafizAcilKanalMi,
  matrisGecerliMi,
  muhafizMatrisiniCoz,
} from '../motorAdaptoru';
import type { MuhafizMatrisi, SeviyeAyari, SeviyeKademe, UyariModu, VakitMuhafizAyari } from '../matrisTipleri';
import { eskidenMatriseGoc } from '../muhafizGoc';
import { aktifSeviyeyiBul } from '../aktifSeviye';
import { PLAN_ADIM_UST_SINIRI } from '../planButcesi';

const sv = (
  kademe: SeviyeKademe,
  esikDk: number,
  siklikDk: number | 'birkez' = 'birkez',
  mod: UyariModu = 'bildirim',
  bildirimSesi = 'can'
): SeviyeAyari => ({
  kademe,
  mod,
  esikDk,
  siklik: siklikDk === 'birkez' ? 'birkez' : { herDk: siklikDk },
  bildirimSesi,
  anonsMetni: '',
});

const ESKI_AYAR = {
  esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
  sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
};

describe('kademeSeviyeNo', () => {
  test('kademe -> 1..4', () => {
    expect(kademeSeviyeNo('nazik')).toBe(1);
    expect(kademeSeviyeNo('uyari')).toBe(2);
    expect(kademeSeviyeNo('sert')).toBe(3);
    expect(kademeSeviyeNo('acil')).toBe(4);
  });
});

describe('siklikDakikasi / sesliAnonsGerekliMi', () => {
  test("'birkez' -> null, {herDk} -> dakika", () => {
    expect(siklikDakikasi('birkez')).toBeNull();
    expect(siklikDakikasi({ herDk: 7 })).toBe(7);
  });

  test('TTS yalnız sesli/ikisi modlarında gerekir', () => {
    expect(sesliAnonsGerekliMi('sessiz')).toBe(false);
    expect(sesliAnonsGerekliMi('bildirim')).toBe(false);
    expect(sesliAnonsGerekliMi('sesli')).toBe(true);
    expect(sesliAnonsGerekliMi('ikisi')).toBe(true);
  });
});

describe('seviyeTetiklenirMi', () => {
  test('sessiz mod asla tetiklenmez (eşik anında bile)', () => {
    expect(seviyeTetiklenirMi(sv('nazik', 30, 5, 'sessiz'), 30)).toBe(false);
  });

  test('pencere dışında (kalan > eşik) tetiklenmez', () => {
    expect(seviyeTetiklenirMi(sv('nazik', 30, 1), 31)).toBe(false);
  });

  test("'birkez' yalnız tam eşik dakikasında tetiklenir", () => {
    const seviye = sv('nazik', 30, 'birkez');
    expect(seviyeTetiklenirMi(seviye, 30)).toBe(true);
    expect(seviyeTetiklenirMi(seviye, 29)).toBe(false);
    expect(seviyeTetiklenirMi(seviye, 15)).toBe(false);
  });

  test('sıklık seviyenin KENDİ eşiğine göreceli ölçülür', () => {
    const seviye = sv('nazik', 45, 15);
    // (45-45)%15, (45-30)%15 -> tetiklenir
    expect(seviyeTetiklenirMi(seviye, 45)).toBe(true);
    expect(seviyeTetiklenirMi(seviye, 30)).toBe(true);
    // Aradaki dakikalar atlanır
    expect(seviyeTetiklenirMi(seviye, 40)).toBe(false);
    expect(seviyeTetiklenirMi(seviye, 31)).toBe(false);
  });

  test('sıklık 0/negatif -> savunma: hiç tetiklenmez (NaN/sonsuz döngü yok)', () => {
    expect(seviyeTetiklenirMi(sv('nazik', 30, 0), 30)).toBe(false);
    expect(seviyeTetiklenirMi(sv('nazik', 30, -5), 30)).toBe(false);
  });

  test('vakit çıkarken/çıktıktan sonra (kalan < 1) TETİKLENMEZ', () => {
    // Alt sınır burada tek kaynaktır: `vakitUyariPlaniOlustur` zaten `k > 0` tarar,
    // yani arka plan 0. dakikayı hiç planlamaz. Ön plan (NamazMuhafiziServisi) ham
    // `kalanDk` verdiği için 0 dakika sıklık kuralından geçiyor ve "2 dk kala"
    // kurulu adım bir de vakit çıkarken konuşuyordu (kullanıcı raporu).
    expect(seviyeTetiklenirMi(sv('acil', 5, 1), 0)).toBe(false);
    expect(seviyeTetiklenirMi(sv('acil', 5, 1), -2)).toBe(false);
    // Son "gerçek" dakika hâlâ tetikler
    expect(seviyeTetiklenirMi(sv('acil', 5, 1), 1)).toBe(true);
  });
});

describe('vakitUyariPlaniOlustur', () => {
  const standart: VakitMuhafizAyari = {
    seviyeler: [sv('nazik', 25, 15), sv('uyari', 20, 10), sv('sert', 15, 5), sv('acil', 10, 2)],
  };

  test('dakika seti eşik/sıklık aritmetiğinden bağımsız türetilenle eşleşir', () => {
    const plan = vakitUyariPlaniOlustur(standart, 30);
    expect(plan.map((u) => u.kalanDk)).toEqual([25, 20, 15, 10, 8, 6, 4, 2]);
    expect(plan.map((u) => u.seviye)).toEqual([1, 2, 3, 4, 4, 4, 4, 4]);
  });

  test('kalan süre en büyük eşikten küçükse tarama oradan başlar', () => {
    const plan = vakitUyariPlaniOlustur(standart, 12);
    // 12 dk kala: 25/20/15 eşik anları çoktan geçti; yalnız acil penceresi işler
    expect(plan.map((u) => u.kalanDk)).toEqual([10, 8, 6, 4, 2]);
  });

  test('sessiz seviye planlanmaz; penceresini bir üst seviye devralır', () => {
    const acilSessiz: VakitMuhafizAyari = {
      seviyeler: [sv('nazik', 25, 15), sv('uyari', 20, 10), sv('sert', 15, 5), sv('acil', 10, 2, 'sessiz')],
    };
    const plan = vakitUyariPlaniOlustur(acilSessiz, 30);

    expect(plan.some((u) => u.seviye === 4)).toBe(false);
    // sert (15/5) devralır: 15, 10, 5
    expect(plan.map((u) => u.kalanDk)).toEqual([25, 20, 15, 10, 5]);
    expect(plan.filter((u) => u.kalanDk <= 15).every((u) => u.seviye === 3)).toBe(true);
  });

  test('tüm seviyeler sessizse plan boştur', () => {
    const hepsiSessiz: VakitMuhafizAyari = {
      seviyeler: standart.seviyeler.map((s) => ({ ...s, mod: 'sessiz' as UyariModu })),
    };
    expect(vakitUyariPlaniOlustur(hepsiSessiz, 60)).toEqual([]);
  });

  test('sessiz seviyenin eşiği tarama üst sınırını genişletmez', () => {
    // nazik(60) SESSİZ; en geniş AKTİF pencere uyari(20) -> tarama 20den başlamalı
    const naziksessiz: VakitMuhafizAyari = {
      seviyeler: [sv('nazik', 60, 10, 'sessiz'), sv('uyari', 20, 10), sv('sert', 15, 5), sv('acil', 10, 5)],
    };
    const plan = vakitUyariPlaniOlustur(naziksessiz, 120);
    expect(Math.max(...plan.map((u) => u.kalanDk))).toBe(20);
  });

  test('mod/ses/anons hücreden plana taşınır (Faz 4 TTS kancası)', () => {
    const vakitAyari: VakitMuhafizAyari = {
      seviyeler: [
        { ...sv('nazik', 20, 30, 'ikisi', 'alarm'), anonsMetni: '{vakit} vakti, {süre} dk.' },
        sv('uyari', 12, 30, 'sessiz'),
        sv('sert', 8, 30, 'sessiz'),
        sv('acil', 4, 30, 'sessiz'),
      ],
    };
    const plan = vakitUyariPlaniOlustur(vakitAyari, 30);

    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({
      kalanDk: 20,
      seviye: 1,
      mod: 'ikisi',
      bildirimSesi: 'alarm',
      sesliAnons: true,
      anonsMetni: '{vakit} vakti, {süre} dk.',
    });
  });

  test('eşit eşikte daha sert kademe kazanır (eski motorun override davranışı)', () => {
    const esitEsik: VakitMuhafizAyari = {
      seviyeler: [sv('nazik', 25, 30), sv('uyari', 25, 30), sv('sert', 25, 30), sv('acil', 25, 30)],
    };
    const plan = vakitUyariPlaniOlustur(esitEsik, 30);

    expect(plan).toHaveLength(1);
    expect(plan[0].seviye).toBe(4);
  });
});

/**
 * Faz 0 — plan butcesi `seviyeTetiklenirMi` ICINDE uygulanir, plan ureticisinde
 * DEGIL. Ureticiye konsaydi arka plan seyrelir ama on plan (`kontrolEt`) ham
 * siklikla calisip her dakika banner gosterirdi; onizleme de gercek akistan
 * saparadi (AGENTS.md'de kayitli cift-anons dersi).
 */
describe('plan bütçesi (Faz 0) — tek kapı `seviyeTetiklenirMi`', () => {
  test('tek açık seviye: 720 dk açıklık + 1 dk sıklık → etkin sıklık 48 dk', () => {
    const seviye = sv('nazik', 720, 1);
    expect(seviyeTetiklenirMi(seviye, 720)).toBe(true);
    expect(seviyeTetiklenirMi(seviye, 672)).toBe(true);
    // Ham sıklıkta tetiklenirdi; bütçe seyreltti
    expect(seviyeTetiklenirMi(seviye, 719)).toBe(false);
    expect(seviyeTetiklenirMi(seviye, 700)).toBe(false);
  });

  test('VARSAYILAN matris plani SEYRELMEZ (bugünkü davranış birebir)', () => {
    // Bütçe segmentten türer: nazik 45→25 arası 20 dk, ceil(20/15)=2 < 15 → dokunulmaz.
    const varsayilan = eskidenMatriseGoc(ESKI_AYAR).ogle;
    expect(vakitUyariPlaniOlustur(varsayilan, 45).map((u) => u.kalanDk)).toEqual([
      45, 30, 25, 15, 10, 5, 3, 2, 1,
    ]);
  });

  test('normal ayar (45 dk eşik + 15 dk sıklık) ETKİLENMEZ', () => {
    const seviye = sv('nazik', 45, 15);
    expect(seviyeTetiklenirMi(seviye, 45)).toBe(true);
    expect(seviyeTetiklenirMi(seviye, 30)).toBe(true);
    expect(seviyeTetiklenirMi(seviye, 44)).toBe(false);
  });

  test("'birkez' bütçeden ETKİLENMEZ (yalnız eşik anı)", () => {
    const seviye = sv('nazik', 720, 'birkez');
    expect(seviyeTetiklenirMi(seviye, 720)).toBe(true);
    expect(seviyeTetiklenirMi(seviye, 719)).toBe(false);
  });

  test('KAPALI komşunun segmentini üstteki devralır (kardeşler verilince)', () => {
    const kardesler = [
      sv('nazik', 120, 1),
      sv('uyari', 60, 1, 'sessiz'),
      sv('sert', 30, 1),
      sv('acil', 10, 1, 'sessiz'),
    ];
    // nazik segmenti 120-30=90 → ceil(90/15)=6
    expect(seviyeTetiklenirMi(kardesler[0], 114, kardesler)).toBe(true);
    expect(seviyeTetiklenirMi(kardesler[0], 116, kardesler)).toBe(false);
  });

  test('SEVİYE başına tetik sayısı üst sınırı aşmaz (vakit toplamı 4 × sınır)', () => {
    const genis: VakitMuhafizAyari = {
      seviyeler: [sv('nazik', 720, 1), sv('uyari', 300, 1), sv('sert', 120, 1), sv('acil', 30, 1)],
    };
    const plan = vakitUyariPlaniOlustur(genis, 720);
    for (const seviyeNo of [1, 2, 3, 4]) {
      expect(plan.filter((u) => u.seviye === seviyeNo).length).toBeLessThanOrEqual(
        PLAN_ADIM_UST_SINIRI
      );
    }
    expect(plan.length).toBeLessThanOrEqual(PLAN_ADIM_UST_SINIRI * genis.seviyeler.length);
  });

  /**
   * NOBETCI: arka plan (plan ureticisi) ile on plan (`seviyeTetiklenirMi`)
   * AYNI dakikalarda konusur. Butce yanlis katmana konursa bu test kirmizi olur.
   */
  test('NÖBETÇİ: arka plan planı ile ön plan tetikleri AYNI dakikalardır', () => {
    const genis: VakitMuhafizAyari = {
      seviyeler: [sv('nazik', 720, 1), sv('uyari', 300, 3), sv('sert', 120, 2), sv('acil', 30, 1)],
    };
    const sinir = 720;

    const onPlanDakikalari: number[] = [];
    for (let k = sinir; k > 0; k--) {
      const kazanan = aktifSeviyeyiBul(genis, k);
      // Ön plan (NamazMuhafiziServisi.kontrolEt) da kardeşleri geçer — segment
      // hesabı iki motorda AYNI olmalı.
      if (kazanan && seviyeTetiklenirMi(kazanan, k, genis.seviyeler)) onPlanDakikalari.push(k);
    }

    expect(vakitUyariPlaniOlustur(genis, sinir).map((u) => u.kalanDk)).toEqual(onPlanDakikalari);
    // Gerçekten seyreltilmiş olmalı (aksi halde test boş bir eşitlik olurdu)
    expect(onPlanDakikalari.length).toBeLessThan(sinir);
  });

  /**
   * TABAN CIZGISI (plan YENI-4): Faz 1'in "cikis yonu plani birebir ayni"
   * nobetcisi FAZ 0 SONRASI bu ciktiyi taban alir.
   */
  test('TABAN ÇİZGİSİ: bütçeli çıkış yönü planı (Faz 1 regresyonu bunu referans alır)', () => {
    const genis: VakitMuhafizAyari = {
      seviyeler: [sv('nazik', 240, 1), sv('uyari', 120, 5), sv('sert', 60, 5), sv('acil', 20, 4)],
    };
    expect(vakitUyariPlaniOlustur(genis, 240).map((u) => u.kalanDk)).toEqual([
      // nazik (segment 120, etkin 8 dk)
      240, 232, 224, 216, 208, 200, 192, 184, 176, 168, 160, 152, 144, 136, 128,
      // uyarı (segment 60, sıklık 5 dk — seyrelmez)
      120, 115, 110, 105, 100, 95, 90, 85, 80, 75, 70, 65,
      // sert (segment 40, sıklık 5 dk — seyrelmez)
      60, 55, 50, 45, 40, 35, 30, 25,
      // acil (segment 20, sıklık 4 dk — seyrelmez)
      20, 16, 12, 8, 4,
    ]);
  });
});

/**
 * YENİ-1 (Faz 1) — yön-farkında kazanan seçimi TEK BAŞINA yetmez. Denklemin
 * öbür yarısı `motorAdaptoru`dadır ve DÖRT yerin hepsi yön almalı:
 *   1. pencere kapısı  (çıkış: olcuDk > esik → false · giriş: olcuDk < esik → false)
 *   2. sıklık çapası   (çıkış: (esik − olcu) % herDk · giriş: (olcu − esik) % herDk)
 *   3. `birkez`        (iki yönde de olcuDk === esikDk)
 *   4. tarama sınırı   (çıkış: enBuyukEsik'ten aşağı · giriş: pencere sonuna kadar)
 *
 * Biri atlanırsa kazanan seçilir ama TETİKLENMEZ: `herDk` tekrarı ölü doğar,
 * her adım yalnız tam eşik dakikasında bir kez konuşur ve tarama `enBuyukEsik`te
 * durduğu için "çıkana kadar devam et" hiç gerçekleşmez.
 */
describe('giriş yönü (YENİ-1) — seviyeTetiklenirMi', () => {
  const nazik = sv('nazik', 5, 10);
  const acil = sv('acil', 180, 30);
  const giris = { yon: 'girisindenItibaren' as const, pencereUzunluguDk: 240 };

  test('PENCERE KAPISI ters döner: eşiğin ALTINDA tetiklenmez, ÜSTÜNDE tetiklenir', () => {
    expect(seviyeTetiklenirMi(nazik, 4, undefined, giris)).toBe(false);
    expect(seviyeTetiklenirMi(nazik, 5, undefined, giris)).toBe(true);
  });

  test("herDk TEKRARI GERÇEKTEN ÇALIŞIR (yalnız tam eşik dakikası değil)", () => {
    // Sıklık çapası yönsüz kalsaydı `(5 − 15) % 10` ile yalnız 5. dakika tutardı.
    expect(seviyeTetiklenirMi(nazik, 15, undefined, giris)).toBe(true);
    expect(seviyeTetiklenirMi(nazik, 25, undefined, giris)).toBe(true);
    expect(seviyeTetiklenirMi(nazik, 26, undefined, giris)).toBe(false);
  });

  test('ACİL adımın sıklığı pencere SONUNA KADAR sürer (eşikte durmaz)', () => {
    expect(seviyeTetiklenirMi(acil, 180, undefined, giris)).toBe(true);
    expect(seviyeTetiklenirMi(acil, 210, undefined, giris)).toBe(true);
  });

  test('ALT SINIR korunur: girişin 0. dakikasında uyarı YOK', () => {
    expect(seviyeTetiklenirMi(sv('nazik', 0, 10), 0, undefined, giris)).toBe(false);
  });

  test('ÜST SINIR: vakit çıkarken/çıktıktan sonra uyarı YOK (kalanDk >= 1 aynası)', () => {
    expect(seviyeTetiklenirMi(acil, 240, undefined, giris)).toBe(false);
    expect(seviyeTetiklenirMi(acil, 270, undefined, giris)).toBe(false);
  });

  test('pencere uzunluğu VERİLMEZSE giriş yönü hiç tetiklenmez (iki motor ayrışmasın)', () => {
    expect(seviyeTetiklenirMi(nazik, 15, undefined, { yon: 'girisindenItibaren' })).toBe(false);
  });

  test("'birkez' iki yönde de YALNIZ tam eşik dakikasıdır", () => {
    const birkez = sv('uyari', 60, 'birkez');
    expect(seviyeTetiklenirMi(birkez, 60, undefined, giris)).toBe(true);
    expect(seviyeTetiklenirMi(birkez, 61, undefined, giris)).toBe(false);
    expect(seviyeTetiklenirMi(birkez, 59, undefined, giris)).toBe(false);
  });

  test('sessiz adım giriş yönünde de tetiklenmez', () => {
    expect(seviyeTetiklenirMi(sv('nazik', 5, 10, 'sessiz'), 15, undefined, giris)).toBe(false);
  });
});

describe('giriş yönü (YENİ-1) — vakitUyariPlaniOlustur', () => {
  const girisAyari: VakitMuhafizAyari = {
    yon: 'girisindenItibaren',
    seviyeler: [sv('nazik', 5, 10), sv('uyari', 60, 15), sv('sert', 120, 20), sv('acil', 180, 30)],
  };

  test('plan ARTAN ölçüyle üretilir ve pencere sonuna kadar sürer', () => {
    const plan = vakitUyariPlaniOlustur(girisAyari, 1, { pencereUzunluguDk: 240 });
    expect(plan.map((u) => u.olcuDk)).toEqual([
      // nazik (5 dk'da başlar, her 10 dk — bir sonraki eşik 60'a kadar)
      5, 15, 25, 35, 45, 55,
      // uyarı (60'ta devralır, her 15 dk)
      60, 75, 90, 105,
      // sert (120, her 20 dk)
      120, 140, 160,
      // acil (180, her 30 dk) — TARAMA `enBuyukEsik`te DURMAZ
      180, 210,
    ]);
    expect(plan.map((u) => u.seviye)).toEqual([1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4]);
  });

  test('kalanDk pencereden TÜRETİLİR (tüketiciler çıkıştan zamanlamayı sürdürebilir)', () => {
    const plan = vakitUyariPlaniOlustur(girisAyari, 1, { pencereUzunluguDk: 240 });
    expect(plan.every((u) => u.kalanDk === 240 - u.olcuDk)).toBe(true);
    expect(plan.every((u) => u.kalanDk >= 1)).toBe(true);
  });

  test('şu anki ölçü GEÇMİŞ dakikaları eler (çıkış yönündeki sınırın aynası)', () => {
    const plan = vakitUyariPlaniOlustur(girisAyari, 100, { pencereUzunluguDk: 240 });
    expect(plan.map((u) => u.olcuDk)).toEqual([105, 120, 140, 160, 180, 210]);
  });

  test('pencere uzunluğu YOKSA giriş planı BOŞtur (ön planla ayrışmaz)', () => {
    expect(vakitUyariPlaniOlustur(girisAyari, 1)).toEqual([]);
  });

  test('NÖBETÇİ: giriş yönünde de arka plan planı ile ön plan tetikleri AYNI dakikalardır', () => {
    const pencereUzunluguDk = 240;
    const onPlan: number[] = [];
    for (let m = 1; m <= pencereUzunluguDk; m++) {
      const kazanan = aktifSeviyeyiBul(girisAyari, m);
      if (
        kazanan &&
        seviyeTetiklenirMi(kazanan, m, girisAyari.seviyeler, {
          yon: 'girisindenItibaren',
          pencereUzunluguDk,
        })
      ) {
        onPlan.push(m);
      }
    }
    expect(vakitUyariPlaniOlustur(girisAyari, 1, { pencereUzunluguDk }).map((u) => u.olcuDk)).toEqual(
      onPlan
    );
  });
});

describe('REGRESYON (Faz 1): çıkış yönü planı Faz 0 SONRASI çıktıyla BİREBİR aynı', () => {
  const genis = (yon?: VakitMuhafizAyari['yon']): VakitMuhafizAyari => ({
    yon,
    seviyeler: [sv('nazik', 240, 1), sv('uyari', 120, 5), sv('sert', 60, 5), sv('acil', 20, 4)],
  });

  /** `esikSinirlari.test.ts`teki TABAN ÇİZGİSİ ile aynı fikstür ve aynı çıktı. */
  const TABAN = [
    240, 232, 224, 216, 208, 200, 192, 184, 176, 168, 160, 152, 144, 136, 128, 120, 115, 110, 105,
    100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 16, 12, 8, 4,
  ];

  test('yön alanı YOKSA taban çizgisi korunur', () => {
    expect(vakitUyariPlaniOlustur(genis(), 240).map((u) => u.kalanDk)).toEqual(TABAN);
  });

  test("yön AÇIKÇA 'cikisaDogru' iken de taban çizgisi korunur", () => {
    expect(vakitUyariPlaniOlustur(genis('cikisaDogru'), 240).map((u) => u.kalanDk)).toEqual(TABAN);
  });

  test('çıkış yönünde olcuDk ile kalanDk AYNIdır (eski tüketiciler bozulmaz)', () => {
    const plan = vakitUyariPlaniOlustur(genis(), 240);
    expect(plan.every((u) => u.olcuDk === u.kalanDk)).toBe(true);
  });

  test('pencere uzunluğu verilmesi çıkış planını DEĞİŞTİRMEZ', () => {
    expect(
      vakitUyariPlaniOlustur(genis(), 240, { pencereUzunluguDk: 600 }).map((u) => u.kalanDk)
    ).toEqual(TABAN);
  });
});

describe('muhafizKanaliSec — ses ile ACİLİYET ayrıdır', () => {
  const OZEL_SES = 'content://media/internal/audio/media/42';
  const VARSAYILAN = 'varsayilan';

  test('seviye >= 3 acil kanala düşer (tarihsel taban kural korunur)', () => {
    expect(muhafizKanaliSec(3, VARSAYILAN)).toBe('muhafiz_acil');
    expect(muhafizKanaliSec(4, VARSAYILAN)).toBe('muhafiz_acil');
  });

  test('seviye < 3 normal muhafız kanalı', () => {
    expect(muhafizKanaliSec(1, VARSAYILAN)).toBe('muhafiz');
    expect(muhafizKanaliSec(2, VARSAYILAN)).toBe('muhafiz');
  });

  test('acilKanal=true seviyeden bağımsız olarak acil kanala düşürür', () => {
    expect(muhafizKanaliSec(1, VARSAYILAN, true)).toBe('muhafiz_acil');
  });

  test("ESKİ kayıt toleransı: 'alarm' ses id'si hâlâ aciliyet sinyali sayılır", () => {
    // Eski şemada aciliyet ses id'siyle taşınıyordu; diskteki göç etmemiş
    // matrisler de aynı davranmalı.
    expect(muhafizKanaliSec(1, 'alarm')).toBe('muhafiz_acil');
  });

  test('ESKİ palet id değerleri TABAN kanala düşer (göç gerekmez, ses zaten aynıydı)', () => {
    expect(muhafizKanaliSec(1, 'can')).toBe('muhafiz');
    expect(muhafizKanaliSec(2, 'melodi')).toBe('muhafiz');
    expect(muhafizKanaliSec(1, 'bilinmeyen')).toBe('muhafiz');
  });

  test('ÖZEL ses kendi kanalını üretir — ses artık gerçekten değişir', () => {
    const kanal = muhafizKanaliSec(1, OZEL_SES);
    expect(kanal).toMatch(/^muhafiz_[0-9a-f]{8}$/);
    expect(kanal).not.toBe('muhafiz');
  });

  test('KANAL ENFLASYONU YOK: kanal sayısı BENZERSİZ SES sayısı kadardır', () => {
    // 4 seviye x 2 ses = 8 hücre ama yalnız (ses x aciliyet) kadar kanal çıkar.
    const kanallar = new Set<string>();
    for (const ses of [VARSAYILAN, OZEL_SES]) {
      for (const seviye of [1, 2, 3, 4] as const) kanallar.add(muhafizKanaliSec(seviye, ses));
    }
    expect(kanallar.size).toBe(4);
  });

  test('aciliyet SESİ değiştirmez: aynı ses, iki önem = aynı hash farklı taban', () => {
    const normal = muhafizKanaliSec(1, OZEL_SES, false);
    const acil = muhafizKanaliSec(1, OZEL_SES, true);
    expect(acil).toBe(normal.replace('muhafiz_', 'muhafiz_acil_'));
  });
});

describe('muhafizAcilKanalMi (ÜÇ DURUMLU acilKanal)', () => {
  test('acilKanal=true → seviyeden BAĞIMSIZ olarak acil', () => {
    expect(muhafizAcilKanalMi(1, 'varsayilan', true)).toBe(true);
    expect(muhafizAcilKanalMi(4, 'varsayilan', true)).toBe(true);
  });

  test('acilKanal=false → seviyeden BAĞIMSIZ olarak acil DEĞİL', () => {
    // NÖBETÇİ: eskiden bu alan yalnız YÜKSELTEBİLİYORDU (OR). Sonuç: "Hafif"
    // yoğunluğu seçen kullanıcının sert/acil adımları (acilKanal:false) yine
    // `muhafiz_acil` kanalına düşüyor, IMPORTANCE_MAX + setBypassDnd ile
    // Rahatsız Etmeyin modunu deliyordu. Preset'in yazdığı false ARTIK ETKİLİ.
    expect(muhafizAcilKanalMi(4, 'varsayilan', false)).toBe(false);
    expect(muhafizAcilKanalMi(3, 'varsayilan', false)).toBe(false);
    expect(muhafizKanaliSec(4, 'varsayilan', false)).toBe('muhafiz');
  });

  test('acilKanal=undefined → ESKİ kayıt: tarihsel taban kural (seviye>=3)', () => {
    expect(muhafizAcilKanalMi(1, 'varsayilan')).toBe(false);
    expect(muhafizAcilKanalMi(2, 'varsayilan')).toBe(false);
    expect(muhafizAcilKanalMi(3, 'varsayilan', undefined)).toBe(true);
    expect(muhafizAcilKanalMi(4, 'varsayilan')).toBe(true);
  });

  test("acilKanal=undefined iken eski 'alarm' ses id'si aciliyet sayılır", () => {
    expect(muhafizAcilKanalMi(1, 'alarm')).toBe(true);
  });

  test("AÇIK false, eski 'alarm' çıkarımını EZER", () => {
    expect(muhafizAcilKanalMi(1, 'alarm', false)).toBe(false);
  });
});

describe('matrisGecerliMi / muhafizMatrisiniCoz', () => {
  const gecerli = eskidenMatriseGoc(ESKI_AYAR);

  test('tam matris geçerlidir ve olduğu gibi kullanılır', () => {
    expect(matrisGecerliMi(gecerli)).toBe(true);
    expect(muhafizMatrisiniCoz({ ...ESKI_AYAR, matris: gecerli })).toBe(gecerli);
  });

  test("eski 'alarm' ses id'si BURADA da göç eder (ham AsyncStorage okuyan tüketiciler için)", () => {
    // `ArkaplanGorevServisi` ve `KonumTakipServisi` store'u değil ham diski okur;
    // slice yükleme göçünden geçmezler. Aciliyet burada da korunmalı.
    const alarmli = eskidenMatriseGoc(ESKI_AYAR);
    alarmli.yatsi.seviyeler[0].bildirimSesi = 'alarm';

    const cozulmus = muhafizMatrisiniCoz({ ...ESKI_AYAR, matris: alarmli });

    expect(cozulmus.yatsi.seviyeler[0].bildirimSesi).toBe('varsayilan');
    expect(cozulmus.yatsi.seviyeler[0].acilKanal).toBe(true);
  });

  test('matris yoksa eski global eşik/sıklıklardan türetilir', () => {
    expect(matrisGecerliMi(undefined)).toBe(false);
    const cozulen = muhafizMatrisiniCoz(ESKI_AYAR);
    expect(cozulen.ogle.seviyeler[0].esikDk).toBe(45);
    expect(cozulen.ogle.seviyeler[3].esikDk).toBe(3);
  });

  test('eksik vakit satırı olan matris REDDEDİLİR (eski alanlara düşülür)', () => {
    const bozuk = JSON.parse(JSON.stringify(gecerli)) as MuhafizMatrisi;
    delete (bozuk as Partial<MuhafizMatrisi>).yatsi;

    expect(matrisGecerliMi(bozuk)).toBe(false);
    // Düşülen matris kullanılabilir olmalı (muhafız tümden susmamalı)
    expect(muhafizMatrisiniCoz({ ...ESKI_AYAR, matris: bozuk }).yatsi.seviyeler).toHaveLength(4);
  });

  test('eksik seviye / geçersiz eşik içeren matris REDDEDİLİR', () => {
    const eksikSeviye = JSON.parse(JSON.stringify(gecerli)) as MuhafizMatrisi;
    eksikSeviye.ogle.seviyeler = eksikSeviye.ogle.seviyeler.slice(0, 2);
    expect(matrisGecerliMi(eksikSeviye)).toBe(false);

    const bozukEsik = JSON.parse(JSON.stringify(gecerli)) as MuhafizMatrisi;
    (bozukEsik.ikindi.seviyeler[0] as { esikDk: unknown }).esikDk = null;
    expect(matrisGecerliMi(bozukEsik)).toBe(false);
  });
});
