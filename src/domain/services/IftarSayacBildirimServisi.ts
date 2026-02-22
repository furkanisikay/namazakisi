/**
 * Iftar Sayaci Bildirim Servisi
 *
 * Native Kotlin modulu (expo-countdown-notification) kullanarak
 * bildirim body'sinde iftar vaktine geri sayim gosterir.
 * Foreground Service + CountDownTimer ile batarya verimli calisir.
 *
 * - Sabah namazindan sonra aktif olur
 * - Aksam namazi vaktine kalan sureyi body'de gosterir
 * - Vakit girdikten sonra 10 dk boyunca "vakit girdi" bildirimi gosterir
 * - 10 dk sonra otomatik kaybolur
 */

import notifee, { TriggerType, AndroidImportance, TimestampTrigger, AndroidStyle } from '@notifee/react-native';
import { Platform } from 'react-native';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { startCountdown, stopCountdown, stopAll as stopAllCountdowns } from '../../../modules/expo-countdown-notification/src';

interface IftarSayacAyarlari {
  aktif: boolean;
  koordinatlar: { lat: number; lng: number };
}

export class IftarSayacBildirimServisi {
  private static instance: IftarSayacBildirimServisi;
  private ayarlar: IftarSayacAyarlari | null = null;
  private kanalOlusturuldu: boolean = false;

  private constructor() { }

  public static getInstance(): IftarSayacBildirimServisi {
    if (!IftarSayacBildirimServisi.instance) {
      IftarSayacBildirimServisi.instance = new IftarSayacBildirimServisi();
    }
    return IftarSayacBildirimServisi.instance;
  }

  /**
   * Servisi yapılandır ve bildirimleri planla
   */
  public async yapilandirVePlanla(ayarlar: IftarSayacAyarlari): Promise<void> {
    this.ayarlar = ayarlar;

    // Önce tüm iftar sayaç bildirimlerini temizle
    await this.tumBildirimleriniTemizle();

    // iOS'ta desteklenmiyor
    if (Platform.OS !== 'android') {
      return;
    }

    // Aktif değilse bitir
    if (!ayarlar.aktif) {
      return;
    }

    // notifee kanalını oluştur
    await this.kanalOlustur();

    // Vakit zamanlarını hesapla
    const { lat, lng } = ayarlar.koordinatlar;
    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.Turkey();
    const simdi = new Date();
    const prayerTimes = new PrayerTimes(coordinates, simdi, params);

    const sabahVakti = prayerTimes.fajr;
    const aksamVakti = prayerTimes.maghrib;
    const aksamArti10 = new Date(aksamVakti.getTime() + 10 * 60 * 1000);

    const bugun = this.bugunTarihiAl();
    const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.IFTAR_SAYAC}${bugun}`;
    const vakitGirdiId = `${bildirimId}_vakitgirdi`;
    const temizlemeId = `${bildirimId}_bitis`;

    if (simdi < sabahVakti) {
      // Sabah namazindan once: sabah vaktinde geri sayim baslat (trigger ile)
      await this.geriSayimPlanla(bildirimId, sabahVakti.getTime(), aksamVakti.getTime());
      // Aksam vaktinde "vakit girdi" bildirimi goster (farkli ID)
      await this.vakitGirdiBildirimiPlanla(vakitGirdiId, aksamVakti.getTime());
      // Aksam + 10 dk'da temizle (farkli ID)
      await this.temizlemePlanla(temizlemeId, aksamArti10.getTime());
    } else if (simdi < aksamVakti) {
      // Sabah ile aksam arasi: hemen native countdown baslat
      this.nativeCountdownBaslat(bildirimId, aksamVakti.getTime());
      // Aksam vaktinde "vakit girdi" bildirimi goster (farkli ID)
      await this.vakitGirdiBildirimiPlanla(vakitGirdiId, aksamVakti.getTime());
      // Aksam + 10 dk'da temizle (farkli ID)
      await this.temizlemePlanla(temizlemeId, aksamArti10.getTime());
    } else if (simdi < aksamArti10) {
      // Aksam ile aksam+10dk arasi: "vakit girdi" hemen goster
      await this.vakitGirdiBildirimiHemenGoster(vakitGirdiId, aksamVakti.getTime());
      // Aksam + 10 dk'da temizle (farkli ID)
      await this.temizlemePlanla(temizlemeId, aksamArti10.getTime());
    }
    // Aksam + 10 dk'dan sonra: hicbir sey gosterme
  }

  /**
   * notifee kanalını oluştur
   */
  private async kanalOlustur(): Promise<void> {
    if (this.kanalOlusturuldu) return;

    try {
      // Eski kanali sil (LOW importance, Samsung'da gorunmuyor)
      try { await notifee.deleteChannel('iftar_sayac'); } catch (_) { }

      await notifee.createChannel({
        id: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
        name: 'İftar Sayacı',
        description: 'İftar vaktine geri sayım bildirimi',
        importance: AndroidImportance.DEFAULT,
        vibration: false,
        sound: '', // Sessiz
      });

      this.kanalOlusturuldu = true;
    } catch (error) {
      // Kanal oluşturulamazsa sessizce devam et
    }
  }

  /**
   * Geri sayim bildirimini gelecekte planla (trigger ile placeholder, tetiklenince native countdown baslar)
   */
  private async geriSayimPlanla(
    bildirimId: string,
    tetikZamani: number,
    aksamVaktiMs: number
  ): Promise<void> {
    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: tetikZamani,
      };

      await notifee.createTriggerNotification(
        {
          id: bildirimId,
          title: '\uD83C\uDF19 Iftar Sayaci',
          body: 'Iftar vaktine kalan sure hesaplaniyor...',
          android: {
            channelId: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
            ongoing: true,
            autoCancel: false,
            pressAction: { id: 'default' },
          },
        },
        trigger
      );
    } catch (error) {
      // Planalamadiysa sessizce devam et
    }
  }

  /**
   * Native countdown modulu ile geri sayimi hemen baslat
   */
  private nativeCountdownBaslat(
    bildirimId: string,
    aksamVaktiMs: number
  ): void {
    try {
      startCountdown({
        id: bildirimId,
        targetTimeMs: aksamVaktiMs,
        title: '\uD83C\uDF19 Iftar Sayaci',
        bodyTemplate: 'Ezanı duymadan orucunuzu açmayınız!\n\u23F1\uFE0F {time}',
        channelId: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
        themeType: 'iftar',
      });
      console.log('[IftarSayac] Native countdown baslatildi');
    } catch (error) {
      console.error('[IftarSayac] Native countdown baslatilamadi:', error);
    }
  }

  /**
   * "Vakit girdi" bildirimini gelecekte planla (akşam vakti girince)
   */
  private async vakitGirdiBildirimiPlanla(
    bildirimId: string,
    aksamVaktiMs: number
  ): Promise<void> {
    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: aksamVaktiMs,
      };

      await notifee.createTriggerNotification(
        this.vakitGirdiBildirimIcerigi(bildirimId, aksamVaktiMs),
        trigger
      );
    } catch (error) {
      // Planlanamadıysa sessizce devam et
    }
  }

  /**
   * "Vakit girdi" bildirimini hemen göster
   */
  private async vakitGirdiBildirimiHemenGoster(
    bildirimId: string,
    aksamVaktiMs: number
  ): Promise<void> {
    try {
      await notifee.displayNotification(
        this.vakitGirdiBildirimIcerigi(bildirimId, aksamVaktiMs)
      );
    } catch (error) {
      // Gösterilemezse sessizce devam et
    }
  }

  /**
   * "Vakit girdi" bildirim icerigi - chronometer olmadan statik bildirim
   */
  private vakitGirdiBildirimIcerigi(bildirimId: string, _aksamVaktiMs: number) {
    return {
      id: bildirimId,
      title: '\uD83C\uDF19 Iftar Vakti Girdi!',
      body: 'Hayirli iftarlar!',
      android: {
        channelId: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
        ongoing: true,
        autoCancel: false,
        pressAction: { id: 'default' },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: 'Hayirli iftarlar!\n\n\u26A0\uFE0F Ezani duymadan orucunuzu acmayiniz!',
        },
      },
    } as any; // Notifee Notification Type Issue
  }

  /**
   * Belirli bir zamanda bildirimi temizle (replace + otomatik kapanma)
   */
  private async temizlemePlanla(
    bildirimId: string,
    temizlemeZamani: number
  ): Promise<void> {
    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: temizlemeZamani,
      };

      await notifee.createTriggerNotification(
        {
          id: bildirimId,
          title: '',
          body: '',
          android: {
            channelId: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
            ongoing: false,
            autoCancel: true,
            timeoutAfter: 100,
          },
        },
        trigger
      );
    } catch (error) {
      // Temizleme planlanamadıysa sessizce devam et
    }
  }

  /**
   * Tüm iftar sayaç bildirimlerini temizle
   */
  public async tumBildirimleriniTemizle(): Promise<void> {
    try {
      // Native countdown servisini durdur
      try {
        stopAllCountdowns();
      } catch (_) {
        // Native modul yuklenmemis olabilir
      }

      // Trigger bildirimleri iptal et
      const triggerIds = await notifee.getTriggerNotificationIds();
      for (const id of triggerIds) {
        if (id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.IFTAR_SAYAC)) {
          await notifee.cancelTriggerNotification(id);
        }
      }

      // Goruntulenen bildirimleri temizle
      const gosterilenler = await notifee.getDisplayedNotifications();
      for (const bildirim of gosterilenler) {
        if (bildirim.id && bildirim.id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.IFTAR_SAYAC)) {
          await notifee.cancelNotification(bildirim.id);
        }
      }
    } catch (error) {
      // Temizleme hatasi sessizce gecilir
    }
  }

  /**
   * Bugün tarihini YYYY-MM-DD formatında al
   */
  private bugunTarihiAl(): string {
    const bugun = new Date();
    const yil = bugun.getFullYear();
    const ay = String(bugun.getMonth() + 1).padStart(2, '0');
    const gun = String(bugun.getDate()).padStart(2, '0');
    return `${yil}-${ay}-${gun}`;
  }
}
