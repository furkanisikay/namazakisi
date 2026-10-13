/**
 * Cuma hatırlatma PLANI — SAF (issue #173; #298'de servisten çıkarıldı).
 *
 * `CumaHatirlatmaServisi` ve bildirim defteri AYNI listeyi kullanır. Metin
 * (nass yalnız ilk hatırlatmada) serviste kalır; defter metin saymaz.
 */
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import type { Siklik } from '../muhafiz/matrisTipleri';
import { vakitUyariPlaniOlustur } from '../muhafiz/motorAdaptoru';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import { cumaPenceresiOlustur, hatirlatmaZamaniHesapla, sonrakiCumalar } from '../utils/cumaYardimcisi';

/** Bildirim id öneki — temizlik bu önekle SÜZER, başka sistemlere dokunmaz. */
export const CUMA_ID_ONEKI = 'cuma_hatirlatma_';

/**
 * Kaç cuma ileri planlanır. Olay haftada bir; dört hafta, kullanıcı uygulamayı
 * bir ay açmasa bile hatırlatmanın sürmesini sağlar.
 */
export const PLANLANACAK_CUMA_SAYISI = 4;

export interface CumaPlanAyarlari {
    aktif: boolean;
    oncedenDk: number;
    siklik: Siklik;
}

export interface CumaPlanKaydi {
    id: string;
    zaman: Date;
    /** Öğle vaktine kalan dakika (metin bunu yazar). */
    oncedenDk: number;
    /** O cumanın İLK (en erken) hatırlatması mı? Nass yalnız ilkinde geçer. */
    ilkMi: boolean;
}

/**
 * Önümüzdeki dört cumanın hatırlatmaları (kronolojik).
 *
 * Adım dakikaları ORTAK plan üreticisinden gelir (`vakitUyariPlaniOlustur`;
 * plan bütçesi dahil) — cuma için ayrı bir zamanlama mantığı yazılmaz.
 * Kimlik: ilk hatırlatma TARİHSEL id'yi (`cuma_hatirlatma_<ISO>`) korur,
 * tekrarlar dakikayla ayrışır.
 */
export function cumaPlaniOlustur(
    koordinat: { lat: number; lng: number },
    ayarlar: CumaPlanAyarlari,
    simdi: Date,
    gunAtlanirMi: (iso: string) => boolean = () => false
): CumaPlanKaydi[] {
    if (!ayarlar.aktif) return [];
    const coordinates = new Coordinates(koordinat.lat, koordinat.lng);
    const params = CalculationMethod.Turkey();

    const pencere = cumaPenceresiOlustur(ayarlar.oncedenDk, ayarlar.siklik);
    const adimlar = vakitUyariPlaniOlustur(pencere, ayarlar.oncedenDk).map((a) => a.kalanDk);

    const plan: CumaPlanKaydi[] = [];
    for (const cuma of sonrakiCumalar(simdi, PLANLANACAK_CUMA_SAYISI)) {
        const iso = tarihiISOFormatinaCevir(cuma);
        if (gunAtlanirMi(iso)) continue;
        // Vakit hesabı GÜN BAZINDA: her cuma için ayrı PrayerTimes.
        const ogleVakti = new PrayerTimes(coordinates, cuma, params).dhuhr;
        for (const [sira, kalanDk] of adimlar.entries()) {
            const zaman = hatirlatmaZamaniHesapla(ogleVakti, kalanDk);
            if (zaman.getTime() <= simdi.getTime()) continue;
            const ilkMi = sira === 0;
            plan.push({
                id: ilkMi ? `${CUMA_ID_ONEKI}${iso}` : `${CUMA_ID_ONEKI}${iso}_${kalanDk}`,
                zaman,
                oncedenDk: kalanDk,
                ilkMi,
            });
        }
    }
    return plan;
}
