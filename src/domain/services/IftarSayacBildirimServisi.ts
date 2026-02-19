/**
 * İftar Sayacı Bildirim Servisi
 *
 * Notifee kullanarak Android chronometer ile bildirim menüsünde
 * iftar vaktine geri sayım gösterir.
 *
 * - Sabah namazından sonra aktif olur
 * - Akşam namazı vaktine kalan süreyi chronometer ile gösterir
 * - Vakit girdikten sonra 10 dk boyunca "vakit girdi" bildirimi gösterir
 * - 10 dk sonra otomatik kaybolur
 * - Zamanlanmış bildirimler (her dk tetiklenen) KULLANMAZ, tek chronometer yeterli
 */

import notifee, { TriggerType, AndroidImportance, TimestampTrigger } from '@notifee/react-native';
import { Platform } from 'react-native';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';

interface IftarSayacAyarlari {
  aktif: boolean;
  koordinatlar: { lat: number; lng: number };
}

export class IftarSayacBildirimServisi {
  private static instance: IftarSayacBildirimServisi;
  private ayarlar: IftarSayacAyarlari | null = null;
  private kanalOlusturuldu: boolean = false;

  private constructor() {}

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
      // Sabah namazından önce: sabah vaktinde geri sayım başlat
      await this.geriSayimPlanla(bildirimId, sabahVakti.getTime(), aksamVakti.getTime());
      // Akşam vaktinde "vakit girdi" bildirimi göster (farkli ID - trigger cakismasini onler)
      await this.vakitGirdiBildirimiPlanla(vakitGirdiId, aksamVakti.getTime());
      // Akşam + 10 dk'da temizle (farkli ID)
      await this.temizlemePlanla(temizlemeId, aksamArti10.getTime());
    } else if (simdi < aksamVakti) {
      // Sabah ile akşam arası: hemen geri sayım göster
      await this.geriSayimHemenGoster(bildirimId, aksamVakti.getTime());
      // Akşam vaktinde "vakit girdi" bildirimi göster (farkli ID)
      await this.vakitGirdiBildirimiPlanla(vakitGirdiId, aksamVakti.getTime());
      // Akşam + 10 dk'da temizle (farkli ID)
      await this.temizlemePlanla(temizlemeId, aksamArti10.getTime());
    } else if (simdi < aksamArti10) {
      // Akşam ile akşam+10dk arası: "vakit girdi" hemen göster
      await this.vakitGirdiBildirimiHemenGoster(vakitGirdiId, aksamVakti.getTime());
      // Akşam + 10 dk'da temizle (farkli ID)
      await this.temizlemePlanla(temizlemeId, aksamArti10.getTime());
    }
    // Akşam + 10 dk'dan sonra: hiçbir şey gösterme
  }

  /**
   * notifee kanalını oluştur
   */
  private async kanalOlustur(): Promise<void> {
    if (this.kanalOlusturuldu) return;

    try {
      // Eski kanali sil (LOW importance, Samsung'da gorunmuyor)
      try { await notifee.deleteChannel('iftar_sayac'); } catch (_) {}

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
   * Geri sayım bildirimini gelecekte planla (trigger)
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
        this.geriSayimBildirimIcerigi(bildirimId, aksamVaktiMs),
        trigger
      );
    } catch (error) {
      // Planlanamadıysa sessizce devam et
    }
  }

  /**
   * Geri sayım bildirimini hemen göster
   */
  private async geriSayimHemenGoster(
    bildirimId: string,
    aksamVaktiMs: number
  ): Promise<void> {
    try {
      await notifee.displayNotification(
        this.geriSayimBildirimIcerigi(bildirimId, aksamVaktiMs)
      );
    } catch (error) {
      // Gösterilemezse sessizce devam et
    }
  }

  /**
   * Geri sayım bildirim içeriği
   */
  private geriSayimBildirimIcerigi(bildirimId: string, aksamVaktiMs: number) {
    return {
      id: bildirimId,
      title: '🌙 İftar Sayacı',
      body: 'Akşam namazı vaktine kalan süre — Ezanı duymadan orucunuzu açmayınız!',
      android: {
        channelId: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
        ongoing: true,
        autoCancel: false,
        showChronometer: true,
        chronometerCountDown: true,
        timestamp: aksamVaktiMs,
        smallIcon: 'ic_notification',
        pressAction: { id: 'default' },
      },
    };
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
   * "Vakit girdi" bildirim içeriği - chronometer yukarı sayarak geçen süreyi gösterir
   */
  private vakitGirdiBildirimIcerigi(bildirimId: string, aksamVaktiMs: number) {
    return {
      id: bildirimId, // Aynı ID - geri sayımı replace eder
      title: '🌙 İftar Vakti Girdi!',
      body: 'Hayırlı iftarlar! — Ezanı duymadan orucunuzu açmayınız!',
      android: {
        channelId: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
        ongoing: true,
        autoCancel: false,
        showChronometer: true,
        chronometerCountDown: false, // Yukarı sayar (geçen süre)
        timestamp: aksamVaktiMs,
        smallIcon: 'ic_notification',
        pressAction: { id: 'default' },
      },
    };
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
          id: bildirimId, // Aynı ID - replace eder
          title: '',
          body: '',
          android: {
            channelId: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
            ongoing: false,
            autoCancel: true,
            timeoutAfter: 100, // 100ms sonra otomatik kapan
            smallIcon: 'ic_notification',
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
      // Trigger bildirimleri iptal et
      const triggerIds = await notifee.getTriggerNotificationIds();
      for (const id of triggerIds) {
        if (id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.IFTAR_SAYAC)) {
          await notifee.cancelTriggerNotification(id);
        }
      }

      // Görüntülenen bildirimleri temizle
      const gosterilenler = await notifee.getDisplayedNotifications();
      for (const bildirim of gosterilenler) {
        if (bildirim.id && bildirim.id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.IFTAR_SAYAC)) {
          await notifee.cancelNotification(bildirim.id);
        }
      }
    } catch (error) {
      // Temizleme hatası sessizce geçilir
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
