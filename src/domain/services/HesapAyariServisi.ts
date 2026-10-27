/**
 * Hesap ayarı (yöntem, ikindi, dakika düzeltmeleri) — disk ↔ etkin durum köprüsü.
 *
 * Her JS giriş noktası vakit hesaplamadan önce `HesapAyariServisi.hazir()`'ı bekler
 * (uygulama açılışı, 15 dk arka plan görevi, konum bölgesi görevi, notifee arka plan
 * olayı, headless "Kıldım" görevleri). Yüklenmeden önce Diyanet geçerlidir.
 *
 * Değişiklik kaydedilince (`kaydet`) vakitler değişmiş olur → çağıran, konum değişimiyle
 * AYNI yoldan yayar (`KonumDegisikligiServisi.konumDegistiUygula`). Store'a bağımlı değil.
 */
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { aktifHesapAyari, aktifHesapAyariniKur } from '../../core/vakit/aktifHesap';
import { hesapAyariNormalize, type HesapAyari } from '../../core/vakit/hesapProfilleri';

let yukleme: Promise<HesapAyari> | null = null;

async function diskten(): Promise<HesapAyari> {
  try {
    const ham = await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.HESAP_AYARI);
    aktifHesapAyariniKur(ham);
  } catch (e) {
    Logger.warn('HesapAyari', 'Hesap ayarı okunamadı, Diyanet kullanılıyor', e);
  }
  return aktifHesapAyari();
}

export const HesapAyariServisi = {
  /** Diski okur ve etkin ayarı kurar. `zorla` olmadan süreç başına bir kez okunur. */
  yukle(zorla = false): Promise<HesapAyari> {
    if (!yukleme || zorla) yukleme = diskten();
    return yukleme;
  },

  /** Giriş noktalarının beklediği kapı. ASLA reddetmez. */
  async hazir(): Promise<void> {
    await HesapAyariServisi.yukle();
  },

  /** Kaydeder ve etkin ayarı kurar. Vakitler değiştiyse `true` döner (çağıran yaymalı). */
  async kaydet(ayar: HesapAyari): Promise<boolean> {
    const normal = hesapAyariNormalize(ayar);
    await Depolama.yaz(DEPOLAMA_ANAHTARLARI.HESAP_AYARI, normal);
    const onceki = JSON.stringify(hesapParametreImzasi(aktifHesapAyari()));
    aktifHesapAyariniKur(normal);
    yukleme = Promise.resolve(aktifHesapAyari());
    return onceki !== JSON.stringify(hesapParametreImzasi(normal));
  },

  /** Yalnız testler için. */
  _sifirla(): void {
    yukleme = null;
  },
};

/** Vakti etkileyen alanlar (soru hafızası ve `secildi` vakti değiştirmez). */
function hesapParametreImzasi(a: HesapAyari): Pick<HesapAyari, 'profil' | 'ikindi' | 'ofsetler' | 'aci'> {
  return { profil: a.profil, ikindi: a.ikindi, ofsetler: a.ofsetler, aci: a.aci };
}
