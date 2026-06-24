import { createListenerMiddleware, isRejected } from '@reduxjs/toolkit';
import { Logger } from '../../core/utils/Logger';
import { kazaVerileriniYukle } from './kazaSlice';
import { sorunBildirildi } from './taniSlice';

export const taniListenerMiddleware = createListenerMiddleware();

// Bilinen sessiz-hata sinyallerini (şimdilik kaza yükleme reddi) kullanıcı-onaylı
// rapora çevirir; defense-in-depth (UI render kapısı kilitlense bile tetiklenir).
taniListenerMiddleware.startListening({
  matcher: isRejected(kazaVerileriniYukle),
  effect: (action, api) => {
    Logger.warn('taniListener', 'Kaza yükleme reddi tanı tetikledi', {
      hata: (action as { error?: { message?: string } }).error?.message,
    });
    api.dispatch(sorunBildirildi('Kaza sayfası yüklenemedi'));
  },
});
