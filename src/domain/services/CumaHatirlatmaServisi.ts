import * as Notifications from 'expo-notifications';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Logger } from '../../core/utils/Logger';
import { LocalCumaHatirlatmaServisi } from '../../data/local/LocalCumaHatirlatmaServisi';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';
import {
    sonrakiCumalar,
    hatirlatmaZamaniHesapla,
    sureMetniOlustur,
} from '../../core/utils/cumaYardimcisi';

/** Bildirim id oneki — temizlik bu onekle SUZER, baska sistemlere dokunmaz. */
const ID_ONEKI = 'cuma_hatirlatma_';

/**
 * Kac cuma ileri planlanir.
 *
 * Vakit bildirimlerinin "bugun + yarin" penceresi cuma icin YETERSIZ (olay haftada
 * bir). Dort hafta, kullanici uygulamayi bir ay acmasa bile hatirlatmanin
 * surmesini saglar. Ust sinir da gerekli: uzaga kurulan mutlak zamanlar konum
 * degisimi/DST gibi kaymalari bir sonraki acilisa kadar tasiyabilir.
 */
const PLANLANACAK_CUMA_SAYISI = 4;

export interface CumaKoordinat {
    lat: number;
    lng: number;
}

/**
 * Cuma namazi hatirlatmasi (issue #173).
 *
 * Cuma, ogle vaktinin YERINE gecer; bu yuzden ne yeni bir vakit tanimlanir ne de
 * muhafiz matrisine dokunulur. Muhafiz "vakit cikiyor, hemen namaza dur" der;
 * cuma'da kisinin CAMIYE GITMESI gerekir → uyari vaktin cikisina degil, girisine
 * gore ve cok daha erken kurulur. Bu yuzden ayri, tek atisli bir hatirlatmadir.
 *
 * KOORDINAT PARAMETREDIR (`NamazVaktiHesaplayiciServisi.getKonfig()`'ten okunmaz):
 * o konfig bellek-icidir ve `App.tsx` kurar; arka plan gorevi headless calistiginda
 * kurulmamis olabilir → servis sessizce hicbir sey planlamazdi.
 */
export class CumaHatirlatmaServisi {
    private static instance: CumaHatirlatmaServisi;

    /**
     * Suren planlama. UC cagiran ayni anda tetikleyebilir (acilis zinciri, ayar
     * ekrani, arka plan gorevi) ve islem "temizle → 4 planla" seklinde COK ADIMLI:
     * ic ice girerse A'nin temizligi B'nin planlamasindan SONRA kosabilir ya da
     * eski ayarla planlayan cagri sonuncu olabilir → diskteki ayar ile gercekten
     * kurulu saat AYRISIR (bir sonraki acilisa kadar sessizce yanlis saat).
     * Bekleyen cagri ayni promise'i paylasir; ust uste planlama olmaz.
     */
    private surenPlanlama: Promise<void> | null = null;

    private constructor() { }

    public static getInstance(): CumaHatirlatmaServisi {
        if (!CumaHatirlatmaServisi.instance) {
            CumaHatirlatmaServisi.instance = new CumaHatirlatmaServisi();
        }
        return CumaHatirlatmaServisi.instance;
    }

    /**
     * Cuma hatirlatmalarini yeniden planlar. Once TEMIZLER (cift bildirim olmasin),
     * ayar kapaliysa temizlikten sonra doner.
     */
    public async hatirlatmalariGuncelle(koordinatlar: CumaKoordinat | null): Promise<void> {
        // Suren bir planlama varsa onu BEKLE, sonra kendi turunu calistir —
        // boylece son cagri daima en guncel ayarla ve bozulmamis sirayla koşar.
        const onceki = this.surenPlanlama ?? Promise.resolve();
        const bu = onceki
            .catch(() => { /* onceki turun hatasi bu turu dusurmez */ })
            .then(() => this.planlamayiCalistir(koordinatlar));

        this.surenPlanlama = bu;
        try {
            await bu;
        } finally {
            // Yalnizca EN SON tur bayragi temizler (arada yeni cagri geldiyse o devralir).
            if (this.surenPlanlama === bu) this.surenPlanlama = null;
        }
    }

    private async planlamayiCalistir(koordinatlar: CumaKoordinat | null): Promise<void> {
        const ayarlar = await LocalCumaHatirlatmaServisi.getAyarlar();

        if (!ayarlar.aktif) {
            await this.mevcutlariTemizle();
            return;
        }

        // (0,0) = konum henuz yuklenmemis; Gine Korfezi'ne gore vakit planlamak
        // sessizce yanlis saatte bildirim demek olurdu.
        //
        // TEMIZLIKTEN ONCE kontrol edilir: koordinat gecici olarak okunamazsa
        // (bozuk/eksik konum kaydi, headless yol) once temizleyip sonra vazgecmek,
        // KURULU dort haftalik plani silip yerine hicbir sey koymamak demekti —
        // kullanici bir sonraki basarili calismaya kadar hatirlatma almazdi.
        // Bayat plan, plansizliktan iyidir.
        if (!koordinatlar || (koordinatlar.lat === 0 && koordinatlar.lng === 0)) {
            Logger.warn('CumaHatirlatma', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        await this.mevcutlariTemizle();

        const coordinates = new Coordinates(koordinatlar.lat, koordinatlar.lng);
        const params = CalculationMethod.Turkey();
        const simdi = new Date();

        for (const cuma of sonrakiCumalar(simdi, PLANLANACAK_CUMA_SAYISI)) {
            // Vakit hesabi GUN BAZINDA: her cuma icin ayri PrayerTimes.
            const ogleVakti = new PrayerTimes(coordinates, cuma, params).dhuhr;
            await this.tekHatirlatmaPlanla(cuma, ogleVakti, ayarlar.oncedenDk, simdi);
        }
    }

    private async tekHatirlatmaPlanla(
        cuma: Date,
        ogleVakti: Date,
        oncedenDk: number,
        simdi: Date
    ): Promise<void> {
        const zaman = hatirlatmaZamaniHesapla(ogleVakti, oncedenDk);
        if (zaman.getTime() <= simdi.getTime()) return;

        const sure = sureMetniOlustur(oncedenDk);

        try {
            await Notifications.scheduleNotificationAsync({
                identifier: `${ID_ONEKI}${tarihiISOFormatinaCevir(cuma)}`,
                content: {
                    title: 'Cuma namazı yaklaşıyor',
                    // İbadete cagri kaydi ("sen" + emir kipi) — arayuz dili DEGIL.
                    // Cuma'ya OZGU nass (Cuma 62:9) burada dogru yerde: yalniz bu
                    // bildirime ait, genel havuza karismaz.
                    body: `Öğle vaktine ${sure} kaldı. Hazırlan, camiye yola çık.\n"Cuma günü namaza çağırıldığında Allah'ı anmaya koşun." (Cuma, 62/9)`,
                    sound: true,
                    data: { tip: 'cuma_hatirlatma' },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: zaman,
                    channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                },
            });
        } catch (e) {
            // Tek bir cumanin planlamasi patlarsa KALANLAR yine kurulmali.
            Logger.error('CumaHatirlatma', 'Planlama hatasi', e);
        }
    }

    private async mevcutlariTemizle(): Promise<void> {
        try {
            const tumu = await Notifications.getAllScheduledNotificationsAsync();
            const silinecekler = tumu.filter((b) => b.identifier.startsWith(ID_ONEKI));
            for (const bildirim of silinecekler) {
                await Notifications.cancelScheduledNotificationAsync(bildirim.identifier);
            }
        } catch (e) {
            Logger.error('CumaHatirlatma', 'Temizlik hatasi', e);
        }
    }
}
