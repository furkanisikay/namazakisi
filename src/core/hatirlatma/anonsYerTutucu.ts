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
import { canli, metin } from '../dil/aktifDil';
import { sablonlar, sablonuYerellestir, type SablonListesi } from './anonsSablonlari';

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
    // Hazır şablon (herhangi bir dilde) etkin dile çevrilir; kullanıcının yazdığı metin aynen.
    let cumle = sablonuYerellestir(sablon).split('{vakit}').join(baglam.vakit).split('{süre}').join(String(baglam.sureDk));
    if (baglam.yon) cumle = cumle.split('{yön}').join(metin().anons.yon[baglam.yon]);
    return cumle
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
    const cozulmus = anonsMetniDoluMu(metin) ? anonsCoz(metin, baglam) : '';
    // Yer tutucular boşa çözülüp okunacak bir şey kalmadıysa (ör. yalnız `{etkinlik}`) otomatik
    // cümleye düşülür — sessiz kalmak "metnim çalışmıyor" hissi verirdi. (Muhafız bu yolu
    // KULLANMAZ: orada boş = sessiz, bilinçli.)
    return cozulmus.length > 0 ? cozulmus : otomatik();
}

/**
 * Önizleme/editör yardımcısı: metin dolu ve çözümü BOŞ DEĞİLSE çözülmüş hâli, aksi halde
 * `null` (çağıran otomatik cümleyi gösterir) — `adimAnonsMetni` ile aynı kural.
 */
export function cozulmusAnonsVeyaNull(metin: string | undefined, baglam: AnonsBaglami): string | null {
    if (!anonsMetniDoluMu(metin)) return null;
    const cozulmus = anonsCoz(metin, baglam);
    return cozulmus.length > 0 ? cozulmus : null;
}

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
const SABLON_LISTESI: Record<Exclude<HatirlatmaYuzeyi, 'muhafiz'>, SablonListesi> = {
    nafile: 'nafile',
    cuma: 'cuma',
    camiyeGit: 'camiyeGit',
    yatis: 'yatis',
    takvim: 'takvim',
};

/**
 * Yüzey sözlükleri, etkin dilde (canlı görünüm). Muhafızın hazır cümleleri yöne bağlıdır ve
 * `core/muhafiz/anonsMetni.ts` havuzlarından gelir; bu yüzden muhafız burada yalnız yer
 * tutucularını taşır. Çip etiketi arayüzdür, jeton (`{vakit}`) her dilde aynıdır.
 */
export const ANONS_SOZLUKLERI: Readonly<Record<HatirlatmaYuzeyi, YuzeySozlugu>> = canli((s) => {
    const c = s.anons.cip;
    const VAKIT: YerTutucu = { anahtar: '{vakit}', etiket: c.vakit };
    const SURE: YerTutucu = { anahtar: '{süre}', etiket: c.sure };
    const YON: YerTutucu = { anahtar: '{yön}', etiket: c.yon };
    const sablon = (y: Exclude<HatirlatmaYuzeyi, 'muhafiz'>) => [...sablonlar(SABLON_LISTESI[y])];
    return {
        muhafiz: { yerTutucular: [VAKIT, SURE, YON], sablonlar: [] },
        nafile: { yerTutucular: [VAKIT, SURE, YON], sablonlar: sablon('nafile') },
        cuma: { yerTutucular: [{ anahtar: '{vakit}', etiket: c.cuma }, SURE], sablonlar: sablon('cuma') },
        camiyeGit: { yerTutucular: [VAKIT, SURE], sablonlar: sablon('camiyeGit') },
        yatis: { yerTutucular: [{ anahtar: '{vakit}', etiket: c.yatsi }, SURE], sablonlar: sablon('yatis') },
        // Etkinlik adı/saati için yer tutucu YOK (gizlilik).
        takvim: { yerTutucular: [VAKIT, SURE], sablonlar: sablon('takvim') },
    };
});
