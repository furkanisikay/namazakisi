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

/** iOS'un uygulama basina bekleyen yerel bildirim tavani. */
export const IOS_BEKLEYEN_TAVANI = 64;

/**
 * Guvenlik payi.
 *
 * Muhafiz disindaki tuketiciler (vakit bildirimleri, cuma) planlamayi bizden
 * SONRA da yapabilir; tavani tam doldurursak onlarin bildirimleri sessizce
 * dusuruluyor olurdu. Pay, yarisi bize degil onlara birakir.
 */
export const IOS_GUVENLIK_PAYI = 4;

/**
 * iOS'ta kac gun ileri planlanmali? — ⚠️ HENUZ BAGLI DEGIL (Faz 1 kapsam disi).
 *
 * HEDEF: Android 1 gun planlar cunku arka plan gorevi (15 dk) ve exact alarm
 * zinciri plani guvenilir sekilde tazeler. iOS'ta ikisi de yok:
 * `BGTaskScheduler` firsatcidir, hic kosmayabilir. Tek guvenilir tazeleme ani
 * uygulamanin ON PLANA GELISIDIR → kullanici uygulamayi bir gun hic acmazsa
 * plan tukenmesin diye pencerenin 2 gune cikmasi gerekir.
 *
 * BUGUNKU DURUM: `ArkaplanMuhafizServisi.bugunVakitleriniHesapla()` gun sayisi
 * parametresi ALMIYOR; iOS'ta plan da Android gibi YALNIZ BUGUNU kapsiyor.
 * Yani bu sabit su an hicbir yerden okunmuyor. Bilinen bedel: kullanici
 * uygulamayi bir gun hic acmazsa ertesi gun muhafiz bildirimi gelmez.
 *
 * BAGLARKEN DIKKAT: gun sayisi 1'den buyuk olunca (a) yarinin vakitleri icin
 * `kilinan` listesi bos kabul edilmeli, (b) bildirim id'leri vakit TARIHINI
 * tasidigi icin cakisma olmaz ama iptal zinciri iki gunu de taramali,
 * (c) teslim sirasi gun-gun uretilirse artik kronolojik OLMAZ → butce
 * `butceyeSigdir` ile toplu uygulanmali (bkz. `IosMuhafizTeslimcisi` on kosulu).
 */
export const IOS_PLAN_GUN_SAYISI = 2;

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
