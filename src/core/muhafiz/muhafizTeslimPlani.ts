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

/**
 * Bugünün (ve gerekiyorsa dünün sürmekte olan yatsısının) vakit pencereleri.
 *
 * Gece yarısını aşan yatsı: şu an imsaktan önceyse dünün yatsısı hâlâ aktiftir
 * ve listeye BAŞA eklenir → liste KRONOLOJİKTİR (iOS bütçesi buna dayanır).
 */
export function muhafizVakitleriniHesapla(koordinat: MuhafizKoordinat, simdi: Date): MuhafizVakitZamani[] {
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
