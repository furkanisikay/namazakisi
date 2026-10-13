import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import {
    CAMIYE_GIT_ID_ONEKI,
    CAMIYE_GIT_PLAN_GUN_SAYISI,
    camiyeGitMetniOlustur,
    camiyeGitPlaniOlustur,
    type CamiyeGitPlanKaydi,
} from '../../core/bildirim/camiyeGitPlani';
import type { CamiyeGitAyarlari } from '../../core/camiyeGit/camiyeGitAyarlari';
import { LocalCamiyeGitServisi } from '../../data/local/LocalCamiyeGitServisi';
import { LocalCumaHatirlatmaServisi } from '../../data/local/LocalCumaHatirlatmaServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';

export interface CamiyeGitKoordinat {
    lat: number;
    lng: number;
}

/**
 * "Camide kılacağım" hatırlatması (issue #292) — cuma servisinin (#173) deseni.
 *
 * KOORDİNAT PARAMETREDİR (`NamazVaktiHesaplayiciServisi.getKonfig()`'ten
 * okunmaz): o konfig bellek-içidir, arka plan görevinde kurulu olmayabilir.
 * Plan SAF üreticiden gelir (`core/bildirim/camiyeGitPlani.ts`) — bildirim
 * defteri aynı listeyi sayar. Native köprü İMPORT ETMEZ (Camideyim tahmini
 * yalnız ekranda yapılır); böylece bu servisi yükleyen testler köprü mock'lamaz.
 */
export class CamiyeGitHatirlatmaServisi {
    private static instance: CamiyeGitHatirlatmaServisi;

    /** Süren planlama (cuma ile aynı gerekçe: "temizle → planla" çok adımlı, iç içe girmesin). */
    private surenPlanlama: Promise<void> | null = null;

    private constructor() { }

    public static getInstance(): CamiyeGitHatirlatmaServisi {
        if (!CamiyeGitHatirlatmaServisi.instance) {
            CamiyeGitHatirlatmaServisi.instance = new CamiyeGitHatirlatmaServisi();
        }
        return CamiyeGitHatirlatmaServisi.instance;
    }

    public async hatirlatmalariGuncelle(koordinatlar: CamiyeGitKoordinat | null): Promise<void> {
        const onceki = this.surenPlanlama ?? Promise.resolve();
        const bu = onceki
            .catch(() => { /* onceki turun hatasi bu turu dusurmez */ })
            .then(() => this.planlamayiCalistir(koordinatlar));

        this.surenPlanlama = bu;
        try {
            await bu;
        } finally {
            if (this.surenPlanlama === bu) this.surenPlanlama = null;
        }
    }

    private async planlamayiCalistir(koordinatlar: CamiyeGitKoordinat | null): Promise<void> {
        const ayarlar = await LocalCamiyeGitServisi.getAyarlar();

        if (!ayarlar.aktif) {
            await this.mevcutlariTemizle();
            return;
        }

        // (0,0) = konum yüklenmemiş. TEMİZLİKTEN ÖNCE kontrol: bayat plan plansızlıktan iyidir.
        if (!koordinatlar || (koordinatlar.lat === 0 && koordinatlar.lng === 0)) {
            Logger.warn('CamiyeGit', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        await this.mevcutlariTemizle();

        const [ozelGundeMi, cuma] = await Promise.all([
            ozelGunSuzgeciniOku(),
            LocalCumaHatirlatmaServisi.getAyarlar(),
        ]);
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        const plan = camiyeGitPlaniOlustur(koordinatlar, ayarlar, new Date(), {
            gunSayisi: CAMIYE_GIT_PLAN_GUN_SAYISI[platform],
            gunAtlanirMi: ozelGundeMi,
            cumaHatirlatmasiAcik: cuma.aktif,
        });
        for (const kayit of plan) {
            await this.tekHatirlatmaPlanla(kayit, ayarlar);
        }
    }

    private async tekHatirlatmaPlanla(kayit: CamiyeGitPlanKaydi, ayarlar: CamiyeGitAyarlari): Promise<void> {
        const { baslik, govde } = camiyeGitMetniOlustur(kayit.vakit, ayarlar);
        try {
            await Notifications.scheduleNotificationAsync({
                identifier: kayit.id,
                content: {
                    title: baslik,
                    body: govde,
                    sound: true,
                    data: { tip: 'camiye_git', vakit: kayit.vakit, tarih: kayit.tarih },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: kayit.zaman,
                    // Yeni kanal AÇILMAZ — vakit bildirimi kanalı.
                    channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                },
            });
        } catch (e) {
            // Tek bir hatırlatma patlarsa KALANLAR yine kurulmalı.
            Logger.error('CamiyeGit', 'Planlama hatasi', e);
        }
    }

    private async mevcutlariTemizle(): Promise<void> {
        try {
            const tumu = await Notifications.getAllScheduledNotificationsAsync();
            for (const b of tumu) {
                if (b.identifier.startsWith(CAMIYE_GIT_ID_ONEKI)) {
                    await Notifications.cancelScheduledNotificationAsync(b.identifier);
                }
            }
        } catch (e) {
            Logger.error('CamiyeGit', 'Temizlik hatasi', e);
        }
    }
}
