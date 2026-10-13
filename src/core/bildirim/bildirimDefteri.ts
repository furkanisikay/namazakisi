/**
 * BİLDİRİM DEFTERİ — SAF (issue #298).
 *
 * Uygulamanın o an cihaza kuracağı (bekleteceği) TÜM bildirim ve alarmların
 * listesi. TEK KAYNAK KURALI: defter ayrı bir "tahmin" yapmaz, her kaynağın
 * GERÇEK plan üreticisini kuru çalıştırır — servisler de aynı üreticilerden
 * beslenir. Tahmin fonksiyonu yazılsaydı ikiz ayrışır, ekran "sığıyor" derken
 * cihaz sessizce keserdi.
 *
 *   muhafız         → `muhafizTeslimPlaniOlustur` (bugünün kalan vakitleri)
 *   sesli anons     → aynı adaylar, `anonsAlarmiKurarMi` (yalnız Android)
 *   vakit bildirimi → `vakitBildirimPlaniOlustur` (bugün + yarın)
 *   cuma            → `cumaPlaniOlustur` (4 cuma)
 *   nafile          → `nafilePlaniOlustur` (3 gün / 7 gece ya da günü gününe)
 *   gün sonu        → `gunSonuPlaniOlustur` (iOS 3, Android 7 gün)
 *   vakit sayacı    → `sayacPlaniOlustur` (yalnız Android; vakit başına 2)
 *   widget          → dakika alarmı (yalnız Android; 1)
 *
 * Gösterilen sayı BEKLEYENDİR: şu andan sonra tetiklenecek kayıtlar (sistemin
 * saydığı). iOS'ta yalnız bildirimler sayılır; Android'de sistem uygulama
 * başına ALARM tuttuğu için havuz bildirim + notifee tetiği + anons + widget'tır.
 *
 * Bilinçli kapsam dışı (Android, ≤6 tetik): iftar/sahur/seri sayaçları —
 * pencereleri gün içinde değişir ve 120'lik diğer-tüketici payının içinde kalır.
 */
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import type { VakitAdi } from '../types';
import type { MuhafizMatrisi } from '../muhafiz/matrisTipleri';
import {
    anonsAlarmiKurarMi,
    muhafizTeslimPlaniOlustur,
    muhafizVakitleriniHesapla,
    type MuhafizVakitZamani,
} from '../muhafiz/muhafizTeslimPlani';
import { nafileAnonsAlarmiKurarMi, nafilePlaniOlustur, nafilePlanSecenekleri } from '../nafile/nafilePlani';
import type { NafileAyarlari } from '../nafile/nafileTipleri';
import { gunSonuPlaniOlustur, GUN_SONU_PLAN_GUN_SAYISI, type GunSonuPlanAyarlari } from '../seri/gunSonuPlani';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import { muhafizUyarilanVakitleriBul, sayacBaslangicEsikleriHesapla } from '../utils/vakitSayacYardimcisi';
import { cumaPlaniOlustur, type CumaPlanAyarlari } from './cumaPlani';
import { sayacPlaniOlustur } from './sayacPlani';
import { vakitBildirimPlaniOlustur, type VakitBildirimPlanAyarlari } from './vakitBildirimPlani';
import {
    ANDROID_MUHAFIZ_PAYI,
    ANDROID_NAFILE_PAYI,
    ANDROID_UYARI_ESIGI,
    YAKINLIK_ORANI,
    platformSiniri,
    type BildirimPlatformu,
} from './butceSabitleri';

export type DefterKaynagi =
    | 'muhafiz'
    | 'anons'
    | 'vakitBildirimi'
    | 'cuma'
    | 'nafile'
    | 'gunSonu'
    | 'sayac'
    | 'widget';

/** Ekranda gösterim sırası. */
export const DEFTER_KAYNAK_SIRASI: DefterKaynagi[] = [
    'muhafiz',
    'anons',
    'nafile',
    'vakitBildirimi',
    'cuma',
    'gunSonu',
    'sayac',
    'widget',
];

export interface DefterKaydi {
    kaynak: DefterKaynagi;
    zamanMs: number;
    /** 'bildirim' = bildirim tetiği (expo/notifee); 'alarm' = yalnız native alarm (anons, widget). */
    tur: 'bildirim' | 'alarm';
}

export interface DefterKoordinat {
    lat: number;
    lng: number;
}

export interface DefterGirdisi {
    platform: BildirimPlatformu;
    simdi: Date;
    /** `null` / `{0,0}` = konum yok → vakte bağlı hiçbir kaynak planlanmaz (servislerle aynı). */
    koordinat: DefterKoordinat | null;
    /** Tarih (YYYY-MM-DD) → o günün kılınmış vakitleri (muhafız ve sayaç atlar). */
    kilinan?: Record<string, readonly VakitAdi[]>;
    /** Özel gün kapısı (issue #272). */
    ozelGundeMi?: (iso: string) => boolean;
    muhafiz?: { aktif: boolean; matris: MuhafizMatrisi } | null;
    vakitBildirimi?: VakitBildirimPlanAyarlari | null;
    cuma?: CumaPlanAyarlari | null;
    nafile?: NafileAyarlari | null;
    gunSonu?: (GunSonuPlanAyarlari & { gunSonuBildirimAktif: boolean }) | null;
    /** Vakit sayacı ayarı (Android). Eşikler muhafız matrisinden türer. */
    vakitSayaci?: { aktif: boolean; sayacBaslangicSeviyesi?: number } | null;
    /** Android ana ekran widget'ının dakika alarmı sayılsın mı? (varsayılan: Android'de evet) */
    widget?: boolean;
}

const koordinatGecerli = (k: DefterKoordinat | null | undefined): k is DefterKoordinat =>
    !!k && Number.isFinite(k.lat) && Number.isFinite(k.lng) && !(k.lat === 0 && k.lng === 0);

/** Defteri üret — kronolojik. Asla fırlatmaz (bozuk kaynak o kaynağı sıfırlar). */
export function bildirimDefteriOlustur(g: DefterGirdisi): DefterKaydi[] {
    const kayitlar: DefterKaydi[] = [];
    const simdiMs = g.simdi.getTime();
    const ozelGundeMi = g.ozelGundeMi ?? (() => false);
    const kilindiMi = (tarih: string, vakit: VakitAdi) => (g.kilinan?.[tarih] ?? []).includes(vakit);
    const android = g.platform === 'android';
    const ekle = (kaynak: DefterKaynagi, zamanMs: number, tur: DefterKaydi['tur'] = 'bildirim') => {
        if (zamanMs > simdiMs) kayitlar.push({ kaynak, zamanMs, tur });
    };
    const guvenli = (is: () => void) => {
        try {
            is();
        } catch {
            // Tek kaynağın hesabı patlarsa defter yine diğerlerini sayar.
        }
    };

    const koordinat = koordinatGecerli(g.koordinat) ? g.koordinat : null;
    let vakitler: MuhafizVakitZamani[] = [];
    if (koordinat) guvenli(() => (vakitler = muhafizVakitleriniHesapla(koordinat, g.simdi)));

    // ── Muhafız (+ Android sesli anons alarmları) ──
    if (koordinat && g.muhafiz?.aktif) {
        const matris = g.muhafiz.matris;
        guvenli(() => {
            for (const aday of muhafizTeslimPlaniOlustur({ matris, vakitler, simdi: g.simdi, kilindiMi, ozelGundeMi })) {
                ekle('muhafiz', aday.zaman.getTime());
                if (android && anonsAlarmiKurarMi(aday)) ekle('anons', aday.zaman.getTime(), 'alarm');
            }
        });
    }

    // ── Vakit girdi bildirimleri ──
    if (koordinat && g.vakitBildirimi) {
        const ayar = g.vakitBildirimi;
        guvenli(() => {
            for (const k of vakitBildirimPlaniOlustur(koordinat, ayar, g.simdi, ozelGundeMi)) ekle('vakitBildirimi', k.zaman.getTime());
        });
    }

    // ── Cuma ──
    if (koordinat && g.cuma?.aktif) {
        const ayar = g.cuma;
        guvenli(() => {
            for (const k of cumaPlaniOlustur(koordinat, ayar, g.simdi, ozelGundeMi)) ekle('cuma', k.zaman.getTime());
        });
    }

    // ── Nafile ──
    if (koordinat && g.nafile) {
        const ayar = g.nafile;
        guvenli(() => {
            // Servisle AYNI seçenekler: Android'de nafile alarm payı üreticide keser (#273).
            const secenekler = {
                ...nafilePlanSecenekleri(ayar),
                ...(android ? { alarmButcesi: ANDROID_NAFILE_PAYI } : {}),
            };
            const plan = nafilePlaniOlustur(koordinat, ayar, g.simdi, tarihiISOFormatinaCevir(g.simdi), ozelGundeMi, secenekler);
            for (const k of plan) {
                ekle('nafile', k.zaman.getTime());
                if (android && nafileAnonsAlarmiKurarMi(k)) ekle('anons', k.zaman.getTime(), 'alarm');
            }
        });
    }

    // ── Gün sonu seri hatırlatması ── (konum yoksa servis 04:00 fallback'iyle kurar)
    if (g.gunSonu?.gunSonuBildirimAktif) {
        const ayar = g.gunSonu;
        guvenli(() => {
            const konum = koordinat ? new Coordinates(koordinat.lat, koordinat.lng) : null;
            const params = CalculationMethod.Turkey();
            const plan = gunSonuPlaniOlustur({
                simdi: g.simdi,
                ayarlar: ayar,
                imsakSaglayici: (t: Date) => (konum ? new PrayerTimes(konum, t, params).fajr ?? null : null),
                gunSayisi: GUN_SONU_PLAN_GUN_SAYISI[g.platform],
                gunAtlanirMi: ozelGundeMi,
            });
            for (const t of plan) ekle('gunSonu', t.an.getTime());
        });
    }

    // ── Vakit sayacı (yalnız Android, notifee) ──
    if (android && koordinat && g.vakitSayaci?.aktif) {
        const sayac = g.vakitSayaci;
        guvenli(() => {
            const matris = g.muhafiz?.matris;
            const plan = sayacPlaniOlustur({
                vakitler,
                simdi: g.simdi,
                baslangicEsikleri: matris ? sayacBaslangicEsikleriHesapla(sayac.sayacBaslangicSeviyesi, matris) : undefined,
                muhafizAktif: g.muhafiz?.aktif === true,
                muhafizUyarilanVakitler: matris ? muhafizUyarilanVakitleriBul(matris) : undefined,
                kilindiMi,
                ozelGundeMi,
            });
            for (const k of plan) {
                if (k.baslangicTetikMs !== null) ekle('sayac', k.baslangicTetikMs);
                ekle('sayac', k.temizlemeMs);
            }
        });
    }

    // ── Widget dakika alarmı (Android) ──
    if (android && g.widget !== false) ekle('widget', simdiMs + 60_000, 'alarm');

    return kayitlar.sort((a, b) => a.zamanMs - b.zamanMs);
}

/** Platformun SAYDIĞI kayıtlar: iOS'ta yalnız bildirimler, Android'de tüm havuz. */
export const sayilanKayitlar = (kayitlar: readonly DefterKaydi[], platform: BildirimPlatformu): DefterKaydi[] =>
    platform === 'ios' ? kayitlar.filter((k) => k.tur === 'bildirim') : [...kayitlar];

export type ButceDurumu = 'normal' | 'yakin' | 'asim';

export interface DefterOzeti {
    platform: BildirimPlatformu;
    sinir: number;
    /** Bekleyen (sayılan) toplam. */
    toplam: number;
    /** Kaynak başına bekleyen — yalnız sıfırdan büyükler, gösterim sırasıyla. */
    kaynaklar: { kaynak: DefterKaynagi; sayi: number }[];
    /** Sistemin (ya da bizim bütçemizin) atacağı, yani GELMEYECEK kayıt sayısı. */
    gelmeyecek: number;
    durum: ButceDurumu;
    /** 0..1 — çubuk doluluğu. */
    oran: number;
    /** Kart görünsün mü? iOS: daima; Android: yalnız 400+ ya da aşımda. */
    kartGorunur: boolean;
}

/** Defteri platformun sınırına göre özetler. */
export function defterOzeti(kayitlar: readonly DefterKaydi[], platform: BildirimPlatformu): DefterOzeti {
    const sayilan = sayilanKayitlar(kayitlar, platform);
    const sinir = platformSiniri(platform);
    const toplam = sayilan.length;

    const sayac = new Map<DefterKaynagi, number>();
    for (const k of sayilan) sayac.set(k.kaynak, (sayac.get(k.kaynak) ?? 0) + 1);
    const kaynaklar = DEFTER_KAYNAK_SIRASI.filter((k) => (sayac.get(k) ?? 0) > 0).map((kaynak) => ({
        kaynak,
        sayi: sayac.get(kaynak) as number,
    }));

    let gelmeyecek = Math.max(0, toplam - sinir);
    if (platform === 'android') {
        // Muhafız kendi payını (360) aşarsa teslimci en uzak tetikleri keser.
        const muhafizAlarm = (sayac.get('muhafiz') ?? 0) + (sayac.get('anons') ?? 0);
        gelmeyecek = Math.max(gelmeyecek, muhafizAlarm - ANDROID_MUHAFIZ_PAYI);
    }

    const yakinEsik = platform === 'ios' ? sinir * YAKINLIK_ORANI : ANDROID_UYARI_ESIGI;
    const durum: ButceDurumu = gelmeyecek > 0 ? 'asim' : toplam >= yakinEsik ? 'yakin' : 'normal';

    return {
        platform,
        sinir,
        toplam,
        kaynaklar,
        gelmeyecek,
        durum,
        oran: sinir > 0 ? Math.min(1, toplam / sinir) : 0,
        kartGorunur: platform === 'ios' ? toplam > 0 || gelmeyecek > 0 : durum !== 'normal',
    };
}

/** Kısayol: girdiden doğrudan özet. */
export const defterOzetiHesapla = (g: DefterGirdisi): DefterOzeti =>
    defterOzeti(bildirimDefteriOlustur(g), g.platform);
