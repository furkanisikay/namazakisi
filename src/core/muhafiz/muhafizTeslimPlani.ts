/**
 * MUHAFIZ TESLİM PLANI — SAF (issue #298).
 *
 * `ArkaplanMuhafizServisi.planla` eskiden üç işi tek gövdede yapıyordu: vakitleri
 * hesapla → kılınmış/özel gün/geçmiş vakitleri ele → her vaktin uyarılarını
 * üret. Bildirim bütçesi rehberi (bildirim defteri) AYNI listeyi saymak zorunda;
 * ayrı bir "tahmin" fonksiyonu yazılsaydı ikiz ayrışır ve ekran "sığıyor"
 * derken cihaz keserdi. Bu yüzden üç iş buraya taşındı ve servis bu listeyi
 * teslimciye BİREBİR aktarır (sırası dahil — iOS bütçesi kronolojik çağrı
 * sırasına dayanır).
 *
 * Saf: `simdi` ENJEKTE edilir; `new Date()` yalnız gün sınırı tarihleri kurmak
 * için `simdi`den türetilir. adhan core'da zaten kullanılıyor (`nafile/gunVakitleri`).
 * Başlık/gövde metinleri (rastgele seçim) SERVİSTE kalır — defter metin saymaz.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../vakit/hesapParametreleri';
import type { VakitAdi } from '../types';
import type { MuhafizMatrisi, MuhafizVakti } from './matrisTipleri';
import { vakitUyariPlaniOlustur, type UyariPlani } from './motorAdaptoru';
import { VARSAYILAN_PENCERE_YONU, olcuDkHesapla, type PencereYonu } from './pencereTipleri';
import { pencereUzunluguDkHesapla } from './pencereUzunlugu';
import { muhafizBildirimIdOlustur } from './anonsKimligi';
import {
    saatUyandiriyorMu,
    telefonAnonsuKonusurMu,
    uyandirmaTelefonMs,
    type SaatTeslimBaglami,
} from '../saat/saatAyarlari';
import { muhafizUyandirmasiMi } from '../saat/uyandirmaKapisi';

/** Bir vaktin bugünkü penceresi. `tarih` vaktin AİT OLDUĞU gündür (yatsı dün olabilir). */
export interface MuhafizVakitZamani {
    vakit: VakitAdi;
    giris: Date;
    cikis: Date;
    /** YYYY-MM-DD */
    tarih: string;
    /**
     * Bu pencere `yarininImsagi` seçeneğiyle SONA eklenen yarının imsağı mı?
     * Yalnız o kayıtta `true` yazılır (alan yoksa bugünün planıdır). iOS'ta bu
     * vaktin uyarıları BÜTÇE ARTIĞIDIR ([yarininImsagiKipi]).
     */
    yarininImsagi?: true;
}

/** Teslimciye gidecek tek bir uyarının metinsiz hâli. */
export interface MuhafizTeslimAdayi {
    id: string;
    /** Tetik anı — daima `cikis − kalanDk`. */
    zaman: Date;
    uyari: UyariPlani;
    vakit: MuhafizVakitZamani;
    muhafizVakti: MuhafizVakti;
    yon: PencereYonu;
}

export interface MuhafizKoordinat {
    lat: number;
    lng: number;
}

const isoGun = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export interface MuhafizVakitSecenegi {
    /**
     * YARININ İMSAK vakti de listeye (SONA) eklensin mi? Yalnız muhafız teslim planı
     * (`ArkaplanMuhafizServisi` + bildirim defterinin muhafız kaynağı) açar.
     *
     * NEDEN (issue #74, Fable M2): ufuk "bugün" iken akşam uygulamayı açan kişinin
     * yarınki sabah hatırlatması (gerçek alarm dahil) ancak gece yarısından sonraki ilk
     * turda (15 dk görevi) kurulur — OEM görevi öldürürse HİÇ kurulmaz ve kişi sabah
     * namazına uyandırılmaz. Yarının imsağı TÜM adımlarıyla eklenir (yalnız alarmlı
     * adımla sınırlamak, ekranın gösterdiği akıştan sapan yarım bir plan üretirdi).
     * Liste kronolojik kalır; iki platformun bütçesi de kronolojik kestiği için sığmazsa
     * ilk düşen o olur (bugünün uyarılarından önce). iOS'ta ayrıca BÜTÇE ARTIĞIDIR.
     *
     * Hangi platformda açık olduğu TEK yerden: [yarininImsagiPlanlanirMi].
     * Vakit sayacı (`VakitSayacBildirimServisi`) bunu AÇMAZ: kendi ufku ayrıdır.
     */
    yarininImsagi?: boolean;
}

/**
 * Yarının imsağı bu platformda NASIL planlanır? TEK KARAR KAYNAĞI: servis
 * (`teslimci.ad`) ve bildirim defteri (`g.platform`) aynı cevabı buradan alır —
 * ayrışırsa rehber cihazdan farklı sayar.
 *
 *   'yok'         → planlanmaz (bugün hiçbir platform; ufuk yalnız bugün olurdu).
 *   'tam'         → Android: bugünün planıyla eşit haklı. Gerçek alarm (`setAlarmClock`)
 *                   ve 360'lık pay oradadır; pay kronolojik kestiği için sığmazsa ilk
 *                   düşen yine o olur ve rehber bunu "gelmeyecek" sayar (#74 M2).
 *   'butceArtigi' → iOS: 64 bekleyen bildirim sınırı bütün gün için paylaşılır. Yarının
 *                   imsağı yalnız BUGÜNÜN planı sığdıktan SONRA kalan slota (bir yedek
 *                   payı bırakılarak — `IOS_YEDEK_REZERVI`) kronolojik girer; sığmayan
 *                   kısmı kayıp DEĞİLDİR, rehberde "gelmeyecek"/aşım sayılmaz. Eskiden
 *                   iOS'ta hiç planlanmıyordu: akşam uygulamayı açıp sabaha kadar açmayan
 *                   kullanıcının imsak uyarısı (background fetch güvenilmez) hiç
 *                   kurulmuyordu; tam hak verilseydi yoğun kurulum kalıcı aşıma düşer ve
 *                   rehberin hiçbir önerisi bunu geri alamazdı. Kronolojik sıra bilinçli:
 *                   yedeğin değeri ilk uyarının kişiyi uyandırmasıdır, uygulama açılınca
 *                   plan zaten tamamen yeniden kurulur. AlarmKit alarmı (gerçek alarm)
 *                   64 sınırına sayılmadığı için yarının imsağında da daima kurulur.
 */
export type YarininImsagiKipi = 'yok' | 'tam' | 'butceArtigi';

export const yarininImsagiKipi = (platform: 'android' | 'ios'): YarininImsagiKipi =>
    platform === 'android' ? 'tam' : 'butceArtigi';

/** Yarının imsağı bu platformda plana girer mi? (bugün iki platformda da evet — kip ayrışır.) */
export const yarininImsagiPlanlanirMi = (platform: 'android' | 'ios'): boolean =>
    yarininImsagiKipi(platform) !== 'yok';

/**
 * Bu pencerenin uyarıları bu platformda BÜTÇE ARTIĞI mı? (iOS teslimcisi ve defter
 * aynı kapıdan geçer.)
 */
export const butceArtigiMi = (vakit: Pick<MuhafizVakitZamani, 'yarininImsagi'>, platform: 'android' | 'ios'): boolean =>
    vakit.yarininImsagi === true && yarininImsagiKipi(platform) === 'butceArtigi';

/**
 * Bugünün (ve gerekiyorsa dünün sürmekte olan yatsısının) vakit pencereleri.
 *
 * Gece yarısını aşan yatsı: şu an imsaktan önceyse dünün yatsısı hâlâ aktiftir
 * ve listeye BAŞA eklenir → liste KRONOLOJİKTİR (iOS bütçesi buna dayanır).
 * `yarininImsagi` açıkken yarının imsağı SONA eklenir.
 */
export function muhafizVakitleriniHesapla(
    koordinat: MuhafizKoordinat,
    simdi: Date,
    secenek: MuhafizVakitSecenegi = {}
): MuhafizVakitZamani[] {
    const coordinates = new Coordinates(koordinat.lat, koordinat.lng);
    const params = turkiyeHesapParametreleri();

    const bugunTarih = new Date(simdi);
    const dunTarih = new Date(simdi);
    dunTarih.setDate(dunTarih.getDate() - 1);
    const yarinTarih = new Date(simdi);
    yarinTarih.setDate(yarinTarih.getDate() + 1);

    const bugun = new PrayerTimes(coordinates, bugunTarih, params);
    const dun = new PrayerTimes(coordinates, dunTarih, params);
    const yarin = new PrayerTimes(coordinates, yarinTarih, params);

    const bugunStr = isoGun(bugunTarih);
    const dunStr = isoGun(dunTarih);

    const vakitler: MuhafizVakitZamani[] = [];
    if (simdi < bugun.fajr) {
        vakitler.push({ vakit: 'yatsi', giris: dun.isha, cikis: bugun.fajr, tarih: dunStr });
    }
    vakitler.push(
        { vakit: 'imsak', giris: bugun.fajr, cikis: bugun.sunrise, tarih: bugunStr },
        { vakit: 'ogle', giris: bugun.dhuhr, cikis: bugun.asr, tarih: bugunStr },
        { vakit: 'ikindi', giris: bugun.asr, cikis: bugun.maghrib, tarih: bugunStr },
        { vakit: 'aksam', giris: bugun.maghrib, cikis: bugun.isha, tarih: bugunStr },
        { vakit: 'yatsi', giris: bugun.isha, cikis: yarin.fajr, tarih: bugunStr }
    );
    if (secenek.yarininImsagi) {
        vakitler.push({
            vakit: 'imsak',
            giris: yarin.fajr,
            cikis: yarin.sunrise,
            tarih: isoGun(yarinTarih),
            yarininImsagi: true,
        });
    }
    return vakitler;
}

export interface MuhafizPlanGirdisi {
    matris: MuhafizMatrisi;
    /**
     * Saat iş bölümü (saat W3). Verilmezse bugünkü davranış: telefon uyandırır ve konuşur.
     * Servis ve bildirim defteri AYNI değeri geçer (parite) — bkz. `vakitTeslimAdaylari`.
     */
    saat?: SaatTeslimBaglami;
    vakitler: MuhafizVakitZamani[];
    simdi: Date;
    /** Vaktin kendi gününe göre kılınmış mı? (`kilinanVakitleriAl` ile beslenir) */
    kilindiMi?: (tarih: string, vakit: VakitAdi) => boolean;
    /** Özel gün kapısı (issue #272) — vaktin GÜNÜNE uygulanır. */
    ozelGundeMi?: (tarih: string) => boolean;
}

/** Planlanacak (gelecekte, kılınmamış, özel gün olmayan) vakitler — sıra korunur. */
export function planlanacakMuhafizVakitleri(girdi: MuhafizPlanGirdisi): MuhafizVakitZamani[] {
    const { vakitler, simdi } = girdi;
    const kilindiMi = girdi.kilindiMi ?? (() => false);
    const ozelGundeMi = girdi.ozelGundeMi ?? (() => false);
    return vakitler.filter(
        (v) => v.cikis.getTime() > simdi.getTime() && !ozelGundeMi(v.tarih) && !kilindiMi(v.tarih, v.vakit)
    );
}

/** Tek bir vaktin teslim adayları (`ArkaplanMuhafizServisi.vakitIcinBildirimPlanla`'nın saf çekirdeği). */
export function vakitTeslimAdaylari(
    matris: MuhafizMatrisi,
    vakit: MuhafizVakitZamani,
    simdi: Date,
    saat?: SaatTeslimBaglami
): MuhafizTeslimAdayi[] {
    const cikisMs = vakit.cikis.getTime();
    if (cikisMs <= simdi.getTime()) return [];

    // 'gunes' muhafızda planlanmaz → matriste satırı yoktur.
    const muhafizVakti = vakit.vakit as MuhafizVakti;
    const vakitAyari = matris[muhafizVakti];
    if (!vakitAyari) return [];

    // Giriş yönünde motor `pencereUzunluguDk` OLMADAN hiç tetiklenmez; ön plan
    // (`NamazMuhafiziServisi`) aynı değeri hesaplar.
    const yon: PencereYonu = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
    const pencereUzunluguDk = pencereUzunluguDkHesapla(vakit.giris, vakit.cikis);
    const suankiOlcu = olcuDkHesapla(
        { kaynak: `vakit:${vakit.vakit}`, baslangic: vakit.giris, bitis: vakit.cikis, yon },
        simdi
    );

    const adaylar: MuhafizTeslimAdayi[] = [];
    const anonsKonusur = telefonAnonsuKonusurMu(saat);
    // Saat W3: uyandırma saatteyse telefonun yedeği özgün andan SONRA çalar (ya da saatte
    // ertelendiyse çok daha sonra). Motor taramayı "şu anki ölçü"den başlatır → özgün anı
    // geçmişte kalmış ama yedeği hâlâ gelecekte olan tetik HİÇ üretilmezdi ve [T, T+3 dk)
    // içindeki bir planlama turu yedeği sessizce silerdi. Bu yüzden saat uyandırırken
    // pencerenin TAMAMI taranır ve geçmiş süzgeci KAYDIRILMIŞ ana uygulanır. Varsayılan
    // yol (saat kapalı) birebir eskisi: tarama başlangıcı ve süzgeç değişmez.
    const saatUyandirir = !!saat && saatUyandiriyorMu(saat);
    const tarama = saatUyandirir ? (yon === 'girisindenItibaren' ? 1 : Number.MAX_SAFE_INTEGER) : suankiOlcu;
    for (const ham of vakitUyariPlaniOlustur(vakitAyari, tarama, { pencereUzunluguDk })) {
        const ozgunMs = cikisMs - ham.kalanDk * 60 * 1000;
        const id = muhafizBildirimIdOlustur(vakit.vakit, ham.seviye, vakit.tarih, ham.kalanDk);
        // Saat W3 — uyandırma: telefonun anı TEK kuraldan (`uyandirmaTelefonMs`): saatte
        // kapatıldıysa kurulmaz, ertelendiyse saatin yeni anının ardına, "saat" seçiliyse
        // birkaç dakika sonraya YEDEK. Kimlik DEĞİŞMEZ (kalanDk'dan türer).
        const zamanMs =
            saatUyandirir && muhafizUyandirmasiMi(vakit.vakit, ham)
                ? uyandirmaTelefonMs(saat, id, ozgunMs, cikisMs)
                : ozgunMs;
        // Geçmişe düşen (dakika yuvarlaması) atlanır — kaydırılmış ana göre.
        if (zamanMs === null || zamanMs <= simdi.getTime()) continue;
        // Saat W3 — anons "yalnız saatte": telefon TTS planlamaz (çift konuşma yok).
        // Bayrak burada kapanır ki teslimci, ön plan ve defter AYNI cevabı görsün.
        const uyari = anonsKonusur || !ham.sesliAnons ? ham : { ...ham, sesliAnons: false };
        adaylar.push({
            id,
            zaman: new Date(zamanMs),
            uyari,
            vakit,
            muhafizVakti,
            yon,
        });
    }
    return adaylar;
}

/** Bütün turun teslim adayları, teslimcinin göreceği SIRAYLA. */
export function muhafizTeslimPlaniOlustur(girdi: MuhafizPlanGirdisi): MuhafizTeslimAdayi[] {
    return planlanacakMuhafizVakitleri(girdi).flatMap((v) =>
        vakitTeslimAdaylari(girdi.matris, v, girdi.simdi, girdi.saat)
    );
}

/**
 * Android'de bu aday ayrıca bir sesli anons ALARMI kurar mı?
 * (`AndroidMuhafizTeslimcisi.anonsPlanla` kapısının saf ikizi.)
 */
export const anonsAlarmiKurarMi = (aday: Pick<MuhafizTeslimAdayi, 'uyari'>): boolean =>
    aday.uyari.sesliAnons === true &&
    typeof aday.uyari.anonsMetni === 'string' &&
    aday.uyari.anonsMetni.trim().length > 0;

/**
 * Android'de bu aday GERCEK ALARM (`setAlarmClock`) olarak mi teslim edilir?
 * (issue #74 — `AndroidMuhafizTeslimcisi.alarmPlanla` kapısının saf ikizi.)
 *
 * Alarm o tetiğin bildirimi + sesli anonsunun YERİNE geçer: alarm bildirimi tam
 * ekran/heads-up olarak zaten görünür, aynı anda TTS de konuşsaydı alarm sesinin
 * üstüne binerdi. Bu yüzden defter alarmlı adayı TEK alarm olarak sayar.
 */
export const alarmKurarMi = (aday: Pick<MuhafizTeslimAdayi, 'uyari'>): boolean => aday.uyari.alarm === true;
