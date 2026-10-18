import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { ANDROID_NAFILE_PAYI } from '../../core/bildirim/butceSabitleri';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { LocalNafileServisi, nafileHatirlatmaAcikMi } from '../../data/local/LocalNafileServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { koordinatGecerliMi, type NafileKoordinat } from '../../core/nafile/gunVakitleri';
import { nafileKanalAyarlari } from '../../core/nafile/nafileAdimlari';
import { NAFILE_ADLARI, type NafileAyarlari, type NafileTuru } from '../../core/nafile/nafileTipleri';
import {
    NAFILE_ID_ONEKI,
    nafileKimlikOneki,
    nafilePlaniOlustur,
    nafilePlanSecenekleri,
    type NafileBildirimPlani,
} from '../../core/nafile/nafilePlani';
import type { MuhafizTeslimcisi } from './MuhafizTeslimcisi';
import { LocalSaatAyarlariServisi } from '../../data/local/LocalSaatAyarlariServisi';

/**
 * Plan üretici SAF modüldedir (`core/nafile/nafilePlani.ts`): bildirim
 * defteri (issue #298) aynı fonksiyonu kuru çalıştırır. Geriye uyumluluk için
 * buradan yeniden dışa aktarılır.
 */
export { NAFILE_ID_ONEKI, nafilePlaniOlustur, type NafileBildirimPlani } from '../../core/nafile/nafilePlani';

/** Bildirim `data` yükü — "Kıldım" yanıtı bunu okur (`BildirimServisi`). */
export interface NafileBildirimVerisi {
    tip: 'nafile';
    tur: NafileTuru;
    /** Nafilenin GÜNÜ (teheccüd: gecesinin yatsısının günü). */
    tarih: string;
}

/**
 * NAFİLE TESLİMCİSİ — muhafızla AYNI teslim katmanı, AYRI örnek (issue #273).
 *
 * Fable kararı: teslim `AndroidMuhafizTeslimcisi` / `IosMuhafizTeslimcisi`
 * üzerinden (kanal uzayı, titreşim, TTS anons alarmı, iOS anons klibi aynı
 * kod). Ayrı ÖRNEK şarttır: muhafız örneğinin tur başı bütçe sayacı ve iOS slot
 * ölçümü nafile turuyla karışmamalı. Seçenekler:
 * - Android: kanal hazırlığı KİMLİK (çöp toplama muhafızın işidir; nafile
 *   kanallarını `MuhafizKanalServisi.ekKanallariHazirla` oluşturur), anons
 *   temizliği yalnız `nafile_` önekli, bütçe `ANDROID_NAFILE_PAYI` (asıl kesme
 *   üreticide; teslimcideki sayaç emniyet ağıdır).
 * - iOS: bütçe ölçümü "nafile DIŞI" bekleyenleri sayar (muhafız dahil),
 *   anons sesi matrissiz hazırlanır.
 *
 * Seçim ENJEKTE EDİLEBİLİR (jest varsayılan platformu iOS'tur — AGENTS.md).
 */
let _teslimci: MuhafizTeslimcisi | null = null;

export function nafileTeslimcisiniAl(): MuhafizTeslimcisi {
    if (_teslimci) return _teslimci;
    if (Platform.OS === 'ios') {
        const { IosMuhafizTeslimcisi } =
            require('./IosMuhafizTeslimcisi') as typeof import('./IosMuhafizTeslimcisi');
        // Gerçek alarm (AlarmKit, #74) nafilede de STANDART yetenektir; iptaller yalnız
        // `nafile_` önekli kimliklere dokunur (muhafızın alarmları korunur).
        _teslimci = new IosMuhafizTeslimcisi({ kendiOneki: NAFILE_ID_ONEKI, matrissizAnons: true, alarmDestegi: true });
    } else {
        const { AndroidMuhafizTeslimcisi } =
            require('./AndroidMuhafizTeslimcisi') as typeof import('./AndroidMuhafizTeslimcisi');
        _teslimci = new AndroidMuhafizTeslimcisi({
            alarmButcesi: ANDROID_NAFILE_PAYI,
            kanalHazirligi: async (m) => m,
            anonsOneki: NAFILE_ID_ONEKI,
            // Gerçek alarm (issue #74) nafilede de kurulur; önceki turun alarmları yalnız
            // `nafile_` önekiyle silinir. Alarm KANALLARINI muhafız toplar (nafileninkileri
            // diskten okuyup korur) — bu örnek toplarsa muhafızın kanallarını silerdi.
            alarmDestegi: true,
            alarmKanalTemizligi: false,
        });
    }
    return _teslimci;
}

/** Test / özel senaryo: teslimciyi ayarla (`null` → platformdan yeniden türet). */
export function nafileTeslimcisiniAyarla(teslimci: MuhafizTeslimcisi | null): void {
    _teslimci = teslimci;
}

/** Native önekli anons iptali — tembel yüklenir (köprü grafiği testlere sızmasın). */
function anonslariOnekleIptalEt(onek: string): void {
    if (Platform.OS !== 'android') return;
    try {
        const { iptalEtOnekliAnonslar } =
            require('../../../modules/expo-countdown-notification/src') as typeof import('../../../modules/expo-countdown-notification/src');
        iptalEtOnekliAnonslar(onek);
    } catch (e) {
        Logger.error('NafileHatirlatma', 'Anons alarmlari iptal edilemedi', e);
    }
}

/**
 * Nafile namaz hatırlatmaları (issue #77, #273).
 *
 * KOORDİNAT PARAMETREDİR (cuma dersi): `NamazVaktiHesaplayiciServisi` bellek-içidir,
 * headless arka plan görevinde boştur → servis sessizce hiçbir şey planlamazdı.
 *
 * Gece yarısı: gece yarısından sonra (aktif gün = dün) DÜNÜN gecesinin teheccüd
 * hatırlatmaları hâlâ gelecektedir → geceler dünden başlayarak taranır.
 *
 * "KILDIM" (#273) yalnız o günün o nafilesinin kalan hatırlatmalarını (bildirim +
 * anons alarmı + gösterilen bildirim) iptal eder ve bir susturma hafızası yazar;
 * kayıt/puan/seri TUTMAZ. Native Kıldım yolu (#299) yalnız `muhafiz_` kimlikleri
 * içindir — nafile yanıtı JS'e (`BildirimServisi`) düşer ve buraya gelir.
 */
/**
 * Saatin uyandırma listesi (saat W3) teheccüd ayarından/kılınmışlığından türer → nafile
 * planı değişince saat yükü de tazelenir. TEMBEL `require` (saat köprüsü native) ve
 * yalnız Android; gönderim içerik aynıysa yazmaz, asla fırlatmaz.
 */
function saatiTazele(): void {
    if (Platform.OS !== 'android') return;
    try {
        const { WearSenkronServisi } = require('./WearSenkronServisi') as typeof import('./WearSenkronServisi');
        WearSenkronServisi.getInstance().gonder().catch(() => undefined);
    } catch (e) {
        Logger.warn('NafileHatirlatma', 'Saat tazelenemedi', e);
    }
}

export class NafileHatirlatmaServisi {
    private static instance: NafileHatirlatmaServisi;

    /** Süren iş: "temizle → planla" ve Kıldım aynı sıradan geçer (yarış = ayrışan plan). */
    private surenIs: Promise<void> | null = null;

    private constructor() { }

    public static getInstance(): NafileHatirlatmaServisi {
        if (!NafileHatirlatmaServisi.instance) {
            NafileHatirlatmaServisi.instance = new NafileHatirlatmaServisi();
        }
        return NafileHatirlatmaServisi.instance;
    }

    private async siraya(is: () => Promise<void>): Promise<void> {
        const onceki = this.surenIs ?? Promise.resolve();
        const bu = onceki
            .catch(() => { /* önceki turun hatası bu turu düşürmez */ })
            .then(is);
        this.surenIs = bu;
        try {
            await bu;
        } finally {
            if (this.surenIs === bu) this.surenIs = null;
        }
    }

    public async hatirlatmalariGuncelle(koordinatlar: NafileKoordinat | null): Promise<void> {
        await this.siraya(() => this.planlamayiCalistir(koordinatlar));
        saatiTazele();
    }

    /**
     * Bildirimdeki "Kıldım" (issue #273): o günün o nafilesinin kalan
     * hatırlatmaları susar. Asla fırlatmaz.
     */
    public async kildimIsle(tarih: string, tur: NafileTuru): Promise<void> {
        await this.siraya(async () => {
            await LocalNafileServisi.kilindiIsaretle(tarih, tur, bugunuAl());
            const onek = nafileKimlikOneki(tarih, tur);
            try {
                const tumu = await Notifications.getAllScheduledNotificationsAsync();
                for (const b of tumu) {
                    if (b.identifier.startsWith(onek)) {
                        await Notifications.cancelScheduledNotificationAsync(b.identifier);
                    }
                }
            } catch (e) {
                Logger.error('NafileHatirlatma', 'Kildim: bekleyenler iptal edilemedi', e);
            }
            anonslariOnekleIptalEt(onek);
            // Gerçek alarmlar (#74): bekleyenler + o an ÇALAN alarm (Android ses + tam
            // ekran; iOS AlarmKit) susar. Native Kıldım yolu da aynı öneki susturur.
            try {
                nafileTeslimcisiniAl().vakitYanKanallariniIptalEt?.(onek);
            } catch (e) {
                Logger.warn('NafileHatirlatma', 'Kildim: alarmlar susturulamadi', e);
            }
            try {
                const gosterilen = await Notifications.getPresentedNotificationsAsync();
                for (const b of gosterilen) {
                    if (b.request.identifier.startsWith(onek)) {
                        await Notifications.dismissNotificationAsync(b.request.identifier);
                    }
                }
            } catch (e) {
                Logger.warn('NafileHatirlatma', 'Kildim: gosterilen bildirimler kaldirilamadi', e);
            }
            Logger.info('NafileHatirlatma', `Kildim: ${tur} (${tarih}) kalan hatirlatmalari iptal edildi`);
        });
        // Saatin teheccüd uyandırması (saat W3) da düşsün.
        saatiTazele();
    }

    /**
     * iOS: nafile GERÇEK ALARMINDAN (AlarmKit) basılan "Kıldım"lar. Native o nafilenin
     * kalan alarm/bildirimlerini zaten iptal etti; burada yalnız susturma HAFIZASI yazılır
     * (yoksa bir sonraki planlama o günün kalanını yeniden kurardı). Asla fırlatmaz.
     */
    public async alarmKildimleriniIsle(): Promise<void> {
        if (Platform.OS !== 'ios') return;
        await this.siraya(() => this.alarmKildimleriniYaz());
    }

    private async alarmKildimleriniYaz(): Promise<void> {
        if (Platform.OS !== 'ios') return;
        try {
            const { alarmKitNafileKildimleriniAl } =
                require('../../../modules/expo-muhafiz-alarmkit/src') as typeof import('../../../modules/expo-muhafiz-alarmkit/src');
            for (const k of await alarmKitNafileKildimleriniAl()) {
                if (k.tur !== 'kusluk' && k.tur !== 'evvabin' && k.tur !== 'teheccud') continue;
                await LocalNafileServisi.kilindiIsaretle(k.tarih, k.tur, bugunuAl());
            }
        } catch (e) {
            Logger.warn('NafileHatirlatma', 'Alarm Kildim kuyrugu okunamadi', e);
        }
    }

    private async planlamayiCalistir(koordinatlar: NafileKoordinat | null): Promise<void> {
        // Alarmdan gelen Kıldım'lar ÖNCE: kılınmış nafilenin kalanı yeniden kurulmasın.
        await this.alarmKildimleriniYaz();
        // Özel sesler DOĞRULANIR (Android): başka cihazdan geri yüklenen `content://`
        // çözülmez; kanal/alarm ölü sesle kurulup kalıcı sessiz çalardı. Plan, kanal
        // hazırlığı ve muhafızın çöp toplaması AYNI doğrulamadan geçer (id paritesi).
        const ayarlar = await this.sesleriDogrula(await LocalNafileServisi.getAyarlar());

        if (!nafileHatirlatmaAcikMi(ayarlar)) {
            await this.mevcutlariTemizle();
            // Bekleyen GERÇEK ALARMLAR (#74) expo listesinde yoktur: teslimcinin
            // hazırlığı önceki turunkileri `nafile_` önekiyle siler.
            const teslimci = nafileTeslimcisiniAl();
            try {
                await teslimci.hazirla();
            } finally {
                await teslimci.tamamla?.();
            }
            return;
        }

        // TEMİZLİKTEN ÖNCE: koordinat geçici olarak okunamazsa kurulu planı silip
        // yerine hiçbir şey koymamak, plansızlıktan kötüdür (cuma dersi).
        if (!koordinatGecerliMi(koordinatlar)) {
            Logger.warn('NafileHatirlatma', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        // Kanallar planlamadan ÖNCE (Android 8+ var olmayan kanala gideni göstermez).
        if (ayarlar.teheccud.aktif && ayarlar.teheccud.uyandirma) {
            await this.uyandirmaKanaliniGarantile();
        }
        await this.kanallariHazirla(nafileKanalAyarlari(ayarlar));

        await this.mevcutlariTemizle();

        // Özel gün (issue #272): aralıktaki günlerin (ve gecelerinin) nafile
        // hatırlatmaları kurulmaz; eski plan az önce temizlendi.
        const ozelGundeMi = await ozelGunSuzgeciniOku();
        const kilinan = await LocalNafileServisi.getKilinanlar();
        // Saat iş bölümü (saat W3): uyandırma saatteyse teheccüd uyandırması telefonda yedek.
        const saat = await LocalSaatAyarlariServisi.teslimBaglaminiOku();

        const simdi = new Date();
        const secenekler = {
            ...nafilePlanSecenekleri(ayarlar),
            ...(Platform.OS === 'android' ? { alarmButcesi: ANDROID_NAFILE_PAYI } : {}),
            kilindiMi: (iso: string, tur: NafileTuru) => (kilinan[iso] ?? []).includes(tur),
            saat,
        };
        const planlar = nafilePlaniOlustur(koordinatlar, ayarlar, simdi, bugunuAl(), ozelGundeMi, secenekler);

        const teslimci = nafileTeslimcisiniAl();
        try {
            await teslimci.hazirla();
            // KRONOLOJİK sıra: iOS bütçesi sayaçla keser, ters sıra yakın uyarıları atardı.
            for (const plan of planlar) {
                await this.planla(teslimci, plan);
            }
        } finally {
            await teslimci.tamamla?.();
        }
    }

    private async planla(teslimci: MuhafizTeslimcisi, plan: NafileBildirimPlani): Promise<void> {
        const veri: NafileBildirimVerisi = { tip: 'nafile', tur: plan.tur, tarih: plan.tarih };
        try {
            await teslimci.uyariPlanla({
                id: plan.id,
                baslik: plan.baslik,
                mesaj: plan.govde,
                zaman: plan.zaman,
                uyari: plan.uyari,
                // Teslim sözleşmesi bir vakit kimliği ister; nafile yükü (`ozel.veri`)
                // bunun yerine geçer, anons metni yer tutucu içermez → kullanılmaz.
                vakit: 'ogle',
                muhafizVakti: 'ogle',
                tarih: plan.tarih,
                yon: plan.yon,
                // Pencere sonu: gerçek alarm geç tetiklenirse (vakit bittiyse) çalmaz.
                cikis: plan.son,
                ozel: {
                    veri: { ...veri },
                    // Gerçek alarm ekranında görünen ad (Kıldım native'de NAFİLE yoluna gider).
                    alarmAdi: NAFILE_ADLARI[plan.tur],
                    ...(plan.uyandirma ? { kanalId: BILDIRIM_SABITLERI.KANALLAR.NAFILE_UYANDIRMA } : {}),
                    // iOS: uyandırma Odak'ı deler (sessiz anahtarı DELMEZ — ekranda söylenir).
                    zamanaDuyarli: plan.uyandirma,
                },
            });
        } catch (e) {
            // Tek bir bildirim patlarsa kalanlar yine kurulmalı.
            Logger.error('NafileHatirlatma', 'Planlama hatasi', e);
        }
    }

    /** `MuhafizKanalServisi.nafileSesleriniDogrula` — tembel (köprü grafiği testlere sızmasın). */
    private async sesleriDogrula(ayarlar: NafileAyarlari): Promise<NafileAyarlari> {
        if (Platform.OS !== 'android') return ayarlar;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            return await MuhafizKanalServisi.nafileSesleriniDogrula(ayarlar);
        } catch (e) {
            Logger.error('NafileHatirlatma', 'Sesler dogrulanamadi', e);
            return ayarlar;
        }
    }

    /** Ortak muhafız kanal uzayındaki nafile kanallarını oluşturur (çöp toplamaz). */
    private async kanallariHazirla(ayarlar: ReturnType<typeof nafileKanalAyarlari>): Promise<void> {
        if (Platform.OS !== 'android' || ayarlar.length === 0) return;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            await MuhafizKanalServisi.ekKanallariHazirla(ayarlar);
        } catch (e) {
            Logger.error('NafileHatirlatma', 'Kanallar hazirlanamadi', e);
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

    /** Bekleyen nafile bildirimleri + Android anons alarmları (yalnız `nafile_` önekli). */
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
        anonslariOnekleIptalEt(NAFILE_ID_ONEKI);
    }
}
