/**
 * Duvar kâğıdı tasarım sözleşmesi: kurallar + platform eşlik örneğinin tazeliği.
 * Örnek düşerse: `node scripts/icerik/duvar-tasarim-ornek-uret.js` (Kotlin ve Swift testleri de onu okur).
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  cisimKonumuSec,
  GOK_SAHNELERI,
  IZINLI_BANTLAR,
  okunurlukKarari,
  vaktinGogu,
  yaziYerlesimi,
  type GunVakitleri,
} from '../duvarTasarimi';
import { duvarTasarimOrnegi } from '../duvarTasarimOrnegi';
import { anlikDuvarAyari, duvarAyariNormalize, gununAyetiYukuOlustur, VARSAYILAN_DUVAR_AYARI } from '../gununAyetiYuku';

const ORNEK = path.join(__dirname, '../../../../android/app/src/test/resources/duvar-tasarim-ornek.json');

describe('duvar tasarım sözleşmesi', () => {
  it('eşlik örneği üreticiyle birebir aynı (Kotlin ve Swift aynı dosyayı okur)', () => {
    const disk = fs.readFileSync(ORNEK, 'utf8');
    if (disk !== `${JSON.stringify(duvarTasarimOrnegi(), null, 1)}\n`) {
      throw new Error('duvar-tasarim-ornek.json eski: `node scripts/icerik/duvar-tasarim-ornek-uret.js` koşun');
    }
  });

  it('gök vakte göre seçilir; yatsıdan sonra ve imsaktan önce yatsı', () => {
    const v: GunVakitleri = [100, 200, 300, 400, 500];
    expect([50, 100, 199, 200, 350, 450, 500, 900].map((t) => vaktinGogu(t, v))).toEqual([
      'yatsi', 'imsak', 'imsak', 'kusluk', 'ikindi', 'aksam', 'yatsi', 'yatsi',
    ]);
  });

  it('yazı saat alanına girmez: istenen merkez yasak bölgedeyse en yakın izinli banda oturur', () => {
    const bantlar = IZINLI_BANTLAR.android.kilit;
    // Saatin alt yarısı (%50) istenir, blok %10: en yakın alttaki banda (%64'ten) oturur;
    // üst yarısı (%35) istenirse saatin üstündeki ince şeride.
    expect(yaziYerlesimi(0.5, 0.1, bantlar)).toEqual({ ust: 0.64, bant: [0.64, 0.84] });
    expect(yaziYerlesimi(0.35, 0.1, bantlar)).toEqual({ ust: 0.16, bant: [0.08, 0.26] });
    // Hiçbir banda sığmayan blok → null (çizici küçültür).
    expect(yaziYerlesimi(0.7, 0.3, bantlar)).toBeNull();
  });

  it('gök cismi yazı kutusuna değmeyen ilk adaya geçer; hepsi değerse çizilmez', () => {
    const hilal = GOK_SAHNELERI.imsak.cisim!;
    expect(cisimKonumuSec(hilal, null, 2.17)).toEqual(hilal.konumlar[0]);
    expect(cisimKonumuSec(hilal, [0.1, 0.6, 0.9, 0.7], 2.17)).toEqual(hilal.konumlar[1]);
    expect(cisimKonumuSec(hilal, [0, 0, 1, 1], 2.17)).toBeNull();
  });

  it('okunurluk: koyu zeminde beyaz yazı perdesiz, açıkta koyu yazı; orta tonda perde 4,5:1 tutturur', () => {
    expect(okunurlukKarari(0.02)).toEqual({ metin: '#FFFFFF', perde: '#000000', perdeOpakligi: 0 });
    expect(okunurlukKarari(0.9).metin).toBe('#1F2A22');
    expect(okunurlukKarari(0.25).perdeOpakligi).toBeGreaterThan(0);
  });

  it('eski kayıt yeni alanlarla tamamlanır; zemini korunur; geçersiz fotoğraf adı reddedilir', () => {
    const a = duvarAyariNormalize({ acik: true, yer: 'kilit', zemin: 'gece', arapca: false, paletRenk: '#2E7D32' });
    expect(a.zemin).toBe('gece');
    expect(a.vakteUysun).toBe(true);
    expect(a.sus.tur).toBe('yildiz');
    expect(duvarAyariNormalize({ zemin: 'foto', foto: { dosya: '../x.jpg' } }).foto.dosya).toBeNull();
    expect(duvarAyariNormalize({ foto: { dosya: 'duvar-foto-ab12cd34.jpg' } }).foto.dosya).toBe('duvar-foto-ab12cd34.jpg');
  });

  it('önizlemenin anlık ayarı: vakte uyan gökte o anın göğü, kapalıysa ya da konum yoksa seçilen gök', () => {
    const t = (s: number, d = 0) => new Date(2026, 10, 7, s, d).getTime();
    const vakitler = () => [t(6), t(7, 30), t(15), t(17, 30), t(19)] as const;
    const imsak = (g: Date) => new Date(g.getFullYear(), g.getMonth(), g.getDate(), 6);
    const ayar = { ...VARSAYILAN_DUVAR_AYARI, zemin: 'imsak' as const, vakteUysun: true };
    expect(anlikDuvarAyari(ayar, new Date(t(13)), imsak, vakitler).zemin).toBe('kusluk');
    expect(anlikDuvarAyari({ ...ayar, vakteUysun: false }, new Date(t(13)), imsak, vakitler).zemin).toBe('imsak');
    expect(anlikDuvarAyari(ayar, new Date(t(13)), imsak, () => null).zemin).toBe('imsak');
    // Düz zemin ve fotoğraf hiç değişmez.
    expect(anlikDuvarAyari({ ...ayar, zemin: 'kagit' }, new Date(t(13)), imsak, vakitler).zemin).toBe('kagit');
  });

  it('yük gökleri ve (konum varsa) günün vakitlerini taşır', () => {
    const yuk = gununAyetiYukuOlustur(new Date(2026, 10, 7, 9), () => null, VARSAYILAN_DUVAR_AYARI, 'tr', 2, () => [1, 2, 3, 4, 5]);
    expect(Object.keys(yuk.sahneler).sort()).toEqual(['aksam', 'ikindi', 'imsak', 'kusluk', 'yatsi']);
    expect(yuk.plan[0].vakitler).toEqual([1, 2, 3, 4, 5]);
  });
});
