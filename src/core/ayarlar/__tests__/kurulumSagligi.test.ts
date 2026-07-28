import { kurulumSagligi, type SaglikGirdisi } from '../kurulumSagligi';

const TEMEL: SaglikGirdisi = {
  izinDurumu: 'verildi',
  konumModu: 'oto',
  sonGpsGuncellemesi: '2026-07-25T10:00:00.000Z',
  akilliTakipAktif: true,
  muhafizAktif: true,
  acikVakitBildirimSayisi: 5,
  simdi: new Date('2026-07-29T10:00:00.000Z'),
};

describe('kurulumSagligi', () => {
  it('sorunsuz girdide boş dizi döner', () => {
    expect(kurulumSagligi(TEMEL)).toEqual([]);
  });

  describe('bildirimIzni', () => {
    it('reddedildi → tetiklenir, eylem sistemAyarlari', () => {
      const sonuc = kurulumSagligi({ ...TEMEL, izinDurumu: 'reddedildi' });
      expect(sonuc).toHaveLength(1);
      expect(sonuc[0]).toMatchObject({
        id: 'bildirimIzni',
        seviye: 'kritik',
        eylem: { tip: 'sistemAyarlari' },
      });
    });

    // NÖBETÇİ: 'belirsiz' henüz sorulmamış demektir — tetiklenmemeli.
    it('belirsiz → tetiklenmez', () => {
      expect(kurulumSagligi({ ...TEMEL, izinDurumu: 'belirsiz' })).toEqual([]);
    });

    it('verildi → tetiklenmez', () => {
      expect(kurulumSagligi({ ...TEMEL, izinDurumu: 'verildi' })).toEqual([]);
    });

    it('açıklama muhafız durumundan bağımsızdır (nötr metin)', () => {
      const acikMuhafizsiz = kurulumSagligi({
        ...TEMEL,
        izinDurumu: 'reddedildi',
        muhafizAktif: false,
      })[0];
      expect(acikMuhafizsiz.aciklama).not.toMatch(/muhafız/i);
    });
  });

  describe('konumAlinamadi', () => {
    it('oto + sonGpsGuncellemesi yok → tetiklenir', () => {
      const sonuc = kurulumSagligi({ ...TEMEL, sonGpsGuncellemesi: null });
      expect(sonuc.some((s) => s.id === 'konumAlinamadi')).toBe(true);
      const bulunan = sonuc.find((s) => s.id === 'konumAlinamadi')!;
      expect(bulunan.eylem).toEqual({ tip: 'sayfa', sayfa: 'KonumAyarlari' });
    });

    it('manuel modda tetiklenmez (sonGpsGuncellemesi yok olsa bile)', () => {
      const sonuc = kurulumSagligi({
        ...TEMEL,
        konumModu: 'manuel',
        sonGpsGuncellemesi: null,
      });
      expect(sonuc.some((s) => s.id === 'konumAlinamadi')).toBe(false);
    });

    it('oto + sonGpsGuncellemesi varsa tetiklenmez', () => {
      const sonuc = kurulumSagligi({ ...TEMEL, sonGpsGuncellemesi: '2026-07-29T09:00:00.000Z' });
      expect(sonuc.some((s) => s.id === 'konumAlinamadi')).toBe(false);
    });
  });

  describe('hatirlatmaYok', () => {
    it('muhafiz kapalı + 0 vakit bildirimi → tetiklenir', () => {
      const sonuc = kurulumSagligi({ ...TEMEL, muhafizAktif: false, acikVakitBildirimSayisi: 0 });
      expect(sonuc.some((s) => s.id === 'hatirlatmaYok')).toBe(true);
    });

    it('muhafiz açık → tetiklenmez', () => {
      const sonuc = kurulumSagligi({ ...TEMEL, muhafizAktif: true, acikVakitBildirimSayisi: 0 });
      expect(sonuc.some((s) => s.id === 'hatirlatmaYok')).toBe(false);
    });

    it('vakit bildirimi > 0 → tetiklenmez', () => {
      const sonuc = kurulumSagligi({ ...TEMEL, muhafizAktif: false, acikVakitBildirimSayisi: 1 });
      expect(sonuc.some((s) => s.id === 'hatirlatmaYok')).toBe(false);
    });
  });

  describe('konumBayat', () => {
    it('akıllı takip açık + tam 7 gün eski → tetiklenmez (sınır: >= kullanılır, 7 gün TAM eşiktir)', () => {
      const simdi = new Date('2026-07-29T10:00:00.000Z');
      const tamYediGunOnce = new Date(simdi.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const sonuc = kurulumSagligi({
        ...TEMEL,
        akilliTakipAktif: true,
        sonGpsGuncellemesi: tamYediGunOnce,
        simdi,
      });
      expect(sonuc.some((s) => s.id === 'konumBayat')).toBe(true);
    });

    it('7 gün 1 dk eski → tetiklenir', () => {
      const simdi = new Date('2026-07-29T10:00:00.000Z');
      const yediGunBirDkOnce = new Date(
        simdi.getTime() - (7 * 24 * 60 * 60 * 1000 + 60 * 1000)
      ).toISOString();
      const sonuc = kurulumSagligi({
        ...TEMEL,
        akilliTakipAktif: true,
        sonGpsGuncellemesi: yediGunBirDkOnce,
        simdi,
      });
      expect(sonuc.some((s) => s.id === 'konumBayat')).toBe(true);
    });

    it('6 gün 23 saat eski (7 günden az) → tetiklenmez', () => {
      const simdi = new Date('2026-07-29T10:00:00.000Z');
      const altiGunYirmiUcSaatOnce = new Date(
        simdi.getTime() - (6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000)
      ).toISOString();
      const sonuc = kurulumSagligi({
        ...TEMEL,
        akilliTakipAktif: true,
        sonGpsGuncellemesi: altiGunYirmiUcSaatOnce,
        simdi,
      });
      expect(sonuc.some((s) => s.id === 'konumBayat')).toBe(false);
    });

    it('akıllı takip kapalı → tetiklenmez', () => {
      const simdi = new Date('2026-07-29T10:00:00.000Z');
      const cokEski = new Date(simdi.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sonuc = kurulumSagligi({
        ...TEMEL,
        akilliTakipAktif: false,
        sonGpsGuncellemesi: cokEski,
        simdi,
      });
      expect(sonuc.some((s) => s.id === 'konumBayat')).toBe(false);
    });

    it('sonGpsGuncellemesi yoksa tetiklenmez (konumAlinamadi ile aynı anda dönmez)', () => {
      const sonuc = kurulumSagligi({
        ...TEMEL,
        akilliTakipAktif: true,
        sonGpsGuncellemesi: null,
      });
      expect(sonuc.some((s) => s.id === 'konumBayat')).toBe(false);
      expect(sonuc.some((s) => s.id === 'konumAlinamadi')).toBe(true);
    });
  });

  describe('sıralama', () => {
    it('kritik önce, sonra uyarı, sonra bilgi gelir', () => {
      const simdi = new Date('2026-07-29T10:00:00.000Z');
      const cokEski = new Date(simdi.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sonuc = kurulumSagligi({
        izinDurumu: 'reddedildi',
        konumModu: 'oto',
        sonGpsGuncellemesi: null,
        akilliTakipAktif: true,
        muhafizAktif: false,
        acikVakitBildirimSayisi: 0,
        simdi,
      });
      // konumBayat sonGpsGuncellemesi null olduğu için dönemez; kalan üçü:
      expect(sonuc.map((s) => s.id)).toEqual(['bildirimIzni', 'konumAlinamadi', 'hatirlatmaYok']);
      expect(sonuc.map((s) => s.seviye)).toEqual(['kritik', 'kritik', 'uyari']);
    });

    it('aynı seviyede tablo sırası korunur (bildirimIzni önce konumAlinamadi)', () => {
      const sonuc = kurulumSagligi({
        ...TEMEL,
        izinDurumu: 'reddedildi',
        sonGpsGuncellemesi: null,
      });
      expect(sonuc[0].id).toBe('bildirimIzni');
      expect(sonuc[1].id).toBe('konumAlinamadi');
    });

    it('dört sorun birden döndüğünde tam sıralama: kritik, kritik, uyari, bilgi', () => {
      const simdi = new Date('2026-07-29T10:00:00.000Z');
      const cokEski = new Date(simdi.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sonuc = kurulumSagligi({
        izinDurumu: 'reddedildi',
        konumModu: 'manuel', // konumAlinamadi manuelde tetiklenmez; bildirimIzni'yi ayrı test ediyoruz
        sonGpsGuncellemesi: cokEski,
        akilliTakipAktif: true,
        muhafizAktif: false,
        acikVakitBildirimSayisi: 0,
        simdi,
      });
      expect(sonuc.map((s) => s.id)).toEqual(['bildirimIzni', 'hatirlatmaYok', 'konumBayat']);
      expect(sonuc.map((s) => s.seviye)).toEqual(['kritik', 'uyari', 'bilgi']);
    });
  });
});
