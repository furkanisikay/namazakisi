import { eskiAlarmSesiniGoc, eskidenMatriseGoc, modlariKanallaraGoc } from '../muhafizGoc';
import { MUHAFIZ_VAKITLERI } from '../matrisTipleri';
import type { MuhafizMatrisi, SeviyeAyari } from '../matrisTipleri';
import { adimKapaliMi, kanalAcikMi } from '../kanalKumesi';
import { seviyeyiAc } from '../seviyeAcKapa';
import { vakitUyariPlaniOlustur } from '../motorAdaptoru';

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
