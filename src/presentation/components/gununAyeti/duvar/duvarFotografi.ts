/**
 * Duvar kâğıdı fotoğrafı: sistem fotoğraf seçicisi (izin İSTEMEZ: Android Photo Picker, iOS
 * PHPicker) → uygulamanın kendi kopyası `documentDirectory/duvar/duvar-foto-<özet>.jpg`.
 * Android native çizici `filesDir/duvar/<dosya>`'yı okur (`documentDirectory` = `filesDir`).
 * iPhone'da Kısayollar görseli App Group'tan okur: kopya ayrıca `duvarFotografiniYaz` ile oraya
 * yazılır (eski ikilide yöntem yoksa kullanıcıya bilgi satırı gösterilir).
 *
 * Fotoğraf CİHAZA ÖZGÜDÜR ve YEDEKLENMEZ (duvar ayarı gibi; `GUNUN_AYETI_DUVAR` beyaz listede yok).
 * Native modüller tembel `require` ile yüklenir (ekran testleri ve açılış).
 */
import { Platform } from 'react-native';
import { fotoDosyaAdi } from '../../../../core/icerik/duvarCizimi';
import { Logger } from '../../../../core/utils/Logger';

type DosyaSistemi = typeof import('expo-file-system/legacy');

const dosyaSistemi = (): DosyaSistemi => require('expo-file-system/legacy') as DosyaSistemi;

/** Uygulama kopyalarının dizini (`file://…/duvar/`); belge dizini yoksa `null`. */
export function duvarDizini(): string | null {
  const kok = dosyaSistemi().documentDirectory;
  return kok ? `${kok}duvar/` : null;
}

export const fotoAdresi = (dosya: string): string | null => {
  const dizin = duvarDizini();
  return dizin ? dizin + dosya : null;
};

export interface SecilenFoto {
  dosya: string;
  uri: string;
  genislik: number;
  yukseklik: number;
  /** iPhone: Kısayollar görseline aktarılamadı (eski ikili ya da yazım hatası). */
  iosAktarilamadi: boolean;
}

/** iPhone köprüsü (`modules/expo-siri-kisayollari`); yöntem eski ikilide yok. */
type SiriFotoKoprusu = { duvarFotografiniYaz?: (uri: string, dosya: string) => Promise<boolean> | boolean };

async function iosKopyala(uri: string, dosya: string): Promise<boolean> {
  try {
    const modul = require('../../../../../modules/expo-siri-kisayollari/src') as SiriFotoKoprusu;
    if (typeof modul.duvarFotografiniYaz !== 'function') return false;
    return (await modul.duvarFotografiniYaz(uri, dosya)) !== false;
  } catch (e) {
    Logger.warn('DuvarFotografi', 'Fotoğraf Kısayollar görseline aktarılamadı', e);
    return false;
  }
}

/**
 * Fotoğraf seçtirir ve kopyalar. Vazgeçilirse `null`; kopyalanamazsa hata fırlatır.
 */
export async function fotografSecVeKopyala(): Promise<SecilenFoto | null> {
  const Secici = require('expo-image-picker') as typeof import('expo-image-picker');
  const sonuc = await Secici.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: false, exif: false });
  const varlik = sonuc.canceled ? null : sonuc.assets?.[0];
  if (!varlik) return null;
  const Crypto = require('expo-crypto') as typeof import('expo-crypto');
  const dosya = fotoDosyaAdi(Crypto.randomUUID().replace(/-/g, '').slice(0, 16));
  const dizin = duvarDizini();
  if (!dizin) throw new Error('belge dizini yok');
  const fs = dosyaSistemi();
  await fs.makeDirectoryAsync(dizin, { intermediates: true }).catch(() => undefined);
  const hedef = dizin + dosya;
  await fs.copyAsync({ from: varlik.uri, to: hedef });
  const iosAktarilamadi = Platform.OS === 'ios' ? !(await iosKopyala(hedef, dosya)) : false;
  return { dosya, uri: hedef, genislik: varlik.width, yukseklik: varlik.height, iosAktarilamadi };
}

/** Uygulama kopyasını siler (yoksa sessiz). */
export async function fotografiSil(dosya: string | null): Promise<void> {
  const adres = dosya ? fotoAdresi(dosya) : null;
  if (!adres) return;
  try {
    await dosyaSistemi().deleteAsync(adres, { idempotent: true });
  } catch (e) {
    Logger.warn('DuvarFotografi', 'Eski fotoğraf silinemedi', e);
  }
}
