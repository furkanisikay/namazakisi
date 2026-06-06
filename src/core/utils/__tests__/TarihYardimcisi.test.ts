import { bugunuAl, dunuAl, gunEkle } from '../TarihYardimcisi';

describe('TarihYardimcisi — bugun/dun', () => {
  it('dunuAl(), bugünden tam 1 gün önceyi ISO formatında döndürür', () => {
    expect(dunuAl()).toBe(gunEkle(bugunuAl(), -1));
  });

  it('dunuAl() YYYY-MM-DD formatında döner', () => {
    expect(dunuAl()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
