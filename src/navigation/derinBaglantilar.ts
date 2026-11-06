/**
 * Derin bağlantılar `namazakisi://…` (issue #276) — uygulama kısayolları, Samsung
 * Rutinler ve otomasyon uygulamaları bunlarla açar.
 *
 * - `namazakisi://kible` → Kıble sekmesi (Dalga 4'ten beri sekme; eskiden kök yığın ekranı)
 * - `namazakisi://kaza`  → Kaza defteri sekmesi
 * - `namazakisi://ana`   → Bugün (ana sayfa)
 * - `namazakisi://ilerleme` → İlerleme sekmesi (eski adlar `seri`, `istatistik`,
 *   `rozetler` de buraya düşer — üç yüzey tek sekmede birleşti)
 * - `namazakisi://ayarlar`   → Ayarlar (saat W3: saatteki "Telefonda açın")
 * - `namazakisi://camideyim` → Ayarlar > Camideyim (saat W3; yığının altında Ayarlar
 *   kökü durur ki geri tuşu boşa düşmesin)
 * - `namazakisi://tv?v=1&a=…&p=…&k=…` → Ayarlar > Cihazlarım > TV ekleyin; TV ekranındaki QR'ın
 *   kendisidir (iPhone kamerası doğrudan açar), sayfa konumu TV'ye gönderir
 * - `namazakisi://kildim` → bir EKRAN değil, EYLEMDİR: içinde bulunulan vakti kılındı
 *   olarak işaretler. Navigasyondan `filter` ile dışlanır, `useKildimDerinBaglantisi`
 *   işler. Android kısayolu ise uygulamayı hiç açmadan native `KildimKisayolActivity`
 *   ile işaretler; bu yol iOS ve elle açılan bağlantı içindir.
 */
import type { LinkingOptions, NavigatorScreenParams, PathConfig } from '@react-navigation/native';
import type { KazaStackParamList } from './kazaEkranlari';

export const DERIN_BAGLANTI_ONEKLERI = ['namazakisi://'];

/** Alt sekmeler — `AppNavigator > MainTabs` ile AYNI adlar. */
export type AnaSekmeParamList = {
    AnaSayfa: undefined;
    Kible: undefined;
    /** Kaza Defteri 2.0'dan beri iç yığındır; `namazakisi://kaza` kökünü açar. */
    KazaDefteri: NavigatorScreenParams<KazaStackParamList> | undefined;
    /** Seri gök paneli + kılma oranı + rozetler (eski Rozetler ve İstatistik sekmeleri). */
    Ilerleme: undefined;
    /** İç yığın; `namazakisi://ayarlar` kökünü, `namazakisi://camideyim` Camideyim'i açar. */
    Ayarlar: NavigatorScreenParams<AyarlarDerinParamList> | undefined;
};

/** Ayarlar yığınının derin bağlantıyla açılan ekranları (`ayarlarEkranlari` alt kümesi). */
type AyarlarDerinParamList = {
    AyarlarAna: undefined;
    CamideyimAyarlari: undefined;
    TelevizyonAyarlari: undefined;
    GununAyeti: undefined;
};

/** Derin bağlantının ihtiyaç duyduğu kök yığın şekli (`RootStackParamList` ile uyumlu). */
export type DerinBaglantiKokParamList = {
    KurulumSihirbazi: undefined;
    MainTabs: NavigatorScreenParams<AnaSekmeParamList> | undefined;
};

/** `namazakisi://camideyim` yığını Ayarlar kökünün ÜSTÜNE kurar (geri tuşu çalışsın). */
const AYARLAR_YOLLARI: PathConfig<AyarlarDerinParamList> = {
    initialRouteName: 'AyarlarAna',
    screens: {
        AyarlarAna: 'ayarlar',
        CamideyimAyarlari: 'camideyim',
        // TV QR'ı (iPhone kamerası): sorgu alanları sayfa parametresi olur, sayfa doğrular.
        TelevizyonAyarlari: 'tv',
        // Günün ayeti widget'ına dokunma (Android ve iOS widget'ı aynı adresi açar).
        GununAyeti: 'gunun-ayeti',
    },
};

const KILDIM_DESENI = /^namazakisi:\/\/kildim\/?(?:[?#].*)?$/i;

/** `namazakisi://kildim` (sonda `/`, sorgu ya da parça olabilir). */
export const kildimBaglantisiMi = (url: string | null | undefined): boolean => !!url && KILDIM_DESENI.test(url);

export const derinBaglantiYapilandirmasi: LinkingOptions<DerinBaglantiKokParamList> = {
    prefixes: DERIN_BAGLANTI_ONEKLERI,
    filter: (url) => !kildimBaglantisiMi(url),
    config: {
        screens: {
            MainTabs: {
                screens: {
                    AnaSayfa: 'ana',
                    Kible: 'kible',
                    KazaDefteri: 'kaza',
                    Ilerleme: { path: 'ilerleme', alias: ['seri', 'istatistik', 'rozetler'] },
                    // Tip bilinçli olarak AYRI sabitte kontrol edilir: iç içe `NavigatorScreenParams`
                    // birleşiminden TS ParamList'i `{}` çıkarıyor ve `initialRouteName`'i reddediyor.
                    Ayarlar: AYARLAR_YOLLARI as PathConfig<object>,
                },
            },
        },
    },
};
