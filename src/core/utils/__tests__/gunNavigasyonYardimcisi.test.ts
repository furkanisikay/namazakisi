import { aktifGunuHesapla, gelecekGuneGecisMi } from '../gunNavigasyonYardimcisi';
import { bugunuAl, dunuAl, gunEkle } from '../TarihYardimcisi';

// Saat/tarihe bağlı testlerde sabit tarih YAZILMAZ (AGENTS.md): bugunuAl()/dunuAl()
// kullanılır. Saatler enjekte edilebilir (simdi, imsakZamani) olduğu için fake timer
// gerekmez — fonksiyonlar saf.
describe('gunNavigasyonYardimcisi — aktifGunuHesapla', () => {
  const bugun = bugunuAl();
  const dun = dunuAl();

  it('imsak zamanı yoksa (konum/hesaplama yok) aktif gün her zaman bugündür', () => {
    const simdi = new Date(); // saat fark etmez
    expect(aktifGunuHesapla(bugun, simdi, null, dun)).toBe(bugun);
  });

  it('gündüz (imsaktan SONRA) ise aktif gün bugündür', () => {
    // imsak 05:00, şu an 12:00 -> gündüz
    const imsak = new Date(`${bugun}T05:00:00`);
    const simdi = new Date(`${bugun}T12:00:00`);
    expect(aktifGunuHesapla(bugun, simdi, imsak, dun)).toBe(bugun);
  });

  it('akşam/yatsı (imsaktan sonra, aynı gün) ise aktif gün hâlâ bugündür', () => {
    const imsak = new Date(`${bugun}T05:00:00`);
    const simdi = new Date(`${bugun}T22:30:00`); // yatsı vakti, henüz gece yarısı olmadı
    expect(aktifGunuHesapla(bugun, simdi, imsak, dun)).toBe(bugun);
  });

  it('REGRESYON (gece yarısı + yatsı): gece yarısından sonra imsaktan ÖNCE ise aktif gün DÜNDÜR', () => {
    // Yeni takvim günü başladı ama önceki günün yatsı süreci sürüyor.
    // bugun = yeni gün; simdi = 00:30 (imsak 05:00'dan önce) -> aktif gün = dün.
    const imsak = new Date(`${bugun}T05:00:00`);
    const simdi = new Date(`${bugun}T00:30:00`);
    expect(aktifGunuHesapla(bugun, simdi, imsak, dun)).toBe(dun);
  });

  it('tam imsak anında (simdi === imsak) aktif gün bugündür (yeni gün başladı)', () => {
    const imsak = new Date(`${bugun}T05:00:00`);
    const simdi = new Date(`${bugun}T05:00:00`);
    expect(aktifGunuHesapla(bugun, simdi, imsak, dun)).toBe(bugun);
  });
});

describe('gunNavigasyonYardimcisi — gelecekGuneGecisMi', () => {
  const aktifGun = bugunuAl();

  it('geçmiş güne gitmek gelecek geçişi DEĞİLDİR (serbest — #13 regresyonu)', () => {
    const gecmis = gunEkle(aktifGun, -5);
    expect(gelecekGuneGecisMi(gecmis, aktifGun)).toBe(false);
  });

  it('aktif güne (eşit) dönmek gelecek geçişi DEĞİLDİR — açılış snap toast tetiklemez', () => {
    expect(gelecekGuneGecisMi(aktifGun, aktifGun)).toBe(false);
  });

  it('aktif günden sonraki bir güne gitmek gelecek geçişidir (engellenmeli)', () => {
    const yarin = gunEkle(aktifGun, 1);
    expect(gelecekGuneGecisMi(yarin, aktifGun)).toBe(true);
  });

  it('REGRESYON (gece yarısı): aktif gün DÜN iken bugüne (takvim) gitmek gelecek sayılır', () => {
    // Gece yarısı sonrası aktif gün dün; pager initialPage=bugün ise onPageSelected
    // bugün için tetiklenir ve "gelecek gün" engeline takılırdı. Doğru davranış:
    // açılış aktif günde (dün) yapılır, bugün hedeflenmez.
    const aktif = dunuAl();
    const bugun = bugunuAl();
    expect(gelecekGuneGecisMi(bugun, aktif)).toBe(true);
  });
});
