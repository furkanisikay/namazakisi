/**
 * taniListener middleware testi
 *
 * kazaVerileriniYukle.rejected dispatch edildiğinde sorunBildirildi'nin
 * tetiklendiğini doğrular (defence-in-depth).
 */

import { configureStore } from '@reduxjs/toolkit';
import taniReducer from '../taniSlice';
import kazaReducer, { kazaVerileriniYukle } from '../kazaSlice';
import { taniListenerMiddleware } from '../taniListener';

function testStoruKur() {
  return configureStore({
    reducer: {
      tani: taniReducer,
      kaza: kazaReducer,
    },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).prepend(
        taniListenerMiddleware.middleware,
      ),
  });
}

describe('taniListenerMiddleware — kazaVerileriniYukle.rejected', () => {
  it('rejected aksiyonu dispatch edilince sorunAlgilandi true olmalı', () => {
    const store = testStoruKur();

    // Rejected action'ı doğrudan dispatch et (thunk çalıştırmaya gerek yok)
    store.dispatch(
      kazaVerileriniYukle.rejected(new Error('test hatası'), 'test-req-id'),
    );

    const tani = store.getState().tani;
    expect(tani.sorunAlgilandi).toBe(true);
  });

  it('rejected aksiyonunda baglam "Kaza sayfası yüklenemedi" olmalı', () => {
    const store = testStoruKur();

    store.dispatch(
      kazaVerileriniYukle.rejected(new Error('test hatası'), 'test-req-id'),
    );

    const tani = store.getState().tani;
    expect(tani.baglam).toBe('Kaza sayfası yüklenemedi');
  });

  it('oturumdaGosterildi=true iken sorunAlgilandi değişmemeli', () => {
    const store = testStoruKur();

    // İlk rejected — modal açılır ve oturumdaGosterildi=true olarak işaretlenir
    store.dispatch(
      kazaVerileriniYukle.rejected(new Error('ilk hata'), 'req-1'),
    );
    // taniModaliKapat simulate et: oturumdaGosterildi=true olsun
    store.dispatch({ type: 'tani/taniModaliKapat' });

    // İkinci rejected — sorunAlgilandi yeniden true olmamalı
    store.dispatch(
      kazaVerileriniYukle.rejected(new Error('ikinci hata'), 'req-2'),
    );

    const tani = store.getState().tani;
    expect(tani.sorunAlgilandi).toBe(false);
    // Baglam güncellenmeli (sorunBildirildi her zaman çağrılır)
    expect(tani.baglam).toBe('Kaza sayfası yüklenemedi');
  });
});
