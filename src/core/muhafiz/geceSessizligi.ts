/**
 * GECE SESSİZLİĞİ (persona çalışması 2026-10-19, sahip kararı) — SAF, TEK KURAL.
 *
 * Gece başlangıcından (varsayılan 23:00) imsağa kadar muhafız ("vakit çıkmadan")
 * uyarıları GELMEZ. Gerekçe uykudur: yatsının çıkışı imsak olduğu için çıkış yönlü yatsı
 * uyarıları gece 02:00–05:00 arasına düşüyor, kullanıcıyı ve ev halkını uyandırıyordu.
 *
 * KURAL TEK YERDE (`ertelemeSusturuyorMu` emsali) ve DÖRT tüketici aynı fonksiyondan geçer:
 *   - arka plan planı + bildirim defteri → `vakitTeslimAdaylari` (`muhafizTeslimPlani.ts`)
 *   - ön plan banner/ses/anons → `NamazMuhafiziServisi.kontrolEt`
 *   - saatin hazır planı → `wearMuhafizPlaniOlustur`
 * Ayrışırlarsa ekran "gece sessiz" derken telefon ya da saat konuşur.
 *
 * Pencere VAKTİN NAMAZ GÜNÜNE (`tarih`) kurulur: başlangıç o günün HH:MM'i (saat 12'den
 * küçükse ertesi takvim günü), bitiş vaktin kendi çıkışıdır — yatsı için o da imsaktır.
 * Muhafızın hiçbir uyarısı kendi vaktinin çıkışını geçmediği için ayrı bir "imsak" sınırı
 * gerekmez; ertesi sabahın uyarıları ertesi namaz gününe aittir ve pencereye girmez.
 *
 * GERÇEK ALARM MUAFTIR: alarm kullanıcının bilerek kurduğu uyandırmadır (rızalı, issue #74).
 *
 * YATSI ÇAPASI (sahip kararı 2026-10-19): sessizlik açıkken yatsının ETKİN çıkışı
 * `min(gerçek çıkış, sessizlik başlangıcı)`dır (`geceSessizliginePencereyiUyarla`) — eşikler
 * (25/10/3) o ana göre kurulur, kişi yatmadan önce uyarılır (23:00 → 22:35/22:50/22:57).
 * Yatsı sessizlikten SONRA giriyorsa (yaz / yüksek enlem) pencere DÜŞER (`null`) ve ekran
 * bunu söyler. Arka plan, ön plan, defter ve saat AYNI etkin pencereyi kullanır → kimlik
 * (`muhafizBildirimIdOlustur`, kalanDk etkin çıkışa göre) dört yerde aynıdır.
 */

import { GECE_CAPASI_ANONS_SABLONU } from '../utils/muhafizMetinYardimcisi';

export interface GeceSessizligi {
    aktif: boolean;
    /** Başlangıç saati (0–23). 12'den küçükse gece yarısından SONRA başlar. */
    baslangicSaat: number;
    baslangicDakika: number;
}

/** Yeni kurulumun değeri (sihirbaz yazar). Mevcut kayıtta alan yoksa KAPALI sayılır. */
export const VARSAYILAN_GECE_SESSIZLIGI: GeceSessizligi = { aktif: true, baslangicSaat: 23, baslangicDakika: 0 };

/** Ekrandaki başlangıç seçenekleri (dakika adımı 30; 21:00 … 01:00). */
export const GECE_BASLANGIC_SECENEKLERI: readonly { saat: number; dakika: number }[] = [
    { saat: 21, dakika: 0 },
    { saat: 21, dakika: 30 },
    { saat: 22, dakika: 0 },
    { saat: 22, dakika: 30 },
    { saat: 23, dakika: 0 },
    { saat: 23, dakika: 30 },
    { saat: 0, dakika: 0 },
    { saat: 0, dakika: 30 },
    { saat: 1, dakika: 0 },
];

const tamSayiMi = (x: unknown, min: number, max: number): x is number =>
    typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max;

/**
 * Diskten gelen değeri doğrular. Alan yoksa ya da bozuksa `undefined` (= KAPALI): mevcut
 * kullanıcı göçle sessizliğe ALINMAZ (sahip kararı; ekranda öneri satırı var).
 */
export function geceSessizliginiNormalize(ham: unknown): GeceSessizligi | undefined {
    if (!ham || typeof ham !== 'object') return undefined;
    const h = ham as Partial<GeceSessizligi>;
    if (typeof h.aktif !== 'boolean') return undefined;
    return {
        aktif: h.aktif,
        baslangicSaat: tamSayiMi(h.baslangicSaat, 0, 23) ? h.baslangicSaat : VARSAYILAN_GECE_SESSIZLIGI.baslangicSaat,
        baslangicDakika: tamSayiMi(h.baslangicDakika, 0, 59) ? h.baslangicDakika : 0,
    };
}

/** `YYYY-MM-DD` namaz günü için sessizliğin başladığı an (yerel saat). */
export function geceBaslangicMs(namazGunu: string, ayar: Pick<GeceSessizligi, 'baslangicSaat' | 'baslangicDakika'>): number {
    const [y, a, g] = namazGunu.split('-').map(Number);
    // Öğleden önceki bir saat "gece yarısından sonra" demektir → ertesi takvim günü.
    const gunEki = ayar.baslangicSaat < 12 ? 1 : 0;
    return new Date(y, a - 1, g + gunEki, ayar.baslangicSaat, ayar.baslangicDakika, 0, 0).getTime();
}

/**
 * Bu tetik gece sessizliğine mi düşüyor? `namazGunu` vaktin AİT OLDUĞU gündür (gece
 * yarısından sonraki yatsı DÜNÜNDÜR). Gerçek alarm (`alarm === true`) asla susmaz.
 */
export function geceSessizligiSusturuyorMu(
    ayar: GeceSessizligi | null | undefined,
    namazGunu: string,
    tetikMs: number,
    alarm?: boolean
): boolean {
    if (!ayar?.aktif || alarm === true) return false;
    return tetikMs >= geceBaslangicMs(namazGunu, ayar);
}

/** Gece sessizliğinin uyarladığı pencere (vakit adı + namaz günü + giriş/çıkış). */
export interface SessizlikPenceresi {
    vakit: string;
    tarih: string;
    giris?: Date;
    cikis: Date;
    /** Uyarlama sonucu: çıkış sessizlik başlangıcına çekildi (metin/ton çapa dilinde). */
    geceCapasi?: true;
}

/**
 * Yatsının ETKİN penceresi. Sessizlik kapalıysa, vakit yatsı değilse ya da sessizlik
 * çıkıştan sonra başlıyorsa AYNI nesne döner (plan birebir eskisi). Yatsı sessizlikten
 * sonra (ya da tam o anda) giriyorsa `null` (o gecenin yatsı hatırlatması yok).
 * Giriş bilinmiyorsa (eski kayıt) sessizlikten önce girdiği varsayılır.
 */
export function geceSessizliginePencereyiUyarla<T extends SessizlikPenceresi>(
    ayar: GeceSessizligi | null | undefined,
    pencere: T
): (T & { geceCapasi?: true }) | null {
    if (!ayar?.aktif || pencere.vakit !== 'yatsi') return pencere;
    const bas = geceBaslangicMs(pencere.tarih, ayar);
    if (bas >= pencere.cikis.getTime()) return pencere;
    if (pencere.giris && pencere.giris.getTime() >= bas) return null;
    return { ...pencere, cikis: new Date(bas), geceCapasi: true };
}

/**
 * Çapalı pencerenin UYARISI: acil ton ve acil kanal YOK (acil penceresi gerçek çıkışa
 * göredir; çapalı adım Rahatsız Etmeyin'i delmez), ton en fazla "uyarı" (2) — iOS'ta
 * kesinti seviyesi de buna bağlı. Sesli okuma çapa şablonunu okur. Ton kimliğin
 * parçası olduğu için (`muhafizBildirimIdOlustur`) bu uyarlama arka plan, ön plan ve
 * saatte AYNI fonksiyondan yapılır. Gerçek alarm alanına dokunulmaz.
 */
export function geceCapasiUyarisi<
    U extends { seviye: number; acilKanal?: boolean; anonsMetni: string; kalanDk?: number; olcuDk?: number },
>(uyari: U): U {
    return {
        ...uyari,
        // Çapa şablonunun {süre}'si sessizliğe KALAN dakikadır. Teslimci/saat anonsu
        // `olcuDk` ile çözer; giriş yönlü yatsıda olcuDk "girişten geçen" olurdu → eşitlenir.
        // (Çıkış yönünde ikisi zaten aynıdır; başlık/gövde çapa metninden gelir.)
        ...(typeof uyari.kalanDk === 'number' ? { olcuDk: uyari.kalanDk } : {}),
        seviye: Math.min(uyari.seviye, GECE_CAPASI_EN_SERT_TON),
        acilKanal: false,
        anonsMetni: GECE_CAPASI_ANONS_SABLONU,
    };
}

/** Çapalı adımın en sert tonu (2 = "uyarı"; 3 sert ve 4 acil "vakit çıkıyor" dilidir). */
export const GECE_CAPASI_EN_SERT_TON = 2;

/** Ekran metni: "23:00" */
export function geceBaslangicMetni(ayar: Pick<GeceSessizligi, 'baslangicSaat' | 'baslangicDakika'>): string {
    return `${String(ayar.baslangicSaat).padStart(2, '0')}:${String(ayar.baslangicDakika).padStart(2, '0')}`;
}
