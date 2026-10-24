/**
 * Redux store konfigurasyonu
 */

import { configureStore } from '@reduxjs/toolkit';
import { taniListenerMiddleware } from './taniListener';
import { ozelGunListenerMiddleware } from './ozelGunListener';
import authReducer from './authSlice';
import namazReducer from './namazSlice';
import seriReducer from './seriSlice';
import muhafizReducer from './muhafizSlice';
import konumReducer from './konumSlice';
import vakitBildirimReducer from './vakitBildirimSlice';
import cumaHatirlatmaReducer from './cumaHatirlatmaSlice';
import yatisHatirlatmaReducer from './yatisHatirlatmaSlice';
import camiyeGitReducer from './camiyeGitSlice';
import takvimCakismaReducer from './takvimCakismaSlice';
import nafileReducer from './nafileSlice';
import nowBarReducer from './nowBarSlice';
import sadeGorunumReducer from './sadeGorunumSlice';
import hatirlatmaRizaReducer from './hatirlatmaRizaSlice';
import hesapReducer from './hesapSlice';
import seferilikReducer from './seferilikSlice';
import vakitSayacReducer from './vakitSayacSlice';
import iftarSayacReducer from './iftarSayacSlice';
import sahurSayacReducer from './sahurSayacSlice';
import guncellemeReducer from './guncellemeSlice';
import kazaReducer from './kazaSlice';
import takvimReducer from './takvimSlice';
import ozelliklerReducer from './ozelliklerSlice';
import yedeklemeReducer from './yedeklemeSlice';
import taniReducer from './taniSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    namaz: namazReducer,
    seri: seriReducer,
    muhafiz: muhafizReducer,
    konum: konumReducer,
    vakitBildirim: vakitBildirimReducer,
    cumaHatirlatma: cumaHatirlatmaReducer,
    yatisHatirlatma: yatisHatirlatmaReducer,
    camiyeGit: camiyeGitReducer,
    takvimCakisma: takvimCakismaReducer,
    nafile: nafileReducer,
    nowBar: nowBarReducer,
    sadeGorunum: sadeGorunumReducer,
    hatirlatmaRiza: hatirlatmaRizaReducer,
    hesap: hesapReducer,
    seferilik: seferilikReducer,
    vakitSayac: vakitSayacReducer,
    iftarSayac: iftarSayacReducer,
    sahurSayac: sahurSayacReducer,
    guncelleme: guncellemeReducer,
    kaza: kazaReducer,
    takvim: takvimReducer,
    ozellikler: ozelliklerReducer,
    yedekleme: yedeklemeReducer,
    tani: taniReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .prepend(taniListenerMiddleware.middleware)
      .prepend(ozelGunListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

