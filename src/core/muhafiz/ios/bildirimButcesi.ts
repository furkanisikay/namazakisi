/**
 * iOS BILDIRIM BUTCESI — 64 bekleyen bildirim siniri.
 *
 * iOS bir uygulamanin BEKLEYEN yerel bildirim sayisini **64** ile sinirlar:
 * sistem en yakin tarihli 64 tanesini tutar, GERISINI SESSIZCE ATAR. Ne bir
 * hata doner ne de bir uyari cikar — plan "kuruldu" gorunur, bildirim gelmez.
 *
 * ---------------------------------------------------------------------------
 * BUTCE NEDEN URETICIDE DEGIL, TESLIMDE?
 *
 * `vakitUyariPlaniOlustur` (uretici) SEYRELTILMEZ. Bu, bu projenin pahali
 * derslerinden biri: butce ureticiye konursa arka plan seyrelir ama on plan
 * (`NamazMuhafiziServisi.kontrolEt`) ve onizleme (`AkisOnizlemeModal`) ham
 * plandan beslenmeye devam eder → ekranda gorunen akis ile cihazda gerceklesen
 * akis AYRISIR. Ayni ders `planButcesi.ts`'te de kayitli (cift-anons dersi).
 *
 * Bu yuzden kisitlama YALNIZ teslim katmanindadir ve KESILEN SAYISI RAPORLANIR
 * (sistemin sessizce atmasi yerine bizim bilerek kesmemiz) — cagiran bunu
 * loglar, Tani raporunda gorunur.
 *
 * ---------------------------------------------------------------------------
 * SAF modul: `react-native`/`expo-*` import etmez, `Date.now()` cagirmaz.
 * Zaman ve dis dunya PARAMETREDIR.
 */

import { IOS_BEKLEYEN_TAVANI, IOS_GUVENLIK_PAYI, IOS_YEDEK_REZERVI } from '../../bildirim/butceSabitleri';

/**
 * iOS'un uygulama basina bekleyen yerel bildirim tavani ve guvenlik payi —
 * TEK KAYNAK `core/bildirim/butceSabitleri.ts` (rehber ekrani da oradan okur).
 */
export { IOS_BEKLEYEN_TAVANI, IOS_GUVENLIK_PAYI, IOS_YEDEK_REZERVI };

/**
 * Plan ufku: BUGUN + (yalniz butce artigi olarak) YARININ IMSAGI.
 *
 * iOS'ta guvenilir arka plan tazelemesi yok (`BGTaskScheduler` firsatcidir); tek
 * guvenilir an uygulamanin on plana gelisidir. Aksam uygulamayi acip sabaha kadar
 * acmayan kullanicinin imsak uyarisi bu yuzden yarinin imsagindan gelir — ama 64
 * siniri bugunle PAYLASILDIGI icin o vakit yalniz kalan slota girer
 * (`muhafizTeslimPlani.yarininImsagiKipi`, `yedekKapasitesiHesapla`). Iki gunluk tam
 * plan (eski `IOS_PLAN_GUN_SAYISI = 2` hedefi) bilincli olarak KURULMADI: yogun
 * kurulumu kalici asima iter ve rehberin onerileri bunu geri alamaz.
 */

/**
 * Bugunun plani `bugunMuhafiz` bildirim kullaniyorken yarinin imsagina (butce artigi)
 * kac bildirim kalir? Teslimcinin sayacinin (`yedekSigarMi`) kapali formu — bildirim
 * defteri ayni sayiyi buradan alir.
 *
 * @param slot `kullanilabilirSlotHesapla` sonucu (muhafiza kalan slot).
 */
export function yedekKapasitesiHesapla(slot: number, bugunMuhafiz: number): number {
    return Math.max(0, slot - Math.max(0, bugunMuhafiz) - IOS_YEDEK_REZERVI);
}

/**
 * Teslim aninda: kalan slotla bir butce artigi bildirimi daha kurulabilir mi?
 * Bugunun plani once tuketir (cagrilar kronolojik), artik `IOS_YEDEK_REZERVI`
 * kadar slotu daima bos birakir.
 */
export const yedekSigarMi = (kalanSlot: number): boolean => kalanSlot > IOS_YEDEK_REZERVI;

/** Butceye girecek asgari teslim sekli. */
export interface ButceAdayi {
    /** Tetik ani (epoch ms) — kesme KRONOLOJIKtir. */
    zamanMs: number;
    /**
     * 'alarm' turu butceye SAYILMAZ: AlarmKit alarmlari (Faz 3) 64 sinirina
     * tabi degildir, ayri bir sistem kuyrugunda yasarlar.
     */
    tur: 'bildirim' | 'alarm';
}

export interface ButceSonucu<T> {
    tutulan: T[];
    kesilen: T[];
    /** Bilgi amacli: butceye sayilan (yani 'bildirim' turu) aday sayisi. */
    sayilanAday: number;
}

/**
 * Kullanilabilir slot sayisini hesapla.
 *
 * @param muhafizDisiBekleyen Muhafiz DISINDAKI bekleyen bildirim sayisi
 *        (calisma aninda `getAllScheduledNotificationsAsync` ile olculur).
 */
export function kullanilabilirSlotHesapla(muhafizDisiBekleyen: number): number {
    const slot = IOS_BEKLEYEN_TAVANI - muhafizDisiBekleyen - IOS_GUVENLIK_PAYI;
    return slot > 0 ? slot : 0;
}

/**
 * Adaylari butceye sigdir — EN YAKIN olanlar tutulur.
 *
 * Kronolojik kesme bilincli: sistem de en yakin 64'u tutar, yani bizim kesme
 * olcutumuz sistemin olcutuyle AYNI olmali. Farkli olsaydi "biz tuttuk ama
 * sistem atti" durumu dogar ve kesilen sayisi yalan soylerdi.
 *
 * Girdi sirasi ONEMSIZDIR (fonksiyon kendi siralar) ve girdi dizisi
 * DEGISTIRILMEZ.
 */
export function butceyeSigdir<T extends ButceAdayi>(
    adaylar: T[],
    kullanilabilirSlot: number
): ButceSonucu<T> {
    const sirali = [...adaylar].sort((a, b) => a.zamanMs - b.zamanMs);

    const tutulan: T[] = [];
    const kesilen: T[] = [];
    let kullanilan = 0;

    for (const aday of sirali) {
        // Alarm turu butceyi yemez → kosulsuz tutulur.
        if (aday.tur === 'alarm') {
            tutulan.push(aday);
            continue;
        }
        if (kullanilan < kullanilabilirSlot) {
            tutulan.push(aday);
            kullanilan++;
        } else {
            kesilen.push(aday);
        }
    }

    return {
        tutulan,
        kesilen,
        sayilanAday: sirali.filter((a) => a.tur === 'bildirim').length,
    };
}
