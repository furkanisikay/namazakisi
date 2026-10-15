/**
 * Güvenli depo — işletim sisteminin anahtar zinciri (iOS Keychain / Android Keystore)
 * üzerinden `expo-secure-store`. Cihazlar arası eşitlemenin (issue #288) parolası,
 * türetilmiş anahtarı ve bulut hesabı yenileme belirteci BURADA durur, AsyncStorage'da
 * DEĞİL.
 *
 * - YEDEKLEMEYE GİRMEZ: AsyncStorage'dan ayrıdır; yedek beyaz listesi buraya hiç bakmaz.
 * - iOS'ta `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`: 15 dk'lık arka plan görevi kilit
 *   ekranındayken de okuyabilsin (varsayılan `WHEN_UNLOCKED` kilitliyken okunamaz →
 *   arka plan eşitlemesi sessizce hep "parola yok" derdi) ve öğe iCloud Anahtar
 *   Zinciri / cihaz yedeğiyle başka cihaza TAŞINMASIN.
 * - Modül TEMBEL yüklenir: native köprü jest'te ve modülün olmadığı eski bir build'de
 *   yoktur; depo o zaman "boş" davranır (okuma `null`). `yaz` dışında hiçbiri
 *   fırlatmaz — yazılamayan parola kullanıcıya hata olarak dönmeli.
 */

type SecureStoreModulu = typeof import('expo-secure-store');

let modulOnbellegi: SecureStoreModulu | null | undefined;

const modul = (): SecureStoreModulu | null => {
  if (modulOnbellegi !== undefined) return modulOnbellegi;
  try {
    modulOnbellegi = require('expo-secure-store') as SecureStoreModulu;
  } catch {
    modulOnbellegi = null;
  }
  return modulOnbellegi;
};

const secenekler = (m: SecureStoreModulu) => ({
  keychainAccessible: m.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
});

export const GuvenliDepo = {
  async oku(anahtar: string): Promise<string | null> {
    const m = modul();
    if (!m) return null;
    try {
      return await m.getItemAsync(anahtar, secenekler(m));
    } catch {
      return null;
    }
  },

  /** @throws Depo yoksa ya da yazılamazsa. */
  async yaz(anahtar: string, deger: string): Promise<void> {
    const m = modul();
    if (!m) throw new Error('Güvenli depo bu cihazda kullanılamıyor');
    await m.setItemAsync(anahtar, deger, secenekler(m));
  },

  async sil(anahtar: string): Promise<void> {
    const m = modul();
    if (!m) return;
    try {
      await m.deleteItemAsync(anahtar, secenekler(m));
    } catch {
      // Silinemeyen öğe bir sonraki yazımda zaten ezilir.
    }
  },
};
