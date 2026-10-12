/**
 * Ana ekran nafile şeridinin metinleri (issue #77) — SAF.
 * Arayüz dili (kibar "siz"); saate hal eki EKLENMEZ ("bitiş 11:47").
 */
import { NAFILE_ADLARI, type NafileTuru } from './nafileTipleri';
import { NAFILE_ACIKLAMALARI } from './nafileMetinleri';
import type { NafileDurumu, NafilePencere } from './nafileVakitleri';

const saatMetni = (t: Date): string =>
    `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;

const IKONLAR: Record<NafileTuru, string> = { kusluk: 'sun', evvabin: 'cloud-sun', teheccud: 'moon' };

export interface NafileSeritMetni {
    ikon: string;
    metin: string;
    bilgiBaslik: string;
    bilgiMetni: string;
    aktif: boolean;
}

export function nafileSeritMetniOlustur(
    durum: NafileDurumu | null,
    pencereler: NafilePencere[]
): NafileSeritMetni | null {
    if (!durum) return null;
    const ad = NAFILE_ADLARI[durum.tur];
    const pencere = pencereler.find((p) => p.tur === durum.tur);
    const aktif = durum.durum === 'aktif';
    const metin = aktif ? `${ad} vakti · bitiş ${saatMetni(durum.an)}` : `Sıradaki nafile: ${ad} · ${saatMetni(durum.an)}`;

    let bilgi = NAFILE_ACIKLAMALARI[durum.tur];
    if (pencere) {
        bilgi += `\n\nBugün: ${saatMetni(pencere.baslangic)} – ${saatMetni(pencere.bitis)}`;
        if (durum.tur === 'kusluk') bilgi += ` · en faziletli ${saatMetni(pencere.faziletli)} sonrası`;
        if (durum.tur === 'teheccud') bilgi += ` · son üçte bir ${saatMetni(pencere.faziletli)}`;
    }
    return { ikon: IKONLAR[durum.tur], metin, bilgiBaslik: ad, bilgiMetni: bilgi, aktif };
}
