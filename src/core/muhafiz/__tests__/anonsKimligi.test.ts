/**
 * Anons/bildirim kimligi — CIFT KONUSMA'nin noberci testi.
 *
 * On plan (NamazMuhafiziServisi) ve arka plan (ArkaplanMuhafizServisi) ayni
 * dakikanin anonsunu AYNI id ile planlamak ZORUNDA: native taraf ayni id'yi ayni
 * istek koduna esler ve `FLAG_UPDATE_CURRENT` ile alarmi DEGISTIRIR. Format en
 * ufak sapsa iki ayri alarm kalir → kullanici anonsu iki kez duyar.
 */
import {
  muhafizBildirimIdOlustur,
  muhafizBildirimKokuOlustur,
  muhafizVaktiTarihiniSec,
} from '../anonsKimligi';
import { BILDIRIM_SABITLERI } from '../../constants/UygulamaSabitleri';

describe('muhafizBildirimIdOlustur', () => {
  it('sabit formati uretir: muhafiz_<tarih>_vakit_<vakit>_seviye_<n>_dk_<kalan>', () => {
    expect(muhafizBildirimIdOlustur('ikindi', 3, '2026-07-18', 10)).toBe(
      'muhafiz_2026-07-18_vakit_ikindi_seviye_3_dk_10'
    );
  });

  it('id, iptal yolunun kullandigi vakit onekiyle BASLAR (iptal zinciri kopmaz)', () => {
    const { ONEKLEME } = BILDIRIM_SABITLERI;
    const onek = `${ONEKLEME.MUHAFIZ}2026-07-18${ONEKLEME.VAKIT}yatsi`;
    expect(muhafizBildirimIdOlustur('yatsi', 4, '2026-07-18', 2).startsWith(onek)).toBe(true);
  });

  it('kok + dakika soneki = tam id (iki uretici tutarli)', () => {
    const kok = muhafizBildirimKokuOlustur('ogle', 1, '2026-07-18');
    expect(muhafizBildirimIdOlustur('ogle', 1, '2026-07-18', 45)).toBe(
      `${kok}${BILDIRIM_SABITLERI.ONEKLEME.DAKIKA}45`
    );
  });

  it('farkli dakika/seviye/vakit farkli id verir (alarmlar birbirini ezmez)', () => {
    const idler = new Set([
      muhafizBildirimIdOlustur('ogle', 1, '2026-07-18', 45),
      muhafizBildirimIdOlustur('ogle', 1, '2026-07-18', 25),
      muhafizBildirimIdOlustur('ogle', 2, '2026-07-18', 45),
      muhafizBildirimIdOlustur('ikindi', 1, '2026-07-18', 45),
      muhafizBildirimIdOlustur('ogle', 1, '2026-07-17', 45),
    ]);
    expect(idler.size).toBe(5);
  });
});

describe('muhafizVaktiTarihiniSec', () => {
  const BUGUN = '2026-07-18';
  const DUN = '2026-07-17';

  it('yatsi disindaki vakitler daima bugune aittir', () => {
    const simdi = new Date(2026, 6, 18, 14, 0);
    const cikis = new Date(2026, 6, 18, 17, 0);
    for (const vakit of ['imsak', 'ogle', 'ikindi', 'aksam']) {
      expect(muhafizVaktiTarihiniSec(vakit, simdi, cikis, BUGUN, DUN)).toBe(BUGUN);
    }
  });

  it('aksam saatinde suren yatsi BUGUNe aittir (cikisi ertesi gunun imsagi)', () => {
    const simdi = new Date(2026, 6, 18, 21, 30);
    const cikis = new Date(2026, 6, 19, 4, 15); // yarinin imsagi
    expect(muhafizVaktiTarihiniSec('yatsi', simdi, cikis, BUGUN, DUN)).toBe(BUGUN);
  });

  it('gece yarisindan SONRA suren yatsi DUNe aittir (cikisi bugunun imsagi)', () => {
    const simdi = new Date(2026, 6, 18, 2, 30);
    const cikis = new Date(2026, 6, 18, 4, 15); // bugunun imsagi — ayni takvim gunu
    expect(muhafizVaktiTarihiniSec('yatsi', simdi, cikis, BUGUN, DUN)).toBe(DUN);
  });

  it('ay/yil sinirinda da takvim gunu karsilastirmasi dogru (gun numarasi tek basina yeterli degil)', () => {
    // 31 Aralik 23:50 -> cikis 1 Ocak 06:00: FARKLI gun => bugun
    const simdi = new Date(2026, 11, 31, 23, 50);
    const cikis = new Date(2027, 0, 1, 6, 0);
    expect(muhafizVaktiTarihiniSec('yatsi', simdi, cikis, BUGUN, DUN)).toBe(BUGUN);
  });
});
