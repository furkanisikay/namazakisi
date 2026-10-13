/**
 * Ozel gun ayarlarinin HAM depolamadan, store'suz okunmasi (issue #272).
 *
 * NEDEN AYRI DOSYA: hatirlatma servisleri (muhafiz on plan + arka plan, vakit
 * bildirimi, vakit sayaci, nafile, seri sayaci) arka plan gorevinde Redux
 * OLMADAN calisir; ozel gun kapisini diskten okumak zorundadirlar.
 * `LocalSeriServisi` domain servislerini (seri/rozet hesaplayicilari) import
 * ettigi icin onu her hatirlatma servisine baglamak bagimlilik grafigini
 * gereksiz buyutur — bu dosya yalniz AsyncStorage + saf kapiya baglidir.
 *
 * Yazici `LocalSeriServisi.localOzelGunAyarlariniKaydet`'tir (ayni anahtar,
 * ham `AsyncStorage`). Okuma ASLA firlatmaz; okunamazsa kapi KAPALI sayilir
 * (hatirlatmalar eskisi gibi calisir — bozuk bir kayit kullaniciyi sessizce
 * susturmamali).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
  ozelGunAktifMi,
  ozelGunKapisiGirdisiniCoz,
  type OzelGunKapisiGirdisi,
} from '../../core/seri/ozelGunKapisi';

/** Diskteki ozel gun ayarlarini kapi girdisi olarak okur; yoksa/bozuksa `null`. */
export async function ozelGunKapisiniOku(): Promise<OzelGunKapisiGirdisi | null> {
  try {
    const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI);
    if (!ham) return null;
    return ozelGunKapisiGirdisiniCoz(JSON.parse(ham));
  } catch (error) {
    Logger.warn('OzelGunOkuyucu', 'Ozel gun ayarlari okunamadi, kapi kapali sayiliyor', error);
    return null;
  }
}

/**
 * Planlama turu basina BIR kez okunur ve tarih bazinda sorgulanir:
 * `const ozelGundeMi = await ozelGunSuzgeciniOku(); if (ozelGundeMi(v.tarih)) ...`
 */
export async function ozelGunSuzgeciniOku(): Promise<(tarih: string) => boolean> {
  const girdi = await ozelGunKapisiniOku();
  return (tarih: string) => ozelGunAktifMi(tarih, girdi);
}
