/**
 * `DurumNotu.eylem` → gerçek sistem çağrısı (tek eşleme tablosu). Asla fırlatmaz.
 *
 * Native modüller TEMBEL yüklenir (`CihazDurumOkuyucu` ile aynı gerekçe). İzin istekleri
 * yalnız tekrar sorulabilen izinde anlamlıdır; kalıcı red satırı zaten `uygulamaAyarlari`
 * eylemini taşır (`core/cihaz/durumNotlari.izinNotu`).
 *
 * Sonuç: `true` = ekran/diyalog açıldı (dönüşte durum yeniden okunmalı), `false` = açılamadı.
 */
import { Linking, Platform } from 'react-native';
import type { DurumEylemi } from '../../core/cihaz/durumNotlari';

/** Android TTS verisi indirme ekranı (`TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA`). */
export const TTS_INDIRME_NIYETI = 'android.speech.tts.engine.INSTALL_TTS_DATA';
/** Android ses ayarları (alarm ses düzeyi). */
export const SES_AYARLARI_NIYETI = 'android.settings.SOUND_SETTINGS';

async function ayarlariAc(): Promise<boolean> {
    try {
        await Linking.openSettings();
        return true;
    } catch {
        return false;
    }
}

/** Niyet açılamazsa uygulama ayarlarına düşülür (`BileklikRehberKarti` deseni). */
async function niyetAc(niyet: string): Promise<boolean> {
    if (Platform.OS !== 'android') return ayarlariAc();
    try {
        await Linking.sendIntent(niyet);
        return true;
    } catch {
        return ayarlariAc();
    }
}

const kopru = () =>
    require('../../../modules/expo-countdown-notification/src') as typeof import('../../../modules/expo-countdown-notification/src');

const EYLEMLER: Record<DurumEylemi, () => Promise<boolean>> = {
    bildirimIzni: async () => {
        const N = require('expo-notifications') as typeof import('expo-notifications');
        await N.requestPermissionsAsync();
        return true;
    },
    konumIzni: async () => {
        const L = require('expo-location') as typeof import('expo-location');
        await L.requestForegroundPermissionsAsync();
        return true;
    },
    takvimIzni: async () => {
        const C = require('expo-calendar/legacy') as typeof import('expo-calendar/legacy');
        await C.requestCalendarPermissionsAsync();
        return true;
    },
    tamAlarm: async () => {
        const { alarmIzniAyariniAc } = require('./SistemDurumuOkuyucu') as typeof import('./SistemDurumuOkuyucu');
        await alarmIzniAyariniAc();
        return true;
    },
    tamEkran: async () => {
        const { tamEkranAyariniAc } = require('./MuhafizAlarmKoprusu') as typeof import('./MuhafizAlarmKoprusu');
        return tamEkranAyariniAc();
    },
    pil: async () => {
        const { pilAyarlariniAc } = require('./SistemDurumuOkuyucu') as typeof import('./SistemDurumuOkuyucu');
        return (await pilAyarlariniAc()) !== null;
    },
    dnd: async () => {
        const cami = require('../../../modules/expo-cami-geofence/src') as typeof import('../../../modules/expo-cami-geofence/src');
        return (await cami.erisimAyariniAc()) !== 'acilamadi';
    },
    uygulamaAyarlari: ayarlariAc,
    ttsIndir: () => niyetAc(TTS_INDIRME_NIYETI),
    alarmIzni: async () => {
        const a = require('../../../modules/expo-muhafiz-alarmkit/src') as typeof import('../../../modules/expo-muhafiz-alarmkit/src');
        await a.alarmKitIzniIste();
        return true;
    },
    sesAyarlari: () => niyetAc(SES_AYARLARI_NIYETI),
    canliGuncellemeAyari: async () => {
        if (Platform.OS !== 'android') return ayarlariAc();
        return (await kopru().canliAyarlariniAc()) !== null || ayarlariAc();
    },
};

export async function durumEylemiUygula(eylem: DurumEylemi): Promise<boolean> {
    try {
        return await EYLEMLER[eylem]();
    } catch {
        return false;
    }
}
