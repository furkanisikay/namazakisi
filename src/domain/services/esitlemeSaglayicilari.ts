/**
 * Cihazlar arası eşitleme (issue #288) — sağlayıcı kaydı.
 *
 * Tek örnek (Drive erişim belirteci bellekte tutulur). Ekran yalnız
 * `kullanilabilirSaglayicilar()` listesini gösterir: yapılandırılmamış sağlayıcı
 * kullanıcıya HİÇ sunulmaz. Testler `saglayicilariAyarla` ile sahte sağlayıcı verir.
 */

import { Platform } from 'react-native';
import { EsitlemeSaglayicisi, SaglayiciKimligi } from '../../core/esitleme/esitlemeTipleri';
import { GoogleDriveSaglayicisi } from './GoogleDriveSaglayicisi';
import { IcloudSaglayicisi } from './IcloudSaglayicisi';
import { icloudEsitlemeEtkinMi } from './esitlemeYapilandirmasi';

let kayit: EsitlemeSaglayicisi[] | null = null;

/**
 * Drive yalnız Android'de (yerleşik Authorization API + Play hizmetleri) kullanılabilir;
 * iOS'ta eşitleme iCloud iledir.
 */
const varsayilanSaglayicilar = (): EsitlemeSaglayicisi[] => [
  new GoogleDriveSaglayicisi(),
  new IcloudSaglayicisi(icloudEsitlemeEtkinMi(Platform.OS)),
];

/** Bilinen tüm sağlayıcılar (yapılandırılmamışlar dahil). */
export function tumSaglayicilar(): EsitlemeSaglayicisi[] {
  if (!kayit) kayit = varsayilanSaglayicilar();
  return kayit;
}

/** Bu build'de/platformda gerçekten kullanılabilen sağlayıcılar. */
export function kullanilabilirSaglayicilar(): EsitlemeSaglayicisi[] {
  return tumSaglayicilar().filter((s) => {
    try {
      return s.yapilandirildiMi();
    } catch {
      return false;
    }
  });
}

export function saglayiciAl(kimlik: SaglayiciKimligi | null): EsitlemeSaglayicisi | null {
  if (!kimlik) return null;
  return tumSaglayicilar().find((s) => s.kimlik === kimlik) ?? null;
}

/** Test/enjeksiyon: `null` varsayılana döndürür. */
export function saglayicilariAyarla(liste: EsitlemeSaglayicisi[] | null): void {
  kayit = liste;
}
