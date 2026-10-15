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

import notifee, { AndroidImportance } from '@notifee/react-native';
import { zamanTetigiOlustur } from './notifeeTetik';
import { startCountdown, stopCountdown } from '../../../modules/expo-countdown-notification/src';
import { Logger } from '../../core/utils/Logger';
import { canliGuncellemeyeUygunMu, type CanliGuncellemeYuku } from '../../core/sayac/canliGuncelleme';
import type { CanliAday } from '../../core/sayac/canliSayacPlani';
import type { NowBarOgesi } from '../../core/sayac/nowBar';
import {
  CanliSayacPlanlayici,
  type CanliOgeKarari,
  type CanliSayacKaynagi,
} from './CanliSayacPlanlayici';

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
  themeType: 'vakit' | 'iftar' | 'sahur' | 'seri';
  /**
   * Hedef aninda bildirim sistem tarafindan kaldirilsin mi?
   *
   * Chronometer hedefte DURMAZ, sifiri gecince yukari sayar. Varsayilan `false`
   * — mevcut sayaclarin (iftar/sahur/vakit) davranisi birebir korunur.
   */
  hedefteKaybol?: boolean;
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
      // Bos `eskiKanalId` = silinecek eski kanal yok (yeni servisler).
      if (this.konfig.eskiKanalId) {
        try { await notifee.deleteChannel(this.konfig.eskiKanalId); } catch { /* yok sayilabilir */ }
      }
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

  /**
   * Native modul ile geri sayimi hemen baslat.
   *
   * `canli` (issue #282): Android 16 Live Update verisi. Yalniz izinli temada
   * (`canliGuncellemeyeUygunMu` — seri YOK) native'e gecer; native taraf API 36+
   * ve kullanici izni yoksa eski ozel gorunume BIREBIR duser.
   */
  /**
   * Now Bar seçimi (issue #282 ikinci aşama): planlayıcı bu öğeyi devraldı mı?
   * Hata olursa ilk aşamanın davranışı (devralma yok, öne çıkarma isteği var).
   */
  protected async canliKarari(oge: NowBarOgesi): Promise<CanliOgeKarari> {
    try {
      return await CanliSayacPlanlayici.getInstance().ogeKarari(oge);
    } catch {
      return { devralir: false, oneCikar: true };
    }
  }

  /**
   * Bu sayacın GÜNCEL pencerelerini planlayıcıya bildirir (boş = aday yok). Eski
   * yolda kendi bildirimini kurmadan ÖNCE beklenmeli (bkz. `kaynakBildir`).
   */
  protected async canliKaynagiBildir(kaynak: CanliSayacKaynagi, adaylar: CanliAday[]): Promise<void> {
    try {
      await CanliSayacPlanlayici.getInstance().kaynakBildir(kaynak, adaylar);
    } catch {
      // Plan kurulamazsa sayaç eski yolunda çalışmaya devam eder.
    }
  }

  /** Planlayıcıya giden sayaç adayı (başlık/kanal/tema bu servisin konfiginden). */
  protected canliAdayi(
    oge: NowBarOgesi,
    bildirimId: string,
    baslangicMs: number,
    hedefMs: number,
    canli: CanliGuncellemeYuku,
    dogalBaslangicMs?: number
  ): CanliAday {
    return {
      oge,
      kaynak: 'sayac',
      id: bildirimId,
      baslangicMs,
      dogalBaslangicMs,
      hedefMs,
      baslik: this.konfig.countdownBaslik,
      govdeSablonu: this.konfig.countdownBodyTemplate,
      kanalId: this.konfig.kanalId,
      tema: this.konfig.themeType,
      hedefteKaybol: this.konfig.hedefteKaybol ?? false,
      canli,
    };
  }

  protected nativeCountdownBaslat(bildirimId: string, hedefMs: number, canli?: CanliGuncellemeYuku): void {
    try {
      startCountdown({
        id: bildirimId,
        targetTimeMs: hedefMs,
        title: this.konfig.countdownBaslik,
        bodyTemplate: this.konfig.countdownBodyTemplate,
        channelId: this.konfig.kanalId,
        themeType: this.konfig.themeType,
        autoDismissAtTarget: this.konfig.hedefteKaybol ?? false,
        canli: canli && canliGuncellemeyeUygunMu(this.konfig.themeType) ? canli : undefined,
      });
    } catch (error) {
      Logger.error(`${this.konfig.themeType}Sayac`, 'Native countdown baslatilamadi', error);
    }
  }

  /** "Vakit girdi" bildirimini ilerideki bir zamanda (trigger) planla. */
  protected async vakitGirdiBildirimiPlanla(bildirimId: string, vakitMs: number): Promise<void> {
    try {
      const trigger = await zamanTetigiOlustur(vakitMs);
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
      const trigger = await zamanTetigiOlustur(temizlemeZamani);
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
      // Optimizasyon: Bildirim okuma islemlerini paralel yap
      const [gosterilenler, triggerIds] = await Promise.all([
        notifee.getDisplayedNotifications().catch(() => []),
        notifee.getTriggerNotificationIds().catch(() => [])
      ]);

      const iptalIslemleri: Promise<void>[] = [];

      for (const bildirim of gosterilenler) {
        if (bildirim && bildirim.id && bildirim.id.startsWith(this.konfig.idOneki)) {
          try { stopCountdown(bildirim.id); } catch (_) { /* yok sayilabilir */ }
          iptalIslemleri.push(notifee.cancelNotification(bildirim.id).catch(() => {}));
        }
      }

      for (const id of triggerIds) {
        if (id && id.startsWith(this.konfig.idOneki)) {
          iptalIslemleri.push(notifee.cancelTriggerNotification(id).catch(() => {}));
        }
      }

      // Tum iptal islemlerini paralel olarak gerceklestir
      if (iptalIslemleri.length > 0) {
        await Promise.all(iptalIslemleri);
      }
    } catch (_) { /* temizleme hatasi sessizce gecilir */ }
  }
}
