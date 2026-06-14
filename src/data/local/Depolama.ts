/**
 * Merkezi depolama katmani (AsyncStorage uzerine ince, tip-guvenli sarmalayici).
 *
 * Ana deger: ANAHTAR-BAZLI atomik yazma kuyrugu. AsyncStorage atomik degildir; ayni
 * anahtara eszamanli read-modify-write'lar birbirini ezebilir (lost update). Bu katman
 * her anahtar icin ayri bir promise zinciri tutarak ayni anahtara yazimlari serilestirir.
 * (Onceden bu koruma yalniz LocalNamazServisi'ndeki tek anahtarda elle yapiliyordu;
 * burada genellestirildi.)
 *
 * Gelecekteki depolama motoru degisimi (MMKV/SQLite) tek noktada bu katmanin ardinda
 * yapilabilir; cagiranlar etkilenmez.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Anahtar -> o anahtara ait son yazma islemi (zincir). Ayni anahtara gelen yeni islem
// oncekinin ardina eklenir; farkli anahtarlar birbirini beklemez.
const yazmaKuyruklari = new Map<string, Promise<unknown>>();

const anahtarSirasinaAl = <T>(anahtar: string, islem: () => Promise<T>): Promise<T> => {
  const onceki = yazmaKuyruklari.get(anahtar) ?? Promise.resolve();
  // Onceki islem hata verse de zincir surdurulur (then'in ikinci argumani).
  const sonuc = onceki.then(islem, islem);
  yazmaKuyruklari.set(
    anahtar,
    sonuc.then(
      () => undefined,
      () => undefined
    )
  );
  return sonuc;
};

const guvenliParse = <T>(ham: string | null): T | null => {
  if (ham === null) return null;
  try {
    return JSON.parse(ham) as T;
  } catch {
    return null;
  }
};

export const Depolama = {
  /** Ham string oku (parse etmeden). */
  async ham(anahtar: string): Promise<string | null> {
    return AsyncStorage.getItem(anahtar);
  },

  /** JSON oku. Yoksa veya bozuksa null. */
  async oku<T>(anahtar: string): Promise<T | null> {
    return guvenliParse<T>(await AsyncStorage.getItem(anahtar));
  },

  /** JSON yaz (anahtar-kuyrugunda serilestirilir). */
  async yaz<T>(anahtar: string, deger: T): Promise<void> {
    await anahtarSirasinaAl(anahtar, () =>
      AsyncStorage.setItem(anahtar, JSON.stringify(deger))
    );
  },

  /** Ham string yaz (anahtar-kuyrugunda serilestirilir). */
  async hamYaz(anahtar: string, deger: string): Promise<void> {
    await anahtarSirasinaAl(anahtar, () => AsyncStorage.setItem(anahtar, deger));
  },

  /**
   * Atomik read-modify-write: oku -> donustur -> yaz, hepsi anahtar-kuyrugunda.
   * Eszamanli cagrilar lost-update yapmaz (sirayla calisir).
   */
  async guncelle<T>(anahtar: string, donustur: (mevcut: T | null) => T): Promise<T> {
    return anahtarSirasinaAl(anahtar, async () => {
      const mevcut = guvenliParse<T>(await AsyncStorage.getItem(anahtar));
      const yeni = donustur(mevcut);
      await AsyncStorage.setItem(anahtar, JSON.stringify(yeni));
      return yeni;
    });
  },

  /** Anahtari sil (anahtar-kuyrugunda). */
  async sil(anahtar: string): Promise<void> {
    await anahtarSirasinaAl(anahtar, () => AsyncStorage.removeItem(anahtar));
  },

  /** Verilen on-ek ile baslayan tum anahtarlar. */
  async onEkiOlanAnahtarlar(onEk: string): Promise<string[]> {
    const tum = await AsyncStorage.getAllKeys();
    return tum.filter((k) => k.startsWith(onEk));
  },

  /** Birden cok anahtari tek seferde oku ([anahtar, hamDeger|null] ciftleri). */
  async cogunuOku(anahtarlar: readonly string[]): Promise<[string, string | null][]> {
    if (anahtarlar.length === 0) return [];
    const sonuc = await AsyncStorage.multiGet(anahtarlar as string[]);
    return sonuc.map(([k, v]) => [k, v ?? null]);
  },

  /** Birden cok anahtari tek seferde sil. */
  async cogunuSil(anahtarlar: string[]): Promise<void> {
    if (anahtarlar.length === 0) return;
    await AsyncStorage.multiRemove(anahtarlar);
  },
};
