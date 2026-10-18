/**
 * SESLİ OKUMA METNİ — YER TUTUCULAR ve YÜZEY SÖZLÜKLERİ (SAF; birleşik hatırlatma modülü
 * plan §3.4).
 *
 * Sesli okuma metni artık HER hatırlatma yüzeyinde düzenlenebilir. Metin bir şablondur:
 * `{vakit}`, `{süre}` ve (yön taşıyan yüzeylerde) `{yön}` okunurken yüzeyin kendi bağlamıyla
 * doldurulur. Çözüm PLANLAYICIDA yapılır — teslimciye giden metin YER TUTUCUSUZDUR
 * (teslimcinin `anonsMetniniCoz` çağrısı muhafız vaktini bilir; cumada "Öğle", nafilede
 * sahte bir vakit okurdu).
 *
 * BOŞ METİN: ek yüzeylerde ve nafilede "Otomatik cümle"dir (yüzeyin bugünkü bağlamsal
 * cümlesi → eski kayıtlar birebir aynı plan). MUHAFIZDA boş metin SESSİZDİR (bugünkü
 * teslimci davranışı) — muhafız bu çözücüyü kullanmaz, kendi `anonsMetniniCoz`'unu kullanır.
 *
 * GİZLİLİK: takvim yüzeyinin bağlamında etkinlik ADI/SAATİ YOKTUR — `AnonsBaglami` tipi
 * etkinlik alanı taşımaz, sözlükte de böyle bir yer tutucu bulunmaz. Kullanıcı `{etkinlik}`
 * yazsa bile bilinmeyen yer tutucu BOŞA çözülür.
 *
 * Bu dosya hiçbir modül import etmez (yalnız tip): planlayıcılar ve ekran aynı çözücüyü
 * kullanır, döngüsel bağımlılık doğmaz.
 */
import type { PencereYonu } from '../muhafiz/pencereTipleri';

/** Hatırlatma yüzeyleri (ekran ve sözlük ayrımı). */
export type HatirlatmaYuzeyi = 'muhafiz' | 'nafile' | 'cuma' | 'camiyeGit' | 'yatis' | 'takvim';

/** Editörde çip olarak eklenen yer tutucu. */
export interface YerTutucu {
    anahtar: '{vakit}' | '{süre}' | '{yön}';
    /** Çip etiketi ("Vakit adı"); erişim etiketi "Ekleyin: <etiket>". */
    etiket: string;
}

/**
 * Çözüm bağlamı. Kasten DAR: yalnız okunacak vakit adı, dakika ve (varsa) yön. Etkinlik
 * adı/saati gibi kişisel veri bu tipe GİRMEZ (takvim gizlilik kuralı).
 */
export interface AnonsBaglami {
    /** Okunan ad ("Öğle", "Kuşluk", "Cuma"). */
    vakit: string;
    /** Okunan dakika (yüzeyin ölçüsü: kalan / geçen). */
    sureDk: number;
    /** Yön taşıyan yüzeylerde `{yön}` → "kaldı" / "geçti". */
    yon?: PencereYonu;
}

const YON_IFADESI: Record<PencereYonu, string> = {
    cikisaDogru: 'kaldı',
    girisindenItibaren: 'geçti',
};

/** Bir metin yer tutucu içeriyor mu? (bilinen ya da bilinmeyen) */
const YER_TUTUCU = /\{[^{}]*\}/g;

/**
 * Şablonu okunacak cümleye çevirir. Bilinmeyen `{…}` BOŞA indirgenir (TTS "süslü parantez"
 * okumasın); doğan çift boşluk ve noktalama öncesi boşluk temizlenir.
 *
 * Metne başka hiçbir dönüşüm uygulanmaz — büyük/küçük harf DEĞİŞTİRİLMEZ (Türkçe `İ`
 * tuzağı: `toUpperCase`/`toLowerCase` kullanılmaz).
 */
export function anonsCoz(sablon: string, baglam: AnonsBaglami): string {
    let metin = sablon.split('{vakit}').join(baglam.vakit).split('{süre}').join(String(baglam.sureDk));
    if (baglam.yon) metin = metin.split('{yön}').join(YON_IFADESI[baglam.yon]);
    return metin
        .replace(YER_TUTUCU, '')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/[ \t]+([.,;:!?])/g, '$1')
        .trim();
}

/**
 * Kullanıcının yazdığı metin dolu mu? Boşluktan ibaret metin BOŞ sayılır (teslimcinin
 * `trim()` kapısıyla aynı kural) → ek yüzeyde otomatik cümle okunur.
 */
export const anonsMetniDoluMu = (metin: string | undefined | null): metin is string =>
    typeof metin === 'string' && metin.trim().length > 0;

/**
 * Planlayıcı yardımcısı: adımın metni doluysa çözülmüş hâli, boşsa yüzeyin OTOMATİK cümlesi.
 * Otomatik cümle tembel üretilir (dolu metinde hiç hesaplanmaz).
 */
export function adimAnonsMetni(metin: string | undefined, baglam: AnonsBaglami, otomatik: () => string): string {
    return anonsMetniDoluMu(metin) ? anonsCoz(metin, baglam) : otomatik();
}

const VAKIT: YerTutucu = { anahtar: '{vakit}', etiket: 'Vakit adı' };
const SURE: YerTutucu = { anahtar: '{süre}', etiket: 'Dakika' };
const YON: YerTutucu = { anahtar: '{yön}', etiket: 'kaldı / geçti' };

export interface YuzeySozlugu {
    yerTutucular: YerTutucu[];
    /**
     * Hazır cümleler (yön taşımayan yüzeylerde sabit). Kurallar (AGENTS.md): ibadete çağrı
     * kaydında "sen" + emir (muhafız, cuma, camiye, yatış); takvim UYGULAMA dilinde (kibar
     * "siz"); "secde", "terk" ve vakte özgü nass YOK — nöbetçi test tarar.
     */
    sablonlar: string[];
}

/**
 * Yüzey sözlükleri. Muhafızın hazır cümleleri yöne bağlıdır ve `core/muhafiz/anonsMetni.ts`
 * havuzlarından gelir (diskte YAZILI duran metinler — orada birebir korunur); bu yüzden
 * muhafız burada yalnız yer tutucularını taşır.
 */
export const ANONS_SOZLUKLERI: Record<HatirlatmaYuzeyi, YuzeySozlugu> = {
    muhafiz: { yerTutucular: [VAKIT, SURE, YON], sablonlar: [] },
    nafile: {
        yerTutucular: [VAKIT, SURE, YON],
        sablonlar: [
            '{vakit} vakti, {süre} dakika {yön}. İki rekât için güzel bir an.',
            '{vakit} vakti sürüyor. İki rekât kılmak için güzel bir fırsat.',
            '{vakit} için {süre} dakika {yön}.',
        ],
    },
    cuma: {
        yerTutucular: [{ anahtar: '{vakit}', etiket: 'Cuma' }, SURE],
        sablonlar: [
            'Cuma namazına {süre} dakika kaldı. Hazırlan, camiye yola çık.',
            'Cuma vakti yaklaşıyor, {süre} dakika kaldı.',
            'Hutbeye yetiş, cumaya {süre} dakika kaldı.',
        ],
    },
    camiyeGit: {
        yerTutucular: [VAKIT, SURE],
        sablonlar: [
            '{vakit} vaktine {süre} dakika kaldı. Camiye yola çık.',
            'Camiye gitme zamanı, {vakit} vaktine {süre} dakika var.',
            '{vakit} namazı için camiye yola çık.',
        ],
    },
    yatis: {
        yerTutucular: [{ anahtar: '{vakit}', etiket: 'Yatsı' }, SURE],
        sablonlar: [
            'Yatmadan önce yatsıyı kıl.',
            'Yatsı vakti sürüyor, uyumadan önce namaza dur.',
            'Yatsıyı kılmadan uyuma.',
        ],
    },
    takvim: {
        // Etkinlik adı/saati için yer tutucu YOK (gizlilik).
        yerTutucular: [VAKIT, SURE],
        sablonlar: [
            'Takviminizdeki bir etkinlik {vakit} vaktine denk geliyor.',
            '{vakit} vakti bir etkinlikle çakışıyor; önce kılmayı unutmayın.',
            'Etkinliğinize {süre} dakika var; {vakit} namazını unutmayın.',
        ],
    },
};
