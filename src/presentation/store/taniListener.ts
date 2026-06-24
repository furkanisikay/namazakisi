import { createListenerMiddleware, isRejected } from '@reduxjs/toolkit';
import { kazaVerileriniYukle } from './kazaSlice';
import { sorunBildirildi } from './taniSlice';

export const taniListenerMiddleware = createListenerMiddleware();

taniListenerMiddleware.startListening({
  matcher: isRejected(kazaVerileriniYukle),
  effect: (_action, api) => {
    api.dispatch(sorunBildirildi('Kaza sayfası yüklenemedi'));
  },
});
