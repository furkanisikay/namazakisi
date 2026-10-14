/**
 * `expo-secure-store` mock'u (issue #288) — native köprü jest'te yoktur.
 * Bellek-içi depo; testler `require('expo-secure-store').__sifirla()` ile temizler.
 */
let depo = new Map();

module.exports = {
  AFTER_FIRST_UNLOCK: 0,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1,
  WHEN_UNLOCKED: 5,
  getItemAsync: jest.fn(async (anahtar) => (depo.has(anahtar) ? depo.get(anahtar) : null)),
  setItemAsync: jest.fn(async (anahtar, deger) => {
    depo.set(anahtar, deger);
  }),
  deleteItemAsync: jest.fn(async (anahtar) => {
    depo.delete(anahtar);
  }),
  isAvailableAsync: jest.fn(async () => true),
  __sifirla: () => {
    depo = new Map();
  },
};
