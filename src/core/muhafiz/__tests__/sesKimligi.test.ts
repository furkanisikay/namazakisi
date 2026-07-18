import {
  ozelSesMi,
  sesKimliginiNormalize,
  sesHashi,
  muhafizKanalIdOlustur,
  muhafizKanaliMi,
  silinebilirMuhafizKanaliMi,
} from '../sesKimligi';
import { VARSAYILAN_SES } from '../matrisTipleri';

const SES_A = 'content://media/internal/audio/media/42';
const SES_B = 'content://media/external/audio/media/1337';

describe('sesKimliginiNormalize', () => {
  it('ESKI PALET GOCU BEDAVA: can/melodi/alarm varsayilana duser', () => {
    // Uc id de gercekte AYNI dosyaya (bildirim.mp3) cozuluyordu → sifir regresyon.
    expect(sesKimliginiNormalize('can')).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize('melodi')).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize('alarm')).toBe(VARSAYILAN_SES);
  });

  it('bozuk/eksik degerler varsayilana duser (asla firlatmaz)', () => {
    expect(sesKimliginiNormalize(undefined)).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize(null)).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize('')).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize('   ')).toBe(VARSAYILAN_SES);
  });

  it('content:// URI oldugu gibi korunur', () => {
    expect(sesKimliginiNormalize(SES_A)).toBe(SES_A);
    expect(sesKimliginiNormalize(`  ${SES_A}  `)).toBe(SES_A);
  });
});

describe('ozelSesMi', () => {
  it('yalniz content:// semasi ozel sestir', () => {
    expect(ozelSesMi(SES_A)).toBe(true);
    expect(ozelSesMi(VARSAYILAN_SES)).toBe(false);
    expect(ozelSesMi(undefined)).toBe(false);
  });
});

describe('sesHashi', () => {
  it('kararlidir (ayni girdi -> ayni cikti)', () => {
    expect(sesHashi(SES_A)).toBe(sesHashi(SES_A));
  });

  it('her zaman 8 haneli hex uretir', () => {
    for (const girdi of [SES_A, SES_B, '', 'a', 'x'.repeat(500)]) {
      expect(sesHashi(girdi)).toMatch(/^[0-9a-f]{8}$/);
    }
  });

  it('farkli sesler farkli hash uretir', () => {
    expect(sesHashi(SES_A)).not.toBe(sesHashi(SES_B));
  });
});

describe('muhafizKanalIdOlustur', () => {
  it('VARSAYILAN ses TABAN kanallara esitlenir — mevcut kurulumlarla birebir uyum', () => {
    expect(muhafizKanalIdOlustur(VARSAYILAN_SES, false)).toBe('muhafiz');
    expect(muhafizKanalIdOlustur(VARSAYILAN_SES, true)).toBe('muhafiz_acil');
  });

  it('ESKI palet id de taban kanala duser (goc gerekmez)', () => {
    expect(muhafizKanalIdOlustur('can', false)).toBe('muhafiz');
    expect(muhafizKanalIdOlustur('alarm', true)).toBe('muhafiz_acil');
  });

  it('ozel ses hash ekli kanal uretir', () => {
    expect(muhafizKanalIdOlustur(SES_A, false)).toBe(`muhafiz_${sesHashi(SES_A)}`);
    expect(muhafizKanalIdOlustur(SES_A, true)).toBe(`muhafiz_acil_${sesHashi(SES_A)}`);
  });

  /**
   * MIMARININ TEMEL SOZU: kanal id SESIN fonksiyonudur.
   * Boylece "kanal sesi degistirilemez" ve "silinen kanal tombstone'dan eski
   * ayarlarla dirilir" tuzaklarinin ikisi de dogar dogmaz olur — ayni id'ye
   * farkli ses yazmaya HIC kalkismayiz.
   */
  it('ses degisirse kanal id de DEGISIR (tombstone tuzagi dogmaz)', () => {
    expect(muhafizKanalIdOlustur(SES_A, false)).not.toBe(muhafizKanalIdOlustur(SES_B, false));
  });

  it('KANAL ENFLASYONU YOK: ayni ses hep ayni kanali verir', () => {
    const kanallar = new Set([
      muhafizKanalIdOlustur(SES_A, false),
      muhafizKanalIdOlustur(SES_A, false),
      muhafizKanalIdOlustur(SES_A, false),
    ]);
    expect(kanallar.size).toBe(1);
  });

  it('aciliyet ile ses BAGIMSIZ eksenlerdir (4 kombinasyon = 4 ayri kanal)', () => {
    const hepsi = new Set([
      muhafizKanalIdOlustur(VARSAYILAN_SES, false),
      muhafizKanalIdOlustur(VARSAYILAN_SES, true),
      muhafizKanalIdOlustur(SES_A, false),
      muhafizKanalIdOlustur(SES_A, true),
    ]);
    expect(hepsi.size).toBe(4);
  });
});

describe('muhafizKanaliMi / silinebilirMuhafizKanaliMi', () => {
  it('muhafiz kanal uzayini tanir', () => {
    expect(muhafizKanaliMi('muhafiz')).toBe(true);
    expect(muhafizKanaliMi('muhafiz_acil')).toBe(true);
    expect(muhafizKanaliMi(muhafizKanalIdOlustur(SES_A, false))).toBe(true);
    expect(muhafizKanaliMi(muhafizKanalIdOlustur(SES_A, true))).toBe(true);
  });

  it('muhafiz disi kanallara ASLA dokunmaz (vakit sayaci, iftar, varsayilan...)', () => {
    for (const yabanci of ['vakit_bildirim', 'vakit_sayac', 'iftar_sayac_v2', 'default']) {
      expect(muhafizKanaliMi(yabanci)).toBe(false);
      expect(silinebilirMuhafizKanaliMi(yabanci)).toBe(false);
    }
  });

  it('TABAN kanallar cop toplamada ASLA silinmez (kullanici tercihleri orada birikmis)', () => {
    expect(silinebilirMuhafizKanaliMi('muhafiz')).toBe(false);
    expect(silinebilirMuhafizKanaliMi('muhafiz_acil')).toBe(false);
  });

  it('hash li kanallar silinebilir', () => {
    expect(silinebilirMuhafizKanaliMi(muhafizKanalIdOlustur(SES_A, false))).toBe(true);
    expect(silinebilirMuhafizKanaliMi(muhafizKanalIdOlustur(SES_A, true))).toBe(true);
  });
});
