import {
  eskiAlarmSesiniGoc,
  eskidenMatriseGoc,
  kapaliVarsayilanAdimlariTemizle,
  kapaliVarsayilanAdimMi,
  modlariKanallaraGoc,
  yonEsiklerineGoc,
} from '../muhafizGoc';
import { anonsSablonlari } from '../anonsMetni';
import { muhafizMatrisiniCoz } from '../motorAdaptoru';
import { esikSiralamasiGecerliMi } from '../aktifSeviye';
import { MUHAFIZ_VAKITLERI } from '../matrisTipleri';
import type { MuhafizMatrisi, SeviyeAyari } from '../matrisTipleri';
import { adimKapaliMi, kanalAcikMi } from '../kanalKumesi';
import { seviyeyiAc } from '../seviyeAcKapa';
import { vakitUyariPlaniOlustur } from '../motorAdaptoru';
import { sayacBaslangicEsikleriHesapla } from '../../utils/vakitSayacYardimcisi';

const eski = {
  esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
  sikliklar: { seviye1: 20, seviye2: 10, seviye3: 5, seviye4: 2 },
};

describe('eskidenMatriseGoc', () => {
  test('5 vaktin hepsini üretir', () => {
    const m = eskidenMatriseGoc(eski);
    expect(Object.keys(m).sort()).toEqual([...MUHAFIZ_VAKITLERI].sort());
  });
  test('eşik/sıklık seviye sırasına doğru dağılır', () => {
    const m = eskidenMatriseGoc(eski);
    const s = m.ikindi.seviyeler;
    expect(s.map((x) => x.esikDk)).toEqual([45, 25, 10, 3]);
    expect(s.map((x) => (x.siklik as { herDk: number }).herDk)).toEqual([20, 10, 5, 2]);
  });
  test('yalnız BİLDİRİM kanalı açık, ses varsayılan, anons boş (TTS opt-in)', () => {
    const s = eskidenMatriseGoc(eski).ogle.seviyeler[0];
    expect(kanalAcikMi(s.kanallar, 'bildirim')).toBe(true);
    expect(kanalAcikMi(s.kanallar, 'sesli')).toBe(false);
    expect(s.bildirimSesi).toBe('varsayilan');
    expect(s.anonsMetni).toBe('');
  });
  test('idempotent: iki kez çağırmak aynı sonucu verir', () => {
    expect(eskidenMatriseGoc(eski)).toEqual(eskidenMatriseGoc(eski));
  });
});

describe('eskiAlarmSesiniGoc', () => {
  const alarmliMatris = () => {
    const m = eskidenMatriseGoc(eski);
    m.ogle.seviyeler[3].bildirimSesi = 'alarm';
    m.ogle.seviyeler[3].sesAdi = 'Alarm';
    return m;
  };

  test("'alarm' → varsayılan ses + acilKanal:true (aciliyet GÖRÜNÜR alana taşınır)", () => {
    // Eski şemada aciliyet ses id'siyle taşınıyordu. Göç olmasaydı kullanıcı yeni
    // bir ses seçtiği an aciliyet SESSİZCE kaybolurdu (UI'da izi de yoktu).
    const s = eskiAlarmSesiniGoc(alarmliMatris()).ogle.seviyeler[3];
    expect(s.bildirimSesi).toBe('varsayilan');
    expect(s.acilKanal).toBe(true);
    expect(s.sesAdi).toBeUndefined();
  });

  test('AÇIKÇA yazılmış acilKanal EZİLMEZ (kullanıcı tercihi öncelikli)', () => {
    const m = alarmliMatris();
    m.ogle.seviyeler[3].acilKanal = false;
    expect(eskiAlarmSesiniGoc(m).ogle.seviyeler[3].acilKanal).toBe(false);
  });

  test("'alarm' yoksa AYNI referans döner (gereksiz kopya/diske yazma yok)", () => {
    const m = eskidenMatriseGoc(eski);
    expect(eskiAlarmSesiniGoc(m)).toBe(m);
  });

  test('idempotent: ikinci çağrı hiçbir şey değiştirmez', () => {
    const bir = eskiAlarmSesiniGoc(alarmliMatris());
    expect(eskiAlarmSesiniGoc(bir)).toBe(bir);
  });

  test('dokunulmayan vakitler AYNI referansı korur', () => {
    const m = alarmliMatris();
    expect(eskiAlarmSesiniGoc(m).ikindi).toBe(m.ikindi);
  });
});

/**
 * ESKI disk kaydini yeniden uretir: hucreler `mod`/`oncekiMod` tasir, `kanallar`
 * ALANI YOKTUR. Tip bunu yasaklar (sema degisti) ama DISKTEKI veri tipe uymak
 * zorunda degil — gocun varlik sebebi tam olarak budur.
 */
const eskiSemayaDondur = (matris: MuhafizMatrisi, modlar: string[]): MuhafizMatrisi => {
  for (const vakit of MUHAFIZ_VAKITLERI) {
    matris[vakit].seviyeler = matris[vakit].seviyeler.map((s, i) => {
      const { kanallar: _kanallar, ...kalan } = s;
      return { ...kalan, mod: modlar[i] } as unknown as SeviyeAyari;
    });
  }
  return matris;
};

const eskiKayit = (modlar: string[] = ['bildirim', 'bildirim', 'bildirim', 'ikisi']) =>
  eskiSemayaDondur(eskidenMatriseGoc(eski), modlar);

describe('modlariKanallaraGoc', () => {
  test('dört mod da doğru kanal kümesine çevrilir', () => {
    const m = modlariKanallaraGoc(eskiKayit(['sessiz', 'bildirim', 'sesli', 'ikisi']));
    const s = m.ogle.seviyeler;
    expect(adimKapaliMi(s[0].kanallar)).toBe(true);
    expect(s[1].kanallar).toEqual({ bildirim: true });
    expect(s[2].kanallar).toEqual({ sesli: true });
    expect(s[3].kanallar).toEqual({ bildirim: true, sesli: true });
  });

  test('eskiyen `mod` alanı kayıttan TEMİZLENİR (iki doğruluk kaynağı kalmasın)', () => {
    const s = modlariKanallaraGoc(eskiKayit()).ogle.seviyeler[0] as unknown as { mod?: string };
    expect(s.mod).toBeUndefined();
  });

  /**
   * B10 — `oncekiMod` ATLANIRSA yaşanmış bir bug geri gelir.
   * "ikisi + özel ses + anons metni" ile kurup KAPATTIĞI adımı geri açan kullanıcı
   * kurduğunu kaybeder (`seviyeAcKapa`'nın varlık sebebi olan bug).
   */
  test('KAPALI adımın `oncekiMod` hafızası da çevrilir', () => {
    const m = eskiKayit();
    m.yatsi.seviyeler[2] = {
      ...m.yatsi.seviyeler[2],
      mod: 'sessiz',
      oncekiMod: 'ikisi',
    } as unknown as SeviyeAyari;

    const goc = modlariKanallaraGoc(m).yatsi.seviyeler[2];
    expect(adimKapaliMi(goc.kanallar)).toBe(true);
    expect(goc.oncekiKanallar).toEqual({ bildirim: true, sesli: true });
    expect((goc as unknown as { oncekiMod?: string }).oncekiMod).toBeUndefined();
  });

  test('NÖBETÇİ (B10): kapalı adım göç sonrası açılınca ESKİ kanallarıyla döner', () => {
    const m = eskiKayit();
    m.yatsi.seviyeler[2] = {
      ...m.yatsi.seviyeler[2],
      mod: 'sessiz',
      oncekiMod: 'ikisi',
      anonsMetni: 'Kendi yazdığım metin',
    } as unknown as SeviyeAyari;

    const acilan = seviyeyiAc(modlariKanallaraGoc(m).yatsi.seviyeler[2]);
    expect(acilan.kanallar).toEqual({ bildirim: true, sesli: true });
    expect(acilan.anonsMetni).toBe('Kendi yazdığım metin');
  });

  test('kanallar ZATEN varsa dokunulmaz ve AYNI referans döner', () => {
    const m = eskidenMatriseGoc(eski);
    expect(modlariKanallaraGoc(m)).toBe(m);
  });

  test('idempotent: ikinci çağrı hiçbir şey değiştirmez', () => {
    const bir = modlariKanallaraGoc(eskiKayit());
    expect(modlariKanallaraGoc(bir)).toBe(bir);
  });

  test('dokunulmayan vakitler AYNI referansı korur', () => {
    const m = eskidenMatriseGoc(eski);
    const dokunulmayan = m.ikindi;
    m.ogle.seviyeler = m.ogle.seviyeler.map((s) => {
      const { kanallar: _k, ...kalan } = s;
      return { ...kalan, mod: 'bildirim' } as unknown as SeviyeAyari;
    });
    expect(modlariKanallaraGoc(m).ikindi).toBe(dokunulmayan);
  });

  /**
   * GÖÇÜN ESKİ KAYDI BOZMADIĞININ KANITI: `mod` şemasıyla yazılmış bir kayıt
   * göçten geçtikten sonra motorun ürettiği plan BİREBİR aynı kalır — aynı
   * dakikalar, aynı sesli-anons bayrakları.
   */
  test('eski kayıt göçten sonra BİREBİR aynı planı üretir', () => {
    const plan = vakitUyariPlaniOlustur(modlariKanallaraGoc(eskiKayit()).ogle, 1440);
    expect(plan.map((p) => p.kalanDk)).toEqual([45, 25, 15, 10, 5, 3, 1]);
    expect(plan.map((p) => p.sesliAnons)).toEqual([
      false, false, false, false, false, true, true,
    ]);
  });
});

describe('yonEsiklerineGoc', () => {
  const VARSAYILAN_SES_ID = 'varsayilan';

  const sev = (kademe: SeviyeAyari['kademe'], esikDk: number): SeviyeAyari => ({
    kademe,
    kanallar: { bildirim: true, sesli: true },
    esikDk,
    siklik: { herDk: 7 },
    bildirimSesi: 'content://media/42',
    sesAdi: 'Secilen muzik',
    acilKanal: true,
    anonsMetni: 'Kendi metnim',
  });

  const KADEMELER: SeviyeAyari['kademe'][] = ['nazik', 'uyari', 'sert', 'acil'];

  const vakitAyari = (
    yon: 'cikisaDogru' | 'girisindenItibaren',
    esikler: number[]
  ) => ({ yon, seviyeler: KADEMELER.map((k, i) => sev(k, esikler[i])) });

  const matrisKur = (
    yon: 'cikisaDogru' | 'girisindenItibaren',
    esikler: number[]
  ): MuhafizMatrisi =>
    Object.fromEntries(
      MUHAFIZ_VAKITLERI.map((v) => [v, vakitAyari(yon, esikler)])
    ) as MuhafizMatrisi;

  /**
   * SAHADAKI BOZUK KAYIT: yon degistirme yolu eskiden esiklere dokunmuyordu →
   * giris yonlu her kullanicinin esikleri CIKIS sirasinda (azalan) kaldi ve
   * eskalasyon tersine dondu.
   */
  test('giris yonlu AZALAN esikleri ARTAN hale getirir', () => {
    const sonuc = yonEsiklerineGoc(matrisKur('girisindenItibaren', [45, 25, 10, 3]), 'normal');

    for (const v of MUHAFIZ_VAKITLERI) {
      expect(esikSiralamasiGecerliMi(sonuc[v].seviyeler, 'girisindenItibaren')).toBe(true);
    }
  });

  test('vaktin pencere sinifina gore tablo secer', () => {
    const sonuc = yonEsiklerineGoc(matrisKur('girisindenItibaren', [45, 25, 10, 3]), 'normal');

    expect(sonuc.yatsi.seviyeler.map((s) => s.esikDk)).not.toEqual(
      sonuc.aksam.seviyeler.map((s) => s.esikDk)
    );
  });

  test('YALNIZ zamanlama tasir — kanal/aciliyet/ses/metin korunur', () => {
    const once = matrisKur('girisindenItibaren', [45, 25, 10, 3]);
    const sonra = yonEsiklerineGoc(once, 'normal');

    sonra.yatsi.seviyeler.forEach((s, i) => {
      expect(s.kanallar).toEqual(once.yatsi.seviyeler[i].kanallar);
      expect(s.acilKanal).toBe(true);
      expect(s.bildirimSesi).toBe('content://media/42');
      expect(s.sesAdi).toBe('Secilen muzik');
      expect(s.anonsMetni).toBe('Kendi metnim');
    });
    expect(VARSAYILAN_SES_ID).toBe('varsayilan'); // ses id'si degismedi
  });

  test('CIKIS yonlu vakitlere HIC dokunmaz (ayni referans)', () => {
    const matris = matrisKur('cikisaDogru', [45, 25, 10, 3]);

    expect(yonEsiklerineGoc(matris, 'normal')).toBe(matris);
  });

  test('yon alani HIC yoksa (eski kayit) dokunmaz', () => {
    const matris = Object.fromEntries(
      MUHAFIZ_VAKITLERI.map((v) => [v, { seviyeler: KADEMELER.map((k, i) => sev(k, [45, 25, 10, 3][i])) }])
    ) as MuhafizMatrisi;

    expect(yonEsiklerineGoc(matris, 'normal')).toBe(matris);
  });

  /** BILINCLI kullanici: zaten gecerli ARTAN giris yapilandirmasi ezilmemeli. */
  test('gecerli ARTAN giris yapilandirmasina DOKUNMAZ (ayni referans)', () => {
    const matris = matrisKur('girisindenItibaren', [12, 34, 56, 78]);

    expect(yonEsiklerineGoc(matris, 'normal')).toBe(matris);
  });

  test('IDEMPOTENT: ikinci calisma ayni referansi dondurur', () => {
    const birinci = yonEsiklerineGoc(matrisKur('girisindenItibaren', [45, 25, 10, 3]), 'normal');

    expect(yonEsiklerineGoc(birinci, 'normal')).toBe(birinci);
  });

  test("bilinmeyen yogunlukta ('ozel') yine duzeltir", () => {
    const sonuc = yonEsiklerineGoc(matrisKur('girisindenItibaren', [45, 25, 10, 3]), 'ozel');

    expect(esikSiralamasiGecerliMi(sonuc.yatsi.seviyeler, 'girisindenItibaren')).toBe(true);
  });

  /**
   * ESIT esik de gecersizdir ("kesin" artan): iki adim ayni dakikalari kapsar,
   * biri kalici golgede kalir.
   */
  test('esit esikleri de duzeltir', () => {
    const sonuc = yonEsiklerineGoc(matrisKur('girisindenItibaren', [10, 10, 10, 10]), 'normal');

    expect(esikSiralamasiGecerliMi(sonuc.yatsi.seviyeler, 'girisindenItibaren')).toBe(true);
  });

  test('duzeltilen matris GERCEKTEN artan tonda plan uretir', () => {
    const sonuc = yonEsiklerineGoc(matrisKur('girisindenItibaren', [45, 25, 10, 3]), 'normal');
    const plan = vakitUyariPlaniOlustur(sonuc.yatsi, 1, { pencereUzunluguDk: 525 });

    expect(plan.length).toBeGreaterThan(0);
    // Seviye numarasi zaman icinde ASLA geri gitmez (eskalasyon tek yonlu).
    const seviyeler = plan.map((p) => p.seviye);
    expect([...seviyeler].sort((a, b) => a - b)).toEqual(seviyeler);
    expect(seviyeler[0]).toBe(1);
    // Giriş yönünde acil ton yok (issue #274) → en sert konuşan adım "sert".
    expect(seviyeler[seviyeler.length - 1]).toBe(3);
  });
});


describe('kapaliVarsayilanAdimlariTemizle (bir kerelik — içi boş kapalı adımlar SİLİNİR)', () => {
  const kapali = (s: SeviyeAyari, ek: Partial<SeviyeAyari> = {}): SeviyeAyari => ({
    ...s,
    kanallar: {},
    oncekiKanallar: { bildirim: true },
    ...ek,
  });

  test('varsayılan kapalı adım (boş/şablon metin, varsayılan ses, bildirim hafızası) silinir; plan DEĞİŞMEZ', () => {
    const m = eskidenMatriseGoc(eski);
    m.ogle.seviyeler[1] = kapali(m.ogle.seviyeler[1]);
    m.ogle.seviyeler[2] = kapali(m.ogle.seviyeler[2], { anonsMetni: anonsSablonlari('cikisaDogru')[0] });
    m.ogle.yonYedegi = { girisindenItibaren: m.ogle.seviyeler };
    const t = kapaliVarsayilanAdimlariTemizle(m);
    expect(t.ogle.seviyeler.map((s) => s.esikDk)).toEqual([45, 3]);
    // İndeksle hizalı yedek atılır.
    expect(t.ogle.yonYedegi).toBeUndefined();
    // Tetikler (an, ton, kanal) BİREBİR; yalnız kronolojik sıra numarası (`adimIndeks`
    // = "N. hatırlatma") silinen adım kadar kayar — kimlik/zaman ona bağlı değil.
    const sirasiz = (p: ReturnType<typeof vakitUyariPlaniOlustur>) => p.map(({ adimIndeks: _a, ...k }) => k);
    expect(sirasiz(vakitUyariPlaniOlustur(t.ogle, 24 * 60))).toEqual(sirasiz(vakitUyariPlaniOlustur(m.ogle, 24 * 60)));
    // Dokunulmayan vakit AYNI referans.
    expect(t.ikindi).toBe(m.ikindi);
  });

  test('kullanıcının emeği taşıyan kapalı adım KALIR (ses, metin, titreşim/sesli/alarm hafızası, kapsam)', () => {
    const s = eskidenMatriseGoc(eski).ogle.seviyeler[0];
    expect(kapaliVarsayilanAdimMi(kapali(s, { bildirimSesi: 'content://x' }))).toBe(false);
    expect(kapaliVarsayilanAdimMi(kapali(s, { anonsMetni: 'Kendi cümlem' }))).toBe(false);
    expect(kapaliVarsayilanAdimMi(kapali(s, { oncekiKanallar: { bildirim: true, titresim: true } }))).toBe(false);
    expect(kapaliVarsayilanAdimMi(kapali(s, { oncekiKanallar: { sesli: true } }))).toBe(false);
    expect(kapaliVarsayilanAdimMi(kapali(s, { oncekiKanallar: { bildirim: true, alarm: true } }))).toBe(false);
    expect(kapaliVarsayilanAdimMi(kapali(s, { alarmKapsami: 'hepsi' }))).toBe(false);
    // Açık adım asla.
    expect(kapaliVarsayilanAdimMi(s)).toBe(false);
    // Hafızasız kapalı adım ve eski palet sesi ("melodi" → varsayılan) varsayılandır.
    expect(kapaliVarsayilanAdimMi(kapali(s, { oncekiKanallar: undefined, bildirimSesi: 'melodi' }))).toBe(true);
  });

  test('hepsi boş-kapalıysa en az bir adım kalır; değişiklik yoksa AYNI referans', () => {
    const m = eskidenMatriseGoc(eski);
    m.yatsi.seviyeler = m.yatsi.seviyeler.map((s) => kapali(s));
    expect(kapaliVarsayilanAdimlariTemizle(m).yatsi.seviyeler).toHaveLength(1);
    const temiz = eskidenMatriseGoc(eski);
    expect(kapaliVarsayilanAdimlariTemizle(temiz)).toBe(temiz);
  });

  test('muhafizMatrisiniCoz temizlemez (yalnız slice — sayaç seviyesini bilen tek yer)', () => {
    const m = eskidenMatriseGoc(eski);
    m.aksam.seviyeler[0] = kapali(m.aksam.seviyeler[0]);
    expect(muhafizMatrisiniCoz({ ...eski, matris: m }).aksam.seviyeler).toHaveLength(4);
  });

  // Bulgu: "plan değişmez" yalnız motor için doğruydu. Vakit sayacının başlangıcı
  // "N. hatırlatma"dır (kronolojik indeks, kapalı adımlar dahil) → silinen adım
  // sonraki adımların sırasını kaydırıp sayacı başka dakikaya taşıyordu.
  const esikliMatris = (esikler: number[], kapaliIndeksler: number[]): MuhafizMatrisi => {
    const m = eskidenMatriseGoc(eski);
    for (const v of MUHAFIZ_VAKITLERI) {
      const sablon = m[v].seviyeler[0];
      m[v] = {
        seviyeler: esikler.map((esikDk, i) => {
          const s = { ...sablon, kademe: m[v].seviyeler[Math.min(i, 3)].kademe, esikDk };
          return kapaliIndeksler.includes(i) ? kapali(s) : s;
        }),
      };
    }
    return m;
  };

  test.each([
    { ad: 'inceleme örneği [45,25,26k,3]', esikler: [45, 25, 26, 3], kapali: [2] },
    { ad: 'ilk adım kapalı [45k,25,10,3]', esikler: [45, 25, 10, 3], kapali: [0] },
    { ad: 'son adım kapalı [45,25,10,3k]', esikler: [45, 25, 10, 3], kapali: [3] },
    { ad: 'iki kapalı [45,25k,10k,3]', esikler: [45, 25, 10, 3], kapali: [1, 2] },
    { ad: 'altı adım [60k,45,30k,20,10k,3]', esikler: [60, 45, 30, 20, 10, 3], kapali: [0, 2, 4] },
  ])('SAYAÇ EŞİĞİ BİREBİR: $ad — her başlangıç seçiminde (1..6 + yok)', ({ esikler, kapali: k }) => {
    const m = esikliMatris(esikler, k);
    for (const n of [undefined, 1, 2, 3, 4, 5, 6]) {
      const t = kapaliVarsayilanAdimlariTemizle(m, n);
      expect(sayacBaslangicEsikleriHesapla(n, t)).toEqual(sayacBaslangicEsikleriHesapla(n, m));
    }
  });

  test('inceleme örneği: N=3 iken sayaç 25 dk kalır (eskiden 3 dk kala başlıyordu)', () => {
    const m = esikliMatris([45, 25, 26, 3], [2]);
    expect(sayacBaslangicEsikleriHesapla(3, m).ogle).toBe(25);
    const t = kapaliVarsayilanAdimlariTemizle(m, 3);
    expect(sayacBaslangicEsikleriHesapla(3, t).ogle).toBe(25);
  });

  test('temizlik NO-OP DEĞİL: sayaç eşiğini kaydırmayan boş-kapalı adımlar yine silinir', () => {
    // N=1 → eşik ilk adım (45); sondaki kapalı 3 silinebilir.
    expect(kapaliVarsayilanAdimlariTemizle(esikliMatris([45, 25, 10, 3], [3]), 1).ogle.seviyeler.map((s) => s.esikDk))
      .toEqual([45, 25, 10]);
    // İlk adım kapalı + N=1: eşiği VEREN adım korunur, diğer boş-kapalılar gider.
    expect(kapaliVarsayilanAdimlariTemizle(esikliMatris([45, 25, 10, 3], [0, 2]), 1).ogle.seviyeler.map((s) => s.esikDk))
      .toEqual([45, 25, 3]);
  });

  test('giriş yönlü vakit: yedek atılınca sayaç eşiği kayacaksa vakte DOKUNULMAZ', () => {
    const m = esikliMatris([5, 20, 40, 90], [1]);
    m.ogle = {
      ...m.ogle,
      yon: 'girisindenItibaren',
      // Kullanıcının ayrıldığı ÖZEL çıkış ayarı (varsayılan 45/25/10/3 DEĞİL).
      yonYedegi: { cikisaDogru: eskidenMatriseGoc(eski).ogle.seviyeler.map((s, i) => ({ ...s, esikDk: [50, 30, 12, 4][i] })) },
    };
    const t = kapaliVarsayilanAdimlariTemizle(m, 2);
    expect(sayacBaslangicEsikleriHesapla(2, t).ogle).toBe(30);
    expect(t.ogle).toBe(m.ogle);
  });
});
