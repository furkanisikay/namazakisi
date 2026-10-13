/**
 * Nafile namaz pencereleri (issue #77) — SAF hesap.
 *
 * adhan'a bağımlı DEĞİLDİR: girdi o günün hazır vakitleridir (`GunVakitleri`),
 * böylece testler mevsim/konum kurmadan deterministik çalışır. Vakitleri adhan
 * ile üreten köprü `gunVakitleri.ts`'tedir.
 *
 * FIKIH (Diyanet Din İşleri Yüksek Kurulu fetvaları; Fable incelemesiyle onaylandı):
 * - Kuşluk (Duhâ): güneşin doğuşundan ~40-50 dk sonra başlar, öğle vaktine ~10 dk
 *   kalana kadar sürer. İŞRAK ayrı bir pencere DEĞİLDİR — kuşluğun ilk vaktidir.
 *   Faziletli an: gündüzün ilk dörtte biri ("sıcağın yakmaya başladığı an",
 *   TDV "Kuşluk Namazı"); örfî gündüz güneş → akşam kabul edilir.
 * - Evvâbîn: akşam namazından sonra, yatsıya kadar.
 * - Teheccüd: yatsıdan sonra uyuyup kalkarak, imsaka kadar. Faziletli an gecenin
 *   son üçte biridir; Hanefî gece tanımıyla akşam → ertesi imsak üzerinden
 *   hesaplanır (adhan `SunnahTimes.lastThirdOfTheNight` ile birebir).
 *
 * SABİTLER `KAZA_SABITLERI.MEKRUH_TOLERANS_DK` (20) ile AYNI DEĞİLDİR — bilinçli:
 * kaza ekranındaki kerahat uyarısı "pratik uyarı"dır; nafile göstergesi ise bir
 * BAŞLATICI öneridir ve Diyanet'in ihtiyatlı ucunu kullanır (40-50 → 45; 10).
 */

import type { NafileTuru, TeheccudPenceresi } from './nafileTipleri';

export const NAFILE_SABITLERI = {
    /** Şuruk kerahatinin çıkışı: güneş doğuşundan sonra (Diyanet 40-50 dk; ihtiyatlı uç). */
    SURUK_SONRASI_DK: 45,
    /** İstiva kerahatinin başlangıcı: öğle vaktinden önce (Diyanet ~10 dk). */
    ISTIVA_ONCESI_DK: 10,
} as const;

const DK = 60 * 1000;

/** Bir günün farz vakitleri (giriş anları). Repoda ortak tip yok; yapısal uyum yeter. */
export interface GunVakitleri {
    imsak: Date;
    gunes: Date;
    ogle: Date;
    ikindi: Date;
    aksam: Date;
    yatsi: Date;
}

export interface NafilePencere {
    tur: NafileTuru;
    baslangic: Date;
    bitis: Date;
    /** Göstergede "en faziletli" olarak anılan an. */
    faziletli: Date;
}

/**
 * Bir GÜNÜN nafile pencereleri, kronolojik sırada.
 *
 * Teheccüd gece yarısını aşar: "bu günün gecesi" = bu günün yatsısı → ertesi
 * günün imsakı. Gece yarısından sonra (aktif gün = dün) çağıran, DÜNÜN
 * vakitlerini ve BUGÜNÜN imsakını geçmelidir — taban daima aktif gündür.
 *
 * Kuşluk penceresi boş kalırsa (aşırı enlem; başı ≥ sonu) listeye girmez.
 */
export function nafilePencereleriHesapla(gun: GunVakitleri, ertesiImsak: Date): NafilePencere[] {
    const pencereler: NafilePencere[] = [];

    const kuslukBasi = new Date(gun.gunes.getTime() + NAFILE_SABITLERI.SURUK_SONRASI_DK * DK);
    const kuslukSonu = new Date(gun.ogle.getTime() - NAFILE_SABITLERI.ISTIVA_ONCESI_DK * DK);
    if (kuslukBasi.getTime() < kuslukSonu.getTime()) {
        const gunduzCeyregi = gun.gunes.getTime() + (gun.aksam.getTime() - gun.gunes.getTime()) / 4;
        pencereler.push({
            tur: 'kusluk',
            baslangic: kuslukBasi,
            bitis: kuslukSonu,
            faziletli: new Date(
                Math.min(kuslukSonu.getTime(), Math.max(kuslukBasi.getTime(), gunduzCeyregi))
            ),
        });
    }

    if (gun.aksam.getTime() < gun.yatsi.getTime()) {
        pencereler.push({
            tur: 'evvabin',
            baslangic: gun.aksam,
            bitis: gun.yatsi,
            faziletli: gun.aksam,
        });
    }

    if (gun.yatsi.getTime() < ertesiImsak.getTime()) {
        pencereler.push({
            tur: 'teheccud',
            baslangic: gun.yatsi,
            bitis: ertesiImsak,
            faziletli: gecininSonUcteBiri(gun.aksam, ertesiImsak),
        });
    }

    return pencereler;
}

/** Gecenin son üçte birinin başı: akşam + 2/3 × (ertesi imsak − akşam). */
export function gecininSonUcteBiri(aksam: Date, ertesiImsak: Date): Date {
    const gece = ertesiImsak.getTime() - aksam.getTime();
    return new Date(aksam.getTime() + Math.round((gece * 2) / 3));
}

/**
 * Teheccüdün HATIRLATMA penceresi (issue #273): kullanıcı seçimine göre
 * pencerenin başı ya yatsıdır ya gecenin son üçte biri; sonu daima imsaktır.
 * Diğer nafilelerde pencere aynen döner.
 *
 * Son üçte bir başı DAKİKAYA AŞAĞI yuvarlanır: motor dakika tamsayılarıyla
 * çalışır (`pencereUzunluguDk`) ve pencere dakika hizalı değilse tetikler kesirli
 * dakikalara düşerdi. Göstergede (`saatMetni`) zaten dakika gösterilir.
 */
export function teheccudPenceresiniUygula(p: NafilePencere, secim: TeheccudPenceresi): NafilePencere {
    if (p.tur !== 'teheccud' || secim === 'yatsi') return p;
    const bas = Math.floor(p.faziletli.getTime() / DK) * DK;
    // Aşırı enlemde (son üçte bir yatsıdan önce) pencere yatsıdan başlar.
    return { ...p, baslangic: new Date(Math.max(p.baslangic.getTime(), bas)) };
}

export interface NafileDurumu {
    tur: NafileTuru;
    /** `aktif`: şu an pencere içinde; `sirada`: sıradaki pencere. */
    durum: 'aktif' | 'sirada';
    /** Aktifse pencere sonu, sıradaysa başlayacağı an. */
    an: Date;
}

/**
 * Gösterge için: şu an hangi nafile vakti içindeyiz, değilse sıradaki hangisi?
 *
 * Teheccüd, uyuyup kalkma şartı dakikayla modellenemeyeceği için yatsı girer
 * girmez DEĞİL, seçilen pencere (son üçte bir ya da yatsıdan) girince "aktif"
 * sayılır; öncesinde "sıradaki" olarak gösterilir.
 */
export function nafileDurumunuBul(
    pencereler: NafilePencere[],
    simdi: Date,
    teheccudPenceresi: TeheccudPenceresi
): NafileDurumu | null {
    const t = simdi.getTime();
    for (const ham of pencereler) {
        const p = teheccudPenceresiniUygula(ham, teheccudPenceresi);
        if (t < p.baslangic.getTime()) return { tur: p.tur, durum: 'sirada', an: p.baslangic };
        if (t < p.bitis.getTime()) return { tur: p.tur, durum: 'aktif', an: p.bitis };
    }
    return null;
}
