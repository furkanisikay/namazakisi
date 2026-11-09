/**
 * Kilit ekranı görüntüsü (saat alanı ölçümü): sistem fotoğraf seçicisi (izin İSTEMEZ). Görüntü
 * KOPYALANMAZ ve SAKLANMAZ: yalnız native ölçüm okur; seçicinin uygulama önbelleğine koyduğu
 * geçici kopya ölçümden sonra silinir. Native modüller tembel `require` ile yüklenir.
 */
import { Logger } from '../../../../core/utils/Logger';

type DosyaSistemi = typeof import('expo-file-system/legacy');

/** Görüntü seçtirir; vazgeçilirse `null`. */
export async function kilitEkraniGoruntusuSec(): Promise<string | null> {
  const Secici = require('expo-image-picker') as typeof import('expo-image-picker');
  const sonuc = await Secici.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: false, exif: false });
  const varlik = sonuc.canceled ? null : sonuc.assets?.[0];
  return varlik?.uri ?? null;
}

/** Seçicinin önbellekteki geçici kopyasını siler (yalnız uygulamanın önbelleğindeyse; yoksa sessiz). */
export async function kilitEkraniGoruntusunuBirak(uri: string): Promise<void> {
  try {
    const fs = require('expo-file-system/legacy') as DosyaSistemi;
    if (fs.cacheDirectory && uri.startsWith(fs.cacheDirectory)) await fs.deleteAsync(uri, { idempotent: true });
  } catch (e) {
    Logger.warn('KilitEkraniGoruntusu', 'Geçici görüntü silinemedi', e);
  }
}
