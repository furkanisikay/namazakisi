/**
 * iOS TESLIMCISI (Faz 1 — bildirim teslimi).
 *
 * Android'den UC yapisal fark:
 *
 * 1. KANAL YOK. iOS'ta ses kanal degil BILDIRIM ozelligidir ve uygulama
 *    paketindeki bir dosya adidir → `hazirla` kanal olusturmaz, matrisi oldugu
 *    gibi dondurur. (`MuhafizKanalServisi` zaten Android disinda erken doner;
 *    burada hic cagrilmaz ki bagimlilik da olusmasin.)
 *
 * 2. YAN KANAL YOK. Sesli anons Android'de ayri bir exact-alarm zinciridir;
 *    iOS'ta belirli bir saatte arka planda kod CALISTIRILAMAZ, dolayisiyla
 *    calisma aninda TTS mumkun degil. Faz 2'de anons, bildirime ILISTIRILEN
 *    on-kayitli bir ses klibi olacak — yani yine "yan kanal" degil, bildirimin
 *    kendisi. Iptal fonksiyonlari bu yuzden no-op'tur.
 *
 * 3. 64 BEKLEYEN SINIRI. Sistem en yakin 64 bildirimi tutar, gerisini SESSIZCE
 *    atar. Butce `core/muhafiz/ios/bildirimButcesi.ts`'te; bu teslimci her
 *    planlamada kalan slotu olcer ve tukendiginde KESILENI LOGLAR (sessiz kayip
 *    yerine gorunur kayip).
 *
 * Motor ve plan uretimi DEGISMEZ — bu dosya yalnizca "nasil duyulur"u bilir.
 *
 * ---------------------------------------------------------------------------
 * ON KOSUL — `uyariPlanla` CAGRILARI KRONOLOJIK GELMELIDIR.
 *
 * Butce basit bir sayacla uygulanir: slot tukendiginde SONRA gelen cagrilar
 * kesilir. Bu ancak cagrilar zaman sirasinda geliyorsa dogru sonucu verir ve
 * bugun oyledir — `ArkaplanMuhafizServisi.bugunVakitleriniHesapla` vakitleri
 * kronolojik uretir (gece yarisi sonrasi DUNUN yatsisi listeye BASA eklenir) ve
 * `vakitUyariPlaniOlustur` her vakit icinde en uzak uyaridan baslar.
 *
 * Sira bozulursa butce YANLIS UCU keser: yakin tarihli uyarilar atilir,
 * uzaktakiler tutulur. O gun geldiginde teslimler once toplanip
 * `bildirimButcesi.butceyeSigdir` ile kronolojik elenmeli, sonra planlanmalidir
 * — saf fonksiyon ve testleri tam bu senaryo icin hazir duruyor.
 */
import * as Notifications from 'expo-notifications';

import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { iosYetenekleri } from '../../core/muhafiz/ios/platformYetenekleri';
import { iosTesliminiCoz } from '../../core/muhafiz/ios/teslimPlani';
import {
    kullanilabilirSlotHesapla,
    IOS_BEKLEYEN_TAVANI,
} from '../../core/muhafiz/ios/bildirimButcesi';
import type { MuhafizTeslimcisi, UyariTeslimi } from './MuhafizTeslimcisi';

export class IosMuhafizTeslimcisi implements MuhafizTeslimcisi {
    readonly ad = 'ios' as const;

    /**
     * Bu planlama turunda kalan slot. `hazirla` ile olculur, `uyariPlanla` ile
     * tuketilir. `null` = henuz olculmedi (tek basina `uyariPlanla` cagrilirsa
     * butce uygulanmaz; cagiran zinciri bozmus demektir, plan kaybolmasin).
     */
    private kalanSlot: number | null = null;
    private kesilenSayisi = 0;

    /**
     * iOS'ta kanal yok → matris aynen doner.
     *
     * Yapilan tek is BUTCE OLCUMU: muhafiz DISINDAKI bekleyen bildirimleri
     * (vakit bildirimleri, cuma) sayip kendimize kalan slotu belirlemek.
     * Olcum burada yapilir cunku `hazirla` planlamadan ONCE ve planlama basina
     * BIR KEZ calisir — her bildirimde listeyi yeniden okumak pahali olurdu.
     */
    async hazirla(matris?: MuhafizMatrisi): Promise<MuhafizMatrisi | undefined> {
        this.kesilenSayisi = 0;

        try {
            const bekleyenler = await Notifications.getAllScheduledNotificationsAsync();
            const muhafizDisi = bekleyenler.filter(
                (b) => !b.identifier.startsWith(BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ)
            ).length;

            this.kalanSlot = kullanilabilirSlotHesapla(muhafizDisi);

            Logger.info(
                'IosMuhafizTeslimcisi',
                `Bildirim butcesi: ${this.kalanSlot} slot (tavan ${IOS_BEKLEYEN_TAVANI}, muhafiz disi bekleyen ${muhafizDisi})`
            );
        } catch (error) {
            // Olculemezse butce UYGULANMAZ (plani kesmektense sistemin kendi
            // kesmesine birakmak yeglenir — en azindan en yakinlar korunur).
            this.kalanSlot = null;
            Logger.error('IosMuhafizTeslimcisi', 'Bildirim butcesi olculemedi', error);
        }

        return matris;
    }

    async uyariPlanla(teslim: UyariTeslimi): Promise<void> {
        const { id, baslik, mesaj, zaman, uyari, vakit, tarih } = teslim;

        const simdi = new Date();
        if (zaman.getTime() <= simdi.getTime()) return;

        if (this.kalanSlot !== null) {
            if (this.kalanSlot <= 0) {
                this.kesilenSayisi++;
                // Ilk kesmede bir kez uyar; her bildirimde loglamak gurultu olur.
                if (this.kesilenSayisi === 1) {
                    Logger.warn(
                        'IosMuhafizTeslimcisi',
                        `64 bekleyen bildirim siniri doldu — bu turdaki fazla uyarilar planlanmiyor (ilki: ${id})`
                    );
                }
                return;
            }
            // NOT: slot burada TUKETILMEZ — planlama basarili olursa asagida
            // dusulur. Once dusulseydi `scheduleNotificationAsync` hata verdigi
            // her uyari icin de slot harcanir ve gercekte 64 sinirinin cok
            // altindayken sonraki mesru uyarilar "slot doldu" diye sessizce
            // planlanmazdi.
        }

        // Faz 1: AlarmKit yok → `sessizligiDelebilir: false`. Acil adim da
        // bildirim olarak teslim edilir; ekran bunu kullaniciya SOYLER.
        const plan = iosTesliminiCoz(uyari, iosYetenekleri(false));

        try {
            await Notifications.scheduleNotificationAsync({
                identifier: id,
                content: {
                    title: baslik,
                    body: mesaj,
                    // iOS'ta ses DOSYA ADIdir (kanal degil). <=30 sn olmali.
                    sound: plan.ses,
                    interruptionLevel: plan.kesintiSeviyesi,
                    categoryIdentifier: BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ,
                    data: {
                        tip: 'muhafiz',
                        seviye: uyari.seviye,
                        vakit: vakit,
                        tarih: tarih,
                        kanallar: uyari.kanallar,
                        bildirimSesi: uyari.bildirimSesi,
                        sesliAnons: uyari.sesliAnons,
                        anonsMetni: uyari.anonsMetni,
                    },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: zaman,
                    // channelId YOK — Android'e ozgu alan.
                },
            });

            // Slot YALNIZ cihazda gercekten kurulan bildirim icin dusulur.
            if (this.kalanSlot !== null) this.kalanSlot--;
        } catch (error) {
            Logger.error('IosMuhafizTeslimcisi', `Bildirim planlanamadi: ${id}`, error);
        }
    }

    /** iOS'ta bildirimin disinda bir yan kanal yok → no-op. */
    yanKanaliIptalEt(): void {
        // Bilincli bos: sesli anons iOS'ta bildirimin SESIDIR, ayri bir alarm
        // zinciri degil. Bildirim iptal edilince sesi de gider.
    }

    /** iOS'ta yan kanal yok → no-op. */
    tumYanKanallariIptalEt(): void {
        // Bilincli bos (yukaridaki gerekce).
    }
}
