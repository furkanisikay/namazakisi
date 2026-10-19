/**
 * Hatırlatma DÜZEYİ (Kapalı · Hafif · Normal · Yoğun) — kullanıcıya görünen özet. SAF.
 *
 * Kurulum sihirbazı ve (Dalga 3) Hatırlatmalar sayfası aynı düzey seçiciyi kullanır;
 * seçicinin altındaki "bugün ne olacak" cümlesi BURADAN gelir. Sayılar elle
 * yazılmaz: preset adımları motorun kendi plan üreticisinden (`vakitUyariPlaniOlustur`)
 * geçirilip sayılır — böylece metin, cihazın gerçekte kuracağı planla ayrışamaz
 * (preset değişirse cümle de değişir; nöbetçi `duzeyOzeti.test.ts`).
 */
import type { PresetSeviyeleri } from '../muhafiz/matrisIslemleri';
import { presetMatrisiOlustur, presetSesliIceriyorMu } from '../muhafiz/matrisIslemleri';
import { sesliAnonsGerekliMi, vakitUyariPlaniOlustur } from '../muhafiz/motorAdaptoru';

/** Görünen düzeyler. `kapali` = muhafız kapalı; `ozel` seçicide yer almaz. */
export type HatirlatmaDuzeyi = 'kapali' | 'hafif' | 'normal' | 'yogun';

export const HATIRLATMA_DUZEYLERI: readonly HatirlatmaDuzeyi[] = ['kapali', 'hafif', 'normal', 'yogun'];

export const DUZEY_ADLARI: Record<HatirlatmaDuzeyi, string> = {
    kapali: 'Kapalı',
    hafif: 'Hafif',
    normal: 'Normal',
    yogun: 'Yoğun',
};

export const DUZEY_IKONLARI: Record<HatirlatmaDuzeyi, string> = {
    kapali: 'bell-slash',
    hafif: 'bell',
    normal: 'bell',
    yogun: 'bullhorn',
};

export interface DuzeyOlcusu {
    /** İlk hatırlatma vaktin çıkmasına kaç dk kala. */
    ilkDk: number;
    /** Bir vakitte kaç uyarı gelir (motorun planı). */
    uyariSayisi: number;
    /** Bu uyarıların kaçı sesli okunur. */
    sesliSayisi: number;
    /** Sesli okuma içeriyor mu (rıza bilgisi gerekir). */
    sesli: boolean;
}

/** Preset adımlarını motorla ölçer (sesli onay VERİLMİŞ varsayılır — düzeyin vaadi). */
export function duzeyiOlc(seviyeler: PresetSeviyeleri): DuzeyOlcusu {
    const vakit = presetMatrisiOlustur(seviyeler, true).ogle;
    const plan = vakitUyariPlaniOlustur(vakit, Number.MAX_SAFE_INTEGER);
    const ilkDk = plan.reduce((enBuyuk, u) => Math.max(enBuyuk, u.kalanDk), 0);
    const sesliSayisi = plan.filter((u) => sesliAnonsGerekliMi(u.kanallar)).length;
    return { ilkDk, uyariSayisi: plan.length, sesliSayisi, sesli: presetSesliIceriyorMu(seviyeler) };
}

/** Düzey önizlemesindeki tek uyarı (görsel anlatı). */
export interface DuzeyOnizlemeAdimi {
    /** Vaktin çıkmasına kaç dk kala. */
    kalanDk: number;
    /** Sertlik (1 nazik … 4 acil). */
    seviye: number;
    /** Sesli okunur mu. */
    sesli: boolean;
}

/**
 * Düzey önizlemesinin noktaları — `duzeyiOlc` ile AYNI yoldan (motorun plan üreticisi),
 * kronolojik (en erken önce). Elle yazılmış tablo YOK: preset değişirse resim de değişir.
 *
 * `sesliIzinVar` false iken sesli hücreler `presetUygula`'daki gibi yalnız bildirime düşer
 * (sesli okuma rızası yok ya da kullanıcı sesliyi kapattı) → önizleme "sesli" nokta GÖSTERMEZ.
 */
export function duzeyOnizlemeAdimlari(seviyeler: PresetSeviyeleri | null, sesliIzinVar = true): DuzeyOnizlemeAdimi[] {
    if (!seviyeler) return [];
    const vakit = presetMatrisiOlustur(seviyeler, sesliIzinVar).ogle;
    return vakitUyariPlaniOlustur(vakit, Number.MAX_SAFE_INTEGER)
        .map((u) => ({ kalanDk: u.kalanDk, seviye: u.seviye, sesli: sesliAnonsGerekliMi(u.kanallar) }))
        .sort((a, b) => b.kalanDk - a.kalanDk);
}

/**
 * "Kendi ayarınız" (muhafız `yogunluk === 'ozel'`): kullanıcının vakit vakit kurduğu
 * düzen. Sihirbazda yer almaz; Hatırlatmalar sayfası ve muhafız ayrıntısında yalnız
 * kaydedilmiş bir özel ayar varken BEŞİNCİ kart olarak görünür (hiçbir kartın seçili
 * olmaması "ne seçili?" sorusunu cevapsız bırakırdı).
 */
export const OZEL_DUZEY_ADI = 'Kendi ayarınız';
export const OZEL_DUZEY_IKONU = 'sliders-h';
/** Kart altı (≤ 6 kelime): seçiliyken ve değilken. */
export const OZEL_DUZEY_ACIKLAMASI = { secili: 'Vakit vakit siz ayarladınız', geri: 'Kaydettiğiniz ayara dönün' };
export const OZEL_DUZEY_CUMLESI = 'Her vakit sizin ayarladığınız gibi hatırlatılır.';

/**
 * Seçicinin altındaki tek cümle (≤ 12 kelime).
 *
 * `sesliIzinVar` (varsayılan evet): sesli okuma RIZASI yoksa düzey sesli adımları
 * bildirimle kurar (`presetUygula(…, false)`) → kart da "sesli" DEMEZ. Aksi halde
 * kart "sesli" derken vakit satırı "Sadece bildirim" diyordu (persona çalışması D9).
 * Sihirbaz rıza maddesini ekranda gösterdiği için varsayılanı kullanır.
 */
export function duzeyCumlesi(duzey: HatirlatmaDuzeyi, olcu: DuzeyOlcusu | null, sesliIzinVar = true): string {
    if (duzey === 'kapali' || !olcu) return 'Vakit çıkmadan hatırlatma gelmez.';
    const ses = olcu.sesli && sesliIzinVar ? 'Son dakikada sesli okur.' : 'Sesli okuma yok.';
    return `Çıkmadan ${olcu.ilkDk} dk önce başlar, ${olcu.uyariSayisi} uyarı. ${ses}`;
}

/**
 * Sesli düzeyin rıza maddesi — PLATFORMA GÖRE DOĞRU olmak zorunda (rıza bunun
 * gösterildiğine dayanır). Android'de anons alarm sesiyle konuşur: sessiz mod ve
 * Rahatsız Etmeyin'i deler. iPhone'da bildirim sesidir: sessiz anahtar açıkken duyulmaz
 * (`PlatformYetenekleri.sessizligiDelebilir`).
 */
export function sesliBilgiMetni(sessizligiDelebilir: boolean): string {
    return sessizligiDelebilir
        ? "Sesli okuma alarm gibidir: sessiz modda ve Rahatsız Etmeyin'de de duyulur."
        : 'Sesli okuma bildirim sesiyle çalar; telefon sessizdeyken duyulmaz.';
}

/** Seçenek kartındaki kısa açıklama (≤ 6 kelime). */
export function duzeyKisaAciklamasi(duzey: HatirlatmaDuzeyi, olcu: DuzeyOlcusu | null, sesliIzinVar = true): string {
    if (duzey === 'kapali' || !olcu) return 'Hatırlatma yok';
    return `Vakit başına ${olcu.uyariSayisi} uyarı${olcu.sesli && sesliIzinVar ? ', sesli' : ''}`;
}
