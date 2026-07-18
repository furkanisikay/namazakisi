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

  test('vakit dolduğunda (kalan <= 0) pencere hâlâ kapsar', () => {
    expect(seviyeTetiklenirMi(sv('acil', 5, 1), 0)).toBe(true);
    expect(seviyeTetiklenirMi(sv('acil', 5, 1), -2)).toBe(true);
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

describe('muhafizAcilKanalMi', () => {
  test('OR semantiği: acilKanal | eski-alarm | seviye>=3', () => {
    expect(muhafizAcilKanalMi(1, 'varsayilan')).toBe(false);
    expect(muhafizAcilKanalMi(1, 'varsayilan', true)).toBe(true);
    expect(muhafizAcilKanalMi(1, 'alarm')).toBe(true);
    expect(muhafizAcilKanalMi(3, 'varsayilan')).toBe(true);
  });

  test('acilKanal=false seviye tabanını DÜŞÜRMEZ (sert/acil hep acil kalır)', () => {
    expect(muhafizAcilKanalMi(4, 'varsayilan', false)).toBe(true);
  });
});

describe('matrisGecerliMi / muhafizMatrisiniCoz', () => {
  const gecerli = eskidenMatriseGoc(ESKI_AYAR);

  test('tam matris geçerlidir ve olduğu gibi kullanılır', () => {
    expect(matrisGecerliMi(gecerli)).toBe(true);
    expect(muhafizMatrisiniCoz({ ...ESKI_AYAR, matris: gecerli })).toBe(gecerli);
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
