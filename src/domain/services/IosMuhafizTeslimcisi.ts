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
 *    calisma aninda TTS mumkun degil. Faz 2: anons metni PLANLAMA SIRASINDA
 *    cihazda (cevrimdisi `AVSpeechSynthesizer`) ses dosyasina cevrilir ve
 *    bildirimin SESI olur — yani yine "yan kanal" degil, bildirimin kendisi.
 *    Iptal fonksiyonlari bu yuzden no-op'tur.
 *
 *    BAGLAM KURALI — SENTEZ YALNIZ ON PLANDA: arka plan gorevinin (background
 *    fetch) sure butcesi ~30 sn'dir ve sistem asimda uygulamayi oldurur;
 *    ustelik sentezin arka planda calisacagi garanti degildir. Arka planda
 *    yalniz ZATEN VAR OLAN klipler kullanilir, eksik olan varsayilan sese
 *    duser. Klipler kullanici ayar ekranindan ciktiginda / uygulamayi actiginda
 *    (on plan planlamasi) uretilir; dosya seti yalniz ayar degisince degistigi
 *    icin bu pratikte yeterlidir.
 *
 *    COP TOPLAMA `tamamla`da ve YASA dayalidir (`klipKullanimi.ts`): "bu turda
 *    kullanilmayani sil" yanlis olurdu — kilinmis vaktin klipleri o turda
 *    planlanmaz ve ertesi gun arka planda yeniden uretilemezdi.
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
import * as ReactNative from 'react-native';

import { BILDIRIM_SABITLERI, DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { iosYetenekleri } from '../../core/muhafiz/ios/platformYetenekleri';
import { iosTesliminiCoz } from '../../core/muhafiz/ios/teslimPlani';
import {
    kullanilabilirSlotHesapla,
    IOS_BEKLEYEN_TAVANI,
} from '../../core/muhafiz/ios/bildirimButcesi';
import type { MuhafizTeslimcisi, UyariTeslimi } from './MuhafizTeslimcisi';
import {
    ANONS_KLIP_ONEKI,
    anonsKlipAdi,
    anonsSentezlenebilirMi,
} from '../../core/muhafiz/ios/anonsKlibi';
import { gunAnahtari, klipKaydiniGuncelle } from '../../core/muhafiz/ios/klipKullanimi';
import { anonsMetniniCoz } from '../../core/muhafiz/anonsMetni';
import { Depolama } from '../../data/local/Depolama';
import {
    klipSentezle,
    klipVarMi,
    kullanilmayanKlipleriSil,
    trSesTanimlayici,
} from '../../../modules/expo-muhafiz-anons/src';

/**
 * Uygulama su an ON PLANDA mi? (sentez izni)
 *
 * `AppState` bazi test mock'larinda hic yoktur (`react-native` yalniz `Platform`
 * ile mock'lanir) → okunamazsa GUVENLI TARAF: on planda DEGIL sayilir, sentez
 * yapilmaz, var olan klipler yine kullanilir.
 */
function onPlandaMi(): boolean {
    try {
        return ReactNative.AppState?.currentState === 'active';
    } catch {
        return false;
    }
}

export class IosMuhafizTeslimcisi implements MuhafizTeslimcisi {
    readonly ad = 'ios' as const;

    /**
     * Bu planlama turunda kalan slot. `hazirla` ile olculur, `uyariPlanla` ile
     * tuketilir. `null` = henuz olculmedi (tek basina `uyariPlanla` cagrilirsa
     * butce uygulanmaz; cagiran zinciri bozmus demektir, plan kaybolmasin).
     */
    private kalanSlot: number | null = null;
    private kesilenSayisi = 0;

    /** Bu turda anons sentezinde kullanilacak Turkce ses; `null` = anons yok. */
    private sesTanimlayici: string | null = null;
    /** Bu turda eksik klip SENTEZLENEBILIR mi? (yalniz on planda) */
    private sentezIzni = false;
    /** Bu turda planlanan uyarilarin bagli oldugu klip adlari (GC korumasi). */
    private kullanilanKlipler = new Set<string>();
    /** Ayni ad icin diske/sentezlere bir kez gidilsin: ad → kullanilabilir mi. */
    private klipDurumu = new Map<string, boolean>();

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
        this.kullanilanKlipler = new Set();
        this.klipDurumu = new Map();
        this.sentezIzni = onPlandaMi();
        // Ses tanimlayicisi klip adinin PARCASIDIR (gelismis ses indirilince adlar
        // degismeli). Kopru asla firlatmaz; ses yoksa `null` → anons yok.
        this.sesTanimlayici = matris ? await trSesTanimlayici() : null;

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
        // Sesli adimda bildirimin sesi ANONS KLIBIDIR; klip yoksa paket sesi kalir.
        // Slot kontrolunden SONRA: planlanmayacak uyari icin sentez yapilmaz.
        const ses = (await this.anonsSesiniCoz(teslim)) ?? plan.ses;

        try {
            await Notifications.scheduleNotificationAsync({
                identifier: id,
                content: {
                    title: baslik,
                    body: mesaj,
                    // iOS'ta ses DOSYA ADIdir (kanal degil). <=30 sn olmali.
                    sound: ses,
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

    /**
     * Sesli adimin anons klibi (dosya adi) — kullanilamiyorsa `null`.
     *
     * Asla firlatmaz: kopru fonksiyonlari hata yutar; anons kaybolursa bildirim
     * yine paket sesiyle gelir (sessiz kayip degil, zayiflamis teslim).
     */
    private async anonsSesiniCoz(teslim: UyariTeslimi): Promise<string | null> {
        const { uyari } = teslim;
        if (!uyari.sesliAnons || !this.sesTanimlayici) return null;

        // Metin `olcuDk` ile cozulur (`kalanDk` ZAMANLAMA alanidir): giris
        // yonunde ikisi farklidir ve yanlis alan "son 42 dakika" okuturdu.
        const metin = anonsMetniniCoz(uyari.anonsMetni, teslim.muhafizVakti, uyari.olcuDk, teslim.yon);
        if (!anonsSentezlenebilirMi(metin)) return null;

        const ad = anonsKlipAdi({ cozulmusMetin: metin, sesTanimlayici: this.sesTanimlayici });
        // Dosya henuz olmasa da AD kaydedilir: arka plan turunda uretilemeyen bir
        // klibin adi korunursa, bir sonraki on plan turunda uretilen dosya ilk GC'de
        // silinmez. Var olmayan dosya icin kayit zararsizdir.
        this.kullanilanKlipler.add(ad);

        const bilinen = this.klipDurumu.get(ad);
        if (bilinen !== undefined) return bilinen ? ad : null;

        let hazir = await klipVarMi(ad);
        if (!hazir && this.sentezIzni) {
            hazir = await klipSentezle(metin.trim(), ad);
            if (!hazir) {
                Logger.warn('IosMuhafizTeslimcisi', `Anons klibi uretilemedi, paket sesi kullaniliyor (${ad})`);
            }
        }
        this.klipDurumu.set(ad, hazir);
        return hazir ? ad : null;
    }

    /**
     * Tur sonu: anons kliplerinin YASA DAYALI cop toplamasi.
     *
     * Son `KLIP_TUTMA_GUNU` gunde planlanmis klipler korunur, gerisi silinir.
     * Asla firlatmaz.
     */
    async tamamla(): Promise<void> {
        try {
            const bugun = gunAnahtari(new Date());
            const mevcut = await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.IOS_ANONS_KLIP_KULLANIMI);
            const kayit = klipKaydiniGuncelle(mevcut, this.kullanilanKlipler, bugun);

            await Depolama.yaz(DEPOLAMA_ANAHTARLARI.IOS_ANONS_KLIP_KULLANIMI, kayit);
            const silinen = await kullanilmayanKlipleriSil(Object.keys(kayit), ANONS_KLIP_ONEKI);
            if (silinen > 0) {
                Logger.info('IosMuhafizTeslimcisi', `${silinen} kullanilmayan anons klibi silindi`);
            }
        } catch (error) {
            Logger.error('IosMuhafizTeslimcisi', 'Anons klibi temizligi basarisiz', error);
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
