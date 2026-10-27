/**
 * "Camide kılacağım" hatırlatma PLANI — SAF (issue #292; ortak hatırlatma yüzeyleri
 * plan §5.2'de adım dizisine geçti).
 *
 * `CamiyeGitHatirlatmaServisi` ve bildirim defteri (issue #298) AYNI listeyi
 * kullanır: servise eklenen her eleme kuralı BURAYA eklenir, yoksa rehber ekranı
 * "sığıyor" derken cihaz keser.
 *
 * AYRI PLAN MOTORU YAZILMAZ: her seçili vaktin penceresi (girişine kadar) muhafızın bir
 * vakti gibi `vakitUyariPlaniOlustur`'a verilir — eşik, sıklık, plan bütçesi, kanallar,
 * gerçek alarm anı muhafızla BİREBİR aynı motordan gelir. Yön SABİT: ölçü daima vaktin
 * GİRİŞİNE (ezana) kalan süredir.
 *
 * Kurallar:
 *  - Vakit hesabı GÜN BAZINDA (her gün ayrı `PrayerTimes`).
 *  - Ufuk platforma göre: Android 7 / iOS 3 gün (iOS 64 bekleyen bildirim
 *    bütçesi muhafızla paylaşılır — gün sonu hatırlatmasıyla aynı ufuk).
 *  - Özel gün kapısı (issue #272) VAKTİN GÜNÜNE uygulanır; ufuk kaymaz.
 *  - ÇAKIŞMA: cuma hatırlatması AÇIKSA cuma günü öğle için bu hatırlatma
 *    kurulmaz (cuma kendi hatırlatmasını zaten gönderir).
 *  - Kılınmışlık kontrolü YOKTUR: hatırlatma ezandan ÖNCEdir, vakit henüz girmemiştir.
 *  - Android alarm payı (`alarmButcesi`) KRONOLOJİK keser (ortak `alarmPayinaSigdir`).
 *
 * KİMLİK: bir vaktin İLK tetiği TARİHSEL kimliği (`camiye_git_<gün>_<vakit>`) korur — göçten
 * gelen tek adımlı kayıt birebir aynı kimlikleri üretir; diğerleri `_<kalanDk>` ekiyle
 * ayrışır (bir dakikada tek tetik → tekil).
 *
 * Metin serviste DEĞİL burada üretilir (saf, testli): `camiyeGitMetniOlustur`.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { aktifPrayerTimes } from '../vakit/aktifHesap';
import type { BildirimPlatformu } from './butceSabitleri';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import { cumaMi, sureMetniOlustur } from '../utils/cumaYardimcisi';
import { VAKIT_ADLARI } from '../utils/muhafizMetinYardimcisi';
import { bicim, metin } from '../dil/aktifDil';
import type { SeviyeAyari } from '../muhafiz/matrisTipleri';
import { vakitUyariPlaniOlustur, type UyariPlani } from '../muhafiz/motorAdaptoru';
import { alarmPayinaSigdir } from '../hatirlatma/ekPlan';
import { adimAnonsMetni } from '../hatirlatma/anonsYerTutucu';
import {
    CAMIYE_GIT_VAKITLERI,
    type CamiyeGitAyarlari,
    type CamiyeGitVakti,
} from '../camiyeGit/camiyeGitAyarlari';

/** Bildirim id öneki — temizlik bu önekle SÜZER, başka sistemlere dokunmaz. */
export const CAMIYE_GIT_ID_ONEKI = 'camiye_git_';

/** Kaç gün ileri planlanır (bugün dahil). */
export const CAMIYE_GIT_PLAN_GUN_SAYISI: Record<BildirimPlatformu, number> = { android: 7, ios: 3 };

/** Bir vaktin tüm hatırlatmalarının öneki (`camiye_git_<gün>_<vakit>` + ek) — iptal için. */
export const camiyeGitKimlikOneki = (tarih: string, vakit: CamiyeGitVakti): string =>
    `${CAMIYE_GIT_ID_ONEKI}${tarih}_${vakit}`;

export type CamiyeGitPlanAyarlari = Pick<CamiyeGitAyarlari, 'aktif' | 'vakitler' | 'yurumeDk' | 'hazirlikDk' | 'adimlar'>;

export interface CamiyeGitPlanSecenekleri {
    gunSayisi: number;
    /** Özel gün kapısı — `true` dönen günün hiçbir hatırlatması kurulmaz. */
    gunAtlanirMi?: (iso: string) => boolean;
    /** Cuma hatırlatması açık mı? Açıksa cuma günü öğle atlanır. */
    cumaHatirlatmasiAcik?: boolean;
    /** Android alarm payı (bildirim + anons alarmı, kronolojik). Verilmezse kesilmez. */
    alarmButcesi?: number;
}

export interface CamiyeGitPlanKaydi {
    id: string;
    vakit: CamiyeGitVakti;
    /** Vaktin ait olduğu gün (YYYY-MM-DD). */
    tarih: string;
    /** Bildirim anı. */
    zaman: Date;
    /** Ezana kaç dk kala (metin bunu yazar). */
    oncedenDk: number;
    /** Vaktin GİRİŞİ — pencerenin sonu (gerçek alarm geç tetikte burada atlar). */
    giris: Date;
    baslik: string;
    govde: string;
    /** Motorun uyarısı — kanallar, gerçek alarm anı; `anonsMetni` ÇÖZÜLMÜŞ cümledir. */
    uyari: UyariPlani;
}

const gunVakitleri = (pt: PrayerTimes): Record<CamiyeGitVakti, Date> => ({
    imsak: pt.fajr,
    ogle: pt.dhuhr,
    ikindi: pt.asr,
    aksam: pt.maghrib,
    yatsi: pt.isha,
});

const adimlarGecerliMi = (adimlar: unknown): adimlar is SeviyeAyari[] => Array.isArray(adimlar) && adimlar.length > 0;

/** Önümüzdeki `gunSayisi` günün hatırlatmaları (kronolojik). */
export function camiyeGitPlaniOlustur(
    koordinat: { lat: number; lng: number },
    ayarlar: CamiyeGitPlanAyarlari,
    simdi: Date,
    secenekler: CamiyeGitPlanSecenekleri
): CamiyeGitPlanKaydi[] {
    if (!ayarlar.aktif || !adimlarGecerliMi(ayarlar.adimlar)) return [];
    if (!CAMIYE_GIT_VAKITLERI.some((v) => ayarlar.vakitler[v])) return [];
    const gunAtlanirMi = secenekler.gunAtlanirMi ?? (() => false);
    const coordinates = new Coordinates(koordinat.lat, koordinat.lng);

    // Tarama en uzak eşikten başlar (çıkış yönü: ölçü azalarak ezana yaklaşır). Motor
    // çıktısı kalanDk'ya göre AZALAN = kronolojik; ilk = vaktin ilk tetiği.
    const enBuyukEsik = Math.max(...ayarlar.adimlar.map((a) => a.esikDk));
    const adimPlani = vakitUyariPlaniOlustur({ yon: 'cikisaDogru', seviyeler: ayarlar.adimlar }, enBuyukEsik);

    const plan: CamiyeGitPlanKaydi[] = [];
    for (let i = 0; i < secenekler.gunSayisi; i++) {
        // YEREL gün aritmetiği (ISO parse UTC tuzağı — cumaYardimcisi notu).
        const gun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate() + i);
        const tarih = tarihiISOFormatinaCevir(gun);
        if (gunAtlanirMi(tarih)) continue;
        const vakitler = gunVakitleri(aktifPrayerTimes(coordinates, gun));
        for (const vakit of CAMIYE_GIT_VAKITLERI) {
            if (!ayarlar.vakitler[vakit]) continue;
            if (vakit === 'ogle' && secenekler.cumaHatirlatmasiAcik && cumaMi(gun)) continue;
            const giris = vakitler[vakit];
            if (!giris) continue;
            for (const [sira, uyari] of adimPlani.entries()) {
                const zaman = new Date(giris.getTime() - uyari.kalanDk * 60_000);
                if (zaman.getTime() <= simdi.getTime()) continue;
                const onek = camiyeGitKimlikOneki(tarih, vakit);
                plan.push({
                    id: sira === 0 ? onek : `${onek}_${uyari.kalanDk}`,
                    vakit,
                    tarih,
                    zaman,
                    oncedenDk: uyari.kalanDk,
                    giris,
                    ...camiyeGitMetniOlustur(vakit, uyari.kalanDk, ayarlar),
                    uyari: {
                        ...uyari,
                        // Kullanıcının metni (yer tutucular bu vakte göre); boşsa otomatik cümle.
                        anonsMetni: adimAnonsMetni(
                            uyari.anonsMetni,
                            { vakit: VAKIT_ADLARI[vakit], sureDk: uyari.kalanDk },
                            () => camiyeGitAnonsMetni(vakit, uyari.kalanDk, ayarlar)
                        ),
                    },
                });
            }
        }
    }
    plan.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
    return alarmPayinaSigdir(plan, secenekler.alarmButcesi);
}

/**
 * Yola çıkmadan önce kaç dk hazırlık kaldığı: `kalanDk − yürüme`. Hazırlık payı yoksa ya da
 * kişinin artık doğrudan yola çıkması gerekiyorsa `0`.
 */
const hazirlikKalanDk = (kalanDk: number, a: Pick<CamiyeGitAyarlari, 'yurumeDk' | 'hazirlikDk'>): number =>
    a.hazirlikDk > 0 ? Math.max(0, kalanDk - a.yurumeDk) : 0;

/**
 * Bildirim metni. İBADETE ÇAĞRI kaydıdır ("sen" + emir kipi — arayüz dili DEĞİL;
 * AGENTS.md istisnası). Vakte özgü nass YOK (cuma'nın 62/9'u yalnız cuma bildiriminde).
 * Hazırlık payı varsa ve yürüme süresinden fazla vakit kaldıysa kişiye ne zaman yola
 * çıkacağı da söylenir. Göçten gelen kayıtta `kalanDk = yürüme + hazırlık` → eski metin
 * BİREBİR.
 */
export function camiyeGitMetniOlustur(
    vakit: CamiyeGitVakti,
    kalanDk: number,
    ayarlar: Pick<CamiyeGitAyarlari, 'yurumeDk' | 'hazirlikDk'>
): { baslik: string; govde: string } {
    const ad = VAKIT_ADLARI[vakit];
    const m = metin().bildirim.camiye;
    const sonra = hazirlikKalanDk(kalanDk, ayarlar);
    if (sonra > 0) {
        // Önden okunur (issue #287): vakit + ezana kalan süre başta — bileklikler
        // başlığın yalnız ilk ~16 karakterini gösterir.
        return {
            baslik: bicim(m.hazirlanBaslik, { ad, dk: kalanDk }),
            govde: bicim(m.hazirlanGovde, { ad, dk: kalanDk, sonra }),
        };
    }
    return {
        baslik: bicim(m.yolaCikBaslik, { ad, dk: kalanDk }),
        govde: bicim(m.yolaCikGovde, { ad, dk: kalanDk }),
    };
}

/**
 * Sesli anons metni (ibadete çağrı — "sen"). Nass OKUNMAZ; çözülmüş cümle (yer tutucu yok).
 */
export function camiyeGitAnonsMetni(
    vakit: CamiyeGitVakti,
    kalanDk: number,
    ayarlar: Pick<CamiyeGitAyarlari, 'yurumeDk' | 'hazirlikDk'>
): string {
    const o = metin().anons.otomatik;
    const giris = bicim(o.camiyeGiris, { vakit: VAKIT_ADLARI[vakit], sure: sureMetniOlustur(kalanDk) });
    return `${giris} ${hazirlikKalanDk(kalanDk, ayarlar) > 0 ? o.camiyeHazirlan : o.camiyeYola}`;
}
