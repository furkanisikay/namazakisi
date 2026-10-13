/**
 * "Camide kılacağım" hatırlatması ayarları — SAF (issue #292).
 *
 * Cuma hatırlatmasının (issue #173) genelleşmiş hâli: seçilen her vakit için
 * ezandan (vaktin GİRİŞİNDEN) `yurumeDk + hazirlikDk` dakika önce TEK bir
 * hatırlatma. Cuma bu motora TAŞINMADI (riskli göç); yalnız desen paylaşılır.
 *
 * VARSAYILAN KAPALI: camiye gitmek kişinin tercihidir; ayardan açılır.
 * Normalize hem disk okumasında hem yazımında koşar (bozuk kayıt planlamayı bozmasın).
 */

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
    /** Abdest/giyinme payı (dk). Ofset = yürüme + hazırlık. */
    hazirlikDk: number;
    yurumeKaynagi: YurumeKaynagi;
    /** Tahminin hesaplandığı caminin adı (yalnız `tahmin` kaynağında anlamlı). */
    camiAdi?: string;
}

export const YURUME_MIN_DK = 1;
export const YURUME_MAX_DK = 90;
export const HAZIRLIK_MIN_DK = 0;
export const HAZIRLIK_MAX_DK = 60;
export const HAZIRLIK_ADIM_DK = 5;

export const VARSAYILAN_CAMIYE_GIT_AYARLARI: CamiyeGitAyarlari = {
    aktif: false,
    // Açılınca beş vakit seçili gelir; kullanıcı gitmediklerini kapatır.
    vakitler: { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true },
    yurumeDk: 10,
    hazirlikDk: 5,
    yurumeKaynagi: 'varsayilan',
};

const nesneMi = (d: unknown): d is Record<string, unknown> => !!d && typeof d === 'object' && !Array.isArray(d);

const sinirla = (deger: unknown, min: number, max: number, yedek: number): number => {
    if (typeof deger !== 'number' || !Number.isFinite(deger)) return yedek;
    return Math.min(max, Math.max(min, Math.round(deger)));
};

/** Diskten gelen ham değeri güvenli ayara çevirir. ASLA fırlatmaz. */
export function camiyeGitAyarlariniNormalize(ham: unknown): CamiyeGitAyarlari {
    const v = VARSAYILAN_CAMIYE_GIT_AYARLARI;
    if (!nesneMi(ham)) return { ...v, vakitler: { ...v.vakitler } };
    const hamVakitler = nesneMi(ham.vakitler) ? ham.vakitler : {};
    const vakitler = { ...v.vakitler };
    for (const vakit of CAMIYE_GIT_VAKITLERI) {
        const deger = hamVakitler[vakit];
        if (typeof deger === 'boolean') vakitler[vakit] = deger;
    }
    const kaynak: YurumeKaynagi =
        ham.yurumeKaynagi === 'tahmin' || ham.yurumeKaynagi === 'elle' ? ham.yurumeKaynagi : 'varsayilan';
    const sonuc: CamiyeGitAyarlari = {
        aktif: ham.aktif === true,
        vakitler,
        yurumeDk: sinirla(ham.yurumeDk, YURUME_MIN_DK, YURUME_MAX_DK, v.yurumeDk),
        hazirlikDk: sinirla(ham.hazirlikDk, HAZIRLIK_MIN_DK, HAZIRLIK_MAX_DK, v.hazirlikDk),
        yurumeKaynagi: kaynak,
    };
    if (kaynak === 'tahmin' && typeof ham.camiAdi === 'string' && ham.camiAdi.length > 0) {
        sonuc.camiAdi = ham.camiAdi.slice(0, 120);
    }
    return sonuc;
}

/** Ezandan kaç dakika önce hatırlatılır (en az 1). */
export const camiyeGitOncedenDk = (a: Pick<CamiyeGitAyarlari, 'yurumeDk' | 'hazirlikDk'>): number =>
    Math.max(1, a.yurumeDk + a.hazirlikDk);
