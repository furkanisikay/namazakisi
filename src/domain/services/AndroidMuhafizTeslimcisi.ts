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
import { Logger } from '../../core/utils/Logger';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { muhafizKanaliSec, titresimGerekliMi } from '../../core/muhafiz/motorAdaptoru';
import { titresimDeseniAl } from '../../core/muhafiz/titresimDeseni';
import { anonsMetniniCoz } from '../../core/muhafiz/anonsMetni';
import {
    planlaAnons,
    iptalEtAnons,
    iptalEtTumAnonslar,
} from '../../../modules/expo-countdown-notification/src';
import { MuhafizKanalServisi } from './MuhafizKanalServisi';
import type { MuhafizTeslimcisi, UyariTeslimi } from './MuhafizTeslimcisi';

export class AndroidMuhafizTeslimcisi implements MuhafizTeslimcisi {
    readonly ad = 'android' as const;

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
        if (matris === undefined) {
            await MuhafizKanalServisi.hazirla();
            return undefined;
        }
        return (await MuhafizKanalServisi.hazirla(matris)) ?? matris;
    }

    async uyariPlanla(teslim: UyariTeslimi): Promise<void> {
        await this.tekBildirimPlanla(teslim);
        // mod 'sesli'/'ikisi' ise ayni ana bir de TTS anonsu planla.
        // Anons id = bildirim id -> iptal zinciri simetrik kalir.
        this.anonsPlanla(teslim);
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
        try {
            iptalEtTumAnonslar();
        } catch (error) {
            Logger.error('ArkaplanMuhafiz', 'Sesli anonslar temizlenemedi:', error);
        }
    }

    /**
     * Tek bir bildirim planla.
     */
    private async tekBildirimPlanla(teslim: UyariTeslimi): Promise<void> {
        const { id, baslik, mesaj, zaman, uyari, vakit, tarih } = teslim;
        try {
            // Zamanin gecerli oldugundan emin ol
            const simdi = new Date();
            if (zaman.getTime() <= simdi.getTime()) {
                return;
            }

            const titresimli = titresimGerekliMi(uyari.kanallar);

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
                    categoryIdentifier: BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ,
                    data: {
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
                    channelId: muhafizKanaliSec(
                        uyari.seviye,
                        uyari.bildirimSesi,
                        uyari.acilKanal,
                        titresimli
                    ),
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
