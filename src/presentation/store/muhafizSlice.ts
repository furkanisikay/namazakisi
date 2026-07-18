/**
 * Muhafiz State Yonetimi
 * Namaz hatirlatma bildirimleri ayarlari
 * SOLID: Single Responsibility - Sadece hatirlatma ayarlari
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';
import type { PresetSeviyeAyari, PresetSeviyeleri } from '../../core/muhafiz/matrisIslemleri';
import {
    presetMatrisiOlustur,
    presetSesliIceriyorMu,
    presetUygula,
} from '../../core/muhafiz/matrisIslemleri';
import { matrisGecerliMi } from '../../core/muhafiz/motorAdaptoru';

/**
 * Hatirlatma yogunlugu preset tipleri
 * 'ozel' secilirse kullanici gelismis ayarlardan kendisi yapar
 */
export type HatirlatmaYogunlugu = 'hafif' | 'normal' | 'yogun' | 'ozel';

/** Eski (global) seviye-bazli deger sekli — geriye uyumluluk icin korunur. */
export interface EskiSeviyeDegerleri {
    seviye1: number;
    seviye2: number;
    seviye3: number;
    seviye4: number;
}

/**
 * PRESET TASARIMI — neden boyle (kanit temelli):
 *
 * - Her EK hatirlatmada kabul olasiligi ~%30 duser (PMC5387195; 112 klinisyen,
 *   1,26M uyari, 3,5 yil) → tekrar korlestirir. Eski 'yogun' preset vakit basina
 *   15 bildirim uretiyordu (gunde 75); son 9'u kanitli bicimde etkisizdi.
 * - Kip (modalite) degisimi tekrardan cok daha etkili: tahliye deneyinde harekete
 *   gecme suresi yalniz ZIL ile 8 dk 15 sn, KONUSAN anons ile 1 dk 15 sn
 *   (Proulx & Sime, 1991, IAFSS).
 * → Cozum: tekrari kes, son adimda MOD degistir (sesli anons).
 *
 * Uretilen uyari sayilari (motorla dogrulandi, `matrisIslemleri.test.ts`):
 *   hafif 4/vakit (0 sesli) · normal 6/vakit (1 sesli) · yogun 7/vakit (2 sesli)
 *
 * 'hafif' KASTEN sessizdir: hafifi secen kullanici tam da sesin sorun oldugu
 * ortamdaki kisidir; sesli eklemek bu preset'in tek ayirt edici ozelligini yok eder.
 * Sesli adimlarda 'sesli' degil 'ikisi' kullanilir — ses tek kanal olmamali; TTS
 * yoksa/sessizse gorsel iz kalmali.
 */
const HAFIF_SEVIYELERI: PresetSeviyeleri = {
    nazik: { esikDk: 30, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
    uyari: { esikDk: 10, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
    sert: { esikDk: 5, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
    acil: { esikDk: 2, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
};

const NORMAL_SEVIYELERI: PresetSeviyeleri = {
    nazik: { esikDk: 45, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
    uyari: { esikDk: 25, siklik: { herDk: 10 }, mod: 'bildirim', acilKanal: false },
    sert: { esikDk: 10, siklik: { herDk: 5 }, mod: 'bildirim', acilKanal: false },
    acil: { esikDk: 3, siklik: 'birkez', mod: 'ikisi', acilKanal: false },
};

/**
 * 'yogun' son adimi ACIL kanaldan gider (MAX onem + bypassDnd). Bu, eskiden
 * `bildirimSesi: 'alarm'` ile ifade ediliyordu; ses ile onem AYRILDIGI icin artik
 * dogru alanda duruyor — boylece bu preset kullanicinin sectigi sesi SILMEZ.
 */
const YOGUN_SEVIYELERI: PresetSeviyeleri = {
    nazik: { esikDk: 60, siklik: 'birkez', mod: 'bildirim', acilKanal: false },
    uyari: { esikDk: 30, siklik: { herDk: 10 }, mod: 'bildirim', acilKanal: false },
    sert: { esikDk: 15, siklik: { herDk: 5 }, mod: 'bildirim', acilKanal: false },
    acil: { esikDk: 6, siklik: { herDk: 3 }, mod: 'ikisi', acilKanal: true },
};

const eskiEsikler = (s: PresetSeviyeleri): EskiSeviyeDegerleri => ({
    seviye1: s.nazik.esikDk,
    seviye2: s.uyari.esikDk,
    seviye3: s.sert.esikDk,
    seviye4: s.acil.esikDk,
});

/**
 * Eski semada 'birkez' YOKTUR (yalniz dakika sayisi). Esik = siklik yazmak eski
 * motorda da "yalniz esik aninda tetikle" demektir ((esik - kalan) % esik === 0
 * bir sonraki tetigi kalan=0'a atar, o da pencere disi) → sadik cevrim.
 */
const eskiSiklik = (p: PresetSeviyeAyari): number =>
    p.siklik === 'birkez' ? p.esikDk : p.siklik.herDk;

const eskiSikliklar = (s: PresetSeviyeleri): EskiSeviyeDegerleri => ({
    seviye1: eskiSiklik(s.nazik),
    seviye2: eskiSiklik(s.uyari),
    seviye3: eskiSiklik(s.sert),
    seviye4: eskiSiklik(s.acil),
});

export interface HatirlatmaPreseti {
    aciklama: string;
    ikon: string;
    /** Tek dogru kaynak: esik + siklik + mod + bildirim sesi. */
    seviyeler: PresetSeviyeleri;
    /** `seviyeler`den TURETILIR — eski global alanlar icin (geriye uyumluluk). */
    esikler: EskiSeviyeDegerleri;
    sikliklar: EskiSeviyeDegerleri;
}

const presetOlustur = (
    aciklama: string,
    ikon: string,
    seviyeler: PresetSeviyeleri
): HatirlatmaPreseti => ({
    aciklama,
    ikon,
    seviyeler,
    esikler: eskiEsikler(seviyeler),
    sikliklar: eskiSikliklar(seviyeler),
});

/**
 * Preset ayarlari - kullanici basitce secsin
 */
export const HATIRLATMA_PRESETLERI: Record<Exclude<HatirlatmaYogunlugu, 'ozel'>, HatirlatmaPreseti> = {
    hafif: presetOlustur('Yalnız bildirim', '🔔', HAFIF_SEVIYELERI),
    normal: presetOlustur('Dengeli · sesli', '🔔🔔', NORMAL_SEVIYELERI),
    yogun: presetOlustur('Israrcı · sesli', '🔔🔔🔔', YOGUN_SEVIYELERI),
};

/**
 * Muhafiz ayarlari arayuzu
 * Sadece hatirlatma ile ilgili alanlar
 */
export interface MuhafizAyarlari {
    /** Muhafiz aktif mi */
    aktif: boolean;
    /** Hatirlatma yogunlugu preset secimi */
    yogunluk: HatirlatmaYogunlugu;
    /** Gelismis mod acik mi */
    gelismisMod: boolean;
    /** Seviye esikleri (dakika) */
    esikler: {
        seviye1: number;
        seviye2: number;
        seviye3: number;
        seviye4: number;
    };
    /** Tekrar sikliklari (dakika) */
    sikliklar: {
        seviye1: number;
        seviye2: number;
        seviye3: number;
        seviye4: number;
    };
    /** Vakit x seviye matrisi (Faz 1+; eski alanlar Faz 3'e kadar paralel korunur) */
    matris?: MuhafizMatrisi;
    /**
     * Yoğunluk 'ozel' iken en son elle ayarlanan matrisin yedeği. Kullanıcı bir
     * preset'e (hafif/normal/yogun) geçtiğinde özel yapılandırma KAYBOLMASIN diye
     * burada saklanır; "Özel"e tekrar dönülünce buradan geri yüklenir.
     */
    ozelMatrisYedegi?: MuhafizMatrisi;
    /**
     * Sesli anonsun (TTS) sessiz modu ve Rahatsiz Etmeyin'i DELECEGI kullaniciya
     * anlatildi ve onaylandi mi? Onay verilmeden hazir yogunluklar sesli hucreleri
     * etkinlestirmez ('bildirim'e duser). Bir kez true olunca bir daha sorulmaz.
     */
    sesliOnayi?: boolean;
    /**
     * Bir kerelik preset gocu (tekrar azaltma) bu kayda uygulandi mi?
     * `initialState`'te TRUE — taze kurulum zaten guncel preset'le baslar; yalnizca
     * diskteki ESKI kayitlar (bu alan yok) goce girer. Bkz. `presetGocunuUygula`.
     */
    presetGocuYapildi?: boolean;
}

type PresetliYogunluk = Exclude<HatirlatmaYogunlugu, 'ozel'>;

const presetliYogunlukMu = (yogunluk: HatirlatmaYogunlugu): yogunluk is PresetliYogunluk =>
    Object.prototype.hasOwnProperty.call(HATIRLATMA_PRESETLERI, yogunluk);

/**
 * BIR KERELIK PRESET GOCU — "tekrar azaltma herkese ulassin, ses rizaya bagli kalsin".
 *
 * NEDEN: preset'lerin asil kazanci etkisiz tekrari kesmekti (yogun 15 → 7 uyari/vakit;
 * her ek hatirlatmada kabul olasiligi ~%30 duser — PMC5387195). Goc olmasaydi bu kazanc
 * mevcut kullanicilarin HICBIRINE ulasmaz, herkes yogunluk butonuna yeniden dokunana
 * kadar gunde 75 bildirim almaya devam ederdi.
 *
 * IKI KAPI (ikisi de zorunlu):
 *   1. Yalniz `yogunluk !== 'ozel'` kayitlara uygulanir. Elle ayar yapmis kullanicinin
 *      matrisi onun kisisel emegidir → BIRE BIR korunur (yalniz bayrak isaretlenir).
 *   2. Sesli hucreler `sesliIzinVar = (sesliOnayi === true)` ile uygulanir. Onay yoksa
 *      'ikisi' → 'bildirim'e duser: goc RIZA YERINE GECMEZ. Kullanici ayarlara girip
 *      yogunluga dokundugunda `SesliOnayModal` normal akisiyla cikar ve sesliyi o an acar.
 *
 * Yani goc yalniz ZAMANLAMA + TEKRAR AZALTMAYI tasir (tek yonlu, riza gerektirmeyen fayda).
 * `anonsMetni` `presetUygula` tarafindan zaten korunur.
 */
function presetGocunuUygula(
    yogunluk: HatirlatmaYogunlugu,
    mevcutMatris: MuhafizMatrisi,
    sesliOnayi: boolean | undefined
): Partial<MuhafizAyarlari> {
    // Kapı 1 — 'ozel' (veya diskte bozuk/bilinmeyen yoğunluk): DOKUNMA.
    if (!presetliYogunlukMu(yogunluk)) return {};

    const preset = HATIRLATMA_PRESETLERI[yogunluk];
    // Kapı 2 — sesli yalnız onay varsa açılır.
    const sesliIzinVar = sesliOnayi === true;
    return {
        esikler: preset.esikler,
        sikliklar: preset.sikliklar,
        matris: matrisGecerliMi(mevcutMatris)
            ? presetUygula(mevcutMatris, preset.seviyeler, sesliIzinVar)
            : presetMatrisiOlustur(preset.seviyeler, sesliIzinVar),
    };
}

/**
 * Hazir yogunlugu store'a yazilabilir TAM ayar parcasina cevirir (kurulum sihirbazi).
 *
 * TUZAK (duzeltildi): sihirbaz eskiden preset nesnesini dogrudan spread ediyordu
 * (`...HATIRLATMA_PRESETLERI[y]`) → store'a yalniz `esikler`/`sikliklar` (+ `aciklama`,
 * `ikon` cop alanlari) gidiyor, `matris` ise reducer icinde `eskidenMatriseGoc` ile
 * turetiliyordu; o goc `mod`'u DAIMA 'bildirim' sabitler. Sonuc: sihirbazdan gecen
 * kullanicida sesli preset'lerin anons adimi hic calismiyordu. Artik `matris`
 * preset'ten DOGRUDAN uretilir ve payload'da geldigi icin reducer onu yeniden
 * turetmez (bkz. `muhafizAyarlariniGuncelle`).
 *
 * `sesliOnayi`: sihirbazin yogunluk karti sesli anonsu ve sessiz mod/DND davranisini
 * acikca yazar → karti secmek bilgilendirilmis onaydir; Ayarlar ekrani ayni onayi
 * bir daha sormaz.
 */
export function presetAyarlariniOlustur(
    yogunluk: Exclude<HatirlatmaYogunlugu, 'ozel'>
): Partial<MuhafizAyarlari> {
    const preset = HATIRLATMA_PRESETLERI[yogunluk];
    const sesliVar = presetSesliIceriyorMu(preset.seviyeler);
    return {
        esikler: preset.esikler,
        sikliklar: preset.sikliklar,
        matris: presetMatrisiOlustur(preset.seviyeler, sesliVar),
        ...(sesliVar ? { sesliOnayi: true } : {}),
    };
}

/**
 * Varsayilan muhafiz ayarlari
 *
 * Matris 'normal' preset'inden uretilir ama `sesliIzinVar: false` ile — taze
 * kurulumda kullanici sesli anonsa henuz onay vermemistir.
 *
 * `presetGocuYapildi: true` — taze kurulum ZATEN guncel preset'le basladigi icin goc
 * gereksizdir. Bayrak initialState'te oldugundan, bu state'ten uretilen her disk kaydi
 * (sihirbaz dahil) bayragi tasir → goc yalnizca bayragi olmayan ESKI kayitlarda calisir.
 */
const initialState: MuhafizAyarlari = {
    aktif: false,
    yogunluk: 'normal',
    gelismisMod: false,
    esikler: HATIRLATMA_PRESETLERI.normal.esikler,
    sikliklar: HATIRLATMA_PRESETLERI.normal.sikliklar,
    matris: presetMatrisiOlustur(HATIRLATMA_PRESETLERI.normal.seviyeler, false),
    presetGocuYapildi: true,
};

/**
 * Muhafiz ayarlarini AsyncStorage'dan yukle
 */
export const muhafizAyarlariniYukle = createAsyncThunk(
    'muhafiz/yukle',
    async () => {
        try {
            const veri = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
            if (veri) {
                const parsed = JSON.parse(veri);
                // Eski veriden sadece muhafiz ile ilgili alanlari al.
                // esikler/sikliklar ALAN-BAZLI birlestirilir: diskteki nesne mevcut ama
                // icindeki bir seviyeN eksikse (bozuk/kismi kayit), nesne-duzeyi `??`
                // devreye girmez ve undefined esik/siklik matrise sizardi -> initialState
                // ile spread ederek eksik alanlari doldur.
                const temel = {
                    aktif: parsed.aktif ?? initialState.aktif,
                    yogunluk: parsed.yogunluk ?? initialState.yogunluk,
                    gelismisMod: parsed.gelismisMod ?? initialState.gelismisMod,
                    esikler: { ...initialState.esikler, ...parsed.esikler },
                    sikliklar: { ...initialState.sikliklar, ...parsed.sikliklar },
                };
                const mevcutMatris: MuhafizMatrisi = parsed.matris ?? eskidenMatriseGoc(temel);

                // Bir kerelik preset göçü: yalnız bayrağı OLMAYAN eski kayıtlarda.
                // 'ozel' yoğunlukta `presetGocunuUygula` boş döner → matris bire bir korunur,
                // ama bayrak yine işaretlenir ki her açılışta tekrar denenmesin (idempotent).
                const gocGerekli = parsed.presetGocuYapildi !== true;
                const goc = gocGerekli
                    ? presetGocunuUygula(temel.yogunluk, mevcutMatris, parsed.sesliOnayi)
                    : {};

                const sonuc: MuhafizAyarlari = {
                    ...temel,
                    matris: mevcutMatris,
                    ...goc,
                    // Opsiyonel alanlar AÇIKÇA taşınmalı: `temel`e eklenmezlerse
                    // diske yazılan değer uygulama yeniden açılınca sessizce kaybolur.
                    // ozelMatrisYedegi: diskte yoksa undefined ("Özel" butonu gizli kalır).
                    ozelMatrisYedegi: parsed.ozelMatrisYedegi,
                    // sesliOnayi: undefined = henüz onay yok → sesli hücreler açılmaz.
                    sesliOnayi: parsed.sesliOnayi,
                    presetGocuYapildi: true,
                };

                if (gocGerekli) {
                    // Bayrağı HEMEN diske yaz — yoksa göç her açılışta yeniden çalışır ve
                    // kullanıcının elle yaptığı mod/ses değişikliklerini sürekli geri alır.
                    // (Reducer'lar da bu anahtara aynı biçimde yazar; tek yazıcı yok.)
                    await AsyncStorage.setItem(
                        DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI,
                        JSON.stringify(sonuc)
                    );
                }
                return sonuc;
            }
            return null;
        } catch (hata) {
            Logger.error('MuhafizSlice', 'Muhafiz ayarlari yuklenemedi', hata);
            return null;
        }
    }
);

/**
 * Muhafiz slice tanimlamasi
 */
const muhafizSlice = createSlice({
    name: 'muhafiz',
    initialState,
    reducers: {
        /**
         * Muhafiz ayarlarini guncelle
         */
        muhafizAyarlariniGuncelle: (state, action: PayloadAction<Partial<MuhafizAyarlari>>) => {
            const yeniState = { ...state, ...action.payload };
            // Faz 1'de matris eski alanlarin (esik/siklik) TUREVI'dir. Eski alanlar
            // degisip matris payload'da GELMEZSE matris'i yeniden turet; aksi halde
            // matris ilk ayar degisikliginde initialState degerlerinde BAYATLAR ve
            // yukleme migrasyonu (parsed.matris dolu oldugu icin) bir daha calismaz.
            // (Faz 2'de UI matris'i dogrudan matrisiGuncelle ile yazacak.)
            if ((action.payload.esikler || action.payload.sikliklar) && !action.payload.matris) {
                yeniState.matris = eskidenMatriseGoc(yeniState);
            }
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(yeniState));
            return yeniState;
        },

        /**
         * Muhafiz state'ini sifirla
         */
        muhafizStateSifirla: () => {
            AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
            return initialState;
        },

        /**
         * Vakit x seviye matrisini guncelle
         */
        matrisiGuncelle: (state, action: PayloadAction<MuhafizMatrisi>) => {
            const yeniState = { ...state, matris: action.payload };
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(yeniState));
            return yeniState;
        },

        /**
         * 'ozel' yogunluktaki en son matrisi yedekle. Preset'e gecmeden hemen once
         * cagrilir (guvenlik agi) ve kullanici zaten 'ozel' iken her matris
         * degisikliginde cagrilir ki yedek her zaman en guncel ozel hali tutsun.
         */
        ozelMatrisYedegiGuncelle: (state, action: PayloadAction<MuhafizMatrisi>) => {
            const yeniState = { ...state, ozelMatrisYedegi: action.payload };
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(yeniState));
            return yeniState;
        },

        /**
         * Yedeklenen ozel matrisi geri yukler + yogunlugu 'ozel' yapar. Yedek
         * yoksa no-op (UI "Ozel" secenegini yedek yokken zaten gostermez).
         */
        ozelYogunluguGeriYukle: (state) => {
            if (!state.ozelMatrisYedegi) return state;
            const yeniState: MuhafizAyarlari = {
                ...state,
                matris: state.ozelMatrisYedegi,
                yogunluk: 'ozel',
            };
            AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(yeniState));
            return yeniState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(muhafizAyarlariniYukle.fulfilled, (state, action) => {
            if (action.payload) {
                return { ...state, ...action.payload };
            }
        });
    },
});

export const {
    muhafizAyarlariniGuncelle,
    muhafizStateSifirla,
    matrisiGuncelle,
    ozelMatrisYedegiGuncelle,
    ozelYogunluguGeriYukle,
} = muhafizSlice.actions;
export default muhafizSlice.reducer;
