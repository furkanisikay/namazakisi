/**
 * Gök takımyıldızının açılış animasyonu için SAF zaman çizelgesini üretir.
 *
 * Model BİRİKİMLİ ve ARDIŞIK — sabit adımlı stagger DEĞİL:
 *   yıldız yanar → çizgi ona doğru uzar → VARDIĞINDA sonraki yıldız yanar → ...
 * Hiçbir bağ, bir öncekinin BİTİŞİNDEN önce başlamaz (kullanıcının açık
 * talebiydi; referans HTML'de ölçüldü: 22 segment, 0 çakışma, zincir 3,21
 * sn'de tamamlanıyor — `docs/tasarim/2026-07-29-seri-sekmesi-takimyildizi-referans.html`
 * içindeki `CIZELGE` IIFE'siyle birebir aynı algoritma).
 *
 * SAF: React/Reanimated/native import yok, `new Date()`/`Math.random()` yok.
 * Zamanlama sabitleri PARAMETRE olarak enjekte edilir — `screens/Seri/sabitler.ts`
 * sunum katmanına ait, core oradan import edemez.
 */
import { IzgaraGunu } from './aylikIzgara';
import { ZincirBagi } from './zincir';

export interface BagZamani {
  gecikme: number;
  sure: number;
  vurgulu: boolean;
}

export interface AcilisCizelgesi {
  /** İzgara indeksi -> yıldızın yanma gecikmesi (ms). */
  yildizGecikme: number[];
  /** Bağın sol gün indeksi -> çizginin zamanlaması. */
  bagZamani: Map<number, BagZamani>;
  /** Tüm dizinin toplam süresi (ms) — son yıldızın yanma anı. */
  toplam: number;
}

export interface AcilisCizelgesiSabitleri {
  cizgiOnce: number;
  segNormal: number;
  segVurgu: number;
  kopukBosluk: number;
}

/**
 * `izgara` ve `baglar`dan açılış zaman çizelgesini hesaplar.
 *
 * Algoritma (referanstaki `CIZELGE` ile birebir):
 * ```
 * t = 0; yildizGecikme[0] = 0
 * her i için (0 … n-2):
 *   bagli = i ile i+1 arasında bağ var mı?
 *   bagli ise:
 *     sure = vurgulu ? segVurgu : segNormal
 *     bagZamani[i] = { gecikme: t + cizgiOnce, sure, vurgulu }
 *     t += cizgiOnce + sure          // sonraki yıldız, çizgi VARDIĞINDA yanar
 *   değilse:
 *     t += kopukBosluk               // zincir kopuk — kısa es
 *   yildizGecikme[i+1] = t
 * ```
 */
export function acilisCizelgesi(
  izgara: IzgaraGunu[],
  baglar: ZincirBagi[],
  sabitler: AcilisCizelgesiSabitleri,
): AcilisCizelgesi {
  const yildizGecikme: number[] = new Array(izgara.length).fill(0);
  const bagZamani = new Map<number, BagZamani>();

  if (izgara.length === 0) {
    return { yildizGecikme: [], bagZamani, toplam: 0 };
  }

  // Bağları indekse göre hızlı erişim için haritala (baglar sıralı değilse de
  // güvenli — indeks üzerinden bakılıyor, sıra varsayılmıyor).
  const bagHaritasi = new Map<number, ZincirBagi>();
  for (const bag of baglar) {
    bagHaritasi.set(bag.indeks, bag);
  }

  let t = 0;
  for (let i = 0; i < izgara.length - 1; i++) {
    const bag = bagHaritasi.get(i);
    if (bag) {
      const sure = bag.ikisiTam ? sabitler.segVurgu : sabitler.segNormal;
      bagZamani.set(i, { gecikme: t + sabitler.cizgiOnce, sure, vurgulu: bag.ikisiTam });
      t += sabitler.cizgiOnce + sure;
    } else {
      t += sabitler.kopukBosluk;
    }
    yildizGecikme[i + 1] = t;
  }

  return { yildizGecikme, bagZamani, toplam: t };
}
