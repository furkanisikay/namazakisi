/**
 * Dünya şehirleri varlığını (`assets/konum/dunya.bin`, GeoNames CC BY 4.0) gerektiğinde okur
 * ve süreç boyunca bellekte tutar. JS paketine gömülmez (≈1,4 MB metin); yalnız konum
 * seçici ya da ülke tespiti ilk kez istediğinde okunur. Okuma hatası `null` döner, asla
 * fırlatmaz — çağıran "liste yüklenemedi" diye gösterir.
 */
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { dunyaVerisiniCoz, type DunyaSehirVerisi } from '../../core/konum/dunyaSehirleri';
import { Logger } from '../../core/utils/Logger';

let bellek: Promise<DunyaSehirVerisi | null> | null = null;

async function oku(): Promise<DunyaSehirVerisi | null> {
  try {
    const varlik = Asset.fromModule(require('../../../assets/konum/dunya.bin'));
    await varlik.downloadAsync();
    const uri = varlik.localUri ?? varlik.uri;
    if (!uri) return null;
    const veri = dunyaVerisiniCoz(await new File(uri).text());
    return veri.sehirler.length ? veri : null;
  } catch (e) {
    Logger.warn('DunyaSehirVerisi', 'Şehir listesi okunamadı', e);
    return null;
  }
}

export function dunyaSehirVerisiniAl(): Promise<DunyaSehirVerisi | null> {
  if (!bellek) {
    bellek = oku().then((v) => {
      if (!v) bellek = null; // hata kalıcı olmasın, sonraki istek yeniden denesin
      return v;
    });
  }
  return bellek;
}
