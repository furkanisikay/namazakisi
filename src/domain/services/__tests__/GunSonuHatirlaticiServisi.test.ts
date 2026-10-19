/**
 * GunSonuHatirlaticiServisi — tarihli gun sonu tetikleri (issue #272 devami).
 *
 * Nobetciler:
 *   - eski DAILY kimligi (`gun_sonu_hatirlatici`) HER turda iptal edilir (goc);
 *   - ozel gundeki seri gunlerine tetik kurulmaz, digerleri kurulur;
 *   - plan ufku platforma gore (Android 7, iOS 3 — iOS 64 bekleyen siniri);
 *   - kapali ayar → yalniz iptal; konum yokken kurulu plan EZILMEZ;
 *   - TAM gune (kayit ∪ muhafiz kilinmisligi >= esik) tetik KURULMAZ; kayit
 *     degisince dinleyici yeniden planlar (iki yon: tamamlama + geri alma).
 *
 * jest'te `Platform.OS` varsayilani 'ios'tur (AGENTS.md) → platform ACIKCA ayarlanir.
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  gunSonuDinleyicisiniBaslat,
  gunSonuHatirlatmalariniGuncelle,
  type GunSonuAyarlari,
} from '../GunSonuHatirlaticiServisi';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { kayitDegistiDinleyicisiEkle, localNamazDurumunuGuncelle } from '../../../data/local/LocalNamazServisi';
import { GUN_SONU_GOVDE } from '../../../core/seri/gunSonuPlani';
import { gunEkle, tarihiISOFormatinaCevir } from '../../../core/utils/TarihYardimcisi';

type Istek = { identifier: string; content: { title: string; body: string }; trigger: { type: string; date: Date } };

const zamanla = Notifications.scheduleNotificationAsync as unknown as jest.Mock;
const iptal = Notifications.cancelScheduledNotificationAsync as unknown as jest.Mock;
const bekleyenler = Notifications.getAllScheduledNotificationsAsync as unknown as jest.Mock;

const AYAR: GunSonuAyarlari = {
  gunSonuBildirimAktif: true,
  gunSonuBildirimModu: 'otomatik',
  bildirimImsakOncesiDk: 30,
  bildirimSaati: 4,
  bildirimDakikasi: 0,
};

/** Her gun 05:00 imsak — enjekte saglayici (konum gerekmez). */
const imsak = (t: Date) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 5, 0);

/** Sabit "simdi": bugunun ogle vakti (sabit tarih YAZILMAZ — AGENTS.md). */
const ogle = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0);
};

const kurulanlar = (): Istek[] => zamanla.mock.calls.map((c) => c[0] as Istek);

beforeEach(async () => {
  jest.clearAllMocks();
  zamanla.mockResolvedValue('ok');
  iptal.mockResolvedValue(undefined);
  bekleyenler.mockResolvedValue([]);
  jest.replaceProperty(Platform, 'OS', 'android');
  await AsyncStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('gunSonuHatirlatmalariniGuncelle', () => {
  test('Android: 7 seri gunu icin AYRI tarihli (DATE) tetik, govde GUN_SONU_GOVDE', async () => {
    const simdi = ogle();
    await gunSonuHatirlatmalariniGuncelle(imsak, AYAR, simdi);

    const istekler = kurulanlar();
    expect(istekler).toHaveLength(7);
    const bugun = tarihiISOFormatinaCevir(simdi);
    istekler.forEach((istek, i) => {
      expect(istek.identifier).toBe(`gun_sonu_hatirlatici_${gunEkle(bugun, i)}`);
      expect(istek.trigger.type).toBe('date');
      expect([istek.trigger.date.getHours(), istek.trigger.date.getMinutes()]).toEqual([4, 30]);
      expect(istek.content.body).toBe(GUN_SONU_GOVDE);
    });
  });

  test('iOS: 3 gun (64 bekleyen bildirim butcesi muhafizla paylasilir)', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    await gunSonuHatirlatmalariniGuncelle(imsak, AYAR, ogle());
    expect(kurulanlar()).toHaveLength(3);
  });

  test('GOC: eski DAILY kimligi ve onceki tarihli tetikler iptal edilir', async () => {
    bekleyenler.mockResolvedValue([
      { identifier: 'gun_sonu_hatirlatici' },
      { identifier: 'gun_sonu_hatirlatici_2020-01-01' },
      { identifier: 'cuma_hatirlatma_2020-01-03' },
    ]);

    await gunSonuHatirlatmalariniGuncelle(imsak, AYAR, ogle());

    const iptalEdilenler = iptal.mock.calls.map((c) => c[0]);
    expect(iptalEdilenler).toEqual(
      expect.arrayContaining(['gun_sonu_hatirlatici', 'gun_sonu_hatirlatici_2020-01-01'])
    );
    // Baska sistemlerin bildirimine DOKUNULMAZ.
    expect(iptalEdilenler).not.toContain('cuma_hatirlatma_2020-01-03');
  });

  test('bekleyenler okunamasa bile eski DAILY kimligi iptal edilir', async () => {
    bekleyenler.mockRejectedValue(new Error('native'));
    await gunSonuHatirlatmalariniGuncelle(imsak, AYAR, ogle());
    expect(iptal).toHaveBeenCalledWith('gun_sonu_hatirlatici');
  });

  test('NOBETCI: ozel gundeki seri gunlerine tetik KURULMAZ, aralik disi kurulur', async () => {
    const simdi = ogle();
    const bugun = tarihiISOFormatinaCevir(simdi);
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI,
      JSON.stringify({
        ozelGunModuAktif: true,
        aktifOzelGun: { baslangicTarihi: gunEkle(bugun, 1), bitisTarihi: gunEkle(bugun, 3) },
        gecmisKayitlar: [],
      })
    );

    await gunSonuHatirlatmalariniGuncelle(imsak, AYAR, simdi);

    const kimlikler = kurulanlar().map((i) => i.identifier);
    expect(kimlikler).toEqual(
      [0, 4, 5, 6].map((g) => `gun_sonu_hatirlatici_${gunEkle(bugun, g)}`)
    );
  });

  test('ozel gun MODU kapaliyken aralik yok sayilir (kapi KAPALI)', async () => {
    const simdi = ogle();
    const bugun = tarihiISOFormatinaCevir(simdi);
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI,
      JSON.stringify({
        ozelGunModuAktif: false,
        aktifOzelGun: { baslangicTarihi: bugun, bitisTarihi: gunEkle(bugun, 9) },
        gecmisKayitlar: [],
      })
    );

    await gunSonuHatirlatmalariniGuncelle(imsak, AYAR, simdi);
    expect(kurulanlar()).toHaveLength(7);
  });

  test('ayar KAPALI: hicbir sey kurulmaz, bekleyenler iptal edilir', async () => {
    bekleyenler.mockResolvedValue([{ identifier: 'gun_sonu_hatirlatici_2020-01-01' }]);

    await gunSonuHatirlatmalariniGuncelle(imsak, { ...AYAR, gunSonuBildirimAktif: false }, ogle());

    expect(zamanla).not.toHaveBeenCalled();
    expect(iptal).toHaveBeenCalledWith('gun_sonu_hatirlatici');
    expect(iptal).toHaveBeenCalledWith('gun_sonu_hatirlatici_2020-01-01');
  });

  test('konum yokken KURULU tarihli plan 04:00 yedegiyle EZILMEZ', async () => {
    bekleyenler.mockResolvedValue([{ identifier: 'gun_sonu_hatirlatici_2099-01-01' }]);

    await gunSonuHatirlatmalariniGuncelle(null, AYAR, ogle());

    expect(zamanla).not.toHaveBeenCalled();
    expect(iptal).not.toHaveBeenCalled();
  });

  test('konum yok ve plan da yok: eski davranis — 04:00 yedegiyle kurulur', async () => {
    await gunSonuHatirlatmalariniGuncelle({ lat: 0, lng: 0 }, AYAR, ogle());

    const istekler = kurulanlar();
    expect(istekler.length).toBeGreaterThan(0);
    expect([istekler[0].trigger.date.getHours(), istekler[0].trigger.date.getMinutes()]).toEqual([4, 0]);
  });

  test('ayar verilmezse DISKTEN okunur (arka plan yolu — Redux yok)', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.SERI_AYARLARI,
      JSON.stringify({ gunSonuBildirimAktif: false })
    );

    await gunSonuHatirlatmalariniGuncelle(imsak, undefined, ogle());

    expect(zamanla).not.toHaveBeenCalled();
    expect(iptal).toHaveBeenCalledWith('gun_sonu_hatirlatici');
  });

  test('koordinatla cagrildiginda adhan ile hesaplar (Istanbul)', async () => {
    await gunSonuHatirlatmalariniGuncelle({ lat: 41.0082, lng: 28.9784 }, AYAR, ogle());
    const istekler = kurulanlar();
    expect(istekler).toHaveLength(7);
    // Imsak − 30 dk gece yarisi ile sabah arasinda bir yere duser.
    for (const i of istekler) {
      expect(i.trigger.date.getTime()).toBeGreaterThan(ogle().getTime());
    }
  });

  test('ASLA firlatmaz: tek tetigin planlama hatasi kalanlari dusurmez', async () => {
    zamanla.mockRejectedValueOnce(new Error('x'));
    await expect(gunSonuHatirlatmalariniGuncelle(imsak, AYAR, ogle())).resolves.toBeUndefined();
    expect(zamanla).toHaveBeenCalledTimes(7);
  });
});

const TUM_NAMAZLAR = [NamazAdi.Sabah, NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam, NamazAdi.Yatsi];

describe('TAM GUN — hatirlatma kurulmaz (persona calismasi 2026-10-19)', () => {
  afterEach(() => kayitDegistiDinleyicisiEkle('gunSonu', null));

  const bugunKimligi = () => `gun_sonu_hatirlatici_${tarihiISOFormatinaCevir(ogle())}`;

  test('NOBETCI: bugun bes vakit de isaretliyse bugunun tetigi YOK, digerleri kurulur', async () => {
    const bugun = tarihiISOFormatinaCevir(ogle());
    for (const ad of TUM_NAMAZLAR) await localNamazDurumunuGuncelle(bugun, ad, true);

    await gunSonuHatirlatmalariniGuncelle(imsak, AYAR, ogle());

    const kimlikler = kurulanlar().map((i) => i.identifier);
    expect(kimlikler).not.toContain(bugunKimligi());
    expect(kimlikler).toHaveLength(6); // ufuk kaymaz: 7 gunden yalniz bugun dustu
  });

  test('eksik gunde (4/5) tetik kurulur', async () => {
    const bugun = tarihiISOFormatinaCevir(ogle());
    for (const ad of TUM_NAMAZLAR.slice(0, 4)) await localNamazDurumunuGuncelle(bugun, ad, true);

    await gunSonuHatirlatmalariniGuncelle(imsak, AYAR, ogle());
    expect(kurulanlar().map((i) => i.identifier)).toContain(bugunKimligi());
  });

  test('kilinmislik = kayit ∪ muhafiz diski (biri eksik olsa da tam sayilir)', async () => {
    const bugun = tarihiISOFormatinaCevir(ogle());
    for (const ad of TUM_NAMAZLAR.slice(0, 3)) await localNamazDurumunuGuncelle(bugun, ad, true);
    await AsyncStorage.setItem(
      `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${bugun}`,
      JSON.stringify(['aksam', 'yatsi'])
    );

    await gunSonuHatirlatmalariniGuncelle(imsak, AYAR, ogle());
    expect(kurulanlar().map((i) => i.identifier)).not.toContain(bugunKimligi());
  });

  test('kullanicinin esigi (tamGunEsigi 3) uygulanir', async () => {
    const bugun = tarihiISOFormatinaCevir(ogle());
    for (const ad of TUM_NAMAZLAR.slice(0, 3)) await localNamazDurumunuGuncelle(bugun, ad, true);

    await gunSonuHatirlatmalariniGuncelle(imsak, { ...AYAR, tamGunEsigi: 3 }, ogle());
    expect(kurulanlar().map((i) => i.identifier)).not.toContain(bugunKimligi());
  });

  test('konum yokken plan korunur AMA tam gunun tetigi iptal edilir', async () => {
    const bugun = tarihiISOFormatinaCevir(ogle());
    for (const ad of TUM_NAMAZLAR) await localNamazDurumunuGuncelle(bugun, ad, true);
    const yarin = `gun_sonu_hatirlatici_${gunEkle(bugun, 1)}`;
    bekleyenler.mockResolvedValue([{ identifier: bugunKimligi() }, { identifier: yarin }]);

    await gunSonuHatirlatmalariniGuncelle(null, AYAR, ogle());

    expect(zamanla).not.toHaveBeenCalled();
    const iptalEdilenler = iptal.mock.calls.map((c) => c[0]);
    expect(iptalEdilenler).toEqual([bugunKimligi()]);
    expect(iptalEdilenler).not.toContain(yarin);
  });

  test('DINLEYICI: son vakit isaretlenince yeniden planlar (bugun duser), geri alininca geri gelir', async () => {
    const bugun = tarihiISOFormatinaCevir(ogle());
    // Dinleyici koordinati HAM depodan okur (headless'ta hesaplayici bos).
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI,
      JSON.stringify({ koordinatlar: { lat: 41.0082, lng: 28.9784 } })
    );
    for (const ad of TUM_NAMAZLAR.slice(0, 4)) await localNamazDurumunuGuncelle(bugun, ad, true);
    gunSonuDinleyicisiniBaslat();
    gunSonuDinleyicisiniBaslat(); // idempotent: adli yuva cogalmaz

    const bekle = async (kosul: () => boolean) => {
      for (let i = 0; i < 150 && !kosul(); i++) await new Promise((r) => setTimeout(r, 10));
    };
    const sonTur = () => {
      // Son turun kurulumlari: son iptal cagrisindan sonrakiler.
      return kurulanlar().map((i) => i.identifier);
    };
    const gunAnahtariVarMi = () => sonTur().some((k) => k.startsWith('gun_sonu_hatirlatici_'));

    zamanla.mockClear();
    await localNamazDurumunuGuncelle(bugun, NamazAdi.Yatsi, true);
    await bekle(gunAnahtariVarMi);
    // Dinleyici GERCEKTEN yeniden planladi (bos sonuc "hic kosmadi" ile karismasin).
    expect(gunAnahtariVarMi()).toBe(true);
    // Gercek takvim gunu (simdi = gercek saat) — bugunun kimligi yalniz gun tamamsa dusmeli.
    expect(sonTur().filter((k) => k.endsWith(bugun))).toEqual([]);

    zamanla.mockClear();
    await localNamazDurumunuGuncelle(bugun, NamazAdi.Yatsi, false);
    await bekle(gunAnahtariVarMi);
    expect(sonTur().some((k) => k.endsWith(bugun))).toBe(true);
  });
});
