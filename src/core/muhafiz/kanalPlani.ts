/**
 * Matristen "hangi bildirim kanallari gerekli" listesini cikarir (SAF).
 *
 * NEDEN: kanal id artik sesin fonksiyonu (bkz. `sesKimligi.ts`) → hangi
 * kanallarin var olmasi gerektigi ARTIK SABIT DEGIL, kullanicinin secimlerine
 * baglidir. Planlama oncesi bu liste ile kanallar TEMBEL olusturulur; listede
 * OLMAYAN eski muhafiz kanallari da cop toplanir (GC).
 *
 * Bildirim uretmeyen hucreler ('sessiz') listeye GIRMEZ — kullanmadigi bir ses
 * icin kullanicinin bildirim ayarlarinda kanal birikmemeli.
 */
import type { MuhafizMatrisi } from './matrisTipleri';
import { MUHAFIZ_VAKITLERI } from './matrisTipleri';
import { kademeSeviyeNo, muhafizAcilKanalMi, muhafizKanaliSec } from './motorAdaptoru';
import { sesKimliginiNormalize } from './sesKimligi';

export interface MuhafizKanalTanimi {
  kanalId: string;
  /** Normalize edilmis ses kimligi (`varsayilan` | `content://...`) */
  sesKimligi: string;
  /** Kanal adinda gosterilecek ses adi (varsa) */
  sesAdi?: string;
  acilMi: boolean;
}

/**
 * Matristeki tum (ses, aciliyet) kombinasyonlarini BENZERSIZ kanal listesine
 * cevirir. 20 hucre ayni sesi kullaniyorsa tek kanal doner (kanal enflasyonu yok).
 */
export function matristenKanallariCikar(matris: MuhafizMatrisi): MuhafizKanalTanimi[] {
  const kanallar = new Map<string, MuhafizKanalTanimi>();

  for (const vakit of MUHAFIZ_VAKITLERI) {
    const vakitAyari = matris[vakit];
    if (!vakitAyari?.seviyeler) continue;

    for (const seviye of vakitAyari.seviyeler) {
      if (!seviye || seviye.mod === 'sessiz') continue;

      const seviyeNo = kademeSeviyeNo(seviye.kademe);
      const kanalId = muhafizKanaliSec(seviyeNo, seviye.bildirimSesi, seviye.acilKanal);
      if (kanallar.has(kanalId)) continue;

      kanallar.set(kanalId, {
        kanalId,
        sesKimligi: sesKimliginiNormalize(seviye.bildirimSesi),
        sesAdi: seviye.sesAdi,
        acilMi: muhafizAcilKanalMi(seviyeNo, seviye.bildirimSesi, seviye.acilKanal),
      });
    }
  }

  return Array.from(kanallar.values());
}
