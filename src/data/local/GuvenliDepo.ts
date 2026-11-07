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

import { Logger } from '../../core/utils/Logger';

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
    return (await GuvenliDepo.okuDurumlu(anahtar)).deger;
  },

  /**
   * Okuma + okunabildi mi? `hata: true` = depo şu an okunamadı (modül yok, geçici Keystore
   * hatası); `deger: null, hata: false` = gerçekten yok (secure-store kaybolan anahtarın
   * kaydını kendisi silip `null` döndüğünde de böyledir). Kayıp uyarısı yalnız ikincisinde
   * verilir; geçici hata "eşleştirmeler silindi" sanılmasın.
   */
  async okuDurumlu(anahtar: string): Promise<{ deger: string | null; hata: boolean }> {
    const m = modul();
    if (!m) return { deger: null, hata: true };
    try {
      return { deger: await m.getItemAsync(anahtar, secenekler(m)), hata: false };
    } catch (e) {
      // Değer ASLA yazılmaz; yalnız anahtar adı ve hata (tanı raporunda "depo okunamadı" izi).
      Logger.warn('GuvenliDepo', 'Güvenli depo okunamadı', { anahtar, hata: String(e) });
      return { deger: null, hata: true };
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
