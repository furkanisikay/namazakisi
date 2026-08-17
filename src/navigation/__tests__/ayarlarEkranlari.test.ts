import { AYARLAR_EKRANLARI } from '../ayarlarEkranlari';

describe('AYARLAR_EKRANLARI', () => {
  it('adlar benzersiz', () => {
    expect(new Set(AYARLAR_EKRANLARI).size).toBe(AYARLAR_EKRANLARI.length);
  });
});
