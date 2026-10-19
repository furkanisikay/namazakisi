/**
 * Camideyim ayarları — JS görünümü. TEK doğru kaynak native SharedPreferences'tır
 * (`CamiDepo`; karar uygulama ölüyken verilir). Bu normalize, köprüden gelen ham
 * JSON'u ekranın güvenle okuyabileceği biçime getirir (native normalize'ın aynası).
 */
import {
    ALAN_MAX_M,
    ALAN_MIN_M,
    BEKLEME_MAX_DK,
    BEKLEME_MIN_DK,
    BEKLEME_VARSAYILAN_DK,
    OLCEK_MAX,
    OLCEK_MIN,
    type YerDurumu,
    type YerKaydi,
} from './camiTipleri';
import type { AcilisBicimi, IzlemeKapsami } from './guvenPuani';

export interface CamideyimAyarlari {
    aktif: boolean;
    beklemeDk: number;
    /** Yalnız vakit yakınında (giriş −20…+60, cuma −90…+90). */
    vakitKapisi: boolean;
    /** Camideyken Namaz moduna geç. */
    namazModu: boolean;
    /** Muhafız camideyken sessiz (sesli anons konuşmaz, acil kanal kullanılmaz). */
    sessiz: boolean;
    /** Çıkınca "kıldınız mı?" diye sorulsun. */
    kildimSor: boolean;
    /** Faz 2: yakındaki tüm camiler mi, yalnız seçilenler (favori + eklenen yerler) mi izlenir. */
    izlemeKapsami: IzlemeKapsami;
    /** Faz 2: "camide" kararından sonra mod otomatik mi açılır, sorulur mu (güven puanı). */
    acilisBicimi: AcilisBicimi;
    yerler: Record<string, YerKaydi>;
}

export const VARSAYILAN_CAMIDEYIM_AYARLARI: CamideyimAyarlari = {
    aktif: false,
    beklemeDk: BEKLEME_VARSAYILAN_DK,
    vakitKapisi: true,
    namazModu: true,
    sessiz: true,
    kildimSor: true,
    izlemeKapsami: 'yakindakiler',
    acilisBicimi: 'akilli',
    yerler: {},
};

const nesneMi = (d: unknown): d is Record<string, unknown> => !!d && typeof d === 'object' && !Array.isArray(d);
const sayi = (d: unknown): number | null => (typeof d === 'number' && Number.isFinite(d) ? d : null);

function yerNormalize(ham: unknown): YerKaydi | null {
    if (!nesneMi(ham)) return null;
    const durum: YerDurumu = ham.durum === 'favori' || ham.durum === 'haric' ? ham.durum : 'normal';
    const y: YerKaydi = { durum };
    const alan = sayi(ham.alanM);
    if (alan != null) y.alanM = Math.min(ALAN_MAX_M, Math.max(ALAN_MIN_M, alan));
    // Ölçekli bina sınırı daireyle birlikte yazılmaz (native `CamiDepo.normalize` aynası).
    const olcek = sayi(ham.olcek);
    if (y.alanM == null && olcek != null && olcek > OLCEK_MIN) y.olcek = Math.min(OLCEK_MAX, olcek);
    if (typeof ham.ad === 'string') y.ad = ham.ad.slice(0, 120);
    const lat = sayi(ham.lat);
    const lng = sayi(ham.lng);
    if (lat != null && lng != null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        y.lat = lat;
        y.lng = lng;
    }
    if (ham.kendi === true) y.kendi = true;
    return y;
}

export function camideyimAyarlariniNormalize(ham: unknown): CamideyimAyarlari {
    if (!nesneMi(ham)) return { ...VARSAYILAN_CAMIDEYIM_AYARLARI, yerler: {} };
    const bekleme = sayi(ham.beklemeDk);
    const yerler: Record<string, YerKaydi> = {};
    if (nesneMi(ham.yerler)) {
        for (const [id, deger] of Object.entries(ham.yerler)) {
            if (id.length > 80) continue;
            const y = yerNormalize(deger);
            if (y) yerler[id] = y;
        }
    }
    return {
        aktif: ham.aktif === true,
        beklemeDk: bekleme == null ? BEKLEME_VARSAYILAN_DK : Math.min(BEKLEME_MAX_DK, Math.max(BEKLEME_MIN_DK, Math.round(bekleme))),
        vakitKapisi: ham.vakitKapisi !== false,
        namazModu: ham.namazModu !== false,
        sessiz: ham.sessiz !== false,
        kildimSor: ham.kildimSor !== false,
        izlemeKapsami: ham.izlemeKapsami === 'secilenler' ? 'secilenler' : 'yakindakiler',
        acilisBicimi: ham.acilisBicimi === 'otomatik' || ham.acilisBicimi === 'sorarak' ? ham.acilisBicimi : 'akilli',
        yerler,
    };
}

/** Kullanıcı yeri kimliği — zaman damgası tabanlı, yeterince tekil. */
export const kullaniciYeriKimligi = (simdiMs: number): string => `kendi:${simdiMs.toString(36)}`;

/**
 * Bir yerin durumunu değiştirir; "normal" ve ek bilgisi olmayan kayıt silinir (harita şişmesin).
 * `undefined` verilen alan SİLİNİR ("Özgün sınıra dön" = `{ alanM: undefined, olcek: undefined }`).
 */
export function yerDurumunuAyarla(
    yerler: Readonly<Record<string, YerKaydi>>,
    id: string,
    degisiklik: Partial<YerKaydi>
): Record<string, YerKaydi> {
    const yeni = { ...yerler };
    const birlesik: YerKaydi = { ...(yerler[id] ?? { durum: 'normal' }), ...degisiklik };
    for (const anahtar of Object.keys(birlesik) as (keyof YerKaydi)[]) {
        if (birlesik[anahtar] === undefined) delete birlesik[anahtar];
    }
    if (birlesik.durum === 'normal' && !birlesik.kendi && birlesik.alanM == null && birlesik.olcek == null) {
        delete yeni[id];
    } else {
        yeni[id] = birlesik;
    }
    return yeni;
}
