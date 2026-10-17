/**
 * "Camide kılacağım" hatırlatması ayarları — SAF (issue #292; ortak hatırlatma yüzeyleri
 * plan §5.2).
 *
 * Seçilen her vakit için ezandan (vaktin GİRİŞİNDEN) önce hatırlatma. Ortak model
 * (nafile #273 / cuma deseni): `{ aktif, adimlar }` — en fazla 3 adım, her adımın eşiği
 * ("ezana kaç dk kala"), sıklığı ve kanalları (bildirim / sesli anons / titreşim / gerçek
 * alarm + kapsamı / ses). Beş vakit TEK adım dizisini paylaşır; vakit başına aç/kapa
 * (`vakitler`) korunur. Yön SABİT (girişe kalan süre), ton YOK.
 *
 * YÜRÜME + HAZIRLIK "yola çıkış süresi" YARDIMCISIDIR: değişince adımların TÜMÜ aynı farkla
 * kaydırılır (`camiyeGitOfsetiniUygula`; aralıklar korunur). Kaynağı (`yurumeKaynagi`) ve
 * "elle düzeltme kalıcıdır" kuralı aynen.
 *
 * GÖÇ ŞEKLE BAKAR, bayrağa değil: `adimlar` dizisi yoksa kayıt eskidir ve eski ofsetten
 * (`yurumeDk + hazirlikDk`) TEK adım kurulur — eski kayıt BİREBİR aynı planı üretir
 * (nöbetçi: `CamiyeGitHatirlatmaServisi.kayitOynat.test.ts`). İdempotent.
 *
 * RIZALAR (`sesliOnayi`, `alarmOnayi`) bu yüzeyin KENDİ kaydıdır; yalnız ekranda
 * onaylanınca yazılır, göç ya da varsayılan UYDURAMAZ.
 *
 * VARSAYILAN KAPALI: camiye gitmek kişinin tercihidir; ayardan açılır.
 * Normalize hem disk okumasında hem yazımında koşar (bozuk kayıt planlamayı bozmasın).
 */
import type { SeviyeAyari } from '../muhafiz/matrisTipleri';
import {
    adimlariNormalize,
    ekAdim,
    EK_HATIRLATMA_MAKS_ADIM,
    type AdimKisitlari,
} from '../hatirlatma/adimDizisi';
import { kronolojikSirala } from '../muhafiz/aktifSeviye';

/** Hatırlatılabilen farz vakitleri (anahtar uzayı `VakitAdi`; 'gunes' YOK). */
export type CamiyeGitVakti = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

/** Kronolojik sıra — ekran ve plan bu sırayla dolaşır. */
export const CAMIYE_GIT_VAKITLERI: readonly CamiyeGitVakti[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/**
 * Yürüme süresinin kaynağı:
 * - `varsayilan`: kullanıcı hiç ayarlamadı (tahmin gelirse üzerine yazılabilir)
 * - `tahmin`: favori camiye uzaklıktan hesaplandı (favori değişince tazelenir)
 * - `elle`: kullanıcı düzeltti → KALICI ve ÖNCELİKLİ, tahmin onu asla ezmez
 */
export type YurumeKaynagi = 'varsayilan' | 'tahmin' | 'elle';

export interface CamiyeGitAyarlari {
    aktif: boolean;
    vakitler: Record<CamiyeGitVakti, boolean>;
    /** Camiye yürüme süresi (dk). */
    yurumeDk: number;
    /** Abdest/giyinme payı (dk). Yola çıkış süresi = yürüme + hazırlık. */
    hazirlikDk: number;
    yurumeKaynagi: YurumeKaynagi;
    /** Tahminin hesaplandığı caminin adı (yalnız `tahmin` kaynağında anlamlı). */
    camiAdi?: string;
    /** 1..3 adım, KRONOLOJİK (eşik azalan = ezandan en uzak önce), eşik tekil. */
    adimlar: SeviyeAyari[];
    /** Sesli anons rızası — bu yüzeyin KENDİ kaydı. */
    sesliOnayi?: boolean;
    /** Gerçek alarm rızası — bu yüzeyin KENDİ kaydı. */
    alarmOnayi?: boolean;
}

export const YURUME_MIN_DK = 1;
export const YURUME_MAX_DK = 90;
export const HAZIRLIK_MIN_DK = 0;
export const HAZIRLIK_MAX_DK = 60;
export const HAZIRLIK_ADIM_DK = 5;

/** Adım eşiği sınırları (ezana kaç dk kala). Üst sınır yürüme + hazırlık tavanını kapsar. */
export const CAMIYE_GIT_ESIK_MIN_DK = 1;
export const CAMIYE_GIT_ESIK_MAX_DK = 180;
export const CAMIYE_GIT_ESIK_ADIM_DK = 5;
/** Tekrar aralığı (cuma ile aynı gerekçe: dakika dakika uyarmak gürültüdür). */
export const CAMIYE_GIT_TEKRAR_MIN_DK = 5;
export const CAMIYE_GIT_TEKRAR_MAX_DK = 60;
export const CAMIYE_GIT_VARSAYILAN_TEKRAR_DK = 10;

/** Camiye gitmenin adım kısıtları (ortak adım dizisi `core/hatirlatma/adimDizisi.ts`). */
export const CAMIYE_GIT_ADIM_KISITLARI: AdimKisitlari = {
    maksAdim: EK_HATIRLATMA_MAKS_ADIM,
    tekrarMinDk: CAMIYE_GIT_TEKRAR_MIN_DK,
    tekrarMaxDk: CAMIYE_GIT_TEKRAR_MAX_DK,
    esikMinDk: CAMIYE_GIT_ESIK_MIN_DK,
    esikMaxDk: CAMIYE_GIT_ESIK_MAX_DK,
    esikAdimDk: CAMIYE_GIT_ESIK_ADIM_DK,
};

const VARSAYILAN_YURUME_DK = 10;
const VARSAYILAN_HAZIRLIK_DK = 5;

/** Ezandan kaç dakika önce yola çıkılır (yürüme + hazırlık, en az 1). */
export const camiyeGitOncedenDk = (a: Pick<CamiyeGitAyarlari, 'yurumeDk' | 'hazirlikDk'>): number =>
    Math.max(1, a.yurumeDk + a.hazirlikDk);

/** Varsayılan ayar (her çağrı YENİ nesne). */
export function varsayilanCamiyeGitAyarlari(): CamiyeGitAyarlari {
    return {
        aktif: false,
        // Açılınca beş vakit seçili gelir; kullanıcı gitmediklerini kapatır.
        vakitler: { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true },
        yurumeDk: VARSAYILAN_YURUME_DK,
        hazirlikDk: VARSAYILAN_HAZIRLIK_DK,
        yurumeKaynagi: 'varsayilan',
        adimlar: [ekAdim(VARSAYILAN_YURUME_DK + VARSAYILAN_HAZIRLIK_DK)],
    };
}

/** Geriye uyumlu sabit (salt okunur kullanım; değiştirmeyin — `varsayilanCamiyeGitAyarlari`). */
export const VARSAYILAN_CAMIYE_GIT_AYARLARI: CamiyeGitAyarlari = varsayilanCamiyeGitAyarlari();

const nesneMi = (d: unknown): d is Record<string, unknown> => !!d && typeof d === 'object' && !Array.isArray(d);

const sinirla = (deger: unknown, min: number, max: number, yedek: number): number => {
    if (typeof deger !== 'number' || !Number.isFinite(deger)) return yedek;
    return Math.min(max, Math.max(min, Math.round(deger)));
};

/**
 * Diskten gelen ham değeri güvenli ayara çevirir + eski şekli GÖÇ ETTİRİR. ASLA fırlatmaz.
 */
export function camiyeGitAyarlariniNormalize(ham: unknown): CamiyeGitAyarlari {
    const v = varsayilanCamiyeGitAyarlari();
    if (!nesneMi(ham)) return v;
    const hamVakitler = nesneMi(ham.vakitler) ? ham.vakitler : {};
    const vakitler = { ...v.vakitler };
    for (const vakit of CAMIYE_GIT_VAKITLERI) {
        const deger = hamVakitler[vakit];
        if (typeof deger === 'boolean') vakitler[vakit] = deger;
    }
    const kaynak: YurumeKaynagi =
        ham.yurumeKaynagi === 'tahmin' || ham.yurumeKaynagi === 'elle' ? ham.yurumeKaynagi : 'varsayilan';
    const yurumeDk = sinirla(ham.yurumeDk, YURUME_MIN_DK, YURUME_MAX_DK, v.yurumeDk);
    const hazirlikDk = sinirla(ham.hazirlikDk, HAZIRLIK_MIN_DK, HAZIRLIK_MAX_DK, v.hazirlikDk);
    const ofset = camiyeGitOncedenDk({ yurumeDk, hazirlikDk });
    const adimlar = Array.isArray(ham.adimlar)
        ? adimlariNormalize(ham.adimlar, 'cikisaDogru', ofset, CAMIYE_GIT_ADIM_KISITLARI)
        : // GÖÇ: eski tek ofsetli kayıt → TEK adım, yalnız bildirim, tek atış (bugünkü plan).
          [ekAdim(ofset)];
    const sonuc: CamiyeGitAyarlari = {
        aktif: ham.aktif === true,
        vakitler,
        yurumeDk,
        hazirlikDk,
        yurumeKaynagi: kaynak,
        adimlar,
        ...(ham.sesliOnayi === true ? { sesliOnayi: true } : {}),
        ...(ham.alarmOnayi === true ? { alarmOnayi: true } : {}),
    };
    if (kaynak === 'tahmin' && typeof ham.camiAdi === 'string' && ham.camiAdi.length > 0) {
        sonuc.camiAdi = ham.camiAdi.slice(0, 120);
    }
    return sonuc;
}

/**
 * Yola çıkış süresi değişince adımların TÜMÜNÜ aynı farkla kaydırır (plan §5.2): aralıklar
 * korunur, eşikler `[1, 180]`'e kenetlenir ve kenette çakışanlar 1 dk aralıkla ayrılır
 * (tekillik — adım kaybolmaz). Fark 0 ise AYNI dizi döner.
 */
export function camiyeGitOfsetiniUygula(
    adimlar: readonly SeviyeAyari[],
    eskiOfsetDk: number,
    yeniOfsetDk: number
): SeviyeAyari[] {
    const fark = yeniOfsetDk - eskiOfsetDk;
    if (fark === 0) return adimlar as SeviyeAyari[];
    const min = CAMIYE_GIT_ESIK_MIN_DK;
    const max = CAMIYE_GIT_ESIK_MAX_DK;
    // Kronolojik = eşik AZALAN.
    const sirali = kronolojikSirala(adimlar, 'cikisaDogru').map((a) => ({
        ...a,
        esikDk: Math.min(max, Math.max(min, a.esikDk + fark)),
    }));
    // Üstten: her eşik bir öncekinden en az 1 küçük.
    for (let i = 1; i < sirali.length; i++) {
        if (sirali[i].esikDk >= sirali[i - 1].esikDk) sirali[i].esikDk = sirali[i - 1].esikDk - 1;
    }
    // Alttan: taban altına inen yukarı itilir (en fazla 3 adım → 180 tavanına sığar).
    for (let i = sirali.length - 1; i >= 0; i--) {
        const taban = i === sirali.length - 1 ? min : sirali[i + 1].esikDk + 1;
        if (sirali[i].esikDk < taban) sirali[i].esikDk = taban;
    }
    return sirali;
}

/**
 * Kısmi değişikliği ayara uygular ve normalize eder (cuma `cumaAyarlariniBirlestir` ikizi).
 * `yurumeDk`/`hazirlikDk` değişirse (ve aynı değişiklik `adimlar` taşımıyorsa) adımların
 * TÜMÜ yeni yola çıkış süresine kaydırılır. `vakitler` kısmi birleştirilir.
 */
export function camiyeGitAyarlariniBirlestir(
    mevcut: CamiyeGitAyarlari,
    degisiklik: Partial<CamiyeGitAyarlari>
): CamiyeGitAyarlari {
    // Mevcut kayıt eski/eksik şekilliyse (yükleme öncesi, eski yedek) önce göçer.
    const temel = Array.isArray(mevcut?.adimlar) && mevcut.adimlar.length > 0 ? mevcut : camiyeGitAyarlariniNormalize(mevcut);
    const yeni: CamiyeGitAyarlari = {
        ...temel,
        ...degisiklik,
        vakitler: { ...temel.vakitler, ...(degisiklik.vakitler ?? {}) },
    };
    const ofsetDegisti = degisiklik.yurumeDk !== undefined || degisiklik.hazirlikDk !== undefined;
    if (!degisiklik.adimlar && ofsetDegisti) {
        // Ofset normalize edilmiş değerlerden ölçülür (sınır dışı giriş kaymayı bozmasın).
        const once = camiyeGitAyarlariniNormalize(temel);
        const sonra = camiyeGitAyarlariniNormalize(yeni);
        yeni.adimlar = camiyeGitOfsetiniUygula(once.adimlar, camiyeGitOncedenDk(once), camiyeGitOncedenDk(sonra));
    }
    // Tahmin değilse cami adı taşınmaz (normalize de düşürür; burada açıkça).
    if (yeni.yurumeKaynagi !== 'tahmin') delete yeni.camiAdi;
    return camiyeGitAyarlariniNormalize(yeni);
}
