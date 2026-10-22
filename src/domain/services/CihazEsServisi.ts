/**
 * Cihaz ağı — ÇİFT YÖNLÜ eşler (telefon ↔ tablet). Karar belgesi
 * `docs/superpowers/specs/2026-10-21-cihazlar-arasi-olay-esitleme.md` §3–4 (v1: LAN).
 *
 * - Kimlik: cihaz başına 16 hex (`cihazAgi.kimlik`, secure-store; yedeğe girmez).
 * - Olay günlüğü (`core/cihazAgi/olayGunlugu.ts`) AsyncStorage'da (atomik `Depolama.guncelle`).
 *   Yerel "kıldım"lar kayıttan TÜRETİLİR (`olaylariUret`): dün + bugünün kılınanları, günlükte
 *   henüz kildim olayı olmayanlar için olay doğar (eşten gelenin yankısı üretilmez).
 * - Teslim: `POST /esitle` gövdesi üye anahtarıyla şifreli `{v:2, olaylar, bilinen}`; eş aynı
 *   istekte YANITLA kendi eksiklerimizi döner (`…|yanit` AAD) → tek gidiş-dönüşte iki yön.
 * - Alıcı (dinleyici) YALNIZ ön planda (`AppState`): native kapılar + burada şifre/sayaç kontrolü;
 *   gelen kildim → ortak "Kıldım" kuyruğu `kaynak:'cihaz'` (Android `WearSenkron.cihazdanKildimEkle`,
 *   iOS `ExpoSiriKisayollari.cihazdanKildimEkle`) → `KildimKuyruguServisi.bekleyenleriIsle()`.
 * - Eşleştirme: QR'ı GÖSTEREN taraf (`eslesmeOturumuAc`) dinler; okuyan taraf
 *   `CihazEslesmeServisi.esles` ile istek atar (TV ile aynı protokol + kendi kimlik/adres/portu).
 *   Gösteren tarafta kullanıcı "Bu telefonu ekleyelim mi?" sorusunu ONAYLAR (iki uçta onay).
 * Store'a BAĞIMLI DEĞİL.
 */
import { AppState, Dimensions, Platform } from 'react-native';
import { base64Coz, base64Yaz, coz, esleIstekAad, esleYanitAad, kanalAad, kararliPort, sifrele, zarfla, type KanalZarfi } from '../../core/cihazAgi/kanal';
import { ozelIpv4Mu } from '../../core/tv/eslemeBaglantisi';
import { yukCoz, yukuYaz } from '../../core/cihazAgi/yuk';
import {
    bosGunluk,
    gelenleriAl,
    gonderilecekler,
    gunlukNormalize,
    olayOlustur,
    olaylariUygula,
    type OlayGunlugu,
    type OlayHedefleri,
} from '../../core/cihazAgi/olayGunlugu';
import type { VakitAdi } from '../../core/types';
import { Logger } from '../../core/utils/Logger';
import { Depolama } from '../../data/local/Depolama';
import { GuvenliDepo } from '../../data/local/GuvenliDepo';
import { CihazAgiDeposu, type CihazUyeligi } from '../../data/local/CihazAgiDeposu';
import { androidDinleyici, alicilariBul, type CihazIstegi, type DinleyiciKoprusu } from '../../../modules/expo-tv-esleme/src';
import { iosDinleyici } from '../../../modules/expo-siri-kisayollari/src';
import { rastgeleBaytlar, yereleGonder } from './CihazAgiTasima';
import { dunBugunKilinanlar, geriCekilmeMs, yerelAgVarMi } from './TvSenkronServisi';

const KIMLIK_ANAHTARI = 'cihazAgi.kimlik';
const GUNLUK_ANAHTARI = 'cihazAgi_olay_gunlugu';
const ESLESME_OMRU_MS = 3 * 60_000;
export const CIHAZ_ES_DINLEYICI_ADI = 'cihazEs';
const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

export const yanitAad = (gonderen: string, alici: string, n: number) => `${kanalAad(gonderen, alici, n)}|yanit`;

/** Bu cihazın türü (karşı tarafa söylenir): en küçük kenar ≥ 600 dp → tablet. */
export function buCihazinTuru(): 'tablet' | 'telefon' {
    const { width, height } = Dimensions.get('window');
    return Math.min(width, height) >= 600 ? 'tablet' : 'telefon';
}

export async function cihazKimligi(): Promise<string> {
    const mevcut = await GuvenliDepo.oku(KIMLIK_ANAHTARI).catch(() => null);
    if (mevcut && /^[0-9a-f]{16}$/.test(mevcut)) return mevcut;
    const yeni = hex(rastgeleBaytlar(8));
    await GuvenliDepo.yaz(KIMLIK_ANAHTARI, yeni);
    return yeni;
}

function dinleyiciKoprusu(): DinleyiciKoprusu | null {
    return Platform.OS === 'ios' ? (iosDinleyici() as DinleyiciKoprusu | null) : androidDinleyici();
}

export function cihazAgiDinleyicisiVarMi(): boolean {
    return dinleyiciKoprusu() != null;
}

async function kuyrugaKildim(tarih: string, vakit: VakitAdi): Promise<void> {
    if (Platform.OS === 'ios') {
        const { siriKildimKuyrugu } = require('../../../modules/expo-siri-kisayollari/src') as typeof import('../../../modules/expo-siri-kisayollari/src');
        await siriKildimKuyrugu()?.cihazdanKildimEkle?.(tarih, vakit);
        return;
    }
    const { NativeModules } = require('react-native') as typeof import('react-native');
    const m = NativeModules.WearSenkron as { cihazdanKildimEkle?: (t: string, v: string) => Promise<boolean> } | undefined;
    await m?.cihazdanKildimEkle?.(tarih, vakit);
}

/** Gelen olayların gerçek hedefleri (enjekte edilebilir: testler sahte verir). */
export const VARSAYILAN_HEDEFLER: OlayHedefleri = {
    kildim: (tarih, vakit) => kuyrugaKildim(tarih, vakit),
    kazaHareketleri: async (h) => {
        const { hareketleriEkle } = require('../../data/local/LocalKazaServisi') as typeof import('../../data/local/LocalKazaServisi');
        await hareketleriEkle(h);
    },
    // v1: eşitlenen ayar YOK (beyaz liste boş) — LWW çekirdeği hazır, ayar ekranları ayrı karar.
    ayar: async () => undefined,
};

export interface EslesmeIstegi {
    ist: string;
    cihazAdi: string;
    kimlik: string;
    adres: string;
    port: number;
    tur: 'tablet' | 'telefon';
}

interface EslesmeOturumu {
    sir: Uint8Array;
    acilisMs: number;
    bekleyen: EslesmeIstegi | null;
    karar: 'bekliyor' | 'onay' | 'red';
    anahtar: string | null;
    teslimEdildi: boolean;
}

export class CihazEsServisi {
    private static ornek: CihazEsServisi;
    private hedefler: OlayHedefleri = VARSAYILAN_HEDEFLER;
    private zincir: Promise<unknown> = Promise.resolve();
    private abonelik: { remove(): void } | null = null;
    private port: number | null = null;
    private oturum: EslesmeOturumu | null = null;
    /** Gösteren tarafta UI: bekleyen istek değişince haber verilir. */
    istekDinleyicisi: ((i: EslesmeIstegi | null) => void) | null = null;
    /** Eşleşme tamamlandı / olay alındı → ekranlar tazelensin. */
    degisti: (() => void) | null = null;

    static getInstance(): CihazEsServisi {
        if (!CihazEsServisi.ornek) CihazEsServisi.ornek = new CihazEsServisi();
        return CihazEsServisi.ornek;
    }

    private baslatildi = false;
    private zamanlayici: ReturnType<typeof setTimeout> | null = null;

    /** Kılınmışlık değişince (adlı yuva `cihazEs`) kısa beklemeyle eşitler. İdempotent. */
    baslat(): void {
        if (this.baslatildi) return;
        this.baslatildi = true;
        const { kayitDegistiDinleyicisiEkle } = require('../../data/local/LocalNamazServisi') as typeof import('../../data/local/LocalNamazServisi');
        kayitDegistiDinleyicisiEkle(CIHAZ_ES_DINLEYICI_ADI, () => {
            if (this.zamanlayici) clearTimeout(this.zamanlayici);
            this.zamanlayici = setTimeout(() => {
                this.zamanlayici = null;
                void this.esitle().catch(() => undefined);
            }, 1500);
        });
    }

    /** Yalnız testler. */
    hedefleriAyarla(h: OlayHedefleri): void {
        this.hedefler = h;
    }

    // ---------------- Olay günlüğü ----------------

    private async gunlukGuncelle<T>(is: (g: OlayGunlugu) => { gunluk: OlayGunlugu; sonuc: T }): Promise<T> {
        const kimlik = await cihazKimligi();
        let sonuc!: T;
        await Depolama.guncelle<OlayGunlugu>(GUNLUK_ANAHTARI, (ham) => {
            const g = gunlukNormalize(ham, kimlik) ?? bosGunluk(kimlik);
            const r = is(g);
            sonuc = r.sonuc;
            return r.gunluk;
        });
        return sonuc;
    }

    async gunlukOku(): Promise<OlayGunlugu> {
        const kimlik = await cihazKimligi();
        return gunlukNormalize(await Depolama.oku(GUNLUK_ANAHTARI), kimlik) ?? bosGunluk(kimlik);
    }

    /** Kayıttan türeyen yerel kildim olayları (günlükte o tarih+vakit için olay yoksa). */
    async olaylariUret(simdiMs = Date.now()): Promise<number> {
        const kilinan = await dunBugunKilinanlar();
        return this.gunlukGuncelle((g) => {
            const var_ = new Set(g.olaylar.filter((o) => o.tur === 'kildim').map((o) => `${(o as { tarih: string }).tarih}_${(o as { vakit: string }).vakit}`));
            let gunluk = g;
            let adet = 0;
            for (const [tarih, vakitler] of Object.entries(kilinan)) {
                for (const vakit of vakitler) {
                    if (var_.has(`${tarih}_${vakit}`)) continue;
                    const r = olayOlustur(gunluk, { tur: 'kildim', tarih, vakit }, simdiMs);
                    gunluk = r.gunluk;
                    if (r.olay) adet += 1;
                }
            }
            return { gunluk, sonuc: adet };
        });
    }

    private async gelenleriIsle(olaylar: unknown[]): Promise<number> {
        const { yeniler, ayarHlc } = await this.gunlukGuncelle((g) => {
            const r = gelenleriAl(g, olaylar, Date.now());
            return { gunluk: r.gunluk, sonuc: { yeniler: r.yeniler, ayarHlc: r.gunluk.ayarHlc } };
        });
        if (yeniler.length === 0) return 0;
        const u = await olaylariUygula(yeniler, this.hedefler, ayarHlc);
        await this.gunlukGuncelle((g) => ({ gunluk: { ...g, ayarHlc: u.ayarHlc }, sonuc: undefined }));
        if (yeniler.some((o) => o.tur === 'kildim')) {
            const { KildimKuyruguServisi } = require('./KildimKuyruguServisi') as typeof import('./KildimKuyruguServisi');
            await KildimKuyruguServisi.getInstance().bekleyenleriIsle().catch(() => undefined);
        }
        this.degisti?.();
        return yeniler.length;
    }

    // ---------------- Gönderim (eşlere) ----------------

    /** Tüm çift yönlü eşlerle eşitler (sıralı). Ağ/eş yoksa sessiz. */
    esitle(): Promise<Record<string, 'tamam' | 'ulasilamadi' | 'reddedildi'>> {
        const tur = this.zincir.then(() => this.esitleTuru());
        this.zincir = tur.catch(() => undefined);
        return tur;
    }

    private async esitleTuru(): Promise<Record<string, 'tamam' | 'ulasilamadi' | 'reddedildi'>> {
        const sonuc: Record<string, 'tamam' | 'ulasilamadi' | 'reddedildi'> = {};
        const esler = (await CihazAgiDeposu.liste().catch(() => [] as CihazUyeligi[])).filter(
            (u) => (u.tur === 'tablet' || u.tur === 'telefon') && u.durum !== 'reddedildi',
        );
        if (esler.length === 0) return sonuc;
        await this.olaylariUret().catch(() => 0);
        // Wi-Fi/Ethernet yoksa hiç denenmez (eş evde, kişi dışarıda: her tetikte soket zaman aşımı olmasın).
        if (!(await yerelAgVarMi())) return sonuc;
        for (const e of esler) {
            // Üstel geri çekilme (TV ile aynı kural): ulaşılamayan eş bekleme süresince denenmez.
            if (e.sonHataMs && Date.now() < e.sonHataMs + geriCekilmeMs(e.hataSayisi ?? 0)) {
                sonuc[e.aliciKimlik] = 'ulasilamadi';
                continue;
            }
            try {
                sonuc[e.aliciKimlik] = await this.eseGonder(e);
            } catch (hata) {
                Logger.info('CihazEs', 'Eşe ulaşılamadı', { hata: String(hata) });
                sonuc[e.aliciKimlik] = 'ulasilamadi';
                await CihazAgiDeposu.guncelle(e.aliciKimlik, { durum: 'ulasilamadi', sonHataMs: Date.now(), hataSayisi: (e.hataSayisi ?? 0) + 1 });
            }
        }
        return sonuc;
    }

    private async eseGonder(e: CihazUyeligi): Promise<'tamam' | 'ulasilamadi' | 'reddedildi'> {
        const g = await this.gunlukOku();
        const duz = yukuYaz({ v: 2, olaylar: gonderilecekler(g, e.karsiBilinen ?? {}), bilinen: g.bilinen, port: this.port ?? kararliPort(e.uye) });
        const dene = async (adres: string, port: number) => {
            const n = await CihazAgiDeposu.sonrakiN(e.aliciKimlik);
            if (n == null) return { kod: 403, govde: '', n: 0 };
            const zarf = zarfla(base64Coz(e.anahtar), rastgeleBaytlar(12), e.aliciKimlik, e.uye, n, duz);
            const y = await yereleGonder(adres, port, '/esitle', JSON.stringify(zarf));
            return { ...y, n };
        };
        let y: { kod: number; govde: string; n: number };
        let adres = e.adres;
        let port = e.port;
        try {
            y = await dene(adres, port);
        } catch {
            const b = Platform.OS === 'android' ? (await alicilariBul(4000).catch(() => [])).find((x) => x.i === e.aliciKimlik) : undefined;
            if (!b) throw new Error('ulaşılamadı');
            adres = b.adres;
            port = b.port;
            y = await dene(adres, port);
        }
        if (y.kod === 403) {
            await CihazAgiDeposu.guncelle(e.aliciKimlik, { durum: 'reddedildi' });
            return 'reddedildi';
        }
        if (y.kod !== 200) throw new Error(`kod ${y.kod}`);
        const z = JSON.parse(y.govde) as Partial<KanalZarfi>;
        const yanit = yukCoz(coz(base64Coz(e.anahtar), z.iv ?? '', yanitAad(e.uye, e.aliciKimlik, y.n), z.ct ?? ''));
        if (!yanit) throw new Error('yanıt çözülemedi');
        await this.gelenleriIsle(yanit.olaylar);
        await CihazAgiDeposu.guncelle(e.aliciKimlik, {
            durum: 'tamam',
            sonEsitlemeMs: Date.now(),
            sonHataMs: 0,
            hataSayisi: 0,
            karsiBilinen: yanit.bilinen,
            // Adres yalnız şifreli yanıt başarılıysa güncellenir (sahte mDNS adres çalamaz).
            ...(adres !== e.adres || port !== e.port ? { adres, port } : {}),
        });
        return 'tamam';
    }

    // ---------------- Dinleyici (ön plan) ----------------

    /** Ön plana gelişte / eşleştirme ekranında çağrılır. Eş yoksa ve oturum yoksa açılmaz. */
    async dinlemeyiBaslat(zorla = false): Promise<number | null> {
        const k = dinleyiciKoprusu();
        if (!k || AppState.currentState !== 'active') return null;
        if (!zorla) {
            const esVar = (await CihazAgiDeposu.liste().catch(() => [])).some((u) => u.tur === 'tablet' || u.tur === 'telefon');
            if (!esVar && !this.oturum) return null;
        }
        if (!this.abonelik) this.abonelik = k.addListener('onCihazIstegi', (i) => void this.istegiIsle(k, i));
        const { telefonAdi } = require('./CihazEslesmeServisi') as typeof import('./CihazEslesmeServisi');
        const kimlik = await cihazKimligi();
        this.port = await k.dinleyiciBaslat(kimlik, telefonAdi(), kararliPort(kimlik)).catch(() => null);
        return this.port;
    }

    async dinlemeyiDurdur(): Promise<void> {
        await dinleyiciKoprusu()?.dinleyiciDurdur().catch(() => undefined);
        this.abonelik?.remove();
        this.abonelik = null;
        this.port = null;
    }

    dinlemePortu(): number | null {
        return this.port;
    }

    async yerelAdres(): Promise<string | null> {
        return (await dinleyiciKoprusu()?.yerelAdres().catch(() => null)) ?? null;
    }

    private async istegiIsle(k: DinleyiciKoprusu, i: CihazIstegi): Promise<void> {
        let kod = 403;
        let govde = '';
        try {
            const r = await this.istegeYanit(i.yol, i.govde, i.ip);
            kod = r.kod;
            govde = r.govde;
        } catch (e) {
            Logger.info('CihazEs', 'İstek işlenemedi', { hata: String(e) });
        }
        await k.dinleyiciYanitla(i.id, kod, govde).catch(() => undefined);
    }

    /** Saf yönlendirme (testler doğrudan çağırır). Yanlış anahtar/bilinmeyen eş: sessiz 403. */
    async istegeYanit(yol: string, govde: string, ip?: string): Promise<{ kod: number; govde: string }> {
        if (yol === '/esle') return this.esleIstegi(govde);
        if (yol === '/esle-durum') return this.esleDurumu(govde);
        if (yol === '/esitle') return this.esitleIstegi(govde, ip);
        return { kod: 400, govde: '' };
    }

    private async esitleIstegi(govde: string, ip?: string): Promise<{ kod: number; govde: string }> {
        const z = JSON.parse(govde) as Partial<KanalZarfi>;
        if (z.v !== 2 || typeof z.u !== 'string' || typeof z.n !== 'number') return { kod: 403, govde: '' };
        const e = (await CihazAgiDeposu.liste()).find((u) => u.aliciKimlik === z.u && (u.tur === 'tablet' || u.tur === 'telefon'));
        if (!e || z.n <= (e.sonGelenN ?? 0)) return { kod: 403, govde: '' };
        const anahtar = base64Coz(e.anahtar);
        const yuk = yukCoz(coz(anahtar, z.iv ?? '', kanalAad(e.uye, e.aliciKimlik, z.n), z.ct ?? ''));
        if (!yuk) return { kod: 403, govde: '' };
        // Kimliği doğrulanmış istek: eşin GÜNCEL adresi/portu kaydedilir (eş yeniden başladıysa bize
        // yine ulaşabilsin diye; sahte mDNS bunu yapamaz — anahtar gerekir).
        const adresTazele = ip && ozelIpv4Mu(ip) && yuk.port ? { adres: ip, port: yuk.port } : {};
        await CihazAgiDeposu.guncelle(e.aliciKimlik, { sonGelenN: z.n, sonEsitlemeMs: Date.now(), durum: 'tamam', sonHataMs: 0, hataSayisi: 0, ...adresTazele });
        if (yuk.sil) {
            await CihazAgiDeposu.sil(e.aliciKimlik);
            this.degisti?.();
            return { kod: 200, govde: '' };
        }
        await this.olaylariUret().catch(() => 0);
        await this.gelenleriIsle(yuk.olaylar);
        const g = await this.gunlukOku();
        await CihazAgiDeposu.guncelle(e.aliciKimlik, { karsiBilinen: yuk.bilinen });
        const duz = yukuYaz({ v: 2, olaylar: gonderilecekler(g, yuk.bilinen), bilinen: g.bilinen });
        const iv = rastgeleBaytlar(12);
        return { kod: 200, govde: JSON.stringify({ iv: base64Yaz(iv), ct: sifrele(anahtar, iv, yanitAad(e.aliciKimlik, e.uye, z.n), duz) }) };
    }

    // ---------------- Eşleştirme (QR'ı gösteren taraf) ----------------

    /** Yeni oturum: geçici sır üretir, dinleyiciyi açar; QR için adres/port/kimlik döner. */
    async eslesmeOturumuAc(): Promise<{ adres: string; port: number; kimlik: string; sir: Uint8Array } | null> {
        this.oturum = { sir: rastgeleBaytlar(32), acilisMs: Date.now(), bekleyen: null, karar: 'bekliyor', anahtar: null, teslimEdildi: false };
        const port = await this.dinlemeyiBaslat(true);
        const adres = await this.yerelAdres();
        if (!port || !adres) return null;
        return { adres, port, kimlik: await cihazKimligi(), sir: this.oturum.sir };
    }

    eslesmeOturumunuKapat(): void {
        this.oturum = null;
        this.istekDinleyicisi?.(null);
    }

    private oturumGecerli(): EslesmeOturumu | null {
        const o = this.oturum;
        if (!o) return null;
        if (Date.now() - o.acilisMs > ESLESME_OMRU_MS) {
            this.oturum = null;
            return null;
        }
        return o;
    }

    private async esleIstegi(govde: string): Promise<{ kod: number; govde: string }> {
        const o = this.oturumGecerli();
        if (!o) return { kod: 403, govde: '' };
        const z = JSON.parse(govde) as { iv?: string; ct?: string };
        const kimlik = await cihazKimligi();
        const duz = coz(o.sir, z.iv ?? '', esleIstekAad(kimlik), z.ct ?? '');
        if (!duz) return { kod: 403, govde: '' };
        const p = JSON.parse(duz) as Partial<{ cihaz: string; ist: string; kimlik: string; adres: string; port: number; tur: string }>;
        if (typeof p.ist !== 'string' || !/^[0-9a-f]{16}$/.test(p.ist) || typeof p.kimlik !== 'string' || !/^[0-9a-f]{16}$/.test(p.kimlik)) {
            return { kod: 403, govde: '' };
        }
        if (o.bekleyen && o.bekleyen.ist !== p.ist) return { kod: 409, govde: '' };
        o.bekleyen = {
            ist: p.ist,
            cihazAdi: (p.cihaz ?? 'Telefon').slice(0, 40),
            kimlik: p.kimlik,
            // Denetim D-06 paritesi: kayıt asla yerel olmayan adres tutmaz.
            adres: typeof p.adres === 'string' && ozelIpv4Mu(p.adres) ? p.adres : '',
            port: typeof p.port === 'number' && Number.isInteger(p.port) && p.port >= 1024 && p.port <= 65535 ? p.port : 0,
            tur: p.tur === 'tablet' ? 'tablet' : 'telefon',
        };
        this.istekDinleyicisi?.(o.bekleyen);
        return { kod: 202, govde: '' };
    }

    /** Kullanıcı gösteren tarafta "Ekleyin" / "Hayır" dedi. */
    async eslesmeyiYanitla(onay: boolean): Promise<void> {
        const o = this.oturumGecerli();
        if (!o?.bekleyen) return;
        if (!onay) {
            o.karar = 'red';
            return;
        }
        const anahtar = base64Yaz(rastgeleBaytlar(32));
        const b = o.bekleyen;
        await CihazAgiDeposu.kaydet({
            tur: b.tur,
            aliciKimlik: b.kimlik,
            aliciAdi: b.cihazAdi,
            uye: await cihazKimligi(),
            anahtar,
            adres: b.adres,
            port: b.port,
            n: 0,
            durumumSayilsin: false,
            tvHatirlat: false,
            eklenmeMs: Date.now(),
            sonEsitlemeMs: 0,
            durum: 'tamam',
        });
        o.anahtar = anahtar;
        o.karar = 'onay';
        this.degisti?.();
    }

    private async esleDurumu(govde: string): Promise<{ kod: number; govde: string }> {
        const o = this.oturumGecerli();
        const p = JSON.parse(govde) as { ist?: string };
        if (!o?.bekleyen || p.ist !== o.bekleyen.ist) return { kod: 403, govde: '' };
        const kimlik = await cihazKimligi();
        const { telefonAdi } = require('./CihazEslesmeServisi') as typeof import('./CihazEslesmeServisi');
        const icerik =
            o.karar === 'onay'
                ? { durum: 'onay', u: o.bekleyen.kimlik, k: o.anahtar, tvAdi: telefonAdi() }
                : { durum: o.karar };
        const iv = rastgeleBaytlar(12);
        const yanit = { kod: 200, govde: JSON.stringify({ iv: base64Yaz(iv), ct: sifrele(o.sir, iv, esleYanitAad(kimlik, o.bekleyen.ist), JSON.stringify(icerik)) }) };
        if (o.karar !== 'bekliyor') {
            // Teslim edildi: oturum kapanır, sır bir daha kullanılamaz.
            this.oturum = null;
            this.istekDinleyicisi?.(null);
        }
        return yanit;
    }

    /** Eşleşmeyi kaldır: önce eşe `sil`, sonra yerelde. */
    async kaldir(aliciKimlik: string): Promise<void> {
        const e = (await CihazAgiDeposu.liste()).find((u) => u.aliciKimlik === aliciKimlik);
        if (e) {
            try {
                const n = await CihazAgiDeposu.sonrakiN(e.aliciKimlik);
                if (n != null) {
                    const zarf = zarfla(base64Coz(e.anahtar), rastgeleBaytlar(12), e.aliciKimlik, e.uye, n, yukuYaz({ v: 2, sil: true }));
                    await yereleGonder(e.adres, e.port, '/esitle', JSON.stringify(zarf));
                }
            } catch {
                // eş kapalı: anahtar orada kalır ama bir daha kullanılmaz; eş kendi listesinden silebilir.
            }
        }
        await CihazAgiDeposu.sil(aliciKimlik);
    }
}
