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
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import type { VakitAdi } from '../types';
import type { MuhafizMatrisi, MuhafizVakti } from './matrisTipleri';
import { vakitUyariPlaniOlustur, type UyariPlani } from './motorAdaptoru';
import { VARSAYILAN_PENCERE_YONU, olcuDkHesapla, type PencereYonu } from './pencereTipleri';
import { pencereUzunluguDkHesapla } from './pencereUzunlugu';
import { muhafizBildirimIdOlustur } from './anonsKimligi';

/** Bir vaktin bugünkü penceresi. `tarih` vaktin AİT OLDUĞU gündür (yatsı dün olabilir). */
export interface MuhafizVakitZamani {
    vakit: VakitAdi;
    giris: Date;
    cikis: Date;
    /** YYYY-MM-DD */
    tarih: string;
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
     * Liste kronolojik kalır; Android 360 bütçesi kronolojik kestiği için sığmazsa ilk
     * düşen o olur (bugünün uyarılarından önce).
     *
     * Hangi platformda açık olduğu TEK yerden: [yarininImsagiPlanlanirMi].
     * Vakit sayacı (`VakitSayacBildirimServisi`) bunu AÇMAZ: kendi ufku ayrıdır.
     */
    yarininImsagi?: boolean;
}

/**
 * Yarının imsağı bu platformda planlanır mı? Servis (`teslimci.ad`) ve bildirim defteri
 * (`g.platform`) AYNI cevabı buradan alır — ayrışırsa rehber cihazdan farklı sayar.
 *
 * YALNIZ ANDROID: gerçek alarm (`setAlarmClock`) ve 360'lık pay oradadır. iOS'ta 64
 * bekleyen bildirim sınırı bütün gün için paylaşılır; yarının imsağı (varsayılan matriste
 * ~10–20 bildirim) yoğun kurulumu sınırın üstüne iter ve bildirim sınırı rehberinin
 * HİÇBİR önerisi bunu geri alamaz (öneriler bugünün adımlarını seyreltir, yarın sabah
 * yine sığmaz) — "aşım" uyarısı kalıcı olurdu. iOS'ta gerçek alarm da yoktur (zamana
 * duyarlı bildirim), sabah uyandırmanın asıl değeri Android alarmındadır.
 */
export const yarininImsagiPlanlanirMi = (platform: 'android' | 'ios'): boolean => platform === 'android';

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
    const params = CalculationMethod.Turkey();

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
        vakitler.push({ vakit: 'imsak', giris: yarin.fajr, cikis: yarin.sunrise, tarih: isoGun(yarinTarih) });
    }
    return vakitler;
}

export interface MuhafizPlanGirdisi {
    matris: MuhafizMatrisi;
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
    simdi: Date
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
    for (const uyari of vakitUyariPlaniOlustur(vakitAyari, suankiOlcu, { pencereUzunluguDk })) {
        const zaman = new Date(cikisMs - uyari.kalanDk * 60 * 1000);
        // Geçmişe düşen (dakika yuvarlaması) atlanır.
        if (zaman.getTime() <= simdi.getTime()) continue;
        adaylar.push({
            id: muhafizBildirimIdOlustur(vakit.vakit, uyari.seviye, vakit.tarih, uyari.kalanDk),
            zaman,
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
    return planlanacakMuhafizVakitleri(girdi).flatMap((v) => vakitTeslimAdaylari(girdi.matris, v, girdi.simdi));
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
