/**
 * ANDROID TESLIMCISI — `ArkaplanMuhafizServisi`'nden BIREBIR tasinan kod.
 *
 * Bu dosyada MANTIK DEGISIKLIGI YOKTUR; `tekBildirimPlanla` + `anonsPlanla` +
 * kanal hazirligi + iptal cagrilari oldugu gibi buraya alindi. Iddiayi
 * `ArkaplanMuhafizServisi.kayitOynat.test.ts` olcuyor: servisin cihaza
 * gonderdigi her cagrinin argumanlari refactor ONCESI donduruldu, sonrasinda
 * bir bayt degisirse test kirmizi yanar.
 *
 * Android'e ozgu iki gercek bu dosyanin var olma sebebidir:
 *   1. SES ve TITRESIM KANAL OZELLIGIDIR ve kanal olusturulduktan sonra
 *      DEGISTIRILEMEZ → kanal id'si (ses + titresim) hash'inden turetilir ve
 *      planlamadan ONCE kanal olusturulmus olmali (yoksa Android 8+ bildirimi
 *      hic gostermez).
 *   2. Sesli anons AYRI bir alarm zinciridir (exact alarm → BroadcastReceiver →
 *      `goAsync()` penceresinde TTS); expo-notifications listesinde gorunmez,
 *      bu yuzden iptali de ayri yurur.
 */
import * as Notifications from 'expo-notifications';

import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { ozelSesMi, sesKimliginiNormalize } from '../../core/muhafiz/sesKimligi';
import {
    MUHAFIZ_SAHIPLIGI,
    nativeSahipAdi,
    onekSahipligi,
    type TeslimSahipligi,
} from '../../core/muhafiz/teslimSahipligi';
import { Logger } from '../../core/utils/Logger';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { alarmGerekliMi, muhafizKanaliSec, titresimGerekliMi } from '../../core/muhafiz/motorAdaptoru';
import { alarmKanallariniCikar, alarmYukuOlustur } from '../../core/muhafiz/alarmYuku';
import { titresimDeseniAl } from '../../core/muhafiz/titresimDeseni';
import { anonsMetniniCoz } from '../../core/muhafiz/anonsMetni';
import {
    planlaAnons,
    iptalEtAnons,
    iptalEtTumAnonslar,
    iptalEtOnekliAnonslar,
} from '../../../modules/expo-countdown-notification/src';
import { sessizBitisMs } from '../../../modules/expo-cami-geofence/src';
import { MuhafizKanalServisi } from './MuhafizKanalServisi';
import {
    alarmKanallariniTemizle,
    alarmKoprusuVarMi,
    alarmPlanla as nativeAlarmPlanla,
    onekliAlarmlariIptalEt,
    sahipliIptalVarMi,
    sahipliYanKanallariIptalEt,
    vakitAlarmlariniSustur,
} from './MuhafizAlarmKoprusu';
import { ANDROID_MUHAFIZ_PAYI } from '../../core/bildirim/butceSabitleri';
import type { MuhafizTeslimcisi, UyariTeslimi } from './MuhafizTeslimcisi';

/**
 * Bir planlama turunda muhafızın kurabileceği en fazla alarm (bildirim + sesli anons).
 *
 * Android uygulama başına eşzamanlı ~500 alarm tutar; aşılınca `setExact...`
 * SecurityException atar ya da kayıt sessizce düşer. Özel ayarda 5 vakit × 4 adım ×
 * 15 tetik = 300 bildirim, sesli adımlar AYNI dakikaya ayrı bir TTS alarmı daha
 * kurar → 600'e çıkabiliyordu. Kalan pay vakit/cuma/nafile bildirimleri, notifee
 * sayaçları ve widget içindir. Hazır yoğunluklar (vakit başına 4/6/7 uyarı) bu
 * sınıra hiç yaklaşmaz.
 *
 * Kesme KRONOLOJİKTİR (çağrılar zaman sırasıyla gelir): en uzaktaki tetikler düşer
 * ve bir sonraki tur (15 dk görevi / açılış) onları yeniden kurar. iOS'taki
 * 64 bildirim bütçesinin (`ios/bildirimButcesi.ts`) Android ikizi.
 *
 * Sayı TOPLAM alarm havuzundan türer (`core/bildirim/butceSabitleri.ts`,
 * 480 − 120 = 360): rehber ekranı da aynı havuzu sayar (issue #298).
 */
export const ANDROID_MUHAFIZ_ALARM_BUTCESI = ANDROID_MUHAFIZ_PAYI;

/**
 * Ek hatırlatma yüzeylerinin (nafile, cuma…) GERÇEK ALARM kanalları — muhafız çöp
 * toplaması korur (kanal uzayı ortak: `namaz_alarm` / `namaz_alarm_<hash>`). DİSKTEN
 * okunur (`ekHatirlatmaKaynaklari`): arka plan görevinde o servisler aynı süreçte hiç
 * çalışmamış olabilir; sesler yüzeyin kendi turuyla AYNI doğrulamadan geçer (ham URI'nin
 * kanal id'si korunsaydı gerçek alarm kanalı "öksüz" sayılıp silinirdi). Okuma hatası
 * FIRLATIR → çağıran o turda toplamayı atlar.
 */
const ekAlarmKanallariniOku = (): Promise<string[]> => MuhafizKanalServisi.ekAlarmKanallariniOku();

/**
 * Özel teslimin (ek hatırlatma yüzeyi) kanalı: zorlanan kanal (`kanalId`) önce; adım
 * VARSAYILAN ses + titreşimsizse yüzeyin varsayılan kanalı (`varsayilanKanalId` — göçten
 * gelen kayıt bugünkü kanalında kalır); aksi halde ortak muhafız uzayındaki kanal.
 */
function ozelKanalSec(teslim: UyariTeslimi, muhafizKanali: string): string {
    const { ozel, uyari } = teslim;
    if (ozel?.kanalId) return ozel.kanalId;
    if (
        ozel?.varsayilanKanalId &&
        !ozelSesMi(sesKimliginiNormalize(uyari.bildirimSesi)) &&
        !titresimGerekliMi(uyari.kanallar)
    ) {
        return ozel.varsayilanKanalId;
    }
    return muhafizKanali;
}

export interface AndroidTeslimciSecenekleri {
    /** Tur başına alarm bütçesi (bildirim + anons). Varsayılan muhafız bütçesi. */
    alarmButcesi?: number;
    /**
     * `hazirla`'nın kanal işi. Varsayılan `MuhafizKanalServisi.hazirla` (oluştur
     * + ÇÖP TOPLA). Muhafız dışı tüketici (nafile) yalnız OLUŞTURMALIDIR: çöp
     * toplama muhafızın işidir ve iki kaynağın birleşimini bilir; ikinci bir
     * toplayıcı ötekinin kanallarını silerdi (Android 8+ o bildirimi HİÇ göstermez).
     */
    kanalHazirligi?: (matris?: MuhafizMatrisi) => Promise<MuhafizMatrisi | undefined>;
    /**
     * Bu örneğin kimlik SAHİPLİĞİ (`core/muhafiz/teslimSahipligi.ts`): yeniden planlama
     * öncesi temizlik (anons + gerçek alarm) YALNIZ bunları siler. Varsayılan muhafız
     * (plan kimlikleri — `muhafiz_` uzayındaki yatış/muhasebe korunur).
     */
    sahiplik?: TeslimSahipligi;
    /** Geriye uyumlu kısayol: `sahiplik: { tur: 'onek', onek }`. */
    anonsOneki?: string;
    /**
     * Gerçek alarm (issue #74) bu teslimcide KURULSUN mu? Varsayılan EVET. Önceki turun
     * alarmları yalnız `anonsOneki` ile iptal edilir (nafile örneği muhafızınkilere dokunmaz).
     */
    alarmDestegi?: boolean;
    /**
     * Öksüz ALARM KANALLARINI bu teslimci mi toplar? Varsayılan = `alarmDestegi`.
     * Muhafız DIŞI örnek (nafile) `false` geçmeli: çöp toplama muhafızın işidir ve
     * nafilenin alarm kanallarını DİSKTEN okuyup korur (`nafileAlarmSesleri`); ikinci bir
     * toplayıcı ötekinin kanallarını "öksüz" sanıp silerdi (alarm var olmayan kanala gider).
     */
    alarmKanalTemizligi?: boolean;
    /**
     * Çöp toplamada KORUNACAK ek alarm kanalları (muhafız örneği nafileninkileri geçer).
     * Verilmezse yalnız matrisin kanalları korunur.
     */
    ekAlarmKanallari?: () => Promise<string[]>;
}

export class AndroidMuhafizTeslimcisi implements MuhafizTeslimcisi {
    readonly ad = 'android' as const;

    private readonly alarmButcesi: number;
    private readonly kanalHazirligi: (matris?: MuhafizMatrisi) => Promise<MuhafizMatrisi | undefined>;
    private readonly sahiplik: TeslimSahipligi;
    /** Sahipli native iptal yoksa (köprü/yöntem yok) düşülen önek. Yatışta YOK (önek yetmez). */
    private readonly yedekOnek: string | null;
    private readonly alarmDestegi: boolean;
    private readonly alarmKanalTemizligi: boolean;
    private readonly ekAlarmKanallari: () => Promise<string[]>;

    constructor(secenekler: AndroidTeslimciSecenekleri = {}) {
        this.alarmDestegi = secenekler.alarmDestegi ?? true;
        this.alarmKanalTemizligi = secenekler.alarmKanalTemizligi ?? this.alarmDestegi;
        this.ekAlarmKanallari = secenekler.ekAlarmKanallari ?? ekAlarmKanallariniOku;
        this.alarmButcesi = secenekler.alarmButcesi ?? ANDROID_MUHAFIZ_ALARM_BUTCESI;
        // Matrissiz çağrı ARGÜMANSIZ geçer (kayıt-oynat sözleşmesi: `hazirla()`).
        this.kanalHazirligi =
            secenekler.kanalHazirligi ??
            ((m) => (m === undefined ? MuhafizKanalServisi.hazirla() : MuhafizKanalServisi.hazirla(m)));
        this.sahiplik =
            secenekler.sahiplik ??
            (secenekler.anonsOneki ? onekSahipligi(secenekler.anonsOneki) : MUHAFIZ_SAHIPLIGI);
        this.yedekOnek =
            this.sahiplik.tur === 'onek'
                ? this.sahiplik.onek
                : this.sahiplik.tur === 'muhafiz'
                  ? BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ
                  : null;
    }

    /** Bu turda kurulan alarm sayısı — `hazirla` (her turun başı) sıfırlar. */
    private kurulanAlarm = 0;
    private butceUyarisiYazildi = false;
    /**
     * CAMİDEYİM (#297): camideyken muhafız SUSTURULMAZ ama sessiz gelir — bu ana
     * kadarki uyarılar acil kanala (bypassDnd) düşmez ve sesli anons planlanmaz.
     * Kurulu anonslar zaten native'de (`AnonsReceiver`) konuşmaz; bu bayrak
     * camideyken yapılan yeniden planlamada yenilerinin kurulmasını önler.
     */
    private camiSessizBitisMs = 0;

    private camideMi(zaman: Date): boolean {
        return zaman.getTime() < this.camiSessizBitisMs;
    }

    private alarmPayiAl(): boolean {
        if (this.kurulanAlarm >= this.alarmButcesi) {
            if (!this.butceUyarisiYazildi) {
                this.butceUyarisiYazildi = true;
                Logger.warn('ArkaplanMuhafiz', `Alarm butcesi doldu (${this.alarmButcesi}); kalan tetikler sonraki turda kurulacak`);
            }
            return false;
        }
        this.kurulanAlarm++;
        return true;
    }

    /** Android'de tur sonu isi yok: anons calisma aninda TTS ile uretilir, dosya birakmaz. */
    async tamamla(): Promise<void> {
        // Bilincli bos.
    }

    /**
     * Kanal id'leri SESIN (ve titresimin) fonksiyonu → planlamadan ONCE gerekli
     * kanallar olusturulmali. Ayni cagri oksuz kalmis hash'li kanallari da GC
     * eder; bu yuzden muhafiz KAPALIYKEN de (matrissiz) cagrilir, yoksa
     * kullanicinin ozel sesli kanallari bildirim ayarlarinda sonsuza kadar
     * oksuz kalirdi.
     */
    async hazirla(matris?: MuhafizMatrisi): Promise<MuhafizMatrisi | undefined> {
        this.kurulanAlarm = 0;
        this.butceUyarisiYazildi = false;
        try {
            this.camiSessizBitisMs = await sessizBitisMs();
        } catch {
            this.camiSessizBitisMs = 0;
        }
        if (matris === undefined) {
            await this.kanalHazirligi();
            await this.alarmlariHazirla(undefined);
            return undefined;
        }
        const dogrulanmis = (await this.kanalHazirligi(matris)) ?? matris;
        await this.alarmlariHazirla(dogrulanmis);
        return dogrulanmis;
    }

    /**
     * GERÇEK ALARM hazırlığı (issue #74): önceki turun alarmları iptal edilir ve öksüz
     * alarm kanalları toplanır. İptal BURADA ve BEKLENEREK yapılır (ateşle-unut
     * `tumYanKanallariIptalEt`'te DEĞİL): köprü çağrıları ayrı kuyrukta yarışırsa geç
     * kalan bir iptal bu turda yeni kurulan alarmları silerdi. `hazirla` her turda
     * planlamadan ÖNCE çağrılır (muhafız kapalıyken de → alarmlar ve kanallar temizlenir).
     */
    private async alarmlariHazirla(matris: MuhafizMatrisi | undefined): Promise<void> {
        if (!this.alarmDestegi || !alarmKoprusuVarMi()) return;
        try {
            // SAHİPLİ iptal (plan §4.1): muhafız PLAN kimlikleriyle (kapalıyken muhafız
            // sahipli her şey) — `muhafiz_` uzayındaki yatış/muhasebe alarmları korunur.
            const sahip = nativeSahipAdi(this.sahiplik, matris !== undefined);
            const sahipli = sahip !== null && (await sahipliYanKanallariIptalEt(sahip, { anons: false, alarm: true }));
            if (!sahipli && this.yedekOnek) await onekliAlarmlariIptalEt(this.yedekOnek);
            if (this.alarmKanalTemizligi) {
                let ek: string[] = [];
                try {
                    ek = await this.ekAlarmKanallari();
                } catch {
                    // Ek liste okunamazsa toplama YAPILMAZ: bilinmeyen kanalı silmektense
                    // öksüz bir kanalı bir tur daha tutmak yeğdir.
                    return;
                }
                await alarmKanallariniTemizle([...new Set([...alarmKanallariniCikar(matris), ...ek])].sort());
            }
        } catch (error) {
            Logger.warn('ArkaplanMuhafiz', 'Gercek alarmlar hazirlanamadi', error);
        }
    }

    async uyariPlanla(teslim: UyariTeslimi): Promise<void> {
        // GERÇEK ALARM (issue #74): alarm o tetiğin bildirimi + anonsunun YERİNE geçer
        // (alarm bildirimi tam ekran/heads-up olarak zaten görünür; aynı anda TTS de
        // konuşsaydı alarm sesinin üstüne binerdi). Kurulamazsa (izin yok, köprü yok,
        // camide) aynı tetik NORMAL yoldan kurulur — sessiz kayıp yok.
        if (await this.alarmPlanla(teslim)) return;
        await this.tekBildirimPlanla(teslim);
        // mod 'sesli'/'ikisi' ise ayni ana bir de TTS anonsu planla.
        // Anons id = bildirim id -> iptal zinciri simetrik kalir.
        this.anonsPlanla(teslim);
    }

    /**
     * Gerçek alarmı kurar. `false` → çağıran normal bildirim + anons yoluna düşer.
     * Özel teslim (nafile) ancak `ozel.alarmAdi` taşıyorsa alarm kurar: yükü (`veri`)
     * kendi `data`sıdır — muhafız yükü ASLA (Kıldım FARZ yazardı).
     */
    private async alarmPlanla(teslim: UyariTeslimi): Promise<boolean> {
        const { id, baslik, mesaj, zaman, uyari, vakit, tarih, ozel, cikis } = teslim;
        if (!this.alarmDestegi || uyari.alarm !== true || !alarmGerekliMi(uyari.kanallar)) return false;
        if (ozel && !ozel.alarmAdi) return false;
        if (zaman.getTime() <= Date.now()) return false;
        // Camideyken (#297) alarm çalmaz: namazdaki kişiyi bölmesin.
        if (this.camideMi(zaman)) return false;
        if (!alarmKoprusuVarMi()) return false;
        if (!this.alarmPayiAl()) return false;

        const kanalId = muhafizKanaliSec(
            uyari.seviye,
            uyari.bildirimSesi,
            uyari.acilKanal,
            titresimGerekliMi(uyari.kanallar)
        );
        const kuruldu = await nativeAlarmPlanla(
            alarmYukuOlustur({
                kimlik: id,
                tetikMs: zaman.getTime(),
                baslik,
                metin: mesaj,
                vakit,
                ...(ozel?.alarmAdi ? { vakitAdi: ozel.alarmAdi } : {}),
                tarih,
                // Bilgi türünde (cuma/camiye gitme/takvim) `cikis` pencerenin SONUDUR.
                cikisMs: cikis?.getTime() ?? 0,
                seviye: uyari.seviye,
                bildirimSesi: uyari.bildirimSesi,
                sesAdi: uyari.sesAdi,
                // Normal bildirime düşüşün kanalı: özel teslimin zorladığı kanal önce, sonra
                // yüzeyin varsayılan kanalı (göçten gelen kayıt bugünkü kanalında kalsın).
                kanalId: ozelKanalSec(teslim, kanalId),
                // Normal bildirime düşüşün gövdesi — muhafız bildirimiyle AYNI `data`
                // (Kıldım aynı alanları okur). Özel teslimde kendi yükü (nafile: `{tip:'nafile'}`).
                veri: ozel ? { ...ozel.veri } : {
                    tip: 'muhafiz',
                    seviye: uyari.seviye,
                    vakit,
                    tarih,
                    kanallar: uyari.kanallar,
                    bildirimSesi: uyari.bildirimSesi,
                    sesliAnons: uyari.sesliAnons,
                    anonsMetni: uyari.anonsMetni,
                },
                ...(ozel?.alarmTuru ? { tur: ozel.alarmTuru } : {}),
                ...(ozel?.alarmKilinmisligaBagli === true ? { kilinmisligaBagli: true } : {}),
            })
        );
        if (!kuruldu) {
            // Pay iade: aynı tetik normal yoldan kurulacak ve kendi payını alacak.
            this.kurulanAlarm = Math.max(0, this.kurulanAlarm - 1);
            return false;
        }
        return true;
    }

    /**
     * Uygulama içi "Kıldım" (issue #74): vaktin GERÇEK alarmları expo listesinde yoktur
     * (alarm o tetiğin bildiriminin yerine geçer) → önekle native kayıttan iptal edilir;
     * o an ÇALAN alarm da (ses + tam ekran) susturulur (`vakitAlarmlariniSustur`).
     */
    vakitYanKanallariniIptalEt(onek: string): void {
        if (!this.alarmDestegi || !alarmKoprusuVarMi()) return;
        void vakitAlarmlariniSustur(onek);
    }

    yanKanaliIptalEt(id: string): void {
        // Bildirimle AYNI id ile planlanan sesli anonsu iptal et.
        // (Anonsu olmayan id icin native tarafta no-op.)
        try {
            iptalEtAnons(id);
        } catch {
            // Native yoksa/hata verirse bildirim iptali yine de gecerli
        }
    }

    tumYanKanallariIptalEt(): void {
        // ÖNEKLE: nafile anonsları (issue #273) aynı native kayıtta yaşar; çıplak
        // "tümünü sil" her muhafız turunda (15 dk + her ekran değişikliği) nafile
        // anonslarını da silerdi. Native önekli iptal yoksa (eski köprü) eski yol.
        // Muhafız / yatış: SAHİPLİ native iptal (plan §4.1) — önek yatışın anonslarını da
        // silerdi. Muhafız tarafında anons yalnız plan kimliğinde kurulur; "muhafız sahipli
        // her şey (yatış hariç)" kapsamı açık/kapalı iki turda da doğrudur.
        const sahip = nativeSahipAdi(this.sahiplik, false);
        if (sahip !== null && sahipliIptalVarMi()) {
            // Native başarısız olursa (false) önekli yola düşülür; anonslar kalmasın.
            void sahipliYanKanallariIptalEt(sahip, { anons: true, alarm: false }).then((tamam) => {
                if (!tamam) this.onekliAnonslariIptalEt();
            });
            return;
        }
        this.onekliAnonslariIptalEt();
    }

    private onekliAnonslariIptalEt(): void {
        if (!this.yedekOnek) return;
        try {
            const onekliIptal =
                typeof iptalEtOnekliAnonslar === 'function' && iptalEtOnekliAnonslar(this.yedekOnek);
            if (!onekliIptal) iptalEtTumAnonslar();
        } catch (error) {
            Logger.error('ArkaplanMuhafiz', 'Sesli anonslar temizlenemedi:', error);
        }
    }

    /**
     * Tek bir bildirim planla.
     */
    private async tekBildirimPlanla(teslim: UyariTeslimi): Promise<void> {
        const { id, baslik, mesaj, zaman, uyari, vakit, tarih, ozel } = teslim;
        try {
            // Zamanin gecerli oldugundan emin ol
            const simdi = new Date();
            if (zaman.getTime() <= simdi.getTime()) {
                return;
            }
            if (!this.alarmPayiAl()) return;

            const titresimli = titresimGerekliMi(uyari.kanallar);
            const kanalId = muhafizKanaliSec(
                uyari.seviye,
                uyari.bildirimSesi,
                // Camideyken acil kanal (bypassDnd) kullanılmaz: Namaz modu delinmesin.
                this.camideMi(zaman) ? false : uyari.acilKanal,
                titresimli
            );
            // Kategori: özel teslim `null` verirse HİÇ yazılmaz (cuma "Kıldım" FARZ yazmasın).
            // Muhafız yalnız "Kıldım" taşır — ERTELE YOK (sahip kararı 2026-10-19, eski #289).
            const kategori =
                ozel && ozel.kategori !== undefined
                    ? ozel.kategori
                    : BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ;

            await Notifications.scheduleNotificationAsync({
                identifier: id,
                content: {
                    title: baslik,
                    body: mesaj,
                    sound: true,
                    // Android 8+ ta TITRESIM KANAL ozelligidir ve bu alan yok sayilir
                    // (desen `MuhafizKanallari.kt` icinde, kanal id'sine baglidir).
                    // Alan yalniz Android 8 ONCESI cihazlar icin tasinir; titresim
                    // kapaliyken HIC yazilmaz → mevcut davranis birebir korunur.
                    ...(titresimli ? { vibrate: titresimDeseniAl() } : {}),
                    priority: uyari.seviye >= 3
                        ? Notifications.AndroidNotificationPriority.MAX
                        : Notifications.AndroidNotificationPriority.HIGH,
                    ...(kategori !== null ? { categoryIdentifier: kategori } : {}),
                    data: ozel ? ozel.veri : {
                        tip: 'muhafiz',
                        seviye: uyari.seviye,
                        vakit: vakit,
                        tarih: tarih,
                        // Faz 4 kancasi: TTS bayragi + anons metni + secilen ses veriye tasinir.
                        kanallar: uyari.kanallar,
                        bildirimSesi: uyari.bildirimSesi,
                        sesliAnons: uyari.sesliAnons,
                        anonsMetni: uyari.anonsMetni,
                    },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: zaman,
                    // Android: ses de TITRESIM de KANAL ozelligidir → kanal id
                    // hucrenin (ses + titresim) seciminden TURETILIR
                    // (`muhafizKanaliSec`). Aciliyet ayri alandan (`acilKanal`)
                    // gelir; ses artik onem tasimaz.
                    channelId: ozelKanalSec(teslim, kanalId),
                },
            });


        } catch (error) {
            Logger.error('ArkaplanMuhafiz', `Bildirim planlanamadi: ${id}`, error);
        }
    }

    /**
     * Sesli anons (native TTS) planla — yalniz mod 'sesli' | 'ikisi' iken.
     *
     * Native taraf Foreground Service KULLANMAZ: exact alarm -> BroadcastReceiver
     * -> `goAsync()` penceresinde konusma. Metin BURADA cozulur ({vakit}/{süre}),
     * native'e hazir cumle gider.
     *
     * Native cagri asla planlamayi durdurmamali -> hata yutulup loglanir.
     */
    private anonsPlanla(teslim: UyariTeslimi): void {
        const { id, zaman, uyari, muhafizVakti, yon } = teslim;
        if (!uyari.sesliAnons) return;
        if (!uyari.anonsMetni || uyari.anonsMetni.trim().length === 0) return;
        if (zaman.getTime() <= Date.now()) return;
        if (this.camideMi(zaman)) return;
        if (!this.alarmPayiAl()) return;

        try {
            // UCUNCU ARGUMAN `olcuDk` — `kalanDk` DEGIL. Cikis yonunde ikisi
            // esittir (bugune kadar zararsizdi); giris yonunde `kalanDk` "son 25
            // dakika" gibi ters bir cumle okutur. Parametre opsiyonel
            // varsayilanli oldugu icin typecheck bunu YAKALAMAZ.
            const metin = anonsMetniniCoz(uyari.anonsMetni, muhafizVakti, uyari.olcuDk, yon);
            planlaAnons(id, zaman.getTime(), metin);
        } catch (error) {
            Logger.error('ArkaplanMuhafiz', `Sesli anons planlanamadi: ${id}`, error);
        }
    }
}
