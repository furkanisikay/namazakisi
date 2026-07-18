import {
  tumVakitlereUygula,
  presetUygula,
  presetMatrisiOlustur,
  presetSesliIceriyorMu,
  zamanlamaDegistiMi,
  type PresetSeviyeleri,
} from '../matrisIslemleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../matrisTipleri';
import type { MuhafizMatrisi, SeviyeAyari, UyariModu, VakitMuhafizAyari } from '../matrisTipleri';
import { ANONS_SABLONLARI } from '../anonsMetni';

const OZEL_SES = 'content://media/internal/audio/media/42';

const sv = (esikDk: number, mod: UyariModu = 'bildirim', ses = VARSAYILAN_SES): SeviyeAyari =>
  ({ kademe: 'nazik', mod, esikDk, siklik: 'birkez', bildirimSesi: ses, anonsMetni: '' });
const vakit = (esik: number): VakitMuhafizAyari => ({ seviyeler: [sv(esik), sv(esik - 5), sv(esik - 10), sv(esik - 15)] });
const matris = (): MuhafizMatrisi =>
  Object.fromEntries(MUHAFIZ_VAKITLERI.map((v) => [v, vakit(30)])) as MuhafizMatrisi;

/** "normal" preset'e denk örnek: son adım sesli ('ikisi'). */
const SESLI_PRESET: PresetSeviyeleri = {
  nazik: { esikDk: 45, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
  uyari: { esikDk: 25, siklik: { herDk: 10 }, mod: 'bildirim', acilKanal: false },
  sert: { esikDk: 10, siklik: { herDk: 5 }, mod: 'bildirim', acilKanal: false },
  acil: { esikDk: 3, siklik: 'birkez', mod: 'ikisi', acilKanal: true },
};

/** "hafif" preset'e denk örnek: hiçbir adımda ses yok. */
const SESSIZ_PRESET: PresetSeviyeleri = {
  nazik: { esikDk: 30, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
  uyari: { esikDk: 10, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
  sert: { esikDk: 5, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
  acil: { esikDk: 2, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
};

describe('tumVakitlereUygula', () => {
  test('kaynak vaktin ayarını tüm vakitlere kopyalar', () => {
    const m = matris();
    m.ikindi = vakit(60);
    const sonuc = tumVakitlereUygula(m, 'ikindi');
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(sonuc[v].seviyeler[0].esikDk).toBe(60);
    }
  });
  test('derin kopya: sonucu değiştirmek kaynağı bozmaz', () => {
    const m = matris();
    const sonuc = tumVakitlereUygula(m, 'ikindi');
    sonuc.ogle.seviyeler[0].esikDk = 999;
    expect(sonuc.ikindi.seviyeler[0].esikDk).not.toBe(999);
  });
});

describe('presetSesliIceriyorMu', () => {
  test('sesli adım varsa true', () => {
    expect(presetSesliIceriyorMu(SESLI_PRESET)).toBe(true);
  });
  test('tüm adımlar bildirimse false (hafif kasten sessizdir)', () => {
    expect(presetSesliIceriyorMu(SESSIZ_PRESET)).toBe(false);
  });
});

describe('presetUygula', () => {
  test('eşik ve sıklığı tüm vakitlere yazar', () => {
    const sonuc = presetUygula(matris(), SESLI_PRESET, true);
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(sonuc[v].seviyeler.map((s) => s.esikDk)).toEqual([45, 25, 10, 3]);
      expect(sonuc[v].seviyeler[0].siklik).toBe('birkez');
      expect(sonuc[v].seviyeler[1].siklik).toEqual({ herDk: 10 });
    }
  });

  test('SÖZLEŞME: mod ve ACİLİYET yazılır', () => {
    const m = matris();
    m.ogle.seviyeler[3].mod = 'sessiz';
    const sonuc = presetUygula(m, SESLI_PRESET, true);
    expect(sonuc.ogle.seviyeler[3].mod).toBe('ikisi');
    expect(sonuc.ogle.seviyeler[3].acilKanal).toBe(true);
  });

  /**
   * MİMARİ SÖZÜ: preset ACİLİYETİ yazar, SESİ kullanıcı seçer.
   * Eskiden aciliyet `bildirimSesi: 'alarm'` ile taşınıyordu → preset'e her
   * dokunuş kullanıcının seçtiği müziği SİLERDİ. Ayrım bunu imkânsız kılar.
   */
  test('kullanıcının SEÇTİĞİ SES preset uygulamasında KORUNUR', () => {
    const m = matris();
    m.ogle.seviyeler[3].bildirimSesi = OZEL_SES;
    m.ogle.seviyeler[3].sesAdi = 'Hızır';

    const sonuc = presetUygula(m, SESLI_PRESET, true);

    expect(sonuc.ogle.seviyeler[3].bildirimSesi).toBe(OZEL_SES);
    expect(sonuc.ogle.seviyeler[3].sesAdi).toBe('Hızır');
  });

  test('ACİLİYET YAPIŞMAZ: yoğun→hafif geçişinde acil bayrağı geri düşer', () => {
    const yogunSonrasi = presetUygula(matris(), SESLI_PRESET, true);
    expect(yogunSonrasi.ogle.seviyeler[3].acilKanal).toBe(true);

    const hafifSonrasi = presetUygula(yogunSonrasi, SESSIZ_PRESET, true);
    expect(hafifSonrasi.ogle.seviyeler[3].acilKanal).toBe(false);
  });

  test('sesliIzinVar false ise sesli hücreler bildirime düşer, preset yine uygulanır', () => {
    const sonuc = presetUygula(matris(), SESLI_PRESET, false);
    expect(sonuc.ogle.seviyeler[3].mod).toBe('bildirim');
    // Zamanlama yine de yazıldı — kullanıcı adım kaybetmez
    expect(sonuc.ogle.seviyeler[3].esikDk).toBe(3);
    // Sesli olmayan adımlar etkilenmez
    expect(sonuc.ogle.seviyeler[0].mod).toBe('bildirim');
  });

  test('sesliIzinVar false iken anons metni de doldurulmaz', () => {
    const sonuc = presetUygula(matris(), SESLI_PRESET, false);
    expect(sonuc.ogle.seviyeler[3].anonsMetni).toBe('');
  });

  test('sesli hücrede boş anons kutusu şablonla doldurulur (sessiz kalmasın)', () => {
    const sonuc = presetUygula(matris(), SESLI_PRESET, true);
    expect(sonuc.ogle.seviyeler[3].anonsMetni).toBe(ANONS_SABLONLARI[0]);
  });

  test('kullanıcının kendi anons metni ASLA ezilmez', () => {
    const m = matris();
    m.ogle.seviyeler[3].anonsMetni = 'Kalk, {vakit} namazına {süre} dakika.';
    const sonuc = presetUygula(m, SESLI_PRESET, true);
    expect(sonuc.ogle.seviyeler[3].anonsMetni).toBe('Kalk, {vakit} namazına {süre} dakika.');
  });

  test('kademe alanı korunur (yalnız zamanlama/mod/ses yazılır)', () => {
    const m = matris();
    m.ogle.seviyeler[2].kademe = 'sert';
    const sonuc = presetUygula(m, SESLI_PRESET, true);
    expect(sonuc.ogle.seviyeler[2].kademe).toBe('sert');
  });

  test('derin kopya: sonucu değiştirmek kaynağı bozmaz', () => {
    const m = matris();
    const sonuc = presetUygula(m, SESLI_PRESET, true);
    sonuc.ogle.seviyeler[0].esikDk = 999;
    expect(m.ogle.seviyeler[0].esikDk).toBe(30);
  });
});

describe('presetMatrisiOlustur (sıfırdan matris — sihirbaz / initialState)', () => {
  test('5 vakit x 4 seviye üretir, kademeler doğru sırada', () => {
    const m = presetMatrisiOlustur(SESLI_PRESET, true);
    expect(Object.keys(m).sort()).toEqual([...MUHAFIZ_VAKITLERI].sort());
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(m[v].seviyeler.map((s) => s.kademe)).toEqual(SEVIYE_KADEMELERI);
    }
  });

  test('preset MODUNU taşır — sihirbaz yolunda sesli anons ölmez', () => {
    // Regresyon: eski yol preset'i eskidenMatriseGoc ile türetiyordu, o da
    // mod'u DAİMA 'bildirim' sabitliyordu → sihirbazdan geçen kullanıcıda
    // sesli preset'ler hiç çalışmıyordu.
    const m = presetMatrisiOlustur(SESLI_PRESET, true);
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(m[v].seviyeler[3].mod).toBe('ikisi');
      expect(m[v].seviyeler[3].anonsMetni).toBe(ANONS_SABLONLARI[0]);
      expect(m[v].seviyeler[3].acilKanal).toBe(true);
    }
  });

  test('sesliIzinVar false ise hiçbir hücre sesli açılmaz', () => {
    const m = presetMatrisiOlustur(SESLI_PRESET, false);
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(m[v].seviyeler.every((s) => s.mod === 'bildirim')).toBe(true);
      expect(m[v].seviyeler.every((s) => s.anonsMetni === '')).toBe(true);
    }
  });

  test('eşik/sıklık preset ile birebir', () => {
    const m = presetMatrisiOlustur(SESLI_PRESET, true);
    expect(m.imsak.seviyeler.map((s) => s.esikDk)).toEqual([45, 25, 10, 3]);
    expect(m.imsak.seviyeler.map((s) => s.siklik)).toEqual([
      'birkez',
      { herDk: 10 },
      { herDk: 5 },
      'birkez',
    ]);
  });

  test('vakitler birbirinden bağımsız kopyadır', () => {
    const m = presetMatrisiOlustur(SESLI_PRESET, true);
    m.ogle.seviyeler[0].esikDk = 999;
    expect(m.ikindi.seviyeler[0].esikDk).toBe(45);
  });
});

describe('zamanlamaDegistiMi (spec 4.1 elle-değişiklik → ozel)', () => {
  test('eşik değişince true', () => {
    const a = matris(); const b = matris(); b.ogle.seviyeler[0].esikDk = 99;
    expect(zamanlamaDegistiMi(a, b)).toBe(true);
  });
  test('sıklık değişince true', () => {
    const a = matris(); const b = matris(); b.ikindi.seviyeler[1].siklik = { herDk: 7 };
    expect(zamanlamaDegistiMi(a, b)).toBe(true);
  });
  test('yalnız mod/ses değişince false (zamanlama ekseni değil)', () => {
    const a = matris(); const b = matris();
    b.aksam.seviyeler[0].mod = 'sesli'; b.aksam.seviyeler[0].bildirimSesi = OZEL_SES;
    expect(zamanlamaDegistiMi(a, b)).toBe(false);
  });
  test('aynı matris false', () => {
    expect(zamanlamaDegistiMi(matris(), matris())).toBe(false);
  });
});
