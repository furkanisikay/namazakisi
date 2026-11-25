/**
 * iOS Xcode hedef adı `expo.name`'den türetilir. Expo SDK 58'in prebuild'i Türkçe harfleri
 * çevirir ("Namaz Akışı" → NamazAkisi), EAS CLI'ın kendi kopyası ise atar (→ NamazAk); iki ad
 * tutmayınca EAS imzalama adımı "Could not find target 'NamazAk'" ile düşer. Bu yüzden iç ad
 * ASCII'dir, telefonda görünen ad `CFBundleDisplayName` ile Türkçe kalır.
 */
const app = require('../../app.json') as { expo: { name: string; ios: { infoPlist: Record<string, unknown> } } };

describe('iOS hedef adı', () => {
  test('expo.name yalnız ASCII harf, rakam ve boşluk', () => {
    expect(app.expo.name).toMatch(/^[A-Za-z0-9 ]+$/);
  });

  test('görünen ad Türkçe kalır', () => {
    expect(app.expo.ios.infoPlist.CFBundleDisplayName).toBe('Namaz Akışı');
  });
});
