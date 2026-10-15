/**
 * Nafile hatırlatma metinleri (issue #77, #273).
 *
 * KAYIT: bu bir İBADETE ÇAĞRIDIR → "sen" dili istisnası geçerli (AGENTS.md), AMA
 * nafile GÖNÜLLÜDÜR: ton DAVETTİR. Emir kipi yalnız UYANDIRMA bildiriminde
 * ("Kalk") — alarm işlevi. "Kaçırdın", terk/suçlama dili ve "secde" YASAK;
 * nöbetçi test metinleri tarar.
 *
 * NASS SEÇİMİ (Fable incelemesi, Diyanet fetvaları):
 * - Kuşluk: Müslim, Salâtü'l-müsâfirîn 84 — Diyanet kuşluk fetvasının kaynağı.
 * - Teheccüd: Müslim, Sıyâm 202-203. İsrâ 17/79 KULLANILMAZ: Diyanet meali
 *   "kendine mahsus nâfile" der, muhatabı Hz. Peygamber'dir → kullanıcıya
 *   hedeflemek "nassı yanlış hedefe koyma" kuralını ihlal eder.
 * - Evvâbîn: nass YOK — akşam sonrası rivayeti senet bakımından zayıftır
 *   (Diyanet evvâbîn fetvası).
 *
 * Saate HAL EKİ EKLENMEZ ("11:47'ye" okunuşa göre değişir) → "… saatine kadar".
 */
import type { PencereYonu } from '../muhafiz/pencereTipleri';
import type { NafileTuru, TeheccudPenceresi } from './nafileTipleri';

const saatMetni = (t: Date): string =>
    `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;

export const NAFILE_NASLARI = {
    kusluk: '"Bunların hepsinin yerine kuşluk vaktinde kılınacak iki rekât namaz yeter." (Müslim, Salâtü\'l-müsâfirîn 84)',
    teheccud: '"Farz namazlardan sonra en faziletli namaz gece namazıdır." (Müslim, Sıyâm 202-203)',
} as const;

/**
 * Bir hatırlatma tetiğinin metin bağlamı (issue #273).
 *
 * `ilk`: bu, adımın İLK tetiği mi (tekrar değil)? Nass ve uzun metin yalnız
 * ilk tetikte gelir; tekrarlar kısadır — her tekrarda aynı hadisi okutmak
 * değerini aşındırır (cuma kuralının aynısı).
 *
 * Verilmeyen alanlar issue #273 öncesi davranışa düşer: giriş yönlü, ilk tetik,
 * teheccüd son üçte bir — eski çağrılar BİREBİR aynı metni üretir.
 */
export interface NafileMetinGirdisi {
    tur: NafileTuru;
    /** Pencerenin sonu (kuşluk: öğle−10, evvâbîn: yatsı, teheccüd: imsak). */
    son: Date;
    yon?: PencereYonu;
    ilk?: boolean;
    /** Tetikten pencere sonuna kalan dakika (teheccüdde: imsaka). */
    kalanDk?: number;
    teheccudPenceresi?: TeheccudPenceresi;
    uyandirma?: boolean;
}

interface Baglam {
    ilk: boolean;
    giris: boolean;
    dk: number;
    /** Teheccüd: "gecenin son üçte biri girdi" cümlesi DOĞRU mu? */
    sonUcteBirGirdi: boolean;
}

const baglamCoz = (g: NafileMetinGirdisi): Baglam => {
    const ilk = g.ilk ?? true;
    const giris = (g.yon ?? 'girisindenItibaren') === 'girisindenItibaren';
    return {
        ilk,
        giris,
        dk: Math.max(0, Math.round(g.kalanDk ?? 0)),
        // Yalnız son üçte bir penceresinin ilk, giriş yönlü tetiğinde doğrudur;
        // geri kalan her teheccüd tetiği imsaka kalan süreyi söyler.
        sonUcteBirGirdi: ilk && giris && (g.teheccudPenceresi ?? 'sonUcteBir') === 'sonUcteBir',
    };
};

export function nafileBildirimMetni(g: NafileMetinGirdisi): { baslik: string; govde: string } {
    const son = saatMetni(g.son);
    const { ilk, giris, dk, sonUcteBirGirdi } = baglamCoz(g);
    switch (g.tur) {
        case 'kusluk':
            if (!ilk) {
                return { baslik: 'Kuşluk vakti', govde: `Kuşluk vakti sürüyor; ${son} saatine kadar kılabilirsin.` };
            }
            return {
                baslik: 'Kuşluk vakti',
                govde: giris
                    ? `Kuşluk vakti girdi. İki rekât için güzel bir an; vakit ${son} saatine kadar sürer.\n${NAFILE_NASLARI.kusluk}`
                    : `Kuşluk vaktinin bitmesine ${dk} dakika var. İki rekât için güzel bir an; vakit ${son} saatine kadar sürer.\n${NAFILE_NASLARI.kusluk}`,
            };
        case 'evvabin':
            if (!ilk) return { baslik: 'Evvâbîn', govde: `Evvâbîn için vakit sürüyor. Yatsı vakti ${son}.` };
            return {
                baslik: 'Evvâbîn',
                govde: giris
                    ? `Akşam namazından sonra evvâbîn için güzel bir an. Yatsı vakti ${son}.`
                    : `Evvâbîn için ${dk} dakika var. Yatsı vakti ${son}.`,
            };
        case 'teheccud':
            if (g.uyandirma) {
                return {
                    baslik: 'Teheccüd vakti',
                    govde: sonUcteBirGirdi
                        ? `Kalk; gecenin son üçte biri girdi. İmsak vakti ${son}.\n${NAFILE_NASLARI.teheccud}`
                        : `Kalk; imsaka ${dk} dakika kaldı. İmsak vakti ${son}.`,
                };
            }
            return sonUcteBirGirdi
                ? {
                    baslik: 'Gecenin son üçte biri',
                    govde: `Teheccüd için en bereketli saatler. İmsak vakti ${son}.\n${NAFILE_NASLARI.teheccud}`,
                }
                : {
                    baslik: 'Teheccüd vakti',
                    govde: `İmsaka ${dk} dakika kaldı. Teheccüd için güzel bir vakit.`,
                };
    }
}

/**
 * SESLİ ANONS cümlesi (issue #273) — telefonun sesli okuyacağı KISA metin.
 *
 * Nafilede anons metni serbestçe yazılmaz (muhafızın `{vakit}` şablonları farz
 * vaktine kurulu); cümle bağlamdan üretilir ve yer tutucu İÇERMEZ — teslimci
 * metni `anonsMetniniCoz`'dan geçirir, metin değişmeden kalır. Nass okunmaz
 * (kısa tutulur), saat okunmaz (TTS "05:42"yi tutarsız okur).
 */
export function nafileAnonsMetni(g: NafileMetinGirdisi): string {
    const { ilk, giris, dk, sonUcteBirGirdi } = baglamCoz(g);
    switch (g.tur) {
        case 'kusluk':
            if (!ilk) return 'Kuşluk vakti sürüyor.';
            return giris ? 'Kuşluk vakti girdi. İki rekât için güzel bir an.' : `Kuşluk vaktinin bitmesine ${dk} dakika var.`;
        case 'evvabin':
            if (!ilk) return 'Evvâbîn için vakit sürüyor.';
            return giris ? 'Evvâbîn vakti. İki rekât için güzel bir an.' : `Evvâbîn için ${dk} dakika var.`;
        case 'teheccud':
            return sonUcteBirGirdi
                ? 'Teheccüd vakti. Gecenin son üçte biri girdi.'
                : `Teheccüd vakti. İmsaka ${dk} dakika kaldı.`;
    }
}

/** Gösterge şeridi ve kart açıklamaları (arayüz dili — kibar "siz"). */
export const NAFILE_ACIKLAMALARI: Record<NafileTuru, string> = {
    kusluk:
        'Güneş doğduktan yaklaşık 45 dakika sonra başlar, öğle vaktine 10 dakika kalana kadar sürer. İşrak, kuşluğun ilk vaktidir; en faziletlisi gündüzün ilk dörtte biri geçtikten sonradır.',
    evvabin: 'Akşam namazından sonra, yatsı vaktine kadar kılınır.',
    teheccud:
        'Yatsıdan sonra uyuyup kalktıktan sonra, imsaka kadar kılınır. En faziletli zamanı gecenin son üçte biridir.',
};
