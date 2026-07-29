/**
 * Bildirim izin durumunu SALT OKUR — izin İSTEMEZ.
 *
 * `BildirimServisi.izinIste()` izin yoksa `requestPermissionsAsync` ile DİYALOG
 * AÇAR; Ayarlar sayfası bu okumayı kullanırsa ekrana her girişte izin penceresi
 * fırlar. Bu yüzden ayrı, yan etkisiz bir okuma yolu gerekir.
 *
 * AYRI DOSYADA olmasının nedeni: `BildirimServisi` `ArkaplanMuhafizServisi`'ni
 * import eder, o da `modules/expo-countdown-notification/src` NATİF köprüsünü
 * çeker. Okuma fonksiyonunu oraya koymak, `useAyarOzetleri` üzerinden
 * `AyarlarSayfasi.test.tsx`'e o ağır grafiği taşır ve test dosyası köprüyü
 * mock'lamazsa suite hiç çalışmaz (AGENTS.md `requireNativeModule` tuzağı). Bu
 * dosya yalnız `expo-notifications` import eder — o da zaten global mock'ludur
 * (`__mocks__/expo-notifications.js`).
 */

import * as Notifications from 'expo-notifications';

export type BildirimIzinDurumu = 'verildi' | 'reddedildi' | 'belirsiz';

/**
 * Bildirim izin durumunu okur. Hata fırlatmaz — belirsiz durumda `'belirsiz'`
 * döner.
 */
export const izinDurumunuOku = async (): Promise<BildirimIzinDurumu> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'verildi';
    if (status === 'denied') return 'reddedildi';
    return 'belirsiz';
  } catch {
    return 'belirsiz';
  }
};
