/**
 * GIRIS YONU ZAMANLAMA TABLOLARI (saf; store'a/React'a bagimsiz).
 *
 * NEDEN AYRI BIR TABLO GEREKIYOR — yasanmis hata:
 * Yon degistirme yolu (`matrisIslemleri.yonDegisimindeMetniCevir`) yalniz anons
 * metnini cevirip `yon` alanini yaziyordu; `esikDk` degerleri CIKIS sirasinda
 * (45/25/10/3) kaliyordu. Giris yonunde kapsama `olcuDk >= esikDk` ve EN BUYUK
 * esik kazandigi icin eskalasyon TERSINE donuyordu: kullanici vakit girer girmez
 * "VAKIT CIKIYOR" tonuyla karsilaniyor, sure gectikce NAZIKLESIYOR, en buyuk esik
 * asilinca motor tumden susuyordu (yatsi 20:30-05:15 olcumu: 20:33 acil ... 21:15
 * nazik, sonra 8 saat sessizlik).
 *
 * NEDEN PENCERE SINIFI VAR — tek tablo yetmiyor:
 * Cikis yonunde esik "sona kala" demektir, yani her pencereye sigar. Giris
 * yonunde esik MUTLAK dakikadir ve TR pencereleri 8 kat degisir (Istanbul,
 * adhan/Turkey): aksam 87-111 dk, imsak 92-121, ogle 138-240, ikindi 141-216,
 * yatsi 286-694. Tek tablo kullanilsa "180. dakikada uyar" adimi aksamda ve
 * imsakta HIC calismaz (`esikDk >= pencere` → adim olu dogar) — hazir yogunlugun
 * "tek dokunusla ayarlayin" vaadi yarisi olu bir yapilandirma verirdi.
 *
 * Tavanlar her sinifin EN KISA penceresinin altinda secildi:
 *   kisa  (imsak, aksam)  en buyuk esik <= 70  (< 87)
 *   orta  (ogle, ikindi)  en buyuk esik <= 120 (< 138)
 *   uzun  (yatsi)         en buyuk esik <= 210 (< 286)
 *
 * SOZLESME: bu tablolar YALNIZ zamanlama tasir (`esikDk` + `siklik`). Kanal,
 * aciliyet, ses ve anons metni kullanicinindir ve yon degisimiyle DEGISMEZ
 * (`presetZamanlamasiniUygula` goc sozlesmesinin ikizi).
 *
 * Esikler kesin ARTAN olmak zorundadir (`aktifSeviye.esikSiralamasiGecerliMi`
 * giris yonunde bunu arar) ve `ESIK_ADIM_DK` (5) katidir — stepper ara degere
 * dusmesin. Nobetci test ikisini de tarar.
 */
import type { MuhafizVakti, SeviyeKademe, Siklik } from './matrisTipleri';

/** Hazir yogunluklar. `'ozel'` YOK: ozel matriste preset tablosu bulunmaz. */
export type PresetYogunlugu = 'hafif' | 'normal' | 'yogun';

/**
 * Vakitlerin pencere uzunluguna gore sinifi.
 *
 * Sinif VAKTE bagli, o GUNKU pencereye degil: tablo kullanicinin ayar ekraninda
 * gordugu sabit bir sayidir, mevsime gore kaymamalidir. Sinif sinirlari en KISA
 * pencereye gore secildigi icin yaz/kis farki adimi olu birakmaz.
 */
export type PencereSinifi = 'kisa' | 'orta' | 'uzun';

export interface ZamanlamaAyari {
    esikDk: number;
    siklik: Siklik;
}

export type ZamanlamaSeviyeleri = Record<SeviyeKademe, ZamanlamaAyari>;

export const VAKIT_PENCERE_SINIFI: Record<MuhafizVakti, PencereSinifi> = {
    imsak: 'kisa',
    ogle: 'orta',
    ikindi: 'orta',
    aksam: 'kisa',
    yatsi: 'uzun',
};

/**
 * KISA pencere (imsak, aksam — 87-121 dk): erken basla, sik tekrarla, 70. dk'da bitir.
 *
 * Bu sinifta giris ve cikis yonu KACINILMAZ OLARAK YAKINSAR (1,5 saatlik pencerede
 * "girisinden itibaren takip" ile "cikmadan once uyar" arasinda kovalanacak bos
 * alan yoktur). Tek fark giris yonunun vakit girer girmez de durtmesidir; bu
 * bilincli kabul edilmis bir sonuctur, hata degil.
 */
const KISA: Record<PresetYogunlugu, ZamanlamaSeviyeleri> = {
    hafif: {
        nazik: { esikDk: 10, siklik: 'birkez' },
        uyari: { esikDk: 25, siklik: 'birkez' },
        sert: { esikDk: 45, siklik: 'birkez' },
        acil: { esikDk: 70, siklik: 'birkez' },
    },
    normal: {
        nazik: { esikDk: 10, siklik: 'birkez' },
        uyari: { esikDk: 25, siklik: 'birkez' },
        sert: { esikDk: 45, siklik: { herDk: 15 } },
        acil: { esikDk: 70, siklik: { herDk: 15 } },
    },
    yogun: {
        nazik: { esikDk: 5, siklik: 'birkez' },
        uyari: { esikDk: 15, siklik: { herDk: 10 } },
        sert: { esikDk: 30, siklik: { herDk: 10 } },
        acil: { esikDk: 55, siklik: { herDk: 10 } },
    },
};

/** ORTA pencere (ogle, ikindi — 138-240 dk). */
const ORTA: Record<PresetYogunlugu, ZamanlamaSeviyeleri> = {
    hafif: {
        nazik: { esikDk: 15, siklik: 'birkez' },
        uyari: { esikDk: 40, siklik: 'birkez' },
        sert: { esikDk: 75, siklik: 'birkez' },
        acil: { esikDk: 120, siklik: 'birkez' },
    },
    normal: {
        nazik: { esikDk: 15, siklik: 'birkez' },
        uyari: { esikDk: 40, siklik: 'birkez' },
        sert: { esikDk: 75, siklik: { herDk: 25 } },
        acil: { esikDk: 120, siklik: { herDk: 30 } },
    },
    yogun: {
        nazik: { esikDk: 10, siklik: 'birkez' },
        uyari: { esikDk: 30, siklik: { herDk: 20 } },
        sert: { esikDk: 60, siklik: { herDk: 20 } },
        acil: { esikDk: 100, siklik: { herDk: 25 } },
    },
};

/**
 * UZUN pencere (yatsi — 286-694 dk).
 *
 * Asil kazanc burada: cikis yonunde kis yatsisinin HICBIR uyarisi 04:30'dan once
 * gelmez (kullanici uykudadir). Son adim pencere sonuna kadar tekrarladigi icin
 * giris yonunu secen kullanici vaktin sonundaki uyariyi da kaybetmez.
 *
 * 'hafif' KASTEN tekrarsizdir (preset kimligi: `muhafizSlice` HAFIF gerekcesi);
 * bedeli, yon secicinin "cikana kadar" vaadinin bu yogunlukta 4 tek atisa
 * inmesidir — ekran metni bunu soyler.
 */
const UZUN: Record<PresetYogunlugu, ZamanlamaSeviyeleri> = {
    hafif: {
        nazik: { esikDk: 20, siklik: 'birkez' },
        uyari: { esikDk: 60, siklik: 'birkez' },
        sert: { esikDk: 120, siklik: 'birkez' },
        acil: { esikDk: 210, siklik: 'birkez' },
    },
    normal: {
        nazik: { esikDk: 15, siklik: 'birkez' },
        uyari: { esikDk: 45, siklik: { herDk: 30 } },
        sert: { esikDk: 90, siklik: { herDk: 30 } },
        acil: { esikDk: 180, siklik: { herDk: 90 } },
    },
    yogun: {
        nazik: { esikDk: 10, siklik: 'birkez' },
        uyari: { esikDk: 30, siklik: { herDk: 20 } },
        sert: { esikDk: 60, siklik: { herDk: 30 } },
        acil: { esikDk: 120, siklik: { herDk: 60 } },
    },
};

export const GIRIS_ZAMANLAMA_TABLOSU: Record<
    PencereSinifi,
    Record<PresetYogunlugu, ZamanlamaSeviyeleri>
> = { kisa: KISA, orta: ORTA, uzun: UZUN };

/**
 * Yogunluk giris tablosu olan bir preset mi?
 *
 * `'ozel'` ve diskten gelen bilinmeyen degerler icin `false` doner — cagiran
 * `GIRIS_VARSAYILAN_YOGUNLUK`'a duser.
 */
export function girisTablosuOlanYogunlukMu(deger: unknown): deger is PresetYogunlugu {
    return deger === 'hafif' || deger === 'normal' || deger === 'yogun';
}

/**
 * Yogunlugu bilinmeyen ('ozel', bozuk kayit, ham arka plan okumasi) kullanici
 * icin taban.
 *
 * NEDEN 'normal' — ve NEDEN "elle kurulmus esikleri yansitmak" (pencere - esik)
 * REDDEDILDI: (a) pencere gune bagli (yatsi 286 ↔ 694), ekranda hic bilinmiyor
 * olabilir (`vakitPencereleri` bos donebilir); (b) yansitma kullanicinin
 * NIYETINI korumaz — cikista "sona yakin uyar" diyen adim yansitilinca girişte
 * yine sona yakin uyarir, oysa kullanici yonu tam da bunu degistirmek icin
 * degistirir. Veri kaybi yok: ayrilan yonun zamanlamasi `yonYedegi`'nde durur.
 */
export const GIRIS_VARSAYILAN_YOGUNLUK: PresetYogunlugu = 'normal';

/** Bir vaktin giris yonu zamanlamasi. */
export function girisZamanlamasiniSec(
    vakit: MuhafizVakti,
    yogunluk?: unknown
): ZamanlamaSeviyeleri {
    const secili = girisTablosuOlanYogunlukMu(yogunluk) ? yogunluk : GIRIS_VARSAYILAN_YOGUNLUK;
    return GIRIS_ZAMANLAMA_TABLOSU[VAKIT_PENCERE_SINIFI[vakit]][secili];
}
