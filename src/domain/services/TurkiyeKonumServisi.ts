/**
 * TurkiyeKonumServisi
 * Turkiye il, ilce ve mahalle verilerini yonetir
 * API: Turkey Geo API (onurusluca/turkey-geo-api) benzeri yapilar desteklenir
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../../core/utils/Logger';
import { mesafeHesapla } from '../../core/utils/MesafeHesaplayici';
import { ilceKoordinatiBul, cevrimdisiIlceler, adAnahtari } from '../../core/konum/ilceKoordinati';

// =====================
// TIP TANIMLARI
// =====================

/**
 * Il (Province) tipi
 */
export interface Il {
    id: number;
    ad: string;
    plakaKodu: string;
    lat: number;
    lng: number;
}

/**
 * Ilce (District) tipi
 */
export interface Ilce {
    id: number;
    ilId: number;
    ad: string;
    lat: number;
    lng: number;
}

/**
 * Mahalle tipi (opsiyonel kullanim icin)
 */
export interface Mahalle {
    id: number;
    ilceId: number;
    ad: string;
    postaKodu?: string;
}

// =====================
// SABITLER
// =====================

// Eski `https://turkiyeapi.dev/api/v1` her istekte 308 ile buraya yönlendiriyordu (fazladan gidiş-dönüş).
const API_BASE_URL = 'https://api.turkiyeapi.dev/v1';
/** API isteği zaman aşımı: ağ asılırsa seçici sonsuza dek beklemesin, çevrimdışı listeye düşsün. */
const API_ZAMAN_ASIMI_MS = 10000;

/** Zaman aşımlı GET (RN fetch'inin kendi zaman aşımı yoktur). */
async function zamanAsimliGetir(url: string): Promise<Response> {
    const denetci = new AbortController();
    const zamanlayici = setTimeout(() => denetci.abort(), API_ZAMAN_ASIMI_MS);
    try {
        return await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: denetci.signal,
        });
    } finally {
        clearTimeout(zamanlayici);
    }
}

/**
 * Plaka = il kimliği (1–81). API'nin `areaCode` alanı TELEFON alan kodudur (Adana 322,
 * İstanbul [212, 216]) — plaka diye kullanılırsa seçicide "322" görünür (yaşanmış hata).
 */
function plakaKodu(ilId: number): string {
    return String(ilId).padStart(2, '0');
}
const CACHE_SURESI = 24 * 60 * 60 * 1000; // 24 saat
const CACHE_ANAHTARI_ILLER = '@turkiye_iller';
const CACHE_ANAHTARI_ILCELER = '@turkiye_ilceler_';

// =====================
// OFFLINE IL VERISI (81 IL)
// Baslangic ve offline calisma icin
// =====================
/**
 * İlçe koordinatlarını çevrimdışı ilçe merkezi tablosundan düzeltir (bulunamayanı aynen bırakır).
 * Değişiklik yoksa AYNI diziyi döndürür.
 */
export function ilceKoordinatlariniDuzelt(ilId: number, ilceler: Ilce[]): Ilce[] {
    let degisti = false;
    const sonuc = ilceler.map((ilce) => {
        const k = ilceKoordinatiBul(ilId, ilce.ad, ilce.id);
        if (!k || (k.lat === ilce.lat && k.lng === ilce.lng)) return ilce;
        degisti = true;
        return { ...ilce, lat: k.lat, lng: k.lng };
    });
    return degisti ? sonuc : ilceler;
}

/**
 * Çevrimdışı il listesi. Koordinat = il merkezinin (merkez ilçe / şehir) konumu.
 * Yedi il (Burdur, Muş, Hatay, Bilecik, Şırnak, Kocaeli, Nevşehir) eskiden şehir merkezinden
 * 8–35 km sapıyordu; OSM il `admin_centre` düğümüne çekildi (denetim 2026-10-21). TV
 * `iller.json` bu listeden üretilir: `node scripts/tv/tv-verisi-uret.js`.
 */
export const TURKIYE_ILLERI_OFFLINE: Il[] = [
    { id: 1, ad: 'Adana', plakaKodu: '01', lat: 37.0000, lng: 35.3213 },
    { id: 2, ad: 'Adıyaman', plakaKodu: '02', lat: 37.7648, lng: 38.2786 },
    { id: 3, ad: 'Afyonkarahisar', plakaKodu: '03', lat: 38.7507, lng: 30.5567 },
    { id: 4, ad: 'Ağrı', plakaKodu: '04', lat: 39.7191, lng: 43.0503 },
    { id: 5, ad: 'Amasya', plakaKodu: '05', lat: 40.6499, lng: 35.8353 },
    { id: 6, ad: 'Ankara', plakaKodu: '06', lat: 39.9334, lng: 32.8597 },
    { id: 7, ad: 'Antalya', plakaKodu: '07', lat: 36.8969, lng: 30.7133 },
    { id: 8, ad: 'Artvin', plakaKodu: '08', lat: 41.1828, lng: 41.8183 },
    { id: 9, ad: 'Aydın', plakaKodu: '09', lat: 37.8444, lng: 27.8458 },
    { id: 10, ad: 'Balıkesir', plakaKodu: '10', lat: 39.6484, lng: 27.8826 },
    { id: 11, ad: 'Bilecik', plakaKodu: '11', lat: 40.1435, lng: 29.9753 },
    { id: 12, ad: 'Bingöl', plakaKodu: '12', lat: 38.8854, lng: 40.4981 },
    { id: 13, ad: 'Bitlis', plakaKodu: '13', lat: 38.4004, lng: 42.1095 },
    { id: 14, ad: 'Bolu', plakaKodu: '14', lat: 40.7356, lng: 31.6061 },
    { id: 15, ad: 'Burdur', plakaKodu: '15', lat: 37.7248, lng: 30.2887 },
    { id: 16, ad: 'Bursa', plakaKodu: '16', lat: 40.1885, lng: 29.0610 },
    { id: 17, ad: 'Çanakkale', plakaKodu: '17', lat: 40.1553, lng: 26.4142 },
    { id: 18, ad: 'Çankırı', plakaKodu: '18', lat: 40.6013, lng: 33.6134 },
    { id: 19, ad: 'Çorum', plakaKodu: '19', lat: 40.5506, lng: 34.9556 },
    { id: 20, ad: 'Denizli', plakaKodu: '20', lat: 37.7765, lng: 29.0864 },
    { id: 21, ad: 'Diyarbakır', plakaKodu: '21', lat: 37.9144, lng: 40.2110 },
    { id: 22, ad: 'Edirne', plakaKodu: '22', lat: 41.6818, lng: 26.5623 },
    { id: 23, ad: 'Elazığ', plakaKodu: '23', lat: 38.6810, lng: 39.2264 },
    { id: 24, ad: 'Erzincan', plakaKodu: '24', lat: 39.7500, lng: 39.5000 },
    { id: 25, ad: 'Erzurum', plakaKodu: '25', lat: 39.9000, lng: 41.2708 },
    { id: 26, ad: 'Eskişehir', plakaKodu: '26', lat: 39.7767, lng: 30.5206 },
    { id: 27, ad: 'Gaziantep', plakaKodu: '27', lat: 37.0662, lng: 37.3833 },
    { id: 28, ad: 'Giresun', plakaKodu: '28', lat: 40.9128, lng: 38.3895 },
    { id: 29, ad: 'Gümüşhane', plakaKodu: '29', lat: 40.4386, lng: 39.5086 },
    { id: 30, ad: 'Hakkari', plakaKodu: '30', lat: 37.5833, lng: 43.7333 },
    { id: 31, ad: 'Hatay', plakaKodu: '31', lat: 36.2025, lng: 36.1603 },
    { id: 32, ad: 'Isparta', plakaKodu: '32', lat: 37.7648, lng: 30.5566 },
    { id: 33, ad: 'Mersin', plakaKodu: '33', lat: 36.8121, lng: 34.6415 },
    { id: 34, ad: 'İstanbul', plakaKodu: '34', lat: 41.0082, lng: 28.9784 },
    { id: 35, ad: 'İzmir', plakaKodu: '35', lat: 38.4237, lng: 27.1428 },
    { id: 36, ad: 'Kars', plakaKodu: '36', lat: 40.6167, lng: 43.1000 },
    { id: 37, ad: 'Kastamonu', plakaKodu: '37', lat: 41.3887, lng: 33.7827 },
    { id: 38, ad: 'Kayseri', plakaKodu: '38', lat: 38.7312, lng: 35.4787 },
    { id: 39, ad: 'Kırklareli', plakaKodu: '39', lat: 41.7333, lng: 27.2167 },
    { id: 40, ad: 'Kırşehir', plakaKodu: '40', lat: 39.1425, lng: 34.1709 },
    { id: 41, ad: 'Kocaeli', plakaKodu: '41', lat: 40.7654, lng: 29.9407 },
    { id: 42, ad: 'Konya', plakaKodu: '42', lat: 37.8667, lng: 32.4833 },
    { id: 43, ad: 'Kütahya', plakaKodu: '43', lat: 39.4167, lng: 29.9833 },
    { id: 44, ad: 'Malatya', plakaKodu: '44', lat: 38.3552, lng: 38.3095 },
    { id: 45, ad: 'Manisa', plakaKodu: '45', lat: 38.6191, lng: 27.4289 },
    { id: 46, ad: 'Kahramanmaraş', plakaKodu: '46', lat: 37.5858, lng: 36.9371 },
    { id: 47, ad: 'Mardin', plakaKodu: '47', lat: 37.3212, lng: 40.7245 },
    { id: 48, ad: 'Muğla', plakaKodu: '48', lat: 37.2153, lng: 28.3636 },
    { id: 49, ad: 'Muş', plakaKodu: '49', lat: 38.7322, lng: 41.4899 },
    { id: 50, ad: 'Nevşehir', plakaKodu: '50', lat: 38.6250, lng: 34.7151 },
    { id: 51, ad: 'Niğde', plakaKodu: '51', lat: 37.9667, lng: 34.6833 },
    { id: 52, ad: 'Ordu', plakaKodu: '52', lat: 40.9839, lng: 37.8764 },
    { id: 53, ad: 'Rize', plakaKodu: '53', lat: 41.0201, lng: 40.5234 },
    { id: 54, ad: 'Sakarya', plakaKodu: '54', lat: 40.7569, lng: 30.3783 },
    { id: 55, ad: 'Samsun', plakaKodu: '55', lat: 41.2928, lng: 36.3313 },
    { id: 56, ad: 'Siirt', plakaKodu: '56', lat: 37.9333, lng: 41.9500 },
    { id: 57, ad: 'Sinop', plakaKodu: '57', lat: 42.0231, lng: 35.1531 },
    { id: 58, ad: 'Sivas', plakaKodu: '58', lat: 39.7477, lng: 37.0179 },
    { id: 59, ad: 'Tekirdağ', plakaKodu: '59', lat: 40.9833, lng: 27.5167 },
    { id: 60, ad: 'Tokat', plakaKodu: '60', lat: 40.3167, lng: 36.5500 },
    { id: 61, ad: 'Trabzon', plakaKodu: '61', lat: 41.0027, lng: 39.7167 },
    { id: 62, ad: 'Tunceli', plakaKodu: '62', lat: 39.1079, lng: 39.5401 },
    { id: 63, ad: 'Şanlıurfa', plakaKodu: '63', lat: 37.1591, lng: 38.7969 },
    { id: 64, ad: 'Uşak', plakaKodu: '64', lat: 38.6823, lng: 29.4082 },
    { id: 65, ad: 'Van', plakaKodu: '65', lat: 38.4891, lng: 43.4089 },
    { id: 66, ad: 'Yozgat', plakaKodu: '66', lat: 39.8181, lng: 34.8147 },
    { id: 67, ad: 'Zonguldak', plakaKodu: '67', lat: 41.4564, lng: 31.7987 },
    { id: 68, ad: 'Aksaray', plakaKodu: '68', lat: 38.3687, lng: 34.0370 },
    { id: 69, ad: 'Bayburt', plakaKodu: '69', lat: 40.2552, lng: 40.2249 },
    { id: 70, ad: 'Karaman', plakaKodu: '70', lat: 37.1759, lng: 33.2287 },
    { id: 71, ad: 'Kırıkkale', plakaKodu: '71', lat: 39.8468, lng: 33.5153 },
    { id: 72, ad: 'Batman', plakaKodu: '72', lat: 37.8812, lng: 41.1351 },
    { id: 73, ad: 'Şırnak', plakaKodu: '73', lat: 37.5220, lng: 42.4570 },
    { id: 74, ad: 'Bartın', plakaKodu: '74', lat: 41.6344, lng: 32.3375 },
    { id: 75, ad: 'Ardahan', plakaKodu: '75', lat: 41.1105, lng: 42.7022 },
    { id: 76, ad: 'Iğdır', plakaKodu: '76', lat: 39.9167, lng: 44.0333 },
    { id: 77, ad: 'Yalova', plakaKodu: '77', lat: 40.6500, lng: 29.2667 },
    { id: 78, ad: 'Karabük', plakaKodu: '78', lat: 41.2061, lng: 32.6204 },
    { id: 79, ad: 'Kilis', plakaKodu: '79', lat: 36.7184, lng: 37.1212 },
    { id: 80, ad: 'Osmaniye', plakaKodu: '80', lat: 37.0742, lng: 36.2478 },
    { id: 81, ad: 'Düzce', plakaKodu: '81', lat: 40.8438, lng: 31.1565 },
];

// =====================
// YANIT / ONBELLEK DOGRULAMA
// =====================
// `api.turkiyeapi.dev` bağımsız bir üçüncü taraftır: yanıtı (ve ondan yazılmış 24 saatlik
// önbelleği) satır satır süzmeden konuma almak, kaymış koordinatla sessizce yanlış vakit
// ya da dize gelen koordinatla açılmayan seçici demektir. Önbellek de AYNI süzgeçten geçer.

/** Türkiye sınır kutusu (81 il; KKTC bu serviste yok). Ölçülen uçlar: 36.2–42.0 K, 26.4–44.0 D. */
const TR_KUTUSU = { latMin: 35.5, latMax: 42.5, lngMin: 25.5, lngMax: 45.0 };
/** API il merkezi çevrimdışı tablodan en çok bu kadar sapabilir (ölçülen en büyük fark ≈ 3,4 km). */
const IL_MERKEZI_TOLERANS_KM = 50;
/** İlçe merkezi kendi il merkezinden en çok bu kadar uzak olabilir (en geniş il Konya ≈ 155 km). */
const ILCE_IL_MERKEZI_TOLERANS_KM = 250;
const IL_SAYISI = 81;
const ILCE_KIMLIK_UST_SINIR = 99999;
const AD_UZUNLUK_UST_SINIR = 60;
/** Kontrol karakteri (satır sonu, sekme, NUL…) taşıyan ad reddedilir. */
const KONTROL_KARAKTERI = /[\u0000-\u001f\u007f]/;

function nesneMi(deger: unknown): deger is Record<string, unknown> {
    return typeof deger === 'object' && deger !== null && !Array.isArray(deger);
}

/** Makul uzunlukta, kontrol karaktersiz ad; değilse `null`. */
function gecerliAd(deger: unknown): string | null {
    if (typeof deger !== 'string') return null;
    const ad = deger.trim();
    if (ad.length === 0 || ad.length > AD_UZUNLUK_UST_SINIR || KONTROL_KARAKTERI.test(ad)) return null;
    return ad;
}

/** Sonlu sayı çifti ve Türkiye sınır kutusunda mı? (`'41.0'` gibi dize koordinat reddedilir.) */
export function trKoordinatiMi(lat: unknown, lng: unknown): boolean {
    return (
        typeof lat === 'number' && typeof lng === 'number' &&
        Number.isFinite(lat) && Number.isFinite(lng) &&
        lat >= TR_KUTUSU.latMin && lat <= TR_KUTUSU.latMax &&
        lng >= TR_KUTUSU.lngMin && lng <= TR_KUTUSU.lngMax
    );
}

/** Satırdaki koordinat: API biçimi (`coordinates.latitude/longitude`) ya da önbellek biçimi (`lat/lng`). */
function hamKoordinat(satir: Record<string, unknown>): { lat: unknown; lng: unknown } {
    const k = satir.coordinates;
    if (nesneMi(k)) return { lat: k.latitude, lng: k.longitude };
    return { lat: satir.lat, lng: satir.lng };
}

/** Koordinat geçerli VE `merkez`e en çok `toleransKm` uzaklıkta mı? */
function merkezeYakinMi(lat: unknown, lng: unknown, merkez: { lat: number; lng: number }, toleransKm: number): boolean {
    if (!trKoordinatiMi(lat, lng)) return false;
    return mesafeHesapla(lat as number, lng as number, merkez.lat, merkez.lng) / 1000 <= toleransKm;
}

function cevrimdisiIl(ilId: number): Il | undefined {
    return TURKIYE_ILLERI_OFFLINE.find((il) => il.id === ilId);
}

/**
 * API ya da önbellek il listesini süzer. Kimlik 1–81 tamsayı olmalı (yinelenen ve geçersiz
 * satır atılır); ad ve koordinat çevrimdışı tabloyla UYUŞMUYORSA tablodaki değer kullanılır
 * (81 il sabittir — API buraya yeni bilgi getirmez, yalnız bozabilir).
 */
export function illeriDogrula(ham: unknown): Il[] {
    if (!Array.isArray(ham)) return [];
    const gorulen = new Set<number>();
    const sonuc: Il[] = [];
    for (const satir of ham) {
        if (!nesneMi(satir)) continue;
        const id = satir.id;
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 1 || id > IL_SAYISI || gorulen.has(id)) continue;
        const tablo = cevrimdisiIl(id);
        if (!tablo) continue;
        gorulen.add(id);
        const ad = gecerliAd(satir.name ?? satir.ad);
        const { lat, lng } = hamKoordinat(satir);
        const koordinatGecerli = merkezeYakinMi(lat, lng, tablo, IL_MERKEZI_TOLERANS_KM);
        sonuc.push({
            id,
            ad: ad !== null && adAnahtari(ad) === adAnahtari(tablo.ad) ? ad : tablo.ad,
            plakaKodu: plakaKodu(id),
            lat: koordinatGecerli ? (lat as number) : tablo.lat,
            lng: koordinatGecerli ? (lng as number) : tablo.lng,
        });
    }
    return sonuc;
}

/**
 * API ya da önbellek ilçe listesini süzer. Adı geçersiz ya da kimliği bozuk satır atılır
 * (kimlik hiç yoksa sıra numarası verilir); koordinat geçersizse ya da il merkezinden
 * makul uzaklıkta değilse il merkezine düşülür (çağıran ardından ilçe tablosuyla düzeltir).
 * @param ilKoordinati aynı yanıttaki il koordinatı (doğrulanmamış; yalnız tabloda olmayan il için)
 */
export function ilceleriDogrula(ilId: number, ham: unknown, ilKoordinati?: unknown): Ilce[] {
    if (!Array.isArray(ham)) return [];
    const tablo = cevrimdisiIl(ilId);
    const yanitMerkezi = nesneMi(ilKoordinati) ? { lat: ilKoordinati.latitude, lng: ilKoordinati.longitude } : null;
    const yedekMerkez: { lat: number; lng: number } = tablo
        ?? (yanitMerkezi && trKoordinatiMi(yanitMerkezi.lat, yanitMerkezi.lng)
            ? { lat: yanitMerkezi.lat as number, lng: yanitMerkezi.lng as number }
            : { lat: 0, lng: 0 });
    const gorulen = new Set<number>();
    const sonuc: Ilce[] = [];
    ham.forEach((satir, sira) => {
        if (!nesneMi(satir)) return;
        const ad = gecerliAd(satir.name ?? satir.ad);
        if (ad === null) return;
        const hamId = satir.id;
        const id = hamId === undefined || hamId === null || hamId === 0 ? sira + 1 : hamId;
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 1 || id > ILCE_KIMLIK_UST_SINIR || gorulen.has(id)) return;
        gorulen.add(id);
        const { lat, lng } = hamKoordinat(satir);
        const koordinatGecerli = tablo
            ? merkezeYakinMi(lat, lng, tablo, ILCE_IL_MERKEZI_TOLERANS_KM)
            : trKoordinatiMi(lat, lng);
        sonuc.push({
            id,
            ilId,
            ad,
            lat: koordinatGecerli ? (lat as number) : yedekMerkez.lat,
            lng: koordinatGecerli ? (lng as number) : yedekMerkez.lng,
        });
    });
    return sonuc;
}

/** Önbellek zarfı: süresi dolmamış (ve gelecekten damgalanmamış) kaydın `data` alanı; değilse `null`. */
function tazeOnbellekVerisi(hamMetin: string): unknown | null {
    const zarf: unknown = JSON.parse(hamMetin);
    if (!nesneMi(zarf) || typeof zarf.timestamp !== 'number') return null;
    const yas = Date.now() - zarf.timestamp;
    return yas >= 0 && yas < CACHE_SURESI ? zarf.data : null;
}

// =====================
// SERVIS SINIFI
// =====================

/**
 * Turkiye konum verilerini yoneten servis
 * Singleton pattern kullanir
 */
class TurkiyeKonumServisiClass {
    private static instance: TurkiyeKonumServisiClass;
    private illerCache: Il[] | null = null;
    private ilcelerCache: Map<number, Ilce[]> = new Map();

    private constructor() {}

    /**
     * Singleton instance'i dondurur
     */
    public static getInstance(): TurkiyeKonumServisiClass {
        if (!TurkiyeKonumServisiClass.instance) {
            TurkiyeKonumServisiClass.instance = new TurkiyeKonumServisiClass();
        }
        return TurkiyeKonumServisiClass.instance;
    }

    // =====================
    // IL ISLEMLERI
    // =====================

    /**
     * Tum illeri getirir
     * Oncelikle cache kontrol eder, yoksa API'den ceker
     * API basarisiz olursa offline veriyi kullanir
     */
    async illeriGetir(): Promise<Il[]> {
        // Memory cache kontrol
        if (this.illerCache) {
            return this.illerCache;
        }

        // AsyncStorage cache kontrol
        try {
            const cachedData = await AsyncStorage.getItem(CACHE_ANAHTARI_ILLER);
            if (cachedData) {
                // Önbellek de API yanıtıyla AYNI süzgeçten geçer (eski sürümün yazdığı ya da
                // bozulmuş kayıt); plaka da burada kimlikten yeniden türetilir. Hiç geçerli
                // satır kalmadıysa önbellek yok sayılır ve API'ye gidilir.
                const iller = illeriDogrula(tazeOnbellekVerisi(cachedData));
                if (iller.length > 0) {
                    this.illerCache = iller;
                    return iller;
                }
            }
        } catch (e) {
            Logger.warn('TurkiyeKonumServisi', 'Cache okuma hatasi:', e);
        }

        // API'den cekmeyi dene
        try {
            // Yalnız kullanılan alanlar: ~100 KB yerine ~8 KB.
            const response = await zamanAsimliGetir(`${API_BASE_URL}/provinces?fields=id,name,coordinates`);

            if (response.ok) {
                const json: unknown = await response.json();
                const iller = illeriDogrula(nesneMi(json) ? json.data : json);

                // Tek geçerli satır yoksa önbelleğe YAZMA: çevrimdışı tabloya düş.
                if (iller.length > 0) {
                    this.illerCache = iller;
                    await AsyncStorage.setItem(CACHE_ANAHTARI_ILLER, JSON.stringify({
                        timestamp: Date.now(),
                        data: iller,
                    }));

                    return iller;
                }
                Logger.warn('TurkiyeKonumServisi', 'Il yaniti gecersiz, offline veri kullaniliyor');
            }
        } catch (e) {
            Logger.warn('TurkiyeKonumServisi', 'API hatasi, offline veri kullaniliyor:', e);
        }

        // Offline veriyi kullan
        this.illerCache = TURKIYE_ILLERI_OFFLINE;
        return TURKIYE_ILLERI_OFFLINE;
    }

    /**
     * Tek bir ili ID'ye gore getirir
     */
    async ilGetirById(ilId: number): Promise<Il | null> {
        const iller = await this.illeriGetir();
        return iller.find(il => il.id === ilId) || null;
    }

    /**
     * Plaka koduna gore il getirir
     */
    async ilGetirByPlaka(plakaKodu: string): Promise<Il | null> {
        const iller = await this.illeriGetir();
        return iller.find(il => il.plakaKodu === plakaKodu) || null;
    }

    // =====================
    // ILCE ISLEMLERI
    // =====================

    /**
     * Belirli bir ilin ilcelerini getirir
     */
    async ilceleriGetir(ilId: number): Promise<Ilce[]> {
        // Memory cache kontrol
        if (this.ilcelerCache.has(ilId)) {
            return this.ilcelerCache.get(ilId)!;
        }

        // AsyncStorage cache kontrol
        const cacheKey = `${CACHE_ANAHTARI_ILCELER}${ilId}`;
        try {
            const cachedData = await AsyncStorage.getItem(cacheKey);
            if (cachedData) {
                // Önbellek de süzülür; eski sürümün önbelleği ilçelere İL MERKEZİ yazmıştı →
                // ardından tablodan düzeltilir.
                const suzulmus = ilceleriDogrula(ilId, tazeOnbellekVerisi(cachedData));
                if (suzulmus.length > 0) {
                    const duzeltilmis = ilceKoordinatlariniDuzelt(ilId, suzulmus);
                    this.ilcelerCache.set(ilId, duzeltilmis);
                    return duzeltilmis;
                }
            }
        } catch (e) {
            Logger.warn('TurkiyeKonumServisi', 'Ilce cache okuma hatasi:', e);
        }

        // API'den cekmeyi dene
        try {
            const response = await zamanAsimliGetir(`${API_BASE_URL}/provinces/${ilId}?fields=coordinates,districts`);

            if (response.ok) {
                const json: unknown = await response.json();
                const zarf = nesneMi(json) && nesneMi(json.data) ? json.data : json;
                const ilData = nesneMi(zarf) ? zarf : {};

                // Ilce verisi districts alaninda olmali
                // API ilçelerde `coordinates` VERMEZ (2026-10 ölçüldü) → ilçe merkezi çevrimdışı
                // tablodan; tabloda yoksa (doğrulanmış) API alanı, o da yoksa il merkezi (son çare).
                const ilceler: Ilce[] = ilceKoordinatlariniDuzelt(
                    ilId,
                    ilceleriDogrula(ilId, ilData.districts, ilData.coordinates),
                );

                // Tek geçerli satır yoksa önbelleğe YAZMA: çevrimdışı tabloya düş.
                if (ilceler.length > 0) {
                    this.ilcelerCache.set(ilId, ilceler);
                    await AsyncStorage.setItem(cacheKey, JSON.stringify({
                        timestamp: Date.now(),
                        data: ilceler,
                    }));

                    return ilceler;
                }
                Logger.warn('TurkiyeKonumServisi', 'Ilce yaniti gecersiz, offline veri kullaniliyor');
            }
        } catch (e) {
            Logger.warn('TurkiyeKonumServisi', 'Ilce API hatasi:', e);
        }

        // API'ye ulaşılamıyorsa çevrimdışı tablo (kimlik ve adlar turkiyeapi ile aynı).
        // Önbelleğe YAZILMAZ: ağ dönünce API listesi (yeni ilçe vb.) kazansın.
        return cevrimdisiIlceler(ilId).map((k) => ({ ...k, ilId }));
    }

    // =====================
    // KOORDINAT ISLEMLERI
    // =====================

    /**
     * Koordinatlara gore en yakin ili bulur
     */
    async enYakinIliBul(lat: number, lng: number): Promise<Il | null> {
        const iller = await this.illeriGetir();
        
        let enYakinIl: Il | null = null;
        let enKisaMesafe = Infinity;

        for (const il of iller) {
            const mesafe = this.hesaplaMesafe(lat, lng, il.lat, il.lng);
            if (mesafe < enKisaMesafe) {
                enKisaMesafe = mesafe;
                enYakinIl = il;
            }
        }

        return enYakinIl;
    }

    /**
     * Iki nokta arasindaki mesafeyi hesaplar (km)
     * Haversine formulu kullanir
     */
    private hesaplaMesafe(lat1: number, lng1: number, lat2: number, lng2: number): number {
        // Merkezi Haversine (metre) sonucunu km'ye cevirir
        return mesafeHesapla(lat1, lng1, lat2, lng2) / 1000;
    }

    // =====================
    // CACHE ISLEMLERI
    // =====================

    /**
     * Tum cache'i temizler
     */
    async cacheTemizle(): Promise<void> {
        this.illerCache = null;
        this.ilcelerCache.clear();
        
        try {
            const keys = await AsyncStorage.getAllKeys();
            const turkiyeKeys = keys.filter(k => 
                k.startsWith(CACHE_ANAHTARI_ILLER) || 
                k.startsWith(CACHE_ANAHTARI_ILCELER)
            );
            await AsyncStorage.multiRemove(turkiyeKeys);
        } catch (e) {
            Logger.warn('TurkiyeKonumServisi', 'Cache temizleme hatasi:', e);
        }
    }
}

// Singleton export
export const TurkiyeKonumServisi = TurkiyeKonumServisiClass.getInstance();
