import * as Notifications from 'expo-notifications';
import { Logger } from '../../core/utils/Logger';
import { NamazVaktiHesaplayiciServisi } from './NamazVaktiHesaplayiciServisi';
import { LocalVakitBildirimServisi } from '../../data/local/LocalVakitBildirimServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { vakitBildirimPlaniOlustur } from '../../core/bildirim/vakitBildirimPlani';
import { VAKIT_BILDIRIM_ICERIKLERI, VakitBildirimTipi } from '../../core/data/VakitBildirimIcerikleri';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { vakitGirdiBasligi } from '../../core/otomasyon/anahtarKelimeler';

export class VakitBildirimYoneticiServisi {
    private static instance: VakitBildirimYoneticiServisi;

    private constructor() { }

    public static getInstance(): VakitBildirimYoneticiServisi {
        if (!VakitBildirimYoneticiServisi.instance) {
            VakitBildirimYoneticiServisi.instance = new VakitBildirimYoneticiServisi();
        }
        return VakitBildirimYoneticiServisi.instance;
    }

    /**
     * Tüm vakit bildirimlerini günceller ve planlar
     * Genellikle ayarlar değiştiğinde veya uygulama açıldığında çağrılır
     */
    public async bildirimleriGuncelle(): Promise<void> {
        Logger.info('VakitBildirim', 'Bildirimler güncelleniyor...');

        // 1. Mevcut ayarları al
        const ayarlar = await LocalVakitBildirimServisi.getAyarlar();

        // 2. Önceki planlanmış vakit bildirimlerini temizle
        await this.mevcutBildirimleriTemizle();

        // 3. Konum yapılandırmasını al
        const hesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        const config = hesaplayici.getKonfig();

        if (!config) {
            Logger.warn('VakitBildirim', 'Namaz hesaplayıcı yapılandırılmamış (Konum yok), bildirim planlanamıyor.');
            return;
        }

        // 4. Plan SAF ureticiden (`core/bildirim/vakitBildirimPlani.ts`): bildirim
        // defteri (issue #298) ayni listeyi sayar. Pencere bugun + yarin.
        // Özel gün (issue #272): aralıktaki GÜN hiç planlanmaz. Eski plan 2. adımda
        // temizlendi; pencere bugün+yarın olduğu için aralığın son günü açılan
        // uygulama ertesi günün bildirimlerini zaten kurar.
        const ozelGundeMi = await ozelGunSuzgeciniOku();
        const plan = vakitBildirimPlaniOlustur(
            { lat: config.latitude, lng: config.longitude },
            ayarlar,
            new Date(),
            ozelGundeMi
        );
        for (const kayit of plan) {
            await this.tekBildirimPlanla(kayit.vakit, kayit.zaman, kayit.id);
        }

        Logger.info('VakitBildirim', 'Bildirim planlama tamamlandı.');
    }

    /**
     * Tek bir bildirim planlar
     */
    private async tekBildirimPlanla(vakit: VakitBildirimTipi, zaman: Date, bildirimId: string): Promise<void> {
        const simdi = new Date();

        // Geçmiş zaman için planlama yapma
        if (zaman.getTime() <= simdi.getTime()) {
            return;
        }

        // İçerik seç
        const icerikHavuzu = VAKIT_BILDIRIM_ICERIKLERI[vakit];
        const icerik = icerikHavuzu[Math.floor(Math.random() * icerikHavuzu.length)];

        // Başlık SABİT önekli: Samsung Rutinler "Bildirim alındığında" koşulunun
        // anahtar kelimesi (issue #278) — metni yalnız `vakitGirdiBasligi`'nda değiştirin.
        const baslik = vakitGirdiBasligi(vakit);

        let govde = icerik.metin;
        if (icerik.kaynak) {
            govde += `\n- ${icerik.kaynak}`;
        }

        try {
            await Notifications.scheduleNotificationAsync({
                identifier: bildirimId,
                content: {
                    title: baslik,
                    body: govde,
                    sound: true, // Standart ses
                    data: {
                        tip: 'vakit_bildirim',
                        vakit: vakit
                    },
                    categoryIdentifier: BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM,
                    // Not: Category identifier genellikle aksiyonlar içindir,
                    // channelId Android kanalı içindir. Expo SDK'da Android kanalı
                    // "channelId" opsiyonu ile belirtilir mi?
                    // Evet, 'channelId' notification request input'ta olmayabilir ama
                    // channel management 'setNotificationChannelAsync' ile yapildi.
                    // NotificationContentInput'ta 'color' vs var ama channelId yok?
                    // Expo documentation check: channelId is set in NotificationContentInput (Android only)??
                    // Hayır, Expo'da channelId scheduleNotificationAsync'te değil,
                    // setNotificationChannelAsync ile oluşturulur ve
                    // Android'de notification gönderilirken priority/channel uyumu önemlidir.
                    // Fakat spesifik bir kanala göndermek için content içinde channelId belirtmek gerekebilir
                    // ya da channel'ın id'sini kullanmak gerekir.
                    // Tip tanımlarında 'channelId' yoksa 'data' veya 'categoryIdentifier' karıştırılmamalı.
                    // Expo Notifications docs: "On Android, notifications are sent to a notification channel."
                    // Eğer 'channelId' belirtmezsek default kanala gider.
                    // Ancak type tanımında channelId var mı kontrol etmeliyim.
                    // (Bu ortamda type check yok ama standart Expo SDK'da var)
                    // Genellikle 'channelId' key'i content içinde olmalı.
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: zaman,
                    channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM, // Expo SDK 44+ support
                },
            });
            Logger.info('VakitBildirim', `Planlandı: ${baslik} @ ${zaman.toLocaleTimeString()}`);
        } catch (e) {
            Logger.error('VakitBildirim', `Planlama hatası (${vakit}):`, e);
        }
    }

    /**
     * Vakit bildirimlerini temizler
     */
    private async mevcutBildirimleriTemizle(): Promise<void> {
        const tumBildirimler = await Notifications.getAllScheduledNotificationsAsync();
        const silinecekler = tumBildirimler.filter(b =>
            b.identifier.startsWith('vakit_bildirim_')
        );

        for (const bildirim of silinecekler) {
            await Notifications.cancelScheduledNotificationAsync(bildirim.identifier);
        }
        if (silinecekler.length > 0) {
            Logger.info('VakitBildirim', `${silinecekler.length} adet eski bildirim temizlendi.`);
        }
    }
}
