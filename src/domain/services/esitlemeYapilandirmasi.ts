/**
 * Cihazlar arası eşitleme (issue #288) — derleme zamanı yapılandırması.
 *
 * Yapılandırılmamış sağlayıcı ekranda HİÇ gösterilmez (kullanıcıya çalışmayan seçenek
 * sunulmaz):
 *  - Google Drive (yalnız Android): yapılandırma GEREKMEZ. Authorization API istemci
 *    kimliği istemez; Google paket adı + imza SHA-1'ini Cloud projesindeki Android OAuth
 *    istemcileriyle eşler. Kullanılabilirlik yalnız cihaza bağlıdır (köprü + Google Play
 *    hizmetleri) → `GoogleDriveSaglayicisi.yapilandirildiMi`.
 *  - iCloud: `plugins/withIcloudEsitleme` `{ etkin: true }` ile eklendiğinde
 *    `extra.icloudEsitlemeEtkin = true` yazar (entitlement + App ID capability gerekir).
 *
 * `expo-constants` TEMBEL yüklenir: jest'te ve native modülün olmadığı ortamda
 * yapılandırma "yok" sayılır (fırlatmaz).
 */

import { Platform } from 'react-native';

type Ekstra = Record<string, unknown>;

const ekstrayiOku = (): Ekstra => {
  try {
    const sabitler = (require('expo-constants') as { default?: { expoConfig?: unknown } }).default;
    const yapi = (sabitler?.expoConfig ?? null) as { extra?: unknown } | null;
    return yapi?.extra && typeof yapi.extra === 'object' ? (yapi.extra as Ekstra) : {};
  } catch {
    return {};
  }
};

/** iCloud eşitlemesi bu build'de etkinleştirildi mi? (config plugin bayrağı) */
export function icloudEsitlemeEtkinMi(platform: string = Platform.OS): boolean {
  return platform === 'ios' && ekstrayiOku().icloudEsitlemeEtkin === true;
}
