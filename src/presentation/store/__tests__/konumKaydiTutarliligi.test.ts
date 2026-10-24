/** Türkiye ili ↔ dünya şehri ↔ GPS tek kayıtta tutarlı (bölge takvimi önerisi bunlara bakar). */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { konumKaydiTutarliHale } from '../konumSlice';
import { kayitliUlkeKodu } from '../../../core/konum/ulkeTespiti';
import { localKonumAyarlariniGetir } from '../../../data/local/LocalKonumServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const KL = { ad: 'Kuala Lumpur', ulke: 'MY', bolge: 'Kuala Lumpur', saatDilimi: 'Asia/Kuala_Lumpur' };

describe('konumKaydiTutarliHale', () => {
  it('dünya şehri seçmek il/ilçe kimliğini siler', () => {
    const k = konumKaydiTutarliHale({ konumModu: 'manuel', seciliIlId: 34, seciliIlceId: 5 }, { dunyaSehri: KL, ulkeKodu: 'MY' });
    expect(k).toMatchObject({ seciliIlId: null, seciliIlceId: null, dunyaSehri: KL });
    expect(kayitliUlkeKodu(k)).toBe('MY');
  });

  it('dünya şehrinden sonra Türkiye ili seçmek dünya şehrini siler', () => {
    const k = konumKaydiTutarliHale({ konumModu: 'manuel', seciliIlId: null, dunyaSehri: KL, ulkeKodu: 'MY' }, { seciliIlId: 6, ulkeKodu: 'TR' });
    expect(k.dunyaSehri).toBeNull();
    expect(kayitliUlkeKodu(k)).toBe('TR');
  });

  it('GPS: dünya şehri tutulmaz; ülkesiz yeni koordinat eski ülkeyi siler', () => {
    const once = { konumModu: 'manuel' as const, seciliIlId: null, dunyaSehri: KL, ulkeKodu: 'MY' };
    const k = konumKaydiTutarliHale(once, { konumModu: 'oto', koordinatlar: { lat: 52.5, lng: 13.4 } });
    expect(k.dunyaSehri).toBeNull();
    expect('ulkeKodu' in k).toBe(false);
    expect(kayitliUlkeKodu(k)).toBeNull();
  });

  it('GPS modunda kalan eski dünya şehri ülke olarak OKUNMAZ', () => {
    expect(kayitliUlkeKodu({ konumModu: 'oto', dunyaSehri: KL })).toBeNull();
  });
});

describe('dünya şehri kaydı yeniden açılışta korunur', () => {
  it('Kuala Lumpur kaydı göçten geçip koordinatıyla gelir (İstanbul\'a düşmez)', async () => {
    await AsyncStorage.clear();
    const kayit = {
      konumModu: 'manuel', seciliSehirId: '', seciliIlId: null, seciliIlceId: null, seciliIlAdi: 'Kuala Lumpur',
      seciliIlceAdi: '', gpsAdres: null, koordinatlar: { lat: 3.141, lng: 101.687 }, sonGpsGuncellemesi: null,
      akilliTakipAktif: false, takipHassasiyeti: 'dengeli', ulkeKodu: 'MY', dunyaSehri: KL,
    };
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI, JSON.stringify(kayit));
    const yanit = await localKonumAyarlariniGetir();
    expect(yanit.veri).toMatchObject({ koordinatlar: { lat: 3.141, lng: 101.687 }, dunyaSehri: KL, seciliIlAdi: 'Kuala Lumpur' });
    expect(kayitliUlkeKodu(yanit.veri!)).toBe('MY');
  });
});
