/**
 * Yeni Özellik Duyuruları State Yönetimi
 *
 * İki seviyeli durum:
 *   - gorulenIdler:       kullanıcı özelliği açtı/gördü → rozet kalkar
 *   - kapatilanKartIdler: tanıtım kartı kapatıldı → kart bir daha gelmez (rozet kalır)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { RootState } from './store';

interface OzelliklerKalici {
    gorulenIdler: string[];
    kapatilanKartIdler: string[];
}

interface OzelliklerState extends OzelliklerKalici {
    yuklendi: boolean;
}

const initialState: OzelliklerState = {
    gorulenIdler: [],
    kapatilanKartIdler: [],
    yuklendi: false,
};

async function kaydet(durum: OzelliklerKalici): Promise<void> {
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.GORULEN_OZELLIKLER, JSON.stringify(durum));
}

export const ozellikleriYukle = createAsyncThunk(
    'ozellikler/yukle',
    async () => {
        try {
            const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.GORULEN_OZELLIKLER);
            if (!veri) return { gorulenIdler: [], kapatilanKartIdler: [] } as OzelliklerKalici;
            const parsed = JSON.parse(veri) as Partial<OzelliklerKalici>;
            return {
                gorulenIdler: parsed.gorulenIdler ?? [],
                kapatilanKartIdler: parsed.kapatilanKartIdler ?? [],
            } as OzelliklerKalici;
        } catch (hata) {
            Logger.error('OzelliklerSlice', 'Görülen özellikler yüklenemedi', hata);
            return { gorulenIdler: [], kapatilanKartIdler: [] } as OzelliklerKalici;
        }
    }
);

export const ozellikGorulduIsaretle = createAsyncThunk(
    'ozellikler/gorulduIsaretle',
    async (id: string | string[], { getState }) => {
        const state = getState() as RootState;
        const mevcut = state.ozellikler;
        const yeniIdler = Array.isArray(id) ? id : [id];
        const gorulenIdler = Array.from(new Set([...mevcut.gorulenIdler, ...yeniIdler]));
        const durum: OzelliklerKalici = {
            gorulenIdler,
            kapatilanKartIdler: mevcut.kapatilanKartIdler,
        };
        try {
            await kaydet(durum);
        } catch (hata) {
            Logger.error('OzelliklerSlice', 'Görüldü işaretlenemedi', hata);
        }
        return durum;
    }
);

export const ozellikKartiKapat = createAsyncThunk(
    'ozellikler/kartiKapat',
    async (id: string, { getState }) => {
        const state = getState() as RootState;
        const mevcut = state.ozellikler;
        const kapatilanKartIdler = Array.from(new Set([...mevcut.kapatilanKartIdler, id]));
        const durum: OzelliklerKalici = {
            gorulenIdler: mevcut.gorulenIdler,
            kapatilanKartIdler,
        };
        try {
            await kaydet(durum);
        } catch (hata) {
            Logger.error('OzelliklerSlice', 'Kart kapatılamadı', hata);
        }
        return durum;
    }
);

const ozelliklerSlice = createSlice({
    name: 'ozellikler',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(ozellikleriYukle.fulfilled, (state, action) => {
                state.gorulenIdler = action.payload.gorulenIdler;
                state.kapatilanKartIdler = action.payload.kapatilanKartIdler;
                state.yuklendi = true;
            })
            .addCase(ozellikGorulduIsaretle.fulfilled, (state, action) => {
                state.gorulenIdler = action.payload.gorulenIdler;
                state.kapatilanKartIdler = action.payload.kapatilanKartIdler;
            })
            .addCase(ozellikKartiKapat.fulfilled, (state, action) => {
                state.gorulenIdler = action.payload.gorulenIdler;
                state.kapatilanKartIdler = action.payload.kapatilanKartIdler;
            });
    },
});

export default ozelliklerSlice.reducer;
