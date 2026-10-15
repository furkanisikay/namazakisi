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
 *    Yan kanal iptalleri bu yuzden yalniz GERCEK ALARMLARA (madde 4) dokunur.
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
 *    BUTCE ARTIGI (yarinin imsagi, `UyariTeslimi.butceArtigi`): bugunun planindan
 *    SONRA gelir (cagrilar kronolojik) ve yalniz `yedekSigarMi` iken kurulur —
 *    `IOS_YEDEK_REZERVI` kadar slot daima bos kalir. Sigmayan artik KESILEN
 *    SAYILMAZ (kayip degil, yedek). Slot olculemediyse (`kalanSlot === null`)
 *    artik HIC kurulmaz: bugunun planini sistemin kesmesine biraktigimiz o turda
 *    kor bir yedek, bugunun uyarilarini sistemin kronolojik kesmesine itebilirdi.
 *    Gercek alarm (AlarmKit) 64'e sayilmadigi icin artikta da daima kurulur.
 *
 * 4. GERCEK ALARM — AlarmKit (iOS 26, issue #74). Alarm kanalli adimin ILK tetigi,
 *    AlarmKit izinliyken bildirim yerine SISTEM ALARMI olarak kurulur (sessiz anahtari
 *    ve Odak'i deler; 64 bekleyen bildirim butcesine SAYILMAZ — ayri sistem). Kimlik
 *    bildirimle AYNIDIR (`muhafizBildirimIdOlustur`; UUID kimlikten deterministik), iptal
 *    zinciri bu yuzden simetrik: `hazirla` onceki turun PLAN alarmlarini (muhafiz
 *    kapaliysa ertelenmisleri de) BEKLEYEREK iptal eder, uygulama ici "Kildim"
 *    (`vakitYanKanallariniIptalEt`) onekle, yeniden planlama (`tumYanKanallariIptalEt`)
 *    plan kimlikleriyle. Butun alarm koprusu cagrilari TEK bir zincirden gecer
 *    (`alarmIsi`): atesle-unut bir iptal ayni turda kurulan alarmi silemesin (Android
 *    `alarmlariHazirla` dersi). Kurulamazsa (izin yok, iOS < 26, Odak filtresi sessiz)
 *    ayni tetik bugunku yoldan (zamana duyarli bildirim + uzun ses) teslim edilir.
 *    O an CALAN alarm PLANLAMA iptallerinden (hazirla, yeniden planlama, erteleme
 *    araligi, tekil iptal) HARIC tutulur — Android kurali "planlama turu calan alarma
 *    dokunmaz"; yalniz "Kildim" (`vakitYanKanallariniIptalEt`) calani da susturur
 *    (`alarmKitIptalSecimi` + native `iptalEt(_, calaniDurdur)`).
 *
 * 5. ODAK FILTRESI (issue #279). Kullanici "Namaz" Odagina uygulamanin filtresini
 *    ekleyip "Hatirlatmalari sessiz ver"i acarsa, filtre acikken (en fazla 3 sa)
 *    tetiklenecek uyarilar `passive` kurulur: ekrani yakmaz, ses cikarmaz, Odagi
 *    delmez. Durum `hazirla`'da BIR KEZ okunur (`core/muhafiz/ios/odakFiltresi.ts`).
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
import { alarmKitIptalSecimi, alarmKitYukuOlustur } from '../../core/muhafiz/ios/alarmKit';
import {
    alarmKitDurumu,
    alarmKitIptalEt,
    alarmKitKayitlari,
    alarmKitPlanla,
} from '../../../modules/expo-muhafiz-alarmkit/src';
import {
    kullanilabilirSlotHesapla,
    yedekSigarMi,
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
import { ertelemeTeslimBilgisi, muhafizPlanKimligiMi } from '../../core/muhafiz/erteleme';
import { Depolama } from '../../data/local/Depolama';
import {
    klipSentezle,
    klipVarMi,
    kullanilmayanKlipleriSil,
    trSesTanimlayici,
} from '../../../modules/expo-muhafiz-anons/src';
import { siriOdakDurumuAl } from '../../../modules/expo-siri-kisayollari/src';
import {
    odakDurumunuCoz,
    odakSessizlestirirMi,
    type OdakFiltresiDurumu,
} from '../../core/muhafiz/ios/odakFiltresi';

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

/**
 * BU SÜREÇTE henüz `tamamla`'ya ulaşmamış turların klip adları (issue #273).
 *
 * İki teslimci (muhafız + nafile) aynı `Library/Sounds` dizinini ve aynı yaş
 * kaydını paylaşır. Nafile turu bir klip SENTEZLEYİP henüz kaydetmemişken
 * muhafızın `tamamla`'sı koşarsa o klip kayıtta yoktur ve SİLİNİRDİ — bildirim
 * de olmayan bir ses dosyasına bağlı kalırdı. Uçuştaki adlar GC'den korunur.
 */
const ucustakiKlipler = new Map<string, number>();

/** Klip çöp toplaması tek sıra: iki `tamamla` aynı kaydı aynı anda yazmasın. */
let klipGcZinciri: Promise<void> = Promise.resolve();

/** Testler için: süreç düzeyi uçuştaki klip kaydını sıfırlar (turunu bitirmeyen örnekler sızmasın). */
export function ucustakiKlipleriSifirla(): void {
    ucustakiKlipler.clear();
}

export interface IosTeslimciSecenekleri {
    /**
     * Bu teslimcinin bildirim kimlik öneki. Bütçe ölçümü "kendimiz dışındaki"
     * bekleyenleri sayar; nafile teslimcisi muhafız bildirimlerini de SAYMALIDIR
     * (aynı 64 sınırını paylaşırlar).
     */
    kendiOneki?: string;
    /**
     * Anons sesi matris verilmeden de hazırlansın mı? Muhafız matrissiz `hazirla`
     * = "muhafız kapalı" demektir (anons yok); nafile teslimcisi ise kendi
     * planını matrissiz kurar ve anonsu her turda ister (issue #273).
     */
    matrissizAnons?: boolean;
    /**
     * Gerçek alarm (AlarmKit, issue #74) bu teslimcide kurulsun mu? Varsayılan: yalnız
     * muhafız öneki. Nafile örneği `true` geçer (standart yetenek); iptalleri yalnız
     * KENDİ önekini (`nafile_`) seçer, muhafızın alarmlarına dokunmaz.
     */
    alarmDestegi?: boolean;
}

export class IosMuhafizTeslimcisi implements MuhafizTeslimcisi {
    readonly ad = 'ios' as const;

    private readonly kendiOneki: string;
    private readonly matrissizAnons: boolean;
    private readonly alarmDestegi: boolean;

    constructor(secenekler: IosTeslimciSecenekleri = {}) {
        this.kendiOneki = secenekler.kendiOneki ?? BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ;
        this.matrissizAnons = secenekler.matrissizAnons === true;
        this.alarmDestegi =
            secenekler.alarmDestegi ?? this.kendiOneki === BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ;
    }

    private muhafizMi(): boolean {
        return this.kendiOneki === BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ;
    }

    /** Muhafız DIŞI örneğin alarm kimlikleri (iptal seçicisi) — yalnız kendi öneki. */
    private readonly kendiKimligimizMi = (kimlik: string): boolean => kimlik.startsWith(this.kendiOneki);

    /** Bu turda gerçek alarm AlarmKit ile kurulabilir mi (iOS 26 + izin + muhafız açık)? */
    private alarmKitIzinli = false;
    /** Alarm köprüsü çağrılarının TEK sırası (iptal ↔ kurulum yarışmasın). */
    private alarmZinciri: Promise<void> = Promise.resolve();

    private alarmIsi(is: () => Promise<void>): Promise<void> {
        const sonraki = this.alarmZinciri.then(is).catch((error) => {
            Logger.warn('IosMuhafizTeslimcisi', 'Alarm koprusu islemi basarisiz', error);
        });
        this.alarmZinciri = sonraki;
        return sonraki;
    }

    /**
     * Kurulu alarmlardan seçileni iptal eder (zincirin İÇİNDE çağrılır). Varsayılan
     * PLANLAMA iptalidir: o an ÇALAN alarm atlanır (yeniden planlama kullanıcının
     * uyanmak için kurduğu alarmı kesmesin). Yalnız "Kıldım" `calaniDurdur: true` geçer.
     */
    private async alarmlariIptalEt(
        secici: (kimlik: string) => boolean,
        calaniDurdur = false
    ): Promise<void> {
        const kimlikler = alarmKitIptalSecimi(await alarmKitKayitlari(), secici, calaniDurdur);
        await alarmKitIptalEt(kimlikler, calaniDurdur);
    }

    /**
     * Bu planlama turunda kalan slot. `hazirla` ile olculur, `uyariPlanla` ile
     * tuketilir. `null` = henuz olculmedi (tek basina `uyariPlanla` cagrilirsa
     * butce uygulanmaz; cagiran zinciri bozmus demektir, plan kaybolmasin).
     */
    private kalanSlot: number | null = null;
    private kesilenSayisi = 0;
    /** Bu turda yer kalmadigi icin kurulmayan butce artigi (yarinin imsagi) — kayip DEGIL. */
    private atlananYedekSayisi = 0;

    /** Bu turda anons sentezinde kullanilacak Turkce ses; `null` = anons yok. */
    private sesTanimlayici: string | null = null;
    /** Bu turda eksik klip SENTEZLENEBILIR mi? (yalniz on planda) */
    private sentezIzni = false;
    /** Bu turda planlanan uyarilarin bagli oldugu klip adlari (GC korumasi). */
    private kullanilanKlipler = new Set<string>();
    /** Ayni ad icin diske/sentezlere bir kez gidilsin: ad → kullanilabilir mi. */
    private klipDurumu = new Map<string, boolean>();
    /** Bu turda okunan Odak filtresi durumu; `null` = filtre yok/okunamadi. */
    private odak: OdakFiltresiDurumu | null = null;

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
        this.atlananYedekSayisi = 0;
        this.ucustanBirak();
        this.kullanilanKlipler = new Set();
        this.klipDurumu = new Map();
        this.sentezIzni = onPlandaMi();
        // Kopru asla firlatmaz; bozuk/eksik kayit = filtre yok (hatirlatmalar normal).
        this.odak = odakDurumunuCoz(await siriOdakDurumuAl());
        // Ses tanimlayicisi klip adinin PARCASIDIR (gelismis ses indirilince adlar
        // degismeli). Kopru asla firlatmaz; ses yoksa `null` → anons yok.
        this.sesTanimlayici = matris || this.matrissizAnons ? await trSesTanimlayici() : null;

        // GERÇEK ALARM (issue #74): önceki turun alarmları BEKLENEREK iptal edilir — muhafız
        // açıkken yalnız PLAN alarmları (kullanıcının ertelemesi korunur, bildirimdeki
        // ertelemeyle aynı kural), kapalıyken ertelenmişler dahil hepsi.
        this.alarmKitIzinli = false;
        if (this.alarmDestegi) {
            const durum = await alarmKitDurumu();
            // Muhafızda matrissiz `hazirla` = "muhafız kapalı" (alarm yok); muhafız DIŞI
            // örnek (nafile) planını matrissiz kurar.
            this.alarmKitIzinli = (matris !== undefined || !this.muhafizMi()) && durum === 'izinli';
            await this.alarmIsi(() =>
                this.alarmlariIptalEt(
                    !this.muhafizMi()
                        ? this.kendiKimligimizMi
                        : matris
                          ? muhafizPlanKimligiMi
                          : (kimlik) => kimlik.startsWith(BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ)
                )
            );
        }

        try {
            const bekleyenler = await Notifications.getAllScheduledNotificationsAsync();
            // Muhafız teslimcisinde yalnız PLAN kendimizdir: aynı `muhafiz_` uzayındaki
            // erteleme (#289) ve yatış/muhasebe (#290) başka sahiplerin slotudur.
            // Başka önekli teslimci (nafile #273) kendi önekini sayar.
            const kendimizMi =
                this.kendiOneki === BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ
                    ? muhafizPlanKimligiMi
                    : (kimlik: string) => kimlik.startsWith(this.kendiOneki);
            const muhafizDisi = bekleyenler.filter((b) => !kendimizMi(b.identifier)).length;

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
        const { id, baslik, mesaj, zaman, uyari, vakit, tarih, ozel } = teslim;

        const simdi = new Date();
        if (zaman.getTime() <= simdi.getTime()) return;

        // Odak filtresi sessiz istiyorsa `passive`: ses calmaz, ekrani yakmaz, Odagi
        // delmez (zamana duyarli ozel teslim dahil). Ses cikmayacagi icin anons
        // klibi de URETILMEZ, gercek alarm da KURULMAZ (alarm Odak'i delerdi).
        const odakSessiz = odakSessizlestirirMi(this.odak, zaman.getTime());

        // GERCEK ALARM (AlarmKit): bildirim BUTCESINDEN ONCE — alarm 64 sinirina sayilmaz,
        // kurulursa bu tetigin bildirimi YOKTUR (slot da harcanmaz).
        if (await this.alarmKitIleKur(teslim, odakSessiz)) return;

        if (teslim.butceArtigi === true) {
            if (this.kalanSlot === null || !yedekSigarMi(this.kalanSlot)) {
                this.atlananYedekSayisi++;
                // Kayip degil: bugunun plani once sigar, yedek kalan yere girer.
                if (this.atlananYedekSayisi === 1) {
                    Logger.info(
                        'IosMuhafizTeslimcisi',
                        `Yarinin imsagi icin yer kalmadi (yedek) — bugunun plani once (ilki: ${id})`
                    );
                }
                return;
            }
        } else if (this.kalanSlot !== null) {
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

        // Buraya gelen tetik BILDIRIMDIR (AlarmKit yolu yukarida denendi). Acil adim da
        // bildirim olarak teslim edilir; ekran bunu kullaniciya SOYLER.
        const plan = iosTesliminiCoz(uyari, iosYetenekleri(false));
        // Sesli adimda bildirimin sesi ANONS KLIBIDIR; klip yoksa paket sesi kalir.
        // Slot kontrolunden SONRA: planlanmayacak uyari icin sentez yapilmaz.
        // GERCEK ALARM (issue #74): alarm adiminda ses UZUN alarm sesidir, anons klibi
        // onu ezmez (anons kisa bir cumle — alarmin varlik sebebi uzun calmasi).
        const ses = (odakSessiz || uyari.alarm === true ? null : await this.anonsSesiniCoz(teslim)) ?? plan.ses;

        // "Ertele" (issue #289): düğme kümesi sınıra kalan süreden (Android ile aynı kural).
        // Muhafız DIŞI teslim (`ozel`, nafile #273) ertele taşımaz.
        const ertele = teslim.cikis && !teslim.ozel
            ? ertelemeTeslimBilgisi(vakit, teslim.cikis.getTime(), zaman.getTime())
            : null;

        try {
            await Notifications.scheduleNotificationAsync({
                identifier: id,
                content: {
                    title: baslik,
                    body: mesaj,
                    // iOS'ta ses DOSYA ADIdir (kanal degil). <=30 sn olmali.
                    sound: ses,
                    interruptionLevel: odakSessiz
                        ? 'passive'
                        : ozel?.zamanaDuyarli ? 'timeSensitive' : plan.kesintiSeviyesi,
                    categoryIdentifier: ertele?.kategori ?? BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ,
                    data: ozel ? ozel.veri : {
                        tip: 'muhafiz',
                        seviye: uyari.seviye,
                        vakit: vakit,
                        tarih: tarih,
                        kanallar: uyari.kanallar,
                        bildirimSesi: uyari.bildirimSesi,
                        sesliAnons: uyari.sesliAnons,
                        anonsMetni: uyari.anonsMetni,
                        // iOS yanıtı sesin ADINI geri vermez → ertelenen kopya aynı
                        // sesi (anons klibi dahil) ve kesinti seviyesini buradan alır.
                        // Odak (#279): sessizlik KAYBOLMASIN — `odakSessiz` taşınır,
                        // basış anında Odak yeniden değerlendirilir
                        // (`MuhafizErtelemeServisi.iosKesintiSeviyesi`); `kesintiSeviyesi`
                        // Odak bitince dönülecek TABAN seviyedir.
                        ...(ertele
                            ? {
                                  ...ertele.veri,
                                  ertelemeSesi: ses,
                                  kesintiSeviyesi: plan.kesintiSeviyesi,
                                  odakSessiz,
                              }
                            : {}),
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
     * Gercek alarm tetigini AlarmKit ile kurar. `false` → cagiran normal bildirim yolunda
     * devam eder. Ozel teslim (nafile) ancak `ozel.alarmAdi` tasiyorsa alarm kurar ve
     * ERTELENMEZ (`cikisMs: null` → ikincil dugme "Kildim"; native kimlikten NAFILE
     * yoluna gider, FARZ yazmaz — `NamazAlarmCekirdegi.kildim`).
     */
    private async alarmKitIleKur(teslim: UyariTeslimi, odakSessiz: boolean): Promise<boolean> {
        const { uyari, ozel } = teslim;
        if (!this.alarmKitIzinli || odakSessiz) return false;
        if (ozel && !ozel.alarmAdi) return false;
        if (iosTesliminiCoz(uyari, iosYetenekleri(true)).tur !== 'alarm') return false;

        const yuk = alarmKitYukuOlustur({
            kimlik: teslim.id,
            tetikMs: teslim.zaman.getTime(),
            baslik: teslim.baslik,
            vakit: teslim.vakit,
            tarih: teslim.tarih,
            cikisMs: ozel ? null : (teslim.cikis?.getTime() ?? null),
        });
        let kuruldu = false;
        await this.alarmIsi(async () => {
            kuruldu = await alarmKitPlanla(yuk);
        });
        if (!kuruldu) {
            Logger.warn('IosMuhafizTeslimcisi', `Gercek alarm kurulamadi, bildirim olarak gelecek (${teslim.id})`);
        }
        return kuruldu;
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
        if (!this.kullanilanKlipler.has(ad)) ucustakiKlipler.set(ad, (ucustakiKlipler.get(ad) ?? 0) + 1);
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
        const kullanilan = this.kullanilanKlipler;
        const is = klipGcZinciri.then(async () => {
            try {
                const bugun = gunAnahtari(new Date());
                // Atomik okuma-değiştirme-yazma: öteki teslimcinin kaydı ezilmesin.
                const kayit = await Depolama.guncelle<Record<string, string>>(
                    DEPOLAMA_ANAHTARLARI.IOS_ANONS_KLIP_KULLANIMI,
                    (mevcut) => klipKaydiniGuncelle(mevcut, kullanilan, bugun)
                );
                this.ucustanBirak();
                const korunan = [...Object.keys(kayit), ...ucustakiKlipler.keys()];
                const silinen = await kullanilmayanKlipleriSil(korunan, ANONS_KLIP_ONEKI);
                if (silinen > 0) {
                    Logger.info('IosMuhafizTeslimcisi', `${silinen} kullanilmayan anons klibi silindi`);
                }
            } catch (error) {
                Logger.error('IosMuhafizTeslimcisi', 'Anons klibi temizligi basarisiz', error);
            }
        });
        klipGcZinciri = is;
        await is;
    }

    /** Bu turun klip adlarını "uçuşta" listesinden düşer (kayda yazıldılar ya da tur yenilendi). */
    private ucustanBirak(): void {
        for (const ad of this.kullanilanKlipler) {
            const kalan = (ucustakiKlipler.get(ad) ?? 1) - 1;
            if (kalan > 0) ucustakiKlipler.set(ad, kalan);
            else ucustakiKlipler.delete(ad);
        }
    }

    /**
     * Ayni kimlikli GERCEK ALARM (AlarmKit) iptal edilir. Sesli anons iOS'ta bildirimin
     * SESIDIR (ayri zincir degil) → bildirim iptal edilince o da gider. Planlama iptalidir:
     * o an CALAN alarm native tarafta atlanir (`calaniDurdur` varsayilan false).
     */
    yanKanaliIptalEt(id: string): void {
        if (!this.alarmDestegi) return;
        void this.alarmIsi(() => alarmKitIptalEt([id]));
    }

    /** Yeniden planlama oncesi: PLAN alarmlari (erteleme korunur; `hazirla` ayrica bekleyerek siler). */
    tumYanKanallariIptalEt(): void {
        if (!this.alarmDestegi) return;
        void this.alarmIsi(() =>
            this.alarmlariIptalEt(this.muhafizMi() ? muhafizPlanKimligiMi : this.kendiKimligimizMi)
        );
    }

    /**
     * Uygulama ici "Kildim": vaktin alarmlari (plan + erteleme) onekle — o an CALAN alarm
     * DAHIL (Android `vakitAlarmlariniSustur` ikizi: "Kılındı" yazarken alarm calmamali).
     */
    vakitYanKanallariniIptalEt(onek: string): void {
        if (!this.alarmDestegi || !onek) return;
        void this.alarmIsi(() => this.alarmlariIptalEt((kimlik) => kimlik.startsWith(onek), true));
    }

    /** Bildirimdeki "Ertele" (JS yolu): susturulan araliktaki alarmlar. */
    secilenYanKanallariIptalEt(secici: (kimlik: string) => boolean): Promise<void> {
        if (!this.alarmDestegi) return Promise.resolve();
        return this.alarmIsi(() => this.alarmlariIptalEt(secici));
    }
}
