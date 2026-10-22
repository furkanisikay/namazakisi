import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LocalVakitBildirimServisi, VakitBildirimAyarlari } from '../../data/local/LocalVakitBildirimServisi';
import { VakitBildirimYoneticiServisi } from '../../domain/services/VakitBildirimYoneticiServisi';
import {
    vakitSesiniAyarla,
    type VakitBildirimSesleri,
    type VakitSesSecimi,
} from '../../core/bildirim/vakitBildirimSesi';

interface VakitBildirimState {
    ayarlar: VakitBildirimAyarlari;
    /** Vakit başına ses (cihaza özgü; `ayarlar`'dan AYRI — `ayarlar` beş boolean kalır). */
    sesler: VakitBildirimSesleri;
    yukleniyor: boolean;
    hata: string | null;
}

const initialState: VakitBildirimState = {
    ayarlar: {
        imsak: false,
        ogle: false,
        ikindi: false,
        aksam: false,
        yatsi: false,
    },
    sesler: {},
    yukleniyor: false,
    hata: null,
};

// Thunks

/**
 * Ayarları yerel depolamadan yükler
 */
export const vakitBildirimAyarlariniYukle = createAsyncThunk(
    'vakitBildirim/yukle',
    async () => {
        const ayarlar = await LocalVakitBildirimServisi.getAyarlar();
        return ayarlar;
    }
);

/**
 * Tek bir vakit ayarını günceller ve bildirimleri yeniden planlar
 */
export const vakitBildirimAyariniGuncelle = createAsyncThunk(
    'vakitBildirim/guncelle',
    async ({ vakit, aktif }: { vakit: keyof VakitBildirimAyarlari; aktif: boolean }) => {
        // 1. Yerel veriyi güncelle
        const yeniAyarlar = await LocalVakitBildirimServisi.updateVakitAyar(vakit, aktif);
        if (!yeniAyarlar) throw new Error('Ayar güncellenemedi');

        // 2. Bildirimleri yeniden planla (Background service)
        const yonetici = VakitBildirimYoneticiServisi.getInstance();
        await yonetici.bildirimleriGuncelle();

        return yeniAyarlar;
    }
);

/**
 * Tüm ayarları toplu günceller (Gerekirse)
 */
export const tumVakitBildirimAyarlariniGuncelle = createAsyncThunk(
    'vakitBildirim/topluGuncelle',
    async (ayarlar: VakitBildirimAyarlari) => {
        // `saveAyarlar` hatayı yutup `false` döner: sessiz kayıp yerine gerçek hata.
        if (!(await LocalVakitBildirimServisi.saveAyarlar(ayarlar))) {
            throw new Error('Vakit bildirim ayarları kaydedilemedi');
        }

        const yonetici = VakitBildirimYoneticiServisi.getInstance();
        await yonetici.bildirimleriGuncelle();

        return ayarlar;
    }
);

/** Vakit başına sesleri yükler (bölüm açılınca; açılışta YÜKLENMEZ). */
export const vakitBildirimSesleriniYukle = createAsyncThunk('vakitBildirim/sesleriYukle', async () =>
    LocalVakitBildirimServisi.getSesler()
);

/**
 * Bir vaktin sesini değiştirir (`null` = telefonun bildirim sesine dön) ve bildirimleri
 * yeniden planlar — kanal id'si sesin fonksiyonu olduğu için önceden kurulmuş bildirim
 * eski kanalda kalırdı.
 */
export const vakitBildirimSesiniGuncelle = createAsyncThunk(
    'vakitBildirim/sesGuncelle',
    async ({ vakit, secim }: { vakit: keyof VakitBildirimAyarlari; secim: VakitSesSecimi | null }) => {
        const mevcut = await LocalVakitBildirimServisi.getSesler();
        const yeni = vakitSesiniAyarla(mevcut, vakit, secim);
        if (!(await LocalVakitBildirimServisi.saveSesler(yeni))) {
            throw new Error('Vakit bildirim sesi kaydedilemedi');
        }
        await VakitBildirimYoneticiServisi.getInstance().bildirimleriGuncelle();
        return yeni;
    }
);

// Slice

const vakitBildirimSlice = createSlice({
    name: 'vakitBildirim',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Yükleme
        builder.addCase(vakitBildirimAyarlariniYukle.pending, (state) => {
            state.yukleniyor = true;
            state.hata = null;
        });
        builder.addCase(vakitBildirimAyarlariniYukle.fulfilled, (state, action) => {
            state.yukleniyor = false;
            state.ayarlar = action.payload;
        });
        builder.addCase(vakitBildirimAyarlariniYukle.rejected, (state, action) => {
            state.yukleniyor = false;
            state.hata = action.error.message || 'Ayarlar yüklenemedi';
        });

        builder.addCase(vakitBildirimSesleriniYukle.fulfilled, (state, action) => {
            state.sesler = action.payload;
        });
        builder.addCase(vakitBildirimSesiniGuncelle.fulfilled, (state, action) => {
            state.sesler = action.payload;
        });

        // Güncelleme
        builder.addCase(vakitBildirimAyariniGuncelle.fulfilled, (state, action) => {
            state.ayarlar = action.payload;
        });

        // Toplu Güncelleme
        builder.addCase(tumVakitBildirimAyarlariniGuncelle.fulfilled, (state, action) => {
            state.ayarlar = action.payload;
        });
    },
});

export default vakitBildirimSlice.reducer;
