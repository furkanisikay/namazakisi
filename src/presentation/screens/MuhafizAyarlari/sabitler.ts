/**
 * MuhafizAyarlari ekrani — paylasilan sabitler (Faz 2, vakit-merkezli ekran).
 *
 * NOT (renk): seviye renkleri temada TOKEN OLARAK YOK (temada nazik/uyari/sert/acil
 * olcegi bulunmuyor) ve bu degerler ekranin MEVCUT gorsel dilidir — eski ekrandaki
 * SEVIYE_RENKLERI ile birebir aynidir, boylece Faz 2 yeniden kurulumu sifir gorsel
 * kayma yaratir. En yakin token'a zorlamak (AGENTS.md kontrast tuzagi) yanlis olurdu:
 * `durum.uyari` = #FFC107 sari-amber, buradaki turuncudan farklidir.
 * Bu renkler yalniz DEKORATIF kullanilir (ikon cipi + sol serit + ikon), govde metni
 * daima `renkler.metin` / `renkler.metinIkincil` ile cizilir → kontrast tabani tema
 * token'larindan gelir.
 */
import type {
    MuhafizVakti,
    SeviyeKademe,
} from '../../../core/muhafiz/matrisTipleri';
import { metin } from '../../../core/dil/aktifDil';

/** Cümle içindeki küçük harfli vakit adları — tek kaynak sözlük (`vakit.kucuk`). */
export { VAKIT_ADLARI_KUCUK } from '../../../core/utils/muhafizMetinYardimcisi';

export interface SeviyeBilgisi {
    baslik: string;
    ikon: string;
    renk: string;
}

/** Gorunen adlar spec 8 uyarinca: "Seytanla Mucadele" ekranda "Sert uyari"dir (kod id'leri degismez). */
export const SEVIYE_BILGILERI: Record<SeviyeKademe, SeviyeBilgisi> = {
    nazik: { get baslik() { return metin().hatirlatma.pencere.seviye.nazik; }, ikon: 'bell', renk: '#4CAF50' },
    uyari: { get baslik() { return metin().hatirlatma.pencere.seviye.uyari; }, ikon: 'exclamation-triangle', renk: '#FF9800' },
    sert: { get baslik() { return metin().hatirlatma.pencere.seviye.sert; }, ikon: 'fire-alt', renk: '#F44336' },
    acil: { get baslik() { return metin().hatirlatma.pencere.seviye.acil; }, ikon: 'exclamation-circle', renk: '#D32F2F' },
};

/** "Akisi onizle" tarama siniri — bir vaktin en genis penceresini kapsar (dk). */
export const ONIZLEME_TARAMA_SINIRI_DK = 24 * 60;

// NOT: "bu adim sesli anons/bildirim sesi calar mi?" kurali BURADA DEGIL —
// `motorAdaptoru` icindeki `sesliAnonsGerekliMi`/`bildirimSesiGerekliMi`'dedir.
// Eskiden burada `SESLI_MODLAR`/`BILDIRIMLI_MODLAR` olarak ikinci bir kopyasi
// vardi ve domain tarafinda (`AnonsOnizlemeServisi`) ucuncu bir kopyasi; ikizler
// ayrisirsa onizleme gercek akistan sapar.

/** Tekrarli sikliga gecilirken kullanilan varsayilan aralik. */
export const VARSAYILAN_TEKRAR_DK = 5;
export const TEKRAR_MIN_DK = 1;
export const TEKRAR_MAX_DK = 30;

/** Esik stepper adimi (SayisalSecici sinira otomatik kenetler). */
export const ESIK_ADIM_DK = 5;

export const YOGUNLUK_BILGILERI: { id: 'hafif' | 'normal' | 'yogun'; etiket: string; ikon: string }[] = [
    { id: 'hafif', get etiket() { return metin().hatirlatma.duzeyAdlari.hafif; }, ikon: 'feather-alt' },
    { id: 'normal', get etiket() { return metin().hatirlatma.duzeyAdlari.normal; }, ikon: 'balance-scale' },
    { id: 'yogun', get etiket() { return metin().hatirlatma.duzeyAdlari.yogun; }, ikon: 'bolt' },
];
