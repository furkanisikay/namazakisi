/**
 * Seri Sayacı Bildirim Servisi
 *
 * Notifee kullanarak Android chronometer ile bildirim menüsünde
 * imsak vaktine (gün bitişine) geri sayım gösterir.
 *
 * Duolingo tarzı: "X dk Y sn sonra serinizi kaybedeceksiniz!"
 *
 * - İmsak vaktinden imsakOncesiBaslangicDk dakika önce aktif olur
 * - Chronometer ile imsak vaktine geri sayım gösterir
 * - İmsak gelince otomatik kaybolur
 */

import notifee, { TriggerType, AndroidImportance, TimestampTrigger } from '@notifee/react-native';
import { Platform } from 'react-native';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';

export interface SeriSayacAyarlari {
  aktif: boolean;
  koordinatlar: { lat: number; lng: number };
  imsakOncesiBaslangicDk?: number; // default 60
}

export class SeriSayacBildirimServisi {
  private static instance: SeriSayacBildirimServisi;
  private kanalOlusturuldu: boolean = false;

  private constructor() {}

  public static getInstance(): SeriSayacBildirimServisi {
    if (!SeriSayacBildirimServisi.instance) {
      SeriSayacBildirimServisi.instance = new SeriSayacBildirimServisi();
    }
    return SeriSayacBildirimServisi.instance;
  }

  /**
   * Servisi yapılandır ve bildirimi planla
   */
  public async yapilandirVePlanla(ayarlar: SeriSayacAyarlari): Promise<void> {
    // Önce tüm seri sayaç bildirimlerini temizle
    await this.tumBildirimleriniTemizle();

    // iOS'ta desteklenmiyor
    if (Platform.OS !== 'android') {
      return;
    }

    // Aktif değilse bitir
    if (!ayarlar.aktif) {
      return;
    }

    // Koordinat kontrolü
    const { lat, lng } = ayarlar.koordinatlar;
    if (lat === 0 && lng === 0) {
      console.log('[SeriSayac] Koordinat yok, atlanıyor');
      return;
    }

    // notifee kanalını oluştur
    await this.kanalOlustur();

    // Vakit zamanlarını hesapla
    const imsakZamani = this.imsakZamaniniHesapla(lat, lng);
    if (!imsakZamani) return;

    const imsakMs = imsakZamani.getTime();
    const imsakOncesiDk = ayarlar.imsakOncesiBaslangicDk ?? 60;
    const baslangicMs = imsakMs - imsakOncesiDk * 60 * 1000;
    const simdi = new Date().getTime();

    const bugun = this.bugunTarihiAl();
    const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.SERI_SAYAC}${bugun}`;
    const temizlemeId = `${bildirimId}_bitis`;

    if (simdi >= imsakMs) {
      // İmsak geçmiş - gösterme
      return;
    } else if (simdi >= baslangicMs) {
      // Pencere içindeyiz - hemen göster
      await this.sayacHemenGoster(bildirimId, imsakMs);
      await this.temizlemePlanla(temizlemeId, imsakMs);
    } else {
      // Henüz pencere başlamadı - zamanla
      await this.sayacPlanla(bildirimId, baslangicMs, imsakMs);
      await this.temizlemePlanla(temizlemeId, imsakMs);
    }

    console.log(`[SeriSayac] Seri sayacı planlandı. İmsak: ${imsakZamani.toLocaleTimeString()}`);
  }

  /**
   * Gün bitimi imsak zamanını hesapla
   * Gece yarısından önce: yarınki imsak
   * Gece yarısından sonra ama imsaktan önce: bugünkü imsak
   */
  private imsakZamaniniHesapla(lat: number, lng: number): Date | null {
    try {
      const coordinates = new Coordinates(lat, lng);
      const params = CalculationMethod.Turkey();
      const simdi = new Date();

      const bugunPrayerTimes = new PrayerTimes(coordinates, simdi, params);

      // Eğer şu an imsaktan önceyse, bugünkü imsak gün bitişidir
      if (simdi < bugunPrayerTimes.fajr) {
        return bugunPrayerTimes.fajr;
      }

      // Aksi halde yarınki imsak gün bitişidir
      const yarinTarih = new Date(simdi);
      yarinTarih.setDate(yarinTarih.getDate() + 1);
      const yarinPrayerTimes = new PrayerTimes(coordinates, yarinTarih, params);
      return yarinPrayerTimes.fajr;
    } catch (error) {
      console.error('[SeriSayac] İmsak hesaplanamadı:', error);
      return null;
    }
  }

  /**
   * notifee kanalını oluştur
   */
  private async kanalOlustur(): Promise<void> {
    if (this.kanalOlusturuldu) return;

    try {
      await notifee.createChannel({
        id: BILDIRIM_SABITLERI.KANALLAR.SERI_SAYAC,
        name: 'Seri Sayacı',
        description: 'İmsak vaktine geri sayım — seri kaybı uyarısı',
        importance: AndroidImportance.DEFAULT,
        vibration: false,
        sound: '',
      });

      this.kanalOlusturuldu = true;
    } catch (error) {
      // Kanal oluşturulamazsa sessizce devam et
    }
  }

  /**
   * Bildirim içeriği
   */
  private sayacBildirimIcerigi(bildirimId: string, imsakMs: number) {
    return {
      id: bildirimId,
      title: '🔥 Seri Tehlikede!',
      body: 'İmsak vaktine sayılı dakika kaldı. Namazlarını tamamlamadan gün bitiyor!',
      android: {
        channelId: BILDIRIM_SABITLERI.KANALLAR.SERI_SAYAC,
        ongoing: true,
        autoCancel: false,
        showChronometer: true,
        chronometerCountDown: true,
        timestamp: imsakMs,
        smallIcon: 'ic_notification',
        pressAction: { id: 'default' },
      },
    };
  }

  /**
   * Sayacı hemen göster
   */
  private async sayacHemenGoster(bildirimId: string, imsakMs: number): Promise<void> {
    try {
      await notifee.displayNotification(this.sayacBildirimIcerigi(bildirimId, imsakMs));
    } catch (error) {
      console.error('[SeriSayac] Bildirim gösterilemedi:', error);
    }
  }

  /**
   * Sayacı ileride tetiklenecek şekilde planla
   */
  private async sayacPlanla(
    bildirimId: string,
    tetikMs: number,
    imsakMs: number
  ): Promise<void> {
    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: tetikMs,
      };

      await notifee.createTriggerNotification(
        this.sayacBildirimIcerigi(bildirimId, imsakMs),
        trigger
      );
    } catch (error) {
      console.error('[SeriSayac] Bildirim planlanamadı:', error);
    }
  }

  /**
   * İmsak vaktinde bildirimi temizle
   */
  private async temizlemePlanla(bildirimId: string, zamaniMs: number): Promise<void> {
    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: zamaniMs,
      };

      await notifee.createTriggerNotification(
        {
          id: bildirimId,
          title: '',
          body: '',
          android: {
            channelId: BILDIRIM_SABITLERI.KANALLAR.SERI_SAYAC,
            ongoing: false,
            autoCancel: true,
            timeoutAfter: 100,
            smallIcon: 'ic_notification',
          },
        },
        trigger
      );
    } catch (error) {
      // Sessizce devam et
    }
  }

  /**
   * Tüm seri sayaç bildirimlerini temizle
   */
  public async tumBildirimleriniTemizle(): Promise<void> {
    try {
      const triggerIds = await notifee.getTriggerNotificationIds();
      for (const id of triggerIds) {
        if (id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.SERI_SAYAC)) {
          await notifee.cancelTriggerNotification(id);
        }
      }

      const gosterilenler = await notifee.getDisplayedNotifications();
      for (const bildirim of gosterilenler) {
        if (bildirim.id && bildirim.id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.SERI_SAYAC)) {
          await notifee.cancelNotification(bildirim.id);
        }
      }
    } catch (error) {
      // Sessizce devam et
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
