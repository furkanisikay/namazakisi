/**
 * Cuma hatırlatma PLANI — SAF (issue #173; #298'de servisten çıkarıldı; ortak hatırlatma
 * yüzeyleri plan §5.1'de adım dizisine geçti).
 *
 * `CumaHatirlatmaServisi` ve bildirim defteri AYNI listeyi kullanır — ekranda sayılan ile
 * cihazda kurulan ayrışmasın. Yeni bir eleme/kesme kuralı BURAYA eklenir, servise değil.
 *
 * AYRI PLAN MOTORU YAZILMAZ: her cumanın penceresi (öğle girişine kadar) muhafızın bir
 * vakti gibi `vakitUyariPlaniOlustur`'a verilir — eşik, sıklık, plan bütçesi (adım başına en
 * fazla 15 tetik), kanallar, gerçek alarm anı muhafızla BİREBİR aynı motordan gelir. Yön
 * SABİT: ölçü daima öğle GİRİŞİNE kalan süredir (`kalanDk`).
 *
 * KİMLİK: bir cumanın İLK tetiği (tüm adımlar içinde en erkeni) TARİHSEL kimliği
 * (`cuma_hatirlatma_<ISO>`) korur — göçten gelen tek adımlı kayıt birebir aynı kimlikleri
 * üretir; diğerleri `_<kalanDk>` ekiyle ayrışır (bir dakikada tek tetik → tekil).
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../vakit/hesapParametreleri';
import type { SeviyeAyari } from '../muhafiz/matrisTipleri';
import { vakitUyariPlaniOlustur, type UyariPlani } from '../muhafiz/motorAdaptoru';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import { cumaAnonsMetni, cumaBildirimMetni, hatirlatmaZamaniHesapla, sonrakiCumalar } from '../utils/cumaYardimcisi';
import { alarmPayinaSigdir } from '../hatirlatma/ekPlan';

/** Bildirim id öneki — temizlik bu önekle SÜZER, başka sistemlere dokunmaz. */
export const CUMA_ID_ONEKI = 'cuma_hatirlatma_';

/**
 * Kaç cuma ileri planlanır. Olay haftada bir; dört hafta, kullanıcı uygulamayı
 * bir ay açmasa bile hatırlatmanın sürmesini sağlar.
 */
export const PLANLANACAK_CUMA_SAYISI = 4;

/** Bir cumanın tüm hatırlatmalarının öneki (`cuma_hatirlatma_<ISO>` + ek) — iptal için. */
export const cumaKimlikOneki = (iso: string): string => `${CUMA_ID_ONEKI}${iso}`;

export interface CumaPlanAyarlari {
    aktif: boolean;
    adimlar: SeviyeAyari[];
}

export interface CumaPlanSecenekleri {
    /** Android alarm payı (bildirim + anons alarmı, kronolojik). Verilmezse kesilmez. */
    alarmButcesi?: number;
}

export interface CumaPlanKaydi {
    id: string;
    zaman: Date;
    /** Öğle vaktine kalan dakika (metin bunu yazar). */
    oncedenDk: number;
    /** O cumanın İLK (en erken) hatırlatması mı? Nass yalnız ilkinde geçer. */
    ilkMi: boolean;
    /** Cumanın tarihi (YYYY-MM-DD). */
    tarih: string;
    /** O cumanın öğle GİRİŞİ — pencerenin sonu (gerçek alarm geç tetikte burada atlar). */
    ogle: Date;
    baslik: string;
    govde: string;
    /** Motorun uyarısı — kanallar, gerçek alarm anı; `anonsMetni` ÇÖZÜLMÜŞ cuma cümlesidir. */
    uyari: UyariPlani;
}

/**
 * Önümüzdeki dört cumanın hatırlatmaları (kronolojik).
 *
 * `gunAtlanirMi` (özel gün, issue #272): aralığa düşen cuma atlanır, ufuk kaymaz.
 */
export function cumaPlaniOlustur(
    koordinat: { lat: number; lng: number },
    ayarlar: CumaPlanAyarlari,
    simdi: Date,
    gunAtlanirMi: (iso: string) => boolean = () => false,
    secenekler: CumaPlanSecenekleri = {}
): CumaPlanKaydi[] {
    if (!ayarlar.aktif || !Array.isArray(ayarlar.adimlar) || ayarlar.adimlar.length === 0) return [];
    const coordinates = new Coordinates(koordinat.lat, koordinat.lng);
    const params = turkiyeHesapParametreleri();

    // Tarama en uzak eşikten başlar (çıkış yönü: ölçü azalarak öğleye yaklaşır).
    const enBuyukEsik = Math.max(...ayarlar.adimlar.map((a) => a.esikDk));
    const adimPlani = vakitUyariPlaniOlustur({ yon: 'cikisaDogru', seviyeler: ayarlar.adimlar }, enBuyukEsik);

    const plan: CumaPlanKaydi[] = [];
    for (const cuma of sonrakiCumalar(simdi, PLANLANACAK_CUMA_SAYISI)) {
        const iso = tarihiISOFormatinaCevir(cuma);
        if (gunAtlanirMi(iso)) continue;
        // Vakit hesabı GÜN BAZINDA: her cuma için ayrı PrayerTimes.
        const ogle = new PrayerTimes(coordinates, cuma, params).dhuhr;
        // Motor çıktısı kalanDk'ya göre AZALAN = kronolojik; ilk = cumanın ilk tetiği.
        for (const [sira, uyari] of adimPlani.entries()) {
            const zaman = hatirlatmaZamaniHesapla(ogle, uyari.kalanDk);
            if (zaman.getTime() <= simdi.getTime()) continue;
            const ilkMi = sira === 0;
            const metin = cumaBildirimMetni(uyari.kalanDk, ilkMi);
            plan.push({
                id: ilkMi ? cumaKimlikOneki(iso) : `${cumaKimlikOneki(iso)}_${uyari.kalanDk}`,
                zaman,
                oncedenDk: uyari.kalanDk,
                ilkMi,
                tarih: iso,
                ogle,
                ...metin,
                uyari: { ...uyari, anonsMetni: cumaAnonsMetni(uyari.kalanDk) },
            });
        }
    }
    plan.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
    return alarmPayinaSigdir(plan, secenekler.alarmButcesi);
}
