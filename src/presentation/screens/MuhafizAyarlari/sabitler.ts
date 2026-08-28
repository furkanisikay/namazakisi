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
    UyariKanallari,
} from '../../../core/muhafiz/matrisTipleri';
import { modKanallaraCevir } from '../../../core/muhafiz/kanalKumesi';

/**
 * CUMLE ICINDE gecen kucuk harfli vakit adlari ("… yatsı bugün 6 sa 40 dk").
 *
 * SABIT HARITA — `VAKIT_ADLARI[...].toLowerCase()` YAZMA: 'İkindi'.toLowerCase()
 * JS'te 'i̇kindi' (i + birlesik nokta) uretir. AGENTS.md'deki toUpperCase tuzaginin
 * ikizidir; yalniz `i`/`İ` iceren sozcukleri bozdugu icin testlerden kolayca kacar.
 */
export const VAKIT_ADLARI_KUCUK: Record<MuhafizVakti, string> = {
    imsak: 'sabah',
    ogle: 'öğle',
    ikindi: 'ikindi',
    aksam: 'akşam',
    yatsi: 'yatsı',
};

export interface SeviyeBilgisi {
    baslik: string;
    ikon: string;
    renk: string;
}

/** Gorunen adlar spec 8 uyarinca: "Seytanla Mucadele" ekranda "Sert uyari"dir (kod id'leri degismez). */
export const SEVIYE_BILGILERI: Record<SeviyeKademe, SeviyeBilgisi> = {
    nazik: { baslik: 'Nazik hatırlatma', ikon: 'bell', renk: '#4CAF50' },
    uyari: { baslik: 'Uyarı', ikon: 'exclamation-triangle', renk: '#FF9800' },
    sert: { baslik: 'Sert uyarı', ikon: 'fire-alt', renk: '#F44336' },
    acil: { baslik: 'Acil', ikon: 'exclamation-circle', renk: '#D32F2F' },
};

export interface KanalCipi {
    id: 'kapali' | 'bildirim' | 'sesli' | 'ikisi';
    etiket: string;
    ikon: string;
    /** Cipe dokunuldugunda hucreye yazilacak KANAL KUMESI. */
    kanallar: UyariKanallari;
}

/**
 * "Nasil uyarsin" cipleri (Faz 2: kanal kumesi).
 *
 * Cipler kumenin bugun kullanilan DORT bilesimini sunar; `titresim` kanali
 * SEMADA ACIK ama ekranda GOSTERILMEZ (Faz 6 / A7 baglayacak) — bu yuzden hicbir
 * cip onu yazmaz ve mevcut secim kontrolu de yalniz bildirim/sesli eksenine bakar.
 *
 * Faz 5: sesli ciplerdeki "yakinda" rozeti KALDIRILDI — native anons zinciri
 * (exact alarm -> AnonsReceiver -> TTS) Faz 4'te devreye girdi, sesli kanal artik
 * gercekten calisiyor. Cihazda Turkce konusma paketi yoksa engelleme YAPILMAZ,
 * yalniz bilgilendirme bandi gosterilir (bkz. `useTurkceTtsDestegi`).
 */
export const KANAL_CIPLERI: KanalCipi[] = [
    // etiket "Kapalı": bu cip bir ses secimi DEGIL, bir kapatma eylemidir
    // (SeviyeDetayModal 'kapali' icin seviyeyiKapat() cagirir).
    { id: 'kapali', etiket: 'Kapalı', ikon: 'bell-slash', kanallar: modKanallaraCevir('sessiz') },
    { id: 'bildirim', etiket: 'Bildirim', ikon: 'bell', kanallar: modKanallaraCevir('bildirim') },
    { id: 'sesli', etiket: 'Sesli anons', ikon: 'volume-up', kanallar: modKanallaraCevir('sesli') },
    { id: 'ikisi', etiket: 'İkisi de', ikon: 'bullhorn', kanallar: modKanallaraCevir('ikisi') },
];

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
    { id: 'hafif', etiket: 'Hafif', ikon: 'feather-alt' },
    { id: 'normal', etiket: 'Normal', ikon: 'balance-scale' },
    { id: 'yogun', etiket: 'Yoğun', ikon: 'bolt' },
];
