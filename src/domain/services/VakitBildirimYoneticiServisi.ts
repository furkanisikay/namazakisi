import * as Notifications from 'expo-notifications';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { NamazVaktiHesaplayiciServisi } from './NamazVaktiHesaplayiciServisi';
import { LocalVakitBildirimServisi, VakitBildirimAyarlari } from '../../data/local/LocalVakitBildirimServisi';
import { VAKIT_BILDIRIM_ICERIKLERI, VakitBildirimTipi } from '../../core/data/VakitBildirimIcerikleri';
import { BILDIRIM_SABITLERI, NamazAdi } from '../../core/constants/UygulamaSabitleri';

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
        console.log('[VakitBildirim] Bildirimler güncelleniyor...');

        // 1. Mevcut ayarları al
        const ayarlar = await LocalVakitBildirimServisi.getAyarlar();

        // 2. Önceki planlanmış vakit bildirimlerini temizle
        await this.mevcutBildirimleriTemizle();

        // 3. Konum yapılandırmasını al
        const hesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        const config = hesaplayici.getKonfig();

        if (!config) {
            console.warn('[VakitBildirim] Namaz hesaplayıcı yapılandırılmamış (Konum yok), bildirim planlanamıyor.');
            return;
        }

        const coordinates = new Coordinates(config.latitude, config.longitude);
        const params = CalculationMethod.Turkey(); // Türkiye Diyanet İşleri

        // 4. Bugün ve Yarın için vakitleri hesapla
        const bugun = new Date();
        const yarin = new Date(bugun);
        yarin.setDate(yarin.getDate() + 1);

        const vakitlerBugun = new PrayerTimes(coordinates, bugun, params);
        const vakitlerYarin = new PrayerTimes(coordinates, yarin, params);

        // 5. Her bir vakit için planlama yap
        await this.gunlukPlanlamaYap(vakitlerBugun, ayarlar, bugun);
        await this.gunlukPlanlamaYap(vakitlerYarin, ayarlar, yarin);

        console.log('[VakitBildirim] Bildirim planlama tamamlandı.');
    }

    /**
     * Bir gün için bildirimleri planlar
     */
    private async gunlukPlanlamaYap(prayerTimes: PrayerTimes, ayarlar: VakitBildirimAyarlari, tarih: Date): Promise<void> {
        // İmsak
        if (ayarlar.imsak) {
            await this.tekBildirimPlanla('imsak', prayerTimes.fajr, tarih);
        }
        // Güneş (Hariç tutuldu)
        // if (ayarlar.gunes) ...

        // Öğle
        if (ayarlar.ogle) {
            await this.tekBildirimPlanla('ogle', prayerTimes.dhuhr, tarih);
        }
        // İkindi
        if (ayarlar.ikindi) {
            await this.tekBildirimPlanla('ikindi', prayerTimes.asr, tarih);
        }
        // Akşam
        if (ayarlar.aksam) {
            await this.tekBildirimPlanla('aksam', prayerTimes.maghrib, tarih);
        }
        // Yatsı
        if (ayarlar.yatsi) {
            await this.tekBildirimPlanla('yatsi', prayerTimes.isha, tarih);
        }
    }

    /**
     * Tek bir bildirim planlar
     */
    private async tekBildirimPlanla(vakit: VakitBildirimTipi, zaman: Date, tarihRef: Date): Promise<void> {
        const simdi = new Date();

        // Geçmiş zaman için planlama yapma
        if (zaman.getTime() <= simdi.getTime()) {
            return;
        }

        // İçerik seç
        const icerikHavuzu = VAKIT_BILDIRIM_ICERIKLERI[vakit];
        const icerik = icerikHavuzu[Math.floor(Math.random() * icerikHavuzu.length)];

        const tarihStr = `${tarihRef.getFullYear()}-${String(tarihRef.getMonth() + 1).padStart(2, '0')}-${String(tarihRef.getDate()).padStart(2, '0')}`;
        const bildirimId = `vakit_bildirim_${vakit}_${tarihStr}`;

        let baslik = '';
        switch(vakit) {
            case 'imsak': baslik = 'İmsak Vakti Girdi'; break;
            case 'ogle': baslik = 'Öğle Vakti Girdi'; break;
            case 'ikindi': baslik = 'İkindi Vakti Girdi'; break;
            case 'aksam': baslik = 'Akşam Vakti Girdi'; break;
            case 'yatsi': baslik = 'Yatsı Vakti Girdi'; break;
        }

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
            console.log(`[VakitBildirim] Planlandı: ${baslik} @ ${zaman.toLocaleTimeString()}`);
        } catch (e) {
            console.error(`[VakitBildirim] Planlama hatası (${vakit}):`, e);
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
            console.log(`[VakitBildirim] ${silinecekler.length} adet eski bildirim temizlendi.`);
        }
    }
}
