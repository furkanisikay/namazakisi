/**
 * Otomasyon anahtar kelimeleri ve eklenti değişkenleri (issue #278) — SAF.
 *
 * Samsung Rutinler'e üçüncü taraf tetik ekleyen herkese açık bir SDK yok; çalışan
 * yol Rutinler'in "Bildirim alındığında" koşuludur (uygulama + anahtar kelime). Bu
 * yüzden bildirim başlıkları SABİT bir önekle başlar ve bu dosya o öneklerin TEK
 * kaynağıdır: değişirse kullanıcıların kurduğu rutinler SESSİZCE çalışmaz.
 * Nöbetçi: `__tests__/anahtarKelimeler.test.ts` (Kotlin ikizlerini de okur).
 *
 * Başlıklar ibadete çağrı değil durum bildirimidir; metin "Öğle vakti girdi"
 * (sentence case) biçimindedir.
 */
import type { VakitBildirimVakti } from '../bildirim/vakitBildirimPlani';

/** Vakit adı (cümle başı, sabit harita — `toUpperCase`/`toLowerCase` KULLANILMAZ). */
const VAKIT_ADLARI: Record<VakitBildirimVakti, string> = {
    imsak: 'İmsak',
    ogle: 'Öğle',
    ikindi: 'İkindi',
    aksam: 'Akşam',
    yatsi: 'Yatsı',
};

/** Tüm "vakit girdi" bildirimlerinde ortak ek: tek rutinle her vakti yakalamak için. */
export const VAKIT_GIRDI_EKI = 'vakti girdi';

/** "Vakit girdi" bildiriminin başlığı — ör. "Öğle vakti girdi". */
export function vakitGirdiBasligi(vakit: VakitBildirimVakti): string {
    return `${VAKIT_ADLARI[vakit]} ${VAKIT_GIRDI_EKI}`;
}

/** Camideyim bildirim başlığının öneki (Kotlin `CamiSabitleri.CAMIDESINIZ_BASLIK_ONEKI`). */
export const CAMIDESINIZ_ANAHTAR_KELIMESI = 'Camidesiniz';

export interface AnahtarKelime {
    kelime: string;
    aciklama: string;
}

/** Rehber ekranında gösterilen anahtar kelimeler (sıra = ekrandaki sıra). */
export const RUTIN_ANAHTAR_KELIMELERI: AnahtarKelime[] = [
    { kelime: VAKIT_GIRDI_EKI, aciklama: 'Herhangi bir vakit girdiğinde' },
    ...(Object.keys(VAKIT_ADLARI) as VakitBildirimVakti[]).map((v) => ({
        kelime: vakitGirdiBasligi(v),
        aciklama: `Yalnız ${VAKIT_ADLARI[v]} vakti girdiğinde`,
    })),
    { kelime: CAMIDESINIZ_ANAHTAR_KELIMESI, aciklama: 'Camide olduğunuz algılandığında (Camideyim açıkken)' },
];

export interface EklentiDegiskeni {
    ad: string;
    aciklama: string;
}

/** Tasker değişkenleri — Kotlin `OtomasyonKurallari.D_*` ile AYNI (nöbetçi test okur). */
export const EKLENTI_DEGISKENLERI: EklentiDegiskeni[] = [
    { ad: '%vakit', aciklama: 'Vaktin adı (ör. Öğle)' },
    { ad: '%vakitkodu', aciklama: 'sabah, ogle, ikindi, aksam ya da yatsi' },
    { ad: '%tarih', aciklama: 'Namaz günü (YYYY-AA-GG)' },
    { ad: '%kalandk', aciklama: 'Vakit çıkıyor: kalan dakika' },
    { ad: '%cami', aciklama: 'Camidesiniz: caminin adı' },
];

/** "Vakit çıkıyor" olayının eşiği (dk) — Kotlin `OtomasyonKurallari.CIKIYOR_ESIK_DK`. */
export const CIKIYOR_ESIK_DK = 45;
