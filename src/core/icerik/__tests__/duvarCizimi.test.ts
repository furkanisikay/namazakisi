/**
 * Duvar kâğıdı çizim ayrıntıları: yazı saat alanına girmez (sözleşme bantları), sürüklemede
 * varsayılana oturma, hiza, fotoğraf kırpması, hazır görünümler, palet okunurluğu ve
 * düzenleyici metinlerinin her dilde dolu olduğu.
 */
import { DILLER } from '../../dil/diller';
import { sozluk } from '../../dil/aktifDil';
import { kontrastOrani } from '../../utils/kontrastOrani';
import { IZINLI_BANTLAR, VARSAYILAN_MERKEZ, fotoAyariNormalize, type DuvarEkrani, type DuvarPlatformu } from '../duvarTasarimi';
import { VARSAYILAN_DUVAR_AYARI } from '../gununAyetiYuku';
import {
  DUVAR_HAZIRLARI,
  duvarRenkleri,
  duvarYazisiYeri,
  fotoDosyaAdi,
  fotoKaydir,
  fotoYerlesimi,
  hazirUygula,
  hizaSec,
  okunurPaletZemini,
  surukleMerkezi,
  yasakBolgeler,
} from '../duvarCizimi';

const EKRANLAR: [DuvarPlatformu, DuvarEkrani][] = [
  ['android', 'kilit'],
  ['android', 'ana'],
  ['ios', 'kilit'],
  ['ios', 'ana'],
];

const bantIcinde = (ust: number, alt: number, p: DuvarPlatformu, e: DuvarEkrani) =>
  IZINLI_BANTLAR[p][e].some(([a, b]) => ust >= a - 1e-9 && alt <= b + 1e-9);

describe('duvarYazisiYeri / surukleMerkezi', () => {
  it.each(EKRANLAR)('%s %s: hangi merkez istenirse istensin blok izinli bandın içinde kalır', (p, e) => {
    for (const blok of [0.05, 0.12, 0.18]) {
      for (let istenen = 0; istenen <= 1; istenen += 0.01) {
        const yer = duvarYazisiYeri(istenen, blok, p, e);
        expect(yer.kucultme).toBe(1);
        expect(bantIcinde(yer.ust, yer.ust + blok, p, e)).toBe(true);
      }
    }
  });

  it('Android kilit ekranında saat alanına (%26–%64) sürüklenen yazı en yakın banda kıstırılır', () => {
    const ust = surukleMerkezi(0.4, 0.1, 'android', 'kilit').merkez;
    expect(ust).toBeCloseTo(0.21, 5); // üst bant [0.08, 0.26]: blok 0.16–0.26
    const alt = surukleMerkezi(0.5, 0.1, 'android', 'kilit').merkez;
    expect(alt).toBeCloseTo(0.69, 5); // alt bant [0.64, 0.84]: blok 0.64–0.74
  });

  it('hiçbir banda sığmayan blok en geniş banda oturur ve küçülür', () => {
    const yer = duvarYazisiYeri(0.5, 0.4, 'android', 'kilit');
    expect(yer.ust).toBeCloseTo(0.64, 5);
    expect(yer.kucultme).toBeCloseTo(0.5, 5);
    expect(bantIcinde(yer.ust, yer.ust + 0.4 * yer.kucultme, 'android', 'kilit')).toBe(true);
  });

  it('varsayılan merkeze yakın sürükleme oraya oturur', () => {
    const v = VARSAYILAN_MERKEZ.android.kilit;
    expect(surukleMerkezi(v + 0.01, 0.1, 'android', 'kilit')).toEqual({ merkez: v, oturdu: true });
    expect(surukleMerkezi(v + 0.05, 0.1, 'android', 'kilit').oturdu).toBe(false);
  });

  it('yasak bölgeler bantların tümleyenidir', () => {
    expect(yasakBolgeler('android', 'kilit')).toEqual([
      [0, 0.08],
      [0.26, 0.64],
      [0.84, 1],
    ]);
    expect(yasakBolgeler('ios', 'kilit')).toEqual([
      [0, 0.34],
      [0.85, 1],
    ]);
  });
});

describe('hizaSec', () => {
  it('ortadan az kayma ortalar; sola kayma soldan sağa yazıda baş, sağdan solada son', () => {
    expect(hizaSec(0.05, false)).toBe('orta');
    expect(hizaSec(-0.2, false)).toBe('bas');
    expect(hizaSec(0.2, false)).toBe('son');
    expect(hizaSec(-0.2, true)).toBe('son');
    expect(hizaSec(0.2, true)).toBe('bas');
  });
});

describe('fotoğraf kırpması', () => {
  it('fotoğraf ekranı kaplar, kenarı ekranın içine girmez', () => {
    const y = fotoYerlesimi(100, 200, 400, 300, { x: 0, y: 0.5, yakinlik: 1 });
    expect(y.yukseklik).toBeCloseTo(200);
    expect(y.genislik).toBeCloseTo(266.67, 1);
    expect(y.sol).toBe(0); // x=0 istense de sol kenar ekranın soluna kıstırılır
    expect(y.ust).toBe(0);
  });

  it('sürükleme kırpma merkezini taşır ve sınırda durur', () => {
    const foto = { x: 0.5, y: 0.5, yakinlik: 1 };
    const sola = fotoKaydir(100, 200, 400, 300, foto, 1000, 0);
    expect(sola.x).toBeCloseTo(100 / (2 * 266.667), 3);
    const saga = fotoKaydir(100, 200, 400, 300, foto, -1000, 0);
    expect(saga.x).toBeCloseTo(1 - 100 / (2 * 266.667), 3);
    expect(sola.y).toBeCloseTo(0.5); // dikeyde boşluk yok
  });

  it('kopya adı normalize kuralına uyar', () => {
    for (const ozet of ['a1b2c3d4e5f6a7b8', 'abc', 'ABCDEF12-3456']) {
      const ad = fotoDosyaAdi(ozet);
      expect(fotoAyariNormalize({ dosya: ad }).dosya).toBe(ad);
    }
  });
});

describe('hazır görünümler', () => {
  it('yalnız zemin, yazı tipi ve süs değişir; yer ve Arapça korunur', () => {
    const ayar = { ...VARSAYILAN_DUVAR_AYARI, acik: true, yer: 'ikisi' as const, arapca: true };
    expect(hazirUygula(ayar, 'sade')).toMatchObject({ zemin: 'kagit', yazi: { tip: 'sade' }, sus: { tur: 'yok' }, yer: 'ikisi', arapca: true, acik: true });
    expect(hazirUygula(ayar, 'mihrap')).toMatchObject({ zemin: 'ikindi', yazi: { tip: 'klasik' }, sus: { tur: 'mihrap' } });
    expect(hazirUygula(ayar, 'gece')).toMatchObject({ zemin: 'yatsi', sus: { tur: 'girih' } });
    // Fotoğraf seçilmemişse zemin değişmez (seçimi düzenleyici yapar).
    expect(hazirUygula(ayar, 'foto')).toBe(ayar);
    const fotolu = { ...ayar, foto: { ...ayar.foto, dosya: 'duvar-foto-12345678.jpg' } };
    expect(hazirUygula(fotolu, 'foto').zemin).toBe('foto');
    expect(DUVAR_HAZIRLARI).toEqual(['sade', 'mihrap', 'gece', 'foto']);
  });
});

describe('duvarRenkleri', () => {
  it('orta tonlu palet metin 4,5:1 tutana kadar koyulaşır; uygulamanın yeşili değişmez', () => {
    expect(okunurPaletZemini('#2E7D32')).toBe('#2E7D32');
    const gri = okunurPaletZemini('#808080');
    const r = duvarRenkleri({ zemin: 'palet', paletRenk: '#808080', foto: VARSAYILAN_DUVAR_AYARI.foto });
    expect(r.zemin).toBe(gri);
    expect(kontrastOrani(r.metin, gri)).toBeGreaterThanOrEqual(4.5);
    expect(kontrastOrani(r.kunye, gri)).toBeGreaterThanOrEqual(4.5);
  });

  it('gökte yazı rengi sahnenin rengidir; fotoğrafta okunurluk açıkken karar sözleşmeden gelir', () => {
    expect(duvarRenkleri({ zemin: 'kusluk', paletRenk: '#000000', foto: VARSAYILAN_DUVAR_AYARI.foto }).metin).toBe('#1F2A22');
    const foto = duvarRenkleri({ zemin: 'foto', paletRenk: '#000000', foto: { ...VARSAYILAN_DUVAR_AYARI.foto, karartma: 0, okunurluk: true } });
    expect(foto.metin).toBe('#FFFFFF');
  });
});

describe('düzenleyici metinleri', () => {
  it('her dilde dolu (boş dize yok)', () => {
    for (const { kod } of DILLER) {
      const d = sozluk(kod).gununAyeti.duvar;
      const dizeler: string[] = [];
      const topla = (v: unknown) => {
        if (typeof v === 'string') dizeler.push(v);
        else if (v && typeof v === 'object') Object.values(v).forEach(topla);
      };
      topla(d);
      expect(dizeler.length).toBeGreaterThanOrEqual(39);
      expect(dizeler.filter((s) => s.trim() === '')).toEqual([]);
    }
  });
});
