/**
 * MUHAFIZ PLANI DEĞİŞTİ GÖZLEMCİSİ (Wear OS — issue #280).
 *
 * Saat telefonun HAZIR muhafız planını taşır; muhafız ayarı/planı değişince
 * saatin planı da tazelenmeli. Tek boğaz noktası `ArkaplanMuhafizServisi
 * .yapilandirVePlanla`'dır (beş tüketici de oradan geçer) — orası haber verir,
 * `WearSenkronServisi.baslat` dinler.
 *
 * AYRI DOSYA OLMASI BİLİNÇLİ: `ArkaplanMuhafizServisi` native köprü grafiğini
 * (expo-notifications, TTS) çeker; `WearSenkronServisi` onu import etseydi saat
 * servisini yükleyen her test köprüyü mock'lamak zorunda kalırdı (AGENTS.md
 * `requireNativeModule` tuzağı). Bu dosya hiçbir şey import etmez.
 *
 * Geçilen matris `hazirla` ile DOĞRULANMIŞ matristir → saattaki kimlikler
 * telefondakilerle aynı kalır. Dinleyici hatası planlamayı ASLA düşürmez.
 */
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';

export interface MuhafizPlaniDurumu {
    aktif: boolean;
    matris: MuhafizMatrisi;
}

export type MuhafizPlaniDinleyicisi = (durum: MuhafizPlaniDurumu) => void;

let dinleyici: MuhafizPlaniDinleyicisi | null = null;

export const muhafizPlaniDinleyicisiniAyarla = (fn: MuhafizPlaniDinleyicisi | null): void => {
    dinleyici = fn;
};

/** @returns dinleyici hata verdiyse hata, yoksa null (çağıran loglar). */
export const muhafizPlaniDegistiBildir = (durum: MuhafizPlaniDurumu): unknown => {
    try {
        dinleyici?.(durum);
        return null;
    } catch (e) {
        return e;
    }
};
