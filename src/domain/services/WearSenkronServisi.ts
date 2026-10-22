/**
 * Wear OS senkronu — telefon tarafı (issue #269).
 *
 * İKİ YÖN:
 * 1. Telefon → saat: `gonder()` 31 günlük vakitleri + dün/bugün kılınmışlığı +
 *    2 günlük HAZIR muhafız planını (issue #280; saat telefon yokken de
 *    hatırlatsın) Wearable Data Layer'a (`/namazakisi/durum`) yazar. Native modül
 *    `WearSenkron` (`android/app/.../wear/WearSenkronModulu.kt`).
 * 2. Saat → telefon: saat "Kıldım" deyince native `WearDinleyiciServisi` öğeyi
 *    ORTAK "Kıldım" kuyruğuna alır (widget/hızlı ayarlar/kısayolla aynı — issue
 *    #275/#276); kuyruğu `KildimKuyruguServisi` boşaltır.
 *
 * APPLE WATCH (issue #285): iOS'ta AYNI yük, WatchConnectivity köprüsüne
 * (`modules/expo-siri-kisayollari` → `SaatKoprusu`, `updateApplicationContext`) gider —
 * böylece konum yayması, açılış, "Kıldım" sonrası tazeleme ve arka plan görevi iki saat
 * için de TEK yoldan geçer. Apple Watch da HAZIR muhafız planını ve uyandırma listesini
 * alır: saat yerel bildirimini telefonla AYNI kimlikle kurar, watchOS aynı kimlikli iki
 * bildirimi tekilleştirir (telefon yanındaysa yalnız etkin cihaz gösterir, uzaktaysa saat
 * kendi çalar). Farklar: Now Bar payı ve anons metni gitmez (Apple Watch'ta canlı sayaç
 * yüzeyi yok, saat konuşmaz), bağlam sınırı daha dardır. Saatten gelen "Kıldım" Siri/widget
 * ile ortak kuyruğa düşer.
 *
 * Store'a BAĞIMLI DEĞİLDİR (arka planda Redux yok): konum ham AsyncStorage'dan,
 * kılınmışlık `LocalNamazServisi`'nden okunur. Saat köprüsü yoksa no-op.
 */
import { hatirlatmaKurulabilirMi } from '../../data/local/LocalCihazRoluServisi';
import { NativeModules, Platform } from 'react-native';
import { geceSessizliginiOku } from '../../data/local/LocalGeceSessizligiOkuyucu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../../core/utils/Logger';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { koordinatGecerliMi } from '../../core/nafile/gunVakitleri';
import { konumMetniHesapla, type KonumMetniGirdisi } from '../../core/ayarlar/konumMetni';
import {
    APPLE_WATCH_YUK_BAYT_SINIRI,
    canliGecerliMi,
    wearYukuOlustur,
    type WearCanli,
    type WearYukGirdisi,
} from '../../core/wear/wearYuku';
import type { VakitAdi } from '../../core/types';
import {
    kayitDegistiDinleyicisiniAyarla,
    kilinanVakitleriAl,
    localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';
import { muhafizMatrisiniCoz } from '../../core/muhafiz/motorAdaptoru';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { muhafizPlaniDinleyicisiniAyarla, type MuhafizPlaniDurumu } from './muhafizPlaniGozlemcisi';
import { canliSaatDinleyicisiniAyarla } from './canliSaatGozlemcisi';
import { saatKoprusu } from '../../../modules/expo-siri-kisayollari/src';
import { LocalSaatAyarlariServisi } from '../../data/local/LocalSaatAyarlariServisi';
import { LocalNafileServisi } from '../../data/local/LocalNafileServisi';
import { saatUyandiriyorMu, type SaatTeslimBaglami } from '../../core/saat/saatAyarlari';
import { wearUyandirmaListesiOlustur, type WearUyandirmaKaydi } from '../../core/wear/wearUyandirma';
import { metinOzeti } from '../../core/utils/kararliOzet';

interface WearSenkronModulu {
    durumGonder(json: string): Promise<void>;
    /**
     * Aciliyet seçilebilen gönderim (D-08): `acil=false` Data Layer'ın toplu senkronuna
     * bırakır (≤30 dk gecikebilir, radyoyu ayrıca uyandırmaz). Eski ikilide yok → `durumGonder`.
     */
    durumGonderSecenekli?(json: string, acil: boolean): Promise<void>;
    /** Şu an BAĞLI saat: "esli" | "esliDegil" | "yok" | null (yalnız Wear OS, eski ikilide yok). */
    esliSaatDurumu?(): Promise<unknown>;
    /** Camideyim / Namaz modu durumunu saate yeniden yaz (saat W3; yalnız Wear OS, eski ikilide yok). */
    camiDurumunuTazele?(): Promise<void>;
}

const NAMAZ_VAKIT: Partial<Record<string, VakitAdi>> = {
    [NamazAdi.Sabah]: 'imsak',
    [NamazAdi.Ogle]: 'ogle',
    [NamazAdi.Ikindi]: 'ikindi',
    [NamazAdi.Aksam]: 'aksam',
    [NamazAdi.Yatsi]: 'yatsi',
};

/** `wear` = Wear OS (Data Layer), `appleWatch` = Apple Watch (WatchConnectivity). */
type SaatTuru = 'wear' | 'appleWatch';

interface SaatHedefi {
    modul: WearSenkronModulu;
    tur: SaatTuru;
}

const hedef = (): SaatHedefi | null => {
    if (Platform.OS === 'ios') {
        const kopru = saatKoprusu();
        return kopru ? { modul: kopru, tur: 'appleWatch' } : null;
    }
    if (Platform.OS !== 'android') return null;
    const m = (NativeModules.WearSenkron as WearSenkronModulu | undefined) ?? null;
    return m ? { modul: m, tur: 'wear' } : null;
};

/** Bağlı saat sorgusunun süreç içi önbellek süresi. */
export const SAAT_DURUM_ONBELLEK_MS = 5 * 60 * 1000;
/** Aynı yük en geç bu aralıkta yine gönderilir (diskteki özet güvenlik ağıdır, kalıcı susturma değil). */
export const WEAR_YUK_YENIDEN_GONDERIM_MS = 24 * 60 * 60 * 1000;

export interface WearGonderimSecenekleri {
    /**
     * Data Layer `setUrgent`: kullanıcı eylemi (Kıldım, ayar) için `true` (varsayılan —
     * eski davranış). Periyodik tur `false` geçer: içerik saatte zaten 31 gün/48 sa ileri
     * hazırdır, anında senkron gerekmez.
     */
    acil?: boolean;
}

export class WearSenkronServisi {
    private static instance: WearSenkronServisi;
    /** Son gönderilen yük — içerik aynıysa Data Layer'a yazılmaz. */
    private sonGonderilen: string | null = null;
    /**
     * Cihazda Wear API yok (native `WEAR_YOK`): süreç boyunca bir daha denenmez.
     * Aksi halde GMS'siz cihazda her işaretleme tanı loguna uyarı yazar ve 500
     * satırlık tamponu gerçek hatalardan boşaltırdı.
     */
    private kullanilamaz = false;
    /**
     * Gönderimler SIRALI ve BİRLEŞTİRİLİR (D-08): koşan tur varken gelen istekler TEK bir
     * ek tura bağlanır (ek tur diskten taze okuduğu için hepsini kapsar). Eskiden her
     * istek kuyruğa ayrı tur ekliyordu — "Kıldım" başına ≈3 tam kurulum.
     */
    private kosanTur: Promise<void> | null = null;
    private bekleyenTur: Promise<void> | null = null;
    private bekleyenAcil = false;
    /** Bağlı saat kapısının önbelleği (süreç içi). */
    private saatDurumu: { var: boolean; ms: number } | null = null;
    /** Diskteki son gönderim özeti bu süreçte okundu mu? */
    private diskOzetiOkundu = false;
    /**
     * Telefonun EN SON planladığı muhafız durumu (doğrulanmış matris). Varsa
     * diskten okumaya yeğlenir: ekrandaki değişiklik diske yazılmadan önce de
     * planlanmış olabilir, saat telefonla aynı matrisi görmeli.
     */
    private sonMuhafiz: MuhafizPlaniDurumu | null = null;

    private constructor() { }

    public static getInstance(): WearSenkronServisi {
        if (!WearSenkronServisi.instance) {
            WearSenkronServisi.instance = new WearSenkronServisi();
        }
        return WearSenkronServisi.instance;
    }

    /** Kılınmışlık her değiştiğinde saati tazele (uygulama açılışında bir kez çağrılır). */
    public baslat(): void {
        const h = hedef();
        if (!h) return;
        kayitDegistiDinleyicisiniAyarla(() => {
            // Kılınmışlık = kullanıcı eylemi → saat ✓'yu hemen görsün (acil).
            this.gonder({ acil: true }).catch(() => { /* gonder kendi hatasını loglar */ });
        });
        // Muhafız planı değişince (ayar ekranı, kılınma, konum) saatin planı da tazelenir.
        // İki saatte de: Apple Watch da telefon uzaktayken kendi bildirimini kurar (#285).
        muhafizPlaniDinleyicisiniAyarla((durum) => {
            this.sonMuhafiz = durum;
            this.gonder().catch(() => { /* gonder kendi hatasını loglar */ });
        });
        // Now Bar payı yalnız Wear OS'ta (Apple Watch'ta canlı sayaç yüzeyi yok).
        if (h.tur !== 'wear') return;
        // Now Bar seçimi / canlı sayaç planı değişince (issue #282) saatin canlı sayacı da.
        canliSaatDinleyicisiniAyarla(() => {
            this.gonder().catch(() => { /* gonder kendi hatasını loglar */ });
        });
    }

    public gonder(secenekler: WearGonderimSecenekleri = {}): Promise<void> {
        const acil = secenekler.acil ?? true;
        if (!this.kosanTur) return this.turuBaslat(acil);
        if (acil) this.bekleyenAcil = true;
        if (!this.bekleyenTur) {
            this.bekleyenTur = this.kosanTur.then(() => {
                const ekAcil = this.bekleyenAcil;
                this.bekleyenAcil = false;
                this.bekleyenTur = null;
                return this.turuBaslat(ekAcil);
            });
        }
        return this.bekleyenTur;
    }

    private turuBaslat(acil: boolean): Promise<void> {
        const tur: Promise<void> = this.gonderTuru(acil)
            .catch(() => undefined)
            .finally(() => {
                if (this.kosanTur === tur) this.kosanTur = null;
            });
        this.kosanTur = tur;
        return tur;
    }

    /**
     * Wear OS kapısı (D-08): saati OLMAYAN telefonda 31 günlük yük + 48 sa plan + 30–80 KB
     * JSON hiç kurulmaz. "esliDegil" BELİRSİZDİR (yalnız o an bağlı düğümü sorar; şarjdaki
     * saat de öyle görünür) → bu telefonda bir kez bile saat GÖRÜLDÜYSE kurulur ve DataItem
     * bağlantı gelince senkronlanır (DataClient seçilme gerekçesi). Köprü/yanıt yoksa kurulur.
     */
    private async saatVarMi(m: WearSenkronModulu): Promise<boolean> {
        if (typeof m.esliSaatDurumu !== 'function') return true;
        const simdi = Date.now();
        if (this.saatDurumu && simdi - this.saatDurumu.ms < SAAT_DURUM_ONBELLEK_MS) return this.saatDurumu.var;
        let durum: unknown = null;
        try {
            durum = await m.esliSaatDurumu();
        } catch {
            durum = null;
        }
        let saatVar: boolean;
        if (durum === 'esli') {
            saatVar = true;
            try {
                await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.WEAR_SAAT_GORULDU, '1');
            } catch {
                // Bayrak yazılamazsa bir sonraki "esli" yine yazar.
            }
        } else if (durum === 'yok') {
            saatVar = false;
        } else if (durum === 'esliDegil') {
            try {
                saatVar = (await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.WEAR_SAAT_GORULDU)) === '1';
            } catch {
                saatVar = true;
            }
        } else {
            saatVar = true;
        }
        this.saatDurumu = { var: saatVar, ms: simdi };
        return saatVar;
    }

    /**
     * Aynı yük az önce (bu süreçte ya da diskteki özete göre) gönderildiyse `true`. Disk
     * özeti YALNIZ Wear OS'ta: DataItem Play Hizmetleri'nde kalıcıdır ve saat bağlanınca
     * kendiliğinden senkronlanır. Apple Watch köprüsü bekleyen yükü süreç BELLEĞİNDE tutar
     * (oturum sonradan etkinleşirse gönderir) → yeni süreçte yeniden verilmesi şarttır.
     */
    private async ayniYukGonderildiMi(json: string, diskOzeti: boolean): Promise<boolean> {
        if (json === this.sonGonderilen) return true;
        if (!diskOzeti || this.diskOzetiOkundu) return false;
        this.diskOzetiOkundu = true;
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.WEAR_SON_YUK_OZETI);
            const kayit = ham ? (JSON.parse(ham) as { ozet?: unknown; ms?: unknown }) : null;
            const simdi = Date.now();
            if (
                kayit &&
                kayit.ozet === metinOzeti(json) &&
                typeof kayit.ms === 'number' &&
                kayit.ms <= simdi &&
                simdi - kayit.ms < WEAR_YUK_YENIDEN_GONDERIM_MS
            ) {
                this.sonGonderilen = json;
                return true;
            }
        } catch {
            // Okunamayan özet = gönder.
        }
        return false;
    }

    private async gonderTuru(acil = true): Promise<void> {
        const h = hedef();
        if (!h || this.kullanilamaz) return;
        const wear = h.tur === 'wear';
        try {
            if (wear && !(await this.saatVarMi(h.modul))) return;
            const konum = await this.konumuOku();
            if (!konum) return;

            const bugun = bugunuAl();
            const dun = gunEkle(bugun, -1);
            const kilinanlar: Record<string, VakitAdi[]> = {};
            const kayit = await localTarihAraligindakiNamazlariGetir(dun, bugun);
            if (kayit.basarili && kayit.veri) {
                for (const gun of kayit.veri) {
                    kilinanlar[gun.tarih] = gun.namazlar
                        .filter((n) => n.tamamlandi)
                        .map((n) => NAMAZ_VAKIT[n.namazAdi])
                        .filter((v): v is VakitAdi => !!v);
                }
            }

            // Saat iş bölümü (saat W3): uyandırma listesi iki saatte, anons yeri yalnız Wear OS.
            const saat = await LocalSaatAyarlariServisi.teslimBaglaminiOku();
            // Apple Watch da HAZIR planı alır (#285 cilası): telefon uzaktayken saat kendi
            // bildirimini kurar. Çift bildirim olmaz — saat telefonla AYNI kimliği kullanır,
            // watchOS aynı kimlikli iki bildirimi tekilleştirip yalnız etkin cihazda gösterir.
            // Tek beyin (#364): ikinci cihaz / ev ekranı saate de hatırlatma planı ve
            // uyandırma GÖNDERMEZ — saatin hatırlatmasını ana telefon verir (vakitler gider).
            const kurulur = await hatirlatmaKurulabilirMi();
            const muhafiz = kurulur ? await this.muhafizGirdisiniHazirla(bugun, dun, kilinanlar) : undefined;
            const uyandirma =
                kurulur && saatUyandiriyorMu(saat)
                    ? await this.uyandirmaListesiniHazirla(konum.koordinat, bugun, muhafiz, saat.uyandirmaDurumlari)
                    : undefined;
            const json = JSON.stringify(
                wearYukuOlustur({
                    koordinat: konum.koordinat,
                    bugunIso: bugun,
                    konumAdi: konum.ad,
                    kilinanlar,
                    muhafiz,
                    canli: wear ? await this.canliPayiniOku() : undefined,
                    // Kıble iki saatte de (yaklaşık konum, ~11 km).
                    kibleKonumu: true,
                    uyandirma,
                    anonsYeri: wear ? saat.anonsYeri : undefined,
                    // Apple Watch: dar bağlam sınırı + konuşmadığı için anons metni gitmez.
                    ...(wear ? {} : { baytSiniri: APPLE_WATCH_YUK_BAYT_SINIRI, anonsMetinleri: false }),
                })
            );
            // Camideyim/Namaz modu durumu AYRI küçük DataItem'dır (native yazar, içerik
            // aynıysa yazmaz) — ana yükün tekilleştirmesinden ÖNCE: durum yük değişmeden de değişir.
            if (wear) await h.modul.camiDurumunuTazele?.().catch(() => undefined);
            if (await this.ayniYukGonderildiMi(json, wear)) return;
            if (wear && typeof h.modul.durumGonderSecenekli === 'function') {
                await h.modul.durumGonderSecenekli(json, acil);
            } else {
                await h.modul.durumGonder(json);
            }
            this.sonGonderilen = json;
            if (wear) {
                try {
                    await AsyncStorage.setItem(
                        DEPOLAMA_ANAHTARLARI.WEAR_SON_YUK_OZETI,
                        JSON.stringify({ ozet: metinOzeti(json), ms: Date.now() })
                    );
                } catch {
                    // Özet yazılamazsa en kötü ihtimalle yeni süreçte bir kez daha gönderilir.
                }
            }
        } catch (e) {
            if ((e as { code?: string } | null)?.code === 'WEAR_YOK') {
                this.kullanilamaz = true;
                Logger.info('WearSenkron', 'Bu cihazda Wear OS baglantisi yok; saat senkronu kapali');
                return;
            }
            Logger.warn('WearSenkron', 'Saate durum gonderilemedi', e);
        }
    }

    /**
     * Saatten gelen "Kıldım"lar artık ORTAK kuyruktadır (widget, hızlı ayarlar,
     * kısayol ile birlikte — issue #275/#276); boşaltan tek yer
     * `KildimKuyruguServisi`. Bu metot geriye uyumluluk için oraya devreder.
     */
    public bekleyenleriIsle(): Promise<void> {
        const { KildimKuyruguServisi } = require('./KildimKuyruguServisi') as typeof import('./KildimKuyruguServisi');
        return KildimKuyruguServisi.getInstance().bekleyenleriIsle();
    }

    /**
     * Plan girdisi: muhafız açık mı + matris + kılınmışlık. Kılınmışlık iki
     * kaynağın BİRLEŞİMİdir — telefondaki muhafız `kilinanVakitleriAl`'ı (tek
     * doğru kaynak, AGENTS.md) okur; namaz kaydı ise saatin ✓ gösterimidir.
     * Muhafız ayarı okunamazsa `undefined` → plan boş gider (vakitler yine gider).
     */
    private async muhafizGirdisiniHazirla(
        bugun: string,
        dun: string,
        kayitKilinanlari: Record<string, VakitAdi[]>
    ): Promise<WearYukGirdisi['muhafiz']> {
        const durum = this.sonMuhafiz ?? (await this.muhafizDurumunuOku());
        if (!durum) return undefined;
        const kilinanlar: Record<string, VakitAdi[]> = {};
        for (const tarih of [dun, bugun]) {
            const muhafizKilinan = await kilinanVakitleriAl(tarih).catch(() => [] as VakitAdi[]);
            kilinanlar[tarih] = [...new Set([...(kayitKilinanlari[tarih] ?? []), ...muhafizKilinan])];
        }
        // Özel gün (issue #272): telefon o günün muhafızını planlamaz → saat de planlamaz.
        const ozelGundeMi = await ozelGunSuzgeciniOku();
        // Gece sessizliği: telefonun arka planı ve ön planıyla AYNI kural ve kaynak.
        const geceSessizligi = await geceSessizliginiOku();
        return { aktif: durum.aktif, matris: durum.matris, simdiMs: Date.now(), kilinanlar, ozelGundeMi, geceSessizligi };
    }

    /**
     * Saatin sessiz uyandırma listesi (saat W3, fikir 2) — telefonun kendi üreticilerinden
     * (muhafız imsak alarmı + teheccüd uyandırması), özgün zamanlarla. Okunamazsa boş liste
     * DEĞİL `undefined` (alan gitmez → saat çalmaz, telefon zaten çalar).
     */
    private async uyandirmaListesiniHazirla(
        koordinat: { lat: number; lng: number },
        bugun: string,
        muhafiz: WearYukGirdisi['muhafiz'],
        uyandirmaDurumlari: SaatTeslimBaglami['uyandirmaDurumlari']
    ): Promise<WearUyandirmaKaydi[] | undefined> {
        try {
            const [nafileAyarlari, nafileKilinan] = await Promise.all([
                LocalNafileServisi.getAyarlar(),
                LocalNafileServisi.getKilinanlar(),
            ]);
            return wearUyandirmaListesiOlustur({
                koordinat,
                bugunIso: bugun,
                simdiMs: Date.now(),
                uyandirmaDurumlari,
                muhafiz,
                nafile: {
                    ayarlar: nafileAyarlari,
                    kilindiMi: (iso, tur) => (nafileKilinan[iso] ?? []).includes(tur),
                    ozelGundeMi: muhafiz?.ozelGundeMi,
                },
            });
        } catch (e) {
            Logger.warn('WearSenkron', 'Uyandirma listesi hazirlanamadi', e);
            return undefined;
        }
    }

    /**
     * Ham AsyncStorage'dan muhafız durumu — arka planda Redux yoktur. Matris
     * `muhafizMatrisiniCoz`'dan geçer (göçler + `yogunluk`; AGENTS.md: ham okuyan
     * tüketici yoğunluğu geçmezse slice ile ayrışır).
     */
    private async muhafizDurumunuOku(): Promise<MuhafizPlaniDurumu | null> {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
            if (!ham) return null;
            const a = JSON.parse(ham) as Record<string, unknown> | null;
            if (!a || typeof a !== 'object') return null;
            const esikler = (a.esikler ?? {}) as Partial<Record<'seviye1' | 'seviye2' | 'seviye3' | 'seviye4', number>>;
            const sikliklar = (a.sikliklar ?? {}) as Partial<Record<'seviye1' | 'seviye2' | 'seviye3' | 'seviye4', number>>;
            return {
                aktif: a.aktif === true,
                matris: muhafizMatrisiniCoz({
                    matris: a.matris as Parameters<typeof muhafizMatrisiniCoz>[0]['matris'],
                    yogunluk: a.yogunluk,
                    // `ArkaplanGorevServisi` ile AYNI tarihsel taban.
                    esikler: {
                        seviye1: esikler.seviye1 || 45,
                        seviye2: esikler.seviye2 || 25,
                        seviye3: esikler.seviye3 || 10,
                        seviye4: esikler.seviye4 || 3,
                    },
                    sikliklar: {
                        seviye1: sikliklar.seviye1 || 15,
                        seviye2: sikliklar.seviye2 || 10,
                        seviye3: sikliklar.seviye3 || 5,
                        seviye4: sikliklar.seviye4 || 1,
                    },
                }),
            };
        } catch (e) {
            Logger.warn('WearSenkron', 'Muhafiz ayarlari okunamadi; saat plani bos gidecek', e);
            return null;
        }
    }

    /**
     * Now Bar seçimi (issue #282): `CanliSayacPlanlayici`'nın yazdığı saat payı.
     * Yoksa/bozuksa alan HİÇ gönderilmez → saat eski davranışında kalır.
     */
    private async canliPayiniOku(): Promise<WearCanli | undefined> {
        try {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.CANLI_SAAT_VERISI);
            if (!ham) return undefined;
            const veri = JSON.parse(ham) as unknown;
            return canliGecerliMi(veri) ? (veri as WearCanli) : undefined;
        } catch {
            return undefined;
        }
    }

    private async konumuOku(): Promise<{ koordinat: { lat: number; lng: number }; ad: string } | null> {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
        if (!ham) return null;
        const k = JSON.parse(ham) as Partial<KonumMetniGirdisi> & { koordinatlar?: { lat: number; lng: number } };
        if (!koordinatGecerliMi(k.koordinatlar)) return null;
        return {
            koordinat: k.koordinatlar,
            ad: konumMetniHesapla({
                konumModu: k.konumModu === 'manuel' ? 'manuel' : 'oto',
                gpsAdres: k.gpsAdres ?? null,
                seciliIlceAdi: k.seciliIlceAdi ?? '',
                seciliIlAdi: k.seciliIlAdi ?? '',
            }),
        };
    }

    /** Yalnız testler için: modül düzeyi durumu sıfırlar. */
    public __testIcinSifirla(): void {
        this.sonGonderilen = null;
        this.kullanilamaz = false;
        this.sonMuhafiz = null;
        this.kosanTur = null;
        this.bekleyenTur = null;
        this.bekleyenAcil = false;
        this.saatDurumu = null;
        this.diskOzetiOkundu = false;
    }
}
