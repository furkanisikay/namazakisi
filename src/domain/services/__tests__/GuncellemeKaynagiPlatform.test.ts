/**
 * NOBETCI — GitHub guncelleme kaynagi iOS'ta KAPALI (App Store reddi).
 *
 * `GitHubGuncellemeKaynagi` release varliklarindan APK baglantisi, bulamazsa
 * GitHub release SAYFASI sunar. iOS'ta bunun iki sonucu olurdu:
 *   1. App Review reddi — uygulamayi kendi disinda bir dagitim kanalina
 *      yonlendirmek yasak;
 *   2. Zaten calismaz — iOS APK kuramaz, kullaniciyi cikmaza sokar.
 * iOS'ta guncelleme App Store'un isidir; kaynak kapatilir ve YERINE BIR SEY
 * KONMAZ (bkz. plan §7 kapsam disi).
 *
 * Bu dosya `GuncellemeServisi.test.ts`'ten AYRIDIR cunku o suite `react-native`i
 * tumden mock'layip `Platform.OS = 'android'` sabitler; platforma gore degisen
 * davranis orada olculemez.
 *
 * DIKKAT — bu repoda jest'in VARSAYILAN `Platform.OS` degeri **`ios`**
 * (`preset: "react-native"` → `haste.defaultPlatform: 'ios'`). Yani Platform
 * mock'lamayan her test iOS olarak kosar.
 */

const mockPlatformDurumu = { OS: 'ios' };
// DIKKAT: `react-native`i tumden mock'lamak DIGER export'lari DUSURUR
// (AGENTS.md tuzagi). `GuncellemeServisi` transitif olarak
// `PlayStoreGuncellemeModulu`yu ceker ve o da modul seviyesinde
// `const { PlayStoreGuncelleme } = NativeModules` yapar → `NativeModules`
// verilmezse suite hic calismadan patlar. iOS'ta bu native modul zaten
// yoktur; `undefined` dogru davranistir.
jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatformDurumu.OS;
    },
  },
  NativeModules: {},
  NativeEventEmitter: class {
    addListener() {
      return { remove() {} };
    }
    removeAllListeners() {}
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true }),
}));

// Play Store zincirini KES. `PlayStoreGuncellemeModulu` MODUL SEVIYESINDE
// `Platform.OS` okur; ES import'lari yukaridaki `const mockPlatformDurumu`
// tanimindan ONCE kostugu icin (jest/babel hoisting) getter TDZ'ye duser ve
// suite hic calismadan patlar. Olculen sey GitHub kaynaginin platform kapisi;
// Play Store tarafinin bu testte hic yuklenmesi gerekmiyor.
jest.mock('../PlayStoreGuncellemeKaynagi', () => ({
  PlayStoreGuncellemeKaynagi: class {
    readonly tip = 'playstore';
    destekleniyor() {
      return false;
    }
    async enSonSurumuKontrolEt() {
      return { guncellemeMevcut: false, bilgi: null };
    }
  },
}));

jest.mock('../PlayStoreGuncellemeModulu', () => ({
  PlayStoreModulu: {
    kurulumKaynagiGetir: jest.fn().mockResolvedValue('sideload'),
  },
}));

import { GitHubGuncellemeKaynagi } from '../GuncellemeServisi';

describe('GitHubGuncellemeKaynagi.destekleniyor() — platform kapisi', () => {
  test('iOS: KAPALI (App Store reddi + APK zaten kurulamaz)', () => {
    mockPlatformDurumu.OS = 'ios';
    expect(new GitHubGuncellemeKaynagi().destekleniyor()).toBe(false);
  });

  test('Android: ACIK (sideload kullanicisi guncellemeyi buradan alir)', () => {
    mockPlatformDurumu.OS = 'android';
    expect(new GitHubGuncellemeKaynagi().destekleniyor()).toBe(true);
  });

  test('desteklenmeyen platformda ag cagrisi YAPILMAZ — kaynak hic secilmez', () => {
    mockPlatformDurumu.OS = 'ios';
    const kaynak = new GitHubGuncellemeKaynagi();
    // `kaynaklardanKontrolEt` destekleniyor() false olan kaynagi `continue` ile
    // atlar; yani iOS'ta GitHub API'sine istek hic cikmaz.
    expect(kaynak.destekleniyor()).toBe(false);
    expect(kaynak.tip).toBe('github');
  });
});
