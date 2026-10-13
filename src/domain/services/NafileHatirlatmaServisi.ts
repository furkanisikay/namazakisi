import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { LocalNafileServisi, nafileHatirlatmaAcikMi } from '../../data/local/LocalNafileServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { koordinatGecerliMi, type NafileKoordinat } from '../../core/nafile/gunVakitleri';
import {
    NAFILE_ID_ONEKI,
    nafilePlaniOlustur,
    nafilePlanSecenekleri,
    type NafileBildirimPlani,
} from '../../core/nafile/nafilePlani';

/**
 * Plan üretici SAF modüle taşındı (`core/nafile/nafilePlani.ts`): bildirim
 * defteri (issue #298) aynı fonksiyonu kuru çalıştırır. Geriye uyumluluk için
 * buradan yeniden dışa aktarılır.
 */
export { NAFILE_ID_ONEKI, nafilePlaniOlustur, type NafileBildirimPlani } from '../../core/nafile/nafilePlani';

/**
 * Nafile namaz hatırlatmaları (issue #77).
 *
 * KOORDİNAT PARAMETREDİR (cuma dersi): `NamazVaktiHesaplayiciServisi` bellek-içidir,
 * headless arka plan görevinde boştur → servis sessizce hiçbir şey planlamazdı.
 *
 * Gece yarısı: gece yarısından sonra (aktif gün = dün) DÜNÜN gecesinin teheccüd
 * hedefi hâlâ gelecektedir → geceler dünden başlayarak taranır.
 */
export class NafileHatirlatmaServisi {
    private static instance: NafileHatirlatmaServisi;

    /** Süren planlama: "temizle → planla" çok adımlı; iç içe girerse plan ayrışır (cuma deseni). */
    private surenPlanlama: Promise<void> | null = null;

    private constructor() { }

    public static getInstance(): NafileHatirlatmaServisi {
        if (!NafileHatirlatmaServisi.instance) {
            NafileHatirlatmaServisi.instance = new NafileHatirlatmaServisi();
        }
        return NafileHatirlatmaServisi.instance;
    }

    public async hatirlatmalariGuncelle(koordinatlar: NafileKoordinat | null): Promise<void> {
        const onceki = this.surenPlanlama ?? Promise.resolve();
        const bu = onceki
            .catch(() => { /* önceki turun hatası bu turu düşürmez */ })
            .then(() => this.planlamayiCalistir(koordinatlar));
        this.surenPlanlama = bu;
        try {
            await bu;
        } finally {
            if (this.surenPlanlama === bu) this.surenPlanlama = null;
        }
    }

    private async planlamayiCalistir(koordinatlar: NafileKoordinat | null): Promise<void> {
        const ayarlar = await LocalNafileServisi.getAyarlar();

        if (!nafileHatirlatmaAcikMi(ayarlar)) {
            await this.mevcutlariTemizle();
            return;
        }

        // TEMİZLİKTEN ÖNCE: koordinat geçici olarak okunamazsa kurulu planı silip
        // yerine hiçbir şey koymamak, plansızlıktan kötüdür (cuma dersi).
        if (!koordinatGecerliMi(koordinatlar)) {
            Logger.warn('NafileHatirlatma', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        if (ayarlar.teheccud.aktif && ayarlar.teheccud.uyandirma) {
            await this.uyandirmaKanaliniGarantile();
        }

        await this.mevcutlariTemizle();

        // Özel gün (issue #272): aralıktaki günlerin (ve gecelerinin) nafile
        // hatırlatmaları kurulmaz; eski plan az önce temizlendi.
        const ozelGundeMi = await ozelGunSuzgeciniOku();

        const simdi = new Date();
        const secenekler = nafilePlanSecenekleri(ayarlar);
        for (const plan of nafilePlaniOlustur(koordinatlar, ayarlar, simdi, bugunuAl(), ozelGundeMi, secenekler)) {
            await this.planla(plan);
        }
    }

    private async planla(plan: NafileBildirimPlani): Promise<void> {
        try {
            const uyandirma = plan.uyandirma;
            await Notifications.scheduleNotificationAsync({
                identifier: plan.id,
                content: {
                    title: plan.baslik,
                    body: plan.govde,
                    sound: Platform.OS === 'ios' ? 'bildirim.wav' : true,
                    // iOS: uyandırma Odak'ı deler (sessiz anahtarı DELMEZ — ekranda söylenir).
                    ...(uyandirma ? { interruptionLevel: 'timeSensitive' as const } : {}),
                    data: { tip: 'nafile', tur: plan.tur },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: plan.zaman,
                    channelId: uyandirma
                        ? BILDIRIM_SABITLERI.KANALLAR.NAFILE_UYANDIRMA
                        : BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                },
            });
        } catch (e) {
            // Tek bir bildirim patlarsa kalanlar yine kurulmalı.
            Logger.error('NafileHatirlatma', 'Planlama hatasi', e);
        }
    }

    /**
     * Uyandırma kanalını YOKSA oluşturur — planlamadan ÖNCE (arka plan yolu
     * `BildirimServisi.izinIste`'den geçmez; kanal yoksa Android 8+ bildirimi hiç
     * göstermez). Mevcut kanala dokunulmaz: ses/önem oluşturulduktan sonra
     * değiştirilemez, kullanıcının tercihi orada yaşar.
     */
    private async uyandirmaKanaliniGarantile(): Promise<void> {
        if (Platform.OS !== 'android') return;
        try {
            const kanalId = BILDIRIM_SABITLERI.KANALLAR.NAFILE_UYANDIRMA;
            const mevcut = await Notifications.getNotificationChannelAsync(kanalId);
            if (mevcut) return;
            await Notifications.setNotificationChannelAsync(kanalId, {
                name: 'Teheccüd Uyandırması',
                description: 'Gece namazı için uyandırır; sessiz modda da çalar',
                importance: Notifications.AndroidImportance.MAX,
                sound: 'bildirim.mp3',
                audioAttributes: {
                    usage: Notifications.AndroidAudioUsage.ALARM,
                    contentType: Notifications.AndroidAudioContentType.SONIFICATION,
                },
                vibrationPattern: [0, 1000, 500, 1000, 500, 1000],
                enableVibrate: true,
                bypassDnd: true,
            });
        } catch (e) {
            Logger.error('NafileHatirlatma', 'Uyandirma kanali olusturulamadi', e);
        }
    }

    private async mevcutlariTemizle(): Promise<void> {
        try {
            const tumu = await Notifications.getAllScheduledNotificationsAsync();
            for (const b of tumu) {
                if (b.identifier.startsWith(NAFILE_ID_ONEKI)) {
                    await Notifications.cancelScheduledNotificationAsync(b.identifier);
                }
            }
        } catch (e) {
            Logger.error('NafileHatirlatma', 'Temizlik hatasi', e);
        }
    }
}
