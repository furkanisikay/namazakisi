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
import { bicim, canli, metin, sayili } from '../dil/aktifDil';

/** Görünen düzeyler. `kapali` = muhafız kapalı; `ozel` seçicide yer almaz. */
export type HatirlatmaDuzeyi = 'kapali' | 'hafif' | 'normal' | 'yogun';

export const HATIRLATMA_DUZEYLERI: readonly HatirlatmaDuzeyi[] = ['kapali', 'hafif', 'normal', 'yogun'];

/** Etkin dilde düzey adları (canlı görünüm: okunduğu an etkin dil). */
export const DUZEY_ADLARI: Readonly<Record<HatirlatmaDuzeyi, string>> = canli((s) => s.hatirlatma.duzeyAdlari);

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

/**
 * Eski kayıt ile güncel düzey arasındaki fark — TEK sözcükle ("Yeni öneriyi uygulayın"
 * düğmesinin yanında). Kullanıcının fark edeceği sırayla: uyarı sayısı, başlangıç, sesli
 * okuma. Ölçüler aynıysa `null` → düğme GÖSTERİLMEZ (görsel inceleme 2026-10: kart "3 uyarı"
 * derken altında boşuna bir güncelleme düğmesi duruyordu).
 */
export function duzeyFarki(
    eski: DuzeyOlcusu | null,
    yeni: DuzeyOlcusu | null,
    /**
     * Sesli okuma rızası var mı? YOKSA güncel düzey sesli adımları bildirime düşürür
     * (`presetUygula(…, false)`) → sesli farkı SAYILMAZ, düğme yanlış vaat etmesin.
     */
    sesliIzinVar = true,
): string | null {
    if (!eski || !yeni) return null;
    // Fark çipi YÖN bildirir ("+ sesli okuma"); "sesli" tek başına, hemen üstteki "Sesli okuma
    // yok" cümlesiyle çelişir gibi okunuyordu (iPhone karesi 06).
    const f = metin().hatirlatma.fark;
    if (yeni.uyariSayisi !== eski.uyariSayisi) return yeni.uyariSayisi < eski.uyariSayisi ? f.dahaAz : f.dahaCok;
    if (yeni.ilkDk !== eski.ilkDk) return yeni.ilkDk > eski.ilkDk ? f.dahaErken : f.dahaGec;
    if (sesliIzinVar && yeni.sesliSayisi !== eski.sesliSayisi) {
        return yeni.sesliSayisi > eski.sesliSayisi ? f.sesliEk : f.sesliYok;
    }
    return null;
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
export const OZEL_DUZEY_IKONU = 'sliders-h';
/** Ad, kart altı (≤ 6 kelime; seçiliyken `secili`, değilken `geri`) ve seçici cümlesi — etkin dilde. */
export const OZEL_DUZEY = canli((s) => s.hatirlatma.ozel);

/**
 * Seçicinin altındaki tek cümle (≤ 12 kelime).
 *
 * `sesliIzinVar` (varsayılan evet): sesli okuma RIZASI yoksa düzey sesli adımları
 * bildirimle kurar (`presetUygula(…, false)`) → kart da "sesli" DEMEZ. Aksi halde
 * kart "sesli" derken vakit satırı "Sadece bildirim" diyordu (persona çalışması D9).
 * Sihirbaz rıza maddesini ekranda gösterdiği için varsayılanı kullanır.
 */
export function duzeyCumlesi(duzey: HatirlatmaDuzeyi, olcu: DuzeyOlcusu | null, sesliIzinVar = true): string {
    const c = metin().hatirlatma.cumle;
    if (duzey === 'kapali' || !olcu) return c.kapali;
    const ses = olcu.sesli && sesliIzinVar ? c.sesliVar : c.sesliYok;
    if (olcu.uyariSayisi === 1) return bicim(c.birKez, { dk: olcu.ilkDk, ses });
    return sayili(c.coklu, olcu.uyariSayisi, { dk: olcu.ilkDk, ses });
}

/**
 * Sesli düzeyin rıza maddesi — PLATFORMA GÖRE DOĞRU olmak zorunda (rıza bunun
 * gösterildiğine dayanır). Android'de anons alarm sesiyle konuşur: sessiz mod ve
 * Rahatsız Etmeyin'i deler. iPhone'da bildirim sesidir: sessiz anahtar açıkken duyulmaz
 * (`PlatformYetenekleri.sessizligiDelebilir`).
 */
export function sesliBilgiMetni(sessizligiDelebilir: boolean): string {
    const b = metin().hatirlatma.sesliBilgi;
    return sessizligiDelebilir ? b.alarm : b.bildirim;
}

/** Seçenek kartındaki kısa açıklama (≤ 6 kelime). */
export function duzeyKisaAciklamasi(duzey: HatirlatmaDuzeyi, olcu: DuzeyOlcusu | null, sesliIzinVar = true): string {
    const k = metin().hatirlatma.kisa;
    if (duzey === 'kapali' || !olcu) return k.yok;
    return sayili(olcu.sesli && sesliIzinVar ? k.uyariSesli : k.uyari, olcu.uyariSayisi);
}
