/**
 * Geniş ekran (tablet / iPad iki bölme) ana sayfa ekleri — SAF.
 *
 * Geniş düzenin "Bu hafta" panelinin yarının vakitleri bölümü.
 * Hesap
 * uygulamanın tamamıyla AYNI yoldan (`gunVakitleriniHesapla` = `aktifPrayerTimes`).
 */
import { gunVakitleriniHesapla, koordinatGecerliMi, type NafileKoordinat } from '../nafile/gunVakitleri';
import { metin } from '../dil/aktifDil';
import { gunEkle, tarihiGorunumFormatinaCevir } from '../utils/TarihYardimcisi';

export interface YarinVakitSatiri {
    ad: string;
    saat: string;
}

export interface YarinVakitleri {
    /** "21 Ekim 2026" */
    tarihMetni: string;
    satirlar: YarinVakitSatiri[];
}

const iki = (n: number) => String(n).padStart(2, '0');
const saatMetni = (d: Date) => `${iki(d.getHours())}:${iki(d.getMinutes())}`;

/** Gösterilen günün ERTESİ gününün altı vakti. Konum yoksa `null`. */
export function yarinVakitleriniHesapla(
    koordinat: NafileKoordinat | null | undefined,
    gosterilenGunIso: string
): YarinVakitleri | null {
    if (!koordinatGecerliMi(koordinat)) return null;
    const yarin = gunEkle(gosterilenGunIso, 1);
    const v = gunVakitleriniHesapla(koordinat, yarin);
    const m = metin().vakit;
    return {
        tarihMetni: tarihiGorunumFormatinaCevir(yarin),
        satirlar: [
            { ad: m.imsakVakti, saat: saatMetni(v.imsak) },
            { ad: m.adlar.gunes, saat: saatMetni(v.gunes) },
            { ad: m.adlar.ogle, saat: saatMetni(v.ogle) },
            { ad: m.adlar.ikindi, saat: saatMetni(v.ikindi) },
            { ad: m.adlar.aksam, saat: saatMetni(v.aksam) },
            { ad: m.adlar.yatsi, saat: saatMetni(v.yatsi) },
        ],
    };
}
