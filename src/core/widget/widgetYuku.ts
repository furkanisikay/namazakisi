/**
 * Telefon → ana ekran widget'ı / hızlı ayarlar kutusu VERİ SÖZLEŞMESİ (issue #275/#276) — SAF.
 *
 * Vakitler JS'te hesaplanır (tek kaynak: etkin hesap ayarı `aktifPrayerTimes`, gün bazında
 * ayrı `PrayerTimes`) ve native `WidgetVeri` modülüyle SharedPreferences'a yazılır;
 * widget, kutu ve kısayol yalnız GÖSTERİR / karar verir.
 *
 * SÖZLEŞME İKİ TARAFTA kilitlidir: `aktifVakitBul` ↔ Kotlin `VakitCizelgesi.durumHesapla`,
 * `kildimIstekKodu` ↔ Kotlin `kildimIstekKodu`. İkisi de
 * `android/app/src/test/resources/widget-ornek.json` örneklerini doğrular. Şema
 * değişirse `WIDGET_YUK_SURUMU` artırılır.
 *
 * Wear yükünden (`core/wear/wearYuku.ts`) BİLİNÇLİ olarak AYRI tutulur: o sözleşmenin
 * sahibi saat uygulamasıdır ve iki ayrı yayın ritmi vardır (widget anında, saat
 * Data Layer kuyruğuyla). Hesap kaynağı yine ortak: `gunVakitleriniHesapla`.
 */
import { NamazAdi } from '../constants/UygulamaSabitleri';
import type { GunlukNamazlar, VakitAdi } from '../types';
import { gunEkle } from '../utils/TarihYardimcisi';
import { gunVakitleriniHesapla, type NafileKoordinat } from '../nafile/gunVakitleri';

/** 2: her girişe `tarih` (namaz günü) eklendi, pencere dün + 8 gün oldu. */
export const WIDGET_YUK_SURUMU = 2;

/**
 * Dün + bugün + 7 gün. Dün: gece yarısından sonra yatsı hâlâ sürer (aktif gün = dün);
 * ileri 7 gün: uygulama ve arka plan görevi bir hafta çalışmasa da widget doğru gösterir.
 */
export const WIDGET_GUN_SAYISI = 9;

export type WidgetVakitKodu = 'sabah' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export const WIDGET_KILINABILIR: readonly WidgetVakitKodu[] = ['sabah', 'ogle', 'ikindi', 'aksam', 'yatsi'];

export interface WidgetVakitAni {
    vakit: WidgetVakitKodu;
    /** Giriş anı, epoch ms. */
    ms: number;
    /** Vaktin ait olduğu NAMAZ günü ('YYYY-MM-DD'): gece yarısı sonrası yatsı dünündür. */
    tarih: string;
}

export interface WidgetVerisi {
    surum: number;
    /** Takvim günü — yalnız tanı içindir, karar `vakitler[].tarih`'ten verilir. */
    tarih: string;
    vakitler: WidgetVakitAni[];
}

/** Widget kodu ↔ kayıt katmanının `VakitAdi`'sı (widget tarihsel olarak 'sabah' der). */
export const widgetKoduVakitAdina = (kod: WidgetVakitKodu): VakitAdi | null =>
    kod === 'sabah' ? 'imsak' : kod === 'gunes' ? null : kod;

const NAMAZ_KODU: Partial<Record<string, WidgetVakitKodu>> = {
    [NamazAdi.Sabah]: 'sabah',
    [NamazAdi.Ogle]: 'ogle',
    [NamazAdi.Ikindi]: 'ikindi',
    [NamazAdi.Aksam]: 'aksam',
    [NamazAdi.Yatsi]: 'yatsi',
};

const KOD_NAMAZ: Record<WidgetVakitKodu, NamazAdi | null> = {
    sabah: NamazAdi.Sabah,
    gunes: null,
    ogle: NamazAdi.Ogle,
    ikindi: NamazAdi.Ikindi,
    aksam: NamazAdi.Aksam,
    yatsi: NamazAdi.Yatsi,
};

/** Widget kodu → kayıttaki `NamazAdi` (güneş bir namaz değildir → null). */
export const widgetKoduNamazAdina = (kod: WidgetVakitKodu): NamazAdi | null => KOD_NAMAZ[kod];

export function widgetVerisiOlustur(koordinat: NafileKoordinat, bugunIso: string): WidgetVerisi {
    const dun = gunEkle(bugunIso, -1);
    const vakitler: WidgetVakitAni[] = [];
    for (let i = 0; i < WIDGET_GUN_SAYISI; i++) {
        const tarih = gunEkle(dun, i);
        const v = gunVakitleriniHesapla(koordinat, tarih);
        vakitler.push(
            { vakit: 'sabah', ms: v.imsak.getTime(), tarih },
            { vakit: 'gunes', ms: v.gunes.getTime(), tarih },
            { vakit: 'ogle', ms: v.ogle.getTime(), tarih },
            { vakit: 'ikindi', ms: v.ikindi.getTime(), tarih },
            { vakit: 'aksam', ms: v.aksam.getTime(), tarih },
            { vakit: 'yatsi', ms: v.yatsi.getTime(), tarih }
        );
    }
    vakitler.sort((a, b) => a.ms - b.ms);
    return { surum: WIDGET_YUK_SURUMU, tarih: bugunIso, vakitler };
}

/** tarih → kılınan widget kodları (sözleşme sırası sabit, güneş asla yer almaz). */
export function widgetKilinanlariOlustur(gunler: readonly GunlukNamazlar[]): Record<string, WidgetVakitKodu[]> {
    const sonuc: Record<string, WidgetVakitKodu[]> = {};
    for (const gun of gunler) {
        const kodlar = new Set(
            gun.namazlar.filter((n) => n.tamamlandi).map((n) => NAMAZ_KODU[n.namazAdi]).filter(Boolean)
        );
        sonuc[gun.tarih] = WIDGET_KILINABILIR.filter((k) => kodlar.has(k));
    }
    return sonuc;
}

export interface AktifVakitDurumu {
    /** İçinde bulunulan KILINABİLİR vakit; güneş→öğle arası / veri yok / veri tükenmişse null. */
    aktif: WidgetVakitAni | null;
    /** Aktif vaktin çıkışı (bir sonraki girişin anı). */
    bitisMs: number | null;
    /** Sıradaki kılınabilir vakit (güneş atlanır). */
    sonraki: WidgetVakitAni | null;
}

/** Kotlin `VakitCizelgesi.durumHesapla`'nın ikizi — kurallar birebir aynı olmalı. */
export function aktifVakitBul(vakitler: readonly WidgetVakitAni[], simdiMs: number): AktifVakitDurumu {
    const sirali = [...vakitler].sort((a, b) => a.ms - b.ms);
    let sonIndeks = -1;
    sirali.forEach((v, i) => {
        if (v.ms <= simdiMs) sonIndeks = i;
    });
    const sonraki = sirali.slice(sonIndeks + 1).find((v) => WIDGET_KILINABILIR.includes(v.vakit)) ?? null;
    if (sonIndeks < 0) return { aktif: null, bitisMs: null, sonraki };
    const son = sirali[sonIndeks];
    const sonrakiGiris = sirali[sonIndeks + 1];
    if (!WIDGET_KILINABILIR.includes(son.vakit) || !sonrakiGiris) {
        return { aktif: null, bitisMs: null, sonraki };
    }
    return { aktif: son, bitisMs: sonrakiGiris.ms, sonraki };
}

/**
 * Widget "Kıldım" `PendingIntent` istek kodu: `"<tarih>_<vakitAdi>".hashCode()`
 * (Java `String.hashCode`, 32 bit işaretli). Kotlin ikiziyle aynı değeri verir.
 */
export function kildimIstekKodu(tarih: string, vakitAdi: VakitAdi): number {
    const s = `${tarih}_${vakitAdi}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return h;
}
