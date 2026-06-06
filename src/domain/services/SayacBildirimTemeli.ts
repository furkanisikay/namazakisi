/**
 * Gunluk geri sayim bildirim servisleri (Iftar / Sahur) icin ortak taban sinif.
 *
 * Kanal yonetimi, prefix-bazli temizleme ve trigger/native-countdown planlama
 * mantigini paylasir. Alt siniflar yalnizca:
 *   - `konfig` (kanal/prefix/metin/tema) ve
 *   - `vakitGirdiBildirimIcerigi` (vakit girince gosterilen bildirim — Iftar ve
 *     Sahur'da metin/davranis farkli)
 * saglar; zamanlama mantigini (`yapilandirVePlanla`) kendileri yazar ama bu
 * taban yardimcilarini kullanir.
 */

import notifee, { TriggerType, AndroidImportance, TimestampTrigger } from '@notifee/react-native';
import { startCountdown, stopCountdown } from '../../../modules/expo-countdown-notification/src';
import { Logger } from '../../core/utils/Logger';

export interface SayacKonfig {
  /** Bildirim ID oneki, orn. 'iftar_sayac_' */
  idOneki: string;
  /** Aktif notifee kanal ID'si, orn. 'iftar_sayac_v2' */
  kanalId: string;
  /** Silinecek eski kanal ID'si, orn. 'iftar_sayac' */
  eskiKanalId: string;
  kanalAdi: string;
  kanalAciklamasi: string;
  /** Native countdown baslik ve body sablonu */
  countdownBaslik: string;
  countdownBodyTemplate: string;
  /** Native modul tema anahtari */
  themeType: 'vakit' | 'iftar' | 'sahur';
}

export abstract class SayacBildirimTemeli {
  private kanalOlusturuldu = false;

  /** Alt sinifa ozel sabit konfigurasyon. */
  protected abstract get konfig(): SayacKonfig;

  /**
   * Vakit girince gosterilen bildirim icerigi. Iftar ve Sahur arasinda metin ve
   * ongoing/autoCancel/timeoutAfter davranisi farkli oldugu icin alt sinifta.
   */
  protected abstract vakitGirdiBildirimIcerigi(bildirimId: string, vakitMs: number): any;

  /** notifee kanalini olustur (eskisini silip DEFAULT importance ile). */
  protected async kanalOlustur(): Promise<void> {
    if (this.kanalOlusturuldu) return;
    try {
      try { await notifee.deleteChannel(this.konfig.eskiKanalId); } catch (_) { /* yok sayilabilir */ }
      await notifee.createChannel({
        id: this.konfig.kanalId,
        name: this.konfig.kanalAdi,
        description: this.konfig.kanalAciklamasi,
        importance: AndroidImportance.DEFAULT,
        vibration: false,
        sound: '',
      });
      this.kanalOlusturuldu = true;
    } catch (_) { /* kanal olusturulamazsa sessizce devam */ }
  }

  /** Native modul ile geri sayimi hemen baslat. */
  protected nativeCountdownBaslat(bildirimId: string, hedefMs: number): void {
    try {
      startCountdown({
        id: bildirimId,
        targetTimeMs: hedefMs,
        title: this.konfig.countdownBaslik,
        bodyTemplate: this.konfig.countdownBodyTemplate,
        channelId: this.konfig.kanalId,
        themeType: this.konfig.themeType,
      });
    } catch (error) {
      Logger.error(`${this.konfig.themeType}Sayac`, 'Native countdown baslatilamadi', error);
    }
  }

  /** "Vakit girdi" bildirimini ilerideki bir zamanda (trigger) planla. */
  protected async vakitGirdiBildirimiPlanla(bildirimId: string, vakitMs: number): Promise<void> {
    try {
      const trigger: TimestampTrigger = { type: TriggerType.TIMESTAMP, timestamp: vakitMs };
      await notifee.createTriggerNotification(this.vakitGirdiBildirimIcerigi(bildirimId, vakitMs), trigger);
    } catch (_) { /* planlanamadiysa sessizce devam */ }
  }

  /** "Vakit girdi" bildirimini hemen goster. */
  protected async vakitGirdiBildirimiHemenGoster(bildirimId: string, vakitMs: number): Promise<void> {
    try {
      await notifee.displayNotification(this.vakitGirdiBildirimIcerigi(bildirimId, vakitMs));
    } catch (_) { /* gosterilemezse sessizce devam */ }
  }

  /** Belirli bir zamanda bildirimi temizle (bos icerikli, otomatik kapanan trigger). */
  protected async temizlemePlanla(bildirimId: string, temizlemeZamani: number): Promise<void> {
    try {
      const trigger: TimestampTrigger = { type: TriggerType.TIMESTAMP, timestamp: temizlemeZamani };
      await notifee.createTriggerNotification(
        {
          id: bildirimId,
          title: '',
          body: '',
          android: {
            channelId: this.konfig.kanalId,
            ongoing: false,
            autoCancel: true,
            timeoutAfter: 100,
          },
        },
        trigger
      );
    } catch (_) { /* planlanamadiysa sessizce devam */ }
  }

  /** Bu servise ait tum bildirimleri (prefix bazli) temizle + native countdown'lari durdur. */
  public async tumBildirimleriniTemizle(): Promise<void> {
    try {
      const gosterilenler = await notifee.getDisplayedNotifications();
      for (const bildirim of gosterilenler) {
        if (bildirim.id && bildirim.id.startsWith(this.konfig.idOneki)) {
          try { stopCountdown(bildirim.id); } catch (_) { /* yok sayilabilir */ }
          await notifee.cancelNotification(bildirim.id);
        }
      }

      const triggerIds = await notifee.getTriggerNotificationIds();
      for (const id of triggerIds) {
        if (id.startsWith(this.konfig.idOneki)) {
          await notifee.cancelTriggerNotification(id);
        }
      }
    } catch (_) { /* temizleme hatasi sessizce gecilir */ }
  }
}
