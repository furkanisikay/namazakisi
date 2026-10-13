/**
 * Nafile hatırlatma PLANI — SAF üretici (issue #77; #298'de servisten taşındı).
 *
 * Bildirim defteri (`core/bildirim/bildirimDefteri.ts`) ve
 * `NafileHatirlatmaServisi` AYNI fonksiyonu çağırır: ekranda sayılan ile
 * cihazda kurulan ayrışamaz.
 */
import { Logger } from '../utils/Logger';
import { gunEkle } from '../utils/TarihYardimcisi';
import { gununNafilePencereleri, type NafileKoordinat } from './gunVakitleri';
import { teheccudHedefZamani, type NafilePencere } from './nafileVakitleri';
import { nafileBildirimMetni } from './nafileMetinleri';
import type { NafileAyarlari, NafileTuru } from './nafileTipleri';

/** Bildirim id öneki — temizlik bu önekle SÜZER, başka sistemlere dokunmaz. */
export const NAFILE_ID_ONEKI = 'nafile_';

/**
 * Kaç gün ileri planlanır.
 * - Gündüz nafileleri: bugün + 2 (vakit bildirimlerinden geniş; uygulama 3 gün
 *   açılmasa da sürer).
 * - Teheccüd: 7 gece — bir "uyandırma"dır; OEM arka plan görevini öldürürse
 *   3 günde sessizce biterdi (cuma'nın 4 hafta planlamasıyla aynı gerekçe).
 * iOS 64 bekleyen bildirim bütçesine en fazla 2×3 + 2×7 = 20 girer.
 *
 * GÜNÜ GÜNÜNE (`NafileAyarlari.gunuGununeKur`, issue #298): iOS'ta bütçe
 * rehberinin önerisiyle yalnız bugün (ve sürmekte olan gece) kurulur; plan
 * her açılışta / arka plan turunda tazelenir. Bedeli: uygulama birkaç gün hiç
 * açılmazsa nafile hatırlatması gelmeyebilir — ekran bunu söyler.
 */
export const NAFILE_GUNDUZ_GUN_SAYISI = 3;
export const NAFILE_TEHECCUD_GECE_SAYISI = 7;

/** Uyandırma açıkken ikinci hatırlatmanın gecikmesi (tek 2,4 sn'lik ses alarm beklentisini karşılamaz). */
const UYANDIRMA_TEKRAR_DK = 3;

const DK = 60 * 1000;

export interface NafilePlanSecenekleri {
    gunduzGunSayisi: number;
    teheccudGeceSayisi: number;
}

/** Ayarın plan ufku — tek kaynak (servis ve defter bunu kullanır). */
export const nafilePlanSecenekleri = (ayarlar: Pick<NafileAyarlari, 'gunuGununeKur'>): NafilePlanSecenekleri =>
    ayarlar.gunuGununeKur === true
        ? { gunduzGunSayisi: 1, teheccudGeceSayisi: 1 }
        : { gunduzGunSayisi: NAFILE_GUNDUZ_GUN_SAYISI, teheccudGeceSayisi: NAFILE_TEHECCUD_GECE_SAYISI };

export interface NafileBildirimPlani {
    id: string;
    tur: NafileTuru;
    zaman: Date;
    baslik: string;
    govde: string;
    uyandirma: boolean;
}

/**
 * SAF plan üretici — hangi nafile bildirimi hangi anda, hangi metinle gidecek.
 * `bugunIso` ve `simdi` ENJEKTE edilir (testte sabit tarih yazılmaz).
 *
 * `gunAtlanirMi` (ops.): true dönen GÜN hiç planlanmaz — o günün gündüz
 * nafileleri ve o güne ait gece (yatsı → ertesi imsak) teheccüdü dahil.
 * Özel gün kapısı buradan bağlanır (issue #272).
 *
 * `secenekler` (ops.): plan ufku; verilmezse ayardan türetilir.
 */
export function nafilePlaniOlustur(
    koordinat: NafileKoordinat,
    ayarlar: NafileAyarlari,
    simdi: Date,
    bugunIso: string,
    gunAtlanirMi: (iso: string) => boolean = () => false,
    secenekler: NafilePlanSecenekleri = nafilePlanSecenekleri(ayarlar)
): NafileBildirimPlani[] {
    const { gunduzGunSayisi, teheccudGeceSayisi } = secenekler;
    const planlar: NafileBildirimPlani[] = [];
    const gelecekMi = (z: Date) => z.getTime() > simdi.getTime();

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

        for (const p of pencereler) {
            if (p.tur === 'teheccud') {
                const t = ayarlar.teheccud;
                if (!t.aktif) continue;
                const zaman = teheccudHedefZamani(p, t.hedef, t.imsaktanOnceDk);
                const metin = nafileBildirimMetni({
                    tur: 'teheccud',
                    son: p.bitis,
                    teheccudHedefi: t.hedef,
                    imsaktanOnceDk: Math.round((p.bitis.getTime() - zaman.getTime()) / DK),
                    uyandirma: t.uyandirma,
                });
                if (gelecekMi(zaman)) {
                    planlar.push({ id: `${NAFILE_ID_ONEKI}${iso}_teheccud`, tur: 'teheccud', zaman, ...metin, uyandirma: t.uyandirma });
                }
                if (t.uyandirma) {
                    const ikinci = new Date(zaman.getTime() + UYANDIRMA_TEKRAR_DK * DK);
                    if (gelecekMi(ikinci) && ikinci.getTime() < p.bitis.getTime()) {
                        planlar.push({ id: `${NAFILE_ID_ONEKI}${iso}_teheccud_2`, tur: 'teheccud', zaman: ikinci, ...metin, uyandirma: true });
                    }
                }
                continue;
            }

            // Gündüz nafileleri yalnız bugün + 2 gün.
            if (i < 0 || i >= gunduzGunSayisi) continue;
            const ayar = ayarlar.hatirlatmalar[p.tur];
            if (!ayar.aktif) continue;
            const zaman = new Date(p.baslangic.getTime() + ayar.ofsetDk * DK);
            // Ofset pencereyi aşarsa (kısa kış kuşluğu) o gün planlanmaz.
            if (zaman.getTime() >= p.bitis.getTime() || !gelecekMi(zaman)) continue;
            planlar.push({
                id: `${NAFILE_ID_ONEKI}${iso}_${p.tur}`,
                tur: p.tur,
                zaman,
                ...nafileBildirimMetni({ tur: p.tur, son: p.bitis }),
                uyandirma: false,
            });
        }
    }

    return planlar.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
}
