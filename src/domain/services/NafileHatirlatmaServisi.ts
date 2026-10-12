import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { LocalNafileServisi, nafileHatirlatmaAcikMi } from '../../data/local/LocalNafileServisi';
import { gununNafilePencereleri, koordinatGecerliMi, type NafileKoordinat } from '../../core/nafile/gunVakitleri';
import { teheccudHedefZamani, type NafilePencere } from '../../core/nafile/nafileVakitleri';
import { nafileBildirimMetni } from '../../core/nafile/nafileMetinleri';
import type { NafileAyarlari, NafileTuru } from '../../core/nafile/nafileTipleri';

/** Bildirim id öneki — temizlik bu önekle SÜZER, başka sistemlere dokunmaz. */
export const NAFILE_ID_ONEKI = 'nafile_';

/**
 * Kaç gün ileri planlanır.
 * - Gündüz nafileleri: bugün + 2 (vakit bildirimlerinden geniş; uygulama 3 gün
 *   açılmasa da sürer).
 * - Teheccüd: 7 gece — bir "uyandırma"dır; OEM arka plan görevini öldürürse
 *   3 günde sessizce biterdi (cuma'nın 4 hafta planlamasıyla aynı gerekçe).
 * iOS 64 bekleyen bildirim bütçesine en fazla 2×3 + 2×7 = 20 girer.
 */
const GUNDUZ_GUN_SAYISI = 3;
const TEHECCUD_GECE_SAYISI = 7;

/** Uyandırma açıkken ikinci hatırlatmanın gecikmesi (tek 2,4 sn'lik ses alarm beklentisini karşılamaz). */
const UYANDIRMA_TEKRAR_DK = 3;

const DK = 60 * 1000;

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

        const simdi = new Date();
        for (const plan of nafilePlaniOlustur(koordinatlar, ayarlar, simdi, bugunuAl())) {
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

export interface NafileBildirimPlani {
    id: string;
    tur: NafileTuru;
    zaman: Date;
    baslik: string;
    govde: string;
    uyandirma: boolean;
}

/**
 * SAF plan üretici — hangi nafile bildirimi hangi anda, hangi metinle gidecek.
 * `bugunIso` ve `simdi` ENJEKTE edilir (testte sabit tarih yazılmaz).
 */
export function nafilePlaniOlustur(
    koordinat: NafileKoordinat,
    ayarlar: NafileAyarlari,
    simdi: Date,
    bugunIso: string
): NafileBildirimPlani[] {
    const planlar: NafileBildirimPlani[] = [];
    const gelecekMi = (z: Date) => z.getTime() > simdi.getTime();

    // Dün (gece yarısı sonrası teheccüd) → bugün + TEHECCUD_GECE_SAYISI - 1
    for (let i = -1; i < TEHECCUD_GECE_SAYISI; i++) {
        const iso = gunEkle(bugunIso, i);
        let pencereler: NafilePencere[];
        try {
            pencereler = gununNafilePencereleri(koordinat, iso);
        } catch (e) {
            Logger.warn('NafileHatirlatma', `Pencere hesaplanamadi: ${iso}`, e);
            continue;
        }

        for (const p of pencereler) {
            if (p.tur === 'teheccud') {
                const t = ayarlar.teheccud;
                if (!t.aktif) continue;
                const zaman = teheccudHedefZamani(p, t.hedef, t.imsaktanOnceDk);
                const metin = nafileBildirimMetni({
                    tur: 'teheccud',
                    son: p.bitis,
                    teheccudHedefi: t.hedef,
                    imsaktanOnceDk: Math.round((p.bitis.getTime() - zaman.getTime()) / DK),
                    uyandirma: t.uyandirma,
                });
                if (gelecekMi(zaman)) {
                    planlar.push({ id: `${NAFILE_ID_ONEKI}${iso}_teheccud`, tur: 'teheccud', zaman, ...metin, uyandirma: t.uyandirma });
                }
                if (t.uyandirma) {
                    const ikinci = new Date(zaman.getTime() + UYANDIRMA_TEKRAR_DK * DK);
                    if (gelecekMi(ikinci) && ikinci.getTime() < p.bitis.getTime()) {
                        planlar.push({ id: `${NAFILE_ID_ONEKI}${iso}_teheccud_2`, tur: 'teheccud', zaman: ikinci, ...metin, uyandirma: true });
                    }
                }
                continue;
            }

            // Gündüz nafileleri yalnız bugün + 2 gün.
            if (i < 0 || i >= GUNDUZ_GUN_SAYISI) continue;
            const ayar = ayarlar.hatirlatmalar[p.tur];
            if (!ayar.aktif) continue;
            const zaman = new Date(p.baslangic.getTime() + ayar.ofsetDk * DK);
            // Ofset pencereyi aşarsa (kısa kış kuşluğu) o gün planlanmaz.
            if (zaman.getTime() >= p.bitis.getTime() || !gelecekMi(zaman)) continue;
            planlar.push({
                id: `${NAFILE_ID_ONEKI}${iso}_${p.tur}`,
                tur: p.tur,
                zaman,
                ...nafileBildirimMetni({ tur: p.tur, son: p.bitis }),
                uyandirma: false,
            });
        }
    }

    return planlar.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
}
