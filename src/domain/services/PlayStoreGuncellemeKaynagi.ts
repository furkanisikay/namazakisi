/**
 * Play Store Guncelleme Kaynagi
 *
 * GuncellemeKaynagi interface'ini implement eder.
 * Uygulama Play Store'dan kurulduğunda bu provider aktif olur.
 * Play Core AppUpdateManager API'si üzerinden güncelleme durumu kontrol edilir.
 */

import { Platform } from 'react-native';
import {
  GuncellemeKaynagi,
  GuncellemeKontrolSonucu,
} from './GuncellemeServisi';
import { GuncellemeKaynagiTipi, UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { PlayStoreModulu } from './PlayStoreGuncellemeModulu';
import { Logger } from '../../core/utils/Logger';

export class PlayStoreGuncellemeKaynagi implements GuncellemeKaynagi {
  readonly tip: GuncellemeKaynagiTipi = 'playstore';

  destekleniyor(): boolean {
    return Platform.OS === 'android';
  }

  async enSonSurumuKontrolEt(): Promise<GuncellemeKontrolSonucu> {
    try {
      const durum = await PlayStoreModulu.guncellemeDurumunuKontrolEt();

      if (!durum.guncellemeMevcut) {
        Logger.info('PlayStoreGuncellemeKaynagi', 'Güncelleme mevcut değil');
        return { guncellemeMevcut: false, bilgi: null };
      }

      Logger.info(
        'PlayStoreGuncellemeKaynagi',
        `Güncelleme mevcut. versionCode: ${durum.availableVersionCode}`
      );

      return {
        guncellemeMevcut: true,
        bilgi: {
          // Play Core sürüm ADINI ve changelog'u vermez; yalnızca versionCode verir.
          // versionCode'u erteleme/karşılaştırma MANTIĞI için saklarız ama kullanıcıya
          // göstermeyiz — UI temiz "Yeni sürüm" etiketini gösterir. Özelliklerin
          // tanıtımı güncelleme sonrası "Neler Yeni" sistemiyle yapılır.
          yeniVersiyon: durum.availableVersionCode
            ? String(durum.availableVersionCode)
            : 'playstore',
          yeniVersiyonEtiketi: 'Yeni sürüm',
          mevcutVersiyon: UYGULAMA.VERSIYON,
          degisiklikNotlari: '',
          // Sembolik URL — GuncellemeBildirimi'nde kaynak 'playstore' olunca
          // Linking.openURL yerine native flow başlatılır
          indirmeBaglantisi: 'playstore://update',
          yayinTarihi: '',
          kaynak: 'playstore',
          zorunluMu: false,
        },
      };
    } catch (hata: any) {
      Logger.warn('PlayStoreGuncellemeKaynagi', 'Kontrol hatası:', hata?.message);
      return { guncellemeMevcut: false, bilgi: null };
    }
  }
}
