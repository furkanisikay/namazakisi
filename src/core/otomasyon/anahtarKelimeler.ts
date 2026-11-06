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
import { bicim, metin } from '../dil/aktifDil';
import type { Sozluk } from '../dil/sozluk/tr';

const VAKITLER: readonly VakitBildirimVakti[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/** Vakit adı (cümle başı; sabahın girişi "İmsak" — sözlük `vakit.imsakVakti`). */
const vakitAdi = (vakit: VakitBildirimVakti): string => {
    const v = metin().vakit;
    return vakit === 'imsak' ? v.imsakVakti : v.adlar[vakit];
};

/** Tüm "vakit girdi" bildirimlerinde ortak ek (etkin dilde): tek rutinle her vakti yakalamak için. */
export const vakitGirdiEki = (): string => metin().otomasyon.vakitGirdiEki;

/** "Vakit girdi" bildiriminin başlığı — ör. "Öğle vakti girdi" / "Dhuhr time has begun". */
export function vakitGirdiBasligi(vakit: VakitBildirimVakti): string {
    return bicim(metin().otomasyon.vakitGirdiBasligi, { ad: vakitAdi(vakit) });
}

/** Camideyim bildirim başlığının öneki (Kotlin `CamiSabitleri.CAMIDESINIZ_BASLIK_ONEKI`; native dil W5). */
export const CAMIDESINIZ_ANAHTAR_KELIMESI = 'Camidesiniz';

export interface AnahtarKelime {
    kelime: string;
    aciklama: string;
}

/** Rehber ekranında gösterilen anahtar kelimeler, etkin dilde (sıra = ekrandaki sıra). */
export function rutinAnahtarKelimeleri(): AnahtarKelime[] {
    const o = metin().otomasyon;
    return [
        { kelime: vakitGirdiEki(), aciklama: o.herhangiVakit },
        ...VAKITLER.map((v) => ({ kelime: vakitGirdiBasligi(v), aciklama: bicim(o.yalnizVakit, { ad: vakitAdi(v) }) })),
        { kelime: CAMIDESINIZ_ANAHTAR_KELIMESI, aciklama: o.camide },
    ];
}

export interface EklentiDegiskeni {
    ad: string;
    aciklama: string;
}

/** Tasker değişkenleri — Kotlin `OtomasyonKurallari.D_*` ile AYNI (nöbetçi test okur). */
/** Ad Kotlin ile birebir (kimlik); açıklama etkin dilde (`muhafizAyar.otomasyon.degiskenAciklamalari`). */
const degisken = (ad: keyof Sozluk['muhafizAyar']['otomasyon']['degiskenAciklamalari']): EklentiDegiskeni => ({
    ad,
    get aciklama() {
        return metin().muhafizAyar.otomasyon.degiskenAciklamalari[ad];
    },
});

export const EKLENTI_DEGISKENLERI: EklentiDegiskeni[] = [
    degisken('%vakit'),
    degisken('%vakitkodu'),
    degisken('%tarih'),
    degisken('%kalandk'),
    degisken('%cami'),
];

/** "Vakit çıkıyor" olayının eşiği (dk) — Kotlin `OtomasyonKurallari.CIKIYOR_ESIK_DK`. */
export const CIKIYOR_ESIK_DK = 45;
