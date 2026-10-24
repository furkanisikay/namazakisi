import * as fs from 'fs';
import * as path from 'path';
import { aramaAnahtari, dunyaVerisiniCoz, enYakinSehir, sehirAra } from '../dunyaSehirleri';
import { koordinatinUlkesi } from '../ulkeTespiti';
import { ulkeAdi } from '../ulkeAdlari';
import { ulkeVarsayilani } from '../../vakit/ulkeProfilleri';

const veri = dunyaVerisiniCoz(fs.readFileSync(path.join(__dirname, '../../../../assets/konum/dunya.bin'), 'utf8'));

describe('dünya şehirleri verisi (GeoNames)', () => {
  it('çözülür; Türkiye bu veride YOK (il/ilçe seçici OSM tablosunu kullanır)', () => {
    expect(veri.sehirler.length).toBeGreaterThan(30000);
    expect(veri.ulkeler).not.toContain('TR');
    expect(veri.ulkeler.length).toBeGreaterThan(230);
  });

  it('her ülkenin en az bir şehri var; Müslüman nüfusu yoğun her ülke kapsanır', () => {
    for (const kod of ['SA', 'MY', 'ID', 'PK', 'BD', 'EG', 'NG', 'DE', 'GB', 'US', 'BA', 'XK', 'UZ', 'IR', 'MA']) {
      expect(sehirAra(veri, '', { ulke: kod, limit: 1 })).toHaveLength(1);
    }
  });

  it('boyut bütçesi: varlık 2 MB altında', () => {
    expect(fs.statSync(path.join(__dirname, '../../../../assets/konum/dunya.bin')).size).toBeLessThan(2 * 1024 * 1024);
  });

  it('arama aksan/harf duyarsız; önce baştan eşleşenler, nüfusa göre', () => {
    expect(aramaAnahtari('Şanlıurfa  Ödemiş')).toBe('sanliurfa odemis');
    expect(aramaAnahtari('Sulţānah')).toBe('sultanah');
    const kuala = sehirAra(veri, 'kuala');
    expect(kuala[0].ad).toBe('Kuala Lumpur');
    expect(kuala[0].saatDilimi).toBe('Asia/Kuala_Lumpur');
    expect(sehirAra(veri, 'makk')[0]).toMatchObject({ ad: 'Makkah', ulke: 'SA' });
    expect(sehirAra(veri, 'lumpur')[0].ad).toBe('Kuala Lumpur');
    expect(sehirAra(veri, 'berlin', { ulke: 'DE' })[0].ad).toBe('Berlin');
  });

  it('en yakın şehir ve ülke tespiti; Türkiye ilçe merkezlerinden', () => {
    expect(enYakinSehir(veri, 3.15, 101.69)?.ad).toBe('Kuala Lumpur');
    expect(koordinatinUlkesi(41.0082, 28.9784, veri)).toBe('TR');
    expect(koordinatinUlkesi(41.6771, 26.5557, veri)).toBe('TR'); // Edirne
    expect(koordinatinUlkesi(52.52, 13.405, veri)).toBe('DE');
    expect(koordinatinUlkesi(21.4225, 39.8262, veri)).toBe('SA');
    expect(koordinatinUlkesi(0, 0, veri)).toBeNull();
    expect(koordinatinUlkesi(39.93, 32.85, null)).toBe('TR');
  });

  it('veride olan her ülkenin Türkçe ve İngilizce adı var', () => {
    for (const kod of veri.ulkeler) {
      expect(ulkeAdi(kod, 'tr')).not.toBe(kod);
      expect(ulkeAdi(kod, 'en')).not.toBe(kod);
    }
    expect(ulkeAdi('MY')).toBe('Malezya');
    expect(ulkeVarsayilani('MY').profil).toBe('jakim');
  });

  it('bozuk satırlar atlanır, fırlatmaz', () => {
    const v = dunyaVerisiniCoz('#S Europe/Berlin\n#B DE.16\tBerlin\nBerlin\t\t52.5\t13.4\tDE\t16\t0\t3426\nbozuk\nX\t\tabc\t1\tDE\t\t0\t1\n');
    expect(v.sehirler).toHaveLength(1);
    expect(v.sehirler[0]).toMatchObject({ bolge: 'Berlin', saatDilimi: 'Europe/Berlin' });
  });
});
