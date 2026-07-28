import { seviyeAcikMi, seviyeyiAc, seviyeyiKapat } from '../seviyeAcKapa';
import { ANONS_SABLONLARI } from '../anonsMetni';
import { VARSAYILAN_SES } from '../matrisTipleri';
import type { SeviyeAyari } from '../matrisTipleri';

const seviyeKur = (fark: Partial<SeviyeAyari> = {}): SeviyeAyari => ({
  kademe: 'uyari',
  mod: 'bildirim',
  esikDk: 30,
  siklik: 'birkez',
  bildirimSesi: VARSAYILAN_SES,
  acilKanal: false,
  anonsMetni: '',
  ...fark,
});

describe('seviyeAcKapa', () => {
  describe('seviyeAcikMi', () => {
    it('sessiz olmayan adimi acik sayar', () => {
      expect(seviyeAcikMi(seviyeKur({ mod: 'bildirim' }))).toBe(true);
      expect(seviyeAcikMi(seviyeKur({ mod: 'ikisi' }))).toBe(true);
    });

    it('sessiz adimi kapali sayar', () => {
      expect(seviyeAcikMi(seviyeKur({ mod: 'sessiz' }))).toBe(false);
    });
  });

  describe('seviyeyiKapat', () => {
    it('modu sessize alir ve eski modu hatirlar', () => {
      const kapali = seviyeyiKapat(seviyeKur({ mod: 'ikisi' }));

      expect(kapali.mod).toBe('sessiz');
      expect(kapali.oncekiMod).toBe('ikisi');
    });

    it('kullanicinin ses/anons/zamanlama secimlerine DOKUNMAZ', () => {
      const seviye = seviyeKur({
        mod: 'sesli',
        bildirimSesi: 'content://media/1',
        sesAdi: 'Sabah Ezanı',
        anonsMetni: 'Öğle vaktin çıkmak üzere',
        esikDk: 45,
        siklik: { herDk: 5 },
        acilKanal: true,
      });

      const kapali = seviyeyiKapat(seviye);

      expect(kapali.bildirimSesi).toBe('content://media/1');
      expect(kapali.sesAdi).toBe('Sabah Ezanı');
      expect(kapali.anonsMetni).toBe('Öğle vaktin çıkmak üzere');
      expect(kapali.esikDk).toBe(45);
      expect(kapali.siklik).toEqual({ herDk: 5 });
      expect(kapali.acilKanal).toBe(true);
    });

    it('zaten kapali adimda AYNI REFERANSI dondurur (gereksiz disk yazimi yok)', () => {
      const seviye = seviyeKur({ mod: 'sessiz', oncekiMod: 'bildirim' });

      expect(seviyeyiKapat(seviye)).toBe(seviye);
    });
  });

  describe('seviyeyiAc', () => {
    it('hatirlanan moda geri doner ve hafizayi temizler', () => {
      const kapali = seviyeyiKapat(seviyeKur({ mod: 'ikisi', anonsMetni: 'Metin' }));

      const acik = seviyeyiAc(kapali);

      expect(acik.mod).toBe('ikisi');
      expect(acik.oncekiMod).toBeUndefined();
    });

    it('kapat/ac turu modu KORUR (ozelligin varlik sebebi)', () => {
      const baslangic = seviyeKur({ mod: 'sesli', anonsMetni: 'Metin' });

      const sonuc = seviyeyiAc(seviyeyiKapat(baslangic));

      expect(sonuc.mod).toBe(baslangic.mod);
    });

    it('hatirlanan mod yoksa bildirime duser', () => {
      const acik = seviyeyiAc(seviyeKur({ mod: 'sessiz' }));

      expect(acik.mod).toBe('bildirim');
    });

    it('sesli mod geri gelirken bos anons metnini sablonla doldurur', () => {
      const kapali = seviyeyiKapat(seviyeKur({ mod: 'ikisi', anonsMetni: '' }));

      const acik = seviyeyiAc(kapali);

      expect(acik.anonsMetni).toBe(ANONS_SABLONLARI[0]);
    });

    it('kullanicinin yazdigi anons metnini EZMEZ', () => {
      const kapali = seviyeyiKapat(seviyeKur({ mod: 'sesli', anonsMetni: 'Kendi metnim' }));

      expect(seviyeyiAc(kapali).anonsMetni).toBe('Kendi metnim');
    });

    it('sessiz olmayan moda gecerken anons metnine dokunmaz', () => {
      const kapali = seviyeyiKapat(seviyeKur({ mod: 'bildirim', anonsMetni: '' }));

      expect(seviyeyiAc(kapali).anonsMetni).toBe('');
    });

    it('zaten acik adimda AYNI REFERANSI dondurur', () => {
      const seviye = seviyeKur({ mod: 'bildirim' });

      expect(seviyeyiAc(seviye)).toBe(seviye);
    });

    /**
     * Bozuk/eski kayitta `oncekiMod` 'sessiz' olabilir. Oldugu gibi geri
     * yuklenirse kullanici switch'i acar ama adim sessiz kalir — geri donusu
     * olmayan bir kilit. Bildirime dusmek dogru kurtarma.
     */
    it('hatirlanan mod sessiz ise bildirime duser (kilit olusmaz)', () => {
      // Tip bunu yasaklar; disk verisi tipe uymak zorunda degil → bilerek zorlanir.
      const bozuk = {
        ...seviyeKur({ mod: 'sessiz' }),
        oncekiMod: 'sessiz',
      } as unknown as SeviyeAyari;

      expect(seviyeyiAc(bozuk).mod).toBe('bildirim');
    });
  });
});
