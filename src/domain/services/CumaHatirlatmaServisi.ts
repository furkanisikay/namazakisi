import * as Notifications from 'expo-notifications';
import { Logger } from '../../core/utils/Logger';
import { LocalCumaHatirlatmaServisi } from '../../data/local/LocalCumaHatirlatmaServisi';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { sureMetniOlustur } from '../../core/utils/cumaYardimcisi';
import { CUMA_ID_ONEKI, cumaPlaniOlustur, type CumaPlanKaydi } from '../../core/bildirim/cumaPlani';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';

/** Bildirim id oneki — temizlik bu onekle SUZER (tek kaynak: `core/bildirim/cumaPlani.ts`). */
const ID_ONEKI = CUMA_ID_ONEKI;

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

        // Plan SAF ureticiden gelir (`core/bildirim/cumaPlani.ts`): bildirim
        // defteri (issue #298) ayni listeyi sayar. Adim dakikalari ortak motor
        // (`vakitUyariPlaniOlustur`) uzerinden uretilir — plan butcesi dahil.
        //
        // Özel gün (issue #272): aralığa düşen cumanın hatırlatması kurulmaz
        // (eski plan yukarıda temizlendi). Ufuk kaymaz: dört cumadan biri
        // aralıktaysa o hafta atlanır, beşinci cuma eklenmez.
        const ozelGundeMi = await ozelGunSuzgeciniOku();
        const plan = cumaPlaniOlustur(koordinatlar, ayarlar, new Date(), ozelGundeMi);
        for (const kayit of plan) {
            await this.tekHatirlatmaPlanla(kayit);
        }
    }

    /**
     * Tek hatirlatmayi kurar. Metin:
     *   - cuma'ya OZGU nass (Cuma 62/9) yalnizca ILK hatirlatmada gecer; her
     *     tekrarda okunmasi hem gurultu hem de nassin degerini asindirir.
     */
    private async tekHatirlatmaPlanla(kayit: CumaPlanKaydi): Promise<void> {
        const sure = sureMetniOlustur(kayit.oncedenDk);

        try {
            await Notifications.scheduleNotificationAsync({
                identifier: kayit.id,
                content: {
                    title: 'Cuma namazı yaklaşıyor',
                    // İbadete cagri kaydi ("sen" + emir kipi) — arayuz dili DEGIL.
                    // Cuma'ya OZGU nass (Cuma 62:9) burada dogru yerde: yalniz bu
                    // bildirime ait, genel havuza karismaz.
                    body: kayit.ilkMi
                        ? `Öğle vaktine ${sure} kaldı. Hazırlan, camiye yola çık.\n"Cuma günü namaza çağırıldığında Allah'ı anmaya koşun." (Cuma, 62/9)`
                        : `Öğle vaktine ${sure} kaldı. Camiye yola çık.`,
                    sound: true,
                    data: { tip: 'cuma_hatirlatma' },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: kayit.zaman,
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
