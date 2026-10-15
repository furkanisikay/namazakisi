/**
 * iOS Siri / Kısayollar / Spotlight kararları (issue #279) — SAF.
 *
 * App Intents (Swift, ana uygulama hedefi) uygulama JS'i çalışmadan cevap verir:
 * "Sıradaki namaz ne zaman?", "Şu anki vakti kıldım". Veriyi JS önceden yazar —
 * ANDROID WIDGET YÜKÜNÜN AYNISI (`core/widget/widgetYuku.ts`): dün + 8 günlük vakit
 * çizelgesi ve dün + bugünün kılınmışlığı. iOS'ta `WidgetServisi` aynı yükü
 * `UserDefaults`'a yazar (`modules/expo-siri-kisayollari`).
 *
 * BU DOSYA SWIFT'TEKİ `VakitKarari.swift`'İN İKİZİDİR. Vakit kararı
 * (`aktifVakitBul`) zaten Kotlin ile ortak fikstürle kilitli
 * (`android/app/src/test/resources/widget-ornek.json`); Siri'ye özgü karar ve
 * metinler ayrıca `modules/expo-siri-kisayollari/test/siri-ornek.json` ile
 * kilitlenir — JS testi ve Swift test koşucusu AYNI dosyayı okur. Kural ya da
 * metin değişirse ÜÇÜNÜ (TS + Swift + fikstür) birlikte değiştir.
 *
 * Metinler ARAYÜZ kaydındadır (kibar "siz"): Siri cevabı ibadete çağrı değil,
 * kullanıcının sorduğu bir soruya verilen bilgidir. Saate hal eki EKLENMEZ
 * ("15:42'de" okunuşa göre değişir — AGENTS.md); "saat 15:42" yazılır.
 */
import {
    aktifVakitBul,
    widgetKoduNamazAdina,
    widgetKoduVakitAdina,
    type AktifVakitDurumu,
    type WidgetVakitAni,
    type WidgetVakitKodu,
} from '../widget/widgetYuku';

/** Kuyrukta bekleyen (henüz uygulamada işlenmemiş) "Kıldım" — kayıt vakit kodu (`imsak`…). */
export interface SiriBekleyenKildim {
    tarih: string;
    vakit: string;
}

export type SiriKildimKarari =
    | { tur: 'aday'; vakit: WidgetVakitAni; kayitVakti: string; ad: string }
    | { tur: 'zatenKilindi'; ad: string }
    | { tur: 'vakitYok'; siradaki: WidgetVakitAni | null };

/** Widget kodu → görünen ad ("Öğle"); güneş için boş dize (namaz değildir). */
export const vakitGorunenAdi = (kod: WidgetVakitKodu): string => widgetKoduNamazAdina(kod) ?? '';

/** Aktif vakit kılındı mı (kayıt VEYA kuyrukta bekleyen işaretleme)? */
function kilindiMi(
    vakit: WidgetVakitAni,
    kilinanlar: Readonly<Record<string, readonly string[]>>,
    bekleyenler: readonly SiriBekleyenKildim[]
): boolean {
    if ((kilinanlar[vakit.tarih] ?? []).includes(vakit.vakit)) return true;
    const kayitVakti = widgetKoduVakitAdina(vakit.vakit);
    return bekleyenler.some((b) => b.tarih === vakit.tarih && b.vakit === kayitVakti);
}

/**
 * "Şu anki vakti kıldım" kararı. Vakit seçimi widget/kutu/saat ile AYNI kuraldır
 * (`aktifVakitBul`): güneş→öğle arasında işaretlenecek vakit yoktur, gece
 * yarısından sonra yatsı DÜNÜN namaz günüdür.
 */
export function siriKildimKarari(
    vakitler: readonly WidgetVakitAni[],
    kilinanlar: Readonly<Record<string, readonly string[]>>,
    bekleyenler: readonly SiriBekleyenKildim[],
    simdiMs: number
): SiriKildimKarari {
    const durum = aktifVakitBul(vakitler, simdiMs);
    const aktif = durum.aktif;
    const kayitVakti = aktif ? widgetKoduVakitAdina(aktif.vakit) : null;
    if (!aktif || !kayitVakti) return { tur: 'vakitYok', siradaki: durum.sonraki };
    const ad = vakitGorunenAdi(aktif.vakit);
    if (kilindiMi(aktif, kilinanlar, bekleyenler)) return { tur: 'zatenKilindi', ad };
    return { tur: 'aday', vakit: aktif, kayitVakti, ad };
}

/** `HH:mm` biçimleyici — saat dilimi çağıranındır (Swift: cihaz, test: sabit +03:00). */
export type SaatBicimleyici = (ms: number) => string;

/** Veri hiç yokken (uygulama hiç açılmamış / konum yok) verilen cevap. */
export const SIRI_KONUM_YOK_METNI = 'Vakitleri hesaplayabilmek için uygulamayı açıp konumunuzu ayarlayın.';

/** Çizelge tükenmişken (uygulama ~bir haftadır açılmamış) verilen cevap. */
export const SIRI_VERI_ESKI_METNI = 'Vakit bilgisi eskimiş. Güncellemek için uygulamayı bir kez açın.';

const girisMetni = (v: WidgetVakitAni, bugun: string, saat: SaatBicimleyici): string =>
    `${v.tarih > bugun ? 'yarın ' : ''}saat ${saat(v.ms)}`;

/**
 * "Sıradaki namaz ne zaman?" cevabı.
 *
 * İçinde bulunulan vakit henüz kılınmadıysa önce o söylenir (soran çoğu zaman
 * "ne kadar vaktim var?" diye sorar); kılındıysa yalnız sıradaki.
 *
 * @param bugun Cihazın TAKVİM günü (ISO). "yarın" kararı vaktin namaz günüyle
 *   karşılaştırılarak verilir: gece yarısından sonra sıradaki sabah BUGÜNdür.
 */
export function siradakiNamazMetni(
    durum: AktifVakitDurumu,
    kilinanlar: Readonly<Record<string, readonly string[]>>,
    bekleyenler: readonly SiriBekleyenKildim[],
    bugun: string,
    saat: SaatBicimleyici
): string {
    const parcalar: string[] = [];
    if (durum.aktif && durum.bitisMs != null && !kilindiMi(durum.aktif, kilinanlar, bekleyenler)) {
        const ad = vakitGorunenAdi(durum.aktif.vakit);
        // Çıkış sıradaki namazın girişiyle aynıysa (öğle→ikindi) saat iki kez okunmaz;
        // farklıysa (sabah güneşte biter, sıradaki öğle) çıkış ayrıca söylenir.
        parcalar.push(
            durum.sonraki?.ms === durum.bitisMs
                ? `Şu an ${ad} vakti.`
                : `Şu an ${ad} vakti, çıkışı saat ${saat(durum.bitisMs)}.`
        );
    }
    if (durum.sonraki) {
        parcalar.push(
            `Sıradaki namaz ${vakitGorunenAdi(durum.sonraki.vakit)}, ${girisMetni(durum.sonraki, bugun, saat)}.`
        );
    }
    return parcalar.length > 0 ? parcalar.join(' ') : SIRI_VERI_ESKI_METNI;
}

/** "Kıldım" sonucu metni — `useKildimDerinBaglantisi.kildimSonucMetni` ile aynı dil. */
export function siriKildimMetni(
    karar: SiriKildimKarari,
    bugun: string,
    saat: SaatBicimleyici
): string {
    switch (karar.tur) {
        case 'aday':
            return `${karar.ad} namazınız kılındı olarak işaretlendi.`;
        case 'zatenKilindi':
            return `${karar.ad} namazı zaten kılındı olarak işaretli.`;
        case 'vakitYok':
            return karar.siradaki
                ? `Şu an kılınacak vakit yok. Sıradaki ${vakitGorunenAdi(karar.siradaki.vakit)}, ${girisMetni(karar.siradaki, bugun, saat)}.`
                : 'Şu an kılınacak vakit yok.';
    }
}

/** Siri'nin onay sorusu (`requestConfirmation`). */
export const siriKildimOnayMetni = (ad: string): string => `${ad} namazı kılındı olarak işaretlensin mi?`;
