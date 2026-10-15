/**
 * Cihazlar arası eşitleme (issue #288) — derleme zamanı yapılandırması.
 *
 * Sağlayıcılar ancak SAHİBİN yapılandırmasıyla çalışır; yapılandırılmamış sağlayıcı
 * ekranda HİÇ gösterilmez (kullanıcıya çalışmayan seçenek sunulmaz):
 *  - Google Drive: `app.json > expo.extra.googleDriveIstemciKimligi` — Google Cloud
 *    OAuth istemci kimliği. Dize = yalnız Android; `{ android, ios }` = platform başına.
 *  - iCloud: `plugins/withIcloudEsitleme` `{ etkin: true }` ile eklendiğinde
 *    `extra.icloudEsitlemeEtkin = true` yazar (entitlement + App ID capability gerekir).
 *
 * `expo-constants` TEMBEL yüklenir: jest'te ve native modülün olmadığı ortamda
 * yapılandırma "yok" sayılır (fırlatmaz).
 */

import { Platform } from 'react-native';

const VARSAYILAN_PAKET = 'com.furkanisikay.namazakisi';

type Ekstra = Record<string, unknown>;

interface UygulamaYapilandirmasi {
  extra: Ekstra;
  androidPaketi: string;
}

const yapilandirmayiOku = (): UygulamaYapilandirmasi => {
  try {
    const sabitler = (require('expo-constants') as { default?: { expoConfig?: unknown } }).default;
    const yapi = (sabitler?.expoConfig ?? null) as {
      extra?: unknown;
      android?: { package?: unknown };
    } | null;
    const extra = yapi?.extra && typeof yapi.extra === 'object' ? (yapi.extra as Ekstra) : {};
    const paket = typeof yapi?.android?.package === 'string' ? yapi.android.package : VARSAYILAN_PAKET;
    return { extra, androidPaketi: paket };
  } catch {
    return { extra: {}, androidPaketi: VARSAYILAN_PAKET };
  }
};

/** Bu platform için Google OAuth istemci kimliği; yapılandırılmamışsa `null`. */
export function googleDriveIstemciKimligi(platform: string = Platform.OS): string | null {
  const deger = yapilandirmayiOku().extra.googleDriveIstemciKimligi;
  const gecerli = (x: unknown): string | null =>
    typeof x === 'string' && x.trim().endsWith('.apps.googleusercontent.com') ? x.trim() : null;
  if (typeof deger === 'string') return platform === 'android' ? gecerli(deger) : null;
  if (deger && typeof deger === 'object') {
    const harita = deger as { android?: unknown; ios?: unknown };
    if (platform === 'android') return gecerli(harita.android);
    if (platform === 'ios') return gecerli(harita.ios);
  }
  return null;
}

/**
 * OAuth yönlendirme adresi (PKCE, istemci sırrı YOK).
 *  - Android istemci türü: `<paket adı>:/oauth2redirect` (Google Cloud'da istemcinin
 *    "Özel URI şeması" gelişmiş ayarı açık olmalı; manifestte aynı şemanın
 *    intent-filter'ı MainActivity'dedir).
 *  - iOS istemci türü: ters istemci kimliği `com.googleusercontent.apps.<önek>:/oauth2redirect`
 *    (ASWebAuthenticationSession şemayı kendisi yakalar, Info.plist kaydı gerekmez).
 */
export function googleYonlendirmeAdresi(
  istemciKimligi: string,
  platform: string = Platform.OS
): string {
  if (platform === 'ios') {
    const onek = istemciKimligi.replace(/\.apps\.googleusercontent\.com$/, '');
    return `com.googleusercontent.apps.${onek}:/oauth2redirect`;
  }
  return `${yapilandirmayiOku().androidPaketi}:/oauth2redirect`;
}

/** iCloud eşitlemesi bu build'de etkinleştirildi mi? (config plugin bayrağı) */
export function icloudEsitlemeEtkinMi(platform: string = Platform.OS): boolean {
  return platform === 'ios' && yapilandirmayiOku().extra.icloudEsitlemeEtkin === true;
}
