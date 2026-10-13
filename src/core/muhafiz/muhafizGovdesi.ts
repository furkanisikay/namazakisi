/**
 * Muhafız bildirim GÖVDESİ seçimi — SAF, tek kaynak.
 *
 * Eskiden `ArkaplanMuhafizServisi.bildirimMesajiOlustur` içinde `Math.random` ile
 * yaşıyordu. Saat (Wear OS, issue #280) telefonun ürettiği HAZIR planı taşıdığı için
 * aynı seçimi tekrar etmek zorundadır; ikinci bir kopya havuzlar ayrışınca sessizce
 * sapardı. Rastgelelik bu yüzden PARAMETREDİR (`[0,1)` üreten bir fonksiyon):
 *   - telefon `Math.random` geçer → davranışı ve çağrı sayısı BİREBİR aynı kalır
 *     (kayıt-oynat nöbetçisi `Math.random`'u sabitleyerek ölçer);
 *   - saat yükü kimlikten türeyen deterministik oran geçer (`kimliktenOran`) →
 *     aynı uyarı her gönderimde aynı metni taşır, yük gereksiz yere "yeni" olmaz.
 *
 * GİRİŞ YÖNÜNDE mücadele havuzu KULLANILMAZ: o havuz vaktin SONUNA kuruludur ve
 * vakte özgü nass taşır (AGENTS.md: terk etme ≠ geciktirme). Nötr havuz kullanılır.
 */
import type { VakitAdi } from '../types';
import { uygunIcerikleriBul, icerikMetniOlustur } from '../data/SeytanlaMucadeleIcerigi';
import {
    bildirimGovdesiOlustur,
    GIRIS_ICERIK_HAVUZU,
    type MuhafizSeviye,
} from '../utils/muhafizMetinYardimcisi';
import { VARSAYILAN_PENCERE_YONU, type PencereYonu } from './pencereTipleri';

/** `[0,1)` aralığında sayı üreten kaynak (`Math.random` imzası). */
export type OranKaynagi = () => number;

const indeksSec = (uzunluk: number, oran: OranKaynagi): number =>
    Math.min(uzunluk - 1, Math.floor(oran() * uzunluk));

/**
 * Bildirim gövdesi. Vakit adı ve kalan süre ALMAZ — ikisi de başlıkta.
 * Havuzda o (vakit, seviye) için hiçbir şey yoksa yedek metne düşer → gövde asla boş kalmaz.
 */
export function muhafizGovdesiSec(
    vakit: VakitAdi,
    seviye: MuhafizSeviye,
    yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
    oran: OranKaynagi = Math.random
): string {
    const girisIcerikleri = yon === 'girisindenItibaren' ? GIRIS_ICERIK_HAVUZU[seviye] : null;
    if (girisIcerikleri) {
        return girisIcerikleri[indeksSec(girisIcerikleri.length, oran)];
    }

    const mucadeleIcerikleri = uygunIcerikleriBul(vakit, seviye);
    if (mucadeleIcerikleri.length > 0) {
        return icerikMetniOlustur(mucadeleIcerikleri[indeksSec(mucadeleIcerikleri.length, oran)]);
    }
    return bildirimGovdesiOlustur(seviye, yon);
}

/**
 * Kimlikten `[0,1)` oranı — FNV-1a 32-bit (kriptografik DEĞİL; amaç yalnız
 * kararlılık). `Math.imul` 32-bit taşmayı Hermes'te de doğru yapar.
 */
export function kimliktenOran(kimlik: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < kimlik.length; i++) {
        h ^= kimlik.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0) / 0x100000000;
}
