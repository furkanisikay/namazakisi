import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { LocalCumaHatirlatmaServisi } from '../../data/local/LocalCumaHatirlatmaServisi';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { CUMA_ID_ONEKI, cumaPlaniOlustur, type CumaPlanKaydi } from '../../core/bildirim/cumaPlani';
import { ANDROID_CUMA_PAYI, IOS_ALARMKIT_CUMA_PAYI } from '../../core/bildirim/butceSabitleri';
import { onekSahipligi } from '../../core/muhafiz/teslimSahipligi';
import type { CumaHatirlatmaAyarlari } from '../../core/cuma/cumaAyarlari';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import type { MuhafizTeslimcisi } from './MuhafizTeslimcisi';

/** Bildirim id oneki — temizlik bu onekle SUZER (tek kaynak: `core/bildirim/cumaPlani.ts`). */
const ID_ONEKI = CUMA_ID_ONEKI;

export interface CumaKoordinat {
    lat: number;
    lng: number;
}

/** Bildirim `data` yükü — muhafız yükü DEĞİL ("Kıldım" FARZ öğleyi yazmasın). */
export const CUMA_BILDIRIM_VERISI = { tip: 'cuma_hatirlatma' } as const;

/**
 * CUMA TESLİMCİSİ — muhafızla AYNI teslim katmanı, AYRI örnek (ortak hatırlatma
 * yüzeyleri plan §3.2; nafile #273 deseni). Kanal uzayı, titreşim, sesli anons (Android TTS
 * alarmı / iOS anons klibi), gerçek alarm ve ses seçimi AYNI koddan gelir. Ayrı ÖRNEK şart:
 * muhafızın tur başı bütçe sayacı ve iOS slot ölçümü cuma turuyla karışmamalı.
 * - Android: kanal hazırlığı KİMLİK (çöp toplama muhafızın işidir; cumanın kanallarını
 *   `MuhafizKanalServisi.ekKanallariHazirla` oluşturur, `ekHatirlatmaKaynaklari` korur),
 *   önceki turun anons/alarmları yalnız `cuma_hatirlatma_` önekiyle silinir, pay
 *   `ANDROID_CUMA_PAYI` (asıl kesme üreticide; teslimcideki sayaç emniyet ağı).
 * - iOS: bütçe ölçümü "cuma dışı" bekleyenleri sayar (ortak 64 defteri), anons sesi
 *   matrissiz hazırlanır, AlarmKit payı `IOS_ALARMKIT_CUMA_PAYI`.
 *
 * Seçim ENJEKTE EDİLEBİLİR (jest varsayılan platformu iOS'tur — AGENTS.md).
 */
let _teslimci: MuhafizTeslimcisi | null = null;

export function cumaTeslimcisiniAl(): MuhafizTeslimcisi {
    if (_teslimci) return _teslimci;
    if (Platform.OS === 'ios') {
        const { IosMuhafizTeslimcisi } =
            require('./IosMuhafizTeslimcisi') as typeof import('./IosMuhafizTeslimcisi');
        _teslimci = new IosMuhafizTeslimcisi({
            sahiplik: onekSahipligi(ID_ONEKI),
            matrissizAnons: true,
            alarmDestegi: true,
            alarmKitPayi: IOS_ALARMKIT_CUMA_PAYI,
        });
    } else {
        const { AndroidMuhafizTeslimcisi } =
            require('./AndroidMuhafizTeslimcisi') as typeof import('./AndroidMuhafizTeslimcisi');
        _teslimci = new AndroidMuhafizTeslimcisi({
            alarmButcesi: ANDROID_CUMA_PAYI,
            kanalHazirligi: async (m) => m,
            sahiplik: onekSahipligi(ID_ONEKI),
            // Gerçek alarm cumada da STANDART yetenek; alarm KANALLARINI muhafız toplar.
            alarmDestegi: true,
            alarmKanalTemizligi: false,
        });
    }
    return _teslimci;
}

/** Test / özel senaryo: teslimciyi ayarla (`null` → platformdan yeniden türet). */
export function cumaTeslimcisiniAyarla(teslimci: MuhafizTeslimcisi | null): void {
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
        Logger.error('CumaHatirlatma', 'Anons alarmlari iptal edilemedi', e);
    }
}

/**
 * Cuma namazi hatirlatmasi (issue #173; ortak hatırlatma yüzeyleri plan §5.1).
 *
 * Cuma, ogle vaktinin YERINE gecer; bu yuzden ne yeni bir vakit tanimlanir ne de
 * muhafiz matrisine dokunulur. Muhafiz "vakit cikiyor, hemen namaza dur" der;
 * cuma'da kisinin CAMIYE GITMESI gerekir → uyari vaktin cikisina degil, GIRISINE
 * gore kurulur (yön sabit). Adımlar muhafızla aynı modeli konuşur (1–3 adım, kanallar,
 * ses, titreşim, gerçek alarm, tekrar); teslim muhafızın teslim katmanındandır.
 *
 * "KILDIM" YOK: bildirim kategorisizdir (`kategori: null`), yükü muhafız yükü değildir,
 * gerçek alarmı BİLGİ türüdür (yalnız "Kapat") — vakit girmeden gelen hatırlatmada
 * kılınacak bir şey yoktur ve FARZ öğle asla buradan yazılmaz.
 *
 * KOORDINAT PARAMETREDIR (`NamazVaktiHesaplayiciServisi.getKonfig()`'ten okunmaz):
 * o konfig bellek-icidir ve `App.tsx` kurar; arka plan gorevi headless calistiginda
 * kurulmamis olabilir → servis sessizce hicbir sey planlamazdi.
 */
export class CumaHatirlatmaServisi {
    private static instance: CumaHatirlatmaServisi;

    /**
     * Suren planlama. UC cagiran ayni anda tetikleyebilir (acilis zinciri, ayar
     * ekrani, arka plan gorevi) ve islem "temizle → planla" seklinde COK ADIMLI:
     * ic ice girerse A'nin temizligi B'nin planlamasindan SONRA kosabilir ya da
     * eski ayarla planlayan cagri sonuncu olabilir → diskteki ayar ile gercekten
     * kurulu saat AYRISIR. Bekleyen cagri ayni promise'i paylasir.
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

    private async planlamayiCalistir(koordinatlar: CumaKoordinat | null): Promise<void> {
        // Özel sesler DOĞRULANIR (Android): başka cihazdan geri yüklenen `content://`
        // çözülmez; kanal/alarm ölü sesle kurulup kalıcı sessiz çalardı. Plan, kanal
        // hazırlığı ve muhafızın çöp toplaması AYNI doğrulamadan geçer (id paritesi).
        const ayarlar = await this.sesleriDogrula(await LocalCumaHatirlatmaServisi.getAyarlar());

        if (!ayarlar.aktif) {
            await this.mevcutlariTemizle();
            // Bekleyen GERÇEK ALARMLAR expo listesinde yoktur: teslimcinin hazırlığı önceki
            // turunkileri `cuma_hatirlatma_` önekiyle siler.
            const teslimci = cumaTeslimcisiniAl();
            try {
                await teslimci.hazirla();
            } finally {
                await teslimci.tamamla?.();
            }
            return;
        }

        // (0,0) = konum henuz yuklenmemis; Gine Korfezi'ne gore vakit planlamak
        // sessizce yanlis saatte bildirim demek olurdu. TEMIZLIKTEN ONCE kontrol
        // edilir: bayat plan, plansizliktan iyidir.
        if (!koordinatlar || (koordinatlar.lat === 0 && koordinatlar.lng === 0)) {
            Logger.warn('CumaHatirlatma', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        // Kanallar planlamadan ÖNCE (Android 8+ var olmayan kanala gideni göstermez).
        await this.kanallariHazirla(ayarlar);

        await this.mevcutlariTemizle();

        // Plan SAF ureticiden gelir (`core/bildirim/cumaPlani.ts`): bildirim defteri
        // (issue #298) ayni listeyi sayar. Özel gün (issue #272): aralığa düşen cumanın
        // hatırlatması kurulmaz; ufuk kaymaz.
        const ozelGundeMi = await ozelGunSuzgeciniOku();
        const plan = cumaPlaniOlustur(
            koordinatlar,
            ayarlar,
            new Date(),
            ozelGundeMi,
            Platform.OS === 'android' ? { alarmButcesi: ANDROID_CUMA_PAYI } : {}
        );

        const teslimci = cumaTeslimcisiniAl();
        try {
            await teslimci.hazirla();
            // KRONOLOJİK sıra: iOS bütçesi sayaçla keser, ters sıra yakın uyarıları atardı.
            for (const kayit of plan) {
                await this.tekHatirlatmaPlanla(teslimci, kayit);
            }
        } finally {
            await teslimci.tamamla?.();
        }
    }

    /** Tek hatirlatmayi teslimciye verir. Bir cuma patlarsa KALANLAR yine kurulur. */
    private async tekHatirlatmaPlanla(teslimci: MuhafizTeslimcisi, kayit: CumaPlanKaydi): Promise<void> {
        try {
            await teslimci.uyariPlanla({
                id: kayit.id,
                baslik: kayit.baslik,
                mesaj: kayit.govde,
                zaman: kayit.zaman,
                // `anonsMetni` ÇÖZÜLMÜŞ cuma cümlesidir (yer tutucu içermez).
                uyari: kayit.uyari,
                // Kimlik öğle namazıdır ("Cuma" salt görünüm); yük `ozel.veri` yerine geçer.
                vakit: 'ogle',
                muhafizVakti: 'ogle',
                tarih: kayit.tarih,
                yon: 'cikisaDogru',
                // Pencere sonu (öğle girişi): gerçek alarm geç tetiklenirse çalmaz.
                cikis: kayit.ogle,
                ozel: {
                    veri: { ...CUMA_BILDIRIM_VERISI },
                    // Kategori YOK: muhafızın "Kıldım" düğmesi FARZ öğleyi yazardı.
                    kategori: null,
                    // Göçten gelen (varsayılan ses, titreşimsiz) adım bugünkü kanalda kalır.
                    varsayilanKanalId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                    varsayilanSistemSesi: true,
                    alarmAdi: 'Cuma',
                    alarmTuru: 'bilgi',
                },
            });
        } catch (e) {
            Logger.error('CumaHatirlatma', 'Planlama hatasi', e);
        }
    }

    /** `MuhafizKanalServisi.adimSesleriniDogrula` — tembel (köprü grafiği testlere sızmasın). */
    private async sesleriDogrula(ayarlar: CumaHatirlatmaAyarlari): Promise<CumaHatirlatmaAyarlari> {
        if (Platform.OS !== 'android') return ayarlar;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            return await MuhafizKanalServisi.adimSesleriniDogrula(ayarlar);
        } catch (e) {
            Logger.error('CumaHatirlatma', 'Sesler dogrulanamadi', e);
            return ayarlar;
        }
    }

    /** Ortak muhafız kanal uzayındaki cuma kanallarını oluşturur (çöp toplamaz). */
    private async kanallariHazirla(ayarlar: CumaHatirlatmaAyarlari): Promise<void> {
        if (Platform.OS !== 'android') return;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            await MuhafizKanalServisi.ekKanallariHazirla([{ yon: 'cikisaDogru', seviyeler: ayarlar.adimlar }]);
        } catch (e) {
            Logger.error('CumaHatirlatma', 'Kanallar hazirlanamadi', e);
        }
    }

    /** Bekleyen cuma bildirimleri + Android anons alarmları (yalnız `cuma_hatirlatma_` önekli). */
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
        anonslariOnekleIptalEt(ID_ONEKI);
    }
}
