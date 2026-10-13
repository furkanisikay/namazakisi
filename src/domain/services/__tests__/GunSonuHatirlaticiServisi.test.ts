/**
 * GunSonuHatirlaticiServisi — tarihli gun sonu tetikleri (issue #272 devami).
 *
 * Nobetciler:
 *   - eski DAILY kimligi (`gun_sonu_hatirlatici`) HER turda iptal edilir (goc);
 *   - ozel gundeki seri gunlerine tetik kurulmaz, digerleri kurulur;
 *   - plan ufku platforma gore (Android 7, iOS 3 — iOS 64 bekleyen siniri);
 *   - kapali ayar → yalniz iptal; konum yokken kurulu plan EZILMEZ.
 *
 * jest'te `Platform.OS` varsayilani 'ios'tur (AGENTS.md) → platform ACIKCA ayarlanir.
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { gunSonuHatirlatmalariniGuncelle, type GunSonuAyarlari } from '../GunSonuHatirlaticiServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
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
  test('Android: 7 seri gunu icin AYRI tarihli (DATE) tetik, metin birebir eskisi', async () => {
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
