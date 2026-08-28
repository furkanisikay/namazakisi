import {
  tumVakitlereUygula,
  presetUygula,
  presetMatrisiOlustur,
  presetSesliIceriyorMu,
  presetZamanlamasiniUygula,
  zamanlamaDegistiMi,
  yonDegisimindeMetniCevir,
  type PresetSeviyeleri,
} from '../matrisIslemleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../matrisTipleri';
import type {
  MuhafizMatrisi,
  SeviyeAyari,
  UyariKanallari,
  VakitMuhafizAyari,
} from '../matrisTipleri';

/** Kanal kümesi kısayolları (Faz 2: `mod` enum'unun yerini aldı). */
const KAPALI = {};
const BILDIRIM = { bildirim: true };
const SESLI = { sesli: true };
const IKISI = { bildirim: true, sesli: true };
import { ANONS_SABLONLARI, ANONS_SABLONLARI_GIRIS } from '../anonsMetni';
import { adimKapaliMi } from '../kanalKumesi';

const OZEL_SES = 'content://media/internal/audio/media/42';

const sv = (
  esikDk: number,
  kanallar: UyariKanallari = BILDIRIM,
  ses = VARSAYILAN_SES
): SeviyeAyari =>
  ({ kademe: 'nazik', kanallar, esikDk, siklik: 'birkez', bildirimSesi: ses, anonsMetni: '' });
const vakit = (esik: number): VakitMuhafizAyari => ({ seviyeler: [sv(esik), sv(esik - 5), sv(esik - 10), sv(esik - 15)] });
const matris = (): MuhafizMatrisi =>
  Object.fromEntries(MUHAFIZ_VAKITLERI.map((v) => [v, vakit(30)])) as MuhafizMatrisi;

/** "normal" preset'e denk örnek: son adımda bildirim + sesli kanal açık. */
const SESLI_PRESET: PresetSeviyeleri = {
  nazik: { esikDk: 45, siklik: 'birkez', kanallar: BILDIRIM, acilKanal: false },
  uyari: { esikDk: 25, siklik: { herDk: 10 }, kanallar: BILDIRIM, acilKanal: false },
  sert: { esikDk: 10, siklik: { herDk: 5 }, kanallar: BILDIRIM, acilKanal: false },
  acil: { esikDk: 3, siklik: 'birkez', kanallar: IKISI, acilKanal: true },
};

/** "hafif" preset'e denk örnek: hiçbir adımda ses yok. */
const SESSIZ_PRESET: PresetSeviyeleri = {
  nazik: { esikDk: 30, siklik: 'birkez', kanallar: BILDIRIM, acilKanal: false },
  uyari: { esikDk: 10, siklik: 'birkez', kanallar: BILDIRIM, acilKanal: false },
  sert: { esikDk: 5, siklik: 'birkez', kanallar: BILDIRIM, acilKanal: false },
  acil: { esikDk: 2, siklik: 'birkez', kanallar: BILDIRIM, acilKanal: false },
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

  test('SÖZLEŞME: KANALLAR ve ACİLİYET yazılır', () => {
    const m = matris();
    m.ogle.seviyeler[3].kanallar = KAPALI;
    const sonuc = presetUygula(m, SESLI_PRESET, true);
    expect(sonuc.ogle.seviyeler[3].kanallar).toEqual(IKISI);
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

  test('sesliIzinVar false ise SESLİ kanal kapanır ama adım susturulmaz', () => {
    const sonuc = presetUygula(matris(), SESLI_PRESET, false);
    // Sesli kanal kapandı, BİLDİRİM kanalı açık kaldı — adım kaybolmadı
    expect(sonuc.ogle.seviyeler[3].kanallar).toMatchObject({ bildirim: true, sesli: false });
    // Zamanlama yine de yazıldı — kullanıcı adım kaybetmez
    expect(sonuc.ogle.seviyeler[3].esikDk).toBe(3);
    // Sesli olmayan adımlar etkilenmez
    expect(sonuc.ogle.seviyeler[0].kanallar).toEqual(BILDIRIM);
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

  test('preset KANALLARINI taşır — sihirbaz yolunda sesli anons ölmez', () => {
    // Regresyon: eski yol preset'i eskidenMatriseGoc ile türetiyordu, o da
    // YALNIZ bildirim kanalını açıyordu → sihirbazdan geçen kullanıcıda
    // sesli preset'ler hiç çalışmıyordu.
    const m = presetMatrisiOlustur(SESLI_PRESET, true);
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(m[v].seviyeler[3].kanallar).toEqual(IKISI);
      expect(m[v].seviyeler[3].anonsMetni).toBe(ANONS_SABLONLARI[0]);
      expect(m[v].seviyeler[3].acilKanal).toBe(true);
    }
  });

  test('sesliIzinVar false ise hiçbir hücre sesli açılmaz', () => {
    const m = presetMatrisiOlustur(SESLI_PRESET, false);
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(m[v].seviyeler.every((s) => s.kanallar.bildirim === true)).toBe(true);
      expect(m[v].seviyeler.every((s) => s.kanallar.sesli !== true)).toBe(true);
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
  test('yalnız kanal/ses değişince false (zamanlama ekseni değil)', () => {
    const a = matris(); const b = matris();
    b.aksam.seviyeler[0].kanallar = SESLI; b.aksam.seviyeler[0].bildirimSesi = OZEL_SES;
    expect(zamanlamaDegistiMi(a, b)).toBe(false);
  });
  test('aynı matris false', () => {
    expect(zamanlamaDegistiMi(matris(), matris())).toBe(false);
  });
});

/**
 * Bir kerelik preset göçü bunu kullanır: göçün amacı ETKİSİZ TEKRARI kesmekti,
 * kullanıcının uyarı BİÇİMİNİ değiştirmek değil. Kanallar göçle ezilseydi, "Yatsı'yı
 * susturmuş ama yoğunluğu 'normal' kalmış" kullanıcının seçimi sessizce geri
 * alınırdı (kanal değişikliği yoğunluğu 'ozel' YAPMAZ — spec 4.1).
 */
describe('presetZamanlamasiniUygula (göç yolu — yalnız zamanlama)', () => {
  test('eşik ve sıklığı preset değerleriyle yazar', () => {
    const m = presetZamanlamasiniUygula(matris(), SESLI_PRESET);
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(m[v].seviyeler.map((s) => s.esikDk)).toEqual([45, 25, 10, 3]);
      expect(m[v].seviyeler[1].siklik).toEqual({ herDk: 10 });
      expect(m[v].seviyeler[3].siklik).toBe('birkez');
    }
  });

  test('kanallar / aciliyet / ses / anons metnine DOKUNMAZ', () => {
    const kaynak = matris();
    kaynak.yatsi.seviyeler.forEach((s) => { s.kanallar = KAPALI; });
    kaynak.ogle.seviyeler[3].kanallar = IKISI;
    kaynak.ogle.seviyeler[3].bildirimSesi = OZEL_SES;
    kaynak.ogle.seviyeler[3].anonsMetni = 'Kalk, {vakit} namazına {süre} dakika.';
    kaynak.aksam.seviyeler[3].acilKanal = true;

    const m = presetZamanlamasiniUygula(kaynak, SESLI_PRESET);

    expect(m.yatsi.seviyeler.every((s) => adimKapaliMi(s.kanallar))).toBe(true);
    expect(m.ogle.seviyeler[3].kanallar).toEqual(IKISI);
    expect(m.ogle.seviyeler[3].bildirimSesi).toBe(OZEL_SES);
    expect(m.ogle.seviyeler[3].anonsMetni).toBe('Kalk, {vakit} namazına {süre} dakika.');
    expect(m.aksam.seviyeler[3].acilKanal).toBe(true);
    // presetUygula ile FARK: o kanalları ezerdi
    expect(presetUygula(kaynak, SESLI_PRESET, true).yatsi.seviyeler[0].kanallar).toEqual(BILDIRIM);
  });

  test('kaynağı mutasyona uğratmaz (derin kopya)', () => {
    const kaynak = matris();
    presetZamanlamasiniUygula(kaynak, SESLI_PRESET).ogle.seviyeler[0].esikDk = 999;
    expect(kaynak.ogle.seviyeler[0].esikDk).toBe(30);
  });

  /**
   * Göç yalnız zamanlama taşır: kapalı bir adımın "açılınca hangi kanallara
   * dönerim" hafızası da bir kullanıcı seçimidir, göç onu SİLMEMELİ — aksi halde
   * göçten geçen kullanıcı kapattığı adımı açtığında kurduğu kümeyi kaybeder.
   */
  test('kapalı adımın kanal hafızasını (oncekiKanallar) KORUR', () => {
    const kaynak = matris();
    kaynak.yatsi.seviyeler[3] = {
      ...kaynak.yatsi.seviyeler[3],
      kanallar: KAPALI,
      oncekiKanallar: IKISI,
    };

    const m = presetZamanlamasiniUygula(kaynak, SESLI_PRESET);

    expect(m.yatsi.seviyeler[3].kanallar).toEqual(KAPALI);
    expect(m.yatsi.seviyeler[3].oncekiKanallar).toEqual(IKISI);
  });
});

describe('presetUygula — kanal hafızası (oncekiKanallar) hijyeni', () => {
  /**
   * Preset KANALLARI yazar, yani hücreyi kesin açar. "Kapatıldığında hatırlanan
   * küme" hafızası bu noktada anlamsızlaşır; bırakılırsa "oncekiKanallar var ⟺
   * hücre kapalı" invariantı kırılır (bugün görünür bir bug üretmez çünkü
   * preset'lerin hiçbiri kapalı adım yazmaz — ama yazan bir preset eklendiği gün üretir).
   */
  test('preset uygulanınca bayat kanal hafızası temizlenir', () => {
    const kaynak = matris();
    kaynak.ogle.seviyeler[0] = {
      ...kaynak.ogle.seviyeler[0],
      kanallar: KAPALI,
      oncekiKanallar: SESLI,
    };

    const m = presetUygula(kaynak, SESLI_PRESET, true);

    expect(m.ogle.seviyeler[0].kanallar).toEqual(BILDIRIM);
    expect(m.ogle.seviyeler[0].oncekiKanallar).toBeUndefined();
  });
});

describe('presetUygula — yön-uygun şablon', () => {
  test('giriş yönündeki vakitte boş kutu GİRİŞ şablonuyla dolar', () => {
    const m = matris();
    m.ogle.yon = 'girisindenItibaren';

    const sonuc = presetUygula(m, SESLI_PRESET, true);

    expect(sonuc.ogle.seviyeler[3].anonsMetni).toBe(ANONS_SABLONLARI_GIRIS[0]);
    // Yön alanı olmayan vakitler çıkış şablonunda kalır (sıfır göç).
    expect(sonuc.ikindi.seviyeler[3].anonsMetni).toBe(ANONS_SABLONLARI[0]);
  });
});

describe('yonDegisimindeMetniCevir', () => {
  const vakitAyari = (anonsMetni: string, yon?: VakitMuhafizAyari['yon']): VakitMuhafizAyari => ({
    yon,
    seviyeler: [{ ...sv(45, IKISI), anonsMetni }],
  });

  test('otomatik doldurulmuş ÇIKIŞ şablonu giriş karşılığına çevrilir', () => {
    const sonuc = yonDegisimindeMetniCevir(vakitAyari(ANONS_SABLONLARI[1]), 'girisindenItibaren');

    expect(sonuc.seviyeler[0].anonsMetni).toBe(ANONS_SABLONLARI_GIRIS[1]);
    expect(sonuc.yon).toBe('girisindenItibaren');
  });

  test('geri dönüşte GİRİŞ şablonu çıkış karşılığına çevrilir', () => {
    const sonuc = yonDegisimindeMetniCevir(
      vakitAyari(ANONS_SABLONLARI_GIRIS[2], 'girisindenItibaren'),
      'cikisaDogru'
    );

    expect(sonuc.seviyeler[0].anonsMetni).toBe(ANONS_SABLONLARI[2]);
    expect(sonuc.yon).toBe('cikisaDogru');
  });

  /**
   * B11'in can alıcı noktası: "kullanıcı metnini ezme" kuralı otomatik doldurulan
   * şablonu kullanıcının yazdığından ayırt edemez → ayırt edici ölçüt BİREBİR
   * EŞLEŞMEdir. Havuzda olmayan metne DOKUNULMAZ.
   */
  test('elle yazılmış metin KORUNUR (havuzla birebir eşleşmiyor)', () => {
    const elle = 'Kalk, {vakit} namazına {süre} dakika kaldı.';

    const sonuc = yonDegisimindeMetniCevir(vakitAyari(elle), 'girisindenItibaren');

    expect(sonuc.seviyeler[0].anonsMetni).toBe(elle);
    expect(sonuc.yon).toBe('girisindenItibaren');
  });

  test('şablonun ucuna tek boşluk eklenmişse bile DOKUNULMAZ', () => {
    const neredeyse = `${ANONS_SABLONLARI[0]} `;

    expect(yonDegisimindeMetniCevir(vakitAyari(neredeyse), 'girisindenItibaren')
      .seviyeler[0].anonsMetni).toBe(neredeyse);
  });

  test('boş kutu boş kalır (doldurma burada YAPILMAZ)', () => {
    expect(yonDegisimindeMetniCevir(vakitAyari(''), 'girisindenItibaren')
      .seviyeler[0].anonsMetni).toBe('');
  });

  test('yön zaten hedefse ve çevrilecek metin yoksa AYNI REFERANS döner', () => {
    const ayar = vakitAyari('Kendi metnim');

    expect(yonDegisimindeMetniCevir(ayar, 'cikisaDogru')).toBe(ayar);
  });

  test('metin dışındaki alanlara dokunmaz', () => {
    const sonuc = yonDegisimindeMetniCevir(vakitAyari(ANONS_SABLONLARI[0]), 'girisindenItibaren');

    expect(sonuc.seviyeler[0].kanallar).toEqual(IKISI);
    expect(sonuc.seviyeler[0].esikDk).toBe(45);
  });
});
