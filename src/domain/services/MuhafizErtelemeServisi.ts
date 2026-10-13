/**
 * Muhafız "Ertele" — JS basış yolu (issue #289).
 *
 * ANDROID'DE BU YOL YEDEKTİR: düğme native işlenir
 * (`KopruEtiketliBildirimServisi` → `BildirimErteleIsleyici`), uygulama kapalı
 * ve Samsung uyku kısıtındayken bile JS'i beklemez. Buraya yalnız native yol
 * işleyemezse (eski içerik, beklenmeyen yük) üst sınıf üzerinden düşülür.
 *
 * iOS'TA ASIL YOL BUDUR: iOS bildirim eylemi için arka planda yalnız uygulamanın
 * kendi yanıt işleyicisini çalıştırır; JS bağlamı ayağa kalkmazsa erteleme
 * kurulmaz (bildirim kapanır, muhafızın planlı uyarıları sürer — sessiz kayıp
 * değil, ertelenmemiş uyarı). Cihazda doğrulanmadı.
 *
 * Kurallar SAF çekirdekten (`core/muhafiz/erteleme.ts`); native ikizi
 * `cekirdek/ErtelemeKurallari.kt`.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import {
    ertelemeBasligiOlustur,
    ertelemedeSusturulurMu,
    ertelemeHedefiHesapla,
    ertelemeKategorisi,
    ertelemeKimligi,
    eylemSuresiDk,
    kimliktenKalanDk,
} from '../../core/muhafiz/erteleme';
import { muhafizTeslimcisiniAl } from './MuhafizTeslimcisi';
import { ertelemeDegistiBildir } from './muhafizErtelemeDurumu';
import { odakDurumunuCoz, odakSessizlestirirMi } from '../../core/muhafiz/ios/odakFiltresi';
import { siriOdakDurumuAl } from '../../../modules/expo-siri-kisayollari/src';

const VAKIT_DESENI = /^muhafiz_(\d{4}-\d{2}-\d{2})_vakit_([a-z]+)(?:_|$)/;

export interface ErtelemeYaniti {
    /** Basılan bildirimin kimliği (plan uyarısı ya da önceki erteleme). */
    kimlik: string;
    eylem: string;
    baslik?: string | null;
    govde?: string | null;
    data: Record<string, unknown>;
}

const sayi = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/**
 * Ertele eylemini işler. Eylem ertele değilse `false` (çağıran başka yola bakar).
 * Asla fırlatmaz.
 */
export async function muhafizErtelemesiniIsle(yanit: ErtelemeYaniti, simdiMs: number = Date.now()): Promise<boolean> {
    const sureDk = eylemSuresiDk(yanit.eylem);
    if (sureDk === null) return false;

    try {
        try {
            await Notifications.dismissNotificationAsync(yanit.kimlik);
        } catch {
            // Bildirim zaten kalkmış olabilir.
        }

        const m = VAKIT_DESENI.exec(yanit.kimlik);
        const sinirMs = sayi(yanit.data.erteleSinirMs);
        const cikisMs = sayi(yanit.data.cikisMs);
        if (!m || sinirMs === null || cikisMs === null) {
            Logger.warn('MuhafizErteleme', 'Erteleme verisi eksik, atlaniyor', yanit.kimlik);
            return true;
        }
        const [, tarih, vakit] = m;

        const hedefMs = ertelemeHedefiHesapla(simdiMs, sureDk, sinirMs);
        if (hedefMs === null) {
            // Sinir gecti: ertelenecek zaman kalmadi, bildirim yalniz kapanir.
            Logger.info('MuhafizErteleme', 'Sinir gecti, ertelenmedi', yanit.kimlik);
            return true;
        }

        const baslik = ertelemeBasligiOlustur(
            typeof yanit.data.ertelemeBasligi === 'string' ? yanit.data.ertelemeBasligi : null,
            cikisMs,
            hedefMs
        ) ?? yanit.baslik ?? '';
        const kanalId = typeof yanit.data.kanalId === 'string' ? yanit.data.kanalId : undefined;
        const iosSesi = typeof yanit.data.ertelemeSesi === 'string' ? yanit.data.ertelemeSesi : undefined;
        const kesinti = Platform.OS === 'ios' ? await iosKesintiSeviyesi(yanit.data, hedefMs) : undefined;

        await Notifications.scheduleNotificationAsync({
            identifier: ertelemeKimligi(tarih, vakit),
            content: {
                title: baslik,
                body: yanit.govde ?? '',
                sound: Platform.OS === 'ios' ? (iosSesi ?? 'default') : true,
                ...(Platform.OS === 'ios' && kesinti
                    ? { interruptionLevel: kesinti as Notifications.NotificationContentInput['interruptionLevel'] }
                    : {}),
                categoryIdentifier: ertelemeKategorisi(hedefMs, sinirMs),
                data: { ...yanit.data, ertelemeHedefMs: hedefMs },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(hedefMs),
                ...(kanalId ? { channelId: kanalId } : {}),
            },
        });

        await araliktakiUyarilariSustur(tarih, vakit, cikisMs, hedefMs);
        Logger.info('MuhafizErteleme', `${vakit} (${tarih}) ${sureDk} dk ertelendi`);
        // Ön plan muhafızı (banner/ses) ve saatin planı ertelemeyi öğrensin.
        ertelemeDegistiBildir();
    } catch (error) {
        Logger.error('MuhafizErteleme', 'Erteleme kurulamadi', error);
    }
    return true;
}

/**
 * iOS: ertelenen kopyanın kesinti seviyesi — Odak filtresi BASIŞ ANINDA yeniden
 * değerlendirilir (issue #279). Planlama anındaki seviye `data.kesintiSeviyesi`'dir
 * (Odaksız taban seviye); planlamada Odak sessizdiyse `data.odakSessiz`. Ertelenen
 * kopya hedef anında gelir: o an Odak sessizliği sürüyorsa `passive` (ses yok,
 * Odağı delmez), bitmişse taban seviye. Odak durumu okunamazsa planlama anının
 * kararı korunur (sessizlik sessizce kaybolmasın).
 */
async function iosKesintiSeviyesi(data: Record<string, unknown>, hedefMs: number): Promise<string | undefined> {
    const taban = typeof data.kesintiSeviyesi === 'string' ? data.kesintiSeviyesi : undefined;
    const odak = odakDurumunuCoz(await siriOdakDurumuAl());
    const sessiz = odak ? odakSessizlestirirMi(odak, hedefMs) : data.odakSessiz === true;
    return sessiz ? 'passive' : taban;
}

/**
 * Erteleme süresince vaktin planlı uyarılarını (ve aynı kimlikli sesli
 * anonslarını) iptal eder. Yeniden planlama aynı aralığı `etkinErtelemeler` ile
 * boş bırakır.
 */
async function araliktakiUyarilariSustur(tarih: string, vakit: string, cikisMs: number, hedefMs: number): Promise<void> {
    const onek = `muhafiz_${tarih}_vakit_${vakit}_`;
    try {
        const bekleyenler = await Notifications.getAllScheduledNotificationsAsync();
        for (const b of bekleyenler) {
            if (!b.identifier.startsWith(onek)) continue;
            const kalanDk = kimliktenKalanDk(b.identifier);
            if (kalanDk === null) continue;
            if (!ertelemedeSusturulurMu(cikisMs - kalanDk * 60_000, hedefMs)) continue;
            try {
                await Notifications.cancelScheduledNotificationAsync(b.identifier);
            } catch {
                // Tek bir iptal patlarsa diğerleri yine denensin.
            }
            muhafizTeslimcisiniAl().yanKanaliIptalEt(b.identifier);
        }
    } catch (error) {
        Logger.warn('MuhafizErteleme', 'Planli uyarilar susturulamadi', error);
    }
}
