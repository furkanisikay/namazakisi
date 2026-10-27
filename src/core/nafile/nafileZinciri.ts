/**
 * Ana ekran "Günlük Akış" zincirindeki nafile satırları (issue #77) — SAF.
 *
 * Nafileler farz vakitlerinin ARASINA girer: kuşluk sabahın, evvâbîn akşamın,
 * teheccüd yatsının ardına. Satır farzla aynı üç sütunu kullanır (saat | halka |
 * kart) ama ikincil seste çizilir; kayıt/puan/kılma halkası YOKTUR.
 *
 * Çıktı yalnız DİZE ve sabit alanlardır: ana ekran saniyede bir çizilir ve
 * `VakitAkisi` `React.memo`'dur (AGENTS.md: Date nesnesi memo'yu kırar). Çağıran
 * diziyi dakika anahtarıyla `useMemo`'lamalıdır.
 *
 * Arayüz dili (kibar "siz"); saate hal eki EKLENMEZ ("bitiş 11:47").
 */
import { NamazAdi } from '../constants/UygulamaSabitleri';
import { NAFILE_ADLARI, type NafileTuru, type TeheccudPenceresi } from './nafileTipleri';
import { NAFILE_ACIKLAMALARI } from './nafileMetinleri';
import { bicim, metin } from '../dil/aktifDil';
import { teheccudPenceresiniUygula, type NafilePencere } from './nafileVakitleri';

const saatMetni = (t: Date): string =>
    `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;

export const NAFILE_IKONLARI: Record<NafileTuru, string> = { kusluk: 'sun', evvabin: 'cloud-sun', teheccud: 'moon' };

/** Hangi farz satırının ARDINA girer. */
export const NAFILE_ARDINDAN: Record<NafileTuru, NamazAdi> = {
    kusluk: NamazAdi.Sabah,
    evvabin: NamazAdi.Aksam,
    teheccud: NamazAdi.Yatsi,
};

export type NafileSatirDurumu = 'sirada' | 'aktif' | 'gecti';

export interface NafileZincirSatiri {
    tur: NafileTuru;
    ad: string;
    ikon: string;
    ardindan: NamazAdi;
    /** Sol sütundaki saat: pencerenin başı (teheccüdde hedef an). */
    saat: string;
    durum: NafileSatirDurumu;
    /** Kartın ikinci satırı: "Vakti girdi · bitiş 12:46" ya da "Nafile · 07:50–12:46". */
    durumMetni: string;
    bilgiBaslik: string;
    bilgiMetni: string;
}

/**
 * Teheccüd, uyuyup kalkma şartı dakikayla modellenemediği için yatsı girer girmez
 * DEĞİL, seçilen pencere (son üçte bir ya da yatsıdan) girince "aktif" sayılır
 * (`nafileDurumunuBul` ile aynı kural). Satırın saati de bu andır.
 */
const etkinBasi = (p: NafilePencere, teheccud: TeheccudPenceresi): Date =>
    teheccudPenceresiniUygula(p, teheccud).baslangic;

const bilgiMetniOlustur = (p: NafilePencere): string => {
    const m = metin().nafile;
    let bilgi = bicim(m.bilgiBugun, { aciklama: NAFILE_ACIKLAMALARI[p.tur], bas: saatMetni(p.baslangic), son: saatMetni(p.bitis) });
    if (p.tur === 'kusluk') bilgi += bicim(m.enFaziletli, { saat: saatMetni(p.faziletli) });
    if (p.tur === 'teheccud') bilgi += bicim(m.sonUcteBir, { saat: saatMetni(p.faziletli) });
    return bilgi;
};

/**
 * `gosterilen` (ops.): nafile BAŞINA ana ekran göstergesi (`NafileAyarlari.gosterge`).
 * Verilmezse hepsi gösterilir; `false` olan nafilenin satırı zincire GİRMEZ.
 */
export function nafileZincirSatirlariOlustur(
    pencereler: NafilePencere[],
    simdi: Date,
    teheccud: TeheccudPenceresi,
    gosterilen?: Readonly<Record<NafileTuru, boolean>>
): NafileZincirSatiri[] {
    const t = simdi.getTime();
    return pencereler.filter((p) => gosterilen?.[p.tur] !== false).map((p) => {
        const bas = etkinBasi(p, teheccud);
        const durum: NafileSatirDurumu =
            t >= p.bitis.getTime() ? 'gecti' : t >= bas.getTime() ? 'aktif' : 'sirada';
        const ad = NAFILE_ADLARI[p.tur];
        return {
            tur: p.tur,
            ad,
            ikon: NAFILE_IKONLARI[p.tur],
            ardindan: NAFILE_ARDINDAN[p.tur],
            saat: saatMetni(bas),
            durum,
            durumMetni:
                durum === 'aktif'
                    ? bicim(metin().nafile.durumAktif, { saat: saatMetni(p.bitis) })
                    : bicim(metin().nafile.durumNafile, { bas: saatMetni(bas), son: saatMetni(p.bitis) }),
            bilgiBaslik: ad,
            bilgiMetni: bilgiMetniOlustur(p),
        };
    });
}
