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
import { MUHAFIZ_VAKITLERI, VARSAYILAN_SES } from './matrisTipleri';
import { kademeSeviyeNo, muhafizAcilKanalMi, muhafizKanaliSec } from './motorAdaptoru';
import { ozelSesMi, sesKimliginiNormalize } from './sesKimligi';

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

/**
 * Matriste kullanilan BENZERSIZ ozel ses URI'lerini dondurur (SAF).
 * Cagiran taraf bunlari native'de cozerek gecerliligini dogrular.
 */
export function ozelSesleriTopla(matris: MuhafizMatrisi): string[] {
  const sesler = new Set<string>();
  for (const vakit of MUHAFIZ_VAKITLERI) {
    for (const seviye of matris[vakit]?.seviyeler ?? []) {
      if (seviye && ozelSesMi(seviye.bildirimSesi)) sesler.add(seviye.bildirimSesi);
    }
  }
  return Array.from(sesler);
}

/**
 * COZULEMEYEN ozel sesleri varsayilana dusurur (SAF).
 *
 * NEDEN GEREKLI: `content://` URI'si CIHAZA OZGUDUR. Yedek baska bir cihaza
 * tasindiginda (veya kullanici ses dosyasini sildiginde) URI cozulmez. Kanal o
 * OLU URI ile kurulursa bildirimler SESSIZ calisir ve kanal sesi sonradan
 * DEGISTIRILEMEZ (Android kurali) — kullanicinin tek cikis yolu kanali silmektir,
 * ama ekran hala eski ses adini gosterdigi icin sorunu fark bile etmez.
 *
 * Bu yuzden kanal kurulmadan (ve bildirim planlanmadan) ONCE URI dogrulanir;
 * cozulemeyen hucre varsayilan sese doner ve `sesAdi` temizlenir → ekran da
 * dogruyu gosterir.
 *
 * Degisiklik yoksa AYNI referans doner.
 */
export function cozulemeyenSesleriDusur(
  matris: MuhafizMatrisi,
  cozulemeyenSesler: ReadonlySet<string>
): MuhafizMatrisi {
  if (cozulemeyenSesler.size === 0) return matris;

  let degisti = false;
  const sonuc = {} as MuhafizMatrisi;

  for (const vakit of MUHAFIZ_VAKITLERI) {
    const vakitAyari = matris[vakit];
    if (!vakitAyari?.seviyeler) {
      sonuc[vakit] = vakitAyari;
      continue;
    }

    let vakitDegisti = false;
    const seviyeler = vakitAyari.seviyeler.map((seviye) => {
      if (!seviye || !cozulemeyenSesler.has(seviye.bildirimSesi)) return seviye;
      vakitDegisti = true;
      return { ...seviye, bildirimSesi: VARSAYILAN_SES, sesAdi: undefined };
    });

    if (vakitDegisti) degisti = true;
    sonuc[vakit] = vakitDegisti ? { ...vakitAyari, seviyeler } : vakitAyari;
  }

  return degisti ? sonuc : matris;
}
