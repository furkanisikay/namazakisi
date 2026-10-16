/**
 * Derin bağlantılar `namazakisi://…` (issue #276) — uygulama kısayolları, Samsung
 * Rutinler ve otomasyon uygulamaları bunlarla açar.
 *
 * - `namazakisi://kible` → Kıble ekranı
 * - `namazakisi://kaza`  → Kaza defteri sekmesi
 * - `namazakisi://ana`   → Ana sayfa
 * - `namazakisi://kildim` → bir EKRAN değil, EYLEMDİR: içinde bulunulan vakti kılındı
 *   olarak işaretler. Navigasyondan `filter` ile dışlanır, `useKildimDerinBaglantisi`
 *   işler. Android kısayolu ise uygulamayı hiç açmadan native `KildimKisayolActivity`
 *   ile işaretler; bu yol iOS ve elle açılan bağlantı içindir.
 */
import type { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';
import type { KazaStackParamList } from './kazaEkranlari';

export const DERIN_BAGLANTI_ONEKLERI = ['namazakisi://'];

/** Alt sekmeler — `AppNavigator > MainTabs` ile AYNI adlar. */
export type AnaSekmeParamList = {
    AnaSayfa: undefined;
    Rozetler: undefined;
    /** Kaza Defteri 2.0'dan beri iç yığındır; `namazakisi://kaza` kökünü açar. */
    KazaDefteri: NavigatorScreenParams<KazaStackParamList> | undefined;
    Istatistikler: undefined;
    Ayarlar: undefined;
};

/** Derin bağlantının ihtiyaç duyduğu kök yığın şekli (`RootStackParamList` ile uyumlu). */
export type DerinBaglantiKokParamList = {
    KurulumSihirbazi: undefined;
    MainTabs: NavigatorScreenParams<AnaSekmeParamList> | undefined;
    KibleSayfasi: undefined;
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
                    KazaDefteri: 'kaza',
                },
            },
            KibleSayfasi: 'kible',
        },
    },
};
