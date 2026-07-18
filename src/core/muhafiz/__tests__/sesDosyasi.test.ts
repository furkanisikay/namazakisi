import { sesDosyasiniCoz, ozelSesOnizlemesiMi } from '../sesDosyasi';
import { VARSAYILAN_SES } from '../matrisTipleri';

describe('sesDosyasiniCoz', () => {
  it('varsayilan icin calinabilir bir paketlenmis kaynak dondurur', () => {
    const kaynak = sesDosyasiniCoz(VARSAYILAN_SES);
    expect(kaynak).toBeDefined();
    expect(kaynak).not.toBeNull();
  });

  it('bilinmeyen/bos/eski palet id sessizce varsayilana duser (kullanici hicbir sey duymamamali)', () => {
    const varsayilan = sesDosyasiniCoz(VARSAYILAN_SES);
    expect(sesDosyasiniCoz('boyle-bir-ses-yok')).toBe(varsayilan);
    expect(sesDosyasiniCoz('')).toBe(varsayilan);
    // Eski palet id'leri — ucu de zaten AYNI dosyaya cozuluyordu, goc bedava.
    expect(sesDosyasiniCoz('can')).toBe(varsayilan);
    expect(sesDosyasiniCoz('melodi')).toBe(varsayilan);
    expect(sesDosyasiniCoz('alarm')).toBe(varsayilan);
  });
});

describe('ozelSesOnizlemesiMi', () => {
  it('content:// sesleri NATIVE yola ayirir (expo-audio bu semayi calamayabilir)', () => {
    expect(ozelSesOnizlemesiMi('content://media/internal/audio/media/42')).toBe(true);
  });

  it('paketlenmis varsayilan expo-audio yolunda kalir', () => {
    expect(ozelSesOnizlemesiMi(VARSAYILAN_SES)).toBe(false);
    expect(ozelSesOnizlemesiMi('')).toBe(false);
  });
});
