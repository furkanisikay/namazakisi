/**
 * Gun sonu seri hatirlatmasi plani — NOBETCI testler (issue #272 devami).
 *
 * Hatirlatma DAILY'den TARIHLI tetiklere gecti: ozel gun kapisi tarih ister.
 * Kilitlenenler: (a) her seri gunu kendi ERTESI imsagina gore kurulur,
 * (b) ozel gun gunleri atlanir ve aralik DISINDAKI tetikler birebir aynidir,
 * (c) metin: 🚨 yok, ayar satiriyla eslesen baslik, SERI_SOZU korunur (2026-10-19
 *     bilincli degisiklik — eski "birebir eski DAILY" nobetcisi kaldirildi),
 * (d) TAM gune tetik KURULMAZ (persona calismasi: gun tamken gece ses cikariyordu).
 * `simdi` ve imsak saglayicisi enjekte — sabit tarih, gercek konum yok.
 */
import {
  gunSonuBasligi,
  gunSonuGovdesi,
  GUN_SONU_ID_ONEKI,
  gunSonuKimligindenGun,
  gunSonuPlaniOlustur,
  gunTamYuklemi,
  type GunSonuPlanAyarlari,
} from '../gunSonuPlani';
import { ozelGunAktifMi } from '../ozelGunKapisi';
import { SERI_SOZU } from '../../data/SeriSozu';

/** Istenen gunun imsagi: her gun bir dakika kayar (mevsim) — gun bazinda sorulduğu kanitlanir. */
const imsakSaglayici = (tarih: Date): Date =>
  new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate(), 5, 0 + (tarih.getDate() % 30));

const OTOMATIK: GunSonuPlanAyarlari = {
  gunSonuBildirimModu: 'otomatik',
  bildirimImsakOncesiDk: 30,
  bildirimSaati: 4,
  bildirimDakikasi: 0,
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('gunSonuPlaniOlustur — otomatik mod', () => {
  const ogle = new Date(2026, 9, 13, 12, 0); // 13 Ekim 2026 12:00

  test('her seri gunu ERTESI gunun imsagindan X dk once, kronolojik, gunSayisi adet', () => {
    const plan = gunSonuPlaniOlustur({
      simdi: ogle,
      ayarlar: OTOMATIK,
      imsakSaglayici,
      gunSayisi: 7,
    });

    expect(plan).toHaveLength(7);
    plan.forEach((t, i) => {
      const seriGunu = new Date(2026, 9, 13 + i);
      const ertesi = new Date(2026, 9, 14 + i);
      const beklenen = new Date(imsakSaglayici(ertesi).getTime() - 30 * 60000);
      expect(t.seriGunu).toBe(iso(seriGunu));
      expect(t.kimlik).toBe(`${GUN_SONU_ID_ONEKI}${iso(seriGunu)}`);
      expect(t.an.getTime()).toBe(beklenen.getTime());
    });
  });

  test('gece yarisindan sonra (imsak oncesi) ILK tetik bugunun imsagina, DUNUN seri gunune kurulur', () => {
    const gece = new Date(2026, 9, 13, 2, 0);
    const plan = gunSonuPlaniOlustur({ simdi: gece, ayarlar: OTOMATIK, imsakSaglayici, gunSayisi: 3 });

    expect(plan[0].seriGunu).toBe('2026-10-12');
    expect(plan[0].an.getTime()).toBe(imsakSaglayici(gece).getTime() - 30 * 60000);
    expect(plan.map((t) => t.seriGunu)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14']);
  });

  test('gecmis tetik kurulmaz', () => {
    // 04:50 → bugunun imsagi (05:13) − 30 = 04:43 gecti; ilk tetik yarina.
    const simdi = new Date(2026, 9, 13, 4, 50);
    const plan = gunSonuPlaniOlustur({ simdi, ayarlar: OTOMATIK, imsakSaglayici, gunSayisi: 2 });
    expect(plan[0].seriGunu).toBe('2026-10-13');
    expect(plan.every((t) => t.an.getTime() > simdi.getTime())).toBe(true);
  });

  test('imsak yoksa (konum yok) ya da saglayici patlarsa ertesi gun 04:00 (eski fallback)', () => {
    for (const saglayici of [() => null, () => { throw new Error('adhan'); }]) {
      const plan = gunSonuPlaniOlustur({
        simdi: ogle,
        ayarlar: OTOMATIK,
        imsakSaglayici: saglayici,
        gunSayisi: 2,
      });
      expect(plan).toHaveLength(2);
      expect(plan[0].an).toEqual(new Date(2026, 9, 14, 4, 0));
      expect(plan[0].seriGunu).toBe('2026-10-13');
    }
  });

  test('gunSayisi 0 / gecersiz simdi → bos plan', () => {
    expect(gunSonuPlaniOlustur({ simdi: ogle, ayarlar: OTOMATIK, imsakSaglayici, gunSayisi: 0 })).toEqual([]);
    expect(
      gunSonuPlaniOlustur({ simdi: new Date(NaN), ayarlar: OTOMATIK, imsakSaglayici, gunSayisi: 3 })
    ).toEqual([]);
  });
});

describe('gunSonuPlaniOlustur — sabit mod', () => {
  test('ogleden ONCEKI saat imsak oncesi penceredir → ertesi takvim gunune, onceki seri gunune', () => {
    const plan = gunSonuPlaniOlustur({
      simdi: new Date(2026, 9, 13, 12, 0),
      ayarlar: { ...OTOMATIK, gunSonuBildirimModu: 'sabit', bildirimSaati: 3, bildirimDakikasi: 45 },
      imsakSaglayici,
      gunSayisi: 2,
    });
    expect(plan[0]).toMatchObject({ seriGunu: '2026-10-13', an: new Date(2026, 9, 14, 3, 45) });
    expect(plan[1]).toMatchObject({ seriGunu: '2026-10-14', an: new Date(2026, 9, 15, 3, 45) });
  });

  test('ogleden SONRAKI saat (yatsi sonrasi) ayni seri gunune', () => {
    const plan = gunSonuPlaniOlustur({
      simdi: new Date(2026, 9, 13, 12, 0),
      ayarlar: { ...OTOMATIK, gunSonuBildirimModu: 'sabit', bildirimSaati: 23, bildirimDakikasi: 30 },
      imsakSaglayici,
      gunSayisi: 2,
    });
    expect(plan[0]).toMatchObject({ seriGunu: '2026-10-13', an: new Date(2026, 9, 13, 23, 30) });
    expect(plan[1]).toMatchObject({ seriGunu: '2026-10-14', an: new Date(2026, 9, 14, 23, 30) });
  });
});

describe('gunSonuPlaniOlustur — ozel gun kapisi (NOBETCI)', () => {
  const simdi = new Date(2026, 9, 13, 12, 0);
  const ozelGun = {
    ozelGunModuAktif: true,
    aktifOzelGun: { baslangicTarihi: '2026-10-15', bitisTarihi: '2026-10-17' },
  };
  const suzgec = (t: string) => ozelGunAktifMi(t, ozelGun);

  test('ozel gundeki seri gunlerine tetik KURULMAZ, aralik disi BIREBIR eskisi', () => {
    const kapisiz = gunSonuPlaniOlustur({ simdi, ayarlar: OTOMATIK, imsakSaglayici, gunSayisi: 7 });
    const kapili = gunSonuPlaniOlustur({
      simdi,
      ayarlar: OTOMATIK,
      imsakSaglayici,
      gunSayisi: 7,
      gunAtlanirMi: suzgec,
    });

    expect(kapili.map((t) => t.seriGunu)).toEqual([
      '2026-10-13',
      '2026-10-14',
      '2026-10-18',
      '2026-10-19',
    ]);
    // Ufuk kaymaz ve kalan tetikler kapisiz planla birebir aynidir.
    expect(kapili).toEqual(kapisiz.filter((t) => !suzgec(t.seriGunu)));
  });

  test('ozel gunun SON gecesinin ertesi imsagindaki tetik atlanir (seri gunu aralikta)', () => {
    // 17 Ekim seri gunu 18 Ekim imsaginda biter → o tetik 18'inde calar ama 17'ye aittir.
    const kapili = gunSonuPlaniOlustur({
      simdi,
      ayarlar: OTOMATIK,
      imsakSaglayici,
      gunSayisi: 7,
      gunAtlanirMi: suzgec,
    });
    const onSekizindeCalan = kapili.filter((t) => t.an.getDate() === 18);
    expect(onSekizindeCalan).toEqual([]);
  });
});

describe('gun sonu bildirim metni (NOBETCI)', () => {
  test('telas simgesi yok, baslik ayar satiriyla eslesir, seri hadisi korunur', () => {
    // 2026-10-19 BILINCLI degisiklik: "🚨 Seri Hatırlatıcı" gece telas yaratiyordu
    // ve ayar satiri ("Günü tamamlamadıysam") ile eslesmiyordu.
    expect(gunSonuBasligi()).toBe('Günü tamamlamadınız · seri');
    expect(gunSonuBasligi()).not.toMatch(/🚨/u);
    expect(gunSonuGovdesi()).toBe(
      `Kıldığınız namazları gün bitmeden işaretlerseniz seriniz sürer.

«${SERI_SOZU.metin}» (${SERI_SOZU.kaynak})`
    );
    expect(gunSonuGovdesi()).toContain('Allah katında amellerin en sevimlisi, az da olsa devamlı olanıdır.');
  });
});

describe('TAM GUN — hatirlatma kurulmaz (NOBETCI)', () => {
  const ogle = new Date(2026, 9, 13, 12, 0);

  test('bugun tamsa bugunun tetigi yok; ufuk KAYMAZ (diger gunler birebir)', () => {
    const tumu = gunSonuPlaniOlustur({ simdi: ogle, ayarlar: OTOMATIK, imsakSaglayici, gunSayisi: 7 });
    const bugun = iso(ogle);
    const kapili = gunSonuPlaniOlustur({
      simdi: ogle,
      ayarlar: OTOMATIK,
      imsakSaglayici,
      gunSayisi: 7,
      gunTamMi: (g) => g === bugun,
    });
    expect(kapili.map((t) => t.seriGunu)).toEqual(tumu.map((t) => t.seriGunu).filter((g) => g !== bugun));
    expect(kapili).toHaveLength(6);
  });

  test('gunTamYuklemi: esik kadar FARKLI vakit tam sayilir, tekrarlar sayilmaz', () => {
    const tamMi = gunTamYuklemi(
      { '2026-10-13': ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'], '2026-10-14': ['imsak', 'imsak', 'ogle', 'ikindi', 'aksam'] },
      5
    );
    expect(tamMi('2026-10-13')).toBe(true);
    expect(tamMi('2026-10-14')).toBe(false);
    expect(tamMi('2026-10-15')).toBe(false);
  });

  test('gunTamYuklemi: kullanicinin esigi (3) uygulanir; gecersiz esik 5e duser', () => {
    const k = { g: ['imsak', 'ogle', 'ikindi'] };
    expect(gunTamYuklemi(k, 3)('g')).toBe(true);
    expect(gunTamYuklemi(k, undefined)('g')).toBe(false);
    expect(gunTamYuklemi(k, Number.NaN)('g')).toBe(false);
  });

  test('gunSonuKimligindenGun: yalniz tarihli kimligi cozer', () => {
    expect(gunSonuKimligindenGun(`${GUN_SONU_ID_ONEKI}2026-10-13`)).toBe('2026-10-13');
    expect(gunSonuKimligindenGun('gun_sonu_hatirlatici')).toBeNull();
    expect(gunSonuKimligindenGun('cuma_hatirlatma_2026-10-16')).toBeNull();
  });
});
