/**
 * Nafile hatırlatma PLANI — SAF üretici (issue #77; #298'de servisten taşındı;
 * #273'te adımlı/kanallı modele geçti).
 *
 * Bildirim defteri (`core/bildirim/bildirimDefteri.ts`) ve
 * `NafileHatirlatmaServisi` AYNI fonksiyonu çağırır: ekranda sayılan ile
 * cihazda kurulan ayrışamaz. Yeni bir eleme/kesme kuralı buraya eklenir,
 * servise DEĞİL.
 *
 * AYRI PLAN MOTORU YAZILMAZ (Fable kararı, #273): her nafile penceresi muhafızın
 * bir vakti gibi `vakitUyariPlaniOlustur`'a verilir — yön, eşik, sıklık, plan
 * bütçesi (adım başına en fazla 15 tetik) ve "kılana kadar" kuralı muhafızla
 * BİREBİR aynı motordan gelir. Ekrandaki zaman şeridi de aynı motoru okur.
 *
 * Zaman daima `çıkış − kalanDk` (muhafız sözleşmesi); çıkış yönünde pencereden
 * uzun bir eşik (kış kuşluğu kısalınca) pencere başından ÖNCEYE düşer → atılır.
 */
import { Logger } from '../utils/Logger';
import { gunEkle } from '../utils/TarihYardimcisi';
import type { UyariPlani } from '../muhafiz/motorAdaptoru';
import { vakitUyariPlaniOlustur } from '../muhafiz/motorAdaptoru';
import type { SeviyeAyari } from '../muhafiz/matrisTipleri';
import type { PencereYonu } from '../muhafiz/pencereTipleri';
import { gununNafilePencereleri, type NafileKoordinat } from './gunVakitleri';
import { teheccudPenceresiniUygula, type NafilePencere } from './nafileVakitleri';
import { nafileAnonsMetni, nafileBildirimMetni } from './nafileMetinleri';
import {
    nafileAyariniAl,
    type NafileAyarlari,
    type NafileTuru,
    type TeheccudPenceresi,
} from './nafileTipleri';

/** Bildirim id öneki — temizlik bu önekle SÜZER, başka sistemlere dokunmaz. */
export const NAFILE_ID_ONEKI = 'nafile_';

/**
 * Bir günün bir nafilesinin TÜM hatırlatmalarının öneki — "Kıldım" iptali
 * (bildirim + anons alarmı) bu önekle süzer. Sondaki `_` şart: yalın
 * `startsWith('nafile_<gün>_teheccud')` ileride önek paylaşan bir tür eklenirse
 * komşusunu da susturur (Kıldım kurallarındaki `buVakteAitMi` dersi).
 */
export const nafileKimlikOneki = (gunIso: string, tur: NafileTuru): string =>
    `${NAFILE_ID_ONEKI}${gunIso}_${tur}_`;

/**
 * Kaç gün ileri planlanır.
 * - Gündüz nafileleri: bugün + 2.
 * - Teheccüd: 7 gece — bir "uyandırma"dır; OEM arka plan görevini öldürürse
 *   3 günde sessizce biterdi (cuma'nın 4 hafta planlamasıyla aynı gerekçe).
 *
 * GÜNÜ GÜNÜNE (`NafileAyarlari.gunuGununeKur`, issue #298): iOS'ta bütçe
 * rehberinin önerisiyle yalnız bugün (ve sürmekte olan gece) kurulur.
 *
 * Tekrarlı adımlar ufku şişirebilir: Android'de `alarmButcesi` burada,
 * iOS'ta 64 bütçesi teslimcide KRONOLOJİK keser — en uzak geceler düşer,
 * sonraki tur (açılış / 15 dk görevi) kurar.
 */
export const NAFILE_GUNDUZ_GUN_SAYISI = 3;
export const NAFILE_TEHECCUD_GECE_SAYISI = 7;

const DK = 60 * 1000;

export interface NafilePlanSecenekleri {
    gunduzGunSayisi: number;
    teheccudGeceSayisi: number;
    /**
     * Android alarm bütçesi (bildirim + sesli anons alarmı, kronolojik kesme).
     * Verilmezse kesilmez (iOS: bütçeyi teslimci ölçer).
     */
    alarmButcesi?: number;
    /** "Kıldım" denmiş (gün, tür) — o günün o nafilesi planlanmaz (#273). */
    kilindiMi?: (gunIso: string, tur: NafileTuru) => boolean;
}

/** Ayarın plan ufku — tek kaynak (servis ve defter bunu kullanır). */
export const nafilePlanSecenekleri = (ayarlar: Pick<NafileAyarlari, 'gunuGununeKur'>): NafilePlanSecenekleri =>
    ayarlar.gunuGununeKur === true
        ? { gunduzGunSayisi: 1, teheccudGeceSayisi: 1 }
        : { gunduzGunSayisi: NAFILE_GUNDUZ_GUN_SAYISI, teheccudGeceSayisi: NAFILE_TEHECCUD_GECE_SAYISI };

export interface NafileBildirimPlani {
    id: string;
    tur: NafileTuru;
    /** Nafilenin ait olduğu gün (teheccüd: gecesinin yatsısının günü). */
    tarih: string;
    zaman: Date;
    baslik: string;
    govde: string;
    uyandirma: boolean;
    yon: PencereYonu;
    /**
     * Hatırlatma penceresinin SONU (teheccüdde seçilen pencerenin sonu = imsak).
     * Gerçek alarm buna göre karar verir: pencere bittikten sonra geç tetiklenen
     * alarm çalmaz (`MuhafizAlarmKurallari.tetikKarari` → ATLA).
     */
    son: Date;
    /**
     * Motorun ürettiği uyarı — kanallar ve sesli anons bayrağı buradan.
     * `anonsMetni` ÇÖZÜLMÜŞ nafile anons cümlesidir (yer tutucu içermez).
     */
    uyari: UyariPlani;
}

/**
 * Bu tetik GERÇEK ALARM mı? (issue #74; teslimciyle aynı kapı.) Android'de alarm o
 * tetiğin bildirimi + anonsunun YERİNE geçer (tek alarm payı).
 */
export const nafileAlarmKurarMi = (p: Pick<NafileBildirimPlani, 'uyari'>): boolean =>
    p.uyari.alarm === true && p.uyari.kanallar?.alarm === true;

/** Bu plan Android'de ayrı bir sesli anons alarmı kurar mı? (teslimciyle aynı kapı) */
export const nafileAnonsAlarmiKurarMi = (p: Pick<NafileBildirimPlani, 'uyari'>): boolean =>
    !nafileAlarmKurarMi(p) && p.uyari.sesliAnons && p.uyari.anonsMetni.trim().length > 0;

export interface PencereTetigi {
    zaman: Date;
    uyari: UyariPlani;
    /** Adımın ilk tetiği mi (tekrar değil)? Nass yalnız ilk tetikte. */
    ilk: boolean;
}

/** Pencere uzunluğu (dk) — motorun dakika tamsayısı. */
export const nafilePencereUzunluguDk = (p: { baslangic: Date; bitis: Date }): number =>
    Math.round((p.bitis.getTime() - p.baslangic.getTime()) / DK);

/** Bir nafile penceresinin tetikleri, kronolojik. Yalnız pencere İÇİNE düşenler. */
export function nafilePencereTetikleri(
    ayar: { yon: PencereYonu; adimlar: SeviyeAyari[] },
    pencere: { baslangic: Date; bitis: Date }
): PencereTetigi[] {
    const uzunluk = nafilePencereUzunluguDk(pencere);
    if (!(uzunluk > 1)) return [];
    const giris = ayar.yon === 'girisindenItibaren';
    const plan = vakitUyariPlaniOlustur(
        { yon: ayar.yon, seviyeler: ayar.adimlar },
        giris ? 1 : Number.MAX_SAFE_INTEGER,
        { pencereUzunluguDk: uzunluk }
    );
    const goruldu = new Set<number>();
    const sonuc: PencereTetigi[] = [];
    for (const uyari of plan) {
        const zaman = new Date(pencere.bitis.getTime() - uyari.kalanDk * DK);
        if (zaman.getTime() <= pencere.baslangic.getTime() || zaman.getTime() >= pencere.bitis.getTime()) continue;
        sonuc.push({ zaman, uyari, ilk: false });
    }
    sonuc.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
    for (const t of sonuc) {
        t.ilk = !goruldu.has(t.uyari.adimIndeks);
        goruldu.add(t.uyari.adimIndeks);
    }
    return sonuc;
}

/**
 * SAF plan üretici — hangi nafile bildirimi hangi anda, hangi metinle gidecek.
 * `bugunIso` ve `simdi` ENJEKTE edilir (testte sabit tarih yazılmaz).
 *
 * `gunAtlanirMi` (ops.): true dönen GÜN hiç planlanmaz — o günün gündüz
 * nafileleri ve o güne ait gece (yatsı → ertesi imsak) teheccüdü dahil.
 * Özel gün kapısı buradan bağlanır (issue #272).
 *
 * `secenekler` (ops.): plan ufku, Android alarm bütçesi, Kıldım hafızası;
 * verilmezse ayardan türetilir.
 */
export function nafilePlaniOlustur(
    koordinat: NafileKoordinat,
    ayarlar: NafileAyarlari,
    simdi: Date,
    bugunIso: string,
    gunAtlanirMi: (iso: string) => boolean = () => false,
    secenekler: NafilePlanSecenekleri = nafilePlanSecenekleri(ayarlar)
): NafileBildirimPlani[] {
    const { gunduzGunSayisi, teheccudGeceSayisi, alarmButcesi } = secenekler;
    const kilindiMi = secenekler.kilindiMi ?? (() => false);
    const planlar: NafileBildirimPlani[] = [];

    // Dün (gece yarısı sonrası teheccüd) → bugün + teheccudGeceSayisi - 1
    for (let i = -1; i < teheccudGeceSayisi; i++) {
        const iso = gunEkle(bugunIso, i);
        if (gunAtlanirMi(iso)) continue;
        let pencereler: NafilePencere[];
        try {
            pencereler = gununNafilePencereleri(koordinat, iso);
        } catch (e) {
            Logger.warn('NafileHatirlatma', `Pencere hesaplanamadi: ${iso}`, e);
            continue;
        }

        for (const ham of pencereler) {
            // Gündüz nafileleri yalnız bugün + (gün sayısı − 1).
            if (ham.tur !== 'teheccud' && (i < 0 || i >= gunduzGunSayisi)) continue;
            const ayar = nafileAyariniAl(ayarlar, ham.tur);
            if (!ayar.aktif || kilindiMi(iso, ham.tur)) continue;

            const teheccud = ham.tur === 'teheccud' ? ayarlar.teheccud : null;
            const p = teheccud ? teheccudPenceresiniUygula(ham, teheccud.pencere) : ham;
            const uyandirma = teheccud?.uyandirma === true;

            for (const t of nafilePencereTetikleri(ayar, p)) {
                if (t.zaman.getTime() <= simdi.getTime()) continue;
                const girdi = {
                    tur: p.tur,
                    son: p.bitis,
                    yon: ayar.yon,
                    ilk: t.ilk,
                    kalanDk: t.uyari.kalanDk,
                    teheccudPenceresi: teheccud?.pencere,
                    uyandirma,
                };
                planlar.push({
                    id: `${nafileKimlikOneki(iso, p.tur)}${t.uyari.kalanDk}`,
                    tur: p.tur,
                    tarih: iso,
                    zaman: t.zaman,
                    ...nafileBildirimMetni(girdi),
                    uyandirma,
                    yon: ayar.yon,
                    son: p.bitis,
                    uyari: { ...t.uyari, anonsMetni: nafileAnonsMetni(girdi) },
                });
            }
        }
    }

    planlar.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
    if (alarmButcesi === undefined) return planlar;

    // Android alarm bütçesi — KRONOLOJİK: bildirim 1, sesli anons ayrıca 1; GERÇEK
    // ALARM ikisinin yerine geçer (1).
    const sigan: NafileBildirimPlani[] = [];
    let kullanilan = 0;
    for (const p of planlar) {
        const maliyet = 1 + (nafileAnonsAlarmiKurarMi(p) ? 1 : 0);
        if (kullanilan + maliyet > alarmButcesi) break;
        kullanilan += maliyet;
        sigan.push(p);
    }
    return sigan;
}

/**
 * Bir adımın ÖRNEK anons cümlesi (ayar ekranındaki "Telefonunuz şöyle okur").
 * Adımın ilk tetiği varsayılır; çıkış yönünde kalan süre = eşik, girişte
 * pencere biliniyorsa `pencere − eşik`.
 */
export function nafileAnonsOrnegi(
    tur: NafileTuru,
    yon: PencereYonu,
    esikDk: number,
    secenek: { pencereUzunluguDk?: number; teheccudPenceresi?: TeheccudPenceresi } = {}
): string {
    const giris = yon === 'girisindenItibaren';
    const kalanDk = giris ? Math.max(0, (secenek.pencereUzunluguDk ?? esikDk) - esikDk) : esikDk;
    return nafileAnonsMetni({
        tur,
        son: new Date(0),
        yon,
        ilk: true,
        kalanDk,
        teheccudPenceresi: secenek.teheccudPenceresi,
    });
}
