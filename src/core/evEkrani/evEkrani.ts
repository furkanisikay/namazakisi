/**
 * Tablet ev ekranı modu — SAF karar ve pano durumu (TV panosunun tablet hâli).
 *
 * Mod YALNIZ GÖSTERİR: hatırlatma kurmaz, kayıt yazmaz. Pano kuralları Android TV
 * `cekirdek/PanoDurumu.kt` ve Apple TV `TvPano.swift` ile aynıdır: gece yarısından sonra
 * imsak girene dek gösterilen gün DÜNDÜR, sıradaki BUGÜNÜN imsakı; yatsıdan sonra
 * sıradaki YARININ imsakı.
 */
import type { GunVakitleri } from '../nafile/nafileVakitleri';
import { gunEkle } from '../utils/TarihYardimcisi';
import { canli } from '../dil/aktifDil';

export interface Boyut {
    width: number;
    height: number;
}

/** Tablet sayılması için ekranın kısa kenarı (dp). */
export const EV_EKRANI_MIN_KISA_KENAR_DP = 600;

/**
 * Pano gösterilsin mi? Ayar açık + yatay + tablet + pencere ekranı dolduruyor
 * (Split View / Stage Manager / serbest pencerede KAPALI: başka uygulamayla paylaşılan
 * ekranda tam ekran pano yanlış olur). Sade görünüm açıksa onun tek ekranı kazanır.
 */
export function evEkraniGosterilsinMi(girdi: {
    ayarAcik: boolean;
    sadeEtkin: boolean;
    pencere: Boyut;
    ekran: Boyut;
}): boolean {
    const { ayarAcik, sadeEtkin, pencere, ekran } = girdi;
    if (!ayarAcik || sadeEtkin) return false;
    if (Math.min(ekran.width, ekran.height) < EV_EKRANI_MIN_KISA_KENAR_DP) return false;
    if (pencere.width <= pencere.height) return false;
    // Pencere ekranın tamamı mı? (iki eksende de 2 dp pay; ekran yönü pencereyle aynı sayılır)
    const ekranUzun = Math.max(ekran.width, ekran.height);
    const ekranKisa = Math.min(ekran.width, ekran.height);
    return Math.abs(pencere.width - ekranUzun) <= 2 && Math.abs(pencere.height - ekranKisa) <= 2;
}

/** Ev ekranı ayarı tablette mi sunulur (telefonda ayar satırı yok)? */
export function evEkraniSunulurMu(ekran: Boyut): boolean {
    return Math.min(ekran.width, ekran.height) >= EV_EKRANI_MIN_KISA_KENAR_DP;
}

export type PanoVakti = 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';
export const PANO_VAKITLERI: readonly PanoVakti[] = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];
/** Pano çizelgesi Diyanet gibi "İmsak" yazar (vakit adı "Sabah" değil); canlı görünüm. */
export const PANO_ADLARI: Readonly<Record<PanoVakti, string>> = canli((s) => ({
    imsak: s.vakit.imsakVakti,
    gunes: s.vakit.adlar.gunes,
    ogle: s.vakit.adlar.ogle,
    ikindi: s.vakit.adlar.ikindi,
    aksam: s.vakit.adlar.aksam,
    yatsi: s.vakit.adlar.yatsi,
}));

export interface PanoDurumu {
    /** Gösterilen namaz günü (ISO). */
    tarih: string;
    vakitler: GunVakitleri;
    aktif: PanoVakti;
    siradaki: PanoVakti;
    siradakiMs: number;
    kalanMs: number;
}

/**
 * @param bugunIso cihazın takvim günü (ISO)
 * @param vakitHesapla ISO gün → o günün vakitleri
 */
export function panoDurumuHesapla(
    simdiMs: number,
    bugunIso: string,
    vakitHesapla: (iso: string) => GunVakitleri
): PanoDurumu {
    const v = vakitHesapla(bugunIso);
    if (simdiMs < v.imsak.getTime()) {
        const dun = gunEkle(bugunIso, -1);
        const siradakiMs = v.imsak.getTime();
        return { tarih: dun, vakitler: vakitHesapla(dun), aktif: 'yatsi', siradaki: 'imsak', siradakiMs, kalanMs: Math.max(0, siradakiMs - simdiMs) };
    }
    const sirali = PANO_VAKITLERI.map((ad) => [ad, v[ad].getTime()] as const);
    const aktif = [...sirali].reverse().find(([, ms]) => ms <= simdiMs)?.[0] ?? 'yatsi';
    const sonraki = sirali.find(([, ms]) => ms > simdiMs);
    const siradaki = sonraki?.[0] ?? 'imsak';
    const siradakiMs = sonraki?.[1] ?? vakitHesapla(gunEkle(bugunIso, 1)).imsak.getTime();
    return { tarih: bugunIso, vakitler: v, aktif, siradaki, siradakiMs, kalanMs: Math.max(0, siradakiMs - simdiMs) };
}

/** Ekran yanığı koruması: içerik dakikada bir birkaç noktaya kayar (TV `Kaydirma` ikizi). */
const ADIMLAR: ReadonlyArray<readonly [number, number]> = [
    [0, 0], [6, 0], [6, 6], [0, 6], [-6, 6], [-6, 0], [-6, -6], [0, -6],
];
export function kaydirmaOfseti(simdiMs: number): readonly [number, number] {
    const dakika = Math.floor(simdiMs / 60_000);
    return ADIMLAR[((dakika % ADIMLAR.length) + ADIMLAR.length) % ADIMLAR.length];
}

/**
 * "S:DD:ss" (saniye aşağı yuvarlanır) — ana ekranla AYNI ham biçim; görünen hâli
 * `BirimliSure` ("1 sa 9 dk"), sesli hâli `kalanSureSesli` üretir.
 */
export function geriSayimMetni(kalanMs: number): string {
    const t = Math.floor(Math.max(0, kalanMs) / 1000);
    const sa = Math.floor(t / 3600);
    const dk = Math.floor((t % 3600) / 60);
    const sn = t % 60;
    const iki = (n: number) => String(n).padStart(2, '0');
    return `${sa}:${iki(dk)}:${iki(sn)}`;
}
