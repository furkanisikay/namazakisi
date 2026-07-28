import {
  cumaMi,
  sonrakiCumalar,
  hatirlatmaZamaniHesapla,
  sureMetniOlustur,
  namazGorunenAdi,
} from '../cumaYardimcisi';
import { NamazAdi } from '../../constants/UygulamaSabitleri';

/**
 * Cuma hatirlatmasi saf tarih mantigi (issue #173).
 *
 * SABIT TARIH TUZAGI: bu dosya bilerek SABIT tarihler kullanir ama bunlar
 * "testin yazildigi gun" degil, takvimden dogrulanmis GERCEK cuma gunleridir
 * (2026-08-07 bir cumadir) — zamanla bayatlamaz. Yasak olan, "bugun"e gore
 * uydurulmus ve yarin gecersizlesecek sabitlerdir.
 */
describe('cumaYardimcisi', () => {
  describe('cumaMi', () => {
    it('cuma gununu tanir', () => {
      expect(cumaMi(new Date(2026, 7, 7))).toBe(true); // 7 Agustos 2026 = Cuma
    });

    it('cuma disindaki gunleri reddeder', () => {
      expect(cumaMi(new Date(2026, 7, 6))).toBe(false); // Persembe
      expect(cumaMi(new Date(2026, 7, 8))).toBe(false); // Cumartesi
    });

    it('gun sonundaki saatte de cuma sayar (yerel gun, UTC degil)', () => {
      expect(cumaMi(new Date(2026, 7, 7, 23, 59))).toBe(true);
    });
  });

  describe('sonrakiCumalar', () => {
    it('istenen adette ve birer hafta arayla cuma dondurur', () => {
      const cumalar = sonrakiCumalar(new Date(2026, 7, 3), 4); // Pazartesi

      expect(cumalar).toHaveLength(4);
      cumalar.forEach((c) => expect(cumaMi(c)).toBe(true));
      expect(cumalar[0].getDate()).toBe(7);
      expect(cumalar[1].getDate()).toBe(14);
      expect(cumalar[2].getDate()).toBe(21);
      expect(cumalar[3].getDate()).toBe(28);
    });

    it('baslangic gunu cuma ise O GUNU dahil eder', () => {
      // Cuma sabahi uygulama acilinca o gunun hatirlatmasi kacmamali;
      // vaktin gecip gecmedigi kararini cagiran (servis) verir.
      const cumalar = sonrakiCumalar(new Date(2026, 7, 7, 9, 0), 2);

      expect(cumalar[0].getDate()).toBe(7);
      expect(cumalar[1].getDate()).toBe(14);
    });

    it('gun basina normalize eder (saat/dakika sifirlanir)', () => {
      const [ilk] = sonrakiCumalar(new Date(2026, 7, 3, 17, 45, 30), 1);

      expect(ilk.getHours()).toBe(0);
      expect(ilk.getMinutes()).toBe(0);
      expect(ilk.getSeconds()).toBe(0);
    });

    it('ay ve yil sinirini asar', () => {
      const cumalar = sonrakiCumalar(new Date(2026, 11, 28), 2); // 28 Aralik Pazartesi

      expect(cumalar[0].getMonth()).toBe(0); // Ocak
      expect(cumalar[0].getFullYear()).toBe(2027);
      expect(cumalar[0].getDate()).toBe(1);
      expect(cumalar[1].getDate()).toBe(8);
    });

    it('adet sifir veya negatifse bos dizi dondurur', () => {
      expect(sonrakiCumalar(new Date(2026, 7, 3), 0)).toEqual([]);
      expect(sonrakiCumalar(new Date(2026, 7, 3), -3)).toEqual([]);
    });
  });

  describe('hatirlatmaZamaniHesapla', () => {
    it('ogle vaktinden verilen dakika kadar once dondurur', () => {
      const ogle = new Date(2026, 7, 7, 13, 15);

      const hatirlatma = hatirlatmaZamaniHesapla(ogle, 60);

      expect(hatirlatma.getHours()).toBe(12);
      expect(hatirlatma.getMinutes()).toBe(15);
    });

    it('gun sinirini geriye dogru asabilir', () => {
      const ogle = new Date(2026, 7, 7, 0, 30);

      const hatirlatma = hatirlatmaZamaniHesapla(ogle, 60);

      expect(hatirlatma.getDate()).toBe(6);
      expect(hatirlatma.getHours()).toBe(23);
    });

    it('kaynak tarihi DEGISTIRMEZ (yan etkisiz)', () => {
      const ogle = new Date(2026, 7, 7, 13, 15);

      hatirlatmaZamaniHesapla(ogle, 90);

      expect(ogle.getHours()).toBe(13);
      expect(ogle.getMinutes()).toBe(15);
    });
  });

  describe('namazGorunenAdi', () => {
    const CUMA = new Date(2026, 7, 7);
    const PERSEMBE = new Date(2026, 7, 6);

    it('cuma gunu ogle namazini "Cuma" olarak gosterir', () => {
      expect(namazGorunenAdi(NamazAdi.Ogle, CUMA, true)).toBe('Cuma');
    });

    it('ozellik kapaliyken etiketi DEGISTIRMEZ', () => {
      // Cuma herkese farz-i ayn degil; etiket kullanicinin secimine baglidir.
      expect(namazGorunenAdi(NamazAdi.Ogle, CUMA, false)).toBe(NamazAdi.Ogle);
    });

    it('cuma disindaki gunlerde ogle "Öğle" kalir', () => {
      expect(namazGorunenAdi(NamazAdi.Ogle, PERSEMBE, true)).toBe(NamazAdi.Ogle);
    });

    it('diger vakitlerin adina cuma gunu de DOKUNMAZ', () => {
      expect(namazGorunenAdi(NamazAdi.Ikindi, CUMA, true)).toBe(NamazAdi.Ikindi);
      expect(namazGorunenAdi(NamazAdi.Sabah, CUMA, true)).toBe(NamazAdi.Sabah);
      expect(namazGorunenAdi(NamazAdi.Yatsi, CUMA, true)).toBe(NamazAdi.Yatsi);
    });
  });

  describe('sureMetniOlustur', () => {
    it('tam saatleri saat olarak yazar', () => {
      expect(sureMetniOlustur(60)).toBe('1 saat');
      expect(sureMetniOlustur(120)).toBe('2 saat');
    });

    it('bir saatten kisa sureleri dakika olarak yazar', () => {
      expect(sureMetniOlustur(45)).toBe('45 dakika');
      expect(sureMetniOlustur(15)).toBe('15 dakika');
    });

    it('karisik sureleri saat ve dakika olarak yazar', () => {
      expect(sureMetniOlustur(90)).toBe('1 saat 30 dakika');
      expect(sureMetniOlustur(150)).toBe('2 saat 30 dakika');
    });
  });
});
