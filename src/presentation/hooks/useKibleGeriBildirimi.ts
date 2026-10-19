import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { yonCumlesi } from '../../core/kible/acilar';
import type { KibleOzeti } from './useKible';

/** Sözlü duyuru en sık bu aralıkla ve en az bu açı değişince yapılır. */
export const DUYURU_ARALIGI_MS = 3000;
export const DUYURU_ACI_ADIMI = 10;

/**
 * Saf karar: bu özet ekran okuyucuya duyurulmalı mı?
 * Hizalanma değişimi her zaman (aralık beklemeden) duyurulur; açı yalnız aralık dolduysa ve
 * son duyurudan en az `DUYURU_ACI_ADIMI` değiştiyse (konuşma kuyruğu taşmasın).
 */
export function duyurulmaliMi(
  son: { ms: number; fark: number | null; hizali: boolean } | null,
  ozet: { fark: number | null; hizali: boolean },
  simdiMs: number,
): boolean {
  if (ozet.fark === null) return false;
  if (!son) return true;
  if (ozet.hizali !== son.hizali) return true;
  if (ozet.hizali) return false;
  if (simdiMs - son.ms < DUYURU_ARALIGI_MS) return false;
  return son.fark === null || Math.abs(ozet.fark - son.fark) >= DUYURU_ACI_ADIMI;
}

/**
 * Hizaya girişte TEK titreşim (çıkışta yok) + ekran okuyucu açıksa kısılmış sözlü yön.
 * TalkBack/VoiceOver açıkken görsel kadran anlamsızdır; yön cümlesi bilgiyi taşır.
 */
export function useKibleGeriBildirimi(ozet: KibleOzeti, etkin: boolean): void {
  const [ekranOkuyucu, setEkranOkuyucu] = useState(false);
  const oncekiHizali = useRef(ozet.hizali);
  const sonDuyuru = useRef<{ ms: number; fark: number | null; hizali: boolean } | null>(null);

  useEffect(() => {
    let iptal = false;
    AccessibilityInfo.isScreenReaderEnabled?.()
      .then((v) => {
        // Değer değişmediyse yazma (gereksiz çizim + testlerde act gürültüsü).
        if (!iptal && v === true) setEkranOkuyucu(true);
      })
      .catch(() => undefined);
    const abonelik = AccessibilityInfo.addEventListener?.('screenReaderChanged', (v: boolean) => setEkranOkuyucu(v === true));
    return () => {
      iptal = true;
      abonelik?.remove?.();
    };
  }, []);

  useEffect(() => {
    const girdi = ozet.hizali && !oncekiHizali.current;
    oncekiHizali.current = ozet.hizali;
    if (!etkin || !girdi) return;
    try {
      // Tembel: expo-haptics native köprüsü saf karar testlerini (duyurulmaliMi) düşürmesin.
      const { HaptikServisi } = require('../../core/feedback/HaptikServisi') as typeof import('../../core/feedback/HaptikServisi');
      void HaptikServisi.basariTitresimi().catch(() => undefined);
    } catch {
      // titreşim yoksa bilgi yine ✓ ve metinle verilir
    }
  }, [ozet.hizali, etkin]);

  useEffect(() => {
    if (!etkin || !ekranOkuyucu) return;
    const simdi = Date.now();
    if (!duyurulmaliMi(sonDuyuru.current, ozet, simdi)) return;
    sonDuyuru.current = { ms: simdi, fark: ozet.fark, hizali: ozet.hizali };
    AccessibilityInfo.announceForAccessibility?.(yonCumlesi(ozet.fark ?? 0, ozet.hizali));
  }, [ozet, etkin, ekranOkuyucu]);
}
