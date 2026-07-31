import { acilisCizelgesi, AcilisCizelgesiSabitleri } from '../acilisCizelgesi';
import { GunDurumu, IzgaraGunu, aylikIzgaraOlustur } from '../aylikIzgara';
import { zincirBaglari } from '../zincir';

// Bu sabitler `screens/Seri/sabitler.ts > GOK_ZAMANLAMA`'daki gerçek değerlerin
// BİREBİR aynısıdır (core testi sunum katmanından import EDEMEZ — katman
// sınırı; bkz. global-constraints.md).
const SABITLER: AcilisCizelgesiSabitleri = {
  cizgiOnce: 30,
  segNormal: 85,
  segVurgu: 130,
  kopukBosluk: 32,
};

const gun = (tarih: string, durum: GunDurumu, digerAy = false): IzgaraGunu => ({
  tarih,
  gunNo: Number(tarih.slice(-2)),
  digerAy,
  durum,
});

const tam5 = (tarih: string, digerAy = false): IzgaraGunu =>
  gun(tarih, { tip: 'kilindi', vakitler: [true, true, true, true, true] }, digerAy);

const kilinanSayi = (tarih: string, sayi: number, digerAy = false): IzgaraGunu => {
  const vakitler = Array.from({ length: 5 }, (_, i) => i < sayi);
  return gun(tarih, { tip: 'kilindi', vakitler }, digerAy);
};

const dondurulmus = (tarih: string, digerAy = false): IzgaraGunu =>
  gun(tarih, { tip: 'dondurulmus' }, digerAy);

const gelecek = (tarih: string, digerAy = false): IzgaraGunu => gun(tarih, { tip: 'gelecek' }, digerAy);

describe('acilisCizelgesi', () => {
  test('ilk yildiz her zaman t=0da yanar', () => {
    const izgara = [tam5('2026-07-01'), tam5('2026-07-02'), tam5('2026-07-03')];
    const baglar = zincirBaglari(izgara, 5);
    const cizelge = acilisCizelgesi(izgara, baglar, SABITLER);
    expect(cizelge.yildizGecikme[0]).toBe(0);
  });

  test('NOBETCI: hicbir bag bir oncekinin BITISINDEN once baslamaz — sifir cakisma', () => {
    // 8 gunluk tam-dolu bir izgara: 7 ardisik bag, hepsi vurgulu (5/5 <-> 5/5).
    const izgara = Array.from({ length: 8 }, (_, i) => tam5(`2026-07-${String(i + 1).padStart(2, '0')}`));
    const baglar = zincirBaglari(izgara, 5);
    const cizelge = acilisCizelgesi(izgara, baglar, SABITLER);

    const siraliZamanlar = [...cizelge.bagZamani.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, z]) => z);

    expect(siraliZamanlar).toHaveLength(7);
    for (let i = 1; i < siraliZamanlar.length; i++) {
      const onceki = siraliZamanlar[i - 1];
      const suanki = siraliZamanlar[i];
      // Cakisma sifir olmali: bir sonraki bag, oncekinin BITTIGI andan
      // (gecikme + sure) ONCE baslayamaz. Bu test, sabit adimli bir
      // stagger'a donulurse DUSER (kasitli).
      expect(suanki.gecikme).toBeGreaterThanOrEqual(onceki.gecikme + onceki.sure);
    }
  });

  test('NOBETCI (ic tutarlilik — Task 1 incelemesi): her bag CIZGI_ONCE ile yildizdan baslar, sonraki yildiz TAM da bagin bittigi anda yanar', () => {
    // Sabit adimli (>=160ms) bir stagger'a donulurse yukaridaki "sifir
    // cakisma" testi hala gecebilir (adim yeterince genisse cakismaz) ama bu
    // test DUSER: birikimli modelin iki temel esitligi (gecikme = t + cizgiOnce
    // VE yildizGecikme[i+1] = gecikme + sure) burada TAM olarak dogrulanir.
    const izgara = Array.from({ length: 8 }, (_, i) => tam5(`2026-07-${String(i + 1).padStart(2, '0')}`));
    const baglar = zincirBaglari(izgara, 5);
    const cizelge = acilisCizelgesi(izgara, baglar, SABITLER);

    for (let i = 0; i < izgara.length - 1; i++) {
      const bag = cizelge.bagZamani.get(i);
      expect(bag).toBeDefined();
      expect(bag!.gecikme).toBe(cizelge.yildizGecikme[i] + SABITLER.cizgiOnce);
      expect(cizelge.yildizGecikme[i + 1]).toBe(bag!.gecikme + bag!.sure);
    }
  });

  test('kopuk zincirde es verilir, yildiz yine de belirir', () => {
    // Orta gun zinciri koparir (0/5) -> 0-1 ve 1-2 araliklari bagsiz (kopuk).
    const izgara = [tam5('2026-07-01'), kilinanSayi('2026-07-02', 0), tam5('2026-07-03')];
    const baglar = zincirBaglari(izgara, 5);
    const cizelge = acilisCizelgesi(izgara, baglar, SABITLER);

    expect(cizelge.bagZamani.size).toBe(0);
    // Es verilse de her yildiz (kopuk gunler dahil) bir gecikme degeri alir —
    // yani belirir, cizgi VARDIGI icin degil, es GECTIGI icin.
    expect(cizelge.yildizGecikme).toEqual([0, SABITLER.kopukBosluk, SABITLER.kopukBosluk * 2]);
  });

  test('ikisiTam bag SEG_VURGU, diger bag SEG_NORMAL suresi alir', () => {
    // esik=3: gun1 dortte-uc (tam ama 5/5 degil), gun0/gun2 tam 5/5.
    const izgara = [tam5('2026-07-01'), kilinanSayi('2026-07-02', 4), tam5('2026-07-03')];
    const baglar = zincirBaglari(izgara, 3);
    const cizelge = acilisCizelgesi(izgara, baglar, SABITLER);

    expect(cizelge.bagZamani.get(0)?.sure).toBe(SABITLER.segNormal);
    expect(cizelge.bagZamani.get(0)?.vurgulu).toBe(false);
    expect(cizelge.bagZamani.get(1)?.sure).toBe(SABITLER.segNormal);
    expect(cizelge.bagZamani.get(1)?.vurgulu).toBe(false);

    // Iki uc da 5/5 olan bir bag ekle.
    const izgaraVurgulu = [tam5('2026-07-01'), tam5('2026-07-02')];
    const baglarVurgulu = zincirBaglari(izgaraVurgulu, 5);
    const cizelgeVurgulu = acilisCizelgesi(izgaraVurgulu, baglarVurgulu, SABITLER);
    expect(cizelgeVurgulu.bagZamani.get(0)?.sure).toBe(SABITLER.segVurgu);
    expect(cizelgeVurgulu.bagZamani.get(0)?.vurgulu).toBe(true);
  });

  test('bos izgara -> cokmez, toplam=0', () => {
    const cizelge = acilisCizelgesi([], [], SABITLER);
    expect(cizelge.yildizGecikme).toEqual([]);
    expect(cizelge.bagZamani.size).toBe(0);
    expect(cizelge.toplam).toBe(0);
  });

  test('tek gunluk izgara (bag imkansiz) -> cokmez, toplam=0', () => {
    const izgara = [tam5('2026-07-01')];
    const cizelge = acilisCizelgesi(izgara, [], SABITLER);
    expect(cizelge.yildizGecikme).toEqual([0]);
    expect(cizelge.toplam).toBe(0);
  });

  test('bagsiz (hicbir gun zinciri korumuyor) izgara -> cokmez, yalniz es zamanlari', () => {
    const izgara = [gelecek('2026-07-01'), gelecek('2026-07-02'), gelecek('2026-07-03')];
    const cizelge = acilisCizelgesi(izgara, [], SABITLER);
    expect(cizelge.bagZamani.size).toBe(0);
    expect(cizelge.toplam).toBe(SABITLER.kopukBosluk * 2);
  });

  test('dondurulmus gunler zinciri korur, bag kurulur', () => {
    const izgara = [tam5('2026-07-01'), dondurulmus('2026-07-02'), tam5('2026-07-03')];
    const baglar = zincirBaglari(izgara, 5);
    const cizelge = acilisCizelgesi(izgara, baglar, SABITLER);
    expect(cizelge.bagZamani.size).toBe(2);
  });

  test('35 hucrelik gercek bir Temmuz 2026 izgarasi icin toplam sure < 5 sn', () => {
    // Referans HTML'deki (`docs/tasarim/2026-07-29-...-referans.html`) `AY`
    // dizisiyle BIREBIR ayni desen — gercek aylikIzgaraOlustur/zincirBaglari
    // uzerinden, tarihler 2026-06-29 .. 2026-08-02 (35 gun, pazartesi baslar).
    const tamVakitler = [true, true, true, true, true];
    const kayitlar: Record<string, boolean[]> = {
      '2026-06-29': tamVakitler,
      '2026-06-30': tamVakitler,
      '2026-07-01': tamVakitler,
      '2026-07-02': tamVakitler,
      '2026-07-03': [true, true, true, false, false],
      '2026-07-04': tamVakitler,
      '2026-07-05': tamVakitler,
      '2026-07-06': tamVakitler,
      '2026-07-07': tamVakitler,
      '2026-07-08': tamVakitler,
      // 07-09 / 07-10 -> dondurulmus (asagida)
      '2026-07-11': tamVakitler,
      '2026-07-12': [true, false, true, true, false],
      '2026-07-13': tamVakitler,
      '2026-07-14': [true, true, false, false, false],
      '2026-07-15': [false, false, false, false, false],
      '2026-07-16': tamVakitler,
      '2026-07-17': tamVakitler,
      '2026-07-18': tamVakitler,
      '2026-07-19': tamVakitler,
      '2026-07-20': tamVakitler,
      '2026-07-21': tamVakitler,
      '2026-07-22': [true, true, false, false, true],
      '2026-07-23': tamVakitler,
      '2026-07-24': tamVakitler, // bugun
    };
    const dondurulmusTarihler = new Set(['2026-07-09', '2026-07-10']);

    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6, // Temmuz (0-tabanli)
      kayitlar,
      dondurulmusTarihler,
      bugun: '2026-07-24',
    });

    expect(izgara).toHaveLength(35);

    const tamGunEsigi = 3; // referanstaki HEDEF ile ayni
    const baglar = zincirBaglari(izgara, tamGunEsigi);
    // Referans HTML'de olculen: 22 segment, 0 cakisma.
    expect(baglar).toHaveLength(22);

    const cizelge = acilisCizelgesi(izgara, baglar, SABITLER);

    // PINLENMIS deger (Task 1 incelemesi): < 5000 gibi gevsek bir sinir yerine
    // tam deger — regresyon (ornegin bag/kopuk sayisi degisirse) burada hemen
    // gorunur olsun. Hesap: 22 bagli segment × 30 (cizgiOnce) + (13 vurgulu ×
    // 130 + 9 normal × 85) (seg sureleri) + 12 kopuk × 32 = 3499 ms
    // (bkz. task-1-report.md).
    const vurguluBagSayisi = [...cizelge.bagZamani.values()].filter((z) => z.vurgulu).length;
    expect(vurguluBagSayisi).toBe(13);
    expect(cizelge.toplam).toBe(3499);

    // Cakisma yok garantisi burada da gecerli.
    const siraliZamanlar = [...cizelge.bagZamani.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, z]) => z);
    for (let i = 1; i < siraliZamanlar.length; i++) {
      expect(siraliZamanlar[i].gecikme).toBeGreaterThanOrEqual(
        siraliZamanlar[i - 1].gecikme + siraliZamanlar[i - 1].sure,
      );
    }
  });
});
