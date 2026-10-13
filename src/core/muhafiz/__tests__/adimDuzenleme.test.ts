/**
 * Issue #274 Faz 1 — hatırlatma ekle/sil, ton notu ve acil ton kısıtı.
 */
import type { SeviyeAyari, SeviyeKademe, UyariKanallari, VakitMuhafizAyari } from '../matrisTipleri';
import { MUHAFIZ_MAKS_ADIM } from '../matrisTipleri';
import {
  adimEkle,
  adimEklenebilirMi,
  adimSil,
  adimSilinebilirMi,
  tonGeriGidenAdim,
  yeniAdimEsigi,
} from '../adimDuzenleme';
import {
  ACIL_TON_UST_DK,
  acilTonSecilebilirMi,
  etkinKademe,
  matrisGecerliMi,
  vakitUyariPlaniOlustur,
} from '../motorAdaptoru';
import { matristenKanallariCikar } from '../kanalPlani';
import { MUHAFIZ_VAKITLERI, type MuhafizMatrisi } from '../matrisTipleri';

const sv = (
  kademe: SeviyeKademe,
  esikDk: number,
  kanallar: UyariKanallari = { bildirim: true }
): SeviyeAyari => ({
  kademe,
  kanallar,
  esikDk,
  siklik: 'birkez',
  bildirimSesi: 'varsayilan',
  anonsMetni: '',
});

const varsayilan = (): VakitMuhafizAyari => ({
  seviyeler: [sv('nazik', 45), sv('uyari', 25), sv('sert', 10), sv('acil', 3)],
});

describe('adimEkle', () => {
  test('varsayılan: en erken hatırlatmanın 15 dk öncesi, nazik, bildirim, 15 dk tekrar, BAŞA', () => {
    const sonuc = adimEkle(varsayilan(), 200);
    expect(sonuc.seviyeler).toHaveLength(5);
    expect(sonuc.seviyeler[0]).toMatchObject({
      kademe: 'nazik',
      kanallar: { bildirim: true },
      esikDk: 60,
      siklik: { herDk: 15 },
      bildirimSesi: 'varsayilan',
      anonsMetni: '',
    });
    expect(sonuc.seviyeler.map((s) => s.esikDk)).toEqual([60, 45, 25, 10, 3]);
  });

  test('pencereye sığmazsa kırpılır (aksam 50 dk → en fazla 49)', () => {
    const sonuc = adimEkle(varsayilan(), 50);
    expect(sonuc.seviyeler[0].esikDk).toBe(49);
  });

  test('kırpılan dakika doluysa en yakın boş dakikaya kayar ve dizi kronolojik kalır', () => {
    const ayar: VakitMuhafizAyari = { seviyeler: [sv('nazik', 49), sv('sert', 10)] };
    const sonuc = adimEkle(ayar, 50);
    expect(sonuc.seviyeler.map((s) => s.esikDk)).toEqual([49, 48, 10]);
  });

  test('giriş yönünde "önce" = daha küçük eşik; 1 dk altına inmez', () => {
    const giris: VakitMuhafizAyari = {
      yon: 'girisindenItibaren',
      seviyeler: [sv('nazik', 30), sv('sert', 90)],
    };
    expect(adimEkle(giris, 300).seviyeler.map((s) => s.esikDk)).toEqual([15, 30, 90]);
    expect(yeniAdimEsigi([sv('nazik', 10)], 'girisindenItibaren', 300)).toBe(1);
  });

  test('en fazla 6 hatırlatma: 7. eklenmez, AYNI referans', () => {
    let ayar = varsayilan();
    ayar = adimEkle(adimEkle(ayar, 600), 600);
    expect(ayar.seviyeler).toHaveLength(MUHAFIZ_MAKS_ADIM);
    expect(adimEklenebilirMi(ayar)).toBe(false);
    expect(adimEkle(ayar, 600)).toBe(ayar);
  });

  test('eklenen matris geçerlidir (tekil eşik) ve yön yedeği temizlenir', () => {
    const ayar: VakitMuhafizAyari = {
      ...varsayilan(),
      yonYedegi: { girisindenItibaren: [{ esikDk: 1, siklik: 'birkez' }] },
    };
    const sonuc = adimEkle(ayar, 200);
    expect(sonuc.yonYedegi).toBeUndefined();
    const matris = Object.fromEntries(MUHAFIZ_VAKITLERI.map((v) => [v, sonuc])) as MuhafizMatrisi;
    expect(matrisGecerliMi(matris)).toBe(true);
  });
});

describe('adimSil', () => {
  test('istenen hatırlatmayı siler, sıra korunur', () => {
    expect(adimSil(varsayilan(), 1).seviyeler.map((s) => s.esikDk)).toEqual([45, 10, 3]);
  });

  test('son hatırlatma silinemez', () => {
    const tek: VakitMuhafizAyari = { seviyeler: [sv('nazik', 10)] };
    expect(adimSilinebilirMi(tek)).toBe(false);
    expect(adimSil(tek, 0)).toBe(tek);
  });
});

describe('acil ton kısıtı — yalnız çıkış yönünde son 15 dk', () => {
  test('acilTonSecilebilirMi', () => {
    expect(acilTonSecilebilirMi(ACIL_TON_UST_DK, 'cikisaDogru')).toBe(true);
    expect(acilTonSecilebilirMi(16, 'cikisaDogru')).toBe(false);
    expect(acilTonSecilebilirMi(5, 'girisindenItibaren')).toBe(false);
    expect(acilTonSecilebilirMi(5)).toBe(true);
  });

  test('bozuk kayıt: 45 dk kala acil → sert konuşur (kayıt değişmez)', () => {
    const adim = sv('acil', 45);
    expect(etkinKademe(adim, 'cikisaDogru')).toBe('sert');
    expect(adim.kademe).toBe('acil');
    const plan = vakitUyariPlaniOlustur({ seviyeler: [adim] }, 100);
    expect(plan.map((u) => u.seviye)).toEqual([3]);
  });

  test('giriş yönünde acil → sert; kanal planı da aynı tonu kullanır', () => {
    expect(etkinKademe(sv('acil', 5), 'girisindenItibaren')).toBe('sert');
    const vakit: VakitMuhafizAyari = {
      yon: 'girisindenItibaren',
      seviyeler: [{ ...sv('acil', 5), acilKanal: undefined }],
    };
    const matris = Object.fromEntries(MUHAFIZ_VAKITLERI.map((v) => [v, vakit])) as MuhafizMatrisi;
    // Sert de (tarihsel taban kural seviye >= 3) acil kanala düşer → kanal id değişmez.
    expect(matristenKanallariCikar(matris).map((k) => k.acilMi)).toEqual([true]);
  });

  test('geçerli acil (çıkış, ≤15 dk) acil kalır', () => {
    expect(etkinKademe(sv('acil', 3), 'cikisaDogru')).toBe('acil');
  });
});

describe('tonGeriGidenAdim', () => {
  test('artan ton → not yok', () => {
    expect(tonGeriGidenAdim(varsayilan().seviyeler)).toBe(0);
  });

  test('sert bir hatırlatmadan sonra nazik gelirse o hatırlatmanın NUMARASI', () => {
    const s = [sv('sert', 45), sv('nazik', 20), sv('acil', 5)];
    expect(tonGeriGidenAdim(s)).toBe(2);
  });

  test('kapalı adım notu tetiklemez; aynı ton tekrar etmek geri gitmek değildir', () => {
    const s = [sv('sert', 45), sv('nazik', 30, {}), sv('sert', 20)];
    expect(tonGeriGidenAdim(s)).toBe(0);
  });

  test('etkin ton okunur: 40 dk kala acil (sert) → ardından sert geri gitmek değildir', () => {
    expect(tonGeriGidenAdim([sv('acil', 40), sv('sert', 20)])).toBe(0);
  });

  test('giriş yönünde kronolojik sıra eşik ARTAN', () => {
    const s = [sv('nazik', 90), sv('sert', 10)];
    expect(tonGeriGidenAdim(s, 'girisindenItibaren')).toBe(2);
  });
});
