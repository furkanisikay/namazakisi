/**
 * Gun sonu seri hatirlatmasi — TARIHLI tetiklerle planlama (issue #272 devami).
 *
 * Eskiden `seriSlice.seriAyarlariniGuncelle` tek bir gunluk tekrarli (DAILY)
 * bildirim kuruyordu; DAILY tetik tarih tasimadigi icin ozel gun kapisina
 * baglanamiyordu. Artik onumuzdeki birkac seri gunu icin AYRI tetikler kurulur
 * (`core/seri/gunSonuPlani`), ozel gun gunleri atlanir.
 *
 * Pencere sonlu oldugu icin TAZELENMEK ZORUNDA — cagiranlar:
 *   - `seriSlice.seriAyarlariniGuncelle` (ayar degisti)
 *   - `App.tsx` acilis zinciri
 *   - `KonumDegisikligiServisi.konumDegistiUygula` (imsak sehirle kayar; ozel gun
 *     degisikligi de `OzelGunDegisikligiServisi` uzerinden buradan gecer)
 *   - `ArkaplanGorevServisi` 15 dk gorevi (muhafiz erken donuslerinden ONCE)
 *   - yedekten geri yukleme (`yedeklemeSlice`)
 *
 * STORE'A BAGLI DEGILDIR: ayar verilmezse ham depolamadan okunur (arka planda
 * Redux yoktur). Imsak kaynagi koordinat (arka plan/headless) ya da hazir bir
 * saglayici (uygulama icinde hidrate edilmis hesaplayici) olabilir.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import {
  GUN_SONU_BASLIK,
  GUN_SONU_ESKI_ID,
  GUN_SONU_GOVDE,
  GUN_SONU_PLAN_GUN_SAYISI,
  gunSonuPlaniOlustur,
  type GunSonuPlanAyarlari,
  type GunSonuTetigi,
} from '../../core/seri/gunSonuPlani';
import type { ImsakSaglayici } from '../../core/seri/seriGunSonu';
import { localSeriAyarlariniGetir } from '../../data/local/LocalSeriServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { koordinattanImsakSaglayici } from './SeriSayacHazirlayici';

/** Planin okudugu ayarlar (`SeriAyarlari` ile yapisal uyumlu). */
export interface GunSonuAyarlari extends GunSonuPlanAyarlari {
  gunSonuBildirimAktif: boolean;
}

/**
 * Imsak kaynagi: koordinat ya da hazir saglayici. `null` / `{0,0}` = konum yok.
 */
export type GunSonuImsakKaynagi = { lat: number; lng: number } | ImsakSaglayici | null;

/** Kaynagi saglayiciya cevirir; konum yoksa `null`. */
function saglayiciyaCevir(kaynak: GunSonuImsakKaynagi): ImsakSaglayici | null {
  if (!kaynak) return null;
  if (typeof kaynak === 'function') return kaynak;
  if (!Number.isFinite(kaynak.lat) || !Number.isFinite(kaynak.lng)) return null;
  if (kaynak.lat === 0 && kaynak.lng === 0) return null;
  return koordinattanImsakSaglayici(kaynak);
}

/** Bu servise ait bekleyen bildirim mi? (eski DAILY + tarihli tetikler) */
const bizimMi = (kimlik: string): boolean => kimlik.startsWith(GUN_SONU_ESKI_ID);

/** Platforma gore plan ufku (bkz. `GUN_SONU_PLAN_GUN_SAYISI`). */
export function gunSonuPlanGunSayisi(): number {
  return Platform.OS === 'ios' ? GUN_SONU_PLAN_GUN_SAYISI.ios : GUN_SONU_PLAN_GUN_SAYISI.android;
}

/**
 * Suren planlama. Bes cagiran ayni anda tetikleyebilir ve islem "temizle →
 * N planla" seklinde cok adimlidir; ic ice girerse eski ayarla planlayan tur
 * sonuncu olabilir (cuma servisiyle ayni gerekce). Turlar SIRAYA dizilir.
 */
let surenPlanlama: Promise<void> | null = null;

/**
 * Gun sonu hatirlatmalarini yeniden planlar. ASLA firlatmaz.
 *
 * @param imsakKaynagi Koordinat ya da saglayici (otomatik mod icin).
 * @param ayarlar Verilmezse diskten okunur (arka plan yolu).
 */
export async function gunSonuHatirlatmalariniGuncelle(
  imsakKaynagi: GunSonuImsakKaynagi,
  ayarlar?: GunSonuAyarlari,
  simdi: Date = new Date()
): Promise<void> {
  const onceki = surenPlanlama ?? Promise.resolve();
  const bu = onceki
    .catch(() => { /* onceki turun hatasi bu turu dusurmez */ })
    .then(() => planlamayiCalistir(imsakKaynagi, ayarlar, simdi));

  surenPlanlama = bu;
  try {
    await bu;
  } catch (error) {
    Logger.error('GunSonuHatirlatici', 'Planlama basarisiz', error);
  } finally {
    if (surenPlanlama === bu) surenPlanlama = null;
  }
}

async function ayarlariOku(): Promise<GunSonuAyarlari | null> {
  const yanit = await localSeriAyarlariniGetir();
  return yanit.basarili && yanit.veri ? yanit.veri : null;
}

async function bekleyenKimlikleriOku(): Promise<string[] | null> {
  try {
    const tumu = await Notifications.getAllScheduledNotificationsAsync();
    return tumu.map((b) => b.identifier).filter(bizimMi);
  } catch (error) {
    Logger.warn('GunSonuHatirlatici', 'Bekleyen bildirimler okunamadi', error);
    return null;
  }
}

async function iptalEt(kimlikler: string[]): Promise<void> {
  // Eski DAILY kimligi her turda KOSULSUZ iptal edilir (gocun kendisi budur):
  // bekleyenler okunamasa bile bir daha gelmesin. Var olmayan kimligi iptal
  // etmek zararsizdir.
  const tumu = new Set([GUN_SONU_ESKI_ID, ...kimlikler]);
  for (const kimlik of tumu) {
    try {
      await Notifications.cancelScheduledNotificationAsync(kimlik);
    } catch (error) {
      Logger.warn('GunSonuHatirlatici', `Iptal edilemedi: ${kimlik}`, error);
    }
  }
}

async function tetikPlanla(tetik: GunSonuTetigi): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: tetik.kimlik,
      content: {
        title: GUN_SONU_BASLIK,
        body: GUN_SONU_GOVDE,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: tetik.an,
      },
    });
  } catch (error) {
    // Tek bir gunun planlamasi patlarsa KALANLAR yine kurulmali.
    Logger.error('GunSonuHatirlatici', 'Bildirim planlanamadi', error);
  }
}

async function planlamayiCalistir(
  imsakKaynagi: GunSonuImsakKaynagi,
  verilenAyarlar: GunSonuAyarlari | undefined,
  simdi: Date
): Promise<void> {
  const ayarlar = verilenAyarlar ?? (await ayarlariOku());
  if (!ayarlar) {
    // Ayar okunamadi: kurulu plani korumak, silip hicbir sey koymamaktan iyidir.
    Logger.warn('GunSonuHatirlatici', 'Seri ayarlari okunamadi, mevcut plan korunuyor');
    return;
  }

  const bekleyenler = await bekleyenKimlikleriOku();

  if (!ayarlar.gunSonuBildirimAktif) {
    await iptalEt(bekleyenler ?? []);
    return;
  }

  const saglayici = saglayiciyaCevir(imsakKaynagi);

  // Otomatik modda konum yoksa ve zaten TARIHLI bir plan kuruluysa onu koru:
  // gecici bir koordinat okuma hatasi (headless yol) imsak-temelli dogru plani
  // 04:00 fallback'iyle EZMEMELI. Plan yoksa (ilk kurulum / eski DAILY) fallback'le kur.
  if (
    !saglayici &&
    ayarlar.gunSonuBildirimModu !== 'sabit' &&
    (bekleyenler ?? []).some((k) => k !== GUN_SONU_ESKI_ID)
  ) {
    Logger.info('GunSonuHatirlatici', 'Konum yok, mevcut plan korunuyor');
    return;
  }

  const ozelGundeMi = await ozelGunSuzgeciniOku();
  const plan = gunSonuPlaniOlustur({
    simdi,
    ayarlar,
    imsakSaglayici: saglayici ?? (() => null),
    gunSayisi: gunSonuPlanGunSayisi(),
    gunAtlanirMi: ozelGundeMi,
  });

  await iptalEt(bekleyenler ?? []);
  for (const tetik of plan) {
    await tetikPlanla(tetik);
  }
}
