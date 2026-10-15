/**
 * Camideyim GÜVEN PUANI (issue #297 Faz 2) — SAF (Kotlin ikizi: `cekirdek/GuvenPuani.kt`).
 *
 * Faz 1'de "camide" kararı (alan testi geçti) Namaz modunu DOĞRUDAN açıyordu.
 * Trafikte caminin yanında durmak, yanındaki kafede oturmak ya da yürürken önünden
 * geçmek alan testini geçebilir; bu yüzden karar "camide" olsa bile ne yapılacağını
 * bir puan belirler:
 *
 *   ZAMAN   cuma öğlesi (hutbe) 45 · ezan girişi −10…+40 dk 40 · kapı içi 20 · kapı dışı 0
 *   YER     bina içi 40 · kullanıcı alanı 30 · nokta merkezi 30 · nokta kenarı 10 · tampon 5
 *   ÖLÇÜM   doğruluk ≤10 m +10, ≤20 m +5 · hız ≤0,5 m/s +5 · bekleme ≥5 dk +5, ≥10 dk +10
 *
 *   puan ≥ 75 → OTOMATİK · ≥ 50 → SOR · altı → HİÇBİR
 *
 * TAVANLAR (puan ne olursa olsun):
 *   - hareket (hız > 1,5 m/s) + kenar/tampon → HİÇBİR (önünden geçiyor)
 *   - hareket → en fazla SOR (araçta/yürürken otomatik açma yok)
 *   - kenar/tampon → en fazla SOR (trafikte hız ~0 olsa bile yol üstü bina dışıdır)
 *   - vakit kapısı dışı (kapı ayarı kapalıyken) → en fazla SOR
 *
 * Açılış biçimi son sözü söyler: "Akıllı" puanı uygular; "Otomatik" SOR'u da açar
 * ama HİÇBİR'i açmaz; "Sorarak" OTOMATİK'i de sorar.
 *
 * Kotlin ile birebir aynı sonucu verdiği ortak fikstürle kanıtlanır
 * (`modules/expo-cami-geofence/android/src/test/resources/guven-puani-tablosu.json`).
 */
import {
    GUVEN_EZAN_ONCE_DK,
    GUVEN_EZAN_SONRA_DK,
    GUVEN_OTOMATIK_ESIK,
    GUVEN_SOR_ESIK,
    HIZ_DURGUN_MPS,
    HIZ_HAREKETLI_MPS,
    KAPI_ONCE_DK,
    type CamiKarari,
    type IzlenenYer,
    type KapiPenceresi,
} from './camiTipleri';
import { camiKarariVer, kapiPenceresiniBul, type KararGirdisi } from './camiKarar';
import { alanYaricapiM, mesafeM, noktaPoligondaMi } from './geometri';

const DK = 60_000;

export type GuvenKarari = 'otomatik' | 'sor' | 'hicbir';
export type AcilisBicimi = 'akilli' | 'otomatik' | 'sorarak';
export type IzlemeKapsami = 'yakindakiler' | 'secilenler';

export type ZamanSinifi = 'cuma' | 'ezanYakin' | 'kapiIci' | 'serbest';
export type YerSinifi = 'poligonIci' | 'kullaniciAlani' | 'noktaMerkez' | 'noktaKenar' | 'tampon';
export type HareketSinifi = 'durgun' | 'yavas' | 'hareketli' | 'bilinmiyor';
/** Kararı düşüren kural (yoksa null). */
export type GuvenTavani = 'gecipGidiyor' | 'hareketli' | 'kenar' | 'vakitDisi';

export const ZAMAN_PUANI: Readonly<Record<ZamanSinifi, number>> = { cuma: 45, ezanYakin: 40, kapiIci: 20, serbest: 0 };
export const YER_PUANI: Readonly<Record<YerSinifi, number>> = {
    poligonIci: 40,
    kullaniciAlani: 30,
    noktaMerkez: 30,
    noktaKenar: 10,
    tampon: 5,
};

export interface GuvenSiniflari {
    zaman: ZamanSinifi;
    yer: YerSinifi;
    hareket: HareketSinifi;
}

export interface GuvenSonucu extends GuvenSiniflari {
    puan: number;
    karar: GuvenKarari;
    tavan: GuvenTavani | null;
}

const SIRA: Readonly<Record<GuvenKarari, number>> = { hicbir: 0, sor: 1, otomatik: 2 };
const enFazla = (k: GuvenKarari, tavan: GuvenKarari): GuvenKarari => (SIRA[k] > SIRA[tavan] ? tavan : k);

/** Pencere varsa vaktin giriş anı (ms): pencere başı + kapının "önce" payı (cuma ayrı sınıf). */
export function zamanSinifiBul(simdiMs: number, pencere: KapiPenceresi | null): ZamanSinifi {
    if (!pencere) return 'serbest';
    if (pencere.cuma) return 'cuma';
    const giris = pencere.bas + KAPI_ONCE_DK * DK;
    const fark = simdiMs - giris;
    return fark >= -GUVEN_EZAN_ONCE_DK * DK && fark <= GUVEN_EZAN_SONRA_DK * DK ? 'ezanYakin' : 'kapiIci';
}

/**
 * Konum alanın İÇİNDEYKEN (karar "camide") nerede duruyor? Sıra alan testiyle
 * aynı: kullanıcı alanı poligonu ezer; poligon yoksa nokta yarıçapının yarısı
 * "merkez" sayılır.
 */
export function yerSinifiBul(yer: IzlenenYer, lat: number, lng: number): YerSinifi {
    if ((yer.ozelAlanM != null && yer.ozelAlanM > 0) || yer.kaynak === 'kendi') return 'kullaniciAlani';
    if (yer.poligon && yer.poligon.length >= 3) return noktaPoligondaMi(lat, lng, yer.poligon) ? 'poligonIci' : 'tampon';
    return mesafeM(lat, lng, yer.lat, yer.lng) <= alanYaricapiM(yer) / 2 ? 'noktaMerkez' : 'noktaKenar';
}

export function hareketSinifiBul(hizMps: number | null | undefined): HareketSinifi {
    if (hizMps == null || !Number.isFinite(hizMps) || hizMps < 0) return 'bilinmiyor';
    if (hizMps > HIZ_HAREKETLI_MPS) return 'hareketli';
    if (hizMps <= HIZ_DURGUN_MPS) return 'durgun';
    return 'yavas';
}

/** Sınıflardan puan ve karar — geometriye bağımsız (ekran örnekleri de bunu kullanır). */
export function guvenPuaniniHesapla(s: GuvenSiniflari, dogrulukM: number, beklemeDk: number): GuvenSonucu {
    let puan = ZAMAN_PUANI[s.zaman] + YER_PUANI[s.yer];
    if (dogrulukM <= 10) puan += 10;
    else if (dogrulukM <= 20) puan += 5;
    if (s.hareket === 'durgun') puan += 5;
    if (beklemeDk >= 10) puan += 10;
    else if (beklemeDk >= 5) puan += 5;

    const ham: GuvenKarari = puan >= GUVEN_OTOMATIK_ESIK ? 'otomatik' : puan >= GUVEN_SOR_ESIK ? 'sor' : 'hicbir';
    const kenar = s.yer === 'tampon' || s.yer === 'noktaKenar';
    let karar = ham;
    let tavan: GuvenTavani | null = null;
    const uygula = (t: GuvenKarari, neden: GuvenTavani) => {
        const yeni = enFazla(karar, t);
        if (yeni !== karar) {
            karar = yeni;
            if (!tavan) tavan = neden;
        }
    };
    if (s.hareket === 'hareketli' && kenar) uygula('hicbir', 'gecipGidiyor');
    if (s.hareket === 'hareketli') uygula('sor', 'hareketli');
    if (kenar) uygula('sor', 'kenar');
    if (s.zaman === 'serbest') uygula('sor', 'vakitDisi');
    return { ...s, puan, karar, tavan };
}

export interface GuvenGirdisi {
    simdiMs: number;
    pencere: KapiPenceresi | null;
    yer: IzlenenYer;
    konum: { lat: number; lng: number; dogrulukM: number; hizMps: number | null };
    beklemeDk: number;
}

export function guvenHesapla(g: GuvenGirdisi): GuvenSonucu {
    return guvenPuaniniHesapla(
        {
            zaman: zamanSinifiBul(g.simdiMs, g.pencere),
            yer: yerSinifiBul(g.yer, g.konum.lat, g.konum.lng),
            hareket: hareketSinifiBul(g.konum.hizMps),
        },
        g.konum.dogrulukM,
        g.beklemeDk
    );
}

/** Kullanıcının açılış biçimi son sözü söyler. */
export function acilisBiciminiUygula(karar: GuvenKarari, bicim: AcilisBicimi): GuvenKarari {
    if (bicim === 'otomatik') return karar === 'hicbir' ? 'hicbir' : 'otomatik';
    if (bicim === 'sorarak') return karar === 'hicbir' ? 'hicbir' : 'sor';
    return karar;
}

export interface AcilisGirdisi extends KararGirdisi {
    hizMps: number | null;
    beklemeDk: number;
    acilisBicimi: AcilisBicimi;
}

export interface AcilisSonucu {
    karar: CamiKarari;
    guven: GuvenSonucu | null;
    eylem: GuvenKarari;
}

/**
 * Tam boru hattı (DWELL → karar → güven → açılış biçimi). Native `CamiGeofenceAlicisi`
 * aynı sırayı izler; senaryo tablosu bunu iki dilde sınar.
 */
export function acilisKarariVer(g: AcilisGirdisi): AcilisSonucu {
    const karar = camiKarariVer(g);
    if (karar.sonuc !== 'camide' || !g.konum) return { karar, guven: null, eylem: 'hicbir' };
    const yer = g.adaylar.find((a) => a.id === karar.yerId);
    if (!yer) return { karar, guven: null, eylem: 'hicbir' };
    const guven = guvenHesapla({
        simdiMs: g.simdiMs,
        pencere: kapiPenceresiniBul(g.simdiMs, g.pencereler),
        yer,
        konum: { ...g.konum, hizMps: g.hizMps },
        beklemeDk: g.beklemeDk,
    });
    return { karar, guven, eylem: acilisBiciminiUygula(guven.karar, g.acilisBicimi) };
}
