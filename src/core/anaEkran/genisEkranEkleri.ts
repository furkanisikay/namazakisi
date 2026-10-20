/**
 * Geniş ekran (tablet / iPad iki bölme) ana sayfa ekleri — SAF.
 *
 * İki bölmeli düzende vakit kartı ve günlük akış ekranın yalnız üst kısmını doldurur;
 * kalan alana anlamlı ikinci içerik konur: yarının vakitleri ve kıble yönü. Hesap
 * uygulamanın tamamıyla AYNI yoldan (`gunVakitleriniHesapla` = `turkiyeHesapParametreleri`).
 */
import { Coordinates, Qibla } from 'adhan';
import { gunVakitleriniHesapla, koordinatGecerliMi, type NafileKoordinat } from '../nafile/gunVakitleri';
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
    return {
        tarihMetni: tarihiGorunumFormatinaCevir(yarin),
        satirlar: [
            { ad: 'İmsak', saat: saatMetni(v.imsak) },
            { ad: 'Güneş', saat: saatMetni(v.gunes) },
            { ad: 'Öğle', saat: saatMetni(v.ogle) },
            { ad: 'İkindi', saat: saatMetni(v.ikindi) },
            { ad: 'Akşam', saat: saatMetni(v.aksam) },
            { ad: 'Yatsı', saat: saatMetni(v.yatsi) },
        ],
    };
}

const YONLER = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı'];

export interface KibleOzetiMini {
    /** Kuzeyden saat yönünde derece (0–359, tam sayı). */
    derece: number;
    /** Sekiz ana yönden biri, küçük harf ("güneydoğu"). */
    yon: string;
}

/** Kıble yönü (kuzeye göre). Konum yoksa `null`. */
export function kibleOzetiHesapla(koordinat: NafileKoordinat | null | undefined): KibleOzetiMini | null {
    if (!koordinatGecerliMi(koordinat)) return null;
    const ham = Qibla(new Coordinates(koordinat.lat, koordinat.lng));
    const derece = ((Math.round(ham) % 360) + 360) % 360;
    return { derece, yon: YONLER[Math.round(derece / 45) % 8] };
}
