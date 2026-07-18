import { matristenKanallariCikar } from '../kanalPlani';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../matrisTipleri';
import type { MuhafizMatrisi, SeviyeAyari, UyariModu } from '../matrisTipleri';
import { muhafizKanalIdOlustur } from '../sesKimligi';

const SES_A = 'content://media/internal/audio/media/42';
const SES_B = 'content://media/external/audio/media/1337';

const sv = (o: Partial<SeviyeAyari> = {}): SeviyeAyari => ({
  kademe: 'nazik',
  mod: 'bildirim' as UyariModu,
  esikDk: 30,
  siklik: 'birkez',
  bildirimSesi: VARSAYILAN_SES,
  anonsMetni: '',
  ...o,
});

/** Tum vakitlerde ayni 4 seviyeyi kullanan matris. */
const matris = (seviyeler: SeviyeAyari[]): MuhafizMatrisi =>
  Object.fromEntries(
    MUHAFIZ_VAKITLERI.map((v) => [v, { seviyeler: seviyeler.map((s) => ({ ...s })) }])
  ) as MuhafizMatrisi;

const dortSeviye = (o: Partial<SeviyeAyari> = {}) =>
  SEVIYE_KADEMELERI.map((kademe) => sv({ kademe, ...o }));

describe('matristenKanallariCikar', () => {
  /**
   * KANAL ENFLASYONU TESTI: 5 vakit x 4 seviye = 20 hucre hepsi ayni sesi
   * kullaniyor → kanal sayisi hucre sayisiyla DEGIL, benzersiz (ses, aciliyet)
   * kombinasyonuyla olcekelenir.
   */
  it('20 hücre tek ses kullanıyorsa yalnız aciliyet ekseni kadar kanal üretir', () => {
    const kanallar = matristenKanallariCikar(matris(dortSeviye()));

    // nazik+uyari (seviye 1-2) normal, sert+acil (seviye 3-4) acil kanal.
    expect(kanallar).toHaveLength(2);
    expect(kanallar.map((k) => k.kanalId).sort()).toEqual(['muhafiz', 'muhafiz_acil']);
  });

  it('farklı sesler ayrı kanal üretir', () => {
    const seviyeler = dortSeviye();
    seviyeler[0].bildirimSesi = SES_A;
    seviyeler[1].bildirimSesi = SES_B;

    const kanallar = matristenKanallariCikar(matris(seviyeler));
    const idler = kanallar.map((k) => k.kanalId);

    expect(idler).toContain(muhafizKanalIdOlustur(SES_A, false));
    expect(idler).toContain(muhafizKanalIdOlustur(SES_B, false));
  });

  it("'sessiz' hücreler kanal ÜRETMEZ (kullanmadığı ses için kanal birikmemeli)", () => {
    const seviyeler = dortSeviye({ mod: 'sessiz' });
    seviyeler[0].mod = 'bildirim';
    seviyeler[0].bildirimSesi = SES_A;

    const kanallar = matristenKanallariCikar(matris(seviyeler));

    expect(kanallar).toHaveLength(1);
    expect(kanallar[0].kanalId).toBe(muhafizKanalIdOlustur(SES_A, false));
  });

  it('ses ADI kanal tanımında taşınır (Android ayarlarında ayırt edilsin)', () => {
    const seviyeler = dortSeviye();
    seviyeler[0].bildirimSesi = SES_A;
    seviyeler[0].sesAdi = 'Hızır';

    const tanim = matristenKanallariCikar(matris(seviyeler)).find(
      (k) => k.kanalId === muhafizKanalIdOlustur(SES_A, false)
    );

    expect(tanim?.sesAdi).toBe('Hızır');
    expect(tanim?.sesKimligi).toBe(SES_A);
  });

  it('ESKİ palet id normalize edilir (taban kanal, göç gerekmez)', () => {
    const seviyeler = dortSeviye({ bildirimSesi: 'melodi' });
    const kanallar = matristenKanallariCikar(matris(seviyeler));

    expect(kanallar.map((k) => k.kanalId).sort()).toEqual(['muhafiz', 'muhafiz_acil']);
    expect(kanallar.every((k) => k.sesKimligi === VARSAYILAN_SES)).toBe(true);
  });

  it('acilKanal bayrağı olan hücre acil kanala düşer', () => {
    const seviyeler = dortSeviye();
    seviyeler[0].acilKanal = true;
    seviyeler[0].bildirimSesi = SES_A;

    const idler = matristenKanallariCikar(matris(seviyeler)).map((k) => k.kanalId);

    expect(idler).toContain(muhafizKanalIdOlustur(SES_A, true));
  });

  it('bozuk/eksik vakit girdisinde ÇÖKMEZ (savunmacı)', () => {
    const bozuk = matris(dortSeviye());
    // @ts-expect-error — diskten gelen bozuk kayıt simülasyonu
    bozuk.ogle = undefined;
    // @ts-expect-error — seviyesi eksik vakit
    bozuk.ikindi = {};

    expect(() => matristenKanallariCikar(bozuk)).not.toThrow();
    expect(matristenKanallariCikar(bozuk).length).toBeGreaterThan(0);
  });
});
