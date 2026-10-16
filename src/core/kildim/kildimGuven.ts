/**
 * "Kıldım" otomasyon GÜVEN LİSTESİ — JS tarafının SAF kuralları (issue #299).
 *
 * Kararın kendisi native'dedir (`cekirdek/KildimGuvenKurallari.kt`, paket başına
 * SharedPreferences): kısayol etkinliği JS'i hiç ayağa kaldırmadan karar vermek
 * zorunda. Burada yalnız köprüden gelen JSON'un savunmalı çözümü ve kullanıcıya
 * görünen metinler vardır (kibar "siz" — arayüz yönetimi, ibadet çağrısı değil).
 */

export type KildimGuvenKarari = 'izin' | 'engel';

export interface KildimGuvenKaydi {
    paket: string;
    karar: KildimGuvenKarari;
    /** Uygulamanın görünen adı (soru anında çözülüp saklanır; sonradan paket görünmeyebilir). */
    ad: string;
    zamanMs: number;
}

/**
 * `namazakisi://kildim` bağlantısını kim açtı ve ne yapılmalı?
 * - `dogrudan`: ana ekran ya da izinli uygulama → sormadan işaretle
 * - `yokSay`: engellenmiş uygulama → hiçbir şey yapma
 * - `sor`: tek seferlik soru; `herZaman`/`engel` hangi kalıcı seçeneklerin sunulacağı
 */
export interface KildimBaglantiKarari {
    eylem: 'dogrudan' | 'yokSay' | 'sor';
    /** Başlatan paket; bilinmiyorsa (iOS, uydurulabilir referrer, kimliksiz başlatan) null. */
    paket: string | null;
    ad: string;
    herZaman: boolean;
    engel: boolean;
}

/** Kimliği bilinmeyen başlatan: yalnız tek seferlik onay (iOS'ta da bu). */
export const BILINMEYEN_BASLATAN: KildimBaglantiKarari = {
    eylem: 'sor',
    paket: null,
    ad: '',
    herZaman: false,
    engel: false,
};

const kararMi = (v: unknown): v is KildimGuvenKarari => v === 'izin' || v === 'engel';

/** Köprüden gelen liste — bozuk öğe sessizce düşer, bozuk metin boş listedir (asla fırlatmaz). */
export function guvenListesiniCoz(ham: unknown): KildimGuvenKaydi[] {
    let dizi: unknown;
    try {
        dizi = typeof ham === 'string' ? JSON.parse(ham) : ham;
    } catch {
        return [];
    }
    if (!Array.isArray(dizi)) return [];
    const sonuc: KildimGuvenKaydi[] = [];
    for (const o of dizi) {
        if (!o || typeof o !== 'object') continue;
        const { paket, karar, ad, zamanMs } = o as Record<string, unknown>;
        if (typeof paket !== 'string' || !paket || !kararMi(karar)) continue;
        sonuc.push({
            paket,
            karar,
            ad: typeof ad === 'string' && ad.trim() ? ad : paket,
            zamanMs: typeof zamanMs === 'number' && Number.isFinite(zamanMs) ? zamanMs : 0,
        });
    }
    return sonuc;
}

/**
 * Köprüden gelen karar. Tanınmayan ya da bozuk yanıt GÜVENLİ tarafa düşer:
 * kimliksiz tek seferlik soru (sessiz işaretleme asla varsayılan olmaz).
 */
export function baglantiKarariniCoz(ham: unknown): KildimBaglantiKarari {
    let o: unknown;
    try {
        o = typeof ham === 'string' ? JSON.parse(ham) : ham;
    } catch {
        return BILINMEYEN_BASLATAN;
    }
    if (!o || typeof o !== 'object') return BILINMEYEN_BASLATAN;
    const { eylem, paket, ad, herZaman, engel } = o as Record<string, unknown>;
    if (eylem !== 'dogrudan' && eylem !== 'yokSay' && eylem !== 'sor') return BILINMEYEN_BASLATAN;
    const p = typeof paket === 'string' && paket ? paket : null;
    // Kimliği olmayan başlatan için "doğrudan"/"yok say" anlamsızdır → soru.
    if (!p && eylem !== 'sor') return BILINMEYEN_BASLATAN;
    return {
        eylem,
        paket: p,
        ad: typeof ad === 'string' && ad.trim() ? ad : (p ?? ''),
        herZaman: !!p && herZaman === true,
        engel: !!p && engel === true,
    };
}

/** Ayarlar listesi: önce izinliler, sonra engelliler; her grupta ada göre (native ile aynı). */
export function guvenListesiniSirala(liste: readonly KildimGuvenKaydi[]): KildimGuvenKaydi[] {
    const sira = (k: KildimGuvenKarari) => (k === 'izin' ? 0 : 1);
    return [...liste].sort(
        (a, b) =>
            sira(a.karar) - sira(b.karar) ||
            a.ad.localeCompare(b.ad, 'tr') ||
            a.paket.localeCompare(b.paket)
    );
}

// ── Metinler (kibar "siz") ──────────────────────────────────────────────────

export const kildimIzinSorusu = (uygulamaAdi: string): string =>
    `${uygulamaAdi} namazlarınızı kılındı olarak işaretleyebilsin mi?`;

export const kildimIzinAciklamasi = (vakitAdi: string): string =>
    `Şu an işaretlenecek vakit: ${vakitAdi}. Kararınızı daha sonra Ayarlar > Otomasyonlarla kullanın > Kıldım işaretleyebilen uygulamalar bölümünden değiştirebilirsiniz.`;

export const kildimTarayiciAciklamasi = (vakitAdi: string): string =>
    `Şu an işaretlenecek vakit: ${vakitAdi}. Bu istek bir tarayıcıdan geldi; her web sayfası bu bağlantıyı açabildiği için kalıcı izin verilemez.`;

export const kildimEngellendiMetni = (uygulamaAdi: string): string =>
    `${uygulamaAdi} artık namazlarınızı işaretleyemez. Ayarlardan değiştirebilirsiniz.`;

export const KILDIM_GUVEN_ETIKETLERI = {
    herZaman: 'Her zaman izin verin',
    buSefer: 'Yalnız bu sefer',
    engelle: 'Engelleyin',
} as const;

export const guvenKarariEtiketi = (karar: KildimGuvenKarari): string =>
    karar === 'izin' ? 'İzin verildi' : 'Engellendi';
