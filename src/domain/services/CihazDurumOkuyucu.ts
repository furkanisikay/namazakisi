/**
 * Cihaz/sistem durumunun TEK okuma noktası — salt okur, izin İSTEMEZ, asla fırlatmaz.
 *
 * `usePlatformYetenekleri`, `useSistemDurumu`, `useTurkceTtsDestegi`, Now Bar'ın
 * `useCanliDurum`u aynı soruları ayrı ayrı soruyordu; yeni ekranlar burayı kullanır
 * (`useCihazDurumu`). Her alan bağımsız okunur: biri patlarsa yalnız o alan `null`
 * (bilinmiyor) olur ve ekran o konuda SUSAR.
 *
 * TEMBEL YÜKLEME ZORUNLU: her okuyucu kendi native modülünü fonksiyon İÇİNDE
 * `require` eder. Bu dosyada tek bir statik native import (expo-location, notifee,
 * köprü), kancayı kullanan HER ekran testini `requireNativeModule` tuzağına düşürürdü.
 */
import { NativeModules, Platform } from 'react-native';
import {
    BOS_CIHAZ_DURUMU,
    type CanliGuncellemeDurumu,
    type CihazDurumu,
    type EsliSaatDurumu,
    type IzinDurumu,
} from '../../core/cihaz/durumNotlari';
import { isletimSistemiSurumu, type IsletimSistemiSurumu } from '../../core/cihaz/surum';

export type CihazAlani = keyof CihazDurumu;

export const TUM_CIHAZ_ALANLARI: readonly CihazAlani[] = Object.keys(BOS_CIHAZ_DURUMU) as CihazAlani[];

const android = (): boolean => Platform.OS === 'android';
const ios = (): boolean => Platform.OS === 'ios';

const kopru = () =>
    require('../../../modules/expo-countdown-notification/src') as typeof import('../../../modules/expo-countdown-notification/src');

/** `{ status, canAskAgain }` → üç durumlu izin. */
export function izinCoz(ham: { status?: unknown; granted?: unknown; canAskAgain?: unknown } | null | undefined): IzinDurumu | null {
    if (!ham) return null;
    if (ham.granted === true || ham.status === 'granted') return 'verildi';
    if (ham.status === 'denied' || ham.status === 'undetermined') {
        return ham.canAskAgain === false ? 'reddedildi' : 'sorulabilir';
    }
    return null;
}

/** Sürüm SENKRON okunur (Platform.Version); Android 16+'da QPR ayrımı native'den. */
export function surumuOku(): IsletimSistemiSurumu | null {
    let tam: number | null = null;
    if (android()) {
        try {
            tam = kopru().androidTamSurum();
        } catch {
            tam = null;
        }
    }
    try {
        return isletimSistemiSurumu(Platform.OS, Platform.Version, tam);
    } catch {
        return null;
    }
}

type Okuyucu<K extends CihazAlani> = () => Promise<CihazDurumu[K]> | CihazDurumu[K];

const OKUYUCULAR: { [K in CihazAlani]: Okuyucu<K> } = {
    surum: surumuOku,
    samsung: () => {
        if (ios()) return false;
        if (!android()) return null;
        return kopru().samsungMu();
    },
    bildirimIzni: async () => {
        const N = require('expo-notifications') as typeof import('expo-notifications');
        return izinCoz(await N.getPermissionsAsync());
    },
    konumIzni: async () => {
        const L = require('expo-location') as typeof import('expo-location');
        return izinCoz(await L.getForegroundPermissionsAsync());
    },
    takvimIzni: async () => {
        const C = require('expo-calendar/legacy') as typeof import('expo-calendar/legacy');
        return izinCoz(await C.getCalendarPermissionsAsync());
    },
    tamAlarm: async () => {
        if (!android()) return null;
        const { tamAlarmDurumunuOku } =
            require('./SistemDurumuOkuyucu') as typeof import('./SistemDurumuOkuyucu');
        const d = await tamAlarmDurumunuOku();
        return d === 'verildi' ? true : d === 'reddedildi' ? false : null;
    },
    tamEkran: async () => {
        if (!android()) return null;
        const { tamEkranIzniVarMi } = require('./MuhafizAlarmKoprusu') as typeof import('./MuhafizAlarmKoprusu');
        return tamEkranIzniVarMi();
    },
    pilMuaf: async () => {
        if (!android()) return null;
        const { pilDurumunuOku } = require('./SistemDurumuOkuyucu') as typeof import('./SistemDurumuOkuyucu');
        return (await pilDurumunuOku()).muaf;
    },
    dndErisimi: async () => {
        if (!android()) return null;
        const cami = require('../../../modules/expo-cami-geofence/src') as typeof import('../../../modules/expo-cami-geofence/src');
        const d = await cami.namazModuDurumu();
        return typeof d?.erisim === 'boolean' ? d.erisim : null;
    },
    alarmKit: async () => {
        if (!ios()) return null;
        const a = require('../../../modules/expo-muhafiz-alarmkit/src') as typeof import('../../../modules/expo-muhafiz-alarmkit/src');
        return a.alarmKitDurumu();
    },
    canliGuncelleme: async (): Promise<CanliGuncellemeDurumu | null> => {
        if (android()) return kopru().canliDurumu();
        if (!ios()) return null;
        const s = require('../../../modules/expo-siri-kisayollari/src') as typeof import('../../../modules/expo-siri-kisayollari/src');
        const izin = await s.canliEtkinlikIzniAcik();
        return izin === true ? 'acik' : izin === false ? 'kapali' : null;
    },
    turkceTts: async () => {
        if (android()) return kopru().trDestekleniyorMu();
        if (!ios()) return null;
        const a = require('../../../modules/expo-muhafiz-anons/src') as typeof import('../../../modules/expo-muhafiz-anons/src');
        if (!a.anonsModuluVarMi()) return null;
        return (await a.trSesTanimlayici()) !== null;
    },
    esliSaat: async (): Promise<EsliSaatDurumu | null> => {
        if (!android()) return null;
        const m = NativeModules.WearSenkron as { esliSaatDurumu?: () => Promise<unknown> } | undefined;
        if (!m?.esliSaatDurumu) return null;
        const d = await m.esliSaatDurumu();
        return d === 'esli' || d === 'esliDegil' || d === 'yok' ? d : null;
    },
    alarmSesiAcik: () => (android() ? kopru().alarmSesiAcikMi() : null),
    widgetEkli: async () => {
        if (!android()) return null;
        const m = NativeModules.WidgetVeri as { widgetEkliMi?: () => Promise<unknown> } | undefined;
        if (!m?.widgetEkliMi) return null;
        const d = await m.widgetEkliMi();
        return typeof d === 'boolean' ? d : null;
    },
    mentese: () => {
        if (ios()) return false;
        if (!android()) return null;
        const k = require('../../../modules/expo-katlanma-posturu/src') as typeof import('../../../modules/expo-katlanma-posturu/src');
        return k.menteseVarMi();
    },
};

/** Tek alanı okur; her hata `null` (bilinmiyor). */
export async function alaniOku<K extends CihazAlani>(alan: K): Promise<CihazDurumu[K]> {
    try {
        const deger = await OKUYUCULAR[alan]();
        return (deger ?? null) as CihazDurumu[K];
    } catch {
        return null as CihazDurumu[K];
    }
}

/** İstenen alanları paralel okur; istenmeyen alanlar `null` kalır. */
export async function cihazDurumunuOku(alanlar: readonly CihazAlani[] = TUM_CIHAZ_ALANLARI): Promise<CihazDurumu> {
    const sonuc: CihazDurumu = { ...BOS_CIHAZ_DURUMU };
    const degerler = await Promise.all(alanlar.map((a) => alaniOku(a)));
    alanlar.forEach((a, i) => {
        (sonuc as unknown as Record<string, unknown>)[a] = degerler[i];
    });
    return sonuc;
}
