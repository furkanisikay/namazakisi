import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import {
    CAMIYE_GIT_ID_ONEKI,
    CAMIYE_GIT_PLAN_GUN_SAYISI,
    camiyeGitPlaniOlustur,
    type CamiyeGitPlanKaydi,
} from '../../core/bildirim/camiyeGitPlani';
import type { CamiyeGitAyarlari } from '../../core/camiyeGit/camiyeGitAyarlari';
import { ANDROID_CAMIYE_GIT_PAYI, IOS_ALARMKIT_CAMIYE_GIT_PAYI } from '../../core/bildirim/butceSabitleri';
import { onekSahipligi } from '../../core/muhafiz/teslimSahipligi';
import { VAKIT_ADLARI } from '../../core/utils/muhafizMetinYardimcisi';
import { LocalCamiyeGitServisi } from '../../data/local/LocalCamiyeGitServisi';
import { LocalCumaHatirlatmaServisi } from '../../data/local/LocalCumaHatirlatmaServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import type { MuhafizTeslimcisi } from './MuhafizTeslimcisi';

export interface CamiyeGitKoordinat {
    lat: number;
    lng: number;
}

/**
 * CAMİYE GİTME TESLİMCİSİ — muhafızla AYNI teslim katmanı, AYRI örnek (plan §3.2; cuma
 * deseni). Kanal uzayı, titreşim, sesli anons (Android TTS alarmı / iOS anons klibi),
 * gerçek alarm ve ses seçimi AYNI koddan gelir. Ayrı ÖRNEK şart: muhafızın tur başı bütçe
 * sayacı ve iOS slot ölçümü bu turla karışmamalı.
 * - Android: kanal hazırlığı KİMLİK (çöp toplama muhafızın işidir; kanalları
 *   `MuhafizKanalServisi.ekKanallariHazirla` oluşturur, `ekHatirlatmaKaynaklari` korur),
 *   önceki turun anons/alarmları yalnız `camiye_git_` önekiyle silinir, pay
 *   `ANDROID_CAMIYE_GIT_PAYI` (asıl kesme üreticide; teslimcideki sayaç emniyet ağı).
 * - iOS: bütçe ölçümü "kendi dışındaki" bekleyenleri sayar (ortak 64 defteri), anons sesi
 *   matrissiz hazırlanır, AlarmKit payı `IOS_ALARMKIT_CAMIYE_GIT_PAYI`.
 *
 * Seçim ENJEKTE EDİLEBİLİR (jest varsayılan platformu iOS'tur — AGENTS.md).
 */
let _teslimci: MuhafizTeslimcisi | null = null;

export function camiyeGitTeslimcisiniAl(): MuhafizTeslimcisi {
    if (_teslimci) return _teslimci;
    if (Platform.OS === 'ios') {
        const { IosMuhafizTeslimcisi } =
            require('./IosMuhafizTeslimcisi') as typeof import('./IosMuhafizTeslimcisi');
        _teslimci = new IosMuhafizTeslimcisi({
            sahiplik: onekSahipligi(CAMIYE_GIT_ID_ONEKI),
            matrissizAnons: true,
            alarmDestegi: true,
            alarmKitPayi: IOS_ALARMKIT_CAMIYE_GIT_PAYI,
        });
    } else {
        const { AndroidMuhafizTeslimcisi } =
            require('./AndroidMuhafizTeslimcisi') as typeof import('./AndroidMuhafizTeslimcisi');
        _teslimci = new AndroidMuhafizTeslimcisi({
            alarmButcesi: ANDROID_CAMIYE_GIT_PAYI,
            kanalHazirligi: async (m) => m,
            sahiplik: onekSahipligi(CAMIYE_GIT_ID_ONEKI),
            // Gerçek alarm STANDART yetenek; alarm KANALLARINI muhafız toplar.
            alarmDestegi: true,
            alarmKanalTemizligi: false,
        });
    }
    return _teslimci;
}

/** Test / özel senaryo: teslimciyi ayarla (`null` → platformdan yeniden türet). */
export function camiyeGitTeslimcisiniAyarla(teslimci: MuhafizTeslimcisi | null): void {
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
        Logger.error('CamiyeGit', 'Anons alarmlari iptal edilemedi', e);
    }
}

/**
 * "Camide kılacağım" hatırlatması (issue #292; ortak hatırlatma yüzeyleri plan §5.2).
 *
 * KOORDİNAT PARAMETREDİR (`NamazVaktiHesaplayiciServisi.getKonfig()`'ten
 * okunmaz): o konfig bellek-içidir, arka plan görevinde kurulu olmayabilir.
 * Plan SAF üreticiden gelir (`core/bildirim/camiyeGitPlani.ts`) — bildirim
 * defteri aynı listeyi sayar. Camideyim köprüsünü İMPORT ETMEZ (tahmin yalnız ekranda
 * yapılır); böylece bu servisi yükleyen testler o köprüyü mock'lamaz.
 *
 * "KILDIM" YOK: bildirim kategorisizdir (`kategori: null`), yükü muhafız yükü değildir,
 * gerçek alarmı BİLGİ türüdür (yalnız "Kapat") — ezandan önce gelen hatırlatmada kılınacak
 * bir şey yoktur.
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
        // Özel sesler DOĞRULANIR (Android; cuma ile aynı gerekçe — id paritesi).
        const ayarlar = await this.sesleriDogrula(await LocalCamiyeGitServisi.getAyarlar());

        if (!ayarlar.aktif) {
            await this.mevcutlariTemizle();
            // Bekleyen GERÇEK ALARMLAR expo listesinde yoktur: teslimcinin hazırlığı önceki
            // turunkileri `camiye_git_` önekiyle siler.
            const teslimci = camiyeGitTeslimcisiniAl();
            try {
                await teslimci.hazirla();
            } finally {
                await teslimci.tamamla?.();
            }
            return;
        }

        // (0,0) = konum yüklenmemiş. TEMİZLİKTEN ÖNCE kontrol: bayat plan plansızlıktan iyidir.
        if (!koordinatlar || (koordinatlar.lat === 0 && koordinatlar.lng === 0)) {
            Logger.warn('CamiyeGit', 'Konum yok, mevcut plan korunuyor');
            return;
        }

        // Kanallar planlamadan ÖNCE (Android 8+ var olmayan kanala gideni göstermez).
        await this.kanallariHazirla(ayarlar);

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
            ...(platform === 'android' ? { alarmButcesi: ANDROID_CAMIYE_GIT_PAYI } : {}),
        });

        const teslimci = camiyeGitTeslimcisiniAl();
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

    /** Tek hatırlatmayı teslimciye verir. Biri patlarsa KALANLAR yine kurulur. */
    private async tekHatirlatmaPlanla(teslimci: MuhafizTeslimcisi, kayit: CamiyeGitPlanKaydi): Promise<void> {
        try {
            await teslimci.uyariPlanla({
                id: kayit.id,
                baslik: kayit.baslik,
                mesaj: kayit.govde,
                zaman: kayit.zaman,
                // `anonsMetni` ÇÖZÜLMÜŞ cümledir (yer tutucu içermez).
                uyari: kayit.uyari,
                vakit: kayit.vakit,
                muhafizVakti: kayit.vakit,
                tarih: kayit.tarih,
                yon: 'cikisaDogru',
                // Pencere sonu (vaktin girişi): gerçek alarm geç tetiklenirse çalmaz.
                cikis: kayit.giris,
                ozel: {
                    veri: { tip: 'camiye_git', vakit: kayit.vakit, tarih: kayit.tarih },
                    // Kategori YOK: muhafızın "Kıldım" düğmesi FARZ namazı yazardı.
                    kategori: null,
                    // Göçten gelen (varsayılan ses, titreşimsiz) adım bugünkü kanalda kalır.
                    varsayilanKanalId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                    varsayilanSistemSesi: true,
                    alarmAdi: `${VAKIT_ADLARI[kayit.vakit]} · camiye`,
                    alarmTuru: 'bilgi',
                },
            });
        } catch (e) {
            Logger.error('CamiyeGit', 'Planlama hatasi', e);
        }
    }

    /** `MuhafizKanalServisi.adimSesleriniDogrula` — tembel (köprü grafiği testlere sızmasın). */
    private async sesleriDogrula(ayarlar: CamiyeGitAyarlari): Promise<CamiyeGitAyarlari> {
        if (Platform.OS !== 'android') return ayarlar;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            return await MuhafizKanalServisi.adimSesleriniDogrula(ayarlar);
        } catch (e) {
            Logger.error('CamiyeGit', 'Sesler dogrulanamadi', e);
            return ayarlar;
        }
    }

    /** Ortak muhafız kanal uzayındaki kanalları oluşturur (çöp toplamaz). */
    private async kanallariHazirla(ayarlar: CamiyeGitAyarlari): Promise<void> {
        if (Platform.OS !== 'android') return;
        try {
            const { MuhafizKanalServisi } =
                require('./MuhafizKanalServisi') as typeof import('./MuhafizKanalServisi');
            await MuhafizKanalServisi.ekKanallariHazirla([{ yon: 'cikisaDogru', seviyeler: ayarlar.adimlar }]);
        } catch (e) {
            Logger.error('CamiyeGit', 'Kanallar hazirlanamadi', e);
        }
    }

    /** Bekleyen bildirimler + Android anons alarmları (yalnız `camiye_git_` önekli). */
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
        anonslariOnekleIptalEt(CAMIYE_GIT_ID_ONEKI);
    }
}
