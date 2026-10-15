/**
 * "Camide kılacağım" hatırlatma PLANI — SAF (issue #292).
 *
 * `CamiyeGitHatirlatmaServisi` ve bildirim defteri (issue #298) AYNI listeyi
 * kullanır: servise eklenen her eleme kuralı BURAYA eklenir, yoksa rehber ekranı
 * "sığıyor" derken cihaz keser.
 *
 * Kurallar:
 *  - Seçili her vakit için vaktin GİRİŞİNDEN (ezandan) `yürüme + hazırlık` dk
 *    önce TEK bildirim. Vakit hesabı GÜN BAZINDA (her gün ayrı `PrayerTimes`).
 *  - Ufuk platforma göre: Android 7 / iOS 3 gün (iOS 64 bekleyen bildirim
 *    bütçesi muhafızla paylaşılır — gün sonu hatırlatmasıyla aynı ufuk).
 *  - Özel gün kapısı (issue #272) VAKTİN GÜNÜNE uygulanır; ufuk kaymaz.
 *  - ÇAKIŞMA: cuma hatırlatması AÇIKSA cuma günü öğle için bu hatırlatma
 *    kurulmaz (cuma kendi hatırlatmasını zaten gönderir).
 *  - Kılınmışlık kontrolü YOKTUR: hatırlatma ezandan ÖNCEdir, vakit henüz girmemiştir.
 *
 * Metin serviste DEĞİL burada üretilir (saf, testli): `camiyeGitMetniOlustur`.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../vakit/hesapParametreleri';
import type { BildirimPlatformu } from './butceSabitleri';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import { cumaMi } from '../utils/cumaYardimcisi';
import { VAKIT_ADLARI } from '../utils/muhafizMetinYardimcisi';
import {
    CAMIYE_GIT_VAKITLERI,
    camiyeGitOncedenDk,
    type CamiyeGitAyarlari,
    type CamiyeGitVakti,
} from '../camiyeGit/camiyeGitAyarlari';

/** Bildirim id öneki — temizlik bu önekle SÜZER, başka sistemlere dokunmaz. */
export const CAMIYE_GIT_ID_ONEKI = 'camiye_git_';

/** Kaç gün ileri planlanır (bugün dahil). */
export const CAMIYE_GIT_PLAN_GUN_SAYISI: Record<BildirimPlatformu, number> = { android: 7, ios: 3 };

export type CamiyeGitPlanAyarlari = Pick<CamiyeGitAyarlari, 'aktif' | 'vakitler' | 'yurumeDk' | 'hazirlikDk'>;

export interface CamiyeGitPlanSecenekleri {
    gunSayisi: number;
    /** Özel gün kapısı — `true` dönen günün hiçbir hatırlatması kurulmaz. */
    gunAtlanirMi?: (iso: string) => boolean;
    /** Cuma hatırlatması açık mı? Açıksa cuma günü öğle atlanır. */
    cumaHatirlatmasiAcik?: boolean;
}

export interface CamiyeGitPlanKaydi {
    id: string;
    vakit: CamiyeGitVakti;
    /** Vaktin ait olduğu gün (YYYY-MM-DD). */
    tarih: string;
    /** Bildirim anı. */
    zaman: Date;
    /** Ezandan kaç dk önce (metin bunu yazar). */
    oncedenDk: number;
}

const gunVakitleri = (pt: PrayerTimes): Record<CamiyeGitVakti, Date> => ({
    imsak: pt.fajr,
    ogle: pt.dhuhr,
    ikindi: pt.asr,
    aksam: pt.maghrib,
    yatsi: pt.isha,
});

/** Önümüzdeki `gunSayisi` günün hatırlatmaları (kronolojik). */
export function camiyeGitPlaniOlustur(
    koordinat: { lat: number; lng: number },
    ayarlar: CamiyeGitPlanAyarlari,
    simdi: Date,
    secenekler: CamiyeGitPlanSecenekleri
): CamiyeGitPlanKaydi[] {
    if (!ayarlar.aktif) return [];
    if (!CAMIYE_GIT_VAKITLERI.some((v) => ayarlar.vakitler[v])) return [];
    const gunAtlanirMi = secenekler.gunAtlanirMi ?? (() => false);
    const coordinates = new Coordinates(koordinat.lat, koordinat.lng);
    const params = turkiyeHesapParametreleri();
    const oncedenDk = camiyeGitOncedenDk(ayarlar);

    const plan: CamiyeGitPlanKaydi[] = [];
    for (let i = 0; i < secenekler.gunSayisi; i++) {
        // YEREL gün aritmetiği (ISO parse UTC tuzağı — cumaYardimcisi notu).
        const gun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate() + i);
        const tarih = tarihiISOFormatinaCevir(gun);
        if (gunAtlanirMi(tarih)) continue;
        const vakitler = gunVakitleri(new PrayerTimes(coordinates, gun, params));
        for (const vakit of CAMIYE_GIT_VAKITLERI) {
            if (!ayarlar.vakitler[vakit]) continue;
            if (vakit === 'ogle' && secenekler.cumaHatirlatmasiAcik && cumaMi(gun)) continue;
            const giris = vakitler[vakit];
            if (!giris) continue;
            const zaman = new Date(giris.getTime() - oncedenDk * 60_000);
            if (zaman.getTime() <= simdi.getTime()) continue;
            plan.push({ id: `${CAMIYE_GIT_ID_ONEKI}${tarih}_${vakit}`, vakit, tarih, zaman, oncedenDk });
        }
    }
    return plan.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
}

/**
 * Bildirim metni. İBADETE ÇAĞRI kaydıdır ("sen" + emir kipi — arayüz dili DEĞİL;
 * AGENTS.md istisnası). Vakte özgü nass YOK (cuma'nın 62/9'u yalnız cuma bildiriminde).
 * Hazırlık payı varsa kişiye ne zaman yola çıkacağı da söylenir.
 */
export function camiyeGitMetniOlustur(
    vakit: CamiyeGitVakti,
    ayarlar: Pick<CamiyeGitAyarlari, 'yurumeDk' | 'hazirlikDk'>
): { baslik: string; govde: string } {
    const toplam = camiyeGitOncedenDk(ayarlar);
    const ad = VAKIT_ADLARI[vakit];
    if (ayarlar.hazirlikDk > 0) {
        // Önden okunur (issue #287): vakit + ezana kalan süre başta — bileklikler
        // başlığın yalnız ilk ~16 karakterini gösterir.
        return {
            baslik: `${ad} · ezana ${toplam} dk · camiye hazırlan`,
            govde: `${ad} namazına camide yetişmek için hazırlan, ${ayarlar.hazirlikDk} dk sonra yola çık — ezana ${toplam} dk.`,
        };
    }
    return {
        baslik: `${ad} · ezana ${toplam} dk · camiye yola çık`,
        govde: `${ad} namazına camide yetişmek için yola çık — ezana ${toplam} dk.`,
    };
}
