/**
 * BİLDİRİM DEFTERİ — SAF (issue #298).
 *
 * Uygulamanın o an cihaza kuracağı (bekleteceği) TÜM bildirim ve alarmların
 * listesi. TEK KAYNAK KURALI: defter ayrı bir "tahmin" yapmaz, her kaynağın
 * GERÇEK plan üreticisini kuru çalıştırır — servisler de aynı üreticilerden
 * beslenir. Tahmin fonksiyonu yazılsaydı ikiz ayrışır, ekran "sığıyor" derken
 * cihaz sessizce keserdi.
 *
 *   muhafız         → `muhafizTeslimPlaniOlustur` (bugünün kalan vakitleri + yarının imsağı;
 *                     iOS'ta yarının imsağı BÜTÇE ARTIĞIDIR → `yedek` kayıt, kalan slota kadar)
 *   sesli anons     → aynı adaylar, `anonsAlarmiKurarMi` (yalnız Android)
 *   gerçek alarm    → aynı adaylar, `alarmKurarMi` (yalnız Android; o tetiğin
 *                     bildirimi + anonsunun YERİNE tek `setAlarmClock` — issue #74)
 *   vakit bildirimi → `vakitBildirimPlaniOlustur` (bugün + yarın)
 *   cuma            → `cumaPlaniOlustur` (4 cuma)
 *   camiye gitme    → `camiyeGitPlaniOlustur` (iOS 3, Android 7 gün; cuma öğlesi çakışması)
 *   nafile          → `nafilePlaniOlustur` (3 gün / 7 gece ya da günü gününe; gerçek
 *                     alarm adımı muhafızla aynı kuralla `alarm` sayılır)
 *   gün sonu        → `gunSonuPlaniOlustur` (iOS 3, Android 7 gün)
 *   yatış/muhasebe  → `yatisPlaniOlustur` (iOS 3, Android 7 namaz günü; issue #290)
 *   takvim çakışması → `takvimCakismaPlaniOlustur` (iOS 3, Android 7 gün; issue #291 —
 *                     etkinlikleri girdi olarak alır, takvimi kendisi okumaz)
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
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../vakit/hesapParametreleri';
import type { VakitAdi } from '../types';
import type { MuhafizMatrisi } from '../muhafiz/matrisTipleri';
import {
    alarmKurarMi,
    anonsAlarmiKurarMi,
    muhafizTeslimPlaniOlustur,
    muhafizVakitleriniHesapla,
    yarininImsagiPlanlanirMi,
    butceArtigiMi,
    type MuhafizVakitZamani,
} from '../muhafiz/muhafizTeslimPlani';
import { kullanilabilirSlotHesapla, yedekKapasitesiHesapla } from '../muhafiz/ios/bildirimButcesi';
import { nafileAlarmKurarMi, nafileAnonsAlarmiKurarMi, nafilePlaniOlustur, nafilePlanSecenekleri } from '../nafile/nafilePlani';
import type { NafileAyarlari } from '../nafile/nafileTipleri';
import { gunSonuPlaniOlustur, GUN_SONU_PLAN_GUN_SAYISI, type GunSonuPlanAyarlari } from '../seri/gunSonuPlani';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import { YATIS_PLAN_GUN_SAYISI, yatisPlaniOlustur, type YatisAyarlari } from '../yatis/yatisPlani';
import { muhafizUyarilanVakitleriBul, sayacBaslangicEsikleriHesapla } from '../utils/vakitSayacYardimcisi';
import { cumaPlaniOlustur, type CumaPlanAyarlari } from './cumaPlani';
import { camiyeGitPlaniOlustur, CAMIYE_GIT_PLAN_GUN_SAYISI, type CamiyeGitPlanAyarlari } from './camiyeGitPlani';
import { sayacPlaniOlustur } from './sayacPlani';
import { takvimCakismaPlaniOlustur, TAKVIM_CAKISMA_PLAN_GUN_SAYISI, type TakvimEtkinligi } from './takvimCakismaPlani';
import type { TakvimCakismaAyarlari } from '../takvimCakisma/takvimCakismaAyarlari';
import { vakitBildirimPlaniOlustur, type VakitBildirimPlanAyarlari } from './vakitBildirimPlani';
import {
    ANDROID_MUHAFIZ_PAYI,
    ANDROID_NAFILE_PAYI,
    IOS_ALARMKIT_MUHAFIZ_PAYI,
    IOS_ALARMKIT_NAFILE_PAYI,
    ANDROID_UYARI_ESIGI,
    YAKINLIK_ORANI,
    platformSiniri,
    type BildirimPlatformu,
} from './butceSabitleri';

export type DefterKaynagi =
    | 'muhafiz'
    | 'anons'
    | 'alarm'
    | 'vakitBildirimi'
    | 'cuma'
    | 'camiyeGit'
    | 'nafile'
    | 'gunSonu'
    | 'yatis'
    | 'takvimCakisma'
    | 'sayac'
    | 'widget';

/** Ekranda gösterim sırası. */
export const DEFTER_KAYNAK_SIRASI: DefterKaynagi[] = [
    'muhafiz',
    'anons',
    'alarm',
    'nafile',
    'vakitBildirimi',
    'cuma',
    'camiyeGit',
    'gunSonu',
    'yatis',
    'takvimCakisma',
    'sayac',
    'widget',
];

export interface DefterKaydi {
    kaynak: DefterKaynagi;
    zamanMs: number;
    /** 'bildirim' = bildirim tetiği (expo/notifee); 'alarm' = yalnız native alarm (anons, widget). */
    tur: 'bildirim' | 'alarm';
    /**
     * BÜTÇE ARTIĞI (iOS, yarının imsağı): teslimci yalnız bugünün planından kalan slota
     * kurar. Defter yalnız KURULACAK olanları tutar (`iosYedekleriSigdir`); özet onları
     * `toplam`/`gelmeyecek`/eşiklere KATMAZ, `yedek` olarak ayrıca söyler.
     */
    yedek?: true;
    /**
     * Kaydın PAYI başka bir teslimci örneğine aittir (Android nafile: `ANDROID_NAFILE_PAYI`,
     * üreticide kesilir). Nafilenin gerçek alarmı ve anons alarmı `alarm`/`anons`
     * kaynağında GÖRÜNÜR ama muhafızın 360'lık payına SAYILMAZ — sayılsaydı muhafız
     * 330 + nafile 40 alarmda defter 10 "gelmeyecek" der, sığan eklemeyi reddeder ve
     * muhafızı seyreltmeyi önerirdi; cihaz ise hepsini kurar. Toplam havuzda sayılır.
     */
    nafilePayi?: true;
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
    /** "Camide kılacağım" (issue #292). Cuma öğlesi çakışması `cuma.aktif`'ten okunur. */
    camiyeGit?: CamiyeGitPlanAyarlari | null;
    nafile?: NafileAyarlari | null;
    gunSonu?: (GunSonuPlanAyarlari & { gunSonuBildirimAktif: boolean }) | null;
    /** Yatış hatırlatması + gün sonu muhasebesi (issue #290). */
    yatis?: YatisAyarlari | null;
    /**
     * Takvim çakışması (issue #291): ayar + servisle AYNI süzgeçten geçmiş
     * etkinlikler (`TakvimEtkinlikOkuyucu`). İzin yoksa `null`.
     */
    takvimCakisma?: { ayarlar: Pick<TakvimCakismaAyarlari, 'aktif' | 'oncedenDk'>; etkinlikler: readonly TakvimEtkinligi[] } | null;
    /** Vakit sayacı ayarı (Android). Eşikler muhafız matrisinden türer. */
    vakitSayaci?: { aktif: boolean; sayacBaslangicSeviyesi?: number } | null;
    /** Android ana ekran widget'ının dakika alarmı sayılsın mı? (varsayılan: Android'de evet) */
    widget?: boolean;
    /**
     * iOS: AlarmKit (iOS 26) izinli mi? Öyleyse gerçek alarm tetiği SİSTEM ALARMI olarak
     * kurulur ve 64 bekleyen bildirim sınırına SAYILMAZ (issue #74). Verilmezse bildirim.
     */
    iosAlarmKit?: boolean;
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
    const ekle = (
        kaynak: DefterKaynagi,
        zamanMs: number,
        tur: DefterKaydi['tur'] = 'bildirim',
        yedek = false,
        nafilePayi = false
    ) => {
        if (zamanMs > simdiMs) {
            kayitlar.push({
                kaynak,
                zamanMs,
                tur,
                ...(yedek ? { yedek: true as const } : {}),
                ...(nafilePayi ? { nafilePayi: true as const } : {}),
            });
        }
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
            // Servisle AYNI ufuk: yarının imsağı dahil (issue #74 M2; iOS'ta bütçe artığı).
            // Sayaç planı aşağıda yarınsız `vakitler`'i kullanır — onun ufku ayrıdır.
            const muhafizVakitleri = muhafizVakitleriniHesapla(koordinat, g.simdi, {
                yarininImsagi: yarininImsagiPlanlanirMi(g.platform),
            });
            // iOS AlarmKit tavanı (teslimciyle AYNI pay, kronolojik): fazlası bildirim.
            let iosAlarm = 0;
            for (const aday of muhafizTeslimPlaniOlustur({
                matris,
                vakitler: muhafizVakitleri,
                simdi: g.simdi,
                kilindiMi,
                ozelGundeMi,
            })) {
                // Gerçek alarm (issue #74) Android'de o tetiğin bildirimi + anonsunun
                // YERİNE geçer → tek alarm sayılır. iOS'ta AlarmKit izinliyse yine alarm
                // (64 sınırına sayılmaz — `tur: 'alarm'`), değilse bildirim olarak kalır.
                const iosAlarmKurulur =
                    !android && g.iosAlarmKit === true && aday.zaman.getTime() > simdiMs && iosAlarm < IOS_ALARMKIT_MUHAFIZ_PAYI;
                if ((android || iosAlarmKurulur) && alarmKurarMi(aday)) {
                    if (!android) iosAlarm++;
                    ekle('alarm', aday.zaman.getTime(), 'alarm');
                    continue;
                }
                ekle('muhafiz', aday.zaman.getTime(), 'bildirim', butceArtigiMi(aday.vakit, g.platform));
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

    // ── "Camide kılacağım" (servisle AYNI seçenekler) ──
    if (koordinat && g.camiyeGit?.aktif) {
        const ayar = g.camiyeGit;
        guvenli(() => {
            const plan = camiyeGitPlaniOlustur(koordinat, ayar, g.simdi, {
                gunSayisi: CAMIYE_GIT_PLAN_GUN_SAYISI[g.platform],
                gunAtlanirMi: ozelGundeMi,
                cumaHatirlatmasiAcik: g.cuma?.aktif === true,
            });
            for (const k of plan) ekle('camiyeGit', k.zaman.getTime());
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
            let iosAlarm = 0;
            for (const k of plan) {
                // Gerçek alarm (issue #74, nafilede de standart): muhafızla AYNI kural —
                // Android'de bildirim + anonsun YERİNE tek alarm, iOS'ta AlarmKit izinliyse
                // (ve nafile payı dolmadıysa) alarm (64 sınırına sayılmaz), değilse bildirim.
                const iosAlarmKurulur = !android && g.iosAlarmKit === true && iosAlarm < IOS_ALARMKIT_NAFILE_PAYI;
                if ((android || iosAlarmKurulur) && nafileAlarmKurarMi(k)) {
                    if (!android) iosAlarm++;
                    // Payı nafilenin (`ANDROID_NAFILE_PAYI`), muhafızın 360'ına sayılmaz.
                    ekle('alarm', k.zaman.getTime(), 'alarm', false, true);
                    continue;
                }
                ekle('nafile', k.zaman.getTime());
                if (android && nafileAnonsAlarmiKurarMi(k)) ekle('anons', k.zaman.getTime(), 'alarm', false, true);
            }
        });
    }

    // ── Gün sonu seri hatırlatması ── (konum yoksa servis 04:00 fallback'iyle kurar)
    if (g.gunSonu?.gunSonuBildirimAktif) {
        const ayar = g.gunSonu;
        guvenli(() => {
            const konum = koordinat ? new Coordinates(koordinat.lat, koordinat.lng) : null;
            const params = turkiyeHesapParametreleri();
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

    // ── Yatış hatırlatması + gün sonu muhasebesi ── (konum yoksa servis kurmaz)
    if (koordinat && g.yatis?.aktif) {
        const ayar = g.yatis;
        guvenli(() => {
            const plan = yatisPlaniOlustur({
                koordinat,
                ayarlar: ayar,
                simdi: g.simdi,
                gunSayisi: YATIS_PLAN_GUN_SAYISI[g.platform],
                kilinanlar: (gun) => g.kilinan?.[gun] ?? [],
                gunAtlanirMi: ozelGundeMi,
            });
            for (const k of plan) ekle('yatis', k.zaman.getTime());
        });
    }

    // ── Takvim çakışması uyarısı ── (konum yoksa servis kurmaz)
    if (koordinat && g.takvimCakisma?.ayarlar.aktif) {
        const girdi = g.takvimCakisma;
        guvenli(() => {
            const plan = takvimCakismaPlaniOlustur({
                koordinat,
                ayarlar: girdi.ayarlar,
                simdi: g.simdi,
                gunSayisi: TAKVIM_CAKISMA_PLAN_GUN_SAYISI[g.platform],
                etkinlikler: girdi.etkinlikler,
                kilinanlar: (gun) => g.kilinan?.[gun] ?? [],
                gunAtlanirMi: ozelGundeMi,
            });
            for (const k of plan) ekle('takvimCakisma', k.zaman.getTime());
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

    kayitlar.sort((a, b) => a.zamanMs - b.zamanMs);
    return android ? kayitlar : iosYedekleriSigdir(kayitlar);
}

/**
 * iOS: bütçe artığını (yarının imsağı) teslimcinin kuracağı kadarına indirir —
 * `IosMuhafizTeslimcisi`'nin sayacının (`yedekSigarMi`) kapalı formu. Muhafız dışı
 * bildirimler slotu belirler, bugünün muhafız planı önce tüketir, yedek KRONOLOJİK
 * kalan yere girer. Sığmayan yedek kayıp değildir → defterden düşer.
 * Girdi KRONOLOJİK olmalı; tekrar uygulanabilir (tutulan önek yeniden kırpılır).
 */
export function iosYedekleriSigdir(kayitlar: DefterKaydi[]): DefterKaydi[] {
    if (!kayitlar.some((k) => k.yedek)) return kayitlar;
    const bildirimler = kayitlar.filter((k) => k.tur === 'bildirim');
    const bugunMuhafiz = bildirimler.filter((k) => k.kaynak === 'muhafiz' && !k.yedek).length;
    const muhafizDisi = bildirimler.filter((k) => k.kaynak !== 'muhafiz').length;
    let kalan = yedekKapasitesiHesapla(kullanilabilirSlotHesapla(muhafizDisi), bugunMuhafiz);
    return kayitlar.filter((k) => {
        if (!k.yedek) return true;
        if (kalan <= 0) return false;
        kalan--;
        return true;
    });
}

/**
 * Platformun SAYDIĞI kayıtlar: iOS'ta yalnız bildirimler, Android'de tüm havuz.
 * Bütçe artığı (`yedek`) SAYILMAZ: yalnız boş yere girer, sınırı zorlayamaz.
 */
export const sayilanKayitlar = (kayitlar: readonly DefterKaydi[], platform: BildirimPlatformu): DefterKaydi[] =>
    platform === 'ios' ? kayitlar.filter((k) => k.tur === 'bildirim' && !k.yedek) : kayitlar.filter((k) => !k.yedek);

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
    /**
     * Bugünün planından kalan yere ayrıca kurulan bütçe artığı (iOS: yarının imsağı).
     * `toplam`'a, eşiklere ve `gelmeyecek`'e KATILMAZ; yer gerektiğinde ilk o çekilir.
     */
    yedek: number;
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
        // Muhafız kendi payını (360) aşarsa teslimci en uzak tetikleri keser. Nafilenin
        // alarm/anonsları AYRI teslimci örneğinin AYRI payındadır (`nafilePayi`).
        const muhafizAlarm = sayilan.filter(
            (k) => !k.nafilePayi && (k.kaynak === 'muhafiz' || k.kaynak === 'anons' || k.kaynak === 'alarm')
        ).length;
        gelmeyecek = Math.max(gelmeyecek, muhafizAlarm - ANDROID_MUHAFIZ_PAYI);
    } else {
        // iOS teslimcisi muhafıza `64 − muhafız dışı − güvenlik payı` slot bırakır
        // (`IosMuhafizTeslimcisi.hazirla`); toplam 64'ün altında kalsa da muhafız
        // o slotu aşarsa uyarılar PLANLANMAZ. Android 360 payının ikizi.
        const muhafiz = sayac.get('muhafiz') ?? 0;
        if (muhafiz > 0) {
            gelmeyecek = Math.max(gelmeyecek, muhafiz - kullanilabilirSlotHesapla(toplam - muhafiz));
        }
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
        yedek: kayitlar.filter((k) => k.yedek && (platform === 'android' || k.tur === 'bildirim')).length,
    };
}

/** Kısayol: girdiden doğrudan özet. */
export const defterOzetiHesapla = (g: DefterGirdisi): DefterOzeti =>
    defterOzeti(bildirimDefteriOlustur(g), g.platform);
