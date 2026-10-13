import { createListenerMiddleware, isFulfilled } from '@reduxjs/toolkit';
import { Logger } from '../../core/utils/Logger';
import {
  ozelGunBaslat,
  ozelGunBitir,
  ozelGunIptal,
  ozelGunModuDurumunuGuncelle,
} from './seriSlice';

/**
 * Özel gün değişince hatırlatmaları HEMEN yeniden planlar (issue #272).
 *
 * Thunk'lar ayarı diske yazdıktan SONRA fulfilled olur → servisler kapıyı
 * diskten okuduğunda yeni değeri görür. İş fire-and-forget'tir: arayüz
 * yeniden planlamayı beklemez.
 */
export const ozelGunListenerMiddleware = createListenerMiddleware();

ozelGunListenerMiddleware.startListening({
  matcher: isFulfilled(ozelGunBaslat, ozelGunBitir, ozelGunIptal, ozelGunModuDurumunuGuncelle),
  effect: async () => {
    try {
      // TEMBEL YÜKLEME (konumSlice deseni): servis zinciri expo-task-manager /
      // notifee gibi NATIVE köprülere bağlıdır; statik import store'u yükleyen
      // her ekran testini `requireNativeModule` tuzağına düşürürdü. `import()`
      // DEĞİL `require()`: jest (CJS) dinamik import'u çalıştıramıyor.
      const { ozelGunDegistiUygula } = require('../../domain/services/OzelGunDegisikligiServisi') as
        typeof import('../../domain/services/OzelGunDegisikligiServisi');
      await ozelGunDegistiUygula();
    } catch (error) {
      Logger.error('ozelGunListener', 'Özel gün değişikliği hatırlatmalara yayılamadı', error);
    }
  },
});
