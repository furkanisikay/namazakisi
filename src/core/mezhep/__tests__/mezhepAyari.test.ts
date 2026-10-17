/**
 * Ortak mezhep ayarı (Kaza Defteri 2.0) — normalize, göç kararı ve NÖBETÇİ:
 * mezhep NAMAZ VAKTİ HESABINA DOKUNMAZ (ikindi daima asr-ı evvel).
 */
import * as fs from 'fs';
import * as path from 'path';
import { Madhab } from 'adhan';
import {
  MEZHEP_ADLARI,
  mezhepGocKarari,
  mezhepNormalize,
  vitirOtomatikEklenirMi,
} from '../mezhepAyari';
import { turkiyeHesapParametreleri } from '../../vakit/hesapParametreleri';

describe('mezhepNormalize', () => {
  it('tanınan değerler ve { mezhep } biçimi', () => {
    expect(mezhepNormalize('safii')).toBe('safii');
    expect(mezhepNormalize({ mezhep: 'safii' })).toBe('safii');
    expect(mezhepNormalize('hanefi')).toBe('hanefi');
  });

  it('tanınmayan her şey varsayılan Hanefî', () => {
    for (const ham of [null, undefined, 'maliki', 42, [], { mezhep: 'x' }]) expect(mezhepNormalize(ham)).toBe('hanefi');
  });

  it('görünen adlar sabit haritadan', () => {
    expect(MEZHEP_ADLARI).toEqual({ hanefi: 'Hanefî', safii: 'Şâfiî' });
  });
});

describe('mezhepGocKarari', () => {
  it('ortak ayar yoksa seferîlik kaydındaki mezhep BİR KEZ taşınır', () => {
    expect(mezhepGocKarari(null, { mezhep: 'safii', kartAcik: true })).toEqual({ mezhep: 'safii', yazilmali: true });
  });

  it('ne ortak ne seferîlik mezhebi varsa VARSAYILAN döner ama KALICI YAZILMAZ', () => {
    // Yazılsaydı sonradan içe aktarılan eski yedekteki seferîlik mezhebi (ör. Şâfiî)
    // ortak ayara hiç ulaşamaz, vitir her gün borca eklenirdi.
    expect(mezhepGocKarari(undefined, null)).toEqual({ mezhep: 'hanefi', yazilmali: false });
    expect(mezhepGocKarari(null, { kartAcik: true })).toEqual({ mezhep: 'hanefi', yazilmali: false });
    expect(mezhepGocKarari(null, { mezhep: 'maliki' })).toEqual({ mezhep: 'hanefi', yazilmali: false });
  });

  it('ortak ayar varsa O kazanır, yazım gerekmez', () => {
    expect(mezhepGocKarari({ mezhep: 'hanefi' }, { mezhep: 'safii' })).toEqual({ mezhep: 'hanefi', yazilmali: false });
  });
});

describe('vitir', () => {
  it('yalnız Hanefî mezhebinde (vacip) otomatik eklenir', () => {
    expect(vitirOtomatikEklenirMi('hanefi')).toBe(true);
    expect(vitirOtomatikEklenirMi('safii')).toBe(false);
  });
});

describe('NÖBETÇİ: mezhep namaz vakti hesabına DOKUNMAZ', () => {
  it('hesap parametresi asr-ı evvel (Şâfiî gölge 1×) kalır', () => {
    expect(turkiyeHesapParametreleri().madhab).toBe(Madhab.Shafi);
  });

  it('vakit hesaplayan modüller ortak mezhep ayarını import ETMEZ', () => {
    const kok = path.resolve(__dirname, '../../..');
    const dosyalar = [
      'core/vakit/hesapParametreleri.ts',
      'domain/services/NamazVaktiHesaplayiciServisi.ts',
    ];
    for (const dosya of dosyalar) {
      const icerik = fs.readFileSync(path.join(kok, dosya), 'utf8');
      expect(icerik).not.toMatch(/mezhep|LocalMezhepServisi/);
      expect(icerik).not.toMatch(/Madhab\.Hanafi\b(?![^\n]*KULLANILMAZ)/);
    }
  });
});
