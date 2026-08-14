import { aktifGunuHesapla, gelecekGuneGecisMi, vakitGectiMi } from '../gunNavigasyonYardimcisi';
import { bugunuAl, dunuAl, gunEkle, ISOTarihiDateNesnesiNeCevir } from '../TarihYardimcisi';

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

describe('gunNavigasyonYardimcisi — vakitGectiMi', () => {
  const bugun = bugunuAl();
  const dun = dunuAl();
  const bugunDate = ISOTarihiDateNesnesiNeCevir(bugun);
  const dunDate = ISOTarihiDateNesnesiNeCevir(dun);

  it('bugünün geçmiş vakti geçmiştir', () => {
    const simdi = new Date(`${bugun}T12:00:00`);
    expect(vakitGectiMi('05:00', bugunDate, simdi)).toBe(true);
  });

  it('bugünün gelecek vakti geçmemiştir', () => {
    const simdi = new Date(`${bugun}T12:00:00`);
    expect(vakitGectiMi('20:30', bugunDate, simdi)).toBe(false);
  });

  it('tam vakit anında (simdi === vakit) vakit girmiş sayılır', () => {
    const simdi = new Date(`${bugun}T05:00:00`);
    expect(vakitGectiMi('05:00', bugunDate, simdi)).toBe(true);
  });

  it('REGRESYON (gece yarısı): aktif gün DÜN iken dünün TÜM vakitleri geçmiştir', () => {
    // Yaşanmış bug: gece yarısından sonra yatsı sürerken aktif gün dündür ve ekran
    // dünün vakit saatlerini gösterir. Eski hesap saati DAİMA BUGÜNÜN takvim gününe
    // kuruyordu ("04:30" -> bugün 04:30) → şu an 00:30 olduğu için sabah/öğle/ikindi/
    // akşam "gelecek" sayılıp işaretleme butonları kilitleniyordu; yalnız yatsı
    // (aktif vakit olduğu için ayrı yoldan geçen) işaretlenebiliyordu.
    const simdi = new Date(`${bugun}T00:30:00`);
    expect(vakitGectiMi('04:30', dunDate, simdi)).toBe(true); // sabah
    expect(vakitGectiMi('13:15', dunDate, simdi)).toBe(true); // öğle
    expect(vakitGectiMi('17:05', dunDate, simdi)).toBe(true); // ikindi
    expect(vakitGectiMi('20:10', dunDate, simdi)).toBe(true); // akşam
    expect(vakitGectiMi('21:45', dunDate, simdi)).toBe(true); // yatsı
  });

  it('geçmiş bir güne bakarken (2 gün önce) vakitler geçmiştir', () => {
    const oncekiGun = gunEkle(bugun, -2);
    const simdi = new Date(`${bugun}T09:00:00`);
    expect(vakitGectiMi('23:50', ISOTarihiDateNesnesiNeCevir(oncekiGun), simdi)).toBe(true);
  });

  it('boş saat "geçmedi" döner (koordinat yokken vakit hesaplanamaz)', () => {
    expect(vakitGectiMi('', bugunDate, new Date())).toBe(false);
  });

  it('bozuk saat biçimi "geçmedi" döner (NaN ile karşılaştırma yapılmaz)', () => {
    expect(vakitGectiMi('abc', bugunDate, new Date())).toBe(false);
    expect(vakitGectiMi('12', bugunDate, new Date(`${bugun}T23:00:00`))).toBe(false);
  });

  it('saf: verilen gunTarihi nesnesini MUTASYONA UĞRATMAZ', () => {
    const kopya = new Date(bugunDate.getTime());
    vakitGectiMi('18:00', bugunDate, new Date(`${bugun}T12:00:00`));
    expect(bugunDate.getTime()).toBe(kopya.getTime());
  });
});
