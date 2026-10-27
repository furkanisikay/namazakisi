/**
 * Yazı yönü sorusunun (`YonDegisimiModali`) NEREDE ve NE ZAMAN çizileceğini düzenleyen kapı.
 *
 * iOS iki kardeş modalı aynı anda sunamaz (AGENTS.md):
 * - **Bekletme:** dil seçici kaydı sürerken ve kendi sorusu (elle yazılmış sesli okuma metinleri)
 *   açıkken kökteki soru bekler; o soru kapanınca gelir (ikisi de sorulur).
 * - **Yerel sahip:** kendisi bir `<Modal>` olan kurulum sihirbazı dil penceresi soruyu kendi
 *   içinde KART olarak çizer; o açıkken kökteki modal çizilmez.
 * Bırakma kısa gecikmelidir: kapanan modalın solma animasyonu bitmeden yenisi sunulmasın.
 */
import { useEffect, useSyncExternalStore } from 'react';

export const YON_SORUSU_BIRAKMA_GECIKMESI_MS = 350;

type Kume = Set<symbol>;
const bekletenler: Kume = new Set();
const yerelSahipler: Kume = new Set();
const dinleyiciler = new Set<() => void>();

const bildir = () => {
  for (const fn of [...dinleyiciler]) fn();
};
const abone = (fn: () => void) => {
  dinleyiciler.add(fn);
  return () => {
    dinleyiciler.delete(fn);
  };
};

/** `aktif` iken kümeye kayıt tutar; bırakma gecikmelidir. */
function useKayit(kume: Kume, aktif: boolean): void {
  useEffect(() => {
    if (!aktif) return undefined;
    const kimlik = Symbol('yonSorusu');
    kume.add(kimlik);
    bildir();
    return () => {
      setTimeout(() => {
        kume.delete(kimlik);
        bildir();
      }, YON_SORUSU_BIRAKMA_GECIKMESI_MS);
    };
  }, [kume, aktif]);
}

/** Bu bileşen meşgulken (kendi sorusu, kayıt) yön sorusu bekler. */
export function useYonSorusunuBeklet(aktif: boolean): void {
  useKayit(bekletenler, aktif);
}

/** Bu bileşen (bir modalın içi) yön sorusunu kendi içinde çizer; kökteki modal çizilmez. */
export function useYonSorusuYerelSahip(aktif: boolean): void {
  useKayit(yerelSahipler, aktif);
}

/** Yön sorusu şu an bekletiliyor mu? */
export function useYonSorusuBekletiliyor(): boolean {
  return useSyncExternalStore(abone, () => bekletenler.size > 0);
}

/** Soru bir modalın içinde (yerel) çiziliyor mu? */
export function useYonSorusuYerelde(): boolean {
  return useSyncExternalStore(abone, () => yerelSahipler.size > 0);
}

/** Testler için. */
export function _yonSorusuKapisiniSifirla(): void {
  bekletenler.clear();
  yerelSahipler.clear();
  bildir();
}
