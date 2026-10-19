/**
 * MUHAFIZ TESLIMCISI — "ayni matris, platforma gore TESLIM" (iOS portu Faz 1).
 *
 * Motorun *ne zaman, hangi adimin, hangi kanallarla* konusacagini soyleyen
 * cekirdek (`muhafizMatrisiniCoz` → `aktifSeviyeyiBul` → `seviyeTetiklenirMi` →
 * `vakitUyariPlaniOlustur`) PLATFORMDAN BAGIMSIZ ve SAF kalir; tek satiri
 * degismez. Platform farki yalnizca burada, TESLIM katmaninda yasar: bir
 * `UyariPlani`'nin cihazda *nasil* duyulacagi.
 *
 * Android: bildirim kanali (ses + titresim kanal ozelligidir) + exact alarm ile
 * native TTS anonsu.
 * iOS: kanal yok (ses bildirim basina); arka planda kod calistirilamadigi icin
 * anons calisma aninda degil PLANLAMADA cihazda ses dosyasina cevrilir ve
 * bildirimin sesi olur (Faz 2); aciliyet `interruptionLevel` ve (Faz 3)
 * AlarmKit ile tasinir.
 *
 * ---------------------------------------------------------------------------
 * SECIM NEDEN ENJEKTE EDILEBILIR? (jest tuzagi — olculdu, AGENTS.md'de kayitli)
 *
 * Bu repoda jest'in VARSAYILAN `Platform.OS` degeri **`ios`**
 * (`preset: "react-native"` → `haste.defaultPlatform: 'ios'`). Secim yalnizca
 * `Platform.OS`a baglansaydi, `react-native`i hic mock'lamayan
 * `ArkaplanMuhafizServisi.test.ts` (Android davranis sozlesmesinin nobetcisi)
 * SESSIZCE iOS teslimcisine duser ve olcmek istedigi seyi olcmeyi birakirdi —
 * yesil kalarak. Bu yuzden secim bir setter ile acikca degistirilebilir:
 * varsayilan platformdan turetilir, testler ve ozel senaryolar acikca yazar.
 */
import { Platform } from 'react-native';

import type { VakitAdi } from '../../core/types';
import type { MuhafizMatrisi, MuhafizVakti } from '../../core/muhafiz/matrisTipleri';
import type { UyariPlani } from '../../core/muhafiz/motorAdaptoru';
import type { PencereYonu } from '../../core/muhafiz/pencereTipleri';
import type { AlarmTuru } from '../../core/muhafiz/alarmYuku';

/** Namaz vakti bilgisi — teslimci ve servis arasinda paylasilan sozlesme. */
export interface VakitZamani {
    vakit: VakitAdi;
    giris: Date;
    cikis: Date;
    /** YYYY-MM-DD — vaktin ait oldugu gun (yatsi icin onceki gun olabilir). */
    tarih: string;
    /** Plana SONA eklenen yarinin imsagi mi? (`MuhafizVakitZamani.yarininImsagi`) */
    yarininImsagi?: true;
}

/** Cihaza teslim edilecek TEK bir uyari. */
export interface UyariTeslimi {
    /** Bildirim kimligi. Yan kanallar (TTS alarmi) AYNI id ile planlanir. */
    id: string;
    baslik: string;
    mesaj: string;
    /** Tetik ani (mutlak). Daima `cikis - kalanDk`; yon ne olursa olsun. */
    zaman: Date;
    uyari: UyariPlani;
    vakit: VakitAdi;
    /** Matristeki vakit kimligi ('gunes' muhafizda yoktur). */
    muhafizVakti: MuhafizVakti;
    tarih: string;
    yon: PencereYonu;
    /**
     * Vaktin cikisi (penceresinin sonu) — gercek alarmin gec tetik kapisi (`cikisMs`)
     * buradan turer. Verilmeyebilir (eski el yapimi teslimler/testler).
     */
    cikis?: Date;
    /**
     * BÜTÇE ARTIĞI (iOS, yarının imsağı — `muhafizTeslimPlani.yarininImsagiKipi`):
     * yalnız bugünün planı sığdıktan sonra kalan slota kurulur; sığmazsa SESSİZCE
     * atlanır ve "kesilen" sayılmaz. Yalnız `true` iken yazılır (alan yoksa bugünün
     * planıdır → Android teslimi ve kayıt-oynat birebir aynı kalır).
     */
    butceArtigi?: true;
    /**
     * Muhafız DIŞI bir tüketicinin (nafile, issue #273) teslim ayrıntıları.
     * Verilmezse muhafız davranışı BİREBİR korunur (kayıt-oynat nöbetçisi).
     *
     * `veri` ZORUNLUDUR: muhafız yükü (`tip: 'muhafiz', vakit, tarih`) "Kıldım"da
     * FARZ namazı kılındı diye işaretler — nafile bildirimi o yükü taşırsa nafile
     * için basılan Kıldım öğleyi kaydederdi.
     */
    ozel?: OzelTeslim;
}

export interface OzelTeslim {
    /** Bildirimin `data` yükü (muhafız yükünün YERİNE). */
    veri: Record<string, unknown>;
    /** Android: kanal id'si zorlanır (ör. teheccüd uyandırması `nafile_uyandirma`). */
    kanalId?: string;
    /** iOS: Odak'ı delen `timeSensitive` kesinti seviyesi zorlanır. */
    zamanaDuyarli?: boolean;
    /**
     * GERÇEK ALARM (issue #74) bu özel teslimde destekleniyor mu? Verilirse alarm
     * ekranında görünen ad budur ("Teheccüd"). Verilmezse özel teslim alarm KURMAZ
     * (tetik normal bildirim olur). Kimlik öneki (ör. `nafile_`) native tarafta
     * "Kıldım"ın doğru yola (nafile, FARZ DEĞİL) gitmesini belirler.
     */
    alarmAdi?: string;
    /**
     * Bildirim KATEGORİSİ (eylem düğmeleri). `null` = kategori YOK: cuma / camiye gitme /
     * takvim bildiriminde muhafız kategorisinin "Kıldım" düğmesi FARZ namazı yazardı
     * (vakit girmeden gelen hatırlatmada kılınacak bir şey yoktur). `undefined` = muhafız
     * davranışı (`MUHAFIZ` kategorisi — nafile bunu kullanır).
     */
    kategori?: string | null;
    /**
     * Android: adım VARSAYILAN ses + titreşimsizken kullanılacak kanal. Göçten gelen kayıt
     * bugünkü kanalında kalır (cuma: `vakit_bildirim`); kullanıcı ses ya da titreşim
     * seçince ortak `muhafiz_<hash8>` uzayına geçer. `kanalId` zorlaması bundan önce gelir.
     */
    varsayilanKanalId?: string;
    /**
     * iOS: adım varsayılan sesteyken (ve sesli anons klibi yokken) bildirim SİSTEM sesiyle
     * (`sound: true`) çalar — paket sesine (`bildirim.wav`) çevrilmez. Göçten gelen kayıt
     * (cuma bugün `sound: true` kurar) birebir aynı duyulsun.
     */
    varsayilanSistemSesi?: boolean;
    /**
     * Gerçek alarmın TÜRÜ (Android yükü, plan §4.2). `bilgi` = vakit GİRMEDEN çalan
     * hatırlatma (cuma, camiye gitme, takvim): alarm ekranında yalnız "Kapat"; "Kıldım"
     * YOK, otomasyon olayı doğmaz; `UyariTeslimi.cikis` pencerenin SONUDUR (geç
     * tetik orada atlanır). Verilmezse yükte alan yoktur, native kimlikten çözer (muhafız/nafile).
     */
    alarmTuru?: AlarmTuru;
    /**
     * Bilgi alarmı KILINMIŞLIĞA BAĞLI mı? (takvim çakışması: vaktin İÇİNDE, o vakit
     * kılınana kadar anlamlı). Android yüküne `kilinmisligaBagli: true` yazılır → native
     * alıcı vakit ortak "Kıldım" kuyruğunda bekliyorsa ÇALMAZ ve kuyruğa ekleme o vaktin
     * bu alarmlarını da susturur (JS geç uyansa bile). Cuma/camiye gitme vakit girmeden
     * çalar, kılınmışlığa bağlı DEĞİLDİR.
     */
    alarmKilinmisligaBagli?: boolean;
}

export interface MuhafizTeslimcisi {
    /** Tani/log icin — hangi teslimci calisiyor. */
    readonly ad: 'android' | 'ios';

    /**
     * Planlamadan ONCE calisir. Android'de kanallari olusturur/GC eder ve
     * DOGRULANMIS matrisi dondurur (cozulemeyen `content://` sesler varsayilana
     * duser); cagiran bildirimleri DONEN matrisle planlamalidir, yoksa kanal
     * id'si ayrisir ve bildirim var olmayan kanala gider (Android 8+'ta hic
     * gosterilmez).
     *
     * Matris verilmeden cagrilmak GECERLIDIR: muhafiz kapatildiginda yalniz GC
     * calistirilir.
     */
    hazirla(matris?: MuhafizMatrisi): Promise<MuhafizMatrisi | undefined>;

    /** Tek bir uyariyi cihazda planla. Asla firlatmaz — hata loglanir. */
    uyariPlanla(teslim: UyariTeslimi): Promise<void>;

    /**
     * Bildirimle AYNI id ile planlanmis yan kanali iptal et (Android'de TTS
     * alarmi). Kayitli olmayan id zararsizdir.
     */
    yanKanaliIptalEt(id: string): void;

    /** Tum yan kanallari iptal et (yeniden planlama oncesi temizlik). */
    tumYanKanallariIptalEt(): void;

    /**
     * Bir vaktin (onek: `muhafiz_<tarih>_vakit_<vakit>`) expo listesinde GORUNMEYEN yan
     * kanallarini iptal et — uygulama ici "Kildim". Android'de gercek alarmlar (issue
     * #74): alarm o tetigin bildiriminin YERINE gectigi icin listede izi yoktur.
     * Opsiyonel: iOS'ta ve el yapimi teslimcilerde is yoktur.
     */
    vakitYanKanallariniIptalEt?(onek: string): void;

    /**
     * Planlama turu BITTIKTEN sonra calisir (muhafiz kapaliyken de). iOS'ta
     * kullanilmayan anons kliplerini toplar; Android'de is yoktur.
     *
     * Opsiyonel: testlerdeki el yapimi teslimciler bunu yazmak zorunda kalmasin.
     * Asla firlatmaz.
     */
    tamamla?(): Promise<void>;
}

let _teslimci: MuhafizTeslimcisi | null = null;

/**
 * Calisan teslimciyi dondur (yoksa platformdan turet ve hatirla).
 *
 * Modul tembel yuklenir: iOS teslimcisi Android build'inde, Android teslimcisi
 * iOS build'inde hic degerlendirilmez.
 */
export function muhafizTeslimcisiniAl(): MuhafizTeslimcisi {
    if (_teslimci) return _teslimci;

    if (Platform.OS === 'ios') {
        const { IosMuhafizTeslimcisi } =
            require('./IosMuhafizTeslimcisi') as typeof import('./IosMuhafizTeslimcisi');
        _teslimci = new IosMuhafizTeslimcisi();
    } else {
        const { AndroidMuhafizTeslimcisi } =
            require('./AndroidMuhafizTeslimcisi') as typeof import('./AndroidMuhafizTeslimcisi');
        _teslimci = new AndroidMuhafizTeslimcisi();
    }

    return _teslimci;
}

/**
 * Teslimciyi acikca ayarla (test / ozel senaryo). `null` verilirse bir sonraki
 * cagride platformdan yeniden turetilir.
 */
export function muhafizTeslimcisiniAyarla(teslimci: MuhafizTeslimcisi | null): void {
    _teslimci = teslimci;
}
