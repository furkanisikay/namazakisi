import { seviyeAcikMi, seviyeyiAc, seviyeyiKapat } from '../seviyeAcKapa';
import { ANONS_SABLONLARI, ANONS_SABLONLARI_GIRIS } from '../anonsMetni';
import { VARSAYILAN_SES } from '../matrisTipleri';
import type { SeviyeAyari } from '../matrisTipleri';

/** Kanal kümesi kısayolları (Faz 2: `mod` enum'unun yerini aldı). */
const KAPALI = {};
const BILDIRIM = { bildirim: true };
const SESLI = { sesli: true };
const IKISI = { bildirim: true, sesli: true };

const seviyeKur = (fark: Partial<SeviyeAyari> = {}): SeviyeAyari => ({
  kademe: 'uyari',
  kanallar: BILDIRIM,
  esikDk: 30,
  siklik: 'birkez',
  bildirimSesi: VARSAYILAN_SES,
  acilKanal: false,
  anonsMetni: '',
  ...fark,
});

describe('seviyeAcKapa', () => {
  describe('seviyeAcikMi', () => {
    it('en az bir kanali acik adimi acik sayar', () => {
      expect(seviyeAcikMi(seviyeKur({ kanallar: BILDIRIM }))).toBe(true);
      expect(seviyeAcikMi(seviyeKur({ kanallar: IKISI }))).toBe(true);
    });

    it('hicbir kanali acik olmayan adimi kapali sayar', () => {
      expect(seviyeAcikMi(seviyeKur({ kanallar: KAPALI }))).toBe(false);
    });
  });

  describe('seviyeyiKapat', () => {
    it('tum kanallari kapatir ve eski kumeyi hatirlar', () => {
      const kapali = seviyeyiKapat(seviyeKur({ kanallar: IKISI }));

      expect(kapali.kanallar).toEqual(KAPALI);
      expect(kapali.oncekiKanallar).toEqual(IKISI);
    });

    it('kullanicinin ses/anons/zamanlama secimlerine DOKUNMAZ', () => {
      const seviye = seviyeKur({
        kanallar: SESLI,
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
      const seviye = seviyeKur({ kanallar: KAPALI, oncekiKanallar: BILDIRIM });

      expect(seviyeyiKapat(seviye)).toBe(seviye);
    });
  });

  describe('seviyeyiAc', () => {
    it('hatirlanan kanallara geri doner ve hafizayi temizler', () => {
      const kapali = seviyeyiKapat(seviyeKur({ kanallar: IKISI, anonsMetni: 'Metin' }));

      const acik = seviyeyiAc(kapali);

      expect(acik.kanallar).toEqual(IKISI);
      expect(acik.oncekiKanallar).toBeUndefined();
    });

    it('kapat/ac turu KANALLARI KORUR (ozelligin varlik sebebi)', () => {
      const baslangic = seviyeKur({ kanallar: SESLI, anonsMetni: 'Metin' });

      const sonuc = seviyeyiAc(seviyeyiKapat(baslangic));

      expect(sonuc.kanallar).toEqual(baslangic.kanallar);
    });

    it('hatirlanan kume yoksa bildirime duser', () => {
      const acik = seviyeyiAc(seviyeKur({ kanallar: KAPALI }));

      expect(acik.kanallar).toEqual(BILDIRIM);
    });

    it('sesli kanal geri gelirken bos anons metnini sablonla doldurur', () => {
      const kapali = seviyeyiKapat(seviyeKur({ kanallar: IKISI, anonsMetni: '' }));

      const acik = seviyeyiAc(kapali);

      expect(acik.anonsMetni).toBe(ANONS_SABLONLARI[0]);
    });

    it('giris yonunde bos kutu GIRIS sablonuyla dolar', () => {
      const kapali = seviyeyiKapat(seviyeKur({ kanallar: IKISI, anonsMetni: '' }));

      expect(seviyeyiAc(kapali, 'girisindenItibaren').anonsMetni).toBe(ANONS_SABLONLARI_GIRIS[0]);
    });

    it('kullanicinin yazdigi anons metnini EZMEZ', () => {
      const kapali = seviyeyiKapat(seviyeKur({ kanallar: SESLI, anonsMetni: 'Kendi metnim' }));

      expect(seviyeyiAc(kapali).anonsMetni).toBe('Kendi metnim');
    });

    it('sesli kanal yokken anons metnine dokunmaz', () => {
      const kapali = seviyeyiKapat(seviyeKur({ kanallar: BILDIRIM, anonsMetni: '' }));

      expect(seviyeyiAc(kapali).anonsMetni).toBe('');
    });

    it('zaten acik adimda AYNI REFERANSI dondurur', () => {
      const seviye = seviyeKur({ kanallar: BILDIRIM });

      expect(seviyeyiAc(seviye)).toBe(seviye);
    });

    /**
     * Bozuk/eski kayitta `oncekiKanallar` BOS olabilir. Oldugu gibi geri
     * yuklenirse kullanici switch'i acar ama adim kapali kalir — geri donusu
     * olmayan bir kilit. Bildirime dusmek dogru kurtarma.
     */
    it('hatirlanan kume BOS ise bildirime duser (kilit olusmaz)', () => {
      const bozuk = seviyeKur({ kanallar: KAPALI, oncekiKanallar: {} });

      expect(seviyeyiAc(bozuk).kanallar).toEqual(BILDIRIM);
    });
  });
});
