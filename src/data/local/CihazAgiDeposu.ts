/**
 * Cihaz ağı üyelikleri — telefon tarafı (TV'ler; ileride tablet). `expo-secure-store`'da
 * (`GuvenliDepo`): üyeye özel anahtar DÜZ AsyncStorage'a yazılmaz, yedeğe girmez, başka
 * cihaza taşınmaz → telefon değişince "yeniden eşleştirin". Store'a bağlı DEĞİL (arka plan
 * görevinde Redux yok).
 *
 * Anahtar adları secure-store kuralına uyar (`[A-Za-z0-9._-]`): liste `cihazAgi.liste`,
 * kayıt `cihazAgi.u.<alıcıKimlik>`. Kayıt küçük (< 600 B; secure-store sınırının altında).
 */
import { GuvenliDepo } from './GuvenliDepo';
import { Depolama } from './Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

/** `tv`: yalnız alıcı pano. `tablet` / `telefon`: çift yönlü eş (karşı cihazın türü). */
export type CihazTuru = 'tv' | 'tablet' | 'telefon';

export interface CihazUyeligi {
    tur: CihazTuru;
    aliciKimlik: string;
    aliciAdi: string;
    /** Bu telefonun o cihazdaki üye kimliği. */
    uye: string;
    /** 32 bayt üye anahtarı, base64. */
    anahtar: string;
    /** Son bilinen yerel adres (yalnız başarılı şifreli el sıkışmadan sonra güncellenir). */
    adres: string;
    port: number;
    /** Son kullanılan sayaç; bir sonraki gönderim n + 1 (önce diske yazılır). */
    n: number;
    /** "TV'de durumum sayılsın" — kişi başına, varsayılan KAPALI (sahip kararı). */
    durumumSayilsin: boolean;
    /** TV'deki sessiz vakit bandı açık mı (yalnız durum sayılıyorsa anlamlı). */
    tvHatirlat: boolean;
    eklenmeMs: number;
    sonEsitlemeMs: number;
    /** 'reddedildi': cihaz bu telefonu kaldırmış ya da anahtar tutmuyor → yeniden eşleştirme. */
    durum: 'tamam' | 'ulasilamadi' | 'reddedildi';
    /** Üstel geri çekilme (TV kapalıyken her tetikte soket + keşif masrafı ödenmesin). Opsiyonel: eski kayıt. */
    sonHataMs?: number;
    hataSayisi?: number;
    /** Çift yönlü eş: karşının olay günlüğümüzden bildiği aralık (son yanıttan). */
    karsiBilinen?: Record<string, number>;
    /** Çift yönlü eş: bu eşten kabul edilen son sayaç (tekrar koruması). */
    sonGelenN?: number;
}

const LISTE = 'cihazAgi.liste';
const kayitAnahtari = (k: string) => `cihazAgi.u.${k}`;
const KIMLIK = /^[0-9a-f]{16}$/;

async function listeOku(): Promise<string[]> {
    try {
        const ham = await GuvenliDepo.oku(LISTE);
        const dizi = ham ? (JSON.parse(ham) as unknown) : [];
        return Array.isArray(dizi) ? dizi.filter((x): x is string => typeof x === 'string' && KIMLIK.test(x)) : [];
    } catch {
        return [];
    }
}

function gecerliMi(o: unknown): o is CihazUyeligi {
    const k = o as Partial<CihazUyeligi> | null;
    return (
        !!k &&
        (k.tur === 'tv' || k.tur === 'tablet' || k.tur === 'telefon') &&
        typeof k.aliciKimlik === 'string' &&
        KIMLIK.test(k.aliciKimlik) &&
        typeof k.uye === 'string' &&
        typeof k.anahtar === 'string' &&
        typeof k.adres === 'string' &&
        typeof k.port === 'number' &&
        typeof k.n === 'number'
    );
}

/**
 * Sırsız gölge (AsyncStorage): güvenli depo sessizce boşalırsa (Keystore anahtarı kaybolunca
 * `expo-secure-store` kaydı kendisi siler ve `null` döner) kullanıcıya "okunamadı" denebilsin.
 * Yalnız kimlik, ad ve tür; anahtar ve adres YOK.
 */
export interface GolgeKaydi {
    kimlik: string;
    ad: string;
    tur: CihazTuru;
}

async function golgeOku(): Promise<GolgeKaydi[] | null> {
    const g = await Depolama.oku<GolgeKaydi[]>(DEPOLAMA_ANAHTARLARI.CIHAZ_AGI_GOLGESI).catch(() => null);
    return Array.isArray(g) ? g.filter((x) => !!x && typeof x.kimlik === 'string' && typeof x.ad === 'string') : null;
}

const golgeYaz = (g: GolgeKaydi[]): Promise<void> =>
    Depolama.yaz(DEPOLAMA_ANAHTARLARI.CIHAZ_AGI_GOLGESI, g).catch(() => undefined);

/** Eşzamanlı yazımlar aynı kaydı ezmesin (gönderim zinciri + ekran). */
let zincir: Promise<unknown> = Promise.resolve();
const sirala = <T>(is: () => Promise<T>): Promise<T> => {
    const sonuc = zincir.then(is, is);
    zincir = sonuc.catch(() => undefined);
    return sonuc;
};

export const CihazAgiDeposu = {
    async liste(): Promise<CihazUyeligi[]> {
        const kimlikler = await listeOku();
        const sonuc: CihazUyeligi[] = [];
        for (const k of kimlikler) {
            try {
                const ham = await GuvenliDepo.oku(kayitAnahtari(k));
                const o = ham ? (JSON.parse(ham) as unknown) : null;
                if (gecerliMi(o)) sonuc.push(o);
            } catch {
                // bozuk kayıt atlanır
            }
        }
        // Gölgesi hiç olmayan eski kurulum: ilk okumada mevcut liste gölgeye alınır (göç).
        if (sonuc.length > 0 && (await golgeOku()) === null) {
            await golgeYaz(sonuc.map((u) => ({ kimlik: u.aliciKimlik, ad: u.aliciAdi, tur: u.tur })));
        }
        return sonuc;
    },

    /**
     * Gölgede olup güvenli depoda artık okunamayan üyelikler (kayıp). Boşsa sorun yok. Güvenli
     * depo okunamadıkça ya da kullanıcı `kayiplariUnut` deyinceye dek döner.
     */
    async kayiplar(): Promise<GolgeKaydi[]> {
        const g = await golgeOku();
        if (!g || g.length === 0) return [];
        const mevcut = new Set((await CihazAgiDeposu.liste()).map((u) => u.aliciKimlik));
        return g.filter((x) => !mevcut.has(x.kimlik));
    },

    /** Kullanıcı kayıp uyarısını kapattı: gölge yalnız okunabilen üyeliklere indirilir. */
    kayiplariUnut(): Promise<void> {
        return sirala(async () => {
            const mevcut = new Set((await CihazAgiDeposu.liste()).map((u) => u.aliciKimlik));
            const g = (await golgeOku()) ?? [];
            await golgeYaz(g.filter((x) => mevcut.has(x.kimlik)));
        });
    },

    kaydet(u: CihazUyeligi): Promise<void> {
        return sirala(async () => {
            await GuvenliDepo.yaz(kayitAnahtari(u.aliciKimlik), JSON.stringify(u));
            const kimlikler = await listeOku();
            if (!kimlikler.includes(u.aliciKimlik)) await GuvenliDepo.yaz(LISTE, JSON.stringify([...kimlikler, u.aliciKimlik]));
            // Yeni eşleşme: gölgedeki kayıplar da bırakılır (kullanıcı yeniden ekliyor).
            await golgeYaz([{ kimlik: u.aliciKimlik, ad: u.aliciAdi, tur: u.tur }, ...((await golgeOku()) ?? []).filter((x) => x.kimlik !== u.aliciKimlik && kimlikler.includes(x.kimlik))]);
        });
    },

    guncelle(aliciKimlik: string, degisim: Partial<CihazUyeligi>): Promise<CihazUyeligi | null> {
        return sirala(async () => {
            const ham = await GuvenliDepo.oku(kayitAnahtari(aliciKimlik));
            const o = ham ? (JSON.parse(ham) as unknown) : null;
            if (!gecerliMi(o)) return null;
            const yeni = { ...o, ...degisim, aliciKimlik: o.aliciKimlik };
            await GuvenliDepo.yaz(kayitAnahtari(aliciKimlik), JSON.stringify(yeni));
            return yeni;
        });
    },

    /** Sayacı artırıp ÖNCE diske yazar (çökme → tekrar değil atlama; alıcı "kesin artan" ister). */
    sonrakiN(aliciKimlik: string): Promise<number | null> {
        return sirala(async () => {
            const ham = await GuvenliDepo.oku(kayitAnahtari(aliciKimlik));
            const o = ham ? (JSON.parse(ham) as unknown) : null;
            if (!gecerliMi(o)) return null;
            const n = o.n + 1;
            await GuvenliDepo.yaz(kayitAnahtari(aliciKimlik), JSON.stringify({ ...o, n }));
            return n;
        });
    },

    sil(aliciKimlik: string): Promise<void> {
        return sirala(async () => {
            await GuvenliDepo.sil(kayitAnahtari(aliciKimlik));
            const kimlikler = await listeOku();
            await GuvenliDepo.yaz(LISTE, JSON.stringify(kimlikler.filter((k) => k !== aliciKimlik))).catch(() => undefined);
            const g = await golgeOku();
            if (g) await golgeYaz(g.filter((x) => x.kimlik !== aliciKimlik));
        });
    },
};
